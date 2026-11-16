/* HarnessCAD - aplicação: inicialização, arquivos, folhas, status, autosave */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;

  function App() {
    var app = this;
    app.doc = new HX.Doc();
    app.view = new HX.View(UI.$('#cv'), app.doc);
    app.tools = new HX.Tools(app.doc, app.view, app);
    app.serverName = ''; app.serverMtime = 0; app.showErcMarks = false;
    app.prompt = function (msg, def) { return G.prompt(msg, def); };
    app.status = function (s) {
      UI.$('#status').innerHTML = '<span>X <b>' + s.x.toFixed(2) + '</b> Y <b>' + s.y.toFixed(2) + '</b> mm</span><span>Grade <b>' + app.doc.p.grid.size + '</b></span>' +
        '<span>Zoom <b>' + Math.round(app.view.s * 100 / 3.78) + '%</b></span><span>' + (HX.io.online ? '🟢 servidor' : '🟠 local (offline)') + '</span><span class="hint">' + HX.esc(s.hint) + '</span>';
    };
    app.doc.on('change', function () { app.title(); app.sheetTabs(); });
    app.doc.on('load', function () { app.title(); app.sheetTabs(); app.syncGrid && app.syncGrid(); app.refreshWire && app.refreshWire(); UI.initSplicePane(app); Object.assign(app.doc.p.library.conns, app.sharedLib || {}); app.refreshLib && app.refreshLib(); });
  }
  HX.App = App;
  var A = App.prototype;

  A.title = function () {
    var m = this.doc.p.meta; UI.$('#docTitle').textContent = (this.doc.dirty ? '● ' : '') + m.docNo + ' rev ' + m.rev + ' — ' + m.title + (this.serverName ? '  [' + this.serverName + ']' : '');
    document.title = (this.doc.dirty ? '* ' : '') + m.docNo + ' — HarnessCAD';
  };
  A.sheetTabs = function () {
    var app = this, doc = this.doc, el = UI.$('#sheetTabs');
    el.innerHTML = doc.p.sheets.map(function (s, i) { return '<button class="' + (i === doc.sheet ? 'on' : '') + '" data-s="' + i + '" title="Duplo clique renomeia">' + HX.esc(s.name) + '</button>'; }).join('') +
      '<button id="shAdd" title="Nova folha">+</button>';
    UI.$$('button[data-s]', el).forEach(function (b) {
      b.onclick = function () { app.setSheet(+b.dataset.s); };
      b.ondblclick = function () { UI.ask('Folha', 'Nome da folha:', doc.p.sheets[+b.dataset.s].name).then(function (v) { if (v) doc.change('Renomear folha', function () { doc.p.sheets[+b.dataset.s].name = v; }); }); };
    });
    UI.$('#shAdd').onclick = function () { app.addSheet(); };
  };
  A.setSheet = function (i) { if (i === this.doc.sheet) return; this.tools.setTool('select'); this.doc.sheet = i; this.doc.sel.clear(); this.view.nl = null; this.view._pts = null; this.doc.emit('change'); this.doc.emit('select'); };
  A.addSheet = function () {
    var doc = this.doc; doc.change('Nova folha', function () { doc.p.sheets.push({ id: doc.uid('s'), name: 'Folha ' + (doc.p.sheets.length + 1), items: [] }); });
    this.setSheet(doc.p.sheets.length - 1);
  };
  A.delSheet = function () {
    var doc = this.doc, app = this; if (doc.p.sheets.length < 2) return UI.toast('O projeto precisa de ao menos uma folha', true);
    UI.confirm('Excluir folha', 'Excluir "' + doc.cur().name + '" e todo o seu conteúdo?').then(function (ok) {
      if (!ok) return; doc.change('Excluir folha', function () { doc.p.sheets.splice(doc.sheet, 1); doc.sheet = Math.max(0, doc.sheet - 1); }); app.view.fit();
    });
  };

  A.gotoItem = function (id, sheet, pt) {
    if (sheet != null && sheet !== this.doc.sheet) this.setSheet(sheet);
    var it = id && this.doc.find(id);
    if (it) { this.doc.select([it.id]); var b = HX.bbox(it, this.doc.p.unit); pt = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; }
    if (pt) this.view.centerOn(pt[0], pt[1], Math.max(this.view.s, 5));
  };
  A.erc = function () { this.showTab('erc'); var e = this.ercData(); this.view.ercMarks = this.showErcMarks ? e : null; this.view.redraw(); };

  // ---------- Arquivos ----------
  A.confirmDiscard = function () { return this.doc.dirty ? UI.confirm('Alterações não salvas', 'Descartar as alterações do projeto atual?') : Promise.resolve(true); };
  A.newProject = function () {
    var app = this; app.confirmDiscard().then(function (ok) { if (!ok) return; app.serverName = ''; app.serverMtime = 0; app.doc.load(HX.newProject()); app.clearAutosave(); app.pageSetup(); });
  };
  A.loadText = function (text, name) {
    var p; try { p = JSON.parse(text); } catch (e) { return UI.toast('Arquivo inválido: ' + e.message, true); }
    if (!p || !p.sheets) return UI.toast('Arquivo não é um projeto HarnessCAD', true);
    this.doc.load(p, name); this.clearAutosave(); UI.toast('Projeto carregado: ' + name);
  };
  A.importFile = function () { var app = this; app.confirmDiscard().then(function (ok) { if (ok) HX.io.pickFile().then(function (f) { app.serverName = ''; app.loadText(f.text, f.name); }); }); };
  A.exportFile = function () { HX.io.download(HX.io.safeName(this.doc.p.meta.docNo + '_rev' + this.doc.p.meta.rev) + '.json', JSON.stringify(this.doc.p, null, 1), 'application/json'); this.doc.dirty = false; this.clearAutosave(); this.title(); };
  A.save = function (as) {
    var app = this, doc = this.doc;
    if (!HX.io.online) { app.exportFile(); return; }
    if (!HX.io.user && doc.p.meta.author) HX.io.setUser(doc.p.meta.author);
    var go = function (name) {
      if (!name) return;
      name = HX.io.safeName(name);
      HX.io.save(name, doc.p, name === app.serverName ? app.serverMtime : 0).then(function (r) {
        app.serverName = name; app.serverMtime = r.mtime; doc.dirty = false; app.clearAutosave(); app.title(); UI.toast('Salvo no servidor: ' + name);
      }).catch(function (e) {
        if (e.status === 409) UI.confirm('Conflito', 'O arquivo foi alterado por outro usuário desde que você abriu. Sobrescrever mesmo assim?').then(function (ok) {
          if (ok) HX.io.save(name, doc.p, 0).then(function (r) { app.serverName = name; app.serverMtime = r.mtime; doc.dirty = false; app.clearAutosave(); app.title(); UI.toast('Salvo'); });
        });
        else UI.toast('Erro ao salvar: ' + e.message, true);
      });
    };
    if (!as && app.serverName) go(app.serverName);
    else UI.ask('Salvar no servidor', 'Nome do projeto:', app.serverName || (doc.p.meta.docNo + '_' + doc.p.meta.title)).then(go);
  };
  A.openServer = function (name) {
    var app = this;
    HX.io.load(name).then(function (r) { app.serverName = name; app.serverMtime = r.mtime; app.loadText(JSON.stringify(r.project), name); })
      .catch(function (e) { UI.toast('Erro ao abrir: ' + e.message, true); });
  };
  A.csv = function (t) { this.showTab(t); UI.$('#tCsv').click(); };

  A.clearAutosave = function () { HX.io.localSet('hx-autosave', null); };
  A.autosave = function () {
    var app = this;
    setInterval(function () { if (app.doc.dirty) HX.io.localSet('hx-autosave', { t: Date.now(), name: app.serverName, mtime: app.serverMtime, p: app.doc.p }); }, 20000);
    G.addEventListener('beforeunload', function (e) { if (app.doc.dirty) { HX.io.localSet('hx-autosave', { t: Date.now(), name: app.serverName, mtime: app.serverMtime, p: app.doc.p }); e.preventDefault(); e.returnValue = ''; } });
    var a = HX.io.localGet('hx-autosave');
    if (a && a.p && a.p.sheets) {
      UI.confirm('Recuperar trabalho', 'Existe um rascunho salvo automaticamente em ' + new Date(a.t).toLocaleString() + '. Recuperar?').then(function (ok) {
        if (ok) { app.serverName = a.name || ''; app.serverMtime = a.mtime || 0; app.doc.load(a.p, a.name); HX.io.localSet('hx-autosave', a); app.doc.dirty = true; app.title(); }
        else HX.io.localSet('hx-autosave', null);
      });
    }
  };

  A.init = function () {
    var app = this;
    UI.$('#leftTabs').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      UI.$$('#leftTabs button').forEach(function (x) { x.classList.toggle('on', x === b); });
      ['pConn', 'pWire', 'pSplice'].forEach(function (p) { UI.$('#' + p).style.display = p === b.dataset.p ? '' : 'none'; });
    });
    UI.initMenus(app); UI.initLib(app); UI.initProps(app); UI.initTables(app);
    app.tools.bind();
    G.addEventListener('resize', function () { app.view.resize(); });
    app.view.resize(); app.view.fit(); app.title(); app.sheetTabs(); app.tools.status();
    HX.io.detect().then(function (on) {
      app.tools.status();
      if (on) HX.io.loadLibrary().then(function (lib) { app.sharedLib = lib || {}; Object.assign(app.doc.p.library.conns, lib || {}); app.refreshLib(); }).catch(function () { /* sem biblioteca */ });
      else { var raw = HX.io.localGet('hx-library') || {}; if (HX.onLibLoad) HX.onLibLoad(raw); app.sharedLib = HX.sanitizeLibrary(raw); Object.assign(app.doc.p.library.conns, app.sharedLib); }
      app.autosave();
    });
  };

  if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', function () { G.app = new App(); G.app.init(); });
})(typeof window !== 'undefined' ? window : globalThis);
