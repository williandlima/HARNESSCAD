/* HarnessCAD - desenho físico: ACESSÓRIOS COM FORMA REAL no ramo (substitui os símbolos de phys_acc.js).
   Abraçadeira de nylon (fita em volta do feixe + cabeça com trava + rabicho cortado), P-clip com almofada de borracha
   (laço + aba + furo de fixação com linhas de centro), fita em espiral meia sobreposição, ilhós de borracha no painel
   (perfil em H + painel hachurado), luva marcadora com pontas arredondadas, folga de serviço e laço de gotejamento
   desenhados com a largura do feixe. Linha (preto e branco) ou cor (nylon preto, metal, borracha). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  function S(g, st, lw, fill, dash) { g.style({ stroke: st, lw: lw, fill: fill || null, dash: dash || null }); }
  function hatch(g, x0, y0, x1, y1, col) { S(g, col, 0.08); for (var x = x0; x < x1; x += 0.8) g.line(x, y1, Math.min(x + (y1 - y0), x1), y1 - Math.min(y1 - y0, x1 - x)); }
  var SH = {
    tie: function (g, w, col, K) { var P = [], Q = [], k; for (k = 0; k <= 8; k++) { var t = -w + 2 * w * k / 8, b = 0.25 * (1 - Math.pow(t / w, 2)); P.push([-0.35 - b, t]); Q.push([0.35 + b, t]); }
      S(g, col, 0.18, K.ny); g.poly(P.concat(Q.reverse()), true); S(g, col, 0.2, K.ny); g.rect(-0.95, w - 0.2, 1.9, 1.5); S(g, col, 0.12, '#fff'); g.rect(-0.45, w + 0.25, 0.9, 0.6); S(g, col, 0.25); g.line(0.95, w + 1.1, 2.2, w + 1.1); },
    pclip: function (g, w, col, K) { var r = w + 0.35; S(g, K.rub === '#fff' ? col : K.rub, 0.55); g.circle(0, 0, w + 0.12); S(g, col, 0.2); g.circle(0, 0, r);
      S(g, col, 0.25, K.met); g.poly([[-1.2, -r + 0.2], [-1.2, -r - 3.6], [1.2, -r - 3.6], [1.2, -r + 0.2]], true); S(g, col, 0.15, '#fff'); g.circle(0, -r - 2.4, 0.6);
      S(g, col, 0.08, null, [0.6, 0.3, 0.1, 0.3]); g.line(-1.6, -r - 2.4, 1.6, -r - 2.4); g.line(0, -r - 0.8, 0, -r - 4); },
    tape: function (g, w, col, K, Lp) { S(g, col, 0.25, K.tape); g.rect(-Lp / 2, -w, Lp, 2 * w); S(g, col, 0.1); for (var x = -Lp / 2 - 2 * w; x < Lp / 2; x += 1.1) { var a = Math.max(x, -Lp / 2), b = Math.min(x + 2 * w, Lp / 2); if (b > a) g.line(a, -w + (a - x), b, -w + (b - x)); } },
    grommet: function (g, w, col, K) { var h = w + 1.6; S(g, col, 0.5); g.line(0, -h - 2.5, 0, -h + 0.3); g.line(0, h - 0.3, 0, h + 2.5); hatch(g, 0, -h - 2.5, 0.9, -h + 0.3, col); hatch(g, 0, h - 0.3, 0.9, h + 2.5, col);
      S(g, col, 0.22, K.rub); g.rect(-1.5, -h, 0.8, 2 * h); g.rect(0.7, -h, 0.8, 2 * h); g.rect(-0.7, -w - 0.6, 1.4, 2 * w + 1.2); },
    marker: function (g, w, col, K, Lp, it) { var r = Math.min(w, Lp / 2) * 0.7, P = [], k; // luva com pontas arredondadas
      for (k = 0; k <= 8; k++) { var a = -Math.PI / 2 + Math.PI * k / 8; P.push([Lp / 2 - r + Math.cos(a) * r, Math.sin(a) * w]); }
      for (k = 0; k <= 8; k++) { var b = Math.PI / 2 + Math.PI * k / 8; P.push([-Lp / 2 + r + Math.cos(b) * r, Math.sin(b) * w]); }
      S(g, col, 0.25, K.mk); g.poly(P, true); if (it.text) g.text(it.text, 0, 0, { size: Math.min(1.6, w * 1.2), align: 'c', color: col, bold: true }); },
    loop: function (g, w, col, K) { var R = 2.4 + w * 0.6; S(g, col, 0.2, K.jk); g.circle(0, -w - R + w * 0.3, R + w * 0.45); S(g, col, 0.2, K.bg); g.circle(0, -w - R + w * 0.3, R - w * 0.45); },
    drip: function (g, w, col, K) { var d = 3.2 + w, o = [[-3, -w * 0.2], [-3, d], [3, d], [3, -w * 0.2]], t = w * 0.45, P = [], Q = [];
      o.forEach(function (q, i) { var sx = i < 2 ? -1 : 1; P.push([q[0] - sx * t, q[1] + (i === 1 || i === 2 ? t : 0)]); Q.push([q[0] + sx * t, q[1] - (i === 1 || i === 2 ? t : 0)]); });
      S(g, col, 0.2, K.jk); g.poly(P.concat(Q.reverse()), true); }
  };
  HX.PACC_SHAPES = SH;
  var d0 = EXT.pacc.draw;
  EXT.pacc.draw = function (g, it, p, s, o) {
    var f = SH[it.kind]; if (!f) return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), A = HX.physAccAt(it, C.sh, C.m, C.N); if (!A) return;
    var ln = C.line, K = { ny: ln ? '#fff' : (it.color === 'nat' ? '#efe8d4' : '#1f1f1f'), rub: ln ? '#fff' : '#3a3a3a', met: ln ? '#fff' : '#c8ccd1', bg: '#fff', tape: ln ? '#fff' : '#2a2a2a', mk: ln ? '#fff' : (it.color || '#fafafa'), jk: ln ? '#fff' : '#3c3c3c' };
    if (it.color && !/^nat$/.test(it.color) && it.kind === 'tie' && !ln) K.ny = it.color;
    // desenha a forma real; o rótulo e as caixas ficam com o desenho original (forma original suprimida)
    var BU = HX.physBundleCtx(p, s, o), w = (HX.physVisW && C.m[it.seg] ? HX.physVisW(C.m[it.seg], C.sh, BU) : HX.bundleW((BU.seg[it.seg] || {}).od)) / 2 * (HX.physPinchK && C.m[it.seg] ? HX.physPinchK(C.m[it.seg], C.sh, it.kind) : 1) + 0.3, col = ln ? C.col : (o.theme && o.theme.txt) || '#222';
    var Lp = Math.max(2.5, (+it.len || (HX.PACC[it.kind] || {}).len || 20) / C.N), x = A.pt[0], y = A.pt[1], ux = A.d[0], uy = A.d[1], q = Object.create(g), depth = 0;
    q.push = function (M) { depth++; return g.push.call(g, M); }; q.pop = function () { depth--; return g.pop.call(g); };
    ['rect', 'circle', 'poly', 'line'].forEach(function (k) { q[k] = function () { if (depth > 0) return; return g[k].apply(g, arguments); }; });
    q.text = function () { if (depth > 0) return; return g.text.apply(g, arguments); };
    d0.call(this, q, it, p, s, o);
    g.push([ux, uy, -uy, ux, x, y]); f(g, w, col, K, Lp, it); g.pop();
  };
})(typeof window !== 'undefined' ? window : globalThis);
