/* HarnessCAD - desenho físico: JUNÇÕES/EMENDAS DO ESQUEMÁTICO FICAM DENTRO DO FEIXE.
   Uma junção (ponto) ou emenda no meio dos fios do esquemático não vira ponto nem ramo próprio no desenho físico:
   os fios daquele circuito são roteados até o nó do chicote onde os conectores do circuito se encontram (mediana da
   árvore: o nó que minimiza a soma dos caminhos até eles, preferindo pontos de derivação aos conectores). */
(function (G) {
  'use strict';
  var HX = G.HX;
  function bfs(adj, a) { var d = {}, q = [a]; d[a] = 0; while (q.length) { var u = q.shift(); (adj[u] || []).forEach(function (s) { var v = s.a === u ? s.b : s.a; if (!(v in d)) { d[v] = d[u] + 1; q.push(v); } }); } return d; }
  HX.physJuncMap = function (p, sh, nl, nodeOf, adj) {
    var kind = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') kind[i.id] = i.nkind; });
    nl.nets.forEach(function (net) {
      var sp = net.terms.filter(function (t) { return t.kind === 'splice' && !nodeOf[t.id]; }); if (!sp.length) return;
      var T = []; net.terms.forEach(function (t) { var n = t.kind === 'pin' && nodeOf[t.id]; if (n && T.indexOf(n) < 0) T.push(n); });
      if (!T.length) return;
      var D = T.map(function (n) { return bfs(adj, n); }), best = null, bs = 1e9;
      Object.keys(D[0]).forEach(function (v) {
        var sum = 0; for (var i = 0; i < D.length; i++) { if (!(v in D[i])) return; sum += D[i][v]; }
        var sc = sum * 10 + (kind[v] === 'conn' ? 5 : 0) - (adj[v] || []).length * 0.1; if (sc < bs) { bs = sc; best = v; }
      });
      if (best) sp.forEach(function (t) { nodeOf[t.id] = best; });
    });
  };
  // geração nova: a posição relativa dos conectores segue o esquemático (quem está à esquerda/acima lá fica à esquerda/acima aqui)
  HX.physOrientLikeSchem = function (p, sh) {
    var S = HX.physSchem(p), ns = sh.items.filter(function (i) { return i.type === 'pnode'; }), cs = ns.filter(function (n) { return n.nkind === 'conn' && S[n.of]; }); if (cs.length < 2) return;
    function cor(k) { var a = 0, mx = 0, ms = 0; cs.forEach(function (n) { mx += n[k]; ms += S[n.of][k]; }); mx /= cs.length; ms /= cs.length; cs.forEach(function (n) { a += (n[k] - mx) * (S[n.of][k] - ms); }); return a; }
    var xs = ns.map(function (n) { return n.x; }), ys = ns.map(function (n) { return n.y; }), cx = (Math.min.apply(0, xs) + Math.max.apply(0, xs)) / 2, cy = (Math.min.apply(0, ys) + Math.max.apply(0, ys)) / 2;
    var fx = cor('x') < -1e-6, fy = cor('y') < -1e-6; if (!fx && !fy) return;
    ns.forEach(function (n) { if (fx) n.x = HX.r3(2 * cx - n.x); if (fy) n.y = HX.r3(2 * cy - n.y); if (n.rot !== '' && n.rot != null) n.rot = ((fx ? 180 - n.rot : +n.rot) * (fy ? -1 : 1) + 720) % 360; });
    sh.items.forEach(function (i) { if (i.type === 'pseg') { i.x = 0; i.y = 0; if (i.bends) i.bends = i.bends.map(function (b) { return [fx ? 2 * cx - b[0] : b[0], fy ? 2 * cy - b[1] : b[1]]; }); } });
  };
})(typeof window !== 'undefined' ? window : globalThis);
