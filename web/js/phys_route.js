/* HarnessCAD - desenho físico: TRAÇADO E MANIPULAÇÃO DAS RAMIFICAÇÕES.
   Modo da folha (sh.route) ou do ramo (sg.route):
     'free'   LIVRE — retas entre nós e pontos de curva, cantos arredondados (nunca dá laço nem volta para trás);
     'ortho'  ÂNGULOS RETOS — só trechos horizontais/verticais, cotovelo automático e canto arredondado;
     'smooth' CURVAS SUAVES — curva que passa pelos pontos (comportamento antigo).
   Os pontos de curva (bends) continuam sendo os mesmos: viram vértices no livre e cotovelos no ortogonal. */
(function (G) {
  'use strict';
  var HX = G.HX, seg0 = HX.physSegPts, idx0 = HX.physIdx, RF = 5; // raio do canto (mm do papel)
  HX.ROUTE_MODES = [['free', 'Livre (retas, cantos arredondados)'], ['ortho', 'Ângulos retos (90°)'], ['smooth', 'Curvas suaves']];
  HX.physIdx = function (sh) {
    var m = idx0(sh); try { Object.defineProperty(m, '__sh', { value: sh, enumerable: false });
      if (sh.kind && sh.items) Object.defineProperty(sh.items, '__route', { value: sh.route || '', enumerable: false, configurable: true, writable: true }); } catch (e) {} return m; // a lista de itens lembra o traçado (cálculos que só recebem os itens)
  };
  HX.physRouteOf = function (sg, m) { var S = m && m.__sh; return sg.route || (S && (S.route || (S.items && S.items.__route))) || 'free'; };
  function way(sg, m) { // nós + pontos de curva (a curva antiga x,y vira um ponto no meio)
    var A = m[sg.a], B = m[sg.b]; if (!A || !B) return null;
    var W = sg.bends && sg.bends.length ? HX.physBendWorld(sg, m) : (+sg.x || +sg.y ? [[(A.x + B.x) / 2 + (+sg.x || 0), (A.y + B.y) / 2 + (+sg.y || 0)]] : []);
    return [[A.x, A.y]].concat(W, [[B.x, B.y]]);
  }
  HX.physOrtho = function (P, h0) { // insere cotovelos: cada trecho fica horizontal ou vertical, alternando sem voltar
    var out = [P[0]], hz = h0 == null ? null : !h0;
    for (var i = 1; i < P.length; i++) {
      var a = out[out.length - 1], b = P[i], dx = b[0] - a[0], dy = b[1] - a[1];
      if (Math.abs(dx) < 1e-6 || Math.abs(dy) < 1e-6) { out.push(b); hz = Math.abs(dy) < 1e-6; continue; }
      var h = hz === null ? Math.abs(dx) >= Math.abs(dy) : !hz; out.push(h ? [b[0], a[1]] : [a[0], b[1]], b); hz = !h;
    }
    return out.filter(function (q, i) { return !i || Math.hypot(q[0] - out[i - 1][0], q[1] - out[i - 1][1]) > 1e-6; });
  };
  HX.physFillet = function (P, R) { // cantos arredondados (curva de 2º grau no canto)
    if (P.length < 3) return P.slice(); var out = [P[0]];
    for (var i = 1; i < P.length - 1; i++) {
      var a = P[i - 1], c = P[i], b = P[i + 1], la = Math.hypot(c[0] - a[0], c[1] - a[1]), lb = Math.hypot(b[0] - c[0], b[1] - c[1]), r = Math.min(R, la * 0.45, lb * 0.45);
      if (r < 0.05) { out.push(c); continue; }
      var p = [c[0] + (a[0] - c[0]) / la * r, c[1] + (a[1] - c[1]) / la * r], q = [c[0] + (b[0] - c[0]) / lb * r, c[1] + (b[1] - c[1]) / lb * r];
      for (var k = 0; k <= 6; k++) { var t = k / 6, u = 1 - t; out.push([u * u * p[0] + 2 * u * t * c[0] + t * t * q[0], u * u * p[1] + 2 * u * t * c[1] + t * t * q[1]]); }
    }
    out.push(P[P.length - 1]); return out;
  };
  HX.physSegPts = function (sg, m) {
    var mode = HX.physRouteOf(sg, m); if (mode === 'smooth') return seg0(sg, m);
    var W = way(sg, m); if (!W) return null;
    if (mode === 'ortho') { // conector sai/chega na horizontal (ou na vertical se estiver girado 90°)
      var pref = function (n) { if (!n || n.nkind !== 'conn') return null; var r = +n.rot; return n.rot !== '' && n.rot != null && !isNaN(r) && Math.abs(Math.sin(r * Math.PI / 180)) > 0.7 ? false : true; };
      var hA = pref(m[sg.a]), hB = pref(m[sg.b]);
      if (W.length === 2 && hA !== null && hB !== null && hA === hB && Math.abs(W[0][0] - W[1][0]) > 1e-6 && Math.abs(W[0][1] - W[1][1]) > 1e-6) {
        var c = hA ? (W[0][0] + W[1][0]) / 2 : (W[0][1] + W[1][1]) / 2; W = hA ? [W[0], [c, W[0][1]], [c, W[1][1]], W[1]] : [W[0], [W[0][0], c], [W[1][0], c], W[1]];
      } else if (hA === null && hB !== null) W = HX.physOrtho(W.slice().reverse(), hB).reverse();
      else W = HX.physOrtho(W, hA);
    }
    return W.length > 2 ? HX.physFillet(W, RF) : W;
  };
  // ramo inteiro de um nó: tudo que fica do lado oposto ao vizinho com mais itens (o tronco)
  HX.physSubtree = function (sh, nd) {
    var adj = {}; sh.items.forEach(function (s) { if (s.type === 'pseg') { (adj[s.a] = adj[s.a] || []).push(s.b); (adj[s.b] = adj[s.b] || []).push(s.a); } });
    function side(from, block) { var seen = {}, q = [from]; seen[block] = seen[from] = 1; while (q.length) { var x = q.pop(); (adj[x] || []).forEach(function (y) { if (!seen[y]) { seen[y] = 1; q.push(y); } }); } delete seen[block]; return seen; }
    var nb = adj[nd.id] || []; if (nb.length < 2) return [nd.id];
    var best = null, bn = -1; nb.forEach(function (o) { var n = Object.keys(side(o, nd.id)).length; if (n > bn) { bn = n; best = o; } });
    return Object.keys(side(nd.id, best));
  };
})(typeof window !== 'undefined' ? window : globalThis);
