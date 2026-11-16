/* HarnessCAD - desenho físico: ORDEM LATERAL dos fios aparentes, sem cruzamentos.
   Percorre os ramos a partir de um conector (largura). No ramo raiz a ordem vem do lado para onde cada fio vira na
   outra ponta. Nos demais, cada fio herda a posição que tinha no ramo de onde vem (projetada na normal do ramo novo)
   e os fios que chegam de ramos diferentes ficam agrupados pelo lado de onde chegam; o lado da virada na ponta de
   saída desempata. Par trançado fica junto. Resultado em BU._ord[ramo] (lista de fios na ordem a→b). */
(function (G) {
  'use strict';
  var HX = G.HX;
  function dirOut(sg, id, m) { var P = sg._P || HX.physSegPts(sg, m); if (!P) return [1, 0]; if (sg.b === id) P = P.slice().reverse(); var q = HX.polyAt(P, Math.min(0.5, 2 / (HX.polyLen(P) || 1))).pt, dx = q[0] - P[0][0], dy = q[1] - P[0][1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  function nrm(sg, X, m) { var v = dirOut(sg, X, m), f = sg.a === X ? v : [-v[0], -v[1]]; return [-f[1], f[0]]; } // normal (a→b) no nó X
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
  HX.physLooseOrder = function (sg, sh, C, BU) {
    if (!BU._ord) build(sh, C, BU);
    return BU._ord[sg.id] || (BU.seg[sg.id] || { wires: [] }).wires;
  };
  function build(sh, C, BU) {
    var O = BU._ord = {}, m = C.m, segs = sh.items.filter(function (i) { return i.type === 'pseg'; }), at = {}, done = {};
    segs.forEach(function (s) { (at[s.a] = at[s.a] || []).push(s); (at[s.b] = at[s.b] || []).push(s); });
    function W(s) { return (BU.seg[s.id] || { wires: [] }).wires; }
    function isConn(id) { return m[id] && m[id].nkind === 'conn'; }
    function turn(s, F, w) { // ângulo da virada do fio w na ponta F (positivo = para o lado +normal)
      if (!F || isConn(F)) return 0; var t = (at[F] || []).filter(function (x) { return x !== s && W(x).indexOf(w) >= 0; })[0]; if (!t) return 0;
      var v = dirOut(t, F, m), n = nrm(s, F, m), back = dirOut(s, F, m); return Math.atan2(dot(n, v), -dot(back, v));
    }
    function place(s, X) {
      var n = nrm(s, X, m), F = s.a === X ? s.b : s.a;
      var L = W(s).map(function (w) {
        var pos = 0, src = X && !isConn(X) ? (at[X] || []).filter(function (x) { return x !== s && W(x).indexOf(w) >= 0; })[0] : null;
        if (!src && X && isConn(X) && HX.physPinLat) { var pl = HX.physPinLat(m[X], w, n, C, BU); if (pl != null) pos = pl; }
        if (src) { var d = dirOut(src, X, m); pos = dot(d, n) * 1000; if (O[src.id]) { var os = O[src.id], i = os.indexOf(w); pos += (i - (os.length - 1) / 2) * dot(nrm(src, X, m), n); } }
        return { w: w, pos: pos, k: turn(s, F, w) };
      });
      L.sort(function (x, y) { return (Math.round(x.pos * 20) - Math.round(y.pos * 20)) || (Math.round(x.k * 50) - Math.round(y.k * 50)) || String(x.w.twist || '~').localeCompare(String(y.w.twist || '~')) || HX.natCmp(String(x.w.num), String(y.w.num)); });
      O[s.id] = L.map(function (x) { return x.w; }); done[s.id] = 1;
    }
    var roots = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn'; }).sort(function (a, b) { return a.x - b.x || a.y - b.y; }).map(function (i) { return i.id; });
    roots.concat(segs.map(function (s) { return s.a; })).forEach(function (r) {
      var q = (at[r] || []).filter(function (s) { return !done[s.id]; }).map(function (s) { return [s, r]; });
      while (q.length) {
        var e = q.shift(), s = e[0], X = e[1]; if (done[s.id]) continue; place(s, X);
        var F = s.a === X ? s.b : s.a; (at[F] || []).forEach(function (t) { if (!done[t.id]) q.push([t, F]); });
      }
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
