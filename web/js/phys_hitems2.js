/* HarnessCAD - ITENS DA CABLAGEM (2): acessórios anexados ao nó do conector (nó.acc = [{k, q, pn}]) entram na lista de
   materiais e no balão do conector; quantidade "por contato" = contatos ligados no esquema × comprimento por peça.
   Folha física nova: itens do usuário vinculados à família/carcaça entram sozinhos. TRAVA do que é do esquema: no
   desenho físico não se apaga conector nem emenda (são definidos no esquemático — apague lá). */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  /* contatos ligados do conector c (no esquema) */
  HX.connWiredPins = function (p, c) {
    var nl = HX.buildNetlist(p), s = p.sheets.findIndex(function (sh) { return sh.items.indexOf(c) >= 0; }); if (s < 0) return 0;
    return HX.connLayout(c, p.unit).pins.filter(function (pp) { return nl.connected.has(s + '|' + HX.key(pp.pt[0], pp.pt[1])); }).length;
  };
  /* quantidade de um acessório no conector */
  HX.hitemQty = function (it, a, nPins) {
    var q = a.q === '' || a.q == null ? 1 : +a.q || 0; if (it.per === 'pin') q *= nPins;
    if ((it.un === 'mm' || it.un === 'm') && it.len) q *= it.len; return Math.round(q * 1000) / 1000;
  };
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var Bm = bom(p, sh), S = HX.physSchem(p), any = false;
    sh.items.forEach(function (n) {
      if (n.type !== 'pnode' || n.nkind !== 'conn' || !(n.acc || []).length) return; var c = S[n.of], np = null;
      n.acc.forEach(function (a) { var it = HX.HITEMS[a.k]; if (!it) return; if (it.per === 'pin' && np == null) np = c ? HX.connWiredPins(p, c) : 0;
        var pn = a.pn || it.pn || '', key = 'h:' + a.k + ':' + pn, r = Bm.key[key];
        if (!r) { r = { k: key, pn: pn, desc: HX.hitemLabel(it), qty: 0, un: it.un }; Bm.rows.push(r); Bm.key[key] = r; }
        r.qty = Math.round((r.qty + HX.hitemQty(it, a, np || 0)) * 1000) / 1000; any = true;
        Bm.assoc = Bm.assoc || {}; var L = Bm.assoc[n.id] = Bm.assoc[n.id] || []; if (L.indexOf(key) < 0) L.push(key); });
    });
    if (any) Bm.rows.forEach(function (r, j) { r.n = j + 1; });
    return Bm;
  };
  /* folha física nova: itens do usuário vinculados ao conector (família e, se dada, carcaça) */
  HX.hitemsLinked = function (c) {
    var df = c && HX.CAT.conns[c.part], sh = c && HX.shellOf ? HX.shellOf(c) : 0; if (!df) return [];
    return Object.keys(HX.HITEMS).filter(function (k) { var it = HX.HITEMS[k]; return it.user && it.fam === df.fam && (!it.shell || it.shell === sh) && /conn|shield|wire|cons/.test(it.cat); });
  };
  var ap0 = HX.applyPhysical;
  if (ap0) HX.applyPhysical = function (doc) {
    var had = doc.p.sheets.some(HX.isPhys), r = ap0.apply(this, arguments), sh = r && r.index != null && doc.p.sheets[r.index]; if (!sh || had) return r;
    var S = HX.physSchem(doc.p);
    sh.items.forEach(function (n) { var c = n.type === 'pnode' && n.nkind === 'conn' && S[n.of], L = c ? HX.hitemsLinked(c) : []; if (L.length) n.acc = (n.acc || []).concat(L.map(function (k) { return { k: k, q: 1, pn: '' }; })); });
    return r;
  };
  /* trava: conector/emenda do desenho físico vêm do esquema */
  HX.physLocked = function (doc, it) { var S = it && it.type === 'pnode' && (it.nkind === 'conn' || it.nkind === 'splice') && HX.physSchem(doc.p); return !!(S && S[it.of]); };
  if (ops && ops.deleteSel) {
    var del0 = ops.deleteSel;
    ops.deleteSel = function (doc) {
      if (!HX.isPhys(doc.cur())) return del0.apply(this, arguments);
      var L = Array.from(doc.sel).filter(function (id) { return HX.physLocked(doc, doc.findAll(id) && doc.findAll(id).item); });
      if (L.length) { L.forEach(function (id) { doc.sel.delete(id); }); if (HX.UI && HX.UI.toast) HX.UI.toast('Conector/emenda é definido no esquemático — apague lá (no físico só se customiza).', true); }
      return doc.sel.size ? del0.apply(this, arguments) : false;
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
