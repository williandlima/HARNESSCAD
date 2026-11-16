/* HarnessCAD - RECORTAR IMAGEM DE DATASHEET (qualquer item do chicote: conector, backshell, bota, abraçadeira, terminal...).
   Cole (Ctrl+V) um print da página do datasheet ou abra o PNG/JPEG, arraste um retângulo para recortar, fundo branco vira
   transparente, gire/espelhe e informe o tamanho real. Fica na biblioteca compartilhada ('USR:DSI:<id>') e aparece na paleta
   "Datasheet (real)", na imagem do nó e — se for backshell/bota — nas opções da montagem do conector. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI, RX = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/, CATS = [['conn', 'Conector'], ['bs', 'Backshell / alívio'], ['boot', 'Bota'], ['item', 'Outro item (abraçadeira, terminal...)']];
  HX.sanitizeDSImgs = function (lib) {
    var out = {}; Object.keys(lib || {}).forEach(function (k) {
      var e = lib[k], v = e && e.img; if (!/^USR:DSI:[\w-]{1,40}$/.test(k) || !v || typeof v.data !== 'string' || v.data.length > 4e5 || !RX.test(v.data)) return;
      var w = Math.round(+v.w), h = Math.round(+v.h); if (!(w > 0 && h > 0 && w <= 2000 && h <= 2000)) return;
      out[k.slice(8)] = { data: v.data, w: w, h: h, name: String(v.name || k.slice(8)).slice(0, 80), cat: CATS.some(function (c) { return c[0] === v.cat; }) ? v.cat : 'item', L: Math.max(1, +v.L || 30), H: +v.H > 0 ? +v.H : 0, ey: Math.max(0, Math.min(1, +v.ey || 0.5)), src: String(v.src || '').slice(0, 120) };
    });
    return out;
  };
  HX.dsUserRegister = function (U) {
    Object.keys(U).forEach(function (id) {
      var u = U[id], im = { id: 'u_' + id, data: u.data, w: u.w, h: u.h };
      HX.PSPR['u_' + id] = { id: 'u_' + id, name: u.name + ' (recorte do usuário)', w: u.w, h: u.h, ey: u.ey, len: u.L, cat: 'ds', data: u.data, url: '', user: 1 };
      if (u.cat === 'bs' || u.cat === 'boot') { HX.PDS_IMG['u_' + id] = im; HX.PDS['u_' + id] = { n: u.name, src: u.src || 'recorte do usuário', l: 'u_' + id, L: function () { return u.L; }, H: u.H ? function () { return u.H; } : null, kind: u.cat, ov: 0.25, e1: [1, u.ey], e0: [0, u.ey] }; }
    });
  };
  var ll = HX.onLibLoad; HX.onLibLoad = function (lib) { if (ll) ll(lib); try { HX.dsUserRegister(HX.sanitizeDSImgs(lib)); } catch (e) { /* biblioteca inválida: ignora */ } };
  UI.dsImgDialog = function (app) {
    var src = null, sel = null, st = { th: 240, mir: false, rot: 0 };
    var h = '<p class="muted">Cole com <b>Ctrl+V</b> (print do datasheet) ou abra a imagem; arraste para recortar. Orientação final: <b>lado do conector/engate à esquerda, cabo à direita</b>.</p>' +
      '<div tabindex="0" id="diBox" style="border:1px dashed var(--line,#555);min-height:160px;outline:none;text-align:center"><canvas id="diCv" style="max-width:100%;cursor:crosshair"></canvas></div>' +
      '<div class="row"><button data-a="open">Abrir arquivo…</button><button data-a="rot">Girar 90°</button><button data-a="mir">Espelhar</button><input type="file" accept="image/png,image/jpeg" style="display:none"></div>' +
      '<div class="row"><label>Fundo branco → transparente</label><input id="diTh" type="range" min="200" max="256" value="240"></div>' +
      '<div class="row"><label>Nome</label><input id="diNm" placeholder="ex.: Backshell 380-107 reto"></div><div class="row"><label>Tipo</label><select id="diCat">' + CATS.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + '</option>'; }).join('') + '</select></div>' +
      '<div class="row"><label>Comprimento real (mm)</label><input id="diL" type="number" step="0.5" value="30"></div><div class="row"><label>Altura real (mm, opcional)</label><input id="diH" type="number" step="0.5"></div>' +
      '<div class="row"><label>Altura da saída do cabo (%)</label><input id="diEy" type="number" min="0" max="100" value="50"></div><div class="row"><label>Fonte (datasheet, página)</label><input id="diSrc"></div><div id="diPv" style="text-align:center;background:repeating-conic-gradient(#ccc 0 25%,#fff 0 50%) 0/12px 12px"></div>';
    var dlg = UI.modal('Recortar imagem de datasheet', h, [{ t: 'Cancelar' }, { t: 'Salvar na biblioteca', pri: true, fn: save }]), el = dlg.el, cv = UI.$('#diCv', el), box = UI.$('#diBox', el), inp = UI.$('input[type=file]', el);
    function draw() { if (!src) return; cv.width = src.width; cv.height = src.height; var c = cv.getContext('2d'); c.drawImage(src, 0, 0); if (sel) { c.strokeStyle = '#ff7a00'; c.lineWidth = Math.max(2, src.width / 300); c.strokeRect(sel[0], sel[1], sel[2] - sel[0], sel[3] - sel[1]); } preview(); }
    function out() {
      if (!src) return null; var r = sel && Math.abs(sel[2] - sel[0]) > 4 ? sel : [0, 0, src.width, src.height], x0 = Math.min(r[0], r[2]), y0 = Math.min(r[1], r[3]), w = Math.abs(r[2] - r[0]), hh = Math.abs(r[3] - r[1]);
      var s = Math.min(1, 420 / Math.max(w, hh)), rw = st.rot % 180 ? hh : w, rh = st.rot % 180 ? w : hh, o = document.createElement('canvas'); o.width = Math.round(rw * s); o.height = Math.round(rh * s);
      var c = o.getContext('2d'); c.translate(o.width / 2, o.height / 2); c.rotate(st.rot * Math.PI / 180); if (st.mir) c.scale(-1, 1); c.drawImage(src, x0, y0, w, hh, -w * s / 2, -hh * s / 2, w * s, hh * s);
      var d = c.getImageData(0, 0, o.width, o.height), px = d.data; c.setTransform(1, 0, 0, 1, 0, 0);
      for (var i = 0; i < px.length; i += 4) if (px[i] >= st.th && px[i + 1] >= st.th && px[i + 2] >= st.th) px[i + 3] = 0;
      c.putImageData(d, 0, 0); return o;
    }
    function preview() { var o = out(), pv = UI.$('#diPv', el); pv.innerHTML = ''; if (o) { o.style.maxWidth = '100%'; o.style.maxHeight = '160px'; pv.appendChild(o); } }
    function load(file) { if (!file || !/^image\/(png|jpeg)$/.test(file.type)) return UI.toast('Use PNG ou JPEG.', true); var fr = new G.FileReader(); fr.onload = function () { var im = new G.Image(); im.onload = function () { src = im; sel = null; draw(); }; im.src = String(fr.result); }; fr.readAsDataURL(file); }
    box.addEventListener('paste', function (e) { var it = [].slice.call((e.clipboardData || {}).items || []).filter(function (x) { return /^image\/(png|jpeg)$/.test(x.type); })[0]; if (it) { e.preventDefault(); load(it.getAsFile()); } else UI.toast('A área de transferência não tem imagem.', true); });
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
    cv.onmousedown = function (e) { if (!src) return; var p = pos(e); sel = [p[0], p[1], p[0], p[1]]; cv.onmousemove = function (ev) { var q = pos(ev); sel[2] = q[0]; sel[3] = q[1]; draw(); }; };
    G.addEventListener('mouseup', function () { cv.onmousemove = null; });
    UI.$('[data-a="open"]', el).onclick = function () { inp.click(); }; inp.onchange = function () { load(inp.files[0]); inp.value = ''; };
    UI.$('[data-a="rot"]', el).onclick = function () { st.rot = (st.rot + 90) % 360; preview(); };
    UI.$('[data-a="mir"]', el).onclick = function () { st.mir = !st.mir; preview(); };
    UI.$('#diTh', el).oninput = function () { st.th = +this.value; preview(); };
    box.focus();
    function save() {
      var o = out(); if (!o) return UI.toast('Cole ou abra uma imagem.', true), false;
      var nm = UI.$('#diNm', el).value.trim() || 'Item', id = nm.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) + '-' + Date.now().toString(36).slice(-4), key = 'USR:DSI:' + id;
      var e = { key: key, img: { data: o.toDataURL('image/png'), w: o.width, h: o.height, name: nm, cat: UI.$('#diCat', el).value, L: +UI.$('#diL', el).value || 30, H: +UI.$('#diH', el).value || 0, ey: (+UI.$('#diEy', el).value || 50) / 100, src: UI.$('#diSrc', el).value } };
      var lib = {}; lib[key] = e; var U = HX.sanitizeDSImgs(lib); if (!U[id]) return UI.toast('Imagem grande demais ou inválida (máx. ~300 KB).', true), false;
      HX.dsUserRegister(U); HX.io.saveLibEntry(e).catch(function (er) { UI.toast('Biblioteca compartilhada: ' + er.message, true); });
      UI.toast('"' + nm + '" salvo: paleta "Datasheet (real)"' + (U[id].cat === 'conn' ? ' e na Imagem do nó do conector.' : U[id].cat === 'item' ? '.' : ' e na montagem do conector.')); app.view.redraw(); app.doc.emit('select');
    }
  };
  var se0 = UI.sheetExtra;
  UI.sheetExtra = function (app, root, sh) {
    if (se0) se0(app, root, sh); if (!HX.isPhys(sh)) return;
    var d = document.createElement('div'); d.className = 'row'; d.innerHTML = '<button style="flex:1">Recortar imagem de datasheet…</button><button title="Organizar rótulos sobrepostos">Organizar rótulos</button>';
    var b = d.querySelectorAll('button'); b[0].onclick = function () { UI.dsImgDialog(app); };
    b[1].onclick = function () { var k; app.doc.change('Organizar rótulos', function () { k = HX.physArrangeLabels(sh); }); UI.toast(k ? k + ' rótulo(s) reposicionado(s).' : 'Nenhum rótulo sobreposto.'); };
    var h4 = [].slice.call(root.querySelectorAll('h4')).filter(function (x) { return /Ferramentas do chicote/.test(x.textContent); })[0];
    if (h4 && h4.nextSibling) h4.parentNode.insertBefore(d, h4.nextSibling); else root.appendChild(d);
  };
})(typeof window !== 'undefined' ? window : globalThis);
