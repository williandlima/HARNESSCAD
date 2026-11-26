/* v1.9.9: bitola/tipo/cor/trança aplicados de uma vez em todas as vias do cabo (HX.cableSpecSet) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.9 — bitola do cabo em lote');
test('bitola do cabo: muda todas as vias do cabo e nenhum fio fora dele; tipo novo ajusta bitola inválida; trança liga/desliga', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 160, 40)), r; a.ref = 'J1'; b.ref = 'J2';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:K > J2:K')); r = HX.cablePins(d, HX.CABLE_LIB['BLD-TP'], 'J1:A,B,C', 'J2:A,B,C', { tw: true }); });
  var W = HX.cableWires(d, r.cable), fora = d.items().filter(function (w) { return w.type === 'wire' && W.indexOf(w) < 0; });
  eq(W.length, 3); d.change('g', function () { eq(HX.cableSpecSet(d, W, { gauge: '18' }), 3); });
  eq(W.map(function (w) { return w.gauge; }), ['18', '18', '18']); ok(fora.every(function (w) { return w.gauge !== '18'; }), 'fio fora do cabo não muda');
  eq(HX.specCommon(W, 'gauge'), '18'); W[0].gauge = '20'; eq(HX.specCommon(W, 'gauge'), null, 'misto');
  d.change('t', function () { HX.cableSpecSet(d, W, { gauge: '30' }); }); ok(HX.wireType(W[0].wtype).gauges.indexOf(W[0].gauge) >= 0, 'bitola fora da lista vai para a mais próxima');
  d.change('w0', function () { HX.cableSpecSet(d, W, { tw: false }); }); eq(W.map(function (w) { return w.twist; }), ['', '', '']);
  d.change('w1', function () { HX.cableSpecSet(d, W, { tw: true }); }); ok(W[0].twist && W[0].twist === W[1].twist && W[2].twist === '', 'pares na ordem, última sozinha');
  d.change('c', function () { HX.cableSpecSet(d, W, { color: 'RD' }); }); eq(HX.specCommon(W, 'color'), 'RD');
});
