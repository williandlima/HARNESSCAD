/* HarnessCAD - carregador dos últimos scripts (o index.html está no limite de tamanho): novos arquivos entram nesta
   lista, na ordem; tests/lib.js lista os que não são de interface (phys_*). */
(function (G) {
  'use strict';
  var L = G.HX_MAIS = ['ui_bomedit', 'phys_tag4', 'ui_tag3', 'phys_detl', 'phys_detl2', 'phys_detl3', 'phys_detc', 'phys_detc1', 'phys_detc2', 'phys_detc3', 'phys_detc4', 'phys_detc5', 'phys_table4', 'phys_table5', 'wiretext', 'wiretext2', 'wiretext3', 'cat_splice', 'splice_tab', 'splice_sel', 'ui_detc', 'ui_wirelist', 'ui_splice', 'pinorder', 'ui_pinorder', 'cat_cable', 'ui_cable', 'ui_actions', 'ui_icons2', 'ui_active', 'ui_active2', 'ui_layout2', 'ui_flow', 'pinname', 'ui_pinname', 'cat_cable2', 'ui_cable2', 'wiretext4', 'wirelen', 'ui_wirelen', 'ui_edit3', 'ui_cabspec'];
  if (G.document && G.document.write) L.forEach(function (f) { G.document.write('<script src="js/' + f + '.js"><\/script>'); });
})(typeof window !== 'undefined' ? window : globalThis);
