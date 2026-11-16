/* HarnessCAD - catálogo de FIOS, CABOS, CORES e EMENDAS */
(function (G) {
  'use strict';
  var HX = G.HX;

  // AWG: [awg, diâmetro condutor mm, área mm², ohm/km @20°C cobre, corrente ref. A (indicativa)]
  HX.AWG = [
    ['30', 0.255, 0.051, 338.6, 0.5], ['28', 0.321, 0.081, 212.9, 1], ['26', 0.405, 0.129, 133.9, 2],
    ['24', 0.511, 0.205, 84.2, 3], ['22', 0.644, 0.326, 52.9, 5], ['20', 0.812, 0.518, 33.3, 7.5],
    ['18', 1.024, 0.823, 20.9, 10], ['16', 1.291, 1.31, 13.2, 13], ['14', 1.628, 2.08, 8.28, 17],
    ['12', 2.053, 3.31, 5.21, 23], ['10', 2.588, 5.26, 3.28, 33], ['8', 3.264, 8.37, 2.06, 46],
    ['6', 4.115, 13.3, 1.30, 60], ['4', 5.189, 21.2, 0.815, 80], ['2', 6.544, 33.6, 0.513, 110], ['0', 8.252, 53.5, 0.323, 150]
  ];
  // Métrico IEC 60228 classe 5: [mm², ohm/km, AWG aprox., corrente ref. A]
  HX.MM2 = [
    ['0.14', 138, '26', 1.5], ['0.25', 79, '24', 2.5], ['0.34', 57, '22', 4], ['0.5', 39.0, '20', 6],
    ['0.75', 26.0, '18', 9], ['1', 19.5, '17', 11], ['1.5', 13.3, '16', 15], ['2.5', 7.98, '14', 21],
    ['4', 4.95, '12', 28], ['6', 3.30, '10', 36], ['10', 1.91, '8', 50], ['16', 1.21, '6', 68]
  ];

  // Tipos de fio: gauges = lista; unit 'AWG' ou 'mm2'; pn(gauge, colorCode)
  var MILC = { BK: '0', BN: '1', RD: '2', OG: '3', YE: '4', GN: '5', BU: '6', VT: '7', GY: '8', WH: '9' };
  function milPN(base) {
    return function (g, col) {
      var c = String(col || 'WH').split('-').map(function (x) { return MILC[x] != null ? MILC[x] : '9'; }).join('');
      return base + '-' + g + '-' + c;
    };
  }
  function seqA(a, b) { return HX.AWG.map(function (r) { return r[0]; }).filter(function (g) { return +g <= a && +g >= b; }); }
  var mmAll = HX.MM2.map(function (r) { return r[0]; });

  HX.CAT.wires = {
    'M22759/16': { std: 'MIL', unit: 'AWG', desc: 'ETFE, cobre estanhado, 150 °C, 600 V', gauges: seqA(24, 4), pn: milPN('M22759/16') },
    'M22759/32': { std: 'MIL', unit: 'AWG', desc: 'XL-ETFE leve, cobre estanhado, 150 °C, 600 V', gauges: seqA(30, 12), pn: milPN('M22759/32') },
    'M22759/34': { std: 'MIL', unit: 'AWG', desc: 'XL-ETFE, cobre estanhado, 150 °C, 600 V', gauges: seqA(24, 4), pn: milPN('M22759/34') },
    'M22759/11': { std: 'MIL', unit: 'AWG', desc: 'PTFE, cobre prateado, 200 °C, 600 V', gauges: seqA(28, 8), pn: milPN('M22759/11') },
    'M16878/4': { std: 'MIL', unit: 'AWG', desc: 'PTFE Tipo E, 200 °C, 600 V', gauges: seqA(30, 8), pn: milPN('M16878/4') },
    'M27500 (cabo)': { std: 'MIL', unit: 'AWG', desc: 'Cabo blindado/multivias MIL-DTL-27500 (informar PN)', gauges: seqA(28, 12), cable: true, pn: function (g) { return 'M27500-' + g + '…'; } },
    'UL1007': { std: 'COM', unit: 'AWG', desc: 'PVC 80 °C, 300 V', gauges: seqA(30, 16), pn: function (g, c) { return 'UL1007 ' + g + 'AWG ' + c; } },
    'UL1015': { std: 'COM', unit: 'AWG', desc: 'PVC 105 °C, 600 V', gauges: seqA(26, 4), pn: function (g, c) { return 'UL1015 ' + g + 'AWG ' + c; } },
    'UL1569': { std: 'COM', unit: 'AWG', desc: 'PVC 105 °C, 300 V', gauges: seqA(30, 10), pn: function (g, c) { return 'UL1569 ' + g + 'AWG ' + c; } },
    'UL1061': { std: 'COM', unit: 'AWG', desc: 'SR-PVC 80 °C, 300 V (parede fina)', gauges: seqA(30, 16), pn: function (g, c) { return 'UL1061 ' + g + 'AWG ' + c; } },
    'SAE GXL': { std: 'COM', unit: 'AWG', desc: 'Automotivo XLPE 125 °C (SAE J1128)', gauges: seqA(22, 4), pn: function (g, c) { return 'GXL ' + g + 'AWG ' + c; } },
    'SAE TXL': { std: 'COM', unit: 'AWG', desc: 'Automotivo XLPE parede fina 125 °C', gauges: seqA(22, 8), pn: function (g, c) { return 'TXL ' + g + 'AWG ' + c; } },
    'FLRY-B': { std: 'COM', unit: 'mm2', desc: 'Automotivo PVC ISO 6722, 105 °C', gauges: ['0.35', '0.5', '0.75', '1', '1.5', '2.5', '4', '6'], pn: function (g, c) { return 'FLRY-B ' + g + 'mm² ' + c; } },
    'H05V-K': { std: 'COM', unit: 'mm2', desc: 'PVC flexível 300/500 V, 70 °C', gauges: ['0.5', '0.75', '1'], pn: function (g, c) { return 'H05V-K ' + g + 'mm² ' + c; } },
    'H07V-K': { std: 'COM', unit: 'mm2', desc: 'PVC flexível 450/750 V, 70 °C', gauges: ['1.5', '2.5', '4', '6', '10', '16'], pn: function (g, c) { return 'H07V-K ' + g + 'mm² ' + c; } },
    'Silicone SiF': { std: 'COM', unit: 'mm2', desc: 'Silicone 180 °C, 300/500 V', gauges: mmAll, pn: function (g, c) { return 'SiF ' + g + 'mm² ' + c; } },
    'LiYY': { std: 'COM', unit: 'mm2', desc: 'Cabo de controle sem blindagem', gauges: ['0.14', '0.25', '0.5', '0.75', '1'], cable: true, pn: function (g) { return 'LiYY n x ' + g + 'mm²'; } },
    'LiYCY': { std: 'COM', unit: 'mm2', desc: 'Cabo de controle blindado (malha)', gauges: ['0.14', '0.25', '0.5', '0.75', '1'], cable: true, pn: function (g) { return 'LiYCY n x ' + g + 'mm²'; } },
    'Par trançado blindado': { std: 'COM', unit: 'AWG', desc: 'STP p/ RS-485/CAN 120 Ω', gauges: ['24', '22', '20'], cable: true, pn: function (g) { return 'STP 120Ω ' + g + 'AWG'; } },
    'RG-58': { std: 'COM', unit: 'coax', desc: 'Coaxial 50 Ω, Ø 4,95 mm', gauges: ['20'], pn: function () { return 'RG-58'; } },
    'RG-316': { std: 'MIL', unit: 'coax', desc: 'Coaxial 50 Ω FEP, 200 °C, Ø 2,5 mm', gauges: ['26'], pn: function () { return 'RG-316 (M17/113)'; } },
    'RG-174': { std: 'COM', unit: 'coax', desc: 'Coaxial 50 Ω, Ø 2,8 mm', gauges: ['26'], pn: function () { return 'RG-174'; } },
    'RG-178': { std: 'MIL', unit: 'coax', desc: 'Coaxial 50 Ω FEP, Ø 1,8 mm', gauges: ['30'], pn: function () { return 'RG-178 (M17/93)'; } },
    'RG-59': { std: 'COM', unit: 'coax', desc: 'Coaxial 75 Ω, Ø 6,1 mm', gauges: ['22'], pn: function () { return 'RG-59'; } },
    'RG-142': { std: 'MIL', unit: 'coax', desc: 'Coaxial 50 Ω dupla malha, Ø 4,95 mm', gauges: ['18'], pn: function () { return 'RG-142 (M17/60)'; } }
  };

  // Cores IEC 60757 (código -> [nome, hex])
  HX.COLORS = {
    BK: ['Preto', '#1b1b1b'], BN: ['Marrom', '#7b4a21'], RD: ['Vermelho', '#d42020'], OG: ['Laranja', '#f07c00'],
    YE: ['Amarelo', '#e6c600'], GN: ['Verde', '#1e9a3a'], BU: ['Azul', '#1f5fd6'], VT: ['Violeta', '#8a3fc6'],
    GY: ['Cinza', '#8c8c8c'], WH: ['Branco', '#b8b8b8'], PK: ['Rosa', '#ff69b4'], TQ: ['Turquesa', '#14b5b0'],
    GNYE: ['Verde-amarelo', '#5aa31e'], NAT: ['Natural', '#c9b58a']
  };
  HX.colorHex = function (code) { var c = HX.COLORS[String(code || '').split('-')[0]]; return c ? c[1] : '#008400'; };
  HX.colorName = function (code) {
    return String(code || '').split('-').map(function (c, i) { var x = HX.COLORS[c]; return (i ? 'listra ' : '') + (x ? x[0] : c); }).join(' / ');
  };

  HX.wireType = function (t) { return HX.CAT.wires[t] || null; };
  HX.wirePN = function (w) {
    if (w.pnOverride) return w.pnOverride;
    var t = HX.wireType(w.wtype); return t ? t.pn(w.gauge, w.color) : (w.wtype || '');
  };
  // Converte bitola para AWG (número) para checagem de contato
  HX.gaugeAWG = function (w) {
    var t = HX.wireType(w.wtype);
    if (t && t.unit === 'mm2') { var r = HX.MM2.filter(function (m) { return m[0] === String(w.gauge); })[0]; return r ? +r[2] : null; }
    var n = parseFloat(w.gauge); return isNaN(n) ? null : n;
  };
  HX.gaugeLabel = function (w) {
    var t = HX.wireType(w.wtype); if (!w.gauge) return '';
    return t && t.unit === 'mm2' ? w.gauge + ' mm²' : t && t.unit === 'coax' ? 'coax' : w.gauge + ' AWG';
  };
  // Resistência estimada do fio (ohm) com base no comprimento em mm
  HX.wireRes = function (w) {
    var L = +w.len || 0; if (!L) return null;
    var t = HX.wireType(w.wtype), ohmkm = null;
    if (t && t.unit === 'mm2') { var r = HX.MM2.filter(function (m) { return m[0] === String(w.gauge); })[0]; ohmkm = r && r[1]; }
    else { var a = HX.AWG.filter(function (m) { return m[0] === String(w.gauge); })[0]; ohmkm = a && a[3]; }
    return ohmkm ? ohmkm * L / 1e6 : null;
  };

  // Emendas (splices)
  HX.CAT.splices = {
    junction: { d: 'Junção (ponto de ligação)', pn: '' },
    crimp: { d: 'Emenda crimpada', pn: 'M81824/1-x' },
    solder: { d: 'Luva de solda (solder sleeve)', pn: 'M83519/1-x' },
    ultra: { d: 'Emenda ultrassônica', pn: '' },
    butt: { d: 'Emenda topo (butt splice) comercial', pn: 'Butt splice' }
  };
  HX.SPLICE_PARTS = [
    ['M81824/1-1', 'Emenda crimp 26-20 AWG (vermelha)', 26, 20],
    ['M81824/1-2', 'Emenda crimp 20-16 AWG (azul)', 20, 16],
    ['M81824/1-3', 'Emenda crimp 16-12 AWG (amarela)', 16, 12],
    ['M83519/1-x', 'Luva de solda (faixa conforme datasheet)', 0, 0],
    ['M83519/2-x', 'Luva de solda p/ blindagem', 0, 0]
  ];
})(typeof window !== 'undefined' ? window : globalThis);
