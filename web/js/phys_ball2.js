/* HarnessCAD - BALÕES no padrão das pranchas da casa (modelos de traço; folha ballStyle 'antigo' volta ao estilo anterior):
   todos do mesmo tamanho, em cadeia (item + peças associadas: contatos, tampões...), ABAIXO da peça, ao lado do rótulo,
   e uma única linha de chamada saindo do primeiro balão até a peça, com seta. O balão arrastado à mão guarda o
   deslocamento (x, y) a partir da posição automática. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.pball) return;
  HX.physBallCasa = function (sh) { var v = sh && sh.ballStyle; return v === 'casa' || (!v && !!sh && (sh.pstyle === 'line' || sh.pstyle === 'outline')); };
  function arrow(g, x, y, ux, uy, col) { var a = 1.5, w = 0.42; g.style({ fill: col, stroke: col }); g.poly([[x, y], [x - ux * a - uy * w, y - uy * a + ux * w], [x - ux * a + uy * w, y - uy * a - ux * w]], true); g.style({ fill: null }); }
  /* ponto da peça onde a seta chega: base da montagem do conector; meio do ramo/cobertura; referência dos demais */
  function target(tg, m) {
    var b = tg._bb; if (tg.type === 'pnode' && tg.nkind === 'conn' && b) return [(b.x0 + b.x1) / 2, b.y1];
    return (HX.physAnchor && HX.physAnchor(tg, m)) || (HX.physRefPt && HX.physRefPt(tg, m));
  }
  var d0 = EXT.pball.draw;
  EXT.pball.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), tg = C.m[it.of];
    if (!tg || !HX.physBallCasa(C.sh) || it.ax || it.ay || it.lead === false) return d0.apply(this, arguments);
    var A = target(tg, C.m); if (!A) return d0.apply(this, arguments);
    if (!o._bom) o._bom = HX.physBom(p, C.sh);
    var k = HX.physItemKey(p, tg, C.m), row = k && o._bom.key[k], col = it.sCol || (C.line ? C.col : (o.theme && o.theme.txt) || '#222');
    var r = +it.r || +C.sh.ballR || 2.6, fs = +it.fs || r * 0.85, num = it.n !== '' && it.n != null ? String(it.n) : row ? String(row.n) : '?';
    var nums = [num].concat(it.assoc === false ? [] : ((o._bom.assoc || {})[tg.id] || []).map(function (k2) { var q = o._bom.key[k2]; return q ? String(q.n) : null; }).filter(Boolean));
    var auto = it.pos === 'auto' || (it.x == null || it.x === '') && (it.y == null || it.y === '');
    var nb = tg.type === 'pnode' && C.sh.items.filter(function (q) { return q.type === 'pnote' && q.of === tg.id && q._bb; })[0], lb = nb && nb._bb; /* rótulo (ref + PN) */
    var x0 = (lb ? Math.max(A[0] + 4, lb.x1 + 2) : A[0] + 4) + (+it.x || 0), cy = (lb ? Math.max(A[1] + 4, (lb.y0 + lb.y1) / 2) : A[1] + 7) + (+it.y || 0); /* à direita do rótulo, abaixo da peça */
    if (!auto) { x0 = A[0] + (+it.x || 0) - r; cy = A[1] + (+it.y || 0); }
    g.style({ stroke: col, lw: 0.22, fill: null, dash: null });
    var bx = x0 + r, b = tg.type === 'pnode' && tg._bb, tx = b ? Math.max(b.x0 + 1, Math.min(b.x1 - 1, bx)) : A[0], ty = A[1]; /* chamada: do topo do 1º balão até a base da peça */
    var dx = tx - bx, dy = ty - (cy - r), L = Math.hypot(dx, dy) || 1; g.line(bx, cy - r, tx, ty + 0.2); arrow(g, tx, ty, dx / L, dy / L, col);
    nums.forEach(function (t, i) { var cx = x0 + r + i * 2 * r; g.style({ stroke: col, lw: 0.22, fill: '#fff' }); g.circle(cx, cy, r); g.style({ fill: null }); g.text(t, cx, cy, { size: fs, align: 'c', color: col }); });
    HX.physHide(it, '_bb', { x0: x0, y0: cy - r, x1: x0 + 2 * r * nums.length, y1: cy + r });
  };
})(typeof window !== 'undefined' ? window : globalThis);
