/* HarnessCAD - modelagem: par trançado, N/C, tap, cobertura parcial, quebra, rótulo alinhado, destaque cruzado */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function G(log) { var g = {}; ['style', 'rect', 'circle', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; }); g.line = function () { log.push('line'); }; g.poly = function () { log.push('poly'); }; g.push = function (m) { log.push('push'); }; g.text = function (s) { log.push('T:' + s); }; g.image = function () { log.push('IMG'); return true; }; return g; }
function harness() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 200, 0)), c = d.add(HX.makeConn(d, 'M24308:DE-9', 100, 80));
  d.change('w', function () { for (var i = 0; i < 4; i++) { var w = ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); if (i < 2) w.twist = 'TP1'; } ops.addWire(d, [pinPt(a, 5), pinPt(c, 0)]); });
  d.add({ type: 'brk', id: 'b1', ref: 'BR1', x: 100, y: 0 });
  [[a.id, 'b1', 600], ['b1', b.id, 400], ['b1', c.id, 300]].forEach(function (e, i) { d.add({ type: 'dim', id: 'd' + i, a: e[0], b: e[1], x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: e[2], tolP: '', tolM: '', text: '' }); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); return { d: d, r: r, a: a, b: b, c: c };
}
test('par trançado e N/C marcados no esquema; oval do par na tabela de ligação; tap no catálogo', function () {
  var o = harness(), d = o.d, log = []; d.sheet = 0; var w = d.cur().items.filter(function (i) { return i.type === 'wire'; })[4]; w.ncB = true;
  HX.drawSheetItems(G(log), d.p, 0, {}); eq(log.filter(function (x) { return x === 'T:TP1'; }).length, 1, 'um símbolo 8 para o par');
  d.p.view.twistSym = 'sine'; var ls = []; HX.drawSheetItems(G(ls), d.p, 0, {}); eq(ls.filter(function (x) { return x === 'T:TP1'; }).length, 2, 'senoide: marca em cada fio'); delete d.p.view.twistSym;
  var R = HX.physWiring(d.p); eq(R.filter(function (r) { return r.twist === 'TP1'; }).length, 2);
  var sh = d.p.sheets[o.r.index], t = { type: 'ptable', id: 'tw', kind: 'wiring', x: 0, y: 0, w: 170 }; sh.items.push(t); var l2 = []; HX.drawSheetItems(G(l2), d.p, o.r.index, {}); eq(HX.physDiagram(d.p).rows.filter(function (r) { return r.cable === 'T:TP1'; }).length, 2, 'par TP1 agrupado no diagrama');
  ok(HX.CAT.splices.tap && /tap/.test(HX.CAT.splices.tap.d));
});
test('cobertura parcial atravessando BR: comprimento real = caminho − recuos; entra na lista de materiais', function () {
  var o = harness(), d = o.d, sh = d.p.sheets[o.r.index], n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  var J = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; }).sort(function (x, y) { return x.x - y.x; });
  var cv = { type: 'pcov', id: 'cv1', a: J[0].id, b: J[J.length - 1].id, d0: 50, d1: 100, sprite: 'cov_braid', txt: 'MALHA Ø10' }; sh.items.push(cv);
  var Lr = HX.physCoverLen(cv, sh); ok(Lr > 0 && Math.abs(Lr - (HX.physPathLen(sh, cv.a, cv.b).len - 150)) < 1e-6, 'caminho − 150 = ' + Lr);
  d.sheet = o.r.index; var log = []; HX.drawSheetItems(G(log), d.p, o.r.index, {}); ok(cv._P && cv._P.length > 10, 'desenhada');
  var B = HX.physBom(d.p, sh), row = B.key['v:cov_braid:MALHA Ø10']; ok(row && row.un === 'm' && Math.abs(row.qty - Math.round(Lr / 10) / 100) < 1e-9, 'BOM em metros');
  eq(HX.physItemKey(d.p, cv), 'v:cov_braid:MALHA Ø10');
  d.change('x', function () { d.removeIds([cv.a]); }); ok(!d.cur().items.some(function (i) { return i.id === 'cv1'; }), 'apagar o nó leva a cobertura');
});
test('símbolo de quebra no ramo e rótulo alinhado ao ramo', function () {
  var o = harness(), d = o.d, sh = d.p.sheets[o.r.index], sg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0];
  sg.brk = true; sg.y = 10; d.sheet = o.r.index; var log = []; HX.drawSheetItems(G(log), d.p, o.r.index, {}); ok(sg._brk > 0, 'quebra desenhada');
  var nt = { type: 'pnote', id: 'lb', of: sg.id, x: 0, y: -8, text: 'FEIXE A', along: true }; sh.items.push(nt); var l2 = []; HX.drawSheetItems(G(l2), d.p, o.r.index, {}); var ix = l2.indexOf('T:FEIXE A'); eq(l2[ix - 1], 'push', 'texto girado com o ramo');
});
test('destaque cruzado: fio selecionado no esquema → ramos no físico; ramo selecionado → fios', function () {
  var o = harness(), d = o.d, w = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; })[4];
  d.sel = new Set([w.id]);
  var H = HX.crossHL(d.p, o.r.index, { doc: d }); ok(H && H.w[w.id], 'fio destacado');
  var sh = d.p.sheets[o.r.index], B = HX.physBundle(d.p, sh), sg = sh.items.filter(function (i) { return i.type === 'pseg' && B.seg[i.id].wires.length === 1; })[0];
  d.sel = new Set([sg.id]); H = HX.crossHL(d.p, 0, { doc: d }); ok(H.w[B.seg[sg.id].wires[0].id]);
});
