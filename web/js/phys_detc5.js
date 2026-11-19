/* HarnessCAD - DETALHE B (montagem da cordoalha) IGUAL À PRANCHA DA CASA: geometria copiada da prancha de referência
   (medida ampliada; detalhe típico fora de escala, proporções da prancha, em "du" = unidades da prancha, ×0,2 mm × escala).
   Etapa 1: bloco escuro quadriculado (ponta) · 5 linhas de fio · espaguete branco liso · fios · cordoalha sanfonada escura
   (lado esquerdo reto, 3 dentes em V em cima/embaixo, lado direito dentado).
   Etapa 2: sanfona escura (cordoalha do adaptador, lado esquerdo dentado) · fios · anel branco (ponta do espaguete) ·
   faixa escura do barbante · cordoalha em espinha-de-peixe com degrau e ponta chanfrada.
   Etapa 3: trama em cesto (chanfro à esquerda) · região da luva de solda com ombros e 3 anéis brancos (estreito, largo,
   estreito) · trama em cesto · faixa do barbante · cordoalha em espinha-de-peixe chanfrada. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R || !R.cord) return;
  function inP(P, x, y) { return L.inPoly(P, x, y); }
  function out(g, P, col, lw) { g.style({ stroke: col, lw: lw || 0.22, fill: null }); g.poly(P, true); }
  function white(g, P, col) { g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.poly(P, true); g.style({ fill: null }); }
  /* área escura (cordoalha sanfonada, ponta, barbante): hachura cruzada densa + horizontal */
  function dark(g, P, col, u) { white(g, P, col); g.style({ stroke: col, lw: 0.07 }); L.hatch(g, P, 0.3 * u, [45, -45, 0]); out(g, P, col); }
  /* cordoalha em espinha-de-peixe: fileiras com pares de riscos inclinados, sentido alternado por fileira */
  function herring(g, P, col, c) { white(g, P, col); var b = bb(P); g.style({ stroke: col, lw: 0.09 });
    for (var j = 0, y = b[1]; y < b[3]; j++, y += c) for (var x = b[0] + (j % 2) * c * 0.5; x < b[2]; x += c) { var s = j % 2 ? 1 : -1;
      [0, c * 0.22].forEach(function (o) { var ax = x + o, ay = y + c * 0.15, bx = x + o + s * c * 0.35, by = y + c * 0.85; if (inP(P, ax, ay) && inP(P, bx, by)) g.line(ax, ay, bx, by); }); }
    out(g, P, col); }
  /* trama em cesto: blocos alternados de 3 riscos verticais e 3 horizontais */
  function basket(g, P, col, c) { white(g, P, col); var b = bb(P); g.style({ stroke: col, lw: 0.08 });
    for (var i = 0, x = b[0]; x < b[2]; i++, x += c) for (var j = 0, y = b[1]; y < b[3]; j++, y += c) for (var k = 1; k <= 3; k++) {
      var f = k / 4, ax, ay, bx, by; if ((i + j) % 2) { ax = x + c * f; bx = ax; ay = y + c * 0.12; by = y + c * 0.88; } else { ay = y + c * f; by = ay; ax = x + c * 0.12; bx = x + c * 0.88; }
      if (inP(P, ax, ay) && inP(P, bx, by)) g.line(ax, ay, bx, by); }
    out(g, P, col); }
  function bb(P) { var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; }); return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; }
  function lines(g, x0, x1, y, h, n, col) { g.style({ stroke: col, lw: 0.13 }); for (var i = 0; i < n; i++) { var yy = y - h + 2 * h * i / (n - 1); g.line(x0, yy, x1, yy); } }
  /* sanfona: dentes em V em cima e embaixo; lados: 'r' reto / 'z' dentado */
  function sanf(x0, x1, y, h, a, left, right) { var n = 3, w = (x1 - x0) / n, T = [], B = [], i;
    for (i = 0; i <= 2 * n; i++) { var x = x0 + w * i / 2, up = i % 2 ? 0 : a; T.push([x, y - h + up * (i === 0 || i === 2 * n ? 0.5 : 1)]); B.push([x, y + h - up * (i === 0 || i === 2 * n ? 0.5 : 1)]); }
    var P = T.slice(); if (right === 'z') P.push([x1 - a * 0.7, y - h * 0.35], [x1, y], [x1 - a * 0.7, y + h * 0.35]); P = P.concat(B.reverse());
    if (left === 'z') P.push([x0 + a * 0.7, y + h * 0.35], [x0, y], [x0 + a * 0.7, y - h * 0.35]); return P; }
  R.cord.size = [130, 150];
  R.cord.draw = function (c) {
    var g = c.g, col = c.col, u = 0.2 * Math.max(0.1, Math.abs(c.k) || 1), X = c.X, Y = c.Y, cell = Math.max(1.1, 7 * u);
    function px(v) { return X + v * u; } function py(v) { return Y + v * u; }
    /* ETAPA 1 (centro em du 115 abaixo do topo) */
    var y1 = py(115), hb = 16.5 * u, hs = 19.6 * u;
    dark(g, L.rect(px(0), y1, 30 * u, 2 * hb), col, u * 5); lines(g, px(30), px(180), y1, hb, 5, col);
    white(g, L.rect(px(180), y1, 240 * u, 2 * hs), col); g.style({ stroke: col, lw: 0.07 }); g.line(px(182), y1 - hs + 1.6 * u, px(418), y1 - hs + 1.6 * u);
    lines(g, px(420), px(452), y1, 13 * u, 5, col); dark(g, sanf(px(452), px(543), y1, 37.8 * u, 13 * u, 'r', 'z'), col, u * 5);
    var yd = py(14); c.dim(px(0), px(30), yd, y1 - hb, y1 - hb, 'd1', 't1'); c.dim(px(30), px(180), yd, y1 - hb, y1 - hs, 'd2', 't2'); c.dim(px(180), px(420), yd, y1 - hs, y1 - hs, 'd3', 't3', '');
    c.ball('esp', px(300), py(212), px(340), y1 + hs);
    /* ETAPA 2 */
    var y2 = py(322); dark(g, sanf(px(0), px(102), y2, 37 * u, 13 * u, 'z', 'r'), col, u * 5); lines(g, px(102), px(130), y2, 14 * u, 5, col);
    white(g, L.rect(px(130), y2, 13 * u, 52 * u), col); dark(g, L.rect(px(143), y2, 30 * u, 64 * u), col, u * 4);
    var hw = 28.6 * u, hn = 23 * u; herring(g, [[px(173), y2 - hw], [px(359), y2 - hw], [px(367), y2 - hn], [px(500), y2 - hn], [px(514), y2 + hn], [px(367), y2 + hn], [px(359), y2 + hw], [px(173), y2 + hw]], col, cell);
    c.ball('adp', px(-20), py(425), px(10), y2 + 30 * u, -1); c.ball('barb', px(240), py(415), px(160), y2 + 32 * u); c.ball('cord', px(549), py(420), px(509), y2 + hn, 1);
    /* ETAPA 3: trama em cesto, luva de solda (3 anéis), barbante, cordoalha */
    var y3 = py(513), hl = 25.5 * u, hv = 35.5 * u, ha = 29 * u, hr = 40 * u;
    basket(g, [[px(8), y3 - hl], [px(95), y3 - hl], [px(95), y3 + hl], [px(0), y3 + hl], [px(0), y3 - hl + 8 * u]], col, cell);
    basket(g, [[px(250), y3 - ha], [px(299), y3 - ha], [px(299), y3 + ha], [px(250), y3 + ha]], col, cell);
    var S = [[px(95), y3 - hl], [px(110), y3 - hv + 5 * u], [px(140), y3 - hv], [px(147), y3 - hv], [px(165), y3 - hv + 3 * u], [px(179), y3 - hv], [px(203), y3 - hv], [px(213), y3 - hv + 3 * u], [px(223), y3 - hv], [px(235), y3 - hv], [px(245), y3 - hv + 5 * u], [px(250), y3 - ha]];
    var Sv = S.concat(S.slice().reverse().map(function (p) { return [p[0], 2 * y3 - p[1]]; })); basket(g, Sv, col, cell); /* cordoalha vista através da luva */
    [[147, 159], [179, 203], [223, 235]].forEach(function (r) { white(g, L.rrect ? L.rrect(px(r[0]), y3, (r[1] - r[0]) * u, 2 * hr, 2 * u) : L.rect(px(r[0]), y3, (r[1] - r[0]) * u, 2 * hr), col); });
    dark(g, L.rect(px(299), y3, 29 * u, 76 * u), col, u * 4); herring(g, [[px(328), y3 - 26 * u], [px(400), y3 - 26 * u], [px(411), y3 - 18 * u], [px(411), y3 + 26 * u], [px(328), y3 + 26 * u]], col, cell);
    c.ball('ss', px(290), py(610), px(239), y3 + hr * 0.9); c.ext(px(560), py(600));
  };
  if (!L.rrect) L.rrect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); var P = [], C = [[x + w - r, y - h / 2 + r, -90], [x + w - r, y + h / 2 - r, 0], [x + r, y + h / 2 - r, 90], [x + r, y - h / 2 + r, 180]];
    C.forEach(function (q) { for (var i = 0; i <= 4; i++) { var a = (q[2] + i * 22.5) * Math.PI / 180; P.push([q[0] + Math.cos(a) * r, q[1] + Math.sin(a) * r]); } }); return P; };
})(typeof window !== 'undefined' ? window : globalThis);
