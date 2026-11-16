/* HarnessCAD - identificação do fio no desenho, totalmente configurável por fio:
   número, nome, bitola, cor e texto livre (cada um pode aparecer ou não), posição e tamanho do texto.
   Fio novo copia os padrões do projeto (p.defaults.wlbl, ajustados no painel da ferramenta Fio).
   Fio antigo sem esses campos continua como antes: número + bitola + cor, acima do fio. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.WLBL_DEF = { lblNum: true, lblName: false, lblGauge: true, lblColor: true, lblTxt: '', lblPos: 'a', lblSize: 1.5 };
  HX.WLBL_KEYS = Object.keys(HX.WLBL_DEF);
  HX.wireLblOpts = function (w) {
    var o = {}; HX.WLBL_KEYS.forEach(function (k) { o[k] = w[k] === undefined || w[k] === null || (k === 'lblSize' && w[k] === '') ? HX.WLBL_DEF[k] : w[k]; });
    return o;
  };
  // texto final: número, nome, bitola, cor, texto livre (na ordem, só os marcados)
  HX.wireLabel = function (w) {
    var o = HX.wireLblOpts(w), a = [];
    if (o.lblNum && w.num) a.push(w.num);
    if (o.lblName && w.name) a.push(w.name);
    if (o.lblGauge) a.push(HX.gaugeLabel(w));
    if (o.lblColor && w.color) a.push(w.color);
    if (o.lblTxt) a.push(o.lblTxt);
    var size = Math.max(0.8, Math.min(6, +o.lblSize || 1.5));
    return { txt: o.lblPos === 'n' ? '' : a.filter(Boolean).join(' '), pos: o.lblPos, size: size, short: o.lblNum && w.num ? w.num : (o.lblName && w.name) || '' };
  };
  // campos do painel (fio selecionado e padrões da ferramenta Fio)
  HX.WIRE_MFG_FIELDS = [{ type: 'head', l: 'Elétrica e montagem' }, { k: 'amps', l: 'Corrente (A)', type: 'number', step: 0.1, tip: 'O ERC compara com a bitola e com o contato' },
    { k: 'twist', l: 'Par trançado (grupo)', tip: 'Mesmo nome nos fios do par/trio. Ex.: TP1' }, { k: 'ncA', l: 'Ponta inicial não conectada (N/C)', type: 'check' }, { k: 'ncB', l: 'Ponta final não conectada (N/C)', type: 'check' },
    { k: 'stripA', l: 'Decapagem início (mm)', tip: 'Vazio = típico do contato' }, { k: 'stripB', l: 'Decapagem fim (mm)', tip: 'Vazio = típico do contato' }];
  HX.WIRE_LBL_FIELDS = [{ type: 'head', l: 'Identificação no desenho' },
    { k: 'lblNum', l: 'Mostrar número', type: 'check' }, { k: 'lblName', l: 'Mostrar nome', type: 'check' },
    { k: 'lblGauge', l: 'Mostrar bitola', type: 'check' }, { k: 'lblColor', l: 'Mostrar cor', type: 'check' },
    { k: 'lblTxt', l: 'Texto extra', tip: 'Aparece após os demais. Ex.: TWISTED, BLINDADO' },
    { k: 'lblPos', l: 'Posição do texto', type: 'select', opts: [['a', 'Acima do fio'], ['b', 'Abaixo do fio'], ['n', 'Sem identificação']] },
    { k: 'lblSize', l: 'Tamanho do texto (mm)', type: 'number', step: 0.1 }];
  // objeto com os valores efetivos para preencher o formulário
  HX.wireFormView = function (w) { return Object.assign({}, w, HX.wireLblOpts(w)); };
})(typeof window !== 'undefined' ? window : globalThis);
