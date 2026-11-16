/* HarnessCAD - catálogo de EQUIPAMENTOS e acessórios de bancada (símbolos com terminais ligáveis)
   s: lado do terminal (L/R) quando o equipamento tem entrada e saída; col: cor do borne banana */
(function (G) {
  'use strict';
  var HX = G.HX;
  var RD = '#d42020', BK = '#1b1b1b', GN = '#1e9a3a', GY = '#5aa31e', BU = '#1f5fd6', YE = '#e6c600';
  function P(list, side) {
    return list.map(function (x) { var q = typeof x === 'string' ? { n: x } : { n: x[0], col: x[1] }; q.name = ''; if (side) q.s = side; return q; });
  }
  function pins() { var r = []; for (var i = 0; i < arguments.length; i += 2) r = r.concat(P(arguments[i], arguments[i + 1])); return r; }
  function usb(lbl, out, rows) {
    return { label: 'Conversor USB-' + lbl, eq: 'usb', eqTxt: lbl, refPfx: 'U', side: 'M', minRows: rows || out.length, pins: pins(['USB'], 'L', out, 'R') };
  }
  HX.catFamily({
    fam: 'EQUIP', std: 'COM', mfr: 'Equipamento / bancada', desc: 'Equipamentos e acessórios', refPfx: 'EQ',
    pn: function (e) { return e.label; },
    items: [
      { label: 'Notebook', eq: 'laptop', refPfx: 'PC', minRows: 5, pins: P(['USB1', 'USB2', 'ETH', 'HDMI', 'AUDIO']) },
      { label: 'Computador (desktop)', eq: 'pc', refPfx: 'PC', minRows: 6, pins: P(['USB1', 'USB2', 'USB3', 'ETH', 'COM1', 'VIDEO']) },
      { label: 'Monitor', eq: 'monitor', refPfx: 'MON', minRows: 4, pins: P(['HDMI', 'VGA', 'DP', 'AC']) },
      { label: 'Impressora', eq: 'printer', refPfx: 'IMP', minRows: 3, pins: P(['USB', 'ETH', 'AC']) },
      { label: 'Switch de rede 8 portas', eq: 'switch', refPfx: 'SW', side: 'M', minRows: 4, pins: pins(['ETH1', 'ETH2', 'ETH3', 'ETH4'], 'L', ['ETH5', 'ETH6', 'ETH7', 'ETH8'], 'R') },
      { label: 'Roteador Wi-Fi', eq: 'router', refPfx: 'RT', side: 'M', minRows: 4, pins: pins(['WAN'], 'L', ['LAN1', 'LAN2', 'LAN3', 'LAN4'], 'R') },
      { label: 'Patch panel 12 portas', eq: 'patch', refPfx: 'PP', side: 'M', minRows: 6, pins: pins(['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], 'L', ['P7', 'P8', 'P9', 'P10', 'P11', 'P12'], 'R') },
      { label: 'Fonte de bancada (1 canal)', eq: 'psu', refPfx: 'PS', minRows: 4, pins: P([['+', RD], ['-', BK], ['GND', GN]]) },
      { label: 'Fonte de bancada (2 canais)', eq: 'psu2', refPfx: 'PS', minRows: 5, pins: P([['CH1+', RD], ['CH1-', BK], ['GND', GN], ['CH2+', RD], ['CH2-', BK]]) },
      { label: 'Fonte AC/DC chaveada', eq: 'smps', refPfx: 'PS', side: 'M', minRows: 3, pins: pins(['L', 'N', ['PE', GY]], 'L', [['+V', RD], ['-V', BK]], 'R') },
      usb('RS232', ['TXD', 'RXD', 'GND', 'RTS', 'CTS']),
      usb('RS485', ['A+', 'B-', 'GND'], 3),
      usb('TTL', ['VCC', 'TX', 'RX', 'GND']),
      usb('CAN', ['CANH', 'CANL', 'GND'], 3),
      { label: 'Conversor USB-RS422/485 isolado (borne 5 vias)', eq: 'usbiso', refPfx: 'U', side: 'M', minRows: 5,
        pins: pins(['USB'], 'L', ['TDA(-)', 'TDB(+)', 'RDA(-)', 'RDB(+)', 'GND'], 'R') },
      { label: 'Módulo DAQ USB', eq: 'daq', refPfx: 'DAQ', side: 'M', minRows: 7, pins: pins(['USB'], 'L', ['AI0', 'AI1', 'AI2', 'AI3', 'AO0', 'DIO0', ['GND', GN]], 'R') },
      { label: 'Osciloscópio (4 canais)', eq: 'osc', refPfx: 'OSC', minRows: 6, pins: P(['CH1', 'CH2', 'CH3', 'CH4', 'EXT', ['GND', GN]]) },
      { label: 'Osciloscópio (2 canais)', eq: 'osc2', refPfx: 'OSC', minRows: 5, pins: P(['CH1', 'CH2', 'EXT', ['GND', GN]]) },
      { label: 'Osciloscópio portátil', eq: 'hosc', refPfx: 'OSC', minRows: 5, pins: P(['CH1', 'CH2', ['COM', BK]]) },
      { label: 'Analisador de espectro', eq: 'spec', refPfx: 'SA', minRows: 4, pins: P(['RF IN', 'TG OUT', 'REF']) },
      { label: 'Multímetro', eq: 'dmm', refPfx: 'DMM', minRows: 6, pins: P([['VΩ', RD], ['COM', BK], ['mA', RD], ['10A', RD]]) },
      { label: 'Multímetro de bancada', eq: 'dmmb', refPfx: 'DMM', minRows: 5, pins: P([['HI', RD], ['LO', BK], ['I', RD], ['S-HI', RD], ['S-LO', BK]]) },
      { label: 'Alicate amperímetro', eq: 'clamp', refPfx: 'AMP', minRows: 6, pins: P([['VΩ', RD], ['COM', BK]]) },
      { label: 'Gerador de funções', eq: 'fgen', refPfx: 'FG', minRows: 4, pins: P(['OUT', 'SYNC', ['GND', GN]]) },
      { label: 'Gerador de funções (2 canais)', eq: 'fgen2', refPfx: 'FG', minRows: 4, pins: P(['CH1', 'CH2', 'SYNC', ['GND', GN]]) },
      { label: 'Carga eletrônica', eq: 'load', refPfx: 'LD', minRows: 3, pins: P([['+', RD], ['-', BK]]) },
      { label: 'Estação de solda', eq: 'solder', refPfx: 'ES', minRows: 4, pins: P(['AC', ['ESD', GN]]) },
      { label: 'Bateria', eq: 'bat', refPfx: 'BT', minRows: 2, pins: P([['+', RD], ['-', BK]]) },
      { label: 'Tomada / plugue AC', eq: 'ac', refPfx: 'AC', minRows: 3, pins: P(['L', 'N', ['PE', GY]]) },
      { label: 'Ponta de prova (osciloscópio)', eq: 'probe', refPfx: 'PR', side: 'M', minRows: 2, pins: pins(['BNC'], 'L', ['PONTA', ['GND', GN]], 'R') },
      { label: 'Pino banana 4 mm vermelho', eq: 'banana', refPfx: 'BP', wu: 9, pins: P([['1', RD]]) },
      { label: 'Pino banana 4 mm preto', eq: 'banana', refPfx: 'BP', wu: 9, pins: P([['1', BK]]) },
      { label: 'Pino banana 4 mm verde', eq: 'banana', refPfx: 'BP', wu: 9, pins: P([['1', GN]]) },
      { label: 'Pino banana 4 mm azul', eq: 'banana', refPfx: 'BP', wu: 9, pins: P([['1', BU]]) },
      { label: 'Borne banana (painel) vermelho', eq: 'jack', refPfx: 'BJ', wu: 7, pins: P([['1', RD]]) },
      { label: 'Borne banana (painel) preto', eq: 'jack', refPfx: 'BJ', wu: 7, pins: P([['1', BK]]) },
      { label: 'Borne banana (painel) amarelo', eq: 'jack', refPfx: 'BJ', wu: 7, pins: P([['1', YE]]) },
      { label: 'Garra jacaré vermelha', eq: 'clip', refPfx: 'CL', wu: 9, pins: P([['1', RD]]) },
      { label: 'Garra jacaré preta', eq: 'clip', refPfx: 'CL', wu: 9, pins: P([['1', BK]]) }
    ]
  });
  // equipamento não tem contatos/AWG próprios; sinal vazio evita falso "curto" no ERC
})(typeof window !== 'undefined' ? window : globalThis);
