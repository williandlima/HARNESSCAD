/* v1.9.10: lista de fiação do usuário (J1→J2 21-41 + J3 em pinos ocupados) sem labels, sem atravessar conector; emenda sem identificação */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.10 — lista organizada, emenda sem identificação');
function scen(p3) { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:21-41', 40, 40)), b = d.add(HX.makeConn(d, 'D38999:21-41', 250, 40)), c = d.add(HX.makeConn(d, 'D38999:13-98', p3[0], p3[1])), r;
  a.ref = 'J1'; b.ref = 'J2'; c.ref = 'J3'; var P = a.pins.map(function (q) { return q.n; }).filter(function (n) { return n !== 'A' && n !== 'B'; });
  d.change('x', function () { r = HX.wtApply(d, HX.wtParse(d, P.map(function (n) { return 'J1:' + n + ' > J2:' + n; }).join('\n') + '\nJ3:A > J2:B,J1:B\nJ3:B > J1:C,D,E,F')); }); return { d: d, r: r }; }
function segsCrossConn(d) { var u = d.p.unit, B = d.items().filter(function (i) { return i.type === 'conn'; }).map(function (c) { var b = HX.bbox(c, u); return { x0: b.x0 + 0.5, y0: b.y0 + 0.5, x1: b.x1 - 0.5, y1: b.y1 - 0.5 }; }), n = 0;
  d.items().forEach(function (w) { if (w.type === 'wire') for (var i = 1; i < w.pts.length; i++) if (B.some(function (r) { return HX.segRect(w.pts[i - 1], w.pts[i], r); })) n++; }); return n; }
test('lista do usuário: J3 abaixo, acima e atrás do J2 — tudo ligado, 0 labels, nenhuma via atravessa conector, redes certas', function () {
  [[40, 280], [140, 280], [140, -80], [320, 40], [320, 150]].forEach(function (p) { var s = scen(p), d = s.d, nl = HX.buildNetlist(d.p);
    eq(s.r.failed, [], 'J3 em ' + p); eq(d.items().filter(function (i) { return i.type === 'label'; }).length, 0, 'labels ' + p); eq(segsCrossConn(d), 0, 'atravessa conector ' + p);
    var N = nl.nets.map(function (n) { return n.pins.map(function (t) { return t.ref + ':' + t.pin; }).sort().join(' '); }).filter(function (x) { return /J3/.test(x); });
    eq(N.sort(), ['J1:B J2:B J3:A', 'J1:C J1:D J1:E J1:F J2:C J2:D J2:E J2:F J3:B'], 'redes ' + p); eq(nl.midTouches.length, 0); });
});
test('emenda: sem identificação por padrão; showRef liga', function () {
  var out = [], g = { style: function () {}, circle: function () {}, rect: function () {}, poly: function () {}, text: function (t) { out.push(t); } }, o = { theme: { splice: '#000' } };
  HX.drawSplice(g, { kind: 'crimp', x: 0, y: 0, ref: 'S1' }, o); HX.drawSplice(g, { kind: 'junction', x: 0, y: 0, ref: 'S2' }, o); eq(out, [], 'nenhum texto');
  HX.drawSplice(g, { kind: 'crimp', x: 0, y: 0, ref: 'S3', showRef: true }, o); eq(out, ['S3']);
});
test('revisão: trança/cor não mexem em bitola vazia; pares pela posição das vias; tipo novo ajusta só bitola válida', function () {
  var d = new HX.Doc(), W = [10, 20, 15].map(function (y) { var w; d.change('w', function () { w = HX.ops.addWire(d, [[0, y], [50, y]], {}); }); return w; });
  W.forEach(function (w) { w.gauge = ''; }); d.change('t', function () { HX.cableSpecSet(d, W, { tw: true }); });
  eq(W.map(function (w) { return w.gauge; }), ['', '', ''], 'bitola vazia continua vazia');
  ok(W[0].twist && W[0].twist === W[2].twist && W[1].twist === '', 'pares: y=10 com y=15 (vizinhos), y=20 sozinho');
  d.change('c', function () { HX.cableSpecSet(d, W, { color: 'RD' }); }); eq(W.map(function (w) { return w.gauge; }), ['', '', '']);
  W[0].gauge = '26'; d.change('y', function () { HX.cableSpecSet(d, [W[0]], { wtype: 'SAE GXL' }); }); eq(W[0].gauge, '22', 'tipo novo: bitola vai para a mais próxima da lista');
});
