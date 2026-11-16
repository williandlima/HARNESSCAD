/* HarnessCAD - PLUGUE CIRCULAR no padrão do catálogo Amphenol/Glenair (D38999/26, MS plug): nariz da carcaça com
   degraus, porca de acoplamento grande de cantos arredondados com recartilhado em 4 quadrantes (faixa lisa horizontal
   no meio e faixa lisa vertical), anel de degrau, rosca traseira de acessório com perfil em dente e filetes
   inclinados e dentes de catraca (anti-desacoplamento) na face traseira. Linha de centro traço-ponto. */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC; if (!V || !HX.vaBody) return;
  function S() { return HX.physVecST() || { col: '#222', metal: '#cfd3d8', line: false }; }
  function st(g, lw, f) { g.style({ stroke: S().col, lw: lw, fill: f === undefined ? null : f, dash: null }); }
  function ln(g, a, b, c, d, lw) { st(g, lw || 0.07); g.line(a, b, c, d); }
  function M(f) { var s = S(); return s.line ? '#fff' : (f || s.metal); }
  // porca de acoplamento com recartilhado em quadrantes
  HX.vaCoupling = function (g, x0, x1, c, r) {
    var w = x1 - x0; HX.vaBody(g, x0, x1, c, r, M(), Math.min(r * 0.09, w * 0.08));
    var m = w * 0.05, ya = r * 0.94, yb = r * 0.24, sx0 = x0 + w * 0.38, sx1 = x0 + w * 0.52, n = Math.max(10, Math.round(w / Math.max(0.28, r * 0.045)));
    ln(g, x0 + m, c - r * 0.97, x0 + m, c + r * 0.97, 0.1); ln(g, x1 - m, c - r * 0.97, x1 - m, c + r * 0.97, 0.1);
    ln(g, x0 + m, c - yb, x1 - m, c - yb, 0.1); ln(g, x0 + m, c + yb, x1 - m, c + yb, 0.1); // faixa lisa horizontal
    for (var i = 1; i < n; i++) { var x = x0 + m + (w - 2 * m) * i / n; if (x > sx0 && x < sx1) continue;
      ln(g, x, c - ya, x, c - yb, 0.055); ln(g, x, c + yb, x, c + ya, 0.055); }
    [-1, 1].forEach(function (sg) { var ya2 = c + sg * ya * 0.97, yb2 = c + sg * yb, h = (sx1 - sx0) / 2, P = [], k; // faixa lisa vertical (fresada, pontas arredondadas)
      for (k = 0; k <= 8; k++) { var a = Math.PI + k / 8 * Math.PI; P.push([sx0 + h + h * Math.cos(a), Math.min(ya2, yb2) + h - h * Math.sin(a) * -1 * 0 + h * Math.sin(a)]); }
      for (k = 0; k <= 8; k++) { var b = k / 8 * Math.PI; P.push([sx0 + h + h * Math.cos(b), Math.max(ya2, yb2) - h + h * Math.sin(b)]); }
      st(g, 0.1, M()); g.poly(P, true); g.style({ fill: null }); });
    if (!S().line) { g.style({ stroke: '#ffffff', lw: Math.max(0.12, r * 0.06), dash: null }); g.line(x0 + m, c - r * 0.6, x1 - m, c - r * 0.6); }
  };
  // dentes de catraca na face traseira da rosca
  HX.vaRatchet = function (g, x, c, r, d) {
    var n = Math.max(6, Math.round(r / Math.max(0.35, r * 0.09))), P = [[x - d * 0.2, c - r]];
    for (var i = 0; i < n; i++) { var y = c - r + 2 * r * (i + 0.5) / n; P.push([x + d, y]); P.push([x, c - r + 2 * r * (i + 1) / n]); }
    st(g, 0.18, M()); g.poly(P.concat([[x - d * 0.2, c + r]]), true); g.style({ fill: null });
  };
  function nose(g, x0, x1, c, r) { HX.vaBody(g, x0, x1, c, r, M(), r * 0.05); ln(g, x0 + (x1 - x0) * 0.35, c - r, x0 + (x1 - x0) * 0.35, c + r, 0.1); ln(g, x0 + (x1 - x0) * 0.7, c - r * 0.98, x0 + (x1 - x0) * 0.7, c + r * 0.98, 0.1); }
  function rear(g, x0, x1, c, r) { HX.vaThread(g, x0, x1, c, r); HX.vaRatchet(g, x1, c, r * 0.86, Math.max(0.3, (x1 - x0) * 0.05)); }
  V.d38_26 = function (g, x, y, W, H) { var c = y + H / 2; HX.vaAxis(g, x - 1, x + W + 1, c);
    nose(g, x, x + W * 0.07, c, H * 0.4); HX.vaCoupling(g, x + W * 0.06, x + W * 0.6, c, H * 0.5);
    HX.vaBody(g, x + W * 0.6, x + W * 0.64, c, H * 0.43, M(), H * 0.02); rear(g, x + W * 0.64, x + W * 0.95, c, H * 0.4); };
  V.ms_p = function (g, x, y, W, H) { var c = y + H / 2; HX.vaAxis(g, x - 1, x + W + 1, c);
    nose(g, x, x + W * 0.06, c, H * 0.38); HX.vaCoupling(g, x + W * 0.05, x + W * 0.48, c, H * 0.5);
    HX.vaBody(g, x + W * 0.48, x + W * 0.8, c, H * 0.4, M(), H * 0.05); HX.vaRing(g, x + W * 0.53, x + W * 0.55, c, H * 0.41); rear(g, x + W * 0.8, x + W * 0.96, c, H * 0.33); };
})(typeof window !== 'undefined' ? window : globalThis);
