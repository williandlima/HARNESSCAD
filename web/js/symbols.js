/* HarnessCAD - estilos gráficos de símbolo de conector
   table   = tabela (EPLAN Electric P8 / lista de pinos)
   kicad   = KiCad Connector_Generic (corpo estreito, nº sobre o pino, contato macho/fêmea)
   harness = Siemens Capital / EPLAN Harness (cavidades + símbolo de engate macho/fêmea)
   iec     = IEC 60617 (tomada "(" / plugue "▬")
   Os pinos ficam na MESMA posição em todos os estilos: trocar o estilo não desliga fios. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.CONN_STYLES = [['table', 'Tabela (EPLAN)'], ['kicad', 'KiCad'], ['harness', 'Harness (Capital / EPLAN Harness)'], ['iec', 'IEC 60617']];
  HX.connStyle = function (c, p) { return c.eq ? 'equip' : c.gstyle || (p && p.view && p.view.connStyle) || 'univ'; };

  function arc(cx, cy, r, a0, a1) {
    var pts = []; for (var i = 0; i <= 12; i++) { var a = a0 + (a1 - a0) * i / 12; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  }
  // Terminais e marcador de pino livre (comum a todos os estilos)
  function stubs(g, L, c, sheet, o, x0) {
    var T = o.theme;
    L.pins.forEach(function (pn) {
      var from = pn.side === 'R' ? x0.R : x0.L;
      g.style({ stroke: T.body, lw: 0.25, fill: null }); g.line(from, pn.ly, pn.lx, pn.ly);
      var k = sheet + '|' + HX.key(pn.pt[0], pn.pt[1]);
      if (o.connected && !o.connected.has(k)) { g.style({ stroke: T.open, lw: 0.15 }); g.circle(pn.lx, pn.ly, 0.45); }
    });
  }
  HX.symStubs = stubs;

  // Desenho espelhável: X(x) converte coordenada "lado direito" para o lado real
  function frame(L) {
    var R = L.side !== 'L', w = L.w;
    return { R: R, X: function (x) { return R ? x : w - x; }, A: function (a) { return R ? a : (a === 'l' ? 'r' : a === 'r' ? 'l' : a); } };
  }
  function fit(s, size, maxW) {
    s = String(s || ''); if (HX.textW(s, size) <= maxW) return s;
    while (s.length > 1 && HX.textW(s + '…', size) > maxW) s = s.slice(0, -1);
    return s + '…';
  }

  HX.SYMBOLS = {};

  // ---------- KiCad ----------
  HX.SYMBOLS.kicad = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, bw = 2 * L.u;
    var bx0 = Math.min(X(w - bw), X(w)), male = c.gender === 'P';
    g.style({ stroke: T.body, lw: 0.254, fill: T.bodyFill }); g.rect(bx0, H, bw, L.h - H);
    g.text(c.ref || '?', X(w), H - 4.2, { size: 2.3, align: f.A('r'), color: T.txt, bold: true });
    g.text(fit(HX.connPN(c), 1.4, w), X(w), H - 1.4, { size: 1.4, align: f.A('r'), color: T.txt });
    L.rows.forEach(function (q, i) {
      var y = H + (i + 0.5) * pp, xi = w - bw * 0.62;
      g.style({ stroke: T.body, lw: 0.2, fill: T.body });
      if (male) { g.line(X(w), y, X(xi), y); g.rect(Math.min(X(xi), X(xi + 0.9)), y - 0.32, 0.9, 0.64); }
      else { g.style({ fill: null }); g.line(X(w), y, X(xi + 0.6), y); g.poly(arc(X(xi), y, 0.6, f.R ? -Math.PI / 2 : Math.PI / 2, f.R ? Math.PI / 2 : Math.PI * 1.5), false); }
      g.text(q.n, X(w + L.stub / 2), y - 0.6 - 0.5 * F, { size: 1.8 * F, align: 'c', color: T.pinTxt, bold: true });
      if (p.view.pinNames !== false && q.name) g.text(fit(q.name, 1.8 * F, w - bw - 1.5), X(w - bw - 1), y, { size: 1.8 * F, align: f.A('r'), color: T.txt });
    });
    stubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  // ---------- Siemens Capital / EPLAN Harness ----------
  HX.SYMBOLS.harness = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, cw = 3 * L.u, male = c.gender === 'P';
    var hx0 = w - cw, mx = hx0 - 0.6;
    // carcaça (housing) com face de engate destacada
    g.style({ stroke: T.body, lw: 0.5, fill: T.bodyFill });
    g.rect(Math.min(X(hx0), X(w)), H - 0.8, cw, L.h - H + 1.6);
    g.style({ stroke: T.body, lw: 0.9, fill: null }); g.line(X(hx0), H - 0.8, X(hx0), L.h + 0.8);
    g.text(c.ref || '?', X((hx0 + w) / 2), H - 4.6, { size: 2.1, align: 'c', color: T.txt, bold: true });
    g.text(fit(HX.connPN(c) + (male ? ' (M)' : ' (F)'), 1.3, w + 6), X(w), H - 2, { size: 1.3, align: f.A('r'), color: T.txt });
    L.rows.forEach(function (q, i) {
      var y0 = H + i * pp, y = y0 + pp / 2;
      g.style({ stroke: T.body, lw: 0.15, fill: null }); g.rect(Math.min(X(hx0 + 0.6), X(w - 0.6)), y0 + 0.5, cw - 1.2, pp - 1);
      g.text(q.n, X((hx0 + w) / 2), y, { size: Math.min(2.0 * F, 3.2), align: 'c', color: T.pinTxt, bold: true });
      // símbolo de engate: macho = seta cheia, fêmea = chevron aberto
      g.style({ stroke: T.body, lw: 0.25, fill: male ? T.body : null });
      if (male) g.poly([[X(mx), y - 0.9], [X(mx - 2), y], [X(mx), y + 0.9]], true);
      else g.poly([[X(mx - 1.6), y - 1.1], [X(mx), y], [X(mx - 1.6), y + 1.1]], false);
      if (p.view.pinNames !== false && q.name) g.text(fit(q.name, 1.8 * F, hx0 - 4), X(mx - 2.8), y, { size: 1.8 * F, align: f.A('r'), color: T.txt });
    });
    stubs(g, L, c, sheet, o, { R: w, L: 0 });
  };

  // ---------- IEC 60617 ----------
  HX.SYMBOLS.iec = function (g, c, p, sheet, o, L) {
    var T = o.theme, F = HX.pinK(p), f = frame(L), X = f.X, w = L.w, H = L.H, pp = L.p, male = c.gender === 'P', xs = w - 2 * L.u;
    g.style({ stroke: T.body, lw: 0.2, fill: null, dash: [1, 0.7] });
    g.rect(Math.min(X(xs - 3.2), X(w)), H - 0.5, 2 * L.u + 3.2, L.h - H + 1); g.style({ dash: null });
    g.text(c.ref || '?', X(w), H - 4.2, { size: 2.3, align: f.A('r'), color: T.txt, bold: true });
    g.text(fit(HX.connPN(c), 1.3, w), X(w), H - 1.6, { size: 1.3, align: f.A('r'), color: T.txt });
    L.rows.forEach(function (q, i) {
      var y = H + (i + 0.5) * pp;
      g.style({ stroke: T.body, lw: 0.3, fill: male ? T.body : null });
      g.line(X(w), y, X(xs), y);
      if (male) g.rect(Math.min(X(xs), X(xs - 2.2)), y - 0.35, 2.2, 0.7);
      else g.poly(arc(X(xs - 1.1), y, 1.1, f.R ? -Math.PI / 2 : Math.PI / 2, f.R ? Math.PI / 2 : Math.PI * 1.5), false);
      g.text(q.n, X(w + L.stub / 2), y - 0.6 - 0.5 * F, { size: 1.8 * F, align: 'c', color: T.pinTxt, bold: true });
      if (p.view.pinNames !== false && q.name) g.text(fit(q.name, 1.8 * F, xs - 5), X(xs - 4), y, { size: 1.8 * F, align: f.A('r'), color: T.txt });
    });
    stubs(g, L, c, sheet, o, { R: w, L: 0 });
  };
})(typeof window !== 'undefined' ? window : globalThis);
