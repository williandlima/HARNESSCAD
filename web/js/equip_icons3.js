/* HarnessCAD - ícones realistas (genéricos) — informática e rede */
(function (G) {
  'use strict';
  var HX = G.HX, E = HX.EQD, I = HX.EQ_ICONS = HX.EQ_ICONS || {};
  function poly(g, d, pts, fill, stroke, lw) { g.style({ fill: d.f(fill), stroke: stroke ? (d.mono ? '#000' : stroke) : null, lw: lw || 0.05, dash: null }); g.poly(pts, true); }

  // portas desenhadas (centro x, y): usb, rj (RJ45), hdmi, db9, audio, ac (tomada IEC)
  function port(g, d, t, x, y) {
    if (t === 'usb') { E.rr(g, d, x - 0.32, y - 0.13, 0.64, 0.26, 0.03, '#1b1d20', '#555', 0.02); E.rr(g, d, x - 0.22, y - 0.05, 0.44, 0.08, 0, '#6d757d', 0); }
    else if (t === 'rj') E.rj45(g, d, x - 0.32, y - 0.28, 0.64, 0.56);
    else if (t === 'hdmi') poly(g, d, [[x - 0.4, y - 0.14], [x + 0.4, y - 0.14], [x + 0.3, y + 0.14], [x - 0.3, y + 0.14]], '#1b1d20', '#555', 0.02);
    else if (t === 'db9') { poly(g, d, [[x - 0.6, y - 0.25], [x + 0.6, y - 0.25], [x + 0.48, y + 0.25], [x - 0.48, y + 0.25]], '#c9ced3', '#555', 0.03); }
    else if (t === 'audio') E.circ(g, d, x, y, 0.16, '#1b1d20', '#6fbf4f', 0.04);
    else { E.rr(g, d, x - 0.35, y - 0.3, 0.7, 0.6, 0.08, '#1b1d20', '#555', 0.02); E.rr(g, d, x - 0.2, y - 0.12, 0.4, 0.24, 0, '#6d757d', 0); }
  }
  HX.EQD.port = port;
  // paisagem genérica de papel de parede
  function wallpaper(g, d, x, y, w, h) {
    E.rr(g, d, x, y, w, h * 0.62, 0, '#7cc0f2', 0); E.rr(g, d, x, y + h * 0.62, w, h * 0.38, 0, '#1f4a7a', 0);
    E.circ(g, d, x + w * 0.8, y + h * 0.18, h * 0.08, '#fff2b0', 0);
    poly(g, d, [[x, y + h * 0.66], [x + w * 0.2, y + h * 0.38], [x + w * 0.32, y + h * 0.5], [x + w * 0.52, y + h * 0.18], [x + w * 0.7, y + h * 0.46], [x + w * 0.85, y + h * 0.36], [x + w, y + h * 0.55], [x + w, y + h * 0.66]], '#3d4f7c');
    poly(g, d, [[x + w * 0.47, y + h * 0.26], [x + w * 0.52, y + h * 0.18], [x + w * 0.57, y + h * 0.26], [x + w * 0.52, y + h * 0.24]], '#ffffff');
    poly(g, d, [[x, y + h * 0.66], [x + w * 0.3, y + h * 0.6], [x + w * 0.6, y + h * 0.66]], '#2f6b3a');
  }
  I.laptop = [12, 8, function (g, d) {
    E.rr(g, d, 1.4, 0, 9.2, 6.05, 0.4, '#b8bec6', '#6f7983', 0.06);
    E.rr(g, d, 1.65, 0.25, 8.7, 5.55, 0.2, '#111315', 0);
    wallpaper(g, d, 1.95, 0.5, 8.1, 4.95);
    E.rr(g, d, 4.2, 5.05, 3.6, 0.3, 0.12, '#e9ecef', 0);
    poly(g, d, [[0, 6.2], [12, 6.2], [11.3, 7.65], [0.7, 7.65]], '#c3c9d0', '#6f7983', 0.06);
    E.rr(g, d, 2.0, 6.35, 8.0, 0.65, 0.08, '#3a3f45', 0);
    for (var i = 0; i < 14; i++) E.rr(g, d, 2.15 + i * 0.555, 6.43, 0.45, 0.2, 0.03, '#5b636c', 0);
    E.rr(g, d, 5, 7.08, 2, 0.42, 0.08, '#aeb5bd', 0);
    port(g, d, 'usb', 1.6, 7.3); port(g, d, 'usb', 2.6, 7.3); port(g, d, 'rj', 3.7, 7.3); port(g, d, 'hdmi', 8.5, 7.3); port(g, d, 'audio', 9.7, 7.3);
  }];
  I.pc = [5, 8, function (g, d) {
    E.rr(g, d, 0, 0, 5, 8, 0.3, '#2b2f33', '#111', 0.05);
    E.rr(g, d, 0.4, 0.4, 4.2, 7.2, 0.2, '#3a3f45', 0);
    E.rr(g, d, 0.8, 1.0, 3.4, 0.5, 0.05, '#23272b', 0); E.rr(g, d, 0.8, 1.8, 3.4, 0.5, 0.05, '#23272b', 0);
    E.circ(g, d, 2.5, 5.4, 0.48, '#23272b', '#4aa3ff', 0.08);
    port(g, d, 'usb', 1.85, 6.65); port(g, d, 'usb', 3.15, 6.65); port(g, d, 'usb', 2.5, 7.25);
    E.rr(g, d, 0.8, 2.7, 3.4, 1.9, 0.08, '#2b2f33', 0); port(g, d, 'rj', 3.6, 3.15); port(g, d, 'db9', 2.0, 3.15); port(g, d, 'hdmi', 3.5, 4.1);
  }];
  I.monitor = [10, 8, function (g, d) {
    E.rr(g, d, 0, 0, 10, 6.4, 0.3, '#1b1d20', '#111', 0.05);
    E.rr(g, d, 0.35, 0.35, 9.3, 5.6, 0, '#1e6fd9', 0);
    poly(g, d, [[9.65, 0.35], [9.65, 2.6], [3.5, 5.95], [1.5, 5.95]], '#3f8cf0');
    poly(g, d, [[9.65, 2.6], [9.65, 4.2], [5.5, 5.95], [3.5, 5.95]], '#5aa2ff');
    E.rr(g, d, 4.4, 6.4, 1.2, 0.9, 0, '#2b2f33', 0); E.rr(g, d, 3, 7.3, 4, 0.5, 0.2, '#2b2f33', 0);
    port(g, d, 'hdmi', 6.6, 6.15); port(g, d, 'db9', 7.7, 6.15); port(g, d, 'hdmi', 8.7, 6.15); port(g, d, 'ac', 9.5, 6.1);
  }];
  I.printer = [10, 8, function (g, d) {
    E.rr(g, d, 1.6, 0.3, 6.8, 1.0, 0.3, '#d3d7dc', '#7d8791', 0.05);
    E.rr(g, d, 0.3, 1.0, 9.4, 4.0, 0.6, '#e6e9ec', '#7d8791', 0.06);
    E.rr(g, d, 7.6, 1.6, 1.5, 0.6, 0.1, '#aeb5bd', 0); E.circ(g, d, 7.2, 1.9, 0.15, '#2fb36d', 0);
    E.rr(g, d, 1.5, 4.0, 7, 0.45, 0.1, '#2b2f33', 0);
    poly(g, d, [[1.2, 5.0], [8.8, 5.0], [9.8, 7.6], [0.2, 7.6]], '#cfd5db', '#7d8791', 0.05);
    E.rr(g, d, 2.3, 4.25, 5.4, 2.7, 0, '#ffffff', '#9aa3ab', 0.03);
    for (var i = 0; i < 4; i++) E.rr(g, d, 2.8, 4.7 + i * 0.45, 3.5 - (i % 2) * 1.2, 0.12, 0, '#c3c9d0', 0);
    port(g, d, 'usb', 9.2, 2.6); port(g, d, 'rj', 9.2, 3.3); port(g, d, 'ac', 9.2, 4.15);
  }];
  I.switch = [12, 4, function (g, d) {
    E.rr(g, d, 0, 0.6, 12, 3.0, 0.3, '#3a4046', '#1b1d20', 0.05);
    E.txt(g, d, 'SWITCH', 1.45, 1.25, 0.42, '#ffffff');
    for (var k = 0; k < 4; k++) E.circ(g, d, 0.6 + k * 0.55, 2.6, 0.13, '#2ecc71', 0);
    for (var i = 0; i < 8; i++) { E.rj45(g, d, 3.0 + i * 1.1, 1.3, 1.0, 1.0); E.txt(g, d, String(i + 1), 3.5 + i * 1.1, 2.9, 0.32, '#e0e0e0'); }
  }];
  I.router = [10, 6, function (g, d) {
    E.rr(g, d, 2.0, 0, 0.35, 3.4, 0.15, '#1b1d20', 0); E.rr(g, d, 7.65, 0, 0.35, 3.4, 0.15, '#1b1d20', 0);
    poly(g, d, [[0.4, 3.2], [9.6, 3.2], [10, 5.2], [0, 5.2]], '#2b2f33', '#111', 0.05);
    E.rr(g, d, 0, 5.05, 10, 0.55, 0.2, '#1b1d20', 0);
    for (var i = 0; i < 5; i++) E.circ(g, d, 1.1 + i * 0.5, 4.45, 0.11, '#2ecc71', 0);
    for (var j = 0; j < 5; j++) { E.rj45(g, d, 4.4 + j * 1.05, 3.75, 0.85, 0.8); if (!j && !d.mono) E.rr(g, d, 4.4, 3.75, 0.85, 0.12, 0, '#2f80ed', 0); }
  }];
  I.patch = [12, 4, function (g, d) {
    E.rr(g, d, 0, 0.4, 12, 3.2, 0.1, '#2b2f33', '#111', 0.05);
    E.circ(g, d, 0.35, 1.0, 0.15, '#9aa3ab', 0); E.circ(g, d, 0.35, 3.0, 0.15, '#9aa3ab', 0);
    E.circ(g, d, 11.65, 1.0, 0.15, '#9aa3ab', 0); E.circ(g, d, 11.65, 3.0, 0.15, '#9aa3ab', 0);
    for (var r = 0; r < 2; r++) for (var i = 0; i < 8; i++) E.rj45(g, d, 1.0 + i * 1.25, 0.75 + r * 1.45, 1.05, 1.05);
  }];
})(typeof window !== 'undefined' ? window : globalThis);
