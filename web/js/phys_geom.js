/* HarnessCAD - desenho físico: geometria e dados comuns.
   Ramo reto ou curvo (x,y do ramo = deslocamento do meio da curva; arrastar o ramo o curva), âncoras de itens presos
   (rótulo, balão, vista frontal guardam x,y relativos à âncora), caminho entre nós, lista de materiais e de ligações. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.HITPR = { pball: 0, pnote: 0.5, pdim: 1, pseg: 2, pface: 3, pimg: 3.5, pnode: 4, ptable: 6 };
  HX.physIdx = function (sh) { var m = {}; sh.items.forEach(function (i) { m[i.id] = i; }); return m; };
  // pontos do ramo (curva quadrática que passa pelo meio deslocado)
  HX.physSegPts = function (sg, m) {
    var A = m[sg.a], B = m[sg.b]; if (!A || !B) return null;
    var bx = +sg.x || 0, by = +sg.y || 0; if (!bx && !by) return [[A.x, A.y], [B.x, B.y]];
    var cx = (A.x + B.x) / 2 + 2 * bx, cy = (A.y + B.y) / 2 + 2 * by, out = [];
    for (var i = 0; i <= 24; i++) { var t = i / 24, u = 1 - t; out.push([u * u * A.x + 2 * u * t * cx + t * t * B.x, u * u * A.y + 2 * u * t * cy + t * t * B.y]); }
    return out;
  };
  HX.polyLen = function (P) { var L = 0; for (var i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  HX.polyAt = function (P, f) { // ponto e direção a uma fração do comprimento
    var T = HX.polyLen(P) * f, acc = 0;
    for (var i = 1; i < P.length; i++) {
      var l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
      if (acc + l >= T || i === P.length - 1) { var k = l ? (T - acc) / l : 0; return { pt: [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k], d: [(P[i][0] - P[i - 1][0]) / (l || 1), (P[i][1] - P[i - 1][1]) / (l || 1)] }; }
      acc += l;
    }
    return { pt: P[0], d: [1, 0] };
  };
  // âncora de um item (onde rótulo/balão/vista se prendem)
  HX.physAnchor = function (it, m) {
    if (!it) return null;
    if (it.type === 'pseg') { var P = HX.physSegPts(it, m); return P ? HX.polyAt(P, 0.5).pt : null; }
    if (it.type === 'pdim') return null;
    return [it.x, it.y];
  };
  // direção (unitária) de saída do nó para dentro do ramo
  HX.physDirAt = function (nd, sh, m) {
    var sg = sh.items.filter(function (i) { return i.type === 'pseg' && (i.a === nd.id || i.b === nd.id); })[0]; if (!sg) return null;
    var P = HX.physSegPts(sg, m); if (!P) return null; if (sg.b === nd.id) P = P.slice().reverse();
    var q = P[1], l = Math.hypot(q[0] - P[0][0], q[1] - P[0][1]) || 1; return [(q[0] - P[0][0]) / l, (q[1] - P[0][1]) / l];
  };
  // caminho entre dois nós pelos ramos: soma dos comprimentos reais (cota total)
  HX.physPathLen = function (sh, a, b) {
    var adj = {}; sh.items.forEach(function (s) { if (s.type === 'pseg') { (adj[s.a] = adj[s.a] || []).push(s); (adj[s.b] = adj[s.b] || []).push(s); } });
    var prev = {}, q = [a], seen = {}; seen[a] = 1;
    while (q.length) { var u = q.shift(); if (u === b) break; (adj[u] || []).forEach(function (s) { var v = s.a === u ? s.b : s.a; if (!seen[v]) { seen[v] = 1; prev[v] = s; q.push(v); } }); }
    if (!seen[b]) return null;
    var L = 0, n = b, miss = false; while (n !== a) { var s = prev[n], l = parseFloat(s.len); if (!(l >= 0)) miss = true; L += l || 0; n = s.a === n ? s.b : s.a; }
    return { len: L, missing: miss };
  };
  // itens do esquemático (fora das folhas físicas)
  HX.physSchem = function (p) { var o = {}; p.sheets.forEach(function (sh) { if (!HX.isPhys(sh)) sh.items.forEach(function (i) { o[i.id] = i; }); }); return o; };
  // lista de materiais do desenho: conectores (por PN), fios (por PN, metros), coberturas, acessórios
  HX.physBom = function (p, sh) {
    var S = HX.physSchem(p), M = HX.physIdx(sh), rows = [], key = {};
    function add(k, pn, desc, qty, un) { if (key[k]) { key[k].qty += qty; return key[k]; } var r = { k: k, pn: pn, desc: desc, qty: qty, un: un || 'pç' }; rows.push(r); key[k] = r; return r; }
    sh.items.forEach(function (n) { if (n.type !== 'pnode' || n.nkind !== 'conn') return; var c = S[n.of]; if (!c) return; var pn = HX.connPN(c); add('c:' + pn, pn, (HX.CAT.conns[c.part] || {}).desc || c.part, 1); });
    var info = HX.computeLengths ? HX.computeLengths(p) : null;
    if (info) info.pns.forEach(function (w) { add('w:' + w.pn, w.pn, 'Fio', Math.round(w.m * 100) / 100, 'm'); });
    sh.items.forEach(function (s) { if (s.type === 'pseg' && s.cover && HX.PSPR[s.cover]) add('v:' + s.cover + ':' + (s.coverTxt || ''), s.coverTxt || '', HX.PSPR[s.cover].name, Math.round(HX.physSegLen(s, M, +sh.scale || 1) / 10) / 100, 'm'); });
    sh.items.forEach(function (i) { if (i.type === 'pimg' && HX.PSPR[i.sprite]) add('a:' + i.sprite + ':' + (i.pn || ''), i.pn || '', HX.PSPR[i.sprite].name, 1); });
    rows.forEach(function (r, i) { r.n = i + 1; });
    return { rows: rows, key: key };
  };
  // chave de material de um item (para o número do balão)
  HX.physItemKey = function (p, it, m) {
    var S = HX.physSchem(p);
    if (it.type === 'pnode' && it.nkind === 'conn' && S[it.of]) return 'c:' + HX.connPN(S[it.of]);
    if (it.type === 'pseg' && it.cover) return 'v:' + it.cover + ':' + (it.coverTxt || '');
    if (it.type === 'pimg') return 'a:' + it.sprite + ':' + (it.pn || '');
    return null;
  };
  // ligações (de-para) dos fios do esquemático
  HX.physWiring = function (p) {
    var nl = HX.buildNetlist(p), rows = [];
    function end(s, pt) {
      var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])], t = nd && nd.terms.filter(function (x) { return x.kind === 'pin' || x.kind === 'splice'; })[0];
      if (!t) return { ref: '—', pin: '', name: '' };
      return { ref: t.ref || (t.it && t.it.ref) || '', pin: t.pin != null ? String(t.pin) : '', name: t.name || '' };
    }
    p.sheets.forEach(function (sh, s) {
      if (HX.isPhys(sh)) return;
      sh.items.forEach(function (w) {
        if (w.type !== 'wire' || w.pts.length < 2) return;
        var a = end(s, w.pts[0]), b = end(s, w.pts[w.pts.length - 1]);
        rows.push({ twist: w.twist || '', num: w.num || '', name: w.name || a.name || b.name || '', from: a, to: b, color: (HX.COLORS[w.color] || [w.color])[0] || '', gauge: HX.gaugeLabel(w) });
      });
    });
    return rows;
  };
})(typeof window !== 'undefined' ? window : globalThis);
