/* HarnessCAD - estilo UNIVERSAL (lado arredondado), TOTALMENTE CUSTOMIZÁVEL: serve para MIL e demais padrões,
   contatos com letras ou números. Cantos ARREDONDADOS do lado das vias, lado oposto RETO (face de engate).
   Gênero: macho = chevron com a ponta na face apontando para fora ">"; fêmea = aberto para a face "<" (vias à esq.).
   Personalização por conector (u*), com padrão do projeto em p.view.univ: preenchimento (amarelo, branco, sem, cor
   livre), cor/espessura do contorno, raio dos cantos, chevron (posição/tamanho/oculto), letras ou números nos
   contatos, aterramento embaixo (terra, chassi/carcaça, blindagem) com texto, mostrar PN/sinais, posição da referência. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.CONN_STYLES.unshift(['univ', 'Padrão (lado arredondado, > macho / < fêmea)']);
  HX.UNIV_KEYS = ['uFill', 'uFillC', 'uLine', 'uLineC', 'uLw', 'uR', 'uChev', 'uChevSz', 'uPinSz', 'uPinC', 'uNames', 'uNumPos', 'uNameSz', 'uNameSt', 'uNameC', 'uPN', 'uRefPos', 'uGnd', 'uGndPos', 'uGndTxt'];
  HX.univGet = function (c, p, k) { var v = c[k]; if (v === undefined || v === null || v === '') v = ((p && p.view && p.view.univ) || {})[k]; return v === undefined || v === null ? '' : v; };
  function hex(v) { return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(v || '').trim()) ? String(v).trim() : ''; }
  function fit(s, size, maxW) {
    s = String(s || ''); if (HX.textW(s, size) <= maxW) return s;
    while (s.length > 1 && HX.textW(s + '…', size) > maxW) s = s.slice(0, -1);
    return s + '…';
  }
  // letras no padrão MIL (sem I, O, Q; minúsculas sem i, l, o, q; depois AA, BB...)
  var UP = 'ABCDEFGHJKLMNPRSTUVWXYZ', LO = 'abcdefghjkmnprstuvwxyz';
  HX.univLetter = function (i) { if (i < UP.length) return UP[i]; i -= UP.length; if (i < LO.length) return LO[i]; i -= LO.length; var ch = UP[i % UP.length], k = Math.floor(i / UP.length); return ch + ch + (k ? String(k + 1) : ''); };
  HX.univRelabel = function (c, mode) { // troca a identificação dos contatos; 'num' | 'let' | '' (volta ao catálogo)
    (c.pins || []).forEach(function (pn, i) {
      if (pn.n0 === undefined) pn.n0 = pn.n;
      pn.n = mode === 'num' ? String(i + 1) : mode === 'let' ? HX.univLetter(i) : pn.n0;
    });
    c.uIds = mode || '';
  };
  HX.univOutline = function (w, y0, y1, pinsRight, r) {
    var P = [], n = 6, xp = pinsRight ? w : 0, xs = pinsRight ? 0 : w, d = pinsRight ? -1 : 1, i, a;
    P.push([xs, y0]);
    for (i = 0; i <= n; i++) { a = Math.PI / 2 * i / n; P.push([xp + d * r * (1 - Math.sin(a)), y0 + r * (1 - Math.cos(a))]); }
    for (i = 0; i <= n; i++) { a = Math.PI / 2 * i / n; P.push([xp + d * r * (1 - Math.cos(a)), y1 - r * (1 - Math.sin(a))]); }
    P.push([xs, y1]);
    return P;
  };
  HX.univChevron = function (w, yc, z, pinsRight, male) {
    var xs = pinsRight ? 0 : w, d = pinsRight ? 1 : -1, h = z * 0.55, xv, xl;
    if (male) { xv = xs; xl = xs + d * z; } else { xl = xs; xv = xs + d * z; }
    return [[xl, yc - h], [xv, yc], [xl, yc + h]];
  };
  HX.univGround = function (g, x, y, kind, col, txt, T) { // aterramento embaixo do corpo; devolve o y livre abaixo
    g.style({ stroke: col, lw: 0.35, fill: null, dash: null }); g.line(x, y, x, y + 2.2); var b = y + 2.2;
    if (kind === 'chassis') { g.line(x - 1.6, b, x + 1.6, b); [-1.6, 0, 1.6].forEach(function (dx) { g.line(x + dx, b, x + dx - 0.8, b + 1.1); }); }
    else { g.line(x - 1.6, b, x + 1.6, b); g.line(x - 1, b + 0.6, x + 1, b + 0.6); g.line(x - 0.4, b + 1.2, x + 0.4, b + 1.2);
      if (kind === 'shield') { g.style({ dash: [0.6, 0.4] }); g.circle(x, b + 0.4, 2.3); g.style({ dash: null }); } }
    if (txt) g.text(txt, x + 2.8, b + 0.5, { size: 1.6, align: 'l', color: T.txt });
    return b + (kind === 'shield' ? 2.8 : 1.4);
  };
  HX.SYMBOLS.univ = function (g, c, p, sheet, o, L) {
    var U = function (k) { return HX.univGet(c, p, k); };
    var T = o.theme, F = HX.pinK(p), w = L.w, H = L.H, h = L.h, bh = h - H, R = L.side !== 'L', male = c.gender === 'P';
    var col = o.mono ? '#000' : (hex(U('uLineC')) || hex(U('uLine')) || '#000'), lw = +U('uLw') > 0 ? +U('uLw') : 0.4;
    var fv = hex(U('uFillC')) || U('uFill'), fill = o.mono || !fv || fv === 'none' ? null : (hex(fv) || T.bodyFill || null); /* padrão: sem preenchimento, traço preto */
    var TX = 2.5 * F / 1.15; /* textos de 2,5 mm (cresce com Exibir › Texto dos pinos) */
    var r = U('uR') !== '' && +U('uR') >= 0 ? Math.min(+U('uR'), w, bh / 2) : Math.max(0.6, Math.min(w * 0.35, 3, bh / 2));
    g.style({ stroke: col, lw: lw, fill: fill, dash: null }); g.poly(HX.univOutline(w, H, h, R, r), true); g.style({ fill: null });
    var below = U('uRefPos') === 'below', gk = U('uGnd') === 'none' ? '' : U('uGnd'), yb = h + 2.1;
    if (gk) { var gp = U('uGndPos'), gx = gp === 'pins' ? (R ? w - Math.max(r, 1.5) : Math.max(r, 1.5)) : gp === 'face' ? (R ? 0 : w) : w / 2; yb = HX.univGround(g, gx, h, gk, col, U('uGndTxt'), T) + 2; }
    g.text(c.ref || '?', w / 2, below ? yb + 0.6 : H - 1.3, { size: TX, bold: true, align: 'c', color: o.mono ? '#000' : col }); if (below) yb += 3.2;
    var pn0 = HX.connPN(c); if (pn0 && U('uPN') !== 'off') g.text(fit(pn0, TX, w + 30), w / 2, yb + TX * 0.3, { size: TX, align: 'c', color: o.mono ? '#000' : col });
    var o2 = Object.create(o); o2.theme = Object.create(T); o2.theme.body = col; o2.theme.open = col; HX.symStubs(g, L, c, sheet, o2, { R: w, L: 0 });
    var cm = U('uChev'), z = +U('uChevSz') > 0 ? +U('uChevSz') : Math.max(1, Math.min(w * 0.4, bh * 0.3, 5));
    if (cm !== 'off') { var yc = cm === 'top' ? H + Math.max(z, r + z * 0.6) : cm === 'bottom' ? h - Math.max(z, r + z * 0.6) : H + bh / 2;
      g.style({ stroke: col, lw: Math.max(lw, 0.5), fill: null, dash: null }); g.poly(HX.univChevron(w, yc, z, R, male), false); }
    var pq = U('uPinC'), pc = o.mono ? '#000' : pq === 'line' || !pq ? col : (hex(pq) || T.pinTxt), ns = +U('uPinSz') > 0 ? +U('uPinSz') : TX;
    /* padrão: número/letra DENTRO do corpo (junto ao lado das vias) e nome da via FORA, do outro lado (face reta), na linha do pino;
       uNumPos 'out' = arranjo antigo (número fora, nome dentro) */
    var inside = U('uNumPos') !== 'out', shown = p.view.pinNames !== false && U('uNames') !== 'off', sz = +U('uNameSz') > 0 ? +U('uNameSz') : TX;
    /* formatação do nome dos sinais: tamanho, estilo (negrito/itálico) e cor */
    var nst = String(U('uNameSt')), nf = { size: sz, color: o.mono ? '#000' : (U('uNameC') === 'line' || !U('uNameC') ? col : hex(U('uNameC')) || T.txt), bold: /b/.test(nst), italic: /i/.test(nst) };
    function nopt(al) { return { size: nf.size, color: nf.color, bold: nf.bold, italic: nf.italic, align: al }; }
    L.pins.forEach(function (pn) {
      var pr = pn.side === 'R', e = pr ? w : 0, room = w - (cm === 'off' ? 0 : z) - 2;
      if (inside) { g.text(pn.n, pr ? w - 0.7 : 0.7, pn.ly, { size: ns, align: pr ? 'r' : 'l', color: pc, bold: true });
        if (shown && pn.name) { if (L.side === 'R' || L.side === 'L') g.text(fit(pn.name, sz, 30), pr ? -0.8 : w + 0.8, pn.ly, nopt(pr ? 'r' : 'l')); /* do outro lado, por fora da face reta, na linha do pino */
          else g.text(fit(pn.name, sz, 22), e + (pr ? 0.5 : -0.5), pn.ly - 0.45 - sz * 0.5, nopt(pr ? 'l' : 'r')); } return; }
      g.text(pn.n, e + (pr ? 0.5 : -0.5), pn.ly - 0.45 - ns * 0.5, { size: ns, align: pr ? 'l' : 'r', color: pc, bold: true });
      if (shown && pn.name && room >= 2.5) g.text(fit(pn.name, sz, room), pr ? w - 0.8 : 0.8, pn.ly, nopt(pr ? 'r' : 'l'));
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
