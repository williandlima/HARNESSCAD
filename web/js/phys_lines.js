/* HarnessCAD - FEIXE EM LINHAS (padrão das pranchas da casa): nos modelos de traço o ramo sem capa é desenhado como
   poucas linhas finas paralelas na cor da caneta (4 fios representativos, espalhados pela largura do feixe), seguindo
   o mesmo traçado, curvas, derivações e afunilamento no conector dos fios aparentes. Folha: bundleLook
   '' automático (traço/contorno = linhas) | 'lines' sempre linhas | 'fios' um traço por fio na cor do fio. */
(function (G) {
  'use strict';
  var HX = G.HX, ST = null;
  HX.physLinesLook = function (sh) { var v = sh && sh.bundleLook; return v === 'lines' || (!v && !!sh && (sh.pstyle === 'line' || sh.pstyle === 'outline')); };
  HX.physLooseSeen = function (seen, sh, C) {
    ST = null; if (!HX.physLinesLook(sh) || !seen.length) return;
    var L = Math.min(+sh.bundleLines || 4, seen.length), pick = [];
    for (var k = 0; k < L; k++) pick.push(seen[L === 1 ? 0 : Math.round(k * (seen.length - 1) / (L - 1))]);
    ST = { pick: pick, col: C && C.line ? C.col : '#111111' };
  };
  HX.physStrokeWire = function (g, Q, w) {
    if (!ST) return false; if (ST.pick.indexOf(w) < 0) return true;
    g.style({ stroke: ST.col, lw: 0.18, fill: null, dash: null }); g.poly(Q, false); return true;
  };
})(typeof window !== 'undefined' ? window : globalThis);
