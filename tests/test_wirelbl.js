/* HarnessCAD - identificação do fio configurável + vista frontal só com imagem */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function texts(w, p) { var t = [], g = { style: function () {}, poly: function () {}, push: function () {}, pop: function () {}, text: function (s, x, y, o) { t.push([s, y, o.size]); } }; HX.drawWire(g, w, p, { theme: HX.THEME }); return t; }
test('fio antigo (sem campos) continua: número + bitola + cor acima do fio', function () {
  var d = new HX.Doc(), w = { type: 'wire', num: 'W1', wtype: 'M22759/16', gauge: '22', color: 'WH', pts: [[0, 10], [40, 10]] };
  eq(HX.wireLabel(w).txt, 'W1 22 AWG WH'); var t = texts(w, d.p); eq(t[0][0], 'W1 22 AWG WH'); ok(t[0][1] < 10, 'acima');
});
test('cada parte liga/desliga; nome, texto extra, posição abaixo, tamanho, sem identificação', function () {
  var d = new HX.Doc(), w = { type: 'wire', num: 'W7', name: 'CAN-H', wtype: 'M22759/16', gauge: '24', color: 'GN', pts: [[0, 10], [40, 10]],
    lblNum: false, lblName: true, lblGauge: true, lblColor: false, lblTxt: 'TWISTED', lblPos: 'b', lblSize: 2 };
  eq(HX.wireLabel(w).txt, 'CAN-H 24 AWG TWISTED'); var t = texts(w, d.p); ok(t[0][1] > 10, 'abaixo'); eq(t[0][2], 2);
  w.lblPos = 'n'; eq(texts(w, d.p).length, 0, 'sem identificação');
  w.lblPos = 'a'; w.lblName = false; w.lblGauge = false; w.lblTxt = ''; eq(texts(w, d.p).length, 0, 'nada marcado = nada escrito');
});
test('fio novo copia os padrões da ferramenta Fio (especificação, nome e identificação)', function () {
  var d = new HX.Doc(); d.p.defaults.gauge = '20'; d.p.defaults.color = 'RD';
  d.p.defaults.wlbl = { lblNum: false, lblName: true, name: 'GND', lblPos: 'b' };
  var w = HX.ops.addWire(d, [[0, 0], [30, 0]]);
  eq([w.gauge, w.color, w.name, w.lblNum, w.lblPos], ['20', 'RD', 'GND', false, 'b']); eq(HX.wireLabel(w).txt, 'GND 20 AWG RD');
  d.p.defaults.wlbl.lblPos = 'a'; eq(w.lblPos, 'b', 'mudar o padrão não altera fio já desenhado');
  eq(HX.wireList(d.p)[0].name, 'GND');
});
