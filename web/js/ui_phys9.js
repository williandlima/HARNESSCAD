/* HarnessCAD - interface do desenho físico (9): conector em DESENHO TÉCNICO (vetor) ou imagem, medidas próprias
   (comprimento/Ø), cotas do conector, vista frontal vetorial com contatos numerados, cor da abraçadeira/luva. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  var DRAW = [['', 'Padrão da folha'], ['img', 'Imagem do datasheet'], ['vec', 'Desenho técnico (vetor)']];
  var nf = EXT.pnode.fields;
  EXT.pnode.fields = function (it, doc) {
    var F = nf(it, doc); if (it.nkind !== 'conn') return F;
    return F.concat([{ type: 'head', l: 'Desenho do conector' }, { k: 'draw', l: 'Desenho', type: 'select', opts: DRAW },
      { k: 'cL', l: 'Comprimento do corpo (mm)', type: 'number', step: 0.5, tip: 'Vazio = medida do datasheet pela carcaça (desenho técnico)' },
      { k: 'cD', l: 'Ø do corpo (mm)', type: 'number', step: 0.5, tip: 'Vazio = medida do datasheet' }]);
  };
  var ff = EXT.pface.fields;
  EXT.pface.fields = function (it, doc) { return ff(it, doc).concat([{ k: 'fv', l: 'Desenho da face', type: 'select', opts: [['', 'Padrão da folha'], ['img', 'Imagem do datasheet'], ['vec', 'Vetor com contatos numerados']] }]); };
  var af = EXT.pacc.fields;
  EXT.pacc.fields = function (it, doc) {
    var F = af ? af(it, doc) : [];
    if (it.kind === 'tie') F = F.concat([{ k: 'color', l: 'Cor da abraçadeira', type: 'select', opts: [['', 'Preta (UV)'], ['nat', 'Natural'], ['#d42a2a', 'Vermelha'], ['#2b6fd6', 'Azul']] }]);
    if (it.kind === 'marker') F = F.concat([{ k: 'color', l: 'Cor da luva', type: 'select', opts: [['', 'Branca'], ['#f2d22e', 'Amarela'], ['#cfe8ff', 'Azul claro']] }]);
    return F;
  };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var doc = app.doc, d = document.createElement('div');
    d.innerHTML = '<h4>Conectores</h4><div class="row"><label>Desenho</label><select id="p9D"><option value="">Desenho técnico (vetor, medidas reais)</option></select></div>' +
      '<p class="muted">Desenho técnico: porca recartilhada, corpo, roscas, faixas vermelha/azul, flange, porca sextavada, backshell e bota com as medidas do datasheet; vista frontal com os contatos numerados na posição real e a cor do fio.</p>';
    d.querySelector('#p9D').onchange = function () {
      var v = this.value; doc.change('Desenho dos conectores', function () { sh.connDraw = v; });
      setTimeout(function () { var n = 0; doc.change('Organizar rótulos', function () { n = HX.physArrangeLabels(sh); }); if (n) UI.toast(n + ' rótulo(s)/vista(s) afastado(s) do novo desenho.'); }, 80);
    };
    root.appendChild(d);
  };
})(typeof window !== 'undefined' ? window : globalThis);
