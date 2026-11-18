/* HarnessCAD - campos da etiqueta (só luva termo-retrátil): texto, PN, comprimento, posição pela BORDA da etiqueta
   até o conector, cota (automática ou valor customizado) e tolerância. */
(function (G) {
  'use strict';
  var HX = G.HX, EXT = HX.ITEM_EXT;
  EXT.ptag.fields = function (it, doc) {
    HX.physTagAccessor(it); var sh = doc.cur(), m = HX.physIdx(sh), sg = m[it.seg] || {};
    var ST = { k: 'style', l: 'Tipo de identificação', type: 'select', opts: [['etiqtr', 'Etiqueta sob espaguete transparente (padrão da casa)'], ['sleeve', 'Luva termo-retrátil impressa']] };
    if (it.style === 'etiqtr') return [{ type: 'head', l: 'Identificação — etiqueta sob espaguete transparente' }, ST, { k: 'text', l: 'Texto da etiqueta', tip: 'Ex.: P1, P-TM1/P-TM2 (a barra quebra a linha)' },
      { k: 'labPN', l: 'PN da etiqueta' }, { k: 'lab', l: 'Comprimento da etiqueta (mm)', type: 'number', step: 5 }, { k: 'pn', l: 'PN do espaguete transparente' },
      { k: 'len', l: 'Comprimento do espaguete (mm)', type: 'number', step: 5 }, { type: 'head', l: 'Posição e cotas' },
      { k: 'gap', l: 'Folga fim da bota → espaguete (mm, vazio = arrastar)', type: 'number', step: 5 },
      { k: 'end', l: 'Conector de referência', type: 'select', opts: [['a', (m[sg.a] || {}).ref || 'ponta A'], ['b', (m[sg.b] || {}).ref || 'ponta B']] },
      { k: 'dim', l: 'Cotas TIP. (folga, 5, etiqueta, espaguete)', type: 'check' }, { k: 'dimOff', l: 'Cotas embaixo do feixe (1) ou em cima (vazio)', type: 'number', step: 1 }];
    return [{ type: 'head', l: 'Etiqueta — luva termo-retrátil impressa' }, ST, { k: 'text', l: 'Texto impresso', tip: 'Ex.: W12, P1, 28V-ALIM' },
      { k: 'pn', l: 'Part number da luva' }, { k: 'len', l: 'Comprimento da luva (mm)', type: 'number', step: 5 },
      { type: 'head', l: 'Posição e cota' }, { k: 'edist', l: 'Distância borda da etiqueta → conector (mm)', type: 'number', step: 5, tip: 'Ou arraste a etiqueta no ramo' },
      { k: 'end', l: 'Conector de referência', type: 'select', opts: [['a', (m[sg.a] || {}).ref || 'ponta A'], ['b', (m[sg.b] || {}).ref || 'ponta B']] },
      { k: 'dim', l: 'Cotar a posição', type: 'check' }, { k: 'dimText', l: 'Valor customizado da cota (vazio = medido)' }, { k: 'tolP', l: 'Tolerância ± (mm)' },
      { k: 'dimOff', l: 'Afastamento da cota (mm, vazio = automático)', type: 'number', step: 1 }, { k: 'dimFrom', l: 'Cota a partir de', type: 'select', opts: [['', 'Borda do conector'], ['node', 'Nó do ramo']] }];
  };
})(typeof window !== 'undefined' ? window : globalThis);
