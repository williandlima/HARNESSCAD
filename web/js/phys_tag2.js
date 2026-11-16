/* HarnessCAD - ETIQUETA DE IDENTIFICAÇÃO = só LUVA TERMO-RETRÁTIL impressa (substitui o desenho de phys_tag.js).
   A luva aperta o feixe (largura apertada), o texto vai dentro da luva (tamanho ajustado ao comprimento).
   COTA: da borda da etiqueta mais próxima do conector até a borda do conector, fora do desenho: as linhas de
   chamada começam na borda do feixe e as cotas de várias etiquetas do mesmo ramo ficam escalonadas (não se
   sobrepõem). Valor customizável (dimText) e tolerância. Campo 'edist' (acessor) = distância borda→conector;
   'dist' continua sendo o meio da etiqueta. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.PTAG = { sleeve: 'Luva termo-retrátil impressa' }; // tipos antigos (bandeira, luva no fio) passam a ser luva
  ['flag', 'wire'].forEach(function (k) { Object.defineProperty(HX.PTAG, k, { value: HX.PTAG.sleeve, enumerable: false }); });
  function arrow(g, x, y, ux, uy, col) { var a = 1.5, w = 0.42; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  HX.physTagEdist = function (it) { var e = Math.round(((+it.dist || 0) - (+it.len || 25) / 2 - (+it._eo || 0)) * 10) / 10; return Math.max(0, e); };
  HX.physTagAccessor = function (it) {
    if (Object.getOwnPropertyDescriptor(it, 'edist')) return;
    Object.defineProperty(it, 'edist', { configurable: true, enumerable: false, get: function () { return HX.physTagEdist(this); }, set: function (v) { this.dist = Math.max(0, (+v || 0) + (+this.len || 25) / 2 + (+this._eo || 0)); } });
  };
  HX.physTagDims = function (sh, segId) { var n = { a: 0, b: 0 }; sh.items.forEach(function (q) { if (q.type === 'ptag' && q.dim && q.seg === segId && (q.dimOff == null || q.dimOff === '')) n[q.end === 'b' ? 'b' : 'a']++; }); return Math.max(n.a, n.b); };
  function rank(it, sh) { // posição na pilha de cotas das etiquetas do mesmo ramo/ponta
    var L = sh.items.filter(function (q) { return q.type === 'ptag' && q.dim && q.seg === it.seg && (q.end || 'a') === (it.end || 'a'); }).sort(function (a, b) { return (+a.dist || 0) - (+b.dist || 0); });
    return Math.max(0, L.indexOf(it));
  }
  function dimDraw(g, it, A, from, col, C, Lp, Wv) {
    var e0 = it.dimFrom === 'node' ? 0 : HX.physEdgeOff(from, A.pt), Q = [from.x, from.y], q1 = A.pt, qL = Math.hypot(q1[0] - Q[0], q1[1] - Q[1]) || 1, u = [(q1[0] - Q[0]) / qL, (q1[1] - Q[1]) / qL];
    var P0 = [Q[0] + u[0] * e0, Q[1] + u[1] * e0], P1 = [q1[0] - u[0] * Lp / 2, q1[1] - u[1] * Lp / 2], sg = C.m[it.seg], pl = sg && sg._P ? HX.polyLen(sg._P) : 0;
    hide(it, '_eo', pl ? e0 * A.L / pl : 0); var dx = P1[0] - P0[0], dy = P1[1] - P0[1], L = Math.hypot(dx, dy); if (L < 1) return null;
    var ux = dx / L, uy = dy / L, nx = -uy, ny = ux, auto = it.dimOff == null || it.dimOff === '', d = auto ? -(Wv / 2 + 4.5 + 4.5 * rank(it, C.sh)) : +it.dimOff;
    if (auto && ny * d > 0) d = -d; // sempre do lado de cima do ramo, junto com as cotas de comprimento
    var s = d >= 0 ? 1 : -1, e = Wv / 2 + 0.8;
    var a = [P0[0] + nx * d, P0[1] + ny * d], b = [P1[0] + nx * d, P1[1] + ny * d];
    g.style({ stroke: col, lw: 0.18, fill: null, dash: null }); g.line(a[0], a[1], b[0], b[1]);
    [P0, P1].forEach(function (P, i) { var x = i ? b : a; g.line(P[0] + nx * e * s, P[1] + ny * e * s, x[0] + nx * 1.2 * s, x[1] + ny * 1.2 * s); });
    arrow(g, a[0], a[1], -ux, -uy, col); arrow(g, b[0], b[1], ux, uy, col);
    var ta = Math.atan2(uy, ux); if (Math.cos(ta) < -1e-6) ta += Math.PI; var tn = d >= 0 ? 1.7 : -1.7, mx = (a[0] + b[0]) / 2 + nx * tn, my = (a[1] + b[1]) / 2 + ny * tn;
    var t = (it.dimText ? String(it.dimText) : HX.fmtNum(Math.round(HX.physTagEdist(it)))) + (it.tolP || it.tolM ? ' ±' + (it.tolP || it.tolM) : '');
    g.push([Math.cos(ta), Math.sin(ta), -Math.sin(ta), Math.cos(ta), mx, my]); g.text(t, 0, 0, { size: 2.2, align: 'c', color: col }); g.pop();
    return { x0: Math.min(a[0], b[0], mx) - 2, y0: Math.min(a[1], b[1], my) - 2, x1: Math.max(a[0], b[0], mx) + 2, y1: Math.max(a[1], b[1], my) + 2, a: a, b: b, p0: P0, n: [nx, ny] };
  }
  EXT.ptag.draw = function (g, it, p, s, o) {
    HX.physTagAccessor(it);
    var C = HX.physCtx(p, s, o), A = HX.physAccAt(it, C.sh, C.m, C.N); if (!A) return;
    var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', sg = C.m[it.seg], BU = HX.physBundleCtx(p, s, o), ux = A.d[0], uy = A.d[1];
    var Wv = HX.physVisW(sg, C.sh, BU), W = Wv * (HX.physPinchK ? HX.physPinchK(sg, C.sh, 'ptag') : 1), Lp = Math.max(2.4, (+it.len || 25) / C.N), txt = it.text || 'ID';
    var cx = A.pt[0], cy = A.pt[1], h = W / 2 + 0.45, ang = Math.atan2(uy, ux), flip = Math.cos(ang) < -1e-6;
    g.push([ux, uy, -uy, ux, cx, cy]);
    g.style({ stroke: col, lw: 0.25, fill: C.line ? '#fff' : '#f4f4f0', dash: null }); g.rect(-Lp / 2, -h, Lp, 2 * h); g.style({ fill: null });
    g.style({ stroke: col, lw: 0.1 }); g.line(-Lp / 2 + 0.35, -h, -Lp / 2 + 0.35, h); g.line(Lp / 2 - 0.35, -h, Lp / 2 - 0.35, h);
    g.pop();
    var fs = Math.min(1.8, h * 1.15), tw = HX.textW(txt, fs); if (tw > Lp - 0.9) fs = Math.max(0.7, fs * (Lp - 0.9) / tw);
    var a2 = flip ? ang + Math.PI : ang; g.push([Math.cos(a2), Math.sin(a2), -Math.sin(a2), Math.cos(a2), cx, cy]); g.text(txt, 0, 0, { size: fs, bold: true, align: 'c', color: col }); g.pop();
    var D = it.dim && A.from ? dimDraw(g, it, A, A.from, col, C, Lp, Wv) : null;
    var B = { x0: cx - Lp / 2 - 1, y0: cy - h - 1, x1: cx + Lp / 2 + 1, y1: cy + h + 1 }; if (D) B = { x0: Math.min(B.x0, D.x0), y0: Math.min(B.y0, D.y0), x1: Math.max(B.x1, D.x1), y1: Math.max(B.y1, D.y1) };
    hide(it, '_bb', B); hide(it, '_pt', [cx, cy]); hide(it, '_lp', null); hide(it, '_lb', null); hide(it, '_dim', D);
  };
})(typeof window !== 'undefined' ? window : globalThis);
