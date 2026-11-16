/* HarnessCAD - desenho físico da cablagem: geração a partir do esquemático.
   Topologia: cotas do chicote (dim) ligando conectores, pontos de derivação (BR) e emendas, com o comprimento real.
   Conector sem cota entra ligado ao nó com quem compartilha fios (ramo "sem cota"). Sem cota nenhuma: estrela (3+ conectores; com 2, um ramo direto, sem ponto de derivação).
   Layout em escala 1:N: o maior caminho vira o tronco (horizontal); ramos saem a 90° alternando lados e
   sub-ramos a 45°. A folha gerada (kind 'phys') tem nós (pnode), ramos (pseg) e acessórios livres (pimg). */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.PHYS_SCALES = [1, 2, 2.5, 5, 10, 20, 50];
  HX.PHYS_DEF_LEN = 150; // mm reais desenhados para ramo sem cota
  HX.isPhys = function (sh) { return !!(sh && sh.kind === 'phys'); };

  function topo(p) {
    var nodes = {}, edges = [], it = {};
    p.sheets.forEach(function (sh) { if (!HX.isPhys(sh)) sh.items.forEach(function (i) { it[i.id] = i; }); });
    Object.keys(it).forEach(function (id) {
      var d = it[id]; if (d.type !== 'dim' || !it[d.a] || !it[d.b] || d.a === d.b) return;
      nodes[d.a] = it[d.a]; nodes[d.b] = it[d.b];
      edges.push({ a: d.a, b: d.b, len: parseFloat(d.len), tolP: d.tolP || '', tolM: d.tolM || '', dim: d.id });
    });
    var conns = Object.keys(it).map(function (k) { return it[k]; }).filter(function (c) { return c.type === 'conn' && !(HX.CAT.conns[c.part] || {}).disc; });
    var loose = conns.filter(function (c) { return !nodes[c.id]; });
    if (loose.length) { // liga pelo fio: o nó do grafo com mais redes em comum
      var nl = HX.buildNetlist(p), netsOf = {};
      nl.nets.forEach(function (n, ni) { n.terms.forEach(function (t) { if (t.kind === 'pin' || t.kind === 'splice') (netsOf[t.id] = netsOf[t.id] || {})[ni] = 1; }); });
      var ids = Object.keys(nodes);
      if (!ids.length) { nodes._hub = { id: '_hub', type: 'virt', ref: '' }; ids = ['_hub']; }
      loose.forEach(function (c) {
        var best = ids[0], bn = -1, mine = netsOf[c.id] || {};
        ids.forEach(function (id) { var n = Object.keys(netsOf[id] || {}).filter(function (k) { return mine[k]; }).length; if (n > bn) { bn = n; best = id; } });
        nodes[c.id] = c; edges.push({ a: best, b: c.id, len: NaN, tolP: '', tolM: '', dim: '' });
      });
    }
    if (nodes._hub) { // centro automático só existe se derivar (3 ou mais ramos)
      var he = edges.filter(function (e) { return e.a === '_hub' || e.b === '_hub'; });
      if (he.length <= 2) {
        edges = edges.filter(function (e) { return he.indexOf(e) < 0; }); delete nodes._hub;
        if (he.length === 2) { var o = he.map(function (e) { return e.a === '_hub' ? e.b : e.a; }); edges.push({ a: o[0], b: o[1], len: NaN, tolP: '', tolM: '', dim: '' }); }
      }
    }
    return { nodes: nodes, edges: edges };
  }
  function far(adj, s, meas) { // nó mais distante (comprimento) e caminho; meas = só ramos com cota
    var dist = {}, prev = {}, st = [s]; dist[s] = 0;
    while (st.length) { var u = st.pop(); (adj[u] || []).forEach(function (e) { if (!(e.to in dist) && (e.W > 0.01 || !meas)) { dist[e.to] = dist[u] + e.W; prev[e.to] = u; st.push(e.to); } }); }
    var b = s; Object.keys(dist).forEach(function (k) { if (dist[k] > dist[b]) b = k; });
    var path = [b]; while (path[0] !== s) path.unshift(prev[path[0]]);
    return { node: b, path: path };
  }

  HX.genPhysical = function (p, opt) {
    opt = opt || {}; var N = +opt.scale || 5, T = topo(p), adj = {}, pos = {}, seen = {}, warn = [];
    if (!T.edges.length) return { error: 'O esquemático não tem conectores ligados por cotas nem por fios.' };
    T.edges.forEach(function (e) {
      var L = e.len >= 0 ? e.len : Math.max(HX.PHYS_DEF_LEN, 30 * N); // sem cota: ao menos 30 mm no papel
      var W = e.len >= 0 ? L : 0.001; // ramo sem cota não define o tronco
      (adj[e.a] = adj[e.a] || []).push({ to: e.b, L: L, W: W, e: e }); (adj[e.b] = adj[e.b] || []).push({ to: e.a, L: L, W: W, e: e });
    });
    var ids = Object.keys(T.nodes), comps = [];
    ids.forEach(function (s) { if (seen['c' + s]) return; var m0 = (adj[s] || []).some(function (e) { return e.W > 0.01; }) ? s : (Object.keys(T.nodes).filter(function (k) { return (adj[k] || []).some(function (e) { return e.W > 0.01; }); })[0]);
      var mm = !!m0 && reach(s, m0), c = far(adj, mm ? m0 : s, mm), d = far(adj, c.node, mm), P = d.path, xa = +(T.nodes[P[0]].x || 0), xb = +(T.nodes[P[P.length - 1]].x || 0); comps.push(xa > xb ? P.reverse() : P); markAll(s); });
    function reach(a, b) { var st = [a], v = {}; v[a] = 1; while (st.length) { var u = st.pop(); if (u === b) return true; (adj[u] || []).forEach(function (e) { if (!v[e.to]) { v[e.to] = 1; st.push(e.to); } }); } return false; }
    function markAll(s) { var st = [s]; seen['c' + s] = 1; while (st.length) { var u = st.pop(); (adj[u] || []).forEach(function (e) { if (!seen['c' + e.to]) { seen['c' + e.to] = 1; st.push(e.to); } }); } }
    var y0 = 0, used = {}, tree = [];
    function paper(L) { return Math.max(8, L / N); }
    function grow(u, ang, depth) { // filhos de u (já posicionado) na direção ang
      var ch = (adj[u] || []).filter(function (e) { return !used[e.to]; }), k = 0;
      ch.forEach(function (e, i) {
        if (used[e.to]) return; used[e.to] = 1;
        var a = i === 0 ? ang : ang + (k++ % 2 ? -45 : 45) * (1 + Math.floor((k - 1) / 2) * 0.5), r = a * Math.PI / 180, Lp = paper(e.L);
        pos[e.to] = [pos[u][0] + Math.cos(r) * Lp, pos[u][1] + Math.sin(r) * Lp]; tree.push(e.e); grow(e.to, a, depth + 1);
      });
    }
    comps.forEach(function (path) {
      var x = 0, side = 1; pos[path[0]] = [0, y0]; used[path[0]] = 1;
      path.forEach(function (u, i) {
        if (i) { var e = (adj[path[i - 1]] || []).filter(function (q) { return q.to === u; })[0]; x += paper(e.L); pos[u] = [x, y0]; used[u] = 1; tree.push(e.e); }
      });
      path.forEach(function (u) { (adj[u] || []).forEach(function (e) {
        if (used[e.to]) return; used[e.to] = 1; var Lp = paper(e.L);
        pos[e.to] = [pos[u][0], pos[u][1] + side * Lp]; tree.push(e.e); grow(e.to, side * 90, 1); side = -side;
      }); });
      var ys = Object.keys(pos).map(function (k) { return pos[k][1]; }); y0 = Math.max.apply(0, ys) + 60;
    });
    // itens da folha
    var doc = { n: 1 }, items = [], idOf = {}, prev = opt.prev || {};
    function uid(pf) { return 'P' + pf + (doc.n++); }
    ids.forEach(function (id) {
      var s = T.nodes[id], kind = s.type === 'conn' ? 'conn' : s.type === 'brk' ? 'brk' : s.type === 'splice' ? 'splice' : 'virt';
      var nd = { type: 'pnode', id: uid('n'), of: s.id || id, ref: s.ref || '', nkind: kind, x: pos[id][0], y: pos[id][1] };
      if (kind === 'conn') { nd.sprite = HX.physSpriteFor(s) || ''; nd.size = ''; nd.rot = ''; nd.flip = false; nd.showPN = true; nd.note = ''; if (!nd.sprite) warn.push(s.ref + ': sem imagem para ' + s.part); }
      var o = prev[nd.of]; if (o) ['sprite', 'size', 'rot', 'flip', 'showPN', 'note'].forEach(function (k) { if (o[k] !== undefined) nd[k] = o[k]; });
      idOf[id] = nd.id; items.push(nd);
    });
    T.edges.forEach(function (e) {
      var sg = { type: 'pseg', id: uid('s'), a: idOf[e.a], b: idOf[e.b], len: e.len >= 0 ? e.len : '', tolP: e.tolP, tolM: e.tolM, dim: e.dim, cover: '', coverTxt: '', x: 0, y: 0 };
      var o = prev['seg:' + e.dim]; if (e.dim && o) { sg.cover = o.cover || ''; sg.coverTxt = o.coverTxt || ''; }
      if (tree.indexOf(e) < 0) sg.loop = true; items.push(sg);
    });
    // enquadra na área útil da folha (fora do carimbo)
    var d = HX.sheetDims(p.meta), M = HX.frameMargins(p), X0 = M.l + 25, Y0 = M.t + 25, X1 = d[0] - M.r - 25, Y1 = d[1] - M.b - 70;
    var xs = items.filter(function (i) { return i.type === 'pnode'; }), bx0 = Math.min.apply(0, xs.map(function (i) { return i.x; })), bx1 = Math.max.apply(0, xs.map(function (i) { return i.x; }));
    var by0 = Math.min.apply(0, xs.map(function (i) { return i.y; })), by1 = Math.max.apply(0, xs.map(function (i) { return i.y; }));
    var dx = (X0 + X1) / 2 - (bx0 + bx1) / 2, dy = (Y0 + Y1) / 2 - (by0 + by1) / 2;
    xs.forEach(function (i) { i.x = HX.r3(i.x + dx); i.y = HX.r3(i.y + dy); });
    var fit = Math.max((bx1 - bx0) / Math.max(1, X1 - X0), (by1 - by0) / Math.max(1, Y1 - Y0));
    if (fit > 1) warn.unshift('O desenho em 1:' + N + ' não cabe na folha ' + p.meta.size + ' (sugestão: 1:' + (HX.PHYS_SCALES.filter(function (s) { return s >= N * fit; })[0] || Math.ceil(N * fit)) + ' ou folha maior).');
    if (!T.edges.some(function (e) { return e.dim; })) warn.push(T.nodes._hub ? 'Sem cotas no esquemático: conectores em estrela, ramos "sem cota".' : 'Sem cotas no esquemático: ramo "sem cota" (dê o comprimento no desenho físico).');
    items.push({ type: 'text', id: uid('t'), x: X0 - 15, y: M.t + 12, size: 3.5, rot: 0, text: 'DESENHO FÍSICO DA CABLAGEM — ESCALA 1:' + N });
    items.push({ type: 'text', id: uid('t'), x: X0 - 15, y: M.t + 17, size: 2.2, rot: 0, text: 'Cotas em mm (comprimento real). Conectores e acessórios: desenhos dos datasheets, fora de escala (ampliados).' });
    return { sheet: { id: 'sphys', name: opt.name || 'Desenho físico', kind: 'phys', scale: N, items: items }, warn: warn };
  };
})(typeof window !== 'undefined' ? window : globalThis);
