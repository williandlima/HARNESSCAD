/* HarnessCAD - ao gerar/atualizar o desenho físico: tira pontos de ramificação que sobraram (sem ramo ou ponta de
   ramo sem conector) e, se a disposição estiver contrária ao esquemático (deitado × em pé ou lados
   trocados) ou for uma geração nova, reposiciona como no esquemático (phys_schemlayout.js). */
(function (G) {
  'use strict';
  var HX = G.HX;
  // nós de ramificação que sobraram: sem ramo ou na ponta de um ramo sem conector saem; BR com só 2 ramos é juntado
  HX.physDropStrays = function (doc, sh) {
    var n = 0, go = true;
    while (go) { go = false; var m = HX.physIdx(sh);
      sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind !== 'conn'; }).forEach(function (nd) {
        var sg = HX.physSegsOf(sh, nd.id); if (sg.length > 1 || !m[nd.id]) return; var k = [nd.id].concat(sg.map(function (x) { return x.id; }));
        sh.items = sh.items.filter(function (i) { return k.indexOf(i.id) < 0 && k.indexOf(i.of) < 0 && k.indexOf(i.seg) < 0 && !(i.type === 'pdim' && (k.indexOf(i.a) >= 0 || k.indexOf(i.b) >= 0)); }); n++; go = true; m = HX.physIdx(sh);
      }); }
    return n;
  };
  function mismatch(p, sh) { // disposição contrária ao esquemático (deitado × em pé, ou lados trocados)
    var S = HX.physSchem(p), cs = sh.items.filter(function (n) { return n.type === 'pnode' && n.nkind === 'conn' && S[n.of]; }); if (cs.length < 2) return false;
    var sc = cs.map(function (n) { return HX.physSchCenter(S[n.of], p); }), sp = function (A, i) { var v = A.map(function (q) { return q[i]; }); return Math.max.apply(0, v) - Math.min.apply(0, v); };
    var P = cs.map(function (n) { return [n.x, n.y]; }), sx = sp(sc, 0), sy = sp(sc, 1), px = sp(P, 0), py = sp(P, 1);
    if ((sx > 2 * sy && py > 2 * px) || (sy > 2 * sx && px > 2 * py)) return true;
    var c = 0; for (var i = 0; i < cs.length; i++) for (var j = i + 1; j < cs.length; j++) c += (sc[i][0] - sc[j][0]) * (P[i][0] - P[j][0]) + (sc[i][1] - sc[j][1]) * (P[i][1] - P[j][1]);
    return c < 0;
  }
  var ap = HX.applyPhysical;
  HX.applyPhysical = function (doc, opt) {
        var r = ap(doc, opt); if (!r || r.index == null || !doc.p.sheets[r.index]) return r;
    var sh = doc.p.sheets[r.index], cur = doc.sheet; doc.sheet = r.index;
    try {
      var k = HX.physDropStrays(doc, sh); if (k && r.warn) r.warn.push(k + ' ponto(s) de ramificação sobrando removido(s).');
      if (!r.synced || mismatch(doc.p, sh)) { HX.physLayoutLikeSchem(doc, sh); if (r.synced && r.warn) r.warn.push('Conectores e derivações reposicionados como no esquemático.'); }
    } finally { doc.sheet = cur; }
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
