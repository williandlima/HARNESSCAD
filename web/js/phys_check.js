/* HarnessCAD - desenho físico: VERIFICAÇÕES e PESO.
   Ocupação da cobertura (Ø do feixe × Ø interno; termo-retrátil: Ø recuperado = Ø interno / razão), emendas
   escalonadas (distância mínima entre emendas pelo caminho dos ramos) e peso do chicote (fios por g/m da bitola,
   coberturas por g/m, conectores e itens pelo peso informado). Contato × bitola e tampões já estão no ERC. */
(function (G) {
  'use strict';
  var HX = G.HX;
  // g/m típico por AWG — fio aeronáutico de parede fina (ref. M22759/16, aprox.); confirme no datasheet
  HX.WIRE_GM = { 30: 1.0, 28: 1.4, 26: 2.0, 24: 2.9, 22: 4.3, 20: 6.2, 18: 9.2, 16: 12.8, 14: 20.0, 12: 31.0, 10: 48.0, 8: 82.0, 6: 128, 4: 200, 2: 310, 0: 490 };
  HX.wireGM = function (w) { var g = HX.gaugeAWG ? HX.gaugeAWG(w) : parseFloat(w.gauge); if (HX.WIRE_GM[g]) return HX.WIRE_GM[g]; var od = HX.wireOD(w); return Math.round(od * od * 2.6 * 10) / 10; };
  HX.ERC_RULES.splice(HX.ERC_RULES.length - 1, 0, ['covFill', 'Cobertura × feixe (ocupação)', 'aviso'], ['stagger', 'Emendas não escalonadas', 'aviso']);
  function isShrink(spr) { return /shrink|termo/i.test(spr || ''); }
  // ocupação de cada cobertura do desenho: [{it, od, id, ratio, msg, sev}]
  HX.physCoverCheck = function (p, sh) {
    var B = HX.physBundle(p, sh), m = HX.physIdx(sh), out = [];
    function chk(it, od, spr, name) {
      var id = parseFloat(String(it.covId || '').replace(',', '.')); if (!(id > 0) || !(od > 0)) return;
      var r = parseFloat(String(it.covRatio || '').replace(',', '.')) || (isShrink(spr) ? 2 : 0), occ = od / id, msg = null, sev = 'aviso';
      if (od > id * 0.9) { msg = name + ': feixe Ø ' + HX.fmtNum(od) + ' não cabe na cobertura Ø ' + HX.fmtNum(id) + ' (ocupação ' + Math.round(occ * 100) + '%)'; sev = 'erro'; }
      else if (r > 0 && isShrink(spr) && od < id / r) msg = name + ': termo-retrátil Ø ' + HX.fmtNum(id) + ' (' + r + ':1) recupera para Ø ' + HX.fmtNum(id / r) + ', maior que o feixe Ø ' + HX.fmtNum(od) + ' — não aperta';
      else if (!isShrink(spr) && occ < 0.4) { msg = name + ': cobertura Ø ' + HX.fmtNum(id) + ' folgada para o feixe Ø ' + HX.fmtNum(od) + ' (ocupação ' + Math.round(occ * 100) + '%)'; sev = 'info'; }
      out.push({ it: it, od: od, id: id, occ: occ, msg: msg, sev: sev });
    }
    sh.items.forEach(function (i) {
      if (i.type === 'pseg' && i.cover) chk(i, (B.seg[i.id] || {}).od, i.cover, 'Ramo ' + ((m[i.a] || {}).ref || '') + '–' + ((m[i.b] || {}).ref || ''));
      if (i.type === 'pcov') { var segs = HX.physPathSegs(sh, i.a, i.b) || [], od = 0; segs.forEach(function (x) { od = Math.max(od, (B.seg[x.sg.id] || {}).od || 0); }); chk(i, od, i.sprite, 'Cobertura ' + (i.txt || ((m[i.a] || {}).ref || '') + '–' + ((m[i.b] || {}).ref || ''))); }
    });
    return out;
  };
  // emendas a menos de "min" mm uma da outra pelo caminho dos ramos
  HX.physStagger = function (sh, min) {
    var sp = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'splice'; }), out = [];
    sp.forEach(function (a, i) { sp.slice(i + 1).forEach(function (b) { var r = HX.physPathLen(sh, a.id, b.id); if (r && r.len < min) out.push({ a: a, b: b, d: r.len }); }); });
    return out;
  };
  // peso (g): fios (comprimento efetivo × g/m), por ramo (fios que passam × comprimento do ramo), coberturas e peças
  HX.physWeight = function (p, sh) {
    var L = HX.computeLengths(p), B = HX.physBundle(p, sh), m = HX.physIdx(sh), N = +sh.scale || 1, wires = 0, seg = {}, parts = 0, covers = 0;
    p.sheets.forEach(function (S) { if (!HX.isPhys(S)) S.items.forEach(function (w) { if (w.type === 'wire') { var e = (L.wires[w.id] || {}).eff; if (e > 0) wires += HX.wireGM(w) * e / 1000; } }); });
    sh.items.forEach(function (i) {
      if (i.type === 'pseg') { var b = B.seg[i.id] || { wires: [] }, l = HX.physSegLen(i, m, N) / 1000, g = 0; b.wires.forEach(function (w) { g += HX.wireGM(w) * l; }); if (+i.covW) { g += +i.covW * l; covers += +i.covW * l; } seg[i.id] = g; }
      if (i.type === 'pcov' && +i.covW) covers += +i.covW * HX.physCoverLen(i, sh) / 1000;
      if ((i.type === 'pnode' || i.type === 'pacc' || i.type === 'pimg') && +i.peso) parts += +i.peso;
    });
    var r = function (x) { return Math.round(x * 10) / 10; };
    return { wires: r(wires), covers: r(covers), parts: r(parts), total: r(wires + covers + parts), seg: seg };
  };
  var ep = HX.ercPhys;
  HX.ercPhys = function (p, nl, add) {
    if (ep) ep(p, nl, add);
    var ph = p.sheets.filter(function (sh) { return HX.isPhys(sh); })[0]; if (!ph) return;
    var si = p.sheets.indexOf(ph), min = +(HX.ercCfg(p).stagger || 25);
    HX.physCoverCheck(p, ph).forEach(function (c) { if (c.msg) add('covFill', c.sev, c.msg, si, c.it.id); });
    HX.physStagger(ph, min).forEach(function (x) { add('stagger', 'aviso', 'Emendas ' + (x.a.ref || '') + ' e ' + (x.b.ref || '') + ' a ' + Math.round(x.d) + ' mm (mín. ' + min + ' mm — escalone para não engrossar o feixe)', si, x.a.id); });
  };
})(typeof window !== 'undefined' ? window : globalThis);
