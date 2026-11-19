/* HarnessCAD - carregador dos últimos scripts (o index.html está no limite de tamanho): novos arquivos entram nesta
   lista, na ordem; tests/lib.js lista os que não são de interface (phys_*). */
(function (G) {
  'use strict';
  var L = G.HX_MAIS = ['ui_bomedit', 'phys_tag4', 'ui_tag3', 'phys_cord', 'phys_cord2'];
  if (G.document && G.document.write) L.forEach(function (f) { G.document.write('<script src="js/' + f + '.js"><\/script>'); });
})(typeof window !== 'undefined' ? window : globalThis);
