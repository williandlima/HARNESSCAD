/* HarnessCAD - ferramenta fio, posicionamento, labels, desenho de sobreposição */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, T = HX.Tools.prototype;

  T.route = function (a, b, free) {
    if (free || HX.same(a, b) || Math.abs(a[0] - b[0]) < 0.006 || Math.abs(a[1] - b[1]) < 0.006) return [b];
    return this.posture === 'H' ? [[b[0], a[1]], b] : [[a[0], b[1]], b];
  };
  T.isConnPoint = function (p) {
    if (this.magnet) return true;
    var doc = this.doc;
    return doc.items().some(function (w) {
      if (w.type !== 'wire') return false;
      for (var i = 1; i < w.pts.length; i++) if (HX.distSeg(p, w.pts[i - 1], w.pts[i]) < 0.01) return true;
      return false;
    });
  };
  T.clickWire = function (p, e) {
    if (!this.wpts.length) { this.wpts = [p]; this.view.redraw(); return; }
    var last = this.wpts[this.wpts.length - 1];
    if (HX.same(last, p)) { if (this.wpts.length > 1) this.finishWire(); return; }
    this.route(last, p, e.shiftKey).forEach(function (q) { this.wpts.push(q); }, this);
    if (this.isConnPoint(p) && this.wpts.length >= 2) this.finishWire();
    this.view.redraw();
  };
  T.finishWire = function () {
    var pts = this.wpts, doc = this.doc; this.wpts = [];
    if (pts.length < 2) return;
    var w; doc.change('Fio', function () { w = ops.addWire(doc, pts); });
    this.view.redraw(); return w;
  };

  T.posGhost = function (p) {
    var g = this.ghost, L = HX.connLayout(Object.assign({}, g, { x: 0, y: 0 }), this.doc.p.unit), gs = this.doc.p.grid.size || 1;
    // cursor sobre o primeiro pino (facilita encaixar fios existentes)
    var pin = L.pins[0] ? L.pins[0].pt : [0, 0];
    g.x = HX.r3(HX.snap(p[0] - pin[0], gs)); g.y = HX.r3(HX.snap(p[1] - pin[1], gs));
  };
  T.place = function (e) {
    var doc = this.doc, g = this.ghost; if (!g) return;
    var it = HX.clone(g); it.id = doc.uid('c'); it.ref = doc.nextRef(String(g.ref).replace(/\d+$/, ''));
    doc.change('Inserir conector', function () { doc.add(it); });
    if (e.shiftKey) { g.ref = doc.nextRef(String(g.ref).replace(/\d+$/, '')); }
    else { this.setTool('select'); doc.select([it.id]); }
  };
  T.addLabel = function (p) {
    var st = (this.ui.labelStyle && this.ui.labelStyle()) || 'local';
    var def = st === 'gnd' ? 'GND' : st === 'chassis' ? 'CHASSI' : this.lastLabel;
    var doc = this.doc, self = this;
    this.ask('Label de circuito', 'Nome do circuito:', def).then(function (t) {
      if (!t) return;
      doc.change('Label', function () { doc.add({ type: 'label', id: doc.uid('l'), x: p[0], y: p[1], text: t, rot: 0, style: st }); });
      if (st === 'local' || st === 'global') self.lastLabel = t.replace(/(\d+)$/, function (m) { return String(+m + 1); });
    });
  };

  // Comandos aplicáveis à seleção (ou ao item sob o cursor, como no KiCad)
  T.targets = function () {
    var s = this.doc.selected(); if (s.length) return s;
    var h = this.view.hitTest(this.cur); return h ? [h] : [];
  };
  T.xform = function (kind) {
    var doc = this.doc;
    if (this.tool === 'place' && this.ghost) {
      var g = this.ghost;
      if (kind === 'rot') g.rot = ((g.rot || 0) + 90) % 360; else { var k = (g.rot || 0) % 180 ? (kind === 'mx' ? 'my' : 'mx') : kind; g[k] = !g[k]; } // girado: eixo trocado
      this.posGhost(this.snapPt); this.view.redraw(); return;
    }
    if (this.st && this.st.kind === 'follow') {
      var ids = this.st.sess.ids; this.st.sess.apply(this.snapPt[0] - this.st.start[0], this.snapPt[1] - this.st.start[1]);
      ops.transform(doc, doc.items().filter(function (i) { return ids.indexOf(i.id) >= 0; }), kind);
      this.st = { kind: 'follow', start: this.snapPt.slice(), sess: ops.beginMove(doc, ids, 'drag') }; this.live(); return;
    }
    var t = this.targets(); if (!t.length) return;
    doc.change(kind === 'rot' ? 'Girar' : 'Espelhar', function () { ops.transform(doc, t, kind); });
  };
  T.nudge = function (dx, dy) {
    var doc = this.doc, ids = Array.from(doc.sel); if (!ids.length) return;
    var g = doc.p.grid.size || 1;
    doc.change('Mover', function () { ops.beginMove(doc, ids, 'drag').apply(dx * g, dy * g); });
  };
  T.duplicate = function () {
    var doc = this.doc, s = doc.selected(); if (!s.length) return;
    doc.checkpoint('Duplicar');
    var g = doc.p.grid.size || 2.5, out = ops.pasteItems(doc, s, 4 * g, 4 * g);
    doc.select(out.map(function (i) { return i.id; }));
    this.startFollow(out.map(function (i) { return i.id; }), 'move', '', true);
  };
  T.paste = function () {
    var doc = this.doc, items = ops.getClip(); if (!items.length) return;
    var unit = doc.p.unit, b = HX.bbox(items[0], unit), g = doc.p.grid.size || 1;
    doc.checkpoint('Colar');
    var out = ops.pasteItems(doc, items, HX.snap(this.snapPt[0] - b.x0, g), HX.snap(this.snapPt[1] - b.y0, g));
    doc.select(out.map(function (i) { return i.id; }));
    this.st = null; this.startFollow(out.map(function (i) { return i.id; }), 'move', '', true);
  };

  T.drawOverlay = function (g) {
    var doc = this.doc, s = this.view.s, th = HX.THEME, st = this.st;
    if (this.tool === 'wire' && this.wpts.length) {
      var pts = this.wpts.concat(this.route(this.wpts[this.wpts.length - 1], this.snapPt, this.shift));
      g.style({ stroke: th.wire, lw: 0.25, fill: null, dash: null }); g.poly(this.wpts, false);
      g.style({ dash: [1, 0.7] }); g.poly(pts.slice(this.wpts.length - 1), false); g.style({ dash: null });
    }
    if (this.tool === 'place' && this.ghost) { g.c.globalAlpha = 0.65; HX.drawConn(g, this.ghost, doc.p, doc.sheet, { theme: th }); g.c.globalAlpha = 1; }
    if (st && st.kind === 'box') {
      var r = HX.normRect(st.a, this.cur), win = this.cur[0] >= st.a[0];
      g.style({ stroke: win ? '#1e6bff' : '#1a9a3a', lw: 1 / s, fill: win ? 'rgba(30,107,255,0.08)' : 'rgba(26,154,58,0.08)', dash: win ? null : [4 / s, 3 / s] });
      g.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0); g.style({ dash: null, fill: null });
    }
    if (this.p0 && ['line', 'rect', 'circle', 'cable', 'measure'].indexOf(this.tool) >= 0) {
      var a = this.p0, b = this.p1 || this.snapPt;
      g.style({ stroke: '#d0006f', lw: 1.2 / s, fill: null, dash: [3 / s, 2 / s] });
      if (this.tool === 'rect') g.rect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      else if (this.tool === 'circle') g.circle(a[0], a[1], Math.hypot(b[0] - a[0], b[1] - a[1]));
      else if (this.tool === 'cable') g.poly(HX.ellipsePts((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2 || 0.1, Math.abs(b[1] - a[1]) / 2 || 0.1), true);
      else g.line(a[0], a[1], b[0], b[1]);
      g.style({ dash: null });
      if (this.tool === 'measure') {
        var dx = b[0] - a[0], dy = b[1] - a[1];
        g.text('d=' + Math.hypot(dx, dy).toFixed(2) + ' dx=' + dx.toFixed(2) + ' dy=' + dy.toFixed(2) + ' mm', b[0] + 1, b[1] - 1, { size: 12 / s, color: '#d0006f', bold: true });
      }
    }
    // cursor
    var c = this.snapPt, L = 10 / s;
    g.style({ stroke: '#0050c8', lw: 1 / s, fill: null }); g.line(c[0] - L, c[1], c[0] + L, c[1]); g.line(c[0], c[1] - L, c[0], c[1] + L);
    if (this.magnet && this.tool !== 'select') { g.style({ stroke: '#e60073', lw: 1.5 / s }); g.circle(c[0], c[1], 5 / s); }
  };
})(typeof window !== 'undefined' ? window : globalThis);
