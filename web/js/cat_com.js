/* HarnessCAD - catálogo de conectores COMERCIAIS / INDUSTRIAIS / AUTOMOTIVOS */
(function (G) {
  'use strict';
  var HX = G.HX;
  function rng(list, extra) { return list.map(function (n) { return Object.assign({ label: n + ' vias', n: n }, extra || {}); }); }
  function seq(a, b, step) { var r = []; for (var i = a; i <= b; i += (step || 1)) r.push(i); return r; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fam(def) { def.std = def.std || 'COM'; def.refPfx = def.refPfx || 'X'; HX.catFamily(def); }

  fam({ fam: 'MicroFit', mfr: 'Molex', desc: 'Micro-Fit 3.0 (3,00 mm)', pitch: 3.0, sz: 'MF',
    pn: function (e, v, g) { return g === 'P' ? '43020-' + pad(e.n) + '00 (plugue)' : '43025-' + pad(e.n) + '00'; },
    contacts: { MF: { p: '43031 (macho)', s: '43030 (fêmea)', awg: [20, 30] } },
    items: rng(seq(2, 24, 2)) });

  fam({ fam: 'MiniFit', mfr: 'Molex', desc: 'Mini-Fit Jr. (4,20 mm)', pitch: 4.2, sz: 'MFJ',
    pn: function (e, v, g) { return (g === 'P' ? '5559-' : '5557-') + pad(e.n) + 'R'; },
    contacts: { MFJ: { p: '5558 (macho)', s: '5556 (fêmea)', awg: [16, 24] } },
    items: rng(seq(2, 24, 2)) });

  fam({ fam: 'JST-XH', mfr: 'JST', desc: 'JST XH (2,50 mm)', pitch: 2.5, sz: 'XH',
    pn: function (e) { return 'XHP-' + e.n; },
    contacts: { XH: { p: 'SXH-001T-P0.6', s: 'SXH-001T-P0.6', awg: [22, 28] } }, items: rng(seq(2, 16)) });

  fam({ fam: 'JST-PH', mfr: 'JST', desc: 'JST PH (2,00 mm)', pitch: 2.0, sz: 'PH',
    pn: function (e) { return 'PHR-' + e.n; },
    contacts: { PH: { p: 'SPH-002T-P0.5S', s: 'SPH-002T-P0.5S', awg: [24, 30] } }, items: rng(seq(2, 16)) });

  fam({ fam: 'JST-VH', mfr: 'JST', desc: 'JST VH (3,96 mm)', pitch: 3.96, sz: 'VH',
    pn: function (e) { return 'VHR-' + e.n + 'N'; },
    contacts: { VH: { p: 'SVH-21T-P1.1', s: 'SVH-21T-P1.1', awg: [18, 22] } }, items: rng(seq(2, 11)) });

  fam({ fam: 'DT', mfr: 'TE / Deutsch', desc: 'Deutsch DT (#16, IP68)', sz: '16',
    variants: [{ v: '06', d: 'DT06 Plugue' }, { v: '04', d: 'DT04 Receptáculo' }],
    pn: function (e, v, g) { return 'DT' + v + '-' + (e.n >= 8 ? pad(e.n) : e.n) + (v === '04' ? 'P' : 'S') + (e.n >= 8 ? 'A' : ''); },
    contacts: { '16': { p: '0460-202-16141', s: '0462-201-16141', awg: [16, 20] } }, items: rng([2, 3, 4, 6, 8, 12]) });

  fam({ fam: 'DTM', mfr: 'TE / Deutsch', desc: 'Deutsch DTM (#20, IP68)', sz: '20',
    variants: [{ v: '06', d: 'DTM06 Plugue' }, { v: '04', d: 'DTM04 Receptáculo' }],
    pn: function (e, v) { return 'DTM' + v + '-' + (e.n >= 8 ? pad(e.n) : e.n) + (v === '04' ? 'P' : 'S') + (e.n >= 8 ? 'A' : ''); },
    contacts: { '20': { p: '0460-202-20141', s: '0462-201-20141', awg: [20, 24] } }, items: rng([2, 3, 4, 6, 8, 12]) });

  fam({ fam: 'DTP', mfr: 'TE / Deutsch', desc: 'Deutsch DTP (#12, 25 A)', sz: '12',
    variants: [{ v: '06', d: 'DTP06 Plugue' }, { v: '04', d: 'DTP04 Receptáculo' }],
    pn: function (e, v) { return 'DTP' + v + '-' + e.n + (v === '04' ? 'P' : 'S'); },
    contacts: { '12': { p: '0460-204-12141', s: '0462-203-12141', awg: [12, 14] } }, items: rng([2, 4]) });

  fam({ fam: 'DSUB', mfr: 'Diversos', desc: 'D-Sub comercial', sz: '20',
    pn: function (e, v, g) { return e.label + (g === 'P' ? 'P' : 'S'); },
    contacts: { '20': { p: 'pino crimp #20', s: 'soquete crimp #20', awg: [20, 28] } },
    items: [{ label: 'DE-9', n: 9 }, { label: 'DA-15', n: 15 }, { label: 'DB-25', n: 25 }, { label: 'DC-37', n: 37 }, { label: 'DD-50', n: 50 },
      { label: 'DE-15 HD (VGA)', n: 15, names: ['R', 'G', 'B', 'ID2', 'GND', 'R_GND', 'G_GND', 'B_GND', '+5V', 'GND', 'ID0', 'SDA', 'HSYNC', 'VSYNC', 'SCL'] }] });

  fam({ fam: 'M12', mfr: 'Diversos', desc: 'Circular M12', refPfx: 'X',
    variants: [{ v: 'F', d: 'Fêmea reto' }, { v: 'M', d: 'Macho reto' }, { v: 'FA', d: 'Fêmea 90°' }],
    pn: function (e, v) { return 'M12 ' + e.label + ' ' + v; },
    items: [{ label: 'A 4p', n: 4, names: ['+24V (BN)', 'NC (WH)', '0V (BU)', 'SINAL (BK)'] },
      { label: 'A 5p', n: 5, names: ['+24V (BN)', 'SINAL2 (WH)', '0V (BU)', 'SINAL1 (BK)', 'PE (GY)'] },
      { label: 'A 8p', n: 8 }, { label: 'D 4p Ethernet', n: 4, names: ['TX+', 'RX+', 'TX-', 'RX-'] },
      { label: 'B 5p Profibus', n: 5, names: ['VP', 'A', 'DGND', 'B', 'SHIELD'] }] });

  fam({ fam: 'M8', mfr: 'Diversos', desc: 'Circular M8',
    pn: function (e) { return 'M8 ' + e.label; },
    items: [{ label: '3p', n: 3, names: ['+24V', '0V', 'SINAL'], ids: ['1', '3', '4'] }, { label: '4p', n: 4 }] });

  fam({ fam: 'RJ', mfr: 'Diversos', desc: 'Modular RJ',
    pn: function (e) { return e.label; },
    items: [{ label: 'RJ45 T568B', n: 8, names: ['TX+ (WH-OG)', 'TX- (OG)', 'RX+ (WH-GN)', 'BI_C+ (BU)', 'BI_C- (WH-BU)', 'RX- (GN)', 'BI_D+ (WH-BN)', 'BI_D- (BN)'] },
      { label: 'RJ45 T568A', n: 8, names: ['TX+ (WH-GN)', 'TX- (GN)', 'RX+ (WH-OG)', 'BI_C+ (BU)', 'BI_C- (WH-BU)', 'RX- (OG)', 'BI_D+ (WH-BN)', 'BI_D- (BN)'] },
      { label: 'RJ11 6P4C', n: 4 }, { label: 'RJ12 6P6C', n: 6 }] });

  fam({ fam: 'USB', mfr: 'Diversos', desc: 'USB',
    pn: function (e) { return e.label; },
    items: [{ label: 'USB-A', n: 4, names: ['VBUS', 'D-', 'D+', 'GND'] },
      { label: 'USB Mini-B', n: 5, names: ['VBUS', 'D-', 'D+', 'ID', 'GND'] },
      { label: 'USB Micro-B', n: 5, names: ['VBUS', 'D-', 'D+', 'ID', 'GND'] }] });

  fam({ fam: 'XLR', mfr: 'Neutrik/Switchcraft', desc: 'XLR áudio', refPfx: 'X',
    variants: [{ v: 'F', d: 'Fêmea (cabo)' }, { v: 'M', d: 'Macho (cabo)' }],
    pn: function (e, v) { return e.label + v; },
    items: [{ label: 'XLR3', n: 3, names: ['GND/MALHA', 'HOT (+)', 'COLD (-)'] },
      { label: 'XLR4', n: 4 }, { label: 'XLR5 DMX', n: 5, names: ['GND', 'DATA-', 'DATA+', 'AUX-', 'AUX+'] },
      { label: 'P10 TRS', n: 3, ids: ['T', 'R', 'S'], names: ['HOT', 'COLD', 'MALHA'] }] });

  fam({ fam: 'HDR', mfr: 'Diversos', desc: 'Barra de pinos 2,54 mm (Dupont)', pitch: 2.54,
    pn: function (e) { return 'Housing Dupont 1x' + e.n; }, items: rng(seq(1, 20)) });

  fam({ fam: 'IDC', mfr: 'Diversos', desc: 'IDC flat cable 2,54 mm', pitch: 2.54,
    pn: function (e) { return 'IDC fêmea 2x' + (e.n / 2); },
    items: [6, 10, 14, 16, 20, 26, 34, 40, 50].map(function (n) { return { label: '2x' + (n / 2), n: n }; }) });

  fam({ fam: 'BORNE', mfr: 'Phoenix/WAGO/Weidmüller', desc: 'Borne / régua de terminais', refPfx: 'X',
    variants: [{ v: '5.08', d: 'Plugável 5,08 mm' }, { v: 'DIN', d: 'Trilho DIN' }],
    pn: function (e, v) { return 'Borne ' + v + ' ' + e.n + 'p'; }, items: rng(seq(2, 24)) });

  fam({ fam: 'TERM', mfr: 'Diversos', desc: 'Terminal avulso', refPfx: 'E',
    pn: function (e) { return e.label; },
    items: [{ label: 'Terminal olhal', n: 1 }, { label: 'Terminal forquilha', n: 1 }, { label: 'Terminal faston 6,3', n: 1 },
      { label: 'Ponteira (ferrule)', n: 1 }, { label: 'Pino banana 4 mm', n: 1 }, { label: 'Barramento terra', n: 6, names: ['PE', 'PE', 'PE', 'PE', 'PE', 'PE'] }] });

  fam({ fam: 'COAX', mfr: 'Diversos', desc: 'RF coaxial', refPfx: 'X',
    pn: function (e) { return e.label; },
    items: ['BNC', 'TNC', 'SMA', 'N', 'MCX', 'SMB'].map(function (t) { return { label: t, n: 2, ids: ['C', 'S'], names: ['CENTRO', 'MALHA'] }; }) });

  fam({ fam: 'SUPERSEAL', mfr: 'TE', desc: 'TE Superseal 1.5 (IP67)', sz: 'SS',
    pn: function (e, v, g) { return 'Superseal 1.5 ' + e.n + 'v ' + (g === 'P' ? 'macho' : 'fêmea'); },
    contacts: { SS: { p: 'terminal macho 1.5', s: 'terminal fêmea 1.5', awg: [16, 22] } }, items: rng(seq(1, 6)) });
})(typeof window !== 'undefined' ? window : globalThis);
