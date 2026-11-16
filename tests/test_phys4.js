/* HarnessCAD - ferramentas do modo físico: sub-ramos, deslizar BR, escala, alinhar, ímã de ângulo, itens no ramo,
   ocupação de cobertura, emendas escalonadas, peso, revisões, detalhe, notas, crimpagem, lista de corte, DXF, variantes */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function G(log) { var g = {}; ['style', 'rect', 'circle', 'push', 'pop', 'line', 'poly'].forEach(function (k) { g[k] = function () { log.push(k); }; }); g.text = function (s) { log.push('T:' + s); }; g.image = function () { return true; }; g.clip = function () { log.push('clip'); }; return g; }
function base() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 200, 0)), c = d.add(HX.makeConn(d, 'M24308:DE-9', 100, 80));
  d.change('w', function () { for (var i = 0; i < 3; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); ops.addWire(d, [pinPt(a, 5), pinPt(c, 0)]); });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1000, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  var tr = sh.items.filter(function (s) { return s.type === 'pseg' && s.len === 1000; })[0], br; d.change('b', function () { br = HX.physSplitAt(d, tr, 0.5); });
  var s3 = HX.physSegsOf(sh, n.J3.id)[0]; d.change('r', function () { HX.physReattach(d, s3, s3.a === n.J3.id ? 'b' : 'a', br); });
  return { d: d, sh: sh, n: n, br: br, s3: s3, a: a, b: b, c: c };
}
function lenOf(sh, s) { return HX.physSegLen(s, HX.physIdx(sh), +sh.scale || 1); }
test('sub-ramo: gira/espelha em torno do BR mantendo comprimentos; selecionar leva os presos; deslizar BR; redesenhar em escala', function () {
  var o = base(), sh = o.sh, s3 = o.s3, L0 = lenOf(sh, s3), S = HX.physSub(sh, s3);
  eq(S.pivot, o.br.id, 'pivô = BR'); ok(S.nodes[o.n.J3.id] && !S.nodes[o.n.J1.id], 'lado menor = J3');
  HX.physRotateSub(sh, s3, 90); ok(Math.abs(lenOf(sh, s3) - L0) <= 1, 'girou mantendo comprimento');
  var y0 = o.n.J3.y; HX.physMirrorSub(sh, HX.physSegsOf(sh, o.br.id).filter(function (s) { return s.a === o.n.J2.id || s.b === o.n.J2.id; })[0]); eq(o.n.J3.y, y0, 'J3 não está no sub-ramo do J2');
  var ids = HX.physSubIds(sh, s3); ok(ids.indexOf(o.n.J3.id) >= 0 && ids.indexOf(s3.id) >= 0 && sh.items.some(function (i) { return i.type === 'pnote' && i.of === o.n.J3.id && ids.indexOf(i.id) >= 0; }), 'rótulo do J3 vai junto');
  var t = HX.physTrunkAt(sh, o.br), j3x = o.n.J3.x - o.br.x; HX.physSlideBR(sh, o.br, 200);
  eq(t.s1.len, 200, 'tronco até o BR = 200'); eq(t.s1.len + t.s2.len, 1000, 'total mantido'); ok(Math.abs(o.n.J3.x - o.br.x - j3x) < 0.01, 'derivação foi junto');
  var J2 = o.n.J2; J2.x += 50; ok(HX.physDimValue({ mode: 'seg', seg: t.s2.id }, { m: HX.physIdx(sh), N: 10, sh: sh }).fora, 'fora de escala');
  ok(HX.physRedrawScale(sh) >= 1, 'redesenhou'); var P = HX.physSegPts(t.s2, HX.physIdx(sh)); ok(Math.abs(HX.polyLen(P) * 10 - t.s2.len) < 0.5, 'agora em escala');
});
test('alinhar/distribuir e ímã de ângulo (45°)', function () {
  var A = [{ type: 'pnode', x: 0, y: 0 }, { type: 'pnode', x: 10, y: 4 }, { type: 'pnode', x: 40, y: 2 }];
  HX.physAlign(A, 'h'); eq(A.map(function (i) { return i.y; }), [2, 2, 2]); HX.physAlign(A, 'dh'); eq(A[1].x, 20);
  eq(HX.physSnapAngle([0, 0], [10, 0.5]), [10.012, 0]); var q = HX.physSnapAngle([0, 0], [10, 9.5]); ok(Math.abs(q[0] - q[1]) < 1e-3, '45°'); eq(HX.physSnapAngle([0, 0], [10, 4]), [10, 4], 'longe: livre');
});
test('itens no ramo: posição pela distância real, folga de serviço soma nos fios, lista de materiais e marcadores', function () {
  var o = base(), d = o.d, sh = o.sh, s3 = o.s3, W = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; }), e0 = HX.computeLengths(d.p).wires[W[3].id].eff, t, mk, lp;
  d.change('a', function () { t = HX.physAddAcc(d, s3, 'tie'); mk = HX.physAddAcc(d, s3, 'marker'); lp = HX.physAddAcc(d, s3, 'loop'); }); mk.text = 'W4-J3'; t.pn = 'MS3367-5-9'; t.dist = 0;
  var A = HX.physAccAt(t, sh, HX.physIdx(sh), 10), from = HX.physIdx(sh)[s3.a]; ok(Math.hypot(A.pt[0] - from.x, A.pt[1] - from.y) < 1e-6, 'dist 0 = na ponta A');
  eq(HX.computeLengths(d.p).wires[W[3].id].eff, e0 + 100, 'folga de serviço +100');
  var B = HX.physBom(d.p, sh); ok(B.key['x:tie:MS3367-5-9'] && B.key['x:marker:'], 'BOM'); ok(!B.key['x:loop:'], 'folga não é peça');
  eq(HX.physMarkers(sh)[0].text, 'W4-J3'); var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.indexOf('T:W4-J3') >= 0 && t._pt, 'desenhado');
  d.change('x', function () { d.removeIds([s3.id]); }); ok(!sh.items.some(function (i) { return i.type === 'pacc'; }), 'apagar o ramo leva os itens');
});
test('ocupação de cobertura, termo que não aperta, emendas escalonadas, peso', function () {
  var o = base(), d = o.d, sh = o.sh, tr = HX.physTrunkAt(sh, o.br).s1; tr.cover = 'cov_conduit'; tr.covId = '1';
  var C = HX.physCoverCheck(d.p, sh); ok(C[0].sev === 'erro' && /não cabe/.test(C[0].msg));
  tr.cover = 'cov_shrink'; tr.covId = '12'; tr.covRatio = '2'; ok(/não aperta/.test(HX.physCoverCheck(d.p, sh)[0].msg));
  tr.covId = '4'; ok(!HX.physCoverCheck(d.p, sh)[0].msg, 'termo 4 → 2 aperta o feixe');
  var e = HX.runERC(d.p); ok(!e.some(function (x) { return x.rule === 'covFill' && x.sev === 'erro'; }));
  var s1 = sh.items.filter(function (i) { return i.type === 'pnode'; })[0]; o.br.nkind = 'splice'; var sp2; d.change('s', function () { sp2 = HX.physSplitAt(d, HX.physSegsOf(sh, o.br.id)[0], 0.98); }); sp2.nkind = 'splice';
  ok(HX.physStagger(sh, 25).length === 1, 'duas emendas próximas'); void s1;
  var Wt = HX.physWeight(d.p, sh); ok(Wt.wires > 0 && Wt.total >= Wt.wires); o.n.J1.peso = 30; eq(HX.physWeight(d.p, sh).parts, 30);
});
test('revisões: congelar, mudar, comparar (comprimento, ramo novo, fio)', function () {
  var o = base(), d = o.d, sh = o.sh; HX.physFreeze(d.p, 'A');
  var t = HX.physTrunkAt(sh, o.br); t.s1.len = 600; t.s2.len = 500;
  var D = HX.physDiff(d.p, 'A'); ok(D.list.some(function (x) { return x.kind === 'ramo' && /500 → 600|500 → 500/.test(x.txt) || /→ 600/.test(x.txt); }), 'ramo mudou'); ok(D.list.some(function (x) { return x.kind === 'fio' && /corte/.test(x.txt); }), 'corte mudou');
  ok(Object.keys(D.hlSeg).length >= 1);
});
test('vista de detalhe com recorte, nota com bandeira e tabelas novas (ramos, notas, crimpagem, corte, marcadores)', function () {
  var o = base(), d = o.d, sh = o.sh, f; d.change('f', function () { f = HX.physAddFlag(d, o.n.J1); }); f.text = 'Aplicar fita a cada 150 mm'; eq(f.n, 1);
  sh.items.push({ type: 'pdetail', id: 'dt', label: 'A', k: 2, sx: o.br.x - 10, sy: o.br.y - 10, sw: 20, sh: 20, x: 10, y: 10 });
  ['segs', 'notes', 'crimp', 'cut', 'markers'].forEach(function (k, i) { sh.items.push({ type: 'ptable', id: 'tb' + i, kind: k, x: 0, y: 200 + i * 40, w: 170 }); });
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.indexOf('clip') >= 0, 'recortou'); ok(log.indexOf('T:DETALHE A') >= 0 && log.indexOf('T:ESCALA 2:1') >= 0);
  ['TABELA DE RAMOS', 'NOTAS', 'TABELA DE CRIMPAGEM', 'LISTA DE CORTE', 'MARCADORES DE IDENTIFICAÇÃO', 'Aplicar fita a cada 150 mm'].forEach(function (t) { ok(log.indexOf('T:' + t) >= 0, t); });
  var Cr = HX.physCrimp(d.p); ok(Cr.length === 8 && /M22520/.test(Cr[0].tool), 'crimpagem D-Sub: ' + Cr[0].tool); o.n.J1.crimpTool = 'MINHA'; ok(HX.physCrimp(d.p).some(function (r) { return r.tool === 'MINHA'; }), 'sobrescreve');
  var csv = HX.physCutCSV(d.p); ok(/^﻿Fio;Part number/.test(csv) && csv.split('\r\n').length >= 6);
  var dxf = HX.physDXF(d.p); ok(/ENTITIES/.test(dxf) && /\r\nLINE\r\n8\r\nRAMOS/.test(dxf) && /\r\nEOF\r\n$/.test(dxf), 'DXF');
  var pdf = HX.exportPDF(d.p, {}); ok(pdf.length > 1000 && /re W n/.test(Buffer.from(pdf).toString('latin1')), 'PDF com recorte');
});
test('variantes: item fora da variante some do desenho, da seleção, do feixe, dos comprimentos e da lista de materiais', function () {
  var o = base(), d = o.d, sh = o.sh; sh.variants = 'A,B'; o.n.J3['var'] = 'B'; o.n.J3.backshell = 'BS-9';
  var all = HX.physBom(d.p, sh); ok(all.key['b:BS-9']);
  sh.variant = 'A'; ok(!d.items().some(function (i) { return i.id === o.n.J3.id || i.id === o.s3.id; }), 'J3 e o ramo somem');
  ok(!HX.physBom(d.p, sh).key['b:BS-9'], 'BOM da variante A'); var L = HX.computeLengths(d.p); eq(L.variant, 'A');
  var w4 = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; })[3]; ok(L.wires[w4.id].eff == null, 'fio do J3 fora');
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.indexOf('T:VARIANTE A') >= 0); ok(sh.items.some(function (i) { return i.id === o.n.J3.id; }), 'dados intactos');
  sh.variant = 'B'; ok(d.items().some(function (i) { return i.id === o.n.J3.id; }));
});
