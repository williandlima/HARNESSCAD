/* HarnessCAD - catálogo de detalhes: BLINDAGEM E CORDOALHA
   cord        montagem da cordoalha no adaptador (DETALHE B da casa): espaguete sobre os fios, barbante, cordoalha
               vestida e luva de solda unindo a cordoalha do adaptador (Pre-Shield) à da cablagem;
   ssterm      terminação da blindagem de cabo blindado com luva de solda com fio terra (TE M83519/2);
   braidsplice emenda de cordoalha no ramo com luva de solda e barbante nas pontas. */
(function (G) {
  'use strict';
  var HX = G.HX, L = HX.DL, R = HX.DETC; if (!L || !R) return;
  var T = function (l, k, t) { return { k: k, l: l, type: t || 'number', step: t ? undefined : 1 }; };
  R.cord = { grp: 'blind', n: 'Montagem da cordoalha no adaptador', label: 'DETALHE B', esc: 1, size: [150, 105], ref: 'Padrão da casa · Amphenol Pre-Shield M85049/109-115 · TE M83519/2',
    desc: '3 etapas: espaguete sobre os fios; barbante e cordoalha vestida; luva de solda unindo as cordoalhas.',
    def: { d1: 5, t1: '±1', d2: 50, t2: '±1', d3: 60, t3: '±5', dia: 6, lb: 85, tip: 'TIP.', espPN: '' },
    fields: [T('Ponta da cordoalha dobrada (mm)', 'd1'), T('Tolerância', 't1', 'text'), T('Fios expostos (mm)', 'd2'), T('Tolerância', 't2', 'text'), T('Espaguete (mm)', 'd3'), T('Tolerância', 't3', 'text'),
      T('Ø do cabo (mm)', 'dia'), T('Comprimento da cordoalha vestida (mm)', 'lb'), T('PN do espaguete sob a cordoalha', 'espPN', 'text')],
    keys: { esp: 'Espaguete', adp: 'Adaptador (REF)', barb: 'Barbante', cord: 'Cordoalha (REF)', ss: 'Luva de solda' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y, d = c.P('dia') * k, a1 = c.P('d1') * k, a2 = c.P('d2') * k, a3 = c.P('d3') * k, y1 = Y + 15, y2 = y1 + d + 24, y3 = y2 + d * 1.3 + 22, wl = d * 0.62, i;
      /* 1: ponta dobrada, fios com isolação, espaguete contraído e a cordoalha recuada (sanfonada) */
      L.band(g, X, y1, a1, d * 0.72, col, 0.25); var xe = X + a1 + a2 + a3 + 6 * k;
      for (i = 0; i < 4; i++) L.wire(g, X + a1, xe + 1, y1 - wl / 2 + wl * i / 3, Math.max(0.5, d * 0.15), col);
      L.tube(g, X + a1 + a2, X + a1 + a2 + a3, y1, d, col); L.weave(g, L.zig(xe, y1, 16 * k, d * 1.9, 0.9), col, 0.9);
      c.dim(X, X + a1, Y + 6, y1 - d * 0.36, y1 - d * 0.36, 'd1', 't1'); c.dim(X + a1, X + a1 + a2, Y + 6, y1 - wl / 2, y1 - d * 0.39, 'd2', 't2'); c.dim(X + a1 + a2, X + a1 + a2 + a3, Y + 6, y1 - d * 0.39, y1 - d * 0.39, 'd3', 't3', '');
      c.ball('esp', X + a1 + a2 + a3 * 0.45, y1 + d / 2 + 9, X + a1 + a2 + a3 * 0.55, y1 + d / 2); c.ext(xe + 18 * k, y1);
      /* 2: cordoalha do adaptador, fios, barbante amarrando e a cordoalha da cablagem vestida */
      var hb = d * 1.25, wz = 18 * k, xa = X + 1, xb = xa + wz + 7 * k, Lb = c.P('lb') * k; L.weave(g, L.zig(xa, y2, wz, d * 1.9, 0.9), col, 0.9);
      for (i = 0; i < 4; i++) L.wire(g, xa + wz, xb + 1, y2 - wl / 2 + wl * i / 3, Math.max(0.5, d * 0.15), col);
      L.weave(g, [[xb, y2 - hb / 2], [xb + Lb * 0.3, y2 - hb / 2], [xb + Lb * 0.36, y2 - hb * 0.62], [xb + Lb, y2 - hb * 0.62], [xb + Lb, y2 + hb * 0.62], [xb + Lb * 0.36, y2 + hb * 0.62], [xb + Lb * 0.3, y2 + hb / 2], [xb, y2 + hb / 2]], col, 1.1);
      L.band(g, xb, y2, 4 * k, hb + 0.5, col); L.tie(g, xb + 2 * k, y2, hb + 0.5, col, 2);
      c.ball('adp', xa + wz * 0.5, y2 + d + 9, xa + wz * 0.35, y2 + d * 0.95, -1); c.ball('barb', xb + 6, y2 + d + 9, xb + 2 * k, y2 + hb / 2 + 0.3); c.ball('cord', xb + Lb - 2, y2 + d + 9, xb + Lb - 4, y2 + hb * 0.62, 1); c.ext(xb + Lb + 8, y2);
      /* 3: luva de solda unindo as cordoalhas (anel de solda + vedação), barbante na ponta */
      var xc = X + 9 * k, L3 = 80 * k, hs = d * 1.3, sx = xc + L3 * 0.34, sw = 24 * k; L.weave(g, L.rect(xc, y3, L3, hs), col, 1.1); L.band(g, xc + L3 - 6 * k, y3, 6 * k, hs + 0.4, col);
      L.ssleeve(g, sx, y3, sw, hs * 1.16, hs, col); c.ball('ss', sx + sw * 0.62, y3 + d + 8, sx + sw * 0.62, y3 + hs * 0.7); c.ext(xc + L3 + 2, y3 + d + 11);
    },
    bom: function (it, sh, Bm, P) { var ends = sh.items.filter(function (n) { return n.type === 'pnode' && n.nkind === 'conn' && /^(pre_|adp)/.test(n.bsKind || ''); }).length || 1, key = 'cesp:' + (P('espPN') || '');
      if (!Bm.key[key]) { var r = { k: key, pn: P('espPN') || '', desc: 'Espaguete termo-retrátil (sob a cordoalha)', qty: 0, un: 'mm' }; Bm.rows.push(r); Bm.key[key] = r; } Bm.key[key].qty += (+P('d3') || 60) * ends; }
  };
  R.ssterm = { grp: 'blind', n: 'Terminação da blindagem com luva de solda (fio terra)', label: 'DETALHE', esc: 2, size: [130, 60], ref: 'TE Raychem M83519/2 (luva com fio terra) · IPC/WHMA-A-620 cap. 16',
    desc: 'Jaqueta removida, blindagem exposta penteada para trás e luva de solda com o fio terra saindo.',
    def: { dj: 25, tj: '±2', db: 6, tb: '±1', dia: 5, lt: 22, tip: '' },
    fields: [T('Jaqueta removida (mm)', 'dj'), T('Tolerância', 'tj', 'text'), T('Blindagem exposta (mm)', 'db'), T('Tolerância', 'tb', 'text'), T('Ø do cabo (mm)', 'dia'), T('Fio terra para fora (mm)', 'lt')],
    keys: { ss: 'Luva de solda', fio: 'Cabo / fio' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, d = c.P('dia') * k, aj = c.P('dj') * k, ab = c.P('db') * k, x0 = X + 30 * k, xs = x0 + ab, i;
      L.wire(g, X, x0, Y, d, col, 'none', 'cut'); g.text('JAQUETA', X + 2, Y, { size: 1.2, color: col });
      L.weave(g, L.rect(x0, Y, ab + 4 * k, d * 0.86), col, 0.7);
      for (i = 0; i < 3; i++) L.wire(g, x0 + ab, x0 + aj + 25 * k, Y - d * 0.25 + d * 0.25 * i, d * 0.22, col);
      L.ssleeve(g, x0 - 2 * k, Y, ab + 12 * k, d * 1.2, d, col);
      var gx = x0 + ab + 10 * k; L.wire(g, gx, gx + c.P('lt') * k, Y + d * 1.6, d * 0.25, col, 'none', 'cut'); g.style({ stroke: col, lw: 0.2 }); g.line(gx - 3 * k, Y + d * 0.5, gx, Y + d * 1.6);
      c.dim(x0, x0 + aj, c.Y + 6, Y - d / 2, Y - d * 0.3, 'dj', 'tj'); c.dim(x0, x0 + ab, Y + d + 6, Y + d * 0.43, Y + d * 0.43, 'db', 'tb');
      c.ball('ss', xs + 3 * k, Y - d - 6, xs + 2 * k, Y - d * 0.68); c.ball('fio', X + 10 * k, Y + d + 8, X + 12 * k, Y + d / 2);
      L.note(g, 'FIO TERRA DA LUVA', gx + c.P('lt') * k * 0.5, Y + d * 1.6 + 5, gx + c.P('lt') * k * 0.4, Y + d * 1.6 + d * 0.13, col); c.ext(gx + c.P('lt') * k + 4, Y + d * 1.6 + 8); c.ext(x0 + aj + 26 * k, Y);
    }
  };
  R.braidsplice = { grp: 'blind', n: 'Emenda de cordoalha no ramo (luva de solda)', label: 'DETALHE', esc: 1.5, size: [130, 50], ref: 'TE M83519/2 · padrão da casa',
    desc: 'As duas cordoalhas sobrepostas, luva de solda sobre a sobreposição e barbante nas pontas.',
    def: { ov: 15, to: '±2', ls: 25, dia: 8, tip: 'TIP.' },
    fields: [T('Sobreposição das cordoalhas (mm)', 'ov'), T('Tolerância', 'to', 'text'), T('Comprimento da luva (mm)', 'ls'), T('Ø do feixe (mm)', 'dia')],
    keys: { cord: 'Cordoalha (REF)', ss: 'Luva de solda', barb: 'Barbante' },
    draw: function (c) {
      var g = c.g, col = c.col, k = c.k, X = c.X, Y = c.Y + 16, d = c.P('dia') * k, ov = c.P('ov') * k, ls = c.P('ls') * k, xm = X + 45 * k;
      L.weave(g, L.rect(X, Y, 45 * k + ov / 2, d), col, 1.1); L.weave(g, L.rect(xm - ov / 2, Y, 45 * k + ov / 2, d * 1.12), col, 1.1);
      L.band(g, xm - ov / 2 - 3 * k, Y, 3 * k, d + 0.5, col); L.band(g, xm + ov / 2, Y, 3 * k, d * 1.12 + 0.5, col);
      L.ssleeve(g, xm - ls / 2, Y, ls, d * 1.3, d, col);
      c.dim(xm - ov / 2, xm + ov / 2, c.Y + 6, Y - d * 0.6, Y - d * 0.6, 'ov', 'to');
      c.ball('cord', X + 15 * k, Y + d + 8, X + 17 * k, Y + d / 2, -1); c.ball('ss', xm + 4 * k, Y + d + 8, xm + 2 * k, Y + d * 0.75); c.ball('barb', xm + ov / 2 + 14 * k, Y + d + 8, xm + ov / 2 + 1.5 * k, Y + d * 0.6); c.ext(X + 90 * k + ov, Y + d);
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
