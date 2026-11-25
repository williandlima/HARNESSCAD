/* v1.9.6: faixa sem ferramentas repetidas, nome das vias (duas pontas), cabo direto nos pinos, dreno aceita fio */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, fs = L.fs, path = L.path;
console.log('v1.9.6 — faixa, nome das vias, cabo nos pinos, dreno');
function two(x2, y2) { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', x2 || 160, y2 || 40)); a.ref = 'J1'; b.ref = 'J2'; return d; }
function nets(d) { return HX.buildNetlist(d.p).nets.map(function (n) { return (n.terms || n.pins).map(function (t) { return t.ref + ':' + t.pin; }).sort().join(' '); }).filter(function (s) { return / /.test(s); }).sort(); }
test('faixa: nenhuma ferramenta aparece em duas abas (definição estática)', function () {
  var G = { HX: {} }; require('vm').runInNewContext(fs.readFileSync(path.join(__dirname, '../web/js/ui_ribbon_def.js'), 'utf8'), { window: G, globalThis: G });
  var H = G.HX, seen = {}, dup = [];
  H.RIBBON.forEach(function (T) { T[1].forEach(function (g) { g[1].forEach(function (s) { s = s.replace(/^\*/, ''); var k = s.slice(0, 2), v = s.slice(2); if (k !== 'e:' && k !== 'm:' || v[0] === '#') return;
    var q = H.ribbonKey(k === 'e:' ? (H.RIBBON_LBL[v] || v) : v.split('/').pop()); if (seen[q]) dup.push(q + ' (' + seen[q] + ' e ' + T[0] + ')'); else seen[q] = T[0]; }); }); });
  eq(dup, [], 'repetidos'); ok(seen['nome das vias'] === 'Esquema' && seen['cabo nos pinos'] === 'Esquema', 'Nome das vias e Cabo nos pinos na aba Esquema');
});
test('nome das vias: VCC em J1:A vai também para J2:B (outra ponta) e através de emenda; outras vias não mudam', function () {
  var d = two(); d.add(HX.makeConn(d, 'D38999:13-98', 160, 120)).ref = 'J3';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:B, J3:C\nJ1:B > J2:A')); });
  var J = {}; d.items().forEach(function (i) { if (i.type === 'conn') J[i.ref] = i; }); function nm(r, n) { return J[r].pins.filter(function (q) { return q.n === n; })[0].name || ''; }
  var out; d.change('n', function () { out = HX.pinNameSet(d, J.J1, 'A', ' VCC ', true); });
  eq(out.sort(), ['J1:A', 'J2:B', 'J3:C']); eq([nm('J1', 'A'), nm('J2', 'B'), nm('J3', 'C'), nm('J2', 'A'), nm('J1', 'B')], ['VCC', 'VCC', 'VCC', '', '']);
  d.change('n', function () { HX.pinNameSet(d, J.J2, 'A', 'GND', false); }); eq([nm('J2', 'A'), nm('J1', 'B')], ['GND', ''], 'sem levar à outra ponta');
  d.change('b', function () { HX.pinNamesBulk(d, J.J1, ['', 'CAN_H'], true); }); eq([nm('J1', 'A'), nm('J1', 'B'), nm('J2', 'A')], ['VCC', 'CAN_H', 'CAN_H'], 'lista: vazio não muda');
  eq(HX.pinNamesParse('A\tX1\nC;X3', J.J1).slice(0, 3), ['X1', null, 'X3']); eq(HX.pinNamesParse('a\nb\n\n'), ['a', 'b']);
});
test('cabo nos pinos: De J1:A,B,C / Para J2:A,B,C liga um a um, cabo com 3 vias, trança em pares, sem curto; dreno no pino', function () {
  [[160, 40], [160, 75], [160, 15]].forEach(function (P) {
    var d = two(P[0], P[1]), r; d.change('c', function () { r = HX.cablePins(d, HX.CABLE_LIB['BLD-TP'], 'J1:A,B C', 'J2:A,B,C', { model: 'BLD-TP', tw: true, gauge: '24', dreno: 'J1:D', pn: 'XYZ' }); });
    ok(r && r.cable && !r.err, r && r.err); eq(r.failed, []); eq(HX.cableWires(d, r.cable).length, 3, 'vias no cabo ' + P);
    eq(r.wires.map(function (w) { return w.twist + '/' + w.gauge; }), ['TP1/24', 'TP1/24', '/24']); eq([r.cable.vias, r.cable.part], [3, 'XYZ']);
    eq(nets(d), ['CB1:SH J1:D', 'J1:A J2:A', 'J1:B J2:B', 'J1:C J2:C'], 'ligações ' + P);
  });
  var d = two(), r; d.change('c', function () { r = HX.cablePins(d, null, 'J1:A,B', 'J2:A'); }); ok(/mesmo número/.test(r.err), 'quantidades diferentes');
  d.change('c', function () { r = HX.cablePins(d, null, 'J1:A', 'J9:A'); }); ok(r.err, 'conector inexistente');
  eq(HX.cablePinList('J1:1,2 3;J2:A'), ['J1:1', 'J1:2', 'J1:3', 'J2:A']);
});
test('dreno da blindagem aceita fio: é ponto de ligação e o fio até um pino entra na rede CB1:SH', function () {
  var d = two(), r; d.change('c', function () { r = HX.cablePins(d, HX.CABLE_LIB.BLD, 'J1:A,B', 'J2:A,B', {}); });
  var dp = HX.cableDrainPt(r.cable); ok(dp, 'tem dreno'); eq(HX.connPoints(r.cable, d.p.unit), [dp], 'connPoints do cabo = dreno');
  var J1 = d.items().filter(function (i) { return i.ref === 'J1'; })[0], q = HX.connLayout(J1, d.p.unit).pins.filter(function (x) { return x.n === 'K'; })[0];
  d.change('w', function () { L.ops.addWire(d, [dp, [dp[0], 110], [q.pt[0] - 10, 110], [q.pt[0] - 10, q.pt[1]], q.pt], {}); });
  ok(nets(d).indexOf('CB1:SH J1:K') >= 0, nets(d).join(' | '));
});
