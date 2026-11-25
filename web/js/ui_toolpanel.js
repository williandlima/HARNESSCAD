/* HarnessCAD - painel da ferramenta ativa (aba Propriedades): com uma ferramenta de desenho ligada
   (Fio, Emenda, Label, Texto, Cota...), a aba lateral mostra os ajustes dela. Para o Fio: tipo, bitola, cor,
   prefixo do número, nome e a identificação no desenho — valem para os PRÓXIMOS fios (padrões do projeto). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  var NAMES = { wire: 'Fio', splice: 'Emenda', label: 'Label de circuito', text: 'Texto', shape: 'Forma', cable: 'Cabo / blindagem',
    dim: 'Cota do chicote', brk: 'Ponto de derivação', measure: 'Medir distância', paint: 'Pincel de formatação', place: 'Inserir conector' };

  function wireFields(d) {
    var t = HX.wireType(d.wtype) || { gauges: [d.gauge] }, col = Object.keys(HX.COLORS || {}).map(function (k) { return [k, k + ' — ' + HX.COLORS[k][0]]; });
    if (d.color && !(HX.COLORS || {})[d.color]) col.unshift([d.color, d.color]);
    return [{ type: 'head', l: 'Especificação dos próximos fios' },
      { k: 'wtype', l: 'Tipo', type: 'select', opts: Object.keys(HX.CAT.wires) }, { k: 'gauge', l: 'Bitola', type: 'select', opts: t.gauges },
      { k: 'color', l: 'Cor', type: 'select', opts: col }, { k: 'wirePfx', l: 'Prefixo do número', tip: 'W → W1, W2…' },
      { k: 'name', l: 'Nome (opcional)', tip: 'Nome dado a cada fio novo. Vazio = sem nome' }].concat(HX.WIRE_LBL_FIELDS);
  }
  // valores do formulário: especificação em p.defaults, identificação em p.defaults.wlbl
  function wireView(d) { return Object.assign({ wirePfx: d.wirePfx || 'W' }, d, HX.wireLblOpts(Object.assign({ lblPos: 'n' }, d.wlbl || {})), { name: (d.wlbl || {}).name || '' }); }

  UI.toolPanel = function (app, root) {
    var t = app.tools && app.tools.tool; if (!t || t === 'select') return false;
    var doc = app.doc, d = doc.p.defaults, F = [], view = {}, h = '<h4>Ferramenta: ' + HX.esc(NAMES[t] || t) + '</h4>';
    if (t === 'wire') { F = wireFields(d); view = wireView(d); }
    else if (t === 'splice') { F = [{ k: 'spliceKind', l: 'Tipo de emenda', type: 'select', opts: Object.keys(HX.CAT.splices).map(function (k) { return [k, HX.CAT.splices[k].d]; }) }]; view = { spliceKind: d.spliceKind || 'junction' }; }
    h += '<p class="muted">' + HX.esc((app.tools.HINTS || {})[t] || '') + '</p>';
    h += UI.form(F, view);
    if (t === 'wire') h += '<p class="muted">Vale para os próximos fios. Para mudar um fio já desenhado, saia da ferramenta (Esc) e selecione o fio.</p>';
    h += '<div class="row"><button id="tpExit" style="flex:1">Sair da ferramenta (Esc)</button></div>';
    root.innerHTML = h;
    UI.bindForm(F, root, view, function (k, v) {
      doc.change('Padrão: ' + k, function () {
        if (HX.WLBL_DEF.hasOwnProperty(k) || k === 'name') {
          var o = d.wlbl = Object.assign({}, d.wlbl || {}); if (k === 'name' && v === '') delete o.name; else o[k] = v;
        } else {
          d[k] = v;
          if (k === 'wtype') { var ty = HX.wireType(v); if (ty && ty.gauges.indexOf(String(d.gauge)) < 0) d.gauge = ty.gauges[0]; }
        }
      });
    });
    UI.$('#tpExit', root).onclick = function () { app.tools.setTool('select'); UI.$('#cv') && UI.$('#cv').focus(); };
    return true;
  };
  // trocar de ferramenta atualiza a aba lateral
  var st = HX.Tools.prototype.setTool;
  HX.Tools.prototype.setTool = function (t, data) { st.call(this, t, data); if (this.ui && this.ui.renderProps) this.ui.renderProps(); };
})(typeof window !== 'undefined' ? window : globalThis);
