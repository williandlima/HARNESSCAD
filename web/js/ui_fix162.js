/* HarnessCAD - ajustes de uso (v1.6.2): vista frontal sem descrição (opcional) e girável — tecla R gira 90° vista,
   nota e imagem no desenho físico; campo Rotação; cota da etiqueta a partir da borda do conector (ou do nó). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, T = HX.Tools.prototype, ROT = { pface: 1, pnote: 1, pimg: 1 };
  var x0 = T.xform;
  T.xform = function (kind) {
    var doc = this.doc, sel = doc && HX.isPhys(doc.cur()) ? doc.selected().filter(function (i) { return ROT[i.type]; }) : [];
    if (kind !== 'rot' || !sel.length) return x0.apply(this, arguments);
    doc.change('Girar 90°', function () { sel.forEach(function (i) { i.rot = (((+i.rot || 0) + 90) % 360 + 360) % 360; }); });
    if (sel.length < doc.selected().length) return x0.apply(this, arguments);
  };
  var ff = EXT.pface.fields;
  EXT.pface.fields = function (it, doc) {
    return ff(it, doc).concat([{ k: 'rot', l: 'Rotação (°)', type: 'number', step: 15, tip: 'Tecla R gira 90°' },
      { k: 'desc', l: 'Descrição', type: 'select', opts: [['', 'Sem descrição'], ['on', 'Mostrar "VISTA FRONTAL …"']] }]);
  };
  var tf = EXT.ptag.fields;
  EXT.ptag.fields = function (it, doc) {
    return tf(it, doc).concat([{ k: 'dimFrom', l: 'Cota a partir de', type: 'select', opts: [['', 'Borda do conector (mais próxima)'], ['node', 'Centro / nó do ramo']], tip: 'Arraste a linha da cota para afastá-la do ramo' }]);
  };
})(typeof window !== 'undefined' ? window : globalThis);
