/* HarnessCAD - MIL-DTL-38999 Série III (Tri-Start): família completa a partir dos catálogos Glenair e Amphenol
   53 arranjos IAW MIL-STD-1560 (cat_38999_a/b.js), com tamanho de cada contato e, em 44 deles, a posição real
   na face do inserto (vista frontal). Part number militar:
     D38999/ 26 W D35 P N  =  estilo · acabamento (classe de serviço) · carcaça+arranjo · tipo de contato · chave
   Bitolas aceitas por contato (MIL-DTL-38999 §3.4.3.1): 22D 22–28 AWG · 20 20–24 · 16 16–20 · 12 12–14 · 10 10–12. */
(function (G) {
  'use strict';
  var HX = G.HX, B = '0123456789abcdefghijklmnopqrstuvwxyz', SZ = { d: '22D', 2: '20', 6: '16', 1: '12', 0: '10' };
  var BIG = { '22D': 0, '20': 1, '16': 2, '12': 3, '10': 4 };
  function dec(s) { var o = []; for (var i = 0; i + 3 < s.length; i += 4) o.push([n2(s.substr(i, 2)), n2(s.substr(i + 2, 2))]); return o; }
  function n2(t) { return (B.indexOf(t[0]) * 36 + B.indexOf(t[1])) / 1295 * 2 - 1; }

  function item(r) {
    var ids, sz, pos = null;
    if (r.ids) {
      ids = /^N\d+$/.test(r.ids) ? HX.nums(+r.ids.slice(1)) : r.ids.split(' ');
      sz = /\*$/.test(r.z) ? ids.map(function () { return SZ[r.z[0]]; }) : r.z.split('').map(function (k) { return SZ[k]; });
      pos = dec(r.p);
    } else { // só contagem: maiores contatos por último (posição não publicada no catálogo)
      var list = []; Object.keys(r.c).sort(function (a, b) { return BIG[a] - BIG[b]; }).forEach(function (k) { for (var i = 0; i < r.c[k]; i++) list.push(k); });
      ids = r.c['22D'] && Object.keys(r.c).length === 1 ? HX.nums(list.length) : HX.milLetters(list.length); sz = list;
    }
    var cnt = {}; sz.forEach(function (s) { cnt[s] = (cnt[s] || 0) + 1; });
    var mix = Object.keys(cnt).sort(function (a, b) { return BIG[b] - BIG[a]; }).map(function (k) { return cnt[k] + '×#' + k; }).join(' + ');
    return { ins: r.i, label: r.i, s3: r.s3, pos: pos, src: r.src || '', desc: 'MIL-DTL-38999 Sér. III ' + r.i + ' — ' + mix,
      pins: ids.map(function (id, i) { return { n: String(id), name: '', sz: sz[i] }; }) };
  }

  var FIN = [['W', 'W – cádmio oliva (alumínio, 175 °C)'], ['Z', 'Z – zinco-níquel (alumínio, 175 °C)'], ['F', 'F – níquel químico (alumínio, 200 °C)'],
    ['G', 'G – níquel químico, grau espacial'], ['C', 'C – anodizado (alumínio)'], ['T', 'T – Durmalon níquel-PTFE (alumínio)'], ['J', 'J – cádmio oliva (compósito)'],
    ['M', 'M – níquel químico (compósito)'], ['K', 'K – inox passivado (corta-fogo)'], ['S', 'S – inox niquelado (corta-fogo)'], ['L', 'L – inox niquelado'],
    ['N', 'N – inox niquelado (hermético)'], ['Y', 'Y – inox passivado (hermético)']];
  var CT = [['', 'Padrão 500 ciclos (P pino / S soquete)'], ['1500', '1500 ciclos (H pino / J soquete)'], ['sem', 'Sem contatos (A pino / B soquete)'], ['X', 'Ilhós (hermético)']];
  var KEY = [['N', 'N – normal'], ['A', 'A'], ['B', 'B'], ['C', 'C'], ['D', 'D'], ['E', 'E']];

  HX.catFamily({
    fam: 'D38999', std: 'MIL', mfr: 'Amphenol/Glenair/Souriau', desc: 'MIL-DTL-38999 Sér. III', refPfx: 'J',
    variants: [{ v: '26', d: '/26 Plugue reto' }, { v: '20', d: '/20 Receptáculo flange (parede)' }, { v: '24', d: '/24 Receptáculo porca (jam nut)' },
      { v: '21', d: '/21 Receptáculo caixa (hermético)' }, { v: '23', d: '/23 Receptáculo porca (hermético)' }, { v: '25', d: '/25 Receptáculo solda (hermético)' },
      { v: '27', d: '/27 Receptáculo soldado (weld, hermético)' }],
    opts: [{ k: 'finish', l: 'Acabamento', def: 'W', opts: FIN }, { k: 'ctype', l: 'Contatos', def: '', opts: CT }, { k: 'keypos', l: 'Chave', def: 'N', opts: KEY }],
    pn: function (e, v, g, c) {
      c = c || {}; var t = c.ctype || '', P = g === 'P';
      var ct = t === '1500' ? (P ? 'H' : 'J') : t === 'sem' ? (P ? 'A' : 'B') : t === 'X' ? 'X' : (P ? 'P' : 'S');
      return 'D38999/' + v + (c.finish || 'W') + e.s3 + ct + (c.keypos || 'N');
    },
    contacts: {
      '22D': { p: 'M39029/58-360', s: 'M39029/56-348', awg: [22, 28] },
      '20': { p: 'M39029/58-363', s: 'M39029/56-351', awg: [20, 24] },
      '16': { p: 'M39029/58-364', s: 'M39029/56-352', awg: [16, 20] },
      '12': { p: 'M39029/58-365', s: 'M39029/56-353', awg: [12, 14] },
      '10': { p: 'contato #10 (potência)', s: 'contato #10 (potência)', awg: [10, 12] }
    },
    items: (HX.D38999_ARR || []).map(item)
  });
})(typeof window !== 'undefined' ? window : globalThis);
