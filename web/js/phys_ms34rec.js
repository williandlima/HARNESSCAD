/* HarnessCAD - RECEPTÁCULOS MIL-DTL-26482 Série 2 em desenho técnico (traço do catálogo Amphenol Matrix, ms34r.js):
   MS3470 (flange estreito, MB10), MS3471 (de cabo, MB13) e MS3474 (porca, MB14). Forma da figura do catálogo; medidas
   da tabela por carcaça: corpo Ø C, flange A (espessura F exata no MS3470/71), porca K e rosca de fixação J (MS3474),
   rosca de acessório H, gromete Ø D, comprimento 1,405 (carcaças 8–18) / 1,465 (20–24). */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC, PDS = HX.PDS, R = HX.MS34R; if (!V || !PDS || !R) return;
  var SH = [8, 10, 12, 14, 16, 18, 20, 22, 24], IN = 25.4;
  var T = { C: [.471, .588, .748, .873, .998, 1.123, 1.248, 1.373, 1.498], D: [.305, .405, .531, .665, .79, .869, .994, 1.119, 1.244],
    H: [.5, .625, .75, .875, 1, 1.0625, 1.1875, 1.3125, 1.4375], F: [.062, .062, .062, .062, .062, .062, .094, .094, .094], L: [1.405, 1.405, 1.405, 1.405, 1.405, 1.405, 1.465, 1.465, 1.465],
    A: [.828, .954, 1.047, 1.141, 1.234, 1.328, 1.453, 1.578, 1.703], A74: [.954, 1.078, 1.266, 1.391, 1.516, 1.641, 1.828, 1.954, 2.078],
    K: [.767, .892, 1.079, 1.205, 1.329, 1.455, 1.579, 1.705, 1.829], J: [.5625, .6875, .875, 1, 1.125, 1.25, 1.375, 1.5, 1.625] };
  /* figura: comprimento, flange [u0,u1] (espessura F), trechos [u fim, grupo, raio na figura], gromete [u início, raio], rosca (início) */
  var FIG = {
    ms3470: { n: 'MS3470 receptáculo flange estreito (MB10)', p: 8, Lf: 60.86, fl: [23.71, 28.69], g: [[23.71, 'C', 25.4], [28.69, 'A', 32.11], [99, 'H', 22.95]], gr: [50.9, 19.85], th: 33.0, A: 'A' },
    ms3471: { n: 'MS3471 receptáculo de cabo (MB13)', p: 9, Lf: 74.76, fl: [6.91, 11.28], g: [[6.91, 'C', 30.07], [11.28, 'A', 41.23], [41.18, 'C', 30.07], [99, 'H', 30.23]], gr: [62.11, 23.8], th: 41.0, A: 'A' },
    ms3474: { n: 'MS3474 receptáculo porca (MB14)', p: 9, Lf: 83.68, fl: null, g: [[25.72, 'C', 27.36], [31.08, 'J', 28.19], [37.53, 'K', 41.28], [42.74, 'A', 41.72], [99, 'H', 27.4]], gr: [70.0, 22.0], th: 51.5, A: 'A74' } };
  function idx(sh) { var i = SH.indexOf(+sh); return i < 0 ? SH.length - 1 : i; }
  var P0 = {};
  function segs(id) { return P0[id] || (P0[id] = R[id].split('|').map(function (s) { return { t: s[0], p: s.slice(1).split(' ').map(function (q) { var a = q.split(','); return [+a[0] / 100, +a[1] / 100]; }) }; })); }
  Object.keys(FIG).forEach(function (id) {
    var f = FIG[id];
    PDS[id] = { n: f.n, src: 'Amphenol, catálogo Matrix MIL-DTL-26482 Série 2, p. ' + f.p, kind: 'conn', L: function (sh) { return Math.round(T.L[idx(sh)] * IN * 100) / 100; }, H: function (sh) { return Math.round(T[f.A][idx(sh)] * IN * 100) / 100; } };
    V[id] = function (g, x, y, W, H) {
      var ratio = H / W, i = 0, b = 1e9; SH.forEach(function (s, j) { var d = Math.abs(T[f.A][j] / T.L[j] - ratio); if (d < b) { b = d; i = j; } });
      var Lm = T.L[i] * IN, k = W / Lm, c = y + H / 2, st = HX.physVecST() || { col: '#222' }, Fm = f.fl ? T.F[i] * IN : 0, fw = f.fl ? f.fl[1] - f.fl[0] : 0, ka = (Lm - Fm) / (f.Lf - fw);
      function X(u) { if (!f.fl || u <= f.fl[0]) return u * (f.fl ? ka : Lm / f.Lf); if (u <= f.fl[1]) return f.fl[0] * ka + (u - f.fl[0]) / fw * Fm; return f.fl[0] * ka + Fm + (u - f.fl[1]) * ka; }
      function grp(u0, u1, a) { var C = [], j, ua = -1e9; for (j = 0; j < f.g.length; j++) { if (u1 >= ua - 0.06 && u0 <= f.g[j][0] + 0.06) C.push(f.g[j]); ua = f.g[j][0]; }
        C.sort(function (p, q) { return (p[2] >= a - 0.8 ? p[2] : 1e6 + p[2]) - (q[2] >= a - 0.8 ? q[2] : 1e6 + q[2]); }); return C[0] || f.g[f.g.length - 1]; }
      function sc(e, v) { return v * T[e[1] === 'A' ? f.A : e[1]][i] * IN / 2 / e[2]; }
      function Rv(u, v, E) { if (u >= f.gr[0] && Math.abs(v) <= f.gr[1] + 0.1) return v * T.D[i] * IN / 2 / f.gr[1]; if (E) return sc(E, v);
        return sc(grp(u, u, Math.abs(v)), v); }
      segs(id).forEach(function (s) { var U = s.p.map(function (q) { return q[0]; }), u0 = Math.min.apply(0, U), u1 = Math.max.apply(0, U), am = Math.max.apply(0, s.p.map(function (q) { return Math.abs(q[1]); }));
        var E = null, inn = f.g.filter(function (e, j) { var ua = j ? f.g[j - 1][0] : -1e9; return u0 >= ua - 0.06 && u1 <= e[0] + 0.06; }); if (inn.length) { var ov = function (e) { var j = f.g.indexOf(e), ua = j ? f.g[j - 1][0] : -1e9; return Math.min(u1, e[0]) - Math.max(u0, ua); }; E = inn.sort(function (p, q) { return ov(q) - ov(p); })[0]; } /* traço dentro de um trecho: escala única (maior sobreposição) */
        var Q = s.p.map(function (q) { return [x + X(q[0]) * k, c + Rv(q[0], q[1], E) * k]; });
        if (s.t === 'f') { g.style({ stroke: st.col, lw: 0.05, fill: st.col, dash: null }); g.poly(Q, true); } else { g.style({ stroke: st.col, lw: s.t === 'o' ? 0.25 : 0.15, fill: null, dash: null }); g.poly(Q, false); } });
      g.style({ fill: null }); if (HX.vaAxis) HX.vaAxis(g, x - 1, x + W + 1, c);
    };
    if (HX.DS_OK) HX.DS_OK.pecas[id] = 1;
    if (HX.PRE_OVC) HX.PRE_OVC[id] = f.th / f.Lf;
  });
  /* variantes do catálogo: 70 = MS3470, 71 = MS3471, 74 = MS3474 */
  var fam = HX.CAT.fams.MS3476; if (fam && !fam.variants.some(function (v) { return v.v === '71'; })) fam.variants.splice(2, 0, { v: '71', d: 'MS3471 Receptáculo de cabo' });
  var df0 = HX.physDSFor;
  HX.physDSFor = function (nd, c) { var d = c && HX.CAT.conns[c.part], m = d && d.fam === 'MS3476' && !nd.dsImg && { '70': 'ms3470', '71': 'ms3471', '74': 'ms3474' }[c.variant]; return m || df0.apply(this, arguments); };
})(typeof window !== 'undefined' ? window : globalThis);
