/* HarnessCAD - ferramentas do desenho físico (3): VISTA DE DETALHE e ETIQUETA DE IDENTIFICAÇÃO.
   V  Detalhe: arraste um retângulo sobre a área (círculo ou retângulo, opção da folha detShape); a vista ampliada
      é criada com ampliação automática num lugar livre. Com o detalhe selecionado: arraste a borda da região para
      mover a região, a alça (quadradinho) para redimensionar; arraste a vista para movê-la.
   I  Etiqueta: clique sobre o ramo; a etiqueta nasce ali, medida a partir do conector mais próximo, com cota.
      Arrastar a etiqueta desliza no ramo (passo 5 mm; Shift = livre e move só a bandeira). */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, down0 = T.down, move0 = T.move, up0 = T.up, ov0 = T.drawOverlay, key0 = T.key, st0 = T.status;
  var HL = '#ff7a00', PH = {
    pdet: 'Detalhe: arraste sobre a área a ampliar (a vista é criada num lugar livre) | Esc sai',
    ptag: 'Etiqueta: clique sobre o ramo onde vai a etiqueta de identificação | Esc sai'
  };
  function phys(self) { return self.doc && HX.isPhys(self.doc.cur()); }
  function toast(m, bad) { if (HX.UI && HX.UI.toast) HX.UI.toast(m, bad); }
  T.status = function () {
    if (this.view && phys(this) && PH[this.tool]) return this.ui.status && this.ui.status({ x: this.cur[0], y: this.cur[1], tool: this.tool, hint: PH[this.tool] });
    return st0.call(this);
  };
  function detAt(self, c) {
    var sh = self.doc.cur(), tol = 6 / self.view.s, sel = self.doc.selected(), L = sh.items.filter(function (i) { return i.type === 'pdetail'; });
    L.sort(function (a, b) { return (sel.indexOf(b) >= 0) - (sel.indexOf(a) >= 0); });
    for (var i = 0; i < L.length; i++) { var h = HX.physDetSrcHit(L[i], c, tol); if (h) return { it: L[i], how: h }; }
    return null;
  }
  T.down = function (e) {
    if (!phys(this) || e.button !== 0 || this.space || (this.st && this.st.kind === 'follow')) return down0.call(this, e);
    this.ev(e); var c = this.cur.slice(), doc = this.doc, sh = doc.cur();
    if (this.tool === 'pdet') { this.st = { kind: 'detbox', a: c }; return; }
    if (this.tool === 'ptag') {
      var pk = HX.physPick(sh, c, 10 / this.view.s); if (!pk || !pk.seg) return toast('Clique sobre um ramo.', true);
      var t; doc.change('Etiqueta de identificação', function () { t = HX.physAddTag(doc, pk.seg, pk.t); }); if (t) doc.select([t.id]); return;
    }
    if (this.tool === 'select') {
      var d = detAt(this, c);
      if (d) { doc.select([d.it.id]); this.st = { kind: 'detsrc', it: d.it, how: d.how, a: c, b0: [+d.it.sx, +d.it.sy, +d.it.sw, +d.it.sh], moved: false }; return; }
    }
    return down0.call(this, e);
  };
  T.move = function (e) {
    var st = this.st;
    if (st && st.kind === 'detbox') { this.ev(e); this.view.redraw(); return; }
    if (st && st.kind === 'detsrc') {
      this.ev(e); var c = this.cur, it = st.it, b = st.b0, dx = c[0] - st.a[0], dy = c[1] - st.a[1];
      if (!st.moved) { st.moved = true; st.undo = HX.clone(it); }
      if (st.how === 'move') { it.sx = HX.r3(b[0] + dx); it.sy = HX.r3(b[1] + dy); }
      else if (it.shape === 'circle') { var cx = b[0] + b[2] / 2, cy = b[1] + b[2] / 2, r = Math.max(3, Math.hypot(c[0] - cx, c[1] - cy)); it.sw = it.sh = HX.r3(2 * r); it.sx = HX.r3(cx - r); it.sy = HX.r3(cy - r); }
      else { it.sw = HX.r3(Math.max(5, b[2] + dx)); it.sh = HX.r3(Math.max(5, b[3] + dy)); }
      this.view.redraw(); return;
    }
    if (st && st.kind === 'drag' && phys(this) && !e.shiftKey) {
      var sel = this.doc.selected();
      if (sel.length === 1 && sel[0].type === 'ptag') {
        var sh = this.doc.cur(), m = HX.physIdx(sh), it2 = sel[0], sg = m[it2.seg]; if (!sg) return move0.call(this, e);
        var c = this.ev(e), D = it2._dim; if (st.dimHit == null) st.dimHit = !!(D && st.start && HX.distSeg(st.start, D.a, D.b) < 1.6);
        if (st.dimHit) { it2.dimOff = Math.round(((c[0] - D.p0[0]) * D.n[0] + (c[1] - D.p0[1]) * D.n[1]) * 2) / 2 || -0.5; this.live(); this.view.redraw(); return; } // arrastar a cota afasta/aproxima
        var P = HX.physSegPts(sg, m), t = HX.physProj(P, c), L = HX.physSegLen(sg, m, +sh.scale || 1), eo = +it2._eo || 0;
        it2.dist = Math.max(0, Math.min(Math.round(L), Math.round(eo + Math.round(((it2.end === 'b' ? 1 - t : t) * L - eo) / 5) * 5))); this.live(); this.status(); this.view.redraw(); return;
      }
    }
    return move0.call(this, e);
  };
  T.up = function (e) {
    var st = this.st, doc = this.doc;
    if (st && st.kind === 'detbox') {
      this.st = null; var a = st.a, c = this.cur, r = { x: Math.min(a[0], c[0]), y: Math.min(a[1], c[1]), w: Math.abs(c[0] - a[0]), h: Math.abs(c[1] - a[1]) };
      if (r.w < 3 && r.h < 3) r = { x: a[0] - 15, y: a[1] - 15, w: 30, h: 30 };
      var it, shape = doc.cur().detShape || 'circle'; doc.change('Vista de detalhe', function () { it = HX.physAddDetail(doc, r, shape); });
      doc.select([it.id]); this.setTool('select'); toast('Detalhe ' + it.label + ' criado (' + String(it.k).replace('.', ',') + ':1). Arraste a vista para mudar o lugar.'); return;
    }
    if (st && st.kind === 'detsrc') {
      this.st = null; if (!st.moved) { this.view.redraw(); return; }
      var it2 = st.it, now = HX.clone(it2); Object.keys(st.undo).forEach(function (k) { it2[k] = st.undo[k]; });
      doc.change(st.how === 'move' ? 'Mover região do detalhe' : 'Redimensionar região do detalhe', function () { ['sx', 'sy', 'sw', 'sh'].forEach(function (k) { it2[k] = now[k]; }); }); return;
    }
    return up0.call(this, e);
  };
  T.drawOverlay = function (g, c) {
    ov0.call(this, g, c); if (!phys(this)) return;
    var s = this.view.s, st = this.st, self = this;
    if (st && st.kind === 'detbox') {
      var a = st.a, b = this.cur, x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
      g.style({ stroke: HL, lw: 1.5 / s, dash: [5 / s, 3 / s], fill: 'rgba(255,122,0,0.08)' });
      if ((this.doc.cur().detShape || 'circle') === 'circle') { var d = Math.max(w, h); g.circle(x + w / 2, y + h / 2, d / 2); } else g.rect(x, y, w, h);
      g.style({ dash: null, fill: null }); return;
    }
    if (this.tool === 'ptag') { var pk = HX.physPick(this.doc.cur(), this.cur, 10 / s); if (pk && pk.seg) { g.style({ stroke: HL, lw: 2 / s, fill: 'rgba(255,122,0,0.18)', dash: null }); g.circle(pk.pt[0], pk.pt[1], 6 / s); } return; }
    this.doc.selected().forEach(function (it) {
      if (it.type !== 'pdetail') return; var D = HX.physDetGeom(it), r = 4 / s, hx = D.circ ? D.cx + D.r * 0.7071 : D.sx + D.sw, hy = D.circ ? D.cy + D.r * 0.7071 : D.sy + D.sh;
      g.style({ stroke: HL, lw: 1.5 / s, dash: [4 / s, 3 / s], fill: null }); if (D.circ) g.circle(D.cx, D.cy, D.r); else g.rect(D.sx, D.sy, D.sw, D.sh);
      g.style({ stroke: '#fff', lw: 1 / s, fill: HL, dash: null }); g.rect(hx - r, hy - r, 2 * r, 2 * r); void self;
    });
  };
  T.key = function (e) {
    var tg = e.target && e.target.tagName;
    if (phys(this) && !e.ctrlKey && !e.metaKey && !e.altKey && !/INPUT|SELECT|TEXTAREA/.test(tg || '')) {
      var k = (e.key || '').toLowerCase();
      if (k === 'v' || k === 'i') { e.preventDefault(); this.setTool(k === 'v' ? 'pdet' : 'ptag'); return; }
      if (k === 'escape' && this.st && this.st.kind === 'detbox') { e.preventDefault(); this.st = null; this.view.redraw(); return; }
    }
    return key0.call(this, e);
  };
})(typeof window !== 'undefined' ? window : globalThis);
