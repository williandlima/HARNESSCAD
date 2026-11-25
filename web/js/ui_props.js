/* HarnessCAD - painel de propriedades */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, ops = HX.ops;
  var COLORS = function () { return Object.keys(HX.COLORS).map(function (k) { return [k, k + ' ' + HX.COLORS[k][0]]; }); };

  UI.initProps = function (app) {
    var doc = app.doc, root = UI.$('#props');
    function set(it, k, v, geo) {
      if (k === 'rot') v = +v;
      doc.change('Editar ' + k, function () {
        if (geo) ops.keepWires(doc, [it.id], function () { it[k] = v; }); else it[k] = v;
      });
    }
    function render() {
      if (UI.toolPanel && UI.toolPanel(app, root)) return; // ferramenta ativa: ajustes dela
      var s = doc.selected();
      if (!s.length) return renderNone();
      if (s.length > 1) return renderMulti(s);
      var it = s[0], F = fieldsFor(it), h = '<h4>' + (({ conn: 'Conector', wire: 'Fio', splice: 'Emenda', label: 'Label', text: 'Texto', shape: 'Forma', cable: 'Cabo / blindagem', face: 'Vista frontal', dim: 'Cota do chicote', brk: 'Ponto de derivação' })[it.type] || '') + '</h4>';
      h += UI.form(F, it.type === 'wire' ? HX.wireFormView(it) : it);
      h += UI.propsExtra(it, app);
      root.innerHTML = h;
      UI.bindForm(F, root, it, function (k, v, f) { set(it, k, v, f.geo); });
      UI.propsBind(it, app, root, set);
    }
    function fieldsFor(it) {
      switch (it.type) {
        case 'conn': {
          if (it.eq) return [{ k: 'ref', l: 'Referência' }, { k: 'pnOverride', l: 'Modelo / PN', tip: 'Ex.: Keysight E3634A' },
            { k: 'wu', l: 'Largura (un)', type: 'number', geo: true }, { k: 'minRows', l: 'Altura mín. (linhas)', type: 'number', geo: true },
            { k: 'locked', l: 'Bloqueado', type: 'check' }, { k: 'note', l: 'Observação' }];
          if (it.disc) return [{ k: 'ref', l: 'Referência' }, { k: 'val', l: 'Valor', tip: 'Ex.: 120 Ω, 100 nF, 2 A' }, { k: 'pnOverride', l: 'PN do fabricante' },
            { k: 'wu', l: 'Largura (un)', type: 'number', geo: true }, { k: 'locked', l: 'Bloqueado', type: 'check' }, { k: 'note', l: 'Observação' }];
          var f = HX.CAT.fams[(it.part || '').split(':')[0]] || {};
          var F = [{ k: 'ref', l: 'Referência' }, { k: 'gstyle', l: 'Símbolo', type: 'select', opts: [['', 'Padrão do projeto']].concat(HX.CONN_STYLES) }];
          if (f.variants) F.push({ k: 'variant', l: 'Variante', type: 'select', opts: f.variants.map(function (v) { return [v.v, v.d]; }) });
          (f.opts || []).forEach(function (o) { F.push({ k: o.k, l: o.l, type: 'select', opts: o.opts }); });
          return F.concat([{ k: 'gender', l: 'Gênero', type: 'select', opts: [['S', 'Soquete (fêmea)'], ['P', 'Pino (macho)']] },
            { k: 'pnOverride', l: 'PN manual', tip: 'Substitui o PN gerado' }].concat(it.backshell ? [{ k: 'backshell', l: 'Backshell (antigo)', tip: 'Periférico: defina na cablagem física (nó do conector). Vai para a folha física ao gerar' }] : []).concat([
            { k: 'side', l: 'Lado pinos', type: 'select', opts: [['R', 'Direita'], ['L', 'Esquerda'], ['B', 'Ambos (passante)']], geo: true },
            { k: 'wu', l: 'Largura (un)', type: 'number', geo: true }, { k: 'locked', l: 'Bloqueado', type: 'check' }, { k: 'note', l: 'Observação' }]));
        }
        case 'wire': {
          var t = HX.wireType(it.wtype) || { gauges: [it.gauge] };
          return [{ k: 'num', l: 'Número' }, { k: 'name', l: 'Nome do fio', tip: 'Opcional. Ex.: CAN-H, +28V' }, { k: 'wtype', l: 'Tipo', type: 'select', opts: Object.keys(HX.CAT.wires) },
            { k: 'gauge', l: 'Bitola', type: 'select', opts: t.gauges }, { k: 'color', l: 'Cor', type: 'select', opts: colorOpts(it.color) },
            { k: 'pnOverride', l: 'PN manual' }, { k: 'note', l: 'Observação' }].concat(HX.wireLenSet || !(+it.len > 0) ? [] : [{ k: 'len', l: 'Compr. manual (antigo)', type: 'number', tip: 'O comprimento vem do desenho físico; apague para usá-lo' }], HX.WIRE_MFG_FIELDS || [], HX.WIRE_LBL_FIELDS);
        }
        case 'splice': return [{ k: 'ref', l: 'Referência' }, { k: 'kind', l: 'Tipo', type: 'select', opts: Object.keys(HX.CAT.splices).map(function (k) { return [k, HX.CAT.splices[k].d]; }) },
          { k: 'part', l: 'Part number', list: 'splParts' }, { k: 'note', l: 'Observação' }];
        case 'label': return [{ k: 'text', l: 'Circuito' }, { k: 'style', l: 'Estilo', type: 'select', opts: [['local', 'Local'], ['global', 'Global (bandeira)'], ['gnd', 'Terra'], ['chassis', 'Chassi']] },
          { k: 'rot', l: 'Rotação', type: 'select', opts: [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']] }];
        case 'text': return [{ k: 'text', l: 'Texto', type: 'textarea' }, { k: 'size', l: 'Altura (mm)', type: 'number', step: 0.5 },
          { k: 'rot', l: 'Rotação', type: 'select', opts: [[0, 'Horizontal'], [90, 'Vertical']] }, { k: 'bold', l: 'Negrito', type: 'check' }, { k: 'color', l: 'Cor', type: 'color' }];
        case 'shape': return [{ k: 'kind', l: 'Tipo', type: 'select', opts: [['line', 'Linha'], ['rect', 'Retângulo'], ['circle', 'Círculo']] },
          { k: 'dash', l: 'Tracejado', type: 'check' }, { k: 'lw', l: 'Espessura', type: 'number', step: 0.05 }, { k: 'color', l: 'Cor', type: 'color' }];
        case 'dim': return [{ k: 'len', l: 'Comprimento real (mm)', type: 'number', step: 1 }, { k: 'tolP', l: 'Tolerância + (mm)', tip: 'Ex.: 50 → 500 +50/-0' }, { k: 'tolM', l: 'Tolerância − (mm)' },
          { k: 'orient', l: 'Linha de cota', type: 'select', opts: [['h', 'Horizontal'], ['v', 'Vertical'], ['a', 'Alinhada (inclinada)']] }, { k: 'off', l: 'Afastamento (mm)', type: 'number', step: 0.5 },
          { k: 'text', l: 'Texto (opcional)', tip: 'Substitui o valor' }, { k: 'showCount', l: 'Mostrar nº de fios', type: 'check' }];
        case 'brk': return [{ k: 'ref', l: 'Referência' }];
        case 'face': return [{ k: 'd', l: 'Largura da imagem (mm)', type: 'number', step: 1 }, { k: 'table', l: 'Tabela de pinagem', type: 'check' }];
        case 'cable': return [{ k: 'ref', l: 'Referência' }, { k: 'part', l: 'Part number' }, { k: 'desc', l: 'Descrição' }, { k: 'shield', l: 'Blindado', type: 'check' }].concat(HX.cableLenSet || !(+it.len > 0) ? [] : [{ k: 'len', l: 'Compr. (antigo)', type: 'number' }]);
      }
      return HX.ITEM_EXT && HX.ITEM_EXT[it.type] && HX.ITEM_EXT[it.type].fields ? HX.ITEM_EXT[it.type].fields(it, doc) : [];
    }
    function colorOpts(cur) { var o = COLORS(); if (cur && !HX.COLORS[cur]) o.unshift([cur, cur]); return o; }

    function renderNone() {
      var sh = doc.cur(), n = {}; sh.items.forEach(function (i) { n[i.type] = (n[i.type] || 0) + 1; });
      root.innerHTML = '<h4>Folha</h4><div class="row"><label>Nome</label><input id="shName" value="' + HX.esc(sh.name) + '"></div>' +
        '<div class="muted">Conectores: ' + (n.conn || 0) + ' · Fios: ' + (n.wire || 0) + ' · Emendas: ' + (n.splice || 0) + ' · Labels: ' + (n.label || 0) + '</div>' +
        '<h4>Projeto</h4><div class="muted">' + HX.esc(doc.p.meta.title) + '<br>' + HX.esc(doc.p.meta.docNo) + ' rev ' + HX.esc(doc.p.meta.rev) + '<br>Folha ' + HX.esc(doc.p.meta.size) + ' · ' + HX.esc(HX.TEMPLATES[doc.p.meta.template] || '') + '</div>' +
        '<div class="row"><button id="pgSetup" style="flex:1">Configurar página / carimbo…</button></div>' +
        '<div class="row"><label>Símbolo padrão</label><select id="pStyle">' + HX.CONN_STYLES.map(function (s) { return '<option value="' + s[0] + '"' + ((doc.p.view.connStyle || 'univ') === s[0] ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></div>' +
        '<p class="muted">Dica: selecione um item para editar. Duplo clique ou <b>E</b> abre aqui. Arraste conectores: os fios acompanham (elástico). Alt+arrastar desliga.</p>';
      UI.$('#shName').onchange = function () { var v = this.value; doc.change('Renomear folha', function () { sh.name = v; }); };
      UI.$('#pgSetup').onclick = function () { app.pageSetup(); };
      if (UI.sheetExtra) UI.sheetExtra(app, root, sh);
      UI.$('#pStyle').onchange = function () { var v = this.value; doc.change('Estilo de símbolo', function () { doc.p.view.connStyle = v; }); app.refreshLib && app.refreshLib(); };
    }
    function renderMulti(s) {
      var A = [['l', '⇤ Esquerda'], ['ch', '↔ Centro H'], ['r', 'Direita ⇥'], ['t', '⤒ Topo'], ['cv', '↕ Centro V'], ['b', 'Base ⤓'], ['dh', 'Distribuir H'], ['dv', 'Distribuir V']];
      root.innerHTML = '<h4>' + s.length + ' itens selecionados</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">' +
        A.map(function (a) { return '<button data-a="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</div>' +
        '<div class="row" style="margin-top:8px"><button id="mRot">Girar (R)</button><button id="mMx">Esp. X</button><button id="mMy">Esp. Y</button></div>' +
        '<div class="row"><button id="mDel" style="flex:1">Excluir selecionados</button></div><p class="muted">Use a aba Fios para aplicar especificação em lote.</p>';
      UI.$$('button[data-a]', root).forEach(function (b) { b.onclick = function () { doc.change('Alinhar', function () { ops.align(doc, doc.selected(), b.dataset.a); }); }; });
      UI.$('#mRot').onclick = function () { app.tools.xform('rot'); };
      UI.$('#mMx').onclick = function () { app.tools.xform('mx'); };
      UI.$('#mMy').onclick = function () { app.tools.xform('my'); };
      UI.$('#mDel').onclick = function () { ops.deleteSel(doc); };
    }
    doc.on('select', render); doc.on('change', render);
    app.renderProps = render;
    app.focusProps = function () { render(); var f = root.querySelector('input,select'); if (f) f.focus(); };
    render();
  };
})(typeof window !== 'undefined' ? window : globalThis);
