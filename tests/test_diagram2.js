/* Diagrama de ligação (2): emenda + equipamento, par trançado com emenda, tampão com jumpers, 6 emendas sem barras sobrepostas */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function fake(rows) { /* lista de fios sintética: [de, para, extra] com pontas 'J1:5', 'SP1' (emenda) ou 'EQ1:3' (equipamento, fora dos conectores) */
  var d = new HX.Doc(); ['J1', 'J2', 'J3', 'J4'].forEach(function (r, i) { var c = d.add(HX.makeConn(d, 'D38999:11-35', 40 + 100 * i, 40)); c.ref = r; });
  function E(t) { var a = t.split(':'); return /^SP/.test(t) ? { kind: 'splice', ref: t } : { kind: 'pin', ref: a[0], pin: a[1] }; }
  var w0 = HX.wireList; HX.wireList = function () { return rows.map(function (r, i) { return Object.assign({ num: 'W' + i, fromEnd: E(r[0]), toEnd: E(r[1]), w: { color: '' }, gauge: '22 AWG', cable: '' }, r[2] || {}); }); };
  try { return HX.physDiagram(d.p); } finally { HX.wireList = w0; }
}
function rs(D) { return D.rows.map(function (r) { var f = function (e) { return e ? e.ref + '.' + e.pin : '-'; }; return (r.drain ? 'D:' : '') + f(r.L) + '>' + (r.R ? f(r.R) : r.ro ? '(' + r.ro.ref + ')' : '-') + (r.cable ? '@' + r.cable : ''); }).join(' '); }
test('diagrama: pino com emenda e ponta de equipamento aparece uma vez (equipamento entra na rede da emenda)', function () {
  var D = fake([['J1:1', 'SP1'], ['SP1', 'J2:1'], ['SP1', 'EQ1:3'], ['J1:2', 'J2:2']]);
  eq(rs(D), 'J1.1>J2.1 J1.2>J2.2 ->(EQ1)'); eq(D.rows.filter(function (r) { return r.L && r.L.ref === 'J1' && r.L.pin === '1'; }).length, 1);
});
test('diagrama: par trançado com emenda mantém o cabo (trança) nas linhas da rede; tampão só com jumpers', function () {
  var D = fake([['J1:1', 'SP1', { cable: 'CB1' }], ['SP1', 'J2:1', { cable: 'CB1' }], ['J1:2', 'J2:2', { cable: 'CB1' }], ['J4:1', 'J4:2'], ['J4:3', 'J4:4']]);
  ok(D.rows.filter(function (r) { return r.cable === 'CB1'; }).length >= 2, rs(D));
  eq(D.jumps.map(function (j) { return j.ref + ':' + j.a + '-' + j.b; }), ['J4:1-2', 'J4:3-4']); eq(D.rows.filter(function (r) { return r.jmp; }).length, 4, 'pinos do tampão uma vez cada');
});
test('diagrama: 6 emendas — barras de redes que se cruzam nunca na mesma coluna (não parecem ligadas)', function () {
  var R = []; for (var i = 1; i <= 6; i++) R.push(['J1:' + i, 'SP' + i], ['SP' + i, 'J2:' + i], ['SP' + i, 'J3:' + i]);
  var d = new HX.Doc(); ['J1', 'J2', 'J3'].forEach(function (r, i) { var c = d.add(HX.makeConn(d, 'D38999:13-35', 40 + 100 * i, 40)); c.ref = r; });
  function E(t) { var a = t.split(':'); return /^SP/.test(t) ? { kind: 'splice', ref: t } : { kind: 'pin', ref: a[0], pin: a[1] }; }
  var w0 = HX.wireList, V = []; HX.wireList = function () { return R.map(function (r, i) { return { num: 'W' + i, fromEnd: E(r[0]), toEnd: E(r[1]), w: { color: '' }, gauge: '22 AWG', cable: '' }; }); };
  var g = { style: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, poly: function () {}, text: function () {}, line: function (a, b, c, e) { if (a === c && b !== e) V.push([a, Math.min(b, e), Math.max(b, e)]); } };
  try { HX.wiringDraw(g, { x: 0, y: 0, w: 170 }, d.p, {}, '#000'); } finally { HX.wireList = w0; }
  eq(V.length, 6, '6 barras'); V.forEach(function (a, i) { V.forEach(function (b, j) { if (i < j && Math.abs(a[0] - b[0]) < 0.5) ok(a[2] < b[1] || b[2] < a[1], 'colunas ' + i + '/' + j + ' sem sobreposição'); }); });
});
