/* HarnessCAD - foto REAL (vista lateral) de um conector por part number, para o desenho físico.
   O usuário cola (Ctrl+V) ou abre a foto (PNG/JPEG) — guardada como veio na biblioteca compartilhada ('USR:PHYS:<part>').
   Orientação esperada: lado de engate à esquerda e cabo saindo à direita (senão marque "Espelhar"); a altura da saída do
   cabo e o comprimento real ajustam o encaixe no ramo. Tem prioridade sobre a imagem do painel. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;
  HX.PHYS_USER = HX.PHYS_USER || {};
  var RX = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/;
  HX.sanitizePhysImgs = function (lib) {
    var out = {}; if (!lib || typeof lib !== 'object') return out;
    Object.keys(lib).forEach(function (k) {
      var e = lib[k], v = e && e.img; if (!/^USR:PHYS:/.test(k) || !v || e.key !== k || typeof v.data !== 'string' || v.data.length > 6e6 || !RX.test(v.data)) return;
      var w = Math.round(+v.w), h = Math.round(+v.h); if (!(w > 0 && h > 0)) return;
      out[k.slice(9)] = { id: 'usr:' + k.slice(9), data: v.data, w: w, h: h, ey: Math.max(0, Math.min(1, +v.ey || 0.5)), len: Math.max(5, +v.len || 50), mirror: !!v.mirror, name: 'Foto do usuário' };
    });
    return out;
  };
  var info0 = UI.faceLibInfo;
  UI.faceLibInfo = function (part) {
    var u = HX.PHYS_USER[part];
    return (info0 ? info0(part) : '') + '<br>' + (u ? '<span class="okSrc">✔ Foto real (desenho físico)</span>' : '<span class="muted">Desenho físico: imagem do painel.</span>') +
      ' <button class="mini" data-physimg="' + HX.esc(part) + '">Foto real…</button>';
  };
  UI.physImgDialog = function (app, part, done) {
    var cur = HX.PHYS_USER[part], st = cur ? HX.clone(cur) : null;
    var h = '<p class="muted">Foto lateral do conector (ou do conjunto com backshell). Recorte e cole com <b>Ctrl+V</b> na caixa, ou abra o arquivo. ' +
      'Posição esperada: <b>engate à esquerda, cabo saindo à direita</b>. A imagem é guardada exatamente como veio.</p>' +
      '<div class="fimg" tabindex="0" id="piBox"><div class="fbox"></div><div class="row"><button data-act="open">Abrir arquivo…</button><button data-act="del">Remover</button>' +
      '<input type="file" accept="image/png,image/jpeg" style="display:none"></div></div>' +
      '<div class="row"><label>Comprimento real (mm)</label><input id="piLen" type="number" step="1"></div>' +
      '<div class="row"><label>Altura da saída do cabo (%)</label><input id="piEy" type="range" min="0" max="100"></div>' +
      '<div class="row"><label>Espelhar (cabo sai pela esquerda)</label><input id="piMir" type="checkbox"></div>';
    var dlg = UI.modal('Foto real — ' + part, h, [{ t: 'Cancelar' }, { t: 'Salvar', pri: true, fn: save }]), el = dlg.el, box = UI.$('#piBox', el), inp = UI.$('input[type=file]', el);
    function show() {
      box.querySelector('.fbox').innerHTML = st ? '<div style="position:relative;display:inline-block"><img src="' + st.data + '" style="' + (st.mirror ? 'transform:scaleX(-1);' : '') + '"><div style="position:absolute;right:-6px;top:' + (st.ey * 100) + '%;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:#e33"></div></div><small>' + st.w + ' × ' + st.h + ' px · ponto vermelho = saída do cabo</small>' : '<span class="muted">Clique aqui e cole (Ctrl+V)</span>';
      UI.$('#piLen', el).value = st ? st.len : ''; UI.$('#piEy', el).value = st ? Math.round(st.ey * 100) : 50; UI.$('#piMir', el).checked = !!(st && st.mirror);
    }
    function load(file) {
      if (!file || !/^image\/(png|jpeg)$/.test(file.type)) return UI.toast('Use uma imagem PNG ou JPEG.', true);
      var fr = new G.FileReader(); fr.onload = function () { var d = String(fr.result), im = new G.Image(); im.onload = function () { st = { data: d, w: im.naturalWidth, h: im.naturalHeight, ey: st ? st.ey : 0.5, len: st ? st.len : 50, mirror: st ? st.mirror : false }; show(); }; im.src = d; }; fr.readAsDataURL(file);
    }
    box.addEventListener('paste', function (e) { var it = [].slice.call((e.clipboardData || {}).items || []).filter(function (x) { return /^image\/(png|jpeg)$/.test(x.type); })[0]; if (!it) return UI.toast('A área de transferência não tem imagem.', true); e.preventDefault(); load(it.getAsFile()); });
    UI.$('[data-act="open"]', el).onclick = function () { inp.click(); };
    inp.onchange = function () { load(inp.files[0]); inp.value = ''; };
    UI.$('[data-act="del"]', el).onclick = function () { st = null; show(); };
    UI.$('#piLen', el).oninput = function () { if (st) st.len = +this.value || 50; };
    UI.$('#piEy', el).oninput = function () { if (st) { st.ey = this.value / 100; show(); } };
    UI.$('#piMir', el).onchange = function () { if (st) { st.mirror = this.checked; show(); } };
    show();
    function save() {
      var key = 'USR:PHYS:' + part;
      if (!st) { delete HX.PHYS_USER[part]; HX.io.deleteLibEntry(key).catch(function () { UI.toast('Remoção no servidor exige administrador; removida só neste computador.', true); }); }
      else {
        var e = { key: key, img: { data: st.data, w: st.w, h: st.h, ey: st.ey, len: st.len, mirror: st.mirror } }, s = HX.sanitizePhysImgs((function () { var o = {}; o[key] = e; return o; })())[part];
        if (!s) return UI.toast('Imagem inválida.', true), false;
        HX.PHYS_USER[part] = s; HX.io.saveLibEntry(e).catch(function (er) { UI.toast('Biblioteca compartilhada: ' + er.message, true); });
      }
      if (app && app.view) app.view.redraw(); if (done) done();
    }
  };
  if (typeof document !== 'undefined') document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-physimg]'); if (!b) return;
    UI.physImgDialog(G.app, b.getAttribute('data-physimg'), function () { if (G.app && G.app.refreshLib) G.app.refreshLib(); });
  });
})(typeof window !== 'undefined' ? window : globalThis);
