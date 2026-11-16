/* HarnessCAD - par trançado com símbolo "8" e blindagem com fio de dreno (ponto de ligação CB:SH) */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
test('par trançado: um "8" cruzando os dois fios, centrado entre eles', function () {
  var w1 = { pts: [[0, 0], [100, 0]] }, w2 = { pts: [[0, 2.5], [100, 2.5]] }, T = HX.twistGeom([w1, w2]);
  ok(T, 'geometria'); eq(T.c, [25, 1.25], 'centro entre os fios'); ok(T.b > 1.25, 'laços passam dos fios');
  ok(!HX.twistGeom([w1, { pts: [[0, 40], [100, 40]] }]), 'longe demais: volta à marca antiga');
  var log = [], g = { push: function () {}, pop: function () {}, style: function () {}, poly: function (P) { log.push(P.length); }, text: function (t) { log.push(t); } };
  ok(HX.twistGroupMark(g, [w1, w2], '#000', 'TP1') && log.indexOf('TP1') >= 0, 'desenha com o nome do grupo');
});
test('blindagem: dreno é ponto de ligação (CB1:SH) e entra na lista de fios', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MS5015:14S-6', 0, 0)), b = d.add(HX.makeConn(d, 'MS5015:14S-6', 100, 0));
  d.change('w', function () { for (var i = 0; i < 2; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); });
  var y0 = pinPt(a, 0)[1], cb = { type: 'cable', id: 'k1', ref: 'CB1', x: 40, y: y0 - 2.5, w: 10, h: 7.5, shield: true }; d.add(cb);
  var dp = HX.cableDrainPt(cb); eq(dp, [45, y0 + 7.5], 'ponta do dreno na grade, embaixo do oval');
  var f = pinPt(a, 5), yy = f[1] + 10;
  d.change('d', function () { ops.addWire(d, [dp, [dp[0], yy], [f[0] + 5, yy], [f[0] + 5, f[1]], f]); });
  var nl = HX.buildNetlist(d.p), wl = HX.wireList(d.p, nl).map(function (r) { return r.from + '>' + r.to; });
  ok(wl.indexOf('CB1:SH>J1:F') >= 0, 'lista: ' + wl.join(' '));
  cb.drain = 'gnd'; ok(!HX.cableDrainPt(cb), 'símbolo de terra: sem ponto'); cb.shield = false; cb.drain = ''; ok(!HX.cableDrainPt(cb), 'sem blindagem: sem dreno');
});
test('blindagem é ELIPSE e se ajusta a dois fios ou ao chicote todo', function () {
  var ax = HX.cableAxes({ w: 20, h: 20 }); ok(ax[0] < ax[1] * 0.5, 'quadrado vira elipse em pé');
  ax = HX.cableAxes({ w: 30, h: 6 }); ok(ax[1] < ax[0], 'deitada para fios verticais');
  var sh = { items: [0, 1, 2, 3].map(function (i) { return { type: 'wire', pts: [[0, i * 5], [100, i * 5]] }; }) };
  var c = { x: 40, y: 3, w: 30, h: 8 }; eq(HX.cableFit(c, sh), 2, 'pega os dois fios do meio (y 5 e 10)'); eq([c.y, c.h], [2.5, 10]); ok(c.w < c.h, 'elipse em pé');
  var t = { x: 40, y: -2, w: 8, h: 20 }; eq(HX.cableFit(t, sh), 4, 'chicote todo'); eq([t.y, t.h], [-2.5, 20]);
});
test('identificação: blindagem e par trançado com ou sem nome', function () {
  var T = [], g = { push: function () {}, pop: function () {}, style: function () {}, poly: function () {}, circle: function () {}, line: function () {}, text: function (t) { T.push(t); } };
  var c = { type: 'cable', ref: 'CB1', part: 'M27500', x: 0, y: 0, w: 5, h: 20, shield: true }, o = { theme: HX.THEME };
  HX.drawCable(g, c, o); ok(T.indexOf('CB1 M27500') >= 0, 'com identificação');
  T = []; c.showRef = 'ref'; HX.drawCable(g, c, o); ok(T.indexOf('CB1') >= 0, 'só a referência');
  T = []; c.showRef = 'off'; HX.drawCable(g, c, o); eq(T.length, 0, 'sem identificação');
  T = []; c.showRef = ''; c.refTxt = 'BLINDAGEM'; HX.drawCable(g, c, o); ok(T.indexOf('BLINDAGEM M27500') >= 0, 'texto próprio');
  var d = new HX.Doc(); d.p.sheets[0].items.push({ type: 'wire', id: 'a', twist: 'TP1', pts: [[0, 0], [50, 0]] }, { type: 'wire', id: 'b', twist: 'TP1', pts: [[0, 2.5], [50, 2.5]] });
  T = []; HX.drawOverlay(g, d.p, 0, o); ok(T.indexOf('TP1') >= 0, 'par com nome');
  T = []; d.p.view.twistName = false; HX.drawOverlay(g, d.p, 0, o); ok(T.indexOf('TP1') < 0, 'par sem nome');
  T = []; d.p.view.twistSym = 'sine'; HX.drawOverlay(g, d.p, 0, o); ok(T.indexOf('TP1') < 0, 'senoide sem nome');
});
