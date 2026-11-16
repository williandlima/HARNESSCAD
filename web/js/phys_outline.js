/* HarnessCAD - desenho físico no FORMATO DA CASA (modelo "Contorno"): conector em desenho técnico, bota sombreada,
   ESPAGUETE como contorno contínuo (duas linhas, sem fios soltos nem textura) até a transição, transição sombreada,
   e balões em cadeia — espaguete + cordoalha interna (4)(5), conector + peças associadas (1)(2), transição (6).
   Usa os itens que já existem (balões, bandeiras de nota, cotas); só muda o jeito de desenhar. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, OUT = false, SHADE = '#7a7a7a';
  function off(P, d) { // polilinha deslocada d para o lado (normal média nos vértices)
    return P.map(function (q, i) {
      var a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [q[0] - dy / l * d, q[1] + dx / l * d];
    });
  }
  HX.physOutlineSleeve = function (g, P, hw, col) {
    var A = off(P, hw), B = off(P, -hw);
    g.style({ stroke: col, lw: 0, fill: '#fff', dash: null }); g.poly(A.concat(B.slice().reverse()), true);
    g.style({ stroke: col, lw: 0.3, fill: null }); g.poly(A, false); g.poly(B, false);
  };
  var lj = HX.physLineJacket;
  HX.physLineJacket = function (g, P, col, tA, tB, cov, bw) { if (!OUT) return lj.apply(this, arguments); HX.physOutlineSleeve(g, P, bw / 2 + 0.6, col); };
  var fan = HX.physFan;
  HX.physFan = function () { if (!OUT) return fan.apply(this, arguments); };
  function wrap(type) {
    var d0 = EXT[type].draw;
    EXT[type].draw = function (g, it, p, s, o) { var prev = OUT; OUT = !!HX.physCtx(p, s, o).outline; try { return d0.apply(this, arguments); } finally { OUT = prev; } };
  }
  wrap('pseg'); wrap('pnode');
  // no contorno, item com balão perde o texto de chamada (o balão já aponta o nº da lista de materiais)
  var pa = EXT.pacc.draw;
  EXT.pacc.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o); if (!C.outline || !C.sh.items.some(function (b) { return b.type === 'pball' && b.of === it.id; })) return pa.apply(this, arguments);
    var dep = 0, q = Object.create(g); q.push = function () { dep++; return g.push.apply(g, arguments); }; q.pop = function () { dep--; return g.pop.apply(g, arguments); };
    q.text = function () { if (dep > 0) return g.text.apply(g, arguments); }; q.line = function () { if (dep > 0) return g.line.apply(g, arguments); };
    return pa.call(this, q, it, p, s, o);
  };
  var V = HX.PHYS_VEC;
  if (V) ['boot_s', 'boot_90'].forEach(function (k) {
    var v0 = V[k]; V[k] = function () { var st = HX.physVecST && HX.physVecST(); if (!OUT || !st) return v0.apply(this, arguments); var b = st.boot; st.boot = SHADE; st.line = false;
      try { return v0.apply(this, arguments); } finally { st.boot = b; st.line = true; } };
  });
  // balão na ramificação aponta para a transição (nº da lista de materiais)
  var ik = HX.physItemKey;
  HX.physItemKey = function (p, it, m) {
    if (it && HX.isBranchNode && HX.isBranchNode(it)) {
      var si = -1; p.sheets.forEach(function (sh, i) { if (sh.items.indexOf(it) >= 0) si = i; }); if (si < 0 || !HX.physTransOf(it, p.sheets[si])) return null;
      var T = HX.physTransPick(it, HX.physCtx(p, si, {}), HX.physBundleCtx(p, si, {})); return T.L.length >= 3 ? 'rcx:' + (T.pn || '?') : null;
    }
    return ik(p, it, m);
  };
  // balões que faltam: ramos com cobertura e transições (usado pelo padrão MS / modelo contorno)
  HX.physAddBalloons = function (doc, sh) {
    var has = {}, n = 0, m = HX.physIdx(sh); sh.items.forEach(function (i) { if (i.type === 'pball') has[i.of] = 1; });
    sh.items.slice().forEach(function (i) {
      var want = (i.type === 'pseg' && i.cover) || (HX.isBranchNode && HX.isBranchNode(i) && HX.physTransOf(i, sh)) || (i.type === 'pnode' && i.nkind === 'conn') || (i.type === 'pacc' && i.kind === 'ssleeve');
      if (!want || has[i.id]) return; var x = 8, y = -10;
      if (i.type === 'pseg' || i.type === 'pacc') { var sg = i.type === 'pseg' ? i : m[i.seg], P = sg && HX.physSegPts(sg, m); if (P && P.length > 1) { var q = HX.polyAt(P, 0.5), nx = -q.d[1], ny = q.d[0]; if (ny > 0 || (Math.abs(ny) < 1e-6 && nx > 0)) { nx = -nx; ny = -ny; } var k = i.type === 'pacc' ? -9 : 12; x = Math.round(nx * k); y = Math.round(ny * k); } }
      doc.add({ type: 'pball', id: doc.uid('a'), of: i.id, x: x, y: y, pos: i.nkind === 'conn' ? 'auto' : '', n: '' }); n++;
    });
    return n;
  };
  var am = HX.physApplyMS;
  if (am) HX.physApplyMS = function (doc, sh, opt) { var n = am(doc, sh, opt); if (!opt || opt.outline !== false) { sh.pstyle = 'outline'; if (!sh.lineColor) sh.lineColor = '#111111'; } n.ball = HX.physAddBalloons(doc, sh); return n; };
})(typeof window !== 'undefined' ? window : globalThis);
