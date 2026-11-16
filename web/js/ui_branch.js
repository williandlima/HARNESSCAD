/* HarnessCAD - interface do detalhamento dos ramos: amarração (abraçadeira tipo Hellermann, barbante, fita) e feixe com
   capa ou fios aparentes — no ramo (propriedades) e como padrão da folha (painel do desenho físico). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, EXT = HX.ITEM_EXT;
  function bindOpts(def) { return [['', def]].concat([['none', 'Sem amarração']]).concat(Object.keys(HX.PHYS_BIND).map(function (k) { return [k, HX.PHYS_BIND[k].n]; })); }
  var LOOSE = [['', 'Padrão da folha'], ['jacket', 'Com capa (feixe fechado)'], ['wires', 'Sem capa — só os fios aparentes']];
  var f0 = EXT.pseg.fields;
  EXT.pseg.fields = function (it, doc) {
    var sh = doc.cur(), bp = HX.physBindParams(it, sh), B = HX.PHYS_BIND[bp.kind];
    return f0(it, doc).concat([{ type: 'head', l: 'Feixe e amarração' }, { k: 'loose', l: 'Feixe', type: 'select', opts: LOOSE },
      { k: 'bind', l: 'Amarração', type: 'select', opts: bindOpts('Padrão da folha' + (sh.bind && HX.PHYS_BIND[sh.bind] ? ' (' + HX.PHYS_BIND[sh.bind].n + ')' : '')) },
      { k: 'bindStep', l: 'Passo (mm)', type: 'number', step: 5, tip: B && B.step ? 'Vazio = ' + (+sh.bindStep || B.step) + ' mm' : 'Fita: contínua' },
      { k: 'bindEnd', l: 'Distância das pontas (mm)', type: 'number', step: 5, tip: B ? 'Vazio = ' + bp.end + ' mm (1ª amarração após a derivação/conector)' : '' },
      { k: 'bindPN', l: 'PN da amarração', tip: 'Vazio = PN padrão da folha' }]);
  };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var doc = app.doc, d = document.createElement('div'), K = Object.keys(HX.PHYS_BIND);
    var sel = function (id, opts, v) { return '<select id="' + id + '">' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(o[0]) === String(v || '') ? ' selected' : '') + '>' + HX.esc(o[1]) + '</option>'; }).join('') + '</select>'; };
    d.innerHTML = '<h4>Ramos (padrão da folha)</h4>' +
      '<div class="row"><label>Identificar ramos (nº de fios, Ø)</label><input id="brI" type="checkbox"' + (sh.segInfo === false ? '' : ' checked') + '></div>' +
      '<div class="row"><label>Feixe</label>' + sel('brL', [['jacket', 'Com capa'], ['wires', 'Sem capa — fios aparentes']], sh.loose || 'wires') + '</div>' +
      '<div class="row"><label title="Distância entre fios vizinhos no papel. Vazio = automático (cabe o ramo mais cheio)">Passo dos fios sem capa (mm)</label><input id="brP" type="number" step="0.05" min="0.2" placeholder="automático" value="' + HX.esc(sh.wirePitch || '') + '"></div>' +
      '<div class="row"><label>Amarração</label>' + sel('brB', [['', 'Nenhuma']].concat(K.map(function (k) { return [k, HX.PHYS_BIND[k].n]; })), sh.bind) + '</div>' +
      '<div class="row"><label>Passo (mm)</label><input id="brS" type="number" step="5" placeholder="automático" value="' + HX.esc(sh.bindStep || '') + '"></div>' +
      '<div class="row"><label>Distância das pontas (mm)</label><input id="brE" type="number" step="5" placeholder="automático" value="' + HX.esc(sh.bindEnd || '') + '"></div>' +
      K.map(function (k) { return '<div class="row"><label>PN — ' + HX.esc(HX.PHYS_BIND[k].n.split(' (')[0].split(' —')[0]) + (k === 'lace' ? ' (pontos)' : k === 'lacec' ? ' (contínua)' : '') + '</label><input data-pn="' + k + '" value="' + HX.esc(sh['bindPN_' + k] || '') + '"></div>'; }).join('') +
      '<div class="row"><button id="brClean" style="flex:1">Remover derivações sem ramificação</button></div>' +
      '<p class="muted">Cada ramo pode ter o seu (Propriedades do ramo › Feixe e amarração). Botão direito no ramo: atalhos.</p>';
    var ref = [].slice.call(root.querySelectorAll('h4')).filter(function (x) { return /Ferramentas do chicote/.test(x.textContent); })[0];
    if (ref) ref.parentNode.parentNode.insertBefore(d, ref.parentNode); else root.appendChild(d);
    function set(lbl, fn) { doc.change(lbl, fn); }
    d.querySelector('#brClean').onclick = function () { var k = 0; set('Remover derivações sem ramificação', function () { k = HX.physCleanBR(doc, sh, false); }); HX.UI.toast(k ? k + ' derivação(ões) removida(s); os ramos foram unidos.' : 'Todas as derivações têm ramificação.'); };
    d.querySelector('#brI').onchange = function () { var v = this.checked; set('Identificar ramos', function () { sh.segInfo = v; }); };
    d.querySelector('#brL').onchange = function () { var v = this.value; set('Feixe', function () { sh.loose = v; }); };
    d.querySelector('#brP').onchange = function () { var v = this.value; set('Passo dos fios', function () { sh.wirePitch = v; }); };
    d.querySelector('#brB').onchange = function () { var v = this.value; set('Amarração', function () { sh.bind = v; }); };
    d.querySelector('#brS').onchange = function () { var v = this.value; set('Passo da amarração', function () { sh.bindStep = v; }); };
    d.querySelector('#brE').onchange = function () { var v = this.value; set('Amarração: distância das pontas', function () { sh.bindEnd = v; }); };
    [].slice.call(d.querySelectorAll('[data-pn]')).forEach(function (i) { i.onchange = function () { var v = this.value.trim(), k = this.dataset.pn; set('PN da amarração', function () { sh['bindPN_' + k] = v; }); }; });
  };
})(typeof window !== 'undefined' ? window : globalThis);
