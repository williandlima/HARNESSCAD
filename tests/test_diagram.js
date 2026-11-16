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
