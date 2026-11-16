/* Testes das correções da revisão de código (v1.1) */
'use strict';
var L = require('./lib'), HX = L.HX, ops = L.ops, test = L.test, eq = L.eq, ok = L.ok, setup = L.setup;

console.log('Correções da revisão');
test('#1/#8 biblioteca maliciosa é limpa (sem HTML executável, limites)', function () {
  var evil = { 'USR:x': { key: 'USR:x', n: '<img src=x onerror=alert(1)>', desc: '<b>', pins: [{ n: 1, name: 'A' }] },
    'J1': { key: 'J1', pins: [{ n: '1' }] }, 'USR:semPinos': { key: 'USR:semPinos' },
    'USR:big': { key: 'USR:big', pins: new Array(5000).fill({ n: '1' }) } };
  var lib = HX.sanitizeLibrary(evil);
  eq(Object.keys(lib).sort(), ['USR:big', 'USR:x']);
  eq(lib['USR:x'].n, 1); eq(typeof lib['USR:x'].pins[0].n, 'string'); eq(lib['USR:big'].pins.length, HX.MAX_PINS);
  eq(HX.customConn({ name: 'z', n: 1e9 }).pins.length, HX.MAX_PINS);
});
test('#1 projeto importado também tem a biblioteca limpa', function () {
  var p = HX.newProject(); p.library.conns = { 'USR:a': { key: 'USR:a', n: '<x>', pins: [{ n: 'A' }] } };
  HX.migrate(p); eq(p.library.conns['USR:a'].n, 1);
});
test('#2 netlist com 1000 fios e 10 mil pinos em menos de 400 ms', function () {
  var d = new HX.Doc(), n = 0;
  for (var i = 0; i < 40; i++) {
    var a = d.add(HX.makeConn(d, 'D38999:25-35', 20, 20 + i * 700)), b = d.add(HX.makeConn(d, 'D38999:25-35', 300, 20 + i * 700));
    var A = HX.connLayout(a, 2.5).pins, B = HX.connLayout(b, 2.5).pins;
    for (var k = 0; k < 25; k++) d.items().push({ type: 'wire', id: 'w' + (n++), pts: [A[k].pt, [150 + k, A[k].pt[1]], [150 + k, B[k].pt[1]], B[k].pt], num: 'W' + n });
  }
  HX.buildNetlist(d.p); // aquecimento
  var t = Date.now(), nl = HX.buildNetlist(d.p), dt = Date.now() - t;
  ok(dt < 400, 'demorou ' + dt + ' ms'); eq(nl.nets.length, 1000);
});
test('#2 fio em T ainda é detectado (índice por linha/coluna e diagonal)', function () {
  var d = new HX.Doc();
  d.add({ type: 'wire', id: 'a', num: 'A', pts: [[0, 10], [50, 10]] });
  d.add({ type: 'wire', id: 'b', num: 'B', pts: [[20, 10], [20, 40]] });
  d.add({ type: 'wire', id: 'c', num: 'C', pts: [[0, 0], [40, 40]] });
  d.add({ type: 'wire', id: 'e', num: 'E', pts: [[30, 30], [30, 60]] });
  var nl = HX.buildNetlist(d.p);
  eq(nl.midTouches.map(function (m) { return m.wire.num + '>' + m.other.num; }).sort(), ['B>A', 'E>C']);
});
test('#9 dividir fio reparte o comprimento', function () {
  var s = setup(), d = s.d, w = ops.addWire(d, [[0, 50], [100, 50]], { len: 1000 }), nw = ops.splitWire(d, w, [25, 50]);
  eq([w.len, nw.len], [250, 750]);
});
test('#10 colar conector + vista frontal mantém o vínculo com a cópia', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)), f = d.add(HX.makeFace(d, c, 50, 0));
  var out = ops.pasteItems(d, [c, f], 0, 100);
  eq(out[1].of, out[0].id); ok(out[0].id !== c.id); eq(f.of, c.id);
});
test('#11 pontas com especificação diferente não se fundem: viram emenda', function () {
  var d = new HX.Doc();
  ops.addWire(d, [[0, 0], [50, 0]], { gauge: '22' }); ops.addWire(d, [[50, 0], [100, 0]], { gauge: '18' });
  eq(d.items().filter(function (i) { return i.type === 'wire'; }).length, 2);
  eq(d.items().filter(function (i) { return i.type === 'splice'; }).length, 1);
  d.p.defaults.mergeWires = true; ops.addWire(d, [[0, 20], [50, 20]], { len: 300 }); var w = ops.addWire(d, [[50, 20], [80, 20]], { len: 200 });
  eq(w.len, 500, 'comprimentos somados');
});
test('#12 "mesmo ponto" igual para edição e netlist', function () {
  [[1.004, 1.0045], [1.0049, 1.0051], [85, 85.0000000001], [2.5, 2.5004]].forEach(function (c) {
    eq(HX.same([c[0], 0], [c[1], 0]), HX.key(c[0], 0) === HX.key(c[1], 0), c.join(' x '));
  });
});
test('#13 histórico de desfazer limitado por memória', function () {
  var s = setup(), d = s.d, old = HX.UNDO_CHARS; HX.UNDO_CHARS = d.snapshot().length * 5.5;
  for (var i = 0; i < 20; i++) d.change('x', function () { s.a.note = 'n' + i; });
  ok(d.undoStack.length <= 6 && d.undoStack.length >= 5, 'pilha ' + d.undoStack.length); HX.UNDO_CHARS = old;
});
