/* Testes: catálogo, geometria, fios/emendas */
'use strict';
var L = require('./lib'), HX = L.HX, ops = L.ops, test = L.test, eq = L.eq, ok = L.ok, setup = L.setup, fs = L.fs, path = L.path;
console.log('Catálogo');
test('conectores com chave única e pinos coerentes', function () {
  var all = Object.keys(HX.CAT.conns); ok(all.length > 200, 'poucos conectores: ' + all.length);
  all.forEach(function (k) { var e = HX.CAT.conns[k]; eq(e.pins.length, e.n, k); eq(new Set(e.pins.map(function (p) { return p.n; })).size, e.n, 'pinos repetidos ' + k); });
});
test('PN D38999 e contatos', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'D38999:13-35', 0, 0); c.gender = 'P';
  eq(HX.connPN(c), 'D38999/26WC35PN'); eq(HX.contactFor(c, c.pins[0]).pn, 'M39029/58-360');
  c.variant = '20'; eq(HX.connPN(c), 'D38999/20WC35PN');
});
test('PN de fio MIL com listra', function () { eq(HX.wirePN({ wtype: 'M22759/16', gauge: '22', color: 'WH-RD' }), 'M22759/16-22-92'); });
test('busca prioriza família', function () { eq(HX.searchConns('DT 4')[0].key, 'DT:4 vias'); });
test('letras MIL sem I/O/Q', function () { var l = HX.milLetters(30); ok(l.indexOf('I') < 0 && l.indexOf('O') < 0 && l.indexOf('Q') < 0); eq(l[8], 'J'); });

console.log('Geometria');
test('pinos na grade e espelhamento', function () {
  var s = setup(); eq(s.A[0].pt, [85, 62.5]); eq(s.B[0].pt, [145, 62.5]);
  s.A.forEach(function (p) { ok(Math.abs(p.pt[1] / 2.5 - Math.round(p.pt[1] / 2.5)) < 1e-9, 'fora da grade'); });
});
test('rotação 180 = espelho X+Y (texto legível)', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'DT:4 vias', 0, 0); c.rot = 180;
  var L = HX.connLayout(c, 2.5); eq(L.side, 'L'); eq(L.rows[0].n, '4');
});
test('rotação 90 gira os pinos', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'DT:2 vias', 0, 0); c.rot = 90;
  var p = HX.connLayout(c, 2.5).pins; eq(p[0].pt[0], p[1].pt[0] - 5); ok(p[0].pt[1] < 0);
});
test('cleanPts remove colineares', function () { eq(HX.cleanPts([[0, 0], [5, 0], [10, 0], [10, 0], [10, 5]]), [[0, 0], [10, 0], [10, 5]]); });

console.log('Fios e emendas (estilo KiCad)');
test('fio em T divide o fio e cria emenda', function () {
  var s = setup(), d = s.d;
  ops.addWire(d, [s.A[0].pt, [120, 62.5], [120, 67.5], s.B[1].pt]);
  ops.addWire(d, [s.A[2].pt, [110, 72.5], [110, 62.5]]);
  var sp = d.items().filter(function (i) { return i.type === 'splice'; }); eq(sp.length, 1); eq([sp[0].x, sp[0].y], [110, 62.5]);
  var wl = HX.wireList(d.p); eq(wl.length, 3); ok(wl.every(function (r) { return r.from !== '— solto' && r.to !== '— solto'; }));
});
test('pontas unidas viram um fio só (com "Unir pontas")', function () {
  var s = setup(), d = s.d; d.p.defaults.mergeWires = true; ops.addWire(d, [s.A[0].pt, [100, 62.5]]); ops.addWire(d, [[100, 62.5], s.B[0].pt]);
  eq(d.items().filter(function (i) { return i.type === 'wire'; }).length, 1);
});
test('três pontas no mesmo ponto criam emenda', function () {
  var s = setup(), d = s.d; d.p.defaults.mergeWires = false;
  ops.addWire(d, [s.A[0].pt, [100, 62.5]]); ops.addWire(d, [[100, 62.5], s.B[0].pt]); ops.addWire(d, [[100, 62.5], [100, 90]]);
  eq(d.items().filter(function (i) { return i.type === 'splice'; }).length, 1);
});
test('placeSplice no meio do fio divide', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]); ops.placeSplice(d, [110, 62.5]);
  eq(d.items().filter(function (i) { return i.type === 'wire'; }).length, 2);
});
test('moveEnd mantém ortogonalidade', function () {
  var w = { pts: [[0, 0], [10, 0], [10, 10]] }; ops.moveEnd(w, 0, [0, 5], 2.5); eq(w.pts, [[0, 5], [10, 5], [10, 10]]);
  var w2 = { pts: [[0, 0], [20, 0]] }; ops.moveEnd(w2, 1, [20, 10], 2.5); eq(w2.pts, [[0, 0], [10, 0], [10, 10], [20, 10]]);
});


console.log('Símbolos gráficos e vista frontal');
test('todos os estilos desenham e geram PDF', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]);
  HX.CONN_STYLES.forEach(function (st) {
    d.p.view.connStyle = st[0]; s.a.gender = 'P';
    var b = HX.exportPDF(d.p, { wirelist: false, bom: false }); ok(b.length > 1000, st[0]);
  });
});
test('trocar estilo não move pinos', function () {
  var s = setup(), before = JSON.stringify(HX.connLayout(s.a, 2.5).pins.map(function (p) { return p.pt; }));
  s.a.gstyle = 'harness'; eq(JSON.stringify(HX.connLayout(s.a, 2.5).pins.map(function (p) { return p.pt; })), before);
});
test('vista frontal: largura d e proporção da imagem; sem imagem = aviso', function () {
  var d = new HX.Doc();
  ['D38999:25-35', 'M24308:DE-9', 'DT:6 vias'].forEach(function (k) {
    var c = d.add(HX.makeConn(d, k, 0, 0)), f = d.add(HX.makeFace(d, c, 0, 0)), B = HX.faceImgBox(f, d.p);
    ok(B.w >= 40 && B.w <= 70, k); if (B.im) ok(Math.abs(B.h / B.w - B.im.h / B.im.w) < 1e-9, k);
  });
});
