/* HarnessCAD - catálogo de conectores MILITARES
   ATENÇÃO: PNs gerados automaticamente a partir do padrão de codificação.
   Confirme arranjo, contatos e PN no datasheet/norma antes de comprar. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function arr(list, defSz) { // "ins:qtd:tamanho[:numeração]"
    return list.map(function (s) {
      var t = s.split(':'), sz = t[2] || defSz;
      if (sz.indexOf('+') > 0) sz = sz.split('+').map(function (g) { var q = g.split('x'); return [+q[0], q[1]]; });
      return { ins: t[0], label: t[0], n: +t[1], sz: sz, numbering: t[3] === 'L' ? 'letters' : t[3] === 'N' ? 'nums' : undefined };
    });
  }

  // MIL-DTL-38999 Série III: ver cat_38999.js (arranjos completos dos catálogos Glenair/Amphenol)

  // MIL-DTL-5015 (MS3100/3101/3102/3106/3108) - solda
  HX.catFamily({
    fam: 'MS5015', std: 'MIL', mfr: 'Amphenol/ITT Cannon', desc: 'MIL-DTL-5015 (MS31xx)',
    numbering: 'letters', refPfx: 'J',
    variants: [{ v: '06A', d: 'MS3106A Plugue reto' }, { v: '08B', d: 'MS3108B Plugue 90°' },
      { v: '02A', d: 'MS3102A Receptáculo caixa' }, { v: '01A', d: 'MS3101A Receptáculo cabo' },
      { v: '00A', d: 'MS3100A Receptáculo parede' }],
    pn: function (e, v, g) { return 'MS31' + v + e.ins + g; },
    contacts: {
      '20': { p: 'solda #20', s: 'solda #20', awg: [20, 24] },
      '16': { p: 'solda #16', s: 'solda #16', awg: [16, 20] },
      '12': { p: 'solda #12', s: 'solda #12', awg: [12, 14] }
    },
    items: arr(['10SL-3:3:16', '10SL-4:2:16', '12S-3:2:16', '14S-2:4:16', '14S-6:6:20', '14S-7:3:16',
      '16S-1:7:16', '16S-8:5:16', '18-1:10:16', '18-4:4:16', '18-8:8:1x12+7x16', '20-27:14:16',
      '20-29:17:16', '22-14:19:16', '24-28:24:16', '28-21:37:16'], '16')
  });

  // MIL-DTL-26482 Série I (MS3116/MS3112/MS3114)
  HX.catFamily({
    fam: 'MS26482', std: 'MIL', mfr: 'Amphenol/ITT/Souriau', desc: 'MIL-DTL-26482 Sér. I',
    numbering: 'letters', refPfx: 'J',
    variants: [{ v: '16F', d: 'MS3116F Plugue' }, { v: '12E', d: 'MS3112E Receptáculo flange' },
      { v: '14E', d: 'MS3114E Receptáculo porca' }],
    pn: function (e, v, g) { return 'MS31' + v + e.ins + g; },
    contacts: {
      '20': { p: 'contato #20 (pino)', s: 'contato #20 (soquete)', awg: [20, 24] },
      '16': { p: 'contato #16 (pino)', s: 'contato #16 (soquete)', awg: [16, 20] }
    },
    items: arr(['8-3:3:20', '8-4:4:20', '10-6:6:20', '12-3:3:16', '12-8:8:20', '12-10:10:20',
      '14-5:5:16', '14-12:12:20', '14-15:15:20', '14-19:19:20', '16-8:8:16', '16-26:26:20',
      '18-11:11:16', '18-32:32:20', '20-16:16:16', '20-39:39:20', '20-41:41:20', '22-21:21:16',
      '22-55:55:20', '24-61:61:20'], '20')
  });

  // MIL-DTL-24308 D-Sub
  var DSUB = { 9: 'E', 15: 'A', 25: 'B', 37: 'C', 50: 'D' }, DSHD = { 15: 'E', 26: 'A', 44: 'B', 62: 'C', 78: 'D' };
  HX.catFamily({
    fam: 'M24308', std: 'MIL', mfr: 'Diversos', desc: 'MIL-DTL-24308 D-Sub', refPfx: 'J',
    variants: [{ v: 'C', d: 'Crimp, carcaça p/ cabo' }, { v: 'S', d: 'Solda' }],
    pn: function (e, v, g) { return 'D' + e.shell + (g === 'P' ? 'M' : 'F') + '-' + e.n + (e.hd ? 'HD' : '') + ' (M24308)'; },
    contacts: {
      '20': { p: 'M39029/63-368', s: 'M39029/64-369', awg: [20, 24] },
      '22D': { p: 'pino #22D', s: 'soquete #22D', awg: [22, 28] }
    },
    items: Object.keys(DSUB).map(function (n) { return { label: 'D' + DSUB[n] + '-' + n, n: +n, sz: '20', shell: DSUB[n] }; })
      .concat(Object.keys(DSHD).map(function (n) { return { label: 'D' + DSHD[n] + '-' + n + 'HD', n: +n, sz: '22D', shell: DSHD[n], hd: true }; }))
  });

  // MIL-DTL-83513 Micro-D
  HX.catFamily({
    fam: 'M83513', std: 'MIL', mfr: 'Glenair/ITT/Omnetics', desc: 'MIL-DTL-83513 Micro-D', refPfx: 'J',
    variants: [{ v: 'PT', d: 'Com rabicho (pigtail)' }, { v: 'PCB', d: 'PCB' }],
    pn: function (e, v, g) { return 'Micro-D ' + e.n + (g === 'P' ? ' pino' : ' soquete') + ' (M83513)'; },
    contacts: { 'MD': { p: 'integral', s: 'integral', awg: [24, 30] } },
    items: [9, 15, 21, 25, 31, 37, 51, 100].map(function (n) { return { label: 'MD-' + n, n: n, sz: 'MD' }; })
  });

  // Terminais e componentes avulsos MIL
  HX.catFamily({
    fam: 'MILTERM', std: 'MIL', mfr: 'Diversos', desc: 'Terminal', refPfx: 'E',
    pn: function (e) { return e.pnBase; },
    items: [
      { label: 'Terminal anel MS25036', n: 1, pnBase: 'MS25036-xxx', desc: 'Terminal olhal MS25036 (escolher bitola/furo)' },
      { label: 'Terminal anel isolado MS25036 (2 vias)', n: 2, pnBase: 'MS25036-xxx', desc: 'Par de terminais olhal' },
      { label: 'Ponto de terra (stud)', n: 1, pnBase: 'GND STUD', desc: 'Ponto de aterramento estrutural', names: ['GND'] }
    ]
  });
})(typeof window !== 'undefined' ? window : globalThis);
