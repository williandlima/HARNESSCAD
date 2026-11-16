/* HarnessCAD - interface do desenho físico (7): botões Detalhe (V) e Etiqueta (I) na barra, painéis das ferramentas,
   propriedades da vista de detalhe, da etiqueta de identificação e da cota (valor que define o ramo, nº de fios). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  var BTN = [['pdet', 'Vista de detalhe (V) — arraste sobre a área a ampliar', 'M10 10m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M14.5 14.5L21 21M7 10h6M10 7v6'],
    ['ptag', 'Etiqueta de identificação no cabo (I)', 'M3 12h4M17 12h4M7 8h10v8H7zM10 12h4']];
  // painéis das ferramentas
  var tp0 = UI.toolPanel;
  UI.toolPanel = function (app, root) {
    var t = app.tools && app.tools.tool, doc = app.doc, sh = doc.cur();
    if (!HX.isPhys(sh) || (t !== 'pdet' && t !== 'ptag')) return tp0(app, root);
    var sel = function (id, o, v) { return '<select id="' + id + '">' + o.map(function (x) { return '<option value="' + x[0] + '"' + (String(x[0]) === String(v) ? ' selected' : '') + '>' + HX.esc(x[1]) + '</option>'; }).join('') + '</select>'; };
    if (t === 'pdet') root.innerHTML = '<h4>Ferramenta: Vista de detalhe</h4><p class="muted">Arraste sobre a área do chicote que quer ampliar. A vista nasce num lugar livre, com a maior ampliação que cabe (até 10:1). Depois: arraste a vista para mudar o lugar; com o detalhe selecionado, arraste a borda tracejada da região para movê-la e o quadradinho laranja para mudar o tamanho.</p>' +
      '<div class="row"><label>Forma da região</label>' + sel('tdShape', [['circle', 'Círculo (padrão do desenho técnico)'], ['rect', 'Retângulo']], sh.detShape || 'circle') + '</div>';
    else root.innerHTML = '<h4>Ferramenta: Etiqueta de identificação</h4><p class="muted">Clique sobre o ramo onde vai a etiqueta. A posição é medida a partir do conector mais próximo (mm reais). Arraste a etiqueta para deslizar no ramo (passo 5 mm); Shift + arrastar move só a bandeira.</p>' +
      '<div class="row"><label>Tipo padrão</label>' + sel('ttSty', Object.keys(HX.PTAG).map(function (k) { return [k, HX.PTAG[k]]; }), sh.tagStyle || 'sleeve') + '</div>' +
      '<div class="row"><label>PN padrão</label><input id="ttPN" value="' + HX.esc(sh.tagPN || '') + '" placeholder="ex.: TMS-SCE-1/8-2.0-9"></div>' +
      '<div class="row"><label>Com cota da posição</label><input id="ttDim" type="checkbox"' + (sh.tagDim === false ? '' : ' checked') + '></div>';
    root.innerHTML += '<div class="row"><button id="tpExit" style="flex:1">Sair da ferramenta (Esc)</button></div>';
    var on = function (id, fn) { var e = root.querySelector('#' + id); if (e) e.onchange = function () { var v = e.type === 'checkbox' ? e.checked : e.value; doc.change('Opção da ferramenta', function () { fn(v); }); }; };
    on('tdShape', function (v) { sh.detShape = v; }); on('ttSty', function (v) { sh.tagStyle = v; }); on('ttPN', function (v) { sh.tagPN = v.trim(); }); on('ttDim', function (v) { sh.tagDim = v; });
    root.querySelector('#tpExit').onclick = function () { app.tools.setTool('select'); };
    return true;
  };
  EXT.pdetail.fields = function () {
    return [{ type: 'head', l: 'Vista de detalhe (zoom da área)' }, { k: 'label', l: 'Letra' }, { k: 'title', l: 'Título (opcional)', tip: 'Ex.: derivação BR1' },
      { k: 'shape', l: 'Forma', type: 'select', opts: [['rect', 'Retângulo'], ['circle', 'Círculo']] },
      { k: 'k', l: 'Ampliação', type: 'select', opts: [['1.5', '1,5:1'], ['2', '2:1'], ['2.5', '2,5:1'], ['3', '3:1'], ['4', '4:1'], ['5', '5:1'], ['8', '8:1'], ['10', '10:1']] },
      { k: 'leader', l: 'Linha de chamada até a vista', type: 'check' }, { k: 'annot', l: 'Mostrar cotas e balões dentro do detalhe', type: 'check' },
      { type: 'head', l: 'Região (mm do papel) — ou arraste a borda' }, { k: 'sx', l: 'X', type: 'number', step: 1 }, { k: 'sy', l: 'Y', type: 'number', step: 1 }, { k: 'sw', l: 'Largura (Ø no círculo)', type: 'number', step: 1 }, { k: 'sh', l: 'Altura', type: 'number', step: 1 }];
  };
  EXT.ptag.fields = function (it, doc) {
    var sh = doc.cur(), m = HX.physIdx(sh), sg = m[it.seg] || {}, BU = HX.physBundle(doc.p, sh), ws = (BU.seg[sg.id] || { wires: [] }).wires;
    return [{ type: 'head', l: 'Etiqueta de identificação' }, { k: 'text', l: 'Texto impresso', tip: 'Ex.: W12, P1, 28V-ALIM' }, { k: 'style', l: 'Tipo', type: 'select', opts: Object.keys(HX.PTAG).map(function (k) { return [k, HX.PTAG[k]]; }) },
      { k: 'wire', l: 'Fio (luva no fio)', type: 'select', opts: [['', '(feixe inteiro)']].concat(ws.map(function (w) { return [w.num, 'Fio ' + w.num + (w.color ? ' · ' + w.color : '')]; })), tip: 'Com feixe sem capa a luva fica sobre o fio' },
      { k: 'pn', l: 'Part number' }, { k: 'len', l: 'Comprimento da luva (mm)', type: 'number', step: 5 },
      { type: 'head', l: 'Posição' }, { k: 'dist', l: 'Distância (mm reais)', type: 'number', step: 5, tip: 'Ou arraste a etiqueta no ramo' }, { k: 'end', l: 'Medida a partir de', type: 'select', opts: [['a', (m[sg.a] || {}).ref || 'ponta A'], ['b', (m[sg.b] || {}).ref || 'ponta B']] },
      { k: 'dim', l: 'Mostrar cota da posição', type: 'check' }, { k: 'dimOff', l: 'Afastamento da cota (mm, − = outro lado)', type: 'number', step: 1 }, { k: 'tolP', l: 'Tolerância ± (mm)' }];
  };
  var df = EXT.pdim.fields;
  EXT.pdim.fields = function (it, doc) {
    var V = HX.physDimValue(it, HX.physCtx(doc.p, doc.sheet, {}), doc.p); HX.physHide(it, '_val', V.v == null ? '' : V.v);
    return [{ type: 'head', l: 'Cota do chicote' }, { k: '_val', l: it.mode === 'free' ? 'Valor (medido)' : 'Valor (mm) — define o ramo', type: 'number', step: 1, tip: 'Digite: o ramo (ou os ramos do caminho) passa a ter esse comprimento' },
      { k: 'hideCount', l: 'Ocultar nº de fios', type: 'check' }].concat(df(it, doc).slice(1));
  };
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app) || '', sh = app.doc.cur();
    if (it.type === 'pdim' && HX.isPhys(sh)) h += '<div class="row"><label title="Desligado: o valor muda só o número (desenho fora de escala, valor sublinhado)">Cota redesenha em escala</label><input id="p7Red" type="checkbox"' + (sh.dimRedraw === false ? '' : ' checked') + '></div>';
    return h;
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); var doc = app.doc, sh = doc.cur();
    if (it.type !== 'pdim' || !HX.isPhys(sh)) return;
    var v = root.querySelector('#f__val'), r = root.querySelector('#p7Red');
    if (v) root.addEventListener('change', function (e) {
      if (e.target !== v) return; e.stopPropagation(); var msg = '';
      doc.change('Valor da cota', function () { msg = HX.physDimSet(sh, it, v.value); }); if (msg) UI.toast(msg, true);
    }, true);
    if (r) r.onchange = function () { var c = r.checked; doc.change('Cota redesenha em escala', function () { sh.dimRedraw = c; }); };
  };
  // botões na barra (só no desenho físico)
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () {
    init0.call(this); var app = this, tb = UI.$('#toolbar'), ref = tb.querySelector('[data-tool="paint"]') || tb.querySelector('[data-tool="brk"]');
    var h = BTN.map(function (b) { return '<button data-tool="' + b[0] + '" title="' + b[1] + '"><svg viewBox="0 0 24 24"><path d="' + b[2] + '"/></svg></button>'; }).join('');
    if (ref) ref.insertAdjacentHTML('afterend', h); else tb.insertAdjacentHTML('beforeend', h);
    BTN.forEach(function (b) { var e = tb.querySelector('[data-tool="' + b[0] + '"]'); e.onclick = function () { app.tools.setTool(b[0]); UI.$('#cv').focus(); }; });
    function sync() { var ph = HX.isPhys(app.doc.cur()); BTN.forEach(function (b) { tb.querySelector('[data-tool="' + b[0] + '"]').style.display = ph ? '' : 'none'; }); }
    app.doc.on('change', sync); app.doc.on('load', sync); sync();
    HX.SHORTCUTS.push(['V', 'Desenho físico: vista de detalhe (arraste a área)'], ['I', 'Desenho físico: etiqueta de identificação no ramo']);
  };
})(typeof window !== 'undefined' ? window : globalThis);
