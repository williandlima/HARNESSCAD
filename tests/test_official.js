/* HarnessCAD - biblioteca oficial: contato pela bitola, tampões, fontes */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function wireTo(d, c, pinN, gauge, wtype) {
  var P = HX.connLayout(c, d.p.unit).pins.filter(function (q) { return q.n === pinN; })[0];
  var w = HX.ops.addWire(d, [P.pt, [P.pt[0] + 15, P.pt[1]]]); w.gauge = gauge; if (wtype) w.wtype = wtype; return w;
}
test('contato escolhido pela bitola do fio (Deutsch, Micro-Fit, JST XH)', function () {
  var d = new HX.Doc(), dt = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)); dt.gender = 'P';
  eq(HX.contactFor(dt, dt.pins[0], 18).pn, '0460-202-16141'); eq(HX.contactFor(dt, dt.pins[0], 14).pn, '0460-215-16141');
  ok(!HX.contactFor(dt, dt.pins[0], 22).fit, '22 AWG não cabe no #16');
  var m = d.add(HX.makeConn(d, 'DTM:4 vias', 0, 0)); m.gender = 'S'; eq(HX.contactFor(m, m.pins[0], 18).pn, '0462-005-20141'); eq(HX.contactFor(m, m.pins[0], 22).pn, '0462-201-20141');
  var mf = d.add(HX.makeConn(d, 'MicroFit:8 vias', 0, 0)); eq(HX.contactFor(mf, mf.pins[0], 28).pn, '43030-0005'); eq(HX.contactFor(mf, mf.pins[0], 22).pn, '43030-0001');
  eq(HX.contactFor(mf, mf.pins[0]).rtxt, '20–24 ou 26–30 AWG');
});
test('ERC aceita fio coberto por qualquer opção de contato', function () {
  var d = new HX.Doc(), dt = d.add(HX.makeConn(d, 'DT:4 vias', 20, 20)), w = wireTo(d, dt, '1', '14');
  eq(HX.gaugeIssues(d.p)[w.id], undefined, '14 AWG tem contato próprio');
  w.gauge = '22'; var x = HX.gaugeIssues(d.p)[w.id][0]; ok(/16–20 ou 14 AWG/.test(HX.gaugeMsg(x)), HX.gaugeMsg(x));
});
test('BOM: PN do contato pela bitola e tampões nas cavidades vazias do conector vedado', function () {
  var d = new HX.Doc(), dt = d.add(HX.makeConn(d, 'DT:4 vias', 20, 20)); dt.gender = 'P';
  wireTo(d, dt, '1', '14'); wireTo(d, dt, '2', '18');
  var bom = HX.buildBOM(d.p), by = {}; bom.forEach(function (r) { by[r.pn] = r; });
  eq(by['0460-215-16141'].qty, 1); eq(by['0460-202-16141'].qty, 1); eq(by['0413-217-1605'].qty, 2, 'tampões nas 2 cavidades vazias');
  var j = d.add(HX.makeConn(d, 'D38999:11-35', 120, 20)); bom = HX.buildBOM(d.p).filter(function (r) { return r.pn === 'MS27488-22-2'; }); eq(bom[0].qty, 13);
});
test('famílias da biblioteca oficial têm fonte e faixas válidas', function () {
  var n = 0;
  Object.keys(HX.CAT.fams).forEach(function (k) {
    var f = HX.CAT.fams[k]; if (!f.official) return; n++;
    ok(f.src && f.src.length > 10, k + ' sem fonte');
    Object.keys(f.contacts).forEach(function (s) { [].concat(f.contacts[s]).forEach(function (o) { ok(o.p && o.s && o.awg && o.awg[0] <= o.awg[1], k + ' #' + s); }); });
  });
  ok(n >= 13, 'famílias oficiais: ' + n);
  eq(HX.CAT.fams.SUPERSEAL.contacts.SS.awg, [15, 18]); eq(HX.CAT.fams.MiniFit.contacts.MFJ.awg, [18, 24]);
});
