/* HarnessCAD - DESENHO TÉCNICO DOS CONECTORES em traço de catálogo (padrão Altium Harness / desenhos de fabricante):
   rosca com perfil em dente nas bordas e filetes inclinados, porca sextavada com faces e furos de frenagem, flange com
   cantos arredondados e furos ocultos, recartilhado com serrilha nas bordas, anéis/faixas, alívio de tensão com
   braçadeira e parafusos de fenda, bota com nervuras e linha de centro traço-ponto. Substitui as peças de phys_vec.js
   (D38999, MS, backshell, bota). Cores: metal com brilho no modo cor; branco no modo traço. */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC; if (!V) return;
  function S() { return HX.physVecST() || { col: '#222', metal: '#cfd3d8', boot: '#2f2f2f', line: false }; }
  function st(g, lw, f, dash) { var s = S(); g.style({ stroke: s.col, lw: lw, fill: f === undefined ? null : f, dash: dash || null }); }
  function ln(g, a, b, c, d, lw, dash) { st(g, lw || 0.1, null, dash); g.line(a, b, c, d); g.style({ dash: null }); }
  function poly(g, P, f, lw) { st(g, lw || 0.22, f); g.poly(P, true); g.style({ fill: null }); }
  function metal(f) { var s = S(); return s.line ? '#fff' : f || s.metal; }
  function shine(g, x0, x1, c, r) { if (S().line) return; g.style({ stroke: '#ffffff', lw: Math.max(0.12, r * 0.1), dash: null }); g.line(x0 + 0.2, c - r * 0.55, x1 - 0.2, c - r * 0.55); } // brilho do metal
  function pitch(r) { return Math.max(0.42, r * 0.17); }
  // ROSCA: borda em dente (perfil), filetes inclinados de crista a crista
  HX.vaThread = function (g, x0, x1, c, r, f) {
    var p = pitch(r), d = Math.min(p * 0.42, r * 0.12), T = [], B = [], k = 0;
    for (var x = x0; x < x1 - 1e-6; x += p / 2, k++) { T.push([x, c - (k % 2 ? r - d : r)]); B.push([x, c + (k % 2 ? r - d : r)]); }
    T.push([x1, c - r + d * 0.5]); B.push([x1, c + r - d * 0.5]);
    poly(g, T.concat(B.reverse()), metal(f)); shine(g, x0, x1, c, r - d);
    for (var xi = x0 + p * 0.25; xi < x1 - p * 0.3; xi += p) ln(g, xi, c - r + d, Math.min(x1, xi + p * 0.55), c + r - d, 0.07);
  };
  // RECARTILHADO: serrilha fina nas bordas + estrias
  HX.vaKnurl = function (g, x0, x1, c, r, f) {
    var p = Math.max(0.55, r * 0.15), d = Math.min(0.22, r * 0.06), T = [], B = [], k = 0;
    for (var x = x0; x < x1 - 1e-6; x += p / 2, k++) { T.push([x, c - (k % 2 ? r - d : r)]); B.push([x, c + (k % 2 ? r - d : r)]); }
    T.push([x1, c - r]); B.push([x1, c + r]); poly(g, T.concat(B.reverse()), metal(f)); shine(g, x0, x1, c, r);
    for (var xi = x0 + p; xi < x1 - p * 0.4; xi += p) ln(g, xi, c - r + d, xi, c + r - d, 0.06);
    ln(g, x0 + Math.min(0.6, (x1 - x0) * 0.08), c - r + d, x0 + Math.min(0.6, (x1 - x0) * 0.08), c + r - d, 0.12); ln(g, x1 - Math.min(0.6, (x1 - x0) * 0.08), c - r + d, x1 - Math.min(0.6, (x1 - x0) * 0.08), c + r - d, 0.12);
  };
  // CORPO liso com cantos arredondados
  HX.vaBody = function (g, x0, x1, c, r, f, rr) {
    rr = Math.min(rr == null ? r * 0.12 : rr, (x1 - x0) / 2, r / 2); var P = [], i, a;
    for (i = 0; i <= 4; i++) { a = Math.PI + i / 4 * Math.PI / 2; P.push([x0 + rr + rr * Math.cos(a), c - r + rr + rr * Math.sin(a)]); }
    for (i = 0; i <= 4; i++) { a = -Math.PI / 2 + i / 4 * Math.PI / 2; P.push([x1 - rr + rr * Math.cos(a), c - r + rr + rr * Math.sin(a)]); }
    for (i = 0; i <= 4; i++) { a = i / 4 * Math.PI / 2; P.push([x1 - rr + rr * Math.cos(a), c + r - rr + rr * Math.sin(a)]); }
    for (i = 0; i <= 4; i++) { a = Math.PI / 2 + i / 4 * Math.PI / 2; P.push([x0 + rr + rr * Math.cos(a), c + r - rr + rr * Math.sin(a)]); }
    poly(g, P, metal(f)); shine(g, x0, x1, c, r);
  };
  // PORCA SEXTAVADA (vista lateral): 3 faces, chanfros arredondados, furos de frenagem
  HX.vaHex = function (g, x0, x1, c, r, f) {
    var w = x1 - x0, ch = Math.min(w * 0.22, r * 0.18), P = [[x0 + ch, c - r], [x1 - ch, c - r], [x1, c - r + ch * 1.6], [x1, c + r - ch * 1.6], [x1 - ch, c + r], [x0 + ch, c + r], [x0, c + r - ch * 1.6], [x0, c - r + ch * 1.6]];
    poly(g, P, metal(f)); shine(g, x0, x1, c, r);
    [-0.5, 0.5].forEach(function (k) { var yk = c + r * k, ya = yk - ch * 0.4 * Math.sign(k); ln(g, x0, yk, x0 + ch * 0.8, ya, 0.12); ln(g, x0 + ch * 0.8, ya, x1 - ch * 0.8, ya, 0.12); ln(g, x1 - ch * 0.8, ya, x1, yk, 0.12); });
    var hr = Math.min(w * 0.12, r * 0.07); st(g, 0.1, S().line ? '#fff' : '#f4f5f6'); [-0.76, 0, 0.76].forEach(function (k) { g.circle(x0 + w / 2, c + r * k, hr); }); g.style({ fill: null });
  };
  // FLANGE: placa alta, cantos arredondados, furos de fixação ocultos
  HX.vaFlange = function (g, x0, x1, c, r, f) {
    HX.vaBody(g, x0, x1, c, r, f, Math.min(0.5, r * 0.05));
    [-0.72, 0.72].forEach(function (k) { var hr = r * 0.11; ln(g, x0, c + r * k - hr, x1, c + r * k - hr, 0.07, [0.5, 0.35]); ln(g, x0, c + r * k + hr, x1, c + r * k + hr, 0.07, [0.5, 0.35]); });
  };
  HX.vaBand = function (g, x0, x1, c, r, color) { var s = S(); HX.vaBody(g, x0, x1, c, r, s.line ? '#fff' : color, 0); if (s.line) ln(g, (x0 + x1) / 2, c - r, (x0 + x1) / 2, c + r, 0.28); };
  HX.vaRing = function (g, x0, x1, c, r) { HX.vaBody(g, x0, x1, c, r, S().line ? '#fff' : '#3a3d42', Math.min(0.3, (x1 - x0) / 2)); }; // anel de vedação
  HX.vaCone = function (g, x0, x1, c, r0, r1, f) { poly(g, [[x0, c - r0], [x1, c - r1], [x1, c + r1], [x0, c + r0]], metal(f)); shine(g, x0, x1, c, Math.min(r0, r1)); };
  HX.vaAxis = function (g, x0, x1, c) { ln(g, x0, c, x1, c, 0.06, [1.6, 0.45, 0.25, 0.45]); };
  HX.vaScrew = function (g, x, y, r) { st(g, 0.14, metal()); g.circle(x, y, r); g.style({ fill: null }); ln(g, x - r * 0.7, y - r * 0.25, x + r * 0.7, y + r * 0.25, 0.14); };
  var T = HX.vaThread, K = HX.vaKnurl, B = HX.vaBody, X = HX.vaHex, F = HX.vaFlange, BD = HX.vaBand, RG = HX.vaRing, CN = HX.vaCone, AX = HX.vaAxis;
  var RED = '#d42a2a', BLUE = '#2b6fd6';
  // plugue D38999 (porca de acoplamento recartilhada)
  V.d38_26 = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c);
    K(g, x + W * 0.02, x + W * 0.55, c, H * 0.5); B(g, x, x + W * 0.04, c, H * 0.44);
    B(g, x + W * 0.55, x + W * 0.85, c, H * 0.4); RG(g, x + W * 0.6, x + W * 0.62, c, H * 0.41); BD(g, x + W * 0.77, x + W * 0.8, c, H * 0.4, BLUE); T(g, x + W * 0.85, x + W, c, H * 0.31); };
  // receptáculo porca de painel (jam nut) — como a figura de referência
  V.d38_24 = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c);
    T(g, x, x + W * 0.33, c, H * 0.36); BD(g, x + W * 0.33, x + W * 0.36, c, H * 0.36, RED); X(g, x + W * 0.36, x + W * 0.47, c, H * 0.5); F(g, x + W * 0.48, x + W * 0.53, c, H * 0.48);
    B(g, x + W * 0.53, x + W * 0.82, c, H * 0.33); RG(g, x + W * 0.57, x + W * 0.59, c, H * 0.34); BD(g, x + W * 0.78, x + W * 0.8, c, H * 0.33, BLUE); T(g, x + W * 0.82, x + W * 0.95, c, H * 0.29); K(g, x + W * 0.95, x + W, c, H * 0.31); };
  // receptáculo de flange quadrado (wall mount)
  V.d38_20 = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c);
    T(g, x, x + W * 0.35, c, H * 0.36); BD(g, x + W * 0.35, x + W * 0.38, c, H * 0.36, RED); F(g, x + W * 0.38, x + W * 0.45, c, H * 0.5);
    B(g, x + W * 0.45, x + W * 0.86, c, H * 0.36); RG(g, x + W * 0.5, x + W * 0.52, c, H * 0.37); BD(g, x + W * 0.8, x + W * 0.83, c, H * 0.36, BLUE); T(g, x + W * 0.86, x + W, c, H * 0.3); };
  // receptáculo em linha
  V.tv01 = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c);
    T(g, x, x + W * 0.38, c, H * 0.37); BD(g, x + W * 0.38, x + W * 0.41, c, H * 0.37, RED); B(g, x + W * 0.41, x + W * 0.86, c, H * 0.5, null, H * 0.08); K(g, x + W * 0.46, x + W * 0.62, c, H * 0.5); T(g, x + W * 0.86, x + W, c, H * 0.3); };
  // alívio de tensão (backshell reto): porca recartilhada, cone, corpo e braçadeira com 2 parafusos
  V.sr_s = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c);
    K(g, x, x + W * 0.28, c, H * 0.48); CN(g, x + W * 0.28, x + W * 0.48, c, H * 0.42, H * 0.3); B(g, x + W * 0.48, x + W, c, H * 0.3, null, H * 0.05);
    [-1, 1].forEach(function (sg) { var y0 = c + sg * H * 0.3, hb = H * 0.13; HX.vaBody(g, x + W * 0.58, x + W * 0.96, y0 + sg * hb / 2, hb / 2, S().line ? '#fff' : '#a9b0b8', hb * 0.3); HX.vaScrew(g, x + W * 0.66, y0 + sg * hb * 0.5, hb * 0.38); HX.vaScrew(g, x + W * 0.88, y0 + sg * hb * 0.5, hb * 0.38); });
    ln(g, x + W * 0.52, c - H * 0.12, x + W, c - H * 0.12, 0.07, [0.8, 0.5]); ln(g, x + W * 0.52, c + H * 0.12, x + W, c + H * 0.12, 0.07, [0.8, 0.5]); };
  // bota termo-retrátil reta com nervuras
  var bs0 = V.boot_s; V.boot_s = function (g, x, y, W, H) { bs0.apply(this, arguments); var c = y + H / 2;
    for (var t = 0.18; t < 0.62; t += 0.09) { var h = 0.48 * (1 - t) * (1 - t) + 2 * (1 - t) * t * 0.22 + t * t * 0.21, xx = x + W * (0.08 + 0.6 * t); ln(g, xx, c - H * h * 0.92, xx, c + H * h * 0.92, 0.07); } };
  // MS (MIL-DTL-5015/26482): mesmas peças em traço de catálogo
  V.ms_p = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c); K(g, x, x + W * 0.42, c, H * 0.5); B(g, x + W * 0.42, x + W * 0.82, c, H * 0.4); RG(g, x + W * 0.48, x + W * 0.5, c, H * 0.41); T(g, x + W * 0.82, x + W, c, H * 0.33); };
  V.ms_r = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c); T(g, x, x + W * 0.36, c, H * 0.4); B(g, x + W * 0.36, x + W * 0.82, c, H * 0.5, null, H * 0.08); X(g, x + W * 0.42, x + W * 0.56, c, H * 0.5); T(g, x + W * 0.82, x + W, c, H * 0.33); };
  V.ms_rf = function (g, x, y, W, H) { var c = y + H / 2; AX(g, x - 1, x + W + 1, c); T(g, x, x + W * 0.36, c, H * 0.33); F(g, x + W * 0.36, x + W * 0.44, c, H * 0.5); B(g, x + W * 0.44, x + W * 0.82, c, H * 0.33); RG(g, x + W * 0.49, x + W * 0.51, c, H * 0.34); T(g, x + W * 0.82, x + W, c, H * 0.28); };
  var ad0 = V.ms_ad; V.ms_ad = function (g, x, y, W, H) { ad0.apply(this, arguments); var c = y + H / 2; K(g, x, x + W * 0.2, c, H * 0.5); AX(g, x - 1, x + W * 0.4, c); };
})(typeof window !== 'undefined' ? window : globalThis);
