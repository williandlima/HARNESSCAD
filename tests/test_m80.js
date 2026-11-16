/* Harwin Datamate L-Tek fêmea crimpada (M80): catálogo e desenho pela figura oficial (catálogo Harwin p. 20) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function G(log) { var g = {}; ['line', 'rect', 'push', 'pop', 'style', 'circle'].forEach(function (k) { g[k] = function () { log.push([k]); }; });
  g.poly = function (P, c) { log.push(['poly', P, c]); }; g.text = function (t) { log.push(['text', t]); }; return g; }
test('M80: part number pelo "How to order" e medidas do catálogo (A = B + 5,15; 7,65; 5,45/3,50)', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'M80:2x10 (20 vias)', 0, 0);
  eq(HX.connPN(c), 'M80-8882001'); c.variant = 'L05'; eq(HX.connPN(c), 'M80-8892005'); c.variant = 'X'; eq(HX.connPN(c), 'M80-7882001');
  var s = HX.comShape(c); eq([s.cls, s.rows, s.cols, s.A, s.D], ['m80', 2, 10, 23.15, 5.45]);
  var c1 = HX.makeConn(d, 'M80:17 vias (1 fileira)', 0, 0); eq(HX.connPN(c1), 'M80-8981701'); var s1 = HX.comShape(c1); eq([s1.A, s1.D], [37.15, 3.5]);
  ok(!HX.CAT.conns['M80:2x11 (22 vias)'], '22 vias não existe na fileira dupla da L-Tek');
});
test('M80: desenho em escala, lado dos terminais (almofadas no passo 2,00) voltado para o cabo; vista frontal numerada', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'M80:2x6 (12 vias)', 0, 0), o = HX.comShape(c), log = [];
  var b = HX.physComDraw(G(log), o, 1, '#000', true, 2);
  ok(Math.abs(b.x0 + 7.79) < 1e-6 && b.x1 === 0 && Math.abs(b.y1 - b.y0 - 15.15) < 1e-6, 'caixa ' + JSON.stringify(b));
  var pads = log.filter(function (l) { return l[0] === 'poly' && l[2] && Math.abs(Math.max.apply(0, l[1].map(function (q) { return q[0]; }))) < 1e-6; }); /* lado dos terminais no cabo (x = 0) */
  eq(pads.length, 6, 'almofadas'); ok(Math.abs(pads[1][1][0][1] - pads[0][1][0][1] - 2) < 1e-6, 'passo 2,00');
  var lf = []; HX.physLineFace(G(lf), c, 0, 0, 30, '#000', false);
  eq(lf.filter(function (l) { return l[0] === 'text'; }).map(function (l) { return l[1]; }).join(','), c.pins.map(function (p) { return p.n; }).join(','));
});
