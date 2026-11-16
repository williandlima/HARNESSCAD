/* HarnessCAD - geometria: snap, layout de conectores, hit-test */
(function (G) {
  'use strict';
  var HX = G.HX;

  HX.snap = function (v, g) { return g > 0 ? Math.round(v / g) * g : v; };
  HX.r3 = function (v) { return Math.round(v * 1000) / 1000; };
  // "Mesmo ponto" = mesma chave (resolução 0,001 mm). Edição e netlist usam a MESMA regra.
  HX.key = function (x, y) { return Math.round(x * 1000) + ':' + Math.round(y * 1000); };
  HX.same = function (a, b) { return Math.round(a[0] * 1000) === Math.round(b[0] * 1000) && Math.round(a[1] * 1000) === Math.round(b[1] * 1000); };

  HX.distSeg = function (p, a, b) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy, t = 0;
    if (L > 0) t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L));
    var x = a[0] + t * dx, y = a[1] + t * dy;
    return Math.hypot(p[0] - x, p[1] - y);
  };
  // ponto no interior do segmento (não nas pontas)
  HX.onSegInterior = function (p, a, b, tol) {
    tol = tol || 0.01;
    if (HX.same(p, a) || HX.same(p, b)) return false;
    return HX.distSeg(p, a, b) < tol;
  };
  HX.ptInRect = function (p, r) { return p[0] >= r.x0 && p[0] <= r.x1 && p[1] >= r.y0 && p[1] <= r.y1; };
  HX.normRect = function (a, b) {
    return { x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]) };
  };
  HX.rectsOverlap = function (a, b) { return a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0; };
  HX.rectInside = function (a, b) { return a.x0 >= b.x0 && a.x1 <= b.x1 && a.y0 >= b.y0 && a.y1 <= b.y1; };
  function segSeg(p1, p2, p3, p4) {
    function o(a, b, c) { var v = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]); return v > 1e-9 ? 1 : v < -1e-9 ? 2 : 0; }
    var o1 = o(p1, p2, p3), o2 = o(p1, p2, p4), o3 = o(p3, p4, p1), o4 = o(p3, p4, p2);
    return o1 !== o2 && o3 !== o4;
  }
  HX.segRect = function (a, b, r) {
    if (HX.ptInRect(a, r) || HX.ptInRect(b, r)) return true;
    var c = [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]];
    for (var i = 0; i < 4; i++) if (segSeg(a, b, c[i], c[(i + 1) % 4])) return true;
    return false;
  };

  // ---------- Layout de conector ----------
  // Retorna geometria local + transformação para coordenadas do desenho.
  HX.connLayout = function (c, unit) {
    var u = unit || 2.5, p = 2 * u, H = 4 * u, stub = (c.stubU || 2) * u, w = (c.wu || 14) * u;
    var rot = c.rot || 0, mx = !!c.mx, my = !!c.my;
    if (rot >= 180) { rot -= 180; mx = !mx; my = !my; }
    var side = c.side || 'R';
    if ((side === 'R' || side === 'L') && mx) side = side === 'R' ? 'L' : 'R';
    var hid = new Set(c.hidden || []);
    var rows = (c.pins || []).filter(function (q) { return !hid.has(q.n); });
    if (my) rows = rows.slice().reverse();
    // 'M' = misto: cada pino diz seu lado (q.s = 'L' ou 'R'), como entrada/saída de um equipamento
    var lr = side === 'M' ? [rows.filter(function (q) { return (q.s === 'L') !== mx; }), rows.filter(function (q) { return (q.s === 'L') === mx; })] : null;
    var nrows = lr ? Math.max(lr[0].length, lr[1].length) : rows.length;
    var h = H + Math.max(nrows, c.minRows || 1, 1) * p;
    var a, b, cc, d;
    if (rot === 90) { a = 0; b = -1; cc = 1; d = 0; } else { a = 1; b = 0; cc = 0; d = 1; }
    var X = c.x, Y = c.y;
    function xf(lx, ly) { return [HX.r3(a * lx + cc * ly + X), HX.r3(b * lx + d * ly + Y)]; }
    var pins = [];
    if (lr) [['L', -stub], ['R', w + stub]].forEach(function (sd, k) {
      lr[k].forEach(function (q, i) { var ly = H + (i + 0.5) * p; pins.push({ n: q.n, name: q.name, pin: q, side: sd[0], lx: sd[1], ly: ly, pt: xf(sd[1], ly), row: i }); });
    });
    else rows.forEach(function (q, i) {
      var ly = H + (i + 0.5) * p;
      if (side === 'R' || side === 'B') pins.push({ n: q.n, name: q.name, pin: q, side: 'R', lx: w + stub, ly: ly, pt: xf(w + stub, ly), row: i });
      if (side === 'L' || side === 'B') pins.push({ n: q.n, name: q.name, pin: q, side: 'L', lx: -stub, ly: ly, pt: xf(-stub, ly), row: i });
    });
    var hasL = pins.some(function (q) { return q.side === 'L'; }), hasR = pins.some(function (q) { return q.side === 'R'; });
    var c1 = xf(-(hasL ? stub : 0), 0), c2 = xf(w + (hasR ? stub : 0), h);
    var R = {
      u: u, p: p, H: H, w: w, h: h, stub: stub, side: side, rows: rows, pins: pins,
      m: [a, b, cc, d, X, Y], xf: xf,
      bbox: HX.normRect(c1, c2)
    };
    if (c.eq && HX.eqPins && !HX._eqOff) HX.eqPins(c, R, mx, my); // equipamento: pinos nos conectores da figura
    return R;
  };

  HX.textW = function (s, size) { return HX.pdfTextWidth ? HX.pdfTextWidth(String(s), size) : String(s).length * size * 0.6; };

  // Caixa envolvente de qualquer item
  HX.bbox = function (it, unit) {
    switch (it.type) {
      case 'conn': return HX.connLayout(it, unit).bbox;
      case 'wire': {
        var xs = it.pts.map(function (p) { return p[0]; }), ys = it.pts.map(function (p) { return p[1]; });
        return { x0: Math.min.apply(0, xs), y0: Math.min.apply(0, ys), x1: Math.max.apply(0, xs), y1: Math.max.apply(0, ys) };
      }
      case 'splice': return { x0: it.x - 2, y0: it.y - 2, x1: it.x + 2, y1: it.y + 2 };
      case 'label': {
        var tw = HX.textW(it.text, 2) + 4, vert = (it.rot || 0) % 180 !== 0;
        var dir = (it.rot || 0) >= 180 ? -1 : 1;
        if (it.style === 'gnd' || it.style === 'chassis') return { x0: it.x - 3, y0: it.y - 1, x1: it.x + 3, y1: it.y + 6 };
        if (!vert) return HX.normRect([it.x, it.y - 1.8], [it.x + dir * tw, it.y + 1.8]);
        return HX.normRect([it.x - 1.8, it.y], [it.x + 1.8, it.y - dir * tw]);
      }
      case 'text': {
        var s = it.size || 2.5, lines = String(it.text).split('\n');
        var W = Math.max.apply(0, lines.map(function (l) { return HX.textW(l, s); }));
        var Hh = lines.length * s * 1.3;
        return (it.rot || 0) % 180 ? { x0: it.x - s, y0: it.y - W, x1: it.x - s + Hh, y1: it.y }
          : { x0: it.x, y0: it.y - s, x1: it.x + W, y1: it.y - s + Hh };
      }
      case 'shape': if (it.kind === 'circle') {
        var r = Math.hypot(it.x2 - it.x, it.y2 - it.y); return { x0: it.x - r, y0: it.y - r, x1: it.x + r, y1: it.y + r };
      } return HX.normRect([it.x, it.y], [it.x2, it.y2]);
      case 'cable': return { x0: it.x, y0: it.y, x1: it.x + it.w, y1: it.y + it.h };
      case 'face': return HX.faceBBox(it);
      case 'dim': return HX.dimBBox(it);
      case 'brk': return { x0: it.x - 1.5, y0: it.y - 1.5, x1: it.x + 1.5, y1: it.y + 1.5 };
    }
    if (HX.ITEM_EXT && HX.ITEM_EXT[it.type]) return HX.ITEM_EXT[it.type].bbox(it, unit);
    return { x0: 0, y0: 0, x1: 0, y1: 0 };
  };

  // Distância de um ponto a um item (para hit-test)
  HX.hitDist = function (it, pt, unit) {
    var X = HX.ITEM_EXT && HX.ITEM_EXT[it.type]; if (X && X.hit) return X.hit(it, pt);
    if (it.type === 'wire') {
      var m = 1e9; for (var i = 1; i < it.pts.length; i++) m = Math.min(m, HX.distSeg(pt, it.pts[i - 1], it.pts[i]));
      return m;
    }
    if (it.type === 'splice' || it.type === 'brk') return Math.hypot(pt[0] - it.x, pt[1] - it.y) - 1;
    if (it.type === 'dim') return HX.dimDist(it, pt);
    if (it.type === 'shape' && it.kind === 'line') return HX.distSeg(pt, [it.x, it.y], [it.x2, it.y2]);
    if (it.type === 'cable') { // borda da elipse/retângulo
      var b = HX.bbox(it), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2;
      var rx = it.w / 2, ry = it.h / 2, e = Math.hypot((pt[0] - cx) / rx, (pt[1] - cy) / ry);
      return Math.abs(e - 1) * Math.min(rx, ry);
    }
    var bb = HX.bbox(it, unit);
    var dx = Math.max(bb.x0 - pt[0], 0, pt[0] - bb.x1), dy = Math.max(bb.y0 - pt[1], 0, pt[1] - bb.y1);
    return Math.hypot(dx, dy);
  };

  // Pontos de conexão de um item (para netlist e snap)
  HX.connPoints = function (it, unit) {
    switch (it.type) {
      case 'conn': return HX.connLayout(it, unit).pins.map(function (p) { return p.pt; });
      case 'wire': return [it.pts[0], it.pts[it.pts.length - 1]];
      case 'splice': case 'label': return [[it.x, it.y]];
    }
    return [];
  };

  HX.wireLength = function (w) {
    var L = 0; for (var i = 1; i < w.pts.length; i++) L += Math.hypot(w.pts[i][0] - w.pts[i - 1][0], w.pts[i][1] - w.pts[i - 1][1]);
    return L;
  };
  // remove pontos colineares/duplicados
  HX.cleanPts = function (pts) {
    var o = [];
    pts.forEach(function (p) { if (!o.length || !HX.same(o[o.length - 1], p)) o.push([HX.r3(p[0]), HX.r3(p[1])]); });
    for (var i = o.length - 2; i > 0; i--) {
      var a = o[i - 1], b = o[i], c = o[i + 1];
      if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) < 1e-6) o.splice(i, 1);
    }
    return o;
  };
})(typeof window !== 'undefined' ? window : globalThis);
