/* HarnessCAD - estilos de símbolo adicionais
   ansi     = ANSI/IEEE 315 (barra do conector + contato macho seta cheia / fêmea "V")
   mil      = MIL (cada contato num círculo: cheio = pino, vazado = soquete)
   terminal = régua de bornes (EPLAN/IEC 60947-7): um borne com parafuso por via; aceita "passante"
   compact  = compacto (só a coluna de números; ocupa pouco espaço)
   circular = tabela com vista circular miniatura no cabeçalho
   Os pinos continuam na mesma posição: trocar o estilo não desliga fios. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.SYM_BOTH = HX.SYM_BOTH || {}; HX.SYM_BOTH.terminal = 1;
  HX.CONN_STYLES.push(['ansi', 'ANSI / IEEE 315'], ['mil', 'MIL (contato em círculo)'], ['terminal', 'Régua de bornes'], ['compact', 'Compacto (só números)'], ['circular', 'Circular (com vista)']);

  function frame(L) {
    var R = L.side !== 'L', w = L.w;
    return { R: R, X: function (x) { return R ? x : w - x; }, A: function (a) { return R ? a : (a === 'l' ? 'r' : a === 'r' ? 'l' : a); } };
  }
  function fit(s, size, maxW) {
    s = String(s || ''); if (HX.textW(s, size) <= maxW) return s;
    while (s.length > 1 && HX.textW(s + '…', size) > maxW) s = s.slice(0, -1);
    return s + '…';
  }
  function head(g, c, x, y, al, T, w) {
    g.text(c.ref || '?', x, y - 3.2, { size: 2.4, bold: true, align: al, color: T.txt });
    g.text(fit(HX.connPN(c), 1.5, w), x, y - 0.9, { size: 1.5, align: al, color: T.txt });
  }
  function names(g, p, q, x, y, al, F, T, maxW) {
    if (p.view.pinNames !== false && q.name) g.text(fit(q.name, 1.8 * F, maxW), x, y, { size: 1.8 * F, align: al, color: T.txt });
  }

  HX.SYMBOLS.ansi = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, bx = w - 3 * L.u, male = c.gender === 'P';
    head(g, c, X(bx), H, 'c', T, w);
    g.style({ stroke: T.body, lw: 0.6, fill: null, dash: null }); g.line(X(bx), H - 0.3, X(bx), L.h + 0.3);
    L.rows.forEach(function (q, i) {
      var y = H + (i + 0.5) * pp;
      g.style({ stroke: T.body, lw: 0.25, fill: male ? T.body : null }); g.line(X(bx), y, X(w), y);
      if (male) g.poly([[X(bx - 0.4), y - 0.85], [X(bx - 2.4), y], [X(bx - 0.4), y + 0.85]], true);
      else g.poly([[X(bx - 2.2), y - 1.1], [X(bx - 0.5), y], [X(bx - 2.2), y + 1.1]], false);
      g.text(q.n, X((bx + w) / 2), y - 0.55 - 0.5 * F, { size: 1.8 * F, bold: true, align: 'c', color: T.pinTxt });
      names(g, p, q, X(bx - 3), y, f.A('r'), F, T, bx - 4);
    });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  HX.SYMBOLS.mil = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, male = c.gender === 'P', cx = w - 1.9 * L.u;
    g.style({ stroke: T.body, lw: 0.35, fill: T.bodyFill, dash: null }); g.rect(0, H - 0.4, w, L.h - H + 0.8);
    head(g, c, X(0), H - 0.4, f.A('l'), T, w);
    L.rows.forEach(function (q, i) {
      var y = H + (i + 0.5) * pp, r = pp * 0.42;
      g.style({ stroke: T.body, lw: 0.2, fill: male ? (o.mono ? null : '#f2c9c3') : (o.mono ? null : '#ffffff') }); g.circle(X(cx), y, r);
      if (male && !o.mono) { g.style({ fill: T.body, stroke: null }); g.circle(X(cx), y, r * 0.22); }
      g.text(q.n, X(cx) + (male ? 0 : 0), y, { size: Math.min(1.75 * F, r * 1.5), bold: true, align: 'c', color: T.pinTxt });
      names(g, p, q, X(cx - r - 1), y, f.A('r'), F, T, cx - r - 2);
    });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  HX.SYMBOLS.terminal = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), w = L.w, H = L.H, pp = L.p, both = L.side === 'B', f = frame(L), X = f.X;
    var cw = both ? w : Math.min(w, 4.4 * L.u), x0 = both ? 0 : w - cw;
    g.text('-' + (c.ref || '?'), both ? w / 2 : X(x0 + cw / 2), H - 3.2, { size: 2.4, bold: true, align: 'c', color: T.txt });
    g.text(fit(HX.connPN(c), 1.4, w), both ? w / 2 : X(x0 + cw / 2), H - 0.9, { size: 1.4, align: 'c', color: T.txt });
    L.rows.forEach(function (q, i) {
      var y0 = H + i * pp, y = y0 + pp / 2, sx = [both ? 1.35 : x0 + cw - 1.35];
      if (both) sx.push(w - 1.35);
      g.style({ stroke: T.body, lw: 0.25, fill: o.mono ? null : '#eef1f4', dash: null });
      g.rect(Math.min(X(x0), X(x0 + cw)), y0, cw, pp);
      sx.forEach(function (s) {
        g.style({ stroke: T.body, lw: 0.18, fill: o.mono ? null : '#ffffff' }); g.circle(both ? s : X(s), y, 0.95);
        g.line((both ? s : X(s)) - 0.6, y + 0.6, (both ? s : X(s)) + 0.6, y - 0.6);
      });
      g.text(q.n, both ? w / 2 : X(x0 + (cw - 2.7) / 2), y, { size: Math.min(1.9 * F, 3.2), bold: true, align: 'c', color: T.pinTxt });
      if (!both) names(g, p, q, X(x0 - 1), y, f.A('r'), F, T, x0 - 1.5);
    });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  HX.SYMBOLS.compact = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, bw = 2.6 * L.u, x0 = w - bw;
    g.style({ stroke: T.body, lw: 0.3, fill: T.bodyFill, dash: null }); g.rect(Math.min(X(x0), X(w)), H, bw, L.h - H);
    g.text(c.ref || '?', X(x0 + bw / 2), H - 2.6, { size: 2.3, bold: true, align: 'c', color: T.txt });
    L.rows.forEach(function (q, i) {
      var y = H + (i + 0.5) * pp;
      if (i) { g.style({ stroke: '#d8c9a0', lw: 0.1 }); g.line(Math.min(X(x0), X(w)), H + i * pp, Math.max(X(x0), X(w)), H + i * pp); }
      g.text(q.n, X(x0 + bw / 2), y, { size: Math.min(2.0 * F, 3.3), bold: true, align: 'c', color: T.pinTxt });
      names(g, p, q, X(x0 - 0.8), y, f.A('r'), F, T, x0 - 1);
    });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  HX.SYMBOLS.circular = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, nc = Math.max(3 * L.u, 7);
    g.style({ stroke: T.body, lw: 0.3, fill: T.bodyFill, dash: null }); g.rect(0, 0, w, L.h);
    if (T.header) { g.style({ fill: T.header, stroke: null }); g.rect(0.15, 0.15, w - 0.3, H - 0.3); }
    g.style({ stroke: T.body, lw: 0.3, fill: null }); g.line(0, H, w, H);
    // vista circular miniatura (ilustrativa)
    var cx = X(4.2), cy = H / 2, R = Math.min(3.6, H / 2 - 0.7), n = Math.min(c.pins.length, 37);
    g.style({ stroke: T.body, lw: 0.25, fill: o.mono ? null : '#ffffff' }); g.circle(cx, cy, R);
    g.style({ fill: T.body, stroke: null }); g.rect(cx - 0.35, cy - R - 0.1, 0.7, 0.6);
    for (var k = 0, ring = 0, left = n; left > 0; ring++) {
      var rr = ring === 0 ? R * 0.68 : ring === 1 ? R * 0.36 : 0, cap = rr ? Math.max(1, Math.floor(2 * Math.PI * rr / 0.75)) : 1, m = Math.min(cap, left);
      for (var j = 0; j < m; j++, k++) { var a = -Math.PI / 2 + 2 * Math.PI * j / m; g.circle(cx + rr * Math.cos(a), cy + rr * Math.sin(a), Math.min(0.32, R * 0.09)); }
      left -= m; if (!rr) break;
    }
    var tx = f.R ? 8.6 : w - 8.6;
    g.text(c.ref || '?', tx, cy - 1.1, { size: 2.4, bold: true, align: f.A('l'), color: T.txt });
    g.text(fit(HX.connPN(c), 1.4, w - 9.5), tx, cy + 1.6, { size: 1.4, align: f.A('l'), color: T.txt });
    L.rows.forEach(function (q, i) {
      var y0 = H + i * pp, yc = y0 + pp / 2;
      if (i) { g.style({ stroke: o.mono ? '#000' : '#d8c9a0', lw: 0.1 }); g.line(0, y0, w, y0); }
      g.style({ stroke: T.body, lw: 0.15 }); g.line(X(w - nc), y0, X(w - nc), y0 + pp);
      g.text(q.n, X(w - nc / 2), yc, { size: Math.min(2.1 * F, 3.5), bold: true, align: 'c', color: T.pinTxt });
      names(g, p, q, X(1), yc, f.A('l'), F, T, w - nc - 2);
    });
    HX.symStubs(g, L, c, sheet, o, { R: w, L: 0 });
  };
})(typeof window !== 'undefined' ? window : globalThis);
