/* HarnessCAD - desenho técnico HARWIN DATAMATE L-Tek fêmea crimpada (M80), traçado sobre a figura OFICIAL do catálogo
   (Harwin, p. 20, vista frontal "A max." x 7,65 max.), medida em 600 dpi (58,6 px/mm) e montada para qualquer nº de
   vias: as pontas (asa da trava, chanfros, corpo traseiro, faixa) ficam como no datasheet e o miolo cresce no passo
   de 2,00 mm, com as cotas do catálogo (A = B + 5,15; altura 7,65; profundidade 5,45 dupla / 3,50 simples).
   No desenho físico: lado dos terminais (almofadas no passo de 2,00) voltado para o cabo, face de encaixe do lado oposto. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.COM_SHAPE || !HX.M80) return;
  HX.COM_SHAPE.M80 = ['m80', 2.0, 7.65];
  var cs0 = HX.comShape;
  HX.comShape = function (c) {
    var d = c && HX.CAT.conns[c.part]; if (!d || d.fam !== 'M80') return cs0.apply(this, arguments);
    var n = (c.pins || []).length || d.n, rows = d.rows || 1, m = HX.M80.dims(n, rows);
    return { cls: 'm80', fam: 'M80', n: n, rows: rows, cols: Math.ceil(n / rows), p: 2.0, A: m.A, D: m.D, L: 7.65, W: m.A, H: m.D };
  };
  /* figura do datasheet em mm (x ao longo de A; y = 0 no corpo estreito da face de encaixe até 7,65; almofadas dos terminais até 7,79) */
  function fig(A, cols) {
    var r = A, P = [], F = [];
    F.push([[0.51, 3.96], [r - 0.51, 3.96], [r - 0.51, 7.14], [r - 1.02, 7.65], [1.02, 7.65], [0.51, 7.14]]); /* corpo frontal (chanfrado) */
    F.push([[1.23, 0], [r - 1.21, 0], [r - 1.21, 3.14], [1.23, 3.14]]);                                    /* corpo da face de encaixe */
    F.push([[0, 3.96], [1.02, 3.21], [1.23, 3.14], [r - 1.21, 3.14], [r - 1.0, 3.21], [r, 3.96], [r, 4.61], [r - 0.51, 4.61], [r - 0.51, 3.96], [0.51, 3.96], [0.51, 4.61], [0, 4.61]]); /* asas da trava + faixa */
    P.push([[2.0, 0], [2.0, 3.14]], [[r - 1.95, 0], [r - 1.95, 3.14]]);                                    /* frisos */
    P.push([[1.04, 3.35], [r - 1.0, 3.35]], [[1.04, 3.24], [1.04, 3.96]], [[r - 1.0, 3.24], [r - 1.0, 3.96]]);
    P.push([[2.0, 3.14], [1.91, 3.35], [1.91, 3.96]], [[r - 1.95, 3.14], [r - 1.88, 3.35], [r - 1.88, 3.96]]);
    for (var j = 0; j < cols; j++) { var xc = 2.575 + 2 * j; F.push([[xc - 0.735, 7.65], [xc + 0.735, 7.65], [xc + 0.735, 7.79], [xc - 0.735, 7.79]]); }
    return { F: F, P: P };
  }
  HX.m80Fig = fig;
  var d0 = HX.physComDraw;
  HX.physComDraw = function (g, o, s, col, line, bw) {
    if (o.cls !== 'm80') return d0.apply(this, arguments);
    var D = fig(o.A, o.cols), fill = line ? '#fff' : '#e6e6e6', lw = 0.13;
    var T = function (P) { return P.map(function (q) { return [(q[1] - 7.79) * s, (q[0] - o.A / 2) * s]; }); }; /* terminais em x = 0 (cabo), face de encaixe à esquerda */
    D.F.forEach(function (P) { g.style({ stroke: col, lw: lw, fill: fill, dash: null }); g.poly(T(P), true); });
    g.style({ fill: null });
    D.P.forEach(function (P) { g.style({ stroke: col, lw: lw, dash: null }); g.poly(T(P), false); });
    return { x0: -7.79 * s, x1: 0, y0: -o.A / 2 * s, y1: o.A / 2 * s };
  };
  /* vista frontal (face de encaixe), em pé como o conector aparece no desenho: contorno A x profundidade do catálogo,
     cavidades no passo de 2,00 mm e o nº dos contatos dos cantos (como nas pranchas); ampliada no mínimo 1,4x */
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, kk) {
    var O = HX.comShape(c); if (!O || O.cls !== 'm80') return lf.apply(this, arguments);
    var k = Math.max(1.4, w / O.A), H = O.A * k, W = O.D * k, x0 = x - W / 2, y0 = y - H / 2, cw = 1.1 * k, fs = Math.min(1.8, 0.8 * k), ch = 0.5 * k;
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.rect(x0, y0, W, H);
    g.poly([[x0 + ch, y0], [x0, y0 + ch], [x0, y0 + H - ch], [x0 + ch, y0 + H]], false); g.style({ fill: null });
    var rows = O.rows === 2 ? 2 : 1, pos = function (i) { var rw = rows === 2 ? i % 2 : 0, cl = rows === 2 ? Math.floor(i / 2) : i; return [rows === 2 ? x + (rw ? 1 : -1) * k : x, y0 + (2.575 + 2 * cl) * k]; };
    var corner = {}; [0, rows - 1, O.n - rows, O.n - 1].forEach(function (i) { if (i >= 0 && i < O.n) corner[i] = 1; });
    for (var i = 0; i < O.n; i++) { var q = pos(i); g.style({ stroke: col, lw: 0.12 }); g.circle(q[0], q[1], cw / 2);
      if (corner[i]) { var rgt = rows === 2 ? i % 2 === 1 : true; g.text(String((c.pins[i] || {}).n || i + 1), rgt ? x0 + W + 0.8 : x0 - 0.8, q[1], { size: fs, align: rgt ? 'l' : 'r', color: col }); } }
    return { x0: x0 - 3, y0: y0, x1: x0 + W + 3, y1: y0 + H };
  };
})(typeof window !== 'undefined' ? window : globalThis);
