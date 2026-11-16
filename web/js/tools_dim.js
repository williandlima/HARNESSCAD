/* HarnessCAD - ferramentas Cota (D) e Ponto de derivação (B)
   Cota (NBR 10126): 1º clique e 2º clique escolhem as origens — no CORPO do conector = centro dele;
   NO PINO (ímã) = o próprio pino; emenda/derivação = o ponto. O 3º clique posiciona a linha de cota:
   afastar para cima/baixo dá cota horizontal, para os lados dá vertical; Shift = alinhada (inclinada).
   A linha encaixa na altura/posição de outras cotas próximas (cotas em série alinhadas). */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, down0 = T.down, ov0 = T.drawOverlay, key0 = T.key, set0 = T.setTool;
  T.HINTS.dim = 'Cota: clique no conector (centro) ou no pino, depois na 2ª origem; mova p/ cima-baixo = horizontal, lados = vertical, Shift = alinhada | Esc cancela';
  T.HINTS.brk = 'Ponto de derivação: clique onde o chicote se divide (use-o como ponta das cotas)';
  HX.SHORTCUTS.push(['D', 'Cota do chicote (comprimento real)'], ['B', 'Ponto de derivação']);

  function pick(self) {
    var h = self.view.hitTest(self.cur, 8);
    return h && (h.type === 'conn' || h.type === 'splice' || h.type === 'brk') ? h : null;
  }
  // origem: pino sob o ímã > corpo do conector (centro) > emenda/derivação > ponto livre
  function endOf(self, p) {
    var unit = self.doc.p.unit, m = self.magnet && self.magnet.it;
    if (m && m.type === 'conn') {
      var q = HX.connLayout(m, unit).pins.filter(function (x) { return HX.same(x.pt, self.snapPt); })[0];
      if (q) return { id: m.id, pin: String(q.n), pt: q.pt.slice() };
    }
    var h = pick(self), a = h && HX.dimAnchorOf(h, unit);
    return a ? { id: h.id, pt: a } : { id: '', pt: p };
  }
  HX.dimEndOf = endOf;
  // orientação e afastamento a partir do cursor; encaixa em cotas vizinhas da mesma orientação (±3 mm)
  function place(self, A, B, c, shift) {
    var o, off;
    if (shift) {
      var dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1; o = 'a';
      off = HX.snap(((c[0] - A[0]) * -dy + (c[1] - A[1]) * dx) / L, 1);
    } else {
      var x0 = Math.min(A[0], B[0]), x1 = Math.max(A[0], B[0]), y0 = Math.min(A[1], B[1]), y1 = Math.max(A[1], B[1]);
      var ox = c[0] < x0 ? x0 - c[0] : c[0] > x1 ? c[0] - x1 : 0, oy = c[1] < y0 ? y0 - c[1] : c[1] > y1 ? c[1] - y1 : 0;
      o = (x1 - x0 < 0.01) ? 'v' : (y1 - y0 < 0.01) ? 'h' : (oy >= ox ? 'h' : 'v');
      var k = o === 'h' ? 1 : 0, line = c[k];
      self.doc.items().forEach(function (d) {
        if (d.type !== 'dim' || d.orient !== o) return;
        var other = (o === 'h' ? d.y : d.x) + (+d.off || 0);
        if (Math.abs(other - line) < 3) line = other;
      });
      off = HX.r3(HX.snap(line - A[k], 0.5));
      var by = {}, u = self.doc.p.unit; self.doc.items().forEach(function (i) { by[i.id] = i; });
      off = HX.dimClear(o, A, off, [HX.dimBox(by[self.dimA && self.dimA.id], u), HX.dimBox(by[self.dimB && self.dimB.id], u)]);
    }
    return { o: o, off: off };
  }
  HX.dimPlace = place;

  T.setTool = function (t, data) { this.dimA = this.dimB = null; return set0.call(this, t, data); };
  T.down = function (e) {
    if ((this.tool !== 'dim' && this.tool !== 'brk') || e.button !== 0 || this.space) return down0.call(this, e);
    var p = this.ev(e), doc = this.doc;
    if (this.tool === 'brk') {
      doc.change('Ponto de derivação', function () { doc.add({ type: 'brk', id: doc.uid('b'), ref: doc.nextRef('BR'), x: p[0], y: p[1] }); });
      return;
    }
    if (!this.dimA) { this.dimA = endOf(this, p); this.view.redraw(); return; }
    if (!this.dimB) {
      var B = endOf(this, p);
      if (!HX.same(B.pt, this.dimA.pt)) this.dimB = B;
      this.view.redraw(); return;
    }
    var A = this.dimA, Bb = this.dimB, pl = place(this, A.pt, Bb.pt, this.cur, e.shiftKey);
    this.dimA = this.dimB = null;
    var dx = Math.abs(Bb.pt[0] - A.pt[0]), dy = Math.abs(Bb.pt[1] - A.pt[1]);
    var dist = Math.round(pl.o === 'h' ? dx : pl.o === 'v' ? dy : Math.hypot(dx, dy));
    this.ask('Cota do chicote', 'Comprimento real do trecho (mm):', String(dist)).then(function (v) {
      if (v == null) return;
      var n = parseFloat(String(v).replace(',', '.'));
      doc.change('Cota', function () {
        doc.add({ type: 'dim', id: doc.uid('d'), a: A.id, b: Bb.id, ap: A.pin, bp: Bb.pin, x: A.pt[0], y: A.pt[1], x2: Bb.pt[0], y2: Bb.pt[1],
          orient: pl.o, off: pl.off, len: isNaN(n) ? '' : n, tolP: '', tolM: '', text: '', showCount: true });
      });
    });
  };
  T.drawOverlay = function (g, c) {
    ov0.call(this, g, c);
    if (this.tool !== 'dim') return;
    var h = pick(this), s = this.view.s, unit = this.doc.p.unit;
    var pinHit = this.magnet && this.magnet.it && this.magnet.it.type === 'conn';
    if (h && !pinHit) { // origem no centro: destaca o conector e marca o centro
      var b = HX.bbox(h, unit), a = HX.dimAnchorOf(h, unit);
      g.style({ stroke: '#0b6e4f', lw: 2 / s, fill: null, dash: [4 / s, 3 / s] }); g.rect(b.x0 - 1, b.y0 - 1, b.x1 - b.x0 + 2, b.y1 - b.y0 + 2); g.style({ dash: null });
      if (a) { g.line(a[0] - 2, a[1], a[0] + 2, a[1]); g.line(a[0], a[1] - 2, a[0], a[1] + 2); }
    }
    if (pinHit) { g.style({ stroke: '#0b6e4f', lw: 2 / s, fill: 'rgba(11,110,79,0.15)' }); g.circle(this.snapPt[0], this.snapPt[1], 6 / s); }
    if (!this.dimA) return;
    var B = this.dimB ? this.dimB.pt : endOf(this, this.snapPt).pt;
    var pl = this.dimB ? place(this, this.dimA.pt, B, this.cur, this.shift) : { o: 'a', off: 0 };
    var it = {}; this.doc.items().forEach(function (i) { it[i.id] = i; });
    HX.drawDim(g, { x: this.dimA.pt[0], y: this.dimA.pt[1], x2: B[0], y2: B[1], orient: pl.o, off: pl.off, a: this.dimA.id, b: this.dimB && this.dimB.id,
      text: this.dimB ? ({ h: 'horizontal', v: 'vertical', a: 'alinhada' })[pl.o] + ' — clique' : 'escolha a 2ª origem' }, { theme: HX.THEME, items: it, unit: this.doc.p.unit });
  };
  T.key = function (e) {
    var tg = e.target && e.target.tagName;
    if (!e.ctrlKey && !e.metaKey && !e.altKey && tg !== 'INPUT' && tg !== 'TEXTAREA' && tg !== 'SELECT') {
      var k = (e.key || '').toLowerCase();
      if (k === 'd' || k === 'b') { e.preventDefault(); this.setTool(k === 'd' ? 'dim' : 'brk'); return; }
      if (e.key === 'Escape' && this.tool === 'dim' && this.dimA) { e.preventDefault(); this.dimA = this.dimB = null; this.view.redraw(); return; }
    }
    return key0.call(this, e);
  };
})(typeof window !== 'undefined' ? window : globalThis);
