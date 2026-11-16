/* HarnessCAD - catálogo MIL-DTL-38999 (Glenair/Amphenol) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function def(k) { return HX.CAT.conns['D38999:' + k]; }
function cnt(e) { var c = {}; e.pins.forEach(function (q) { c[q.sz] = (c[q.sz] || 0) + 1; }); return c; }
test('53 arranjos IAW MIL-STD-1560 com contagem por tamanho do catálogo', function () {
  var ks = Object.keys(HX.CAT.conns).filter(function (k) { return /^D38999:/.test(k); }); eq(ks.length, 53);
  eq(cnt(def('15-97')), { '20': 8, '16': 4 }); eq(cnt(def('25-24')), { '16': 12, '12': 12 }); eq(def('25-35').pins.length, 128);
  eq(cnt(def('21-39')), { '20': 37, '16': 2 }); eq(def('17-6').pins.map(function (q) { return q.n; }).join(''), 'ABCDEF');
});
test('44 arranjos com posição real: dentro da face e sem contatos sobrepostos', function () {
  var n = 0;
  Object.keys(HX.CAT.conns).filter(function (k) { return /^D38999:/.test(k); }).forEach(function (k) {
    var e = HX.CAT.conns[k]; if (!e.pos) return; n++;
    eq(e.pos.length, e.pins.length, k);
    var dm = 9; e.pos.forEach(function (a, i) { ok(Math.hypot(a[0], a[1]) < 0.98, k + ' fora da face');
      e.pos.forEach(function (b, j) { if (j > i) dm = Math.min(dm, Math.hypot(a[0] - b[0], a[1] - b[1])); }); });
    ok(dm > 0.05, k + ' contatos sobrepostos ' + dm);
  });
  eq(n, 44);
});
test('part number militar com estilo, acabamento, tipo de contato e chave', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:15-97', 0, 0));
  eq(HX.connPN(c), 'D38999/26WD97SN');
  c.variant = '20'; c.finish = 'Z'; c.ctype = '1500'; c.keypos = 'B'; c.gender = 'P'; eq(HX.connPN(c), 'D38999/20ZD97HB');
  c.ctype = 'sem'; c.gender = 'S'; eq(HX.connPN(c), 'D38999/20ZD97BB');
});
test('contato e bitola: fio fora da faixa do contato vira erro no ERC', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:15-97', 20, 20));
  var P = HX.connLayout(c, d.p.unit).pins, i16 = c.pins.findIndex(function (q) { return q.sz === '16'; }), pin = P.filter(function (q) { return q.n === c.pins[i16].n; })[0];
  eq(HX.contactFor(c, c.pins[i16]).awg, [16, 20]);
  var w = HX.ops.addWire(d, [pin.pt, [pin.pt[0] + 20, pin.pt[1]]]); w.gauge = '22';
  var e = HX.runERC(d.p).filter(function (x) { return /fora da faixa do contato #16/.test(x.msg); }); eq(e.length, 1);
  w.gauge = '18'; eq(HX.runERC(d.p).filter(function (x) { return /fora da faixa/.test(x.msg); }).length, 0);
  w.wtype = 'FLRY-B'; w.gauge = '0.5'; eq(HX.runERC(d.p).filter(function (x) { return /fora da faixa/.test(x.msg); }).length, 0, '0,5 mm² ≈ 20 AWG');
});
test('vista frontal do 38999 usa a imagem do catálogo (sem redesenho) e gera PDF', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:11-35', 0, 0)), f = HX.makeFace(d, c, 100, 100);
  eq(f.part, 'D38999:11-35'); var im = HX.faceImgFor(f.part, c.gender); ok(im && /11-35\.png$/.test(im.url), 'imagem oficial');
  d.add(f); ok(HX.exportPDF(d.p, {}).length > 2000);
});
test('bitola fora da faixa: um só erro por ponta e lista p/ desenho/propriedades', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MS5015:28-21', 40, 40)), b = d.add(HX.makeConn(d, 'DT:4 vias', 140, 40));
  var g = HX.connLayout(a, d.p.unit).pins.filter(function (q) { return q.n === 'G'; })[0], B = HX.connLayout(b, d.p.unit).pins[0];
  var w = HX.ops.addWire(d, [g.pt, [g.pt[0] + 20, g.pt[1]], [g.pt[0] + 20, B.pt[1]], B.pt]); w.gauge = '22';
  var msgs = HX.runERC(d.p).filter(function (x) { return /fora da faixa/.test(x.msg); }).map(function (x) { return x.msg; });
  eq(msgs.length, 2, msgs.join(' | ')); ok(/J1:G \(16–20 AWG\)/.test(msgs.join()), msgs.join());
  eq(HX.gaugeIssues(d.p)[w.id].length, 2); w.gauge = '18'; eq(HX.gaugeIssues(d.p)[w.id], undefined);
});
