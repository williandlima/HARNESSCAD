/* HarnessCAD - estilos Altium Designer e OrCAD Capture
   altium = corpo amarelo com contorno vinho, designador acima, nº do pino sobre o terminal (fora do corpo),
            seta saindo pela face de engate = macho, entrando = fêmea. É o estilo padrão de projeto novo (largura 3)
   orcad  = OrCAD Capture: corpo sem preenchimento, refdes acima à esquerda, valor abaixo,
            nº do pino sobre o terminal e nome do sinal dentro do corpo
   Ambos aceitam pinos nos dois lados (lado B). Pinos na mesma posição: trocar o estilo não desliga fios. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.CONN_STYLES.push(['altium', 'Altium Designer'], ['altium1', 'Altium (símbolo único > <)'], ['orcad', 'OrCAD Capture']);
  HX.SYM_BOTH = HX.SYM_BOTH || {};
  HX.SYM_BOTH.altium = HX.SYM_BOTH.altium1 = HX.SYM_BOTH.orcad = 1;

  function fit(s, size, maxW) {
    s = String(s || ''); if (HX.textW(s, size) <= maxW) return s;
    while (s.length > 1 && HX.textW(s + '…', size) > maxW) s = s.slice(0, -1);
    return s + '…';
  }
  // nome do sinal dentro do corpo, encostado no lado do pino
  function pinName(g, p, pn, w, F, T, both) {
    if (p.view.pinNames === false || !pn.name) return;
    var R = pn.side === 'R', s = 1.8 * F, max = both ? w / 2 - 1.2 : w - 2;
    g.text(fit(pn.name, s, max), R ? w - 1 : 1, pn.ly, { size: s, align: R ? 'r' : 'l', color: T.txt });
  }
  // nº do pino sobre o terminal
  function pinNum(g, pn, w, size, T, mid) {
    var R = pn.side === 'R', e = R ? w : 0, x = mid ? (e + pn.lx) / 2 : e + (R ? 0.5 : -0.5);
    g.text(pn.n, x, pn.ly - 0.45 - size * 0.5, { size: size, align: mid ? 'c' : (R ? 'l' : 'r'), color: T.pinTxt, bold: !mid });
  }

  // símbolo de engate dentro do corpo, do lado da face de engate (oposto aos fios), centralizado na linha do pino:
  // seta saindo pela face = macho (pino), seta entrando = fêmea (soquete). Com fios à direita: macho <, fêmea >
  function chevron(g, x, y, out, sz, col, lw) {
    var h = sz * 0.55, t = x + out * sz;
    g.style({ stroke: col, lw: lw, fill: null, dash: null });
    g.poly([[x, y - h], [t, y], [x, y + h]], false);
  }
  HX.altChevron = chevron;

  // single = uma única seta grande no centro do corpo (saindo = macho, entrando = fêmea), em vez de uma por via
  function altium(g, c, p, sheet, o, L, single) {
    var T = o.theme, F = HX.pinK(p), w = L.w, H = L.H, both = L.side === 'B', male = c.gender === 'P', mono = o.mono;
    var col = mono ? '#000' : '#800000';
    g.style({ stroke: col, lw: 0.35, fill: mono ? null : '#ffffb0', dash: null }); g.rect(0, H, w, L.h - H);
    g.text(c.ref || '?', w / 2, H - 1.3, { size: 2.7, bold: true, align: 'c', color: T.txt });
    var pn0 = HX.connPN(c); if (pn0) g.text(fit(pn0, 1.5, w + 14), w / 2, L.h + 2.1, { size: 1.5, align: 'c', color: T.txt });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
    var ns = Math.min(1.8 * F, 3.1), cz = Math.min(1.5, Math.max(0.9, w * 0.22)), m = Math.min(0.9, w * 0.12);
    if (single) {
      var bh = L.h - H, sd = L.side === 'L' ? -1 : 1, out1 = male ? -sd : sd, z = Math.max(1.2, Math.min(w * 0.5, bh * 0.35, 8));
      chevron(g, w / 2 - out1 * z / 2, H + bh / 2, out1, z, col, 0.5);
    }
    L.pins.forEach(function (pn) {
      var R = pn.side === 'R';
      pinNum(g, pn, w, ns, T, false);
      if (!single && (!both || R)) { // um símbolo por linha
        var d = both ? 1 : (R ? 1 : -1), out = both ? (male ? 1 : -1) : (male ? -d : d);
        var x0 = both ? w / 2 - out * cz / 2 : (R ? m : w - m) + (out === d ? 0 : d * cz);
        chevron(g, x0, pn.ly, out, cz, col, 0.3);
      }
      // nome do sinal só se couber depois do símbolo
      if (!both && !single && p.view.pinNames !== false && pn.name && w - cz - m - 1.4 >= 2.5) {
        var sz = 1.6 * F, x = R ? w - 0.7 : 0.7;
        g.text(fit(pn.name, sz, w - cz - m - 1.4), x, pn.ly, { size: sz, align: R ? 'r' : 'l', color: T.txt });
      }
    });
  }
  HX.SYMBOLS.altium = function (g, c, p, sheet, o, L) { altium(g, c, p, sheet, o, L, false); };
  HX.SYMBOLS.altium1 = function (g, c, p, sheet, o, L) { altium(g, c, p, sheet, o, L, true); };

  HX.SYMBOLS.orcad = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), w = L.w, H = L.H, both = L.side === 'B';
    g.style({ stroke: T.body, lw: 0.3, fill: null, dash: null }); g.rect(0, H, w, L.h - H);
    g.text(c.ref || '?', 0, H - 1.1, { size: 2.3, align: 'l', color: T.txt });
    var val = HX.connPN(c) || ('CON' + (c.pins || []).length);
    g.text(fit(val, 1.8, w + 10), 0, L.h + 2.3, { size: 1.8, align: 'l', color: T.txt });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
    var ns = Math.min(1.6 * F, 2.9);
    L.pins.forEach(function (pn) { pinNum(g, pn, w, ns, T, true); pinName(g, p, pn, w, F, T, both); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
