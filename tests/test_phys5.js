/* HarnessCAD - fase 2: imagens reais de datasheet, montagem conector+backshell+bota em tamanho real, PDF com transparência,
   rótulos automáticos, cota total só no tronco reto, verificações de realismo (bota/alívio × feixe, derivação colada), texto mínimo */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops, fs = require('fs'), path = require('path');
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness(boot) {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0)), c = d.add(HX.makeConn(d, 'D38999:11-35', 100, 90));
  a.variant = '26'; b.variant = '24'; c.variant = '20';
  d.change('w', function () { for (var i = 0; i < 10; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); for (var j = 0; j < 4; j++) ops.addWire(d, [pinPt(a, 12 + j), pinPt(c, j)]); });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1200, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  if (boot) { n.J1.bsKind = 'sr_s'; n.J1.bootKind = 'boot_s'; n.J2.bootKind = 'boot_90'; }
  return { d: d, sh: sh, n: n };
}
function G(log) { var g = { _m: [] }; ['style', 'rect', 'circle', 'line', 'poly'].forEach(function (k) { g[k] = function () {}; }); g.push = function (m) { g._m.push(m); }; g.pop = function () {}; g.text = function (s, x, y, o) { log.push(['T', s, o && o.size]); }; g.image = function (im) { log.push(['I', im.id, g._m[g._m.length - 1]]); return true; }; return g; }
test('imagens de datasheet: PNG < 10 KB, tamanho confere, fonte registrada; família/estilo escolhe a imagem', function () {
  Object.keys(HX.PDS_IMG).forEach(function (k) { var im = HX.PDS_IMG[k], b = L.imgBytes(im.url); ok(b.length < 10000, k); eq([b.readUInt32BE(16), b.readUInt32BE(20)], [im.w, im.h], k); });
  Object.keys(HX.PDS).forEach(function (k) { ok(/catálogo/.test(HX.PDS[k].src) && HX.PDS[k].L(13) > 10, k); });
  var o = harness(false), S = HX.physSchem(o.d.p);
  eq(HX.physDSFor(o.n.J1, S[o.n.J1.of]), 'd38_26'); eq(HX.physDSFor(o.n.J2, S[o.n.J2.of]), 'd38_24'); eq(HX.physDSFor(o.n.J3, S[o.n.J3.of]), 'd38_20');
  eq(HX.shellOf(S[o.n.J3.of]), 11); eq(HX.PDS.d38_26.H(13), 29.4, 'Ø do plugue carcaça 13 (tabela p. 53)'); eq(HX.PDS.sr_s.L(25), 31.0);
  o.n.J1.dsImg = 'off'; eq(HX.physDSFor(o.n.J1, S[o.n.J1.of]), null);
});
test('montagem: bota 90° faz o conector sair a 90°; tamanho real com connScale=real; ampliação automática', function () {
  var o = harness(true), S = HX.physSchem(o.d.p), E = HX.physAssembly(o.n.J2, S[o.n.J2.of], true);
  eq(E.map(function (e) { return e.id; }), ['boot_90', 'd38_24']);
  var log = [], g = G(log), bb = HX.physDrawAssembly(g, E, 0, 0, 0, 5, 1, false), conn = log.filter(function (l) { return l[1] === 'jam_l'; })[0][2], boot = log.filter(function (l) { return l[1] === 'boot_90_l'; })[0][2];
  ok(Math.abs(boot[0] - 1) < 1e-9 && Math.abs(boot[1]) < 1e-9, 'bota alinhada ao ramo'); ok(Math.abs(conn[0]) < 1e-9 && Math.abs(conn[1] + 1) < 1e-9, 'conector a -90° (para cima/baixo)');
  ok(log.map(function (l) { return l[1]; }).join() === 'jam_l,boot_90_l', 'conector desenhado primeiro, bota por cima');
  var E1 = HX.physAssembly(o.n.J1, S[o.n.J1.of], true); eq(E1.map(function (e) { return e.id; }), ['boot_s', 'sr_s', 'd38_26']);
  var b1 = HX.physDrawAssembly(G([]), E1, 0, 0, 180, 5, 1, false), real = (E1[0].L * (1 - E1[0].ov) + E1[1].L * (1 - E1[1].ov) + E1[2].L) / 5;
  ok(Math.abs((b1.x1 - b1.x0) - real) < 0.05, 'comprimento total em escala real: ' + (b1.x1 - b1.x0) + ' ≈ ' + real);
  o.sh.connScale = 'real'; eq(HX.physConnK(o.sh, 31.9, 5, true), 1); o.sh.connScale = ''; ok(Math.abs(HX.physConnK(o.sh, 31.9, 5, true) - 24 / (31.9 / 5)) < 1e-9); o.sh.connScale = '3'; eq(HX.physConnK(o.sh, 31.9, 5, true), 3);
  o.sh.connScale = ''; o.sh.connDraw = 'img'; var lg = []; HX.drawSheetItems(G(lg), o.d.p, o.d.sheet, {}); ok(lg.some(function (l) { return l[1] === 'sr_s_l'; }) && o.n.J1._bb && o.n.J1._k > 1, 'desenhado na folha');
  var B = HX.physBom(o.d.p, o.sh); ok(Object.keys(B.key).some(function (k) { return /^d:boot_90:13/.test(k); }), 'bota na lista de materiais');
});
test('PDF: imagem com transparência vira /SMask', function () {
  var pdf = new HX.Pdf({}), pg = pdf.addPage(100, 100); pg.imgs = [{ w: 1, h: 1, gray: true, bytes: '\x00', mask: '\xff' }, { w: 1, h: 1, gray: true, bytes: '\x80', mask: null }];
  var t = pdf.build(); t = typeof t === 'string' ? t : Buffer.from(t).toString('latin1');
  ok(/\/SMask \d+ 0 R/.test(t) && (t.match(/\/Subtype \/Image/g) || []).length === 3, 'máscara + 2 imagens');
});
test('rótulo/balão automáticos ficam fora da montagem; cota total só em tronco reto', function () {
  var o = harness(true), log = []; HX.drawSheetItems(G(log), o.d.p, o.d.sheet, {});
  var J1 = o.n.J1, note = o.sh.items.filter(function (i) { return i.type === 'pnote' && i.of === J1.id; })[0], ball = o.sh.items.filter(function (i) { return i.type === 'pball' && i.of === J1.id; })[0];
  eq(note.pos, 'auto'); ok(note._bb.y0 >= J1._bb.y1, 'rótulo abaixo da montagem'); ok(ball._bb ? ball._bb.y1 <= J1._bb.y0 + 0.01 : true, 'balão acima');
  var paths = o.sh.items.filter(function (i) { return i.type === 'pdim' && i.mode === 'path'; }); ok(paths.every(function (d) { var a = HX.physIdx(o.sh)[d.a], b = HX.physIdx(o.sh)[d.b]; return Math.abs(a.y - b.y) < 1 || Math.abs(a.x - b.x) < 1; }), 'sem cota total inclinada');
});
test('realismo: bota/alívio × Ø do feixe (datasheet), derivação colada no conector; organizar rótulos; texto mínimo', function () {
  var o = harness(true), d = o.d, C = HX.physAssemblyCheck(d.p, o.sh, 25);
  ok(C.some(function (x) { return x.rule === 'accFit' && /J1/.test(x.msg) && /enchimento/.test(x.msg); }), 'feixe de 14 fios 22 AWG é fino para a bota da carcaça 13');
  eq(HX.PDS_RANGE.sr_s(13), [4.8, 8.3]);
  var sg = HX.physSegsOf(o.sh, o.n.J2.id)[0], br; d.change('b', function () { br = HX.physSplitAt(d, sg, sg.a === o.n.J2.id ? 0.01 : 0.99); });
  ok(HX.physAssemblyCheck(d.p, o.sh, 25).some(function (x) { return x.rule === 'brkNear' && /J2/.test(x.msg); }), 'BR a poucos mm do J2');
  ok(HX.runERC(d.p).some(function (x) { return x.rule === 'accFit'; }), 'no ERC');
  var lg = []; HX.drawSheetItems(G(lg), d.p, d.sheet, {});
  var a = o.sh.items.filter(function (i) { return i.type === 'pnote' && i.of === o.n.J1.id; })[0]; var b = HX.physAddFlag(d, o.n.J1); b.x = 0; b.y = 0; b.of = ''; b.x = (a._bb.x0 + a._bb.x1) / 2; b.y = (a._bb.y0 + a._bb.y1) / 2;
  HX.drawSheetItems(G([]), d.p, d.sheet, {}); ok(HX.physArrangeLabels(o.sh) >= 1, 'deslocou o rótulo sobreposto');
  o.sh.textMin = 2.5; var lt = []; HX.drawSheetItems(G(lt), d.p, d.sheet, {}); ok(lt.filter(function (l) { return l[0] === 'T'; }).every(function (l) { return !(l[2] < 2.5); }), 'todos os textos >= 2,5 mm');
});
test('layout: item fora da moldura ou sobre o carimbo vira aviso no ERC', function () {
  var o = harness(true), d = o.d, si = d.sheet; eq(HX.physFrameCheck(d.p, si).filter(function (x) { return x.it.type === 'pnode'; }).length, 0, 'gerado dentro');
  var dm = HX.sheetDims(d.p.meta); o.n.J3.x = dm[0] - 30; o.n.J3.y = dm[1] - 30;
  ok(HX.physFrameCheck(d.p, si).some(function (x) { return x.it === o.n.J3; }), 'J3 no canto: fora/carimbo');
  ok(HX.runERC(d.p).some(function (x) { return x.rule === 'frame'; }));
});
