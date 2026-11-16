/* Testes: junção automática padrão e equipamentos de bancada */
'use strict';
var L = require('./lib'), HX = L.HX, ops = L.ops, test = L.test, eq = L.eq, ok = L.ok, setup = L.setup;
function count(d, t, kind) { return d.items().filter(function (i) { return i.type === t && (!kind || i.kind === kind); }).length; }

console.log('Junção automática (padrão)');
test('projeto novo usa junção como emenda padrão', function () { eq(HX.newProject().defaults.spliceKind, 'junction'); });
test('fio em T cria ponto de junção', function () {
  var d = new HX.Doc(); ops.addWire(d, [[0, 10], [50, 10]]); ops.addWire(d, [[20, 10], [20, 40]]);
  eq(count(d, 'splice', 'junction'), 1); eq(count(d, 'wire'), 3);
});
test('ponta com ponta cria junção (sem fundir fios)', function () {
  var d = new HX.Doc(); ops.addWire(d, [[0, 0], [50, 0]]); ops.addWire(d, [[50, 0], [50, 30]]);
  eq(count(d, 'splice', 'junction'), 1); eq(count(d, 'wire'), 2);
});
test('dois fios no mesmo pino criam junção', function () {
  var s = setup(), d = s.d; ops.addWire(d, [s.A[0].pt, s.B[0].pt]); ops.addWire(d, [s.A[0].pt, [s.A[0].pt[0] + 10, 90]]);
  eq(count(d, 'splice', 'junction'), 1);
});
test('junção não entra na BOM nem gera aviso', function () {
  var d = new HX.Doc(); ops.addWire(d, [[0, 10], [50, 10]]); ops.addWire(d, [[20, 10], [20, 40]]);
  ok(!HX.buildBOM(d.p).some(function (r) { return r.cat === '4-Emenda'; }));
  ok(!HX.runERC(d.p).some(function (e) { return /Emenda/.test(e.msg); }));
});
test('soltar ponta arrastada sobre outro fio cria junção', function () {
  var d = new HX.Doc(), a = ops.addWire(d, [[0, 10], [50, 10]]), b = ops.addWire(d, [[20, 30], [20, 50]]);
  b.pts[0] = [20, 10]; ops.junctionAt(d, b, 0); eq(count(d, 'splice', 'junction'), 1); void a;
});

console.log('Equipamentos');
test('catálogo tem notebook, fontes, conversores, osciloscópio, banana', function () {
  ['Notebook', 'Fonte de bancada (1 canal)', 'Conversor USB-RS232', 'Conversor USB-RS485', 'Osciloscópio (4 canais)', 'Multímetro', 'Pino banana 4 mm vermelho']
    .forEach(function (l) { ok(HX.CAT.conns['EQUIP:' + l], l); });
});
test('busca sem acento encontra "osciloscopio" e "fonte bancada"', function () {
  ok(HX.searchConns('osciloscopio').some(function (e) { return e.eq === 'osc'; }));
  ok(HX.searchConns('fonte bancada').some(function (e) { return e.eq === 'psu'; }));
});
test('conversor tem USB de um lado e serial do outro; espelhar troca os lados', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'EQUIP:Conversor USB-RS232', 0, 0), L1 = HX.connLayout(c, 2.5);
  eq(L1.pins.filter(function (p) { return p.side === 'L'; }).map(function (p) { return p.n; }), ['USB']);
  eq(L1.pins.filter(function (p) { return p.side === 'R'; }).length, 5);
  c.mx = true; eq(HX.connLayout(c, 2.5).pins.filter(function (p) { return p.side === 'R'; }).map(function (p) { return p.n; }), ['USB']);
});
test('fio da fonte ao pino banana conecta e aparece na lista De-Para e BOM', function () {
  var d = new HX.Doc(), ps = d.add(HX.makeConn(d, 'EQUIP:Fonte de bancada (1 canal)', 0, 0)), bp = d.add(HX.makeConn(d, 'EQUIP:Pino banana 4 mm vermelho', 120, 0));
  bp.mx = true;
  ops.addWire(d, [HX.connLayout(ps, 2.5).pins[0].pt, HX.connLayout(bp, 2.5).pins[0].pt]);
  eq(HX.wireList(d.p)[0].from + '>' + HX.wireList(d.p)[0].to, 'PS1:+>BP1:1');
  eq(HX.buildBOM(d.p).filter(function (r) { return r.cat === '0-Equipamento'; }).length, 2);
  ok(!HX.runERC(d.p).some(function (e) { return e.sev === 'erro'; }));
});
test('todos os equipamentos desenham (tela/PDF) em todas as rotações', function () {
  var d = new HX.Doc(), x = 10;
  Object.keys(HX.CAT.conns).filter(function (k) { return /^EQUIP:/.test(k); }).forEach(function (k, i) {
    var c = d.add(HX.makeConn(d, k, 20 + (i % 5) * 80, 20 + Math.floor(i / 5) * 50)); c.rot = (i % 4) * 90; x++;
  });
  d.p.meta.size = 'A1';
  [false, true].forEach(function (mono) { ok(HX.exportPDF(d.p, { mono: mono, wirelist: false, bom: true }).length > 5000); });
});
