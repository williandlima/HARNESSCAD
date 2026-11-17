/* Desenho técnico dos conectores (traço de catálogo): rosca com perfil em dente, recartilhado, sextavado, flange e bota */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function G(log) { var g = {}, st = {}; ['line', 'rect', 'push', 'pop', 'clip', 'text'].forEach(function (k) { g[k] = function () { log.push([k, st.stroke]); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.poly = function (P) { log.push(['poly', st.stroke, P.length, st.fill]); }; g.circle = function () { log.push(['circle', st.stroke]); }; return g; }
test('peças D38999/MS: rosca e recartilhado têm perfil em dente; sextavado com furos; linha de centro', function () {
  ['ms_r', 'ms_rf'].forEach(function (k) {
    var log = []; HX.PHYS_VEC[k](G(log), 0, 0, 40, 20);
    ok(log.some(function (l) { return l[0] === 'poly' && l[2] > 20; }), k + ': contorno serrilhado (rosca/recartilhado)');
    ok(log.filter(function (l) { return l[0] === 'line'; }).length > 10, k + ': filetes/estrias');
  });
});
test('figuras oficiais vetorizadas: /24, /20, TV01, alívio de tensão e botas traço a traço, com faixas cheias e fundo', function () {
  ['d38_24', 'd38_20', 'tv01', 'sr_s', 'boot_s', 'boot_90'].forEach(function (k) {
    ok(HX.vecImgHas(k), k + ': dados da figura');
    var log = []; HX.PHYS_VEC[k](G(log), 0, 0, 40, 20); var polys = log.filter(function (l) { return l[0] === 'poly'; });
    ok(polys.length > 40, k + ': traços da figura (' + polys.length + ')');
    ok(polys[0][3] && polys[0][2] > 8, k + ': silhueta pintada antes dos traços');
    if (/d38|tv01/.test(k)) ok(log.some(function (l) { return l[0] === 'line'; }), k + ': linha de centro');
  });
  ['d38_24', 'd38_20', 'tv01'].forEach(function (k) {
    var log = []; HX.PHYS_VEC[k](G(log), 0, 0, 40, 20);
    ok(log.filter(function (l) { return l[0] === 'poly' && l[3] === l[1] && l[1]; }).length >= 2, k + ': faixas de acoplamento cheias na cor da caneta');
  });
});
test('comerciais: todas as classes desenham em traço de catálogo e devolvem a caixa', function () {
  ['M12:A 4p', 'M8:3p', 'COAX:BNC', 'DT:4 vias', 'XLR:XLR3', 'RJ:RJ45 T568B', 'USB:USB-A', 'HAN:3A', 'MicroFit:2 vias', 'MSTB:2 vias', 'TERM:Terminal olhal'].forEach(function (p) {
    var d = new HX.Doc(), c = d.add(HX.makeConn(d, p, 0, 0)), o = HX.comShape(c), log = [];
    var b = HX.physComDraw(G(log), o, 1, '#123456', true, 3);
    ok(b && b.x0 < 0 && b.x1 === 0 && b.y0 < 0 && b.y1 > 0, p + ': caixa');
    ok(log.length >= 7, p + ': detalhado (' + log.length + ' traços)');
    ok(log.every(function (l) { return !l[1] || l[1] === '#123456' || l[0] === 'text'; }), p + ': cor de traço única no modo traço');
  });
});
test('figura do datasheet vetorizada: plugue D38999/26 e vista frontal 25-35 traço a traço, na cor da caneta', function () {
  ok(HX.vecImgHas('d38_26') && HX.vecImgHas('face:D38999:25-35'), 'dados carregados');
  var log = []; HX.PHYS_VEC.d38_26(G(log), 0, 0, 30, 40);
  ok(log.filter(function (l) { return l[0] === 'poly'; }).length > 200, 'centenas de traços (estrias, rosca, catraca)');
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:25-35', 0, 0)); log = [];
  var b = HX.physLineFace(G(log), c, 50, 50, 30, '#123456', true, 1);
  eq(log.filter(function (l) { return l[0] === 'circle'; }).length, 128, '128 contatos');
  ok(Math.abs(b.x1 - b.x0 - 30) < 1e-6 && b.geom.shell === '25', 'caixa');
  ok(log.every(function (l) { return !l[1] || l[1] === '#123456'; }), 'cor única');
});
