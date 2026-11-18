/* HarnessCAD - detalhamento dos ramos: corpo único com juntas redondas, fios aparentes, amarração (abraçadeira, barbante, fita) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0)), c = d.add(HX.makeConn(d, 'D38999:11-35', 100, 90));
  d.change('w', function () { for (var i = 0; i < 8; i++) { var w = ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); w.color = ['BK', 'WH', 'RD', 'GN', 'BU', 'YE', 'OG', 'VT'][i]; } for (var j = 0; j < 4; j++) ops.addWire(d, [pinPt(a, 12 + j), pinPt(c, j)]); });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1200, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  var tr = sh.items.filter(function (s) { return s.type === 'pseg' && s.len === 1200; })[0], br; d.change('b', function () { br = HX.physSplitAt(d, tr, 0.5); });
  var s3 = HX.physSegsOf(sh, n.J3.id)[0]; d.change('r', function () { HX.physReattach(d, s3, s3.a === n.J3.id ? 'b' : 'a', br); }); s3.len = 400;
  return { d: d, sh: sh, n: n, br: br, s3: s3, T: HX.physTrunkAt(sh, br) };
}
function G(log) { var g = {}; ['rect', 'line', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; }); var st = {}; g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.poly = function (P) { log.push(['poly', st.stroke, st.lw, P.length]); }; g.circle = function (x, y, r) { log.push(['circle', st.fill, r]); }; g.text = function (t) { log.push(['T', t]); }; g.image = function () { return true; }; return g; }
test('pontos de amarração em mm reais; padrão da folha e exceção do ramo; lista de materiais', function () {
  eq(HX.physBindMarks(600, 150, 40), [40, 190, 340, 490, 560]); eq(HX.physBindMarks(50, 150, 40), [25]);
  var o = harness(), sh = o.sh; sh.bind = 'tie'; sh.bindPN_tie = 'T18R';
  eq(HX.physBindOf(o.T.s1, sh), 'tie'); o.T.s2.bind = 'none'; eq(HX.physBindOf(o.T.s2, sh), ''); o.s3.bind = 'lace'; o.s3.bindStep = 100;
  var B = HX.physBom(o.d.p, sh), tie = B.key['bind:tie:T18R'], lace = B.key['bind:lace:'];
  eq(tie.qty, HX.physBindMarks(600, 150, 40).length, '600 mm a cada 150 mm'); ok(lace && lace.un === 'm' && lace.qty > 0.3 && lace.qty < 2, 'barbante em metros: ' + (lace && lace.qty));
  o.T.s2.bind = 'tape'; var tp = HX.physBom(o.d.p, sh).key['bind:tape:']; ok(tp && tp.qty > 0, 'fita');
});
test('feixe com capa: corpo único com juntas redondas na derivação; sem capa: um traço por fio, na cor do fio', function () {
  var o = harness(), sh = o.sh, log = []; HX.drawSheetItems(G(log), o.d.p, o.d.sheet, {});
  var circ = log.filter(function (l) { return l[0] === 'circle' && l[1] === '#fff'; }); ok(circ.length >= 1, 'junta redonda no BR');
  o.s3.loose = 'wires'; ok(HX.physLooseOf(o.s3, sh)); var lg = []; HX.drawSheetItems(G(lg), o.d.p, o.d.sheet, {});
  var cols = lg.filter(function (l) { return l[0] === 'poly' && /^#/.test(l[1] || '') && l[1] !== '#222' && l[3] > 8; }).map(function (l) { return l[1]; });
  ok(cols.length >= 4, 'fios do ramo do J3 desenhados um a um: ' + cols.length);
  sh.loose = 'wires'; o.s3.loose = ''; ok(HX.physLooseOf(o.T.s1, sh), 'padrão da folha'); o.T.s1.cover = 'cov_braid'; ok(!HX.physLooseOf(o.T.s1, sh), 'cobertura vence');
});
test('identificação do ramo: nº de fios, Ø e amarração; desligável', function () {
  var o = harness(), sh = o.sh; o.T.s1.bind = 'tie'; sh.segInfo = true; /* folha nova da casa sai sem; o usuário liga */ var log = []; HX.drawSheetItems(G(log), o.d.p, o.d.sheet, {});
  ok(log.some(function (l) { return l[0] === 'T' && /^12 fios · Ø.* · abraçadeira de nylon$/.test(l[1]); }), 'texto do tronco');
  sh.segInfo = false; var l2 = []; HX.drawSheetItems(G(l2), o.d.p, o.d.sheet, {}); ok(!l2.some(function (l) { return l[0] === 'T' && /fios · Ø/.test(l[1]); }));
});
