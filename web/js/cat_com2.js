/* HarnessCAD - catálogo ampliado: industriais, automotivos, energia, áudio/vídeo, placas e MIL série II
   PNs montados pelo padrão de codificação de cada família — confirme no datasheet. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function rng(list) { return list.map(function (n) { return { label: n + ' vias', n: n }; }); }
  function seq(a, b) { var r = []; for (var i = a; i <= b; i++) r.push(i); return r; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fam(def) { def.std = def.std || 'COM'; def.refPfx = def.refPfx || 'X'; HX.catFamily(def); }

  // ---------- MIL-DTL-26482 Série II (crimp) ----------
  fam({ fam: 'MS3476', std: 'MIL', mfr: 'Amphenol/ITT/Souriau', desc: 'MIL-DTL-26482 Sér. II (crimp)', numbering: 'letters', refPfx: 'J',
    variants: [{ v: '76', d: 'MS3476 Plugue' }, { v: '70', d: 'MS3470 Receptáculo flange' }, { v: '74', d: 'MS3474 Receptáculo porca' }],
    pn: function (e, v, g) { return 'MS34' + v + 'L' + e.ins + g; },
    contacts: { '20': { p: 'contato crimp #20 (pino)', s: 'contato crimp #20 (soquete)', awg: [20, 24] }, '16': { p: 'contato crimp #16 (pino)', s: 'contato crimp #16 (soquete)', awg: [16, 20] } },
    items: [['8-33', 3, '20'], ['10-6', 6, '20'], ['12-10', 10, '20'], ['14-5', 5, '16'], ['14-12', 12, '20'], ['14-19', 19, '20'], ['16-26', 26, '20'],
      ['18-32', 32, '20'], ['20-41', 41, '20'], ['22-55', 55, '20'], ['24-61', 61, '20']].map(function (a) { return { ins: a[0], label: a[0], n: a[1], sz: a[2] }; }) });

  // ---------- industriais ----------
  fam({ fam: 'HAN', mfr: 'Harting', desc: 'Harting Han (retangular industrial)', variants: [{ v: 'M', d: 'Inserto macho' }, { v: 'F', d: 'Inserto fêmea' }],
    pn: function (e, v) { return 'Han ' + e.label + ' ' + v; },
    items: [{ label: '3A', n: 4, ids: ['1', '2', '3', 'PE'] }, { label: '4A', n: 5, ids: ['1', '2', '3', '4', 'PE'] }, { label: '6E', n: 7 },
      { label: '10E', n: 11 }, { label: '16E', n: 17 }, { label: '24E', n: 25 }].map(function (a) {
      if (!a.ids) { a.ids = seq(1, a.n - 1).map(String).concat(['PE']); } return a; }) });
  fam({ fam: 'M23', mfr: 'Diversos', desc: 'Circular M23 (sinal/encoder)', pn: function (e) { return 'M23 ' + e.label; },
    items: [{ label: '12p', n: 12 }, { label: '17p', n: 17 }, { label: '19p', n: 19 }] });
  fam({ fam: 'M16', mfr: 'Diversos', desc: 'Circular M16 (DIN 45322)', pn: function (e) { return 'M16 ' + e.label; }, items: rng([2, 3, 4, 5, 6, 7, 8]).map(function (a) { a.label = a.n + 'p'; return a; }) });
  fam({ fam: 'MINI78', mfr: 'Diversos', desc: 'Circular 7/8"-16 (Mini-Change, potência)', pn: function (e) { return '7/8" ' + e.label; },
    items: [{ label: '3p', n: 3 }, { label: '4p', n: 4 }, { label: '5p', n: 5 }] });
  fam({ fam: 'M12X', mfr: 'Diversos', desc: 'M12 X-code (Ethernet 10 Gb)', pn: function () { return 'M12 X 8p'; },
    items: [{ label: 'X 8p', n: 8, names: ['D1+', 'D1-', 'D2+', 'D2-', 'D4+', 'D4-', 'D3-', 'D3+'] }] });
  fam({ fam: 'DIN41612', mfr: 'Diversos', desc: 'DIN 41612 (Eurocard)', refPfx: 'J',
    variants: [{ v: 'F', d: 'Fêmea (cabo/placa)' }, { v: 'M', d: 'Macho (placa)' }], pn: function (e, v) { return 'DIN 41612 ' + e.label + ' ' + v; },
    items: [32, 64, 96].map(function (n) {
      var rows = n === 32 ? ['a', 'c'] : n === 64 ? ['a', 'c'] : ['a', 'b', 'c'], per = n === 32 ? 16 : 32, ids = [];
      rows.forEach(function (r) { for (var i = 1; i <= per; i++) ids.push(r + i); });
      return { label: n + 'p (' + rows.join('+') + ')', n: ids.length, ids: ids };
    }) });
  fam({ fam: 'MSTB', mfr: 'Phoenix Contact', desc: 'Borne plugável MSTB 2,5/5,08', pn: function (e) { return 'MSTB 2,5/' + e.n + '-ST-5,08'; }, items: rng(seq(2, 12)) });

  // ---------- automotivos ----------
  fam({ fam: 'AT', mfr: 'Amphenol', desc: 'Amphenol AT (#16, IP68)', sz: '16',
    variants: [{ v: '06', d: 'AT06 Plugue' }, { v: '04', d: 'AT04 Receptáculo' }],
    pn: function (e, v) { return 'AT' + v + '-' + (e.n >= 8 ? pad(e.n) : e.n) + (v === '04' ? 'P' : 'S') + (e.n >= 8 ? 'A' : ''); },
    contacts: { '16': { p: 'AT60-202-16141 (pino)', s: 'AT62-201-16141 (soquete)', awg: [16, 20] } }, items: rng([2, 3, 4, 6, 8, 12]) });
  fam({ fam: 'OBD', mfr: 'SAE', desc: 'OBD-II (SAE J1962)', pn: function () { return 'OBD-II J1962 16p'; },
    items: [{ label: '16p', n: 16, names: ['', 'J1850+', '', 'GND CHASSI', 'GND SINAL', 'CAN-H', 'K-LINE', '', '', 'J1850-', '', '', '', 'CAN-L', 'L-LINE', '+12V BAT'] }] });
  fam({ fam: 'J1939', mfr: 'TE / Deutsch', desc: 'Diagnóstico J1939 (Deutsch HD10 9p)', pn: function () { return 'HD10-9-1939P'; },
    items: [{ label: '9p', n: 9, ids: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'], names: ['GND', '+12V/24V', 'CAN-H', 'CAN-L', 'MALHA CAN', 'J1708+', 'J1708-', '', ''] }] });

  // ---------- energia ----------
  fam({ fam: 'POWER', mfr: 'Diversos', desc: 'Energia / alimentação', refPfx: 'X', pn: function (e) { return e.label; },
    items: [{ label: 'Anderson Powerpole PP45', n: 2, ids: ['+', '-'], names: ['+', '-'] }, { label: 'XT30', n: 2, ids: ['+', '-'] }, { label: 'XT60', n: 2, ids: ['+', '-'] },
      { label: 'XT90', n: 2, ids: ['+', '-'] }, { label: 'Jack DC 5,5x2,1', n: 2, ids: ['+', '-'], names: ['CENTRO +', 'CORPO -'] },
      { label: 'IEC C13 (fêmea)', n: 3, ids: ['L', 'N', 'PE'] }, { label: 'IEC C14 (macho)', n: 3, ids: ['L', 'N', 'PE'] },
      { label: 'Plugue NBR 14136 (Brasil)', n: 3, ids: ['L', 'N', 'PE'] }, { label: 'NEMA 5-15', n: 3, ids: ['L', 'N', 'PE'] }] });

  // ---------- áudio / vídeo / placas ----------
  fam({ fam: 'AV', mfr: 'Diversos', desc: 'Áudio e vídeo', refPfx: 'X', pn: function (e) { return e.label; },
    items: [{ label: 'RCA', n: 2, ids: ['C', 'S'], names: ['SINAL', 'MALHA'] }, { label: 'P2 3,5 mm TRS', n: 3, ids: ['T', 'R', 'S'], names: ['L', 'R', 'GND'] },
      { label: 'Speakon NL4', n: 4, ids: ['1+', '1-', '2+', '2-'] }, { label: 'HDMI tipo A', n: 19 }, { label: 'DisplayPort', n: 20 }] });
  fam({ fam: 'PICO', mfr: 'Molex', desc: 'Molex PicoBlade (1,25 mm)', pitch: 1.25, pn: function (e) { return '51021-' + pad(e.n) + '00'; }, items: rng(seq(2, 15)) });
  fam({ fam: 'KK254', mfr: 'Molex', desc: 'Molex KK 254 (2,54 mm)', pitch: 2.54, pn: function (e) { return 'KK 254 ' + e.n + ' vias'; }, items: rng(seq(2, 16)) });
  [['SH', '1,0', 'SHR-', 'V-S', 'SSH-003T-P0.2', [26, 32]], ['GH', '1,25', 'GHR-', 'V-S', 'SSHL-002T-P0.2', [26, 30]], ['ZH', '1,5', 'ZHR-', '', 'SZH-002T-P0.5', [26, 32]],
    ['EH', '2,5', 'EHR-', '', 'SEH-001T-P0.6', [22, 30]], ['PA', '2,0', 'PAP-', 'V-S', 'SPHD-002T-P0.5', [22, 28]]].forEach(function (j) {
    var ct = {}; ct[j[0]] = { p: j[4], s: j[4], awg: j[5] };
    fam({ fam: 'JST-' + j[0], mfr: 'JST', desc: 'JST ' + j[0] + ' (' + j[1] + ' mm)', sz: j[0], contacts: ct,
      pn: function (e) { return j[2] + (j[0] === 'SH' || j[0] === 'GH' || j[0] === 'PA' ? pad(e.n) : e.n) + j[3]; }, items: rng(seq(2, j[0] === 'EH' ? 15 : 12)) });
  });
})(typeof window !== 'undefined' ? window : globalThis);
