/* Montagem MIL no padrão da casa: conector → adaptador (luva de solda + barbante dentro) → bota */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function G(log) { var g = {}, st = {}; ['rect', 'push', 'pop', 'text'].forEach(function (k) { g[k] = function () { log.push([k]); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.line = function () { log.push(['line', st.lw]); }; g.poly = function (P, c) { log.push(['poly', P.length, c, st.fill]); }; g.circle = function () { log.push(['circle']); }; return g; }
test('MS3476/MS26482 usam o desenho MS em traço (plugue/flange/porca) e a carcaça do arranjo', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'MS3476:20-41', 0, 0), ST = HX.physVecST; HX.physVecST = function () { return { vec: true, col: '#000', line: true }; };
  try { eq(HX.physDSFor({}, c), 'ms_p'); c.variant = '70'; eq(HX.physDSFor({}, c), 'ms_rf'); c.variant = '74'; eq(HX.physDSFor({}, c), 'ms_r'); } finally { HX.physVecST = ST; }
  eq(HX.shellOf(c), 20);
});
test('desenhos da prancha: porca recartilhada em diamante, adaptador com estrias, bota que afunila em curva', function () {
  var a = [], b = [], c = []; HX.PHYS_VEC.ms_p(G(a), 0, 0, 40, 37); HX.PHYS_VEC.ms_ad(G(b), 0, 0, 35, 34); HX.PHYS_VEC.rc_202K(G(c), 0, 0, 60, 30);
  ok(a.filter(function (l) { return l[0] === 'line' && l[1] < 0.07; }).length > 20, 'recartilhado em diamante');
  ok(a.some(function (l) { return l[0] === 'circle'; }), 'ponto de trava');
  eq(b.filter(function (l) { return l[0] === 'line'; }).length, 8, 'estrias retas do adaptador');
  ok(c.some(function (l) { return l[0] === 'poly' && l[1] > 20 && l[2]; }), 'contorno da bota (cilindro + curva + pescoço)');
  eq(HX.PDS.ms_ad.ov, 0, 'adaptador encostado no conector');
});
test('lista de materiais: luva de solda e barbante por adaptador (ficam dentro da bota)', function () {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'MS3476:20-41', 40, 30)), J = d.add(HX.makeConn(d, 'MS3476:20-41', 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index];
  sh.items.forEach(function (i) { if (i.type === 'pnode' && i.nkind === 'conn') { i.bsKind = 'ms_ad'; i.bootKind = 'rc_202K'; } });
  var B = HX.physBom(d.p, sh).rows, f = function (re) { return B.filter(function (x) { return re.test(x.desc); })[0]; };
  eq(f(/^Luva de solda/).qty, 2); eq([f(/^Barbante/).qty, f(/^Barbante/).un], [0.5, 'm']); ok(f(/^Adaptador de cordoalha/), 'adaptador na lista'); ok(f(/202K|Bota/), 'bota na lista');
});
test('barbante do engate rápido: laço com cota TIP. e soma no barbante; cordoalha como camada interna', function () {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'MS3476:20-41', 40, 30)), J = d.add(HX.makeConn(d, 'MS3476:20-41', 200, 30)); J.mx = true;
  var LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins; d.change('w', function () { HX.ops.addWire(d, [LP[0].pt, LJ[0].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index];
  var N = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; }); eq(N[0].bsKind, 'ms_ad'); eq(sh.under, 'cov_braid');
  N[0].lany = 230; var B = HX.physBom(d.p, sh).rows, b = B.filter(function (x) { return /^Barbante/.test(x.desc); })[0]; eq(b.qty, 0.73);
  ok(B.some(function (x) { return /^Cordoalha/.test(x.desc); }), 'cordoalha na lista');
  var log = [], g = G(log); g.text = function (t) { log.push(['text', t]); }; HX.ITEM_EXT.pnode.draw(g, N[0], d.p, r.index, {});
  ok(log.some(function (l) { return l[0] === 'text' && l[1] === '230'; }) && log.some(function (l) { return l[1] === 'TIP.'; }), 'cota do barbante');
});
