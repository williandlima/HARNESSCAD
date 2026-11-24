/* HarnessCAD - TABELAS DE SELEÇÃO SolderSleeve transcritas célula a célula do datasheet TE "Electrical Interconnect
   Products": Tabela A B-155/CWT (p.8), Tabela B D-110 (p.9), Tabela C D-1744 (p.10). Valem quando cada lado tem 1 ou 2
   fios da MESMA bitola (regra da p.7); fora disso vale a Tabela E (CMA total, p.12) com conferência do Ø da isolação.
   Linha = lado A (bitola/nº de fios), coluna = lado B, na ordem de K. Código: dígito/letra → PN (Z), '-' = sem peça. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.SPLICE_LIB) return;
  var K = ['26/1', '26/2', '24/1', '24/2', '22/1', '22/2', '20/1', '20/2', '18/1', '18/2', '16/1', '16/2', '14/1', '14/2', '12/1', '12/2', '10/1'];
  var AB = ['11111222232334355', '11121222232334355', '11111222232334355', '12122222232334355', '11122222232334355', '22222223233334355', '22222223233334355', '22222333333334455', '22222223333334455', '33333333333434455', '22222333333334455', '33333333343445455', '33333333333434455', '44444444444545555', '33333334444445455', '55555555555555555', '55555555555555555'];
  HX.SPLICE_TAB = {
    'B-155': { pg: 'Tabela A, p. 8', K: K, R: AB, Z: { 1: 'B-155-9001', 2: 'B-155-9002', 3: 'B-155-9003', 4: 'B-155-9004', 5: 'B-155-9005' } },
    'CWT': { pg: 'Tabela A, p. 8', K: K, R: AB, Z: { 1: 'CWT-9001', 2: 'CWT-9002', 3: 'CWT-9003', 4: 'CWT-9004', 5: 'CWT-9005' } },
    'D-110': { pg: 'Tabela B, p. 9', K: K, Z: { a: 'D-110-35', b: 'D-110-41', c: 'D-110-0181', d: 'D-110-0101', e: 'D-110-0090', f: 'D-110-0083' },
      R: ['aaaaabbbbcbdcddee', 'aaababbbbcbdcddee', 'aaaaabbbbcbdcddee', 'ababbbbbbcbdcddee', 'aaabbbbbbcbccddee', 'bbbbbbbcbdcddedee', 'bbbbbbbcbdcddddee', 'bbbbbccccdcddedee', 'bbbbbbbccdcddedee', 'cccccddddddddeeef', 'bbbbbccccdcddedee', 'ddddcddddddedeeff', 'cccccddddddddeeef', 'dddddedeeeeeeeeff', 'dddddddddedeeeeff', 'eeeeeeeeeeefeffff', 'eeeeeffffffffffff'] },
    'D-1744': { pg: 'Tabela C, p. 10', K: K.slice(0, 16), Z: { 1: 'D-1744-01', 2: 'D-1744-02', 3: 'D-1744-03', 4: 'D-1744-04' },
      R: ['1111111223233334', '1111121223233334', '1111111223233334', '111112222323333-', '1111121223233334', '121222222323333-', '111212222323334-', '222222233333344-', '222222232333333-', '333333333333343-', '222222233333343-', '333333333333344-', '333333333333343-', '3333333434444---', '3333334433343-4-', '444-4-----------'] }
  };
  /* PN pela tabela (ou null quando o caso não está coberto por ela) */
  HX.spliceTable = function (ser, A, B) {
    var T = HX.SPLICE_TAB[ser]; if (!T) return null;
    function key(L) { if (!L.length || L.length > 2 || L.some(function (x) { return x.awg !== L[0].awg; })) return -1; return T.K.indexOf(L[0].awg + '/' + L.length); }
    var i = key(A), j = key(B); if (i < 0 || j < 0) return null; var c = T.R[i] && T.R[i][j]; if (!c || c === '-') return { err: 'combinação ' + T.K[i] + ' × ' + T.K[j] + ' sem peça na ' + T.pg };
    function f(k) { var a = k.split('/'); return a[0] + ' AWG (' + a[1] + (a[1] === '1' ? ' fio)' : ' fios)'); } return { pn: T.Z[c], why: T.pg + ': ' + f(T.K[i]) + ' × ' + f(T.K[j]) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
