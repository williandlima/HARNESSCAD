/* HarnessCAD - ferramentas do desenho físico (4): RAMO MALEÁVEL e GIRAR EM QUALQUER ÂNGULO.
   Ramo selecionado: bolinhas = pontos de curva (arraste); duplo clique no ramo = novo ponto; botão direito no ponto =
   remover. Conector / imagem / vista selecionados: alça redonda acima = girar (passo 15°, Shift = livre). */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, down0 = T.down, move0 = T.move, up0 = T.up, ov0 = T.drawOverlay, HL = '#ff7a00';
  var ROT = { pnode: 1, pimg: 1, pnote: 1, pface: 1 };
  function phys(self) { return self.doc && HX.isPhys(self.doc.cur()); }
  function one(self) { var s = self.doc.selected(); return s.length === 1 ? s[0] : null; }
  HX.physRotCenter = function (it, m) { if (it.type === 'pnote' || it.type === 'pface') { var b0 = it._bb; return b0 ? [(b0.x0 + b0.x1) / 2, (b0.y0 + b0.y1) / 2] : null; } return [+it.x, +it.y]; };
  function rotHandle(self, it) {
    if (!it || !ROT[it.type] || (it.type === 'pnode' && it.nkind !== 'conn')) return null;
    var sh = self.doc.cur(), c = HX.physRotCenter(it, HX.physIdx(sh)), E = HX.ITEM_EXT[it.type], b = (E && E.bbox && E.bbox(it, self.doc.p.unit)) || it._bb; if (!c) return null;
    var top = b ? b.y0 : c[1] - 6; return { c: c, pt: [c[0], top - 9 / self.view.s] };
  }
  function bendPts(self, it) { return it && it.type === 'pseg' ? HX.physBendWorld(it, HX.physIdx(self.doc.cur())) : []; }
  HX.physBendAt = function (self, c) { // índice do ponto de curva sob o cursor (ramo selecionado)
    var it = one(self), W = bendPts(self, it), r = 7 / self.view.s;
    for (var i = 0; i < W.length; i++) if (Math.hypot(c[0] - W[i][0], c[1] - W[i][1]) < r) return { sg: it, i: i };
    return null;
  };
  function angNow(it, sh) { return it.type === 'pnode' ? HX.physAngle(it, sh.items) : +it.rot || 0; }
  T.down = function (e) {
    if (!phys(this) || e.button !== 0 || this.tool !== 'select' || this.space) return down0.call(this, e);
    this.ev(e); var c = this.cur.slice(), it = one(this), sh = this.doc.cur();
    var h = rotHandle(this, it);
    if (h && Math.hypot(c[0] - h.pt[0], c[1] - h.pt[1]) < 7 / this.view.s) { this.st = { kind: 'prot', it: it, c: h.c, a0: Math.atan2(c[1] - h.c[1], c[0] - h.c[0]), r0: angNow(it, sh), undo: it.rot, moved: false }; return; }
    var b = HX.physBendAt(this, c);
    if (b) { this.st = { kind: 'pbend', sg: b.sg, i: b.i, undo: HX.clone(b.sg.bends), ux: b.sg.x, uy: b.sg.y, moved: false }; return; }
    return down0.call(this, e);
  };
  T.move = function (e) {
    var st = this.st;
    if (st && st.kind === 'prot') {
      this.ev(e); var a = Math.atan2(this.cur[1] - st.c[1], this.cur[0] - st.c[0]), deg = st.r0 + (a - st.a0) * 180 / Math.PI;
      deg = e.shiftKey ? Math.round(deg) : Math.round(deg / 15) * 15; deg = ((deg % 360) + 360) % 360;
      st.it.rot = deg; st.moved = true; if (this.ui.status) this.ui.status({ x: this.cur[0], y: this.cur[1], tool: 'select', hint: 'Girar: ' + deg + '°  (Shift = livre)' }); this.view.redraw(); return;
    }
    if (st && st.kind === 'pbend') {
      this.ev(e); var m = HX.physIdx(this.doc.cur()), W = HX.physBendWorld(st.sg, m); W[st.i] = this.snapPt ? this.snapPt.slice() : this.cur.slice();
      HX.physBendSet(st.sg, m, W); st.moved = true; this.view.redraw(); return;
    }
    return move0.call(this, e);
  };
  T.up = function (e) {
    var st = this.st, doc = this.doc;
    if (st && st.kind === 'prot') {
      this.st = null; if (!st.moved) return; var v = st.it.rot; st.it.rot = st.undo; doc.change('Girar', function () { st.it.rot = v; }); return;
    }
    if (st && st.kind === 'pbend') {
      this.st = null; if (!st.moved) return; var sg = st.sg, nb = HX.clone(sg.bends); sg.bends = st.undo; sg.x = st.ux; sg.y = st.uy;
      doc.change('Curvar ramo', function () { sg.bends = nb; sg.x = 0; sg.y = 0; }); return;
    }
    return up0.call(this, e);
  };
  T.drawOverlay = function (g, c) {
    ov0.call(this, g, c); if (!phys(this) || this.tool !== 'select') return;
    var s = this.view.s, it = one(this), self = this;
    bendPts(this, it).forEach(function (p) { g.style({ stroke: '#fff', lw: 1.2 / s, fill: HL, dash: null }); g.circle(p[0], p[1], 4.2 / s); });
    if (it && it.type === 'pseg' && !bendPts(this, it).length) { var P = HX.physSegPts(it, HX.physIdx(this.doc.cur())); if (P) { var q = HX.polyAt(P, 0.5).pt; g.style({ stroke: HL, lw: 1 / s, fill: '#fff', dash: null }); g.circle(q[0], q[1], 3 / s); } }
    var h = rotHandle(this, it);
    if (h) { g.style({ stroke: HL, lw: 1.2 / s, fill: null, dash: [3 / s, 2 / s] }); g.line(h.c[0], h.c[1], h.pt[0], h.pt[1]); g.style({ dash: null, fill: '#fff', lw: 1.6 / s }); g.circle(h.pt[0], h.pt[1], 4.5 / s); g.style({ fill: HL }); g.circle(h.pt[0], h.pt[1], 1.6 / s); void self; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
