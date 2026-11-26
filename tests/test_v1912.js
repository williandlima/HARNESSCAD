/* v1.9.12: físico com escala automática dentro da folha, esquema limpo, conector novo na área útil, relatórios de produção */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('v1.9.12 — escala automática, esquema limpo, corte e teste');
function proj() { var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:15-19', 40, 40)), b = d.add(HX.makeConn(d, 'MS3476:14-19', 200, 40)), c = d.add(HX.makeConn(d, 'DSUB:DB-25', 200, 160)); a.ref = 'J1'; b.ref = 'P2'; c.ref = 'J3';
  d.change('w', function () { HX.wtApply(d, HX.wtParse(d, 'J1:A > P2:A\nJ1:B > P2:B\nJ1:C > P2:C\nJ1:D > J3:1\nJ1:E > J3:2\nJ1:F > J3:3, P2:D')); }); return d; }
test('físico "auto": escala da norma, chicote dentro da moldura, vistas sem invadir as tabelas, ERC sem aviso de moldura; traço preto', function () {
  var d = proj(), r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 'auto', style: 'line', faces: true, balloons: true, tables: true, keepPos: true }); });
  ok(HX.PHYS_SCALES.indexOf(+r.sheet.scale) >= 0, 'escala da norma'); var A = HX.usableArea(d.p), B = HX.physChiBox(r.sheet);
  ok(B.x0 >= A.x0 - 1 && B.y0 >= A.y0 - 1 && B.x1 <= A.x1 + 1, 'dentro da área útil');
  ok(!HX.runERC(d.p).some(function (e) { return /moldura/.test(e.msg); }), 'nada fora da moldura');
  var T = r.sheet.items.filter(function (i) { return i.type === 'ptable'; }).map(function (i) { return i._bb; }), F = r.sheet.items.filter(function (i) { return i.type === 'pface'; }).map(function (i) { return i._bb; });
  ok(!F.some(function (f) { return T.some(function (t) { return f && t && f.x0 < t.x1 && t.x0 < f.x1 && f.y0 < t.y1 && t.y0 < f.y1; }); }), 'vistas fora das tabelas');
  eq(HX.PHYS_LINE_COLOR, '#111111');
  var d2 = proj(), r2; d2.change('g', function () { r2 = HX.applyPhysical(d2, { scale: 5, faces: true, balloons: true, tables: true, keepPos: true }); }); eq(+r2.sheet.scale, 5, 'escala escolhida é respeitada');
});
test('lista de fiação: conector novo (J4 = PEÇA) nasce dentro da área útil e sem encostar em outro item', function () {
  var d = proj(), r; d.change('x', function () { r = HX.wtApply(d, HX.wtParse(d, 'J4 = DSUB:DE-9\nJ4:1 > J1:G')); }); eq(r.failed, []);
  var j = d.items().filter(function (i) { return i.ref === 'J4'; })[0], b = HX.bbox(j, 2.5), A = HX.usableArea(d.p);
  ok(b.x0 >= A.x0 && b.x1 <= A.x1 && b.y0 >= A.y0 && b.y1 <= A.y1, JSON.stringify(b));
  ok(!d.items().some(function (i) { if (i === j || i.type !== 'conn') return false; var o = HX.bbox(i, 2.5); return b.x0 < o.x1 && o.x0 < b.x1 && b.y0 < o.y1 && o.y0 < b.y1; }), 'sem sobrepor');
});
test('esquema: bolinha de pino livre só com Exibir › Marcar pinos livres; nº dos fios no PDF com a chave da folha', function () {
  var d = proj(), nl = HX.buildNetlist(d.p), n = 0, g = { style: function () {}, line: function () {}, rect: function () {}, poly: function () {}, push: function () {}, pop: function () {}, text: function () {}, image: function () { return false; }, circle: function (x, y, r) { if (r === 0.45) n++; } };
  HX.drawSheetItems(g, d.p, 0, { connected: nl.connected, nl: nl }); eq(n, 0, 'sem bolinhas por padrão');
  d.p.view.openPins = true; HX.drawSheetItems(g, d.p, 0, { connected: nl.connected, nl: nl }); ok(n > 0, 'com a chave ligada');
  var w = d.items().filter(function (i) { return i.type === 'wire'; })[0]; eq(HX.wireLblOpts(w).lblPos, 'n'); HX._printWN = true; eq(HX.wireLblOpts(w).lblPos, 'a'); HX._printWN = false;
});
test('lista de corte (ordem, contatos, decapagem, corte com %) e lista de teste (ponto a ponto por rede)', function () {
  var d = proj(); d.change('l', function () { d.items().filter(function (i) { return i.type === 'wire'; }).forEach(function (w) { HX.wireLenSet(d, w, 400); }); });
  var C = HX.cutList(d.p); eq(C.length, d.items().filter(function (i) { return i.type === 'wire'; }).length); eq(C[0].from.indexOf('J1'), 0); ok(C[0].ctA && C[0].stripA, 'contato e decapagem');
  eq(C[0].cut, Math.round(400 * 1.05)); var T = HX.testList(d.p), nl = HX.buildNetlist(d.p), esperado = 0;
  nl.nets.forEach(function (n) { var k = n.pins.length; if (k > 1) esperado += k - 1; }); eq(T.length, esperado); ok(T.every(function (t) { return t.from !== t.to; }));
  ok(HX.PRINT_SECTIONS.some(function (s) { return s.id === 'cutlist'; }) && HX.PRINT_SECTIONS.some(function (s) { return s.id === 'testlist'; }), 'no PDF');
});
