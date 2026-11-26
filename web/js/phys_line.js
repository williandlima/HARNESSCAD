/* HarnessCAD - desenho físico, modelo TRAÇO (estilo Altium): conector em vista lateral (D-Sub com parafusos-trava e
   abraçadeira; circular com porca recartilhada, rosca de acessório, backshell sextavado e abraçadeira — altura pelo
   tamanho da carcaça), leque com UM traço por fio real (curvo), capa do cabo em contorno duplo com largura pelo Ø do
   feixe, e vista frontal (D-Sub/Micro-D com medidas da série em escala de detalhe; circular: imagem do datasheet). */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.PHYS_LINE_COLOR = '#111111'; /* preto: padrão de desenho técnico no papel (v1.9.12; antes azul) */
  HX.PHYS_FAN = 7; // mm de leque entre o conector e a capa
  HX.PHYS_JACKET = 3.4;
  function cls(id) { return !id ? 'box' : /^dsub|^microd/.test(id) ? 'dsub' : /^term/.test(id) ? 'term' : /^(bnc|tnc|sma)/.test(id) ? 'coax' : /^cbl|^cov|^tie|^mount|^pclip|^clamp|^saddle|^grommet/.test(id) ? 'box' : 'circ'; }
  HX.physLineClass = cls;
  // diâmetro externo aproximado de conector circular pelo tamanho da carcaça (proporção)
  HX.circOD = function (c) { var m = /:(\d{1,2})[-A-Z]/.exec(c ? c.part : ''); var s = m ? +m[1] : 13; if (s > 40) s = 16; return s * 1.5875 + 7; };
  function screw(g, x, y, r) { g.circle(x, y, r); g.line(x - r * 0.7, y, x + r * 0.7, y); }
  function body(g, k, L, H, col) {
    g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null });
    if (k === 'dsub') {
      g.rect(-L, -H * 0.2, L * 0.1, H * 0.4); // carcaça de encaixe (face)
      g.rect(-L * 0.9, -H * 0.5, L * 0.035, H); // flange
      g.rect(-L * 0.865, -H * 0.47, L * 0.06, H * 0.1); g.rect(-L * 0.865, H * 0.37, L * 0.06, H * 0.1); // parafusos-trava
      g.poly([[-L * 0.865, -H * 0.34], [-L * 0.62, -H * 0.34], [-L * 0.22, -H * 0.24], [-L * 0.22, H * 0.24], [-L * 0.62, H * 0.34], [-L * 0.865, H * 0.34]], true); // backshell
      g.line(-L * 0.62, -H * 0.34, -L * 0.62, H * 0.34);
      g.rect(-L * 0.22, -H * 0.2, L * 0.13, H * 0.4); screw(g, -L * 0.155, -H * 0.27, H * 0.045); screw(g, -L * 0.155, H * 0.27, H * 0.045); // abraçadeira
      g.rect(-L * 0.09, -H * 0.12, L * 0.09, H * 0.24); // prensa-cabo
    } else if (k === 'circ' || k === 'coax') {
      g.rect(-L, -H * 0.36, L * 0.05, H * 0.72); // face de engate
      g.rect(-L * 0.95, -H * 0.5, L * 0.33, H); // porca de acoplamento
      g.style({ lw: 0.12 }); for (var i = 1; i < 12; i++) { var x = -L * 0.95 + L * 0.33 * i / 12; g.line(x, -H * 0.5, x, H * 0.5); }
      g.style({ lw: 0.25 }); g.rect(-L * 0.62, -H * 0.4, L * 0.16, H * 0.8); // corpo
      g.style({ lw: 0.1 }); for (var j = 1; j < 6; j++) { var xx = -L * 0.46 + L * 0.07 * j / 6; g.line(xx, -H * 0.33, xx + L * 0.008, H * 0.33); } // rosca de acessório
      g.style({ lw: 0.25 }); g.rect(-L * 0.46, -H * 0.33, L * 0.07, H * 0.66);
      g.poly([[-L * 0.39, -H * 0.36], [-L * 0.31, -H * 0.36], [-L * 0.29, -H * 0.3], [-L * 0.29, H * 0.3], [-L * 0.31, H * 0.36], [-L * 0.39, H * 0.36]], true); // porca sextavada
      g.line(-L * 0.39, -H * 0.12, -L * 0.29, -H * 0.12); g.line(-L * 0.39, H * 0.12, -L * 0.29, H * 0.12);
      g.poly([[-L * 0.29, -H * 0.28], [-L * 0.12, -H * 0.22], [-L * 0.12, H * 0.22], [-L * 0.29, H * 0.28]], true); // backshell
      g.rect(-L * 0.12, -H * 0.2, L * 0.08, H * 0.4); screw(g, -L * 0.08, -H * 0.26, H * 0.04); screw(g, -L * 0.08, H * 0.26, H * 0.04); // abraçadeira
      g.rect(-L * 0.04, -H * 0.13, L * 0.04, H * 0.26);
    } else if (k === 'term') {
      g.circle(-L * 0.8, 0, H * 0.42); g.circle(-L * 0.8, 0, H * 0.18);
      g.poly([[-L * 0.54, -H * 0.16], [-L * 0.42, -H * 0.3], [0, -H * 0.3], [0, H * 0.3], [-L * 0.42, H * 0.3], [-L * 0.54, H * 0.16]], true);
      g.line(-L * 0.25, -H * 0.3, -L * 0.25, H * 0.3);
    } else { g.rect(-L, -H / 2, L, H); g.line(-L, -H / 2, 0, H / 2); g.line(-L, H / 2, 0, -H / 2); }
  }
  // conector + leque (um traço por fio, curvo até a capa); wires = fios reais que saem do conector
  HX.physLineConn = function (g, spr, x, y, ux, uy, L, wires, col, c, jw) {
    var k = cls(spr), H;
    if (k === 'circ' || k === 'coax') H = Math.min(L * 0.75, Math.max(L * 0.32, L * HX.circOD(c) / 55)); else H = L * (k === 'term' ? 0.45 : k === 'dsub' ? 0.5 : 0.55);
    var F = HX.PHYS_FAN, J = (jw || HX.PHYS_JACKET) / 2, n = Math.max(1, Math.min(16, (wires && wires.length) || 6)), exitH = H * (k === 'dsub' ? 0.24 : k === 'term' ? 0.6 : 0.26);
    g.push([ux, uy, -uy, ux, x, y]);
    body(g, k, L, H, col);
    g.style({ stroke: col, lw: 0.12, fill: null });
    for (var i = 0; i < n; i++) {
      var f = n === 1 ? 0 : i / (n - 1) - 0.5, y0 = f * exitH, y1 = f * 2 * J * 0.8, P = [];
      for (var t = 0; t <= 8; t++) { var s = t / 8, e = s * s * (3 - 2 * s); P.push([F * s, y0 + (y1 - y0) * e]); }
      g.poly(P, false);
    }
    g.pop();
    var pts = [[-L, -H / 2], [-L, H / 2], [F, -H / 2], [F, H / 2]].map(function (q) { return [x + ux * q[0] - uy * q[1], y + uy * q[0] + ux * q[1]]; });
    return { x0: Math.min.apply(0, pts.map(function (q) { return q[0]; })), y0: Math.min.apply(0, pts.map(function (q) { return q[1]; })),
      x1: Math.max.apply(0, pts.map(function (q) { return q[0]; })), y1: Math.max.apply(0, pts.map(function (q) { return q[1]; })) };
  };
  // capa do cabo: contorno duplo ao longo do caminho (aparado no leque nas pontas com conector); jw = largura
  HX.physLineJacket = function (g, P, col, trimA, trimB, wide, jw) {
    var L = HX.polyLen(P); if (L < 1e-6) return;
    var a = Math.min(0.45, (trimA || 0) / L), b = Math.max(0.55, 1 - (trimB || 0) / L), N = Math.max(2, P.length * 2), J = (wide ? 1.4 : 1) * (jw || HX.PHYS_JACKET) / 2, up = [], dn = [];
    for (var i = 0; i <= N; i++) { var q = HX.polyAt(P, a + (b - a) * i / N); up.push([q.pt[0] - q.d[1] * J, q.pt[1] + q.d[0] * J]); dn.push([q.pt[0] + q.d[1] * J, q.pt[1] - q.d[0] * J]); }
    g.style({ stroke: col, lw: 0.25, fill: null, dash: null }); g.poly(up, false); g.poly(dn, false);
    if (trimA) g.line(up[0][0], up[0][1], dn[0][0], dn[0][1]); if (trimB) g.line(up[N][0], up[N][1], dn[N][0], dn[N][1]); // fim da capa
    if (wide) for (var k = 1; k < N; k += 2) { g.style({ lw: 0.12 }); g.line(up[k][0], up[k][1], dn[k + 1][0], dn[k + 1][1]); }
  };
  // vista frontal: D-Sub/Micro-D precisa (escala de detalhe k); circular: imagem do datasheet ou contorno
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, k) {
    if (HX.isDsub(c)) return HX.physDsubFace(g, c, x, y, k || 2, col);
    var im = HX.faceImgFor && HX.faceImgFor(c.part, c.gender);
    if (im && imgOK) { var h = w * im.h / im.w; if (g.image && g.image(im, x - w / 2, y - h / 2, w, h)) return { x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 }; }
    var r = w / 2; g.style({ stroke: col, lw: 0.25, fill: '#fff', dash: null }); g.circle(x, y, r); g.circle(x, y, r * 0.82); g.rect(x - r * 0.08, y - r * 0.98, r * 0.16, r * 0.22);
    g.style({ fill: null }); g.text('ver datasheet', x, y, { size: Math.min(1.6, r / 3), align: 'c', color: col });
    return { x0: x - r, y0: y - r, x1: x + r, y1: y + r };
  };
})(typeof window !== 'undefined' ? window : globalThis);
