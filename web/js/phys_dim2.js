/* HarnessCAD - desenho físico: COTAS que mostram e DEFINEM o chicote.
   • Nº de fios na cota (como no esquemático): cota do ramo = fios do ramo; cota do caminho = fios que percorrem o
     caminho todo (entre os dois nós). Abaixo da linha de cota: "10 fios". Campo da cota: hideCount = ocultar.
   • Valor digitado na cota define o comprimento: cota do ramo → comprimento do ramo; cota do caminho → os ramos do
     caminho são reescalados proporcionalmente (o último fecha a soma). Se folha.dimRedraw !== false, o desenho é
     redesenhado em escala (os nós andam). Cortes e lista de materiais acompanham. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function bun(C, p) { if (!C._bunD) HX.physHide(C, '_bunD', HX.physBundle(p, C.sh)); return C._bunD; }
  HX.physDimWires = function (it, C, p) {
    var B = bun(C, p), sg = it.seg && C.m[it.seg];
    if (it.mode === 'seg' && sg) return (B.seg[sg.id] || { wires: [] }).wires;
    if (it.mode !== 'path') return null;
    var r = HX.physPathLen(C.sh, it.a, it.b); if (!r || !r.segs || !r.segs.length) return null;
    var ids = r.segs.map(function (x) { return x.id || (x.s && x.s.id) || x; });
    var first = (B.seg[ids[0]] || { wires: [] }).wires;
    return first.filter(function (w) { return ids.every(function (id) { return (B.seg[id] || { wires: [] }).wires.indexOf(w) >= 0; }); });
  };
  var dv = HX.physDimValue;
  HX.physDimValue = function (it, C, p) {
    var V = dv(it, C, p); if (it.hideCount || it.text || V.v == null || !p) return V;
    var W = HX.physDimWires(it, C, p); if (W && W.length) V.sub = W.length + (W.length > 1 ? ' fios' : ' fio');
    return V;
  };
  // define o valor da cota (mm reais)
  HX.physDimSet = function (sh, it, v) {
    v = Math.round(parseFloat(String(v).replace(',', '.'))); if (!(v > 0)) return 'Valor inválido.';
    var m = HX.physIdx(sh), N = +sh.scale || 1, sg = it.seg && m[it.seg];
    if (it.mode === 'seg' && sg) sg.len = v;
    else if (it.mode === 'path') {
      var r = HX.physPathLen(sh, it.a, it.b); if (!r || !r.segs || !r.segs.length) return 'Sem caminho entre os nós.';
      var S = r.segs.map(function (x) { return m[x.id || (x.s && x.s.id) || x]; }).filter(Boolean), L = S.map(function (s) { return HX.physSegLen(s, m, N); }), T = L.reduce(function (a, b) { return a + b; }, 0) || 1, acc = 0;
      S.forEach(function (s, i) { var n = i === S.length - 1 ? v - acc : Math.max(1, Math.round(L[i] * v / T)); s.len = n; acc += n; });
    } else return 'Cota livre: mude o valor arrastando os nós (ou use cota do ramo/caminho).';
    if (sh.dimRedraw !== false && HX.physRedrawScale) HX.physRedrawScale(sh);
    return '';
  };
})(typeof window !== 'undefined' ? window : globalThis);
