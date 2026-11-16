/* HarnessCAD - catálogo: D-SUB PARA CABO (Amphenol "D-Sub Cable Connectors", DIN 41652 / MIL-C-24308).
   Só conectores de cabo do datasheet:
   - DSUBC série D (contatos estampados, caçapa de solda): D + carcaça + fixação + nº + P/S + 0 + 64 + T + X + LF
   - DSUBC série 8656 (contatos crimp removíveis, AWG 20/24 e 24/28): 8656 + fixação + nº + P/S + L + T + X + LF
   - DSUBW misto / potência (solda): D + carcaça + fixação + leiaute + P/S + A00LF, leiautes da página "Layouts"
     (vista frontal do isolador macho; A1.. = contatos coaxiais/potência). Fixação (L/O/V) é escolhida no nó do
   desenho físico; o PN aqui sai na versão padrão (sem acessório). X (covinhas) só na carcaça macho. */
(function (G) {
  'use strict';
  var HX = G.HX, SH = { 9: 'E', 15: 'A', 25: 'B', 37: 'C', 50: 'D' }, P = 2.77;
  function n2(n) { return (n < 10 ? '0' : '') + n; }
  HX.catFamily({
    fam: 'DSUBC', std: 'COM', mfr: 'Amphenol', desc: 'D-Sub p/ cabo (Amphenol)', refPfx: 'J', sz: '20',
    variants: [{ v: 'D', d: 'Série D — caçapa de solda' }, { v: '8656', d: 'Série 8656 — crimp removível' }],
    pn: function (e, v, g) { var p = g === 'P'; return v === '8656' ? '8656' + n2(e.n) + (p ? 'P' : 'S') + 'LT' + (p ? 'X' : '') + 'LF' : 'D' + e.shell + n2(e.n) + (p ? 'P' : 'S') + '064T' + (p ? 'X' : '') + 'LF'; },
    contacts: { '20': { p: '865635206', s: '865635306', awg: [20, 24] }, '24': { p: '865635006', s: '865635106', awg: [24, 28] } },
    items: Object.keys(SH).map(function (n) { return { label: 'D' + SH[n] + '-' + n, n: +n, shell: SH[n] }; })
  });
  // leiautes mistos: [carcaça, fileiras padrão da carcaça, pequenos "fileira:posição" na ordem da numeração, grandes "fileira:posição"]
  // posição em passos (2,77) a partir da 1ª posição da fileira; grande na fileira "c" = entre as fileiras 0 e 1
  function rg(r, a, b) { var o = []; if (a <= b) for (var i = a; i <= b; i++) o.push(r + ':' + i); else for (var j = a; j >= b; j--) o.push(r + ':' + j); return o; }
  var LAY = {
    '5W1': ['E', ['0:0', '0:4', '1:0', '1:3'], ['c:2']],
    '11W1': ['A', rg(0, 0, 2).concat(rg(0, 5, 7), rg(1, 0, 1), rg(1, 5, 6)), ['c:3.5']],
    '7W2': ['A', rg(0, 3, 4).concat(rg(1, 2, 4)), ['c:1', 'c:6']],
    '3W3': ['A', [], ['c:1', 'c:3.5', 'c:6']],
    '3V3': ['A', [], ['c:1', 'c:3.5', 'c:6']],
    '21W1': ['B', rg(0, 0, 4).concat(rg(0, 8, 12), rg(1, 0, 4), rg(1, 7, 11)), ['c:6']],
    '17W2': ['B', rg(0, 3, 9).concat(rg(1, 2, 9)), ['c:1', 'c:11']],
    '13W3': ['B', rg(0, 9, 5).concat(rg(1, 8, 4)), ['c:11.2', 'c:3.6', 'c:1']],
    '9W4': ['B', rg(0, 8, 9).concat(rg(1, 7, 9)), ['c:1', 'c:3.5', 'c:6.2', 'c:11.2']],
    '5W5': ['B', [], ['c:1', 'c:3.5', 'c:6', 'c:8.5', 'c:11']],
    '25W3': ['C', rg(0, 5, 15).concat(rg(1, 5, 15)), ['c:1', 'c:3.5', 'c:17.2']],
    '21WA4': ['C', rg(0, 5, 13).concat(rg(1, 5, 12)), ['c:1', 'c:3.5', 'c:15.3', 'c:17.6']],
    '27W2': ['C', rg(0, 3, 15).concat(rg(1, 3, 14)), ['c:1', 'c:17.2']],
    '8W8': ['C', [], [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return 'c:' + (1 + i * 16 / 7).toFixed(2); })],
    '47W1': ['D', rg(0, 0, 14).concat(rg(1, 0, 14), rg(2, 0, 15)), ['c:15.8']],
    '24W7': ['D', rg(2, 0, 16), [0, 1, 2, 3, 4, 5, 6].map(function (i) { return 'c:' + (0.6 + i * 14.8 / 6).toFixed(2); })],
    '36W4': ['D', rg(0, 7, 14).concat(rg(1, 7, 13), rg(2, 0, 16)), ['c:0.4', 'c:2.9', 'c:5.4', 'c:15.8']]
  };
  var ROWS = { E: [5, 4], A: [8, 7], B: [13, 12], C: [19, 18], D: [17, 16, 17] };
  HX.DSUB_LAY = LAY;
  // coordenadas (mm) no isolador, vista frontal do macho, centro da face = 0,0 (mesmo referencial de HX.dsubGeom)
  HX.dsubLayPts = function (key) {
    var L = LAY[key]; if (!L) return null; var rows = ROWS[L[0]], nr = rows.length, py = 2.84, hh = (nr - 1) * py + 4.6, out = [];
    function xy(s) { var a = s.split(':'), r = a[0], i = +a[1], ri = r === 'c' ? 0 : +r, x = (i - (rows[ri] - 1) / 2) * P, y0 = -hh / 2 + 2.3; return [x, r === 'c' ? y0 + py / 2 * (nr > 2 ? 1 : 1) : y0 + ri * py]; }
    L[1].forEach(function (s, k) { var q = xy(s); out.push({ n: String(k + 1), x: q[0], y: q[1] }); });
    L[2].forEach(function (s, k) { var q = xy(s); out.push({ n: 'A' + (k + 1), x: q[0], y: q[1], big: true }); });
    return out;
  };
  var SN = { E: 9, A: 15, B: 25, C: 37, D: 50 };
  HX.catFamily({
    fam: 'DSUBW', std: 'COM', mfr: 'Amphenol', desc: 'D-Sub misto/potência p/ cabo (Amphenol)', refPfx: 'J',
    variants: [{ v: '', d: 'Caçapa de solda, contatos de potência/coaxiais 8638' }],
    pn: function (e, v, g) { return 'D' + e.shell + e.label + (g === 'P' ? 'P' : 'S') + 'A00LF'; },
    contacts: { '20': { p: '865635206', s: '865635306', awg: [20, 24] }, 'W': { p: '8638PPC1005LF', s: '8638PSC1005LF', awg: [16, 18] } },
    items: Object.keys(LAY).map(function (k) {
      var pts = HX.dsubLayPts(k); return { label: k, shell: LAY[k][0], stdN: SN[LAY[k][0]], lay: k, pins: pts.map(function (q) { return { n: q.n, name: '', sz: q.big ? 'W' : '20' }; }) };
    })
  });
})(typeof window !== 'undefined' ? window : globalThis);
