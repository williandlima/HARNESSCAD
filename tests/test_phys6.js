/* HarnessCAD - upgrade do desenho físico: fios aparentes na quantidade real (curvas nas derivações, sem cruzar),
   cotas com nº de fios e valor que define o ramo, detalhe como zoom de área, etiqueta de identificação */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function harness() {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0)), c = d.add(HX.makeConn(d, 'D38999:11-35', 100, 90));
  d.change('w', function () { for (var i = 0; i < 8; i++) { var w = ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); w.color = ['BK', 'WH', 'RD', 'GN', 'BU', 'YE', 'OG', 'VT'][i]; } for (var j = 0; j < 4; j++) ops.addWire(d, [pinPt(a, 12 + j), pinPt(c, j)]); });
  d.add({ type: 'dim', id: 'd1', a: a.id, b: b.id, x: 0, y: 0, x2: 1, y2: 0, orient: 'a', off: 5, len: 1200, tolP: '', tolM: '', text: '' });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = r.index;
  var sh = d.cur(), n = {}; sh.items.forEach(function (i) { if (i.type === 'pnode') n[i.ref] = i; });
  var tr = sh.items.filter(function (s) { return s.type === 'pseg' && s.len === 1200; })[0], br; d.change('b', function () { br = HX.physSplitAt(d, tr, 0.5); });
  var s3 = HX.physSegsOf(sh, n.J3.id)[0]; d.change('r', function () { HX.physReattach(d, s3, s3.a === n.J3.id ? 'b' : 'a', br); }); s3.len = 400;
  return { d: d, sh: sh, n: n, br: br, s3: s3, T: HX.physTrunkAt(sh, br) };
}
function G(log) {
  var g = {}, st = {}; ['rect', 'line', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; });
  g.style = function (s) { for (var k in s) st[k] = s[k]; }; g.poly = function (P) { log.push(['poly', st.stroke, st.lw, P.length, P]); };
  g.circle = function (x, y, r) { log.push(['circle', st.fill, r]); }; g.text = function (t, x, y, o) { log.push(['T', t, (o || {}).size]); }; g.image = function () { return true; };
  g.clip = function () { log.push('clip'); }; g.clipCircle = function () { log.push('clipCircle'); }; return g;
}
test('sem capa: um traço contínuo por fio do esquemático, curva na derivação, ordem sem cruzar', function () {
  var o = harness(), sh = o.sh; sh.loose = 'wires'; var log = []; HX.drawSheetItems(G(log), o.d.p, o.d.sheet, {});
  var col = log.filter(function (l) { return l[0] === 'poly' && /^#/.test(l[1] || '') && l[1] !== '#111111' && l[2] > 0.25 && l[3] > 20; }); // contorno das peças do conector tem traço fino
  eq(col.length, 12, 'um traço por fio (8 J1-J2 + 4 J1-J3) ' + col.map(function (l) { return l[1] + ':' + l[2]; }).join(','));
  var C = HX.physCtx(o.d.p, o.d.sheet, {}), BU = HX.physBundle(o.d.p, sh), O1 = HX.physLooseOrder(o.T.s1, sh, C, BU), O2 = HX.physLooseOrder(o.T.s2, sh, C, BU), O3 = HX.physLooseOrder(o.s3, sh, C, BU);
  eq(O1.length, 12); eq(O2.length + O3.length, 12);
  var i2 = O2.map(function (w) { return O1.indexOf(w); }), i3 = O3.map(function (w) { return O1.indexOf(w); });
  ok(i2.every(function (v, k) { return !k || v > i2[k - 1]; }) || i2.every(function (v, k) { return !k || v < i2[k - 1]; }), 'mesma sequência no tronco e no ramo');
  ok(Math.max.apply(null, i3) < Math.min.apply(null, i2) || Math.min.apply(null, i3) > Math.max.apply(null, i2), 'quem deriva fica do lado da derivação');
  ok(HX.physVisW(o.T.s1, sh, BU) > HX.physVisW(o.s3, sh, BU), 'largura cresce com o nº de fios'); sh.wirePitch = 1; eq(HX.physVisW(o.s3, sh, BU), 4);
});
test('cota mostra o nº de fios (ramo e caminho) e o valor digitado define o ramo', function () {
  var o = harness(), sh = o.sh, C = HX.physCtx(o.d.p, o.d.sheet, {}), dm = sh.items.filter(function (i) { return i.type === 'pdim' && i.seg === o.s3.id; })[0];
  if (!dm) { dm = { type: 'pdim', id: 'x1', a: o.s3.a, b: o.s3.b, seg: o.s3.id, mode: 'seg', off: 6 }; sh.items.push(dm); C = HX.physCtx(o.d.p, o.d.sheet, {}); }
  eq(HX.physDimValue(dm, C, o.d.p).sub, '4 fios'); dm.hideCount = true; ok(!HX.physDimValue(dm, C, o.d.p).sub); dm.hideCount = false;
  var pd = { type: 'pdim', id: 'x2', a: o.n.J1.id, b: o.n.J2.id, mode: 'path' }; eq(HX.physDimValue(pd, C, o.d.p).sub, '8 fios', 'só os que vão de J1 a J2');
  eq(HX.physDimSet(sh, dm, '650'), ''); eq(o.s3.len, 650); var m = HX.physIdx(sh); ok(Math.abs(HX.polyLen(HX.physSegPts(o.s3, m)) * 5 - 650) < 2, 'redesenhou em escala');
  eq(HX.physDimSet(sh, pd, 1500), ''); eq(HX.physSegLen(o.T.s1, m, 5) + HX.physSegLen(o.T.s2, m, 5), 1500, 'caminho reescalado');
  sh.dimRedraw = false; var x0 = o.n.J3.x; HX.physDimSet(sh, dm, 900); eq(o.s3.len, 900); eq(o.n.J3.x, x0, 'sem redesenhar');
  ok(/inválido/.test(HX.physDimSet(sh, dm, 'abc')));
  var log = []; HX.drawSheetItems(G(log), o.d.p, o.d.sheet, {}); ok(log.some(function (l) { return l[0] === 'T' && l[1] === '4 fios'; }), 'texto na cota');
});
test('detalhe: zoom de área em círculo, posição livre, ampliação automática, texto em tamanho normal, alças', function () {
  var o = harness(), d = o.d, sh = o.sh, it; d.change('d', function () { it = HX.physAddDetail(d, { x: o.br.x - 10, y: o.br.y - 10, w: 20, h: 16 }, 'circle'); });
  eq(it.shape, 'circle'); eq(it.sw, 20); eq(it.sh, 20); eq(it.k, 4, '20 mm × 4 = 80 mm'); eq(it.label, 'A');
  var D = HX.physDetGeom(it); ok(D.x > D.sx + D.sw || D.x + D.W < D.sx || D.y > D.sy + D.sh || D.y + D.H < D.sy, 'vista fora da região');
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.indexOf('clipCircle') >= 0, 'recorte circular');
  ok(log.some(function (l) { return l[0] === 'T' && l[1] === 'ESCALA 4:1'; }));
  var J = log.filter(function (l) { return l[0] === 'T' && l[1] === 'J1'; }).map(function (l) { return l[2]; }); ok(J.length < 2 || Math.min.apply(null, J) < Math.max.apply(null, J), 'texto reduzido dentro do detalhe');
  eq(HX.physDetSrcHit(it, [D.cx + D.r, D.cy]), 'move'); eq(HX.physDetSrcHit(it, [D.cx + D.r * 0.7071, D.cy + D.r * 0.7071]), 'size'); eq(HX.physDetSrcHit(it, [D.cx, D.cy]), '');
  eq(HX.physDetAutoK(100, 60), 1.5); eq(HX.physDetAutoK(10, 8), 10);
});
test('etiqueta de identificação: medida do conector mais próximo, cota, tipos, lista de materiais e marcadores', function () {
  var o = harness(), d = o.d, sh = o.sh, t, t2; sh.tagPN = 'TMS-SCE';
  d.change('t', function () { t = HX.physAddTag(d, o.T.s2, 0.8); t2 = HX.physAddTag(d, o.s3, 0.5, { style: 'flag', text: 'W-J3' }); });
  var m = HX.physIdx(sh), far = m[t.end === 'b' ? o.T.s2.b : o.T.s2.a]; eq(far.ref, 'J2', 'mede do J2'); eq(t.text, 'J2'); ok(t.dim === true); eq(t.pn, 'TMS-SCE');
  ok(Math.abs(t.dist - Math.round(0.2 * HX.physSegLen(o.T.s2, m, 5) / 5) * 5) <= 5, 'distância ' + t.dist);
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {});
  ok(log.some(function (l) { return l[0] === 'T' && l[1] === 'J2'; }) && log.some(function (l) { return l[0] === 'T' && l[1] === 'W-J3'; }), 'textos');
  ok(log.some(function (l) { return l[0] === 'T' && l[1] === String(Math.round(HX.physTagEdist(t))); }), 'cota da posição (borda da etiqueta → conector)'); ok(HX.physTagEdist(t) < t.dist, 'mede da borda, não do meio');
  var B = HX.physBom(d.p, sh); ok(B.key['tag:sleeve:TMS-SCE'].qty === 1 && B.key['tag:flag:TMS-SCE'].qty === 1, 'lista de materiais');
  ok(HX.physMarkers(sh).some(function (r) { return r.text === 'W-J3'; }), 'tabela de marcadores');
  eq(Object.keys(HX.PTAG), ['sleeve'], 'só luva termo-retrátil'); HX.physTagAccessor(t); t.edist = 40; eq(HX.physTagEdist(t), 40, 'distância pela borda editável');
  t.dimText = '40 MÍN'; var l2 = []; HX.drawSheetItems(G(l2), d.p, d.sheet, {}); ok(l2.some(function (l) { return l[0] === 'T' && l[1] === '40 MÍN'; }), 'cota customizada');
  d.select([t2.id]); HX.ops.copySel(d); ok(true);
});
test('sem ramificação não há ponto de derivação: 2 conectores = 1 ramo; centro automático some ao atualizar; limpar BR de 2 ramos', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0)), c = d.add(HX.makeConn(d, 'D38999:11-35', 100, 90)), r;
  d.change('w', function () { for (var i = 0; i < 3; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); ops.addWire(d, [pinPt(a, 12), pinPt(c, 0)]); });
  d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); });
  var sh = d.p.sheets[r.index]; ok(sh.items.some(function (i) { return i.nkind === 'virt'; }), '3 conectores: estrela com centro');
  d.sheet = 0; d.change('x', function () { d.removeIds([c.id]); d.p.sheets[0].items = d.p.sheets[0].items.filter(function (i) { return !(i.type === 'wire' && HX.same(i.pts[0], pinPt(a, 12))); }); });
  d.change('u', function () { r = HX.applyPhysical(d, { scale: 5 }); }); sh = d.p.sheets[r.index];
  ok(!sh.items.some(function (i) { return i.type === 'pnode' && i.nkind !== 'conn'; }), 'sem J3: centro saiu, nada de BR'); eq(sh.items.filter(function (i) { return i.type === 'pseg'; }).length, 1);
  var o = harness(); sh = o.sh; d = o.d; var s3 = o.s3; d.change('rm', function () { sh.items = sh.items.filter(function (i) { return i.id !== s3.id && i.id !== o.n.J3.id && i.of !== o.n.J3.id; }); });
  var T = o.T, t; d.change('t', function () { t = HX.physAddTag(d, T.s2, 0.5); }); var m = HX.physIdx(sh), p0 = HX.physAccAt(t, sh, m, 5).pt;
  var k; d.change('c', function () { k = HX.physCleanBR(d, sh, false); }); eq(k, 1); ok(!m[o.br.id] || !sh.items.some(function (i) { return i.id === o.br.id; }), 'BR saiu');
  m = HX.physIdx(sh); var p1 = HX.physAccAt(t, sh, m, 5).pt; ok(Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 1, 'etiqueta no mesmo lugar: ' + p0 + ' / ' + p1);
  eq(sh.items.filter(function (i) { return i.type === 'pseg'; }).length, 1);
});
