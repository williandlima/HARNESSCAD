/* HarnessCAD - COTAS do chicote e cálculo do comprimento dos fios.
   Cota = trecho real do chicote entre dois pontos (conector, equipamento, emenda ou ponto de derivação).
   Comprimento de um fio = menor caminho pelas cotas entre os itens das suas pontas + folga por ponta.
   Também conta quantos fios passam em cada trecho e soma os metros por tipo de fio. */
(function (G) {
  'use strict';
  var HX = G.HX;
  var COL = '#111111'; /* preto, como o resto do esquema (v1.9.13) */

  // origem da cota: centro do corpo do conector/figura, ou o próprio pino (pin = nº do pino); emenda/derivação = o ponto
  function anchor(it, unit, pin) {
    if (!it) return null;
    if (it.type === 'conn') {
      var L = HX.connLayout(it, unit);
      if (pin != null) { var q = L.pins.filter(function (x) { return String(x.n) === String(pin); })[0]; if (q) return q.pt.slice(); }
      return L.xf(L.w / 2, (L.H + L.h) / 2);
    }
    if (it.type === 'splice' || it.type === 'brk') return [it.x, it.y];
    return null;
  }
  HX.dimAnchorOf = anchor;

  // contorno do componente (corpo + terminais + textos de referência/PN) para a cota não invadir
  HX.DIM_GAP = 0.8;   // folga entre o contorno e o início da linha de extensão
  HX.DIM_CLEAR = 7;   // afastamento mínimo entre o contorno e a linha de cota
  function box(it, unit) {
    if (!it) return null;
    if (it.type === 'conn') { var b = HX.bbox(it, unit); return { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 + 3 }; }
    if (it.type === 'splice' || it.type === 'brk') return { x0: it.x - 1.2, y0: it.y - 1.2, x1: it.x + 1.2, y1: it.y + 1.2 };
    return null;
  }
  HX.dimBox = box;
  // linha de cota (H/V) fora da faixa proibida dos componentes: empurra para o lado mais próximo
  HX.dimClear = function (orient, A, off, boxes) {
    if (orient !== 'h' && orient !== 'v') return off;
    var k = orient === 'h' ? 1 : 0, line = A[k] + off, C = HX.DIM_CLEAR;
    var iv = boxes.filter(Boolean).map(function (b) { return k ? [b.y0 - C, b.y1 + C] : [b.x0 - C, b.x1 + C]; }).sort(function (a, b) { return a[0] - b[0]; });
    var m = []; iv.forEach(function (r) { if (m.length && r[0] <= m[m.length - 1][1]) m[m.length - 1][1] = Math.max(m[m.length - 1][1], r[1]); else m.push(r.slice()); });
    m.forEach(function (r) { if (line > r[0] && line < r[1]) line = line - r[0] < r[1] - line ? r[0] : r[1]; });
    return HX.r3(line - A[k]);
  };
  // início da linha de extensão: fora do contorno do componente (a extensão não atravessa a peça)
  HX.dimExtStart = function (P, P2, b) {
    var dx = P2[0] - P[0], dy = P2[1] - P[1], l = Math.hypot(dx, dy); if (l < 1e-6) return P;
    var ux = dx / l, uy = dy / l, t = 0;
    if (b) { // saída do segmento pela caixa (se cruzar)
      var t0 = 0, t1 = l, ok = true;
      [[ux, b.x0 - P[0], b.x1 - P[0]], [uy, b.y0 - P[1], b.y1 - P[1]]].forEach(function (a) {
        if (Math.abs(a[0]) < 1e-9) { if (a[1] > 0 || a[2] < 0) ok = false; return; }
        var e0 = a[1] / a[0], e1 = a[2] / a[0]; if (e0 > e1) { var tt = e0; e0 = e1; e1 = tt; }
        t0 = Math.max(t0, e0); t1 = Math.min(t1, e1);
      });
      if (ok && t0 <= t1) t = Math.min(t1, l);
    }
    t = Math.min(t + HX.DIM_GAP, l);
    return [P[0] + ux * t, P[1] + uy * t];
  };

  // atualiza as pontas das cotas presas a itens (seguem o item/pino quando ele é movido)
  HX.syncDims = function (p) {
    p.sheets.forEach(function (sh) {
      var by = null;
      sh.items.forEach(function (d) {
        if (d.type !== 'dim') return;
        if (!d.orient) d.orient = Math.abs(d.x2 - d.x) >= Math.abs(d.y2 - d.y) ? 'h' : 'v'; // cotas antigas: vira H/V
        if (!d.a && !d.b) return;
        if (!by) { by = {}; sh.items.forEach(function (i) { by[i.id] = i; }); }
        var A = anchor(by[d.a], p.unit, d.ap), B = anchor(by[d.b], p.unit, d.bp);
        if (A) { d.x = A[0]; d.y = A[1]; }
        if (B) { d.x2 = B[0]; d.y2 = B[1]; }
        d.off = HX.dimClear(d.orient, [d.x, d.y], +d.off || 0, [box(by[d.a], p.unit), box(by[d.b], p.unit)]); // não invade o componente
      });
    });
  };

  // NBR 10126: linha de cota paralela à medida (H, V ou alinhada); linhas de extensão perpendiculares
  // h: linha em y = yA + off · v: linha em x = xA + off · a: paralela a AB, afastada off
  HX.dimGeom = function (d) {
    var A = [d.x, d.y], B = [d.x2, d.y2], off = +d.off || 0, o = d.orient || 'a', A2, B2, u, n, L;
    if (o === 'h') { A2 = [A[0], A[1] + off]; B2 = [B[0], A[1] + off]; L = Math.abs(B[0] - A[0]); u = [B[0] >= A[0] ? 1 : -1, 0]; n = [0, 1]; }
    else if (o === 'v') { A2 = [A[0] + off, A[1]]; B2 = [A[0] + off, B[1]]; L = Math.abs(B[1] - A[1]); u = [0, B[1] >= A[1] ? 1 : -1]; n = [1, 0]; }
    else {
      var dx = B[0] - A[0], dy = B[1] - A[1]; L = Math.hypot(dx, dy);
      u = [dx / (L || 1), dy / (L || 1)]; n = [-u[1], u[0]];
      A2 = [A[0] + n[0] * off, A[1] + n[1] * off]; B2 = [B[0] + n[0] * off, B[1] + n[1] * off];
    }
    return { A: A, B: B, A2: A2, B2: B2, u: u, n: n, L: L, off: off, o: o };
  };
  HX.dimBBox = function (d) {
    var g = HX.dimGeom(d), xs = [g.A[0], g.B[0], g.A2[0], g.B2[0]], ys = [g.A[1], g.B[1], g.A2[1], g.B2[1]];
    return { x0: Math.min.apply(0, xs) - 2, y0: Math.min.apply(0, ys) - 3, x1: Math.max.apply(0, xs) + 2, y1: Math.max.apply(0, ys) + 2 };
  };
  HX.dimDist = function (d, pt) { var g = HX.dimGeom(d); return HX.distSeg(pt, g.A2, g.B2); };
  // valor sem unidade (desenho em mm, NBR 10126) + tolerância "+50/-0" + nº de fios no trecho
  HX.dimLabel = function (d, info) {
    var s = d.text || (d.len !== '' && d.len != null ? String(d.len) : '?');
    if (!d.text && (d.tolP || d.tolM)) s += ' +' + (d.tolP || 0) + '/-' + (d.tolM || 0);
    var c = info && info.dims[d.id] && info.dims[d.id].count;
    return s + (d.showCount !== false && c ? '  (' + c + ' fio' + (c > 1 ? 's' : '') + ')' : '');
  };
  HX.DIM_TXT = 2.5; // altura mínima de texto NBR 8402

  HX.drawDim = function (g, d, o, info) {
    var q = HX.dimGeom(d), col = o.mono ? '#000' : COL, al = 2.6, aw = 0.7;
    g.style({ stroke: col, lw: 0.15, fill: null, dash: null });
    // linhas de extensão: 0,8 mm de folga na origem, ultrapassam 2 mm a linha de cota
    var bx = function (id) { return id && o.items && o.unit ? box(o.items[id], o.unit) : null; };
    [[q.A, q.A2, bx(d.a)], [q.B, q.B2, bx(d.b)]].forEach(function (e) {
      var dx = e[1][0] - e[0][0], dy = e[1][1] - e[0][1], l = Math.hypot(dx, dy);
      if (l < 0.9) return;
      var ux = dx / l, uy = dy / l, S = HX.dimExtStart(e[0], e[1], e[2]);
      g.line(S[0], S[1], e[1][0] + ux * 2, e[1][1] + uy * 2);
    });
    var short = q.L < 2 * al + 3; // cota curta: setas por fora
    g.style({ lw: 0.2 });
    if (short) g.line(q.A2[0] - q.u[0] * (al + 2), q.A2[1] - q.u[1] * (al + 2), q.B2[0] + q.u[0] * (al + 2), q.B2[1] + q.u[1] * (al + 2));
    else g.line(q.A2[0], q.A2[1], q.B2[0], q.B2[1]);
    g.style({ fill: col, stroke: null });
    [[q.A2, short ? -1 : 1], [q.B2, short ? 1 : -1]].forEach(function (a) {
      var P = a[0], k = a[1], ax = q.u[0] * k, ay = q.u[1] * k, nx = -q.u[1], ny = q.u[0];
      if (q.L < 0.01) return;
      g.poly([P, [P[0] + ax * al + nx * aw, P[1] + ay * al + ny * aw], [P[0] + ax * al - nx * aw, P[1] + ay * al - ny * aw]], true);
    });
    // texto acima da linha de cota; vertical lê-se pela direita (de baixo para cima)
    var ang = q.o === 'h' ? 0 : q.o === 'v' ? -Math.PI / 2 : Math.atan2(q.u[1], q.u[0]);
    if (ang > Math.PI / 2 + 0.01) ang -= Math.PI; else if (ang <= -Math.PI / 2 - 0.01) ang += Math.PI;
    var mx = (q.A2[0] + q.B2[0]) / 2, my = (q.A2[1] + q.B2[1]) / 2, ca = Math.cos(ang), sa = Math.sin(ang);
    g.push([ca, sa, -sa, ca, mx, my]);
    g.text(HX.dimLabel(d, info), 0, -1.2 - HX.DIM_TXT * 0.36, { size: HX.DIM_TXT, align: 'c', color: col });
    g.pop();
  };

  HX.drawBrk = function (g, b, o) {
    var col = o.mono ? '#000' : COL;
    g.style({ stroke: col, lw: 0.2, fill: o.mono ? null : '#ffffff', dash: null }); g.circle(b.x, b.y, 1.1);
    g.line(b.x - 0.7, b.y - 0.7, b.x + 0.7, b.y + 0.7); g.line(b.x - 0.7, b.y + 0.7, b.x + 0.7, b.y - 0.7);
    g.text(b.ref || '', b.x + 1.5, b.y - 1.5, { size: 1.6, bold: true, color: col });
  };

})(typeof window !== 'undefined' ? window : globalThis);
