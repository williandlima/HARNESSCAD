/* HarnessCAD - catálogo de detalhes: CONECTOR E ACESSÓRIOS / FEIXE E IDENTIFICAÇÃO
   boot    bota termo-contrátil sobre o adaptador: lábio na ranhura, adesivo na área de colagem (TE 202K + S1125);
   plug    tampão de vedação nas cavidades sem contato do grommet (MS27488 / conforme conector);
   lacing  amarração do feixe com barbante: espaçamento, nó de porco + nó direito, pontas aparadas (NASA-STD-8739.4);
   etq     identificação: etiqueta sob espaguete transparente com as cotas TIP. da casa. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R) return;
  var T = function (l, k, t) { return { k: k, l: l, type: t || 'number', step: t ? undefined : 1 }; };
  R.boot = { grp: 'con', n: 'Bota sobre o adaptador (colagem)', label: 'DETALHE', esc: 1.5, size: [130, 60], ref: 'TE Raychem 202K · adesivo S1125 · padrão da casa',
    desc: 'Bota contraída sobre o adaptador, lábio encaixado na ranhura e área de colagem com adesivo.',
    def: { lc: 12, tc: 'MÍN.', da: 20, dc: 8, lbo: 45, adh: 'S1125', tip: '' },
    fields: [T('Área de colagem (mm)', 'lc'), T('Texto da tolerância', 'tc', 'text'), T('Ø do adaptador (mm)', 'da'), T('Ø do cabo (mm)', 'dc'), T('Comprimento da bota (mm)', 'lbo'), T('Adesivo', 'adh', 'text')],
    keys: { adp: 'Adaptador (REF)', bota: 'Bota' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 20, da = c.P('da') * k, dc = c.P('dc') * k, lc = c.P('lc') * k, lb = c.P('lbo') * k, xn = X + 12 * k, xr = xn + 14 * k, i;
      g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.rect(X, Y - da * 0.6, 12 * k, da * 1.2); g.style({ fill: null, lw: 0.08 }); for (i = 1; i < 12; i++) g.line(X + i * k, Y - da * 0.6, X + i * k, Y + da * 0.6); /* porca recartilhada */
      g.style({ lw: 0.25, fill: '#fff' }); g.rect(xn, Y - da / 2, xr - xn, da); g.style({ fill: null }); g.rect(xr - 4 * k, Y - da * 0.46, 1.4 * k, da * 0.92); /* ranhura */
      var P = [[xn + 3 * k, Y - da / 2 - 0.6], [xr + 2 * k, Y - da / 2 - 0.6], [xr + lb * 0.45, Y - dc / 2 - 0.4], [xr + lb, Y - dc / 2 - 0.3], [xr + lb, Y + dc / 2 + 0.3], [xr + lb * 0.45, Y + dc / 2 + 0.4], [xr + 2 * k, Y + da / 2 + 0.6], [xn + 3 * k, Y + da / 2 + 0.6]];
      g.style({ stroke: col, lw: 0.3, fill: '#fff' }); g.poly(P, true); g.style({ fill: null, lw: 0.07 }); g.line(xr + 3 * k, Y - da * 0.36, xr + lb * 0.42, Y - dc * 0.32); g.line(xr + lb * 0.5, Y - dc * 0.3, xr + lb - 1, Y - dc * 0.3);
      g.style({ lw: 0.25 }); g.poly([[xr - 4 * k, Y - da / 2 - 0.6], [xr - 3.3 * k, Y - da * 0.47], [xr - 2.6 * k, Y - da / 2 - 0.6]], false); g.poly([[xr - 4 * k, Y + da / 2 + 0.6], [xr - 3.3 * k, Y + da * 0.47], [xr - 2.6 * k, Y + da / 2 + 0.6]], false); /* lábio na ranhura */
      for (var x = xn + 3.5 * k; x < xn + 3 * k + lc; x += 1.2) { g.circle(x, Y - da / 2 - 0.3, 0.12); g.circle(x + 0.6, Y + da / 2 + 0.3, 0.12); } /* adesivo */
      L.wire(g, xr + lb, xr + lb + 18 * k, Y, dc, col, 'none', 'none');
      c.dim(xn + 3 * k, xn + 3 * k + lc, c.Y + 5, Y - da / 2 - 0.6, Y - da / 2 - 0.6, 'lc', 'tc');
      L.note(g, 'LÁBIO DA BOTA NA RANHURA', xr + 4 * k, Y + da / 2 + 7, xr - 3.3 * k, Y + da * 0.49, col); L.note(g, 'ADESIVO ' + c.S('adh') + ' NA ÁREA DE COLAGEM', xn + 3 * k + lc + 6, c.Y + 7, xn + 3 * k + lc * 0.7, Y - da / 2 - 0.5, col);
      c.ball('adp', X + 6 * k, Y + da * 0.6 + 9, X + 6 * k, Y + da * 0.6, -1); c.ball('bota', xr + lb * 0.7, Y - dc - 9, xr + lb * 0.7, Y - dc / 2 - 0.4); c.ext(xr + lb + 20 * k, Y + da / 2 + 12);
    }
  };
  R.plug = { grp: 'con', n: 'Tampão de vedação nas cavidades vazias', label: 'DETALHE', esc: 4, size: [110, 60], ref: 'MS27488 (tampão) · conforme o conector (grommet traseiro)',
    desc: 'Corte do grommet: contato na cavidade usada e tampão na cavidade sem contato, cabeça encostada no grommet.',
    def: { dg: 3, tip: '' }, fields: [T('Espessura do grommet (mm)', 'dg')], keys: { tamp: 'Tampão', cont: 'Contato', fio: 'Fio' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 12, tg = c.P('dg') * k, H = 2.8 * k, xg = X + 12 * k, i;
      g.style({ stroke: col, lw: 0.25, fill: '#fff' }); g.rect(xg, Y, tg, H * 2.2); g.style({ fill: null, lw: 0.08 }); L.hatch(g, L.rect(xg, Y + H * 1.1, tg, H * 2.2), 0.6, [45]); g.style({ lw: 0.25 });
      [Y + H * 0.55, Y + H * 1.65].forEach(function (cy, j) { g.style({ fill: '#fff' }); g.rect(xg - 0.1, cy - H * 0.17, tg + 0.2, H * 0.34); g.style({ fill: null });
        if (!j) { L.wire(g, X, xg + tg * 0.3, cy, H * 0.3, col, 'none', 'cut'); g.rect(xg + tg * 0.3, cy - H * 0.12, tg * 0.7 + 4 * k, H * 0.24); }
        else { g.style({ fill: '#fff' }); g.rect(xg - 2.5 * k, cy - H * 0.26, 2.5 * k, H * 0.52); g.rect(xg, cy - H * 0.14, tg + 2 * k, H * 0.28); g.style({ fill: null }); for (i = 1; i < 3; i++) g.line(xg - 2.5 * k * i / 3, cy - H * 0.26, xg - 2.5 * k * i / 3, cy + H * 0.26); } });
      g.text('GROMMET', xg + tg / 2, Y - 2, { size: 1.3, align: 'c', color: col });
      L.note(g, 'TAMPÃO EM TODA CAVIDADE SEM CONTATO,\nCABEÇA ENCOSTADA NO GROMMET', xg + tg + 6, Y + H * 2.2 + 4, xg - 1.2 * k, Y + H * 1.65 + H * 0.26, col);
      c.ball('tamp', xg - 10 * k, Y + H * 2.2 + 8, xg - 1.5 * k, Y + H * 1.9); c.ball('cont', xg + tg + 8 * k, Y - 4, xg + tg + 3 * k, Y + H * 0.45); c.ball('fio', X + 6, Y - 4, X + 7, Y + H * 0.42); c.ext(xg + tg + 45, Y + H * 2.2 + 12);
    }
  };
  R.lacing = { grp: 'feixe', n: 'Amarração do feixe com barbante', label: 'DETALHE', esc: 1, size: [140, 45], ref: 'NASA-STD-8739.4 cap. 10 · IPC/WHMA-A-620 cap. 14',
    desc: 'Amarrações espaçadas ao longo do feixe; nó de porco travado com nó direito, pontas aparadas.',
    def: { sp: 25, ts: '±5', dia: 8, n: 4, pt: '3 A 6', tip: 'TIP.' },
    fields: [T('Espaçamento (mm)', 'sp'), T('Tolerância', 'ts', 'text'), T('Ø do feixe (mm)', 'dia'), T('Nº de amarrações no desenho', 'n'), T('Pontas aparadas (texto, mm)', 'pt', 'text')], keys: { barb: 'Barbante' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, d = c.P('dia') * k, sp = c.P('sp') * k, n = Math.max(2, Math.min(8, c.P('n'))), Lt = sp * (n + 0.6), i;
      L.wires(g, X, X + Lt, Y, d, 7, col); g.style({ stroke: col, lw: 0.25 }); g.line(X, Y - d / 2 - 0.2, X + Lt, Y - d / 2 - 0.2); g.line(X, Y + d / 2 + 0.2, X + Lt, Y + d / 2 + 0.2);
      for (i = 0; i < n; i++) L.tie(g, X + sp * (i + 0.8), Y, d + 0.4, col, 2);
      c.dim(X + sp * 0.8, X + sp * 1.8, c.Y + 5, Y - d / 2 - 3, Y - d / 2 - 3, 'sp', 'ts');
      L.note(g, 'NÓ DE PORCO + NÓ DIREITO,\nPONTAS APARADAS ' + c.S('pt') + ' mm', X + sp * 2.9, c.Y + 4, X + sp * 2.8 + 0.4, Y - d / 2 - 1.6, col);
      c.ball('barb', X + sp * 0.8 + 5, Y + d + 8, X + sp * 0.8 + 0.6, Y + d / 2 + 0.3); c.ext(X + Lt + 2, Y + d + 11);
    }
  };
  R.etq = { grp: 'feixe', n: 'Etiqueta sob espaguete transparente', label: 'DETALHE', esc: 2, size: [120, 50], ref: 'Padrão da casa (pranchas)',
    desc: 'Etiqueta centrada sob o espaguete transparente, cotas TIP. de folga, espaguete, margem e etiqueta.',
    def: { gap: 10, ls: 30, tls: '', lab: 20, txt: 'P1', dia: 6, tip: 'TIP.' },
    fields: [T('Folga até o fim da bota (mm)', 'gap'), T('Espaguete (mm)', 'ls'), T('Tolerância do espaguete', 'tls', 'text'), T('Etiqueta (mm)', 'lab'), T('Texto da etiqueta', 'txt', 'text'), T('Ø do feixe (mm)', 'dia')], keys: { etq: 'Etiqueta', espt: 'Espaguete transparente' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 20, d = c.P('dia') * k, gp = c.P('gap') * k, ls = c.P('ls') * k, lb = Math.min(c.P('lab') * k, ls), x0 = X + 6 * k + gp, xl = x0 + (ls - lb) / 2;
      g.style({ stroke: col, lw: 0.3 }); g.line(X + 6 * k, Y - d, X + 6 * k, Y + d); g.text('BOTA', X + 5 * k, Y + d + 2, { size: 1.2, align: 'r', color: col });
      L.wires(g, X + 6 * k, x0 + ls + 20 * k, Y, d * 0.7, 5, col); L.tube(g, x0, x0 + ls, Y, d * 1.2, col, true);
      g.style({ stroke: col, lw: 0.22 }); g.rect(xl, Y - d * 0.5, lb, d); g.text(c.S('txt'), xl + lb / 2, Y, { size: Math.min(2.2, d * 0.55), bold: true, align: 'c', color: col });
      c.dim(X + 6 * k, x0, c.Y + 5, Y - d, Y - d * 0.62, 'gap', ''); c.dim(x0, x0 + ls, c.Y + 5, Y - d * 0.62, Y - d * 0.62, 'ls', 'tls'); c.dim(x0, xl, c.Y + 12, Y - d * 0.62, Y - d * 0.5, (c.P('ls') - Math.min(c.P('lab'), c.P('ls'))) / 2, '');
      c.dim(xl, xl + lb, c.Y + 12, Y - d * 0.5, Y - d * 0.5, 'lab', '');
      c.ball('etq', xl + lb * 0.5, Y + d + 8, xl + lb * 0.5, Y + d * 0.5); c.ball('espt', x0 + ls + 6, Y + d + 8, x0 + ls - 1, Y + d * 0.55); c.ext(x0 + ls + 22 * k, Y + d + 11);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
