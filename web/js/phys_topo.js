/* HarnessCAD - desenho físico: edição da TOPOLOGIA (ramificação), como no esquemático.
   Derivar em qualquer ponto do ramo, ligar dois nós por um ramo novo, mudar a ponta de um ramo para outro nó/ramo
   (muda de onde o ramo sai), apagar um BR intermediário (os dois ramos viram um só). */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  function nextBR(sh) { var n = 0; sh.items.forEach(function (i) { var m = /^BR(\d+)$/.exec(i.ref || ''); if (m) n = Math.max(n, +m[1]); }); return 'BR' + (n + 1); }
  HX.physNextBR = nextBR;
  function segsOf(sh, id) { return sh.items.filter(function (i) { return i.type === 'pseg' && (i.a === id || i.b === id); }); }
  HX.physSegsOf = segsOf;
  function isFree(n) { return n && n.type === 'pnode' && n.nkind !== 'conn' && n.nkind !== 'splice'; }
  // item sob o cursor: nó (prioridade) ou ponto sobre um ramo
  HX.physPick = function (sh, pt, tol, skip) {
    var m = HX.physIdx(sh), best = null, bd = tol;
    sh.items.forEach(function (n) { if (n.type !== 'pnode' || (skip && skip[n.id])) return; var d = Math.hypot(n.x - pt[0], n.y - pt[1]); if (d < bd) { bd = d; best = { node: n }; } });
    if (best) return best; bd = tol;
    sh.items.forEach(function (s) {
      if (s.type !== 'pseg' || (skip && skip[s.id])) return; var P = s._P || HX.physSegPts(s, m); if (!P) return;
      var acc = 0, L = HX.polyLen(P) || 1;
      for (var i = 1; i < P.length; i++) {
        var a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, k = l2 ? Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / l2)) : 0;
        var q = [a[0] + dx * k, a[1] + dy * k], d = Math.hypot(q[0] - pt[0], q[1] - pt[1]), l = Math.sqrt(l2);
        if (d < bd) { bd = d; best = { seg: s, pt: q, t: (acc + l * k) / L }; }
        acc += l;
      }
    });
    return best;
  };
  // divide o ramo na fração t (0..1 ao longo do traçado): novo BR, comprimentos proporcionais (se digitados)
  HX.physSplitAt = function (doc, sg, t) {
    var sh = doc.cur(), m = HX.physIdx(sh), P = HX.physSegPts(sg, m); if (!P) return null;
    t = Math.max(0.02, Math.min(0.98, t == null ? 0.5 : t));
    var q = HX.polyAt(P, t).pt, L = parseFloat(sg.len), typed = L >= 0;
    var nd = doc.add({ type: 'pnode', id: doc.uid('n'), of: '', ref: nextBR(sh), nkind: 'brk', x: HX.r3(q[0]), y: HX.r3(q[1]) });
    var s2 = doc.add({ type: 'pseg', id: doc.uid('g'), a: nd.id, b: sg.b, len: typed ? L - Math.round(L * t) : '', tolP: sg.tolP, tolM: sg.tolM, dim: '', cover: sg.cover, coverTxt: sg.coverTxt, x: 0, y: 0 });
    sg.b = nd.id; sg.len = typed ? Math.round(L * t) : ''; sg.x = 0; sg.y = 0; sg.dim = '';
    var had = false;
    sh.items.forEach(function (d) { if (d.type === 'pdim' && d.seg === sg.id) { d.a = sg.a; d.b = nd.id; had = true; } });
    if (had) doc.add({ type: 'pdim', id: doc.uid('a'), a: nd.id, b: s2.b, seg: s2.id, mode: 'seg', x: 0, y: 0, off: 6, text: '', tolP: '', tolM: '' });
    doc.add({ type: 'pnote', id: doc.uid('a'), of: nd.id, x: 3, y: -5, text: '' });
    return nd;
  };
  HX.physSplitSeg = function (doc, sg) { return HX.physSplitAt(doc, sg, 0.5); };
  // destino de um clique/soltura: nó existente, ramo (deriva ali) ou ponto livre (novo BR)
  HX.physNodeAt = function (doc, pick, pt, free) {
    if (pick && pick.node) return pick.node;
    if (pick && pick.seg) return HX.physSplitAt(doc, pick.seg, pick.t);
    if (!free) return null;
    var sh = doc.cur(); return doc.add({ type: 'pnode', id: doc.uid('n'), of: '', ref: nextBR(sh), nkind: 'brk', x: HX.r3(pt[0]), y: HX.r3(pt[1]) });
  };
  HX.physConnect = function (doc, A, B) {
    if (!A || !B || A.id === B.id) return null;
    var sg = doc.add({ type: 'pseg', id: doc.uid('g'), a: A.id, b: B.id, len: '', tolP: '', tolM: '', dim: '', cover: '', coverTxt: '', x: 0, y: 0 });
    doc.add({ type: 'pdim', id: doc.uid('a'), a: A.id, b: B.id, seg: sg.id, mode: 'seg', x: 0, y: 0, off: 6, text: '', tolP: '', tolM: '' });
    if (isFree(B) && !doc.cur().items.some(function (i) { return i.type === 'pnote' && i.of === B.id; })) doc.add({ type: 'pnote', id: doc.uid('a'), of: B.id, x: 3, y: -5, text: '' });
    return sg;
  };
  // BR intermediário (2 ramos) sai: os dois ramos viram um
  HX.physMergeBR = function (doc, nd, sh0) {
    var sh = sh0 || doc.cur(), ss = segsOf(sh, nd.id); if (!isFree(nd) || ss.length !== 2) return false;
    var s1 = ss[0], s2 = ss[1], o2 = s2.a === nd.id ? s2.b : s2.a; if (o2 === (s1.a === nd.id ? s1.b : s1.a)) return false;
    var m = HX.physIdx(sh), N = +sh.scale || 1, M1 = HX.physSegLen(s1, m, N), M2 = HX.physSegLen(s2, m, N), atA = s1.a === nd.id;
    var L1 = parseFloat(s1.len), L2 = parseFloat(s2.len), kill = [s2.id, nd.id];
    sh.items.forEach(function (d) { // itens no ramo: distância passa a valer no ramo junto
      if ((d.type === 'pacc' || d.type === 'ptag') && (d.seg === s1.id || d.seg === s2.id)) {
        var x = +d.dist || 0, from = d.seg === s1.id ? (d.end === 'b' ? s1.b : s1.a) : (d.end === 'b' ? s2.b : s2.a);
        if (d.seg === s1.id) { if (from === nd.id) { d.dist = HX.r3(M2 + x); d.end = atA ? 'a' : 'b'; } }
        else { var fromNd = from === nd.id ? x : M2 - x; d.seg = s1.id; d.end = atA ? 'a' : 'b'; d.dist = HX.r3(M2 - fromNd); }
      }
    });
    if (atA) s1.a = o2; else s1.b = o2;
    s1.len = L1 >= 0 && L2 >= 0 ? HX.r3(L1 + L2) : ''; s1.x = 0; s1.y = 0; s1.cover = s1.cover || s2.cover; s1.coverTxt = s1.coverTxt || s2.coverTxt;
    sh.items.forEach(function (d) {
      if (d.type === 'pdim' && d.seg === s1.id) { d.a = s1.a; d.b = s1.b; }
      else if (d.type === 'pdim' && (d.seg === s2.id || d.a === nd.id || d.b === nd.id)) kill.push(d.id);
      if (d.type === 'pcov') { if (d.a === nd.id) d.a = o2; if (d.b === nd.id) d.b = o2; }
      if (d.of === nd.id) kill.push(d.id);
    });
    sh.items = sh.items.filter(function (i) { return kill.indexOf(i.id) < 0; }); kill.forEach(function (id) { doc.sel && doc.sel.delete(id); });
    void M1; return true;
  };
  // tira os pontos de derivação que não derivam nada (2 ramos): onlyVirt = só os automáticos
  HX.physCleanBR = function (doc, sh, onlyVirt) {
    var n = 0, go = true;
    while (go) { go = false; sh.items.filter(function (i) { return i.type === 'pnode' && (i.nkind === 'virt' || (!onlyVirt && i.nkind === 'brk')); }).some(function (nd) { if (segsOf(sh, nd.id).length === 2 && HX.physMergeBR(doc, nd, sh)) { n++; go = true; return true; } return false; }); }
    return n;
  };
  // muda a ponta 'a'|'b' do ramo para outro nó
  HX.physReattach = function (doc, sg, end, node) {
    var other = end === 'a' ? sg.b : sg.a, old = sg[end]; if (!node || node.id === other || node.id === old) return false;
    var sh = doc.cur(), m = HX.physIdx(sh); sg[end] = node.id; sg.x = 0; sg.y = 0; sg.dim = '';
    sh.items.forEach(function (d) { if (d.type === 'pdim' && d.seg === sg.id) { d.a = sg.a; d.b = sg.b; } });
    var on = m[old];
    if (isFree(on)) { var n = segsOf(sh, old).length; if (n === 0) doc.removeIds([old]); else if (n === 2) HX.physMergeBR(doc, on); }
    return true;
  };
  // apagar: BR intermediário selecionado sozinho vira emenda dos ramos (não apaga o chicote)
  var del0 = ops.deleteSel;
  ops.deleteSel = function (doc) {
    var sh = doc.cur(); if (!HX.isPhys(sh)) return del0(doc);
    var ids = Array.from(doc.sel), set = {}; ids.forEach(function (i) { set[i] = 1; });
    var m = HX.physIdx(sh), merge = ids.filter(function (id) { var n = m[id]; return isFree(n) && segsOf(sh, id).length === 2 && !segsOf(sh, id).some(function (s) { return set[s.id]; }); });
    if (!merge.length) return del0(doc);
    doc.change('Excluir', function () {
      merge.forEach(function (id) { var n = HX.physIdx(sh)[id]; if (n) HX.physMergeBR(doc, n); });
      var rest = ids.filter(function (id) { return merge.indexOf(id) < 0 && HX.physIdx(sh)[id]; }); if (rest.length) doc.removeIds(rest);
    });
    return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
