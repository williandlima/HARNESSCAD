/* HarnessCAD - cadastro da imagem da vista frontal (recorte do datasheet) por part number.
   O usuário cola (Ctrl+V) o recorte da Ferramenta de Captura do Windows ou abre um PNG/JPEG. O arquivo é
   guardado como veio (data URL, sem recompressão) na biblioteca compartilhada: chave 'USR:FACE:<part>'. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  HX.onImgLoad = function () { if (G.app && G.app.view) G.app.view.redraw(); };

  // resumo para o painel da biblioteca
  UI.faceLibInfo = function (part) {
    var u = HX.FACE_USER[part], o = HX.FACE_IMG[part], e = u || o, n = e ? (e.pin ? 1 : 0) + (e.socket ? 1 : 0) : 0;
    var t = !e ? '<span class="muted">Sem imagem do datasheet para a vista frontal.</span>' :
      '<span class="okSrc">✔ Vista frontal: ' + n + ' imagem(ns) do datasheet' + (u ? ' (cadastrada pelo usuário)' : '') + '</span>';
    return '<br>' + t + ' <button class="mini" data-faceimg="' + HX.esc(part) + '">Imagem do datasheet…</button>';
  };

  function readFile(file, done) {
    if (!file || !/^image\/(png|jpeg)$/.test(file.type)) { UI.toast('Use uma imagem PNG ou JPEG.', true); return; }
    var fr = new G.FileReader();
    fr.onload = function () {
      var data = String(fr.result), el = new G.Image();
      el.onload = function () { done({ data: data, w: el.naturalWidth, h: el.naturalHeight }); };
      el.onerror = function () { UI.toast('Não foi possível ler a imagem.', true); };
      el.src = data;
    };
    fr.readAsDataURL(file);
  }

  UI.faceImgDialog = function (app, part, done) {
    var cur = HX.FACE_USER[part] || {}, st = { pin: cur.pin || null, socket: cur.socket || null };
    var off = HX.FACE_IMG[part];
    var slot = function (v, t) {
      return '<div class="fimg" data-v="' + v + '" tabindex="0"><b>' + t + '</b><div class="fbox"></div>' +
        '<div class="row"><button data-act="open">Abrir arquivo…</button><button data-act="del">Remover</button>' +
        '<input type="file" accept="image/png,image/jpeg" style="display:none"></div>' +
        '<div class="row"><label>Fonte (datasheet, página)</label><input data-k="src"></div></div>';
    };
    var h = '<p class="muted">Recorte a vista frontal no datasheet (Ferramenta de Captura do Windows), clique na caixa e cole com <b>Ctrl+V</b>, ' +
      'ou abra o arquivo. A imagem é guardada exatamente como veio, sem alteração.' + (off ? '<br>Este conector já tem a imagem oficial do catálogo; a cadastrada aqui tem prioridade.' : '') + '</p>' +
      '<div class="fimgs">' + slot('pin', 'Face do inserto de PINOS') + slot('socket', 'Face do inserto de SOQUETES') + '</div>';
    var dlg = UI.modal('Imagem do datasheet — ' + part, h, [{ t: 'Cancelar' }, { t: 'Salvar', pri: true, fn: save }]);
    function show(v) {
      var box = dlg.el.querySelector('.fimg[data-v="' + v + '"]'), im = st[v];
      box.querySelector('.fbox').innerHTML = im ? '<img src="' + im.data + '" alt=""><small>' + im.w + ' × ' + im.h + ' px</small>' : '<span class="muted">Clique aqui e cole (Ctrl+V)</span>';
      box.querySelector('[data-k="src"]').value = im ? im.src || '' : '';
    }
    ['pin', 'socket'].forEach(function (v) {
      var box = dlg.el.querySelector('.fimg[data-v="' + v + '"]'), inp = box.querySelector('input[type=file]');
      var set = function (r) { r.view = v; r.src = box.querySelector('[data-k="src"]').value; st[v] = r; show(v); };
      box.addEventListener('paste', function (e) {
        var it = [].slice.call((e.clipboardData || {}).items || []).filter(function (x) { return /^image\/(png|jpeg)$/.test(x.type); })[0];
        if (!it) { UI.toast('A área de transferência não tem imagem.', true); return; }
        e.preventDefault(); readFile(it.getAsFile(), set);
      });
      box.querySelector('[data-act="open"]').onclick = function () { inp.click(); };
      inp.onchange = function () { readFile(inp.files[0], set); inp.value = ''; };
      box.querySelector('[data-act="del"]').onclick = function () { st[v] = null; show(v); };
      box.querySelector('[data-k="src"]').oninput = function () { if (st[v]) st[v].src = this.value; };
      box.onclick = function (e) { if (e.target === box || e.target.closest('.fbox')) box.focus(); };
      show(v);
    });
    function save() {
      var imgs = { pin: st.pin && HX.sanitizeFaceImg(st.pin, 'pin'), socket: st.socket && HX.sanitizeFaceImg(st.socket, 'socket') };
      var key = 'USR:FACE:' + part;
      if (!imgs.pin && !imgs.socket) {
        delete HX.FACE_USER[part];
        HX.io.deleteLibEntry(key).catch(function () { UI.toast('Remoção no servidor exige administrador; removida só neste computador.', true); });
      } else {
        var o = {}; if (imgs.pin) o.pin = imgs.pin; if (imgs.socket) o.socket = imgs.socket; HX.FACE_USER[part] = o;
        HX.io.saveLibEntry(HX.faceEntry(part, o)).catch(function (er) { UI.toast('Biblioteca compartilhada: ' + er.message, true); });
      }
      if (app && app.view) app.view.redraw(); if (done) done();
    }
  };
  // botão no painel da biblioteca
  if (typeof document !== 'undefined') document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-faceimg]'); if (!b) return;
    UI.faceImgDialog(G.app, b.getAttribute('data-faceimg'), function () { if (G.app && G.app.refreshLib) G.app.refreshLib(); });
  });
})(typeof window !== 'undefined' ? window : globalThis);
