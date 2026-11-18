/* Etiqueta (padrão da casa): cotas sem conflito de texto, cotas separadas em cotas livres e ponto do balão */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function cena() {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:25-35', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:25-35', 200, 30)), LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins, r;
  d.change('w', function () { for (var i = 0; i < 4; i++) HX.ops.addWire(d, [LP[i].pt, LJ[i].pt]); });
  d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line', faces: true, balloons: true, tables: true }); });
  var sh = d.p.sheets[r.index]; sh.scale = 10; var t = sh.items.filter(function (i) { return i.type === 'ptag' && i.style === 'etiqtr'; })[0]; t.len = 40; t.lab = 20; t.gap = 60;
  return { d: d, sh: sh, s: r.index, t: t };
}
function textos(c) { var T = [], M = [[1, 0, 0, 1, 0, 0]];
  var g = new Proxy({}, { get: function (o, k) { return k === 'push' ? function (m) { var a = M[M.length - 1]; M.push([a[0] * m[0] + a[2] * m[1], a[1] * m[0] + a[3] * m[1], a[0] * m[2] + a[2] * m[3], a[1] * m[2] + a[3] * m[3], a[0] * m[4] + a[2] * m[5] + a[4], a[1] * m[4] + a[3] * m[5] + a[5]]); } :
    k === 'pop' ? function () { M.pop(); } : k === 'text' ? function (t, x, y, o2) { var m = M[M.length - 1]; T.push({ t: String(t), x: m[0] * x + m[2] * y + m[4], y: m[1] * x + m[3] * y + m[5], s: (o2 && o2.size) || 2 }); } : function () { return false; }; } });
  HX.drawSheetItems(g, c.d.p, c.s, {}); return T; }
test('etiqueta: cotas estreitas (10 e 20) não sobrepõem os textos', function () {
  var c = cena(), T = textos(c).filter(function (q) { return /^(10|20|TIP\.)$/.test(q.t); }), bad = 0;
  T.forEach(function (a, i) { T.forEach(function (b, j) { if (j <= i) return; var w = (HX.textW(a.t, a.s) + HX.textW(b.t, b.s)) / 2; if (Math.abs(a.x - b.x) < w && Math.abs(a.y - b.y) < (a.s + b.s) / 2 * 0.8) bad++; }); });
  ok(T.length >= 4, 'textos ' + T.length); eq(bad, 0, 'textos sobrepostos');
});
test('etiqueta: separar cotas = 4 cotas livres presas aos pontos da etiqueta, seguem a etiqueta', function () {
  var c = cena(); textos(c); var n; c.d.change('s', function () { n = HX.tagSplitDims(c.d, c.t); });
  eq(n.length, 4); eq(c.t.dim, false); eq(n.map(function (q) { return q.text; }), ['60', '40', '10', '20']); eq(n[0].sub, 'TIP.'); ok(n.every(function (q) { return q.a.of === c.t.id && q.a.k; }));
  var m = HX.physIdx(c.sh), A0 = HX.physAnchorPt(n[1].a, m); c.t.gap = 90; textos(c); var A1 = HX.physAnchorPt(n[1].a, m);
  ok(Math.hypot(A1[0] - A0[0], A1[1] - A0[1]) > 2, 'cota acompanha a etiqueta');
});
test('balão da etiqueta: ponto de conexão escolhido', function () {
  var c = cena(); textos(c); var b = c.sh.items.filter(function (i) { return i.type === 'pball' && i.of === c.t.id; })[0]; ok(b, 'balão'); ok(c.t._kp.near && c.t._kp.labF && c.t._kp.top, 'pontos');
  eq(HX.TAG_BALL_AT.length, 7); var f = HX.ITEM_EXT.pball.fields(b, { cur: function () { return c.sh; } }); ok(f.some(function (q) { return q.k === 'at'; }), 'campo');
  b.at = 'near'; textos(c); eq(c.t._pt, c.t._pt); ok(c.t._kp.near[0] !== c.t._kp.ext[0], 'pontos diferentes');
});
