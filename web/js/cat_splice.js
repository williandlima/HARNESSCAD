/* HarnessCAD - BIBLIOTECA DE EMENDAS (só datasheet oficial): TE Raychem "Electrical Interconnect Products"
   (AD&M, 2019/rev. 2024 — PDF do usuário), páginas indicadas em cada série. Medidas em mm; CMA = circular mils.
   sel: 'total' = soma da CMA de todos os fios na faixa do PN (Tabela E p.12 / Tabela A p.14);
        'side'  = CMA de cada lado cabe no barril de crimpagem (Tabela B p.24, menor barril que serve);
        'awg'   = faixa de bitola do PN, 1 fio por lado (D-406 p.19-20, D-200 p.28).
   p = [PN, cor, CMA mín, CMA máx, Ø isol. mín, Ø isol. máx, extra] (Ø isol. = faixa de diâmetro externo do fio). */
(function (G) {
  'use strict';
  var HX = G.HX; HX.CAT = HX.CAT || {};
  HX.SPLICE_SRC = 'TE Raychem Electrical Interconnect Products (AD&M)';
  /* CMA dos condutores típicos (Tabela B p.15; = Tabela D p.11 / Tabela A p.24) */
  HX.SPLICE_CMA = { 30: 112, 28: 177, 26: 304, 24: 475, 22: 754, 20: 1216, 18: 1900, 16: 2426, 14: 3831, 12: 5874, 10: 9354, 8: 16983 };
  var HEAT = 'Soprador TE HL1920E/HL2020E, IR-1759 MiniRay, AA-400 ou CV-1981 com refletor';
  HX.SPLICE_LIB = {
    'D-110': { kind: 'solder', d: 'SolderSleeve D-110 — luva de solda transparente (PVDF)', env: 'Respingos (splashproof)', temp: '-55 a +150 °C', wmin: 'isolação do fio ≥ 125 °C',
      spec: 'UL E87681 · TE RT-1404', mat: 'PVDF reticulado; solda Sn63Pb37; fluxo ROL1 (RMA)', tool: HEAT, proc: '', pg: '7, 9, 11, 12', sel: 'total',
      p: [['D-110-35', '', 500, 1500, 0.51, 1.78], ['D-110-41', '', 1200, 3500, 1.27, 2.54], ['D-110-0181', '', 3600, 6000, 1.9, 4.5], ['D-110-0101', '', 4800, 9000, 2.41, 4.32],
        ['D-110-0090', '', 8500, 16200, 3.56, 7.11], ['D-110-0083', '', 16200, 25000, 4.0, 8.76]] },
    'D-1744': { kind: 'solder', d: 'SolderSleeve D-1744 (NAS 1744) — luva de solda selada p/ imersão, indicador termocrômico', env: 'Imersão (75.000 ft de altitude)', temp: '-55 a +150 °C',
      wmin: 'isolação do fio ≥ 125 °C', spec: 'NAS 1744 · TE RT-1404', mat: 'PVDF reticulado; solda Sn63Pb37; fluxo ROL1; insertos fundíveis', tool: HEAT, proc: 'RPIP-850-00', pg: '7, 10, 11, 12', sel: 'total',
      p: [['D-1744-01', '', 350, 2000, 0.50, 1.90], ['D-1744-02', '', 2000, 4000, 0.80, 2.80], ['D-1744-03', '', 4000, 10000, 1.30, 4.57], ['D-1744-04', '', 10000, 13000, 2.00, 7.11]] },
    'B-155': { kind: 'solder', d: 'SolderSleeve B-155 — luva de solda transparente (poliolefina, sem chumbo)', env: 'Respingos (splashproof)', temp: '-55 a +125 °C', wmin: 'isolação do fio ≥ 85 °C',
      spec: 'TE RT-1404 (RoHS)', mat: 'poliolefina reticulada; solda Sn42Bi58; fluxo ROM1; insertos fundíveis', tool: HEAT, proc: 'RPIP-824-00', pg: '7, 8, 11, 12', sel: 'total',
      p: [['B-155-9001', '', 450, 1500, 0.4, 1.7], ['B-155-9002', '', 1500, 4000, 1.3, 2.7], ['B-155-9003', '', 4000, 7800, 1.8, 4.5], ['B-155-9004', '', 7800, 12000, 2.8, 6.0], ['B-155-9005', '', 12000, 19000, 3.2, 7.0]] },
    'CWT': { kind: 'solder', d: 'SolderSleeve CWT — luva de solda (atenção: solda com CÁDMIO)', env: 'Respingos (splashproof)', temp: 'até +125 °C', wmin: 'isolação do fio ≥ 85 °C',
      spec: 'UL E87681 · TE D-5023', mat: 'solda Sn50Pb32Cd18 (contém cádmio); fluxo ROM1', tool: HEAT, proc: '', pg: '7, 8, 11, 12', sel: 'total', note: 'faixas = B-155-900x (mesmas tabelas A p.8 e exemplo p.11)',
      p: [['CWT-9001', '', 450, 1500, 0.4, 1.7], ['CWT-9002', '', 1500, 4000, 1.3, 2.7], ['CWT-9003', '', 4000, 7800, 1.8, 4.5], ['CWT-9004', '', 7800, 12000, 2.8, 6.0], ['CWT-9005', '', 12000, 19000, 3.2, 7.0]] },
    /* MiniSeal: x = [tipo, máx. fios lado 1, máx. fios lado 2, Ø vedação lado 1, lado 2, equivalente MIL] — Tabelas C e D p.24-25 */
    'D-436': { kind: 'crimp', d: 'MiniSeal D-436 — emenda crimpada selada p/ imersão (barril estanhado, PVDF)', env: 'Imersão', temp: '-55 a +150 °C', wmin: '',
      spec: 'SAE AS81824/1 (D-436-36/37/38)', mat: 'PVDF reticulado; barril de cobre estanhado; insertos fundíveis', tool: 'Alicate TE AD-1377 + ' + HEAT, proc: 'RCPS-200-20', pg: '23-26', sel: 'side',
      p: [['D-436-36', 'Vermelho', 304, 1510, 0, 0, ['topo', 2, 2, 2.16, 2.16, 'M81824/1-1']], ['D-436-37', 'Azul', 1058, 2680, 0, 0, ['topo', 2, 2, 2.79, 2.79, 'M81824/1-2']],
        ['D-436-38', 'Amarelo', 2375, 6755, 0, 0, ['topo', 2, 2, 4.32, 4.32, 'M81824/1-3']], ['D-436-0110', 'Vermelho', 304, 1510, 0, 0, ['topo', 6, 2, 2.36, 4.06]],
        ['D-436-52', 'Azul', 1058, 2680, 0, 0, ['topo', 6, 2, 2.36, 4.06]], ['D-436-53', 'Amarelo', 2375, 6755, 0, 0, ['topo', 6, 2, 2.36, 4.06]],
        ['D-436-0115', 'Vermelho', 304, 1510, 0, 0, ['topo', 6, 6, 2.36, 2.36]], ['D-436-42', 'Azul', 1058, 2680, 0, 0, ['topo', 6, 6, 2.36, 2.36]], ['D-436-43', 'Amarelo', 2375, 6755, 0, 0, ['topo', 6, 6, 2.36, 2.36]],
        ['D-436-0128', 'Vermelho', 304, 1510, 0, 0, ['ponta', 2, 2, 2.16, 1.01]], ['D-436-58', 'Azul', 1058, 2680, 0, 0, ['ponta', 2, 2, 4.56, 2.28]], ['D-436-59', 'Amarelo', 2375, 6755, 0, 0, ['ponta', 2, 2, 4.56, 2.28]],
        ['D-436-60', 'Azul', 1058, 2680, 0, 0, ['ponta', 10, 2, 2.03, 6.35]], ['D-436-61', 'Amarelo', 2375, 6755, 0, 0, ['ponta', 10, 2, 2.03, 6.35]]] },
    /* D-200: x = [AWG máx, AWG mín, MIL, PN TE, ØA, ØB, C (comprimento), D, E] máximos — p.28 */
    'D-200': { kind: 'crimp', d: 'MiniSeal 200 °C D-200 — emenda crimpada niquelada selada p/ imersão', env: 'Imersão', temp: '-55 a +200 °C', wmin: 'isolação do fio ≥ 135 °C, condutor niquelado',
      spec: 'SAE AS81824/11', mat: 'fluoropolímero azul transparente; barril cobre 101/102 niquelado (AMS-QQ-N-290); anéis fundíveis', tool: 'Alicate TE AD-1377 + ' + HEAT, proc: 'RCPS-200-20', pg: '27, 28', sel: 'awg',
      p: [['D-200-82', 'Vermelho', 0, 0, 0, 0, [20, 26, 'M81824/11-1', 'D17660-000', 1.27, 2.03, 12.95, 6.22, 0.38]], ['D-200-83', 'Azul', 0, 0, 0, 0, [16, 20, 'M81824/11-2', 'A36675-000', 1.75, 2.70, 14.86, 7.11, 0.51]],
        ['D-200-84', 'Amarelo', 0, 0, 0, 0, [12, 16, 'M81824/11-3', 'C60253-000', 2.60, 3.89, 14.86, 7.11, 1.27]]] },
    /* D-406: x = [AWG máx, AWG mín, ØA mín, L nominal, Ø isol. mín, máx] — p.19-20 */
    'D-406': { kind: 'butt', d: 'DuraSeal D-406 — emenda de topo isolada em náilon com termo-retrátil e adesivo', env: 'Água, condensação, sal (vedada)', temp: '-55 a +125 °C', wmin: '',
      spec: 'UL/CUL 91J4 E87681 · TE RB-107 (D-406-0034 sem UL)', mat: 'termo-retrátil 2:1 com adesivo, não retardante de chama', tool: 'Alicate TE AD-1522 + soprador HL1920E/HL2020E · decapar 7,5 mm', proc: 'RPIP-821-00', pg: '19, 20', sel: 'awg',
      p: [['D-406-0034', 'Amarelo', 0, 0, 1.40, 3.00, [24, 26, 3.00, 31.5]], ['D-406-0001', 'Vermelho', 0, 0, 1.40, 3.70, [18, 22, 3.70, 31.5]],
        ['D-406-0002', 'Azul', 0, 0, 2.00, 4.60, [14, 16, 4.60, 31.5]], ['D-406-0003', 'Amarelo', 0, 0, 2.80, 6.50, [10, 12, 6.50, 37.5]]] },
    /* SolderGrip (emenda de ponta, até 10 fios): x = [L mín, ØA mín] — Tabela A p.14 */
    'SGRP': { kind: 'closed', d: 'SolderGrip SGRP — emenda de ponta (closed-end) com solda, não vedada', env: 'Respingos (splashproof)', temp: 'até +125 °C', wmin: '', spec: 'TE', mat: 'termoplástico retrátil, inserto espiral de cobre com solda e fluxo', tool: HEAT, proc: '', pg: '13-16', sel: 'total',
      p: [['SGRP-1', 'Verde', 1400, 4800, 0, 0, [34.8, 2.9]], ['SGRP-2', 'Vermelho', 4000, 8000, 0, 0, [34.2, 3.7]], ['SGRP-3', 'Azul', 7000, 16000, 0, 0, [41.0, 5.1]], ['SGRP-4', 'Amarelo', 15000, 24000, 0, 0, [42.0, 6.8]]] },
    'SGRS': { kind: 'closed', d: 'SolderGrip SGRS — emenda de ponta (closed-end) com solda, vedada p/ imersão', env: 'Vedada', temp: 'até +125 °C', wmin: '', spec: 'TE', mat: 'termoplástico retrátil com inserto de vedação, inserto espiral de cobre com solda', tool: HEAT, proc: '', pg: '13-16', sel: 'total',
      p: [['SGRS-1', 'Verde', 1400, 4800, 0, 0, [34.8, 3.4]], ['SGRS-2', 'Vermelho', 4000, 8000, 0, 0, [34.2, 4.8]], ['SGRS-3', 'Azul', 7000, 16000, 0, 0, [42.0, 7.3]], ['SGRS-4', 'Amarelo', 15000, 24000, 0, 0, [41.5, 9.1]]] }
  };
  /* tipos de emenda do esquema: closed-end novo; série padrão de cada tipo */
  if (HX.CAT.splices) { HX.CAT.splices.closed = { d: 'Emenda de ponta (closed-end, vários fios)', pn: '' }; HX.CAT.splices.crimp.pn = 'M81824/1-x'; }
  HX.SPLICE_DEF = { solder: 'D-1744', crimp: 'D-436', butt: 'D-406', closed: 'SGRS' };
  /* lista de peças (janela da biblioteca / sugestões do campo PN) gerada da biblioteca */
  HX.SPLICE_PARTS = [];
  Object.keys(HX.SPLICE_LIB).forEach(function (s) { var S = HX.SPLICE_LIB[s]; S.p.forEach(function (q) { var x = q[6] || [];
    HX.SPLICE_PARTS.push([q[0], S.d.split(' — ')[0] + (q[1] ? ' ' + q[1].toLowerCase() : '') + (S.sel === 'awg' ? ' ' + x[1] + '-' + x[0] + ' AWG' : ' CMA ' + q[2] + '-' + q[3]) + (x[5] && /^M8/.test(x[5]) ? ' (' + x[5] + ')' : x[2] && /^M8/.test(x[2]) ? ' (' + x[2] + ')' : ''), 0, 0]); }); });
  HX.SPLICE_PARTS.push(['M83519/1-x', 'Luva de solda (faixa conforme datasheet)', 0, 0], ['M83519/2-x', 'Luva de solda p/ blindagem', 0, 0]);
})(typeof window !== 'undefined' ? window : globalThis);
