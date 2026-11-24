/* Lista de fiação (2): UNIÃO DE VIAS — várias origens no mesmo destino se unem numa emenda (bolinha) e daí sai UMA via só;
   nenhum trecho de fio por cima de outro; redes exatamente como escritas */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function sobre(d) { var S = []; d.items().forEach(function (w) { if (w.type === 'wire') for (var i = 1; i < w.pts.length; i++) S.push([w.pts[i - 1], w.pts[i]]); }); var n = 0;
  S.forEach(function (a, i) { S.slice(i + 1).forEach(function (b) { var va = Math.abs(a[0][0] - a[1][0]) < 1e-6, vb = Math.abs(b[0][0] - b[1][0]) < 1e-6, k = va ? 0 : 1, o = 1 - k; if (va !== vb || Math.abs(a[0][k] - b[0][k]) > 1e-6) return;
    if (Math.min(Math.max(a[0][o], a[1][o]), Math.max(b[0][o], b[1][o])) - Math.max(Math.min(a[0][o], a[1][o]), Math.min(b[0][o], b[1][o])) > 1e-6) n++; }); }); return n; }
function run(txt) { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)); a.ref = 'J1'; var r; d.change('l', function () { r = HX.wtApply(d, HX.wtParse(d, txt)); });
  var nl = HX.buildNetlist(d.p); return { d: d, r: r, nets: nl.nets.map(function (n) { return n.pins.map(function (t) { return t.ref + ':' + t.pin; }).sort(HX.natCmp).join(' '); }).sort(), mid: nl.midTouches.length }; }
function viasNoPino(d, ref, pin) { var c = d.items().filter(function (i) { return i.ref === ref; })[0], q = HX.connLayout(c, 2.5).pins.filter(function (x) { return String(x.n) === pin; })[0].pt;
  return d.items().filter(function (w) { return w.type === 'wire' && w.pts.some(function (p) { return Math.abs(p[0] - q[0]) < 1e-6 && Math.abs(p[1] - q[1]) < 1e-6; }); }).length; }
console.log('Lista de fiação: união de vias');
test('J1:A e J1:B no J2:B: as duas vias se unem numa emenda e chega UMA via só no J2:B (também escrito "J1:A,B > J2:B")', function () {
  ['J2 = D38999:13-98\nJ1:A > J2:B\nJ1:B > J2:B', 'J2 = D38999:13-98\nJ1:A,B > J2:B', 'J2 = D38999:13-98\nJ1:B > J2:B\nJ1:A > J2:B'].forEach(function (t) {
    var R = run(t); eq(R.nets, ['J1:A J1:B J2:B'], t); eq(R.r.failed, []); eq(sobre(R.d), 0, 'nenhum trecho sobreposto: ' + t); eq(viasNoPino(R.d, 'J2', 'B'), 1, 'uma via só no pino: ' + t);
    ok(R.d.items().some(function (i) { return i.type === 'splice'; }), 'bolinha da emenda'); eq(R.mid, 0); });
});
test('uniões mistas (3 origens, origem já ligada indo a 2º destino, destinos em conectores diferentes): sem sobreposição, uma via por pino', function () {
  var R = run('J2 = D38999:13-98\nJ3 = D38999:13-98\nJ1:A, J1:B, J1:C > J2:B\nJ1:F > J2:F\nJ1:E > J2:F\nJ1:K,J > J2:A\nJ1:D > J3:C\nJ1:D > J3:D\nJ1:G > J2:G, J3:G\nJ1:H > J2:G');
  eq(R.r.failed, []); eq(R.nets, ['J1:A J1:B J1:C J2:B', 'J1:D J3:C J3:D', 'J1:E J1:F J2:F', 'J1:G J1:H J2:G J3:G', 'J1:J J1:K J2:A']); eq(sobre(R.d), 0); eq(R.mid, 0);
  [['J1', 'D'], ['J1', 'G'], ['J2', 'B'], ['J2', 'F'], ['J2', 'A'], ['J2', 'G'], ['J3', 'G'], ['J3', 'C'], ['J3', 'D']].forEach(function (p) { eq(viasNoPino(R.d, p[0], p[1]), 1, p.join(':') + ' com uma via só'); });
});
