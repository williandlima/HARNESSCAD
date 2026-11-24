/* Biblioteca de emendas pelo datasheet TE (cat_splice.js, splice_tab.js, splice_sel.js): exemplos do próprio datasheet,
   integridade das tabelas, PN automático na lista de materiais, ERC e prioridade do PN manual */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function W(g, n) { var a = []; for (var i = 0; i < (n || 1); i++) a.push({ cma: HX.SPLICE_CMA[g], awg: g }); return a; }
function pn(s, A, B) { var r = HX.spliceSelect(s, A, B); return r.pn || 'ERRO'; }
console.log('Emendas (datasheet TE)');
test('emendas: exemplos do datasheet TE dão o mesmo PN (p.11, p.14, p.15, p.24) e regras 1:1 / barril por lado', function () {
  eq(['B-155', 'CWT', 'D-110', 'D-1744'].map(function (s) { return pn(s, W(16), W(22)); }), ['B-155-9002', 'CWT-9002', 'D-110-41', 'D-1744-02'], 'p.11: 16 × 22 AWG');
  eq(pn('SGRP', W(12).concat(W(14, 2)), []), 'SGRP-3', 'p.14: 1×12 + 2×14'); eq(pn('SGRP', W(22, 2).concat(W(18), W(16)), []), 'SGRP-2', 'p.15: CMA 5834');
  eq(pn('D-436', W(22, 3), W(18)), 'D-436-52', 'p.24: 3×22 × 18 = barril azul (até 6 fios)'); eq(pn('D-436', W(22), W(22)), 'D-436-36');
  eq(pn('D-406', W(16), W(14)), 'D-406-0002'); eq(pn('D-200', W(22), W(20)), 'D-200-82');
  ok(/1:1|1 fio de cada lado/.test(HX.spliceSelect('D-406', W(22, 2), W(18)).err)); ok(/sem barril comum/.test(HX.spliceSelect('D-436', W(26), W(12)).err));
  eq(pn('D-1744', W(22, 3), W(18)), 'D-1744-03', '3 fios num lado: Tabela E (CMA 4162)'); ok(/Ø externo/.test(HX.spliceSelect('D-1744', W(22, 3), W(18)).warn));
});
test('emendas: tabelas A/B/C completas (17×17, 16×16) e todo código aponta para um PN da biblioteca, com página da fonte', function () {
  Object.keys(HX.SPLICE_TAB).forEach(function (s) { var T = HX.SPLICE_TAB[s], P = HX.SPLICE_LIB[s].p.map(function (q) { return q[0]; });
    eq(T.R.length, T.K.length, s); T.R.forEach(function (r) { eq(r.length, T.K.length, s); r.split('').forEach(function (c) { ok(c === '-' || P.indexOf(T.Z[c]) >= 0, s + ' ' + c); }); }); });
  var seen = {}; Object.keys(HX.SPLICE_LIB).forEach(function (s) { var S = HX.SPLICE_LIB[s]; ok(S.pg && S.d && S.spec && S.tool, s + ' com fonte e dados'); S.p.forEach(function (q) { ok(!seen[q[0]], 'PN único ' + q[0]); seen[q[0]] = 1; }); });
  eq(HX.SPLICE_CMA[22], 754); eq(HX.SPLICE_CMA[16], 2426);
});
function cena(kind) { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 200, 40)), sp; a.ref = 'J1'; b.ref = 'J2';
  var P = function (c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }, y = P(a, 0)[1];
  d.change('x', function () { sp = HX.ops.placeSplice(d, [120, y]); sp.kind = kind; HX.ops.addWire(d, [P(a, 0), [120, y]]); HX.ops.addWire(d, [[120, y], P(b, 0)]); }); return { d: d, sp: sp }; }
test('emendas: PN automático na lista de materiais (MIL equivalente), troca com a bitola, ERC quando nada serve, PN manual tem prioridade', function () {
  var c = cena('crimp'), d = c.d, w = d.items().filter(function (i) { return i.type === 'wire'; });
  function bom() { return HX.buildBOM(d.p).filter(function (r) { return /Emenda/.test(r.cat); }).map(function (r) { return r.pn; }); }
  eq(bom(), ['M81824/1-1']); w.forEach(function (x) { x.gauge = '12'; }); eq(bom(), ['M81824/1-3']);
  w[0].gauge = '26'; ok(HX.runERC(d.p).some(function (e) { return e.rule === 'spliceSel' && /SP1/.test(e.msg); }), 'ERC avisa');
  c.sp.part = 'MEU-PN'; eq(bom(), ['MEU-PN']); ok(!HX.runERC(d.p).some(function (e) { return e.rule === 'spliceSel'; }), 'PN manual: sem aviso');
  var e = cena('solder'); eq(HX.splicePN(e.d.p, 0, e.sp).pn, 'D-1744-01', 'luva de solda padrão D-1744 (NAS 1744), 22×22'); e.sp.series = 'D-110'; eq(HX.splicePN(e.d.p, 0, e.sp).pn, 'D-110-41', 'Tabela B p.9: 22 × 22');
  var j = cena('junction'); eq(HX.splicePN(j.d.p, 0, j.sp), null, 'junção não é peça');
});
test('emendas: lista de materiais da prancha física recebe a emenda com o PN do datasheet', function () {
  var c = cena('solder'), r; c.d.change('g', function () { r = HX.applyPhysical(c.d, { scale: 5 }); });
  var B = HX.physBom(c.d.p, c.d.p.sheets[r.index]), row = B.rows.filter(function (x) { return /^sp:/.test(x.k); })[0];
  ok(row && row.pn === 'D-1744-01' && row.qty === 1 && /TE D-1744-01/.test(row.desc), JSON.stringify(row));
});
