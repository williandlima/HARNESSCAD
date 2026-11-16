/* Testes: cotas do chicote, comprimento calculado dos fios, terminais das figuras e duplo clique */
'use strict';
var L = require('./lib'), HX = L.HX, ops = L.ops, test = L.test, eq = L.eq, ok = L.ok;
function dim(d, a, b, len) { return d.add({ type: 'dim', id: d.uid('d'), a: a.id, b: b.id, x: 0, y: 0, x2: 0, y2: 0, off: 10, len: len, text: '', showCount: true }); }
// J1 ---(800)--- BR1 ---(700)--- P1 ; BR1 ---(300)--- X1
function rig() {
  var d = new HX.Doc(); d.p.defaults.lenEnd = 50; d.p.defaults.scrapPct = 0;
  var j1 = d.add(HX.makeConn(d, 'D38999:11-35', 20, 40)), p1 = d.add(HX.makeConn(d, 'DT:4 vias', 200, 40)), x1 = d.add(HX.makeConn(d, 'DT:2 vias', 200, 140));
  p1.mx = true; x1.mx = true;
  var br = d.add({ type: 'brk', id: d.uid('b'), ref: 'BR1', x: 120, y: 80 });
  dim(d, j1, br, 800); dim(d, br, p1, 700); dim(d, br, x1, 300);
  var J = HX.connLayout(j1, 2.5).pins, P = HX.connLayout(p1, 2.5).pins, X = HX.connLayout(x1, 2.5).pins;
  var w1 = ops.addWire(d, [J[0].pt, [110, J[0].pt[1]], [110, P[0].pt[1] + 0.001], P[0].pt]);
  var w2 = ops.addWire(d, [J[1].pt, [100, J[1].pt[1]], [100, X[0].pt[1]], X[0].pt]);
  var w3 = ops.addWire(d, [J[2].pt, [90, J[2].pt[1]], [90, P[1].pt[1]], P[1].pt]);
  return { d: d, j1: j1, p1: p1, x1: x1, br: br, w1: w1, w2: w2, w3: w3 };
}
console.log('Cotas e quantidade de fio');
test('comprimento do fio = caminho pelas cotas + folga nas duas pontas', function () {
  var r = rig(), LL = HX.computeLengths(r.d.p);
  eq(LL.wires[r.w1.id].auto, 800 + 700 + 100); eq(LL.wires[r.w2.id].auto, 800 + 300 + 100);
});
test('conta quantos fios passam em cada trecho', function () {
  var r = rig(), LL = HX.computeLengths(r.d.p), c = Object.keys(LL.dims).map(function (k) { return LL.dims[k].count; });
  eq(c, [3, 2, 1]);
});
test('comprimento manual tem prioridade sobre o calculado', function () {
  var r = rig(); r.w1.len = 2000; eq(HX.computeLengths(r.d.p).wires[r.w1.id].eff, 2000);
});
test('quantidade por tipo de fio com perda; BOM em metros; lista De-Para com *', function () {
  var r = rig(); r.d.p.defaults.scrapPct = 10;
  var LL = HX.computeLengths(r.d.p), t = LL.pns[0];
  eq(t.n, 3); eq(Math.round(t.m * 1000), Math.round((1600 + 1200 + 1600) * 1.1));
  var bom = HX.buildBOM(r.d.p).filter(function (x) { return x.cat === '5-Fio'; })[0];
  eq(bom.qty.toFixed(2), (4400 * 1.1 / 1000).toFixed(2));
  ok(HX.wireList(r.d.p).every(function (row) { return /\*$/.test(row.len); }));
});
test('fio sem caminho de cotas aparece como "sem cota"', function () {
  var r = rig(), d = r.d, J = HX.connLayout(r.j1, 2.5).pins;
  var w = ops.addWire(d, [J[5].pt, [60, J[5].pt[1]]]); // ponta solta
  var LL = HX.computeLengths(d.p); ok(LL.missing.indexOf(w) >= 0); eq(LL.pns[0].semCota, 1);
});
test('cota acompanha o conector quando ele é movido', function () {
  var r = rig(), d = r.d, dm = d.items().filter(function (i) { return i.type === 'dim'; })[1];
  HX.syncDims(d.p); var x0 = dm.x2;
  ops.beginMove(d, [r.p1.id], 'drag').apply(25, 0); HX.syncDims(d.p); eq(dm.x2, x0 + 25);
});
test('cotas desenham e saem no PDF', function () { var r = rig(); ok(HX.exportPDF(r.d.p, { bom: true }).length > 3000); });

