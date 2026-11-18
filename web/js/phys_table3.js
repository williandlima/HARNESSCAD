/* HarnessCAD - LISTA DE MATERIAIS no padrão da casa (ptable kind 'bom'; formato antigo com bstyle 'tabela').
   Como nas pranchas de referência: lista sobre o carimbo, cabeçalho embaixo e itens subindo (item 1 logo acima do
   cabeçalho), quantidade com a unidade (peças sem unidade, fio em mm: "2.800 mm"), descrição em maiúsculas e o código
   (part number) na última coluna. anchor 'b' = it.y é a BASE da tabela (cresce para cima ao entrar item novo). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.ptable) return;
  HX.fmtBR = function (v, dec) { /* 2800 -> "2.800"; 0.5 -> "0,5" */
    var n = Math.round(+v * Math.pow(10, dec || 0)) / Math.pow(10, dec || 0); if (!isFinite(n)) return String(v == null ? '' : v);
    var s = String(Math.abs(n)).split('.'), i = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (n < 0 ? '-' : '') + i + (s[1] ? ',' + s[1] : '');
  };
  HX.bomQty = function (r) {
    var un = String(r.un || '').toLowerCase(), q = +r.qty;
    if (un === 'm') return HX.fmtBR(q * 1000, 0) + ' mm';
    if (un === 'mm') return HX.fmtBR(q, 0) + ' mm';
    if (!un || un === 'pç' || un === 'pc' || un === 'un') return HX.fmtBR(q, 3);
    return HX.fmtBR(q, 3) + ' ' + r.un;
  };
  var CC = [['ITEM', 12], ['QTD', 24], ['DESCRIÇÃO', 96], ['CÓDIGO', 38]];
  function fit(s, size, w) { s = String(s == null ? '' : s); while (s.length > 1 && HX.textW(s, size) > w) s = s.slice(0, -1); return s; }
  /* linhas da lista com as edições do usuário: it.ov[chave] = { n, q, d, c (textos; vazio = automático), h (esconder), o (ordem) };
     it.extra = linhas manuais { n, q, d, c, o } */
  HX.bomRowsEdit = function (it, B) {
    var ov = it.ov || {}, R = B.map(function (r, i) { var e = ov[r.k] || {}; return { k: r.k, r: r, h: !!e.h, o: e.o != null && e.o !== '' ? +e.o : i + 1,
      v: [e.n || r.n, e.q || HX.bomQty(r), e.d || String(r.desc || '').toUpperCase(), e.c || r.pn || '—'] }; });
    (it.extra || []).forEach(function (e, j) { R.push({ k: 'x' + j, x: 1, o: e.o != null && e.o !== '' ? +e.o : B.length + j + 1, v: [e.n || '', e.q || '', String(e.d || '').toUpperCase(), e.c || ''] }); });
    return R.filter(function (r) { return !r.h; }).sort(function (a, b) { return a.o - b.o; });
  };
  function cols(it) { var W = String(it.cw || '').split(/[;,]/), H = String(it.ch || '').split(/[;,]/), O = String(it.co || '').split(/[;,]/).map(Number).filter(function (j) { return j >= 0 && j < 4; });
    if (O.length === 4) { var K0 = cols0(W, H); return O.map(function (j) { return K0.filter(function (c) { return c[2] === j; })[0]; }).filter(Boolean); } /* ordem das colunas */
    return cols0(W, H);
  }
  function cols0(W, H) {
    return CC.map(function (c, j) { var w = W[j] != null && W[j].trim() !== '' ? +W[j] : c[1]; return [H[j] != null && H[j].trim() !== '' ? H[j].trim() : c[0], isFinite(w) ? w : c[1], j]; }).filter(function (c) { return c[1] > 0; }); }
  function bom(g, it, p, C, col) {
    var B = HX.bomRowsEdit(it, HX.physBom(p, C.sh).rows), rh = +it.rh || 4.2, fs = +it.fs || 1.8, K = cols(it), W = K.reduce(function (a, c) { return a + c[1]; }, 0), n = B.length + 1;
    var x = it.x, y = it.anchor === 'b' ? it.y - rh * n : it.y, yb = y + rh * n;
    g.style({ stroke: col, lw: 0.3, fill: '#fff', dash: null }); g.rect(x, y, W, rh * n); g.style({ fill: null });
    var xx = x; K.forEach(function (c, k) { if (k) { g.style({ stroke: col, lw: 0.2 }); g.line(xx, y, xx, yb); } xx += c[1]; });
    g.style({ stroke: col, lw: 0.3 }); g.line(x, yb - rh, x + W, yb - rh);
    xx = x; K.forEach(function (c) { g.text(fit(c[0], fs, c[1] - 1), xx + c[1] / 2, yb - rh / 2, { size: fs, bold: true, align: 'c', color: col }); xx += c[1]; });
    B.forEach(function (r, i) { /* item 1 logo acima do cabeçalho, os demais subindo */
      var yy = yb - rh * (i + 1.5), v = r.v; xx = x;
      if (i) { g.style({ stroke: col, lw: 0.15 }); g.line(x, yy + rh / 2, x + W, yy + rh / 2); }
      K.forEach(function (c) { var j = c[2], al = j === 2 ? 'l' : 'c'; g.text(fit(v[j], fs, c[1] - 1.6), al === 'l' ? xx + 1 : xx + c[1] / 2, yy, { size: fs, align: al, color: col }); xx += c[1]; });
    });
    if (it.title && it.title !== '-') g.text(String(it.title), x, y - 2, { size: +it.tfs || 2.2, bold: true, color: col });
    return { x0: x, y0: y - (it.title ? 4.5 : 0), x1: x + W, y1: yb };
  }
  HX.PTABLE_COLS = HX.PTABLE_COLS || {}; HX.PTABLE_COLS.bomCasa = CC;
  var d0 = EXT.ptable.draw;
  EXT.ptable.draw = function (g, it, p, s, o) {
    if (it.kind !== 'bom' || it.bstyle === 'tabela') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), col = C.line ? C.col : o.theme.txt || '#000'; HX.physHide(it, '_bb', bom(g, it, p, C, col));
  };
})(typeof window !== 'undefined' ? window : globalThis);
