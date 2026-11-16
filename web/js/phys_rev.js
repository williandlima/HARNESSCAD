/* HarnessCAD - desenho físico: COMPARAR REVISÕES.
   "Congelar revisão" guarda um retrato (p.physRevs) dos ramos (por nós das pontas), conectores, itens do ramo
   e comprimentos de corte dos fios. Comparar lista o que mudou e destaca na tela os ramos/nós alterados. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function nk(n) { return n ? (n.of || n.ref || n.id) : '?'; }
  HX.physSnap = function (p) {
    var sh = HX.physSheet(p); if (!sh) return null;
    var m = HX.physIdx(sh), N = +sh.scale || 1, L = HX.computeLengths(p), s = { segs: {}, nodes: {}, acc: {}, wires: {} };
    sh.items.forEach(function (i) {
      if (i.type === 'pseg') { var k = [nk(m[i.a]), nk(m[i.b])].sort().join('|'); s.segs[k] = { len: HX.physSegLen(i, m, N), cover: i.cover || '', name: ((m[i.a] || {}).ref || '') + '–' + ((m[i.b] || {}).ref || '') }; }
      if (i.type === 'pnode' && i.nkind !== 'brk' && i.nkind !== 'virt') s.nodes[nk(i)] = { ref: i.ref || '', sprite: i.sprite || '' };
      if (i.type === 'pacc') { var g = m[i.seg]; s.acc[i.kind + ':' + (g ? [nk(m[g.a]), nk(m[g.b])].sort().join('|') : '') + ':' + (i.text || '')] = { dist: +i.dist || 0, name: HX.physAccLabel ? HX.physAccLabel(i) : i.kind }; }
    });
    p.sheets.forEach(function (S) { if (!HX.isPhys(S)) S.items.forEach(function (w) { if (w.type === 'wire') s.wires[w.num || w.id] = Math.round((L.wires[w.id] || {}).eff || 0); }); });
    return s;
  };
  HX.physFreeze = function (p, rev) {
    var s = HX.physSnap(p); if (!s) return null;
    p.physRevs = (p.physRevs || []).filter(function (r) { return r.rev !== rev; }); p.physRevs.push({ rev: rev, date: new Date().toISOString().slice(0, 10), snap: s });
    return s;
  };
  // diferenças: [{kind, key, txt}] e o que destacar (chaves de ramos/nós)
  HX.physDiff = function (p, rev) {
    var r = (p.physRevs || []).filter(function (x) { return x.rev === rev; })[0], cur = HX.physSnap(p); if (!r || !cur) return null;
    var o = r.snap, out = [], hlSeg = {}, hlNode = {};
    function cmp(A, B, kind, fmt) {
      Object.keys(B).forEach(function (k) { if (!(k in A)) out.push({ kind: kind, key: k, txt: 'novo: ' + fmt(B[k], k) }); });
      Object.keys(A).forEach(function (k) { if (!(k in B)) out.push({ kind: kind, key: k, txt: 'removido: ' + fmt(A[k], k) }); });
    }
    cmp(o.segs, cur.segs, 'ramo', function (v) { return v.name; }); cmp(o.nodes, cur.nodes, 'conector', function (v) { return v.ref; });
    cmp(o.acc, cur.acc, 'item', function (v) { return v.name; }); cmp(o.wires, cur.wires, 'fio', function (v, k) { return k; });
    Object.keys(cur.segs).forEach(function (k) { var a = o.segs[k], b = cur.segs[k]; if (a && (a.len !== b.len || a.cover !== b.cover)) { out.push({ kind: 'ramo', key: k, txt: b.name + ': ' + (a.len !== b.len ? a.len + ' → ' + b.len + ' mm' : '') + (a.cover !== b.cover ? ' cobertura ' + (a.cover || '—') + ' → ' + (b.cover || '—') : '') }); hlSeg[k] = 1; } });
    Object.keys(cur.segs).forEach(function (k) { if (!o.segs[k]) hlSeg[k] = 1; });
    Object.keys(cur.nodes).forEach(function (k) { var a = o.nodes[k], b = cur.nodes[k]; if (!a) hlNode[k] = 1; else if (a.ref !== b.ref || a.sprite !== b.sprite) { out.push({ kind: 'conector', key: k, txt: (a.ref !== b.ref ? a.ref + ' → ' + b.ref : b.ref + ': imagem trocada') }); hlNode[k] = 1; } });
    Object.keys(cur.acc).forEach(function (k) { var a = o.acc[k], b = cur.acc[k]; if (a && a.dist !== b.dist) out.push({ kind: 'item', key: k, txt: b.name + ': ' + a.dist + ' → ' + b.dist + ' mm' }); });
    Object.keys(cur.wires).forEach(function (k) { var a = o.wires[k], b = cur.wires[k]; if (a != null && a !== b) out.push({ kind: 'fio', key: k, txt: k + ': corte ' + a + ' → ' + b + ' mm' }); });
    return { rev: r, list: out, hlSeg: hlSeg, hlNode: hlNode };
  };
  // destaque na tela (não sai no PDF): nuvem laranja nos ramos/nós alterados
  var ov = HX.drawOverlay;
  HX.drawOverlay = function (g, p, s, o) {
    if (ov) ov(g, p, s, o);
    var D = G.app && G.app._revDiff, sh = p.sheets[s]; if (!D || !HX.isPhys(sh) || !(HX.CanvasG && g instanceof HX.CanvasG)) return;
    var m = HX.physIdx(sh); g.style({ stroke: '#ff7a00', lw: 1.2, fill: null, dash: [1.5, 1] });
    sh.items.forEach(function (i) {
      if (i.type === 'pseg' && D.hlSeg[[nk(m[i.a]), nk(m[i.b])].sort().join('|')]) { var P = HX.physSegPts(i, m); if (P) g.poly(P, false); }
      if (i.type === 'pnode' && D.hlNode[nk(i)]) g.circle(i.x, i.y, 6);
    });
    g.style({ dash: null });
  };
})(typeof window !== 'undefined' ? window : globalThis);
