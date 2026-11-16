/* HarnessCAD - gabarito de montagem 1:1 (formboard): o desenho físico em TAMANHO REAL dividido em folhas A4/A3 com
   sobreposição para colar, marcas de emenda (cruzes nos cantos), identificação linha/coluna e régua de 100 mm para
   conferir a impressão ("tamanho real", sem ajustar à página). Página 1 = índice com a grade das folhas. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT;
  HX.PAPERS = { A4: [210, 297], A3: [297, 420] };
  var NULLG = { style: noop, line: noop, poly: noop, rect: noop, circle: noop, push: noop, pop: noop, text: noop, image: function () { return true; } };
  function noop() {}
  HX.formboardLayout = function (p, opt) {
    opt = opt || {}; var si0 = -1; p.sheets.forEach(function (s, i) { if (si0 < 0 && HX.isPhys(s)) si0 = i; }); if (si0 < 0) return null;
    var p2 = HX.clone(p), sh = p2.sheets[si0];
    sh.items = sh.items.filter(function (i) { return i.type !== 'ptable' && i.type !== 'text'; });
    HX.physRescale(sh, 1);
    HX.drawSheetItems(NULLG, p2, si0, {});
    var b = null; sh.items.forEach(function (i) { var X = EXT[i.type]; if (!X) return; var q = X.bbox(i); if (!q || (q.x1 - q.x0 <= 0 && q.y1 - q.y0 <= 0)) return; b = b ? { x0: Math.min(b.x0, q.x0), y0: Math.min(b.y0, q.y0), x1: Math.max(b.x1, q.x1), y1: Math.max(b.y1, q.y1) } : HX.clone(q); });
    if (!b) return null;
    b.x0 -= 5; b.y0 -= 5; b.x1 += 5; b.y1 += 5;
    var P = HX.PAPERS[opt.paper || 'A4'], land = opt.orient === 'land', pw = land ? P[1] : P[0], ph = land ? P[0] : P[1], M = 10, ov = opt.overlap == null ? 15 : +opt.overlap;
    var W = pw - 2 * M, H = ph - 2 * M - 12, sx = W - ov, sy = H - ov, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    var cols = Math.max(1, Math.ceil((bw - ov) / sx)), rows = Math.max(1, Math.ceil((bh - ov) / sy));
    return { p2: p2, si: si0, b: b, pw: pw, ph: ph, M: M, ov: ov, W: W, H: H, sx: sx, sy: sy, cols: cols, rows: rows };
  };
  function cross(g, x, y) { g.line(x - 4, y, x + 4, y); g.line(x, y - 4, x, y + 4); g.circle(x, y, 1.5); }
  function ruler(g, x, y) { g.style({ stroke: '#000', lw: 0.25, fill: null }); g.line(x, y, x + 100, y); for (var i = 0; i <= 10; i++) g.line(x + i * 10, y, x + i * 10, y - (i % 5 ? 1.5 : 3)); g.text('conferir: 100 mm', x + 50, y + 2.5, { size: 2, align: 'c', color: '#000' }); }
  HX.exportFormboard = function (p, opt) {
    var L = HX.formboardLayout(p, opt); if (!L) return null;
    var pdf = new HX.Pdf({ title: 'Gabarito 1:1 — ' + (p.meta.number || '') }), m = p.meta, tot = L.cols * L.rows, id = (m.number || '') + (m.rev ? ' rev ' + m.rev : '');
    // índice
    var g = pdf.addPage(L.pw, L.ph), bw = L.b.x1 - L.b.x0, bh = L.b.y1 - L.b.y0, k = Math.min(L.W / bw, (L.H - 10) / bh);
    g.text('GABARITO DE MONTAGEM 1:1 — ' + id + ' — ' + tot + ' folha(s) ' + (opt.paper || 'A4') + ' — ÍNDICE', L.M, L.M + 3, { size: 3, bold: true, color: '#000' });
    g.text('Imprimir em TAMANHO REAL (100%, sem "ajustar à página"). Conferir a régua de 100 mm de cada folha. Colar pelas cruzes da sobreposição (' + L.ov + ' mm).', L.M, L.M + 8, { size: 2, color: '#000' });
    var ox = L.M - L.b.x0 * k, oy = L.M + 14 - L.b.y0 * k;
    g.push([k, 0, 0, k, ox, oy]); HX.drawSheetItems(g, L.p2, L.si, {}); g.pop();
    for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
      var x = ox + (L.b.x0 + c * L.sx) * k, y = oy + (L.b.y0 + r * L.sy) * k;
      g.style({ stroke: '#d00', lw: 0.3, fill: null, dash: [2, 1] }); g.rect(x, y, L.W * k, L.H * k); g.style({ dash: null });
      g.text('L' + (r + 1) + 'C' + (c + 1), x + 2, y + 3, { size: 2.5, bold: true, color: '#d00' });
    }
    // folhas
    var n = 0;
    for (r = 0; r < L.rows; r++) for (c = 0; c < L.cols; c++) {
      n++; g = pdf.addPage(L.pw, L.ph);
      var tx = L.b.x0 + c * L.sx, ty = L.b.y0 + r * L.sy;
      g.push([1, 0, 0, 1, L.M - tx, L.M - ty]); HX.drawSheetItems(g, L.p2, L.si, {}); g.pop();
      g.style({ stroke: '#fff', lw: 0, fill: '#fff', dash: null }); g.rect(0, L.M + L.H, L.pw, L.ph - L.M - L.H); g.rect(0, 0, L.pw, L.M); g.rect(0, 0, L.M, L.ph); g.rect(L.M + L.W, 0, L.pw, L.ph); // margens limpas
      g.style({ stroke: '#000', lw: 0.2, fill: null, dash: null }); g.rect(L.M, L.M, L.W, L.H);
      g.style({ stroke: '#888', lw: 0.15, dash: [1.5, 1] });
      if (c < L.cols - 1) g.line(L.M + L.W - L.ov, L.M, L.M + L.W - L.ov, L.M + L.H); if (r < L.rows - 1) g.line(L.M, L.M + L.H - L.ov, L.M + L.W, L.M + L.H - L.ov);
      g.style({ stroke: '#000', lw: 0.2, dash: null });
      [[L.M + L.ov / 2, L.M + L.ov / 2], [L.M + L.W - L.ov / 2, L.M + L.ov / 2], [L.M + L.ov / 2, L.M + L.H - L.ov / 2], [L.M + L.W - L.ov / 2, L.M + L.H - L.ov / 2]].forEach(function (q) { cross(g, q[0], q[1]); });
      g.text('GABARITO 1:1 — ' + id + ' — folha L' + (r + 1) + 'C' + (c + 1) + ' (' + n + '/' + tot + ')', L.M, L.M + L.H + 5, { size: 2.4, bold: true, color: '#000' });
      g.text((c < L.cols - 1 ? 'continua à direita em L' + (r + 1) + 'C' + (c + 2) + '   ' : '') + (r < L.rows - 1 ? 'continua abaixo em L' + (r + 2) + 'C' + (c + 1) : ''), L.M, L.M + L.H + 9.5, { size: 2, color: '#000' });
      ruler(g, L.pw - L.M - 105, L.M + L.H + 6);
    }
    return pdf.build();
  };
})(typeof window !== 'undefined' ? window : globalThis);
