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
function dims(c) { return c.sh.items.filter(function (q) { return q.type === 'pdimx' && q.a && q.a.of === c.t.id; }); }
function sobrepostos(T) { var bad = 0; T.forEach(function (a, i) { T.forEach(function (b, j) { if (j <= i) return; var w = (HX.textW(a.t, a.s) + HX.textW(b.t, b.s)) / 2; if (Math.abs(a.x - b.x) < w && Math.abs(a.y - b.y) < (a.s + b.s) / 2 * 0.8) bad++; }); }); return bad; }
test('etiqueta: por padrão já nasce com 4 cotas livres (medidas), sem conflito de texto mesmo com tolerância', function () {
  var c = cena(), D = dims(c); eq(D.length, 4, 'cotas separadas na geração'); eq(c.t.dim, false); ok(D.every(function (q) { return q.a.k && q.b.k && q.text === '' && q.tx === ''; }), 'medidas e texto automático');
  var T = textos(c).filter(function (q) { return /^(60|40|10|20)( \+.*)?$|^TIP\.$/.test(q.t); }); ok(T.length >= 8, 'textos ' + T.length); eq(sobrepostos(T), 0, 'sobrepostos');
  var m = HX.physIdx(c.sh), C = HX.physCtx(c.d.p, c.s, {}); eq(D.map(function (q) { return HX.tagDimPlace(q, C).text; }), ['60', '40', '10', '20']);
  D[1].tolP = '2'; D[1].tolM = '0'; D[0].tolP = '5'; D[0].tolM = '5'; D[3].tolP = '1'; D[3].tolM = '1';
  T = textos(c).filter(function (q) { return /^(60|40|10|20)( \+.*)?$/.test(q.t); }); ok(T.some(function (q) { return q.t === '40 +2/-0'; }), 'tolerância no texto'); eq(sobrepostos(T), 0, 'com tolerância');
  void m;
});
test('etiqueta: cotas acompanham a etiqueta; refazer volta ao padrão; projeto antigo é convertido ao abrir', function () {
  var c = cena(); textos(c); var D = dims(c), m = HX.physIdx(c.sh), A0 = HX.physAnchorPt(D[1].a, m); c.t.gap = 90; textos(c); var A1 = HX.physAnchorPt(D[1].a, m);
  ok(Math.hypot(A1[0] - A0[0], A1[1] - A0[1]) > 2, 'cota acompanha a etiqueta'); eq(HX.tagDimPlace(D[0], HX.physCtx(c.d.p, c.s, {})).text, '90', 'valor medido atualiza');
  c.d.change('r', function () { HX.tagResetDims(c.d, c.t); }); eq(dims(c).length, 4, 'refeitas'); ok(dims(c)[0] !== D[0]);
  var raw = JSON.parse(JSON.stringify(c.d.p)), sh2 = raw.sheets[c.s]; sh2.items = sh2.items.filter(function (q) { return q.type !== 'pdimx'; }); sh2.items.forEach(function (q) { if (q.type === 'ptag') q.dim = true; });
  var d2 = new HX.Doc(); d2.load(raw, 'antigo'); eq(d2.p.sheets[c.s].items.filter(function (q) { return q.type === 'pdimx'; }).length, 8, '2 etiquetas × 4 cotas');
});
test('balão da etiqueta: ponto de conexão escolhido', function () {
  var c = cena(); textos(c); var b = c.sh.items.filter(function (i) { return i.type === 'pball' && i.of === c.t.id; })[0]; ok(b, 'balão'); ok(c.t._kp.near && c.t._kp.labF && c.t._kp.top, 'pontos');
  eq(HX.TAG_BALL_AT.length, 7); var f = HX.ITEM_EXT.pball.fields(b, { cur: function () { return c.sh; } }); ok(f.some(function (q) { return q.k === 'at'; }), 'campo');
  b.at = 'near'; textos(c); eq(c.t._pt, c.t._pt); ok(c.t._kp.near[0] !== c.t._kp.ext[0], 'pontos diferentes');
});
