/* Só desenho técnico, fiel ao datasheet: o que não tem desenho oficial sai como "AGUARDANDO DATASHEET" */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function G(T) { var g = {}; ['style', 'line', 'poly', 'rect', 'circle', 'push', 'pop'].forEach(function (k) { g[k] = function () {}; }); g.image = function () { T.push('IMG'); return true; }; g.text = function (t) { T.push(String(t)); }; return g; }
function folha(a, b) {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, a, 40, 30)), J = d.add(HX.makeConn(d, b, 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'img' }); }); return { d: d, r: r, sh: d.p.sheets[r.index] };
}
test('toda folha física sai em traço (sem imagens), mesmo pedindo "imagens"', function () {
  var F = folha('D38999:21-39', 'D38999:21-39'), T = []; HX.drawSheetItems(G(T), F.d.p, F.r.index, {}); eq(F.sh.pstyle, 'line'); ok(T.indexOf('IMG') < 0, 'sem imagem raster');
  var W = (F.r.warn || []).join(' '); ok(!/Adaptador|D38999|Bota/.test(W), 'D38999 + Pre-Shield /115 + bota 202K: tudo com desenho oficial: ' + W);
});
test('comercial sem datasheet (DT): contorno AGUARDANDO DATASHEET e aviso ao gerar', function () {
  var F = folha('D38999:21-39', 'DT:4 vias'), T = []; HX.drawSheetItems(G(T), F.d.p, F.r.index, {});
  ok(T.indexOf('AGUARDANDO') >= 0, 'contorno pendente');
  ok((F.r.warn || []).some(function (w) { return /Aguardando datasheet/.test(w) && /DT/.test(w); }), 'aviso');
  ok(HX.PHYS_VEC_TIPICO.ms_p && !HX.PHYS_VEC_TIPICO.d38_26, 'típicos guardados, oficiais intactos');
});
test('Harwin M80 e D-Sub continuam com o desenho do datasheet', function () {
  var F = folha('M80:2x5 (10 vias)', 'DSUB:DE-9'), T = []; HX.drawSheetItems(G(T), F.d.p, F.r.index, {});
  ok(T.indexOf('AGUARDANDO') < 0, 'sem pendências');
});
test('MS3476 pelo traço oficial Amphenol (MB16): cotas da tabela por carcaça, sem AGUARDANDO', function () {
  eq(HX.PDS.ms3476.L(20), 36.07, 'comprimento 1,420 máx'); eq(HX.PDS.ms3476.H(8), 19.86, 'Ø A carcaça 8 (.782)'); eq(HX.PDS.ms3476.H(24), 45.14, 'Ø A carcaça 24 (1.777)');
  ok(HX.DS_OK.pecas.ms3476, 'registrado como desenho de datasheet');
  [8, 16, 24].forEach(function (s) { var Y = [], X = [], g = { style: function () {}, push: function () {}, pop: function () {}, text: function (t) { ok(t !== 'AGUARDANDO'); }, line: function () {}, circle: function () {}, rect: function () {},
    poly: function (P) { P.forEach(function (q) { X.push(q[0]); Y.push(q[1]); }); } }, W = HX.PDS.ms3476.L(s), H = HX.PDS.ms3476.H(s);
    HX.PHYS_VEC.ms3476(g, 0, 0, W, H); var h = Math.max.apply(0, Y) - Math.min.apply(0, Y), w = Math.max.apply(0, X) - Math.min.apply(0, X);
    ok(Math.abs(h - H) < H * 0.02, 'altura = Ø A (' + s + '): ' + h); ok(Math.abs(w - W) < 0.3, 'comprimento = 1,420 (' + s + '): ' + w); });
});
test('Pre-Shield Amphenol (M85049/109 J e /115 L): tabelas do catálogo, PN, bota na ranhura', function () {
  eq(HX.PDS.pre_j.H(20), 41.53, 'Ø A J20'); eq(HX.PDS.pre_l.H(21), 41.66, 'Ø A L21'); eq(HX.PDS.pre_j.pnOf(20), 'M85049/109-20TW11-6'); eq(HX.PDS.pre_l.pnOf(9), 'M85049/115-09TW01-6');
  eq(HX.preEntry(HX.PRESHIELD.J, 20, 3), 7, 'entrada limitada à mínima da carcaça');
  var Y = [], g = { style: function () {}, push: function () {}, pop: function () {}, text: function () {}, line: function () {}, circle: function () {}, rect: function () {}, poly: function (P) { P.forEach(function (q) { Y.push(q[1]); }); } };
  HX._preEnt = ''; HX.PHYS_VEC.pre_j(g, 0, 0, HX.PDS.pre_j.L(20), 41.53); ok(Math.abs(Math.max.apply(0, Y) - Math.min.apply(0, Y) - 41.53) < 0.5, 'altura = Ø A');
  ok(HX.DS_OK.pecas.pre_j && HX.DS_OK.pecas.pre_l);
});
test('fases: periférico (backshell) não é do esquema — o valor antigo vai para o nó físico ao gerar', function () {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:21-39', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:21-39', 200, 30)); J.mx = true; P.backshell = 'M85049/88-21W03';
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index], S = HX.physSchem(d.p);
  var n = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn' && S[i.of] === P; })[0]; eq(n.backshell, 'M85049/88-21W03');
});
test('fases: comprimento do fio e do cabo vem do desenho físico (sem campo no esquema)', function () {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:21-39', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:21-39', 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins, y0 = LP[0].pt[1]; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); });
  d.add({ type: 'cable', id: d.uid('k'), ref: 'CB1', x: 115, y: y0 - 2.5, w: 10, h: 5, shield: true, part: 'M27500', len: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index];
  sh.items.forEach(function (i) { if (i.type === 'pseg') i.len = 700; });
  var B = HX.buildBOM(d.p), w = B.filter(function (x) { return x.cat === '5-Fio'; })[0], c = B.filter(function (x) { return x.cat === '6-Cabo'; })[0];
  ok(w && w.qty >= 0.7, 'fio pelo físico: ' + (w && w.qty)); ok(c && c.qty >= 0.7, 'cabo pelo físico: ' + (c && c.qty));
});
