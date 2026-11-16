/* HarnessCAD - desenho físico: COTA ANGULAR entre dois ramos num nó (pang).
   Campos: node, s1, s2 (ramos), r (raio do arco, mm do papel), x,y (deslocamento do texto), text (substitui), tol.
   O valor é o ângulo entre as tangentes dos ramos no nó. Digitar o valor (HX.physAngSet) GIRA o lado do s2 em torno
   do nó (ramos e itens presos andam juntos) até o ângulo pedido. Arrastar a cota muda o texto de lugar. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, hide = HX.physHide;
  HX.HITPR.pang = 1;
  function dir(sg, id, m) { var P = HX.physSegPts(sg, m); if (!P) return [1, 0]; if (sg.b === id) P = P.slice().reverse(); var q = HX.polyAt(P, Math.min(0.5, 3 / (HX.polyLen(P) || 1))).pt, dx = q[0] - P[0][0], dy = q[1] - P[0][1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  HX.physAngValue = function (it, m) {
    var N = m[it.node], a = m[it.s1], b = m[it.s2]; if (!N || !a || !b) return null;
    var d1 = dir(a, N.id, m), d2 = dir(b, N.id, m), s = Math.atan2(d1[0] * d2[1] - d1[1] * d2[0], d1[0] * d2[0] + d1[1] * d2[1]);
    return { N: N, d1: d1, d2: d2, a: s, deg: Math.abs(s) * 180 / Math.PI };
  };
  EXT.pang = {
    draw: function (g, it, p, s, o) {
      var C = HX.physCtx(p, s, o), V = HX.physAngValue(it, C.m); if (!V) return;
      var col = C.line ? C.col : (o.theme && o.theme.txt) || '#222', r = +it.r || 14, a1 = Math.atan2(V.d1[1], V.d1[0]), n = 28, P = [], k;
      for (k = 0; k <= n; k++) { var t = a1 + V.a * k / n; P.push([V.N.x + Math.cos(t) * r, V.N.y + Math.sin(t) * r]); }
      g.style({ stroke: col, lw: 0.18, fill: null, dash: null }); g.poly(P, false);
      [[0, 1], [n, -1]].forEach(function (e) { // setas tangentes ao arco
        var q = P[e[0]], t = a1 + V.a * e[0] / n, sg = (V.a >= 0 ? 1 : -1) * e[1], ux = -Math.sin(t) * sg, uy = Math.cos(t) * sg, L = 1.5, w = 0.42;
        g.style({ fill: col }); g.poly([q, [q[0] + ux * L - uy * w, q[1] + uy * L + ux * w], [q[0] + ux * L + uy * w, q[1] + uy * L - ux * w]], true); g.style({ fill: null });
      });
      [V.d1, V.d2].forEach(function (d) { g.style({ lw: 0.12, dash: [0.8, 0.5] }); g.line(V.N.x, V.N.y, V.N.x + d[0] * (r + 1.5), V.N.y + d[1] * (r + 1.5)); }); g.style({ dash: null });
      var tm = a1 + V.a / 2, tx = V.N.x + Math.cos(tm) * (r + 3) + (+it.x || 0), ty = V.N.y + Math.sin(tm) * (r + 3) + (+it.y || 0);
      var txt = it.text || (String(Math.round(V.deg * 10) / 10).replace('.', ',') + '°' + (it.tol ? ' ±' + it.tol + '°' : ''));
      g.text(txt, tx, ty, { size: 2.3, align: 'c', color: col });
      var tw = HX.textW(txt, 2.3) / 2 + 0.6; hide(it, '_t', [tx, ty, tw]);
      hide(it, '_bb', { x0: Math.min(V.N.x - r, tx - tw), y0: Math.min(V.N.y - r, ty - 2), x1: Math.max(V.N.x + r, tx + tw), y1: Math.max(V.N.y + r, ty + 2) }); hide(it, '_arc', P);
    },
    bbox: function (it) { return it._bb || { x0: 0, y0: 0, x1: 0, y1: 0 }; },
    hit: function (it, pt) {
      var t = it._t, P = it._arc, d = 1e9; if (t && Math.abs(pt[0] - t[0]) < t[2] && Math.abs(pt[1] - t[1]) < 1.6) return 0;
      if (P) for (var i = 1; i < P.length; i++) d = Math.min(d, HX.distSeg(pt, P[i - 1], P[i]) - 0.5); return d;
    }
  };
  // gira o lado do ramo s2 (o que não contém s1) em torno do nó
  HX.physAngSet = function (sh, it, deg) {
    deg = parseFloat(String(deg).replace(',', '.')); if (!(deg > 0 && deg < 360)) return 'Ângulo inválido.';
    var m = HX.physIdx(sh), V = HX.physAngValue(it, m); if (!V) return 'Cota sem ramos.';
    var target = (V.a >= 0 ? 1 : -1) * deg * Math.PI / 180, delta = target - V.a, s2 = m[it.s2], far = s2.a === V.N.id ? s2.b : s2.a;
    var seen = {}, q = [far], segs = {}; seen[V.N.id] = 1;
    while (q.length) { var id = q.shift(); if (seen[id]) continue; seen[id] = 1; sh.items.forEach(function (g) { if (g.type === 'pseg' && (g.a === id || g.b === id) && g.id !== it.s1) { segs[g.id] = g; var o = g.a === id ? g.b : g.a; if (!seen[o]) q.push(o); } }); }
    if (seen[(m[it.s1].a === V.N.id ? m[it.s1].b : m[it.s1].a)]) return 'Os ramos formam um laço: não dá para girar só um lado.';
    var c = Math.cos(delta), n = Math.sin(delta), d0 = delta * 180 / Math.PI;
    Object.keys(seen).forEach(function (id) { var nd = m[id]; if (!nd || id === V.N.id || nd.type !== 'pnode') return; var x = nd.x - V.N.x, y = nd.y - V.N.y; nd.x = HX.r3(V.N.x + c * x - n * y); nd.y = HX.r3(V.N.y + n * x + c * y); if (nd.rot !== '' && nd.rot != null && isFinite(+nd.rot)) nd.rot = Math.round(((+nd.rot + d0) % 360 + 360) % 360); });
    segs[s2.id] = s2; Object.keys(segs).forEach(function (k) { var g = segs[k], x = +g.x || 0, y = +g.y || 0; g.x = HX.r3(c * x - n * y); g.y = HX.r3(n * x + c * y); });
    return '';
  };
  // nova cota angular no nó: tronco × derivação (os dois ramos de maior ângulo ficam como referência)
  HX.physAddAng = function (doc, nd) {
    var sh = doc.cur(), m = HX.physIdx(sh), ss = sh.items.filter(function (s) { return s.type === 'pseg' && (s.a === nd.id || s.b === nd.id); }); if (ss.length < 2) return null;
    var T = ss.length > 2 && HX.physTrunkAt ? HX.physTrunkAt(sh, nd) : null, s1 = T ? T.s1 : ss[0], s2 = T ? ss.filter(function (s) { return s !== T.s1 && s !== T.s2; })[0] : ss[1];
    return doc.add({ type: 'pang', id: doc.uid('q'), node: nd.id, s1: s1.id, s2: s2.id, r: 14, x: 0, y: 0, text: '', tol: '' });
  };
})(typeof window !== 'undefined' ? window : globalThis);
