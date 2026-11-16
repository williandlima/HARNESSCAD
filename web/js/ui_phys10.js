/* HarnessCAD - interface do desenho físico (10): campos do D-SUB em desenho técnico (terminação solda/crimpagem,
   fixação L/O/V, capa) e reorganização automática de vistas/rótulos quando o tamanho do desenho do conector muda. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  var nf = EXT.pnode.fields;
  EXT.pnode.fields = function (it, doc) {
    var F = nf(it, doc), c = it.nkind === 'conn' && doc && doc.p ? HX.physSchem(doc.p)[it.of] : null;
    F.forEach(function (f) { if (/^(draw|cL|cD|showDims)$/.test(f.k)) f.rearr = 1; });
    if (!c || !HX.isDsub || !HX.isDsub(c)) return F;
    return F.concat([{ type: 'head', l: 'D-SUB (desenho técnico)' },
      { k: 'dsTerm', l: 'Terminação', type: 'select', rearr: 1, opts: [['', 'Pelo catálogo'], ['solder', 'Solda (caçapa 7,75 máx.)'], ['crimp', 'Crimpagem (série 8656, A máx.)']] },
      { k: 'dsLock', l: 'Fixação', type: 'select', rearr: 1, opts: [['', 'Furo passante Ø3,10'], ['L', 'L — inserto roscado M3'], ['O', 'O — inserto roscado UNC 4-40'], ['V', 'V — parafuso fêmea sextavado 4-40']] },
      { k: 'dsHood', l: 'Capa (backshell)', type: 'select', rearr: 1, opts: [['', 'Pela imagem escolhida'], ['hood', 'Com capa'], ['none', 'Sem capa (contatos expostos)']] }]);
  };
  var bf = UI.bindForm;
  UI.bindForm = function (fields, root, obj, onChange) {
    return bf(fields, root, obj, function (k, v, f) {
      var r = onChange(k, v, f), app = G.app;
      if (f && f.rearr && app && app.doc && HX.isPhys(app.doc.cur())) setTimeout(function () {
        var sh = app.doc.cur(), n = 0; app.doc.change('Organizar rótulos', function () { n = HX.physArrangeLabels(sh); });
        if (n && UI.toast) UI.toast(n + ' rótulo(s)/vista(s) afastado(s) do conector.');
      }, 120);
      return r;
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
