/* Detalhe típico da montagem da cordoalha (pcord): desenho, balões pela lista de materiais e espaguete na lista */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
test('detalhe típico da cordoalha: 3 etapas, cotas com tolerância, balões da lista e espaguete sob a cordoalha', function () {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:25-35', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:25-35', 200, 30)), LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins, r;
  d.change('w', function () { for (var i = 0; i < 4; i++) HX.ops.addWire(d, [LP[i].pt, LJ[i].pt]); });
  d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line', faces: true, balloons: true, tables: true }); });
  var sh = d.p.sheets[r.index]; d.sheet = r.index; var c; d.change('c', function () { c = HX.physAddCord(d); }); ok(c && c.type === 'pcord', 'inserido');
  var T = [], g = new Proxy({}, { get: function (o, k) { return k === 'text' ? function (t) { T.push(String(t)); } : function () { return false; }; } }); HX.drawSheetItems(g, d.p, r.index, {});
  ok(c._bb && c._bb.x1 - c._bb.x0 > 100, 'desenhado'); ['5', '50', '60', '±1', '±5', 'TIP.', 'REF', 'DETALHE B'].forEach(function (t) { ok(T.indexOf(t) >= 0, 'texto ' + t); });
  var B = HX.physBom(d.p, sh), esp = B.rows.filter(function (q) { return /^cesp:/.test(q.k); })[0]; ok(esp, 'espaguete na lista'); eq(esp.qty, 120, '60 mm × 2 pontas com adaptador');
  var nums = ['cesp:', 'barb:', 'ss:'].map(function (k) { var q = B.rows.filter(function (x) { return x.k.indexOf(k) === 0; })[0]; return q ? String(q.n) : null; });
  nums.forEach(function (n) { ok(n && T.indexOf(n) >= 0, 'balão ' + n); }); ok(T.indexOf('?') < 0, 'todos os balões com número');
  c.d3 = 70; c.n8 = '99'; T = []; HX.drawSheetItems(g, d.p, r.index, {}); ok(T.indexOf('70') >= 0 && T.indexOf('99') >= 0, 'editável'); eq(HX.ITEM_EXT.pcord.fields().length > 15, true);
});
