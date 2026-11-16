/* HarnessCAD - carrega as imagens embutidas em web/js/imgpack (vêm prontas no pacote; geradas de web/img por
   ferramentas/embutir_imagens.py ou HarnessCAD.exe /embutir). Imagem vinda de data: não "suja" o canvas, então o PDF
   consegue ler os pixels mesmo com o index.html aberto direto do disco. Sem o pacote, as imagens vêm de web/img. */
(function (G) {
  'use strict';
  if (!G.document || !G.HX_IMGPACK || !G.HX_IMGPACK.length) return;
  G.HX_IMGPACK.forEach(function (f) { G.document.write('<script src="js/imgpack/' + f + '"><\/script>'); });
  // se o navegador ignorou o document.write, carrega pelo DOM (em ordem) e redesenha
  G.addEventListener('DOMContentLoaded', function () {
    if (G.HX_IMG) return; var i = 0;
    (function next() { if (i >= G.HX_IMGPACK.length) { if (G.HX && G.HX.imgPreload) G.HX.imgPreload(); return; } var s = G.document.createElement('script'); s.src = 'js/imgpack/' + G.HX_IMGPACK[i++]; s.onload = s.onerror = next; G.document.head.appendChild(s); })();
  });
})(typeof window !== 'undefined' ? window : globalThis);
