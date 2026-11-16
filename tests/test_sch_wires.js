/* HarnessCAD - esquemático: espaçamento dos fios ao mover conectores */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
test('esquemático: mover o conector mantém o espaçamento dos fios (degraus escalonados, sem cruzar)', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), b = d.add(HX.makeConn(d, 'D38999:13-35', 200, 0));
  d.change('w', function () { for (var i = 0; i < 6; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); });
  var ws = d.items().filter(function (i) { return i.type === 'wire'; });
  [[0, 15], [0, -15], [30, 40]].forEach(function (dv) {
    var mv = ops.beginMove(d, [a.id], 'drag'); mv.apply(dv[0], dv[1]);
    var xs = ws.map(function (w) { return w.pts[1][0]; }); eq(new Set(xs).size, 6, 'degraus em X diferentes ' + xs);
    for (var i = 1; i < 6; i++) eq(Math.abs(xs[i] - xs[i - 1]), 5, 'passo dos pinos');
    ws.forEach(function (w) { eq(w.pts.length, 4); }); mv.cancel();
  });
  var mv = ops.beginMove(d, [a.id], 'drag'); mv.apply(0, 15); var ys = ws.map(function (w) { return w.pts[0][1]; }); mv.cancel();
  ok(ys.every(function (y, i) { return !i || y > ys[i - 1]; }));
});
