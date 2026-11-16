/* HarnessCAD - desenho físico: o RAMO NUNCA SE SOLTA DO CONECTOR. Como no Altium Harness (o feixe começa e termina
   no ponto de conexão do componente), o ramo sai do conector pela saída de cabo e no EIXO do conector: quando o
   conector foi girado à mão (rot), o ramo segue reto pelo comprimento do leque/terminação e depois faz uma curva
   suave até o seu traçado. Sem giro manual nada muda (o conector já aponta para o ramo). */
(function (G) {
  'use strict';
  var HX = G.HX, seg0 = HX.physSegPts, D2R = Math.PI / 180;
  function hasRot(n) { return n && n.nkind === 'conn' && n.rot !== '' && n.rot != null && !isNaN(+n.rot); }
  function bez(a, c1, c2, b, k) { var o = []; for (var i = 1; i <= k; i++) { var t = i / k, u = 1 - t; o.push([u * u * u * a[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * b[0], u * u * u * a[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * b[1]]); } return o; }
  HX.physLeadLen = function (nd) { return Math.max(HX.PHYS_FAN || 7, +nd._lt || 0); };
  // P começa no nó; refaz o começo: reto no eixo u por L, curva até o traçado original
  function attach(P, nd) {
    var L0 = HX.polyLen(P); if (!(L0 > 0.5)) return P;
    var r = +nd.rot * D2R, u = [Math.cos(r), Math.sin(r)], d0 = HX.polyAt(P, Math.min(0.5, 1 / L0)).d;
    if (u[0] * d0[0] + u[1] * d0[1] > 0.9995) return P; // já está no eixo
    var L = Math.min(HX.physLeadLen(nd), L0 * 0.45), A = P[0], E = [A[0] + u[0] * L, A[1] + u[1] * L];
    var dt = u[0] * d0[0] + u[1] * d0[1], S = Math.min(L0 * 0.8, L + Math.max(8, L * 1.5) * (1 + (1 - dt) / 2)), q = HX.polyAt(P, S / L0), T = q.pt, d = q.d, k = Math.max(2, Math.hypot(T[0] - E[0], T[1] - E[1]) * 0.6);
    var rest = []; var acc = 0; for (var i = 1; i < P.length; i++) { acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); if (acc > S + 1e-6) rest.push(P[i]); }
    return [A, E].concat(bez(E, [E[0] + u[0] * k, E[1] + u[1] * k], [T[0] - d[0] * k, T[1] - d[1] * k], T, 14), rest);
  }
  HX.physSegPts = function (sg, m) {
    var P = seg0(sg, m); if (!P || P.length < 2) return P;
    var A = m[sg.a], B = m[sg.b];
    if (hasRot(A)) P = attach(P, A);
    if (hasRot(B)) P = attach(P.slice().reverse(), B).reverse();
    return P;
  };
})(typeof window !== 'undefined' ? window : globalThis);
