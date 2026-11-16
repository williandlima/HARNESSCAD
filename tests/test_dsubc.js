/* D-Sub p/ cabo (Amphenol): catálogo, leiautes mistos e vista lateral/frontal pelo datasheet */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
test('D-Sub p/ cabo: PN da série D (solda) e 8656 (crimp) pelo seletor do datasheet', function () {
  var d = HX.CAT.conns['DSUBC:DE-9'], f = HX.CAT.fams.DSUBC; ok(d && f, 'família DSUBC');
  eq(f.pn(d, 'D', 'P'), 'DE09P064TXLF'); eq(f.pn(d, 'D', 'S'), 'DE09S064TLF'); eq(f.pn(HX.CAT.conns['DSUBC:DA-15'], '8656', 'P'), '865615PLTXLF');
  eq(f.contacts['20'].p, '865635206'); eq(f.contacts['24'].s, '865635106');
});
test('D-Sub misto: todos os leiautes do datasheet com contagem certa e sem sobreposição', function () {
  Object.keys(HX.DSUB_LAY).forEach(function (k) {
    var d = HX.CAT.conns['DSUBW:' + k]; ok(d, k); var m = /^(\d+)W?A?V?(\d+)$/.exec(k.replace('WA', 'W').replace('V', 'W')), tot = +m[1], big = +m[2];
    eq(d.pins.length, tot, k + ' total'); eq(d.pins.filter(function (p) { return /^A/.test(p.n); }).length, big, k + ' grandes');
    var P = HX.dsubLayPts(k);
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) { var r = (P[i].big ? 2.05 : 0.55) + (P[j].big ? 2.05 : 0.55); ok(Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) > r * 0.98, k + ' ' + P[i].n + '/' + P[j].n); }
  });
  eq(HX.CAT.fams.DSUBW.pn(HX.CAT.conns['DSUBW:13W3'], '', 'P'), 'DB13W3PA00LF');
});
test('D-Sub p/ cabo: vista lateral por tipo (solda 7,75 / crimp A máx / potência 15,70) e face com A1', function () {
  var c = { part: 'DSUBC:DA-15', pins: new Array(15), gender: 'P', variant: '8656' };
  ok(HX.isDsub(c)); eq(HX.dsubSide(c, {}).kind, 'crimp'); eq(HX.dsubSide(c, { dsTerm: 'solder' }).rear, 7.75);
  var w = { part: 'DSUBW:3W3', pins: new Array(3), gender: 'S' }, M = HX.dsubSide(w, {}); eq(M.kind, 'power'); eq(M.rear, 15.7);
  var l = [], g = { style: function () {}, rect: function () {}, line: function () {}, poly: function () {}, circle: function () { l.push('c'); }, text: function (t) { l.push(t); } };
  HX.physDsubFace(g, w, 0, 0, 2, '#000'); ok(l.indexOf('A1') >= 0 && l.indexOf('A3') >= 0, 'rótulos A1..A3');
  HX.physDsubVec(g, {}, w, 1, '#000', true, 3);
});
test('D-Sub sem capa: cada fio termina no seu contato; soquete espelhado; leque entra no ramo', function () {
  var d = new HX.Doc(), o = HX.ops, J1 = d.add(HX.makeConn(d, 'DSUBC:DA-15', 40, 40)), J2 = d.add(HX.makeConn(d, 'DSUBC:DA-15', 200, 40)); J1.gender = 'P'; J2.gender = 'S';
  var A = HX.connLayout(J1, 2.5).pins, B = HX.connLayout(J2, 2.5).pins; d.change('w', function () { for (var i = 0; i < 15; i++) o.addWire(d, [A[i].pt, B[i].pt]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line', faces: false }); }); d.sheet = r.index; var sh = d.p.sheets[r.index];
  sh.connDraw = 'vec'; sh.items.forEach(function (i) { if (i.type === 'pnode' && i.nkind === 'conn') i.dsHood = 'none'; });
  var C = HX.physCtx(d.p, d.sheet, {}), BU = HX.physBundleCtx(d.p, d.sheet, {}), n = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; });
  eq(Object.keys(BU.pin[n[0].id]).length, 15, 'pino de cada fio no conector'); ok(HX.physDsubTermAt(n[0], C) >= HX.PHYS_FAN, 'leque de terminação'); eq(HX.physConnTrim(n[0], C), HX.physDsubTermAt(n[0], C));
  var w1 = BU.node[n[0].id].filter(function (w) { return BU.pin[n[0].id][w.id] === '1'; })[0], la = HX.physPinLat(n[0], w1, [0, 1], C, BU), lb = HX.physPinLat(n[1], w1, [0, 1], C, BU);
  ok(la != null && lb != null && Math.sign(la) === Math.sign(lb), 'pino 1 do mesmo lado nas duas pontas (macho × fêmea, sem torcer o feixe)');
  var l = []; HX.drawSheetItems({ style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, clip: function () {}, image: function () { return true; }, text: function (t) { l.push(t); } }, d.p, d.sheet, {});
  ok(l.indexOf('39,14') < 0, 'sem cota do conector na cablagem');
});
test('junções do esquemático: sem ponto/ramo de emenda; conector derivado entra no meio do tronco', function () {
  var d = new HX.Doc(), o = HX.ops, X1 = d.add(HX.makeConn(d, 'DSUB:DA-15', 40, 40)), X2 = d.add(HX.makeConn(d, 'DSUB:DA-15', 240, 40)), A = HX.connLayout(X1, 2.5).pins, B = HX.connLayout(X2, 2.5).pins, W = [];
  d.change('w', function () { for (var i = 0; i < 15; i++) W.push(o.addWire(d, [A[i].pt, [A[i].pt[0] + 100, A[i].pt[1]], B[i].pt])); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); d.sheet = 0;
  var J = d.add(HX.makeConn(d, 'DSUBW:7W2', 60, 140)), P = HX.connLayout(J, 2.5).pins, tg = [13, 12, 11, 10, 10, 10, 10];
  d.change('j', function () { P.forEach(function (q, k) { var w = W[tg[k]], x = 80 + k * 2.5, nw = o.addWire(d, [q.pt, [x, q.pt[1]], [x, w.pts[0][1]]]); HX.ops.junctionAt(d, nw, 1); }); });
  ok(d.p.sheets[0].items.filter(function (i) { return i.type === 'splice'; }).length >= 4, 'junções no esquemático');
  d.change('g2', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line' }); }); var sh = d.p.sheets[r.index];
  ok(!sh.items.some(function (i) { return i.type === 'pnode' && i.nkind === 'splice'; }), 'sem pontos de emenda no físico');
  var nj = sh.items.filter(function (i) { return i.type === 'pnode' && i.of === J.id; })[0], sg = HX.physSegsOf(sh, nj.id)[0], hub = HX.physIdx(sh)[sg.a === nj.id ? sg.b : sg.a];
  ok(hub.nkind !== 'conn', 'J1 deriva de um ponto do tronco, não de um conector'); eq(HX.physSegsOf(sh, hub.id).length, 3);
  var BU = HX.physBundle(d.p, sh); eq(BU.orphan.length, 0, 'todos os fios roteados'); ok(BU.seg[sg.id].wires.length >= 7, 'fios do J1 no ramo dele');
});
