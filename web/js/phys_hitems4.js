/* HarnessCAD - alça LUVAS DE SOLDA: terminadores de blindagem SolderSleeve TE/Raychem, tabela exata do catálogo
   "Raychem Electrical Interconnect Products" p. 52 (Table C S01/S02 = M83519/1 e /2; Table D S03 = M83519/3):
   5 tamanhos pela capa (Ø máx.) e pela blindagem (Ø mín.); sem fio terra, ou com fio terra 20/22/24/26 AWG
   (MIL-W-22759/32, 150 mm), ou com tira de malha estanhada/niquelada (S03). Sn63, -55 a 150 °C. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.hitemAdd) return;
  var SZ = [[1.95, 0.9], [2.7, 1.4], [4.3, 2.15], [6.0, 3.3], [7.0, 4.3]], SRC = 'TE Raychem Electrical Interconnect Products, p. 52';
  function br(v) { return String(v).replace('.', ','); }
  function add(k, n, mil, te, i, lead) {
    HX.hitemAdd('h:ssl:' + k, { grp: 'ssl', use: 'acc', n: 'Luva de solda de blindagem ' + te + (lead ? ' — ' + lead : ' — sem fio terra'), pn: mil, mfr: 'TE Connectivity / Raychem',
      desc: 'capa Ø ≤ ' + br(SZ[i][0]) + ' mm · blindagem Ø ≥ ' + br(SZ[i][1]) + ' mm · ' + te + ' · ' + n, src: SRC });
  }
  SZ.forEach(function (z, i) {
    var t = i + 1;
    add('s01-' + t, 'tamanho ' + t, 'M83519/1-' + t, 'S01-0' + t + '-R', i, '');
    [[20, 0], [22, 5], [24, 10], [26, 15]].forEach(function (L) { var d = t + L[1];
      add('s02-' + d, 'tamanho ' + t, 'M83519/2-' + d, 'S02-' + (d < 10 ? '0' : '') + d + '-R', i, 'fio terra ' + L[0] + ' AWG'); });
    add('s03-' + t, 'tamanho ' + t, 'M83519/3-' + t, 'S03-0' + t + '-R', i, 'tira de malha estanhada');
    add('s03-' + (t + 5), 'tamanho ' + t, 'M83519/3-' + (t + 5), 'S03-' + (t + 5 < 10 ? '0' : '') + (t + 5) + '-R', i, 'tira de malha niquelada');
  });
  HX.hitemAdd('h:ssl:ramo', { grp: 'ssl', use: 'pacc', kind: 'ssleeve', n: 'Luva de solda no ramo (emenda da blindagem)', pn: '' });
})(typeof window !== 'undefined' ? window : globalThis);
