/* HarnessCAD - templates de folha: moldura, zonas, carimbo (ISO / ANSI / Simples) */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.TEMPLATES = { iso: 'ISO 5457 / 7200', ansi: 'ASME Y14.1 (ANSI)', simple: 'Simples', none: 'Sem moldura' };

  function cell(g, x, y, w, h, cap, val, o) {
    g.style({ stroke: o.c, lw: 0.25, fill: null }); g.rect(x, y, w, h);
    if (cap) g.text(cap, x + 0.8, y + 1.7, { size: 1.3, color: o.cap });
    if (val != null && val !== '') {
      var size = o.size || (h >= 12 ? 3.5 : 2.4);
      var s = String(val);
      while (s.length > 2 && HX.textW(s, size) > w - 2) size *= 0.92;
      g.text(s, x + (o.center ? w / 2 : 1.2), y + (cap ? h * 0.6 : h / 2), { size: size, bold: !!o.bold, align: o.center ? 'c' : 'l', color: o.v });
    }
  }

  HX.frameMargins = function (p) {
    var t = p.meta.template;
    if (t === 'none') return { l: 0, t: 0, r: 0, b: 0 };
    if (t === 'iso') return { l: 20, t: 10, r: 10, b: 10 };
    return { l: 10, t: 10, r: 10, b: 10 };
  };

  HX.drawFrame = function (g, p, s, opt) {
    opt = opt || {};
    var m = p.meta, t = m.template || 'iso', sh0 = p.sheets[s];
    if (sh0 && sh0.kind === 'phys') m = Object.assign({}, m, { scale: '1:' + String(sh0.scale).replace('.', ',') }); // escala da folha física no carimbo
    if (t === 'none') return;
    var d = HX.sheetDims(m), W = d[0], H = d[1], M = HX.frameMargins(p);
    var o = { c: opt.mono ? '#000' : '#7a2020', cap: opt.mono ? '#444' : '#8a6060', v: opt.mono ? '#000' : '#202020' };
    var fx0 = M.l, fy0 = M.t, fx1 = W - M.r, fy1 = H - M.b;
    // linhas de borda
    g.style({ stroke: o.c, lw: 0.2, fill: null }); g.rect(5, 5, W - 10, H - 10);
    g.style({ stroke: o.c, lw: 0.6 }); g.rect(fx0, fy0, fx1 - fx0, fy1 - fy0);
    // zonas
    var nx = Math.max(4, Math.round((fx1 - fx0) / 50 / 2) * 2), ny = Math.max(4, Math.round((fy1 - fy0) / 50 / 2) * 2);
    var ansi = t === 'ansi', L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
    g.style({ stroke: o.c, lw: 0.2 });
    for (var i = 0; i < nx; i++) {
      var x = fx0 + (fx1 - fx0) * i / nx, xc = fx0 + (fx1 - fx0) * (i + 0.5) / nx, lab = String(ansi ? nx - i : i + 1);
      if (i > 0) { g.line(x, 5, x, fy0); g.line(x, fy1, x, H - 5); }
      g.text(lab, xc, (5 + fy0) / 2, { size: 2.2, align: 'c', color: o.c });
      g.text(lab, xc, (fy1 + H - 5) / 2, { size: 2.2, align: 'c', color: o.c });
    }
    for (var j = 0; j < ny; j++) {
      var y = fy0 + (fy1 - fy0) * j / ny, yc = fy0 + (fy1 - fy0) * (j + 0.5) / ny, lb = L[ansi ? ny - 1 - j : j];
      if (j > 0) { g.line(5, y, fx0, y); g.line(fx1, y, W - 5, y); }
      g.text(lb, (5 + fx0) / 2, yc, { size: 2.2, align: 'c', color: o.c });
      g.text(lb, (fx1 + W - 5) / 2, yc, { size: 2.2, align: 'c', color: o.c });
    }
    // centro (marcas)
    g.style({ stroke: o.c, lw: 0.4 });
    g.line(W / 2, 0, W / 2, 5); g.line(W / 2, H - 5, W / 2, H); g.line(0, H / 2, 5, H / 2); g.line(W - 5, H / 2, W, H / 2);

    var sh = p.sheets[s] || {}, nSh = p.sheets.length, sheetTxt = (s + 1) + ' / ' + nSh;
    if (t === 'simple') {
      var bx = fx1 - 130, by = fy1 - 24;
      cell(g, bx, by, 80, 12, 'TÍTULO', m.title, Object.assign({ bold: true }, o));
      cell(g, bx + 80, by, 50, 12, 'EMPRESA', m.company, o);
      cell(g, bx, by + 12, 50, 12, 'DOCUMENTO', m.docNo, Object.assign({ bold: true }, o));
      cell(g, bx + 50, by + 12, 15, 12, 'REV', m.rev, Object.assign({ center: true }, o));
      cell(g, bx + 65, by + 12, 25, 12, 'FOLHA', sheetTxt, Object.assign({ center: true }, o));
      cell(g, bx + 90, by + 12, 40, 12, 'DATA', m.date, o);
      return;
    }
    // ISO / ANSI: bloco 180 mm
    var X = fx1 - 180, Y = fy1 - 40;
    cell(g, X, Y, 60, 16, ansi ? 'COMPANY' : 'EMPRESA', m.company, Object.assign({ bold: true }, o));
    cell(g, X + 60, Y, 120, 16, ansi ? 'TITLE' : 'TÍTULO', m.title + (sh.name && nSh > 1 ? ' — ' + sh.name : ''), Object.assign({ bold: true }, o));
    var r2 = Y + 16;
    if (ansi) {
      cell(g, X, r2, 20, 12, 'SIZE', (m.size || '').replace(/ANSI |\s*\(.*\)/g, ''), Object.assign({ center: true }, o));
      cell(g, X + 20, r2, 30, 12, 'CAGE CODE', m.cage, Object.assign({ center: true }, o));
      cell(g, X + 50, r2, 80, 12, 'DWG NO', m.docNo, Object.assign({ bold: true }, o));
      cell(g, X + 130, r2, 15, 12, 'REV', m.rev, Object.assign({ center: true }, o));
      cell(g, X + 145, r2, 35, 12, 'SHEET', sheetTxt, Object.assign({ center: true }, o));
    } else {
      cell(g, X, r2, 80, 12, 'Nº DOCUMENTO', m.docNo, Object.assign({ bold: true }, o));
      cell(g, X + 80, r2, 20, 12, 'REV', m.rev, Object.assign({ center: true }, o));
      cell(g, X + 100, r2, 30, 12, 'FOLHA', sheetTxt, Object.assign({ center: true }, o));
      cell(g, X + 130, r2, 25, 12, 'FORMATO', m.size + (m.orient === 'P' ? ' R' : ''), Object.assign({ center: true }, o));
      cell(g, X + 155, r2, 25, 12, 'ESCALA', m.scale, Object.assign({ center: true }, o));
    }
    var r3 = r2 + 12, cw = 36;
    [[ansi ? 'DRAWN' : 'DESENHO', m.author], [ansi ? 'CHECKED' : 'VERIFICADO', m.checked], [ansi ? 'APPROVED' : 'APROVADO', m.approved],
      [ansi ? 'DATE' : 'DATA', m.date], [ansi ? 'SCALE' : 'UNIDADE', ansi ? m.scale : 'mm']].forEach(function (c, i) {
      cell(g, X + i * cw, r3, cw, 12, c[0], c[1], o);
    });
    // tabela de revisões acima do carimbo
    var revs = (m.revs || []).slice(-6), ry = Y - 5 * (revs.length + 1);
    if (revs.length) {
      var cols = [[0, 15, 'REV'], [15, 105, ansi ? 'DESCRIPTION' : 'DESCRIÇÃO'], [120, 30, ansi ? 'DATE' : 'DATA'], [150, 30, ansi ? 'BY' : 'POR']];
      cols.forEach(function (c) { cell(g, X + c[0], ry, c[1], 5, null, c[2], Object.assign({ size: 1.6, bold: true, center: true }, o)); });
      revs.forEach(function (r, k) {
        var yy = ry + 5 * (k + 1);
        cell(g, X, yy, 15, 5, null, r.rev, Object.assign({ size: 1.8, center: true }, o));
        cell(g, X + 15, yy, 105, 5, null, r.desc, Object.assign({ size: 1.8 }, o));
        cell(g, X + 120, yy, 30, 5, null, r.date, Object.assign({ size: 1.8, center: true }, o));
        cell(g, X + 150, yy, 30, 5, null, r.by, Object.assign({ size: 1.8, center: true }, o));
      });
    }
  };

  // Área útil (dentro da moldura e fora do carimbo) para tabelas no PDF
  HX.usableArea = function (p) {
    var d = HX.sheetDims(p.meta), M = HX.frameMargins(p);
    return { x0: M.l + 4, y0: M.t + 4, x1: d[0] - M.r - 4, y1: d[1] - M.b - (p.meta.template === 'none' ? 4 : p.meta.template === 'simple' ? 28 : 44) - 5 * ((p.meta.revs || []).slice(-6).length + 1) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
