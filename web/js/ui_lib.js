/* HarnessCAD - painel esquerdo: catálogo de conectores, fios padrão, emendas */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;

  UI.initLib = function (app) {
    var doc = app.doc, pc = UI.$('#pConn'), sel = null, closed = {};
    pc.innerHTML = '<div class="row"><input id="cq" placeholder="Buscar: 38999 13-35, DT 4, M12, RJ45…" style="flex:1"></div>' +
      '<div class="row"><select id="cstd" style="flex:1"><option value="ALL">Todos</option><option value="MIL">Militar (MIL)</option><option value="COM">Comercial / industrial</option></select>' +
      '<button id="cnew" title="Conector personalizado">+ Novo</button></div>' +
      '<div class="list" id="clist" style="height:calc(100% - 330px);min-height:160px"></div>' +
      '<canvas class="prev" id="cprev"></canvas><div id="cinfo" class="muted" style="margin-top:4px"></div>' +
      '<div class="row"><button class="pri" id="cplace" style="flex:1">Posicionar com o mouse</button></div><div class="muted">Duplo clique na lista insere direto no centro da tela.</div>';
    function render() {
      var q = UI.$('#cq').value, std = UI.$('#cstd').value, list = HX.searchConns(q, std, doc.p), by = {};
      if (UI.libRender) { UI.$('#clist').innerHTML = UI.libRender(list, q, std, sel, closed, doc.p); return; } /* ui_lib3.js: por família, com selos */
      list.forEach(function (e) { (by[e.fam] = by[e.fam] || []).push(e); });
      var h = '';
      Object.keys(by).forEach(function (f) {
        var fd = HX.CAT.fams[f] || { desc: 'Biblioteca do usuário', std: 'COM' }, op = !closed[f] || q;
        h += '<div class="grp" data-f="' + HX.esc(f) + '">' + (op ? '▾ ' : '▸ ') + HX.esc(fd.desc) + ' <span class="tag ' + (fd.std || 'COM') + '">' + (fd.std || '') + '</span> (' + by[f].length + ')</div>';
        if (op) by[f].forEach(function (e) {
          h += '<div class="it' + (sel === e.key ? ' on' : '') + '" data-k="' + HX.esc(e.key) + '">' + HX.esc(e.label) + ' — ' + HX.esc(e.n) + (e.fam === 'EQUIP' ? ' terminais' : ' vias') + (HX.FACE_USER[e.key] || HX.FACE_IMG[e.key] ? '<span class="tag face" title="Tem vista frontal (imagem do datasheet)">VISTA</span>' : '') + '<small>' + HX.esc(e.mfr) + '</small></div>';
        });
      });
      UI.$('#clist').innerHTML = h || '<div class="it">Nada encontrado</div>';
    }
    function preview() {
      var cv = UI.$('#cprev'), info = UI.$('#cinfo'), def = sel && HX.getConnDef(sel, doc.p);
      var r = cv.getBoundingClientRect(), dpr = G.devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr;
      var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, r.width, r.height);
      if (!def) { info.textContent = 'Selecione um conector.'; return; }
      var c = HX.makeConn(doc, sel, 0, 0); c.ref = c.ref;
      var L = HX.connLayout(c, doc.p.unit), bw = L.bbox.x1 - L.bbox.x0, bh = L.bbox.y1 - L.bbox.y0;
      var s = Math.min((r.width - 10) / bw, (r.height - 10) / bh, 6);
      var v = { s: s }; ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ((r.width - bw * s) / 2 - L.bbox.x0 * s), dpr * 5);
      HX.drawConn(new HX.CanvasG(ctx, v), c, doc.p, 0, { theme: HX.THEME });
      var f = HX.CAT.fams[def.fam] || {}, cts = f.contacts ? Object.keys(f.contacts).map(function (k) { var xs = [].concat(f.contacts[k]); return '#' + HX.esc(k) + ': ' + xs.map(function (x) { return HX.esc(x.p + ' / ' + x.s) + ' (' + HX.awgTxt([x]) + (x.a ? ', ' + x.a + ' A' : '') + ')'; }).join(' · '); }).join('<br>') : '';
      if (f.plug) cts += '<br>Tampão: ' + HX.esc(typeof f.plug === 'string' ? f.plug : Object.keys(f.plug).map(function (k) { return '#' + k + ' ' + f.plug[k]; }).join(' · '));
      if (f.src) cts += '<br><span class="okSrc">✔ Fonte: ' + HX.esc(f.src) + '</span>';
      info.innerHTML = '<b>' + HX.esc(def.desc) + '</b><br>PN: ' + HX.esc(HX.connPN(c)) + (f.pitch ? ' · passo ' + f.pitch + ' mm' : '') + (cts ? '<br>' + cts : '') +
        (def.fam === 'EQUIP' ? '<br><i>Informe o modelo real em Propriedades › Modelo / PN.</i>' : '<br><i>PN gerado pelo padrão de codificação — confirme no datasheet.</i>') + (UI.faceLibInfo && def.fam !== 'EQUIP' ? UI.faceLibInfo(sel) : '');
    }
    // duplo clique: insere já, no centro da área visível, selecionado (depois é só arrastar)
    function insertNow() {
      var v = app.view, g = doc.p.grid.size || 2.5, c = v.toWorld(v.W / 2, v.H / 2), it = HX.makeConn(doc, sel, 0, 0);
      var L = HX.connLayout(it, doc.p.unit);
      it.x = HX.snap(c[0] - (L.bbox.x1 - L.bbox.x0) / 2, g); it.y = HX.snap(c[1] - (L.bbox.y1 - L.bbox.y0) / 2, g);
      doc.change('Inserir ' + it.ref, function () { doc.add(it); }); doc.select([it.id]);
      UI.toast(it.ref + ' inserido — arraste para posicionar'); UI.$('#cv').focus();
    }
    function place() {
      if (!sel) return UI.toast('Selecione um conector no catálogo', true);
      app.tools.setTool('place', HX.makeConn(doc, sel, 0, 0)); UI.$('#cv').focus();
    }
    UI.$('#cq').addEventListener('input', render);
    UI.$('#cstd').addEventListener('change', render);
    UI.$('#clist').addEventListener('click', function (e) {
      var g = e.target.closest('.grp'); if (g) { closed[g.dataset.f] = !closed[g.dataset.f]; render(); return; }
      var it = e.target.closest('.it[data-k]'); if (!it) return; sel = it.dataset.k;
      // só troca o destaque (sem redesenhar a lista, senão o navegador perde o duplo clique)
      UI.$$('#clist .it.on').forEach(function (x) { x.classList.remove('on'); }); it.classList.add('on'); preview();
    });
    UI.$('#clist').addEventListener('dblclick', function (e) {
      var it = e.target.closest('.it[data-k]'); if (!it) return; sel = it.dataset.k; insertNow();
    });
    UI.$('#cplace').onclick = place;
    UI.$('#cnew').onclick = function () { UI.customConnDialog(app, function (k) { sel = k; render(); preview(); }); };
    Object.keys(HX.CAT.fams).forEach(function (f) { closed[f] = true; });
    app.refreshLib = function () { render(); preview(); };
    app.focusCatalog = function () { UI.$('[data-p=pConn]').click(); UI.$('#cq').focus(); };
    render(); preview();
    UI.initWirePane(app); UI.initSplicePane(app);
  };

  UI.customConnDialog = function (app, done) {
    var o = { name: '', pn: '', mfr: '', std: 'COM', n: 4, side: 'R', gender: 'S', pins: '' };
    var F = [{ k: 'name', l: 'Nome' }, { k: 'pn', l: 'Part number' }, { k: 'mfr', l: 'Fabricante' },
      { k: 'std', l: 'Padrão', type: 'select', opts: [['COM', 'Comercial'], ['MIL', 'Militar']] },
      { k: 'n', l: 'Nº de vias (1-500)', type: 'number' }, { k: 'side', l: 'Lado pinos', type: 'select', opts: [['R', 'Direita'], ['L', 'Esquerda'], ['B', 'Ambos (passante)']] },
      { k: 'gender', l: 'Gênero', type: 'select', opts: [['S', 'Soquete (fêmea)'], ['P', 'Pino (macho)']] },
      { k: 'pins', l: 'Pinos (opcional)', type: 'textarea', tip: 'Um por linha: pino;sinal  (cole do Excel)' }];
    UI.modal('Novo conector personalizado', UI.form(F, o) + '<p class="muted">Pinos: uma linha por pino no formato <b>pino;sinal</b>. Se vazio, numera 1..N. Fica salvo na biblioteca compartilhada.</p>', [
      { t: 'Cancelar' },
      { t: 'Criar', pri: true, fn: function (d) {
        UI.readForm(F, d.el, o); if (!o.name) { UI.toast('Informe o nome', true); return false; }
        var pins = HX.io.parsePinCSV(o.pins);
        var e = HX.customConn({ name: o.name, pn: o.pn, mfr: o.mfr, std: o.std, n: +o.n || 1, side: o.side, gender: o.gender,
          ids: pins.length ? pins.map(function (p) { return p.n; }) : null, names: pins.map(function (p) { return p.name; }) });
        e = HX.sanitizeConnDef(e); app.doc.p.library.conns[e.key] = e; app.sharedLib = app.sharedLib || {}; app.sharedLib[e.key] = e; app.doc.touch();
        HX.io.saveLibEntry(e).catch(function (er) { UI.toast('Biblioteca compartilhada: ' + er.message, true); });
        done && done(e.key);
      } }]);
  };

})(typeof window !== 'undefined' ? window : globalThis);
