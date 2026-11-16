/* HarnessCAD - desenho físico: VERIFICAÇÕES DE REALISMO com dados de datasheet.
   • Bota termo-retrátil Glenair 770-001 (reta/90°): o feixe tem de ficar entre o Ø recuperado máx. (Cr) e o Ø expandido
     mín. (Ce) da ponta do cabo — abaixo de Cr a bota não aperta (exige enchimento/fita, nota de aplicação 2 do catálogo).
   • Alívio de tensão Glenair 620-048: faixa de cabo (fechado..aberto) da tabela III por carcaça.
   • Derivação colada no conector: o primeiro BR/emenda precisa ficar a ≥ mín. (padrão 25 mm) da saída da montagem.
   • Texto mínimo da folha (connScale/legibilidade): sheet.textMin (mm) aplicado a todos os textos do desenho físico. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function bySh(a) { return function (sh) { return a[Math.max(0, Math.min(8, Math.round(((+sh || 13) - 9) / 2)))]; }; }
  // [Cr máx recuperado, Ce mín expandido] da ponta do cabo, por carcaça 9..25 (tabelas I, H-5 e H-6)
  HX.PDS_RANGE = {
    boot_s: bySh([[5.5, 24], [6.0, 30], [6.0, 30], [6.0, 30], [7.0, 32], [8.5, 36], [8.5, 36], [10.0, 43], [15.0, 60]]),
    boot_90: bySh([[5.0, 24], [5.5, 30], [5.5, 30], [7.0, 32], [7.0, 32], [8.5, 36], [8.5, 36], [10.0, 43], [15.0, 55]]),
    sr_s: bySh([[2.5, 5.9], [3.9, 5.9], [4.8, 8.3], [6.6, 11.6], [7.2, 15.6], [8.3, 16.1], [8.7, 17.7], [9.7, 20.9], [10.6, 21.7]])
  };
  HX.ERC_RULES.splice(HX.ERC_RULES.length - 1, 0, ['accFit', 'Bota/alívio × Ø do feixe (datasheet)', 'aviso'], ['brkNear', 'Derivação colada no conector', 'aviso'], ['frame', 'Desenho fora da moldura / sobre o carimbo', 'aviso']);
  // verificações da montagem: [{nd, rule, msg}]
  HX.physAssemblyCheck = function (p, sh, min) {
    var B = HX.physBundle(p, sh), S = HX.physSchem(p), out = [], m = HX.physIdx(sh); min = min || 25;
    sh.items.forEach(function (n) {
      if (n.type !== 'pnode' || n.nkind !== 'conn') return;
      var sg = HX.physSegsOf(sh, n.id)[0], od = sg && B.seg[sg.id] ? B.seg[sg.id].od : 0, shl = HX.shellOf(S[n.of]), ref = n.ref || '?';
      [['bootKind', 'Bota'], ['bsKind', 'Alívio de tensão']].forEach(function (f) {
        var k = n[f[0]], R = HX.PDS_RANGE[k] && HX.PDS_RANGE[k](shl); if (!R || !(od > 0)) return;
        var f2 = function (v) { return String(Math.round(v * 100) / 100).replace('.', ','); };
        if (od < R[0]) out.push({ nd: n, rule: 'accFit', msg: ref + ': ' + f[1] + ' (' + HX.PDS[k].n + ', carcaça ' + shl + ') aperta até Ø ' + f2(R[0]) + ' mm; o feixe tem Ø ' + f2(od) + ' — precisa de enchimento/fita ou de um tamanho menor' });
        else if (od > R[1]) out.push({ nd: n, rule: 'accFit', msg: ref + ': feixe Ø ' + f2(od) + ' maior que o máximo de ' + f[1].toLowerCase() + ' (' + f2(R[1]) + ' mm) — use um tamanho maior' });
      });
      var best = null; sh.items.forEach(function (q) { if (q.type === 'pnode' && q.id !== n.id && q.nkind !== 'conn' && q.nkind !== 'virt') { var r = HX.physPathLen(sh, n.id, q.id); if (r && (!best || r.len < best.len)) best = { q: q, len: r.len }; } });
      if (best && best.len < min) out.push({ nd: n, rule: 'brkNear', msg: ref + ': ' + (best.q.ref || 'derivação') + ' a ' + Math.round(best.len) + ' mm da saída da montagem (mín. ' + min + ' mm para a bota/abraçadeira e o raio do feixe)' });
      void m;
    });
    return out;
  };
  var ep = HX.ercPhys;
  HX.ercPhys = function (p, nl, add) {
    if (ep) ep(p, nl, add);
    var ph = p.sheets.filter(HX.isPhys)[0]; if (!ph) return;
    var si = p.sheets.indexOf(ph); HX.physAssemblyCheck(p, ph, +(HX.ercCfg(p).brkMin || 25)).forEach(function (x) { add(x.rule, 'aviso', x.msg, si, x.nd.id); });
    HX.physFrameCheck(p, si).forEach(function (x) { add('frame', 'aviso', x.msg, si, x.it.id); });
  };
  // itens que saem da moldura ou invadem o carimbo (caixas do desenho atual)
  HX.physFrameCheck = function (p, si) {
    var sh = p.sheets[si], nul = {}, out = []; ['style', 'rect', 'circle', 'line', 'poly', 'push', 'pop', 'text'].forEach(function (k) { nul[k] = function () {}; }); nul.image = function () { return true; };
    HX.drawSheetItems(nul, p, si, {});
    var d = HX.sheetDims(p.meta), M = HX.frameMargins(p), F = { x0: M.l, y0: M.t, x1: d[0] - M.r, y1: d[1] - M.b }, U = HX.usableArea(p), T = p.meta.template === 'none' ? null : { x0: F.x1 - 180, y0: U.y1 + 4, x1: F.x1, y1: F.y1 };
    var NM = { pnode: 'conector/nó', ptable: 'tabela', pface: 'vista frontal', pdetail: 'detalhe', pnote: 'rótulo', pball: 'balão', pacc: 'item do ramo', pimg: 'imagem' };
    sh.items.forEach(function (i) {
      var b = i._bb; if (!b || !NM[i.type]) return; var nm = NM[i.type] + (i.ref ? ' ' + i.ref : '') + (i.kind ? ' (' + i.kind + ')' : '');
      if (b.x0 < F.x0 || b.y0 < F.y0 || b.x1 > F.x1 || b.y1 > F.y1) out.push({ it: i, msg: nm + ' sai da moldura da folha' });
      else if (T && b.x1 > T.x0 && b.x0 < T.x1 && b.y1 > T.y0 && b.y0 < T.y1) out.push({ it: i, msg: nm + ' invade o carimbo' });
    });
    return out;
  };
  // texto mínimo (legibilidade na impressão): todos os textos da folha física com altura >= sheet.textMin
  var dr = HX.drawSheetItems;
  HX.drawSheetItems = function (g, p, s, o) {
    var sh = p.sheets[s], tm = sh && HX.isPhys(sh) && +sh.textMin;
    if (sh && HX.isPhys(sh) && sh.gTol && !o._inDetail && !g._tmin) { var M = HX.frameMargins(p); g.text('Tolerância geral de comprimento (ramos sem tolerância indicada): ' + sh.gTol + ' mm', M.l + 10, M.t + 27, { size: Math.max(2.2, tm || 0), color: sh.lineColor || '#222' }); }
    if (!(tm > 0) || g._tmin) return dr(g, p, s, o);
    var g2 = Object.create(g); g2._tmin = tm;
    g2.text = function (t, x, y, op) { if (op && op.size < tm) { var q = {}; Object.keys(op).forEach(function (k) { q[k] = op[k]; }); q.size = tm; op = q; } return g.text.call(g2, t, x, y, op); };
    return dr(g2, p, s, o);
  };
})(typeof window !== 'undefined' ? window : globalThis);
