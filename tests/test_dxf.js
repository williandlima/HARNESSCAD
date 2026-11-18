/* Exportação DXF R12 (Solid Edge / AutoCAD): estrutura, eixo Y, camadas, preenchimento, cores e folha real */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function pairs(s) { var a = s.split('\r\n'), r = []; for (var i = 0; i + 1 < a.length; i += 2) r.push([a[i].trim(), a[i + 1]]); return r; }
function ents(s, type) { var P = pairs(s), out = [], cur = null; P.forEach(function (p) { if (p[0] === '0') { cur = p[1] === type ? {} : null; if (cur) out.push(cur); } else if (cur) (cur[p[0]] = cur[p[0]] || []).push(p[1]); }); return out; }
test('DXF: arquivo R12 válido, mm de papel com Y para cima, camadas pela espessura, tracejado', function () {
  var g = new HX.DxfPage(420, 297, {}); g.style({ stroke: '#000', lw: 0.1 }); g.line(10, 10, 20, 10);
  g.style({ lw: 0.5, dash: [1, 0.5] }); g.push([1, 0, 0, 1, 100, 50]); g.line(0, 0, 10, 0); g.pop(); var s = g.build();
  ok(/^0\r\nSECTION\r\n2\r\nHEADER/.test(s) && /\$ACADVER\r\n1\r\nAC1009/.test(s) && /\r\n0\r\nEOF\r\n$/.test(s), 'cabeçalho e fim');
  var Ls = ents(s, 'LINE'); eq(Ls.length, 2);
  eq([Ls[0]['8'][0], +Ls[0]['10'][0], +Ls[0]['20'][0]], ['FINO', 10, 287], 'Y invertido (297 - 10)');
  eq([Ls[1]['8'][0], Ls[1]['6'][0], +Ls[1]['10'][0], +Ls[1]['20'][0]], ['GROSSO', 'TRACEJADA', 100, 247], 'transformação + tracejado');
  ok(/2\r\nLAYER/.test(s) && /2\r\nTRACOPONTO/.test(s), 'tabelas de camadas e tipos de linha');
});
test('DXF: região cheia triangulada em SOLID, fundo branco omitido, modo preto e texto em ANSI 1252', function () {
  var g = new HX.DxfPage(100, 100, {}); g.style({ stroke: '#1f2a9e', fill: '#1f2a9e', lw: 0.2 }); g.poly([[0, 0], [10, 0], [10, 10], [5, 4], [0, 10]], true);
  g.style({ stroke: null, fill: '#fff' }); g.rect(0, 0, 50, 50); g.text('SÃO Ø — 22×#22D', 5, 5, { size: 2, align: 'c', color: '#c00' }); var s = g.build();
  eq(ents(s, 'SOLID').length, 3, 'pentágono côncavo = 3 triângulos; branco não vai'); eq(ents(s, 'SOLID')[0]['62'][0], '5', 'azul -> cor 5');
  var T = ents(s, 'TEXT')[0]; eq(T['1'][0], 'SÃO Ø \u0097 22×#22D', 'ANSI 1252'); eq([T['72'][0], T['62'][0]], ['1', '1']);
  var m = new HX.DxfPage(100, 100, { mono: true }); m.style({ stroke: '#c00', lw: 0.2 }); m.line(0, 0, 1, 1); eq(ents(m.build(), 'LINE')[0]['62'][0], '7', 'preto');
  var b = HX.dxfBytes('Ø'); eq([b.length, b[0]], [1, 0xd8]);
});
test('DXF: folha do projeto com moldura, carimbo e conectores (mesmo desenho do PDF)', function () {
  var o = L.setup(), d = o.d; d.p.meta.docNo = 'CAB-9'; var s = HX.exportDXF(d.p, 0, { mono: true }), T = ents(s, 'TEXT').map(function (t) { return t['1'][0]; });
  ok(T.indexOf('CAB-9') >= 0 && T.indexOf('J1') >= 0 && T.indexOf(o.b.ref) >= 0, 'carimbo e referências: ' + T.slice(0, 12).join('|'));
  ok(ents(s, 'POLYLINE').length + ents(s, 'LINE').length > 20, 'geometria');
  eq(HX.dxfName(d.p, 0), 'CAB-9_revA.dxf');
});
