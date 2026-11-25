/* HarnessCAD - interface da ORDEM DOS PINOS: no esquema, clique no pino (na perna ou no número) — ele fica destacado em
   laranja — e use ↑/↓ (ou ←/→ com o conector girado) para trocá-lo de lugar com o vizinho; os fios acompanham. Esc solta.
   Painel do conector: "Voltar à ordem do catálogo" quando a ordem foi mudada. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, T = HX.Tools && HX.Tools.prototype; if (!T || !HX.pinMove) return;
  var HL = '#ff7a00', down0 = T.down, key0 = T.key, ov0 = T.drawOverlay, told = false;
  function sch(self) { return self.doc && !HX.isPhys(self.doc.cur()); }
  /* clique no pino: seleciona o pino e o seu conector (e não o fio ligado nele); com um fio já selecionado e o clique na
     ponta dele, vale o arrastar da ponta de sempre */
  T.down = function (e) {
    if (!sch(this) || this.tool !== 'select' || e.button !== 0 || e.ctrlKey || e.shiftKey || this.space) { this.pinSel = null; return down0.apply(this, arguments); }
    this.ev(e); var doc = this.doc, h = HX.pinAt(doc, this.cur, 6 / this.view.s), s1 = doc.selected(), tol = 6 / this.view.s, cur = this.cur;
    var wEnd = s1.length === 1 && s1[0].type === 'wire' && [s1[0].pts[0], s1[0].pts[s1[0].pts.length - 1]].some(function (q) { return Math.hypot(q[0] - cur[0], q[1] - cur[1]) < tol; });
    if (!h || wEnd) { this.pinSel = null; return down0.apply(this, arguments); }
    this.pinSel = { id: h.c.id, n: h.n, side: h.side }; doc.select([h.c.id]);
    if (!told) { told = true; UI.toast('Pino ' + h.c.ref + ':' + h.n + ' selecionado — ↑/↓ trocam a posição dele (os fios acompanham). Esc solta.'); }
    this.view.redraw(); };
  T.key = function (e) { var ps = this.pinSel, tg = (e.target || {}).tagName || '';
    if (ps && /^Arrow/.test(e.key) && !/INPUT|SELECT|TEXTAREA/.test(tg) && sch(this) && this.doc.sel.has(ps.id)) {
      var doc = this.doc, c = doc.find(ps.id), dx = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0, dy = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0, ok = false;
      e.preventDefault(); e.stopPropagation(); if (!c) { this.pinSel = null; return; }
      doc.change('Mover pino ' + c.ref + ':' + ps.n, function () { ok = HX.pinMove(doc, c, ps.n, dx, dy); });
      if (!ok) { doc.undoStack.pop(); UI.toast('O pino ' + c.ref + ':' + ps.n + ' já está na ponta.', true); }
      if (this.view.nl !== undefined) this.view.nl = null; this.view.redraw(); return; }
    if (e.key === 'Escape' && ps) { this.pinSel = null; this.view.redraw(); }
    return key0.apply(this, arguments); };
  T.drawOverlay = function (g) { ov0.apply(this, arguments); var ps = this.pinSel; if (!ps || !sch(this)) return; var c = this.doc.find(ps.id);
    if (!c || !this.doc.sel.has(ps.id)) return; var L = HX.connLayout(c, this.doc.p.unit), q = L.pins.filter(function (x) { return String(x.n) === String(ps.n) && x.side === ps.side; })[0]; if (!q) return;
    var s = this.view.s, a = L.xf(q.side === 'R' ? L.w - 4 * L.u : 4 * L.u, q.ly); g.style({ stroke: HL, lw: 3 / s, fill: null, dash: null }); g.line(a[0], a[1], q.pt[0], q.pt[1]);
    g.style({ fill: 'rgba(255,122,0,0.35)' }); g.circle(q.pt[0], q.pt[1], 4 / s); g.style({ fill: null }); };
  if (HX.SHORTCUTS) HX.SHORTCUTS.push(['Clique no pino + ↑/↓', 'Esquema: troca o pino de posição no conector (fios acompanham)']);
  /* painel do conector: voltar à ordem do catálogo */
  var pe0 = UI.propsExtra, pb0 = UI.propsBind;
  if (pe0) UI.propsExtra = function (it, app) { var h = pe0.apply(this, arguments);
    if (it.type === 'conn' && !it.eq && HX.pinOrderChanged(app.doc, it)) h += '<div class="row"><button id="pPinOrd" style="flex:1">Voltar à ordem dos pinos do catálogo</button></div>';
    return h; };
  if (pb0) UI.propsBind = function (it, app, root) { var r = pb0.apply(this, arguments), b = root && root.querySelector('#pPinOrd');
    if (b) b.onclick = function () { app.doc.change('Ordem dos pinos do catálogo', function () { HX.pinOrderReset(app.doc, it); }); app.view.redraw(); };
    return r; };
})(typeof window !== 'undefined' ? window : globalThis);
