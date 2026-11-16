/* HarnessCAD - diálogo "Imprimir / Exportar PDF": escolher o que sai, a ordem, as colunas e as folhas,
   com predefinições prontas e predefinições do usuário (salvas neste navegador). */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, A = HX.App.prototype;
  var KEY = 'hx-print', KP = 'hx-print-presets';

  // ajusta uma configuração salva ao projeto atual (folhas que existem, seções novas)
  function fix(cfg, p) {
    var def = HX.printDefault(p), have = {};
    cfg = cfg && cfg.sections ? HX.clone(cfg) : def;
    cfg.sections = cfg.sections.filter(function (s) { return HX.printSection(s.id) && !have[s.id] && (have[s.id] = 1); });
    def.sections.forEach(function (s) { if (!have[s.id]) cfg.sections.push(s); });
    cfg.sections.forEach(function (s) {
      if (s.id === 'sheets') s.sheets = (s.sheets || []).filter(function (i) { return i < p.sheets.length; });
      if (s.id === 'sheets' && !s.sheets.length) s.sheets = p.sheets.map(function (_, i) { return i; });
    });
    return cfg;
  }

  A.pdf = function () {
    var doc = this.doc, p0 = doc.p, st = HX.io.localGet(KEY) || {}, user = HX.io.localGet(KP) || {};
    var cfg = fix(st.cfg, p0), o = Object.assign({ mono: false, fit: true }, st.o || {}, { size: p0.meta.size, orient: p0.meta.orient });
    var F = [{ k: 'size', l: 'Formato', type: 'select', opts: Object.keys(HX.SHEETS).concat(p0.meta.size === 'Custom' ? ['Custom'] : []) },
      { k: 'orient', l: 'Orientação', type: 'select', opts: [['L', 'Paisagem'], ['P', 'Retrato']] },
      { k: 'fit', l: 'Ajustar desenho', type: 'check', tip: 'Se o formato mudar, reposiciona proporcionalmente' }, { k: 'mono', l: 'Preto e branco', type: 'check' }];
    var presets = Object.keys(HX.PRINT_PRESETS).map(function (n) { return '<option value="b:' + HX.esc(n) + '">' + HX.esc(n) + '</option>'; }).join('') +
      Object.keys(user).map(function (n) { return '<option value="u:' + HX.esc(n) + '">★ ' + HX.esc(n) + '</option>'; }).join('');
    var body = '<div class="prt"><div class="prtTop"><label>Predefinição <select id="prPre"><option value="">— atual —</option>' + presets + '</select></label>' +
      '<input id="prName" placeholder="nome p/ salvar" maxlength="40"><button id="prSave" title="Guardar esta escolha com o nome ao lado">Salvar</button><button id="prDel" title="Excluir a predefinição ★ selecionada">Excluir</button></div>' +
      '<p class="muted">Marque o que sai no PDF. ▲▼ muda a ordem; <b>Colunas/Folhas</b> escolhe o detalhe.</p><div id="prList"></div>' +
      '<div class="prtOpt">' + UI.form(F, o) + '</div><p class="muted" id="prSum"></p></div>';
    var api = UI.modal('Imprimir / Exportar PDF', body, [{ t: 'Cancelar' }, { t: 'Gerar PDF', pri: true, fn: function (d) { return gen(d); } }]);
    var el = api.el, list = el.querySelector('#prList'), open = {};

    function render() {
      list.innerHTML = cfg.sections.map(function (s, i) {
        var def = HX.printSection(s.id), sub = '';
        if (def.cols) sub = def.cols.map(function (c) { return '<label><input type="checkbox" data-col="' + c.k + '"' + (s.cols.indexOf(c.k) >= 0 ? ' checked' : '') + '> ' + HX.esc(c.t) + '</label>'; }).join('');
        if (s.id === 'sheets') sub = p0.sheets.map(function (sh, k) { return '<label><input type="checkbox" data-sh="' + k + '"' + (s.sheets.indexOf(k) >= 0 ? ' checked' : '') + '> ' + HX.esc(sh.name) + '</label>'; }).join('');
        var more = sub && s.id !== 'index' ? '<button class="prMore">' + (s.id === 'sheets' ? 'Folhas' : 'Colunas') + (open[s.id] ? ' ▴' : ' ▾') + '</button>' : '';
        return '<div class="prow' + (s.on ? '' : ' off') + '" data-i="' + i + '"><label class="prName"><input type="checkbox" class="prOn"' + (s.on ? ' checked' : '') + '> ' + HX.esc(def.name) + '</label>' +
          '<span class="prOrd"><button data-mv="-1" title="Subir">▲</button><button data-mv="1" title="Descer">▼</button></span>' + more +
          (open[s.id] && sub && s.id !== 'index' ? '<div class="prSub">' + sub + '</div>' : '') + '</div>';
      }).join('');
      var n = cfg.sections.filter(function (s) { return s.on; }).length;
      el.querySelector('#prSum').textContent = n ? n + ' item(ns) marcado(s).' : 'Nada marcado — marque pelo menos um item.';
    }
    list.addEventListener('click', function (e) {
      var row = e.target.closest('.prow'); if (!row) return;
      var i = +row.dataset.i, s = cfg.sections[i], t = e.target;
      if (t.classList.contains('prOn')) s.on = t.checked;
      else if (t.dataset.mv) { var j = i + +t.dataset.mv; if (j < 0 || j >= cfg.sections.length) return; cfg.sections.splice(j, 0, cfg.sections.splice(i, 1)[0]); }
      else if (t.classList.contains('prMore')) { open[s.id] = !open[s.id]; render(); return; } // só abre/fecha: não muda a escolha
      else if (t.dataset.col) { s.cols = s.cols.filter(function (k) { return k !== t.dataset.col; }); if (t.checked) s.cols = HX.printSection(s.id).cols.map(function (c) { return c.k; }).filter(function (k) { return k === t.dataset.col || s.cols.indexOf(k) >= 0; }); }
      else if (t.dataset.sh) { var k = +t.dataset.sh; s.sheets = s.sheets.filter(function (x) { return x !== k; }); if (t.checked) s.sheets.push(k); s.sheets.sort(function (a, b) { return a - b; }); }
      else return;
      el.querySelector('#prPre').value = ''; render();
    });
    el.querySelector('#prPre').onchange = function () {
      var v = this.value; if (!v) return;
      cfg = v[0] === 'b' ? HX.printPreset(p0, v.slice(2)) : fix(user[v.slice(2)], p0); render();
    };
    el.querySelector('#prSave').onclick = function () {
      var n = el.querySelector('#prName').value.trim().replace(/"/g, '').slice(0, 40); // (o diálogo de pergunta fecharia este)
      if (!n) { UI.toast('Digite um nome para a predefinição', true); el.querySelector('#prName').focus(); return; }
      user[n] = HX.clone(cfg); HX.io.localSet(KP, user);
      var s = el.querySelector('#prPre'); if (!s.querySelector('option[value="u:' + n + '"]')) s.insertAdjacentHTML('beforeend', '<option value="u:' + HX.esc(n) + '">★ ' + HX.esc(n) + '</option>');
      s.value = 'u:' + n; UI.toast('Predefinição "' + n + '" salva');
    };
    el.querySelector('#prDel').onclick = function () {
      var s = el.querySelector('#prPre'), v = s.value; if (v[0] !== 'u') { UI.toast('Selecione uma predefinição ★ sua', true); return; }
      delete user[v.slice(2)]; HX.io.localSet(KP, user); s.querySelector('option[value="' + v.replace(/"/g, '') + '"]').remove(); s.value = ''; UI.toast('Predefinição excluída');
    };
    function gen() {
      UI.readForm(F, el, o);
      if (!cfg.sections.some(function (s) { return s.on; })) { UI.toast('Marque pelo menos um item para imprimir', true); return false; }
      HX.io.localSet(KEY, { cfg: cfg, o: { mono: o.mono, fit: o.fit } });
      var p = doc.p;
      if (o.size !== p.meta.size || o.orient !== p.meta.orient) {
        p = HX.clone(doc.p); var d0 = HX.sheetDims(p.meta); p.meta.size = o.size; p.meta.orient = o.orient;
        if (o.fit) { var d1 = HX.sheetDims(p.meta), k = Math.min(d1[0] / d0[0], d1[1] / d0[1]); p._fit = { k: k, dx: (d1[0] - d0[0] * k) / 2, dy: (d1[1] - d0[1] * k) / 2 }; }
      }
      try {
        HX.imgBlocked = false; HX.imgMiss = []; var bytes = HX.exportPDF(p, { sections: cfg.sections, mono: o.mono }), miss = HX.imgMiss; HX.imgMiss = null;
        HX.io.download(HX.io.safeName(p.meta.docNo + '_rev' + p.meta.rev) + '.pdf', new Blob([bytes], { type: 'application/pdf' }));
        if (miss.length) UI.modal('PDF sem ' + miss.length + ' imagem(ns)', '<p>' + (HX.imgBlocked ? 'O navegador bloqueou a leitura das imagens locais e as imagens embutidas não carregaram.' : 'Algumas imagens ainda não tinham carregado. Espere alguns segundos e gere de novo.') + '</p>' +
          '<p class="muted" style="font-size:11px">Diagnóstico (mande uma foto se continuar): versão ' + HX.VERSION + ' · ' + G.location.protocol + ' · pacote de imagens: ' + ((G.HX_IMGPACK || []).length) + ' arquivos, ' + Object.keys(G.HX_IMG || {}).length + ' imagens · ' + HX.esc(miss.slice(0, 4).join(', ')) + '<br>' + HX.esc(G.navigator.userAgent) + '</p>', [{ t: 'OK', pri: true }]);
        else UI.toast('PDF gerado (' + Math.round(bytes.length / 1024) + ' KB)');
      } catch (e) { UI.toast('Erro no PDF: ' + e.message, true); if (G.console) console.error(e); return false; }
    }
    render();
  };
})(typeof window !== 'undefined' ? window : globalThis);
