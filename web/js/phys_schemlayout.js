/* HarnessCAD - desenho físico NA MESMA DISPOSIÇÃO DO ESQUEMÁTICO.
   Conectores vão para a posição relativa que têm no esquemático (mesma proporção, ajustada à folha); cada derivação
   fica no tronco (reta entre os dois vizinhos mais opostos), na altura das junções do esquemático que caem nela
   (ou na projeção dos ramos que saem dela). Ramos voltam a reta, conectores voltam a apontar para o ramo, cotas e
   rótulos são reorganizados. Os comprimentos digitados continuam valendo. Automático ao gerar; comando no menu. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.physSchCenter = center;
  function center(c, p) { var P = HX.connLayout(c, p.unit || 2.5).pins || []; if (!P.length) return [c.x, c.y]; var x = 0, y = 0; P.forEach(function (q) { x += q.pt[0]; y += q.pt[1]; }); return [x / P.length, y / P.length]; }
  HX.physLayoutLikeSchem = function (doc, sh) {
    var p = doc.p, S = HX.physSchem(p), m = HX.physIdx(sh), ns = sh.items.filter(function (i) { return i.type === 'pnode'; });
    var cs = ns.filter(function (n) { return n.nkind === 'conn' && S[n.of]; }); if (cs.length < 2) return 0;
    var sc = {}; cs.forEach(function (n) { sc[n.id] = center(S[n.of], p); });
    var X = cs.map(function (n) { return sc[n.id][0]; }), Y = cs.map(function (n) { return sc[n.id][1]; }), sx0 = Math.min.apply(0, X), sx1 = Math.max.apply(0, X), sy0 = Math.min.apply(0, Y), sy1 = Math.max.apply(0, Y);
    var px = ns.map(function (n) { return n.x; }), py = ns.map(function (n) { return n.y; }), cx = (Math.min.apply(0, px) + Math.max.apply(0, px)) / 2, cy = (Math.min.apply(0, py) + Math.max.apply(0, py)) / 2;
    var D = HX.sheetDims(p.meta), k = Math.max(0.25, Math.min(1.6, D[0] * 0.62 / Math.max(1, sx1 - sx0), D[1] * 0.26 / Math.max(1, sy1 - sy0)));
    var Mt = HX.frameMargins ? HX.frameMargins(p) : { t: 20, r: 20 }, nb = HX.physBom ? HX.physBom(p, sh).rows.length : 0, top = Math.max((Mt.t || 20) + 55, sh.items.some(function (t) { return t.type === 'ptable' && t.kind === 'bom'; }) ? (Mt.t || 20) + 22 + (nb + 2) * 3.6 + 22 : 0), scx = (sx0 + sx1) / 2, map = function (q) { return [cx + (q[0] - scx) * k, top + (q[1] - sy0) * k]; }; cy = top + (sy1 - sy0) * k / 2; // cresce para baixo a partir do topo atual (tabelas ficam livres)
    cs.forEach(function (n) { var q = map(sc[n.id]); n.x = HX.r3(q[0]); n.y = HX.r3(q[1]); n.rot = ''; });
    // junções do esquemático que caem em cada derivação
    var nodeOf = {}, adj = {}; ns.forEach(function (n) { if (n.of) nodeOf[n.of] = n.id; });
    sh.items.forEach(function (i) { if (i.type === 'pseg') { (adj[i.a] = adj[i.a] || []).push(i); (adj[i.b] = adj[i.b] || []).push(i); } });
    var jx = {}; if (HX.physJuncMap) { var nm = {}; Object.keys(nodeOf).forEach(function (k2) { nm[k2] = nodeOf[k2]; }); HX.physJuncMap(p, sh, HX.buildNetlist(p), nm, adj);
      Object.keys(nm).forEach(function (sid) { var s = S[sid]; if (!s || s.type !== 'splice' || nodeOf[sid]) return; (jx[nm[sid]] = jx[nm[sid]] || []).push(map([s.x, s.y])); }); }
    var hubs = ns.filter(function (n) { return n.nkind !== 'conn'; });
    for (var pass = 0; pass < 4; pass++) hubs.forEach(function (h) {
      var nb = (adj[h.id] || []).map(function (s) { return m[s.a === h.id ? s.b : s.a]; }).filter(Boolean); if (nb.length < 2) return;
      var a = nb[0], b = nb[1], best = -2; // tronco: o par de vizinhos mais oposto
      nb.forEach(function (u, i) { nb.forEach(function (v, j) { if (j <= i) return; var ux = u.x - h.x, uy = u.y - h.y, vx = v.x - h.x, vy = v.y - h.y, c = -(ux * vx + uy * vy) / ((Math.hypot(ux, uy) * Math.hypot(vx, vy)) || 1); if (c > best || pass === 0 && i === 0 && j === 1) { best = c; a = u; b = v; } }); });
      if (pass === 0) { var far = -1; nb.forEach(function (u, i) { nb.forEach(function (v, j) { var d = Math.hypot(u.x - v.x, u.y - v.y); if (j > i && d > far) { far = d; a = u; b = v; } }); }); }
      var J = jx[h.id], o = nb.filter(function (u) { return u !== a && u !== b; }), t;
      var tgt = J && J.length ? J.reduce(function (s, q) { return [s[0] + q[0] / J.length, s[1] + q[1] / J.length]; }, [0, 0]) : o.length ? o.reduce(function (s, u) { return [s[0] + u.x / o.length, s[1] + u.y / o.length]; }, [0, 0]) : [(a.x + b.x) / 2, (a.y + b.y) / 2];
      var dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1; t = Math.max(0.12, Math.min(0.88, ((tgt[0] - a.x) * dx + (tgt[1] - a.y) * dy) / L2));
      h.x = HX.r3(a.x + dx * t); h.y = HX.r3(a.y + dy * t);
    });
    // direções do esquemático (alinhadas a 15° quando quase), comprimento digitado em escala; sem valor = distância do esquemático
    var segs = sh.items.filter(function (i) { return i.type === 'pseg'; }), N = +sh.scale || 1, T = {}; ns.forEach(function (n) { T[n.id] = [n.x, n.y]; });
    var root = cs.slice().sort(function (a, b) { return a.x - b.x; })[0], done = {}, q = [root.id]; done[root.id] = 1;
    while (q.length) { var u = q.shift(); (adj[u] || []).forEach(function (sg) {
      var v = sg.a === u ? sg.b : sg.a; if (done[v] || !m[v]) return; done[v] = 1; q.push(v);
      var dx = T[v][0] - T[u][0], dy = T[v][1] - T[u][1], L0 = Math.hypot(dx, dy) || 1, an = Math.atan2(dy, dx), sn = Math.round(an / (Math.PI / 12)) * Math.PI / 12; if (Math.abs(an - sn) < 5 * Math.PI / 180) an = sn;
      var Lt = parseFloat(sg.len) > 0 ? parseFloat(sg.len) / N : L0; m[v].x = HX.r3(m[u].x + Math.cos(an) * Lt); m[v].y = HX.r3(m[u].y + Math.sin(an) * Lt);
    }); }
    var qx = ns.map(function (n) { return n.x; }), qy = ns.map(function (n) { return n.y; }), ox = cx - (Math.min.apply(0, qx) + Math.max.apply(0, qx)) / 2, oy = cy - (Math.min.apply(0, qy) + Math.max.apply(0, qy)) / 2;
    ns.forEach(function (n) { n.x = HX.r3(n.x + ox); n.y = HX.r3(n.y + oy); }); void segs;
    // não invadir a tabela de ligação: encolhe para caber acima dela e reposiciona a tabela logo abaixo do desenho
    var Mg = HX.frameMargins ? HX.frameMargins(p) : { b: 20 }, lim = D[1] - (Mg.b || 20) - 75 - 32 - 25, yT = Math.min.apply(0, ns.map(function (n) { return n.y; })), yB = Math.max.apply(0, ns.map(function (n) { return n.y; }));
    if (yB > lim && yB > yT + 1 && !segs.some(function (g) { return parseFloat(g.len) > 0; })) { var f = Math.max(0.3, (lim - yT) / (yB - yT)), mx = (Math.min.apply(0, ns.map(function (n) { return n.x; })) + Math.max.apply(0, ns.map(function (n) { return n.x; }))) / 2; ns.forEach(function (n) { n.x = HX.r3(mx + (n.x - mx) * f); n.y = HX.r3(yT + (n.y - yT) * f); }); yB = yT + (yB - yT) * f; }
    sh.items.forEach(function (t) { if (t.type === 'ptable' && t.kind === 'wiring') t.y = HX.r3(Math.min(yB + 25 + 32, D[1] - (Mg.b || 20) - 75)); });
    var Mf = HX.frameMargins ? HX.frameMargins(p) : { l: 20, r: 20 }, X0 = (Mf.l || 20) + 75, X1 = D[0] - (Mf.r || 20) - 75, nx0 = Math.min.apply(0, ns.map(function (n) { return n.x; })), nx1 = Math.max.apply(0, ns.map(function (n) { return n.x; })); // dentro da margem
    var sx = nx1 - nx0 <= X1 - X0 ? (nx0 < X0 ? X0 - nx0 : nx1 > X1 ? X1 - nx1 : 0) : (X0 + X1) / 2 - (nx0 + nx1) / 2; if (sx) ns.forEach(function (n) { n.x = HX.r3(n.x + sx); });
    sh.items = sh.items.filter(function (i) { var g = i.type === 'pdim' && i.mode === 'seg' && m[i.seg]; return !g || (g.a === i.a && g.b === i.b) || (g.a === i.b && g.b === i.a); }); // cota de ramo que não bate com o ramo (sobra do refazer)
    sh.items.forEach(function (i) {
      if (i.type === 'pseg') { i.x = 0; i.y = 0; if (i.bends) i.bends = []; }
      if (i.type === 'pdim') { i.x = 0; i.y = 0; }
    });
    var m2 = HX.physIdx(sh); sh.items.forEach(function (f) { // vista frontal atrás do conector, no eixo dele
      if (f.type !== 'pface' || !m2[f.of]) return; var nd = m2[f.of], u = HX.physDirAt ? HX.physDirAt(nd, sh, m2) || [1, 0] : [1, 0], L = (+nd._L || 30) * 0.85 + 8 + Math.max((+f.w || 14) / 2, f._bb ? (f._bb.x1 - f._bb.x0) / 2 : 16); f.x = HX.r3(-u[0] * L); f.y = HX.r3(-u[1] * L);
    });
    if (HX.physArrangeLabels) HX.physArrangeLabels(sh);
    return cs.length;
  };
  // geração nova: já sai na disposição do esquemático
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Posicionar como no esquemático', function () {
    var doc = app.doc, sh = doc.cur(); if (!HX.isPhys(sh)) return HX.UI.toast('Abra a folha do desenho físico.', true);
    var n = 0; doc.change('Posicionar como no esquemático', function () { n = HX.physLayoutLikeSchem(doc, sh); }); app.view.fit(); HX.UI.toast(n ? 'Conectores e derivações na disposição do esquemático.' : 'Precisa de 2 ou mais conectores.');
  }, '']; }]);
  if (HX.RIBBON) HX.RIBBON.forEach(function (T) { if (T[0] === 'Desenho físico') T[1].forEach(function (gr) { if (gr[0] === 'Ramificação') gr[1].unshift('*m:Ferramentas/Posicionar como no esquemático'); }); });
})(typeof window !== 'undefined' ? window : globalThis);
