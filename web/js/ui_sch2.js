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
  /* medida até outro conector (sem clicar no desenho): escolhe o outro e digita os mm */
  UI.dimTo = function (app, A) { var doc = app.doc, O = doc.items().filter(function (i) { return (i.type === 'conn' || i.type === 'splice') && i !== A; }); if (!O.length) return UI.toast('Não há outro conector na folha.', true);
    var h = '<div class="row"><label>Até</label><select id="dtB">' + O.map(function (i) { return '<option value="' + HX.esc(i.id) + '">' + HX.esc(i.ref || i.id) + '</option>'; }).join('') + '</select></div>' +
      '<div class="row"><label>Medida (mm)</label><input id="dtL" type="number" step="1" style="width:100px"></div><div class="muted" style="font-size:11px">Comprimento do chicote entre os dois. Com desenho físico, o ramo acompanha.</div>';
    UI.modal('Medida a partir de ' + (A.ref || ''), h, [{ t: 'Cancelar' }, { t: 'Colocar medida', pri: true, fn: function (dl) { var B = doc.find(UI.$('#dtB', dl.el).value), L = UI.$('#dtL', dl.el).value;
      if (!(parseFloat(L) > 0)) { UI.toast('Digite a medida em mm.', true); return false; } doc.change('Medida ' + A.ref + '–' + B.ref, function () { HX.dimAdd(doc, A, B, L); }); app.view.redraw(); } }]); };
  var ia1 = HX.itemActions;
  if (ia1) HX.itemActions = function (app, it) { var E = ia1.apply(this, arguments); if (!it || it.type !== 'conn' || HX.isPhys(app.doc.cur()) || !HX.dimAdd) return E;
    E.splice(typeof E[0] === 'string' ? 1 : 0, 0, ['Medida até outro conector…', function () { UI.dimTo(app, it); }]); return E; };
  function tog(app, k, on, off) { var v = app.doc.p.view || (app.doc.p.view = {}), nv = !v[k]; app.doc.change(nv ? on : off, function () { v[k] = nv; }); app.view.redraw(); UI.toast(nv ? on : off, false, 1600); }
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Marcar pinos livres (bolinha)', function () { tog(app, 'openPins', 'Pinos livres marcados com bolinha', 'Pinos livres sem marcador'); }, '']; }],
    ['Exibir', function (app) { return ['Número dos fios na impressão (PDF/DXF)', function () { tog(app, 'printWireNums', 'PDF/DXF sai com o número de cada fio', 'PDF/DXF sem o número dos fios ocultos'); }, '']; }]);
})(typeof window !== 'undefined' ? window : globalThis);
