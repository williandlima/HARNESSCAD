/* HarnessCAD - ferramentas do DESENHO FÍSICO (a formatação e as cotas do chicote são feitas aqui, não no esquemático).
   W  Ramo: clique num nó ou ramo (deriva ali) e depois no destino (nó, ramo ou ponto livre = novo BR).
   B  Derivação: clique sobre o ramo cria um BR naquele ponto.
   D  Cota: clique em dois nós (ramo direto = cota do ramo; senão = cota do caminho).
   Selecione um ramo: as alças laranja perto das pontas religam aquela ponta em outro nó/ramo (muda a ramificação).
   No esquemático, D e B avisam e levam ao desenho físico. */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, down0 = T.down, move0 = T.move, up0 = T.up, ov0 = T.drawOverlay, key0 = T.key, set0 = T.setTool, st0 = T.status;
  var HL = '#ff7a00', PH = {
    wire: 'Ramo: clique num nó ou sobre um ramo (deriva ali), depois no destino — nó, ramo ou ponto livre (novo BR) | Esc cancela',
    brk: 'Derivação: clique sobre o ramo para criar um BR naquele ponto',
    dim: 'Cota: clique no 1º nó e no 2º nó (ramo direto = cota do ramo; senão, cota do caminho)',
    select: 'Arraste nós para mudar o traçado (ramo sem valor mede o desenho) | ramo selecionado: alças laranja religam a ponta | Del num BR junta os ramos'
  };
  function phys(self) { return HX.isPhys(self.doc.cur()); }
  function tol(self) { return 10 / self.view.s; }
  function toast(m, bad) { if (HX.UI && HX.UI.toast) HX.UI.toast(m, bad); }
  // alças de religação do ramo selecionado
  function handles(self) {
    var sh = self.doc.cur(), s = self.doc.selected(); if (s.length !== 1 || s[0].type !== 'pseg') return [];
    var sg = s[0], P = HX.physSegPts(sg, HX.physIdx(sh)); if (!P) return [];
    var L = HX.polyLen(P) || 1, f = Math.min(0.35, (14 / self.view.s) / L);
    return [{ sg: sg, end: 'a', pt: HX.polyAt(P, f).pt }, { sg: sg, end: 'b', pt: HX.polyAt(P, 1 - f).pt }];
  }
  T.status = function () {
    if (this.view && this.doc && phys(this) && PH[this.tool] && !(this.st && this.st.kind === 'follow')) return this.ui.status && this.ui.status({ x: this.snapPt[0], y: this.snapPt[1], tool: this.tool, hint: PH[this.tool] });
    return st0.call(this);
  };
  T.setTool = function (t, data) {
    this.pA = null;
    if (this.doc && !phys(this) && t === 'brk') { /* v1.9.13: a Cota (D) fica no esquema — medida entre conectores (dimsync.js) */
      var app = G.app, ix = this.doc.p.sheets.findIndex(HX.isPhys);
      toast('Derivações do chicote são feitas no Desenho físico' + (ix >= 0 ? ' — abrindo a folha.' : ': gere-o em Ferramentas › Gerar desenho físico.'));
      if (ix >= 0 && app && app.setSheet) { app.setSheet(ix); return set0.call(this, t, data); }
      return set0.call(this, 'select');
    }
    if (this.doc && phys(this) && (t === 'splice' || t === 'label' || t === 'cable')) { toast('No desenho físico use Ramo (W), Derivação (B) e Cota (D). Fios, emendas e labels são do esquemático.'); t = 'select'; }
    return set0.call(this, t, data);
  };
  T.down = function (e) {
    if (!phys(this) || e.button !== 0 || this.space || (this.st && this.st.kind === 'follow')) return down0.call(this, e);
    var self = this, doc = this.doc, sh = doc.cur(); this.ev(e);
    var c = this.cur, pk = HX.physPick(sh, c, tol(this));
    if (this.tool === 'select') {
      var h = handles(this).filter(function (q) { return Math.hypot(q.pt[0] - c[0], q.pt[1] - c[1]) < 6 / self.view.s; })[0];
      if (h) { this.st = { kind: 'reattach', sg: h.sg, end: h.end }; return; }
      return down0.call(this, e);
    }
    if (this.tool === 'brk') {
      if (!pk || !pk.seg) return toast('Clique sobre um ramo.', true);
      var nd; doc.change('Derivação no ramo', function () { nd = HX.physSplitAt(doc, pk.seg, pk.t); }); if (nd) doc.select([nd.id]); return;
    }
    if (this.tool === 'dim') {
      if (!pk || !pk.node) return toast('Clique num nó (conector, BR ou emenda).', true);
      if (!this.pA) { this.pA = { node: pk.node }; this.view.redraw(); return; }
      var A = this.pA.node, B = pk.node, d; this.pA = null; if (A.id === B.id) return;
      var sg = HX.physSegsOf(sh, A.id).filter(function (s) { return s.a === B.id || s.b === B.id; })[0];
      if (sg) { var ex = sh.items.filter(function (i) { return i.type === 'pdim' && i.seg === sg.id; })[0]; if (ex) { doc.select([ex.id]); return toast('Esse ramo já tem cota (selecionada).'); } }
      doc.change('Cota', function () { d = sg ? doc.add({ type: 'pdim', id: doc.uid('a'), a: A.id, b: B.id, seg: sg.id, mode: 'seg', x: 0, y: 0, off: 6, text: '', tolP: '', tolM: '' }) : HX.physAddDim(doc, A, B, HX.physPathLen(sh, A.id, B.id) ? 'path' : 'free'); });
      doc.select([d.id]); return;
    }
    if (this.tool === 'wire') {
      if (!this.pA) { if (!pk) return toast('Comece num nó ou sobre um ramo.', true); this.pA = pk; this.view.redraw(); return; }
      var a = this.pA, skip = {}; if (a.node) skip[a.node.id] = 1; if (a.seg) skip[a.seg.id] = 1;
      var b = HX.physPick(sh, c, tol(this), skip), sg2; this.pA = null;
      doc.change('Novo ramo', function () {
        var NA = HX.physNodeAt(doc, a, null, false), NB = HX.physNodeAt(doc, b, self.snapPt, true);
        if (NA && NB && !HX.physSegsOf(doc.cur(), NA.id).some(function (s) { return s.a === NB.id || s.b === NB.id; })) sg2 = HX.physConnect(doc, NA, NB);
      });
      if (sg2) doc.select([sg2.id]); else toast('Esses nós já estão ligados.', true);
      return;
    }
    return down0.call(this, e);
  };
  T.move = function (e) {
    if (this.st && this.st.kind === 'reattach') { this.ev(e); this.view.redraw(); return; }
    var r = move0.call(this, e); if (phys(this) && this.pA) this.view.redraw(); return r;
  };
  T.up = function (e) {
    var st = this.st; if (!st || st.kind !== 'reattach') return up0.call(this, e);
    this.st = null; var doc = this.doc, sh = doc.cur(), c = this.cur, sg = st.sg, skip = {}; skip[sg.id] = 1; skip[sg.a] = st.end === 'a' ? 0 : 1; skip[sg.b] = st.end === 'b' ? 0 : 1;
    var pk = HX.physPick(sh, c, tol(this), skip), ok = false;
    if (!pk || (pk.node && pk.node.id === sg[st.end])) { this.view.redraw(); return; }
    doc.change('Mudar derivação', function () { var n = HX.physNodeAt(doc, pk, c, false); ok = HX.physReattach(doc, sg, st.end, n); });
    if (!ok) toast('Solte a alça sobre outro nó ou ramo.', true); else doc.select([sg.id]);
  };
  T.drawOverlay = function (g, c) {
    ov0.call(this, g, c); if (!phys(this)) return;
    var s = this.view.s, sh = this.doc.cur(), cur = this.cur, self = this;
    function mark(pk) { if (!pk) return; var q = pk.node ? [pk.node.x, pk.node.y] : pk.pt; g.style({ stroke: HL, lw: 2 / s, fill: 'rgba(255,122,0,0.18)', dash: null }); g.circle(q[0], q[1], 7 / s); return q; }
    if (this.st && this.st.kind === 'reattach') {
      var sg = this.st.sg, m = HX.physIdx(sh), fix = m[this.st.end === 'a' ? sg.b : sg.a], skip = {}; skip[sg.id] = 1;
      var pk = HX.physPick(sh, cur, tol(this), skip), q = mark(pk) || cur;
      if (fix) { g.style({ stroke: HL, lw: 2.5 / s, dash: [5 / s, 3 / s], fill: null }); g.line(fix.x, fix.y, q[0], q[1]); g.style({ dash: null }); }
      return;
    }
    if (this.tool === 'select') { handles(this).forEach(function (h) { var r = 4 / s; g.style({ stroke: '#fff', lw: 1 / s, fill: HL, dash: null }); g.rect(h.pt[0] - r, h.pt[1] - r, 2 * r, 2 * r); }); return; }
    if (this.tool === 'wire' || this.tool === 'dim' || this.tool === 'brk') {
      var skip2 = {}; if (this.pA && this.pA.node) skip2[this.pA.node.id] = 1;
      var hv = HX.physPick(sh, cur, tol(this), skip2); if (this.tool === 'brk' && hv && hv.node) hv = null; if (this.tool === 'dim' && hv && !hv.node) hv = null;
      var to = mark(hv) || (this.tool === 'wire' ? this.snapPt : cur);
      if (this.pA) {
        var a = mark(this.pA);
        g.style({ stroke: HL, lw: 2 / s, dash: [5 / s, 3 / s], fill: null }); g.line(a[0], a[1], to[0], to[1]); g.style({ dash: null });
        if (this.tool === 'wire') { var L = Math.round(Math.hypot(to[0] - a[0], to[1] - a[1]) * (+sh.scale || 1)); g.text(L + ' mm', (a[0] + to[0]) / 2, (a[1] + to[1]) / 2 - 3 / s, { size: 11 / s, align: 'c', color: HL, bold: true }); }
      }
      void self;
    }
  };
  T.key = function (e) {
    if (phys(this) && e.key === 'Escape' && this.pA) { e.preventDefault(); this.pA = null; this.view.redraw(); return; }
    return key0.call(this, e);
  };
})(typeof window !== 'undefined' ? window : globalThis);
