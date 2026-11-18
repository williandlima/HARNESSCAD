/* HarnessCAD - painel da etiqueta (padrão da casa): botão "Separar cotas" — as cotas TIP. viram cotas livres, cada uma
   editável individualmente (selecionar, arrastar, texto, tolerância, afastamento, posição do texto). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.tagSplitDims) return;
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app) || ''; if (it.type !== 'ptag' || it.style !== 'etiqtr') return h;
    return h + (it.dim !== false ? '<div class="row"><button id="tgSplit" style="flex:1" title="Cada cota vira uma cota livre presa à etiqueta: selecione e edite uma a uma">Separar cotas (editar cada uma)</button></div>' :
      '<p class="muted">Cotas TIP. desligadas: se foram separadas, cada uma é uma cota livre (clique nela para editar).</p>');
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); var b = root.querySelector('#tgSplit'); if (!b) return;
    b.onclick = function () { var n = []; app.doc.change('Separar cotas da etiqueta', function () { n = HX.tagSplitDims(app.doc, it); });
      app.view.redraw(); UI.toast(n.length ? n.length + ' cotas livres criadas — clique em cada uma para editar.' : 'Desenhe a folha antes (etiqueta ainda sem posição).', !n.length); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
