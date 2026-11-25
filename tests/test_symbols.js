/* HarnessCAD - testes dos estilos de símbolo novos e do catálogo ampliado */
'use strict';
var L = require('./lib'), HX = L.HX, test = L.test, eq = L.eq, ok = L.ok;
var NEW = ['ansi', 'mil', 'terminal', 'compact', 'circular', 'altium', 'orcad'];
function rec() { var n = { t: 0, x: [] }; return { n: n, style: function () {}, line: function () { n.t++; }, poly: function () { n.t++; }, rect: function () { n.t++; },
  circle: function () { n.t++; }, text: function (s) { n.x.push(String(s)); }, push: function () {}, pop: function () {} }; }
test('estilos novos registrados no menu e desenháveis', function () {
  var ids = HX.CONN_STYLES.map(function (s) { return s[0]; });
  NEW.forEach(function (s) { ok(ids.indexOf(s) >= 0, s + ' no menu'); ok(typeof HX.SYMBOLS[s] === 'function', s); });
});
test('cada estilo novo desenha ref e todos os números de pino, lados R/L/B e rotações', function () {
  var d = new HX.Doc();
  NEW.forEach(function (st) { ['DSUB:DE-9', 'D38999:11-35', 'MSTB:6 vias'].forEach(function (k, i) {
    var c = d.add(HX.makeConn(d, k, 0, 0)); c.gstyle = st; c.rot = i * 90;
    if (i === 2) c.side = 'B';
    var g = rec(); HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    ok(g.n.t > 5, st + ' desenhou');
    c.pins.forEach(function (q) { ok(g.n.x.indexOf(String(q.n)) >= 0 || st === 'circular' && g.n.x.join(' ').indexOf(q.n) >= 0, st + ' pino ' + q.n); });
  }); });
});
test('PDF com todos os estilos (cor e P&B)', function () {
  var d = new HX.Doc(); d.p.meta.size = 'A2';
  NEW.forEach(function (st, i) { var c = d.add(HX.makeConn(d, 'DT:4 vias', 20 + i * 60, 30)); c.gstyle = st;
    var b = d.add(HX.makeConn(d, 'MSTB:4 vias', 20 + i * 60, 120)); b.gstyle = st; b.side = 'B'; });
  [false, true].forEach(function (m) { ok(HX.exportPDF(d.p, { mono: m, wirelist: false, bom: true }).length > 3000); });
});
test('catálogo ampliado: famílias novas presentes, pinos únicos', function () {
  ['MS3476:14-19', 'HAN:16E', 'M12X:X 8p', 'DIN41612:96p (a+b+c)', 'AT:6 vias', 'OBD:16p', 'J1939:9p', 'POWER:XT60', 'AV:Speakon NL4', 'JST-SH:4 vias', 'PICO:6 vias'].forEach(function (k) {
    ok(HX.CAT.conns[k], k);
  });
  Object.keys(HX.CAT.conns).forEach(function (k) { var e = HX.CAT.conns[k], s = {};
    e.pins.forEach(function (q) { ok(!s[q.n], k + ' pino repetido ' + q.n); s[q.n] = 1; }); });
  eq(HX.CAT.conns['DIN41612:96p (a+b+c)'].n, 96); eq(HX.CAT.conns['OBD:16p'].pins[5].name, 'CAN-H');
  eq(HX.searchConns('obd').length + HX.searchConns('harting').length, 0, 'famílias sem datasheet fora da pesquisa (definição continua para projetos antigos)');
});
test('conector do catálogo novo vira componente e gera PN', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'MS3476:14-19', 0, 0));
  ok(/MS3476L14-19/.test(HX.connPN(c)), HX.connPN(c)); eq(c.pins.length, 19);
});
test('Altium e OrCAD aceitam pinos dos dois lados e desenham nº em cada terminal', function () {
  var d = new HX.Doc();
  ['altium', 'orcad'].forEach(function (st) {
    var c = d.add(HX.makeConn(d, 'MSTB:4 vias', 0, 0)); c.gstyle = st; c.side = 'B';
    var n = 0, g = { style: function () {}, line: function () {}, poly: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {},
      text: function (s) { if (/^[1-4]$/.test(String(s))) n++; } };
    HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    eq(n, 8, st);
  });
});
function capture(c, p) {
  var T = [], Rr = [], g = { style: function () {}, line: function () {}, poly: function () {}, circle: function () {}, push: function () {}, pop: function () {},
    rect: function (x, y, w, h) { Rr.push([x, y, w, h]); }, text: function (s, x, y, o) { T.push({ s: String(s), x: x, y: y, o: o || {} }); } };
  HX.drawConn(g, c, p, null, { theme: HX.THEME, connected: new Set() });
  return { t: T, r: Rr };
}
test('todo estilo põe o nº do pino do lado e na altura do seu terminal (R, L e B)', function () {
  var d = new HX.Doc();
  HX.CONN_STYLES.forEach(function (s) { ['R', 'L', 'B'].forEach(function (side) {
    if (side === 'B' && !(HX.SYM_BOTH || {})[s[0]]) return;
    var c = d.add(HX.makeConn(d, 'DSUB:DE-9', 0, 0)); c.gstyle = s[0]; c.side = side; c.wu = 14;
    var L = HX.connLayout(c, d.p.unit), cap = capture(c, d.p);
    L.pins.forEach(function (pn) {
      var hit = cap.t.some(function (t) { return t.s === String(pn.n) && Math.abs(t.y - pn.ly) < L.p / 2 && (pn.side === 'R' ? t.x >= L.w / 2 - 1 : t.x <= L.w / 2 + 1); });
      ok(hit, s[0] + ' lado ' + side + ': pino ' + pn.n + ' fora do lugar');
    });
  }); });
});
test('Altium: receptáculo da fêmea nunca cobre o nº do pino (nºs longos, texto grande)', function () {
  var d = new HX.Doc(); d.p.view.pinSize = 'x';
  ['DIN41612:96p (a+b+c)', 'HAN:16E', 'M12X:X 8p', 'DSUB:DE-9'].forEach(function (k) {
    var c = d.add(HX.makeConn(d, k, 0, 0)); c.gstyle = 'altium'; c.gender = 'S';
    var cap = capture(c, d.p), L = HX.connLayout(c, d.p.unit);
    cap.t.filter(function (t) { return t.y < L.h && c.pins.some(function (q) { return String(q.n) === t.s; }) && t.o.align === 'l'; }).forEach(function (t) {
      var x1 = t.x + HX.textW(t.s, t.o.size);
      cap.r.forEach(function (r) { if (Math.abs(r[1] + r[3] / 2 - (t.y + 0.45 + t.o.size * 0.5)) < 1) ok(r[0] >= x1 || r[0] + r[2] <= t.x, k + ' pino ' + t.s + ' coberto'); });
    });
  });
});
test('PN JST no padrão do fabricante', function () {
  var d = new HX.Doc(), pn = function (k) { return HX.connPN(d.add(HX.makeConn(d, k, 0, 0))); };
  eq([pn('JST-SH:4 vias'), pn('JST-GH:4 vias'), pn('JST-PA:4 vias'), pn('JST-ZH:4 vias')], ['SHR-04V-S', 'GHR-04V-S', 'PAP-04V-S', 'ZHR-4']);
});
test('projeto novo: símbolo Padrão (universal); Altium largura 3, seta de engate dentro do corpo', function () {
  var d = new HX.Doc(); eq(d.p.view.connStyle, 'univ', 'Padrão = universal'); eq(HX.CONN_STYLES[0][0], 'univ'); ok(/^Padrão/.test(HX.CONN_STYLES[0][1])); d.p.view.connStyle = 'altium';
  var c = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)); eq(c.wu, 3); eq(HX.connStyle(c, d.p), 'altium');
  ['P', 'S'].forEach(function (gd) {
    c.gender = gd; var polys = [], g = { style: function () {}, line: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, text: function () {},
      poly: function (pts) { polys.push(pts); } };
    HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    var L = HX.connLayout(c, d.p.unit), ch = polys.filter(function (q) { return q.length === 3; });
    eq(ch.length, 4, 'um símbolo por pino');
    ch.forEach(function (q) { ok(q[1][0] > 0 && q[1][0] < L.w / 2, 'dentro do corpo, à esquerda');
      ok(gd === 'P' ? q[1][0] < q[0][0] : q[1][0] > q[0][0], gd === 'P' ? 'macho: seta sai pela face de engate (<)' : 'fêmea: seta entra (>)'); });
  });
});
test('Altium símbolo único: um só > ou < no centro do corpo', function () {
  var d = new HX.Doc(), c = d.add(HX.makeConn(d, 'MicroFit:8 vias', 0, 0)); c.gstyle = 'altium1';
  [['P', -1], ['S', 1]].forEach(function (t) { // fios à direita: macho <, fêmea >
    c.gender = t[0]; var ch = [], g = { style: function () {}, line: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, text: function () {},
      poly: function (pts) { if (pts.length === 3) ch.push(pts); } };
    HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    var L = HX.connLayout(c, d.p.unit), q = ch[0];
    eq(ch.length, 1, 'um símbolo só');
    ok(Math.abs((q[0][0] + q[1][0]) / 2 - L.w / 2) < 0.01 && Math.abs(q[1][1] - (L.H + (L.h - L.H) / 2)) < 0.01, 'no centro');
    ok(t[1] > 0 ? q[1][0] > q[0][0] : q[1][0] < q[0][0], t[0] === 'P' ? 'macho <' : 'fêmea >');
  });
});
test('seta de engate acompanha o espelho: fios à esquerda → macho >, fêmea <', function () {
  var d = new HX.Doc();
  ['altium', 'altium1'].forEach(function (st) { [['P', 1], ['S', -1]].forEach(function (k) {
    var c = d.add(HX.makeConn(d, 'DT:4 vias', 0, 0)); c.gstyle = st; c.gender = k[0]; c.mx = true;
    var ch = [], g = { style: function () {}, line: function () {}, rect: function () {}, circle: function () {}, push: function () {}, pop: function () {}, text: function () {},
      poly: function (pts) { if (pts.length === 3) ch.push(pts); } };
    HX.drawConn(g, c, d.p, null, { theme: HX.THEME, connected: new Set() });
    ok(ch.length && ch.every(function (q) { return k[1] > 0 ? q[1][0] > q[0][0] : q[1][0] < q[0][0]; }), st + ' ' + k[0]);
  }); });
});
