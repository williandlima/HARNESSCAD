/* HarnessCAD - desenho físico: edição.
   Arrastar: nó (ramos acompanham), ramo (curva), cota (afastamento/texto), rótulo/balão/vista (posição relativa), tabela.
   Mover um grupo não deforma o que já acompanha os nós selecionados. Apagar leva junto o que depende do item.
   Girar/espelhar imagens, colar religando, novo ramo (dividir/religar: phys_topo.js), cota entre nós, nova escala. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, PT = { pnode: 1, pimg: 1 };
  // campos que apontam para itens DESTA folha (pnode.of aponta para o esquemático e não entra)
  var REFS = { pseg: ['a', 'b'], pdim: ['a', 'b', 'seg'], pnote: ['of'], pball: ['of'], pface: ['of'], ptable: ['of'], pcov: ['a', 'b'], pacc: ['seg'], ptag: ['seg'], pflag: ['of'], pang: ['node', 's1', 's2'], pprep: ['of'] };
  var tr = ops.transform;
  ops.transform = function (doc, items, kind) {
    var all = doc.items(), rest = [];
    items.forEach(function (it) {
      if (!PT[it.type] || it.locked) { if (!HX.ITEM_EXT[it.type]) rest.push(it); return; }
      if (it.type === 'pnode' && it.nkind !== 'conn') return;
      if (kind === 'rot') { var a = it.type === 'pnode' ? HX.physAngle(it, all) : (+it.rot || 0); it.rot = Math.round(((a + 90) % 360 + 360) % 360); }
      else it.flip = !it.flip;
    });
    if (rest.length) tr(doc, rest, kind);
  };
  var pa = ops.pasteItems;
  ops.pasteItems = function (doc, items, dx, dy) {
    var out = pa(doc, items, dx, dy), map = {};
    items.forEach(function (s, i) { if (out[i]) map[s.id] = out[i].id; });
    out.forEach(function (it) { (REFS[it.type] || []).forEach(function (f) { if (it[f] && map[it[f]]) it[f] = map[it[f]]; }); });
    var got = {}; out.forEach(function (it) { got[it.id] = 1; });
    out.forEach(function (it) { // x,y relativos: a âncora colada já levou o deslocamento
      var rel = (it.type === 'pnote' || it.type === 'pball' || it.type === 'pface' || it.type === 'pflag') ? got[it.of] : it.type === 'pacc' || it.type === 'ptag' ? got[it.seg] : (it.type === 'pseg' || it.type === 'pdim') ? got[it.a] && got[it.b] : it.type === 'pang' ? got[it.node] : false;
      if (rel) { it.x = HX.r3((+it.x || 0) - dx); it.y = HX.r3((+it.y || 0) - dy); }
    });
    return out;
  };
  // itens presos (x,y relativos) ou definidos pelos nós não se movem por conta própria quando a âncora vai junto
  var bm = ops.beginMove;
  ops.beginMove = function (doc, ids, mode) {
    var set = {}; ids.forEach(function (i) { set[i] = 1; });
    var keep = ids.filter(function (id) {
      var it = doc.items().filter(function (q) { return q.id === id; })[0];
      if (!it) return true;
      if (it.type === 'pseg' || it.type === 'pdim') return !(set[it.a] && set[it.b]);
      if (it.type === 'pnote' || it.type === 'pball' || it.type === 'pface' || it.type === 'pflag') return !set[it.of];
      if (it.type === 'pang') return !set[it.node];
      if (it.type === 'pacc' || it.type === 'ptag') { var sg = doc.items().filter(function (q) { return q.id === it.seg; })[0]; return !(set[it.seg] || (sg && set[sg.a] && set[sg.b])); }
      return true;
    });
    doc.items().forEach(function (it) { if (set[it.id] && HX.ITEM_EXT[it.type]) { if (!isFinite(+it.x) || it.x === null) it.x = 0; if (!isFinite(+it.y) || it.y === null) it.y = 0; } });
    return bm(doc, keep, mode);
  };
  // apagar: leva junto ramos, cotas, rótulos, balões e vistas que dependiam do item
  HX.physClean = function (doc) {
    var sh = doc.cur(); if (!HX.isPhys(sh)) return false;
    var any = false;
    for (var k = 0; k < 3; k++) {
      var ids = {}; sh.items.forEach(function (i) { ids[i.id] = 1; });
      var bad = sh.items.filter(function (i) { return (REFS[i.type] || []).some(function (f) { return i[f] && !ids[i[f]]; }); }).map(function (i) { return i.id; });
      if (!bad.length) break; doc.removeIds(bad); any = true;
    }
    return any;
  };
  var tc = HX.Doc.prototype.touch;
  HX.Doc.prototype.touch = function () { HX.physClean(this); return tc.apply(this, arguments); };
  function nextBR(sh) { var n = 0; sh.items.forEach(function (i) { var m = /^BR(\d+)$/.exec(i.ref || ''); if (m) n = Math.max(n, +m[1]); }); return 'BR' + (n + 1); }
  // novo ramo saindo de um nó (perpendicular ao ramo existente), com ponta livre
  HX.physAddBranch = function (doc, from) {
    var sh = doc.cur(), m = HX.physIdx(sh), d = HX.physDirAt(from, sh, m) || [1, 0], N = +sh.scale || 1, Lp = 150 / N;
    var nd = doc.add({ type: 'pnode', id: doc.uid('n'), of: '', ref: nextBR(sh), nkind: 'brk', x: HX.r3(from.x - d[1] * Lp), y: HX.r3(from.y + d[0] * Lp) });
    var sg = doc.add({ type: 'pseg', id: doc.uid('g'), a: from.id, b: nd.id, len: '', tolP: '', tolM: '', dim: '', cover: '', coverTxt: '', x: 0, y: 0 });
    doc.add({ type: 'pdim', id: doc.uid('a'), a: from.id, b: nd.id, seg: sg.id, mode: 'seg', x: 0, y: 0, off: 6, text: '', tolP: '', tolM: '' });
    doc.add({ type: 'pnote', id: doc.uid('a'), of: nd.id, x: 3, y: -5, text: '' });
    return nd;
  };
  HX.physAddDim = function (doc, a, b, mode) { return doc.add({ type: 'pdim', id: doc.uid('a'), a: a.id, b: b.id, seg: '', mode: mode || 'path', x: 0, y: 0, off: 12, text: '', tolP: '', tolM: '' }); };
  HX.physAddBalloon = function (doc, it) { return doc.add({ type: 'pball', id: doc.uid('a'), of: it.id, x: 8, y: -10, n: '' }); };
  // nova escala: reposiciona os nós em torno do centro (ramos mantêm a proporção com o comprimento real)
  HX.physRescale = function (sh, N) {
    var old = +sh.scale || 1, k = old / N, ns = sh.items.filter(function (i) { return i.type === 'pnode' || i.type === 'pimg'; });
    if (ns.length && N > 0) {
      var cx = ns.reduce(function (a, i) { return a + i.x; }, 0) / ns.length, cy = ns.reduce(function (a, i) { return a + i.y; }, 0) / ns.length;
      ns.forEach(function (i) { i.x = HX.r3(cx + (i.x - cx) * k); i.y = HX.r3(cy + (i.y - cy) * k); });
      sh.items.forEach(function (i) { if (i.type === 'pseg') { i.x = HX.r3((+i.x || 0) * k); i.y = HX.r3((+i.y || 0) * k); } if (i.type === 'text' && /ESCALA 1:/.test(i.text)) i.text = i.text.replace(/ESCALA 1:[\d.,]+/, 'ESCALA 1:' + String(N).replace('.', ',')); });
    }
    sh.scale = N;
  };
})(typeof window !== 'undefined' ? window : globalThis);
