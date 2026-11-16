/* HarnessCAD - o desenho físico manda na formatação: comprimento pelo físico, ramo automático pelo traçado,
   derivar/ligar/religar/juntar ramos, atualizar sem refazer o traçado */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function base() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 0)), b = d.add(HX.makeConn(d, 'M24308:DE-9', 200, 0)), c = d.add(HX.makeConn(d, 'M24308:DE-9', 100, 80));
  d.change('w', function () { for (var i = 0; i < 3; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); ops.addWire(d, [pinPt(a, 5), pinPt(c, 0)]); });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1000, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 10 }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  return { d: d, sh: sh, n: n, a: a, b: b, c: c };
}
function segBetween(sh, x, y) { return sh.items.filter(function (s) { return s.type === 'pseg' && ((s.a === x.id && s.b === y.id) || (s.a === y.id && s.b === x.id)); })[0]; }
function wl(d, w) { return HX.computeLengths(d.p).wires[w.id].eff; }
test('comprimento dos fios vem do desenho físico; ramo sem valor mede o traçado (arrastar muda)', function () {
  var o = base(), d = o.d, sh = o.sh, W = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; }), end = +d.p.defaults.lenEnd || 0;
  ok(HX.computeLengths(d.p).phys, 'modo físico');
  eq(wl(d, W[0]), 1000 + 2 * end, 'tronco digitado 1000');
  var s3 = segBetween(sh, o.n.J1, o.n.J3); eq(s3.len, '', 'ramo sem cota = automático'); var m = HX.physIdx(sh), L0 = HX.physSegLen(s3, m, 10);
  eq(L0, Math.round(Math.hypot(o.n.J3.x - o.n.J1.x, o.n.J3.y - o.n.J1.y) * 10)); eq(wl(d, W[3]), L0 + 2 * end);
  o.n.J3.y += 10; eq(HX.physSegLen(s3, HX.physIdx(sh), 10), Math.round(Math.hypot(o.n.J3.x - o.n.J1.x, o.n.J3.y - o.n.J1.y) * 10), 'arrastou: mediu de novo');
  s3.len = 1777; eq(wl(d, W[3]), 1777 + 2 * end, 'digitado prevalece');
  var v = HX.physDimValue({ mode: 'seg', seg: s3.id, a: s3.a, b: s3.b }, { m: HX.physIdx(sh), N: 10, sh: sh }); ok(v.fora, 'digitado ≠ desenho: fora de escala');
  s3.len = ''; v = HX.physDimValue({ mode: 'seg', seg: s3.id, a: s3.a, b: s3.b }, { m: HX.physIdx(sh), N: 10, sh: sh }); ok(!v.fora && v.v > 0, 'automático nunca fora de escala');
});
test('derivar no ponto, ligar ramo novo, religar a ponta (muda a derivação), apagar BR junta os ramos', function () {
  var o = base(), d = o.d, sh = o.sh, tr = segBetween(sh, o.n.J1, o.n.J2), br;
  d.change('b', function () { br = HX.physSplitAt(d, tr, 0.3); });
  var s1 = segBetween(sh, o.n.J1, br), s2 = segBetween(sh, br, o.n.J2); eq(s1.len + s2.len, 1000); eq(s1.len, 300);
  ok(Math.abs(br.x - (o.n.J1.x + (o.n.J2.x - o.n.J1.x) * 0.3)) < 0.01, 'BR no ponto clicado');
  var s3 = segBetween(sh, o.n.J1, o.n.J3), ok2;
  d.change('r', function () { ok2 = HX.physReattach(d, s3, s3.a === o.n.J1.id ? 'a' : 'b', br); }); ok(ok2 && segBetween(sh, br, o.n.J3), 'J3 agora sai do BR');
  var W = d.p.sheets[0].items.filter(function (i) { return i.type === 'wire'; }), end = +d.p.defaults.lenEnd || 0;
  eq(wl(d, W[3]), 300 + HX.physSegLen(s3, HX.physIdx(sh), 10) + 2 * end, 'fio do J3 pelo novo caminho');
  var pk = HX.physPick(sh, [br.x + 0.2, br.y + 0.2], 3); ok(pk.node === br, 'pick: nó');
  var mid = [(br.x + o.n.J2.x) / 2, br.y + 1], p2 = HX.physPick(sh, mid, 3); ok(p2.seg && p2.seg.id === s2.id && Math.abs(p2.t - 0.5) < 0.05, 'pick: ponto no ramo');
  var nb, sg; d.change('w', function () { nb = HX.physNodeAt(d, null, [br.x, br.y + 40], true); sg = HX.physConnect(d, br, nb); });
  ok(nb.nkind === 'brk' && sg.len === '' && sh.items.some(function (i) { return i.type === 'pdim' && i.seg === sg.id; }), 'ramo novo com ponta livre e cota');
  var b2; d.change('b', function () { b2 = HX.physSplitAt(d, s2, 0.5); }); var n0 = sh.items.filter(function (i) { return i.type === 'pseg'; }).length;
  d.select([b2.id]); ops.deleteSel(d);
  eq(sh.items.filter(function (i) { return i.type === 'pseg'; }).length, n0 - 1, 'juntou'); eq(segBetween(sh, br, o.n.J2).len, 700, 'comprimentos somados');
  ok(!sh.items.some(function (i) { return i.id === b2.id; }));
});
test('atualizar do esquemático mantém o traçado; conector novo entra num ramo; removido sai', function () {
  var o = base(), d = o.d, sh = o.sh, tr = segBetween(sh, o.n.J1, o.n.J2), br;
  d.change('b', function () { br = HX.physSplitAt(d, tr, 0.5); }); o.n.J2.x += 30; var x2 = o.n.J2.x;
  d.sheet = 0; var e; d.change('c', function () { e = d.add(HX.makeConn(d, 'M24308:DE-9', 0, 150)); ops.addWire(d, [pinPt(o.b, 7), pinPt(e, 7)]); });
  var r; d.change('u', function () { r = HX.applyPhysical(d, { scale: 10 }); }); ok(r.synced, 'sincronizou');
  var J = sh.items.filter(function (i) { return i.type === 'pnode' && i.of === e.id; })[0]; ok(J, 'J4 entrou');
  ok(segBetween(sh, o.n.J2, J), 'ligado ao J2 (circuito em comum)'); eq(o.n.J2.x, x2, 'posição mantida'); ok(sh.items.some(function (i) { return i.id === br.id; }), 'BR mantido');
  d.sheet = 0; d.change('x', function () { d.removeIds([o.c.id]); }); d.change('u', function () { r = HX.applyPhysical(d, { scale: 10 }); });
  ok(!sh.items.some(function (i) { return i.type === 'pnode' && i.of === o.c.id; }), 'J3 saiu'); ok(r.warn.some(function (w) { return /J3/.test(w); }));
  d.change('z', function () { r = HX.applyPhysical(d, { scale: 10, rebuild: true }); }); ok(!r.synced, 'refazer do zero ainda existe');
});
