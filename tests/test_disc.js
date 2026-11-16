/* HarnessCAD - componentes discretos */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
var KEYS = Object.keys(HX.CAT.conns).filter(function (k) { return /^DISC:/.test(k); });
test('catálogo de discretos: 16 componentes com 2 terminais e desenho próprio', function () {
  eq(KEYS.length, 16);
  KEYS.forEach(function (k) { var e = HX.CAT.conns[k]; eq(e.pins.length, 2, k); ok(HX.DISC_DRAW[e.disc], k + ' sem desenho'); });
});
test('resistor: ref R, valor na BOM, pinos à esquerda e à direita', function () {
  var d = new HX.Doc(), r = d.add(HX.makeConn(d, 'DISC:Resistor', 0, 0));
  eq(r.ref, 'R1'); eq(HX.connStyle(r, d.p), 'disc'); eq(HX.connPN(r), 'Resistor 1k');
  r.val = '120 Ω'; eq(HX.connPN(r), 'Resistor 120 Ω'); r.pnOverride = 'CRCW0805120R'; eq(HX.connPN(r), 'CRCW0805120R');
  var P = HX.connLayout(r, d.p.unit).pins; eq(P.map(function (q) { return q.side; }), ['L', 'R']);
  eq(P[0].ly, P[1].ly);
});
test('diodo espelhado: ânodo passa para a direita e o desenho acompanha', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'DISC:Diodo', 0, 0)); c.mx = true;
  var P = HX.connLayout(c, d.p.unit).pins, A = P.filter(function (q) { return q.n === 'A'; })[0]; eq(A.side, 'R');
  var flips = 0, g = { style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, text: function () {}, pop: function () {},
    push: function (m) { if (m[0] === -1) flips++; } };
  HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() }); eq(flips, 1);
});
test('discretos ligam fios, entram na lista de fios, BOM e PDF', function () {
  var d = new HX.Doc(), r = d.add(HX.makeConn(d, 'DISC:Resistor', 20, 20)), f = d.add(HX.makeConn(d, 'DISC:Fusível', 80, 20));
  var a = HX.connLayout(r, d.p.unit).pins[1].pt, b = HX.connLayout(f, d.p.unit).pins[0].pt;
  HX.ops.addWire(d, [a, [b[0], a[1]], b]);
  var wl = HX.wireList(d.p); eq(wl.length, 1); ok(/R1:2/.test(wl[0].from + wl[0].to) && /F1:1/.test(wl[0].from + wl[0].to), JSON.stringify(wl[0]));
  var bom = JSON.stringify(HX.buildBOM(d.p)); ok(/Resistor 1k/.test(bom) && /Fusível 2A/.test(bom), bom);
  ok(HX.exportPDF(d.p, { mono: false, wirelist: true, bom: true }).length > 3000);
});
