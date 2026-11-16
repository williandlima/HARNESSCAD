/* HarnessCAD - interface do PADRÃO MS: botão "Aplicar padrão MS" (Ferramentas / aba Desenho físico / painel da folha),
   campos da transição Raychem no BR e da camada interna (cordoalha) no ramo. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  function physSheet(doc) { var c = doc.cur(); return HX.isPhys(c) ? c : doc.p.sheets.filter(HX.isPhys)[0]; }
  HX.uiApplyMS = function (app) {
    var doc = app.doc, sh = physSheet(doc); if (!sh) return UI.toast('Gere o desenho físico primeiro (Ferramentas › Gerar desenho físico)', true);
    UI.modal('Aplicar padrão MS (cablagem militar)', '<p>Aplica em <b>' + HX.esc(sh.name) + '</b>:</p><ul class="muted"><li>conectores em desenho técnico; MS com <b>adaptador reto + rabicho de cordoalha</b>;</li>' +
      '<li><b>bota Raychem 202K</b> com o tamanho pelo Ø do adaptador (PN na lista de materiais);</li><li><b>cordoalha</b> (camada interna) e <b>termorretrátil</b> em todos os ramos;</li>' +
      '<li><b>transição Raychem 382A</b> (Y) nas ramificações, tamanho pelos feixes;</li><li><b>luva de solda</b> da blindagem junto a cada conector.</li></ul>' +
      '<div class="row"><label>PN da cordoalha</label><input id="msB" placeholder="ex.: cordoalha estanhada Ø…"></div><div class="row"><label>PN do termorretrátil</label><input id="msS" value="DR-25"></div>' +
      '<div class="row"><label>PN da luva de solda</label><input id="msL" placeholder="ex.: D-150-xx / M83519/2-x"></div>',
      [{ t: 'Cancelar' }, { t: 'Aplicar', pri: true, fn: function (d) {
        var o = { braidPN: UI.$('#msB', d.el).value, shrinkPN: UI.$('#msS', d.el).value, ssPN: UI.$('#msL', d.el).value }, n;
        var i = doc.p.sheets.indexOf(sh); if (i !== doc.sheet) app.setSheet(i);
        doc.change('Padrão MS', function () { n = HX.physApplyMS(doc, sh, o); });
        setTimeout(function () { doc.change('Organizar rótulos', function () { HX.physArrangeLabels(sh); }); }, 120);
        UI.toast('Padrão MS: ' + n.conn + ' conector(es), ' + n.seg + ' ramo(s), ' + n.br + ' ramificação(ões), ' + n.ss + ' luva(s) de solda');
      } }]);
  };
  HX.MENU_EXTRA = HX.MENU_EXTRA || [];
  HX.MENU_EXTRA.push(['Ferramentas', function (app) { return ['Aplicar padrão MS (cablagem militar)…', function () { HX.uiApplyMS(app); }, '']; }]);
  if (HX.RIBBON) HX.RIBBON.forEach(function (T) { if (T[0] === 'Desenho físico') T[1].push(['Padrão da casa', ['*m:Ferramentas/Aplicar padrão MS']]); });
  var nf = EXT.pnode.fields;
  EXT.pnode.fields = function (it, doc) {
    var F = nf(it, doc); if (!HX.isBranchNode(it)) return F;
    return F.concat([{ type: 'head', l: 'Transição moldada' }, { k: 'trans', l: 'Transição', type: 'select', opts: [['', 'Padrão da folha'], ['auto', 'Raychem 382A (automática)'], ['none', 'Sem transição']] },
      { k: 'transPN', l: 'PN manual', tip: 'Vazio = escolhido pelo Ø dos feixes (382A012…382A046)' }]);
  };
  var sf = EXT.pseg.fields;
  EXT.pseg.fields = function (it, doc) {
    var F = sf(it, doc), C = [['', 'Padrão da folha'], ['none', 'Nenhuma']].concat(Object.keys(HX.PSPR).filter(function (k) { return /^cov_/.test(k); }).map(function (k) { return [k, HX.PSPR[k].name]; }));
    return F.concat([{ k: 'under', l: 'Camada interna', type: 'select', opts: C, tip: 'Ex.: cordoalha por baixo do termorretrátil' }, { k: 'underTxt', l: 'PN da camada interna' }]);
  };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var d = document.createElement('div'); d.innerHTML = '<h4>Padrão da casa</h4><div class="row"><button style="flex:1" id="msApply">Aplicar padrão MS (cablagem militar)…</button></div>';
    d.querySelector('#msApply').onclick = function () { HX.uiApplyMS(app); }; root.appendChild(d);
  };
})(typeof window !== 'undefined' ? window : globalThis);
