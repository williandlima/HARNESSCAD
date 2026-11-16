/* HarnessCAD - desenho físico: VISTA FRONTAL EM VETOR com os contatos numerados na posição real do inserto
   (MIL-STD-1560, dados de cat_38999_a/b.js), tamanho de cada contato, chaveta mestra em cima e os contatos ligados
   preenchidos com a cor do fio. Face de soquetes = espelho da face de pinos. Usada quando a folha está em desenho
   técnico (connDraw 'vec'), quando a vista pede (pface.fv 'vec'; 'img' = imagem) ou quando não há imagem do datasheet. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, CTX = null, RAT = { '22D': 1, '20': 1.35, '16': 1.9, '12': 2.6, '10': 3.1 };
  function colors(p, c) { // cor do fio ligado em cada pino
    var out = {}; if (!p) return out; var L = HX.connLayout(c, p.unit);
    p.sheets.forEach(function (S) { if (HX.isPhys(S)) return; S.items.forEach(function (w) { if (w.type !== 'wire') return; [w.pts[0], w.pts[w.pts.length - 1]].forEach(function (pt) { L.pins.forEach(function (q) { if (HX.same(q.pt, pt)) out[q.n] = w; }); }); }); });
    return out;
  }
  HX.physVecFace = function (g, c, x, y, w, col, p) {
    var e = HX.CAT.conns[c.part]; if (!e || !e.pos) return null;
    var r = w / 2, ri = r * 0.84, sock = c.gender === 'S', W = colors(p, c), md = 2;
    e.pos.forEach(function (a, i) { e.pos.forEach(function (b, j) { if (j > i) md = Math.min(md, Math.hypot(a[0] - b[0], a[1] - b[1])); }); });
    var rmin = Math.min.apply(null, e.pins.map(function (q) { return RAT[q.sz] || 1; })), base = md * ri * 0.36;
    g.style({ stroke: col, lw: 0.3, fill: '#fff', dash: null }); g.circle(x, y, r); g.style({ lw: 0.2 }); g.circle(x, y, ri);
    var kw = r * 0.2, kh = r * 0.18; g.style({ stroke: col, lw: 0.25, fill: col }); g.rect(x - kw / 2, y - ri - 0.05, kw, kh); g.style({ fill: null });
    g.text('chaveta', x, y - r - 1.1, { size: Math.min(1.3, r / 5), align: 'c', color: col });
    var fs = Math.max(0.55, Math.min(1.6, base * 1.05));
    e.pins.forEach(function (q, i) {
      var a = e.pos[i]; if (!a) return; var px = x + (sock ? -a[0] : a[0]) * ri, py = y + a[1] * ri, rr = Math.min(base * (RAT[q.sz] || 1) / rmin, md * ri * 0.48), wire = W[q.n];
      g.style({ stroke: col, lw: 0.15, fill: wire ? HX.wireHex(wire) : '#fff' }); g.circle(px, py, rr); g.style({ fill: null });
      var inside = rr > fs * 0.9, dark = wire && /BK|BU|BN|VT|GN|RD|OG|GY/.test(wire.color || '');
      if (sock) { g.style({ stroke: dark ? '#fff' : col, lw: 0.08, fill: null }); g.circle(px, py, rr * 0.78); } // soquete: anel interno
      else if (!wire && !inside) { g.style({ fill: col }); g.circle(px, py, rr * 0.25); g.style({ fill: null }); } // pino
      g.text(String(q.n), px, py - (inside ? 0 : rr + fs * 0.7), { size: fs, align: 'c', color: inside && dark ? '#fff' : col, bold: true });
    });
    return { x0: x - r, y0: y - r - 2, x1: x + r, y1: y + r, geom: { shell: (e.ins || '').split('-')[0] } };
  };
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, k) {
    if (CTX && !HX.isDsub(c)) {
      var im = HX.faceImgFor && HX.faceImgFor(c.part, c.gender), want = CTX.vec || !im || !imgOK;
      if (want) { var b = HX.physVecFace(g, c, x, y, Math.max(w, CTX.vec ? 22 : w), col, CTX.p); if (b) return b; }
      if (CTX.vec && CTX.fi) { var f0 = HX.faceImgFor; HX.faceImgFor = CTX.fi; try { return lf.call(this, g, c, x, y, w, col, true, k); } finally { HX.faceImgFor = f0; } } // sem desenho vetorial: usa a imagem do datasheet
    }
    return lf.apply(this, arguments);
  };
  var fd = EXT.pface.draw;
  EXT.pface.draw = function (g, it, p, s, o) {
    var sh = p.sheets[s], fi = HX.faceImgFor; CTX = { p: p, fi: fi, vec: it.fv === 'vec' || (it.fv !== 'img' && sh.connDraw !== 'img') };
    if (CTX.vec) HX.faceImgFor = function () { return null; }; // legenda sem "imagem do datasheet"
    try { return fd.apply(this, arguments); } finally { CTX = null; HX.faceImgFor = fi; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
