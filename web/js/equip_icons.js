/* HarnessCAD - ícones realistas (genéricos, sem marcas) — instrumentos de bancada
   Cada ícone: [largura, altura, função(g, d)] em unidades; d.t = texto extra, d.c = cor do pino */
(function (G) {
  'use strict';
  var HX = G.HX, E = HX.EQD, I = HX.EQ_ICONS = HX.EQ_ICONS || {};
  var GRN = '#d8ff3c', RED = '#ff3b30', CYN = '#5fe3ff', BLU = '#9cc2ea', TX = '#3a4048';

  I.psu = [10, 7.6, function (g, d) { // fonte de bancada 1 canal
    E.chassis(g, d, 0, 0, 10, 7.2);
    E.disp(g, d, 0.7, 0.6, 8.6, 2.8, []);
    E.txt(g, d, 'TENSÃO', 3.2, 3.95, 0.42, TX); E.txt(g, d, 'CORRENTE', 6.8, 3.95, 0.42, TX);
    E.knob(g, d, 3.2, 4.95, 0.62); E.knob(g, d, 6.8, 4.95, 0.62);
    E.btn(g, d, 0.6, 5.95, 0.95, 0.75, '#c3c9d0'); E.circ(g, d, 1.07, 6.32, 0.2, null, '#555', 0.05);
    E.jack(g, d, 6.3, 6.35, 0.36, '#d42020'); E.jack(g, d, 7.4, 6.35, 0.36, '#1e2124'); E.jack(g, d, 8.5, 6.35, 0.36, '#1e9a3a');
  }];
  I.psu2 = [10, 7.6, function (g, d) { // fonte de bancada 2 canais, display vermelho e teclado
    E.chassis(g, d, 0, 0, 10, 7.2);
    E.disp(g, d, 0.6, 0.6, 6.2, 2.8, []);
    E.grid(g, d, 7.3, 0.65, 2, 4, 0.9, 0.52, 0.2);
    E.txt(g, d, 'TENSÃO', 2, 4.0, 0.42, TX); E.txt(g, d, 'CORRENTE', 5, 4.0, 0.42, TX);
    E.knob(g, d, 2, 4.95, 0.6); E.knob(g, d, 5, 4.95, 0.6);
    E.circ(g, d, 0.95, 6.4, 0.38, '#9aa3ab', '#555', 0.05);
    [['#d42020', 5.1], ['#1e2124', 5.9], ['#1e9a3a', 6.9], ['#d42020', 7.9], ['#1e2124', 8.7]].forEach(function (j) { E.jack(g, d, j[1], 6.4, 0.33, j[0]); });
    E.txt(g, d, 'CH1', 5.5, 5.75, 0.36, TX); E.txt(g, d, 'CH2', 8.3, 5.75, 0.36, TX);
  }];
  function osc(n) {
    return [16, 8.2, function (g, d) { // osciloscópio de bancada
      E.chassis(g, d, 0, 0, 16, 7.8);
      E.scr(g, d, 0.8, 0.75, 8.6, 5.0);
      E.wave(g, d, 0.9, 1.1, 8.4, 2.1, 'sin', '#ffe23a', 3.5);
      E.wave(g, d, 0.9, 3.5, 8.4, 1.6, 'sq', '#2ec5ff', 4);
      for (var i = 0; i < 5; i++) E.btn(g, d, 9.65, 0.9 + i * 0.95, 0.6, 0.6);
      E.knob(g, d, 11.3, 1.25, 0.45); E.knob(g, d, 12.75, 1.25, 0.45); E.knob(g, d, 14.2, 1.25, 0.45);
      E.grid(g, d, 10.7, 2.25, 4, 3, 0.75, 0.5, 0.32);
      var C = [['#f2c200', '1'], ['#2fb36d', '2'], ['#2f80ed', '3'], ['#e5484d', '4']].slice(0, n), x0 = 15.3 - n * 1.35;
      C.forEach(function (c, k) { var x = x0 + k * 1.35 + 0.5; E.badge(g, d, x, 5.55, 0.3, c[0], c[1]); E.bnc(g, d, x, 6.7, 0.47); });
      E.rr(g, d, 0.9, 6.35, 1.3, 0.6, 0.1, '#cfd5db'); E.rr(g, d, 1.1, 6.5, 0.9, 0.28, 0, '#2b2f33', 0);
      E.btn(g, d, 3.0, 6.45, 1.4, 0.45); E.btn(g, d, 5.0, 6.45, 1.3, 0.45);
      E.jack(g, d, 7.2, 6.7, 0.32, '#1e9a3a'); E.bnc(g, d, 8.45, 6.7, 0.42); E.txt(g, d, 'EXT', 8.45, 5.95, 0.32, '#3a4048');
    }];
  }
  I.osc = osc(4); I.osc2 = osc(2);
  I.dmmb = [12, 6, function (g, d) { // multímetro de bancada 6½ dígitos
    E.chassis(g, d, 0, 0, 12, 5.6);
    E.disp(g, d, 0.6, 0.6, 7.2, 2.3, []);
    for (var i = 0; i < 5; i++) { E.btn(g, d, 0.7 + i * 1.45, 3.35, 1.1, 0.55); E.btn(g, d, 0.7 + i * 1.45, 4.25, 1.1, 0.55, '#dfe3e8'); }
    E.grid(g, d, 8.05, 3.3, 2, 2, 0.5, 0.5, 0.18);
    g.style({ stroke: d.mono ? '#000' : '#9aa3ab', lw: 0.05, fill: null }); g.line(9.45, 0.5, 9.45, 5.1);
    E.txt(g, d, 'HI', 10.2, 0.55, 0.32, TX); E.txt(g, d, 'LO', 10.2, 2.1, 0.32, TX);
    E.jack(g, d, 10.2, 1.2, 0.36, '#d42020'); E.jack(g, d, 11.25, 1.2, 0.36, '#d42020');
    E.jack(g, d, 10.2, 2.75, 0.36, '#1e2124'); E.jack(g, d, 11.25, 2.75, 0.36, '#1e2124');
    E.jack(g, d, 10.7, 4.25, 0.36, '#c0c6cc'); E.txt(g, d, 'I', 10.7, 3.65, 0.32, TX);
  }];
  I.fgen = [13, 6.5, function (g, d) { // gerador de funções
    E.chassis(g, d, 0, 0, 13, 6.1);
    E.disp(g, d, 0.8, 0.85, 7.6, 1.9, []);
    for (var i = 0; i < 5; i++) E.btn(g, d, 0.9 + i * 1.5, 3.3, 1.2, 0.6, BLU);
    E.btn(g, d, 0.9, 4.3, 1.2, 0.6); for (var j = 1; j < 5; j++) E.btn(g, d, 0.9 + j * 1.5, 4.3, 1.2, 0.6, BLU);
    E.knob(g, d, 10.4, 2.0, 1.1); E.bnc(g, d, 9.9, 4.65, 0.42); E.bnc(g, d, 11.6, 4.65, 0.55); E.jack(g, d, 8.75, 4.65, 0.3, '#1e9a3a');
  }];
  I.fgen2 = [13, 6.5, function (g, d) { // gerador de funções com teclado
    E.chassis(g, d, 0, 0, 13, 6.1);
    E.disp(g, d, 0.7, 0.75, 6.0, 3.1, [], '#08140a');
    E.wave(g, d, 1.2, 2.35, 3.8, 1.2, 'sin', '#ffd400', 1.2);
    for (var i = 0; i < 5; i++) E.btn(g, d, 0.8 + i * 1.18, 4.4, 0.95, 0.5, BLU);
    E.grid(g, d, 7.3, 0.8, 3, 5, 0.62, 0.48, 0.2);
    E.knob(g, d, 11.5, 1.6, 0.85);
    E.bnc(g, d, 10.6, 4.9, 0.45); E.bnc(g, d, 11.85, 4.9, 0.45); E.bnc(g, d, 9.4, 4.9, 0.36); E.jack(g, d, 8.35, 4.9, 0.28, '#1e9a3a');
  }];
  I.load = [11, 6, function (g, d) { // carga eletrônica
    E.chassis(g, d, 0, 0, 11, 5.6);
    E.disp(g, d, 0.6, 0.65, 5.7, 2.3, []);
    for (var i = 0; i < 5; i++) E.btn(g, d, 0.7 + i * 1.05, 3.45, 0.85, 0.5);
    for (var j = 0; j < 4; j++) E.btn(g, d, 0.7 + j * 1.05, 4.3, 0.85, 0.5);
    E.knob(g, d, 5.75, 4.45, 0.55);
    E.vents(g, d, 7.0, 0.75, 3.3, 3.2, 8);
    E.jack(g, d, 7.9, 4.6, 0.38, '#d42020'); E.jack(g, d, 9.4, 4.6, 0.38, '#1e2124');
  }];
  I.spec = [13, 8, function (g, d) { // analisador de espectro
    E.chassis(g, d, 0, 0, 13, 7.6);
    E.scr(g, d, 0.7, 0.7, 7.4, 5.1, '#2c3a26');
    E.wave(g, d, 0.8, 1.0, 7.2, 4.6, 'spec', '#ffe23a');
    E.grid(g, d, 8.6, 0.75, 4, 7, 0.68, 0.42, 0.17);
    E.knob(g, d, 12.05, 5.45, 0.6);
    E.btn(g, d, 0.9, 6.45, 0.9, 0.5); E.btn(g, d, 2.2, 6.45, 0.9, 0.5);
    E.bnc(g, d, 8.9, 6.7, 0.42); E.bnc(g, d, 10.2, 6.7, 0.42); E.bnc(g, d, 11.5, 6.7, 0.42);
  }];
  I.smps = [10, 6, function (g, d) { // fonte AC/DC chaveada (trilho DIN)
    E.rr(g, d, 0, 0, 10, 6, 0.3, '#cdd2d7', '#6f7983', 0.07);
    E.vents(g, d, 1, 0.45, 8, 1.4, 4);
    E.rr(g, d, 1, 2.1, 8, 1.6, 0.15, '#ffffff', '#9aa3ab', 0.03);
    E.txt(g, d, 'AC/DC', 3.6, 2.9, 0.75, '#1f4fa8'); E.wave(g, d, 6.2, 2.45, 1.2, 0.9, 'sin', '#1f4fa8', 1);
    for (var i = 0; i < 5; i++) {
      E.circ(g, d, 1.5 + i * 1.75, 4.85, 0.45, '#b9bec4', '#555', 0.04);
      g.style({ stroke: d.mono ? '#000' : '#444', lw: 0.08, fill: null }); g.line(1.25 + i * 1.75, 4.85, 1.75 + i * 1.75, 4.85);
    }
    E.circ(g, d, 9.2, 4.0, 0.15, '#2fb36d', 0);
  }];
})(typeof window !== 'undefined' ? window : globalThis);
