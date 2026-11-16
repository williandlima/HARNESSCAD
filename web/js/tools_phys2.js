/* HarnessCAD - desenho físico: ímã de ângulo (0°/45°/90°…) ao arrastar um nó e ao desenhar um ramo (Shift = livre).
   Ângulos retos: o nó alinha no vizinho (H/V). Ctrl+arrastar (ou "Levar ramo junto") move o ramo inteiro. */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, move0 = T.move, ev0 = T.ev;
  function phys(self) { return self.doc && HX.isPhys(self.doc.cur()); }
  // ramo em desenho: a ponta livre encaixa no ângulo a partir do início
  T.ev = function (e) {
    var p = ev0.call(this, e);
    if (phys(this) && this.tool === 'wire' && this.pA && !(e && e.shiftKey)) {
      var a = this.pA.node ? [this.pA.node.x, this.pA.node.y] : this.pA.pt; if (a) { this.snapPt = this.doc.cur().route === 'ortho' ? HX.physSnapAngle(a, this.snapPt, 90, 45) : HX.physSnapAngle(a, this.snapPt); p = this.snapPt; }
    }
    return p;
  };
  // arrastar UM nó: encaixa no ângulo em relação ao vizinho mais próximo do encaixe
  T.move = function (e) {
    var st = this.st, doc = this.doc;
    if (!st || st.kind !== 'drag' || !phys(this) || e.shiftKey) return move0.call(this, e);
    var sel = doc.selected(), sh0 = doc.cur();
    if (sel.length === 1 && sel[0].type === 'pacc') return slideAcc(this, sel[0], sh0, e);
    if (sel.length === 1 && sel[0].type === 'pnode' && e.altKey && sel[0].nkind !== 'conn') return slideBR(this, sel[0], sh0, e);
    if (sel.length !== 1 || sel[0].type !== 'pnode') return move0.call(this, e);
    var nd = sel[0], sh = doc.cur(), m = HX.physIdx(sh), p = this.ev(e);
    if (!st.n0) st.n0 = [nd.x, nd.y];
    var q = [st.n0[0] + p[0] - st.start[0], st.n0[1] + p[1] - st.start[1]], best = q, bd = 1e9, tol = Math.max(1.5, 8 / this.view.s);
    if (st.sub == null) { st.sub = {}; if (e.ctrlKey || sh.dragTree) HX.physSubtree(sh, nd).forEach(function (id) { var it = m[id]; if (it && it !== nd) st.sub[id] = [it.x, it.y]; }); }
    HX.physSegsOf(sh, nd.id).forEach(function (s) {
      var o = m[s.a === nd.id ? s.b : s.a]; if (!o || st.sub[o.id]) return;
      if (HX.physRouteOf(s, m) === 'ortho') { if (Math.abs(q[0] - o.x) < tol) best = [o.x, best[1]]; if (Math.abs(q[1] - o.y) < tol) best = [best[0], o.y]; return; } // alinha no vizinho
      if (+s.x || +s.y || (s.bends && s.bends.length)) return;
      var c = HX.physSnapAngle([o.x, o.y], q), d = Math.hypot(c[0] - q[0], c[1] - q[1]); if (d > 1e-9 && d < bd) { bd = d; best = c; }
    });
    var dx = best[0] - st.n0[0], dy = best[1] - st.n0[1]; Object.keys(st.sub).forEach(function (id) { var it = m[id], o0 = st.sub[id]; it.x = o0[0] + dx; it.y = o0[1] + dy; }); // leva o ramo junto
    st.sess.apply(dx, dy); this.live(); this.status(); this.view.redraw();
  };
  // projeção do ponto no traçado de um ramo: fração 0..1
  function proj(P, q) { var L = HX.polyLen(P) || 1, acc = 0, best = 1e9, bt = 0; for (var i = 1; i < P.length; i++) { var a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, k = l2 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2)) : 0, d = Math.hypot(a[0] + dx * k - q[0], a[1] + dy * k - q[1]), l = Math.sqrt(l2); if (d < best) { best = d; bt = (acc + l * k) / L; } acc += l; } return bt; }
  HX.physProj = proj;
  // arrastar um item do ramo: desliza ao longo do ramo (distância real, passo 1 mm); Shift = move só o rótulo
  function slideAcc(self, it, sh, e) {
    if (e.shiftKey) return move0.call(self, e);
    var m = HX.physIdx(sh), sg = m[it.seg]; if (!sg) return move0.call(self, e);
    var P = HX.physSegPts(sg, m), t = proj(P, self.ev(e)), L = HX.physSegLen(sg, m, +sh.scale || 1);
    it.dist = Math.round((it.end === 'b' ? 1 - t : t) * L); self.live(); self.status(); self.view.redraw();
  }
  // Alt + arrastar um BR: desliza no tronco (o que sai dele vai junto)
  function slideBR(self, nd, sh, e) {
    var T = HX.physTrunkAt(sh, nd); if (!T) return move0.call(self, e);
    var q = self.ev(e), ax = T.A.x, ay = T.A.y, dx = T.C.x - ax, dy = T.C.y - ay, l2 = dx * dx + dy * dy || 1, t = Math.max(0.02, Math.min(0.98, ((q[0] - ax) * dx + (q[1] - ay) * dy) / l2));
    var m = HX.physIdx(sh), N = +sh.scale || 1, tot = HX.physSegLen(T.s1, m, N) + HX.physSegLen(T.s2, m, N);
    HX.physSlideBR(sh, nd, Math.round(t * tot)); self.live(); self.status(); self.view.redraw();
  }
})(typeof window !== 'undefined' ? window : globalThis);
