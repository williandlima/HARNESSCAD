/* HarnessCAD - PEÇA CADASTRADA PELO USUÁRIO (bota, backshell/adaptador... que não está no catálogo): a figura do
   datasheet recortada (ui_dsimg.js) ganha PART NUMBER, FABRICANTE, CARACTERÍSTICAS e VÍNCULO com a família do conector
   (e, se quiser, a carcaça). Fica na biblioteca compartilhada; na lista de materiais sai com o PN; numa folha física nova
   os conectores daquela família/carcaça já recebem a peça vinculada (o usuário troca no nó). A figura é o próprio
   datasheet do usuário: conta como desenho de datasheet (não "aguardando"). */
(function (G) {
  'use strict';
  var HX = G.HX; HX.USER_PARTS = HX.USER_PARTS || {};
  function str(v, n) { return String(v == null ? '' : v).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n); }
  /* campos extras validados de uma entrada da biblioteca */
  HX.userPartExtra = function (v) {
    v = v || {}; var fam = str(v.fam, 20); if (!/^[\w-]*$/.test(fam)) fam = '';
    return { pn: str(v.pn, 60), mfr: str(v.mfr, 60), desc: str(v.desc, 200), fam: fam, shell: +v.shell > 0 && +v.shell < 100 ? Math.round(+v.shell) : 0 };
  };
  /* completa a peça já registrada em HX.PDS['u_<id>'] */
  HX.userPartLink = function (id, x) {
    var d = HX.PDS && HX.PDS['u_' + id]; if (!d) return null; HX.USER_PARTS[id] = x;
    d.base = d.base || d.n; d.n = d.base + (x.mfr ? ' — ' + x.mfr : '') + (x.desc ? ' (' + x.desc.slice(0, 60) + ')' : '');
    if (x.pn) d.pnOf = function () { return x.pn; }; d.link = { fam: x.fam, shell: x.shell }; d.user = 1; return d;
  };
  /* peças do usuário vinculadas ao conector c, do tipo kind ('boot' | 'bs'); a da carcaça exata vem primeiro */
  HX.userPartsFor = function (c, kind) {
    var df = c && HX.CAT.conns[c.part], sh = c && HX.shellOf ? HX.shellOf(c) : 0; if (!df) return [];
    return Object.keys(HX.PDS).filter(function (k) { var d = HX.PDS[k]; return d.user && d.kind === kind && d.link && d.link.fam === df.fam && (!d.link.shell || d.link.shell === sh); })
      .sort(function (a, b) { return (HX.PDS[b].link.shell ? 1 : 0) - (HX.PDS[a].link.shell ? 1 : 0); });
  };
  /* folha física nova: aplica as peças vinculadas (depois do padrão da casa) */
  var ap0 = HX.applyPhysical;
  if (ap0) HX.applyPhysical = function (doc) {
    var had = doc.p.sheets.some(HX.isPhys), r = ap0.apply(this, arguments), sh = r && r.index != null && doc.p.sheets[r.index]; if (!sh || had) return r;
    var S = HX.physSchem(doc.p);
    sh.items.forEach(function (n) { var c = n.type === 'pnode' && n.nkind === 'conn' && S[n.of]; if (!c) return;
      var b = HX.userPartsFor(c, 'boot')[0], a = HX.userPartsFor(c, 'bs')[0]; if (b) n.bootKind = b; if (a) n.bsKind = a; });
    return r;
  };
})(typeof window !== 'undefined' ? window : globalThis);
