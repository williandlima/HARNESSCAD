/* Ordem dos pinos no esquema (pinorder.js) e símbolo padrão (número dentro, nome fora na perna) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function nets(d) { return HX.buildNetlist(d.p).nets.map(function (n) { return n.pins.map(function (t) { return t.ref + ':' + t.pin; }).sort().join(' '); }).sort().join(' | '); }
function cena() { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 160, 40)); a.ref = 'J1'; b.ref = 'J2';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > J2:B\nJ1:B > J2:A\nJ1:C > J2:C\nJ1:E > J2:F\nJ1:F > J2:E')); }); return { d: d, a: a, b: b }; }
console.log('Ordem dos pinos no esquema');
test('pino troca de lugar com o vizinho (↑/↓), fios acompanham, ligações iguais; cruzamentos somem e os fios ficam retos', function () {
  var c = cena(), d = c.d, n0 = nets(d), r = [];
  d.change('m', function () { r.push(HX.pinMove(d, c.b, 'B', 0, -1), HX.pinMove(d, c.b, 'F', 0, -1), HX.pinMove(d, c.a, 'A', 0, -1)); });
  eq(r, [true, true, false], 'A já está em cima'); eq(c.b.pins.slice(0, 6).map(function (q) { return q.n; }).join(''), 'BACDFE');
  eq(nets(d), n0); eq(HX.buildNetlist(d.p).midTouches.length, 0);
  ok(d.items().filter(function (i) { return i.type === 'wire'; }).every(function (w) { return w.pts.length === 2; }), 'todos os fios retos (sem cruzamento)');
  ok(HX.pinOrderChanged(d, c.b)); d.change('r', function () { HX.pinOrderReset(d, c.b); }); eq(c.b.pins.slice(0, 6).map(function (q) { return q.n; }).join(''), 'ABCDEF'); eq(nets(d), n0); ok(!HX.pinOrderChanged(d, c.b));
});
test('conector girado: ←/→ trocam o pino; pinAt acha o pino pela perna', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:13-98', 40, 200)); a.ref = 'J1'; b.ref = 'J2'; a.rot = 90; b.rot = 270;
  var P = function (c, i) { return HX.connLayout(c, 2.5).pins[i].pt; };
  d.change('w', function () { for (var i = 0; i < 3; i++) { var p = P(a, i), q = P(b, i), m = (p[1] + q[1]) / 2; HX.ops.addWire(d, [p, [p[0], m], [q[0], m], q]); } });
  var n0 = nets(d), r; d.change('m', function () { r = [HX.pinMove(d, a, 'A', 1, 0), HX.pinMove(d, a, 'A', 0, 1)]; }); eq(r, [true, false]); eq(nets(d), n0);
  var q2 = HX.connLayout(b, 2.5).pins[2], h = HX.pinAt(d, q2.pt, 1); eq(h && h.c.ref + ':' + h.n, 'J2:' + q2.n);
});
test('símbolo padrão: número/letra dentro do corpo, nome da via fora sobre a perna (opção "antigo" inverte)', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)); c.pins[0].name = 'SINAL_X'; var T = [];
  var g = { push: function () {}, pop: function () {}, style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, text: function (t, x) { T.push([String(t), x]); } };
  var o = { theme: HX.THEMES ? HX.THEMES.light || {} : {}, connected: new Set() }, L = HX.connLayout(c, d.p.unit);
  HX.SYMBOLS.univ(g, c, d.p, 0, o, L); var num = T.filter(function (t) { return t[0] === 'A'; })[0], nm = T.filter(function (t) { return t[0] === 'SINAL_X'; })[0];
  ok(num[1] < L.w && num[1] > 0, 'número dentro (x=' + num[1] + ')'); ok(nm[1] > L.w, 'nome fora (x=' + nm[1] + ')');
  c.uNumPos = 'out'; c.wu = 24; L = HX.connLayout(c, d.p.unit); T = []; /* corpo largo: no antigo o nome só aparece se couber dentro */ HX.SYMBOLS.univ(g, c, d.p, 0, o, L); num = T.filter(function (t) { return t[0] === 'A'; })[0]; nm = T.filter(function (t) { return t[0] === 'SINAL_X'; })[0];
  ok(num[1] > L.w && nm[1] < L.w, 'antigo: número fora, nome dentro');
});
