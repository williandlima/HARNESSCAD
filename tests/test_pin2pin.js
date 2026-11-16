/* HarnessCAD - conectar pino a pino: A→A, B→B...; por sinal; por ordem; pula pinos ligados; sem curto nem sobreposição */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function nets(d) { var nl = HX.buildNetlist(d.p); return nl.nets.map(function (n) { return n.terms.filter(function (t) { return t.kind === 'pin'; }).map(function (t) { return t.ref + ':' + t.pin; }).sort().join(' '); }).filter(Boolean).sort(); }
function vsegs(W) { var s = []; W.forEach(function (w) { for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i]; if (Math.abs(a[0] - b[0]) < 1e-6) s.push([a[0], Math.min(a[1], b[1]), Math.max(a[1], b[1]), w.id]); } }); return s; }
function overlap(W) { var s = vsegs(W); for (var i = 0; i < s.length; i++) for (var j = i + 1; j < s.length; j++) if (s[i][3] !== s[j][3] && Math.abs(s[i][0] - s[j][0]) < 1e-6 && s[i][1] < s[j][2] && s[j][1] < s[i][2]) return true; return false; }
test('A→A, B→B, C→C entre dois conectores frente a frente; cada fio liga só o par; sem colunas sobrepostas', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:11-5', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:11-5', 100, 30)); b.side = 'L';
  var r; d.change('p', function () { r = HX.pinToPin(d, a, b); });
  eq(r.wires.length, 5); eq(nets(d), ['J1:A J2:A', 'J1:B J2:B', 'J1:C J2:C', 'J1:D J2:D', 'J1:E J2:E']);
  ok(!overlap(r.wires), 'colunas distintas'); ok(r.wires.every(function (w) { return w.pts.length <= 4; }), 'no máx. 3 trechos');
  var r2; d.change('p', function () { r2 = HX.pinToPin(d, a, b); }); eq(r2.wires.length, 0, 'já ligados: pulados'); eq(r2.plan.busy.length, 5);
});
test('pinos em ordem diferente casam pelo nome; sem par listado; por sinal; por ordem', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:11-5', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:11-5', 120, 0)); b.side = 'L';
  b.pins.reverse(); a.pins[4].n = 'X'; a.pins[0].name = 'PWR'; b.pins.filter(function (p) { return p.n === 'B'; })[0].name = 'PWR';
  var P = HX.pinToPinPlan(d, a, b, {}); eq(P.pairs.map(function (r) { return r.a.n + r.b.n; }), ['AA', 'BB', 'CC', 'DD']); eq(P.onlyA, ['X']); eq(P.onlyB, ['E']);
  var S = HX.pinToPinPlan(d, a, b, { by: 'signal' }); eq(S.pairs.map(function (r) { return r.a.n + '>' + r.b.n; }), ['A>B']);
  var O = HX.pinToPinPlan(d, a, b, { by: 'order' }); eq(O.pairs.length, 5); eq(O.pairs[0].b.n, b.pins[0].n);
  var r; d.change('p', function () { r = HX.pinToPin(d, a, b, { by: 'signal' }); }); eq(r.wires[0].name, 'PWR', 'nome do fio = sinal');
});
test('conectores do mesmo lado / sobrepostos: rota por baixo, sem curto; D-Sub 1..9 com circular por ordem', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 60, 10));
  var r; d.change('p', function () { r = HX.pinToPin(d, a, b); }); eq(r.wires.length, 9);
  eq(nets(d).length, 9); ok(nets(d).every(function (n) { var p = n.split(' '); return p.length === 2 && p[0].split(':')[1] === p[1].split(':')[1]; }), 'sem curto');
  ok(!overlap(r.wires), 'sem sobreposição');
  var c = d.add(HX.makeConn(d, 'D38999:11-5', 200, 0)); c.side = 'L'; var P = HX.pinToPinPlan(d, a, c, {}); eq(P.pairs.length, 0, 'nomes não batem');
  var Q = HX.pinToPinPlan(d, a, c, { by: 'order', skipBusy: false }); eq(Q.pairs.length, 5);
});
test('pino a pino 39 vias (MIL 38999 21-39): minúscula ≠ maiúscula (a ≠ A), todos os 39 pares certos; espelha para ficar de frente', function () {
  var d = new HX.Doc(), A = d.add(HX.makeConn(d, 'D38999:21-39', 40, 40)), B = d.add(HX.makeConn(d, 'D38999:21-39', 200, 40)); B.gender = 'S';
  var pl = HX.pinToPinPlan(d, A, B, {}); eq(pl.pairs.length, 39); eq(pl.pairs.filter(function (r) { return r.a.n !== r.b.n; }).length, 0, 'a→a, A→A');
  var r = HX.pinToPin(d, A, B, {}); eq(r.wires.length, 39); eq(r.flipped, B.ref, 'o 2º espelhado'); ok(r.wires.every(function (w) { return w.pts.length === 2; }), 'todos retos');
});
