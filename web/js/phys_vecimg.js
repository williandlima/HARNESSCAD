/* HarnessCAD - DESENHOS DO DATASHEET VETORIZADOS: a figura do catálogo (vista lateral do plugue D38999/26, vista
   frontal 25-35) foi convertida traço a traço em linhas (ferramentas/vetorizar.py). Fica idêntica à do datasheet e
   nítida em qualquer zoom e no PDF (sem pixel), na cor da caneta. Dados em vimg_*.js (HX.VECIMG). */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC;
  function parse(e) {
    if (e._P) return e._P; var q = e.q || 4, L = [], C = [];
    e.l.forEach(function (s) { var i = s.indexOf(':'), w = +s.slice(0, i), a = s.slice(i + 1).split(','), P = [], x = 0, y = 0;
      for (var k = 0; k + 1 < a.length; k += 2) { x += +a[k]; y += +a[k + 1]; P.push([x / q, y / q]); } L.push({ w: w, P: P }); });
    (e.c || '').split(';').forEach(function (t) { if (!t) return; var a = t.split(','); C.push([a[0] / q, a[1] / q, a[2] / q]); });
    return (e._P = { L: L, C: C });
  }
  HX.vecImgHas = function (key) { var e = HX.VECIMG && HX.VECIMG[key]; return !!(e && e.l.length); };
  // desenha a figura na caixa (x, y, W, H); col = cor da caneta; fill = fundo (null = transparente)
  HX.vecImgDraw = function (g, key, x, y, W, H, col, fill) {
    var e = HX.VECIMG && HX.VECIMG[key]; if (!e) return false; var D = parse(e), sx = W / e.w, sy = H / e.h, s = Math.min(sx, sy);
    if (fill) { g.style({ stroke: null, fill: fill, dash: null }); g.rect(x, y, W, H); }
    var lw0 = Math.max(0.04, s * 0.45), lw1 = Math.max(0.09, s * 0.95);
    D.L.forEach(function (l) { g.style({ stroke: col, lw: l.w ? lw1 : lw0, fill: null, dash: null }); g.poly(l.P.map(function (p) { return [x + p[0] * sx, y + p[1] * sy]; }), false); });
    D.C.forEach(function (c) { var cx = x + c[0] * sx, cy = y + c[1] * sy, r = c[2] * s;
      g.style({ stroke: col, lw: lw0, fill: e.half ? '#fff' : col, dash: null }); g.circle(cx, cy, r);
      if (e.half) { var P = []; for (var i = 0; i <= 10; i++) { var a = Math.PI / 2 + i / 10 * Math.PI; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
        g.style({ stroke: null, fill: col }); g.poly(P, true); }
      g.style({ fill: null }); });
    return true;
  };
  // plugue D38999/26: a própria figura do catálogo (porca de acoplamento com estrias axiais, rosca e catraca)
  if (V) {
    var p0 = V.d38_26;
    V.d38_26 = function (g, x, y, W, H) {
      if (!HX.vecImgHas('d38_26')) return p0.apply(this, arguments);
      var st = HX.physVecST() || {}; HX.vecImgDraw(g, 'd38_26', x, y, W, H, st.col || '#1d1d1d', st.line ? '#fff' : null);
      if (HX.vaAxis) HX.vaAxis(g, x - 1, x + W + 1, y + H / 2);
    };
  }
  // vista frontal: figura do datasheet vetorizada, quando existe para o arranjo
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, k) {
    var key = 'face:' + (c && c.part);
    if (c && !HX.isDsub(c) && HX.vecImgHas(key)) { var e = HX.VECIMG[key], h = w * e.h / e.w;
      HX.vecImgDraw(g, key, x - w / 2, y - h / 2, w, h, col, '#fff'); return { x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2, geom: { shell: String(c.part).split(':')[1].split('-')[0] } }; }
    return lf.apply(this, arguments);
  };
})(typeof window !== 'undefined' ? window : globalThis);
