/* HarnessCAD - componentes discretos (resistor, capacitor, fusível, diodo, LED...)
   Entram como "conector" de 2 terminais (pino 1 à esquerda, 2 à direita), com símbolo próprio e campo Valor.
   O PN na BOM vira "Resistor 120 Ω", "Fusível 2 A" etc. — use PN manual para o código do fabricante. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function two(a, b) { return [{ n: a, name: '', s: 'L' }, { n: b, name: '', s: 'R' }]; }
  var LIST = [
    ['Resistor', 'res', 'R', '1', '2', '1k'], ['Resistor (IEC, retângulo)', 'resi', 'R', '1', '2', '1k'], ['Termistor NTC', 'ntc', 'RT', '1', '2', '10k'],
    ['Capacitor', 'cap', 'C', '1', '2', '100n'], ['Capacitor eletrolítico', 'cape', 'C', '+', '-', '10µ/25V'],
    ['Indutor', 'ind', 'L', '1', '2', '10µH'], ['Ferrite', 'fer', 'FB', '1', '2', ''],
    ['Fusível', 'fuse', 'F', '1', '2', '2A'], ['Diodo', 'dio', 'D', 'A', 'K', '1N4007'], ['Diodo zener', 'zen', 'D', 'A', 'K', '5V1'],
    ['LED', 'led', 'D', 'A', 'K', ''], ['TVS bidirecional', 'tvs', 'D', '1', '2', ''],
    ['Chave (NA)', 'sw', 'S', '1', '2', ''], ['Botão (NA)', 'btn', 'S', '1', '2', ''], ['Lâmpada', 'lamp', 'H', '1', '2', ''], ['Bateria', 'bat', 'BT', '+', '-', '12V']
  ];
  HX.catFamily({ fam: 'DISC', std: 'COM', mfr: 'Componente', desc: 'Componentes discretos', refPfx: 'R', pn: function (e) { return e.label; },
    items: LIST.map(function (a) { return { label: a[0], disc: a[1], refPfx: a[2], side: 'M', wu: 4, minRows: 1, val: a[5], pins: two(a[3], a[4]) }; }) });

  // PN na BOM: nome + valor
  var pn0 = HX.connPN;
  HX.connPN = function (c) {
    if (!c.disc || c.pnOverride) return pn0(c);
    var d = HX.getConnDef(c.part); return ((d && d.label) || c.part) + (c.val ? ' ' + c.val : '');
  };
  var st0 = HX.connStyle;
  HX.connStyle = function (c, p) { return c.disc ? 'disc' : st0(c, p); };

  function arc(cx, cy, r, a0, a1, n) { var pts = []; for (var i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return pts; }
  function tri(g, x0, x1, y, h, f) { g.style({ fill: f }); g.poly([[x0, y - h], [x1, y], [x0, y + h]], true); g.style({ fill: null }); }
  function arrow(g, x, y, dx, dy) { var l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; g.line(x, y, x + dx, y + dy); g.poly([[x + dx - ux * 0.6 - uy * 0.35, y + dy - uy * 0.6 + ux * 0.35], [x + dx, y + dy], [x + dx - ux * 0.6 + uy * 0.35, y + dy - uy * 0.6 - ux * 0.35]], false); }

  // cada desenho: corpo entre a = início e b = fim (em x), centro cx, linha y; terminais já ligam em 0 e w
  var DRAW = {
    res: function (g, a, b, y) { var n = 6, s = (b - a) / n, pts = [[a, y]]; for (var i = 0; i < n; i++) pts.push([a + s * (i + 0.5), y + (i % 2 ? 0.9 : -0.9)]); pts.push([b, y]); g.poly(pts, false); },
    resi: function (g, a, b, y) { g.rect(a, y - 0.8, b - a, 1.6); },
    ntc: function (g, a, b, y) { DRAW.resi(g, a, b, y); g.poly([[a - 0.4, y + 1.6], [a + 0.6, y + 1.6], [b + 0.4, y - 1.6]], false); },
    cap: function (g, a, b, y, cx) { g.line(a, y, cx - 0.45, y); g.line(cx + 0.45, y, b, y); g.line(cx - 0.45, y - 1.6, cx - 0.45, y + 1.6); g.line(cx + 0.45, y - 1.6, cx + 0.45, y + 1.6); },
    cape: function (g, a, b, y, cx) { g.line(a, y, cx - 0.45, y); g.line(cx + 0.55, y, b, y); g.line(cx - 0.45, y - 1.6, cx - 0.45, y + 1.6);
      g.poly(arc(cx + 2.3, y, 1.9, Math.PI * 0.68, Math.PI * 1.32, 10), false); g.line(cx - 1.9, y - 1.6, cx - 1.1, y - 1.6); g.line(cx - 1.5, y - 2.0, cx - 1.5, y - 1.2); },
    ind: function (g, a, b, y) { var n = 4, r = (b - a) / n / 2; for (var i = 0; i < n; i++) g.poly(arc(a + r * (2 * i + 1), y, r, Math.PI, 2 * Math.PI, 8), false); },
    fer: function (g, a, b, y, cx, f) { g.line(a, y, b, y); g.style({ fill: f }); g.rect(cx - 1.5, y - 0.9, 3, 1.8); g.style({ fill: null }); },
    fuse: function (g, a, b, y) { g.rect(a, y - 0.75, b - a, 1.5); g.line(a - 0.5, y, b + 0.5, y); },
    dio: function (g, a, b, y, cx, f) { g.line(a, y, b, y); tri(g, cx - 1.2, cx + 1.0, y, 1.2, f); g.line(cx + 1.0, y - 1.2, cx + 1.0, y + 1.2); },
    zen: function (g, a, b, y, cx, f) { DRAW.dio(g, a, b, y, cx, f); g.line(cx + 1.0, y - 1.2, cx + 1.5, y - 1.5); g.line(cx + 1.0, y + 1.2, cx + 0.5, y + 1.5); },
    led: function (g, a, b, y, cx, f) { DRAW.dio(g, a, b, y, cx, f); arrow(g, cx - 0.4, y - 1.3, 0.9, -0.9); arrow(g, cx + 0.5, y - 1.3, 0.9, -0.9); },
    tvs: function (g, a, b, y, cx, f) { g.line(a, y, b, y); tri(g, cx - 2.0, cx, y, 1.1, f); tri(g, cx + 2.0, cx, y, 1.1, f); g.line(cx, y - 1.3, cx, y + 1.3); g.line(cx, y - 1.3, cx - 0.4, y - 1.6); g.line(cx, y + 1.3, cx + 0.4, y + 1.6); },
    sw: function (g, a, b, y, cx) { g.line(a, y, cx - 1.6, y); g.line(cx + 1.6, y, b, y); g.circle(cx - 1.6, y, 0.3); g.circle(cx + 1.6, y, 0.3); g.line(cx - 1.4, y - 0.15, cx + 1.7, y - 1.5); },
    btn: function (g, a, b, y, cx) { g.line(a, y, cx - 1.6, y); g.line(cx + 1.6, y, b, y); g.circle(cx - 1.6, y, 0.3); g.circle(cx + 1.6, y, 0.3); g.line(cx - 1.8, y - 1.0, cx + 1.8, y - 1.0); g.line(cx, y - 1.0, cx, y - 2.2); g.line(cx - 0.6, y - 2.2, cx + 0.6, y - 2.2); },
    lamp: function (g, a, b, y, cx) { var r = 1.6; g.line(a, y, cx - r, y); g.line(cx + r, y, b, y); g.circle(cx, y, r); var k = r * 0.7; g.line(cx - k, y - k, cx + k, y + k); g.line(cx - k, y + k, cx + k, y - k); },
    bat: function (g, a, b, y, cx) { g.line(a, y, cx - 0.5, y); g.line(cx + 0.5, y, b, y); g.line(cx - 0.5, y - 1.8, cx - 0.5, y + 1.8); g.style({ lw: 0.55 }); g.line(cx + 0.5, y - 0.9, cx + 0.5, y + 0.9); }
  };
  HX.DISC_DRAW = DRAW;

  HX.SYMBOLS.disc = function (g, c, p, sheet, o, L) {
    var T = o.theme, w = L.w, mono = !!o.mono, col = mono ? '#000' : '#7a1010', fill = mono ? '#000' : '#7a1010';
    var first = L.pins.filter(function (q) { return q.n === (c.pins[0] || {}).n; })[0], y = first ? first.ly : L.H + L.p / 2;
    var flip = first && first.side === 'R', cx = w / 2, a = Math.min(2, w * 0.2), b = w - a, f = DRAW[c.disc] || DRAW.resi;
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
    if (flip) g.push([-1, 0, 0, 1, w, 0]); // espelhado: o pino 1 (ânodo, +) vai para a direita
    g.style({ stroke: col, lw: 0.3, fill: null, dash: null });
    g.line(0, y, a, y); g.line(b, y, w, y); // terminais até o corpo
    f(g, a, b, y, cx, fill);
    if (flip) g.pop();
    g.text(c.ref || '?', cx, y - 3.8, { size: 2.2, bold: true, align: 'c', color: T.txt });
    if (c.val) g.text(c.val, cx, y + 3.3, { size: 1.8, align: 'c', color: T.txt });
  };
})(typeof window !== 'undefined' ? window : globalThis);
