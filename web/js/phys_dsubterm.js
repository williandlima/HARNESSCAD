/* HarnessCAD - D-Sub sem capa no desenho técnico: LIGAÇÃO REAL FIO A FIO NOS CONTATOS.
   Cada fio vai ao seu contato (pino do esquemático): condutor decapado dentro da caçapa com filete de solda,
   0,6 mm de cobre aparente, isolação na cor do fio e luva termo-retrátil sobre a caçapa (solda); na versão crimp a
   isolação entra direto na cavidade do corpo. Os fios saem paralelos da fileira e fazem uma curva suave até a posição
   que ocupam no ramo (com capa: ordenados pela posição do contato, sem cruzar; sem capa: casando com os fios soltos).
   Fileira de trás também desenhada (caçapas entre as da frente). Nó: dsSleeve 'off' tira as luvas. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function span(D) { var xs = D.pts.map(function (q) { return q.x; }); return xs.length ? Math.max.apply(0, xs) - Math.min.apply(0, xs) : 0; }
  // comprimento do leque de terminação no papel; devolve o recuo do conector além do leque padrão
  // (o conector fica com as pontas dos contatos no nó: a cota de comprimento continua medindo até a traseira do conector)
  HX.physDsubTermLen = function (M, s) { var F = HX.PHYS_FAN || 7; return Math.max(F, Math.min(18, span(M.D) * s * 0.5 + 4.5 * s)); };
  function geo(N, C) { var c = C.S[N.of], M = HX.dsubSide(c, N), k = HX.physConnK(C.sh, Math.max(M.total, M.D.A), C.N, C.line), s = k / C.N; return { c: c, M: M, s: s }; }
  HX.physDsubTermAt = function (N, C) { if (!HX.physDsubExposed || !HX.physDsubExposed(N, C)) return 0; var q = geo(N, C); return HX.physDsubTermLen(q.M, q.s); };
  HX.physConnTrim = function (N, C) { return HX.physDsubTermAt(N, C) || HX.PHYS_FAN; };
  // posição lateral (na normal n do ramo) do contato do fio w no conector N — ordena os fios soltos pela fileira
  HX.physPinLat = function (N, w, n, C, BU) {
    if (!HX.physDsubTermAt(N, C)) return null; var q = geo(N, C), pin = BU.pin && BU.pin[N.id] && BU.pin[N.id][w.id], p = q.M.D.pts.filter(function (t) { return String(t.n) === pin; })[0]; if (!p) return null;
    var r = HX.physAngle(N, C.sh.items) * Math.PI / 180, fl = N.flip ? -1 : 1, y = (q.M.sock ? -1 : 1) * p.x * q.s; return (-Math.sin(r) * fl * n[0] + Math.cos(r) * fl * n[1]) * y;
  };
  function bez(a, c1, c2, b) { var o = []; for (var i = 0; i <= 14; i++) { var t = i / 14, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } return o; }
  HX.physDsubTerm = function (g, it, c, C, BU, M, s, F, fl, sg, col) {
    var D = M.D, dx = 0, ws = (BU.node[it.id] || []).slice(), pins = BU.pin && BU.pin[it.id] || {}, line = C.line, sh = C.sh;
    var xr = -M.rear * s - dx, u = function (v) { return xr + v * s; }, met = line ? '#fff' : '#cfd3d8', cu = line ? col : '#c47a3a';
    var sm = D.pts.filter(function (q) { return !q.big; }), y0 = Math.min.apply(0, sm.length ? sm.map(function (q) { return q.y; }) : [0]);
    if (M.kind !== 'crimp') sm.filter(function (q) { return Math.abs(q.y - y0) >= 0.01; }).forEach(function (q) { // caçapas da fileira de trás
      var y = (M.sock ? -1 : 1) * q.x * s, w = 1.5 * s; g.style({ stroke: col, lw: 0.12, fill: met, dash: null }); g.rect(u(5.25), y - w / 2, 2.5 * s, w); g.style({ fill: null }); g.line(u(6.4), y - w / 2, u(6.4), y + w / 2);
    });
    var P = {}; D.pts.forEach(function (q) { P[q.n] = q; });
    var info = ws.map(function (w) { var q = P[pins[w.id]] || null, tip = M.kind === 'power' && q && !q.big ? u(7.75) : u(M.rear); return { w: w, q: q, y: q ? (M.sock ? -1 : 1) * q.x * s : 0, xt: tip }; });
    var loose = sg && HX.physLooseOf(sg, sh), n = info.length, pitch = HX.physWirePitch(sh, BU), bw = HX.bundleW(sg && BU.seg[sg.id] ? BU.seg[sg.id].od : 0);
    if (loose) { var ord = HX.physLooseOrder(sg, sh, C, BU), sgn = (sg.a === it.id ? 1 : -1) * fl, m = ord.length; info.forEach(function (o) { var i = ord.indexOf(o.w); o.yd = i < 0 ? 0 : sgn * (i - (m - 1) / 2) * pitch; }); }
    else info.slice().sort(function (a, b) { return a.y - b.y; }).forEach(function (o, i) { o.yd = n > 1 ? -bw * 0.375 + i * bw * 0.75 / (n - 1) : 0; });
    var solder = M.kind !== 'crimp', sleeve = solder && it.dsSleeve !== 'off';
    info.forEach(function (o) {
      var lw = loose ? HX.physWireLW(sh, BU) : Math.max(0.22, Math.min(HX.wireOD(o.w) * s, 2.77 * s * 0.45)), big = o.q && o.q.big, gap = solder ? 0.6 * s : 0;
      var xa = o.xt + gap, xs = o.xt + (big ? 6 : 4.5) * s, xm = (xs + F) / 2, y = o.y;
      if (solder) { // condutor decapado na caçapa + filete de solda
        g.style({ stroke: cu, lw: lw * 0.45, dash: null }); g.line(o.xt - 1.6 * s, y, xa, y);
        g.style({ stroke: col, lw: 0.06, fill: line ? '#fff' : '#c9ccd0' }); g.poly([[o.xt - 0.25 * s, y - 0.7 * s], [o.xt + 0.35 * s, y - lw * 0.3], [o.xt + 0.35 * s, y + lw * 0.3], [o.xt - 0.25 * s, y + 0.7 * s]], true); g.style({ fill: null });
      }
      var Q = [[xa, y], [xs, y]].concat(bez([xs, y], [xm, y], [xm, o.yd], [F, o.yd]).slice(1));
      g.style({ stroke: '#111111', lw: lw + 0.06, fill: null }); g.poly(Q, false); g.style({ stroke: HX.wireHex(o.w), lw: lw }); g.poly(Q, false);
    });
    if (sleeve) info.forEach(function (o) { // luva termo-retrátil sobre caçapa + início da isolação
      if (!o.q) return; var big = o.q.big, w = Math.max(big ? 3.4 * s : 1.9 * s, 0.4), x0 = o.xt - (big ? 4 : 2.6) * s, L = (big ? 7.5 : 5.6) * s;
      g.style({ stroke: col, lw: 0.08, fill: line ? null : 'rgba(235,235,235,0.55)', dash: null }); g.rect(x0, o.y - w / 2, L, w); g.style({ fill: null });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
