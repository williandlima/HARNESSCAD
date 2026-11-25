/* Modelos de cabo (cat_cable.js): inserir cria as vias com trança/blindagem/dreno; transformar fios em cabo; BOM; ERC nº de vias */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('Modelos de cabo');
test('cabo do catálogo: N vias no passo dos pinos, pares trançados, oval da blindagem com todas as vias, PN na lista de materiais', function () {
  var d = new HX.Doc(), r; d.change('c', function () { r = HX.cableInsert(d, HX.CABLE_LIB['BLD-TP'], [60, 60], { model: 'BLD-TP', vias: 5, tw: true, gauge: '24', pn: 'M27500-24XX5' }); });
  eq(r.wires.length, 5); eq(r.wires.map(function (w) { return w.twist; }), ['TP1', 'TP1', 'TP2', 'TP2', ''], 'última via sozinha não trança');
  ok(r.wires.every(function (w) { return w.gauge === '24'; }), 'bitola'); eq(r.wires[1].pts[0][1] - r.wires[0].pts[0][1], 2 * d.p.unit, 'passo dos pinos');
  eq(HX.cableWires(d, r.cable).length, 5); eq([r.cable.vias, r.cable.shield, r.cable.part, r.cable.model], [5, true, 'M27500-24XX5', 'BLD-TP']);
  ok(HX.buildBOM(d.p).some(function (x) { return x.pn === 'M27500-24XX5'; }), 'PN do cabo na lista de materiais');
  eq(HX.runERC(d.p).filter(function (e) { return e.rule === 'cableVias'; }).length, 0);
});
test('transformar fios desenhados em cabo: oval atravessa todos, trança aplicada, ligações iguais; ERC quando falta via', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 160, 40)); a.ref = 'J1'; b.ref = 'J2';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:B\nJ1:B > J2:A\nJ1:C > J2:C')); });
  var n0 = HX.buildNetlist(d.p).nets.length, W = d.items().filter(function (i) { return i.type === 'wire'; }), r;
  d.change('t', function () { r = HX.cableApply(d, W, HX.CABLE_LIB.STP, null, { model: 'STP', tw: true }); });
  ok(r && r.cable, r && r.err); eq(HX.cableWires(d, r.cable).length, 3); eq(HX.buildNetlist(d.p).nets.length, n0, 'ligações iguais');
  eq(r.wires.map(function (w) { return w.twist; }), ['TP1', 'TP1', '']);
  r.cable.vias = 4; ok(HX.runERC(d.p).some(function (e) { return e.rule === 'cableVias' && /3 fio/.test(e.msg); }), 'ERC: 3 fios × 4 vias');
});
test('modelos M27500, LiYCY e STP marcados "aguardando datasheet" (nada inventado) com o que falta', function () {
  ['M27500', 'LiYCY', 'STP'].forEach(function (k) { var m = HX.CABLE_LIB[k]; ok(m && m.ok === false && m.need.length > 10, k); });
});
