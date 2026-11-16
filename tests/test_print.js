/* HarnessCAD - impressão personalizável */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
function pages(bytes) { var s = typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('latin1'); return (s.match(/\/Type \/Page\b(?!s)/g) || []).length; }
function txt(bytes) { return typeof bytes === 'string' ? bytes : Buffer.from(bytes).toString('latin1'); }
function proj() {
  var s = L.setup(), d = s.d; d.p.sheets.push({ id: 's2', name: 'Folha 2', items: [] });
  HX.ops.addWire(d, [s.A[0].pt, [s.A[0].pt[0] + 20, s.A[0].pt[1]], [s.A[0].pt[0] + 20, s.B[0].pt[1]], s.B[0].pt]);
  return d.p;
}
function only(p, ids) { var c = HX.printDefault(p); c.sections.forEach(function (s) { s.on = ids.indexOf(s.id) >= 0; }); return c; }
test('cada seção pode sair sozinha no PDF', function () {
  var p = proj();
  HX.PRINT_SECTIONS.forEach(function (s) { var b = HX.exportPDF(p, only(p, [s.id])); ok(pages(b) >= 1, s.id); });
  eq(pages(HX.exportPDF(p, only(p, ['sheets']))), 2);
});
test('escolher folhas: só a folha 2', function () {
  var p = proj(), c = only(p, ['sheets']); c.sections.filter(function (s) { return s.id === 'sheets'; })[0].sheets = [1];
  eq(pages(HX.exportPDF(p, c)), 1);
});
test('ordem das seções e colunas escolhidas', function () {
  var p = proj(), c = only(p, ['bom', 'wirelist']);
  c.sections.sort(function (a, b) { return a.id === 'bom' ? -1 : b.id === 'bom' ? 1 : 0; });
  c.sections.filter(function (s) { return s.id === 'wirelist'; })[0].cols = ['num', 'from', 'to'];
  var t = txt(HX.exportPDF(p, c));
  ok(t.indexOf('LISTA DE MATERIAIS') < t.indexOf('LISTA DE FIOS'), 'BOM antes da lista de fios');
  ok(t.indexOf('(Part number)') >= 0, 'BOM tem part number'); 
  var wl = t.slice(t.indexOf('LISTA DE FIOS')); ok(wl.indexOf('(Bitola)') < 0 && wl.indexOf('(De)') >= 0, 'lista de fios só com as colunas escolhidas');
});
test('índice numera as páginas contando a si mesmo', function () {
  var p = proj(), c = HX.printPreset(p, 'Completo'), t = txt(HX.exportPDF(p, c));
  ok(t.indexOf('NDICE') >= 0, 'tem índice'); ok(pages(HX.exportPDF(p, c)) >= 8);
});
test('predefinições e formato antigo continuam funcionando', function () {
  var p = proj();
  Object.keys(HX.PRINT_PRESETS).forEach(function (n) { ok(pages(HX.exportPDF(p, HX.printPreset(p, n))) >= 1, n); });
  eq(pages(HX.exportPDF(p, { wirelist: false, bom: false })), 2);
  ok(pages(HX.exportPDF(p, { only: 0, wirelist: true, bom: true, pinout: true })) >= 4);
});
test('nada selecionado avisa em vez de gerar PDF vazio', function () {
  var p = proj(), err = ''; try { HX.exportPDF(p, only(p, [])); } catch (e) { err = e.message; } ok(/Nada selecionado/.test(err));
});
