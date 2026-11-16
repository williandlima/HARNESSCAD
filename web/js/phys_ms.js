/* HarnessCAD - desenho físico: PADRÃO MS (MIL-DTL-5015) em desenho técnico (vetor):
   • plugue reto MS3106A / 90° MS3108B (porca de acoplamento, corpo, rosca traseira) e receptáculos MS3101A (de cabo)
     e MS3100A/MS3102A (flange) — medidas TÍPICAS por carcaça (catálogo 97 / MS3106A): ajuste em cL/cD do nó;
   • ADAPTADOR RETO com rabicho de CORDOALHA (ms_ad): porca, corpo, anel de crimpagem e cordoalha trançada afunilando;
   • BOTAS RAYCHEM com lábio para adaptador (datasheet "Molded Parts Visual Reference Guide", TE): 202K1xx reta e
     222K1xx 90° — o tamanho é escolhido pelo Ø do adaptador (H recuperado ≤ Ø ≤ H fornecido) e o PN vai para a BOM. */
(function (G) {
  'use strict';
  var HX = G.HX, IN = 25.4;
  // carcaça MS: [comprimento do plugue, Ø da porca] em polegadas (típico MS3106A)
  var MS = { 8: [1.25, 0.72], 10: [1.31, 0.844], 12: [1.31, 0.969], 14: [1.31, 1.094], 16: [1.38, 1.219], 18: [1.56, 1.344], 20: [1.56, 1.469], 22: [1.56, 1.594],
    24: [1.69, 1.719], 28: [1.81, 1.969], 32: [1.88, 2.219], 36: [1.94, 2.469], 40: [2.0, 2.719] };
  function ms(sh) { var k = Object.keys(MS).map(Number).sort(function (a, b) { return Math.abs(a - sh) - Math.abs(b - sh); })[0]; return MS[k]; }
  HX.msNutD = function (sh) { return Math.round(ms(+sh || 14)[1] * IN * 10) / 10; };
  HX.msAdOD = function (sh) { return Math.round(HX.msNutD(sh) * 0.74 * 10) / 10; }; // Ø traseiro do adaptador (onde a bota agarra)
  var so0 = HX.shellOf;
  HX.shellOf = function (c) { var d = c && HX.CAT.conns[c.part]; if (d && d.fam === 'MS5015') { var m = /^(\d+)/.exec(d.ins || d.label || ''); return m ? +m[1] : 14; } return so0(c); };
  // botas Raychem (TE) — [PN, H fornecido mín (a), H recuperado máx (b), J (b), P comprimento, R (90°)]
  HX.RC_BOOT = {
    '202K': [['202K121', 24, 10.4, 5.6, 38], ['202K132', 30, 14.2, 5.9, 55], ['202K142', 31, 18.0, 7.1, 67], ['202K153', 36, 22.4, 8.4, 80], ['202K163', 43, 28.2, 9.9, 99], ['202K174', 60, 35.1, 15.7, 130], ['202K185', 66, 44.5, 16.8, 170]],
    '222K': [['222K121', 24, 10.4, 5.6, 25, 25], ['222K132', 30, 14.2, 5.9, 32, 27], ['222K142', 31, 18.0, 7.1, 39, 31], ['222K153', 36, 22.4, 8.4, 46, 38], ['222K163', 43, 28.2, 9.9, 55, 45], ['222K174', 60, 35.1, 15.7, 80, 54], ['222K185', 66, 44.5, 16.8, 108, 68]]
  };
  HX.rcBootFor = function (fam, od) { // menor bota que agarra o Ø (recuperada ≤ Ø ≤ fornecida × 0,9)
    var L = HX.RC_BOOT[fam] || []; for (var i = 0; i < L.length; i++) if (L[i][2] <= od && od <= L[i][1] * 0.9) return L[i];
    return L.filter(function (r) { return r[1] * 0.9 >= od; })[0] || L[L.length - 1];
  };
  var PDS = HX.PDS, IMG = function (k) { return k; }, SM = 'MS3106A/MIL-DTL-5015, catálogo 97 (medida típica)', SR = 'TE Raychem Molded Parts Visual Reference Guide (catálogo), p. 23';
  function plugL(sh) { return Math.round(ms(sh)[0] * IN * 10) / 10; }
  PDS.ms_p = { n: 'MS3106A/MS3108B plugue (típico)', src: SM, l: IMG('plug_l'), p: 'plug_p', L: plugL, H: HX.msNutD, kind: 'conn' };
  PDS.ms_r = { n: 'MS3101A receptáculo de cabo (típico)', src: SM, l: IMG('line_l'), p: 'line_p', L: function (sh) { return plugL(sh) * 0.9; }, H: function (sh) { return HX.msNutD(sh) * 0.86; }, kind: 'conn' };
  PDS.ms_rf = { n: 'MS3100A/MS3102A receptáculo flange (típico)', src: SM, l: IMG('wall_l'), p: 'wall_p', L: function (sh) { return plugL(sh) * 0.85; }, H: function (sh) { return HX.msNutD(sh) * 1.18; }, kind: 'conn' };
  PDS.ms_ad = { n: 'Adaptador reto com rabicho de cordoalha', src: 'adaptador reto MS, catálogo (medida típica — envie o datasheet)', l: IMG('sr_s_l'), L: function () { return 62; }, H: function (sh) { return HX.msNutD(sh) * 0.96; }, kind: 'bs' };
  PDS.rc_202K = { n: 'Bota Raychem 202K reta (lábio p/ adaptador)', src: SR, l: IMG('boot_s_l'), kind: 'boot', ov: 0.3, L: function (sh) { return HX.rcBootFor('202K', HX.msAdOD(sh))[4]; },
    H: function (sh) { return HX.msAdOD(sh) + 2; }, pnOf: function (sh) { return HX.rcBootFor('202K', HX.msAdOD(sh))[0] + '-25-0'; } };
  PDS.rc_222K = { n: 'Bota Raychem 222K 90° (lábio p/ adaptador)', src: SR, l: IMG('boot_90_l'), kind: 'boot', ov: 0.18, e0: [0.2, 1], a0: -90, e1: PDS.boot_90 ? PDS.boot_90.e1 : [1, 0.235],
    L: function (sh) { var r = HX.rcBootFor('222K', HX.msAdOD(sh)); return r[4] + r[5] * 0.5; }, H: function (sh) { var r = HX.rcBootFor('222K', HX.msAdOD(sh)); return r[4] + r[5] * 0.5; },
    pnOf: function (sh) { return HX.rcBootFor('222K', HX.msAdOD(sh))[0] + '-25-0'; } };
  var df0 = HX.physDSFor;
  HX.physDSFor = function (nd, c) {
    var d = c && HX.CAT.conns[c.part], st = HX.physVecST && HX.physVecST();
    if (d && d.fam === 'MS5015' && !nd.dsImg && st && st.vec) return { '01A': 'ms_r', '00A': 'ms_rf', '02A': 'ms_rf' }[c.variant || ''] || 'ms_p';
    return df0(nd, c);
  };
  // ---------- desenhos vetoriais (caixa: esquerda = face do conector, direita = lado do cabo) ----------
  var V = HX.PHYS_VEC; if (!V) return;
  function S() { return HX.physVecST() || { col: '#222', metal: '#cfd3d8', boot: '#2f2f2f', line: false }; }
  function R(g, x, y, w, h, f) { var st = S(); g.style({ stroke: st.col, lw: 0.22, fill: f || st.metal, dash: null }); g.rect(x, y, w, h); g.style({ fill: null }); }
  function Ln(g, a, b, c, d, lw, dash) { g.style({ stroke: S().col, lw: lw || 0.1, dash: dash || null }); g.line(a, b, c, d); g.style({ dash: null }); }
  function thread(g, x, y, w, h) { R(g, x, y, w, h); var n = Math.max(3, Math.round(w / 0.7)); for (var i = 0; i < n; i++) Ln(g, x + w * i / n, y, x + w * (i + 0.6) / n, y + h, 0.07); }
  function knurl(g, x, y, w, h) { for (var i = 1, n = Math.max(4, Math.round(w / 0.9)); i < n; i++) Ln(g, x + w * i / n, y + 0.15, x + w * i / n, y + h - 0.15, 0.08); }
  V.ms_p = function (g, x, y, W, H) { var c = y + H / 2; R(g, x, y, W * 0.42, H); knurl(g, x + W * 0.1, y, W * 0.22, H); Ln(g, x + W * 0.04, y, x + W * 0.04, y + H, 0.18);
    R(g, x + W * 0.42, c - H * 0.4, W * 0.4, H * 0.8); Ln(g, x + W * 0.5, c - H * 0.4, x + W * 0.5, c + H * 0.4, 0.1); thread(g, x + W * 0.82, c - H * 0.33, W * 0.18, H * 0.66); };
  V.ms_r = function (g, x, y, W, H) { var c = y + H / 2; thread(g, x, c - H * 0.4, W * 0.36, H * 0.8); R(g, x + W * 0.36, y, W * 0.46, H); Ln(g, x + W * 0.44, y, x + W * 0.44, y + H, 0.1); thread(g, x + W * 0.82, c - H * 0.33, W * 0.18, H * 0.66); };
  V.ms_rf = function (g, x, y, W, H) { var c = y + H / 2; thread(g, x, c - H * 0.33, W * 0.36, H * 0.66); R(g, x + W * 0.36, y, W * 0.08, H);
    [-0.38, 0.38].forEach(function (k) { Ln(g, x + W * 0.36, c + H * k, x + W * 0.44, c + H * k, 0.08, [0.6, 0.4]); }); R(g, x + W * 0.44, c - H * 0.33, W * 0.38, H * 0.66); thread(g, x + W * 0.82, c - H * 0.28, W * 0.18, H * 0.56); };
  V.ms_ad = function (g, x, y, W, H) { // porca + corpo + anel + cordoalha (rabicho) afunilando
    var c = y + H / 2, st = S(), n0 = W * 0.2, b0 = n0 + W * 0.16, r0 = b0 + W * 0.04, h1 = H * 0.7, h2 = H * 0.42;
    R(g, x, y, n0, H); knurl(g, x + n0 * 0.15, y, n0 * 0.7, H);
    g.style({ stroke: st.col, lw: 0.22, fill: st.metal }); g.poly([[x + n0, c - H * 0.42], [x + b0, c - h1 / 2], [x + b0, c + h1 / 2], [x + n0, c + H * 0.42]], true); g.style({ fill: null });
    R(g, x + b0, c - h1 / 2 - 0.4, r0 - b0, h1 + 0.8, st.line ? '#fff' : '#b8bec6');
    var P = [[x + r0, c - h1 / 2], [x + W, c - h2 / 2], [x + W, c + h2 / 2], [x + r0, c + h1 / 2]];
    g.style({ stroke: st.col, lw: 0.2, fill: st.line ? '#fff' : '#d9dde2' }); g.poly(P, true); g.style({ fill: null });
    for (var t = 0; t < 1; t += 0.06) { var xa = x + r0 + (W - r0) * t, xb = Math.min(x + W, xa + (W - r0) * 0.1), ha = h1 + (h2 - h1) * t, hb = h1 + (h2 - h1) * Math.min(1, t + 0.1);
      Ln(g, xa, c - ha / 2, xb, c + hb / 2, 0.06); Ln(g, xa, c + ha / 2, xb, c - hb / 2, 0.06); } };
  V.rc_202K = function () { return V.boot_s.apply(this, arguments); };
  V.rc_222K = function () { return V.boot_90.apply(this, arguments); };
})(typeof window !== 'undefined' ? window : globalThis);
