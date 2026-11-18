/* MIL-DTL-26482 Série 2: 34 arranjos do catálogo Amphenol Matrix, tamanho de cada contato e vista frontal exata */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
var TOT = { '8-33': 3, '8-98': 3, '10-6': 6, '12-3': 3, '12-8': 8, '12-10': 10, '14-4': 4, '14-5': 5, '14-9': 9, '14-12': 12, '14-15': 15, '14-18': 18, '14-19': 19, '16-8': 8, '16-23': 23, '16-26': 26,
  '18-8': 8, '18-11': 11, '18-30': 30, '18-32': 32, '20-16': 16, '20-24': 24, '20-39': 39, '20-41': 41, '22-12': 12, '22-19': 19, '22-21': 21, '22-32': 32, '22-41': 41, '22-55': 55, '22-95': 32, '24-19': 19, '24-31': 31, '24-61': 61 };
test('MS3476: os 34 arranjos da tabela Amphenol, com o tamanho de cada contato', function () {
  Object.keys(TOT).forEach(function (a) { var e = HX.CAT.conns['MS3476:' + a]; ok(e, a); eq(e.n, TOT[a], a); });
  var cnt = function (a, s) { return HX.CAT.conns['MS3476:' + a].pins.filter(function (p) { return p.sz === s; }).length; };
  eq([cnt('14-9', '12'), cnt('14-9', '20')], [4, 5], '14-9: 4 #12 + 5 #20'); eq([cnt('22-41', '20'), cnt('22-41', '16')], [27, 14]); eq([cnt('22-95', '20'), cnt('22-95', '12')], [26, 6]);
  eq(HX.CAT.conns['MS3476:24-61'].pins.slice(-3).map(function (p) { return p.n; }), ['MM', 'NN', 'PP']);
});
test('MS3476: vista frontal pelo catálogo (letras e contatos), soquete espelhado, sem AGUARDANDO', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'MS3476:14-9', 0, 0), T = [], C = [], g = { style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, push: function () {}, pop: function () {},
    circle: function (x, y, r) { C.push([x, r]); }, text: function (t, x) { T.push([t, x]); } };
  c.gender = 'P'; var b = HX.physLineFace(g, c, 0, 0, 30, '#000', true, 1); eq(C.length, 9); ok(T.some(function (t) { return t[0] === 'J'; })); ok(!T.some(function (t) { return t[0] === 'AGUARDANDO'; }));
  ok(C.filter(function (q) { return q[1] > 2; }).length === 4, '4 contatos #12 maiores'); eq(b.geom.shell, '14');
  var xA = T.filter(function (t) { return t[0] === 'A'; })[0][1]; T = []; C = []; c.gender = 'S'; HX.physLineFace(g, c, 0, 0, 30, '#000', true, 1); eq(T.filter(function (t) { return t[0] === 'A'; })[0][1], -xA, 'soquete = espelho');
});
test('receptáculos MS3470/3471/3474 pelo traço Amphenol: tamanho da tabela por carcaça, flange com espessura F', function () {
  eq(HX.PDS.ms3470.H(8), 21.03, 'A .828'); eq(HX.PDS.ms3474.H(24), 52.78, 'A 2.078'); eq(HX.PDS.ms3471.L(20), 37.21, '1,465'); eq(HX.PDS.ms3470.L(16), 35.69, '1,405');
  ok(HX.DS_OK.pecas.ms3470 && HX.DS_OK.pecas.ms3471 && HX.DS_OK.pecas.ms3474);
  ['ms3470', 'ms3471', 'ms3474'].forEach(function (id) { [8, 16, 24].forEach(function (s) {
    var X = [], Y = [], g = { style: function () {}, push: function () {}, pop: function () {}, text: function (t) { ok(t !== 'AGUARDANDO'); }, line: function () {}, circle: function () {}, rect: function () {},
      poly: function (P) { P.forEach(function (q) { X.push(q[0]); Y.push(q[1]); }); } }, W = HX.PDS[id].L(s), H = HX.PDS[id].H(s);
    HX.PHYS_VEC[id](g, 0, 0, W, H); ok(Math.abs(Math.max.apply(0, X) - Math.min.apply(0, X) - W) < 0.6, id + ' ' + s + ' comprimento');
    ok(Math.abs(Math.max.apply(0, Y) - Math.min.apply(0, Y) - H) < H * 0.04, id + ' ' + s + ' altura ' + (Math.max.apply(0, Y) - Math.min.apply(0, Y)) + ' / ' + H); }); });
});
