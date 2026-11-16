/* HarnessCAD - BIBLIOTECA OFICIAL: dados de contato conferidos em catálogo/norma (nov/2026)
   Cada tamanho de contato pode ter várias opções por faixa de bitola; o HarnessCAD escolhe a opção pela bitola
   do fio ligado (BOM com o PN certo) e o ERC só acusa se NENHUMA opção aceita o fio.
   a = corrente máxima por contato informada pelo fabricante (A). plug = tampão de cavidade (conector vedado).
   src = de onde veio o dado. Famílias sem "src" continuam com dados genéricos (confira no datasheet). */
(function (G) {
  'use strict';
  var HX = G.HX, F = HX.CAT.fams;
  function set(fam, o) { if (F[fam]) Object.assign(F[fam], o, { official: true }); }

  set('D38999', { sealed: true, src: 'Glenair Crimp Contact Selection Guide · catálogo Glenair MIL-DTL-38999 §3.4.3.1',
    plug: { '22D': 'MS27488-22-2', '20': 'MS27488-20-2', '16': 'MS27488-16-2', '12': 'MS27488-12-2' },
    contacts: {
      '22D': { p: 'M39029/58-360', s: 'M39029/56-348', awg: [22, 28] },
      '20': { p: 'M39029/58-363', s: 'M39029/56-351', awg: [20, 24] },
      '16': { p: 'M39029/58-364', s: 'M39029/56-352', awg: [16, 20] },
      '12': { p: 'M39029/58-365', s: 'M39029/56-353', awg: [12, 14] },
      '10': { p: 'M39029/58-528', s: 'contato #10 (soquete)', awg: [10, 10] } } });

  set('MS3476', { sealed: true, src: 'Amphenol MIL-DTL-26482 Série 2 (Matrix) · Glenair Série 260 (M39029/4 e /5)',
    plug: { '20': 'MS27488-20-2', '16': 'MS27488-16-2', '12': 'MS27488-12-2' },
    contacts: {
      '20': { p: 'M39029/4-110', s: 'M39029/5-115', awg: [20, 24] },
      '16': { p: 'M39029/4-111', s: 'M39029/5-116', awg: [16, 20] },
      '12': { p: 'M39029/4-113', s: 'M39029/5-118', awg: [12, 14] } } });

  set('MS26482', { src: 'MIL-DTL-26482 Série 1: contatos M39029/31 (pino) e /32 (soquete) #16, 16–20 AWG',
    contacts: { '16': { p: 'M39029/31-228', s: 'M39029/32-247', awg: [16, 20] }, '20': { p: 'contato #20 (pino)', s: 'contato #20 (soquete)', awg: [20, 24] } } });

  set('MS5015', { src: 'ITT Cannon MIL-DTL-5015 (fio MIL-W-5086 / corrente de ensaio) · Amphenol MS/Standard',
    contacts: { '16': { p: 'solda #16', s: 'solda #16', awg: [16, 20], a: 13 }, '12': { p: 'solda #12', s: 'solda #12', awg: [12, 14], a: 23 },
      '8': { p: 'solda #8', s: 'solda #8', awg: [8, 10], a: 46 }, '20': { p: 'solda #20', s: 'solda #20', awg: [20, 24] } } });

  set('M24308', { src: 'MIL-DTL-24308 §3.4.1.2 · Glenair selection guide (M39029/63 e /64)',
    contacts: { '20': { p: 'M39029/64-369', s: 'M39029/63-368', awg: [20, 24], a: 7.5 }, '22D': { p: 'M39029/58-360', s: 'M39029/57-354', awg: [22, 28] } } });

  set('DT', { sealed: true, src: 'TE DEUTSCH Common Contacts (catálogo DT) · 0460-202-16141 13 A',
    plug: '0413-217-1605',
    contacts: { '16': [{ p: '0460-202-16141', s: '0462-201-16141', awg: [16, 20], a: 13 }, { p: '0460-215-16141', s: '0462-209-16141', awg: [14, 14], a: 13 }] } });
  set('DTM', { sealed: true, src: 'TE DEUTSCH Common Contacts (DTM, tamanho 20, 7,5 A) · tampão 0413-204-2005',
    plug: '0413-204-2005',
    contacts: { '20': [{ p: '0460-202-20141', s: '0462-201-20141', awg: [20, 24], a: 7.5 }, { p: '0460-010-20141', s: '0462-005-20141', awg: [16, 18], a: 7.5 }] } });
  set('DTP', { sealed: true, src: 'TE DEUTSCH Common Contacts (tamanho 12, 25 A)',
    contacts: { '12': { p: '0460-204-12141', s: '0462-203-12141', awg: [12, 14], a: 25 } } });

  set('MicroFit', { src: 'Molex Micro-Fit 3.0: terminais 43030 (fêmea) / 43031 (macho), 5,0 A',
    contacts: { MF: [{ p: '43031-0001', s: '43030-0001', awg: [20, 24], a: 5 }, { p: '43031 (26–30 AWG)', s: '43030-0005', awg: [26, 30], a: 5 }] } });
  set('MiniFit', { src: 'Molex Mini-Fit Jr. 5556 (fêmea) / 5558 (macho), 18–24 AWG, 9 A (2–3 vias, latão)',
    contacts: { MFJ: { p: '5558 (macho)', s: '5556 (fêmea)', awg: [18, 24], a: 9 } } });
  set('JST-XH', { src: 'JST XH: SXH-001T-P0.6 (28–22 AWG) e SXH-002T-P0.6 (30–26 AWG), 3 A',
    contacts: { XH: [{ p: 'SXH-001T-P0.6', s: 'SXH-001T-P0.6', awg: [22, 28], a: 3 }, { p: 'SXH-002T-P0.6', s: 'SXH-002T-P0.6', awg: [26, 30], a: 3 }] } });
  set('JST-VH', { src: 'JST VH: SVH-21T-P1.1, 10 A', contacts: { VH: { p: 'SVH-21T-P1.1', s: 'SVH-21T-P1.1', awg: [18, 22], a: 10 } } });
  set('SUPERSEAL', { sealed: true, src: 'TE Superseal 1.5: 282109-1 (macho) / 282110-1 (fêmea), 0,75–1,5 mm², 14 A',
    contacts: { SS: { p: '282109-1', s: '282110-1', awg: [15, 18], a: 14 } } });

  // opções de contato de um pino (sempre lista)
  HX.contactOpts = function (c, pin) {
    var f = HX.CAT.fams[(c.part || '').split(':')[0]], sz = pin && pin.sz || (f && f.defaultSz) || '';
    var raw = (c.contacts && c.contacts[sz]) || (f && f.contacts && f.contacts[sz]);
    return { sz: sz, opts: raw ? (Array.isArray(raw) ? raw : [raw]) : [] };
  };
  HX.awgTxt = function (opts) { return opts.filter(function (o) { return o.awg; }).map(function (o) { return o.awg[0] === o.awg[1] ? String(o.awg[0]) : o.awg[0] + '–' + o.awg[1]; }).join(' ou ') + ' AWG'; };
  // contato para o pino; com bitola g escolhe a opção que aceita o fio (fit=false se nenhuma aceita)
  HX.contactFor = function (c, pin, g) {
    var r = HX.contactOpts(c, pin); if (!r.opts.length) return null;
    var ok = g == null ? null : r.opts.filter(function (o) { return o.awg && g >= o.awg[0] && g <= o.awg[1]; })[0], ch = ok || r.opts[0];
    var lo = Math.min.apply(0, r.opts.map(function (o) { return o.awg ? o.awg[0] : 99; })), hi = Math.max.apply(0, r.opts.map(function (o) { return o.awg ? o.awg[1] : 0; }));
    return { size: r.sz, pn: (c.gender || 'S') === 'P' ? ch.p : ch.s, awg: ch.awg, a: ch.a, fit: g == null || !!ok, opts: r.opts, range: [lo, hi], rtxt: HX.awgTxt(r.opts) };
  };
  // tampão de cavidade para o tamanho do contato (conectores vedados)
  HX.plugFor = function (c, pin) {
    var f = HX.CAT.fams[(c.part || '').split(':')[0]]; if (!f || !f.plug) return null;
    return typeof f.plug === 'string' ? f.plug : f.plug[pin && pin.sz] || null;
  };
})(typeof window !== 'undefined' ? window : globalThis);
