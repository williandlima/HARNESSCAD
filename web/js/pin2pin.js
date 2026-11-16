/* HarnessCAD - CONECTAR PINO A PINO: liga os pinos correspondentes de dois conectores (A→A, B→B, C→C...).
   Casamento: pelo número/letra do pino (padrão), pelo nome do sinal ou pela ordem da lista. Pinos que já têm fio são
   pulados (opcional). Roteamento ortogonal: reto quando alinhado; senão sai do pino, desce/sobe numa coluna própria entre
   os conectores (colunas escalonadas para os fios não se sobreporem nem cruzarem) e entra no outro pino. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  function norm(s) { return String(s == null ? '' : s).trim().toUpperCase(); }
  function used(doc, nl, si) { var u = {}; Object.keys(nl.nodes).forEach(function (k) { var nd = nl.nodes[k]; if (k.indexOf(si + '|') === 0 && nd.wireEnds && nd.wireEnds.length) u[k] = 1; }); return u; }
  // plano: { pairs:[{a,b}], onlyA:[n], onlyB:[n], busy:[n] }
  HX.pinToPinPlan = function (doc, A, B, opt) {
    opt = opt || {}; var p = doc.p, u = p.unit, LA = HX.connLayout(A, u).pins, LB = HX.connLayout(B, u).pins, si = doc.sheet, nl = HX.buildNetlist(p), U = used(doc, nl, si);
    var by = opt.by || 'pin', key = function (q) { return by === 'signal' ? norm(q.name || q.pin.name) : norm(q.n); }, pairs = [], onlyA = [], onlyB = [], busy = [];
    var isBusy = function (q) { return !!U[si + '|' + HX.key(q.pt[0], q.pt[1])]; };
    if (by === 'order') { for (var i = 0; i < Math.max(LA.length, LB.length); i++) { if (LA[i] && LB[i]) pairs.push({ a: LA[i], b: LB[i] }); else if (LA[i]) onlyA.push(LA[i].n); else onlyB.push(LB[i].n); } }
    else {
      // 1º casamento EXATO (maiúscula ≠ minúscula: nos MIL 38999/26482 'a' é outro pino que 'A'); depois, para o que
      // sobrou, sem diferenciar maiúscula/minúscula — só quando não há ambiguidade
      var raw = function (q) { return by === 'signal' ? String(q.name || q.pin.name || '').trim() : String(q.n == null ? '' : q.n).trim(); };
      var mb = {}, usedB = {}, restA = []; LB.forEach(function (q) { var k = raw(q); if (k && !mb[k]) mb[k] = q; });
      LA.forEach(function (q) { var k = raw(q); if (!k) return onlyA.push(q.n); if (mb[k] && !usedB[k]) { pairs.push({ a: q, b: mb[k] }); usedB[k] = 1; } else restA.push(q); });
      var cnt = function (L) { var c = {}; L.forEach(function (q) { var k = key(q); c[k] = (c[k] || 0) + 1; }); return c; }, restB = LB.filter(function (q) { var k = raw(q); return !k || !usedB[k] || mb[k] !== q; });
      var cA2 = cnt(restA), cB2 = cnt(restB), mb2 = {}; restB.forEach(function (q) { var k = key(q); if (k && cB2[k] === 1) mb2[k] = q; });
      restA.forEach(function (q) { var k = key(q); if (k && cA2[k] === 1 && mb2[k]) { pairs.push({ a: q, b: mb2[k] }); mb2[k].__p = 1; } else onlyA.push(q.n); });
      restB.forEach(function (q) { if (!q.__p) onlyB.push(q.n); delete q.__p; });
    }
    if (opt.skipBusy !== false) pairs = pairs.filter(function (r) { if (isBusy(r.a) || isBusy(r.b)) { busy.push(r.a.n + '→' + r.b.n); return false; } return true; });
    return { pairs: pairs, onlyA: onlyA, onlyB: onlyB, busy: busy };
  };
  // pontos ortogonais para cada par, sem colunas sobrepostas
  HX.pinToPinRoutes = function (doc, A, B, pairs) {
    var u = doc.p.unit, bA = HX.bbox(A, u), bB = HX.bbox(B, u), g = Math.max(u, 2.5), out = [];
    var cA = [(bA.x0 + bA.x1) / 2, (bA.y0 + bA.y1) / 2], cB = [(bB.x0 + bB.x1) / 2, (bB.y0 + bB.y1) / 2];
    function dir(q, c) { return q.pt[0] >= c[0] ? 1 : -1; }
    var S = pairs.map(function (r) { return { r: r, pa: r.a.pt, pb: r.b.pt, da: dir(r.a, cA), db: dir(r.b, cB) }; });
    var down = S.filter(function (s) { return s.pb[1] > s.pa[1] + 1e-6; }).sort(function (x, y) { return x.pa[1] - y.pa[1]; }), up = S.filter(function (s) { return s.pb[1] < s.pa[1] - 1e-6; }).sort(function (x, y) { return x.pa[1] - y.pa[1]; });
    var col = {}; down.forEach(function (s, i) { col[S.indexOf(s)] = down.length - 1 - i; }); up.forEach(function (s, i) { col[S.indexOf(s)] = down.length + i; });
    var n = down.length + up.length, low = {};
    S.slice().sort(function (x, y) { return Math.max(y.pa[1], y.pb[1]) - Math.max(x.pa[1], x.pb[1]); }).forEach(function (x, j) { low[S.indexOf(x)] = j; }); // rota por baixo: o pino mais baixo usa a pista mais interna
    S.forEach(function (s, i) {
      var pa = s.pa, pb = s.pb, P;
      var gap = s.da > 0 ? bB.x0 - bA.x1 - 2 * g : bA.x0 - bB.x1 - 2 * g;
      var facing = (s.da > 0 && s.db < 0 || s.da < 0 && s.db > 0) && gap >= 0 && (n < 2 || gap / (n - 1) >= 1); // canal entre os conectores com espaço para as colunas
      if (facing) {
        if (Math.abs(pa[1] - pb[1]) < 1e-6) P = [pa, pb];
        else {
          var x0 = s.da > 0 ? bA.x1 + g : bB.x1 + g, x1 = s.da > 0 ? bB.x0 - g : bA.x0 - g, k = col[i] || 0, st = n > 1 ? Math.min(g, (x1 - x0) / (n - 1)) : 0;
          var xm = HX.snap ? HX.snap((x0 + x1) / 2 - st * (n - 1) / 2 + st * k, 0.5) : (x0 + x1) / 2 - st * (n - 1) / 2 + st * k; if (s.da < 0) xm = x0 + x1 - xm;
          P = [pa, [xm, pa[1]], [xm, pb[1]], pb];
        }
      } else { // mesmo lado ou sem canal: sai do pino, desce abaixo dos dois conectores, volta pelo lado do outro pino (sem passar sobre o corpo)
        var k2 = low[i], off = g * (2 + k2), ea = pa[0] + s.da * off, eb = pb[0] + s.db * off, ym = Math.max(bA.y1, bB.y1) + off;
        P = [pa, [ea, pa[1]], [ea, ym], [eb, ym], [eb, pb[1]], pb];
      }
      out.push({ r: s.r, pts: HX.cleanPts(P) });
    });
    return out;
  };
  // executa: devolve { wires, plan }
  // os pinos dos dois conectores apontam para o mesmo lado (ex.: dois iguais lado a lado): espelha o que ainda não tem
  // fio para os pinos ficarem de frente — fios retos/em degrau curto no meio, em vez de contornar por baixo da folha
  HX.pinToPinFace = function (doc, A, B) {
    var u = doc.p.unit, side = function (C) { var b = HX.bbox(C, u), L = HX.connLayout(C, u).pins, m = L.reduce(function (s, q) { return s + q.pt[0]; }, 0) / (L.length || 1); return m >= (b.x0 + b.x1) / 2 ? 1 : -1; };
    var bA = HX.bbox(A, u), bB = HX.bbox(B, u), right = (bB.x0 + bB.x1) / 2 >= (bA.x0 + bA.x1) / 2, sa = side(A), sb = side(B);
    if ((right && sa > 0 && sb < 0) || (!right && sa < 0 && sb > 0)) return null;
    var nl = HX.buildNetlist(doc.p), si = doc.sheet, wired = function (C) { return HX.connLayout(C, u).pins.some(function (q) { var nd = nl.nodes[si + '|' + HX.key(q.pt[0], q.pt[1])]; return nd && nd.wireEnds && nd.wireEnds.length; }); };
    var T = (right ? sb > 0 : sb < 0) && !wired(B) ? B : (right ? sa < 0 : sa > 0) && !wired(A) ? A : null; if (!T || ((T.rot || 0) % 180)) return null;
    T.mx = !T.mx; return T;
  };
  HX.pinToPin = function (doc, A, B, opt) {
    opt = opt || {}; var flipped = opt.autoFace === false ? null : HX.pinToPinFace(doc, A, B); var plan = HX.pinToPinPlan(doc, A, B, opt), R = HX.pinToPinRoutes(doc, A, B, plan.pairs), W = [];
    R.forEach(function (x) { var props = {}; var sig = x.r.a.name || x.r.a.pin.name || x.r.b.name || x.r.b.pin.name; if (opt.names !== false && sig) props.name = sig; var w = ops.addWire(doc, x.pts, props); if (w) W.push(w); });
    return { wires: W, plan: plan, flipped: flipped && flipped.ref };
  };
})(typeof window !== 'undefined' ? window : globalThis);
