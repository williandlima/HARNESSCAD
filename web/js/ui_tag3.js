/* HarnessCAD - painel da etiqueta (padrão da casa): as cotas TIP. já são cotas livres separadas (padrão) — cada uma se
   edita clicando nela (texto, tolerância +/−, afastamento, posição do texto, tamanho). "Refazer cotas" volta ao padrão. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.tagSplitDims) return;
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app) || ''; if (it.type !== 'ptag' || it.style !== 'etiqtr') return h;
    var n = app.doc.cur().items.filter(function (q) { return q.type === 'pdimx' && q.a && q.a.of === it.id && q.a.k; }).length;
    return h + '<h4>Cotas da etiqueta</h4><p class="muted">' + (n ? n + ' cotas separadas: clique em cada cota no desenho para editar texto, tolerância (+/−), afastamento e posição do texto (vazio = automático, sem conflito).' :
      'Sem cotas.') + '</p><div class="row"><button id="tgReset" style="flex:1" title="Apaga as cotas desta etiqueta e cria de novo no padrão">Refazer cotas (padrão)</button></div>';
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); var b = root.querySelector('#tgReset'); if (!b) return;
    b.onclick = function () { app.doc.change('Refazer cotas da etiqueta', function () { HX.tagResetDims(app.doc, it); }); app.view.redraw(); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
