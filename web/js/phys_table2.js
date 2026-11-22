/* HarnessCAD - DIAGRAMA DE LIGAÇÃO no padrão da casa (ptable kind 'wiring'; o formato antigo continua com wstyle 'tabela').
   Como nas pranchas de referência: bloco de cada conector com cantos arredondados do lado dos fios, nº do pino dentro,
   nome do sinal fora, referência em cima e PN embaixo; fios retos pino a pino na ordem dos pinos de destino; par do
   mesmo cabo com o símbolo de trança nas duas pontas e o dreno (malha) descendo até o seu pino; cor/bitola escritas só
   quando diferem do padrão do chicote, que vai na nota "TODOS OS CABOS SÃO BITOLA xx AWG"; divisa de gênero dentro do
   bloco, na face (convenção do projeto, como no símbolo do esquema: saindo pela face = macho, entrando = fêmea). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.ptable) return;
  var AB = { WH: 'BC', BK: 'PR', RD: 'VM', BU: 'AZ', GN: 'VD', YE: 'AM', OG: 'LR', BN: 'MR', VT: 'VI', VI: 'VI', GY: 'CZ', PK: 'RS', TQ: 'TQ', NC: '' };
  HX.colorAbbr = function (c) { return String(c || '').split(/[-\/]/).map(function (k) { return AB[k.toUpperCase()] != null ? AB[k.toUpperCase()] : k.toUpperCase(); }).filter(Boolean).join('/'); };
  function mode(a) { var n = {}, b = '', m = 0; a.forEach(function (v) { if (!v) return; n[v] = (n[v] || 0) + 1; if (n[v] > m) { m = n[v]; b = v; } }); return b; }
  function num(s) { return String(s == null ? '' : s); }
  function chev(g, x, y, d, col) { g.style({ stroke: col, lw: 0.2, fill: null }); g.poly([[x, y - 1.2], [x + d * 1.1, y], [x, y + 1.2]], false); }
  function block(g, x, y, w, h, side, col) { /* side = +1: arredondado à direita (bloco da esquerda) */
    var r = Math.min(2.2, h / 4), P = [], k, a;
    if (side > 0) { P.push([x, y]); for (k = 0; k <= 6; k++) { a = -Math.PI / 2 + k / 12 * Math.PI; P.push([x + w - r + r * Math.cos(a), y + r + r * Math.sin(a)]); } for (k = 6; k <= 12; k++) { a = -Math.PI / 2 + k / 12 * Math.PI; P.push([x + w - r + r * Math.cos(a), y + h - r + r * Math.sin(a)]); } P.push([x, y + h]); }
    else { P.push([x + w, y]); P.push([x + w, y + h]); for (k = 0; k <= 6; k++) { a = Math.PI / 2 + k / 12 * Math.PI; P.push([x + r + r * Math.cos(a), y + h - r + r * Math.sin(a)]); } for (k = 6; k <= 12; k++) { a = Math.PI / 2 + k / 12 * Math.PI; P.push([x + r + r * Math.cos(a), y + r + r * Math.sin(a)]); } }
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.poly(P, true); g.style({ fill: null });
  }
  function twist(g, x, ya, yb, col) { var P = [], Q = [], k, n = 24; for (k = 0; k <= n; k++) { var t = k / n, y = ya + (yb - ya) * t, s = Math.sin(t * 2 * Math.PI) * 0.9; P.push([x + s, y]); Q.push([x - s, y]); } g.style({ stroke: col, lw: 0.2, fill: null }); g.poly(P, false); g.poly(Q, false); }
  HX.WD = { chev: chev, block: block, twist: twist, mode: mode, num: num }; /* desenho do diagrama: phys_table5.js; dados: phys_table4.js */
  var d0 = EXT.ptable.draw;
  EXT.ptable.draw = function (g, it, p, s, o) {
    if (it.kind && it.kind !== 'wiring' || it.wstyle === 'tabela') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), col = C.line ? C.col : o.theme.txt || '#000'; HX.physHide(it, '_bb', HX.wiringDraw(g, it, p, C, col));
  };
})(typeof window !== 'undefined' ? window : globalThis);
