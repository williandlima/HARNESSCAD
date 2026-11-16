/* HarnessCAD - catálogo HARWIN DATAMATE L-Tek, fêmea crimpada (M80-XXXXXXX), passo 2,00 mm.
   Fonte: catálogo Harwin Datamate, p. 20 "Female Crimp" — HOW TO ORDER M80-XXX XX XX:
   tipo 788 extra small bore dupla | 798 extra small bore simples | 888 small bore dupla | 898 small bore simples |
   889 large bore dupla | 899 large bore simples; nº de contatos: simples 02 a 07 e 17, dupla 04 a 34 (pares);
   acabamento 01 ouro + estanho | 05 ouro. Medidas: A = B + 5,15; B = (n - 1) x 2 (simples) ou n - 2 (dupla);
   altura 7,65 máx.; profundidade 3,50 (simples) ou 5,45 (dupla). Ferramentas: alicate M22520/2-01, posicionador
   T5747, inserção/extração Z80-280. Decapagem 2,00 nominal, isolação Ø1,10 máx. (Ø0,75 extra small bore). */
(function (G) {
  'use strict';
  var HX = G.HX;
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var TYPE = { 2: { S: '888', L: '889', X: '788' }, 1: { S: '898', L: '899', X: '798' } };
  HX.M80 = { tools: 'Alicate M22520/2-01 · posicionador T5747 · inserção/extração Z80-280', strip: 2.0, insMax: { S: 1.1, L: 1.1, X: 0.75 },
    dims: function (n, rows) { var B = rows === 2 ? n - 2 : (n - 1) * 2; return { A: B + 5.15, B: B, H: 7.65, D: rows === 2 ? 5.45 : 3.5, p: 2.0 }; } };
  var items = [2, 3, 4, 5, 6, 7, 17].map(function (n) { return { label: n + ' vias (1 fileira)', n: n, rows: 1 }; })
    .concat([4, 6, 8, 10, 12, 14, 16, 18, 20, 26, 34].map(function (n) { return { label: '2x' + n / 2 + ' (' + n + ' vias)', n: n, rows: 2 }; }));
  HX.catFamily({ fam: 'M80', std: 'COM', refPfx: 'J', mfr: 'Harwin', desc: 'Datamate L-Tek fêmea crimpada (2,00 mm)', pitch: 2.0, sz: 'DM',
    variants: [{ v: 'S', d: 'Small bore (padrão)' }, { v: 'L', d: 'Large bore' }, { v: 'X', d: 'Extra small bore' },
      { v: 'S05', d: 'Small bore, acabamento ouro (05)' }, { v: 'L05', d: 'Large bore, ouro (05)' }, { v: 'X05', d: 'Extra small bore, ouro (05)' }],
    pn: function (e, v) { var b = String(v || 'S').charAt(0), fin = /05$/.test(v || '') ? '05' : '01';
      return 'M80-' + (TYPE[e.rows || 1][b] || TYPE[e.rows || 1].S) + pad(e.n) + fin; },
    contacts: { DM: { s: 'contato fêmea Datamate (catálogo Harwin p. 16)', p: '' } },
    items: items });
})(typeof window !== 'undefined' ? window : globalThis);
