/* HarnessCAD - correções da v1.6.2: conectores comerciais com símbolo no físico, cota da etiqueta pela borda do
   conector, vista frontal sem descrição e girável, foco do teclado e bloqueio de símbolos do esquema no físico */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, ops = HX.ops;
var vm = require('vm'), ctx = { console: console, HX: HX, document: { addEventListener: function () {}, getElementById: function () { return null; } } }; ctx.globalThis = ctx; vm.createContext(ctx);
HX.UI = HX.UI || {}; HX.App = HX.App || function () {}; HX.Tools = HX.Tools || function () {}; HX.Tools.prototype.setTool = HX.Tools.prototype.setTool || function () {}; HX.Tools.prototype.xform = HX.Tools.prototype.xform || function () {};
(function (P) { P.HINTS = P.HINTS || {}; ['down', 'up', 'move', 'drawOverlay', 'key'].forEach(function (k) { P[k] = P[k] || function () {}; }); })(HX.Tools.prototype); HX.SHORTCUTS = HX.SHORTCUTS || [];
['ui_focus', 'ui_guard', 'tools_paint'].forEach(function (f) { vm.runInContext(L.fs.readFileSync(L.path.join(__dirname, '..', 'web', 'js', f + '.js'), 'utf8'), ctx, { filename: f }); });
function pinPt(c, i) { return HX.connLayout(c, 2.5).pins[i].pt; }
function G(log) { var g = {}; ['style', 'line', 'rect', 'circle', 'push', 'pop', 'clip'].forEach(function (k) { g[k] = function () { log.push(k); }; }); g.poly = function () { log.push('poly'); }; g.text = function (t) { log.push('T:' + t); }; g.image = function () { log.push('IMG'); return true; }; return g; }
test('comerciais: classe e medidas por família; símbolo no físico e vista frontal numerada', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MicroFit:6 vias', 0, 0)), b = d.add(HX.makeConn(d, 'M12:A 4p', 200, 0));
  var o = HX.comShape(a); eq([o.cls, o.rows, o.cols], ['rect', 2, 3]); eq(HX.comShape(b).cls, 'circ'); ok(!HX.comShape(d.add(HX.makeConn(d, 'D38999:13-35', 0, 90))), 'MIL fica com o desenho dele');
  d.change('w', function () { for (var i = 0; i < 4; i++) ops.addWire(d, [pinPt(a, i), pinPt(b, i)]); });
  var r; d.change('g', function () { r = HX.applyPhysical(d, { scale: 5, style: 'line', faces: true }); }); d.sheet = r.index;
  var log = []; HX.drawSheetItems(G(log), d.p, d.sheet, {}); ok(log.indexOf('T:sem imagem') < 0 && log.indexOf('T:ver datasheet') < 0, 'sem "sem imagem" / "ver datasheet"');
  ok(log.indexOf('T:6') >= 0 && log.indexOf('T:4') >= 0, 'contatos numerados na vista');
  var n = d.cur().items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; }); ok(n.every(function (i) { return i._bb && i._bb.x1 > i._bb.x0; }), 'caixa do símbolo');
});
test('etiqueta: cota parte da borda do conector; vista frontal sem descrição', function () {
  var nd = { nkind: 'conn', x: 0, y: 0, _bb: { x0: -10, y0: -5, x1: 6, y1: 5 } };
  eq(HX.physEdgeOff(nd, [50, 0]), 6, 'borda à direita'); eq(HX.physEdgeOff(nd, [-40, 0]), 10, 'borda à esquerda'); eq(HX.physEdgeOff({ nkind: 'brk', x: 0, y: 0 }, [9, 0]), 0, 'ramificação: do nó');
});
test('foco do teclado e bloqueio de símbolos do esquema no físico', function () {
  ok(HX.shouldReleaseFocus && HX.schBlocked, 'módulos carregados'); { ok(HX.shouldReleaseFocus({ tagName: 'SELECT' }, 10, 0), 'lista solta'); ok(!HX.shouldReleaseFocus({ tagName: 'INPUT', type: 'text' }, 1000, 0), 'digitando: fica'); ok(HX.shouldReleaseFocus({ tagName: 'INPUT', type: 'text' }, 3000, 0), 'parou: solta'); }
  { var d = new HX.Doc(); ok(!HX.schBlocked(d, 'conn'), 'esquema aceita'); d.p.sheets.push({ name: 'F', kind: 'phys', items: [] }); d.sheet = 1; ok(HX.isPhys(d.cur()) ? HX.schBlocked(d, 'conn') && !HX.schBlocked(d, 'pnote') : true, 'físico barra conector'); }
});
test('pincel de formatação em qualquer item: mesmo tipo copia tudo, outro tipo só a aparência', function () {
  var d = new HX.Doc(), a = d.add(HX.makeConn(d, 'MS5015:14S-6', 0, 0)), b = d.add(HX.makeConn(d, 'MS5015:14S-6', 60, 0));
  a.uFill = '#ffffff'; a.uGnd = 'earth'; a.sCol = '#ff0000'; b.uFill = '#ececec';
  var br = HX.ops.pickFormat(a); eq(HX.ops.applyFormat(d, [b], br), 1); eq([b.uFill, b.uGnd, b.sCol], ['#ffffff', 'earth', '#ff0000']); ok(b.uChev === undefined, 'vazio na origem limpa no destino');
  var t = d.add({ type: 'text', id: 'tx', text: 'A', x: 0, y: 0, size: 3 }); HX.ops.applyFormat(d, [t], br); eq(t.sCol, '#ff0000', 'outro tipo: só aparência'); ok(t.uFill === undefined);
  var w = { type: 'wire', id: 'w1', pts: [], gauge: '20', color: 'RD', wtype: 'M22759/16' }, w2 = { type: 'wire', id: 'w2', pts: [], gauge: '22', color: 'WH' }; d.add(w); d.add(w2);
  HX.ops.applyFormat(d, [w2], HX.ops.pickFormat(w)); eq([w2.gauge, w2.color, w2.wtype], ['20', 'RD', 'M22759/16']); ok(/20 AWG/.test(HX.brushText(HX.ops.pickFormat(w))));
  var s1 = { type: 'pseg', id: 's1', cover: 'cov_shrink', coverTxt: 'DR-25', under: 'cov_braid' }, s2 = { type: 'pseg', id: 's2' }; HX.ops.applyFormat(d, [s2], HX.ops.pickFormat(s1)); eq([s2.cover, s2.coverTxt, s2.under], ['cov_shrink', 'DR-25', 'cov_braid'], 'ramo do físico');
});
