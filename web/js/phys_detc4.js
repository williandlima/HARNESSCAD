/* HarnessCAD - catálogo de detalhes: EMENDA COM LUVA DE SOLDA (SolderSleeve de emenda: TE B-155 / D-110 / D-150 e
   kits comerciais "emenda com solda e termo-retrátil"). Formato real (foto de referência do usuário + TE p. 7–12):
   tubo reto transparente, anéis de vedação coloridos pelo tamanho perto das pontas e anel de solda no meio.
   Duas vistas: ANTES (fios decapados sobrepostos sob a solda) e DEPOIS de aquecer (tubo contraído sobre os fios,
   solda escorrida no ponto de ligação, anéis vedando). Tamanhos do kit: Ø 1,7 × 26 (branco), 2,7 × 40 (vermelho),
   4,5 × 40 (azul), 6 × 40 (amarelo). */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R) return;
  var SZ = { b: [1.7, 26, 'BRANCO', '26–24 AWG'], v: [2.7, 40, 'VERMELHO', '22–18 AWG (0,5–1,5 mm²)'], a: [4.5, 40, 'AZUL', '16–14 AWG (1,5–2,5 mm²)'], y: [6, 40, 'AMARELO', '12–10 AWG (4–6 mm²)'] };
  R.ssplice = { grp: 'fio', n: 'Emenda com luva de solda (termo-retrátil com solda)', label: 'DETALHE', esc: 2.5, size: [130, 75], ref: 'TE SolderSleeve B-155 / D-110 (p. 7–12) · kits comerciais · IPC/WHMA-A-620 cap. 4',
    desc: 'Antes e depois de aquecer: fios decapados sobrepostos sob o anel de solda, anéis de vedação nas pontas, tubo contraído.',
    def: { sz: 'v', ls: 7, tl: '±1', dw: 1.6, dc: 0.9, tip: '' },
    fields: [{ k: 'sz', l: 'Tamanho (cor do anel)', type: 'select', opts: [['b', 'Ø 1,7 × 26 mm — branco'], ['v', 'Ø 2,7 × 40 mm — vermelho'], ['a', 'Ø 4,5 × 40 mm — azul'], ['y', 'Ø 6 × 40 mm — amarelo']] },
      { k: 'ls', l: 'Comprimento decapado (mm)', type: 'number', step: 0.5 }, { k: 'tl', l: 'Tolerância' }, { k: 'dw', l: 'Ø externo do fio (mm)', type: 'number', step: 0.1 }, { k: 'dc', l: 'Ø do condutor (mm)', type: 'number', step: 0.1 }],
    keys: { fio: 'Fio', emenda: 'Luva de solda (emenda)' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Z = SZ[c.S('sz')] || SZ.v, D = Z[0] * k, Lt = Z[1] * k, dw = Math.min(c.P('dw') * k, D * 0.6), dc = c.P('dc') * k, ls = c.P('ls') * k, xs = X + 14 * k, xm = xs + Lt / 2, i;
      /* ANTES: tubo com os anéis, fios entrando e condutores sobrepostos sob a solda */
      var y1 = c.Y + 16; L.wire(g, X, xm - ls / 2, y1 - dw * 0.12, dw, col, 'none', 'cut'); L.wire(g, xm + ls / 2, xs + Lt + 14 * k, y1 + dw * 0.12, dw, col, 'cut', 'none');
      L.cond(g, xm - ls / 2, xm + ls / 2, y1 - dw * 0.12, dc, col); L.cond(g, xm - ls / 2, xm + ls / 2, y1 + dw * 0.12, dc, col);
      L.ssleeve(g, xs, y1, Lt, D, dw, col);
      c.dim(xs, xs + Lt, c.Y + 5, y1 - D / 2, y1 - D / 2, Z[1], ''); c.dim(xm - ls / 2, xm + ls / 2, y1 + D / 2 + 6, y1 + dw * 0.4, y1 + dw * 0.4, 'ls', 'tl');
      g.text('Ø ' + String(Z[0]).replace('.', ','), xs - 1, y1, { size: 1.6, align: 'r', color: col }); g.text('ANTES', X, c.Y + 2, { size: 1.6, bold: true, color: col });
      L.note(g, 'ANEL DE VEDAÇÃO ' + Z[2] + '\n(PROTEÇÃO À PROVA D\'ÁGUA)', xs + Lt * 0.72, y1 + D / 2 + 9, xs + Lt * 0.76, y1 + D * 0.47, col);
      /* DEPOIS: tubo contraído sobre os fios, solda escorrida no ponto de ligação */
      var y2 = y1 + D + 30, Dr = dw * 1.25, P = [[xs, y2 - Dr / 2], [xs + Lt * 0.18, y2 - Dr / 2], [xs + Lt * 0.22, y2 - D * 0.42], [xs + Lt * 0.3, y2 - Dr * 0.55], [xs + Lt * 0.4, y2 - D * 0.5], [xs + Lt * 0.6, y2 - D * 0.5], [xs + Lt * 0.7, y2 - Dr * 0.55], [xs + Lt * 0.78, y2 - D * 0.42], [xs + Lt * 0.82, y2 - Dr / 2], [xs + Lt, y2 - Dr / 2]];
      L.wire(g, X, xm - ls / 2, y2, dw, col, 'none', 'cut'); L.wire(g, xm + ls / 2, xs + Lt + 14 * k, y2, dw, col, 'cut', 'none'); L.cond(g, xm - ls / 2, xm + ls / 2, y2, dc * 1.4, col);
      g.style({ stroke: col, lw: 0.25, fill: null }); g.poly(P, false); g.poly(P.map(function (q) { return [q[0], 2 * y2 - q[1]]; }), false); g.line(xs, y2 - Dr / 2, xs, y2 + Dr / 2); g.line(xs + Lt, y2 - Dr / 2, xs + Lt, y2 + Dr / 2);
      L.band(g, xm - Lt * 0.09, y2, Lt * 0.18, D * 0.86, col, 0.3); [0.24, 0.76].forEach(function (f) { g.style({ stroke: col, lw: 0.1 }); for (i = -1; i <= 1; i++) g.line(xs + Lt * f + i * 0.4, y2 - D * 0.38, xs + Lt * f + i * 0.4, y2 + D * 0.38); });
      g.text('DEPOIS DE AQUECER', X, y2 - D - 3, { size: 1.6, bold: true, color: col });
      L.note(g, 'PONTO DE LIGAÇÃO: SOLDA FUNDIDA ENVOLVENDO\nOS CONDUTORES (AR QUENTE)', xm + 3 * k, y2 + D + 6, xm, y2 + D * 0.43, col);
      c.ball('fio', X + 4, y2 + D + 8, X + 5, y2 + dw / 2); c.ball('emenda', xs + Lt * 0.2, c.Y + 4, xs + Lt * 0.24, y1 - D * 0.47); c.ext(xs + Lt + 16 * k, y2 + D + 12);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
