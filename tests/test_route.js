/* HarnessCAD - ramificação: traçado livre (cantos arredondados, sem laço), ângulos retos (só H/V), curvas suaves,
   ramo inteiro (subárvore) ao arrastar e alinhamento */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function sheet(route) {
  var it = [{ type: 'pnode', id: 'A', nkind: 'conn', x: 0, y: 0 }, { type: 'pnode', id: 'B', nkind: 'virt', x: 50, y: 0 }, { type: 'pnode', id: 'C', nkind: 'conn', x: 100, y: 30 },
    { type: 'pnode', id: 'D', nkind: 'conn', x: 90, y: -40 }, { type: 'pnode', id: 'E', nkind: 'conn', x: -40, y: 10 },
    { type: 'pseg', id: 's1', a: 'A', b: 'B' }, { type: 'pseg', id: 's2', a: 'B', b: 'C' }, { type: 'pseg', id: 's3', a: 'B', b: 'D' }, { type: 'pseg', id: 's4', a: 'E', b: 'A' }];
  return { kind: 'phys', route: route, items: it };
}
test('ângulos retos: todos os trechos horizontais/verticais (fora os cantos arredondados)', function () {
  var sh = sheet('ortho'), m = HX.physIdx(sh), W = HX.physOrtho([[50, 0], [100, 30]]); eq(W, [[50, 0], [100, 0], [100, 30]], 'cotovelo H depois V');
  var P = HX.physSegPts(m.s2, m), L0 = HX.polyLen(P); ok(Math.abs(L0 - 80) < 2, 'comprimento ≈ |dx|+|dy| (canto arredondado)'); eq(P[0], [50, 0]); eq(P[P.length - 1], [100, 30]);
  eq(HX.physOrtho([[0, 0], [10, 10], [30, 0]]).length, 5, 'alterna H/V sem voltar');
});
test('livre: retas com canto arredondado passando perto do ponto de curva; curva suave passa por ele', function () {
  var sh = sheet('free'), m = HX.physIdx(sh); HX.physAddBend(m.s2, m, [70, 40]); var P = HX.physSegPts(m.s2, m), mx = 0;
  P.forEach(function (q) { mx = Math.max(mx, q[1]); }); ok(mx < 40 && mx > 35, 'canto arredondado'); ok(P.every(function (q) { return q[0] >= 49.9 && q[0] <= 100.1; }), 'não volta para trás');
  sh.route = 'smooth'; m = HX.physIdx(sh); var Q = HX.physSegPts(m.s2, m); ok(Q.some(function (q) { return Math.hypot(q[0] - 70, q[1] - 40) < 0.05; }), 'suave passa pelo ponto');
  sh.route = 'free'; m = HX.physIdx(sh); m.s2.route = 'ortho'; eq(HX.physRouteOf(m.s2, m), 'ortho', 'ramo pode ter traçado próprio');
});
test('ramo inteiro: arrastar o BR leva os ramos do lado oposto ao tronco', function () {
  var sh = sheet('free'); eq(HX.physSubtree(sh, sh.items[1]).sort(), ['B', 'C', 'D'], 'BR + ramos'); eq(HX.physSubtree(sh, sh.items[2]), ['C'], 'ponta: só ela');
  eq(HX.physSubtree(sh, sh.items[0]).sort(), ['A', 'E'], 'nó do meio: lado menor');
});
test('fios sem capa saem do conector já na ordem do ramo (sem leque separado cruzando)', function () {
  ok(typeof HX.physFan === 'function'); HX._looseConn = { n1: 1 }; HX._looseNodes = [{ id: 'n1', x: 5, y: 5 }];
  var calls = 0, g = { push: function () { calls++; }, pop: function () {}, style: function () {}, poly: function () {} };
  HX.physFan(g, 5, 5, 1, 0, [{ color: 'RD' }], 2, 2); eq(calls, 0, 'conector com ramo sem capa: sem leque'); HX.physFan(g, 9, 9, 1, 0, [{ color: 'RD' }], 2, 2); ok(calls > 0, 'outros: leque normal');
  HX._looseConn = {}; HX._looseNodes = [];
});
test('conector girado à mão: o ramo sai da saída do conector, no eixo dele (não se solta)', function () {
  var sh = sheet(''), m = HX.physIdx(sh), sg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0], A = m[sg.a];
  A.nkind = 'conn'; A.rot = 300; var P = HX.physSegPts(sg, HX.physIdx(sh)), d = [P[1][0] - P[0][0], P[1][1] - P[0][1]], l = Math.hypot(d[0], d[1]);
  ok(Math.abs(P[0][0] - A.x) < 1e-6 && Math.abs(P[0][1] - A.y) < 1e-6, 'começa no nó (saída do conector)');
  ok(Math.abs(d[0] / l - Math.cos(300 * Math.PI / 180)) < 1e-6 && Math.abs(d[1] / l - Math.sin(300 * Math.PI / 180)) < 1e-6, 'sai no eixo do conector');
  eq(Math.round(HX.physAngle(A, sh.items)), 300); A.rot = '';
});
test('padrão: feixe sem capa (fios aparentes); capa só quando escolhida', function () {
  var sg = { cover: '' }; ok(HX.physLooseOf(sg, {}), 'sem escolha = fios aparentes'); ok(!HX.physLooseOf({ loose: 'jacket' }, {}), 'com capa'); ok(!HX.physLooseOf({ cover: 'cov_braid' }, {}), 'cobertura = não');
});
