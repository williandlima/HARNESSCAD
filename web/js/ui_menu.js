/* HarnessCAD - menus, barra de ferramentas e diálogos de configuração */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  var IC = {
    select: 'M5 3l12 9-5 1 3 6-2 1-3-6-4 4z', wire: 'M3 18h6V6h12', splice: 'M3 12h18M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    label: 'M3 12l4-5h13v10H7z', text: 'M5 5h14M12 5v15', line: 'M4 20L20 4', rect: 'M4 6h16v12H4z', circle: 'M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0',
    cable: 'M12 12m-9 0a9 5 0 1 0 18 0a9 5 0 1 0-18 0M1 9h22M1 15h22', measure: 'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
    rot: 'M20 12a8 8 0 1 1-3-6.3M20 3v5h-5', mx: 'M12 3v18M8 7l-5 5 5 5zM16 7l5 5-5 5z', my: 'M3 12h18M7 8l5-5 5 5zM7 16l5 5 5-5z',
    undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    erc: 'M4 12l5 5L20 6', pdf: 'M6 2h9l5 5v15H6zM14 2v6h6', save: 'M5 3h12l4 4v14H5zM8 3v6h8M8 21v-7h8v7', lock: 'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4', dim: 'M3 8v8M21 8v8M3 12h18M3 12l3-2M3 12l3 2M21 12l-3-2M21 12l-3 2', brk: 'M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0-8 0M9 9l6 6M15 9l-6 6M2 12h6M16 12h6'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24"><path d="' + IC[n] + '"/></svg>'; }

  UI.initMenus = function (app) {
    var doc = app.doc, t = app.tools;
    var M = {
      'Arquivo': [['Novo projeto', app.newProject, ''], ['Abrir…', app.open, ''], ['Salvar', app.save, 'Ctrl+S'], ['Salvar como…', function () { app.save(true); }, ''],
        '-', ['Importar arquivo (.json)…', app.importFile, ''], ['Exportar arquivo (.json)', app.exportFile, ''], ['Backups no servidor…', app.backups, ''],
        '-', ['Imprimir / PDF…', app.pdf, 'Ctrl+P'], ['Exportar lista de fios (CSV)', function () { app.csv('wl'); }, ''], ['Exportar BOM (CSV)', function () { app.csv('bom'); }, ''],
        '-', ['Configurar página / carimbo…', app.pageSetup, '']],
      'Editar': [['Desfazer', function () { doc.undo(); }, 'Ctrl+Z'], ['Refazer', function () { doc.redo(); }, 'Ctrl+Y'], '-',
        ['Copiar', function () { HX.ops.copySel(doc); }, 'Ctrl+C'], ['Colar', function () { t.paste(); }, 'Ctrl+V'], ['Duplicar', function () { t.duplicate(); }, 'Ctrl+D'],
        ['Excluir', function () { HX.ops.deleteSel(doc); }, 'Del'], ['Selecionar tudo', function () { doc.select(doc.items().map(function (i) { return i.id; })); }, 'Ctrl+A'], '-',
        ['Renumerar fios…', app.renumberWires, ''], ['Renumerar conectores/emendas', function () { doc.change('Renumerar', function () { HX.ops.renumberConns(doc); }); }, ''],
        ['Bloquear/desbloquear conector', function () { HX.ops.toggleLock(doc); }, 'Ctrl+L']],
      'Exibir': [['Ajustar à folha', function () { app.view.fit(); }, 'F'], ['Modo foco (só o desenho)', function () { app.toggleFocus(); }, 'F9'],
        ['Texto dos pinos: normal / grande / extra', function () { var v = doc.p.view, n = { n: 'g', g: 'x', x: 'n' }[v.pinSize || 'n']; v.pinSize = n; doc.touch(); UI.toast('Texto dos pinos: ' + { n: 'normal', g: 'grande', x: 'extra grande' }[n]); }, ''], ['Grade…', app.gridDialog, ''],
        ['Texto nos fios (nº/bitola/cor)', function () { toggleView('wireText'); }, ''], ['Fios na cor real', function () { toggleView('wireColor'); }, ''],
        ['Nomes dos sinais nos pinos', function () { toggleView('pinNames'); }, ''], ['Estilo dos símbolos de conector…', function () { doc.select([]); UI.$('#pStyle') && UI.$('#pStyle').focus(); }, ''], ['Marcadores do ERC na folha', function () { app.showErcMarks = !app.showErcMarks; app.erc(); }, '']],
      'Inserir': [['Conector do catálogo', function () { app.focusCatalog(); }, 'A'], ['Fio', function () { t.setTool('wire'); }, 'W'], ['Emenda', function () { t.setTool('splice'); }, 'J'],
        ['Label de circuito', function () { t.setTool('label'); }, 'L'], ['Texto', function () { t.setTool('text'); }, 'T'], ['Cabo / blindagem', function () { t.setTool('cable'); }, 'C'], ['Cota (desenho físico)', function () { t.setTool('dim'); }, 'D'], ['Derivação (desenho físico)', function () { t.setTool('brk'); }, 'B'], '-',
        ['Nova folha', app.addSheet, ''], ['Excluir folha atual', app.delSheet, '']],
      'Ferramentas': [['Verificação elétrica (ERC)', function () { app.erc(); }, 'F2'], ['Gerar desenho físico…', function () { UI.physDialog(app); }, ''], ['Conector personalizado…', function () { UI.customConnDialog(app, app.refreshLib); }, ''],
        ['Medir distância', function () { t.setTool('measure'); }, ''], ['Meu nome de usuário…', function () { app.setUser(); }, '']],
      'Ajuda': [['Atalhos de teclado', app.shortcuts, ''], ['Sobre', function () { UI.modal('HarnessCAD ' + HX.VERSION, '<p>Editor de esquemas elétricos de cablagens para intranet.<br>HTML/CSS/JS no navegador + servidor Python 3.8 (stdlib) ou Java 8.<br>Sem dependências externas.</p>'); }, '']]
    };
    (HX.MENU_EXTRA || []).forEach(function (e) { M[e[0]].push(e[1](app)); });
    function toggleView(k) { doc.p.view[k] = doc.p.view[k] === false ? true : !doc.p.view[k]; doc.touch(); }
    var mm = UI.$('#menus'); mm.innerHTML = '';
    Object.keys(M).forEach(function (name) {
      var m = UI.h('div', { class: 'menu' }, '<span>' + name + '</span>'), dd = UI.h('div', { class: 'dd' });
      M[name].forEach(function (it) {
        if (it === '-') { dd.appendChild(UI.h('hr')); return; }
        var d = UI.h('div', {}, '<span>' + HX.esc(it[0]) + '</span><kbd>' + it[2] + '</kbd>');
        d.onclick = function () { m.classList.remove('open'); it[1].call(app); }; dd.appendChild(d);
      });
      m.appendChild(dd);
      m.firstChild.onclick = function (e) { e.stopPropagation(); var o = m.classList.contains('open'); UI.$$('.menu').forEach(function (x) { x.classList.remove('open'); }); if (!o) m.classList.add('open'); };
      m.onmouseenter = function () { if (UI.$('.menu.open') && !m.classList.contains('open')) { UI.$$('.menu').forEach(function (x) { x.classList.remove('open'); }); m.classList.add('open'); } };
      mm.appendChild(m);
    });
    document.addEventListener('click', function () { UI.$$('.menu').forEach(function (x) { x.classList.remove('open'); }); });

    // Barra de ferramentas
    var tb = UI.$('#toolbar'), tools = [['select', 'Selecionar (Esc)'], ['wire', 'Fio (W)'], ['splice', 'Emenda (J)'], ['label', 'Label (L)'], ['text', 'Texto (T)'],
      ['line', 'Linha'], ['rect', 'Retângulo'], ['circle', 'Círculo'], ['cable', 'Cabo/blindagem (C)'], ['dim', 'Cota do chicote (D)'], ['brk', 'Ponto de derivação (B)'], ['measure', 'Medir']];
    var h = tools.map(function (x) { return '<button data-tool="' + x[0] + '" title="' + x[1] + '">' + icon(x[0]) + '</button>'; }).join('');
    h += '<select id="lblStyle" title="Estilo do label"><option value="local">Label local</option><option value="global">Global</option><option value="gnd">Terra</option><option value="chassis">Chassi</option></select>';
    h += '<span class="sep"></span><button data-cmd="rot" title="Girar (R)">' + icon('rot') + '</button><button data-cmd="mx" title="Espelhar X">' + icon('mx') + '</button><button data-cmd="my" title="Espelhar Y">' + icon('my') + '</button>';
    h += '<button data-cmd="lock" title="Bloquear (Ctrl+L)">' + icon('lock') + '</button>';
    h += '<span class="sep"></span><button data-cmd="undo" title="Desfazer">' + icon('undo') + '</button><button data-cmd="redo" title="Refazer">' + icon('redo') + '</button>';
    h += '<span class="sep"></span><label>Grade <select id="gSize">' + HX.GRID_PRESETS.map(function (g) { return '<option>' + g + '</option>'; }).join('') + '<option value="c">outra…</option></select> mm</label>';
    h += '<label><input type="checkbox" id="gSnap"> Snap</label><label><input type="checkbox" id="gVis"> Visível</label>';
    h += '<span class="sep"></span><button data-cmd="fit" title="Ajustar (F)">' + icon('fit') + '</button><button data-cmd="erc" title="ERC (F2)">' + icon('erc') + ' ERC</button>';
    h += '<button data-cmd="save" title="Salvar (Ctrl+S)">' + icon('save') + '</button><button data-cmd="pdf" title="PDF (Ctrl+P)">' + icon('pdf') + ' PDF</button>';
    tb.innerHTML = h;
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tool) { t.setTool(b.dataset.tool); UI.$('#cv').focus(); return; }
      var c = b.dataset.cmd;
      if (c === 'rot' || c === 'mx' || c === 'my') t.xform(c);
      else if (c === 'lock') HX.ops.toggleLock(doc);
      else if (c === 'undo') doc.undo(); else if (c === 'redo') doc.redo();
      else if (c === 'fit') app.view.fit(); else if (c === 'erc') app.erc();
      else if (c === 'save') app.save(); else if (c === 'pdf') app.pdf();
    });
    UI.$('#gSize').onchange = function () {
      var v = this.value;
      if (v === 'c') { UI.ask('Grade', 'Passo da grade (mm):', doc.p.grid.size).then(function (x) { if (+x > 0) { doc.p.grid.size = +x; app.syncGrid(); doc.touch(); } else app.syncGrid(); }); return; }
      doc.p.grid.size = +v; app.syncGrid(); doc.touch();
    };
    UI.$('#gSnap').onchange = function () { doc.p.grid.snap = this.checked; };
    UI.$('#gVis').onchange = function () { doc.p.grid.visible = this.checked; app.view.redraw(); };
    app.labelStyle = function () { return UI.$('#lblStyle').value; };
    app.onTool = function (tool) { UI.$$('#toolbar button[data-tool]').forEach(function (b) { b.classList.toggle('on', b.dataset.tool === tool); }); };
    app.syncGrid = function () {
      var g = doc.p.grid, s = UI.$('#gSize');
      if (HX.GRID_PRESETS.indexOf(+g.size) < 0) { var o = s.querySelector('option.cu') || UI.h('option', { class: 'cu' }); o.textContent = g.size; o.value = g.size; s.insertBefore(o, s.lastChild); }
      s.value = String(g.size); UI.$('#gSnap').checked = g.snap; UI.$('#gVis').checked = g.visible;
    };
    app.syncGrid(); app.onTool('select');
  };
})(typeof window !== 'undefined' ? window : globalThis);
