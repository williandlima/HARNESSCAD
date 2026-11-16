/* Customização: cota livre presa a qualquer item, balão em qualquer item, tabelas editáveis, rótulos ocultáveis */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function mk() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'DSUB:DA-15', 40, 40)), b = d.add(HX.makeConn(d, 'DSUB:DA-15', 240, 40)), A = HX.connLayout(a, 2.5).pins, B = HX.connLayout(b, 2.5).pins;
  d.change('w', function () { for (var i = 0; i < 4; i++) ops.addWire(d, [A[i].pt, B[i].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = r.index; return d;
}
function G(log) { var g = {}; ['style', 'line', 'rect', 'circle', 'push', 'pop', 'clip', 'poly'].forEach(function (k) { g[k] = function () {}; }); g.image = function () { return true; }; g.text = function (t) { log.push(t); }; return g; }
test('cota livre: entre pontos de quaisquer itens, segue o item, horizontal/vertical, texto próprio', function () {
  var d = mk(), sh = d.cur(), log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {});
  var ns = sh.items.filter(function (i) { return i.type === 'pnode'; }), tb = sh.items.filter(function (i) { return i.type === 'ptable'; })[0];
  ok(HX.physSnapPts(sh).length > 10, 'pontos de encaixe'); var sp = HX.physSnapAt(sh, [ns[0].x, ns[0].y], 1); eq(sp[2], ns[0].id);
  var it = d.add({ type: 'pdimx', id: 'dx1', a: HX.physMakeAnchor(sh, [ns[0].x, ns[0].y], sp), b: { of: ns[1].id, dx: 0, dy: 0 }, orient: 'h', off: 6, x: 0, y: 0 });
  HX.drawSheetItems(G(log = []), d.p, d.sheet, {}); eq(it._val, Math.round(Math.abs(ns[1].x - ns[0].x) * 5 * 10) / 10, 'medida em mm reais');
  ns[1].x += 10; HX.drawSheetItems(G(log = []), d.p, d.sheet, {}); eq(it._val, Math.round(Math.abs(ns[1].x - ns[0].x) * 5 * 10) / 10, 'segue o item');
  it.b = HX.physMakeAnchor(sh, [tb._bb.x0, tb._bb.y0], [tb._bb.x0, tb._bb.y0, tb.id, 'canto']); it.text = 'REF'; HX.drawSheetItems(G(log = []), d.p, d.sheet, {}); ok(log.indexOf('REF') >= 0, 'até o canto da tabela, texto próprio');
  d.removeIds([tb.id]); HX.physClean(d); ok(!d.cur().items.some(function (i) { return i.id === 'dx1'; }), 'item apagado leva a cota');
});
test('balão em qualquer item e ponto; tabelas com colunas/títulos/tamanhos editáveis; rótulos ocultáveis', function () {
  var d = mk(), sh = d.cur(), log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {});
  var bom = sh.items.filter(function (i) { return i.type === 'ptable' && i.kind === 'bom'; })[0];
  var b = d.add({ type: 'pball', id: 'b9', of: bom.id, ax: 5, ay: 2, x: 8, y: -10, n: 'Z', r: 4 }); HX.drawSheetItems(G(log = []), d.p, d.sheet, {}); ok(log.indexOf('Z') >= 0 && b._bb.x1 - b._bb.x0 === 8, 'balão na tabela, raio 4');
  bom.cw = '10,0,8,46,66'; bom.ch = 'Nº'; bom.title = 'MATERIAIS'; bom.rh = 5; HX.drawSheetItems(G(log = []), d.p, d.sheet, {});
  ok(log.indexOf('Nº') >= 0 && log.indexOf('QTD') < 0 && log.indexOf('MATERIAIS') >= 0, 'coluna escondida, título e cabeçalho próprios');
  var sg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0]; d.add({ type: 'pacc', id: 'k1', seg: sg.id, end: 'a', dist: 50, kind: 'tie', showLbl: false });
  sg.info = false; HX.drawSheetItems(G(log = []), d.p, d.sheet, {}); var bad = log.filter(function (t) { return /fios · Ø/.test(t) || /^50 de /.test(t); }); ok(!bad.length, 'identificação e rótulo ocultos ' + bad.join('/'));
  d.removeIds([bom.id]); ok(!d.cur().items.some(function (i) { return i.id === bom.id; }), 'tabela apagável');
});
