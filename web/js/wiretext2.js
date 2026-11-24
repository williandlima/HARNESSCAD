/* HarnessCAD - LISTA DE FIAÇÃO EM TEXTO (roteador): registro dos fios da folha (trechos verticais, horizontais e pontas)
   e as verificações que impedem um fio novo de ENCOSTAR em outro (encostar numa ponta/dobra ou correr por cima de um
   trecho = ligar as redes). Rota de contorno (destino que não está de frente): pista própria por baixo ou por cima dos
   conectores, escolhida livre. O desenho da lista fica em wiretext3.js. */
(function (G) {
  'use strict';
  var HX = G.HX, E = 1e-6;
  HX.wtRouter = function (sh, g) {
    var R = { V: [], H: [], PT: [] };
    R.reg = function (w) { w.pts.forEach(function (q) { R.PT.push(q); }); for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i];
      if (Math.abs(a[0] - b[0]) < E) R.V.push([a[0], Math.min(a[1], b[1]), Math.max(a[1], b[1])]); else if (Math.abs(a[1] - b[1]) < E) R.H.push([a[1], Math.min(a[0], b[0]), Math.max(a[0], b[0])]); } };
    R.rebuild = function () { R.V = []; R.H = []; R.PT = []; sh.items.forEach(function (w) { if (w.type === 'wire') R.reg(w); }); };
    R.clearH = function (y, xa, xb) { var lo = Math.min(xa, xb), hi = Math.max(xa, xb); return !R.PT.some(function (q) { return Math.abs(q[1] - y) < E && q[0] > lo + E && q[0] < hi - E; }); };
    /* coluna do barramento: sem vertical sobreposto (com folga), sem ponta no caminho, saída e derivações sem ponta no meio */
    R.free = function (x, y0, y1, s, T) { return !R.V.some(function (v) { return Math.abs(v[0] - x) < 0.5 && v[1] <= y1 + g * 0.5 && v[2] >= y0 - g * 0.5; }) &&
      !R.PT.some(function (q) { return Math.abs(q[0] - x) < E && q[1] >= y0 - E && q[1] <= y1 + E; }) && R.clearH(s[1], s[0], x + (x > s[0] ? 1e-3 : -1e-3)) && T.every(function (t) { return R.clearH(t.q.pt[1], x, t.q.pt[0]); }); };
    /* caminho genérico livre: nenhum trecho corre sobre outro, nenhuma ponta alheia no meio, nenhuma dobra nova sobre fio alheio */
    function onSeg(q, L, vert) { return L.some(function (v) { return Math.abs((vert ? q[0] : q[1]) - v[0]) < E && (vert ? q[1] : q[0]) >= v[1] - E && (vert ? q[1] : q[0]) <= v[2] + E; }); }
    R.ok = function (P) { var s = P[0], t = P[P.length - 1], i;
      function endOnly(a, b, lo, hi, vert) { if (hi - lo > E) return false; var q = vert ? [a, lo] : [lo, a]; return Math.abs(q[0] - s[0]) < E && Math.abs(q[1] - s[1]) < E || Math.abs(q[0] - t[0]) < E && Math.abs(q[1] - t[1]) < E; }
      for (i = 1; i < P.length; i++) { var a = P[i - 1], b = P[i], vert = Math.abs(a[0] - b[0]) < E, k = vert ? a[0] : a[1], lo = vert ? Math.min(a[1], b[1]) : Math.min(a[0], b[0]), hi = vert ? Math.max(a[1], b[1]) : Math.max(a[0], b[0]);
        if ((vert ? R.V : R.H).some(function (v) { if (Math.abs(v[0] - k) > E) return false; var l = Math.max(lo, v[1]), h = Math.min(hi, v[2]); return h >= l - E && !endOnly(k, 0, l, h, vert); })) return false;
        if (R.PT.some(function (q) { var c = vert ? q[0] : q[1], m = vert ? q[1] : q[0]; return Math.abs(c - k) < E && m > lo + E && m < hi - E; })) return false; }
      for (i = 1; i < P.length - 1; i++) if (onSeg(P[i], R.V, true) || onSeg(P[i], R.H, false)) return false;
      return true; };
    /* contorno: sai do pino, desce (ou sobe) além dos dois conectores numa pista livre e entra pelo lado do outro pino */
    R.around = function (s, d, bA, t, e, bB) { for (var k = 0; k < 40; k++) for (var side = 1; side >= -1; side -= 2) { var off = g * (2 + k), ea = HX.snap(s[0] + d * off, g), eb = HX.snap(t[0] + e * off, g);
      var ym = side > 0 ? HX.snap(Math.max(bA.y1, bB.y1) + off, g) : HX.snap(Math.min(bA.y0, bB.y0) - off, g), P = HX.cleanPts([s, [ea, s[1]], [ea, ym], [eb, ym], [eb, t[1]], t]); if (R.ok(P)) return P; }
      return null; };
    R.rebuild(); return R;
  };
})(typeof window !== 'undefined' ? window : globalThis);
