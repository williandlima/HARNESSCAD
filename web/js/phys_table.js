/* HarnessCAD - desenho físico: tabelas arrastáveis.
   ptable kind 'wiring' = tabela de ligação no estilo do desenho Altium (bloco do conector de origem com os pinos,
   sinal, linha do fio com a cor no meio e bloco do destino); kind 'bom' = lista de materiais (nº = balões). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  function cols(it, D) { // colunas customizáveis: larguras (cw) e títulos (ch) separados por vírgula; largura 0 esconde
    var W = String(it.cw || '').split(/[;,]/), H = String(it.ch || '').split(/[;,]/);
    return D.map(function (c, j) { var w = W[j] != null && W[j].trim() !== '' ? +W[j] : c[1], h = H[j] != null && H[j].trim() !== '' ? H[j].trim() : c[0]; return [h, isFinite(w) ? w : c[1], j]; }).filter(function (c) { return c[1] > 0; });
  }
  function ttl(it, d) { return it.title == null || it.title === '' ? d : it.title === '-' ? '' : String(it.title); }
  function fit(s, size, w) { s = String(s == null ? '' : s); while (s.length > 1 && HX.textW(s, size) > w) s = s.slice(0, -1); return s; }
  function wiring(g, it, p, C, col) {
    var R = HX.physWiring(p), rh = +it.rh || 3.4, fs = +it.fs || 1.7, x = it.x, y = it.y, W = +it.w || 170, bw = 16, red = C.line ? '#8b1a1a' : col;
    g.text(ttl(it, 'TABELA DE LIGAÇÃO'), x, y - 2.2, { size: +it.tfs || 2.2, bold: true, color: col });
    var H = Math.max(1, R.length) * rh + 2;
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.rect(x, y, bw, H); g.rect(x + W - bw, y, bw, H); g.style({ fill: null });
    if (!R.length) g.text('sem fios no esquemático', x + W / 2, y + H / 2, { size: fs, align: 'c', color: col });
    R.forEach(function (r, i) {
      var yy = y + 1 + rh * (i + 0.5), mid = x + W / 2;
      g.text(fit(r.from.ref + (r.from.pin ? ':' + r.from.pin : ''), fs, bw - 1.2), x + bw - 0.6, yy, { size: fs, align: 'r', color: col });
      g.text(fit(r.to.ref + (r.to.pin ? ':' + r.to.pin : ''), fs, bw - 1.2), x + W - bw + 0.6, yy, { size: fs, color: col });
      g.style({ stroke: col, lw: 0.15 }); g.line(x + bw, yy + 0.9, x + W - bw, yy + 0.9);
      g.text(fit(r.name || r.num, fs, W / 2 - bw - 4), x + bw + 1.5, yy - 0.2, { size: fs, color: red });
      g.text(fit((r.color || '').toUpperCase() + (r.gauge ? ' ' + r.gauge : ''), fs, W / 2 - bw - 6), mid + 1.5, yy - 0.2, { size: fs, color: col });
      g.style({ fill: col }); g.circle(mid, yy + 0.9, 0.35); g.style({ fill: null });
    });
    var i0 = 0; R.forEach(function (r, i) { // par trançado: oval sobre as linhas do mesmo grupo (como no Altium)
      var nx = R[i + 1]; if (nx && nx.twist && nx.twist === r.twist) return;
      if (r.twist) { var ya = y + 1 + rh * i0, yb = y + 1 + rh * (i + 1), mx = x + W / 2, ry = (yb - ya) / 2, P = [];
        for (var k = 0; k <= 24; k++) { var t = k / 24 * 2 * Math.PI; P.push([mx + 1.6 * Math.cos(t), ya + ry + ry * Math.sin(t)]); } g.style({ stroke: col, lw: 0.2, fill: null }); g.poly(P, true);
        g.text(r.twist, mx - 2.2, ya + ry, { size: 1.4, align: 'r', bold: true, color: col }); }
      i0 = i + 1;
    });
    return { x0: x, y0: y - 4.5, x1: x + W, y1: y + H };
  }
  HX.PTABLE_COLS = {};
  var BC = [['ITEM', 10], ['QTD', 13], ['UN', 8], ['PART NUMBER', 46], ['DESCRIÇÃO', 66]];
  function bom(g, it, p, C, col) {
    var B = HX.physBom(p, C.sh).rows, rh = +it.rh || 3.6, fs = +it.fs || 1.7, x = it.x, y = it.y, K = cols(it, BC), W = K.reduce(function (a, c) { return a + c[1]; }, 0);
    g.text(ttl(it, 'LISTA DE MATERIAIS'), x, y - 2.2, { size: +it.tfs || 2.2, bold: true, color: col });
    g.style({ stroke: col, lw: 0.25, fill: C.line ? '#eef0fb' : '#f3efd6', dash: null }); g.rect(x, y, W, rh); g.style({ fill: null }); g.rect(x, y, W, rh * (B.length + 1));
    var xx = x; K.forEach(function (c) { g.text(fit(c[0], fs, c[1] - 1.2), xx + 0.8, y + rh / 2, { size: fs, bold: true, color: col }); xx += c[1]; if (xx < x + W - 0.01) g.line(xx, y, xx, y + rh * (B.length + 1)); });
    B.forEach(function (r, i) {
      var yy = y + rh * (i + 1.5), v = [r.n, String(r.qty).replace('.', ','), r.un, r.pn, r.desc]; xx = x;
      g.style({ stroke: col, lw: 0.12 }); g.line(x, y + rh * (i + 1), x + W, y + rh * (i + 1));
      K.forEach(function (c) { g.text(fit(v[c[2]], fs, c[1] - 1.4), xx + 0.8, yy, { size: fs, bold: c[2] === 0, color: col }); xx += c[1]; });
    });
    return { x0: x, y0: y - 4.5, x1: x + W, y1: y + rh * (B.length + 1) };
  }
  // tabela de conexão de UM conector (como a Connection Table do Altium): pino, sinal, fio, cor/bitola, destino, decapagem
  var CC = [['PINO', 10], ['SINAL', 22], ['FIO', 12], ['COR / BITOLA', 30], ['DESTINO', 22], ['DECAP.', 16]];
  function conn(g, it, p, C, col) {
    var nd = C.m[it.of], c = nd && C.S[nd.of], x = it.x, y = it.y, rh = +it.rh || 3.4, fs = +it.fs || 1.6, K = cols(it, CC), W = K.reduce(function (a, q) { return a + q[1]; }, 0);
    if (!c) { g.text('conector removido', x, y, { size: fs, color: '#c00' }); return { x0: x, y0: y - 3, x1: x + 30, y1: y + 2 }; }
    var R = HX.wireList(p).filter(function (r) { return r.fromEnd && r.toEnd && (r.fromEnd.ref === c.ref || r.toEnd.ref === c.ref); }).map(function (r) {
      var me = r.fromEnd.ref === c.ref, a = me ? r.fromEnd : r.toEnd, b = me ? r.toEnd : r.fromEnd;
      return [a.pin || '', ((HX.connLayout(c, p.unit).pins.filter(function (q) { return String(q.n) === String(a.pin); })[0] || {}).pin || {}).name || r.signal || '', r.num, (r.w.color || '') + ' ' + r.gauge, b.ref + (b.pin ? ':' + b.pin : ''), me ? r.stripA : r.stripB];
    }).sort(function (u, v) { return String(u[0]).localeCompare(String(v[0]), undefined, { numeric: true }); });
    g.text(ttl(it, 'CONEXÕES ' + c.ref + ' — ' + HX.connPN(c)), x, y - 2.2, { size: +it.tfs || 2.1, bold: true, color: col });
    g.style({ stroke: col, lw: 0.25, fill: C.line ? '#eef0fb' : '#f3efd6', dash: null }); g.rect(x, y, W, rh); g.style({ fill: null }); g.rect(x, y, W, rh * (R.length + 1));
    var xx = x; K.forEach(function (q) { g.text(fit(q[0], fs, q[1] - 1.2), xx + 0.8, y + rh / 2, { size: fs, bold: true, color: col }); xx += q[1]; if (xx < x + W - 0.01) g.line(xx, y, xx, y + rh * (R.length + 1)); });
    R.forEach(function (r, i) { var yy = y + rh * (i + 1.5); xx = x; g.style({ stroke: col, lw: 0.12 }); g.line(x, y + rh * (i + 1), x + W, y + rh * (i + 1)); K.forEach(function (q) { g.text(fit(r[q[2]], fs, q[1] - 1.4), xx + 0.8, yy, { size: fs, bold: q[2] === 0, color: col }); xx += q[1]; }); });
    return { x0: x, y0: y - 4.5, x1: x + W, y1: y + rh * (R.length + 1) };
  }
  HX.PTABLE_COLS = { bom: BC, conn: CC };
  EXT.ptable = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), col = C.line ? C.col : o.theme.txt || '#000';
      hide(it, '_bb', it.kind === 'bom' ? bom(g, it, p, C, col) : it.kind === 'conn' ? conn(g, it, p, C, col) : wiring(g, it, p, C, col));
    },
    bbox: function (it) { return it._bb || { x0: it.x, y0: it.y, x1: it.x + 20, y1: it.y + 10 }; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
