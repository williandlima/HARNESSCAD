/* HarnessCAD - montagem do PDF: folhas de desenho + tabelas (De-Para, BOM, pinagem) */
(function (G) {
  'use strict';
  var HX = G.HX;

  function table(g, area, title, cols, rows, mono) {
    var x0 = area.x0, y = area.y0, W = area.x1 - area.x0, rh = 5, fs = 2.0;
    var tot = cols.reduce(function (a, c) { return a + c.w; }, 0);
    g.text(title, x0, y + 3, { size: 3.5, bold: true, color: '#000' }); y += 7;
    function header() {
      var x = x0;
      g.style({ stroke: '#000', lw: 0.25, fill: mono ? '#e6e6e6' : '#dfe8f5' }); g.rect(x0, y, W, rh);
      cols.forEach(function (c) {
        var cw = c.w / tot * W; g.style({ fill: null }); g.line(x, y, x, y + rh);
        g.text(c.t, x + 1, y + rh / 2, { size: fs, bold: true, color: '#000' }); x += cw;
      });
      y += rh;
    }
    header();
    var i = 0;
    while (i < rows.length && y + rh <= area.y1) {
      var r = rows[i], x = x0;
      if (i % 2) { g.style({ stroke: null, fill: '#f4f6f9' }); g.rect(x0, y, W, rh); }
      g.style({ stroke: '#999', lw: 0.12, fill: null }); g.line(x0, y + rh, x0 + W, y + rh);
      cols.forEach(function (c) {
        var cw = c.w / tot * W, v = String(typeof c.k === 'function' ? c.k(r) : (r[c.k] == null ? '' : r[c.k]));
        while (v.length > 1 && HX.pdfTextWidth(v, fs) > cw - 2) v = v.slice(0, -2) + '…';
        g.text(v, x + 1, y + rh / 2, { size: fs, color: '#000' }); x += cw;
      });
      y += rh; i++;
    }
    g.style({ stroke: '#000', lw: 0.25, fill: null });
    var h = y - (area.y0 + 7); g.rect(x0, area.y0 + 7, W, h);
    var xx = x0; cols.forEach(function (c, k) { if (k) g.line(xx, area.y0 + 7, xx, y); xx += c.w / tot * W; });
    return i; // linhas consumidas
  }

  // opts: { sections: [...] (ver print.js), mono } ou o formato antigo { wirelist, bom, pinout, only, mono }
  HX.exportPDF = function (p, opts) {
    opts = opts || {};
    var nl = HX.buildNetlist(p), pages = [], cfg = opts.sections ? opts : HX.printFromLegacy(p, opts), idx = null;
    var area0 = HX.usableArea(p), per = Math.max(1, Math.floor((area0.y1 - area0.y0 - 12) / 5));
    function addTable(title, cols, rows, name) {
      if (!rows.length) rows = [{}];
      for (var i = 0; i < rows.length; i += per) pages.push({ kind: 'table', title: title + (rows.length > per ? ' (' + (i / per + 1) + ')' : ''), cols: cols, rows: rows.slice(i, i + per), name: name || title });
    }
    cfg.sections.forEach(function (sc) {
      var def = sc.on && HX.printSection(sc.id); if (!def) return;
      if (sc.id === 'sheets') {
        (sc.sheets || p.sheets.map(function (_, i) { return i; })).forEach(function (s) { if (p.sheets[s]) pages.push({ kind: 'sheet', s: s, name: p.sheets[s].name }); });
      } else if (sc.id === 'index') idx = { at: pages.length, def: def };
      else {
        var cols = def.cols.filter(function (c) { return !sc.cols || sc.cols.indexOf(c.k) >= 0; });
        addTable(def.t, cols.length ? cols : def.cols, def.rows(p, nl), def.t);
      }
    });
    if (idx) { // índice: páginas numeradas já contando as próprias páginas do índice
      var nIdx = Math.max(1, Math.ceil(pages.length / per)), rows = pages.map(function (pg, j) {
        return { pg: j < idx.at ? j + 1 : j + 1 + nIdx, title: pg.kind === 'sheet' ? pg.name : pg.title, kind: pg.kind === 'sheet' ? 'Folha de desenho' : 'Tabela' };
      });
      var ip = []; for (var i = 0; i < Math.max(rows.length, 1); i += per) ip.push({ kind: 'table', title: idx.def.t, cols: idx.def.cols, rows: rows.slice(i, i + per), name: idx.def.t });
      Array.prototype.splice.apply(pages, [idx.at, 0].concat(ip));
    }
    if (!pages.length) throw new Error('Nada selecionado para imprimir');
    var pdf = new HX.Pdf({ title: p.meta.title + ' ' + p.meta.docNo, author: p.meta.author });
    var d = HX.sheetDims(p.meta);
    var proxy = Object.assign({}, p, { sheets: pages.map(function (pg) { return { name: pg.name }; }) });
    pages.forEach(function (pg, idx) {
      var g = pdf.addPage(d[0], d[1]);
      HX.drawFrame(g, proxy, idx, { mono: !!opts.mono });
      if (pg.kind === 'sheet') {
        if (p._fit) g.push([p._fit.k, 0, 0, p._fit.k, p._fit.dx, p._fit.dy]);
        HX.drawSheetItems(g, p, pg.s, { mono: !!opts.mono, connected: null, faceConn: nl.connected, nl: nl });
        if (p._fit) g.pop();
      }
      else table(g, HX.usableArea(p), pg.title, pg.cols, pg.rows, opts.mono);
    });
    return pdf.build();
  };
})(typeof window !== 'undefined' ? window : globalThis);
