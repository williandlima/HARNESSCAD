/* HarnessCAD - cobertura PARCIAL / ESTENDIDA (pcov): do nó A ao nó B pelo caminho dos ramos (atravessa BRs),
   com recuo d0/d1 (mm reais) em cada ponta. Comprimento real = caminho − d0 − d1 (lista de materiais e balão).
   Desenhada com a imagem do painel repetida (modelo Imagens) ou contorno largo hachurado (modelo Traço). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.physPathSegs = function (sh, a, b) {
    var adj = {}; sh.items.forEach(function (s) { if (s.type === 'pseg') { (adj[s.a] = adj[s.a] || []).push(s); (adj[s.b] = adj[s.b] || []).push(s); } });
    var prev = {}, q = [a], seen = {}; seen[a] = 1;
    while (q.length) { var u = q.shift(); if (u === b) break; (adj[u] || []).forEach(function (s) { var v = s.a === u ? s.b : s.a; if (!seen[v]) { seen[v] = 1; prev[v] = s; q.push(v); } }); }
    if (!seen[b] || a === b) return null;
    var out = [], n = b; while (n !== a) { var s = prev[n]; out.unshift({ sg: s, rev: s.a === n }); n = s.a === n ? s.b : s.a; }
    return out;
  };
  // caminho desenhado + mapa real→papel
  function geom(it, sh, m, N) {
    var segs = HX.physPathSegs(sh, it.a, it.b); if (!segs) return null;
    var P = [], marks = []; // marks: [papel acumulado, real acumulado]
    var accP = 0, accR = 0; marks.push([0, 0]);
    segs.forEach(function (x) {
      var q = HX.physSegPts(x.sg, m); if (!q) return; if (x.rev) q = q.slice().reverse();
      var lp = HX.polyLen(q), lr = HX.physSegLen(x.sg, m, N);
      P = P.length ? P.concat(q.slice(1)) : q.slice(); accP += lp; accR += lr; marks.push([accP, accR]);
    });
    return { P: P, marks: marks, real: accR, paper: accP };
  }
  function r2p(G2, r) { var M = G2.marks; for (var i = 1; i < M.length; i++) if (r <= M[i][1] || i === M.length - 1) { var a = M[i - 1], b = M[i], k = b[1] - a[1] ? (r - a[1]) / (b[1] - a[1]) : 0; return a[0] + (b[0] - a[0]) * Math.max(0, Math.min(1, k)); } return 0; }
  HX.physCoverLen = function (it, sh) { var g = geom(it, sh, HX.physIdx(sh), +sh.scale || 1); return g ? Math.max(0, g.real - (+it.d0 || 0) - (+it.d1 || 0)) : 0; };
  EXT.pcov = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), G2 = geom(it, C.sh, C.m, C.N), spr = HX.PSPR[it.sprite]; if (!G2 || G2.paper <= 0) return;
      var f0 = r2p(G2, +it.d0 || 0) / G2.paper, f1 = r2p(G2, G2.real - (+it.d1 || 0)) / G2.paper; if (f1 <= f0) return;
      var Q = []; for (var i = 0; i <= 40; i++) Q.push(HX.polyAt(G2.P, f0 + (f1 - f0) * i / 40).pt);
      hide(it, '_P', Q);
      if (C.line) { HX.physLineJacket(g, Q, C.col, 0, 0, true, 5.2); return; }
      var H = 6.2, L = HX.polyLen(Q), tl = spr ? H * spr.w / spr.h : 8, n = Math.max(1, Math.round(L / tl)), w = L / n;
      for (var k = n - 1; k >= 0; k--) { var q = HX.polyAt(Q, (k + 0.5) / n), wo = k === n - 1 ? w : w * 1.24; g.push([q.d[0], q.d[1], -q.d[1], q.d[0], q.pt[0], q.pt[1]]); if (!(spr && g.image && g.image(spr, -w / 2, -H / 2, wo, H))) { g.style({ stroke: '#333', lw: H, fill: null }); g.line(-w / 2, 0, w / 2, 0); } g.pop(); }
    },
    bbox: function (it) { var P = it._P; if (!P) return { x0: 0, y0: 0, x1: 0, y1: 0 }; return { x0: Math.min.apply(0, P.map(function (q) { return q[0]; })) - 3, y0: Math.min.apply(0, P.map(function (q) { return q[1]; })) - 3, x1: Math.max.apply(0, P.map(function (q) { return q[0]; })) + 3, y1: Math.max.apply(0, P.map(function (q) { return q[1]; })) + 3 }; },
    hit: function (it, pt) { var P = it._P; if (!P) return 1e9; var m = 1e9; for (var i = 1; i < P.length; i++) m = Math.min(m, HX.distSeg(pt, P[i - 1], P[i])); return m - 3; }
  };
  // lista de materiais e chave do balão
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh);
    sh.items.forEach(function (c) {
      if (c.type !== 'pcov' || !HX.PSPR[c.sprite]) return; var k = 'v:' + c.sprite + ':' + (c.txt || ''), q = Math.round(HX.physCoverLen(c, sh) / 10) / 100;
      if (B.key[k]) B.key[k].qty = Math.round((B.key[k].qty + q) * 100) / 100; else { var r = { k: k, pn: c.txt || '', desc: HX.PSPR[c.sprite].name, qty: q, un: 'm' }; B.rows.push(r); B.key[k] = r; }
    });
    B.rows.forEach(function (r, i) { r.n = i + 1; });
    return B;
  };
  var ik = HX.physItemKey;
  HX.physItemKey = function (p, it, m) { return it.type === 'pcov' ? 'v:' + it.sprite + ':' + (it.txt || '') : ik(p, it, m); };
  var an = HX.physAnchor;
  HX.physAnchor = function (it, m) { if (it && it.type === 'pcov') { var P = it._P; return P ? HX.polyAt(P, 0.5).pt : null; } return an(it, m); };
})(typeof window !== 'undefined' ? window : globalThis);
