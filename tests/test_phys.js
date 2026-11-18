/* HarnessCAD - fase 2: desenho físico da cablagem */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
var fs = require('fs'), path = require('path');
function near(a, b) { return Math.abs(a - b) < 0.01; }
function sample() {
  var d = new HX.Doc();
  function C(part, x, v) { var c = d.add(HX.makeConn(d, part, x, 40)); if (v) c.variant = v; return c; }
  var J1 = C('D38999:13-35', 20, '26'), J2 = C('D38999:11-35', 300, '20'), J3 = C('M24308:DE-9', 120), X1 = C('DT:4 vias', 260);
  var B1 = d.add({ type: 'brk', id: 'b1', ref: 'BR1', x: 120, y: 40 }), B2 = d.add({ type: 'brk', id: 'b2', ref: 'BR2', x: 160, y: 40 });
  function D(a, b, len) { d.add({ type: 'dim', id: d.uid('d'), a: a.id, b: b.id, x: a.x, y: a.y, x2: b.x, y2: b.y, orient: 'a', off: 5, len: len, tolP: '', tolM: '', text: '' }); }
  D(J1, B1, 600); D(B1, B2, 300); D(B2, J2, 450); D(B1, J3, 250); D(B2, X1, 350);
  return d;
}
function nodes(sh) { var m = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') m[i.ref] = i; }); return m; }
test('43 imagens do painel: PNG < 10 KB, transparentes, tamanho confere', function () {
  var k = Object.keys(HX.PSPR); k = k.filter(function (id) { return !HX.PSPR[id].clone; }); eq(k.filter(function (id) { return HX.PSPR[id].cat !== 'ds'; }).length, 43); /* coberturas novas da biblioteca reusam a imagem */
  k.forEach(function (id) { var s = HX.PSPR[id], b = L.imgBytes(s.url); ok(b.length < 10000, id); eq([b.readUInt32BE(16), b.readUInt32BE(20)], [s.w, s.h], id); ok(s.len > 0 && s.ey > 0 && s.ey < 1, id); });
});
test('imagem automática pelo tipo do conector (família + estilo)', function () {
  var d = new HX.Doc(); function S(part, v) { var c = HX.makeConn(d, part, 0, 0); if (v !== undefined) c.variant = v; return HX.physSpriteFor(c); }
  eq([S('D38999:11-35', '26'), S('D38999:11-35', '20'), S('D38999:11-35', '24'), S('D38999:11-35', '25')], ['mil_plug', 'mil_recep_wall', 'mil_recep_jam', 'mil_recep_pcb']);
  eq([S('MS5015:10SL-3', '06A'), S('MS5015:10SL-3', '00A'), S('M24308:DE-9'), S('M83513:MD-9'), S('COAX:BNC'), S('COAX:TNC'), S('M12:A 4p')], ['ms_plug', 'mil_recep_wall', 'dsub_bs', 'microd_bs', 'bnc', 'tnc', 'm12']);
  eq(S('DT:4 vias'), null, 'sem imagem correspondente');
});
test('gera do esquemático em escala: tronco horizontal, ramos a 90°, comprimento no papel = real / N', function () {
  var d = sample(), r = HX.genPhysical(d.p, { scale: 10 }), n = nodes(r.sheet);
  eq(r.sheet.kind, 'phys'); eq(r.sheet.scale, 10);
  ok(near(n.J1.y, n.BR1.y) && near(n.BR1.y, n.J2.y) && n.J1.x < n.BR1.x && n.BR1.x < n.BR2.x && n.BR2.x < n.J2.x, 'tronco J1→J2');
  ok(near(n.BR2.x - n.BR1.x, 30) && near(n.J2.x - n.BR2.x, 45), 'escala 1:10');
  ok(near(n.J3.x, n.BR1.x) && near(Math.abs(n.J3.y - n.BR1.y), 25) && near(n.X1.x, n.BR2.x) && (n.J3.y - n.BR1.y) * (n.X1.y - n.BR2.y) < 0, 'ramos perpendiculares em lados alternados');
  eq([n.J1.sprite, n.J2.sprite, n.J3.sprite, n.X1.sprite], ['mil_plug', 'mil_recep_wall', 'dsub_bs', '']);
  ok(r.warn.some(function (w) { return /X1/.test(w); }), 'avisa conector sem imagem');
  eq(HX.genPhysical(new HX.Doc().p, {}).error.length > 0, true);
});
test('conector sem cota entra pelo fio; sem cota alguma: estrela com aviso', function () {
  var d = sample(), c = d.add(HX.makeConn(d, 'COAX:BNC', 400, 40)), J2 = d.items().filter(function (i) { return i.ref === 'J2'; })[0];
  var P = HX.connLayout(c, 2.5).pins[0].pt, Q = HX.connLayout(J2, 2.5).pins[0].pt; d.change('w', function () { ops.addWire(d, [P, Q]); });
  var r = HX.genPhysical(d.p, { scale: 10 }), sg = r.sheet.items.filter(function (i) { return i.type === 'pseg' && i.len === ''; });
  eq(sg.length, 1); var n = nodes(r.sheet), ids = [sg[0].a, sg[0].b].sort(); eq(ids, [n.J2.id, n[c.ref].id].sort());
  var e = new HX.Doc(), a = e.add(HX.makeConn(e, 'COAX:BNC', 0, 0)), b = e.add(HX.makeConn(e, 'COAX:TNC', 50, 0));
  e.change('w', function () { ops.addWire(e, [HX.connLayout(a, 2.5).pins[0].pt, HX.connLayout(b, 2.5).pins[0].pt]); });
  var g2 = HX.genPhysical(e.p, {}); ok(g2.warn.some(function (w) { return /sem cota/.test(w); })); ok(!g2.sheet.items.some(function (i) { return i.type === 'pnode' && i.nkind !== 'conn'; }), 'dois conectores: sem ponto de derivação'); eq(g2.sheet.items.filter(function (i) { return i.type === 'pseg'; }).length, 1);
});
test('atualizar mantém imagem, tamanho, cobertura, acessórios e (opcional) posições', function () {
  var d = sample(), r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5 }); });
  var sh = d.p.sheets[r.index], n = nodes(sh), seg = sh.items.filter(function (i) { return i.type === 'pseg'; })[0];
  n.X1.sprite = 'm12'; n.J1.size = 80; seg.cover = 'cov_conduit'; n.J1.x += 7; sh.items.push({ type: 'pimg', id: 'm1', sprite: 'tie_blk', x: 50, y: 50 });
  d.change('u', function () { r = HX.applyPhysical(d, { scale: 5, keepPos: true }); });
  eq(d.p.sheets.filter(HX.isPhys).length, 1); sh = d.p.sheets[r.index]; var m = nodes(sh);
  eq([m.X1.sprite, m.J1.size, m.J1.x], ['m12', 80, n.J1.x]); ok(sh.items.some(function (i) { return i.type === 'pseg' && i.cover === 'cov_conduit'; }) && sh.items.some(function (i) { return i.id === 'm1'; }));
  sh.items.forEach(function (i) { if (i.type === 'pseg') { ok(sh.items.some(function (q) { return q.id === i.a; }) && sh.items.some(function (q) { return q.id === i.b; }), 'ramo ligado'); } });
});
L.antigo('desenho: imagens, cotas, "fora de escala"; editar: girar, apagar nó leva o ramo, colar, nova escala', function () {
  var d = sample(), r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); d.sheet = r.index;
  var log = [], g = {}; ['style', 'line', 'poly', 'rect', 'circle', 'push', 'pop'].forEach(function (k) { g[k] = function () {}; });
  g.text = function (s) { log.push(String(s)); }; g.image = function (im) { log.push('IMG:' + im.id); return true; };
  d.p.sheets[r.index].connDraw = 'img'; HX.drawSheetItems(g, d.p, r.index, {});
  ['IMG:plug_p', 'IMG:wall_p', 'IMG:dsub_bs', '600', '300', '450', '250', '350', 'D38999/26WC35SN'].forEach(function (t) { ok(log.indexOf(t) >= 0, t); }); ok(log.indexOf('sem imagem') < 0, 'conector comercial agora tem símbolo');
  var n = nodes(d.cur()); n.J2.x += 20; var lines = []; g.line = function (a, b, c2, e) { lines.push([a, b, c2, e]); }; HX.drawSheetItems(g, d.p, r.index, {}); g.line = function () {};
  var C0 = HX.physCtx(d.p, r.index, {}), dJ2 = d.cur().items.filter(function (i) { return i.type === 'pdim' && i.mode === 'seg' && (i.a === n.J2.id || i.b === n.J2.id); })[0]; ok(HX.physDimValue(dJ2, C0, d.p).fora, 'fora de escala (valor sublinhado, ABNT)');
  var a0 = HX.physAngle(n.J2, d.items()); eq(Math.round(a0), 180, 'J2 na ponta direita: saída para a esquerda'); d.change('r', function () { ops.transform(d, [n.J2], 'rot'); }); eq(n.J2.rot, 270, 'girar soma 90°');
  var before = d.items().filter(function (i) { return i.type === 'pseg'; }).length; d.change('x', function () { d.removeIds([n.X1.id]); });
  eq(d.items().filter(function (i) { return i.type === 'pseg'; }).length, before - 1);
  var segs = d.items().filter(function (i) { return i.type === 'pseg' && (i.a === n.J1.id || i.b === n.J1.id); }).concat([n.J1, n.BR1]), out;
  d.change('p', function () { out = ops.pasteItems(d, segs, 0, 100); }); var ps = out.filter(function (i) { return i.type === 'pseg'; })[0];
  ok(out.some(function (i) { return i.id === ps.a; }) && out.some(function (i) { return i.id === ps.b; }), 'ramo colado liga os nós colados');
  var dx = n.BR2.x - n.BR1.x; d.change('s', function () { HX.physRescale(d.cur(), 5); }); ok(near(n.BR2.x - n.BR1.x, dx * 2) && d.cur().scale === 5);
  ok(HX.exportPDF(d.p, {}).length > 3000);
});
