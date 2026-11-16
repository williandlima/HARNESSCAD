/* HarnessCAD - D-SUB em desenho técnico (vista de cima) pelo datasheet Amphenol: flange A, furação B (Ø3,10),
   profundidade A máx. (crimpagem), caçapas de solda, fixação V e capa */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness(p1, p2) {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, p1 || 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, p2 || 'M24308:DB-25', 200, 0)); a.gender = 'P'; b.gender = 'S';
  d.change('w', function () { for (var i = 0; i < 9; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'img', faces: true }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  return { d: d, sh: sh, n: n, a: a, b: b };
}
function G(log) {
  var g = {}, st = {}; ['rect', 'line', 'push', 'pop', 'clip'].forEach(function (k) { g[k] = function () { log.push(k); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.poly = function (P) { log.push(['poly', st.fill, P.length]); };
  g.circle = function () { log.push(['circle', st.fill]); }; g.text = function (t) { log.push(['T', t]); }; g.image = function (im) { log.push(['IMG', im && (im.id || im.url)]); return true; }; return g;
}
function texts(o) { var l = []; HX.drawSheetItems(G(l), o.d.p, o.d.sheet, {}); return { l: l, T: l.filter(function (x) { return x[0] === 'T'; }).map(function (x) { return x[1]; }) }; }
test('D-SUB vetor: sem imagem, cotas do flange e furação pelo datasheet', function () {
  var o = harness(); ok(HX.isDsub(o.a), 'é D-SUB'); o.sh.connDraw = 'vec'; o.n.J1.showDims = true; o.n.J1.dsHood = 'none';
  var r = texts(o); ok(!r.l.some(function (x) { return x[0] === 'IMG' && /dsub/.test(x[1]); }), 'sem sprite D-SUB');
  ok(r.T.indexOf('30,81') < 0 && r.T.indexOf('7,75 máx') < 0, 'sem cotas do conector na cablagem');
  var l = [], g = G(l); HX.connDimsDraw(g, o.n.J1, o.a, '#000'); var T = l.filter(function (x) { return x[0] === 'T'; }).map(function (x) { return x[1]; });
  ok(T.indexOf('30,81') >= 0, 'consulta: flange A carcaça E = 30,81'); ok(T.indexOf('24,99 (Ø3,10)') >= 0, 'consulta: furação B, furo Ø3,10'); ok(T.indexOf('7,75 máx') >= 0, 'consulta: caçapa 7,75 máx.');
  ok(o.n.J1._bb && o.n.J1._bb.x1 > o.n.J1._bb.x0, 'caixa calculada');
});
test('D-SUB vetor: A máx. de crimpagem por contatos e gênero (datasheet)', function () {
  var M = function (c, nd) { return HX.dsubSide(c, nd).am; }, o = harness();
  eq(M(o.a, { dsTerm: 'crimp' }), 17.19, 'pino 09 vias'); eq(M(o.b, { dsTerm: 'crimp' }), 17.44, 'soquete 25 vias');
  var p = Object.create(o.b); p.gender = 'P'; eq(M(p, { dsTerm: 'crimp' }), 17.35, 'pino 25 vias');
  o.sh.connDraw = 'vec'; o.n.J2.dsTerm = 'crimp'; o.n.J2.showDims = true; o.n.J2.dsHood = 'none'; var l = []; HX.connDimsDraw(G(l), o.n.J2, o.b, '#000'); ok(l.some(function (x) { return x[1] === 'A máx 17,44'; }), 'consulta: A máx 17,44');
  eq(HX.dsubSide(o.b, { dsTerm: 'crimp', dsHood: 'none' }).total.toFixed(2), '17.44', 'profundidade total = A máx.');
});
test('D-SUB vetor: fixação V, capa e volta para imagem', function () {
  var o = harness(); o.sh.connDraw = 'vec'; o.n.J1.dsHood = 'none'; texts(o); var w0 = o.n.J1._bb.x1 - o.n.J1._bb.x0;
  o.n.J1.dsLock = 'V'; texts(o); ok(o.n.J1._bb.x1 - o.n.J1._bb.x0 > w0 + 3, 'parafuso fêmea sextavado aumenta a vista');
  o.n.J1.dsHood = 'hood'; var r = texts(o); ok(HX.dsubSide(o.a, o.n.J1).hood, 'com capa'); ok(r.l.some(function (x) { return x[0] === 'poly' && x[2] === 8; }), 'contorno da capa');
  o.n.J1.draw = 'img'; ok(texts(o).l.some(function (x) { return x[0] === 'IMG'; }), 'nó volta para imagem');
});
