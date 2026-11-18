/* HarnessCAD - LIBERDADE DE CUSTOMIZAÇÃO no desenho físico.
   pdimx  COTA LIVRE: entre dois pontos quaisquer, presos a qualquer item (canto, meio da borda ou centro da caixa
          do item, nó, ponta de ramo) e seguindo o item quando ele se move. Alinhada, horizontal ou vertical; valor
          medido (mm reais pela escala) ou texto próprio; tolerância; tamanho do texto; sem setas/linhas de chamada.
   pball  BALÃO em qualquer item e em qualquer ponto dele (ax, ay = ponta da seta relativa ao item); tamanho, texto,
          com/sem seta.
   Pontos de encaixe: HX.physSnapPts(sh) — usados pelas ferramentas de cota livre e balão. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  function arrow(g, x, y, ux, uy, col, a) { a = a || 1.5; var w = a * 0.28; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  HX.physRefPt = function (it, m) { // ponto de referência de um item para ancorar cotas/balões
    if (!it) return null; if (it.type === 'pnode') return [it.x, it.y];
    if (it.type === 'pseg' || it.type === 'pacc' || it.type === 'ptag' || it.type === 'pcov') { var a = HX.physAnchor(it, m); if (a) return a; }
    var b = it._bb; return b ? [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2] : (isFinite(+it.x) ? [+it.x, +it.y] : null);
  };
  HX.physAnchorPt = function (q, m) { if (!q) return null; if (!q.of) return [+q.dx || 0, +q.dy || 0]; var R = HX.physRefPt(m[q.of], m); return R ? [R[0] + (+q.dx || 0), R[1] + (+q.dy || 0)] : null; };
  HX.physSnapPts = function (sh) { // [x, y, idDoItem, tipo]
    var m = HX.physIdx(sh), out = [];
    sh.items.forEach(function (it) {
      if (it.type === 'pdimx') return;
      if (it.type === 'pnode') out.push([it.x, it.y, it.id, 'nó']);
      if (it.type === 'pseg' && it._P && it._P.length) { var P = it._P; out.push([P[0][0], P[0][1], it.id, 'ponta']); out.push([P[P.length - 1][0], P[P.length - 1][1], it.id, 'ponta']); var c = HX.polyAt(P, 0.5).pt; out.push([c[0], c[1], it.id, 'meio']); }
      var b = it._bb; if (!b || it.type === 'pseg') return; var xm = (b.x0 + b.x1) / 2, ym = (b.y0 + b.y1) / 2;
      [[b.x0, b.y0, 'canto'], [b.x1, b.y0, 'canto'], [b.x0, b.y1, 'canto'], [b.x1, b.y1, 'canto'], [xm, b.y0, 'borda'], [xm, b.y1, 'borda'], [b.x0, ym, 'borda'], [b.x1, ym, 'borda'], [xm, ym, 'centro']].forEach(function (q) { out.push([q[0], q[1], it.id, q[2]]); });
    });
    void m; return out;
  };
  HX.physSnapAt = function (sh, pt, tol) { var best = null, bd = tol; HX.physSnapPts(sh).forEach(function (q) { var d = Math.hypot(q[0] - pt[0], q[1] - pt[1]); if (d < bd) { bd = d; best = q; } }); return best; };
  HX.physMakeAnchor = function (sh, pt, snap) { var m = HX.physIdx(sh), it = snap && m[snap[2]], R = it && HX.physRefPt(it, m); if (!R) return { of: '', dx: HX.r3(pt[0]), dy: HX.r3(pt[1]) }; var p = snap ? [snap[0], snap[1]] : pt; return { of: it.id, dx: HX.r3(p[0] - R[0]), dy: HX.r3(p[1] - R[1]) }; };
  EXT.pdimx = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), A = HX.physAnchorPt(it.a, C.m), B = HX.physAnchorPt(it.b, C.m); if (!A || !B) return;
      var col = it.sCol || (C.line ? C.col : (o.theme && o.theme.txt) || '#222'), fs = +it.fs || +C.sh.dimFs || 2.5, ori = it.orient || 'a', a = A.slice(), b = B.slice();
      var ux, uy; if (ori === 'h') { ux = 1; uy = 0; } else if (ori === 'v') { ux = 0; uy = 1; } else { var L0 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; ux = (b[0] - a[0]) / L0; uy = (b[1] - a[1]) / L0; }
      var nx = -uy, ny = ux; if (ny > 0 || (Math.abs(ny) < 1e-9 && nx < 0)) { nx = -nx; ny = -ny; }
      var ta = (a[0] * ux + a[1] * uy), tb = (b[0] * ux + b[1] * uy), base = Math.max(a[0] * nx + a[1] * ny, b[0] * nx + b[1] * ny), d = base + (it.off == null ? 6 : +it.off) + ((+it.x || 0) * nx + (+it.y || 0) * ny);
      var pa = [ux * ta + nx * d, uy * ta + ny * d], pb = [ux * tb + nx * d, uy * tb + ny * d], len = Math.abs(tb - ta), v = Math.round(len * C.N * 10) / 10;
      g.style({ stroke: col, lw: +it.sLw || 0.18, fill: null, dash: null }); g.line(pa[0], pa[1], pb[0], pb[1]);
      if (it.ext !== false) { [[a, pa], [b, pb]].forEach(function (e) { var P = e[0], Q = e[1], ex = Q[0] - P[0], ey = Q[1] - P[1], el = Math.hypot(ex, ey) || 1; g.line(P[0] + ex / el * 0.8, P[1] + ey / el * 0.8, Q[0] + ex / el * 1.2, Q[1] + ey / el * 1.2); }); }
      var sx = tb >= ta ? 1 : -1, nar = len < fs * 1.5; /* estreita: setas por fora */
      if (it.arrows !== false && len > 0.3) { var q = nar ? -1 : 1; arrow(g, pa[0], pa[1], -ux * sx * q, -uy * sx * q, col, fs * 0.6); arrow(g, pb[0], pb[1], ux * sx * q, uy * sx * q, col, fs * 0.6);
        if (nar) { g.line(pa[0], pa[1], pa[0] - ux * sx * fs, pa[1] - uy * sx * fs); g.line(pb[0], pb[1], pb[0] + ux * sx * fs, pb[1] + uy * sx * fs); } }
      var t = (it.text ? String(it.text) : HX.fmtNum(Math.round(v))) + (it.tolP || it.tolM ? ' +' + (it.tolP || 0) + '/-' + (it.tolM || 0) : ''), an = Math.atan2(uy, ux); if (Math.cos(an) < -1e-6 || (Math.abs(Math.cos(an)) < 1e-6 && Math.sin(an) > 0)) an += Math.PI;
      var fo = fs * (it.sub ? 1.3 : 0.7), mx = (pa[0] + pb[0]) / 2 + nx * fo + ux * (+it.tx || 0), my = (pa[1] + pb[1]) / 2 + ny * fo + uy * (+it.tx || 0);
      var tx2 = +it.tx || 0, hw = HX.textW(t, fs) / 2, sl = len / 2; if (Math.abs(tx2) > sl) { var e1 = sl * (tx2 > 0 ? 1 : -1), e2 = tx2 + hw * (tx2 > 0 ? 1 : -1), cm = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]; g.line(cm[0] + ux * e1, cm[1] + uy * e1, cm[0] + ux * e2, cm[1] + uy * e2); } /* texto fora: linha de cota até ele */
      g.push([Math.cos(an), Math.sin(an), -Math.sin(an), Math.cos(an), mx, my]); g.text(t, 0, 0, { size: fs, align: 'c', color: col }); if (it.sub) g.text(String(it.sub), 0, fs * 0.85, { size: fs * 0.69, align: 'c', color: col }); g.pop(); /* texto sob o valor (ex.: TIP.) */
      var w = HX.textW(t, fs) / 2 + 1; hide(it, '_seg', [pa[0], pa[1], pb[0], pb[1]]); hide(it, '_val', v);
      hide(it, '_bb', { x0: Math.min(pa[0], pb[0], mx - w) - 1, y0: Math.min(pa[1], pb[1], my - w) - 1, x1: Math.max(pa[0], pb[0], mx + w) + 1, y1: Math.max(pa[1], pb[1], my + w) + 1 });
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) { var q = it._seg; if (!q) return 1e9; var b = it._bb, inT = b && pt[0] >= b.x0 && pt[0] <= b.x1 && pt[1] >= b.y0 && pt[1] <= b.y1; return Math.min(HX.distSeg(pt, [q[0], q[1]], [q[2], q[3]]) - 0.6, inT ? 1.2 : 1e9); }
  };
  HX.HITPR.pdimx = 1;
  // balão: em qualquer item, em qualquer ponto dele; tamanho, texto e seta opcionais
  var bd0 = EXT.pball.draw;
  EXT.pball.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), tg = C.m[it.of]; if (!tg) return;
    var std = tg.type === 'pnode' || tg.type === 'pseg' || tg.type === 'pacc' || tg.type === 'ptag' || tg.type === 'pcov';
    if (std && !it.ax && !it.ay && !it.r && !it.fs && it.lead !== false) return bd0.apply(this, arguments);
    var R = HX.physRefPt(tg, C.m); if (!R) return; var A = [R[0] + (+it.ax || 0), R[1] + (+it.ay || 0)];
    if (!o._bom) o._bom = HX.physBom(p, C.sh); var k = HX.physItemKey ? HX.physItemKey(p, tg, C.m) : null, row = k && o._bom.key[k];
    var col = it.sCol || (C.line ? C.col : (o.theme && o.theme.txt) || '#222'), r = +it.r || +C.sh.ballR || 2.6, fs = +it.fs || r * 0.92, cx = A[0] + (it.x == null || it.x === '' ? 8 : +it.x), cy = A[1] + (it.y == null || it.y === '' ? -10 : +it.y);
    var num = it.n !== '' && it.n != null ? String(it.n) : row ? String(row.n) : '?', dx = A[0] - cx, dy = A[1] - cy, L = Math.hypot(dx, dy);
    g.style({ stroke: col, lw: +it.sLw || 0.22, fill: '#fff', dash: null }); g.circle(cx, cy, r); g.style({ fill: null });
    if (it.lead !== false && L > r + 1) { var ux = dx / L, uy = dy / L; g.line(cx + ux * r, cy + uy * r, A[0], A[1]); arrow(g, A[0], A[1], ux, uy, col, 1.4); }
    g.text(num, cx, cy, { size: fs, bold: true, align: 'c', color: col });
    hide(it, '_bb', { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r });
  };
  EXT.pball._styled = false; if (HX.physStyleWrap) HX.physStyleWrap(['pball', 'pdimx']); // cor/espessura/tamanho do pincel e camadas
  var cl0 = HX.physClean; // cota livre presa a item apagado também sai
  if (cl0) HX.physClean = function (doc) { var r = cl0.apply(this, arguments), sh = doc.cur(), m = HX.physIdx(sh); sh.items = sh.items.filter(function (i) { return i.type !== 'pdimx' || ((!i.a.of || m[i.a.of]) && (!i.b.of || m[i.b.of])); }); return r; };
})(typeof window !== 'undefined' ? window : globalThis);
