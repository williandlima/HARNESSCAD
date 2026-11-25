/* v1.9.11: biblioteca só com as famílias de datasheet completo (D38999, MS3470/3476, D-Sub, M80) + equipamentos/discretos */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.11 — biblioteca com vista e desenho do datasheet');
test('catálogo/pesquisa: só D38999, MS34, D-Sub, M80, equipamentos, discretos; nada de família sem datasheet', function () {
  var F = {}; HX.searchConns('').forEach(function (e) { F[e.fam] = 1; });
  eq(Object.keys(F).sort(), ['D38999', 'DISC', 'DSUB', 'DSUBC', 'DSUBW', 'EQUIP', 'M24308', 'M80', 'MS3476'].sort());
  ['MS5015', 'MS26482', 'M83513', 'DT', 'JST-XH', 'M12'].forEach(function (f) { ok(!F[f], f + ' fora'); });
  eq(HX.CAT.fams.D38999.variants.map(function (v) { return v.v; }), ['26', '20', '24'], 'só estilos com desenho do datasheet');
});
test('toda peça da biblioteca tem VISTA e DESENHO do datasheet (conferido gerando o físico: nada "aguardando")', function () {
  HX.searchConns('').forEach(function (e) { var s = HX.libStatus(e.key); if (s.na) return; ok(s.face && s.side && s.ok, e.key); });
  var amostra = {}; HX.searchConns('').forEach(function (e) { if (HX.libGroup(e.fam).na) return; (amostra[e.fam] = amostra[e.fam] || []).push(e.key); });
  Object.keys(amostra).forEach(function (f) { var V = (HX.CAT.fams[f].variants || [{ v: '' }]).map(function (x) { return x.v; }), K = amostra[f];
    [K[0], K[K.length - 1]].forEach(function (k) { V.forEach(function (v) {
      var d = new HX.Doc(), a = d.add(HX.makeConn(d, k, 40, 40)), b = d.add(HX.makeConn(d, k, 200, 40)); a.ref = 'J1'; b.ref = 'J2'; if (v) { a.variant = v; b.variant = v; }
      d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:' + a.pins[0].n + ' > J2:' + a.pins[0].n)); });
      var r = HX.genPhysical(d.p, { scale: 5 }); d.p.sheets.push(r.sheet); eq(HX.physPendentes(d.p, r.sheet), [], k + ' /' + v); }); }); });
});
test('peça fora da biblioteca: projeto antigo abre e mostra "fora"; lista de fiação recusa declarar', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'MS5015:14S-2', 40, 40)); ok(c && c.pins.length, 'projeto antigo abre');
  ok(HX.libStatus('MS5015:14S-2').fora, 'marcado fora da biblioteca');
  var P = HX.wtParse(d, 'J9 = MS5015:14S-2\nJ8 = D38999:13-35'); eq(P.conns.map(function (x) { return x.ref; }), ['J8']); ok(/fora da biblioteca/.test(P.errors[0].msg));
});
test('pesquisa: arranjo, nº de vias e apelidos', function () {
  eq(HX.searchConns('3476 14-19')[0].key, 'MS3476:14-19'); eq(HX.searchConns('m80 2x5')[0].key, 'M80:2x5 (10 vias)'); ok(/DB-25/.test(HX.searchConns('db25')[0].key));
  ok(HX.searchConns('9 vias').every(function (e) { return e.n === 9; })); eq(HX.searchConns('', 'F:M80').length, 18);
});
