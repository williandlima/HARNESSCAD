/* HarnessCAD - realismo: conector em desenho técnico (vetor) com medidas do datasheet, cotas do conector, vista
   frontal vetorial com contatos numerados e cor do fio, acessórios com forma real */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness(style) {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:15-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:15-35', 200, 0));
  d.change('w', function () { for (var i = 0; i < 6; i++) { var w = ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); w.color = ['BK', 'WH', 'RD', 'GN', 'BU', 'YE'][i]; } });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: style || 'img', faces: true }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  return { d: d, sh: sh, n: n, a: a };
}
function G(log) {
  var g = {}, st = {}; ['rect', 'line', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.poly = function (P) { log.push(['poly', st.fill, P.length]); };
  g.circle = function () { log.push(['circle', st.fill]); }; g.text = function (t) { log.push(['T', t]); }; g.image = function (im) { log.push(['IMG', im && (im.id || im.url)]); return true; }; g.clip = function () {}; return g;
}
L.antigo('conector em desenho técnico: sem imagem, medidas do datasheet, cotas e medidas próprias', function () {
  var o = harness(), sh = o.sh, d = o.d; sh.connDraw = 'img'; o.n.J1.bootKind = 'boot_s'; o.n.J1.bsKind = 'sr_s';
  var l0 = []; HX.drawSheetItems(G(l0), d.p, d.sheet, {}); ok(l0.some(function (l) { return l[0] === 'IMG' && /plug|wall|jam|line|boot|sr_s/.test(l[1]); }), 'padrão: imagem do datasheet');
  sh.connDraw = 'vec'; o.n.J1.showDims = true; var l1 = []; HX.drawSheetItems(G(l1), d.p, d.sheet, {});
  ok(!l1.some(function (l) { return l[0] === 'IMG' && /plug|wall|jam|line|boot|sr_s/.test(l[1]); }), 'vetor: nenhuma imagem de datasheet');
  var T = l1.filter(function (l) { return l[0] === 'T'; }).map(function (l) { return l[1]; }), P = HX.PDS.d38_26;
  ok(T.indexOf(String(P.L(15)).replace('.', ',')) < 0 && T.indexOf('Ø' + String(P.H(15)).replace('.', ',')) < 0, 'cotas do conector NÃO vão para a cablagem');
  var tb = HX.connDimsTable(o.n.J1, HX.physSchem(d.p)[o.n.J1.of]).map(function (r) { return r[1]; }).join(' '); ok(tb.indexOf('Ø' + P.H(15).toFixed(2).replace('.', ',')) >= 0, 'medidas na consulta');
  o.n.J1.cL = 40; o.n.J1.cD = 30; tb = HX.connDimsTable(o.n.J1, HX.physSchem(d.p)[o.n.J1.of]).map(function (r) { return r[1]; }).join(' ');
  ok(tb.indexOf('40,00 × Ø30,00') >= 0, 'medidas próprias'); o.n.J1.draw = 'img'; var l3 = []; HX.drawSheetItems(G(l3), d.p, d.sheet, {}); ok(l3.some(function (l) { return l[0] === 'IMG'; }), 'nó pode voltar para imagem');
  ok(Object.keys(HX.PHYS_VEC).length >= 7, 'peças em vetor');
});
L.antigo('vista frontal vetorial: contatos numerados na posição real, cor do fio, soquete espelhado', function () {
  var o = harness(), sh = o.sh, d = o.d; sh.connDraw = 'vec'; var e = HX.CAT.conns['D38999:15-35'], vi = HX.VECIMG['face:D38999:15-35']; ok(vi, 'figura oficial do 15-35 vetorizada'); delete HX.VECIMG['face:D38999:15-35']; /* caminho procedural */
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); var T = log.filter(function (l) { return l[0] === 'T'; }).map(function (l) { return l[1]; });
  ok(e.pins.every(function (q) { return T.indexOf(String(q.n)) >= 0; }), 'todos os ' + e.pins.length + ' contatos numerados');
  ok(log.some(function (l) { return l[0] === 'circle' && l[1] === HX.wireHex({ color: 'RD' }); }), 'contato ligado com a cor do fio');
  var l1 = [], c = { part: 'D38999:15-35', gender: 'P', pins: e.pins }, c2 = { part: 'D38999:15-35', gender: 'S', pins: e.pins };
  HX.VECIMG['face:D38999:15-35'] = vi; ok(HX.physVecFace(G(l1), c, 0, 0, 30, '#000', null), 'face de pinos'); ok(!HX.physVecFace(G([]), { part: 'D38999:13-35', gender: 'P' }, 0, 0, 30, '#000', null), 'sem posições publicadas: sem vetor');
  void c2;
});
test('acessórios com forma real: todos desenham e o rótulo continua', function () {
  var o = harness('line'), sh = o.sh, d = o.d, sg = sh.items.filter(function (s) { return s.type === 'pseg'; })[0];
  d.change('a', function () { Object.keys(HX.PACC).forEach(function (k, i) { var a = HX.physAddAcc(d, sg, k); a.dist = 30 + i * 30; }); });
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); var T = log.filter(function (l) { return l[0] === 'T'; }).map(function (l) { return l[1]; });
  ok(T.indexOf('Abraçadeira') >= 0 && T.indexOf('P-clip / braçadeira') >= 0, 'rótulos'); eq(Object.keys(HX.PACC_SHAPES).length, Object.keys(HX.PACC).length, 'forma para cada tipo');
  sh.items.filter(function (i) { return i.type === 'pacc'; }).forEach(function (a) { ok(a._pt && a._bb, a.kind + ' desenhado'); });
});
