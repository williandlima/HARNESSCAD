/* HarnessCAD - comprimento dos fios pelas cotas (menor caminho + folga por ponta), fios por trecho e metros por PN */
(function (G) {
  'use strict';
  var HX = G.HX;
  // ---------- cálculo dos comprimentos ----------
  HX.computeLengths = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    HX.syncDims(p);
    var adj = {}, dims = {}, end = +p.defaults.lenEnd || 0, wires = {}, pns = {}, missing = [], fol = HX.endAllowance ? HX.endAllowance(p) : {};
    p.sheets.forEach(function (sh) {
      sh.items.forEach(function (d) {
        if (d.type !== 'dim') return;
        dims[d.id] = { count: 0, total: 0, d: d };
        var L = parseFloat(d.len);
        if (!d.a || !d.b || !(L >= 0)) return;
        (adj[d.a] = adj[d.a] || []).push({ to: d.b, len: L, id: d.id });
        (adj[d.b] = adj[d.b] || []).push({ to: d.a, len: L, id: d.id });
      });
    });
    var memo = {};
    function path(a, b) { // Dijkstra (grafo pequeno)
      var k = a + '>' + b; if (k in memo) return memo[k];
      var dist = {}, prev = {}, done = {}; dist[a] = 0;
      for (;;) {
        var u = null; Object.keys(dist).forEach(function (n) { if (!done[n] && (u === null || dist[n] < dist[u])) u = n; });
        if (u === null || u === b) break;
        done[u] = 1;
        (adj[u] || []).forEach(function (e) { var nd = dist[u] + e.len; if (!(e.to in dist) || nd < dist[e.to]) { dist[e.to] = nd; prev[e.to] = [u, e.id]; } });
      }
      if (!(b in dist)) return (memo[k] = null);
      var ids = [], n = b; while (n !== a) { ids.push(prev[n][1]); n = prev[n][0]; }
      return (memo[k] = { len: dist[b], dims: ids });
    }
    function item(s, pt) {
      var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])]; if (!nd) return null;
      var t = nd.terms.filter(function (x) { return x.kind === 'pin' || x.kind === 'splice'; })[0];
      return t ? t.id : null;
    }
    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        var a = item(s, w.pts[0]), b = item(s, w.pts[w.pts.length - 1]);
        var r = a && b ? (a === b ? { len: 0, dims: [] } : path(a, b)) : null, man = parseFloat(w.len);
        var fa = a in fol ? fol[a] : end, fb = b in fol ? fol[b] : end, auto = r ? r.len + fa + fb : null, eff = man > 0 ? man : auto;
        wires[w.id] = { auto: auto, eff: eff, path: r ? r.dims : null, manual: man > 0 };
        if (r) r.dims.forEach(function (id) { dims[id].count++; dims[id].total += eff || 0; });
        if (eff == null) missing.push(w);
        var pn = HX.wirePN(w), t = pns[pn] || (pns[pn] = { pn: pn, n: 0, mm: 0, semCota: 0 });
        t.n++; t.mm += eff || 0; if (eff == null) t.semCota++;
      });
    });
    var k = 1 + (+p.defaults.scrapPct || 0) / 100;
    return { wires: wires, dims: dims, missing: missing, scrap: k,
      pns: Object.keys(pns).sort().map(function (x) { var t = pns[x]; t.m = t.mm * k / 1000; return t; }) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
