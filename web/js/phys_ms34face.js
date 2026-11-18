/* HarnessCAD - MIL-DTL-26482 Série 2 (MS3470/3471/3474/3476): os 34 ARRANJOS DE INSERTO do catálogo Amphenol Matrix
   (pp. 3–5) no catálogo do programa, com letra e TAMANHO DE CADA CONTATO (#20, #16, #12, mistos inclusive), e a VISTA
   FRONTAL exata: traço da carcaça do PDF vetorial, contatos pela legenda do catálogo (#20 círculo Ø4, #16 cheio Ø6,
   #12 Ø8,8 meio cheio, em pontos da figura) e as letras na posição do catálogo. A figura do catálogo é a face de pinos
   (= traseira da de soquetes): a face de soquetes sai espelhada. */
(function (G) {
  'use strict';
  var HX = G.HX, F = HX.MS34F; if (!F || !HX.CAT || !HX.CAT.fams.MS3476) return;
  var DIA = { '20': 4.0, '16': 6.05, '12': 8.83 }, cache = {};
  function num(s) { return s.split(',').map(function (v) { return +v / 1000; }); }
  HX.ms34Face = function (ins) {
    var e = F[ins]; if (!e) return null; if (cache[ins]) return cache[ins];
    return (cache[ins] = { D: e.D, h: e.h / 1000, s: e.s ? e.s.split('|').map(function (t) { return { t: t[0], p: t.slice(1).split(' ').map(num) }; }) : [],
      p: e.p.split(';').map(function (t) { var a = t.split(':'); return { n: a[0], sz: a[1], x: +a[2] / 1000, y: +a[3] / 1000, lx: +a[4] / 1000, ly: +a[5] / 1000 }; }) });
  };
  /* catálogo: os 34 arranjos, pinos na ordem das letras e com o tamanho de cada um */
  var fam = HX.CAT.fams.MS3476, base = HX.CAT.conns['MS3476:20-41'] || {};
  Object.keys(F).forEach(function (ins) {
    var f = HX.ms34Face(ins), key = 'MS3476:' + ins, e = HX.CAT.conns[key] || Object.assign({}, base, { ins: ins, label: ins, key: key });
    e.pins = f.p.map(function (q) { return { n: q.n, name: '', sz: q.sz }; }); e.n = e.pins.length; e.ins = ins; e.label = ins; e.key = key;
    var S = {}; e.pins.forEach(function (q) { S[q.sz] = 1; }); e.sz = Object.keys(S).sort().reverse().join('/');
    e.desc = fam.desc + ' ' + ins; HX.CAT.conns[key] = e;
  });
  /* vista frontal */
  var lf = HX.physLineFace;
  HX.physLineFace = function (g, c, x, y, w, col, imgOK, k) {
    var d = c && HX.CAT.conns[c.part], f = d && d.fam === 'MS3476' && HX.ms34Face(d.ins); if (!f) return lf.apply(this, arguments);
    var r = w / 2, m = c.gender === 'S' ? -1 : 1, X = function (u) { return x + m * u * r; }, Y = function (v) { return y + v * r; }, pt = r / (f.D / 2);
    f.s.forEach(function (s) { g.style({ stroke: col, lw: s.t === 'o' ? 0.25 : 0.15, fill: s.t === 'f' ? col : null, dash: null }); g.poly(s.p.map(function (q) { return [X(q[0]), Y(q[1])]; }), s.t === 'f'); });
    f.p.forEach(function (q) { var cx = X(q.x), cy = Y(q.y), rr = DIA[q.sz] * pt / 2;
      if (q.sz === '16') { g.style({ stroke: col, lw: 0.15, fill: col }); g.circle(cx, cy, rr); }
      else { g.style({ stroke: col, lw: 0.15, fill: '#fff' }); g.circle(cx, cy, rr); }
      if (q.sz === '12') { var P = [], i; for (i = 0; i <= 12; i++) { var a = Math.PI * i / 12; P.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } g.style({ fill: col }); g.poly(P, true); }
      g.style({ fill: null }); g.text(q.n, X(q.lx), Y(q.ly) + f.h * r * 0.35, { size: Math.max(0.6, f.h * r * 0.95), align: 'c', color: col }); });
    return { x0: x - r, y0: y - r, x1: x + r, y1: y + r, geom: { shell: d.ins.split('-')[0] } };
  };
  if (HX.DS_OK) HX.DS_OK.faces = (HX.DS_OK.faces || []).concat(['MS3476']);
})(typeof window !== 'undefined' ? window : globalThis);
