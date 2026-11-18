/* HarnessCAD - TELA INICIAL / ARQUIVO (backstage): novo projeto, abrir do servidor, importar, recentes, rascunho
   salvo automaticamente e todos os comandos de arquivo. Abre ao iniciar e pela aba Arquivo; Esc fecha. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype, MAXR = 12;
  HX.recentAdd = function (list, e) { // mantém o mais novo em cima, sem repetir o nome
    list = (list || []).filter(function (r) { return r.name !== e.name; }); list.unshift(e); return list.slice(0, MAXR);
  };
  function svg(n) { return '<svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(n) + '"/></svg>'; }
  A.initStart = function () {
    var app = this, doc = app.doc, el = UI.h('div', { id: 'start' }), lastRec = '';
    document.body.appendChild(el);
    var t0 = A.title; app.title = function () {
      t0.call(app); var n = app.serverName; if (!n || n === lastRec) return; lastRec = n; var m = doc.p.meta;
      HX.io.localSet('hx-recent', HX.recentAdd(HX.io.localGet('hx-recent'), { name: n, title: m.title, docNo: m.docNo, rev: m.rev, t: Date.now() }));
    };
    function cmd(t) { var c = app.commands().filter(function (x) { return x.tab === 'Arquivo' && x.t.indexOf(t) === 0; })[0]; return c; }
    var NAV = [['Novo projeto', 'novo'], ['Abrir…', 'abrir'], ['Salvar', 'salvar'], ['Salvar como…', 'salvar'], ['Importar arquivo', 'importar'], ['Exportar arquivo', 'exportar'],
      ['Imprimir / PDF…', 'imprimir'], ['Configurar página', 'pagina'], ['Backups no servidor…', 'backup'], ['Exportar DXF (Solid Edge / AutoCAD)…', 'exportar'], ['Exportar lista de fios', 'tabela'], ['Exportar BOM', 'bom']];
    function card(id, ic, t, s) { return '<button class="scard" data-a="' + id + '">' + svg(ic) + '<b>' + t + '</b><small>' + s + '</small></button>'; }
    function render() {
      var rec = HX.io.localGet('hx-recent') || [], a = HX.io.localGet('hx-autosave'), on = HX.io.online;
      var nav = '<div class="snav"><div class="sbrand">⚡ HarnessCAD <small>' + HX.VERSION + '</small></div><button class="sback" data-a="close">← Voltar ao desenho</button><hr>' +
        NAV.map(function (n) { return cmd(n[0]) ? '<button data-c="' + HX.esc(n[0]) + '">' + svg(n[1]) + '<span>' + n[0].replace(/…$/, '') + '</span></button>' : ''; }).join('') +
        '<div class="sgrow"></div><button data-a="theme">' + svg('tema') + '<span>Tema claro/escuro</span></button><button data-a="keys">' + svg('atalhos') + '<span>Atalhos</span></button></div>';
      var h = '<div class="smain"><h1>Bem-vindo</h1><p class="sub">Esquemas elétricos e desenho físico de cablagens — ' + (on ? '🟢 conectado ao servidor' : '🟠 modo local (sem servidor)') + '</p>' +
        '<div class="scards">' + card('new', 'novo', 'Novo projeto', 'Folha A3, carimbo e revisão') + card('open', 'abrir', 'Abrir do servidor', on ? 'Projetos da equipe' : 'Indisponível no modo local') +
        card('import', 'importar', 'Importar arquivo', 'Projeto .json do disco') + (a && a.p ? card('recover', 'backup', 'Recuperar rascunho', new Date(a.t).toLocaleString()) : '') +
        card('close', 'fisico', 'Continuar', (doc.p.meta.docNo || '') + ' — ' + HX.esc(doc.p.meta.title || '')) + '</div>' +
        '<h2>Recentes</h2><div class="srec">' + (rec.length ? rec.map(function (r, i) { return '<button data-r="' + i + '">' + svg('pagina') + '<span><b>' + HX.esc(r.docNo || '') + ' rev ' + HX.esc(r.rev || '') + ' — ' + HX.esc(r.title || '') +
        '</b><small>' + HX.esc(r.name) + ' · ' + new Date(r.t).toLocaleString() + '</small></span></button>'; }).join('') : '<p class="muted">Os projetos abertos ou salvos no servidor aparecem aqui.</p>') + '</div>' +
        '<h2>Dicas</h2><div class="stips"><span><kbd>Ctrl+K</kbd> busca qualquer comando ou item (J1, W12…)</span><span><kbd>A</kbd> insere conector do catálogo</span><span><kbd>W</kbd> fio · <kbd>J</kbd> emenda · <kbd>F</kbd> ajustar</span>' +
        '<span><kbd>F9</kbd> modo foco · duplo clique na aba recolhe a faixa</span><span>Exemplo pronto: importe <b>exemplos\\CAB-1001_exemplo.json</b></span></div></div>';
      el.innerHTML = nav + h;
    }
    app.startScreen = function (show) { if (show) { render(); el.classList.add('show'); } else el.classList.remove('show'); };
    el.onclick = function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.c) { var c = cmd(b.dataset.c); app.startScreen(false); if (c) setTimeout(function () { c.el.click(); }, 0); return; }
      if (b.dataset.r != null) { var r = (HX.io.localGet('hx-recent') || [])[+b.dataset.r]; if (!HX.io.online) return UI.toast('Recentes do servidor: inicie o servidor (iniciar_servidor_python.bat)', true);
        app.confirmDiscard().then(function (ok) { if (ok) app.openServer(r.name); }); return; }
      var a = b.dataset.a;
      if (a === 'close') app.startScreen(false); else if (a === 'theme') app.toggleTheme(); else if (a === 'keys') { app.startScreen(false); app.shortcuts(); }
      else if (a === 'new') { app.newProject(); } else if (a === 'open') { if (HX.io.online) app.open(); else UI.toast('Sem servidor: use Importar arquivo', true); }
      else if (a === 'import') app.importFile();
      else if (a === 'recover') { var s = HX.io.localGet('hx-autosave'); app.confirmDiscard().then(function (ok) { if (!ok || !s) return; app.serverName = s.name || ''; app.serverMtime = s.mtime || 0; doc.load(s.p, s.name); doc.dirty = true; app.title(); }); }
    };
    doc.on('load', function () { app.startScreen(false); });
    G.addEventListener('keydown', function (e) { if (e.key === 'Escape' && el.classList.contains('show') && !UI.$('#modal.show')) { e.preventDefault(); app.startScreen(false); } });
    if (HX.io.localGet('hx-start') !== false) app.startScreen(true);
    if (HX.io.detect) HX.io.detect().then(function () { if (el.classList.contains('show')) render(); }, function () {});
  };
})(typeof window !== 'undefined' ? window : globalThis);
