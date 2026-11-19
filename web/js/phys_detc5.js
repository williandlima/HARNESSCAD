/* HarnessCAD - DETALHE B (montagem da cordoalha) IGUAL À PRANCHA DA CASA: geometria medida na prancha de referência
   (detalhe típico fora de escala; "du" = unidade da prancha, ×0,2 mm × escala; tudo deslocado OX para o "REF" do balão 5
   caber dentro da área do detalhe). Proporções conferidas etapa por etapa com a foto da prancha:
   1: bloco escuro (ponta) · 5 fios · espaguete branco (linha dupla em cima) · fios · cordoalha sanfonada escura
      (lado esquerdo reto, 3 dentes em cima/embaixo, lado direito ondulado com 2 pontas);
   2: sanfona do adaptador (lado esquerdo com 2 pontas, direito reto) · 6 fios · anel branco · faixa escura do barbante ·
      cordoalha trançada (xadrez de riscos inclinados) larga, degrau suave, estreita, ponta inclinada;
   3: trama em cesto (ponta esquerda inclinada) · luva de solda: corpo mais alto que a trama, sobe entre o anel 1 e o 2,
      afunda entre o 2 e o 3, anéis brancos estreito/largo/estreito mais altos que o corpo · trama em cesto · barbante ·
      cordoalha trançada com a ponta inclinada. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R || !R.cord) return;
  var OX = 36;
  function inP(P, x, y) { return L.inPoly(P, x, y); }
  function out(g, P, col) { g.style({ stroke: col, lw: 0.22, fill: null }); g.poly(P, true); }
  function white(g, P, col) { g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.poly(P, true); g.style({ fill: null }); }
  function bb(P) { var xs = P.map(function (p) { return p[0]; }), ys = P.map(function (p) { return p[1]; }); return [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)]; }
  /* risco recortado no contorno (a parte de fora é aparada por bisseção) — a trama chega até a borda, sem faixa vazia */
  function seg(g, P, ax, ay, bx, by) { var A = inP(P, ax, ay), B = inP(P, bx, by), mx = (ax + bx) / 2, my = (ay + by) / 2;
    if (!A && !B && !inP(P, mx, my)) return;
    function cut(ox, oy, ix, iy) { for (var n = 0; n < 7; n++) { var hx = (ox + ix) / 2, hy = (oy + iy) / 2; if (inP(P, hx, hy)) { ix = hx; iy = hy; } else { ox = hx; oy = hy; } } return [ix, iy]; }
    var a = A ? [ax, ay] : cut(ax, ay, mx, my), b = B ? [bx, by] : cut(bx, by, mx, my); g.line(a[0], a[1], b[0], b[1]); }
  /* grade centrada na altura da peça (fileiras simétricas em cima e embaixo) */
  function grid(P, c) { var b = bb(P), yc = (b[1] + b[3]) / 2; b[1] = yc - c / 2 - c * Math.ceil((yc - c / 2 - b[1]) / c); return b; }
  /* área escura (sanfona, ponta, barbante): hachura cruzada densa */
  function dark(g, P, col, st) { white(g, P, col); g.style({ stroke: col, lw: 0.07 }); L.hatch(g, P, st, [45, -45, 0]); out(g, P, col); }
  /* cordoalha trançada: xadrez de células com 3 riscos inclinados, sentido alternado */
  function braid(g, P, col, c) { white(g, P, col); var b = grid(P, c); g.style({ stroke: col, lw: 0.09 });
    for (var i = 0, x = b[0]; x < b[2]; i++, x += c) for (var j = 0, y = b[1]; y < b[3]; j++, y += c) { var s = (i + j) % 2 ? 1 : -1;
      for (var m = 0; m < 3; m++) { var o = c * (0.26 + m * 0.24), ax = x + o - s * c * 0.14, ay = y + c * 0.15, bx = x + o + s * c * 0.14, by = y + c * 0.85;
        seg(g, P, ax, ay, bx, by); } }
    out(g, P, col); }
  /* trama em cesto: blocos alternados de 3 riscos verticais e 3 horizontais */
  function basket(g, P, col, c) { white(g, P, col); var b = grid(P, c); g.style({ stroke: col, lw: 0.08 });
    for (var i = 0, x = b[0]; x < b[2]; i++, x += c) for (var j = 0, y = b[1]; y < b[3]; j++, y += c) for (var k = 1; k <= 3; k++) {
      var f = k / 4, ax, ay, bx, by; if ((i + j) % 2) { ax = x + c * f; bx = ax; ay = y + c * 0.12; by = y + c * 0.88; } else { ay = y + c * f; by = ay; ax = x + c * 0.12; bx = x + c * 0.88; }
      seg(g, P, ax, ay, bx, by); }
    out(g, P, col); }
  function lines(g, x0, x1, y, h, n, col) { g.style({ stroke: col, lw: 0.13 }); for (var i = 0; i < n; i++) { var yy = y - h + 2 * h * i / (n - 1); g.line(x0, yy, x1, yy); } }
  /* sanfona: 3 dentes em V em cima e embaixo; lado 'r' reto, 'z' ondulado com 2 pontas para fora */
  function sanf(x0, x1, y, h, a, left, right) { var n = 3, w = (x1 - x0) / n, T = [], B = [], i;
    for (i = 0; i <= 2 * n; i++) { var x = x0 + w * i / 2, e = i === 0 || i === 2 * n ? 0.5 : 1, up = i % 2 ? 0 : a * e; T.push([x, y - h + up]); B.push([x, y + h - up]); }
    var Z = [[-0.62, 0], [-0.3, 0.75], [0.05, 0], [0.38, 0.8]], P = T.slice();
    if (right === 'z') Z.forEach(function (z) { P.push([x1 + a * 0.15 - z[1] * a, y + z[0] * h]); });
    P = P.concat(B.reverse());
    if (left === 'z') Z.slice().reverse().forEach(function (z) { P.push([x0 - a * 0.15 + z[1] * a, y + z[0] * h]); });
    return P; }
  R.cord.size = [130, 150];
  R.cord.draw = function (c) {
    var g = c.g, col = c.col, u = 0.2 * c.k, X = c.X, Y = c.Y, cb = 10 * u, ct = 9 * u, st = 2 * u;
    function px(v) { return X + (v + OX) * u; } function py(v) { return Y + v * u; }
    function poly(y, A) { return A.map(function (p) { return [px(p[0]), y + p[1] * u]; }); }
    /* ETAPA 1 */
    var y1 = py(115), hb = 16.5 * u, hs = 19.6 * u;
    dark(g, L.rect(px(0), y1, 30 * u, 2 * hb), col, st); lines(g, px(30), px(180), y1, hb, 5, col);
    white(g, L.rect(px(180), y1, 240 * u, 2 * hs), col); g.style({ stroke: col, lw: 0.08 }); g.line(px(180), y1 - hs + 1.8 * u, px(420), y1 - hs + 1.8 * u);
    lines(g, px(420), px(452), y1, 13 * u, 5, col); dark(g, sanf(px(452), px(543), y1, 37.8 * u, 13 * u, 'r', 'z'), col, st);
    var yd = py(14); c.dim(px(0), px(30), yd, y1 - hb, y1 - hb, 'd1', 't1'); c.dim(px(30), px(180), yd, y1 - hb, y1 - hs, 'd2', 't2'); c.dim(px(180), px(420), yd, y1 - hs, y1 - hs, 'd3', 't3', '');
    c.ball('esp', px(257), py(212), px(299), y1 + hs);
    /* ETAPA 2 */
    var y2 = py(322); dark(g, sanf(px(0), px(102), y2, 37 * u, 13 * u, 'z', 'r'), col, st); lines(g, px(102), px(130), y2, 18 * u, 6, col);
    white(g, L.rect(px(130), y2, 13 * u, 50 * u), col); dark(g, L.rect(px(143), y2, 30 * u, 62 * u), col, st);
    braid(g, poly(y2, [[173, -28.6], [359, -28.6], [372, -21], [503, -21], [514, 21], [372, 21], [359, 28.6], [173, 28.6]]), col, ct);
    c.ball('adp', px(-34), py(425), px(8), y2 + 30 * u, -1); c.ball('barb', px(237), py(416), px(152), y2 + 31 * u); c.ball('cord', px(546), py(420), px(498), y2 + 21 * u, 1);
    /* ETAPA 3 */
    var y3 = py(513), hl = 27, hv = 32, ha = 31, hr = 38.5;
    basket(g, poly(y3, [[10, -hl], [95, -hl], [95, hl], [0, hl], [3, -hl + 9], [6, -hl + 3]]), col, cb);
    var S = [[95, -hl], [104, -hl - 2], [112, -hv], [147, -hv], [160, -hv], [170, -hv - 2], [181, -hv - 4], [204, -hv - 3], [212, -hv + 1], [225, -hv], [236, -hv], [243, -hv + 1], [250, -ha]];
    basket(g, poly(y3, S.concat(S.slice().reverse().map(function (p) { return [p[0], -p[1]]; }))), col, cb); /* cordoalha vista através da luva */
    basket(g, poly(y3, [[250, -ha], [300, -ha], [300, ha], [250, ha]]), col, cb);
    [[148, 160], [181, 204], [225, 236]].forEach(function (r) { white(g, L.rrect(px(r[0]), y3, (r[1] - r[0]) * u, 2 * hr * u, 2 * u), col); });
    dark(g, L.rect(px(300), y3, 30 * u, 66 * u), col, st); braid(g, poly(y3, [[330, -23.5], [411, -23.5], [404, 23.5], [330, 23.5]]), col, ct);
    c.ball('ss', px(294), py(636), px(233), y3 + hr * u, 2); c.ext(px(560), py(600));
  };
  if (!L.rrect) L.rrect = function (x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); var P = [], C = [[x + w - r, y - h / 2 + r, -90], [x + w - r, y + h / 2 - r, 0], [x + r, y + h / 2 - r, 90], [x + r, y - h / 2 + r, 180]];
    C.forEach(function (q) { for (var i = 0; i <= 4; i++) { var a = (q[2] + i * 22.5) * Math.PI / 180; P.push([q[0] + Math.cos(a) * r, q[1] + Math.sin(a) * r]); } }); return P; };
})(typeof window !== 'undefined' ? window : globalThis);