console.log('Terminais nos conectores da figura');
function at(c, n) { return HX.connLayout(c, 2.5).pins.filter(function (q) { return q.n === n; })[0]; }
test('borne "+" da fonte fica exatamente sobre o borne desenhado, saída para baixo', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'EQUIP:Fonte de bancada (1 canal)', 0, 0), L1 = HX.connLayout(c, 2.5), f = L1.icon.fit, q = at(c, '+');
  ok(Math.abs(q.lx - (f.ox + 6.3 * f.k)) < 1e-9 && Math.abs(q.ly - (f.oy + 6.35 * f.k)) < 1e-9); eq(q.ldir, [0, 1]);
  ok(q.pt[1] < L1.bbox.y1 && q.pt[0] < L1.bbox.x1, 'terminal dentro da figura');
});
test('todo terminal de todo equipamento cai dentro da figura', function () {
  var d = new HX.Doc();
  Object.keys(HX.CAT.conns).filter(function (k) { return /^EQUIP:/.test(k); }).forEach(function (k) {
    var c = HX.makeConn(d, k, 0, 0), L1 = HX.connLayout(c, 2.5), f = L1.icon.fit;
    eq(L1.pins.length, c.pins.length, k);
    L1.pins.forEach(function (q) { ok(q.lx >= f.ox - 0.01 && q.lx <= f.ox + f.iw + 0.01 && q.ly >= f.oy - 0.01 && q.ly <= f.oy + f.ih + 0.01, k + ' ' + q.n); });
  });
});
test('girar e espelhar o equipamento mantém os fios ligados nos bornes', function () {
  var d = new HX.Doc(), ps = d.add(HX.makeConn(d, 'EQUIP:Fonte de bancada (1 canal)', 0, 0)), j = d.add(HX.makeConn(d, 'DT:4 vias', 150, 0));
  j.mx = true; ops.addWire(d, [at(ps, '+').pt, [at(ps, '+').pt[0], 60], [at(j, '1').pt[0], 60], at(j, '1').pt]);
  ['rot', 'mx', 'rot', 'my'].forEach(function (k) { ops.transform(d, [ps], k); });
  var w = HX.wireList(d.p)[0]; eq(w.from + '>' + w.to, 'PS1:+>X1:1');
});
test('projeto antigo: fios presos nas laterais passam para os bornes da figura', function () {
  var d = new HX.Doc(), ps = d.add(HX.makeConn(d, 'EQUIP:Fonte de bancada (1 canal)', 0, 0)), j = d.add(HX.makeConn(d, 'DT:4 vias', 150, 0));
  j.mx = true; HX._eqOff = true; var old = HX.connLayout(ps, 2.5).pins[0].pt; HX._eqOff = false;
  d.add({ type: 'wire', id: 'w9', num: 'W9', pts: [old, [100, old[1]], [100, at(j, '1').pt[1]], at(j, '1').pt] });
  delete d.p.eqPins; HX.migrate(d.p);
  eq(HX.wireList(d.p)[0].from, 'PS1:+'); eq(d.p.eqPins, 2);
});
test('conversor USB-RS422/485 isolado: USB e 5 parafusos no desenho', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'EQUIP:Conversor USB-RS422/485 isolado (borne 5 vias)', 0, 0), L1 = HX.connLayout(c, 2.5);
  eq(L1.pins.map(function (q) { return q.n; }).sort(), ['GND', 'RDA(-)', 'RDB(+)', 'TDA(-)', 'TDB(+)', 'USB']);
  eq(at(c, 'USB').ldir, [-1, 0]); eq(at(c, 'GND').ldir, [1, 0]); ok(at(c, 'GND').ly < at(c, 'TDA(-)').ly, 'GND em cima, TDA(-) embaixo');
  ok(HX.searchConns('rs422').some(function (e) { return e.eq === 'usbiso'; }));
});
test('regra: toda conexão de todo equipamento sai de um conector desenhado', function () {
  var d = new HX.Doc(), falta = [];
  Object.keys(HX.CAT.conns).filter(function (k) { return /^EQUIP:/.test(k); }).forEach(function (k) {
    HX.connLayout(HX.makeConn(d, k, 0, 0), 2.5).pins.forEach(function (q) { if (!q.drawn) falta.push(k.slice(6) + ' ' + q.n); });
  });
  eq(falta, []);
});
test('NBR 10126: cota horizontal/vertical com linhas de extensão perpendiculares', function () {
  var d = { type: 'dim', x: 10, y: 20, x2: 90, y2: 35, orient: 'h', off: -12 }, q = HX.dimGeom(d);
  eq(q.A2, [10, 8]); eq(q.B2, [90, 8]); eq(q.L, 80);
  d.orient = 'v'; d.off = 15; q = HX.dimGeom(d); eq(q.A2, [25, 20]); eq(q.B2, [25, 35]); eq(q.L, 15);
});
test('rótulo sem unidade, com tolerância +50/-0 e nº de fios', function () {
  eq(HX.dimLabel({ len: 500, tolP: 50, tolM: 0, showCount: false }), '500 +50/-0');
  eq(HX.dimLabel({ len: 120, showCount: false }), '120');
});
test('origem no centro do conector ou direto no pino (acompanha o item)', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'DT:4 vias', 20, 20)), b = d.add(HX.makeConn(d, 'DT:4 vias', 120, 40));
  var pb = HX.connLayout(b, d.p.unit).pins[2];
  var dm = d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, bp: pb.n, x: 0, y: 0, x2: 0, y2: 0, orient: 'h', off: -10, len: 300 });
  HX.syncDims(d.p);
  var La = HX.connLayout(a, d.p.unit); eq([dm.x, dm.y], La.xf(La.w / 2, (La.H + La.h) / 2)); eq([dm.x2, dm.y2], pb.pt);
  b.x += 25; HX.syncDims(d.p); eq([dm.x2, dm.y2], HX.connLayout(b, d.p.unit).pins[2].pt);
});
test('cota antiga (sem orientação) vira horizontal ou vertical', function () {
  var d = new HX.Doc(); d.p.sheets[0].items.push({ type: 'dim', id: 'x', x: 0, y: 0, x2: 50, y2: 8, off: 5, len: 1 }, { type: 'dim', id: 'y', x: 0, y: 0, x2: 4, y2: 60, off: 5, len: 1 });
  HX.syncDims(d.p); eq(d.p.sheets[0].items.map(function (i) { return i.orient; }), ['h', 'v']);
});
test('ABNT: linha de cota afastada do componente e extensão começa fora do contorno', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'DT:4 vias', 20, 40)), b = d.add(HX.makeConn(d, 'DT:4 vias', 120, 60));
  var dm = d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 0, y2: 0, orient: 'h', off: 2, len: 300 });
  HX.syncDims(d.p);
  var ba = HX.dimBox(a, d.p.unit), bb = HX.dimBox(b, d.p.unit), yl = dm.y + dm.off;
  [ba, bb].forEach(function (b) { ok(yl <= b.y0 - HX.DIM_CLEAR + 1e-6 || yl >= b.y1 + HX.DIM_CLEAR - 1e-6, 'linha de cota dentro da faixa do componente: ' + yl); });
  var q = HX.dimGeom(dm), S = HX.dimExtStart(q.A, q.A2, ba);
  ok(S[1] < ba.y0 || S[1] > ba.y1, 'extensão começa fora do componente');
  ok(Math.abs(Math.abs(S[1] - (yl < ba.y0 ? ba.y0 : ba.y1)) - HX.DIM_GAP) < 1e-6, 'folga de ' + HX.DIM_GAP + ' mm');
});
