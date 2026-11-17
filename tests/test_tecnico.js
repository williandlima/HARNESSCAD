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
  var W = (F.r.warn || []).join(' '); ok(/Adaptador de cordoalha/.test(W) && !/D38999/.test(W), 'só o adaptador (sem datasheet) aguarda; o D38999 tem desenho oficial');
});
test('MS3476 (medida típica) e comercial sem datasheet: contorno AGUARDANDO DATASHEET e aviso ao gerar', function () {
  var F = folha('MS3476:20-41', 'DT:4 vias'), T = []; HX.drawSheetItems(G(T), F.d.p, F.r.index, {});
  ok(T.filter(function (t) { return t === 'AGUARDANDO'; }).length >= 2, 'contornos pendentes');
  ok((F.r.warn || []).some(function (w) { return /Aguardando datasheet/.test(w) && /DT/.test(w); }), 'aviso');
  ok(HX.PHYS_VEC_TIPICO.ms_p && !HX.PHYS_VEC_TIPICO.d38_26, 'típicos guardados, oficiais intactos');
});
test('Harwin M80 e D-Sub continuam com o desenho do datasheet', function () {
  var F = folha('M80:2x5 (10 vias)', 'DSUB:DE-9'), T = []; HX.drawSheetItems(G(T), F.d.p, F.r.index, {});
  ok(T.indexOf('AGUARDANDO') < 0, 'sem pendências');
});
