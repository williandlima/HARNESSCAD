/* HarnessCAD - interface moderna: busca de comandos (Ctrl+K), recentes da tela inicial, ícones e definição da faixa */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok, fs = L.fs, path = L.path, vm = require('vm');
var ctx = { console: console, HX: HX }; ctx.globalThis = ctx; vm.createContext(ctx);
HX.UI = HX.UI || {}; HX.App = HX.App || function () {};
['ui_icons', 'ui_ribbon_def', 'ui_ribbon2', 'ui_start'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'web', 'js', f + '.js'), 'utf8'), ctx, { filename: f }); });
test('busca de comandos: todas as palavras, sem acento, começo do rótulo primeiro', function () {
  var L0 = [{ t: 'Exportar BOM (CSV)', g: 'Arquivo', k: '' }, { t: 'Lista de materiais', g: 'Relatórios', k: '' }, { t: 'BOM', g: 'Fio', k: 'x', item: 1 }, { t: 'Verificação elétrica (ERC)', g: 'Ferramentas', k: 'F2' }];
  eq(HX.cmdMatch('bom', L0).map(function (c) { return c.t; }), ['BOM', 'Exportar BOM (CSV)'], 'ordem');
  eq(HX.cmdMatch('verificacao eletrica', L0).length, 1, 'sem acento'); eq(HX.cmdMatch('f2', L0)[0].t, 'Verificação elétrica (ERC)', 'pelo atalho');
  eq(HX.cmdMatch('', L0).length, 4, 'vazio lista tudo'); eq(HX.cmdMatch('xyz', L0).length, 0, 'nada');
});
test('recentes: mais novo em cima, sem repetir, no máximo 12', function () {
  var r = []; for (var i = 0; i < 15; i++) r = HX.recentAdd(r, { name: 'P' + i }); eq(r.length, 12); eq(r[0].name, 'P14');
  r = HX.recentAdd(r, { name: 'P5' }); eq(r[0].name, 'P5'); eq(r.filter(function (x) { return x.name === 'P5'; }).length, 1);
});
test('faixa de opções: abas, contextual do desenho físico e ícones para todos os comandos', function () {
  var tabs = HX.RIBBON.map(function (t) { return t[0]; });
  ['Início', 'Inserir', 'Editar', 'Exibir', 'Ferramentas', 'Relatórios', 'Ajuda', 'Desenho físico'].forEach(function (t) { ok(tabs.indexOf(t) >= 0, t); });
  ok(HX.RIBBON.filter(function (t) { return t[2] === 'ctx'; })[0][0] === 'Desenho físico', 'aba contextual');
  HX.RIBBON.forEach(function (T) { T[1].forEach(function (g) { g[1].forEach(function (e) { ok(/^\*?(e|m|u|d):/.test(e), 'entrada ' + e); }); }); });
  ['Novo projeto', 'Salvar', 'Imprimir / PDF…', 'Verificação elétrica (ERC)', 'Gerar desenho físico…', 'select', 'wire', 'tab_bom'].forEach(function (n) { ok(HX.uiIcon(n) !== HX.uiIcon('???'), 'ícone ' + n); });
  ok(Object.keys(HX.RIBBON_LBL).length >= 25, 'rótulos curtos');
});
