/* HarnessCAD - EDITAR A LISTA DE MATERIAIS (tabela no padrão da casa): colunas (título, largura, ordem), linhas (ordem,
   visível, texto de cada célula — vazio = automático), linhas manuais, altura da linha e tamanho do texto. Grava no item
   da tabela (ov, extra, ch, cw, co, rh, fs); a lista continua se atualizando com o desenho. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.bomRowsEdit) return;
  function esc(t) { return HX.esc ? HX.esc(t) : String(t == null ? '' : t); }
  var CC = HX.PTABLE_COLS.bomCasa;
  UI.bomEdit = function (app, it) {
    var doc = app.doc, p = doc.p, sh = doc.cur(), B = HX.physBom(p, sh).rows, ov = JSON.parse(JSON.stringify(it.ov || {})), ex = JSON.parse(JSON.stringify(it.extra || []));
    var H = String(it.ch || '').split(/[;,]/), W = String(it.cw || '').split(/[;,]/), O = String(it.co || '').split(/[;,]/).map(Number).filter(function (j) { return j >= 0 && j < 4; }); if (O.length !== 4) O = [0, 1, 2, 3];
    var dlg = UI.modal('Editar lista de materiais', '<div id="beB" style="max-height:470px;overflow:auto;min-width:820px"></div>', [{ t: 'Cancelar' }, { t: 'Aplicar', pri: true, fn: save }]), el = dlg.el;
    function rows() { var R = B.map(function (r, i) { var e = ov[r.k] = ov[r.k] || {}; return { e: e, r: r, o: e.o != null && e.o !== '' ? +e.o : i + 1 }; });
      ex.forEach(function (e, j) { R.push({ e: e, x: j, o: e.o != null && e.o !== '' ? +e.o : B.length + j + 1 }); }); return R.sort(function (a, b) { return a.o - b.o; }); }
    function draw() {
      var R = rows(), inp = function (k, v, ph, w) { return '<input data-f="' + k + '" value="' + esc(v) + '" placeholder="' + esc(ph) + '" style="width:' + w + 'px">'; };
      var h = '<h4>Colunas</h4><table class="tbl"><tr><th>Ordem</th><th>Título</th><th>Largura (mm)</th><th></th></tr>' + O.map(function (j, i) {
        return '<tr data-c="' + j + '"><td>' + (i + 1) + '</td><td><input data-ch value="' + esc(H[j] || '') + '" placeholder="' + esc(CC[j][0]) + '"></td><td><input data-cw type="number" value="' + esc(W[j] || '') + '" placeholder="' + CC[j][1] + '" style="width:70px"></td>' +
          '<td><button data-cu="' + i + '">▲</button><button data-cd="' + i + '">▼</button></td></tr>'; }).join('') + '</table>' +
        '<div class="row"><label>Altura da linha (mm)</label><input id="beRh" type="number" step="0.2" value="' + esc(it.rh || '') + '" placeholder="4,2"><label>Tamanho do texto (mm)</label><input id="beFs" type="number" step="0.1" value="' + esc(it.fs || '') + '" placeholder="1,8"></div>' +
        '<h4>Linhas <span class="muted">(vazio = automático; a ordem vale de baixo para cima, item 1 junto do cabeçalho)</span></h4><table class="tbl"><tr><th>Pos.</th><th>Vis.</th><th>Item</th><th>Qtd</th><th>Descrição</th><th>Código</th><th></th></tr>' +
        R.map(function (q, i) { var r = q.r || {}, e = q.e; return '<tr data-i="' + i + '"><td>' + (i + 1) + '</td><td>' + (q.x == null ? '<input type="checkbox" data-h' + (e.h ? '' : ' checked') + '>' : '') + '</td>' +
          '<td>' + inp('n', e.n, r.n || '', 40) + '</td><td>' + inp('q', e.q, q.r ? HX.bomQty(r) : '', 80) + '</td><td>' + inp('d', e.d, String(r.desc || '').toUpperCase(), 330) + '</td><td>' + inp('c', e.c, r.pn || '—', 120) + '</td>' +
          '<td><button data-u="' + i + '">▲</button><button data-dn="' + i + '">▼</button>' + (q.x != null ? '<button data-x="' + q.x + '">×</button>' : '') + '</td></tr>'; }).join('') + '</table>' +
        '<div class="row"><button id="beAdd">+ Linha manual</button><button id="beRst">Voltar tudo ao automático</button></div><p class="muted">Mudar o número do item não muda o número dos balões no desenho.</p>';
      var box = el.querySelector('#beB'); box.innerHTML = h;
      [].forEach.call(box.querySelectorAll('tr[data-i]'), function (tr) { var q = R[+tr.dataset.i];
        [].forEach.call(tr.querySelectorAll('input[data-f]'), function (x) { x.onchange = function () { q.e[x.dataset.f] = x.value; }; });
        var cb = tr.querySelector('[data-h]'); if (cb) cb.onchange = function () { q.e.h = !cb.checked; }; });
      function move(i, d) { var j = i + d; if (j < 0 || j >= R.length) return; R.forEach(function (q, k) { q.e.o = k + 1; }); R[i].e.o = j + 1; R[j].e.o = i + 1; draw(); }
      [].forEach.call(box.querySelectorAll('[data-u]'), function (b) { b.onclick = function () { move(+b.dataset.u, -1); }; });
      [].forEach.call(box.querySelectorAll('[data-dn]'), function (b) { b.onclick = function () { move(+b.dataset.dn, 1); }; });
      [].forEach.call(box.querySelectorAll('[data-x]'), function (b) { b.onclick = function () { ex.splice(+b.dataset.x, 1); draw(); }; });
      [].forEach.call(box.querySelectorAll('tr[data-c]'), function (tr) { var j = +tr.dataset.c; tr.querySelector('[data-ch]').onchange = function () { H[j] = this.value; }; tr.querySelector('[data-cw]').onchange = function () { W[j] = this.value; }; });
      function cmove(i, d) { var j = i + d; if (j < 0 || j > 3) return; var t = O[i]; O[i] = O[j]; O[j] = t; draw(); }
      [].forEach.call(box.querySelectorAll('[data-cu]'), function (b) { b.onclick = function () { cmove(+b.dataset.cu, -1); }; });
      [].forEach.call(box.querySelectorAll('[data-cd]'), function (b) { b.onclick = function () { cmove(+b.dataset.cd, 1); }; });
      box.querySelector('#beAdd').onclick = function () { ex.push({ n: '', q: '', d: '', c: '', o: R.length + 1 }); draw(); };
      box.querySelector('#beRst').onclick = function () { ov = {}; ex = []; H = []; W = []; O = [0, 1, 2, 3]; draw(); };
    }
    function save() {
      var rh = el.querySelector('#beRh').value, fs = el.querySelector('#beFs').value, clean = {};
      Object.keys(ov).forEach(function (k) { var e = ov[k]; if (e.n || e.q || e.d || e.c || e.h || (e.o != null && e.o !== '')) clean[k] = e; });
      doc.change('Editar lista de materiais', function () { it.ov = clean; it.extra = ex; it.ch = [0, 1, 2, 3].map(function (j) { return H[j] || ''; }).join(';'); it.cw = [0, 1, 2, 3].map(function (j) { return W[j] || ''; }).join(';');
        it.co = O.join(';') === '0;1;2;3' ? '' : O.join(';'); it.rh = rh; it.fs = fs; }); app.view.redraw();
    }
    draw();
  };
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) { var h = ex0(it, app); return it.type === 'ptable' && it.kind === 'bom' && it.bstyle !== 'tabela' ? h + '<div class="row"><button id="beOpen" style="flex:1">Editar lista de materiais (linhas, colunas, textos)…</button></div>' : h; };
  UI.propsBind = function (it, app, root, set) { bd0(it, app, root, set); var b = root.querySelector('#beOpen'); if (b) b.onclick = function () { UI.bomEdit(app, it); }; };
})(typeof window !== 'undefined' ? window : globalThis);
