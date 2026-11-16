/* HarnessCAD - diálogos da aplicação: abrir, página/carimbo, grade, PDF, renumerar, atalhos */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;

  A.open = function () {
    var app = this;
    if (!HX.io.online) { app.importFile(); return; }
    HX.io.list().then(function (list) {
      list.sort(function (a, b) { return b.mtime - a.mtime; });
      var h = '<div class="row"><input id="oq" placeholder="Filtrar…" style="flex:1"></div><div class="list" id="ol" style="height:320px;width:520px">' + list.map(function (f) {
        return '<div class="it" data-n="' + HX.esc(f.name) + '">' + HX.esc(f.name) + '<small>' + new Date(f.mtime * 1000).toLocaleString() + ' · ' + Math.round(f.size / 1024) + ' KB' + (f.user ? ' · ' + HX.esc(f.user) : '') + '</small></div>';
      }).join('') + '</div><p class="muted">Duplo clique para abrir. Ou importe um arquivo local.</p>';
      var chosen = null;
      var d = UI.modal('Abrir projeto do servidor', h, [{ t: 'Importar arquivo local…', fn: function () { app.importFile(); } }, { t: 'Excluir', fn: function () {
        if (!chosen) return false;
        UI.confirm('Excluir', 'Excluir "' + chosen + '" do servidor? (fica um backup)').then(function (ok) { if (ok) HX.io.remove(chosen).then(function () { UI.toast('Excluído'); }); });
      } }, { t: 'Cancelar' }, { t: 'Abrir', pri: true, fn: function () { if (!chosen) return false; app.confirmDiscard().then(function (ok) { if (ok) app.openServer(chosen); }); } }]);
      var ol = UI.$('#ol', d.el);
      ol.onclick = function (e) { var it = e.target.closest('.it'); if (!it) return; UI.$$('.it', ol).forEach(function (x) { x.classList.toggle('on', x === it); }); chosen = it.dataset.n; };
      ol.ondblclick = function (e) { if (e.target.closest('.it')) d.okBtn.click(); };
      UI.$('#oq', d.el).oninput = function () { var q = this.value.toLowerCase(); UI.$$('.it', ol).forEach(function (x) { x.style.display = x.dataset.n.toLowerCase().indexOf(q) >= 0 ? '' : 'none'; }); };
    }).catch(function (e) { UI.toast('Servidor indisponível: ' + e.message, true); });
  };

  A.backups = function () {
    var app = this;
    if (!HX.io.online || !app.serverName) return UI.toast('Disponível para projetos abertos do servidor', true);
    HX.io.backups(app.serverName).then(function (list) {
      var h = '<div class="list" style="height:300px;width:460px">' + (list.length ? list.map(function (b) { return '<div class="it" data-n="' + HX.esc(b.name) + '">' + HX.esc(b.name) + '<small>' + new Date(b.mtime * 1000).toLocaleString() + '</small></div>'; }).join('') : '<div class="it">Nenhum backup</div>') + '</div><p class="muted">Duplo clique carrega o backup (salve para restaurar).</p>';
      var d = UI.modal('Backups de ' + app.serverName, h);
      UI.$('.list', d.el).ondblclick = function (e) {
        var it = e.target.closest('.it[data-n]'); if (!it) return;
        HX.io.load('.bak/' + it.dataset.n).then(function (r) { app.loadText(JSON.stringify(r.project), app.serverName); app.doc.dirty = true; app.title(); d.close(); });
      };
    });
  };

  A.pageSetup = function () {
    var doc = this.doc, m = doc.p.meta, app = this;
    var F = [{ k: 'title', l: 'Título' }, { k: 'docNo', l: 'Nº documento' }, { k: 'rev', l: 'Revisão' }, { k: 'company', l: 'Empresa' },
      { k: 'author', l: 'Desenhado' }, { k: 'checked', l: 'Verificado' }, { k: 'approved', l: 'Aprovado' }, { k: 'date', l: 'Data', type: 'date' },
      { k: 'size', l: 'Formato', type: 'select', opts: Object.keys(HX.SHEETS).concat(['Custom']) }, { k: 'cw', l: 'Largura (Custom)', type: 'number' }, { k: 'ch', l: 'Altura (Custom)', type: 'number' },
      { k: 'orient', l: 'Orientação', type: 'select', opts: [['L', 'Paisagem'], ['P', 'Retrato']] },
      { k: 'template', l: 'Template', type: 'select', opts: Object.keys(HX.TEMPLATES).map(function (k) { return [k, HX.TEMPLATES[k]]; }) },
      { k: 'scale', l: 'Escala' }, { k: 'cage', l: 'CAGE code' }];
    var revTxt = (m.revs || []).map(function (r) { return [r.rev, r.desc, r.date, r.by].join(';'); }).join('\n');
    UI.modal('Página e carimbo', '<div style="width:520px">' + UI.form(F, m) + '<h4>Tabela de revisões (rev;descrição;data;por)</h4><textarea id="revs" rows="4" style="width:100%">' + HX.esc(revTxt) + '</textarea></div>', [{ t: 'Cancelar' }, {
      t: 'Aplicar', pri: true, fn: function (d) {
        var o = UI.readForm(F, d.el, {});
        var revs = UI.$('#revs', d.el).value.split(/\r?\n/).filter(function (l) { return l.trim(); }).map(function (l) { var c = l.split(';'); return { rev: c[0] || '', desc: c[1] || '', date: c[2] || '', by: c[3] || '' }; });
        doc.change('Página', function () { Object.assign(m, o); m.revs = revs; });
        app.view.fit();
      } }]);
  };

  A.gridDialog = function () {
    var doc = this.doc, g = doc.p.grid, app = this;
    var F = [{ k: 'size', l: 'Passo (mm)', type: 'number', step: 0.01 }, { k: 'major', l: 'Maior a cada', type: 'number' }, { k: 'style', l: 'Estilo', type: 'select', opts: [['dots', 'Pontos'], ['lines', 'Linhas']] },
      { k: 'snap', l: 'Snap', type: 'check' }, { k: 'visible', l: 'Visível', type: 'check' }, { k: 'color', l: 'Cor', type: 'color' }, { k: 'majorColor', l: 'Cor maior', type: 'color' }];
    UI.modal('Grade', '<div style="width:380px">' + UI.form(F, g) + '<p class="muted">Pinos ficam em múltiplos de ' + doc.p.unit + ' mm (unidade de símbolo). Para encaixe perfeito use grade ' + doc.p.unit + ' ou ' + doc.p.unit / 2 + ' mm. Alt durante o fio ignora a grade.</p></div>', [{ t: 'Cancelar' }, {
      t: 'Aplicar', pri: true, fn: function (d) { var o = UI.readForm(F, d.el, {}); if (!(o.size > 0)) o.size = g.size; Object.assign(g, o); app.syncGrid(); doc.touch(); } }]);
  };

  A.pdf = function () {
    var doc = this.doc, app = this, o = HX.io.localGet('hx-pdfopt') || { sheets: 'all', wirelist: true, bom: true, pinout: true, mono: false, size: doc.p.meta.size };
    o.size = doc.p.meta.size; o.orient = doc.p.meta.orient;
    var F = [{ k: 'sheets', l: 'Folhas', type: 'select', opts: [['all', 'Todas'], ['cur', 'Somente a atual']] },
      { k: 'size', l: 'Formato', type: 'select', opts: Object.keys(HX.SHEETS).concat(doc.p.meta.size === 'Custom' ? ['Custom'] : []) },
      { k: 'orient', l: 'Orientação', type: 'select', opts: [['L', 'Paisagem'], ['P', 'Retrato']] },
      { k: 'fit', l: 'Ajustar desenho', type: 'check', tip: 'Se o formato mudar, reposiciona proporcionalmente' },
      { k: 'wirelist', l: 'Lista de fios', type: 'check' }, { k: 'bom', l: 'Lista de materiais', type: 'check' }, { k: 'pinout', l: 'Pinagem', type: 'check' }, { k: 'mono', l: 'Preto e branco', type: 'check' }];
    UI.modal('Exportar PDF', '<div style="width:380px">' + UI.form(F, o) + '<p class="muted">PDF vetorial gerado no navegador (sem bibliotecas). As tabelas são paginadas com o mesmo template.</p></div>', [{ t: 'Cancelar' }, {
      t: 'Gerar PDF', pri: true, fn: function (d) {
        UI.readForm(F, d.el, o); HX.io.localSet('hx-pdfopt', o);
        var p = doc.p;
        if (o.size !== p.meta.size || o.orient !== p.meta.orient) {
          p = HX.clone(doc.p); var d0 = HX.sheetDims(p.meta); p.meta.size = o.size; p.meta.orient = o.orient;
          if (o.fit) { var d1 = HX.sheetDims(p.meta), k = Math.min(d1[0] / d0[0], d1[1] / d0[1]); p._fit = { k: k, dx: (d1[0] - d0[0] * k) / 2, dy: (d1[1] - d0[1] * k) / 2 }; }
        }
        try {
          var bytes = HX.exportPDF(p, { only: o.sheets === 'cur' ? doc.sheet : null, wirelist: o.wirelist, bom: o.bom, pinout: o.pinout, mono: o.mono });
          HX.io.download(HX.io.safeName(p.meta.docNo + '_rev' + p.meta.rev) + '.pdf', new Blob([bytes], { type: 'application/pdf' }));
          UI.toast('PDF gerado (' + Math.round(bytes.length / 1024) + ' KB)');
        } catch (e) { UI.toast('Erro no PDF: ' + e.message, true); if (G.console) console.error(e); }
        void app;
      } }]);
  };

  A.renumberWires = function () {
    var doc = this.doc, o = { pfx: doc.p.defaults.wirePfx || 'W', start: 1, step: 1 };
    var F = [{ k: 'pfx', l: 'Prefixo' }, { k: 'start', l: 'Início', type: 'number' }, { k: 'step', l: 'Incremento', type: 'number' }];
    UI.modal('Renumerar fios', UI.form(F, o) + '<p class="muted">Ordem: folha, de cima para baixo, da esquerda para a direita.</p>', [{ t: 'Cancelar' }, {
      t: 'Renumerar', pri: true, fn: function (d) { UI.readForm(F, d.el, o); doc.change('Renumerar fios', function () { HX.ops.renumberWires(doc, o.pfx, +o.start || 1, +o.step || 1); }); } }]);
  };

  A.setUser = function () {
    UI.ask('Usuário', 'Seu nome (gravado em quem salvou cada projeto):', HX.io.user || this.doc.p.meta.author).then(function (v) {
      if (v != null) { HX.io.setUser(v); HX.io.detect(); UI.toast('Usuário: ' + (HX.io.user || '(anônimo)')); }
    });
  };
  A.shortcuts = function () {
    UI.modal('Atalhos de teclado', '<table class="t" style="width:520px">' + HX.SHORTCUTS.map(function (s) { return '<tr><td><b>' + HX.esc(s[0]) + '</b></td><td>' + HX.esc(s[1]) + '</td></tr>'; }).join('') + '</table>');
  };
})(typeof window !== 'undefined' ? window : globalThis);
