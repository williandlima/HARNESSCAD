/* HarnessCAD - desenho físico editável: ramo maleável, cota angular que gira o ramo, aparência por item, camadas,
   preparação da ponta */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0)), c = d.add(HX.makeConn(d, 'D38999:11-35', 100, 90));
  d.change('w', function () { for (var i = 0; i < 6; i++) { var w = ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); w.color = ['BK', 'WH', 'RD', 'GN', 'BU', 'YE'][i]; } for (var j = 0; j < 3; j++) ops.addWire(d, [pinPt(a, 12 + j), pinPt(c, j)]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  return { d: d, sh: sh, n: n };
}
function G(log) {
  var g = {}, st = {}; ['rect', 'line', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; log.push(['S', st.stroke, st.lw]); }; g.poly = function (P) { log.push(['poly', st.stroke, P.length]); };
  g.circle = function () {}; g.text = function (t, x, y, o) { log.push(['T', t, (o || {}).size, (o || {}).color]); }; g.image = function () { return true; }; g.clip = function () {}; return g;
}
function near(P, q) { return Math.min.apply(null, P.map(function (p) { return Math.hypot(p[0] - q[0], p[1] - q[1]); })); }
test('ramo maleável: curva passa pelos pontos, acompanha os nós, dividir e juntar mantêm o traçado', function () {
  var o = harness(), sh = o.sh, d = o.d; sh.route = 'smooth'; var m = HX.physIdx(sh), sg = sh.items.filter(function (s) { return s.type === 'pseg'; })[0];
  var A = m[sg.a], B = m[sg.b], mid = [(A.x + B.x) / 2, (A.y + B.y) / 2 - 20], mid2 = [A.x * 0.8 + B.x * 0.2, A.y * 0.8 + B.y * 0.2 + 10];
  HX.physAddBend(sg, m, mid); HX.physAddBend(sg, m, mid2); eq(sg.bends.length, 2); ok(sg.bends[0][0] < sg.bends[1][0], 'na ordem do traçado');
  var P = HX.physSegPts(sg, m); ok(near(P, mid) < 0.05 && near(P, mid2) < 0.05, 'passa pelos pontos');
  var L0 = HX.polyLen(P), ddx = (B.x - A.x) * 0.3, ddy = (B.y - A.y) * 0.3; B.x += ddx; B.y += ddy; var P2 = HX.physSegPts(sg, m); ok(HX.polyLen(P2) > L0, 'estica com o nó'); B.x -= ddx; B.y -= ddy;
  var W = HX.physBendWorld(sg, m), nd; d.change('s', function () { nd = HX.physSplitAt(d, sg, 0.5); });
  m = HX.physIdx(sh); var segs = sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === nd.id || s.b === nd.id); }), all = [];
  segs.forEach(function (s) { all = all.concat(HX.physSegPts(s, m)); }); W.forEach(function (q) { ok(near(all, q) < 0.5, 'traçado mantido ao dividir'); });
  d.change('j', function () { HX.physMergeBR(d, nd, sh); }); m = HX.physIdx(sh); ok(near(HX.physSegPts(sg, m), [nd.x, nd.y]) < 0.5, 'junto: o BR vira ponto de curva');
  HX.physStraighten(sg); eq(HX.physSegPts(sg, m).length, 2);
});
test('cota angular: mede o ângulo entre os ramos e o valor digitado gira o lado do ramo', function () {
  var o = harness(), sh = o.sh, d = o.d, br = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind !== 'conn'; })[0];
  if (!br) { var s0 = sh.items.filter(function (s) { return s.type === 'pseg'; })[0]; d.change('x', function () { br = HX.physSplitAt(d, s0, 0.5); }); var j3 = o.n.J3, s3 = HX.physSegsOf(sh, j3.id)[0]; d.change('r', function () { HX.physReattach(d, s3, s3.a === j3.id ? 'b' : 'a', br); }); }
  var a; d.change('a', function () { a = HX.physAddAng(d, br); }); ok(a, 'cota criada');
  var m = HX.physIdx(sh), v0 = HX.physAngValue(a, m).deg; ok(v0 > 0 && v0 < 180);
  eq(HX.physAngSet(sh, a, 45), ''); m = HX.physIdx(sh); ok(Math.abs(HX.physAngValue(a, m).deg - 45) < 0.5, 'girou para 45°');
  var s1 = m[a.s1], far = m[s1.a === a.node ? s1.b : s1.a], x0 = far.x; HX.physAngSet(sh, a, 100); eq(far.x, x0, 'o lado do 1º ramo não anda');
  ok(/inválido/.test(HX.physAngSet(sh, a, 'x')));
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.some(function (l) { return l[0] === 'T' && /^100°/.test(l[1]); }), 'texto do ângulo');
});
test('aparência por item (cor, espessura, texto), ângulo de rótulo e camadas ocultas', function () {
  var o = harness(), sh = o.sh, d = o.d, no = sh.items.filter(function (i) { return i.type === 'pnote'; })[0];
  no.sCol = '#c00000'; no.sFs = 2; var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {});
  ok(log.some(function (l) { return l[0] === 'T' && l[3] === '#c00000' && l[2] >= 4; }), 'texto vermelho e maior');
  var dm = sh.items.filter(function (i) { return i.type === 'pdim'; })[0]; if (dm) { dm.sLw = 2; var l2 = []; HX.drawSheetItems(G(l2), d.p, d.sheet, {}); ok(l2.some(function (l) { return l[0] === 'S' && Math.abs(l[2] - 0.36) < 1e-6; }), 'linha da cota mais grossa'); }
  sh.layers = { cotas: false, notas: false }; var l3 = []; HX.drawSheetItems(G(l3), d.p, d.sheet, {});
  ok(!l3.some(function (l) { return l[0] === 'T' && l[3] === '#c00000'; }), 'rótulo oculto'); eq(HX.hitDist(no, [0, 0], 2.5), 1e9, 'oculto não seleciona');
  delete sh.layers; no.rot = 30; var l4 = []; HX.drawSheetItems(G(l4), d.p, d.sheet, {}); HX.drawSheetItems(G(l4 = []), d.p, d.sheet, {}); ok(l4.indexOf('push') >= 0);
});
test('preparação da ponta: capa, malha, condutores nas cores com nº do fio e pino, cotas A/B/C', function () {
  var o = harness(), d = o.d, r; d.change('p', function () { r = HX.physAddPrep(d, o.n.J1); r.shield = true; r.A = 35; });
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); var T = log.filter(function (l) { return l[0] === 'T'; }).map(function (l) { return l[1]; });
  ok(T.indexOf('A = 35') >= 0 && T.indexOf('B = 10') >= 0 && T.indexOf('C = 4') >= 0, 'cotas');
  ok(T.some(function (t) { return /^W1 · /.test(t); }), 'fio com pino'); eq(T.filter(function (t) { return /^W\d+ · /.test(t); }).length, 9, '9 fios no J1');
  ok(log.some(function (l) { return l[0] === 'poly' && l[1] === HX.wireHex({ color: 'RD' }); }), 'cor do fio');
});
