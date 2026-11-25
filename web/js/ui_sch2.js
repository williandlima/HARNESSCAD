/* HarnessCAD - ESQUEMA À MÃO (v1.9.12): "Ocultar pinos sem uso" / "Mostrar todos os pinos" nas ações do conector
   (barra "Editar conector", clique direito, Propriedades — antes só no fundo das Propriedades) e, em Exibir, as chaves
   "Marcar pinos livres" (bolinha de ponta solta) e "Número dos fios na impressão" (PDF/DXF com o nº; tela limpa). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI) return;
  var ia0 = HX.itemActions;
  if (ia0) HX.itemActions = function (app, it) { var E = ia0.apply(this, arguments); if (!it || it.type !== 'conn' || HX.isPhys(app.doc.cur())) return E; var doc = app.doc, ops = HX.ops;
    var some = (it.hidden || []).length > 0, add = [['Ocultar pinos sem uso', function () { var nl = app.view.netlist(); doc.change('Ocultar pinos sem uso', function () { ops.keepWires(doc, [it.id], function () { ops.hideUnused(doc, it, nl); }); }); app.view.redraw(); }]];
    if (some) add.push(['Mostrar todos os pinos (' + it.hidden.length + ' ocultos)', function () { doc.change('Mostrar pinos', function () { ops.keepWires(doc, [it.id], function () { it.hidden = []; }); }); app.view.redraw(); }]);
    var i = E.indexOf('-'); E.splice(i > 0 ? i : E.length, 0, add[0]); if (add[1]) E.splice((i > 0 ? i : E.length - 1) + 1, 0, add[1]); return E; };
  function tog(app, k, on, off) { var v = app.doc.p.view || (app.doc.p.view = {}), nv = !v[k]; app.doc.change(nv ? on : off, function () { v[k] = nv; }); app.view.redraw(); UI.toast(nv ? on : off, false, 1600); }
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Marcar pinos livres (bolinha)', function () { tog(app, 'openPins', 'Pinos livres marcados com bolinha', 'Pinos livres sem marcador'); }, '']; }],
    ['Exibir', function (app) { return ['Número dos fios na impressão (PDF/DXF)', function () { tog(app, 'printWireNums', 'PDF/DXF sai com o número de cada fio', 'PDF/DXF sem o número dos fios ocultos'); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
