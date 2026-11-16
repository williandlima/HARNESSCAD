/* HarnessCAD - bolinha (emenda) em todos os casos de junção */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function sp(d) { return d.items().filter(function (i) { return i.type === 'splice'; }).map(function (s) { return s.x + ',' + s.y; }).sort(); }
function oneNet(d, a, b) { var nl = HX.buildNetlist(d.p), na = nl.nodes['0|' + HX.key(a[0], a[1])], nb = nl.nodes['0|' + HX.key(b[0], b[1])]; return na && nb && na.net === nb.net; }
function W(d, pts) { var w; d.change('fio', function () { w = ops.addWire(d, pts); }); return w; }
test('T normal e T invertido (fio novo passa pela ponta de um existente)', function () {
  var d = new HX.Doc(); W(d, [[0, 0], [40, 0]]); W(d, [[20, 0], [20, 20]]); eq(sp(d), ['20,0']);
  var e = new HX.Doc(); W(e, [[20, 0], [20, 20]]); W(e, [[0, 0], [40, 0]]); eq(sp(e), ['20,0']); eq(e.items().filter(function (i) { return i.type === 'wire'; }).length, 3, 'dividido');
  ok(oneNet(e, [0, 0], [20, 20]) && HX.buildNetlist(e.p).midTouches.length === 0);
});
test('ponta na dobra (canto) de outro fio: liga e põe a bolinha', function () {
  var d = new HX.Doc(); W(d, [[0, 0], [20, 0], [20, 20]]); W(d, [[20, 0], [40, 0]]);
  eq(sp(d), ['20,0']); ok(oneNet(d, [0, 0], [40, 0]) && oneNet(d, [20, 20], [40, 0]));
  HX.autoJunctions = false; var e = new HX.Doc(); W(e, [[0, 0], [20, 0], [20, 20]]); e.change('x', function () { e.add({ type: 'wire', id: 'wz', pts: [[20, 0], [40, 0]], num: 'W9' }); });
  HX.autoJunctions = true; eq(HX.buildNetlist(e.p).midTouches.length, 1, 'netlist acusa mesmo sem emenda (projeto antigo)');
});
test('mover, arrastar ponta, colar: bolinha aparece; apagar: bolinha automática órfã some', function () {
  var d = new HX.Doc(); W(d, [[0, 0], [40, 0]]); var w = W(d, [[50, 5], [50, 30]]);
  d.change('m', function () { ops.beginMove(d, [w.id], 'drag').apply(-30, -5); }); eq(sp(d), ['20,0']);
  var e = new HX.Doc(); W(e, [[0, 0], [40, 0]]); var v = W(e, [[60, 0], [60, 20]]); e.change('p', function () { ops.pasteItems(e, [v], -40, 0); }); eq(sp(e), ['20,0']);
  var f = new HX.Doc(), a = W(f, [[0, 0], [20, 0]]), b = W(f, [[20, 0], [20, 20]]); eq(sp(f), ['20,0']);
  f.change('x', function () { f.removeIds([a.id, b.id]); }); eq(sp(f), []);
});
test('não põe bolinha: cruzamento simples, um fio só no pino; emenda do usuário nunca é removida', function () {
  var d = new HX.Doc(); W(d, [[0, 10], [40, 10]]); W(d, [[20, 0], [20, 30]]); eq(sp(d), [], 'cruzamento');
  var c = d.add(HX.makeConn(d, 'DT:4 vias', 100, 100)), P = HX.connLayout(c, 2.5).pins[0].pt; W(d, [P, [P[0] + 20, P[1]]]); eq(sp(d), [], 'um fio no pino');
  W(d, [P, [P[0] + 20, P[1] + 10]]); eq(sp(d).length, 1, 'dois fios no pino');
  var e = new HX.Doc(); e.change('s', function () { ops.placeSplice(e, [70, 70]); }); W(e, [[0, 0], [5, 0]]); eq(e.items().filter(function (i) { return i.type === 'splice'; }).length, 1);
});
test('1000 fios: conferência das junções em < 300 ms', function () {
  var d = new HX.Doc(); HX.autoJunctions = false;
  for (var i = 0; i < 1000; i++) d.add({ type: 'wire', id: 'w' + i, num: 'W' + i, pts: [[0, i * 2.5], [100, i * 2.5], [100 + (i % 7) * 2.5, i * 2.5 + 1.25]] });
  HX.autoJunctions = true; var t = Date.now(); ops.normalizeJunctions(d); var dt = Date.now() - t; ok(dt < 300, dt + ' ms');
});
