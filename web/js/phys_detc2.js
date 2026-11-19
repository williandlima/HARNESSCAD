/* HarnessCAD - catálogo de detalhes: PREPARAÇÃO DE FIO
   strip   decapagem: comprimento decapado com tolerância, filamentos íntegros e torcidos, corte da isolação em
           esquadro; seção do condutor (filamentos) — IPC/WHMA-A-620 cap. 3 / NASA-STD-8739.4;
   crimp   crimpagem de contato fechado (MIL-DTL-38999 / 26482, M39029): condutor visível na janela de inspeção,
           folga da isolação 0,25–0,76 mm, indentações de 4 pontos (alicate M22520/1 + posicionador do contato);
   splice  emenda crimpada de topo com termo-retrátil (M81824/1, SAE AS81824). Valores padrão editáveis: confira no
           datasheet do contato/emenda usado. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R) return;
  var T = function (l, k, t) { return { k: k, l: l, type: t || 'number', step: t ? undefined : 0.1 }; };
  function section(g, cx, cy, rr, col, n) { g.style({ stroke: col, lw: 0.2, fill: '#fff' }); g.circle(cx, cy, rr); g.style({ fill: null }); var rc = rr * 0.62; g.circle(cx, cy, rc);
    var rs = rc / (n > 7 ? 5.05 : 3.05); g.style({ lw: 0.08 }); g.circle(cx, cy, rs); for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; g.circle(cx + Math.cos(a) * rs * 2, cy + Math.sin(a) * rs * 2, rs); }
    if (n > 7) for (i = 0; i < 12; i++) { var b = (i + 0.5) * Math.PI / 6; g.circle(cx + Math.cos(b) * rs * 4, cy + Math.sin(b) * rs * 4, rs); } g.style({ lw: 0.2 }); }
  R.strip = { grp: 'fio', n: 'Decapagem do fio', label: 'DETALHE', esc: 6, size: [120, 55], ref: 'IPC/WHMA-A-620 cap. 3 · NASA-STD-8739.4 · comprimento conforme datasheet do contato',
    desc: 'Comprimento decapado com tolerância, filamentos sem corte nem amassamento, isolação cortada em esquadro e seção do condutor.',
    def: { ls: 4, tl: '+0,5/-0', dw: 1.3, dc: 0.76, n: 19, tip: '' },
    fields: [T('Comprimento decapado (mm)', 'ls'), T('Tolerância', 'tl', 'text'), T('Ø externo do fio (mm)', 'dw'), T('Ø do condutor (mm)', 'dc'), T('Nº de filamentos (7 ou 19)', 'n')],
    keys: { fio: 'Fio' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, dw = c.P('dw') * k, dc = c.P('dc') * k, ls = c.P('ls') * k, xi = X + 9 * k;
      L.wire(g, X, xi, Y, dw, col, 'none', 'cut'); L.cond(g, xi, xi + ls, Y, dc, col);
      g.style({ stroke: col, lw: 0.2 }); g.line(xi + ls, Y - dc / 2, xi + ls, Y + dc / 2);
      c.dim(xi, xi + ls, c.Y + 5, Y - dw / 2, Y - dc / 2, 'ls', 'tl');
      section(g, xi + ls + 12, Y, Math.max(3, dw * 0.9), col, c.P('n')); g.text('SEÇÃO', xi + ls + 12, Y + Math.max(3, dw * 0.9) + 2.5, { size: 1.3, align: 'c', color: col });
      L.note(g, 'FILAMENTOS SEM CORTE, AMASSAMENTO\nOU ABERTURA; TORÇÃO ORIGINAL', xi + ls * 0.4, Y + dw + 6, xi + ls * 0.5, Y + dc / 2 + 0.1, col);
      L.note(g, 'ISOLAÇÃO CORTADA EM ESQUADRO,\nSEM QUEIMA OU REBARBA', X, Y - dw - 4.5, xi - 0.3, Y - dw / 2, col);
      c.ball('fio', X + 3, Y + dw + 7, X + 4, Y + dw / 2); c.ext(xi + ls + 18, Y + dw + 11);
    }
  };
  R.crimp = { grp: 'fio', n: 'Crimpagem de contato (barril fechado, MIL)', label: 'DETALHE', esc: 6, size: [130, 60], ref: 'NASA-STD-8739.4 · IPC/WHMA-A-620 Classe 3 · alicate M22520/1-01 + posicionador do contato (M39029)',
    desc: 'Condutor visível na janela de inspeção, folga da isolação 0,25–0,76 mm, indentações de 4 pontos.',
    def: { ls: 4, tl: '+0,5/-0', gap: 0.5, tg: '0,25-0,76', dw: 1.3, dc: 0.76, lb: 4.5, db: 1.6, tip: '', tool: 'M22520/1-01' },
    fields: [T('Comprimento decapado (mm)', 'ls'), T('Tolerância', 'tl', 'text'), T('Folga da isolação (mm)', 'gap'), T('Faixa da folga (texto)', 'tg', 'text'), T('Ø externo do fio (mm)', 'dw'), T('Ø do condutor (mm)', 'dc'),
      T('Barril: comprimento (mm)', 'lb'), T('Barril: Ø (mm)', 'db'), T('Ferramenta (alicate)', 'tool', 'text')],
    keys: { fio: 'Fio', cont: 'Contato' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, dw = c.P('dw') * k, dc = c.P('dc') * k, gap = c.P('gap') * k, lb = c.P('lb') * k, db = c.P('db') * k, xi = X + 8 * k, xb = xi + gap;
      L.wire(g, X, xi, Y, dw, col, 'none', 'cut'); L.cond(g, xi, xb + lb * 0.86, Y, dc, col);
      var xe = L.contact(g, xb, Y, db, lb, 5 * k, db * 0.5, col, true); L.cond(g, xb + lb * 0.66, xb + lb * 0.78, Y - db * 0.08, dc * 0.4, col);
      c.dim(xi, xb, c.Y + 5, Y - dw / 2, Y - db / 2, 'gap', 'tg'); c.dim(xi, xi + c.P('ls') * k, Y + dw + 5, Y + dc / 2, Y + dc / 2, 'ls', 'tl');
      L.note(g, 'CONDUTOR VISÍVEL NA\nJANELA DE INSPEÇÃO', xb + lb * 0.72, c.Y + 2, xb + lb * 0.72, Y - db * 0.22, col);
      L.note(g, 'INDENTAÇÃO DE 4 PONTOS\n(' + c.S('tool') + ')', xb + lb * 0.4, Y + db + 7, xb + lb * 0.4, Y + db * 0.3, col);
      c.ball('fio', X + 3, Y + dw + 8, X + 4, Y + dw / 2); c.ball('cont', xe - 2, Y + db + 8, xe - 3, Y + db * 0.25); c.ext(xe + 6, Y + db + 11);
    }
  };
  R.splice = { grp: 'fio', n: 'Emenda crimpada com termo-retrátil', label: 'DETALHE', esc: 3, size: [130, 55], ref: 'M81824/1 · SAE AS81824 · IPC/WHMA-A-620 cap. 4',
    desc: 'Emenda de topo crimpada, condutores visíveis no centro, termo-retrátil cobrindo a isolação dos dois lados.',
    def: { lt: 30, tt: '±2', ov: 6, ls: 6, dw: 1.6, dc: 0.9, tip: '' },
    fields: [T('Termo-retrátil (mm)', 'lt'), T('Tolerância', 'tt', 'text'), T('Cobertura mínima sobre a isolação (mm)', 'ov'), T('Comprimento decapado (mm)', 'ls'), T('Ø externo do fio (mm)', 'dw'), T('Ø do condutor (mm)', 'dc')],
    keys: { fio: 'Fio', emenda: 'Emenda', term: 'Termo-retrátil' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, dw = c.P('dw') * k, dc = c.P('dc') * k, ls = c.P('ls') * k, lt = c.P('lt') * k, xm = X + 35 * k, be = ls * 2 + 1 * k, x0 = xm - be / 2;
      L.wire(g, X, x0 - 0.5 * k, Y, dw, col, 'none', 'cut'); L.wire(g, xm + be / 2 + 0.5 * k, X + 70 * k, Y, dw, col, 'cut', 'none');
      L.crimpSplice(g, x0, Y, be, dw * 1.24, col, true); /* barril com batente e faixas de código de cor (desenho TE) */
      L.sealSleeve(g, xm - lt / 2, Y, lt, dw * 2.1, col); /* luva de vedação com insertos (item 5 do desenho TE) */
      c.dim(xm - lt / 2, xm + lt / 2, c.Y + 5, Y - dw * 0.56, Y - dw * 0.56, 'lt', 'tt'); c.dim(xm - lt / 2, x0, Y + dw + 5, Y + dw * 0.56, Y + dw * 0.62, 'ov', '', 'MÍN.');
      c.ball('fio', X + 4, Y + dw + 8, X + 5, Y + dw / 2); c.ball('emenda', xm + be * 0.5 + 8 * k, Y + dw + 8, xm + be * 0.35, Y + dw * 0.62); c.ball('term', xm + lt / 2 + 6, Y + dw + 8, xm + lt / 2 - 2, Y + dw * 0.75); c.ext(X + 72 * k, Y + dw + 11);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
