/* HarnessCAD - MEDIDAS DO CONECTOR SÓ PARA CONSULTA. O desenho da cablagem não leva cotas do conector (o foco é a
   cablagem: comprimentos, ramos, notas). No conector selecionado: botão "Consultar medidas do conector" abre uma
   janela com as vistas cotadas pelo datasheet (D-Sub: lateral e frontal; demais: comprimento × Ø de cada peça). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  HX.uiConnDims = function (app, nd) {
    var c = HX.physSchem(app.doc.p)[nd.of]; if (!c) return;
    var box = UI.h('div'), tb = '<table class="tbl" style="margin-top:8px">' + HX.connDimsTable(nd, c).map(function (r) { return '<tr><td>' + HX.esc(r[0]) + '</td><td>' + HX.esc(String(r[1])) + '</td></tr>'; }).join('') + '</table>';
    if (HX.isDsub(c)) {
      var cv = UI.h('canvas', { width: 860, height: 420, style: 'width:860px;max-width:100%;background:#fff;border:1px solid #ccc' }); box.appendChild(cv);
      var ctx = cv.getContext('2d'), probe = { s: 1 }, g0 = new HX.CanvasG(ctx, probe), bb, nul = { style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, text: function () {}, push: function () {}, pop: function () {} };
      bb = HX.connDimsDraw(nul, nd, c, '#000'); var Z = Math.min(860 / (bb.x1 - bb.x0), 420 / (bb.y1 - bb.y0)); probe.s = Z;
      ctx.setTransform(Z, 0, 0, Z, -bb.x0 * Z, -bb.y0 * Z); HX.connDimsDraw(g0, nd, c, '#1d3fa0');
    }
    var t = UI.h('div'); t.innerHTML = tb + '<p class="muted">Só para consulta — estas cotas não vão para o desenho da cablagem.</p>'; box.appendChild(t);
    UI.modal('Medidas do conector ' + (c.ref || ''), box, [{ t: 'Fechar', pri: true }]);
  };
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = ex0(it, app); return it.type === 'pnode' && it.nkind === 'conn' ? h + '<div class="row"><button id="cnDims" style="flex:1">Consultar medidas do conector (datasheet)…</button></div>' : h; };
  UI.propsBind = function (it, app, root, set) { bd0(it, app, root, set); var b = UI.$('#cnDims', root); if (b) b.onclick = function () { HX.uiConnDims(app, it); }; };
})(typeof window !== 'undefined' ? window : globalThis);
