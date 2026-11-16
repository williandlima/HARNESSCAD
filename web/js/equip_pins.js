/* HarnessCAD - posição de cada terminal NO desenho do equipamento (unidades do ícone).
   [x, y, saída do fio (u/d/l/r), 1 = o desenho já mostra o conector, 2 = idem e o nome já está impresso]
   Terminais sem posição definida são distribuídos na borda de baixo da figura. */
(function (G) {
  'use strict';
  var HX = G.HX, P = HX.EQ_PINS = {};
  function row(names, x0, dx, y, dir, drawn) { var o = {}; names.forEach(function (n, i) { o[n] = [x0 + i * dx, y, dir, drawn ? 1 : 0]; }); return o; }

  P.psu = { '+': [6.3, 6.35, 'd', 1], '-': [7.4, 6.35, 'd', 1], 'GND': [8.5, 6.35, 'd', 1] };
  P.psu2 = { 'CH1+': [5.1, 6.4, 'd', 1], 'CH1-': [5.9, 6.4, 'd', 1], 'GND': [6.9, 6.4, 'd', 1], 'CH2+': [7.9, 6.4, 'd', 1], 'CH2-': [8.7, 6.4, 'd', 1] };
  P.osc = Object.assign(row(['CH1', 'CH2', 'CH3', 'CH4'], 10.4, 1.35, 6.7, 'd', 1), { EXT: [8.45, 6.7, 'd', 1], GND: [7.2, 6.7, 'd', 1] });
  P.osc2 = Object.assign(row(['CH1', 'CH2'], 13.1, 1.35, 6.7, 'd', 1), { EXT: [8.45, 6.7, 'd', 1], GND: [7.2, 6.7, 'd', 1] });
  P.hosc = { CH1: [1.6, 0.5, 'u', 1], CH2: [3, 0.5, 'u', 1], COM: [4.4, 0.5, 'u', 1] };
  P.dmm = row(['10A', 'mA', 'COM', 'VΩ'], 1.0, 1.33, 8.4, 'd', 1);
  P.dmmb = { HI: [10.2, 1.2, 'r', 1], 'S-HI': [11.25, 1.2, 'r', 1], LO: [10.2, 2.75, 'r', 1], 'S-LO': [11.25, 2.75, 'r', 1], I: [10.7, 4.25, 'r', 1] };
  P.clamp = { COM: [1.9, 9.3, 'd', 1], 'VΩ': [3.6, 9.3, 'd', 1] };
  P.fgen = { SYNC: [9.9, 4.65, 'd', 1], OUT: [11.6, 4.65, 'd', 1], GND: [8.75, 4.65, 'd', 1] };
  P.fgen2 = { CH1: [10.6, 4.9, 'd', 1], CH2: [11.85, 4.9, 'd', 1], SYNC: [9.4, 4.9, 'd', 1], GND: [8.35, 4.9, 'd', 1] };
  P.load = { '+': [7.9, 4.6, 'd', 1], '-': [9.4, 4.6, 'd', 1] };
  P.spec = { 'RF IN': [8.9, 6.7, 'd', 1], 'TG OUT': [10.2, 6.7, 'd', 1], REF: [11.5, 6.7, 'd', 1] };
  P.smps = row(['L', 'N', 'PE', '+V', '-V'], 1.5, 1.75, 4.85, 'd', 1);
  P.daq = Object.assign({ USB: [0, 3.5, 'l', 1] }, row(['AI0', 'AI1', 'AI2', 'AI3', 'AO0', 'DIO0', 'GND'], 0.8, 0.77, 9.3, 'r', 1));
  Object.keys(P.daq).forEach(function (k) { if (k !== 'USB') { var v = P.daq[k]; P.daq[k] = [9.3, v[0], 'r', 1]; } });
  P.usb = { USB: [0, 2, 'l', 1] };
  P.usbiso = { USB: [0, 2.5, 'l', 1], GND: [9.25, 0.85, 'r', 2], 'RDB(+)': [9.25, 1.67, 'r', 2], 'RDA(-)': [9.25, 2.49, 'r', 2], 'TDB(+)': [9.25, 3.31, 'r', 2], 'TDA(-)': [9.25, 4.13, 'r', 2] }; // 2 = nome já impresso no corpo // saídas: ver HX.eqUsbPins (dependem do tipo)
  P.bat = { '+': [7.5, 2.5, 'r', 1], '-': [0.25, 2.5, 'l', 1] };
  P.ac = { L: [0.2, 1.85, 'l', 1], N: [0.2, 4.15, 'l', 1], PE: [0.5, 3, 'l', 1] };
  P.probe = { BNC: [0.8, 2, 'l', 1], PONTA: [10, 1.6, 'r', 1], GND: [9.7, 3.65, 'r', 1] };
  P.pc = { USB1: [1.85, 6.65, 'd', 1], USB2: [3.15, 6.65, 'd', 1], USB3: [2.5, 7.25, 'd', 1], ETH: [3.6, 3.15, 'r', 1], COM1: [2.0, 3.15, 'l', 1], VIDEO: [3.5, 4.1, 'r', 1] };
  P.switch = row(['ETH1', 'ETH2', 'ETH3', 'ETH4', 'ETH5', 'ETH6', 'ETH7', 'ETH8'], 3.5, 1.1, 2.3, 'd', 1);
  P.patch = Object.assign(row(['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'], 1.525, 1.25, 0.75, 'u', 1),
    row(['P9', 'P10', 'P11', 'P12'], 1.525, 1.25, 3.25, 'd', 1));
  P.laptop = { USB1: [1.6, 7.3, 'd', 1], USB2: [2.6, 7.3, 'd', 1], ETH: [3.7, 7.3, 'd', 1], HDMI: [8.5, 7.3, 'd', 1], AUDIO: [9.7, 7.3, 'd', 1] };
  P.monitor = { HDMI: [6.6, 6.15, 'd', 1], VGA: [7.7, 6.15, 'd', 1], DP: [8.7, 6.15, 'd', 1], AC: [9.5, 6.1, 'd', 1] };
  P.printer = { USB: [9.2, 2.6, 'r', 1], ETH: [9.2, 3.3, 'r', 1], AC: [9.2, 4.15, 'r', 1] };
  P.router = { WAN: [4.825, 4.15, 'd', 1], LAN1: [5.875, 4.15, 'd', 1], LAN2: [6.925, 4.15, 'd', 1], LAN3: [7.975, 4.15, 'd', 1], LAN4: [9.025, 4.15, 'd', 1] };
  P.solder = { AC: [0.2, 4.5, 'l', 1], ESD: [5.4, 7.15, 'd', 1] };
  P.banana = { '1': [10, 2, 'r', 1] };
  P.jack = { '1': [5.9, 3, 'r', 1] };
  P.clip = { '1': [10, 2, 'r', 1] };

  // conversores USB: saída no conector da ponta (DB9, borne de parafuso ou barra de pinos)
  HX.eqUsbPins = function (t, names) {
    var o = {};
    names.forEach(function (n, i) {
      if (t === 'RS232') o[n] = [9.4, 1.4 + i * 0.3, 'r', 1];
      else if (t === 'TTL') o[n] = [10, 1.4 + i * 0.4, 'r', 1];
      else o[n] = [9.1, 1.35 + i * 0.65, 'r', 1];
    });
    return o;
  };
  HX.DIRS = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
})(typeof window !== 'undefined' ? window : globalThis);
