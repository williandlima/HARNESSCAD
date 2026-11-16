/* HarnessCAD - DIAGRAMA DE LIGAÇÃO no padrão da casa (ptable kind 'wiring'; o formato antigo continua com wstyle 'tabela').
   Como nas pranchas de referência: bloco de cada conector com cantos arredondados do lado dos fios, nº do pino dentro,
   nome do sinal fora, referência em cima e PN embaixo; fios retos pino a pino na ordem dos pinos de destino; par do
   mesmo cabo com o símbolo de trança nas duas pontas e o dreno (malha) descendo até o seu pino; cor/bitola escritas só
   quando diferem do padrão do chicote, que vai na nota "TODOS OS CABOS SÃO BITOLA xx AWG"; divisa > de gênero
   (convenção do projeto: saindo pela face = macho, entrando = fêmea). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT; if (!EXT.ptable) return;
  var AB = { WH: 'BC', BK: 'PR', RD: 'VM', BU: 'AZ', GN: 'VD', YE: 'AM', OG: 'LR', BN: 'MR', VT: 'VI', VI: 'VI', GY: 'CZ', PK: 'RS', TQ: 'TQ', NC: '' };
  HX.colorAbbr = function (c) { return String(c || '').split(/[-\/]/).map(function (k) { return AB[k.toUpperCase()] != null ? AB[k.toUpperCase()] : k.toUpperCase(); }).filter(Boolean).join('/'); };
  function mode(a) { var n = {}, b = '', m = 0; a.forEach(function (v) { if (!v) return; n[v] = (n[v] || 0) + 1; if (n[v] > m) { m = n[v]; b = v; } }); return b; }
  function num(s) { return String(s == null ? '' : s); }
  HX.physDiagram = function (p) {
    var CN = {}, DR = {}; p.sheets.forEach(function (sh) { if (HX.isPhys(sh)) return; var cp = {};
      sh.items.forEach(function (i) { if (i.type === 'conn') CN[i.ref] = i; var q = i.type === 'cable' && HX.cableDrainPt && HX.cableDrainPt(i); if (q) cp[HX.key(q[0], q[1])] = i.ref; });
      sh.items.forEach(function (i) { if (i.type === 'splice' && cp[HX.key(i.x, i.y)]) DR[i.ref] = cp[HX.key(i.x, i.y)]; }); }); /* emenda no ponto de dreno = dreno do cabo */
    function drn(e) { return e.kind === 'drain' ? e.ref : e.kind === 'splice' && DR[e.ref] ? DR[e.ref] : null; }
    var W = HX.wireList(p).filter(function (r) { return r.fromEnd && r.toEnd; }), cnt = {};
    W.forEach(function (r) { [[r.fromEnd, 1], [r.toEnd, -1]].forEach(function (e) { if (CN[e[0].ref]) cnt[e[0].ref] = (cnt[e[0].ref] || 0) + e[1]; }); });
    function left(ref) { return CN[ref] && cnt[ref] >= 0; }
    function pin(e) { var c = CN[e.ref], q = c && c.pins.filter(function (x) { return num(x.n) === num(e.pin); })[0]; return { ref: e.ref, pin: num(e.pin), name: (q && q.name) || '', c: c }; }
    var rows = [], drains = {};
    W.forEach(function (r) {
      var a = r.fromEnd, b = r.toEnd, dr = drn(a) ? a : drn(b) ? b : null;
      if (dr) { var o = dr === a ? b : a, k = drn(dr), d = drains[k] = drains[k] || { cable: k, drain: true, w: r }; if (CN[o.ref]) d[left(o.ref) ? 'L' : 'R'] = pin(o); return; }
      if (!left(a.ref) && left(b.ref)) { var t = a; a = b; b = t; }
      rows.push({ L: CN[a.ref] ? pin(a) : null, R: CN[b.ref] ? pin(b) : null, lo: CN[a.ref] ? null : a, ro: CN[b.ref] ? null : b, cable: r.cable || (r.twist ? 'T:' + r.twist : ''), w: r, color: r.w.color || '', gauge: r.gauge || '' });
    });
    function key(r) { return [(r.L || r.lo || {}).ref || '', (r.R || r.ro || {}).ref || '~']; }
    rows.sort(function (u, v) { var a = key(u), b = key(v); return a[0] !== b[0] ? (a[0] < b[0] ? -1 : 1) : a[1] !== b[1] ? (a[1] < b[1] ? -1 : 1) : num((u.R || {}).pin).localeCompare(num((v.R || {}).pin), undefined, { numeric: true }); });
    var out = []; rows.forEach(function (r, i) { out.push(r); var nx = rows[i + 1]; if (r.cable && drains[r.cable] && (!nx || nx.cable !== r.cable)) { out.push(drains[r.cable]); delete drains[r.cable]; } });
    Object.keys(drains).forEach(function (k) { out.push(drains[k]); });
    return { rows: out, gauge: mode(rows.map(function (r) { return r.gauge; })), color: mode(rows.map(function (r) { return r.color; })) };
  };
  function chev(g, x, y, d, col) { g.style({ stroke: col, lw: 0.2, fill: null }); g.poly([[x, y - 1.2], [x + d * 1.1, y], [x, y + 1.2]], false); }
  function block(g, x, y, w, h, side, col) { /* side = +1: arredondado à direita (bloco da esquerda) */
    var r = Math.min(2.2, h / 4), P = [], k, a;
    if (side > 0) { P.push([x, y]); for (k = 0; k <= 6; k++) { a = -Math.PI / 2 + k / 12 * Math.PI; P.push([x + w - r + r * Math.cos(a), y + r + r * Math.sin(a)]); } for (k = 6; k <= 12; k++) { a = -Math.PI / 2 + k / 12 * Math.PI; P.push([x + w - r + r * Math.cos(a), y + h - r + r * Math.sin(a)]); } P.push([x, y + h]); }
    else { P.push([x + w, y]); P.push([x + w, y + h]); for (k = 0; k <= 6; k++) { a = Math.PI / 2 + k / 12 * Math.PI; P.push([x + r + r * Math.cos(a), y + h - r + r * Math.sin(a)]); } for (k = 6; k <= 12; k++) { a = Math.PI / 2 + k / 12 * Math.PI; P.push([x + r + r * Math.cos(a), y + r + r * Math.sin(a)]); } }
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.poly(P, true); g.style({ fill: null });
  }
  function twist(g, x, ya, yb, col) { var P = [], Q = [], k, n = 24; for (k = 0; k <= n; k++) { var t = k / n, y = ya + (yb - ya) * t, s = Math.sin(t * 2 * Math.PI) * 0.9; P.push([x + s, y]); Q.push([x - s, y]); } g.style({ stroke: col, lw: 0.2, fill: null }); g.poly(P, false); g.poly(Q, false); }
  function diagram(g, it, p, C, col) {
    var D = HX.physDiagram(p), R = D.rows, rh = +it.rh || 3.0, fs = +it.fs || 1.6, x = it.x, y = it.y, W = +it.w || 170, bw = 6.5, nw = 0;
    R.forEach(function (r) { [r.L, r.R].forEach(function (e) { if (e) nw = Math.max(nw, HX.textW(e.name, fs)); }); }); nw = Math.min(42, nw + 3.2);
    var xl = x + nw, xr = x + W - nw - bw, top = y + 4, Y = function (i) { return top + 1.5 + rh * (i + 0.5); };
    function span(side) { var S = [], cur = null; R.forEach(function (r, i) { var e = r[side]; var ref = e ? e.ref : null; if (ref && (!cur || cur.ref !== ref)) { cur = { ref: ref, c: e.c, i0: i, i1: i }; S.push(cur); } else if (ref && cur) cur.i1 = i; }); return S; }
    [['L', xl, 1], ['R', xr, -1]].forEach(function (s) {
      span(s[0]).forEach(function (b) {
        var y0 = Y(b.i0) - rh / 2 - 1.2, h = (b.i1 - b.i0 + 1) * rh + 2.4; block(g, s[1], y0, bw, h, s[2], col);
        g.text(b.ref, s[1] + bw / 2, y0 - 1.6, { size: fs, align: 'c', color: col }); if (b.c) g.text(HX.connPN(b.c), s[1] + bw / 2, y0 + h + 2, { size: fs, align: 'c', color: col });
        var male = b.c && b.c.gender === 'P', ym = y0 + h / 2; if (s[2] > 0) chev(g, male ? s[1] : s[1] - 1.1, ym, male ? -1 : 1, col); else chev(g, male ? s[1] + bw : s[1] + bw + 1.1, ym, male ? 1 : -1, col);
      });
    });
    var xa = xl + bw, xb = xr, tl = xa + 9, tr = xb - 9, lab = function (r) { var t = []; if (r.gauge && r.gauge !== D.gauge) t.push(r.gauge); if (r.color && (r.color !== D.color || r.cable)) t.push(HX.colorAbbr(r.color)); return t.join(' - '); };
    R.forEach(function (r, i) {
      var yy = Y(i); g.style({ stroke: col, lw: 0.15, dash: null });
      if (r.L) { g.text(r.L.pin, xl + bw - 0.8, yy, { size: fs, align: 'r', color: col }); g.text(r.L.name, xl - 2.4, yy, { size: fs, align: 'r', color: col }); }
      if (r.R) { g.text(r.R.pin, xr + 0.8, yy, { size: fs, color: col }); g.text(r.R.name, xr + bw + 2.4, yy, { size: fs, color: col }); }
      if (r.drain) { if (r.L) g.poly([[xa, yy], [tl, yy], [tl, Y(i - 1) + 1.1]], false); if (r.R) g.poly([[xb, yy], [tr, yy], [tr, Y(i - 1) + 1.1]], false); return; }
      var x0 = r.L ? xa : (x + W) / 2 - 6, x1 = r.R ? xb : (x + W) / 2 + 6; g.line(x0, yy, x1, yy);
      [[r.lo, x0, 'r'], [r.ro, x1, 'l']].forEach(function (o) { if (!o[0]) return; g.style({ fill: col }); g.circle(o[1], yy, 0.35); g.style({ fill: null }); g.text(o[0].ref, o[1] + (o[2] === 'r' ? -0.8 : 0.8), yy - 0.9, { size: fs * 0.85, align: o[2], color: col }); });
      var t = lab(r); if (t) g.text(t, (x0 + x1) / 2, yy - 0.75, { size: fs * 0.9, align: 'c', color: col });
    });
    var i0 = 0; R.forEach(function (r, i) { /* símbolo de trança nas duas pontas de cada par do mesmo cabo */
      var nx = R[i + 1]; if (!r.drain && nx && !nx.drain && nx.cable && nx.cable === r.cable) return;
      if (r.cable && !r.drain && i > i0) { [tl, tr].forEach(function (tx) { twist(g, tx, Y(i0) - 0.4, Y(i) + 0.4, col); g.style({ stroke: col, lw: 0.15, fill: '#fff' }); g.circle(tx, Y(i) + 1.1, 0.45); g.style({ fill: null }); }); }
      i0 = i + 1;
    });
    var yb = Y(R.length - 1) + rh / 2 + 4.5, gg = D.gauge, mixed = R.some(function (r) { return !r.drain && r.gauge && r.gauge !== gg; });
    if (gg) g.text(mixed ? 'OBS: TODOS OS CABOS SÃO BITOLA ' + gg.replace(/\s+/g, '') + ', EXCETO ONDE INDICADO.' : 'TODOS OS CABOS SÃO BITOLA ' + gg + '.', x + W / 2, yb, { size: fs, align: 'c', color: col });
    if (!R.length) g.text('sem fios no esquemático', x + W / 2, top + 4, { size: fs, align: 'c', color: col });
    return { x0: x, y0: y, x1: x + W, y1: yb + 1.5 };
  }
  var d0 = EXT.ptable.draw;
  EXT.ptable.draw = function (g, it, p, s, o) {
    if (it.kind && it.kind !== 'wiring' || it.wstyle === 'tabela') return d0.apply(this, arguments);
    var C = HX.physCtx(p, s, o), col = C.line ? C.col : o.theme.txt || '#000'; HX.physHide(it, '_bb', diagram(g, it, p, C, col));
  };
})(typeof window !== 'undefined' ? window : globalThis);
