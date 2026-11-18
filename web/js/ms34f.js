/* HarnessCAD - carrega as VISTAS FRONTAIS MIL-DTL-26482 Série 2 (ms34f1..4.js) e o traço dos receptáculos (ms34r.js), do catálogo Amphenol Matrix. Um
   carregador só, para o index.html não crescer; tests/lib.js lista os arquivos na mesma ordem. */
(function (G) {
  'use strict';
  var L = G.HX_MS34F = ['ms34f1', 'ms34f2', 'ms34f3', 'ms34f4', 'ms34r'];
  if (G.document && G.document.write) L.forEach(function (f) { G.document.write('<script src="js/' + f + '.js"><\/script>'); });
})(typeof window !== 'undefined' ? window : globalThis);
