/* HarnessCAD - ERC severo */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function W(d, pts, o) { var w; d.change('w', function () { w = ops.addWire(d, pts); Object.assign(w, o || {}); }); return w; }
function rules(p) { var r = {}; HX.runERC(p).forEach(function (e) { r[e.rule] = (r[e.rule] || 0) + 1; }); return r; }
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
test('mensagens antigas classificadas por regra; severidade configurável; regra desligada', function () {
  var d = new HX.Doc(); W(d, [[0, 0], [20, 0]]);
  var e = HX.runERC(d.p), loose = e.filter(function (x) { return x.rule === 'loose'; }); ok(loose.length === 2 && loose[0].ruleName === 'Ponta de fio solta' && loose[0].key);
  HX.ercCfg(d.p).rules.loose = 'info'; ok(HX.runERC(d.p).filter(function (x) { return x.rule === 'loose'; }).every(function (x) { return x.sev === 'info'; }));
  HX.ercCfg(d.p).rules.loose = 'off'; eq(rules(d.p).loose, undefined);
});
test('aceitar aviso: sai da lista e fica em .waived; reativar volta', function () {
  var d = new HX.Doc(); W(d, [[0, 0], [20, 0]]); var e = HX.runERC(d.p)[0];
  HX.ercWaive(d.p, e, 'ok pelo cliente'); var r = HX.runERC(d.p); ok(!r.some(function (x) { return x.key === e.key; }) && r.waived.length === 1 && r.waived[0].waived.nota === 'ok pelo cliente');
  HX.ercUnwaive(d.p, e.key); ok(HX.runERC(d.p).some(function (x) { return x.key === e.key; }));
});
test('regras novas: corrente, sobreposição, fio sobre pino, par trançado, bitolas, sem comprimento, N/C', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)), b = d.add(HX.makeConn(d, 'DT:4 vias', 100, 0));
  W(d, [pinPt(a, 0), pinPt(b, 0)], { gauge: '22', amps: 9 }); W(d, [pinPt(a, 1), pinPt(b, 1)], { gauge: '20', twist: 'TP1' });
  var r = rules(d.p); ok(r.current >= 1, 'corrente > referência'); eq(r.twist, 1); ok(r.noLen >= 2);
  var c = d.add(HX.makeConn(d, 'DT:4 vias', 50, 40)), q = pinPt(c, 0); W(d, [[q[0] - 10, q[1]], [q[0] + 10, q[1]]]); ok(rules(d.p).overPin >= 1, 'passa sobre pino');
  W(d, [[200, 50], [240, 50]]); W(d, [[220, 50], [260, 50]]); ok(rules(d.p).overlap >= 1, 'sobrepostos');
  var e = new HX.Doc(); W(e, [[0, 0], [20, 0]], { ncA: true, ncB: true }); eq(rules(e.p).loose, undefined, 'pontas N/C não são soltas');
  var f = new HX.Doc(), x = f.add(HX.makeConn(f, 'DT:4 vias', 0, 0)), y = f.add(HX.makeConn(f, 'DT:4 vias', 100, 0)), z = f.add(HX.makeConn(f, 'DT:4 vias', 0, 60));
  W(f, [pinPt(x, 0), pinPt(y, 0)], { gauge: '20' }); W(f, [pinPt(y, 0), [130, pinPt(y, 0)[1]], pinPt(z, 0)], { gauge: '22' }); ok(rules(f.p).mixGauge >= 1);
});
test('regras novas: label global único, mesmo sinal em circuitos separados, conector vedado com cavidade vazia', function () {
  var d = new HX.Doc(); d.add({ type: 'label', id: 'l1', x: 0, y: 0, rot: 0, text: 'CAN_H', style: 'global' }); eq(rules(d.p).label1, 1);
  var a = d.add(HX.makeConn(d, 'DT:4 vias', 0, 40)), b = d.add(HX.makeConn(d, 'DT:4 vias', 100, 40)), c = d.add(HX.makeConn(d, 'DT:4 vias', 0, 100)), e2 = d.add(HX.makeConn(d, 'DT:4 vias', 100, 100));
  a.pins[0].name = 'GND'; c.pins[0].name = 'GND'; W(d, [pinPt(a, 0), pinPt(b, 0)]); W(d, [pinPt(c, 0), pinPt(e2, 0)]);
  var r = rules(d.p); eq(r.sameName, 1); ok(r.plug >= 1, 'DT vedado com cavidades vazias');
});
test('regras do desenho físico: não roteado, ramo sem fios, raio de curvatura', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 100, 0));
  for (var i = 0; i < 9; i++) W(d, [pinPt(a, i), pinPt(b, i)]);
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1000, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); var sh = d.p.sheets[r.index], sg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0];
  sg.y = 40; eq(rules(d.p).bend, undefined, 'raio ~510 mm > 6×Ø'); HX.ercCfg(d.p).bendK = 200; ok(rules(d.p).bend === 1, 'exige 200×Ø'); HX.ercCfg(d.p).bendK = 6;
  var c = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 80)); d.sheet = 0; W(d, [pinPt(c, 0), [pinPt(c, 0)[0] + 30, pinPt(c, 0)[1]], pinPt(b, 0)]);
  ok(rules(d.p).orphan >= 1, 'conector fora do desenho = fio não roteado');
  sh.items.push({ type: 'pnode', id: 'nx', of: '', ref: 'BR9', nkind: 'brk', x: 0, y: 0 }); sh.items.push({ type: 'pseg', id: 'gx', a: sg.a, b: 'nx', len: 50, x: 0, y: 0 }); eq(rules(d.p).emptyBundle, 1);
});
