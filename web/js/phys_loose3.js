/* HarnessCAD - feixe sem capa COMPACTO e com EFEITO DE AMARRAÇÃO.
   Os fios não ficam "planificados" (fita larga): o feixe tem a largura de um feixe real (Ø do chicote, levemente
   exagerado), os fios se sobrepõem como num cabo redondo (desenhados de fora para dentro, os do meio por cima) e
   ESTRANGULAM onde há amarração: abraçadeira, P-clip e ilhós apertam (~40%), fita e luva termo-retrátil da etiqueta
   apertam ao longo do comprimento. A abraçadeira é desenhada na largura apertada. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function ss(x) { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }
  HX.physWirePitch = function (sh, BU) {
    if (+sh.wirePitch > 0) return +sh.wirePitch; if (BU._pitch) return BU._pitch;
    var mx = 1, od = 0; Object.keys(BU.seg).forEach(function (k) { var b = BU.seg[k]; mx = Math.max(mx, b.wires.length); od = Math.max(od, b.od || 0); });
    return (BU._pitch = Math.max(0.24, Math.min(0.5, HX.bundleW(od) * 1.15 / mx)));
  };
  HX.physWireLW = function (sh, BU) { return Math.max(0.3, HX.physWirePitch(sh, BU) * 1.5); };
  HX.PINCH = { tie: 0.58, pclip: 0.62, grommet: 0.66, tape: 0.78, ptag: 0.74, b_tie: 0.58, b_lace: 0.7, b_lacec: 0.84, b_tape: 0.84 };
  // fator de aperto que um acessório dá no feixe sem capa (para desenhar a abraçadeira/luva na largura apertada)
  HX.physPinchK = function (sg, sh, kind) { return HX.physLooseOf(sg, sh) ? HX.PINCH[kind] || 1 : 1; };
  function proj(P, pt) { // comprimento de arco do ponto mais próximo de pt na polilinha P
    var best = 1e9, sb = 0, acc = 0; for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-9, t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * dx + (pt[1] - a[1]) * dy) / l2));
      var x = a[0] + dx * t, y = a[1] + dy * t, d = Math.hypot(pt[0] - x, pt[1] - y), l = Math.sqrt(l2); if (d < best) { best = d; sb = acc + t * l; } acc += l;
    }
    return sb;
  }
  HX.physPinchFn = function (sg, Pt, C, BU) {
    var sh = C.sh, N = C.N, W = HX.physVisW(sg, sh, BU), L = [];
    sh.items.forEach(function (it) {
      if (it.seg !== sg.id || (it.type !== 'pacc' && it.type !== 'ptag')) return; var K = it.type === 'ptag' ? 'ptag' : it.kind, k = HX.PINCH[K]; if (!k) return;
      var A = HX.physAccAt(it, sh, C.m, N); if (!A) return;
      var half = K === 'ptag' || K === 'tape' ? Math.max(1.2, (+it.len || (K === 'ptag' ? 25 : 25)) / N / 2) : 0.4;
      L.push({ s: proj(Pt, A.pt), h: half, k: k, w: Math.max(1.2, W * 0.45) });
    });
    var bp = HX.physBindParams(sg, sh), P0 = sg._P, base = null; // amarração do ramo: pontos apertam como abraçadeira; contínua aperta tudo
    if (bp.kind && P0) { var Lr = HX.physSegLen(sg, C.m, N) || 1, kk = HX.PINCH['b_' + bp.kind] || 1;
      if (bp.step > 0 && bp.kind !== 'lacec') HX.physBindMarks(Lr, bp.step, bp.end).forEach(function (x) { L.push({ s: proj(Pt, HX.polyAt(P0, Math.max(0, Math.min(1, x / Lr))).pt), h: 0.4, k: kk, w: Math.max(1.2, W * 0.45) }); });
      else { var e = Math.min(bp.end, Lr / 2) / Lr, s0 = proj(Pt, HX.polyAt(P0, e).pt), s1 = proj(Pt, HX.polyAt(P0, 1 - e).pt); L.push({ s: (s0 + s1) / 2, h: Math.abs(s1 - s0) / 2, k: kk, w: 1.5 }); } }
    if (!L.length) return null;
    return function (s) { var f = 1; L.forEach(function (q) { var d = Math.max(0, Math.abs(s - q.s) - q.h); f = Math.min(f, q.k + (1 - q.k) * ss(d / q.w)); }); return f; };
  };
  // ordem de desenho: de fora para dentro (os fios do meio por cima, aparência de feixe redondo)
  HX.physLooseSort = function (seen, geo) {
    function dep(w) { var r = 0; Object.keys(geo).forEach(function (id) { var S = geo[id], i = S.ws.indexOf(w); if (i >= 0) r = Math.max(r, Math.abs(i - (S.n - 1) / 2) / Math.max(1, S.n)); }); return r; }
    return seen.map(function (w) { return [w, dep(w)]; }).sort(function (a, b) { return b[1] - a[1]; }).map(function (x) { return x[0]; });
  };
})(typeof window !== 'undefined' ? window : globalThis);
