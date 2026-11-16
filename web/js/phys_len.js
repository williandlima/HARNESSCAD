/* HarnessCAD - comprimentos pelo DESENHO FÍSICO (o físico manda na formatação e nas cotas do chicote).
   Ramo com comprimento digitado = cota fixa (se o desenho não bate, a cota sai "fora de escala").
   Ramo sem valor = comprimento medido no próprio desenho (traçado × escala, arredondado a 1 mm): arrastar os nós muda a cota.
   Fio: caminho pelos ramos entre os nós das pontas + folga das duas pontas. Sem desenho físico: cotas antigas do esquemático. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.physSegAuto = function (sg) { return !(parseFloat(sg.len) >= 0); };
  HX.physSegLen = function (sg, m, N) {
    var v = parseFloat(sg.len); if (v >= 0) return v;
    var P = HX.physSegPts(sg, m); return P ? Math.round(HX.polyLen(P) * (N || 1)) : 0;
  };
  HX.physSheet = function (p) { return p.sheets.filter(function (sh) { return HX.isPhys(sh) && sh.items.some(function (i) { return i.type === 'pseg'; }); })[0] || null; };
  // grafo dos ramos com o comprimento efetivo
  function graph(sh) {
    var m = HX.physIdx(sh), N = +sh.scale || 1, adj = {}, segs = {};
    sh.items.forEach(function (s) { if (s.type !== 'pseg' || !m[s.a] || !m[s.b]) return; var Lr = HX.physSegLen(s, m, N), L = Lr + (HX.physSegExtra ? HX.physSegExtra(sh, s.id) : 0); segs[s.id] = { s: s, L: L, Lr: Lr }; (adj[s.a] = adj[s.a] || []).push({ to: s.b, L: L, id: s.id }); (adj[s.b] = adj[s.b] || []).push({ to: s.a, L: L, id: s.id }); });
    return { m: m, adj: adj, segs: segs };
  }
  function dijkstra(adj, a, b) {
    var dist = {}, prev = {}, done = {}; dist[a] = 0;
    for (;;) {
      var u = null; Object.keys(dist).forEach(function (n) { if (!done[n] && (u === null || dist[n] < dist[u])) u = n; });
      if (u === null || u === b) break; done[u] = 1;
      (adj[u] || []).forEach(function (e) { var d = dist[u] + e.L; if (!(e.to in dist) || d < dist[e.to]) { dist[e.to] = d; prev[e.to] = [u, e.id]; } });
    }
    if (!(b in dist)) return null;
    var ids = [], n = b; while (n !== a) { ids.push(prev[n][1]); n = prev[n][0]; }
    return { len: dist[b], segs: ids };
  }
  HX.physPathLen = function (sh, a, b) { var g = graph(sh), r = a === b ? { len: 0, segs: [] } : dijkstra(g.adj, a, b); return r ? { len: r.len, missing: false, segs: r.segs } : null; };
  var cl0 = HX.computeLengths;
  HX.computeLengths = function (p, nl) {
    var sh = HX.physSheet(p); if (!sh) return cl0(p, nl);
    nl = nl || HX.buildNetlist(p);
    var g = graph(sh), nodeOf = {}, dims = {}, wires = {}, pns = {}, missing = [], end = +p.defaults.lenEnd || 0, fol = HX.endAllowance ? HX.endAllowance(p) : {}, memo = {};
    sh.items.forEach(function (i) { if (i.type === 'pnode' && i.of) nodeOf[i.of] = i.id; });
    Object.keys(g.segs).forEach(function (id) { var x = g.segs[id]; dims[id] = { count: 0, total: 0, d: { id: id, a: x.s.a, b: x.s.b, len: x.Lr, extra: x.L - x.Lr, phys: true } }; });
    p.sheets.forEach(function (S) { if (!HX.isPhys(S)) S.items.forEach(function (d) { if (d.type === 'dim') dims[d.id] = { count: 0, total: 0, d: d, legacy: true }; }); });
    function item(s, pt) { var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])], t = nd && nd.terms.filter(function (x) { return x.kind === 'pin' || x.kind === 'splice'; })[0]; return t ? t.id : null; }
    function path(a, b) { var k = a + '>' + b; return k in memo ? memo[k] : (memo[k] = a === b ? { len: 0, segs: [] } : dijkstra(g.adj, a, b)); }
    p.sheets.forEach(function (S, s) {
      if (HX.isPhys(S)) return;
      S.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        var a = item(s, w.pts[0]), b = item(s, w.pts[w.pts.length - 1]), na = nodeOf[a], nb = nodeOf[b];
        var r = na && nb ? path(na, nb) : (a && a === b ? { len: 0, segs: [] } : null), man = parseFloat(w.len);
        var fa = a in fol ? fol[a] : end, fb = b in fol ? fol[b] : end, auto = r ? r.len + fa + fb : null, eff = man > 0 ? man : auto;
        wires[w.id] = { auto: auto, eff: eff, path: r ? r.segs : null, manual: man > 0 };
        if (r) r.segs.forEach(function (id) { dims[id].count++; dims[id].total += eff || 0; });
        if (eff == null) missing.push(w);
        var pn = HX.wirePN(w), t = pns[pn] || (pns[pn] = { pn: pn, n: 0, mm: 0, semCota: 0 });
        t.n++; t.mm += eff || 0; if (eff == null) t.semCota++;
      });
    });
    var k = 1 + (+p.defaults.scrapPct || 0) / 100;
    return { wires: wires, dims: dims, missing: missing, scrap: k, phys: true,
      pns: Object.keys(pns).sort().map(function (x) { var t = pns[x]; t.m = t.mm * k / 1000; return t; }) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
