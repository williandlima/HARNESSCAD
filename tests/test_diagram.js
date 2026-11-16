/* Diagrama de ligação no padrão das pranchas da casa (ptable 'wiring'): ordem, par trançado com dreno, exceções e nota */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function build() {
  var d = new HX.Doc(), sh = d.p.sheets[0], P = d.add(HX.makeConn(d, 'DT:4 vias', 40, 30)), J = d.add(HX.makeConn(d, 'DT:4 vias', 200, 30)); P.ref = 'P1'; J.ref = 'J1'; J.mx = true; J.gender = 'P';
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins, n = 1;
  function W(pts, extra) { var w = Object.assign({ type: 'wire', id: d.uid('w'), pts: pts, num: 'W' + n++, gauge: '24', color: 'WH' }, extra || {}); sh.items.push(w); return w; }
  W([LP[0].pt, [100, LP[0].pt[1]], [100, LJ[3].pt[1]], LJ[3].pt], { gauge: '20' });            /* P1:1 -> J1:4, bitola diferente */
  W([LP[1].pt, [60, LP[1].pt[1]], [60, 80], [180, 80], [180, LJ[0].pt[1]], LJ[0].pt]);          /* par: P1:2 -> J1:1 */
  W([LP[2].pt, [62.5, LP[2].pt[1]], [62.5, 82.5], [177.5, 82.5], [177.5, LJ[1].pt[1]], LJ[1].pt], { color: 'WH-BU' }); /* P1:3 -> J1:2 */
  var cb = { type: 'cable', id: d.uid('k'), ref: 'CB1', x: 115, y: 78, w: 10, h: 7, shield: true, drain: 'node' }; sh.items.push(cb);
  var dp = HX.cableDrainPt(cb); sh.items.push({ type: 'splice', id: d.uid('j'), ref: 'SP1', x: dp[0], y: dp[1] });
  W([LP[3].pt, [65, LP[3].pt[1]], [65, dp[1]], dp]); W([dp, [175, dp[1]], [175, LJ[2].pt[1]], LJ[2].pt]); /* dreno P1:4 -> malha -> J1:3 */
  return d;
}
test('diagrama: ordem pelos pinos de destino, par do cabo junto e dreno (emenda no ponto de dreno) logo abaixo, unido', function () {
  var D = HX.physDiagram(build().p);
  eq(D.rows.map(function (r) { return (r.drain ? 'D' : '') + r.L.pin + '>' + r.R.pin + (r.cable ? '@' + r.cable : ''); }).join(' '), '2>1@CB1 3>2@CB1 D4>3@CB1 1>4');
  eq([D.gauge, D.color], ['24 AWG', 'WH']);
  eq(HX.colorAbbr('WH-BU'), 'BC/AZ'); eq(HX.colorAbbr('BK'), 'PR');
});
test('diagrama: blocos com ref. e PN, trança nas duas pontas, rótulo só nas exceções e nota "EXCETO ONDE INDICADO"', function () {
  var d = build(), T = [], polys = 0, g = { style: function () {}, line: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {},
    poly: function () { polys++; }, text: function (t) { T.push(String(t)); } };
  var it = { type: 'ptable', kind: 'wiring', x: 0, y: 0, w: 170 }, sh = { items: [], pstyle: 'line' };
  HX.ITEM_EXT.ptable.draw(g, it, Object.assign(d.p, { sheets: d.p.sheets.concat([Object.assign(sh, { phys: true, name: 'Desenho físico' })]) }), 1, { theme: {} });
  ok(T.indexOf('P1') >= 0 && T.indexOf('J1') >= 0, 'referências');
  ok(T.some(function (t) { return /^DT/.test(t) || /DT/.test(t); }), 'PN embaixo: ' + T.slice(-6).join('|'));
  ok(T.indexOf('20 AWG') >= 0 && T.indexOf('BC') >= 0 && T.indexOf('BC/AZ') >= 0, 'exceções: ' + T.join('|'));
  ok(T.some(function (t) { return t === 'OBS: TODOS OS CABOS SÃO BITOLA 24AWG, EXCETO ONDE INDICADO.'; }), 'nota');
  it.wstyle = 'tabela'; T.length = 0; HX.ITEM_EXT.ptable.draw(g, it, d.p, 1, { theme: {} }); ok(T.indexOf('TABELA DE LIGAÇÃO') >= 0, 'formato antigo continua disponível');
});
test('lista de materiais da casa: sobre o carimbo (base ancorada), item 1 embaixo, QTD com unidade, descrição em maiúsculas', function () {
  var T = [], g = { style: function () {}, line: function () {}, rect: function () {}, circle: function () {}, poly: function () {}, push: function () {}, pop: function () {}, text: function (t, x, y) { T.push([String(t), y]); } };
  var d = build(), r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); });
  var it = { type: 'ptable', kind: 'bom', anchor: 'b', x: 0, y: 100 }; HX.ITEM_EXT.ptable.draw(g, it, d.p, r.index, { theme: {} });
  ok(d.p.sheets[r.index].items.some(function (i) { return i.type === 'ptable' && i.kind === 'bom' && i.anchor === 'b' && Math.abs(i.y - HX.usableArea(d.p).y1) < 1e-6; }), 'gerada sobre o carimbo');
  ok(T[0][0] === 'ITEM' && T[4][0] === '1' && T[8][0] === '2' && T[0][1] > T[4][1] && T[4][1] > T[8][1], 'cabeçalho embaixo, item 1 logo acima, item 2 acima dele');
  ok(it._bb.y1 === 100, 'base na âncora'); ok(T.some(function (q) { return / mm$/.test(q[0]); }), 'fio em mm');
  ok([6, 10, 14].every(function (k) { return T[k] && T[k][0] === T[k][0].toUpperCase() && /[A-Z]/.test(T[k][0]); }), 'descrição em maiúsculas');
  eq(HX.bomQty({ qty: 2.8, un: 'm' }), '2.800 mm'); eq(HX.bomQty({ qty: 4, un: 'pç' }), '4'); eq(HX.bomQty({ qty: 0.5, un: 'RL' }), '0,5 RL');
});
