/* HarnessCAD - tela (canvas 2D): visão, zoom, grid, renderização */
(function (G) {
  'use strict';
  var HX = G.HX;

  // Backend de desenho para canvas (coordenadas do mundo em mm)
  function CG(ctx, view) { this.c = ctx; this.v = view; this.st = { stroke: '#000', lw: 0.25, fill: null, dash: null }; }
  CG.prototype.style = function (s) { for (var k in s) this.st[k] = s[k]; };
  CG.prototype._ap = function () {
    var c = this.c, s = this.st, m = c.getTransform ? c.getTransform() : null;
    var px = m ? (G.devicePixelRatio || 1) / Math.hypot(m.a, m.b) : 1 / this.v.s; // 1 px na escala atual
    c.lineWidth = Math.max(s.lw || 0.1, px); c.strokeStyle = s.stroke || 'transparent';
    c.fillStyle = s.fill || 'transparent'; c.setLineDash(s.dash || []);
  };
  CG.prototype._paint = function () { if (this.st.fill) this.c.fill(); if (this.st.stroke) this.c.stroke(); };
  CG.prototype.line = function (a, b, x, y) { if (!this.st.stroke) return; this._ap(); var c = this.c; c.beginPath(); c.moveTo(a, b); c.lineTo(x, y); c.stroke(); };
  CG.prototype.poly = function (p, cl) {
    if (!p.length) return; this._ap(); var c = this.c; c.beginPath(); c.moveTo(p[0][0], p[0][1]);
    for (var i = 1; i < p.length; i++) c.lineTo(p[i][0], p[i][1]); if (cl) c.closePath(); this._paint();
  };
  CG.prototype.rect = function (x, y, w, h) { this._ap(); this.c.beginPath(); this.c.rect(x, y, w, h); this._paint(); };
  CG.prototype.circle = function (x, y, r) { this._ap(); this.c.beginPath(); this.c.arc(x, y, r, 0, 7); this._paint(); };
  CG.prototype.text = function (s, x, y, o) {
    o = o || {}; var size = o.size || 2.5, m = this.c.getTransform ? this.c.getTransform() : null;
    var px = size * this.v.s, real = m ? size * Math.hypot(m.a, m.b) / (G.devicePixelRatio || 1) : px; if (real < 2.5 || !s) return;
    var c = this.c; c.save(); c.translate(x, y + (o.va === 'b' ? 0 : size * 0.36)); c.scale(1 / this.v.s, 1 / this.v.s);
    c.font = (o.bold ? 'bold ' : '') + px.toFixed(2) + 'px Arial, Helvetica, sans-serif';
    c.textAlign = o.align === 'c' ? 'center' : o.align === 'r' ? 'right' : 'left'; c.textBaseline = 'alphabetic';
    c.fillStyle = o.color || '#000'; c.fillText(String(s), 0, 0); c.restore();
  };
  CG.prototype.push = function (m) { this.c.save(); this.c.transform(m[0], m[1], m[2], m[3], m[4], m[5]); };
  CG.prototype.pop = function () { this.c.restore(); };
  HX.CanvasG = CG;

  function View(canvas, doc) {
    this.cv = canvas; this.ctx = canvas.getContext('2d'); this.doc = doc;
    this.s = 3; this.ox = 20; this.oy = 20; this.dpr = 1; this.nl = null; this.overlay = null;
    var self = this;
    doc.on('change', function () { self.nl = null; self._pts = null; self.redraw(); });
    doc.on('select', function () { self.redraw(); });
    doc.on('load', function () { self.fit(); });
  }
  HX.View = View;
  var V = View.prototype;
  V.toWorld = function (sx, sy) { return [(sx - this.ox) / this.s, (sy - this.oy) / this.s]; };
  V.toScreen = function (x, y) { return [x * this.s + this.ox, y * this.s + this.oy]; };
  V.resize = function () {
    var r = this.cv.parentElement.getBoundingClientRect(); this.dpr = G.devicePixelRatio || 1;
    this.W = r.width; this.H = r.height;
    this.cv.width = Math.round(r.width * this.dpr); this.cv.height = Math.round(r.height * this.dpr);
    this.cv.style.width = r.width + 'px'; this.cv.style.height = r.height + 'px'; this.redraw();
  };
  V.fit = function (bb) {
    var d = HX.sheetDims(this.doc.p.meta); bb = bb || { x0: 0, y0: 0, x1: d[0], y1: d[1] };
    var w = Math.max(bb.x1 - bb.x0, 10), h = Math.max(bb.y1 - bb.y0, 10);
    this.s = Math.min((this.W - 40) / w, (this.H - 40) / h);
    this.ox = (this.W - w * this.s) / 2 - bb.x0 * this.s; this.oy = (this.H - h * this.s) / 2 - bb.y0 * this.s; this.redraw();
  };
  V.zoomAt = function (f, sx, sy) {
    var ns = Math.max(0.3, Math.min(80, this.s * f)); f = ns / this.s;
    this.ox = sx - (sx - this.ox) * f; this.oy = sy - (sy - this.oy) * f; this.s = ns; this.redraw();
  };
  V.centerOn = function (x, y, s) { if (s) this.s = s; this.ox = this.W / 2 - x * this.s; this.oy = this.H / 2 - y * this.s; this.redraw(); };
  V.netlist = function () { return this.nl || (this.nl = HX.buildNetlist(this.doc.p)); };
  // Pontos de conexão da folha atual (para ímã do cursor)
  V.connPts = function () {
    if (this._pts) return this._pts;
    var p = this.doc.p, out = [];
    this.doc.items().forEach(function (it) { HX.connPoints(it, p.unit).forEach(function (q) { out.push({ pt: q, it: it }); }); });
    return (this._pts = out);
  };

  V.redraw = function () {
    var self = this; if (this._raf) return;
    this._raf = (G.requestAnimationFrame || setTimeout)(function () { self._raf = 0; self.render(); });
  };

  V.drawGrid = function (c, d) {
    var gr = this.doc.p.grid; if (!gr.visible || !(gr.size > 0)) return;
    var step = gr.size, maj = gr.major || 5, sp = step * this.s;
    var drawMinor = sp >= 6, majSp = step * maj * this.s; if (!drawMinor && majSp < 8) return;
    var w0 = this.toWorld(0, 0), w1 = this.toWorld(this.W, this.H);
    var x0 = Math.max(0, Math.floor(w0[0] / step) * step), y0 = Math.max(0, Math.floor(w0[1] / step) * step);
    var x1 = Math.min(d[0], w1[0]), y1 = Math.min(d[1], w1[1]);
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    var dots = gr.style !== 'lines';
    for (var x = x0; x <= x1 + 1e-6; x += step) {
      var ix = Math.round(x / step), isMx = ix % maj === 0;
      if (!drawMinor && !isMx) continue;
      var sx = Math.round(x * this.s + this.ox) + 0.5;
      if (!dots) {
        c.strokeStyle = isMx ? gr.majorColor : gr.color; c.lineWidth = 1; c.beginPath();
        c.moveTo(sx, Math.max(0, this.oy)); c.lineTo(sx, Math.min(this.H, d[1] * this.s + this.oy)); c.stroke(); continue;
      }
      for (var y = y0; y <= y1 + 1e-6; y += step) {
        var iy = Math.round(y / step), isM = isMx && iy % maj === 0;
        if (!drawMinor && iy % maj) continue;
        c.fillStyle = isM ? gr.majorColor : gr.color;
        var sz = isM ? 2 : 1; c.fillRect(sx - sz / 2, Math.round(y * this.s + this.oy) - sz / 2 + 0.5, sz, sz);
      }
    }
    if (!dots) for (var yy = y0; yy <= y1 + 1e-6; yy += step) {
      var jy = Math.round(yy / step), m = jy % maj === 0; if (!drawMinor && !m) continue;
      var sy = Math.round(yy * this.s + this.oy) + 0.5;
      c.strokeStyle = m ? gr.majorColor : gr.color; c.beginPath();
      c.moveTo(Math.max(0, this.ox), sy); c.lineTo(Math.min(this.W, d[0] * this.s + this.ox), sy); c.stroke();
    }
  };

  V.render = function () {
    var c = this.ctx, p = this.doc.p, d = HX.sheetDims(p.meta), dpr = this.dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = HX.WS_BG || '#5c6470'; c.fillRect(0, 0, this.W, this.H);
    c.fillStyle = '#fff'; c.fillRect(this.ox, this.oy, d[0] * this.s, d[1] * this.s);
    this.drawGrid(c, d);
    c.setTransform(dpr * this.s, 0, 0, dpr * this.s, dpr * this.ox, dpr * this.oy);
    var g = new CG(c, this);
    HX.drawFrame(g, p, this.doc.sheet, {});
    var nl = this.netlist();
    HX.drawSheetItems(g, p, this.doc.sheet, { connected: nl.connected, nl: nl });
    // seleção
    var sel = this.doc.selected(), self = this;
    sel.forEach(function (it) { self.drawHighlight(g, it, HX.THEME.sel, 1); });
    if (this.hover && !this.doc.sel.has(this.hover.id)) this.drawHighlight(g, this.hover, '#ff9800', 0.6);
    // bitola fora da faixa do contato: fio em vermelho tracejado + aviso junto do pino (sempre visível)
    var gi = HX.gaugeIssues ? HX.gaugeIssues(p, nl) : {};
    Object.keys(gi).forEach(function (id) {
      var x = gi[id][0]; if (x.sheet !== self.doc.sheet) return;
      g.style({ stroke: '#e00000', lw: 0.6, fill: null, dash: [1.2, 0.8] }); g.poly(x.w.pts, false); g.style({ dash: null });
      gi[id].forEach(function (q) { g.style({ stroke: '#e00000', lw: 0.3, fill: '#fff' }); g.circle(q.pt[0], q.pt[1], 1.6);
        var P = x.w.pts, nb = HX.same(P[0], q.pt) ? P[1] : P[P.length - 2], lf = nb && nb[0] < q.pt[0]; // texto para o lado do fio
        g.text('⚠ ' + q.g + ' AWG ≠ #' + q.size + ' (' + q.rtxt + ')', q.pt[0] + (lf ? -2 : 2), q.pt[1] - 2.2, { size: 1.8, bold: true, color: '#c00000', align: lf ? 'r' : 'l' }); });
    });
    // marcadores ERC
    if (this.ercMarks) this.ercMarks.forEach(function (e) {
      if (e.sheet !== self.doc.sheet || !e.pt) return;
      g.style({ stroke: e.sev === 'erro' ? '#e00' : '#e90', lw: 0.3, fill: null }); g.circle(e.pt[0], e.pt[1], 1.8);
    });
    if (this.overlay) this.overlay(g, c);
  };

  V.drawHighlight = function (g, it, col, a) {
    g.c.globalAlpha = a;
    if (it.type === 'wire') { g.style({ stroke: col, lw: Math.max(0.6, 3 / this.s), fill: null }); g.poly(it.pts, false); g.style({ fill: col, stroke: null }); it.pts.forEach(function (q) { g.rect(q[0] - 0.5, q[1] - 0.5, 1, 1); }); }
    else { var b = HX.bbox(it, this.doc.p.unit); g.style({ stroke: col, lw: Math.max(0.25, 1.5 / this.s), fill: null, dash: [1, 0.6] }); g.rect(b.x0 - 0.8, b.y0 - 0.8, b.x1 - b.x0 + 1.6, b.y1 - b.y0 + 1.6); g.style({ dash: null }); }
    g.c.globalAlpha = 1;
  };

  // Item mais próximo do ponto (prioridade: emenda, label, fio, conector, demais)
  V.hitTest = function (pt, tolPx) {
    var tol = (tolPx || 6) / this.s, best = null, bd = 1e9, pr = { splice: 0, label: 1, wire: 2, text: 3, conn: 4, face: 4, shape: 5, cable: 6, dim: 2, brk: 0 };
    var unit = this.doc.p.unit;
    this.doc.items().forEach(function (it) {
      var dd = HX.hitDist(it, pt, unit); if (dd > tol) return;
      var score = Math.max(dd, 0) + (it.type in pr ? pr[it.type] : (HX.HITPR || {})[it.type] || 3) * 0.05 * tol + (dd <= 0 && it.type !== 'wire' ? 0.3 * tol : 0);
      if (dd <= 0 && (it.type === 'splice' || it.type === 'label' || it.type === 'brk')) score = -1;
      if (score < bd) { bd = score; best = it; }
    });
    return best;
  };
})(typeof window !== 'undefined' ? window : globalThis);
