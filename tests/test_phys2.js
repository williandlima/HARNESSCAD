/* HarnessCAD - desenho físico v2: modelo Traço (Altium), anotações manuseáveis, fotos reais */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function cable() { // 2 D-Sub 9 com 9 fios, como o desenho Altium
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 40, 40)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 160, 40)), B = HX.connLayout(b, 2.5).pins;
  HX.connLayout(a, 2.5).pins.forEach(function (p, i) { a.pins[i].name = 'S' + i; d.change('w', function () { var w = ops.addWire(d, [p.pt, B[i].pt]); w.color = ['BK', 'WH', 'RD'][i % 3]; }); });
  var c = d.add(HX.makeConn(d, 'M24308:DE-9', 100, 120)), C = HX.connLayout(c, 2.5).pins;
  d.add({ type: 'brk', id: 'b1', ref: 'BR1', x: 100, y: 40 });
  [[a.id, 'b1', 700], ['b1', b.id, 800], ['b1', c.id, 300]].forEach(function (e) { d.add({ type: 'dim', id: d.uid('d'), a: e[0], b: e[1], x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: e[2], tolP: '', tolM: '', text: '' }); });
  d.change('w', function () { ops.addWire(d, [HX.connLayout(a, 2.5).pins[0].pt.map(function (v, k) { return v + (k ? 0 : 0); }), C[0].pt]); });
  return d;
}
function gen(d, o) { var r; d.change('g', function () { r = HX.applyPhysical(d, Object.assign({ scale: 10 }, o)); }); d.sheet = r.index; return d.cur(); }
function types(sh, t) { return sh.items.filter(function (i) { return i.type === t; }); }
function fakeG(log) { var g = {}; ['style', 'line', 'rect', 'circle', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; }); g.poly = function () { log.push('poly'); }; g.text = function (s) { log.push('T:' + s); }; g.image = function (im) { log.push('IMG:' + (im.id || '')); return true; }; return g; }
test('gera anotações: rótulo por nó, cota por ramo, cota do caminho total, balões, vistas e tabelas', function () {
  var sh = gen(cable(), { style: 'line', faces: true });
  eq(sh.pstyle, 'line'); eq(types(sh, 'pnote').length, 4); eq(types(sh, 'pdim').filter(function (x) { return x.mode === 'seg'; }).length, 3);
  var path = types(sh, 'pdim').filter(function (x) { return x.mode === 'path'; }); eq(path.length, 1);
  var C = { sh: sh, m: HX.physIdx(sh), N: 10 }; eq(HX.physDimValue(path[0], C, null).v, 1500, 'J1→J2 = 700 + 800');
  eq(types(sh, 'pball').length, 3 + types(sh, 'ptag').length, 'conectores + etiquetas'); eq(types(sh, 'pface').length, 3); eq(types(sh, 'ptable').map(function (t) { return t.kind; }).sort(), ['bom', 'wiring']);
});
test('modelo Traço: desenha em linha (sem imagens); balão numerado pela lista de materiais; tabela de ligação', function () {
  var d = cable(), sh = gen(d, { style: 'line', faces: true }), log = [], l0 = [];
  HX.drawSheetItems(fakeG(l0), d.p, d.sheet, {}); ok(!l0.some(function (x) { return /^T:VISTA FRONTAL/.test(x); }), 'vista sem descrição por padrão');
  sh.items.forEach(function (i) { if (i.type === 'pface') i.desc = 'on'; }); HX.drawSheetItems(fakeG(log), d.p, d.sheet, {});
  eq(log.filter(function (x) { return /^IMG/.test(x); }).length, 0, 'sem imagens no traço');
  ok(log.some(function (x) { return /^T:(OBS: )?TODOS OS CABOS SÃO BITOLA/.test(x); }) && log.indexOf('T:DESCRIÇÃO') >= 0 && log.indexOf('T:CÓDIGO') >= 0 && log.indexOf('T:VISTA FRONTAL J1 — ESC. 1:1') >= 0 && log.some(function (x) { return /^T:face de (pinos|soquetes) · carcaça E$/.test(x); }) && log.indexOf('T:1500') >= 0);
  ok(log.indexOf('T:J1') >= 0 && log.indexOf('T:S0') >= 0, 'diagrama: bloco J1 com o sinal');
  var bom = HX.physBom(d.p, sh); eq(bom.rows[0].qty, 3, '3 conectores do mesmo PN = item 1'); ok(log.indexOf('T:1') >= 0, 'balão 1');
  var log2 = []; sh.pstyle = 'img'; sh.connDraw = 'img'; HX.drawSheetItems(fakeG(log2), d.p, d.sheet, {}); ok(log2.indexOf('IMG:dsub_bs') >= 0, 'modelo Imagens');
});
test('foto real do usuário (por PN) tem prioridade sobre o painel, com espelho e altura da saída', function () {
  var d = cable(), sh = gen(d, {}), log = []; sh.connDraw = 'img'; HX.PHYS_USER = { 'M24308:DE-9': { id: 'usr:x', data: 'data:image/png;base64,AA==', w: 200, h: 100, ey: 0.4, len: 60, mirror: true } };
  HX.drawSheetItems(fakeG(log), d.p, d.sheet, {}); HX.PHYS_USER = {};
  eq(log.filter(function (x) { return x === 'IMG:usr:x'; }).length, 3); void sh;
});
test('arrastar o grupo não deforma; apagar nó leva ramo, cota, rótulo, balão e vista; colar mantém relativos', function () {
  var d = cable(), sh = gen(d, { faces: true }), n = types(sh, 'pnode').filter(function (i) { return i.ref === 'J1'; })[0];
  var ids = sh.items.map(function (i) { return i.id; }), note = types(sh, 'pnote').filter(function (i) { return i.of === n.id; })[0], nx = note.x, sg = types(sh, 'pseg')[0];
  d.change('m', function () { ops.beginMove(d, ids, 'move').apply(10, 5); }); eq([note.x, sg.x || 0], [nx, 0], 'presos ficam relativos');
  var before = sh.items.length, dep = sh.items.filter(function (i) { return i.of === n.id || i.a === n.id || i.b === n.id; }).length;
  d.change('x', function () { d.removeIds([n.id]); });
  ok(dep >= 4 && d.cur().items.length <= before - 1 - dep, 'nó e dependentes apagados');
  ok(!d.cur().items.some(function (i) { return i.of === n.id || i.a === n.id || i.b === n.id; }), 'nada órfão');
  var J2 = types(d.cur(), 'pnode').filter(function (i) { return i.ref === 'J2'; })[0], grp = d.cur().items.filter(function (i) { return i === J2 || i.of === J2.id; }), out;
  var ox = grp.filter(function (i) { return i.type === 'pnote'; })[0].x;
  d.change('p', function () { out = ops.pasteItems(d, grp, 30, 30); });
  var pn = out.filter(function (i) { return i.type === 'pnote'; })[0]; eq(pn.x, ox); ok(out.some(function (i) { return i.id === pn.of; }));
});
test('dividir ramo, novo ramo, cota entre nós; atualizar mantém os ajustes das anotações', function () {
  var d = cable(), sh = gen(d, {}), sg = types(sh, 'pseg').filter(function (s) { return +s.len === 800; })[0], br;
  d.change('s', function () { br = HX.physSplitSeg(d, sg); }); eq(+sg.len, 400); ok(types(d.cur(), 'pseg').some(function (s) { return s.a === br.id && +s.len === 400; }));
  var J2 = types(d.cur(), 'pnode').filter(function (i) { return i.ref === 'J2'; })[0], nb;
  d.change('b', function () { nb = HX.physAddBranch(d, J2); }); ok(/^BR\d+$/.test(nb.ref));
  var J1 = types(d.cur(), 'pnode').filter(function (i) { return i.ref === 'J1'; })[0], dm; d.change('d', function () { dm = HX.physAddDim(d, J1, J2, 'path'); });
  eq(HX.physDimValue(dm, { sh: d.cur(), m: HX.physIdx(d.cur()), N: 10 }, null).v, 1500);
  // atualizar: rótulo arrastado e texto da cota ficam
  var d2 = cable(), s2 = gen(d2, {}), nt = types(s2, 'pnote')[0], of = s2.items.filter(function (i) { return i.id === nt.of; })[0].of, pd = types(s2, 'pdim')[0];
  nt.x = 33; nt.text = 'CONECTOR A'; pd.text = 'xxxx mm'; var key = pd.seg && s2.items.filter(function (i) { return i.id === pd.seg; })[0].dim;
  s2 = gen(d2, { keepPos: true });
  var nt2 = types(s2, 'pnote').filter(function (i) { var n = s2.items.filter(function (q) { return q.id === i.of; })[0]; return n && n.of === of; })[0]; eq([nt2.x, nt2.text], [33, 'CONECTOR A']);
  ok(types(s2, 'pdim').some(function (x) { var sgx = s2.items.filter(function (q) { return q.id === x.seg; })[0]; return sgx && sgx.dim === key && x.text === 'xxxx mm'; }));
});
test('feixe real: fios roteados por ramo, Ø estimado, leque = fios do conector; não roteados avisados', function () {
  var d = cable(), sh = gen(d, {}), B = HX.physBundle(d.p, sh), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  var seg = function (a, b) { return types(sh, 'pseg').filter(function (s) { return (s.a === a.id && s.b === b.id) || (s.b === a.id && s.a === b.id); })[0]; };
  var J1 = Object.keys(n).filter(function (k) { return /^J/.test(k); }).map(function (k) { return n[k]; }).sort(function (a, b) { return a.x - b.x; })[0];
  eq(B.seg[seg(J1, n.BR1).id].wires.length, 10, '9 fios J1→J2 + 1 fio J1→J3'); ok(B.orphan.length === 0);
  var od9 = HX.bundleOD(B.seg[seg(J1, n.BR1).id].wires); ok(Math.abs(od9 - 1.15 * Math.sqrt(10 * 1.37 * 1.37)) < 0.01, 'Ø ≈ 1,15·√Σd² (22 AWG = 1,37 mm)');
  eq(B.node[J1.id].length, 10); eq(HX.wireOD({ gauge: '20' }), 1.57); ok(HX.bundleW(5) > HX.bundleW(1.4));
});
test('D-Sub preciso (MIL-DTL-24308): passo 2,77 × 2,84, carcaça, flange e furação; soquete espelhado', function () {
  var d = new HX.Doc(), c = HX.makeConn(d, 'M24308:DE-9', 0, 0), G9 = HX.dsubGeom(c); c.gender = 'P';
  eq([G9.shell, G9.A, G9.B, G9.pts.length], ['E', 30.81, 24.99, 9]); ok(Math.abs(G9.pts[1].x - G9.pts[0].x - 2.77) < 1e-9 && Math.abs(G9.pts[5].y - G9.pts[0].y - 2.84) < 1e-9);
  ok(G9.pts[0].x < 0 && G9.pts[0].y < 0 && G9.pts[4].x > 0, 'pino 1 em cima à esquerda (face de pinos)');
  eq(HX.dsubGeom(HX.makeConn(d, 'M24308:DD-50', 0, 0)).shell, 'D'); eq(HX.dsubGeom(HX.makeConn(d, 'M83513:MD-9', 0, 0)).px, 1.27);
  var xs = [], g = { style: function () {}, rect: function () {}, poly: function () {}, line: function () {}, text: function () {}, circle: function (x, y, r) { xs.push(x); } };
  HX.physDsubFace(g, c, 0, 0, 2, '#000'); var a = xs.slice(2, 3)[0]; xs = []; c.gender = 'S'; HX.physDsubFace(g, c, 0, 0, 2, '#000'); ok(Math.abs(xs[2] + a) < 1e-9, 'soquete = espelho');
});
test('cota ABNT: tolerância empilhada; título com escala no carimbo', function () {
  var d = cable(), sh = gen(d, {}), dm = types(sh, 'pdim')[0], C = HX.physCtx(d.p, d.sheet, {});
  dm.tolP = '50'; dm.tolM = '0'; var V = HX.physDimValue(dm, C, d.p); eq(V.tol, ['+50', '0']); dm.tolM = '5'; eq(HX.physDimValue(dm, C, d.p).tol, ['+50', '-5']);
  var T = []; HX.drawFrame({ style: function () {}, rect: function () {}, line: function () {}, poly: function () {}, circle: function () {}, push: function () {}, pop: function () {}, image: function () {}, text: function (s) { T.push(String(s)); } }, d.p, d.sheet, {});
  ok(T.indexOf('1:10') >= 0, 'escala 1:10 no carimbo');
});
