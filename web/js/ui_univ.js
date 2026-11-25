/* HarnessCAD - painel do símbolo UNIVERSAL: cores, contorno, cantos, chevron, letras/números, aterramento, textos.
   Campo vazio = padrão do projeto. "Usar como padrão do projeto" grava em p.view.univ; "Limpar" volta ao padrão. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  var D = [['', 'Padrão do projeto']];
  HX.UNIV_FIELDS = [{ type: 'head', l: 'Símbolo padrão (personalizar)' },
    { k: 'uIds', l: 'Contatos', type: 'select', opts: [['', 'Como no catálogo'], ['num', 'Números (1, 2, 3…)'], ['let', 'Letras (A, B, C…)']] },
    { k: 'uFill', l: 'Preenchimento', type: 'select', opts: D.concat([['#fffbd0', 'Amarelo'], ['#ffffff', 'Branco'], ['none', 'Sem preenchimento'], ['#ececec', 'Cinza claro'], ['#dcebff', 'Azul claro'], ['#e2f4d6', 'Verde claro']]) },
    { k: 'uFillC', l: 'Cor livre (fundo)', tip: 'Ex.: #ffe0b0 — substitui a lista' },
    { k: 'uLine', l: 'Contorno', type: 'select', opts: D.concat([['#8b1a1a', 'Vinho'], ['#000000', 'Preto'], ['#1f4e9e', 'Azul'], ['#2e7d32', 'Verde'], ['#555555', 'Cinza']]) },
    { k: 'uLineC', l: 'Cor livre (contorno)', tip: 'Ex.: #333333' },
    { k: 'uPinC', l: 'Cor dos contatos', type: 'select', opts: D.concat([['#7a1010', 'Vinho'], ['line', 'Igual ao contorno'], ['#000000', 'Preto']]) },
    { k: 'uLw', l: 'Espessura (mm)', type: 'number', step: 0.05 }, { k: 'uR', l: 'Raio dos cantos (mm)', type: 'number', step: 0.5, tip: 'Vazio = automático; 0 = canto vivo' },
    { k: 'uChev', l: 'Macho/fêmea', type: 'select', opts: D.concat([['mid', 'No meio'], ['top', 'Em cima'], ['bottom', 'Embaixo'], ['off', 'Ocultar']]) },
    { k: 'uChevSz', l: 'Tamanho do > <', type: 'number', step: 0.5 }, { k: 'uPinSz', l: 'Texto dos contatos', type: 'number', step: 0.1 },
    { k: 'uNames', l: 'Nome dos sinais', type: 'select', opts: D.concat([['on', 'Mostrar'], ['off', 'Ocultar']]) },
    { k: 'uNumPos', l: 'Números e nomes', type: 'select', opts: D.concat([['in', 'Nº dentro, nome fora na perna (padrão)'], ['out', 'Nº fora na perna, nome dentro (antigo)']]) },
    { k: 'uPN', l: 'Part number', type: 'select', opts: D.concat([['on', 'Mostrar'], ['off', 'Ocultar']]) },
    { k: 'uRefPos', l: 'Referência', type: 'select', opts: D.concat([['above', 'Acima'], ['below', 'Abaixo']]) },
    { k: 'uGnd', l: 'Aterramento', type: 'select', opts: D.concat([['none', 'Nenhum'], ['earth', 'Terra'], ['chassis', 'Chassi / carcaça'], ['shield', 'Blindagem']]) },
    { k: 'uGndPos', l: 'Posição do terra', type: 'select', opts: D.concat([['mid', 'Centro'], ['pins', 'Lado das vias'], ['face', 'Lado reto']]) },
    { k: 'uGndTxt', l: 'Texto do terra', tip: 'Ex.: GND, CARCAÇA, PE' }];
  HX.isUniv = function (c, p) { return c && c.type === 'conn' && !c.eq && !c.disc && (c.gstyle || p.view.connStyle || 'univ') === 'univ'; };
  var ex0 = UI.propsExtra;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app); if (!HX.isUniv(it, app.doc.p)) return h;
    return UI.form(HX.UNIV_FIELDS, it) + '<div class="row"><button id="uDef" style="flex:1" title="Grava estas escolhas para todos os conectores com o símbolo Padrão">Usar como padrão do projeto</button></div>' +
      '<div class="row"><button id="uAll" style="flex:1" title="Copia para todos os conectores com o símbolo Padrão">Aplicar em todos</button><button id="uClr" style="flex:1">Limpar</button></div><h5 class="fhead">Contatos e ações</h5>' + h;
  };
  var bd0 = UI.propsBind;
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); var doc = app.doc; if (!HX.isUniv(it, doc.p)) return;
    UI.bindForm(HX.UNIV_FIELDS.filter(function (f) { return f.k; }), root, it, function (k, v) {
      if (k === 'uIds') doc.change('Contatos: ' + (v || 'catálogo'), function () { HX.univRelabel(it, v); });
      else doc.change('Símbolo: ' + k, function () { it[k] = v; });
    });
    function pick(src) { var o = {}; HX.UNIV_KEYS.forEach(function (k) { if (src[k] !== undefined && src[k] !== '') o[k] = src[k]; }); return o; }
    var b;
    if ((b = UI.$('#uDef', root))) b.onclick = function () { doc.change('Personalização do símbolo padrão', function () { doc.p.view.univ = pick(it); HX.UNIV_KEYS.forEach(function (k) { delete it[k]; }); }); UI.toast('Padrão do projeto atualizado'); };
    if ((b = UI.$('#uAll', root))) b.onclick = function () {
      var o = pick(it), n = 0; doc.change('Aplicar símbolo em todos', function () { doc.p.sheets.forEach(function (s) { s.items.forEach(function (c) { if (c !== it && HX.isUniv(c, doc.p)) { HX.UNIV_KEYS.forEach(function (k) { delete c[k]; }); Object.assign(c, o); if ((c.uIds || '') !== (it.uIds || '')) HX.univRelabel(c, it.uIds); n++; } }); }); });
      UI.toast(n + ' conector(es) atualizados');
    };
    if ((b = UI.$('#uClr', root))) b.onclick = function () { doc.change('Limpar símbolo', function () { HX.UNIV_KEYS.forEach(function (k) { delete it[k]; }); }); };
  };
})(typeof window !== 'undefined' ? window : globalThis);
