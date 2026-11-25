/* HarnessCAD - ORDEM DOS PINOS NO ESQUEMA (para evitar cruzamento de vias): o pino troca de lugar com o vizinho e os fios
   ligados acompanham (ponta movida mantendo os trechos ortogonais, ops.moveEnd). Só muda o DESENHO: número, nome e ligação
   elétrica do pino continuam os mesmos. HX.pinMove(doc, c, n, dx, dy) move na direção da seta da tela (funciona com o
   conector girado/espelhado); HX.pinOrderReset volta à ordem do catálogo; HX.pinAt acha o pino sob o cursor. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  function key(q) { return q.n + '|' + q.side; }
  /* aplica uma nova ordem e leva as pontas dos fios de cada pino à nova posição */
  HX.pinRelayout = function (doc, c, pins) {
    var u = doc.p.unit, sh = doc.cur(), L0 = HX.connLayout(c, u).pins, old = {}, ends = [];
    L0.forEach(function (q) { old[HX.key(q.pt[0], q.pt[1])] = key(q); });
    sh.items.forEach(function (w) { if (w.type !== 'wire' || w.pts.length < 2) return;
      [0, 1].forEach(function (e) { var p = e ? w.pts[w.pts.length - 1] : w.pts[0], k = old[HX.key(p[0], p[1])]; if (k) ends.push({ w: w, e: e, k: k }); }); });
    c.pins = pins; var nw = {}; HX.connLayout(c, u).pins.forEach(function (q) { nw[key(q)] = q.pt; });
    var moved = [], g = Math.max(u, (doc.p.grid && doc.p.grid.size) || u); ends.forEach(function (x) { var np = nw[x.k], p = x.e ? x.w.pts[x.w.pts.length - 1] : x.w.pts[0];
      if (np && !HX.same(p, np)) { ops.moveEnd(x.w, x.e, np, g); if (moved.indexOf(x.w) < 0) moved.push(x.w); } });
    /* fio movido se refaz limpo: reto (pinos alinhados) ou um só degrau — só se o caminho estiver livre (sem encostar em outro fio) */
    if (HX.wtRouter) moved.forEach(function (w) { var s = w.pts[0], t = w.pts[w.pts.length - 1], R = HX.wtRouter({ items: sh.items.filter(function (i) { return i !== w; }) }, g), xm = HX.snap((s[0] + t[0]) / 2, g);
      [[s, t], [s, [xm, s[1]], [xm, t[1]], t]].some(function (P) { P = HX.cleanPts(P); var orto = P.every(function (q, i) { return !i || Math.abs(q[0] - P[i - 1][0]) < 1e-6 || Math.abs(q[1] - P[i - 1][1]) < 1e-6; });
        if (orto && P.length < w.pts.length && R.ok(P)) { w.pts = P; return true; } }); });
    if (ops.normalizeJunctions) ops.normalizeJunctions(doc);
    return moved.length;
  };
  /* troca o pino n com o vizinho que o leva na direção (dx, dy) da tela; devolve true se mudou */
  HX.pinMove = function (doc, c, n, dx, dy) {
    if (!c || c.eq) return false; var u = doc.p.unit, L = HX.connLayout(c, u), me = L.pins.filter(function (q) { return String(q.n) === String(n); })[0]; if (!me) return false;
    var hid = new Set(c.hidden || []), vis = c.pins.filter(function (q) { return !hid.has(q.n); }), i = vis.indexOf(me.pin), best = null;
    [i - 1, i + 1].forEach(function (j) { if (j < 0 || j >= vis.length) return; var P = c.pins.slice(), a = P.indexOf(vis[i]), b = P.indexOf(vis[j]); P[a] = vis[j]; P[b] = vis[i];
      var cc = Object.create(c); cc.pins = P; var t = HX.connLayout(cc, u).pins.filter(function (q) { return q.pin === me.pin && q.side === me.side; })[0];
      if (t && (t.pt[0] - me.pt[0]) * dx + (t.pt[1] - me.pt[1]) * dy > 1e-6) best = P; });
    if (!best) return false; HX.pinRelayout(doc, c, best); return true;
  };
  /* ordem do catálogo (ou a original de quando o conector foi colocado) */
  HX.pinOrderReset = function (doc, c) { var d = HX.getConnDef && HX.getConnDef(c.part, doc.p); if (!d) return false;
    var ix = {}; d.pins.forEach(function (q, i) { ix[q.n] = i; }); var P = c.pins.slice().sort(function (a, b) { var x = ix[a.n0 != null ? a.n0 : a.n], y = ix[b.n0 != null ? b.n0 : b.n]; return (x == null ? 1e9 : x) - (y == null ? 1e9 : y); });
    if (P.every(function (q, i) { return q === c.pins[i]; })) return false; HX.pinRelayout(doc, c, P); return true; };
  HX.pinOrderChanged = function (doc, c) { var d = HX.getConnDef && HX.getConnDef(c.part, doc.p); if (!d) return false; var ix = {}; d.pins.forEach(function (q, i) { ix[q.n] = i; });
    var last = -1; return c.pins.some(function (q) { var x = ix[q.n0 != null ? q.n0 : q.n]; if (x == null) return false; if (x < last) return true; last = x; return false; }); };
  /* pino sob o ponto (perna do pino ou a área do número junto ao corpo) */
  HX.pinAt = function (doc, pt, tol) { var u = doc.p.unit, r = null, bd = 1e9;
    doc.items().forEach(function (c) { if (c.type !== 'conn' || c.eq) return; var L = HX.connLayout(c, u); L.pins.forEach(function (q) {
      var ein = q.side === 'R' ? L.w - 4 * u : 4 * u, a = L.xf(ein, q.ly), d = HX.distSeg(pt, a, q.pt); if (d < Math.min(tol, L.p / 2) && d < bd) { bd = d; r = { c: c, n: q.n, side: q.side, q: q }; } }); });
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
