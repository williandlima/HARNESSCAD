/* HarnessCAD - símbolos de cabo no esquema (padrão de desenho de chicote):
   (1) PAR TRANÇADO: um "8" cruzando os fios do mesmo grupo (Trança = TP1...), com o nome do grupo ao lado;
       em fios que não correm lado a lado volta à marca antiga em cada fio. Exibir › "Par trançado" troca 8/senoide.
   (2) BLINDAGEM: oval tracejado em volta dos fios, ponto cheio embaixo e o FIO DE DRENO saindo dele; a ponta do
       dreno é um ponto de ligação de verdade (CB1:SH na lista de fios) — desenhe um fio dali até o pino de carcaça.
       Opções do cabo: Dreno = ponto de ligação | símbolo de terra | nenhum; posição do dreno ao longo do oval. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function near(P, q) { // ponto mais próximo de q numa polilinha
    var best = null, bd = 1e9;
    for (var i = 1; i < P.length; i++) {
      var a = P[i - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2)) : 0;
      var x = a[0] + dx * t, y = a[1] + dy * t, d = Math.hypot(x - q[0], y - q[1]); if (d < bd) { bd = d; best = [x, y]; }
    }
    return best;
  }
  // geometria do "8": devolve {c, d, n, a, b} ou null se os fios não correm lado a lado
  HX.twistGeom = function (ws) {
    if (!ws || ws.length < 2 || !HX.polyAt) return null;
    var q = HX.polyAt(ws[0].pts, 0.25), d = q.d.slice(); if (d[0] < -1e-6 || (Math.abs(d[0]) < 1e-6 && d[1] < 0)) d = [-d[0], -d[1]];
    var n = [-d[1], d[0]], offs = [0];
    for (var i = 1; i < ws.length; i++) {
      var p = near(ws[i].pts, q.pt); if (!p) return null; var vx = p[0] - q.pt[0], vy = p[1] - q.pt[1];
      if (Math.abs(vx * d[0] + vy * d[1]) > 1.5 || Math.hypot(vx, vy) > 15) return null; offs.push(vx * n[0] + vy * n[1]);
    }
    var lo = Math.min.apply(0, offs), hi = Math.max.apply(0, offs); if (hi - lo < 0.5) return null;
    return { c: [q.pt[0] + n[0] * (lo + hi) / 2, q.pt[1] + n[1] * (lo + hi) / 2], d: d, n: n, a: 1.5, b: (hi - lo) / 2 + 1.5 };
  };
  HX.twistGroupMark = function (g, ws, col, name) {
    var T = HX.twistGeom(ws); if (!T) return false;
    var P = []; for (var i = 0; i <= 48; i++) { var t = i / 48 * 2 * Math.PI; P.push([T.a * Math.sin(2 * t), T.b * Math.sin(t)]); }
    g.push([T.d[0], T.d[1], T.n[0], T.n[1], T.c[0], T.c[1]]); g.style({ stroke: col, lw: 0.25, fill: null, dash: null }); g.poly(P, true);
    if (name) g.text(name, T.a + 0.8, -T.b + 0.6, { size: 1.4, align: 'l', bold: true, color: col });
    g.pop(); return true;
  };
  function ell(cx, cy, rx, ry) { var P = []; for (var i = 0; i < 48; i++) { var a = i / 48 * 2 * Math.PI; P.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return P; }
  // ELIPSE alongada no sentido do maior lado (atravessa os fios): eixo menor no máx. 40% do maior
  HX.cableAxes = function (c) { var rx = c.w / 2, ry = c.h / 2; if (ry >= rx) rx = Math.min(rx, Math.max(1.5, ry * 0.4)); else ry = Math.min(ry, Math.max(1.5, rx * 0.4)); return [rx, ry]; };
  // ajusta o cabo aos fios que ele atravessa: dois fios ou o chicote todo, com folga de 2,5 mm
  HX.cableFit = function (c, sh) {
    var cx = c.x + c.w / 2, cy = c.y + c.h / 2, H = [], V = [];
    sh.items.forEach(function (w) { if (w.type !== 'wire') return; for (var i = 1; i < w.pts.length; i++) { var a = w.pts[i - 1], b = w.pts[i];
      if (Math.abs(a[1] - b[1]) < 1e-6 && Math.min(a[0], b[0]) <= cx && Math.max(a[0], b[0]) >= cx && a[1] >= c.y - 1 && a[1] <= c.y + c.h + 1) H.push(a[1]);
      if (Math.abs(a[0] - b[0]) < 1e-6 && Math.min(a[1], b[1]) <= cy && Math.max(a[1], b[1]) >= cy && a[0] >= c.x - 1 && a[0] <= c.x + c.w + 1) V.push(a[0]); } });
    var vert = H.length >= V.length, hits = vert ? H : V; // fios na horizontal → elipse em pé
    if (!hits.length) return 0;
    var lo = Math.min.apply(0, hits) - 2.5, hi = Math.max.apply(0, hits) + 2.5, L = hi - lo, m = Math.max(4, Math.min(10, L * 0.35)), cc = Math.round((vert ? cx : cy) / 2.5) * 2.5;
    if (vert) { c.y = lo; c.h = L; c.w = m; c.x = cc - m / 2; } else { c.x = lo; c.w = L; c.h = m; c.y = cc - m / 2; }
    return hits.length;
  };
  HX.drawCable = function (g, c, o) {
    var T = o.theme, cx = c.x + c.w / 2, cy = c.y + c.h / 2, ax = HX.cableAxes(c), rx = ax[0], ry = ax[1];
    g.style({ stroke: T.cable, lw: 0.25, fill: null, dash: c.shield ? [1.2, 0.8] : null }); g.poly(ell(cx, cy, rx, ry), true); g.style({ dash: null });
    if (c.showRef !== 'off') g.text((c.refTxt || c.ref) + (c.part && c.showRef !== 'ref' ? ' ' + c.part : ''), cx, cy - ry - 1.2, { size: 1.7, align: 'c', color: T.cable, bold: true });
    if (!c.shield || c.drain === 'none') return;
    var dp = HX.cableDrainPt(c), x = dp ? Math.max(cx - rx * 0.8, Math.min(cx + rx * 0.8, dp[0])) : cx, k = (x - cx) / (rx || 1), ye = cy + ry * Math.sqrt(Math.max(0, 1 - k * k));
    g.style({ stroke: T.cable, lw: 0.25, fill: T.cable }); g.circle(x, ye, 0.55); g.style({ fill: null });
    if (dp) { g.line(x, ye, x, dp[1]); if (dp[0] !== x) g.line(x, dp[1], dp[0], dp[1]); return; }
     var yb = cy + ry; g.line(cx, yb, cx, yb + 2.5); g.line(cx - 1.5, yb + 2.5, cx + 1.5, yb + 2.5); // símbolo de terra
    g.line(cx - 1, yb + 3.1, cx + 1, yb + 3.1); g.line(cx - 0.4, yb + 3.7, cx + 0.4, yb + 3.7);
  };
  var UI = HX.UI; if (!UI) return;
  var F = [{ type: 'head', l: 'Blindagem' }, { k: 'showRef', l: 'Identificação', type: 'select', opts: [['', 'Com identificação (ref + PN)'], ['ref', 'Só a referência'], ['off', 'Sem identificação']] },
    { k: 'refTxt', l: 'Texto da identificação', tip: 'Vazio = referência (CB1). Ex.: BLINDAGEM, SH1' }, { k: 'drain', l: 'Dreno', type: 'select', opts: [['', 'Ponto de ligação (fio de dreno)'], ['gnd', 'Símbolo de terra'], ['none', 'Nenhum']] },
    { k: 'ddx', l: 'Posição do dreno (mm)', type: 'number', step: 2.5, tip: 'Distância a partir da borda esquerda do oval; vazio = meio' }];
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Par trançado: símbolo 8 / senoide', function () { var v = app.doc.p.view; app.doc.change('Símbolo do par trançado', function () { v.twistSym = v.twistSym === 'sine' ? '' : 'sine'; }); UI.toast('Par trançado: ' + (v.twistSym === 'sine' ? 'senoide em cada fio' : 'símbolo 8')); }, '']; }]);
  HX.MENU_EXTRA.push(['Exibir', function (app) { return ['Par trançado: com / sem identificação (TP1)', function () { var v = app.doc.p.view; app.doc.change('Identificação do par', function () { v.twistName = v.twistName === false ? true : false; }); UI.toast('Par trançado ' + (v.twistName === false ? 'sem' : 'com') + ' identificação'); }, '']; }]);
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = ex0(it, app); return it.type === 'cable' && it.shield ? h + UI.form(F, it) + '<div class="row"><button id="cbFit" style="flex:1">Ajustar elipse aos fios</button></div><p class="muted">Desenhe um fio da ponta do dreno até o pino de carcaça: na lista sai como <b>' + HX.esc(it.ref) + ':SH</b>.</p>' : h; };
  UI.propsBind = function (it, app, root, set) { bd0(it, app, root, set); if (it.type !== 'cable' || !it.shield) return; UI.bindForm(F.filter(function (f) { return f.k; }), root, it, function (k, v) { set(it, k, v); });
    var b = UI.$('#cbFit', root); if (b) b.onclick = function () { var n = 0; app.doc.change('Ajustar elipse', function () { n = HX.cableFit(it, app.doc.cur()); }); UI.toast(n ? 'Elipse ajustada a ' + n + ' fio(s)' : 'Nenhum fio atravessa o cabo', !n); }; };
})(typeof window !== 'undefined' ? window : globalThis);
