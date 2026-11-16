/* HarnessCAD - interface das ferramentas novas do desenho físico (propriedades e ações por item):
   sub-ramo (girar, espelhar, selecionar), deslizar BR, itens no ramo, notas com bandeira, vista de detalhe,
   backshell/boot, peso, ferramenta de crimpagem, cobertura (Ø interno, razão, g/m) e variantes. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  var VAR = { k: 'var', l: 'Variantes onde existe', tip: 'Ex.: A,B — vazio = em todas (Painel da folha › Variantes)' };
  var COV = [{ k: 'covId', l: 'Ø interno da cobertura (mm)', tip: 'Verifica a ocupação (ERC). Termo-retrátil: Ø antes de contrair' }, { k: 'covRatio', l: 'Razão de contração (termo)', tip: 'Ex.: 2 = 2:1, 3 = 3:1' }, { k: 'covW', l: 'Peso da cobertura (g/m)', type: 'number', step: 0.5 }];
  function add(type, extra) { var f0 = EXT[type] && EXT[type].fields; if (!f0) return; EXT[type].fields = function (it, doc) { return f0(it, doc).concat(extra(it)); }; }
  add('pnode', function (it) {
    var DS = function (kind, none) { return [['', none]].concat(Object.keys(HX.PDS || {}).filter(function (k) { return HX.PDS[k].kind === kind; }).map(function (k) { return [k, HX.PDS[k].n]; })); };
    return (it.nkind === 'conn' ? [{ type: 'head', l: 'Imagem real (datasheet)' }, { k: 'dsImg', l: 'Conector', type: 'select', opts: DS('conn', 'Automático pela família').concat([['off', 'Não usar datasheet']]), tip: 'Desenho/foto recortados do catálogo, em tamanho real pela carcaça' },
      { k: 'bsKind', l: 'Backshell / alívio (imagem)', type: 'select', opts: DS('bs', 'Nenhum') }, { k: 'bootKind', l: 'Bota termo-retrátil (imagem)', type: 'select', opts: DS('boot', 'Nenhuma'), tip: 'Bota 90° faz o cabo sair a 90° do conector' },
      { type: 'head', l: 'Acessórios e montagem' }, { k: 'backshell', l: 'Backshell (PN)' }, { k: 'boot', l: 'Boot (PN)' }, { k: 'strain', l: 'Alívio de tensão (PN)' },
      { k: 'peso', l: 'Peso do conector montado (g)', type: 'number', step: 1 }, { k: 'crimpTool', l: 'Ferramenta de crimpagem', tip: 'Vazio = típica pela família/contato' }, { k: 'crimpPos', l: 'Posicionador / matriz', tip: 'Vazio = típico' }] : []).concat([VAR]);
  });
  add('pseg', function () { return COV.concat([VAR]); });
  add('pcov', function () { return COV.concat([VAR]); });
  add('pimg', function () { return [{ k: 'peso', l: 'Peso (g)', type: 'number', step: 1 }, VAR]; });
  EXT.pacc.fields = function (it, doc) {
    var sh = doc.cur(), m = HX.physIdx(sh), sg = m[it.seg] || {}, K = Object.keys(HX.PACC).map(function (k) { return [k, HX.PACC[k].n]; });
    return [{ type: 'head', l: (HX.PACC[it.kind] || {}).n || 'Item no ramo' }, { k: 'kind', l: 'Tipo', type: 'select', opts: K },
      { k: 'dist', l: 'Distância (mm reais)', type: 'number', step: 5 }, { k: 'end', l: 'Medida a partir de', type: 'select', opts: [['a', (m[sg.a] || {}).ref || 'ponta A'], ['b', (m[sg.b] || {}).ref || 'ponta B']] },
      { k: 'text', l: it.kind === 'marker' ? 'Texto do marcador' : 'Rótulo (opcional)' }, { k: 'pn', l: 'Part number' },
      { k: 'len', l: 'Comprimento (fita/marcador, mm)', type: 'number', step: 5 }, { k: 'extra', l: 'Comprimento extra nos fios (folga/laço, mm)', type: 'number', step: 10 },
      { k: 'peso', l: 'Peso (g)', type: 'number', step: 0.5 }, VAR];
  };
  EXT.pflag.fields = function () { return [{ type: 'head', l: 'Nota com bandeira' }, { k: 'n', l: 'Número', type: 'number', step: 1 }, { k: 'text', l: 'Texto da nota', tip: 'Sai na tabela Notas' }]; };
  EXT.pdetail.fields = function () {
    return [{ type: 'head', l: 'Vista de detalhe' }, { k: 'label', l: 'Letra' }, { k: 'k', l: 'Ampliação', type: 'select', opts: [['1.5', '1,5:1'], ['2', '2:1'], ['3', '3:1'], ['4', '4:1'], ['5', '5:1'], ['10', '10:1']] },
      { k: 'sx', l: 'Região: X (mm do papel)', type: 'number', step: 1 }, { k: 'sy', l: 'Região: Y', type: 'number', step: 1 }, { k: 'sw', l: 'Região: largura', type: 'number', step: 1 }, { k: 'sh', l: 'Região: altura', type: 'number', step: 1 }];
  };
  // ações
  function acts(it, doc) {
    var sh = doc.cur(), a = [];
    if (it.type === 'pseg') a = [['rl15', '↺ 15°'], ['rr15', '↻ 15°'], ['rl90', '↺ 90°'], ['rr90', '↻ 90°'], ['mir', 'Espelhar sub-ramo'], ['sel', 'Selecionar sub-ramo (p/ copiar)']];
    if (it.type === 'pnode' && it.nkind !== 'conn' && HX.physSegsOf(sh, it.id).length >= 2) a.push(['slide', 'Deslizar no tronco (distância)…']);
    if (/^(pseg|pnode|pacc|pimg|pcov)$/.test(it.type)) a.push(['flag', 'Nota com bandeira']);
    if (it.type === 'pacc') a.push(['ball', 'Adicionar balão']);
    return a;
  }
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app) || ''; if (!HX.ITEM_EXT[it.type] || !HX.isPhys(app.doc.cur())) return h;
    var A = acts(it, app.doc), sub = A.filter(function (x) { return /^r[lr]/.test(x[0]); }), rest = A.filter(function (x) { return !/^r[lr]/.test(x[0]); });
    if (sub.length) h += '<div class="muted">Sub-ramo (lado menor, gira em torno do nó do tronco):</div><div class="row">' + sub.map(function (x) { return '<button data-p4="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>';
    h += rest.map(function (x) { return '<div class="row"><button data-p4="' + x[0] + '" style="flex:1">' + x[1] + '</button></div>'; }).join('');
    if (it.type === 'pseg') h += '<div class="row"><select id="p4kind">' + Object.keys(HX.PACC).map(function (k) { return '<option value="' + k + '">' + HX.PACC[k].n + '</option>'; }).join('') + '</select><button data-p4="acc">+ Item no ramo</button></div>';
    return h;
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); if (!HX.ITEM_EXT[it.type]) return;
    var doc = app.doc;
    [].slice.call(root.querySelectorAll('[data-p4]')).forEach(function (b) {
      b.onclick = function () {
        var a = b.dataset.p4, sh = doc.cur(), out = null;
        if (a === 'sel') { doc.select(HX.physSubIds(sh, it)); UI.toast('Sub-ramo selecionado — Ctrl+C / Ctrl+V copia com os acessórios.'); return; }
        if (a === 'slide') {
          var t = HX.physTrunkAt(sh, it); if (!t) return; var L = HX.physSegLen(t.s1, HX.physIdx(sh), +sh.scale || 1);
          UI.ask('Deslizar ' + (it.ref || 'BR'), 'Distância de ' + (t.A.ref || 'ponta') + ' até ' + (it.ref || 'BR') + ' (mm reais):', String(L)).then(function (v) { if (v == null || v === '') return; doc.change('Deslizar derivação', function () { HX.physSlideBR(sh, it, parseFloat(String(v).replace(',', '.'))); }); });
          return;
        }
        doc.change('Desenho físico: ' + b.textContent, function () {
          var m = /^r([lr])(\d+)$/.exec(a);
          if (m) HX.physRotateSub(sh, it, (m[1] === 'l' ? -1 : 1) * +m[2]);
          else if (a === 'mir') HX.physMirrorSub(sh, it);
          else if (a === 'flag') out = HX.physAddFlag(doc, it);
          else if (a === 'ball') out = HX.physAddBalloon(doc, it);
          else if (a === 'acc') out = HX.physAddAcc(doc, it, (root.querySelector('#p4kind') || {}).value || 'tie');
        });
        if (out) doc.select([out.id]);
      };
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
