/* HarnessCAD - desenho físico: VARIANTES (opções do mesmo chicote).
   Folha: variants = "A,B,C", variant = exibida ('' = todas). Item (nó, ramo, item do ramo, imagem, cobertura): var = "A,B"
   (vazio = em todas). Com uma variante exibida, o desenho, a seleção, o feixe, os comprimentos e a lista de materiais
   consideram só o que existe nela (dependentes de um item oculto também somem). */
(function (G) {
  'use strict';
  var HX = G.HX, REFS = { pseg: ['a', 'b'], pdim: ['a', 'b', 'seg'], pnote: ['of'], pball: ['of'], pface: ['of'], ptable: ['of'], pcov: ['a', 'b'], pacc: ['seg'], ptag: ['seg'], pflag: ['of'], pang: ['node', 's1', 's2'], pprep: ['of'] };
  function has(it, v) { var s = String(it['var'] || '').trim(); return !s || s.split(/[,;\s]+/).indexOf(v) >= 0; }
  HX.physVarList = function (sh) { return String(sh.variants || '').split(/[,;\s]+/).filter(Boolean); };
  HX.physVisible = function (sh) {
    var v = sh && sh.variant; if (!v) return null;
    var hid = {}; sh.items.forEach(function (i) { if (!has(i, v)) hid[i.id] = 1; });
    for (var k = 0; k < 3; k++) sh.items.forEach(function (i) { if (!hid[i.id] && (REFS[i.type] || []).some(function (f) { return i[f] && hid[i[f]]; })) hid[i.id] = 1; });
    return sh.items.filter(function (i) { return !hid[i.id]; });
  };
  var busy = null;
  function withVar(sh, fn) {
    if (!sh || !sh.variant || busy === sh || !HX.isPhys(sh)) return fn();
    var all = sh.items, vis = HX.physVisible(sh); busy = sh; sh.items = vis;
    try { return fn(); } finally { sh.items = all; busy = null; }
  }
  HX.physWithVar = withVar;
  var dr = HX.drawSheetItems;
  HX.drawSheetItems = function (g, p, s, o) {
    var sh = p.sheets[s]; if (!sh || !sh.variant || !HX.isPhys(sh) || busy === sh) return dr(g, p, s, o);
    withVar(sh, function () { dr(g, p, s, o); });
    if (!o._inDetail) { var M = HX.frameMargins(p); g.text('VARIANTE ' + sh.variant, M.l + 10, M.t + 22, { size: 3, bold: true, color: sh.lineColor || '#c00' }); }
  };
  var bom = HX.physBom; HX.physBom = function (p, sh) { return withVar(sh, function () { return bom(p, sh); }); };
  var bun = HX.physBundle; HX.physBundle = function (p, sh) { return withVar(sh, function () { return bun(p, sh); }); };
  var cl = HX.computeLengths;
  HX.computeLengths = function (p, nl) {
    var sh = HX.physSheet(p); if (!sh || !sh.variant) return cl(p, nl);
    var L = withVar(sh, function () { return cl(p, nl); }), pns = {}, k = L.scrap || 1;
    p.sheets.forEach(function (S) { if (!HX.isPhys(S)) S.items.forEach(function (w) { var e = w.type === 'wire' && L.wires[w.id] && L.wires[w.id].eff; if (!(e > 0)) return; var pn = HX.wirePN(w), t = pns[pn] || (pns[pn] = { pn: pn, n: 0, mm: 0, semCota: 0 }); t.n++; t.mm += e; }); });
    L.pns = Object.keys(pns).sort().map(function (x) { var t = pns[x]; t.m = t.mm * k / 1000; return t; }); L.variant = sh.variant;
    return L;
  };
  // seleção e clique: só o que está na variante exibida
  var it0 = HX.Doc.prototype.items;
  HX.Doc.prototype.items = function () { var sh = this.cur && this.cur(); return sh && sh.variant && HX.isPhys(sh) && busy !== sh ? HX.physVisible(sh) : it0.apply(this, arguments); };
})(typeof window !== 'undefined' ? window : globalThis);
