/* HarnessCAD - vista frontal precisa de D-Sub (MIL-DTL-24308, padrão e alta densidade) e Micro-D (MIL-DTL-83513),
   em ESCALA DE DETALHE (ex.: 2:1): passo dos contatos, fileiras, carcaça trapezoidal (10°), flange e furação de fixação
   pelas medidas nominais da série; numeração dos contatos. Face de pinos: 1 no canto superior esquerdo, numerando da
   esquerda para a direita, fileira a fileira; face de soquetes = espelho. Medidas nominais — confira no datasheet. */
(function (G) {
  'use strict';
  var HX = G.HX, T10 = Math.tan(10 * Math.PI / 180);
  // flange (A), furação (B), altura do flange (H), por tamanho de carcaça
  var SH = { E: [30.81, 24.99, 12.55], A: [39.14, 33.32, 12.55], B: [53.04, 47.04, 12.55], C: [69.32, 63.50, 12.55], D: [66.93, 61.11, 15.37] };
  var STD = { 9: ['E', [5, 4]], 15: ['A', [8, 7]], 25: ['B', [13, 12]], 37: ['C', [19, 18]], 50: ['D', [17, 16, 17]] };
  var HD = { 15: ['E', [5, 5, 5]], 26: ['A', [9, 9, 8]], 44: ['B', [15, 15, 14]], 62: ['C', [21, 21, 20]], 78: ['D', [20, 19, 20, 19]] };
  var MD = { 9: [18.80, 12.70], 15: [23.88, 17.78], 21: [27.94, 21.84], 25: [31.00, 24.89], 31: [34.04, 27.94], 37: [39.12, 33.02], 51: [49.28, 43.18], 100: [49.28, 43.18] };
  HX.dsubGeom = function (c) {
    var d = HX.CAT.conns[c.part] || {}, n = c.pins.length, micro = d.fam === 'M83513', hd = /HD/.test(d.label || '') || (/^DSUB/.test(d.fam) && /HD/.test(c.part));
    var t = micro ? null : (hd ? HD : STD)[n];
    var px = micro ? 1.27 : hd ? 2.41 : 2.77, py = micro ? 1.09 : hd ? 1.98 : 2.84;
    var rows = t ? t[1] : [Math.ceil(n / 2), Math.floor(n / 2)];
    var fl = micro ? (MD[n] || [n * 0.7 + 12, n * 0.7 + 6]).concat([7.87]) : SH[t ? t[0] : 'B'];
    var top = (Math.max.apply(0, rows) - 1) * px + (micro ? 2.6 : 5.0), hh = (rows.length - 1) * py + (micro ? 2.4 : 4.6), bot = top - 2 * hh * T10;
    var pts = [], k = 1;
    rows.forEach(function (cnt, r) {
      var y = -hh / 2 + (micro ? 1.2 : 2.3) + r * py, w0 = (cnt - 1) * px;
      for (var i = 0; i < cnt; i++) pts.push({ n: k++, x: -w0 / 2 + i * px, y: y });
    });
    return { shell: t ? t[0] : micro ? 'MD' + n : '?', A: fl[0], B: fl[1], H: fl[2], top: top, bot: bot, hh: hh, pts: pts, px: px, py: py, micro: micro, hd: hd };
  };
  HX.physFaceK = function (c) { return HX.dsubGeom(c).micro ? 2 : 1; }; // escala de detalhe padrão
  HX.physFaceW = function (c, w) { return HX.isDsub(c) ? HX.dsubGeom(c).A * HX.physFaceK(c) : (+w || 14); };
  HX.isDsub = function (c) { return /^(M24308|DSUB|M83513)$/.test((HX.CAT.conns[c.part] || {}).fam); };
  // desenha a face na escala de detalhe k (mm de papel por mm real); retorna a caixa
  HX.physDsubFace = function (g, c, x, y, k, col) {
    var D = HX.dsubGeom(c), soc = c.gender === 'S', m = soc ? -1 : 1, A = D.A * k, H = D.H * k;
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.rect(x - A / 2, y - H / 2, A, H);
    [-1, 1].forEach(function (s) { g.circle(x + s * D.B * k / 2, y, (D.micro ? 1.1 : 1.55) * k); });
    var t = D.top * k / 2, b = D.bot * k / 2, h = D.hh * k / 2, rr = 0.9 * k;
    g.poly([[x - t, y - h], [x + t, y - h], [x + b, y + h], [x - b, y + h]], true);
    g.poly([[x - t + rr, y - h + rr * 0.7], [x + t - rr, y - h + rr * 0.7], [x + b - rr * 0.85, y + h - rr * 0.7], [x - b + rr * 0.85, y + h - rr * 0.7]], true);
    var pr = (D.micro ? 0.32 : 0.5) * k, fs = Math.max(0.9, Math.min(1.5, D.px * k * 0.42));
    D.pts.forEach(function (q) {
      var px = x + m * q.x * k, py = y + q.y * k;
      g.style({ stroke: col, fill: soc ? '#fff' : col, lw: 0.15 }); g.circle(px, py, pr);
      if (D.pts.length <= 50) g.text(String(q.n), px, py - pr - fs * 0.55, { size: fs, align: 'c', color: col });
    });
    g.style({ fill: null });
    return { x0: x - A / 2, y0: y - H / 2, x1: x + A / 2, y1: y + H / 2, geom: D };
  };
})(typeof window !== 'undefined' ? window : globalThis);
