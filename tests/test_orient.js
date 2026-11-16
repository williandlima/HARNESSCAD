/* HarnessCAD - rotação e espelhamento: texto sempre legível e pinos coerentes */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
var OR = [[0, 0, 0], [0, 1, 0], [0, 0, 1], [0, 1, 1], [90, 0, 0], [90, 1, 0], [90, 0, 1], [270, 0, 0]];
function mul(m, n) { return [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]]; }
// recorder com pilha de transformações: devolve a matriz de cada texto
function rec() {
  var st = [[1, 0, 0, 1, 0, 0]], out = [];
  return { out: out, style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {},
    push: function (m) { st.push(mul(st[st.length - 1], m)); }, pop: function () { st.pop(); },
    text: function (s) { out.push({ s: String(s), m: st[st.length - 1] }); } };
}
// legível: não espelhado (det > 0) e lendo da esquerda p/ direita ou de baixo p/ cima
function legivel(m) { var det = m[0] * m[3] - m[1] * m[2]; return det > 0 && (m[0] > Math.abs(m[1]) || m[1] < -Math.abs(m[0])); }
function check(key, style) {
  var d = new HX.Doc(), bad = [];
  OR.forEach(function (o) {
    var c = d.add(HX.makeConn(d, key, 0, 0)); if (style) c.gstyle = style; c.rot = o[0]; c.mx = !!o[1]; c.my = !!o[2];
    var g = rec(); HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    g.out.forEach(function (t) { if (!legivel(t.m)) bad.push(o.join('/') + ' "' + t.s + '"'); });
  });
  return bad;
}
test('equipamentos: todo texto legível em qualquer rotação/espelho', function () {
  Object.keys(HX.CAT.conns).filter(function (k) { return /^EQUIP:/.test(k); }).forEach(function (k) {
    var b = check(k); ok(!b.length, k + ': ' + b.slice(0, 3).join(', '));
  });
});
test('conectores: todo texto legível em todos os estilos e orientações', function () {
  HX.CONN_STYLES.forEach(function (s) { ['DSUB:DE-9', 'MSTB:4 vias'].forEach(function (k) { var b = check(k, s[0]); ok(!b.length, s[0] + ' ' + k + ': ' + b.slice(0, 3).join(', ')); }); });
});
test('equipamento espelhado: pinos continuam sobre os bornes da figura (simétricos)', function () {
  var d = new HX.Doc(), k = 'EQUIP:Conversor USB-RS422/485 isolado (borne 5 vias)';
  var a = d.add(HX.makeConn(d, k, 0, 0)), b = d.add(HX.makeConn(d, k, 0, 0)); b.mx = true;
  var La = HX.connLayout(a, d.p.unit), Lb = HX.connLayout(b, d.p.unit), cx = La.w / 2;
  La.pins.forEach(function (pa) { var pb = Lb.pins.filter(function (q) { return q.n === pa.n; })[0];
    ok(Math.abs(pb.lx - (2 * cx - pa.lx)) < 1e-6 && pb.ly === pa.ly && pb.ldir[0] === -pa.ldir[0], pa.n); });
});
test('componentes discretos: texto legível em qualquer rotação/espelho', function () {
  Object.keys(HX.CAT.conns).filter(function (k) { return /^DISC:/.test(k); }).forEach(function (k) { var b = check(k); ok(!b.length, k + ': ' + b.slice(0, 3).join(', ')); });
});
