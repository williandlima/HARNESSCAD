/* HarnessCAD - esquemático: ao mover um conector, os fios presos a ele MANTÊM O ESPAÇAMENTO (não encavalam).
   Antes, cada fio reto ganhava um "degrau" no meio do caminho e todos os degraus caíam no mesmo X (fios sobrepostos).
   Agora os fios que ganham degrau no mesmo movimento são agrupados e os degraus ficam escalonados com o passo dos
   pinos, na ordem que não cruza: o fio mais perto do lado para onde o conector andou vira primeiro.
   Fios que já tinham degraus guardam os seus (o vértice vizinho acompanha), como antes. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, E = 0.006;
  function anchors(doc) { // pinos (com direção de saída), emendas e labels por chave estável
    var A = {}, unit = doc.p.unit;
    doc.items().forEach(function (it) {
      if (it.type === 'conn') {
        var L = HX.connLayout(it, unit), m = L.m;
        L.pins.forEach(function (p) { var s = p.side === 'R' ? 1 : -1, dl = p.ldir || [s, 0]; A[it.id + '/' + p.n + (it.side === 'B' ? '/' + p.side : '')] = { pt: p.pt, dir: [m[0] * dl[0] + m[2] * dl[1], m[1] * dl[0] + m[3] * dl[1]], len: p.elen || L.stub }; });
      } else if (it.type === 'splice' || it.type === 'label') A[it.id] = { pt: [it.x, it.y] };
    });
    return A;
  }
  // degraus escalonados para os fios retos que passam a precisar de um degrau
  HX.wireJogs = function (list, grid) {
    var groups = {};
    list.forEach(function (c) { var k = c.ax + ':' + c.s + ':' + c.d; (groups[k] = groups[k] || []).push(c); });
    Object.keys(groups).forEach(function (k) {
      var L = groups[k], ax = L[0].ax, q = 1 - ax, s = L[0].s, d = L[0].d; // ax: eixo do fio (0 = horizontal)
      L.sort(function (a, b) { return (a.o[q] - b.o[q]) * d; });
      var pit = Infinity; for (var i = 1; i < L.length; i++) pit = Math.min(pit, Math.abs(L[i].o[q] - L[i - 1].o[q]));
      if (!isFinite(pit) || pit < E) pit = grid || 2.5;
      var lo = -Infinity, hi = Infinity; L.forEach(function (c) { lo = Math.max(lo, Math.min(c.np[ax], c.o[ax])); hi = Math.min(hi, Math.max(c.np[ax], c.o[ax])); });
      var span = hi - lo; if (span > E && pit * (L.length + 1) > span) pit = span / (L.length + 1);
      var mid = (lo + hi) / 2; if (grid && span > pit * (L.length + 1) + grid) mid = HX.snap(mid, grid);
      L.forEach(function (c, j) { c.m = HX.r3(mid + s * (j - (L.length - 1) / 2) * pit); });
    });
  };
  ops.fixAttachments = function (doc, att) {
    var A = anchors(doc), grid = doc.p.grid.size, jog = [];
    att.forEach(function (a) {
      var an = A[a.key]; if (!an) return; var w = a.w, np = an.pt, P = w.pts;
      if (P.length === 2) {
        var o = P[a.end ? 0 : 1], old = P[a.end ? 1 : 0], ax = Math.abs(old[1] - o[1]) < E ? 0 : (Math.abs(old[0] - o[0]) < E ? 1 : -1);
        if (ax >= 0 && !(Math.abs(old[0] - o[0]) < E && Math.abs(old[1] - o[1]) < E) && Math.abs(np[1 - ax] - o[1 - ax]) > E && Math.abs(np[ax] - o[ax]) > E) {
          jog.push({ a: a, an: an, np: np, o: o, ax: ax, s: o[ax] > np[ax] ? 1 : -1, d: np[1 - ax] > o[1 - ax] ? 1 : -1 }); return;
        }
      }
      ops.moveEnd(w, a.end, np, grid); if (an.dir) ops.alignExit(w, a.end, an.dir, an.len);
    });
    HX.wireJogs(jog, grid);
    jog.forEach(function (c) {
      var np = c.np, o = c.o, m = c.m, pts = c.ax === 0 ? [np.slice(), [m, np[1]], [m, o[1]], o.slice()] : [np.slice(), [np[0], m], [o[0], m], o.slice()];
      if (c.a.end) pts.reverse(); c.a.w.pts = HX.cleanPts(pts);
      if (c.an.dir) ops.alignExit(c.a.w, c.a.end, c.an.dir, c.an.len);
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
