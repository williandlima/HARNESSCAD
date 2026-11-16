/* HarnessCAD - desenho físico: IMAGENS REAIS DE DATASHEET e MONTAGEM DO CONECTOR (conector + backshell + bota).
   Desenhos de linha recortados dos catálogos MIL-DTL-38999 (Amphenol Aerospace: pp. 49, 50, 52, 53; Glenair seção H:
   770-001 botas termo-retráteis reta/90°, 620-048 alívio de tensão reto), só a geometria (cotas e textos removidos), e fotos
   reais dos conectores. Tamanho REAL por tamanho de carcaça, das tabelas dos mesmos catálogos (mm).
   Cada imagem: e0/a0 = entrada (lado do conector) e direção do fluxo; e1/a1 = saída para o cabo (coordenadas 0..1, graus).
   Nó do conector: dsImg ('' automático / id / 'off'), bsKind (backshell), bootKind (bota). Folha: connScale ('' auto, 'real', fator). */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT, D2R = Math.PI / 180, IN = 25.4;
  function sz(a) { return function (sh) { var i = Math.max(0, Math.min(8, Math.round(((+sh || 13) - 9) / 2))); return a[i]; }; }
  function inch(a) { return a.map(function (v) { return Math.round(v * IN * 10) / 10; }); }
  var A = 'Amphenol Aerospace, catálogo MIL-DTL-38999, p. ', GL = 'Glenair, catálogo MIL-DTL-38999 seção H, ';
  HX.PDS = {
    d38_26: { n: 'D38999/26 plugue reto', src: A + '53', l: 'plug_l', p: 'plug_p', L: sz([31.9, 31.9, 31.9, 31.9, 31.9, 31.9, 31.9, 31.9, 31.9]), H: sz([21.8, 25.0, 29.4, 32.5, 35.7, 38.5, 41.7, 44.9, 48.0]), kind: 'conn' },
    d38_24: { n: 'D38999/24 receptáculo porca (jam nut)', src: A + '52', l: 'jam_l', p: 'jam_p', L: sz([32.5, 32.5, 32.5, 32.5, 32.5, 32.5, 32.5, 32.5, 32.5]), H: sz([30.45, 35.2, 38.38, 41.55, 44.73, 49.5, 52.65, 55.85, 59.0]), kind: 'conn' },
    d38_20: { n: 'D38999/20 receptáculo flange (parede)', src: A + '49', l: 'wall_l', p: 'wall_p', L: sz([31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5]), H: sz(inch([0.948, 1.043, 1.137, 1.232, 1.323, 1.449, 1.575, 1.701, 1.823])), kind: 'conn' },
    tv01: { n: 'TV01 receptáculo de linha (em linha)', src: A + '50', l: 'line_l', p: 'line_p', L: sz([31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5, 31.5]), H: sz(inch([0.812, 0.905, 1.093, 1.219, 1.375, 1.469, 1.625, 1.75, 1.875])), kind: 'conn' },
    sr_s: { n: 'Alívio de tensão reto (Glenair 620-048)', src: GL + 'H-24', l: 'sr_s_l', L: sz([21.1, 21.6, 22.9, 22.9, 23.9, 25.9, 27.2, 30.2, 31.0]), H: sz([19.8, 21.1, 25.1, 26.6, 33.5, 36.9, 39.5, 42.0, 45.1]), kind: 'bs', ov: 0.3 },
    boot_s: { n: 'Bota termo-retrátil reta (Glenair 770-001 S)', src: GL + 'H-5', l: 'boot_s_l', L: sz([38, 55, 55, 55, 67, 80, 80, 99, 130]), kind: 'boot', ov: 0.32 },
    boot_90: { n: 'Bota termo-retrátil 90° (Glenair 770-001 A)', src: GL + 'H-6', l: 'boot_90_l', L: sz([25, 32, 32, 32, 39, 49, 49, 55, 80]), kind: 'boot', ov: 0.18, e0: [0.2, 1], a0: -90, e1: [1, 0.235], a1: 0 }
  };
  var PX = { plug_l: [420, 280], jam_l: [380, 316], wall_l: [420, 314], line_l: [420, 245], boot_s_l: [420, 151], boot_90_l: [380, 304], sr_s_l: [340, 325], plug_p: [124, 138], jam_p: [119, 148], wall_p: [129, 162], line_p: [121, 123] };
  HX.PDS_IMG = {}; Object.keys(PX).forEach(function (k) { HX.PDS_IMG[k] = { id: k, url: 'img/ds/' + k + '.png', w: PX[k][0], h: PX[k][1] }; });
  // também na paleta de imagens (Inserir item) e na lista de imagens do nó
  HX.PSPR_CATS.ds = 'Datasheet (real)';
  HX.HITPR.pnode = 1.6; // clicar no corpo do conector seleciona o conector, não o ramo que chega nele
  Object.keys(HX.PDS).forEach(function (k) {
    var d = HX.PDS[k], im = HX.PDS_IMG[d.l];
    HX.PSPR['ds_' + k] = { id: 'ds_' + k, name: d.n + ' — desenho', w: im.w, h: im.h, ey: d.e1 ? d.e1[1] : 0.5, len: d.L(13), cat: 'ds', url: im.url, ds: k };
    if (d.p) { var ph = HX.PDS_IMG[d.p]; HX.PSPR['dsp_' + k] = { id: 'dsp_' + k, name: d.n + ' — foto', w: ph.w, h: ph.h, ey: 0.5, len: d.L(13), cat: 'ds', url: ph.url, ds: k, photo: true }; }
  });
  HX.shellOf = function (c) { var d = c && HX.CAT.conns[c.part]; var m = /^(\d+)-/.exec((d && (d.ins || d.label)) || ''); return m ? +m[1] : 13; };
  // imagem de datasheet do conector (null = não há)
  HX.physDSFor = function (nd, c) {
    if (nd.dsImg === 'off') return null; if (nd.dsImg && HX.PDS[nd.dsImg]) return nd.dsImg;
    var s = HX.PSPR[nd.sprite]; if (s && s.ds) return s.ds;
    var d = c && HX.CAT.conns[c.part]; if (!d || d.fam !== 'D38999') return null;
    return { 26: 'd38_26', 24: 'd38_24', 23: 'd38_24', 20: 'd38_20', '': 'd38_26' }[c.variant || ''] || null;
  };
  // elementos da montagem, de fora (lado do cabo) para dentro (conector)
  HX.physAssembly = function (nd, c, line) {
    var k = HX.physDSFor(nd, c), user = c && HX.PHYS_USER && HX.PHYS_USER[c.part], spr = HX.PSPR[nd.sprite], sh = HX.shellOf(c), out = [];
    if (nd.bootKind && HX.PDS[nd.bootKind]) out.push(el(nd.bootKind));
    if (nd.bsKind && HX.PDS[nd.bsKind]) out.push(el(nd.bsKind));
    if (k && !user && (line || HX.PDS[k].p)) out.push(el(k, !line && HX.PDS[k].p));
    else if (!line && out.length && (user || (spr && !spr.ds))) { var u = user || spr; out.push({ im: u, L: +nd.size || u.len || 50, H: (+nd.size || u.len || 50) * u.h / u.w, e0: [0, u.ey == null ? 0.5 : u.ey], a0: 0, e1: [u.mirror ? 0 : 1, u.ey == null ? 0.5 : u.ey], a1: u.mirror ? 180 : 0, conn: 1, mir: !!u.mirror }); }
    else return null;
    if (!out[out.length - 1].conn) return null;
    return out;
    function el(id, photo) {
      var d = HX.PDS[id], im = HX.PDS_IMG[photo ? d.p : d.l], L = d.L(sh), H = d.H ? d.H(sh) : L * im.h / im.w;
      if (d.kind === 'conn' && +nd.size) { H *= +nd.size / L; L = +nd.size; }
      return { im: im, L: L, H: H, e0: d.e0 || [0, 0.5], a0: d.a0 || 0, e1: d.e1 || [1, 0.5], a1: d.a1 || 0, ov: d.ov || 0, conn: d.kind === 'conn', id: id };
    }
  };
  // fator de ampliação: conector com comprimento mínimo no papel (desenhos de chicote costumam ampliar o conector)
  HX.physConnK = function (sh, L, N, line) { var v = sh.connScale; if (v === 'real') return 1; if (+v > 0) return +v; return Math.max(1, (line ? 24 : 20) / (L / N)); };
  // desenha a montagem com a saída em (x, y) e o fluxo no ângulo ang (graus); devolve a caixa
  HX.physDrawAssembly = function (g, E, x, y, ang, N, k, flip) {
    var s = k / N, P = [x, y], th = ang, f = (Math.cos(ang * D2R) < -1e-6) !== !!flip ? -1 : 1, pts = [], draws = [];
    E.forEach(function (e) {
      var W = e.L * s, H = e.H * s, rho = th - e.a1 * f, r = rho * D2R, c = Math.cos(r), sn = Math.sin(r);
      var M = [c, sn, -sn * f, c * f, P[0], P[1]], x0 = -e.e1[0] * W, y0 = -e.e1[1] * H;
      draws.push([M, e.im, x0, y0, W, H]);
      [[x0, y0], [x0 + W, y0], [x0, y0 + H], [x0 + W, y0 + H]].forEach(function (q) { pts.push([P[0] + c * q[0] - sn * f * q[1], P[1] + sn * q[0] + c * f * q[1]]); });
      var ex = (e.e0[0] - e.e1[0]) * W, ey = (e.e0[1] - e.e1[1]) * H, ea = rho + e.a0 * f, back = (e.ov || 0) * W;
      P = [P[0] + c * ex - sn * f * ey + Math.cos(ea * D2R) * back, P[1] + sn * ex + c * f * ey + Math.sin(ea * D2R) * back]; th = ea;
    });
    for (var i = draws.length - 1; i >= 0; i--) { var d = draws[i]; g.push(d[0]); var ok = g.image ? g.image(d[1], d[2], d[3], d[4], d[5]) : false; if (!ok) { g.style({ stroke: '#888', lw: 0.2, fill: null, dash: [0.8, 0.6] }); g.rect(d[2], d[3], d[4], d[5]); g.style({ dash: null }); } g.pop(); }
    var xs = pts.map(function (q) { return q[0]; }), ys = pts.map(function (q) { return q[1]; });
    return { x0: Math.min.apply(0, xs), y0: Math.min.apply(0, ys), x1: Math.max.apply(0, xs), y1: Math.max.apply(0, ys), inner: P };
  };
  var d0 = EXT.pnode.draw;
  EXT.pnode.draw = function (g, it, p, s, o) {
    if (it.nkind !== 'conn') return d0(g, it, p, s, o);
    var C = HX.physCtx(p, s, o), c = C.S[it.of], E = HX.physAssembly(it, c, C.line);
    if (!E) return d0(g, it, p, s, o);
    var cn = E[E.length - 1], k = HX.physConnK(C.sh, cn.L, C.N, C.line), ang = HX.physAngle(it, C.sh.items), r = ang * D2R;
    var bb = HX.physDrawAssembly(g, E, it.x, it.y, ang, C.N, k, it.flip);
    var BU = HX.physBundleCtx(p, s, o), ws = BU.node[it.id] || [], sg = C.sh.items.filter(function (i) { return i.type === 'pseg' && (i.a === it.id || i.b === it.id); })[0], bw = HX.bundleW(sg && BU.seg[sg.id] ? BU.seg[sg.id].od : 0);
    if (HX.physFan) HX.physFan(g, it.x, it.y, Math.cos(r), Math.sin(r), ws, Math.min(E[0].H * k / C.N * 0.3, bw * 1.2), bw);
    HX.physHide(it, '_bb', bb); HX.physHide(it, '_L', Math.hypot(bb.x1 - bb.x0, bb.y1 - bb.y0)); HX.physHide(it, '_k', k);
  };
  // lista de materiais: acessórios escolhidos pela imagem entram mesmo sem PN digitado
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var B = bom(p, sh);
    sh.items.forEach(function (i) {
      if (i.type !== 'pnode' || i.nkind !== 'conn') return;
      [['bsKind', 'backshell'], ['bootKind', 'boot']].forEach(function (f) {
        var d = HX.PDS[i[f[0]]]; if (!d || i[f[1]]) return; var shl = HX.shellOf(HX.physSchem(p)[i.of]), key = 'd:' + i[f[0]] + ':' + shl, r = B.key[key];
        if (!r) { var pq = d.pnOf ? d.pnOf(shl) : ''; r = { k: key, pn: pq, desc: d.n + ' — carcaça ' + shl + (pq ? '' : ' (definir PN)'), qty: 0, un: 'pç' }; B.rows.push(r); B.key[key] = r; }
        r.qty++; B.assoc = B.assoc || {}; (B.assoc[i.id] = B.assoc[i.id] || []).push(key);
      });
    });
    B.rows.forEach(function (r, j) { r.n = j + 1; });
    return B;
  };
})(typeof window !== 'undefined' ? window : globalThis);
