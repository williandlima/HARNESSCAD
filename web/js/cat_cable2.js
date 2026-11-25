/* HarnessCAD - CABO DIRETO NOS PINOS: HX.cablePins(doc, mod, de, para, o) liga cada pino de "De" ao pino de mesma ordem de
   "Para" (ex.: De "J1:1,2" e Para "J2:1,2" → J1:1–J2:1 e J1:2–J2:2) pelo traçado da lista de fiação (HX.wtApply: sem curto,
   conferência das redes), e transforma essas vias em cabo (HX.cableApply: oval, trança em pares na ordem, PN). Opcional:
   o.dreno = "J1:9" liga o dreno da blindagem a esse pino. Quem chama faz o doc.change (um Ctrl+Z desfaz tudo). */
(function (G) {
  'use strict';
  var HX = G.HX;
  /* "J1:1,2 3; J2:A" → ['J1:1','J1:2','J1:3','J2:A'] (pino solto herda o conector anterior) */
  HX.cablePinList = function (s) { var out = [], ref = ''; String(s || '').split(/[\s,;]+/).forEach(function (t) { if (!t) return; var m = /^([A-Za-z][\w]*?)[:.](.+)$/.exec(t);
    if (m) { ref = m[1]; out.push(m[1] + ':' + m[2]); } else out.push(ref ? ref + ':' + t : t); }); return out; };
  function byId(sh, id) { for (var i = 0; i < sh.items.length; i++) if (sh.items[i].id === id) return sh.items[i]; return null; }
  function netMap(doc) { var nl = HX.buildNetlist(doc.p), m = {}; nl.nets.forEach(function (n) { n.pins.forEach(function (t) { if (t.item) m[(t.ref || t.item.ref) + ':' + t.pin] = n.id; }); }); return m; }
  function len(w) { var s = 0; for (var i = 1; i < w.pts.length; i++) s += Math.abs(w.pts[i][0] - w.pts[i - 1][0]) + Math.abs(w.pts[i][1] - w.pts[i - 1][1]); return s; }
  /* o oval não pode cair sobre outro cabo nem atravessar fio de fora (ex.: dreno de outro cabo): desliza ao longo das vias */
  function free(sh, c, ids, u) { var hz = c.h >= c.w, k0 = hz ? 'x' : 'y', v0 = c[k0];
    function ok() { var b = HX.bbox(c); return sh.items.every(function (i) { if (i === c) return true;
      if (i.type === 'cable') { var o = HX.bbox(i); return o.x1 < b.x0 - u || o.x0 > b.x1 + u || o.y1 < b.y0 - u || o.y0 > b.y1 + u; }
      if (i.type !== 'wire') return true; var hit = false; for (var j = 1; j < i.pts.length; j++) if (HX.segRect(i.pts[j - 1], i.pts[j], b)) hit = true; return ids.indexOf(i.id) >= 0 ? hit : !hit; }); }
    for (var n = 0; n <= 24; n++) { c[k0] = v0 + (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 2 * u; if (ok()) return true; } c[k0] = v0; return false; }
  HX.cablePins = function (doc, mod, de, para, o) {
    o = o || {}; mod = mod || HX.CABLE_LIB.BLD; var A = HX.cablePinList(de), B = HX.cablePinList(para), sh = doc.cur(), u = doc.p.unit || 2.5;
    if (!A.length) return { err: 'Informe os pinos de origem (De), ex.: J1:1,2' };
    if (A.length !== B.length) return { err: 'De tem ' + A.length + ' pino(s) e Para tem ' + B.length + ' — tem que ser o mesmo número (um para um, na ordem).' };
    var txt = A.map(function (a, i) { return a + ' > ' + B[i] + (o.gauge ? ' | ' + o.gauge : ''); }).join('\n'), P = HX.wtParse(doc, txt);
    if (P.errors.length) return { err: P.errors.map(function (e) { return 'par ' + e.line + ': ' + e.msg; }).join('\n') };
    if (P.conns.length) return { err: 'Conector não está na folha.' };
    var ids = [], failed = [];
    P.links.forEach(function (L, i) { var r = HX.wtApply(doc, { conns: [], links: [L] }); if (r.failed.length || !r.wires.length) { failed.push(A[i] + ' → ' + B[i]); return; }
      var w = r.wires.reduce(function (m, x) { return len(x) > len(m) ? x : m; }); ids.push(w.id); });
    var W = ids.map(function (id) { return byId(sh, id); }).filter(Boolean);
    if (!W.length) return { err: 'Não foi possível traçar as vias sem curto (' + failed.join(', ') + ').', failed: failed };
    var r = HX.cableApply(doc, W, mod, null, Object.assign({ model: o.model || '', tw: mod.tw }, o));
    if (!r || r.err) return { err: (r && r.err) || 'Não foi possível pôr o cabo.', wires: W, failed: failed };
    r.failed = failed; free(sh, r.cable, ids, u);
    if (o.dreno) { var D = HX.cablePinList(o.dreno)[0], q = /^(.+?):(.+)$/.exec(D || ''), c = q && sh.items.filter(function (i) { return i.type === 'conn' && i.ref === q[1]; })[0],
        lp = c && HX.connLayout(c, u).pins.filter(function (x) { return String(x.n) === q[2]; })[0], dp = HX.cableDrainPt(r.cable);
      if (!lp) r.drainErr = 'Pino do dreno "' + o.dreno + '" não encontrado.'; else if (!dp) r.drainErr = 'O cabo não tem dreno (sem blindagem ou dreno desligado).';
      else { var b = HX.bbox(c, u), d = lp.pt[0] >= (b.x0 + b.x1) / 2 ? 1 : -1, g = Math.max(u, 2.5), xs = HX.snap(lp.pt[0] + d * 2 * g, g), yb = Math.max(dp[1] + g, b.y1 + g);
        var snap = JSON.stringify(sh.items), n0 = netMap(doc), w = HX.ops.addWire(doc, HX.cleanPts([dp, [dp[0], yb], [xs, yb], [xs, lp.pt[1]], lp.pt]), {}), n1 = netMap(doc), k = q[1] + ':' + q[2], bad = false;
        /* conferência: só o pino do dreno pode ter entrado na rede do dreno */
        Object.keys(n1).forEach(function (pk) { if (pk !== k && n0[pk] != null && n1[pk] === n1[k] && n0[pk] !== n0[k] && n1[k] != null) bad = true; });
        if (!w || bad) { sh.items = JSON.parse(snap); r.drainErr = 'O fio do dreno até ' + k + ' cruzaria outra ligação — ligue o dreno com a ferramenta Fio.'; r.cable = byId(sh, r.cable.id); r.wires = r.wires.map(function (x) { return byId(sh, x.id); }); }
        else r.drainWire = w; } }
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
