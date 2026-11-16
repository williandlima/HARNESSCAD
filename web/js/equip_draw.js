/* HarnessCAD - primitivas de desenho realista dos equipamentos (chassi, display, knob, bornes, BNC...)
   Coordenadas em unidades do ícone; d = { mono, f(cor) -> preenchimento (null em P&B), ink: cor do traço } */
(function (G) {
  'use strict';
  var HX = G.HX, E = HX.EQD = {};

  E.rr = function (g, d, x, y, w, h, r, fill, stroke, lw) {
    g.style({ fill: fill == null ? null : d.f(fill), stroke: stroke === 0 ? null : d.mono ? '#000' : (stroke || '#6f7983'), lw: lw || 0.05, dash: null });
    r = Math.min(r || 0, w / 2, h / 2);
    if (!r) { g.rect(x, y, w, h); return; }
    var p = [], c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    c.forEach(function (q) { for (var i = 0; i <= 4; i++) { var a = (q[2] + i * 22.5) * Math.PI / 180; p.push([q[0] + r * Math.cos(a), q[1] + r * Math.sin(a)]); } });
    g.poly(p, true);
  };
  E.circ = function (g, d, x, y, r, fill, stroke, lw) {
    g.style({ fill: fill == null ? null : d.f(fill), stroke: stroke === 0 ? null : d.mono ? '#000' : (stroke || '#5f6870'), lw: lw || 0.04, dash: null });
    g.circle(x, y, r);
  };
  // figura espelhada: o texto é desespelhado no próprio ponto, para continuar legível
  E.txt = function (g, d, s, x, y, size, col, align, bold) {
    var o = { size: size, color: d.mono ? '#000' : col, align: align || 'c', bold: bold !== false };
    if (!d.mx && !d.my) return g.text(s, x, y, o);
    if (d.mx && o.align !== 'c') o.align = o.align === 'l' ? 'r' : 'l';
    g.push([d.mx ? -1 : 1, 0, 0, d.my ? -1 : 1, x, y]); g.text(s, 0, 0, o); g.pop();
  };
  // chassi de bancada: pezinhos, corpo, faixa de brilho superior e sombra inferior
  E.chassis = function (g, d, x, y, w, h, col) {
    col = col || '#dde1e6';
    E.rr(g, d, x + w * 0.06, y + h - 0.2, w * 0.14, 0.45, 0.1, '#2b2f33', 0);
    E.rr(g, d, x + w * 0.8, y + h - 0.2, w * 0.14, 0.45, 0.1, '#2b2f33', 0);
    E.rr(g, d, x, y, w, h, 0.45, col, '#7d8791', 0.07);
    E.rr(g, d, x + 0.15, y + 0.12, w - 0.3, h * 0.07, 0.2, '#f6f7f9', 0);
    E.rr(g, d, x + 0.15, y + h * 0.9, w - 0.3, h * 0.08, 0.2, '#c3c9d0', 0);
  };
  // display: lines = [[texto, cor, tamanho, alinhamento(l/c/r)]]
  E.disp = function (g, d, x, y, w, h, lines, bg) {
    E.rr(g, d, x - 0.12, y - 0.12, w + 0.24, h + 0.24, 0.25, '#9aa3ab', 0);
    E.rr(g, d, x, y, w, h, 0.18, bg || '#0c0e10', '#30353a', 0.04);
    var gl = { '#c9d5b6': '#d9e3c9', '#f4c84a': '#f8da82' }[bg] || '#1d2329';
    g.style({ fill: d.f(gl), stroke: null, dash: null });
    g.poly([[x + w * 0.04, y + h * 0.08], [x + w * 0.42, y + h * 0.08], [x + w * 0.24, y + h * 0.92], [x + w * 0.04, y + h * 0.92]], true);
    (lines || []).forEach(function (l, i) {
      var yy = y + h * (i + 0.5) / lines.length, al = l[3] || 'c';
      E.txt(g, d, l[0], al === 'l' ? x + 0.35 : al === 'r' ? x + w - 0.35 : x + w / 2, yy, l[2] || h / lines.length * 0.6, l[1] || '#c8f04a', al);
    });
  };
  E.knob = function (g, d, x, y, r) {
    E.circ(g, d, x, y + r * 0.08, r * 1.05, '#7b848d', 0);
    E.circ(g, d, x, y, r, '#eceef1', '#8a939c', 0.05);
    E.circ(g, d, x, y, r * 0.72, '#f7f8fa', '#c2c8ce', 0.03);
    E.circ(g, d, x - r * 0.3, y - r * 0.3, r * 0.18, '#ffffff', 0);
    g.style({ stroke: d.mono ? '#000' : '#4a5158', lw: r * 0.1, fill: null }); g.line(x, y, x + r * 0.45, y - r * 0.55);
  };
  E.jack = function (g, d, x, y, r, col) {
    E.circ(g, d, x, y, r, col || '#d42020', '#3b2b2b', 0.04);
    E.circ(g, d, x, y, r * 0.62, '#1c1e20', 0);
    E.circ(g, d, x, y, r * 0.3, '#b9bec4', 0);
  };
  E.bnc = function (g, d, x, y, r) {
    E.circ(g, d, x, y, r, '#d3d7dc', '#6d757d', 0.05);
    E.circ(g, d, x, y, r * 0.72, '#a3abb3', '#6d757d', 0.03);
    E.circ(g, d, x, y, r * 0.45, '#3b3f44', 0);
    E.circ(g, d, x, y, r * 0.12, '#e9ecef', 0);
  };
  E.btn = function (g, d, x, y, w, h, col) { E.rr(g, d, x, y, w, h, Math.min(w, h) * 0.3, col || '#cfd5db', '#8d969f', 0.03); };
  E.grid = function (g, d, x, y, cols, rows, bw, bh, gap, col) {
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) E.btn(g, d, x + c * (bw + gap), y + r * (bh + gap), bw, bh, col);
  };
  E.badge = function (g, d, x, y, r, col, s) { E.circ(g, d, x, y, r, col, 0); E.txt(g, d, s, x, y, r * 1.3, '#ffffff'); };
  // traço de forma de onda; kind: 'sin' | 'sq' | 'spec'
  E.wave = function (g, d, x, y, w, h, kind, col, n) {
    var p = [], N = kind === 'spec' ? 90 : 60;
    for (var i = 0; i <= N; i++) {
      var t = i / N, v;
      if (kind === 'sq') v = (Math.floor(t * (n || 3) * 2) % 2) ? 0.85 : 0.15;
      else if (kind === 'spec') v = 0.12 + 0.12 * Math.abs(Math.sin(i * 7.3)) + 0.08 * Math.abs(Math.sin(i * 2.1)) + 0.75 * Math.exp(-Math.pow((t - 0.5) * 22, 2));
      else v = 0.5 + 0.4 * Math.sin(t * Math.PI * 2 * (n || 3));
      p.push([x + w * t, y + h * (1 - v)]);
    }
    g.style({ stroke: d.mono ? '#000' : col, lw: Math.max(0.06, h * 0.03), fill: null, dash: null }); g.poly(p, false);
  };
  E.scr = function (g, d, x, y, w, h, gridCol) {
    E.rr(g, d, x - 0.15, y - 0.15, w + 0.3, h + 0.3, 0.2, '#2a2e33', 0);
    E.rr(g, d, x, y, w, h, 0.1, '#06120c', 0);
    g.style({ stroke: d.mono ? '#bbb' : (gridCol || '#24453a'), lw: 0.025, fill: null, dash: [0.12, 0.12] });
    for (var i = 1; i < 10; i++) g.line(x + w * i / 10, y, x + w * i / 10, y + h);
    for (var j = 1; j < 8; j++) g.line(x, y + h * j / 8, x + w, y + h * j / 8);
    g.style({ dash: null });
  };
  E.rj45 = function (g, d, x, y, w, h) {
    E.rr(g, d, x, y, w, h, 0.05, '#e9ecef', '#555', 0.03);
    E.rr(g, d, x + w * 0.12, y + h * 0.15, w * 0.76, h * 0.62, 0.02, '#16181a', 0);
    E.rr(g, d, x + w * 0.32, y + h * 0.7, w * 0.36, h * 0.2, 0, '#16181a', 0);
  };
  E.vents = function (g, d, x, y, w, h, n) {
    for (var i = 0; i < n; i++) E.rr(g, d, x, y + i * h / n, w, h / n * 0.55, h / n * 0.25, '#3a4046', 0);
  };
})(typeof window !== 'undefined' ? window : globalThis);
