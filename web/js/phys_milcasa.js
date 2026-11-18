/* HarnessCAD - MONTAGEM MIL NO PADRÃO DA CASA (prancha de referência): CONECTOR → ADAPTADOR (onde a cordoalha é emendada
   com LUVA DE SOLDA e amarrada com BARBANTE, por dentro) → BOTA por cima. Desenho em traço, proporções medidas na prancha:
   • conector MS (MS3476/MS26482/MS5015): ressalto da face, porca com recartilhado em diamante e ponto de trava, corpo
     traseiro e cauda (medidas TÍPICAS por carcaça até o datasheet oficial);
   • adaptador: anel de rosca, corpo liso, estrias retas (traços ao longo do eixo) e anel liso, 0,87 do comprimento do
     conector, encostado nele;
   • bota Raychem 202K (TE): cilindro no Ø do adaptador, afunila em curva até o pescoço (Ø J recuperado) — PN na lista.
   Luva de solda e barbante ficam dentro da bota: entram só na lista de materiais (um de cada por adaptador). */
(function (G) {
  'use strict';
  var HX = G.HX, V = HX.PHYS_VEC, PDS = HX.PDS; if (!V || !PDS || !PDS.ms_ad) return;
  function S() { return HX.physVecST() || { col: '#222', metal: '#fff', boot: '#fff', line: true }; }
  function st(g, lw, f) { var s = S(); g.style({ stroke: s.col, lw: lw, fill: f === undefined ? null : f, dash: null }); }
  function box(g, x, y, w, h) { st(g, 0.22, S().line ? '#fff' : S().metal); g.rect(x, y, w, h); g.style({ fill: null }); }
  function ln(g, a, b, c, d, lw) { st(g, lw || 0.08); g.line(a, b, c, d); }
  var plugK = { '': 1, 76: 1, '16F': 1, '06A': 1 };
  var df0 = HX.physDSFor;
  HX.physDSFor = function (nd, c) {
    var d = c && HX.CAT.conns[c.part], s = HX.physVecST && HX.physVecST();
    if (d && /^(MS3476|MS26482)$/.test(d.fam) && !nd.dsImg && s && s.vec) { var v = c.variant || ''; return plugK[v] ? 'ms_p' : /^(70|12E)$/.test(v) ? 'ms_rf' : 'ms_r'; }
    return df0(nd, c);
  };
  var so0 = HX.shellOf;
  HX.shellOf = function (c) { var d = c && HX.CAT.conns[c.part]; if (d && /^(MS3476|MS26482)$/.test(d.fam)) { var m = /^(\d+)/.exec(d.ins || d.label || ''); if (m) return +m[1]; } return so0(c); };
  /* adaptador: separado, encostado no conector (sem rabicho aparente: a cordoalha fica dentro da bota) */
  PDS.ms_ad.n = 'Adaptador de cordoalha (reto)'; PDS.ms_ad.ov = 0;
  PDS.ms_ad.L = function (sh) { return Math.round((PDS.ms_p ? PDS.ms_p.L(sh) : 40) * 0.87 * 10) / 10; };
  PDS.ms_ad.H = function (sh) { return Math.round(HX.msNutD(sh) * 0.93 * 10) / 10; };
  if (PDS.rc_202K) PDS.rc_202K.ov = 0.06;
  /* conector MS: face (ressalto), porca recartilhada em diamante com ponto de trava, corpo traseiro, cauda */
  V.ms_p = function (g, x, y, W, H) {
    var c = y + H / 2, a = W * 0.14, b = W * 0.58, d = W * 0.87;
    box(g, x, c - H * 0.4, a, H * 0.8); ln(g, x + a * 0.35, c - H * 0.4, x + a * 0.35, c + H * 0.4, 0.1);
    box(g, x + a, y, b - a, H);
    var n = Math.max(6, Math.round((b - a) / 0.8)), sp = (b - a) / n; /* recartilhado em diamante */
    for (var i = -n; i <= 2 * n; i++) { var x0 = x + a + i * sp; [[x0, y, x0 + H * 0.45, y + H], [x0 + H * 0.45, y, x0, y + H]].forEach(function (q) {
      var t0 = Math.max(0, (x + a - q[0]) / (q[2] - q[0])), t1 = Math.min(1, (x + b - q[0]) / (q[2] - q[0])); if (q[2] < q[0]) { t0 = Math.max(0, (q[0] - x - b) / (q[0] - q[2])); t1 = Math.min(1, (q[0] - x - a) / (q[0] - q[2])); }
      if (t1 > t0) ln(g, q[0] + (q[2] - q[0]) * t0, q[1] + (q[3] - q[1]) * t0, q[0] + (q[2] - q[0]) * t1, q[1] + (q[3] - q[1]) * t1, 0.06); }); }
    box(g, x + b, c - H * 0.475, d - b, H * 0.95); st(g, 0.12); g.circle(x + b + (d - b) * 0.55, c + H * 0.33, H * 0.025);
    box(g, x + d, c - H * 0.37, W - d, H * 0.74);
    if (HX.vaAxis) HX.vaAxis(g, x - 1, x + W + 1, c);
  };
  /* adaptador de cordoalha: anel de rosca, corpo liso, estrias retas, anel liso */
  V.ms_ad = function (g, x, y, W, H) {
    var c = y + H / 2, r = W * 0.08, p = W * 0.27, q = W * 0.7;
    box(g, x, c - H * 0.39, r, H * 0.78); box(g, x + r, y, p - r, H); box(g, x + p, y, q - p, H);
    for (var i = 1; i < 9; i++) ln(g, x + p, y + H * i / 9, x + q, y + H * i / 9, 0.07); /* estrias retas (ao longo do eixo) */
    box(g, x + q, c - H * 0.48, W - q, H * 0.96);
  };
  /* bota Raychem 202K: cilindro + concordância em curva até o pescoço (Ø J) */
  V.rc_202K = function (g, x, y, W, H) {
    var c = y + H / 2, sh = S(), nd = HX._milBootJ || 0.3, hn = H * nd / 2, xb = x + W * 0.62, xn = x + W * 0.9, P = [[x, c - H / 2], [xb, c - H / 2]], k;
    for (k = 1; k <= 12; k++) { var t = k / 12, e = 1 - Math.pow(1 - t, 2.2); P.push([xb + (xn - xb) * t, c - H / 2 + (H / 2 - hn) * e]); }
    P.push([x + W, c - hn]); var Q = P.map(function (q) { return [q[0], 2 * c - q[1]]; }).reverse();
    g.style({ stroke: sh.col, lw: 0.22, fill: sh.line ? '#fff' : (sh.boot || '#2f2f2f'), dash: null }); g.poly(P.concat(Q), true); g.style({ fill: null });
    ln(g, x + W * 0.04, c - H / 2, x + W * 0.04, c + H / 2, 0.08); /* lábio sobre o adaptador */
  };
  /* Ø do pescoço da bota pela tabela Raychem (J recuperado / Ø do corpo) */
  var as0 = HX.physAssembly;
  HX.physAssembly = function (nd, c, line) {
    var E = as0.apply(this, arguments); if (!E) return E;
    E.forEach(function (e) { if (e.id === 'rc_202K') { var sh = HX.shellOf(c), r = HX.rcBootFor('202K', HX.msAdOD(sh)); HX._milBootJ = Math.max(0.22, Math.min(0.6, (r[3] * 2.2) / (HX.msAdOD(sh) + 2))); } });
    return E;
  };
  /* folha nova da casa: conectores MIL recebem adaptador de cordoalha + bota (o usuário pode trocar no nó) */
  HX.physMilCasa = function (doc, sh) {
    var S = HX.physSchem(doc.p), n = 0;
    sh.items.forEach(function (i) { var c = i.type === 'pnode' && i.nkind === 'conn' && S[i.of], d = c && HX.CAT.conns[c.part];
      if (d && /^(MS3476|MS26482|MS5015|D38999)$/.test(d.fam) && !i.bsKind && !i.bootKind) { i.bsKind = d.fam === 'MS3476' && PDS.pre_j ? 'pre_j' : d.fam === 'D38999' && PDS.pre_l ? 'pre_l' : 'ms_ad'; i.bootKind = 'rc_202K'; n++; } });
    return n;
  };
  /* lista de materiais: luva de solda + barbante por adaptador (dentro da bota) */
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh), n = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn' && /^(ms_ad|pre_j|pre_l)$/.test(i.bsKind); });
    if (!n.length) return B; B.assoc = B.assoc || {};
    [['ss:' + (sh.ssPN || ''), sh.ssPN || '', 'Luva de solda (cordoalha no adaptador)', 1, 'pç'], ['barb:' + (sh.barbPN || ''), sh.barbPN || '', 'Barbante sintético (amarração da cordoalha)', +sh.barbM || 0.25, 'm']].forEach(function (d) {
      var r = B.key[d[0]]; if (!r) { r = { k: d[0], pn: d[1], desc: d[2], qty: 0, un: d[4] }; B.rows.push(r); B.key[d[0]] = r; }
      n.forEach(function (i) { r.qty = Math.round((r.qty + d[3]) * 100) / 100; });
    });
    B.rows.forEach(function (r, j) { r.n = j + 1; }); return B;
  };
})(typeof window !== 'undefined' ? window : globalThis);
