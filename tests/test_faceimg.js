/* HarnessCAD - vista frontal = imagem do datasheet, sem redesenho */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
var fs = require('fs'), path = require('path'), WEB = path.join(__dirname, '..', 'web');
function fakeG(log) {
  var g = {}; ['style', 'line', 'poly', 'rect', 'circle', 'push', 'pop'].forEach(function (k) { g[k] = function () { log.push(k); }; });
  g.text = function (s) { log.push('T:' + s); }; g.image = function (im, x, y, w, h) { log.push(['IMG', im, x, y, w, h]); return true; }; return g;
}
test('38999: os 53 arranjos têm o recorte do catálogo (PNG < 10 KB, tamanho confere)', function () {
  var keys = Object.keys(HX.CAT.conns).filter(function (k) { return /^D38999:/.test(k); });
  eq(keys.length, 53);
  keys.forEach(function (k) {
    var im = HX.FACE_IMG[k] && HX.FACE_IMG[k].pin; ok(im, 'imagem de ' + k);
    var b = L.imgBytes(im.url); ok(b.length < 10000, k + ' ' + b.length);
    eq(b.slice(1, 4).toString(), 'PNG', k); eq([b.readUInt32BE(16), b.readUInt32BE(20)], [im.w, im.h], k);
    ok(/Amphenol|Glenair/.test(im.src) && /pág\./.test(im.src), 'fonte e página: ' + k);
  });
});
test('imagem do usuário tem prioridade; soquete sem imagem própria mostra a face que o datasheet traz', function () {
  var png = 'data:image/png;base64,iVBORw0KGgo=';
  var lib = { 'USR:FACE:DT:4 vias': { key: 'USR:FACE:DT:4 vias', socket: { data: png, w: 50, h: 30, src: 'TE DT, pág. 3' } },
    'USR:FACE:X': { key: 'USR:FACE:X', pin: { data: 'data:image/svg+xml;base64,AAAA', w: 1, h: 1 } }, 'USR:ABC': { key: 'USR:ABC', pins: [] } };
  var F = HX.sanitizeFaces(lib); eq(Object.keys(F), ['DT:4 vias'], 'SVG e conectores ficam de fora');
  HX.FACE_USER = F;
  eq(HX.faceImgFor('DT:4 vias', 'S').src, 'TE DT, pág. 3'); eq(HX.faceImgFor('DT:4 vias', 'P').view, 'socket');
  HX.FACE_USER = { 'D38999:11-35': { pin: { data: png, w: 10, h: 10, view: 'pin' } } };
  eq(HX.faceImgFor('D38999:11-35', 'P').data, png); HX.FACE_USER = {};
  eq(HX.faceImgFor('D38999:11-35', 'S').view, 'pin', 'catálogo só traz a face de pinos');
});
test('desenho: só a imagem (sem círculos/contatos inventados) + legenda com a fonte + tabela', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'D38999:13-35', 0, 0)), f = d.add(HX.makeFace(d, c, 100, 50)), log = [];
  HX.drawFace(fakeG(log), f, d.p, 0, { theme: HX.THEME, nl: HX.buildNetlist(d.p) });
  var img = log.filter(function (x) { return x[0] === 'IMG'; })[0]; ok(img, 'imagem desenhada');
  eq([img[2] + img[4] / 2, img[4], img[5]], [100, f.d, f.d]); eq(log.indexOf('circle'), -1);
  ok(log.some(function (x) { return /^T:Fonte: Amphenol/.test(x); }) && log.indexOf('T:Pino') >= 0, 'fonte e tabela');
  var c2 = d.add(HX.makeConn(d, 'JST-XH:3 vias', 0, 0)), f2 = d.add(HX.makeFace(d, c2, 0, 0)), l2 = [];
  HX.drawFace(fakeG(l2), f2, d.p, 0, { theme: HX.THEME, nl: HX.buildNetlist(d.p) });
  ok(l2.indexOf('T:sem imagem do datasheet') >= 0 && !l2.some(function (x) { return x[0] === 'IMG'; }));
});
test('PDF embute os pixels da imagem como estão (XObject 8 bits)', function () {
  var im = { url: 'x.png', w: 2, h: 2 }; Object.defineProperty(im, '_px', { value: { w: 2, h: 2, gray: true, bytes: '\x00\xff\x80\x10' } });
  var pdf = new HX.Pdf({}), pg = pdf.addPage(100, 100); ok(pg.image(im, 10, 10, 20, 20)); ok(pg.image(im, 40, 10, 20, 20));
  var s = Buffer.from(pdf.build()).toString('latin1');
  ok(/\/XObject << \/Im1 \d+ 0 R >>/.test(s) && /\/Width 2 \/Height 2 \/ColorSpace \/DeviceGray/.test(s), 'XObject');
  eq((s.match(/\/Subtype \/Image/g) || []).length, 1, 'mesma imagem uma vez'); eq((s.match(/\/Im1 Do/g) || []).length, 2);
  ok(s.indexOf('\x00\xff\x80\x10') > 0, 'bytes intactos');
});
