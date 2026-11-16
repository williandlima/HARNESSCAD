/* HarnessCAD - desenho físico: ETIQUETA DE IDENTIFICAÇÃO no cabo (ptag).
   Estilos: 'sleeve' luva termo-retrátil impressa em volta do feixe (texto na luva), 'flag' etiqueta bandeira presa por
   abraçadeira, 'wire' luva num fio só (feixe sem capa: fica sobre aquele fio). Posição por distância real a partir de
   uma ponta do ramo (arrastar desliza no ramo; Shift + arrastar move só a bandeira/rótulo).
   Cota opcional da posição (dim): da ponta de referência até o meio da etiqueta, paralela ao ramo, afastamento dimOff
   (negativo = do outro lado). Campos: seg, end, dist, style, text, pn, len (mm), wire (nº do fio), dim, dimOff, x, y. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.PTAG = { sleeve: 'Luva termo-retrátil impressa', flag: 'Etiqueta bandeira', wire: 'Luva no fio' };
  HX.HITPR.ptag = 1.4;
  function arrow(g, x, y, ux, uy, col) { var a = 1.5, w = 0.42; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  function wireOff(it, sg, sh, BU, C) { // deslocamento lateral do fio escolhido (feixe sem capa)
    if (it.style !== 'wire' || !it.wire || !HX.physLooseOf(sg, sh)) return null;
    var ws = HX.physLooseOrder(sg, sh, C, BU), i = -1;
    ws.forEach(function (w, j) { if (String(w.num) === String(it.wire)) i = j; }); if (i < 0) return null;
    var off = (i - (ws.length - 1) / 2) * HX.physWirePitch(sh, BU); return it.end === 'b' ? -off : off;
  }
  // borda do conector: onde a reta nó→etiqueta sai da caixa do conector (a cota parte dali, não do centro)
  HX.physEdgeOff = function (from, P1) {
    var b = from._bb, x = from.x, y = from.y, dx = P1[0] - x, dy = P1[1] - y, L = Math.hypot(dx, dy); if (!b || L < 1e-6 || from.nkind !== 'conn') return 0;
    var ux = dx / L, uy = dy / L, t = 1e9; if (Math.abs(ux) > 1e-6) t = Math.min(t, ((ux > 0 ? b.x1 : b.x0) - x) / ux); if (Math.abs(uy) > 1e-6) t = Math.min(t, ((uy > 0 ? b.y1 : b.y0) - y) / uy);
    return Math.max(0, Math.min(L, t));
  };
  function dimDraw(g, it, A, from, col, C) {
    var e0 = it.dimFrom === 'node' ? 0 : HX.physEdgeOff(from, A.pt), Q = [from.x, from.y], q1 = A.pt, qL = Math.hypot(q1[0] - Q[0], q1[1] - Q[1]) || 1;
    var P0 = [Q[0] + (q1[0] - Q[0]) / qL * e0, Q[1] + (q1[1] - Q[1]) / qL * e0], P1 = A.pt, dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = Math.hypot(dx, dy);
    var sg = C.m[it.seg], pl = sg && sg._P ? HX.polyLen(sg._P) : 0, eo = pl ? e0 * A.L / pl : 0; hide(it, '_eo', eo); if (L < 2) return null;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, d = it.dimOff == null || it.dimOff === '' ? -8 : +it.dimOff, s = d >= 0 ? 1 : -1;
    var a = [P0[0] + nx * d, P0[1] + ny * d], b = [P1[0] + nx * d, P1[1] + ny * d];
    g.style({ stroke: col, lw: 0.18, fill: null, dash: null }); g.line(a[0], a[1], b[0], b[1]);
    g.line(P0[0] + nx * 1.2 * s, P0[1] + ny * 1.2 * s, a[0] + nx * 1.2 * s, a[1] + ny * 1.2 * s); g.line(P1[0] + nx * 1.2 * s, P1[1] + ny * 1.2 * s, b[0] + nx * 1.2 * s, b[1] + ny * 1.2 * s);
    arrow(g, a[0], a[1], -ux, -uy, col); arrow(g, b[0], b[1], ux, uy, col);
    var ta = Math.atan2(uy, ux); if (Math.cos(ta) < -1e-6) ta += Math.PI; var tn = d >= 0 ? 1.7 : -1.7, mx = (a[0] + b[0]) / 2 + nx * tn, my = (a[1] + b[1]) / 2 + ny * tn;
    var t = HX.fmtNum(Math.round((+it.dist || 0) - eo)) + (it.tolP || it.tolM ? ' ±' + (it.tolP || it.tolM) : '');
    g.push([Math.cos(ta), Math.sin(ta), -Math.sin(ta), Math.cos(ta), mx, my]); g.text(t, 0, 0, { size: 2.2, align: 'c', color: col }); g.pop();
    return { x0: Math.min(a[0], b[0], mx) - 2, y0: Math.min(a[1], b[1], my) - 2, x1: Math.max(a[0], b[0], mx) + 2, y1: Math.max(a[1], b[1], my) + 2, a: a, b: b, p0: P0, n: [nx, ny] };
  }
  EXT.ptag = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), A = HX.physAccAt(it, C.sh, C.m, C.N); if (!A) return;
      var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', sg = C.m[it.seg], BU = HX.physBundleCtx(p, s, o), ux = A.d[0], uy = A.d[1];
      var W = HX.physVisW(sg, C.sh, BU), st = it.style || 'sleeve', wo = wireOff(it, sg, C.sh, BU, C), Lp = Math.max(2.4, (+it.len || 25) / C.N), txt = it.text || 'ID';
      var cx = A.pt[0] - uy * (wo || 0), cy = A.pt[1] + ux * (wo || 0), h = wo != null ? HX.physWirePitch(C.sh, BU) * 0.9 + 0.35 : W / 2 + 0.45, ang = Math.atan2(uy, ux), flip = Math.cos(ang) < -1e-6;
      g.push([ux, uy, -uy, ux, cx, cy]);
      if (st === 'flag') { g.style({ stroke: col, lw: 0.2, fill: C.line ? '#fff' : '#111' }); g.rect(-0.4, -h, 0.8, 2 * h); g.style({ fill: null }); }
      else {
        g.style({ stroke: col, lw: 0.25, fill: C.line ? '#fff' : '#f4f4f0' }); g.rect(-Lp / 2, -h, Lp, 2 * h); g.style({ fill: null });
        g.style({ stroke: col, lw: 0.1 }); g.line(-Lp / 2 + 0.35, -h, -Lp / 2 + 0.35, h); g.line(Lp / 2 - 0.35, -h, Lp / 2 - 0.35, h);
      }
      g.pop();
      var fits = st === 'sleeve' && HX.textW(txt, Math.min(1.8, h * 1.1)) < Lp - 0.9, lx, ly, bb;
      if (fits) { var a2 = flip ? ang + Math.PI : ang; g.push([Math.cos(a2), Math.sin(a2), -Math.sin(a2), Math.cos(a2), cx, cy]); g.text(txt, 0, 0, { size: Math.min(1.8, h * 1.1), bold: true, align: 'c', color: col }); g.pop(); }
      else { // bandeira / rótulo fora do feixe
        lx = cx + (it.x == null || it.x === '' ? -uy * (h + 5) : +it.x); ly = cy + (it.y == null || it.y === '' ? ux * (h + 5) : +it.y);
        var fs = 1.8, tw = HX.textW(txt, fs) + 1.6, fh = 3.4, x0 = lx - tw / 2, y0 = ly - fh / 2;
        g.style({ stroke: col, lw: 0.18, dash: null }); var ex = Math.max(x0, Math.min(cx, x0 + tw)), ey = Math.max(y0, Math.min(cy, y0 + fh)); g.line(cx, cy, ex, ey);
        g.style({ stroke: col, lw: 0.3, fill: '#fff' }); g.rect(x0, y0, tw, fh); g.style({ fill: null }); if (st === 'flag') { g.style({ lw: 0.12 }); g.circle(x0 + 0.7, ly, 0.3); }
        g.text(txt, lx + (st === 'flag' ? 0.3 : 0), ly, { size: fs, bold: true, align: 'c', color: col }); bb = { x0: x0, y0: y0, x1: x0 + tw, y1: y0 + fh };
      }
      var D = it.dim && A.from ? dimDraw(g, it, A, A.from, col, C) : null;
      var B = { x0: cx - Lp / 2 - 1, y0: cy - h - 1, x1: cx + Lp / 2 + 1, y1: cy + h + 1 }; [bb, D].forEach(function (q) { if (q) B = { x0: Math.min(B.x0, q.x0), y0: Math.min(B.y0, q.y0), x1: Math.max(B.x1, q.x1), y1: Math.max(B.y1, q.y1) }; });
      hide(it, '_bb', B); hide(it, '_pt', [cx, cy]); hide(it, '_lp', bb ? [lx, ly] : null); hide(it, '_lb', bb || null); hide(it, '_dim', D);
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) {
      var a = it._pt; if (!a) return 1e9; var d = Math.hypot(pt[0] - a[0], pt[1] - a[1]) - 2, b = it._lb, D = it._dim;
      if (b && pt[0] >= b.x0 - 0.5 && pt[0] <= b.x1 + 0.5 && pt[1] >= b.y0 - 0.5 && pt[1] <= b.y1 + 0.5) d = Math.min(d, 0.2);
      if (D) d = Math.min(d, HX.distSeg(pt, D.a, D.b) - 0.8);
      return d;
    }
  };
  // nova etiqueta: no ponto t (0..1) do ramo, medida a partir da ponta de conector mais próxima
  HX.physAddTag = function (doc, sg, t, opt) {
    var sh = doc.cur(), m = HX.physIdx(sh), N = +sh.scale || 1, L = HX.physSegLen(sg, m, N), A = m[sg.a], B = m[sg.b];
    var useB = (B && B.nkind === 'conn' && !(A && A.nkind === 'conn')) || (!!(A && B) && (A.nkind === 'conn') === (B.nkind === 'conn') && t > 0.5);
    var from = useB ? B : A, dist = Math.max(0, Math.round((useB ? 1 - t : t) * L / 5) * 5), o = opt || {};
    var it = { type: 'ptag', id: doc.uid('t'), seg: sg.id, end: useB ? 'b' : 'a', dist: dist, style: o.style || sh.tagStyle || 'sleeve', text: o.text != null ? o.text : (from && from.nkind === 'conn' ? from.ref || '' : ''), pn: o.pn || sh.tagPN || '', len: o.len || 25, wire: '', dim: o.dim != null ? o.dim : sh.tagDim !== false, dimOff: '', x: '', y: '' };
    return doc.add(it);
  };
  HX.physTags = function (sh) { var m = HX.physIdx(sh); return sh.items.filter(function (i) { return i.type === 'ptag'; }).map(function (i) { var sg = m[i.seg] || {}, f = m[i.end === 'b' ? sg.b : sg.a] || {}; return { text: i.text || '', pn: i.pn || '', dist: +i.dist || 0, from: f.ref || '', style: HX.PTAG[i.style || 'sleeve'], wire: i.wire || '' }; }); };
  // lista de materiais e tabela de marcadores
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh);
    sh.items.forEach(function (i) { if (i.type !== 'ptag') return; var k = 'tag:' + (i.style || 'sleeve') + ':' + (i.pn || ''), r = B.key[k]; if (!r) { r = { k: k, pn: i.pn || '', desc: 'Etiqueta de identificação — ' + HX.PTAG[i.style || 'sleeve'].toLowerCase(), qty: 0, un: 'pç' }; B.rows.push(r); B.key[k] = r; } r.qty += 1; });
    B.rows.forEach(function (r, j) { r.n = j + 1; }); return B;
  };
  var mk = HX.physMarkers;
  HX.physMarkers = function (sh) { return mk(sh).concat(HX.physTags(sh).map(function (t) { return { text: t.text + (t.wire ? ' (fio ' + t.wire + ')' : ''), pn: t.pn, dist: t.dist, from: t.from }; })); };
  var ik = HX.physItemKey;
  HX.physItemKey = function (p, it, m) { return it.type === 'ptag' ? 'tag:' + (it.style || 'sleeve') + ':' + (it.pn || '') : ik(p, it, m); };
  var an = HX.physAnchor;
  HX.physAnchor = function (it, m) { return it && it.type === 'ptag' ? it._pt || null : an(it, m); };
})(typeof window !== 'undefined' ? window : globalThis);
