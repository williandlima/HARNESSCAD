/* HarnessCAD - padrão MS: plugue MS em vetor, adaptador com cordoalha, botas e transições Raychem (datasheet TE),
   luva de solda da blindagem, camada interna e o botão "Aplicar padrão MS" */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
test('Raychem: bota 202K/222K e transição 382A escolhidas pelo Ø (tabela do datasheet)', function () {
  eq(HX.rcBootFor('202K', 20)[0], '202K121', 'Ø20: 10,4 ≤ 20 ≤ 24×0,9'); eq(HX.rcBootFor('202K', 25)[0], '202K132'); eq(HX.rcBootFor('202K', 9)[0], '202K121'); eq(HX.rcBootFor('222K', 30)[0], '222K153');
  eq(HX.rcBootFor('202K', 25)[4], 55, 'comprimento P'); var t = HX.rcTransFor(13, 5, 4); eq(t.r[0], '382A023'); ok(t.loose.indexOf('J') >= 0, 'perna J folgada');
  eq(HX.rcTransFor(5, 3, 3).r[0], '382A012'); ok(HX.rcTransFor(60, 5, 5).over, 'feixe maior que a maior transição');
});
test('MS: carcaça pela inserção, Ø da porca, adaptador e PN da bota na lista', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'MS5015:14S-6', 0, 0)); eq(HX.shellOf(c), 14); ok(HX.msNutD(14) > 25 && HX.msNutD(14) < 30, 'porca 14S ≈ 27,8');
  eq(HX.PDS.rc_202K.pnOf(14), HX.rcBootFor('202K', HX.msAdOD(14))[0] + '-25-0');
});
test('Aplicar padrão MS: adaptador, bota, termorretrátil, cordoalha, transição e luvas de solda', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MS5015:20-27', 0, 0)), b = d.add(HX.makeConn(d, 'MS5015:14S-6', 200, 0)), c = d.add(HX.makeConn(d, 'MS5015:16S-1', 200, 100));
  d.change('w', function () { for (var i = 0; i < 6; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); for (var j = 0; j < 7; j++) ops.addWire(d, [pinPt(a, j + 6), pinPt(c, j)]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5 }); }); d.sheet = r.index; var sh = d.cur(), n;
  d.change('ms', function () { n = HX.physApplyMS(d, sh, { braidPN: 'QQ-B-575', ssPN: 'D-150' }); });
  eq([n.conn, n.br, n.ss], [3, 1, 3]); ok(sh.items.filter(function (i) { return i.type === 'pnode' && i.bsKind === 'ms_ad' && i.bootKind === 'rc_202K'; }).length === 3, 'adaptador + bota');
  ok(sh.items.filter(function (i) { return i.type === 'pseg'; }).every(function (s) { return s.cover === 'cov_shrink'; }), 'termorretrátil');
  var B = HX.physBom(d.p, sh), pn = B.rows.map(function (x) { return x.pn; });
  ok(pn.some(function (p) { return /^382A0\d\d-25-0$/.test(p); }), 'transição na BOM'); ok(pn.some(function (p) { return /^202K1\d\d-25-0$/.test(p); }), 'bota na BOM');
  ok(pn.indexOf('QQ-B-575') >= 0 && pn.indexOf('D-150') >= 0 && pn.indexOf('DR-25') >= 0, 'cordoalha, luva e termorretrátil');
  d.change('x', function () { HX.physApplyMS(d, sh, {}); }); eq(sh.items.filter(function (i) { return i.type === 'pacc' && i.kind === 'ssleeve'; }).length, 3, 'reaplicar não duplica luvas');
  var log = [], g = { push: function () {}, pop: function () {}, style: function () {}, rect: function () {}, line: function () {}, circle: function () {}, poly: function () {}, image: function () { return true; }, clip: function () {}, text: function (t) { log.push(String(t)); } };
  HX.drawSheetItems(g, d.p, d.sheet, {}); ok(log.some(function (t) { return /^382A0/.test(t); }), 'PN da transição no desenho');
});
test('formato da casa (contorno): espaguete contínuo, balões em cadeia e transição com nº da lista', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MS5015:20-27', 0, 0)), b = d.add(HX.makeConn(d, 'MS5015:14S-6', 200, 0)), c = d.add(HX.makeConn(d, 'MS5015:16S-1', 200, 100));
  d.change('w', function () { for (var i = 0; i < 6; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); for (var j = 0; j < 7; j++) ops.addWire(d, [pinPt(a, j + 6), pinPt(c, j)]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, balloons: false }); }); d.sheet = r.index; var sh = d.cur(), n;
  d.change('ms', function () { n = HX.physApplyMS(d, sh, { braidPN: 'QQ-B-575', ssPN: 'D-150' }); });
  eq(sh.pstyle, 'outline'); eq(n.ball, 3 + 3 + 1 + 3, 'conectores + ramos + transição + luvas');
  var m = HX.physIdx(sh), br = sh.items.filter(HX.isBranchNode)[0]; ok(/^rcx:382A0/.test(HX.physItemKey(d.p, br, m)), 'balão da transição');
  var B = HX.physBom(d.p, sh), sg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0]; ok((B.assoc[sg.id] || []).some(function (k) { return /^u:cov_braid/.test(k); }), 'espaguete (4) + cordoalha (5) na mesma cadeia');
  var lines = 0, fan = 0, g = { push: function () {}, pop: function () {}, style: function () {}, rect: function () {}, circle: function () {}, image: function () { return true; }, clip: function () {}, text: function () {}, line: function () { lines++; }, poly: function () { fan++; } };
  HX.drawSheetItems(g, d.p, d.sheet, {}); ok(fan > 0, 'desenha');
  eq(HX.physAddBalloons(d, sh), 0, 'não duplica balões');
});
