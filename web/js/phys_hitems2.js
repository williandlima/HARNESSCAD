/* HarnessCAD - ITENS DA CABLAGEM (2): APLICAR um item da biblioteca no item selecionado do desenho físico (conector,
   ramo, nó de derivação, etiqueta), acessórios do conector (nó.acc = [{k, q, pn}]) na lista de materiais e no balão do
   conector (quantidade "por contato" = contatos ligados no esquema), PN escolhido do adaptador/bota (nó.bsPN/bootPN),
   itens do usuário vinculados à família/carcaça numa folha nova e TRAVA do esquema (conector/emenda não se apagam). */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops;
  HX.connWiredPins = function (p, c) {
    var nl = HX.buildNetlist(p), s = p.sheets.findIndex(function (sh) { return sh.items.indexOf(c) >= 0; }); if (s < 0) return 0;
    return HX.connLayout(c, p.unit).pins.filter(function (pp) { return nl.connected.has(s + '|' + HX.key(pp.pt[0], pp.pt[1])); }).length;
  };
  HX.hitemQty = function (it, a, nPins) {
    var q = a.q === '' || a.q == null ? 1 : +a.q || 0; if (it.per === 'pin') q *= nPins;
    if ((it.un === 'mm' || it.un === 'm') && it.len) q *= it.len; return Math.round(q * 1000) / 1000;
  };
  /* aplica o item k no alvo (item do desenho físico); devolve '' ou o motivo de não aplicar */
  HX.hitemApply = function (doc, k, t) {
    var it = HX.HITEMS[k]; if (!it || !t) return 'Selecione no desenho físico onde aplicar.';
    var conn = t.type === 'pnode' && t.nkind === 'conn', c = conn && HX.physSchem(doc.p)[t.of], u = it.use;
    if (conn && !HX.hitemFits(it, c)) return 'Este item não serve neste conector (família/carcaça).';
    if (conn && (u === 'bs' || u === 'boot')) { if (u === 'bs') { t.bsKind = it.pds; t.bsPN = it.pn; } else { t.bootKind = it.pds; t.bootPN = it.pn; } return ''; }
    if (conn && u === 'hood') { t.dsHood = 'hood'; t.acc = (t.acc || []).concat([{ k: k, q: 1, pn: '' }]); return ''; }
    if (conn && (u === 'acc' || u === 'tag')) { t.acc = (t.acc || []).concat([{ k: k, q: 1, pn: '' }]); if (it.lock) t.dsLock = it.lock; return ''; } /* kit KF: fixação V (espaçador sextavado 4-40) no desenho do D-Sub */
    if (t.type === 'pseg' && u === 'cover') { t.cover = it.spr; t.coverTxt = it.pn || it.n; return ''; }
    if (t.type === 'pseg' && u === 'pacc') { var si = doc.p.sheets.findIndex(function (q) { return q.items.indexOf(t) >= 0; }); if (si >= 0) doc.sheet = si; var a = HX.physAddAcc(doc, t, it.kind); a.pn = it.pn; a.text = it.n; return ''; }
    if (t.type === 'pnode' && t.nkind === 'brk' && u === 'trans') { t.trans = 'auto'; t.transPN = it.pn; return ''; }
    if (t.type === 'ptag' && u === 'tag') { if (t.style === 'etiqtr') t.labPN = it.pn; else t.pn = it.pn; return ''; }
    return { bs: 'Adaptador: selecione um conector.', boot: 'Bota: selecione um conector.', acc: 'Selecione um conector.', hood: 'Capa: selecione um conector D-Sub.', cover: 'Cobertura: selecione um ramo.',
      pacc: 'Selecione um ramo (o item entra no meio dele).', trans: 'Transição: selecione um nó de derivação.', tag: 'Etiqueta: selecione uma etiqueta ou um conector.' }[u] || 'Não se aplica aqui.';
  };
  var bom = HX.physBom;
  HX.physBom = function (p, sh) {
    var Bm = bom(p, sh), S = HX.physSchem(p), any = false; Bm.assoc = Bm.assoc || {};
    function row(key, pn, desc, un) { var r = Bm.key[key]; if (!r) { r = { k: key, pn: pn, desc: desc, qty: 0, un: un }; Bm.rows.push(r); Bm.key[key] = r; } return r; }
    sh.items.forEach(function (n) {
      if (n.type !== 'pnode' || n.nkind !== 'conn') return; var c = S[n.of], np = null, A = Bm.assoc[n.id] = Bm.assoc[n.id] || [];
      [['bsKind', 'bsPN'], ['bootKind', 'bootPN']].forEach(function (f) { var d = HX.PDS[n[f[0]]], pn = n[f[1]]; if (!d || !pn || !c) return; var shl = HX.shellOf(c), k0 = 'd:' + n[f[0]] + ':' + shl, r0 = Bm.key[k0];
        if (r0 && r0.pn === pn) return; if (r0) { r0.qty--; if (r0.qty <= 0) { Bm.rows.splice(Bm.rows.indexOf(r0), 1); delete Bm.key[k0]; } var i = A.indexOf(k0); if (i >= 0) A.splice(i, 1); }
        var r = row(k0 + ':' + pn, pn, d.n + ' — carcaça ' + shl, 'pç'); r.qty++; A.push(r.k); any = true; });
      (n.acc || []).forEach(function (a) { var it = HX.HITEMS[a.k]; if (!it) return; if (it.per === 'pin' && np == null) np = c ? HX.connWiredPins(p, c) : 0;
        var pn = a.pn || it.pn || '', r = row('h:' + a.k + ':' + pn, pn, HX.hitemLabel(it), it.un); r.qty = Math.round((r.qty + HX.hitemQty(it, a, np || 0)) * 1000) / 1000; any = true;
        if (A.indexOf(r.k) < 0) A.push(r.k); });
    });
    if (any) Bm.rows.forEach(function (r, j) { r.n = j + 1; });
    return Bm;
  };
  /* bota 202K escolhida na biblioteca (nó.bootPN): o desenho usa o comprimento e o perfil daquele tamanho */
  var as0 = HX.physAssembly;
  HX.physAssembly = function (nd) {
    var E = as0.apply(this, arguments), m = nd && /^(202K\d{3})/.exec(nd.bootPN || ''); if (!E || !m || !HX.B202 || !HX.B202[m[1]]) return E;
    E.forEach(function (e) { if (e.id === 'rc_202K') { HX._rc202 = m[1]; e.L = HX.B202[m[1]][0]; } }); return E;
  };
  /* folha física nova: itens do usuário vinculados ao conector */
  HX.hitemsLinked = function (c) { return Object.keys(HX.HITEMS).filter(function (k) { var it = HX.HITEMS[k]; return it.user && it.fam && HX.hitemFits(it, c) && /bs|boot|acc|hood/.test(it.use); }); };
  var ap0 = HX.applyPhysical;
  if (ap0) HX.applyPhysical = function (doc) {
    var had = doc.p.sheets.some(HX.isPhys), r = ap0.apply(this, arguments), sh = r && r.index != null && doc.p.sheets[r.index]; if (!sh || had) return r;
    var S = HX.physSchem(doc.p);
    sh.items.forEach(function (n) { var c = n.type === 'pnode' && n.nkind === 'conn' && S[n.of]; if (c) HX.hitemsLinked(c).forEach(function (k) { HX.hitemApply(doc, k, n); }); });
    return r;
  };
  /* trava: conector/emenda do desenho físico vêm do esquema */
  HX.physLocked = function (doc, it) { var S = it && it.type === 'pnode' && (it.nkind === 'conn' || it.nkind === 'splice') && HX.physSchem(doc.p); return !!(S && S[it.of]); };
  if (ops && ops.deleteSel) {
    var del0 = ops.deleteSel;
    ops.deleteSel = function (doc) {
      if (!HX.isPhys(doc.cur())) return del0.apply(this, arguments);
      var L = Array.from(doc.sel).filter(function (id) { var f = doc.findAll(id); return HX.physLocked(doc, f && f.item); });
      if (L.length) { L.forEach(function (id) { doc.sel.delete(id); }); if (HX.UI && HX.UI.toast) HX.UI.toast('Conector/emenda é definido no esquemático — apague lá (no físico só se customiza).', true); }
      return doc.sel.size ? del0.apply(this, arguments) : false;
    };
  }
})(typeof window !== 'undefined' ? window : globalThis);
