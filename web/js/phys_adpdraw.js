/* HarnessCAD - TRAÇO dos adaptadores Amphenol M85049 sem figura até aqui: /60-1 e /69 (p/ bota), /26 e /20 (anel de
   crimpagem), /82 e /88 (band lock) — vista externa do catálogo Backshells (pp. 543–545 e 498–500). Mesma figura para todas
   as carcaças; medidas da tabela: porca Ø A, traseira pelo Ø de saída da tabela de cada tipo (D, C, E ou G), comprimento
   B/L; os degraus intermediários ficam proporcionais entre os dois raios (sem inverter diâmetros). */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC, PDS = HX.PDS, F = HX.ADPV; if (!V || !PDS || !F) return;
  var J = [8, 10, 12, 14, 16, 18, 20, 22, 24], L = [9, 11, 13, 15, 17, 19, 21, 23, 25];
  var REAR = { adp60: [J, [13.54, 15.37, 19.66, 21.29, 24.46, 26.47, 30.91, 34.42, 36.65]], adp69: [L, [13.54, 15.37, 19.66, 21.29, 23.77, 26.47, 30.91, 34.42, 36.65]],
    adp26: [J, [8.81, 12.7, 12.95, 16.0, 19.3, 22.61, 25.65, 28.7, 30.48]], adp20: [L, [8.81, 12.65, 12.95, 16.0, 19.3, 22.61, 25.65, 28.7, 30.53]],
    adp82: [J, [14.22, 16.0, 19.05, 22.61, 24.13, 27.18, 28.07, 32.0, 33.53]], adp88: [L, [14.22, 16.0, 19.05, 22.61, 24.13, 27.18, 28.07, 32.0, 33.53]] };
  var P0 = {};
  function segs(id) { return P0[id] || (P0[id] = F[id].s.split('|').map(function (t) { return { t: t[0], p: t.slice(1).split(' ').map(function (q) { var a = q.split(','); return [+a[0] / 100, +a[1] / 100]; }) }; })); }
  Object.keys(REAR).forEach(function (id) {
    var d = PDS[id], f = F[id], S = REAR[id][0], RR = REAR[id][1]; if (!d || !f) return;
    V[id] = function (g, x, y, W, H) {
      var Lm = d.L(), A = H / W * Lm, i = 0, b = 1e9; S.forEach(function (s, j) { var e = Math.abs(d.H(s) - A); if (e < b) { b = e; i = j; } });
      var k = W / Lm, c = y + H / 2, st = HX.physVecST() || { col: '#222' }, ra = d.H(S[i]) / 2, rb = RR[i] / 2;
      function R(v) { var a = Math.abs(v), r = a <= f.rr ? a * rb / f.rr : rb + (a - f.rr) * (ra - rb) / (f.rn - f.rr); return (v < 0 ? -r : r) * k; }
      function X(u) { return x + u * Lm / f.L * k; }
      [1, -1].forEach(function (m) { segs(id).forEach(function (s) { var Q = s.p.map(function (q) { return [X(q[0]), c + m * R(q[1])]; });
        if (s.t === 'f') { g.style({ stroke: st.col, lw: 0.05, fill: st.col, dash: null }); g.poly(Q, true); } else { g.style({ stroke: st.col, lw: s.t === 'o' ? 0.25 : 0.1, fill: null, dash: null }); g.poly(Q, false); } }); });
      g.style({ fill: null }); if (HX.vaAxis) HX.vaAxis(g, x - 1, x + W + 1, c);
    };
    if (HX.DS_OK) HX.DS_OK.pecas[id] = 1;
  });
})(typeof window !== 'undefined' ? window : globalThis);
