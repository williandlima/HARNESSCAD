/* Formatação do nome dos sinais (tamanho, estilo, cor) e itálico na tela, no PDF e no DXF */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
console.log('Formatação do nome dos sinais');
test('nome dos sinais: tamanho, negrito/itálico e cor pelo conector ou pelo padrão do projeto', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:13-98', 40, 40)), T = []; c.pins[0].name = 'VCC';
  var g = { push: function () {}, pop: function () {}, style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, text: function (t, x, y, o) { T.push([String(t), o]); } };
  function nome() { T = []; HX.SYMBOLS.univ(g, c, d.p, 0, { theme: {}, connected: new Set() }, HX.connLayout(c, d.p.unit)); return T.filter(function (t) { return t[0] === 'VCC'; })[0][1]; }
  var o = nome(); ok(!o.bold && !o.italic, 'padrão: normal');
  c.uNameSz = 3; c.uNameSt = 'bi'; c.uNameC = '#1f4e9e'; o = nome(); eq([o.size, o.bold, o.italic, o.color], [3, true, true, '#1f4e9e']);
  delete c.uNameSz; delete c.uNameSt; delete c.uNameC; d.p.view.univ = { uNameSt: 'i', uNameSz: 2.2 }; o = nome(); eq([o.size, o.bold, o.italic], [2.2, false, true], 'padrão do projeto');
  ok(HX.UNIV_KEYS.indexOf('uNameSt') >= 0 && HX.UNIV_KEYS.indexOf('uNameSz') >= 0 && HX.UNIV_KEYS.indexOf('uNameC') >= 0, 'vai junto em "padrão do projeto", "aplicar em todos" e pincel');
});
test('itálico no PDF (Helvetica-Oblique / BoldOblique) e no DXF (ângulo oblíquo 15°)', function () {
  var pdf = new HX.Pdf({ title: 't' }), pg = pdf.addPage(100, 100); pg.text('A', 10, 10, { italic: true }); pg.text('B', 10, 20, { italic: true, bold: true }); pg.text('C', 10, 30, {});
  var b = pdf.build(), s = Array.prototype.map.call(b, function (c) { return String.fromCharCode(c); }).join(''); ok(/\/F3 [\d.]+ Tf/.test(s) && /\/F4 [\d.]+ Tf/.test(s) && /\/F1 [\d.]+ Tf/.test(s), 'fontes nos textos');
  ok(/Helvetica-Oblique/.test(s) && /Helvetica-BoldOblique/.test(s) && /\/F3 6 0 R \/F4 7 0 R/.test(s), 'fontes declaradas na página');
  var D = new HX.DxfPage(100, 100, {}); D.text('X', 0, 0, { italic: true }); ok(D.out.join('|').indexOf('51|15') >= 0, 'DXF: ângulo oblíquo 15°');
  D = new HX.DxfPage(100, 100, {}); D.text('X', 0, 0, {}); ok(D.out.join('|').indexOf('51|15') < 0, 'DXF: normal sem oblíquo');
});
