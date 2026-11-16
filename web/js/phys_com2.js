/* HarnessCAD - VISTA FRONTAL NUMERADA dos conectores comerciais: retangular = grade de cavidades com o nº de cada
   contato e a trava; circular = contatos no círculo (+ centro), macho cheio / fêmea vazado. Medidas típicas. */
(function (G) {
  'use strict';
  var HX = G.HX;
  // vista frontal numerada (retangular: grade de cavidades; circular: contatos no círculo + centro)
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, kk) {
    var O = HX.comShape(c); if (!O || HX.isDsub(c) || (imgOK && HX.faceImgFor && HX.faceImgFor(c.part, c.gender))) return lf.apply(this, arguments);
    var n = O.n, i, fs;
    if (O.cls === 'rect' || O.cls === 'screw' || O.cls === 'sealed' || O.cls === 'hood' || O.cls === 'plug') {
      var rows = O.rows || (n >= 4 && O.cls !== 'plug' ? 2 : 1), cols = Math.ceil(n / rows), cw = Math.min(w / (cols + 0.6), 4), W = cw * (cols + 0.6), H = cw * (rows + 0.6);
      g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.rect(x - W / 2, y - H / 2, W, H); g.rect(x - cw * 0.6, y - H / 2 - cw * 0.35, cw * 1.2, cw * 0.35); g.style({ fill: null });
      fs = Math.min(1.5, cw * 0.42);
      for (i = 0; i < n; i++) { var rw = Math.floor(i / cols), cl = i % cols, px = x - W / 2 + cw * (cl + 0.8), py = y - H / 2 + cw * (rw + 0.8);
        g.style({ stroke: col, lw: 0.12 }); g.rect(px - cw * 0.32, py - cw * 0.32, cw * 0.64, cw * 0.64); g.text(String((c.pins[i] || {}).n || i + 1), px, py, { size: fs, align: 'c', color: col }); }
      return { x0: x - W / 2, y0: y - H / 2 - cw * 0.35, x1: x + W / 2, y1: y + H / 2 };
    }
    var rr = w / 2, ring = n > 4 ? n - 1 : n; g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.circle(x, y, rr); g.style({ fill: null }); g.rect(x - rr * 0.1, y - rr, rr * 0.2, rr * 0.18);
    fs = Math.min(1.5, rr * 0.22);
    for (i = 0; i < n; i++) { var a = -Math.PI / 2 + (i < ring ? i / ring * 2 * Math.PI : 0) + Math.PI / ring, cr = i < ring ? rr * 0.58 : 0, px2 = x + Math.cos(a) * cr, py2 = y + Math.sin(a) * cr;
      g.style({ stroke: col, lw: 0.12, fill: c.gender === 'P' ? col : null }); g.circle(px2, py2, rr * 0.11); g.style({ fill: null }); g.text(String((c.pins[i] || {}).n || i + 1), px2 + rr * 0.2, py2 - rr * 0.16, { size: fs, align: 'l', color: col }); }
    return { x0: x - rr, y0: y - rr, x1: x + rr, y1: y + rr };
  };
})(typeof window !== 'undefined' ? window : globalThis);
