/* HarnessCAD - desenho físico: ATUALIZAR DO ESQUEMÁTICO sem refazer o chicote.
   A topologia (ramos, derivações, posições, comprimentos) pertence ao desenho físico e não é tocada.
   Só sincroniza o que é elétrico: conector/emenda novo entra num ramo novo, ligado ao nó com quem mais compartilha
   circuitos; removido sai (emenda intermediária vira BR, mantendo o traçado); referências e imagens atualizadas. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.physSync = function (doc, sh, opt) {
    opt = opt || {};
    var p = doc.p, S = HX.physSchem(p), warn = [], m = HX.physIdx(sh), byOf = {}, N = +sh.scale || 1;
    sh.items.forEach(function (i) { if (i.type === 'pnode' && i.of) byOf[i.of] = i; });
    // removidos
    sh.items.filter(function (n) { return n.type === 'pnode' && n.of && !S[n.of] && n.nkind !== 'virt'; }).forEach(function (n) {
      var k = HX.physSegsOf(sh, n.id).length;
      if (k >= 2) { warn.push((n.ref || '?') + ' saiu do esquemático: virou ponto de derivação (traçado mantido).'); delete byOf[n.of]; n.of = ''; n.nkind = 'brk'; n.ref = HX.physNextBR(sh); }
      else { warn.push((n.ref || '?') + ' saiu do esquemático e do desenho físico.'); var sg = HX.physSegsOf(sh, n.id).map(function (x) { return x.id; }), k2 = [n.id].concat(sg); sh.items = sh.items.filter(function (i) { return k2.indexOf(i.id) < 0 && k2.indexOf(i.of) < 0 && k2.indexOf(i.seg) < 0 && !(i.type === 'pdim' && (k2.indexOf(i.a) >= 0 || k2.indexOf(i.b) >= 0)); }); }
    });
    sh.items.forEach(function (n) { if (n.type === 'pnode' && n.of && S[n.of]) n.ref = S[n.of].ref || n.ref; });
    if (HX.physCleanBR) HX.physCleanBR(doc, sh, true); // centro automático que não deriva sai
    var idle = sh.items.filter(function (n) { return n.type === 'pnode' && n.nkind === 'brk' && HX.physSegsOf(sh, n.id).length === 2; }).length;
    if (idle) warn.push(idle + ' ponto(s) de derivação sem ramificação (2 ramos). Para tirar: botão direito na área livre › Remover derivações sem ramificação.');
    // novos
    // emendas/junções do esquemático NÃO viram ponto nem ramo próprio: os fios passam pelo nó onde os circuitos se
    // encontram (HX.physJuncMap); pontos de emenda soltos criados antes (1 ramo só) saem
    sh.items.filter(function (n) { return n.type === 'pnode' && n.nkind === 'splice' && n.of && S[n.of] && S[n.of].type === 'splice' && HX.physSegsOf(sh, n.id).length <= 1; }).forEach(function (n) {
      var k2 = [n.id].concat(HX.physSegsOf(sh, n.id).map(function (x) { return x.id; })); delete byOf[n.of];
      sh.items = sh.items.filter(function (i) { return k2.indexOf(i.id) < 0 && k2.indexOf(i.of) < 0 && k2.indexOf(i.seg) < 0 && !(i.type === 'pdim' && (k2.indexOf(i.a) >= 0 || k2.indexOf(i.b) >= 0)); });
      warn.push((n.ref || 'Emenda') + ': ponto/ramo de emenda removido (a emenda fica dentro do feixe).');
    });
    var want = Object.keys(S).map(function (k) { return S[k]; }).filter(function (c) { return c.type === 'conn' && !(HX.CAT.conns[c.part] || {}).disc; }).filter(function (c) { return !byOf[c.id]; });
    if (!want.length) return { warn: warn, added: [] };
    var nl = HX.buildNetlist(p), netsOf = {};
    nl.nets.forEach(function (n, ni) { n.terms.forEach(function (t) { if (t.kind === 'pin' || t.kind === 'splice') (netsOf[t.id] = netsOf[t.id] || {})[ni] = 1; }); });
    var hasFace = sh.items.some(function (i) { return i.type === 'pface'; }), added = [], fan = {};
    function center() { var d = HX.sheetDims(p.meta); return [d[0] / 2, d[1] / 2]; }
    want.forEach(function (c) {
      var mine = netsOf[c.id] || {}, best = null, bn = 0;
      var sc = Object.keys(byOf).map(function (of) { return [byOf[of], Object.keys(netsOf[of] || {}).filter(function (k) { return mine[k]; }).length]; }).filter(function (x) { return x[1] > 0; }).sort(function (a, b) { return b[1] - a[1]; });
      if (sc.length) { best = sc[0][0]; bn = sc[0][1]; }
      // circuitos em comum com 2+ conectores (ex.: derivado por junções no meio dos fios): deriva no MEIO do caminho entre eles
      if (sc.length >= 2 && sc[1][1] >= sc[0][1] * 0.5 && HX.physPathSegs) { var ps = (HX.physPathSegs(sh, sc[0][0].id, sc[1][0].id) || []).map(function (x) { return x.sg; }); if (ps.length) { var mid = ps[Math.floor((ps.length - 1) / 2)]; best = HX.physSplitAt(doc, mid, ps.length % 2 ? 0.5 : (mid.a === sc[0][0].id ? 0.85 : 0.15)) || best; m = HX.physIdx(sh); } }
      if (!best && c.type === 'splice') return;
      var kind = c.type === 'conn' ? 'conn' : 'splice', nd = { type: 'pnode', id: doc.uid('n'), of: c.id, ref: c.ref || '', nkind: kind, x: 0, y: 0 };
      if (kind === 'conn') { nd.sprite = HX.physSpriteFor(c) || ''; nd.size = ''; nd.rot = ''; nd.flip = false; nd.showPN = true; nd.note = ''; }
      if (best) {
        var d = HX.physDirAt(best, sh, HX.physIdx(sh)) || [1, 0], k = fan[best.id] = (fan[best.id] || 0) + 1, a = Math.atan2(d[0], -d[1]) + (k - 1) * 0.5, Lp = Math.max(30, HX.PHYS_DEF_LEN / N);
        nd.x = HX.r3(best.x + Math.cos(a) * Lp); nd.y = HX.r3(best.y + Math.sin(a) * Lp);
        var rf = sc.slice(0, 2).map(function (x) { return S[x[0].of]; }).filter(Boolean); // do mesmo lado que no esquemático
        if (rf.length) { var ry = rf.reduce(function (t, q) { return t + q.y; }, 0) / rf.length, rx = rf.reduce(function (t, q) { return t + q.x; }, 0) / rf.length;
          if (Math.abs(c.y - ry) > 5 && (c.y - ry) * (nd.y - best.y) < 0) nd.y = HX.r3(2 * best.y - nd.y); if (rf.length === 1 && Math.abs(c.x - rx) > 5 && (c.x - rx) * (nd.x - best.x) < 0) nd.x = HX.r3(2 * best.x - nd.x); }
      } else { var q = center(); nd.x = q[0] + added.length * 20; nd.y = q[1] + 40; }
      doc.add(nd); byOf[c.id] = nd; added.push(nd);
      if (best) HX.physConnect(doc, best, nd);
      doc.add({ type: 'pnote', id: doc.uid('a'), of: nd.id, x: 0, y: 0, pos: kind === 'conn' ? 'auto' : '', text: '' });
      if (kind === 'conn' && opt.balloons !== false) doc.add({ type: 'pball', id: doc.uid('a'), of: nd.id, x: 0, y: 0, pos: 'auto', n: '' });
      if (kind === 'conn' && hasFace) doc.add({ type: 'pface', id: doc.uid('a'), of: nd.id, x: 0, y: -40, w: 14 });
      warn.push((c.ref || c.id) + ' novo: entrou ' + (best ? 'num ramo a partir de ' + (best.ref || 'nó') : 'solto (sem circuito em comum — ligue com a ferramenta Ramo)') + '. Ajuste a posição/derivação.');
    });
    return { warn: warn, added: added };
  };
  // aplicar: com folha existente, sincroniza (rebuild = refazer tudo pelo método antigo)
  var ap0 = HX.applyPhysical;
  HX.applyPhysical = function (doc, opt) {
    opt = opt || {}; var p = doc.p, old = p.sheets.filter(HX.isPhys)[0];
    if (!old || opt.rebuild || !old.items.some(function (i) { return i.type === 'pseg'; })) return ap0(doc, opt);
    var cur = doc.sheet, ix = p.sheets.indexOf(old); doc.sheet = ix;
    try {
      if (opt.scale && +opt.scale !== +old.scale) HX.physRescale(old, +opt.scale);
      if (opt.style) old.pstyle = opt.style;
      var r = HX.physSync(doc, old, opt), orf = HX.physBundle(p, old).orphan;
      if (orf.length) r.warn.push(orf.length + ' fio(s) não roteado(s) pelo desenho físico (ponta fora dele): ' + orf.slice(0, 8).map(function (w) { return w.num; }).join(', ') + (orf.length > 8 ? '…' : ''));
      return { warn: r.warn, index: ix, sheet: old, synced: true };
    } finally { doc.sheet = cur; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
