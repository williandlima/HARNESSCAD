/* Catálogo de detalhes típicos (pdetc): todos desenham, grupos, inserir, balões pela lista e espaguete na lista */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function cena() {
  var d = new HX.Doc(), P = d.add(HX.makeConn(d, 'D38999:25-35', 40, 30)), J = d.add(HX.makeConn(d, 'D38999:25-35', 200, 30)), LP = HX.connLayout(P, 2.5).pins, LJ = HX.connLayout(J, 2.5).pins, r;
  d.change('w', function () { for (var i = 0; i < 4; i++) HX.ops.addWire(d, [LP[i].pt, LJ[i].pt]); });
  d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line', faces: true, balloons: true, tables: true }); }); d.sheet = r.index; return { d: d, s: r.index, sh: d.p.sheets[r.index] };
}
function textos(c) { var T = [], g = new Proxy({}, { get: function (o, k) { return k === 'text' ? function (t) { T.push(String(t)); } : function () { return false; }; } }); HX.drawSheetItems(g, c.d.p, c.s, {}); return T; }
test('catálogo de detalhes: 11 detalhes nos 4 grupos, todos desenham com cotas, balões e referência', function () {
  var K = Object.keys(HX.DETC); ok(K.length >= 11 && HX.DETC.ssplice, 'detalhes ' + K.length); eq(HX.DETC_GRP.map(function (g) { return g[0]; }), ['blind', 'fio', 'con', 'feixe']);
  HX.DETC_GRP.forEach(function (g) { ok(K.some(function (k) { return HX.DETC[k].grp === g[0]; }), 'grupo ' + g[0]); });
  var c = cena(); K.forEach(function (k) { var it; c.d.change('i', function () { it = HX.detcAdd(c.d, k); }); ok(it && it.kind === k, k); });
  var T = textos(c); c.sh.items.filter(function (i) { return i.type === 'pdetc'; }).forEach(function (it) { ok(it._bb && it._bb.x1 - it._bb.x0 > 40, 'desenhado ' + it.kind); ok(HX.DETC[it.kind].ref, 'referência ' + it.kind);
    ok(HX.ITEM_EXT.pdetc.fields(it).length > 6, 'campos ' + it.kind); });
  ['±1', '±5', 'TIP.', 'REF', 'DETALHE B', 'SEÇÃO', 'GROMMET'].forEach(function (t) { ok(T.indexOf(t) >= 0, 'texto ' + t); });
  ok(T.some(function (t) { return /JANELA DE INSPEÇÃO/.test(t); }), 'nota da crimpagem');
});
test('detalhe da cordoalha: balões pela lista de materiais, espaguete sob a cordoalha, customização', function () {
  var c = cena(), it; c.d.change('i', function () { it = HX.detcAdd(c.d, 'cord'); }); var B = HX.physBom(c.d.p, c.sh), esp = B.rows.filter(function (q) { return /^cesp:/.test(q.k); })[0];
  ok(esp, 'espaguete na lista'); eq(esp.qty, 120, '60 × 2 pontas'); var T = textos(c);
  ['cesp:', 'barb:', 'ss:'].forEach(function (k) { var q = B.rows.filter(function (x) { return x.k.indexOf(k) === 0; })[0]; ok(q && T.indexOf(String(q.n)) >= 0, 'balão ' + k); });
  it.d3 = 70; it.t3 = '±3'; it.b_ss = '99'; it.label = 'DETALHE C'; T = textos(c); ['70', '±3', '99', 'DETALHE C'].forEach(function (t) { ok(T.indexOf(t) >= 0, 'editado ' + t); });
  eq(HX.physBom(c.d.p, c.sh).rows.filter(function (q) { return /^cesp:/.test(q.k); })[0].qty, 140);
});
test('catálogo de detalhes: escala negativa, minúscula ou acima do limite (10) não trava nem explode o desenho', function () {
  var n = 0, f = function () {}, g = { style: f, poly: f, rect: f, circle: f, text: f, push: f, pop: f, line: function () { if (++n > 3e5) throw new Error('linhas demais'); } };
  Object.keys(HX.DETC).forEach(function (k) { [-1, 0.01, 50].forEach(function (e) { n = 0; HX.detcRender(g, { kind: k, x: 0, y: 0, label: '-', esc: e }, HX.DETC[k], '#00f', null, 2.6); ok(n > 0, k + ' esc ' + e); }); });
});
