/* HarnessCAD - DADOS DO DIAGRAMA DE LIGAÇÃO (HX.physDiagram), fiel ao esquemático também com emendas e jumpers:
   - cada pino aparece UMA vez no bloco do seu conector;
   - lado de cada conector (esquerda/direita) pelas ligações (o que liga mais fica em frente), não pelo sentido do fio;
   - fio direto pino a pino = uma linha; rede com emenda (SP…) = linhas de todos os pinos até uma barra vertical com o
     ponto da emenda (linha principal atravessa de um conector ao outro); jumper no mesmo conector = "U" junto ao bloco;
   - dreno de cabo (emenda no ponto de dreno) continua descendo até o seu pino; ponta sem conector = ponto com o nome. */
(function (G) {
  'use strict';
  var HX = G.HX; if (!HX.WD) return;
  HX.physDiagram = function (p) {
    var num = HX.WD.num, CN = {}, DR = {}; p.sheets.forEach(function (sh) { if (HX.isPhys(sh)) return; var cp = {};
      sh.items.forEach(function (i) { if (i.type === 'conn') CN[i.ref] = i; var q = i.type === 'cable' && HX.cableDrainPt && HX.cableDrainPt(i); if (q) cp[HX.key(q[0], q[1])] = i.ref; });
      sh.items.forEach(function (i) { if (i.type === 'splice' && cp[HX.key(i.x, i.y)]) DR[i.ref] = cp[HX.key(i.x, i.y)]; }); });
    function drn(e) { return e.kind === 'drain' ? e.ref : e.kind === 'splice' && DR[e.ref] ? DR[e.ref] : null; }
    function isPin(e) { return e.kind !== 'splice' && !!CN[e.ref]; } function isSp(e) { return e.kind === 'splice' && !DR[e.ref]; }
    var OE = {}; function nk(e) { if (isPin(e)) return 'P|' + e.ref + '|' + num(e.pin); if (isSp(e)) return 'S|' + e.ref; var k = 'O|' + e.ref + '|' + num(e.pin); OE[k] = e; return k; }
    function pin(e) { var c = CN[e.ref], q = c && c.pins.filter(function (x) { return num(x.n) === num(e.pin); })[0]; return { ref: e.ref, pin: num(e.pin), name: (q && q.name) || '', c: c }; }
    var W = HX.wireList(p).filter(function (r) { return r.fromEnd && r.toEnd; }), cnt = {}, up = {}, wOf = {}, jmp = [], drains = {}, dw = [];
    function root(k) { while (up[k] && up[k] !== k) k = up[k]; return k; } function uni(a, b) { up[a] = up[a] || a; up[b] = up[b] || b; var x = root(a), y = root(b); if (x !== y) up[x] = y; }
    W.forEach(function (r) { var a = r.fromEnd, b = r.toEnd; [[a, 1], [b, -1]].forEach(function (e) { if (CN[e[0].ref]) cnt[e[0].ref] = (cnt[e[0].ref] || 0) + e[1]; });
      if (drn(a) || drn(b)) return dw.push(r);
      if (isPin(a) && isPin(b) && a.ref === b.ref) return jmp.push(r);
      uni(nk(a), nk(b)); [a, b].forEach(function (e) { if (!wOf[nk(e)]) wOf[nk(e)] = r; }); }); /* ponta sem conector (equipamento, terra) entra na rede: pino nunca repete */
    var comps = {}; Object.keys(up).forEach(function (k) { var c = comps[root(k)] = comps[root(k)] || { pins: [], sps: [] }, t = k.split('|'); c.oth = c.oth || []; if (t[0] === 'P') c.pins.push({ k: k, ref: t[1], pin: t[2] }); else if (t[0] === 'S') c.sps.push(t[1]); else c.oth.push(k); });
    /* lado de cada conector: o primeiro (mais ligações) à esquerda; os demais em frente aos conectores com que mais se ligam */
    var wt = {}, deg = {}; Object.keys(comps).forEach(function (k) { var R = {}; comps[k].pins.forEach(function (q) { R[q.ref] = 1; }); var L = Object.keys(R);
      L.forEach(function (a) { L.forEach(function (b) { if (a !== b) { wt[a + '|' + b] = (wt[a + '|' + b] || 0) + 1; deg[a] = (deg[a] || 0) + 1; } }); }); });
    var side = {}, todo = Object.keys(CN).filter(function (r) { return deg[r]; }).sort(function (a, b) { return deg[b] - deg[a] || (cnt[b] || 0) - (cnt[a] || 0) || HX.natCmp(a, b); }); /* empate: de onde os fios saem */
    while (todo.length) { var best = 0, bs = -1; todo.forEach(function (r, i) { var s = 0; Object.keys(side).forEach(function (q) { s += wt[r + '|' + q] || 0; }); if (s > bs) { bs = s; best = i; } });
      var r0 = todo.splice(best, 1)[0], sl = 0, sr = 0; Object.keys(side).forEach(function (q) { if (side[q] === 'L') sl += wt[r0 + '|' + q] || 0; else sr += wt[r0 + '|' + q] || 0; });
      side[r0] = !Object.keys(side).length ? 'L' : sl > sr ? 'R' : sr > sl ? 'L' : 'R'; }
    function left(ref) { return side[ref] ? side[ref] === 'L' : CN[ref] && cnt[ref] >= 0; }
    var rows = [], by = {}, nets = 0, jumps = [];
    function info(r, w) { if (w) { r.w = w; r.color = w.w.color || ''; r.gauge = w.gauge || ''; r.cable = w.cable || (w.twist ? 'T:' + w.twist : ''); } return r; }
    function add(r) { rows.push(r); [['L', r.L], ['R', r.R]].forEach(function (s) { if (s[1]) by[s[0] + '|' + s[1].ref + '|' + s[1].pin] = r; }); return r; }
    function pk(q) { return 'P|' + q.ref + '|' + q.pin; }
    Object.keys(comps).forEach(function (k) { var c = comps[k], Lp = [], Rp = [];
      c.pins.sort(function (a, b) { return HX.natCmp(a.ref, b.ref) || HX.natCmp(a.pin, b.pin); }).forEach(function (q) { (left(q.ref) ? Lp : Rp).push(q); });
      function P(q) { return pin({ ref: q.ref, pin: q.pin }); }
      if (!c.sps.length && Lp.length === 1 && Rp.length === 1 && !c.oth.length) return add(info({ L: P(Lp[0]), R: P(Rp[0]) }, wOf[pk(Lp[0])]));
      if (!c.sps.length && c.pins.length + c.oth.length === 2 && c.oth.length) { var E = c.pins.map(function (q) { return { kind: 'pin', ref: q.ref, pin: q.pin }; }).concat(c.oth.map(function (o) { return OE[o]; })); return two(E[0], E[1], wOf[c.pins.length ? pk(c.pins[0]) : c.oth[0]]); }
      var id = ++nets, sp = c.sps.sort(HX.natCmp).join(' / ');
      if (Lp.length && Rp.length) { var w0 = wOf[pk(Lp[0])]; add(info({ L: P(Lp.shift()), R: P(Rp.shift()), net: id, main: true, sp: sp }, w0)); }
      Lp.concat(Rp).forEach(function (q, i) { var o = { net: id, main: !rows.some(function (r) { return r.net === id; }), sp: sp }; o[left(q.ref) ? 'L' : 'R'] = P(q); add(info(o, wOf[pk(q)])); });
      c.oth.forEach(function (k) { add(info({ ro: OE[k], net: id, main: !rows.some(function (r) { return r.net === id; }), sp: sp }, wOf[k])); }); });
    jmp.forEach(function (r) { var s = left(r.fromEnd.ref) ? 'L' : 'R', E = [r.fromEnd, r.toEnd].map(function (e) { var q = pin(e), x = by[s + '|' + q.ref + '|' + q.pin]; if (!x) { x = { jmp: true }; x[s] = q; add(info(x, r)); } return q; });
      jumps.push({ s: s, ref: E[0].ref, a: E[0].pin, b: E[1].pin }); });
    function two(a, b, r) { if (isPin(b) && left(b.ref) && !(isPin(a) && left(a.ref))) { var t = a; a = b; b = t; }
      return isPin(a) && !left(a.ref) ? add(info({ R: pin(a), lo: b }, r)) : add(info({ L: isPin(a) ? pin(a) : null, lo: isPin(a) ? null : a, ro: b }, r)); }
    dw.forEach(function (r) { var a = r.fromEnd, b = r.toEnd, dr = drn(a) ? a : b, o = dr === a ? b : a, k = drn(dr), d = drains[k] = drains[k] || { cable: k, drain: true, w: r }; if (CN[o.ref]) d[left(o.ref) ? 'L' : 'R'] = pin(o); });
    var lastL = {}; rows.forEach(function (r) { if (r.L && r.R && (!lastL[r.R.ref] || HX.natCmp(r.L.ref, lastL[r.R.ref]) > 0)) lastL[r.R.ref] = r.L.ref; });
    function key(r) { var R = r.R || r.ro || {}; return [r.L ? r.L.ref : r.lo ? r.lo.ref : lastL[R.ref] || '\uffff', r.R ? r.R.ref : '\uffff', (r.R || r.L || {}).pin || '']; }
    rows.sort(function (u, v) { var a = key(u), b = key(v); return HX.natCmp(a[0], b[0]) || HX.natCmp(a[1], b[1]) || HX.natCmp(a[2], b[2]); });
    var out = []; rows.forEach(function (r, i) { out.push(r); var nx = rows[i + 1]; if (r.cable && drains[r.cable] && (!nx || nx.cable !== r.cable)) { out.push(drains[r.cable]); delete drains[r.cable]; } });
    Object.keys(drains).forEach(function (k) { out.push(drains[k]); });
    return { rows: out, jumps: jumps, side: side, gauge: HX.WD.mode(rows.map(function (r) { return r.gauge; })), color: HX.WD.mode(rows.map(function (r) { return r.color; })) };
  };
})(typeof window !== 'undefined' ? window : globalThis);
