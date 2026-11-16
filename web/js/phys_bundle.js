/* HarnessCAD - desenho físico: feixe real. Cada fio do esquemático é roteado pelos ramos (caminho entre os nós dos
   conectores/emendas das pontas). Cada ramo sabe quais fios leva, a contagem e o diâmetro estimado do feixe
   (Ø ≈ 1,15·√Σd², d = diâmetro externo do fio com isolação); cada conector sabe quantos fios e quais cores saem dele.
   Fio cuja ponta não está no desenho físico fica "não roteado" (aviso). */
(function (G) {
  'use strict';
  var HX = G.HX;
  // diâmetro externo típico (mm) por AWG — fio aeronáutico de parede fina (ref. M22759/16, máx.); demais: condutor + 0,7
  HX.WIRE_OD = { 30: 0.76, 28: 0.86, 26: 1.02, 24: 1.17, 22: 1.37, 20: 1.57, 18: 1.83, 16: 2.11, 14: 2.54, 12: 3.05, 10: 3.68, 8: 5.0, 6: 6.3, 4: 7.6, 2: 9.4, 0: 11.7 };
  HX.wireOD = function (w) {
    var g = String(w.gauge || '').replace(/\s*AWG/i, ''), o = HX.WIRE_OD[g]; if (o) return o;
    var a = (HX.AWG || []).filter(function (r) { return r[0] === g; })[0]; if (a) return a[1] + 0.7;
    var mm2 = parseFloat(String(w.gauge).replace(',', '.')); return mm2 > 0 ? 2 * Math.sqrt(mm2 / Math.PI) + 0.7 : 1.4;
  };
  HX.bundleOD = function (ws) { var s = 0; ws.forEach(function (w) { var d = HX.wireOD(w); s += d * d; }); return ws.length ? (ws.length === 1 ? Math.sqrt(s) : 1.15 * Math.sqrt(s)) : 0; };
  // largura visual do feixe no papel (proporcional ao Ø, legível em qualquer escala)
  HX.bundleW = function (od) { return Math.max(1.8, Math.min(6.5, 1.3 + 0.5 * (od || 1.4))); };
  HX.physBundle = function (p, sh) {
    var nl = HX.buildNetlist(p), nodeOf = {}, adj = {}, out = { seg: {}, node: {}, orphan: [], pin: {} };
    sh.items.forEach(function (i) { if (i.type === 'pnode' && i.of) nodeOf[i.of] = i.id; if (i.type === 'pseg') { (adj[i.a] = adj[i.a] || []).push(i); (adj[i.b] = adj[i.b] || []).push(i); out.seg[i.id] = { wires: [], od: 0 }; } });
    if (HX.physJuncMap) HX.physJuncMap(p, sh, nl, nodeOf, adj);
    var lastT = null; // pino do fio em cada conector: out.pin[nó][fio] = nº do pino
    function endItem(s, pt) { var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])], t = nd && nd.terms.filter(function (x) { return x.kind === 'pin' || x.kind === 'splice'; })[0]; lastT = t; return t ? t.id : null; }
    function pinOf(n, w, t) { if (n && t && t.kind === 'pin') (out.pin[n] = out.pin[n] || {})[w.id] = String(t.pin); }
    function path(a, b) {
      if (a === b) return []; var prev = {}, q = [a], seen = {}; seen[a] = 1;
      while (q.length) { var u = q.shift(); if (u === b) break; (adj[u] || []).forEach(function (s) { var v = s.a === u ? s.b : s.a; if (!seen[v]) { seen[v] = 1; prev[v] = s; q.push(v); } }); }
      if (!seen[b]) return null; var r = [], n = b; while (n !== a) { var s = prev[n]; r.push(s); n = s.a === n ? s.b : s.a; } return r;
    }
    p.sheets.forEach(function (S, si) {
      if (HX.isPhys(S)) return;
      S.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        var a = nodeOf[endItem(si, w.pts[0])]; pinOf(a, w, lastT); var b = nodeOf[endItem(si, w.pts[w.pts.length - 1])]; pinOf(b, w, lastT);
        if (a) (out.node[a] = out.node[a] || []).push(w); if (b && b !== a) (out.node[b] = out.node[b] || []).push(w);
        var P = a && b ? path(a, b) : null;
        if (!P) { if (!(a && a === b)) out.orphan.push(w); return; }
        P.forEach(function (s) { out.seg[s.id].wires.push(w); });
      });
    });
    Object.keys(out.seg).forEach(function (k) { out.seg[k].od = HX.bundleOD(out.seg[k].wires); });
    return out;
  };
  HX.physBundleCtx = function (p, s, o) { if (!o._bun || o._buns !== s) { o._buns = s; o._bun = HX.physBundle(p, p.sheets[s]); } return o._bun; };
  HX.wireHex = function (w) { var c = HX.COLORS[w.color]; return c ? c[1] : '#888'; };
})(typeof window !== 'undefined' ? window : globalThis);
