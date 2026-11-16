/* HarnessCAD - ícones realistas (genéricos) — portáteis, conversores e acessórios */
(function (G) {
  'use strict';
  var HX = G.HX, E = HX.EQD, I = HX.EQ_ICONS = HX.EQ_ICONS || {};
  var YEL = '#f2c230', FACE = '#383d43', LCD = '#c9d5b6';
  function line(g, d, pts, col, lw) { g.style({ stroke: d.mono ? '#000' : col, lw: lw, fill: null, dash: null }); g.poly(pts, false); }

  I.dmm = [6, 9.5, function (g, d) { // multímetro portátil com capa
    E.rr(g, d, 0, 0, 6, 9.5, 0.8, YEL, '#8a6d10', 0.06);
    E.rr(g, d, 0.45, 0.45, 5.1, 8.6, 0.5, FACE, 0);
    E.rr(g, d, 0.8, 0.7, 1.9, 0.45, 0.1, YEL, 0);
    E.disp(g, d, 0.85, 1.4, 4.3, 1.9, [], LCD);
    [['#3d6fd6'], ['#9aa3ab'], ['#9aa3ab'], ['#f08a24']].forEach(function (c, i) { E.btn(g, d, 0.85 + i * 1.12, 3.65, 0.9, 0.42, c[0]); });
    E.circ(g, d, 3, 5.9, 1.45, '#25292d', '#555', 0.05);
    for (var k = 0; k < 9; k++) { var a = Math.PI * (0.8 + k * 0.175); line(g, d, [[3 + 1.6 * Math.cos(a), 5.9 + 1.6 * Math.sin(a)], [3 + 1.85 * Math.cos(a), 5.9 + 1.85 * Math.sin(a)]], '#d0d4d8', 0.06); }
    line(g, d, [[3, 5.9], [3, 4.7]], '#e9ecef', 0.22);
    [['10A', '#d42020'], ['mA', '#d42020'], ['COM', '#1e2124'], ['VΩ', '#d42020']].forEach(function (j, i) {
      E.txt(g, d, j[0], 1.0 + i * 1.33, 7.75, 0.3, '#e0e0e0'); E.jack(g, d, 1.0 + i * 1.33, 8.4, 0.34, j[1]);
    });
  }];
  I.clamp = [5.5, 10, function (g, d) { // alicate amperímetro
    E.circ(g, d, 2.75, 2.35, 2.1, '#e5484d', '#8a2020', 0.06); E.circ(g, d, 2.75, 2.35, 1.25, '#ffffff', '#8a2020', 0.04);
    E.rr(g, d, 2.6, 0, 0.32, 1.15, 0, '#ffffff', 0);
    E.rr(g, d, 0.4, 3.7, 4.7, 6.2, 0.6, YEL, '#8a6d10', 0.06);
    E.rr(g, d, 0.8, 4.05, 3.9, 5.5, 0.4, FACE, 0);
    E.circ(g, d, 2.75, 5.35, 0.95, '#25292d', '#555', 0.05); line(g, d, [[2.75, 5.35], [3.3, 4.7]], '#e9ecef', 0.16);
    E.disp(g, d, 1.1, 6.75, 3.3, 1.35, [], LCD);
    E.btn(g, d, 1.1, 8.45, 0.9, 0.35, '#3d6fd6'); E.btn(g, d, 2.3, 8.45, 0.9, 0.35, '#9aa3ab'); E.btn(g, d, 3.5, 8.45, 0.9, 0.35, '#f08a24');
    E.jack(g, d, 1.9, 9.3, 0.3, '#1e2124'); E.jack(g, d, 3.6, 9.3, 0.3, '#d42020');
  }];
  I.hosc = [6, 10, function (g, d) { // osciloscópio portátil
    E.bnc(g, d, 1.6, 0.5, 0.36); E.bnc(g, d, 3, 0.5, 0.36); E.bnc(g, d, 4.4, 0.5, 0.36);
    E.rr(g, d, 0, 0.8, 6, 9.2, 0.6, '#2f6fd6', '#1c3f7a', 0.06);
    E.rr(g, d, 0.4, 1.2, 5.2, 8.4, 0.4, '#23272b', 0);
    E.scr(g, d, 0.75, 1.55, 4.5, 3.0);
    E.wave(g, d, 0.8, 1.75, 4.4, 1.2, 'sin', '#ffe23a', 2.5); E.wave(g, d, 0.8, 3.0, 4.4, 1.2, 'sin', '#2ec5ff', 2);
    for (var r = 0; r < 5; r++) for (var c = 0; c < 4; c++) E.btn(g, d, 0.85 + c * 1.12, 5.05 + r * 0.82, 0.85, 0.48, c === 3 && r > 1 ? '#f2c200' : '#5b636c');
  }];
  I.solder = [11, 8, function (g, d) { // estação de solda
    line(g, d, [[9.6, 0.8], [8.6, 0.2], [6.8, 0.6], [5.6, 2.3]], '#1b1d20', 0.18);
    E.rr(g, d, 0, 2.2, 6.2, 5.6, 0.8, '#2f6fd6', '#1c3f7a', 0.06);
    E.disp(g, d, 0.9, 3.0, 4.4, 1.9, [], '#f4c84a');
    [1.6, 3.1, 4.6].forEach(function (x) { E.circ(g, d, x, 6.15, 0.45, '#f2c200', '#8a6d10', 0.04); });
    E.rr(g, d, 6.4, 4.6, 4.4, 3.2, 0.5, '#2a2e33', 0);
    E.rr(g, d, 7.0, 5.3, 1.9, 1.3, 0.3, '#c9a227', 0);
    E.rr(g, d, 0.2, 4.0, 0.7, 1.0, 0.1, '#1b1d20', '#0c1a33', 0.03); E.rr(g, d, 0.35, 4.25, 0.4, 0.5, 0, '#6d757d', 0); E.jack(g, d, 5.4, 7.15, 0.3, '#1e9a3a');
    line(g, d, [[8.5, 4.8], [10.2, 2.0]], '#3a3f45', 0.35);
    g.style({ stroke: d.mono ? '#000' : '#8a6d10', lw: 0.05, fill: d.f('#f2c200') }); g.poly([[8.1, 3.4], [8.9, 3.0], [10.1, 0.9], [9.3, 0.5]], true);
    line(g, d, [[8.45, 3.25], [7.7, 4.4]], '#aeb5bd', 0.18);
  }];
  I.daq = [10, 7, function (g, d) { // módulo de aquisição USB
    E.rr(g, d, 0, 0, 8.6, 7, 0.4, '#e3e6ea', '#7d8791', 0.07);
    E.rr(g, d, 0.15, 0.12, 8.3, 0.5, 0.2, '#f6f7f9', 0);
    E.txt(g, d, 'DAQ USB', 4.3, 3.0, 0.9, '#1f4fa8'); E.txt(g, d, 'I/O analógico e digital', 4.3, 4.0, 0.42, '#3a4048', 'c', false);
    E.rr(g, d, 8.6, 0.35, 1.4, 6.3, 0.1, '#1f8a3a', '#14532a', 0.04);
    for (var i = 0; i < 8; i++) {
      E.circ(g, d, 9.3, 0.8 + i * 0.77, 0.25, '#c0c6cc', '#555', 0.03);
      line(g, d, [[9.12, 0.8 + i * 0.77], [9.48, 0.8 + i * 0.77]], '#444', 0.05);
    }
    E.circ(g, d, 1.0, 6.0, 0.32, '#2f6fd6', '#1c3f7a', 0.03);
    E.rr(g, d, 0, 3.25, 0.45, 0.5, 0.05, '#1b1d20', '#555', 0.02);
  }];
  I.usb = [10, 4, function (g, d) { // conversor USB (saída conforme o tipo)
    E.rr(g, d, 0, 1.3, 1.85, 1.4, 0.08, '#c9ced3', '#6d757d', 0.04); E.rr(g, d, 0.25, 1.75, 1.2, 0.5, 0, '#2b2f33', 0);
    E.rr(g, d, 1.75, 0.55, 6.5, 2.9, 0.55, '#25292d', '#111', 0.04);
    E.txt(g, d, 'USB-' + (d.t || ''), 4.9, 2.0, 0.7, '#ffffff');
    E.circ(g, d, 7.55, 1.05, 0.13, '#2ecc71', 0); E.circ(g, d, 7.55, 2.95, 0.13, '#ff5c5c', 0);
    if (d.t === 'RS232') {
      g.style({ stroke: d.mono ? '#000' : '#6d757d', lw: 0.05, fill: d.f('#c9ced3') }); g.poly([[8.2, 0.75], [10, 1.1], [10, 2.9], [8.2, 3.25]], true);
      g.style({ fill: d.f('#2b2f33'), stroke: null }); g.poly([[8.5, 1.1], [9.75, 1.35], [9.75, 2.65], [8.5, 2.9]], true);
      for (var q = 0; q < 5; q++) E.circ(g, d, 9.4, 1.4 + q * 0.3, 0.08, '#d4af37', 0);
    } else if (d.t === 'TTL') {
      E.rr(g, d, 8.2, 1.2, 1.5, 1.6, 0.05, '#1b1d20', 0);
      for (var p = 0; p < 4; p++) line(g, d, [[9.6, 1.4 + p * 0.4], [10, 1.4 + p * 0.4]], '#d4af37', 0.12);
    } else {
      E.rr(g, d, 8.2, 0.9, 1.8, 2.2, 0.08, '#1f8a3a', '#14532a', 0.04);
      for (var s = 0; s < 3; s++) E.circ(g, d, 9.1, 1.35 + s * 0.65, 0.22, '#c0c6cc', '#555', 0.03);
    }
  }];
  I.usbiso = [10, 5, function (g, d) { // conversor USB-RS422/485 isolado, borne de 5 vias
    var W = '#e8e8e8', names = ['GND', 'RDB(+)', 'RDA(-)', 'TDB(+)', 'TDA(-)'];
    E.rr(g, d, 0, 1.75, 1.05, 1.5, 0.08, '#c9ced3', '#6d757d', 0.04); E.rr(g, d, 0.25, 2.1, 0.6, 0.8, 0.05, '#2b2f33', 0);
    E.rr(g, d, 0.95, 0.3, 7.6, 4.4, 0.35, '#1d2023', '#0a0b0c', 0.05);
    for (var r = 0; r < 4; r++) { E.rr(g, d, 1.15 + r * 0.32, 0.45, 0.2, 4.1, 0.08, '#2c3035', 0); E.rr(g, d, 7.25 + r * 0.32, 0.45, 0.2, 4.1, 0.08, '#2c3035', 0); }
    E.txt(g, d, 'RS-422/485', 4.3, 1.55, 0.55, W); E.txt(g, d, 'ISOLADO  USB', 4.3, 2.25, 0.38, W, 'c', false);
    E.circ(g, d, 3.2, 3.6, 0.13, '#2ecc71', 0); E.txt(g, d, 'TD', 3.2, 3.15, 0.3, W);
    E.circ(g, d, 4.2, 3.6, 0.13, '#ffb020', 0); E.txt(g, d, 'RD', 4.2, 3.15, 0.3, W);
    names.forEach(function (n, i) { E.txt(g, d, n, 7.1, 0.85 + i * 0.82, 0.3, W, 'r', false); });
    E.rr(g, d, 8.45, 0.35, 1.55, 4.3, 0.1, '#2fae4f', '#14532a', 0.05);
    E.rr(g, d, 8.45, 0.35, 0.35, 4.3, 0, '#24903f', 0);
    for (var i = 0; i < 5; i++) {
      E.circ(g, d, 9.25, 0.85 + i * 0.82, 0.27, '#c0c6cc', '#555', 0.03);
      g.style({ stroke: d.mono ? '#000' : '#444', lw: 0.06, fill: null }); g.line(9.07, 0.67 + i * 0.82, 9.43, 1.03 + i * 0.82);
    }
  }];
  I.bat = [8, 5, function (g, d) {
    E.rr(g, d, 0.6, 0.8, 6.2, 3.4, 0.6, '#2f6fd6', '#1c3f7a', 0.05); E.rr(g, d, 5.0, 0.8, 1.8, 3.4, 0.3, '#c77d2e', 0);
    E.rr(g, d, 6.8, 1.8, 0.7, 1.4, 0.15, '#b9bec4', '#666', 0.04); E.rr(g, d, 0.25, 1.9, 0.4, 1.2, 0.1, '#b9bec4', '#666', 0.04);
    E.txt(g, d, '12V', 2.8, 2.5, 0.9, '#ffffff'); E.txt(g, d, '+', 5.9, 2.5, 0.9, '#ffffff');
  }];
  I.ac = [8, 6, function (g, d) {
    E.rr(g, d, 0.2, 1.6, 1.9, 0.5, 0.1, '#c9ced3', '#666', 0.03); E.rr(g, d, 0.2, 3.9, 1.9, 0.5, 0.1, '#c9ced3', '#666', 0.03);
    E.rr(g, d, 0.5, 2.8, 1.5, 0.4, 0.15, '#c9ced3', '#666', 0.03);
    E.rr(g, d, 2, 0.6, 4, 4.8, 0.8, '#2b2f33', '#111', 0.04); E.rr(g, d, 6, 2.6, 2, 0.8, 0.3, '#2b2f33', 0);
  }];
  I.probe = [10, 4, function (g, d) {
    E.bnc(g, d, 0.8, 2, 0.7); line(g, d, [[1.5, 2], [3, 2]], '#1b1d20', 0.25);
    E.rr(g, d, 3, 1.25, 5, 1.5, 0.6, '#2b2f33', '#111', 0.04); E.rr(g, d, 4.2, 1.25, 0.4, 1.5, 0, '#5b636c', 0);
    line(g, d, [[8, 2], [9.6, 2], [10, 1.6]], '#aeb5bd', 0.2);
    line(g, d, [[7, 2.75], [8.4, 3.7]], '#1b1d20', 0.12); E.rr(g, d, 8.4, 3.35, 1.3, 0.6, 0.15, '#1e9a3a', 0);
  }];
  // acessórios (cor = cor do pino); a ponta fica do lado oposto ao terminal
  I.banana = [10, 4, function (g, d) {
    g.style({ stroke: d.mono ? '#000' : '#6d757d', lw: 0.05, fill: d.f('#d3d7dc') });
    g.poly([[0, 2], [0.5, 1.35], [3.2, 1.45], [3.45, 2], [3.2, 2.55], [0.5, 2.65]], true);
    line(g, d, [[0.6, 2], [3.1, 2]], '#8d969f', 0.05);
    E.rr(g, d, 3.4, 1.15, 0.9, 1.7, 0.1, '#9aa3ab', '#555', 0.04);
    E.rr(g, d, 4.2, 0.55, 5.8, 2.9, 0.6, d.c, '#222', 0.05);
    for (var i = 0; i < 4; i++) line(g, d, [[5.2 + i * 0.8, 0.75], [5.2 + i * 0.8, 3.25]], '#333333', 0.06);
  }];
  I.jack = [6, 6, function (g, d) {
    var h = []; for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; h.push([3 + 2.9 * Math.cos(a), 3 + 2.9 * Math.sin(a)]); }
    g.style({ stroke: d.mono ? '#000' : '#555', lw: 0.06, fill: d.f('#c9ced3') }); g.poly(h, true);
    E.jack(g, d, 3, 3, 2.1, d.c);
  }];
  I.clip = [10, 4, function (g, d) {
    g.style({ stroke: d.mono ? '#000' : '#6d757d', lw: 0.05, fill: d.f('#d3d7dc') });
    g.poly([[0, 1.9], [0.8, 1.4], [1.4, 1.75], [2, 1.2], [2.6, 1.6], [3.2, 1], [4.2, 1.1], [4.2, 1.9]], true);
    g.poly([[0, 2.1], [0.8, 2.6], [1.4, 2.25], [2, 2.8], [2.6, 2.4], [3.2, 3], [4.2, 2.9], [4.2, 2.1]], true);
    g.style({ fill: d.f(d.c), stroke: d.mono ? '#000' : '#222' }); g.poly([[4, 0.5], [10, 1.1], [10, 2.9], [4, 3.5]], true);
  }];
})(typeof window !== 'undefined' ? window : globalThis);
