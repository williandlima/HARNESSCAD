/* HarnessCAD - D-Sub p/ cabo (Amphenol): geometria dos leiautes mistos/potência e VISTA FRONTAL no padrão das
   figuras técnicas do datasheet ("Layouts — male insulator front view"): carcaça em D com cantos arredondados,
   contatos padrão como pontos cheios, contatos coaxiais/potência (A1..) como círculos grandes, numeração acima da
   1ª fileira e abaixo das demais; flange com cantos arredondados e furos Ø3,10. Face de soquetes = espelho. */
(function (G) {
  'use strict';
  var HX = G.HX, T10 = Math.tan(10 * Math.PI / 180), geo0 = HX.dsubGeom;
  HX.isDsub = function (c) { return !!c && /^(M24308|DSUB|DSUBC|DSUBW|M83513)$/.test((HX.CAT.conns[c.part] || {}).fam); };
  HX.dsubGeom = function (c) {
    var d = HX.CAT.conns[c.part] || {};
    if (!d.lay || !HX.dsubLayPts) return geo0(c);
    var std = Object.keys(HX.CAT.conns).filter(function (k) { var e = HX.CAT.conns[k]; return e.fam === 'DSUBC' && e.n === d.stdN; })[0];
    var D = geo0({ part: std, pins: new Array(d.stdN) });
    D.pts = HX.dsubLayPts(d.lay); D.mixed = true; D.lay = d.lay; return D;
  };
  function arc(P, cx, cy, r, a0, a1) { for (var i = 0; i <= 6; i++) { var a = (a0 + (a1 - a0) * i / 6) * Math.PI / 180; P.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } }
  HX.dsubRoundRect = function (x0, y0, w, h, r) { var P = []; arc(P, x0 + w - r, y0 + r, r, -90, 0); arc(P, x0 + w - r, y0 + h - r, r, 0, 90); arc(P, x0 + r, y0 + h - r, r, 90, 180); arc(P, x0 + r, y0 + r, r, 180, 270); return P; };
  // contorno em D (topo t, base b, meia-altura h) com cantos arredondados r — cantos superiores e inferiores
  HX.dsubDPath = function (x, y, t, b, h, r) {
    var a = Math.atan2(t - b, 2 * h) * 180 / Math.PI, P = [];
    arc(P, x + t - r, y - h + r, r, -90, -a); arc(P, x + b - r * 0.9, y + h - r, r, -a, 90); arc(P, x - b + r * 0.9, y + h - r, r, 90, 180 + a); arc(P, x - t + r, y - h + r, r, 180 + a, 270);
    return P;
  };
  HX.physDsubFace = function (g, c, x, y, k, col) {
    var D = HX.dsubGeom(c), soc = c.gender === 'S', m = soc ? -1 : 1, A = D.A * k, H = D.H * k;
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.poly(HX.dsubRoundRect(x - A / 2, y - H / 2, A, H, 1.0 * k), true);
    [-1, 1].forEach(function (s) { g.circle(x + s * D.B * k / 2, y, (D.micro ? 1.1 : 1.55) * k); });
    var t = D.top * k / 2, b = D.bot * k / 2, h = D.hh * k / 2;
    g.style({ lw: 0.3 }); g.poly(HX.dsubDPath(x, y, t, b, h, 1.1 * k), true);
    g.style({ lw: 0.12 }); g.poly(HX.dsubDPath(x, y, t - 0.55 * k, b - 0.5 * k, h - 0.55 * k, 0.8 * k), true);
    var pr = (D.micro ? 0.32 : 0.55) * k, br = 2.05 * k, fs = Math.max(0.9, Math.min(1.5, D.px * k * 0.42));
    var ys = D.pts.filter(function (q) { return !q.big; }).map(function (q) { return q.y; }), yTop = Math.min.apply(0, ys.length ? ys : [0]);
    D.pts.forEach(function (q) {
      var px = x + m * q.x * k, py = y + q.y * k, r = q.big ? br : pr;
      g.style({ stroke: col, fill: soc ? '#fff' : col, lw: 0.15 }); g.circle(px, py, r);
      if (soc && q.big) { g.style({ fill: null }); g.circle(px, py, r * 0.55); }
      if (D.pts.length > 50) return;
      if (q.big) g.text(q.n, px - m * r * 0.75, py - r - fs * 0.25, { size: fs, align: 'c', color: col });
      else if (Math.abs(q.y - yTop) < 0.01) g.text(q.n, px, py - pr - fs * 0.45, { size: fs, align: 'c', color: col });
      else g.text(q.n, px, py + pr + fs * 1.0, { size: fs, align: 'c', color: col });
    });
    g.style({ fill: null });
    return { x0: x - A / 2, y0: y - H / 2, x1: x + A / 2, y1: y + H / 2, geom: D };
  };
})(typeof window !== 'undefined' ? window : globalThis);
