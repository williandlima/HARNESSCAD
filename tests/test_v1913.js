/* v1.9.13: medida entre conectores no esquemático, sincronizada com o desenho físico */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.13 — medida entre conectores no esquema ⇄ físico');
function proj() { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:15-19', 40, 40)), b = d.add(HX.makeConn(d, 'MS3476:14-19', 200, 40)); a.ref = 'J1'; b.ref = 'P2';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > P2:A\nJ1:B > P2:B')); }); return { d: d, a: a, b: b }; }
function dimOf(d) { return d.p.sheets[0].items.filter(function (i) { return i.type === 'dim'; })[0]; }
test('cota J1–P2 no esquema: fios calculados pela medida (+ folgas) e o físico gerado usa a medida', function () {
  var o = proj(), d = o.d; d.change('c', function () { HX.dimAdd(d, o.a, o.b, 1500); }); var W = d.items().filter(function (i) { return i.type === 'wire'; });
  eq(HX.wireLenInfo(d.p, W[0]).eff, 1500 + 2 * (+d.p.defaults.lenEnd || 0));
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 'auto', faces: true, balloons: true, tables: true, keepPos: true }); });
  ok(!r.warn.some(function (w) { return /estrela/.test(w); }), 'sem aviso de "sem cota"'); eq(HX.dimPhysPath(d.p, dimOf(d)).len, 1500);
});
test('com físico: mudar a medida no esquema muda o ramo; mudar o ramo no físico muda a medida do esquema; desfazer volta', function () {
  var o = proj(), d = o.d; d.change('c', function () { HX.dimAdd(d, o.a, o.b, 1500); }); var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, faces: true, balloons: true, tables: true, keepPos: true }); });
  d.change('e', function () { dimOf(d).len = 2000; }); eq(HX.dimPhysPath(d.p, dimOf(d)).len, 2000, 'esquema → físico');
  var sg = r.sheet.items.filter(function (i) { return i.type === 'pseg'; })[0]; d.change('f', function () { sg.len = 2500; }); eq(dimOf(d).len, 2500, 'físico → esquema');
  d.undo(); eq(dimOf(d).len, 2000);
});
test('ferramenta Cota fica no esquema (antes ia para o físico); derivação continua indo para o físico', function () {
  var src = L.fs.readFileSync(L.path.join(__dirname, '../web/js/tools_phys.js'), 'utf8'); ok(!/t === 'dim' \|\| t === 'brk'/.test(src) && /t === 'brk'/.test(src));
});
