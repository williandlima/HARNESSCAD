/* HarnessCAD - MONTAGEM MIL DA CASA (2): balões no padrão da prancha — o conector fica com contatos e tampões; o ADAPTADOR
   (em cima) e a BOTA (embaixo) têm balão próprio com seta na peça. A posição de cada peça da montagem no papel é
   registrada durante o desenho do nó (_asm). */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.physDrawAssembly || !HX.ITEM_EXT.pball) return;
  /* posição de cada peça da montagem no papel (para o balão do adaptador e o da bota apontarem para elas) */
  var da0 = HX.physDrawAssembly;
  HX.physDrawAssembly = function (g, E, x, y, ang, N, k, flip) {
    var R = HX._asmRec; if (!R) return da0.apply(this, arguments);
    var q = Object.create(g), dep = 0, cnt = 0, s = k / N;
    q.push = function (M) { if (dep === 0) { var e = E[E.length - 1 - cnt++]; if (e) { var W = e.L * s, H = e.H * s, x0 = -e.e1[0] * W, y0 = -e.e1[1] * H, T = function (u, v) { return [M[4] + M[0] * u + M[2] * v, M[5] + M[1] * u + M[3] * v]; };
      R.push({ id: e.id, top: T(x0 + W / 2, y0), bot: T(x0 + W / 2, y0 + H), conn: !!e.conn }); } } dep++; return g.push(M); };
    q.pop = function () { dep--; return g.pop(); };
    return da0.call(this, q, E, x, y, ang, N, k, flip);
  };
  var nd0 = HX.ITEM_EXT.pnode.draw;
  HX.ITEM_EXT.pnode.draw = function (g, it) { if (it.nkind !== 'conn') return nd0.apply(this, arguments); HX._asmRec = []; try { return nd0.apply(this, arguments); } finally { HX.physHide(it, '_asm', HX._asmRec); HX._asmRec = null; } };
  /* balões da casa: adaptador (em cima) e bota (embaixo) com balão próprio; o conector fica com contatos e tampões */
  var bd0 = HX.ITEM_EXT.pball.draw;
  HX.ITEM_EXT.pball.draw = function (g, it, p, s, o) {
    var C = HX.physCtx(p, s, o), tg = C.m[it.of], A = tg && tg._asm;
    if (!A || !A.length || !HX.physBallCasa || !HX.physBallCasa(C.sh) || it.ax || it.ay || it.lead === false) return bd0.apply(this, arguments);
    if (!o._bom) o._bom = HX.physBom(p, C.sh); var B = o._bom, all = (B.assoc || {})[tg.id] || [], sep = [], keep = [];
    all.forEach(function (k) { var m = /^d:([^:]+):/.exec(k), e = m && A.filter(function (a) { return a.id === m[1] && !a.conn; })[0]; if (e && B.key[k]) sep.push([e, B.key[k]]); else keep.push(k); });
    if (!sep.length) return bd0.apply(this, arguments);
    B.assoc[tg.id] = keep; try { bd0.apply(this, arguments); } finally { B.assoc[tg.id] = all; }
    var col = it.sCol || (C.line ? C.col : (o.theme && o.theme.txt) || '#222'), r = +C.sh.ballR || 2.6;
    sep.forEach(function (e) { var up = e[0].id !== 'rc_202K' && !/^boot/.test(e[0].id), P = up ? e[0].top : e[0].bot, K = A.filter(function (a) { return a.conn; })[0], dx0 = K && (P[0] - K.top[0]) < 0 ? -1 : 1, cx = P[0] + dx0 * (up ? 3 : 7), cy = P[1] + (up ? -7 : 9); /* bota: balão para o lado do cabo (longe da cadeia do conector) */
      g.style({ stroke: col, lw: 0.22, fill: null, dash: null }); var dx = P[0] - cx, dy = P[1] - (cy + (up ? r : -r)), L = Math.hypot(dx, dy) || 1; g.line(cx, cy + (up ? r : -r), P[0], P[1]);
      g.style({ fill: col }); g.poly([[P[0], P[1]], [P[0] - dx / L * 1.5 - dy / L * 0.42, P[1] - dy / L * 1.5 + dx / L * 0.42], [P[0] - dx / L * 1.5 + dy / L * 0.42, P[1] - dy / L * 1.5 - dx / L * 0.42]], true);
      g.style({ fill: '#fff' }); g.circle(cx, cy, r); g.style({ fill: null }); g.text(String(e[1].n), cx, cy, { size: r * 0.85, align: 'c', color: col }); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
