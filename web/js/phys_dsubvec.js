/* HarnessCAD - desenho físico: D-SUB EM DESENHO TÉCNICO (vista de cima), pelo datasheet Amphenol D-Sub Cable
   Connectors (DIN 41652 / MIL-C-24308): flange A × furação B (Ø3,10), carcaça D frontal, profundidade máx. A
   (crimpagem 8656: pino 17,19/17,35, soquete 17,44; solda: 7,75 máx. atrás do flange), contatos/caçapas atrás do
   isolador, opções de fixação (L/O inserto roscado, V parafuso fêmea sextavado 4-40) e capa (backshell) com
   parafusos de travamento (medida típica da capa — confira no catálogo da capa). Cotas só na consulta (ui_conndims.js), nunca na cablagem.
   Nó: dsTerm '' (pelo catálogo) | 'solder' | 'crimp', dsLock '' | 'L' | 'O' | 'V', dsHood '' (pela imagem) | 'none' | 'hood'. */
(function (G) {
  'use strict';
  var HX = G.HX, D2R = Math.PI / 180;
  var AMAX = { 9: [17.19, 17.44], 15: [17.19, 17.44], 25: [17.35, 17.44], 37: [17.35, 17.44], 50: [17.35, 17.44] };
  var HOOD = { E: 31, A: 33, B: 35, C: 38, D: 38 };
  HX.dsubSide = function (c, nd) { // medidas reais (mm) da vista lateral, como nas figuras do datasheet
    var D = HX.dsubGeom(c), n = (c.pins || []).length, sock = c.gender === 'S', d = HX.CAT.conns[c.part] || {};
    var crimp = nd.dsTerm === 'crimp' || (!nd.dsTerm && d.fam === 'DSUBC' && c.variant === '8656'), kind = D.mixed ? 'power' : crimp ? 'crimp' : 'solder';
    var am = (AMAX[n] || [17.35, 17.44])[sock ? 1 : 0], fs = sock ? 5.9 : 6.0, tf = 1.0;
    var rear = kind === 'power' ? 15.7 : kind === 'crimp' ? am - fs - tf : 7.75;
    var hood = nd.dsHood === 'hood' || (nd.dsHood !== 'none' && /bs/.test(nd.sprite || 'dsub_bs')), Lh = hood ? (HOOD[D.shell] || 35) : 0;
    return { D: D, S: D.top + 0.3, fs: fs, tf: tf, rear: rear, am: am, hood: hood, Lh: Lh, total: fs + tf + Math.max(rear, Lh), crimp: kind === 'crimp', kind: kind, pcrimp: crimp, sock: sock };
  };
  function R(g, x, y, w, h, col, f, lw) { g.style({ stroke: col, lw: lw || 0.22, fill: f, dash: null }); g.rect(x, y, w, h); g.style({ fill: null }); }
  function L(g, a, b, c, d, col, lw, dash) { g.style({ stroke: col, lw: lw || 0.12, dash: dash || null }); g.line(a, b, c, d); g.style({ dash: null }); }
  function P(g, pts, col, f, lw) { g.style({ stroke: col, lw: lw || 0.22, fill: f, dash: null }); g.poly(pts, true); g.style({ fill: null }); }
  // caixa com cantos arredondados só do lado xa (o lado "livre"); x de xa a xb, y de -w/2 a w/2
  function rbox(xa, xb, w, r) { var o = [], sg = xb > xa ? 1 : -1, i, t; o.push([xb, -w / 2]);
    for (i = 0; i <= 5; i++) { t = i / 5 * Math.PI / 2; o.push([xa + sg * r * (1 - Math.sin(t)), -w / 2 + r * (1 - Math.cos(t))]); }
    for (i = 0; i <= 5; i++) { t = i / 5 * Math.PI / 2; o.push([xa + sg * r * (1 - Math.cos(t)), w / 2 - r * (1 - Math.sin(t))]); }
    o.push([xb, w / 2]); return o; }
  // VISTA LATERAL (datasheet "Specific dimensions"): face de encaixe com cantos arredondados, flange com olhais, corpo
  // traseiro com degrau do isolador, caçapas de solda (2,50) até 7,75 máx., ou corpo crimp até A máx., ou contatos
  // de potência até 15,70 máx. Referencial local: x = 0 na saída do cabo, conector em x < 0; s = mm de papel por mm real
  HX.physDsubVec = function (g, nd, c, s, col, line, bw) {
    var M = HX.dsubSide(c, nd), D = M.D, A = D.A * s, B = D.B * s, S = M.S * s, met = line ? '#fff' : '#cfd3d8', ins = line ? '#fff' : '#e9e4d6', fl = line ? '#fff' : '#b9bcc0', hd = line ? '#fff' : '#a9adb3';
    var xr = -Math.max(M.rear, M.Lh) * s, xf = xr - M.tf * s, x0 = xf - M.fs * s, lock = nd.dsLock || '', u = function (v) { return xr + v * s; };
    P(g, rbox(x0, xf, S, 0.9 * s), col, met); L(g, x0 + 0.7 * s, -S / 2 + 0.9 * s, x0 + 0.7 * s, S / 2 - 0.9 * s, col, 0.08); // carcaça D (encaixe)
    var Wb = S + 1.4 * s;
    if (M.kind === 'crimp') { P(g, rbox(u(M.rear), u(2), S + 0.4 * s, 1.2 * s), col, ins); R(g, xr, -Wb / 2, 2 * s, Wb, col, ins); }
    else { R(g, u(4.6), -(S / 2 - 0.2 * s), 0.65 * s, S - 0.4 * s, col, ins); P(g, rbox(u(4.6), xr, Wb, 0.9 * s), col, ins); }
    R(g, xf, -A / 2, M.tf * s, A, col, fl, 0.25); // flange
    [-1, 1].forEach(function (k) {
      var y = k * B / 2, r = 1.55 * s;
      R(g, xr, y - 1.6 * s, 0.45 * s, 3.2 * s, col, col, 0.1); // olhal / covinha sobre o flange
      if (lock === 'V') { R(g, xf - 4.8 * s, y - 2.4 * s, 4.8 * s, 4.8 * s, col, met); L(g, xf - 4.8 * s, y - 1.2 * s, xf, y - 1.2 * s, col); L(g, xf - 4.8 * s, y + 1.2 * s, xf, y + 1.2 * s, col); }
      else { L(g, xf - 0.4 * s, y - r, xr + 0.4 * s, y - r, col, 0.08, [0.6, 0.4]); L(g, xf - 0.4 * s, y + r, xr + 0.4 * s, y + r, col, 0.08, [0.6, 0.4]); }
      L(g, xf - 0.8 * s, y, xr + 0.8 * s, y, col, 0.05, [0.8, 0.3, 0.15, 0.3]); // linha de centro do furo (curta, só no flange)
    });
    L(g, x0 - 0.6 * s, 0, x0 + 1.6 * s, 0, col, 0.05, [0.8, 0.3, 0.15, 0.3]); // marca de eixo (curta)
    var sm = D.pts.filter(function (q) { return !q.big; }), y0 = Math.min.apply(0, sm.length ? sm.map(function (q) { return q.y; }) : [0]);
    if (M.kind !== 'crimp') sm.filter(function (q) { return Math.abs(q.y - y0) < 0.01; }).forEach(function (q) { // caçapas da fileira da frente
      var y = (M.sock ? -1 : 1) * q.x * s, w = 1.5 * s; R(g, u(5.25), y - w / 2, 2.5 * s, w, col, met, 0.15); L(g, u(6.4), y - w / 2, u(6.4), y + w / 2, col, 0.1);
    });
    D.pts.filter(function (q) { return q.big; }).forEach(function (q) { // contatos de potência / coaxiais 8638
      var y = (M.sock ? -1 : 1) * q.x * s;
      R(g, u(4.6), y - 2.1 * s, 1.3 * s, 4.2 * s, col, met, 0.15);
      if (M.pcrimp) { for (var i = 0; i < 6; i++) L(g, u(4.6 + i * 0.22), y - 2.1 * s, u(4.6 + i * 0.22 + 0.25), y + 2.1 * s, col, 0.05); R(g, u(5.9), y - 1.3 * s, 9.8 * s, 2.6 * s, col, met, 0.18); L(g, u(6.1), y - 1.0 * s, u(15.5), y - 1.0 * s, col, 0.05, [0.3, 0.2]); L(g, u(6.1), y + 1.0 * s, u(15.5), y + 1.0 * s, col, 0.05, [0.3, 0.2]); }
      else P(g, [[u(5.9), y - 1.4 * s], [u(12.8), y - 1.4 * s], [u(13.6), y - 0.6 * s], [u(15.7), y - 0.6 * s], [u(15.7), y + 1.4 * s], [u(5.9), y + 1.4 * s]], col, met, 0.18);
    });
    if (M.hood) { // capa com orelhas e parafusos de travamento (medida típica — confira no catálogo da capa)
      var Wh = A + 1.6 * s, we = Math.max(bw || 2, 8 * s), Q = [[xr, -Wh / 2], [xr + M.Lh * 0.45 * s, -Wh / 2], [-M.Lh * 0.1 * s, -we / 2], [0, -we / 2], [0, we / 2], [-M.Lh * 0.1 * s, we / 2], [xr + M.Lh * 0.45 * s, Wh / 2], [xr, Wh / 2]];
      P(g, Q, col, hd, 0.25);
      [-1, 1].forEach(function (k) { var y = k * B / 2, x1 = xr + M.Lh * 0.3 * s; L(g, xf, y, x1, y, col, 0.1, [0.6, 0.4]); R(g, x1, y - 1.9 * s, 5 * s, 3.8 * s, col, met); for (var i = 1; i < 6; i++) L(g, x1 + i * 0.83 * s, y - 1.9 * s, x1 + i * 0.83 * s, y + 1.9 * s, col, 0.06); });
    }
    return { x0: x0 - (lock === 'V' ? 4.8 * s : 0), x1: 0, y0: -A / 2 - (M.hood ? 0.8 * s : 0), y1: A / 2 + (M.hood ? 0.8 * s : 0), M: M, xf: xf, xr: xr, xfront: x0, A: A, B: B };
  };
  // contatos expostos (sem capa) no desenho técnico: os fios terminam um a um nos contatos (phys_dsubterm.js)
  HX.physDsubExposed = function (it, C) { var c = it && it.nkind === 'conn' && C.S[it.of]; return !!(c && HX.isDsub(c) && HX.physVecOn(it, C.sh) && !HX.dsubSide(c, it).hood && HX.physDsubTerm); };
  HX.physDrawDsubNode = function (g, it, c, C, BU) { // usado pelo modo desenho técnico (phys_vec.js); cotas só na consulta
    var M0 = HX.dsubSide(c, it), k = HX.physConnK(C.sh, Math.max(M0.total, M0.D.A), C.N, C.line), s = k / C.N, ang = HX.physAngle(it, C.sh.items), r = ang * D2R, cs = Math.cos(r), sn = Math.sin(r);
    var col = C.line ? C.col : '#1d1d1d', ws = BU.node[it.id] || [], sg = C.sh.items.filter(function (i) { return i.type === 'pseg' && (i.a === it.id || i.b === it.id); })[0], bw = HX.bundleW(sg && BU.seg[sg.id] ? BU.seg[sg.id].od : 0);
    var fl = it.flip ? -1 : 1, ex = HX.physDsubExposed(it, C), dx = 0, Lt = ex ? HX.physDsubTermLen(M0, s) : 0;
    g.push([cs, sn, -sn * fl, cs * fl, it.x, it.y]); g.push([1, 0, 0, 1, -dx, 0]);
    var b = HX.physDsubVec(g, it, c, s, col, C.line, bw); g.pop();
    if (ex) HX.physDsubTerm(g, it, c, C, BU, M0, s, Lt, fl, sg, col); g.pop();
    if (!ex && HX.physFan) HX.physFan(g, it.x, it.y, cs, sn, ws, Math.min(3, bw * 1.2), bw);
    var pts = [[b.x0 - dx, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0 - dx, b.y1]].map(function (q) { return [it.x + cs * q[0] - sn * fl * q[1], it.y + sn * q[0] + cs * fl * q[1]]; });
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; }), bb = { x0: Math.min.apply(0, xs), y0: Math.min.apply(0, ys), x1: Math.max.apply(0, xs), y1: Math.max.apply(0, ys) };
    HX.physHide(it, '_bb', bb); HX.physHide(it, '_L', Math.hypot(bb.x1 - bb.x0, bb.y1 - bb.y0)); HX.physHide(it, '_k', k); HX.physHide(it, '_lt', Lt);
    return bb;
  };
})(typeof window !== 'undefined' ? window : globalThis);
