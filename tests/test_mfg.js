/* HarnessCAD - fabricação: decapagem, folga por ponta, tabela de conexão, balão com peças, gabarito 1:1 */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function build() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:11-35', 120, 0));
  d.change('w', function () { var w = ops.addWire(d, [pinPt(a, 0), pinPt(b, 0)]); w.gauge = '20'; var v = ops.addWire(d, [pinPt(a, 1), pinPt(b, 1)]); v.gauge = '22'; v.stripB = '3.5'; v.twist = 'TP1'; });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1000, tolP: '', tolM: '', text: '' });
  return { d: d, a: a, b: b };
}
test('decapagem: típica pelo contato (Deutsch DT #16 = 6,35–7,92; MIL #22D = 3,2–4,0), manual por ponta, N/C', function () {
  var o = build(), R = HX.wireList(o.d.p);
  eq(R[0].stripA, '6,35–7,92'); ok(/^3,2–4|^4–4,8/.test(R[0].stripB), R[0].stripB); eq(R[1].stripB, '3,5'); eq(R[1].twist, 'TP1');
  R[0].w.ncB = true; eq(HX.wireList(o.d.p)[0].stripB, 'N/C');
  eq(HX.stripFor({ part: 'JSTXH:2' }, null, 26).txt, '3–4', 'sem tabela: genérico por bitola'); eq(HX.stripFor(null, null, 26), null);
});
test('folga por conector (nó do desenho físico) soma no comprimento de corte', function () {
  var o = build(), d = o.d; d.p.defaults.lenEnd = 50; var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); });
  var w = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; })[0];
  eq(Math.round(HX.computeLengths(d.p).wires[w.id].eff), 1100, '1000 + 50 + 50');
  d.p.sheets[r.index].items.filter(function (i) { return i.type === 'pnode' && i.of === o.a.id; })[0].folga = 200;
  eq(Math.round(HX.computeLengths(d.p).wires[w.id].eff), 1250, '1000 + 200 + 50');
});
test('tabela de conexão por conector e balão com contatos (peças associadas)', function () {
  var o = build(), d = o.d, r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); d.sheet = r.index;
  var sh = d.cur(), nA = sh.items.filter(function (i) { return i.type === 'pnode' && i.of === o.a.id; })[0];
  sh.items.push({ type: 'ptable', id: 'tc', kind: 'conn', of: nA.id, x: 20, y: 200 });
  var T = [], g = {}; ['style', 'line', 'poly', 'rect', 'circle', 'push', 'pop'].forEach(function (k) { g[k] = function () {}; }); g.image = function () { return true; }; g.text = function (s) { T.push(String(s)); };
  HX.drawSheetItems(g, d.p, d.sheet, {});
  ok(T.some(function (t) { return /^CONEXÕES X1/.test(t) || /^CONEXÕES /.test(t); }) && T.indexOf('6,35–7,92') >= 0, 'tabela de conexão');
  var B = HX.physBom(d.p, sh); ok(B.rows.some(function (x) { return x.pn === '0462-201-16141' || /^04[66]0-/.test(x.pn); }), 'contato DT na lista'); ok((B.assoc[nA.id] || []).length >= 1, 'peças associadas ao conector');
  ok(B.rows.some(function (x) { return /^MS27488/.test(x.pn); }), 'tampões do 38999 vedado (cavidades vazias)');
});
test('gabarito 1:1: tamanho real, folhas com sobreposição, índice + régua', function () {
  var o = build(), d = o.d; d.change('g', function () { HX.applyPhysical(d, { scale: 10 }); });
  var L = HX.formboardLayout(d.p, { paper: 'A4', orient: 'land', overlap: 15 }); ok(L.b.x1 - L.b.x0 > 1000, 'chicote de 1 m em tamanho real');
  eq(L.cols, Math.max(1, Math.ceil((L.b.x1 - L.b.x0 - 15) / (297 - 20 - 15))));
  var s = Buffer.from(HX.exportFormboard(d.p, { paper: 'A4', orient: 'land' })).toString('latin1'); eq((s.match(/\/Type \/Page\b/g) || []).length, 1 + L.cols * L.rows);
  ok(/conferir: 100 mm/.test(s) && /GABARITO 1:1/.test(s));
  eq(d.p.sheets.filter(HX.isPhys)[0].scale, 10, 'o projeto não é alterado');
});
