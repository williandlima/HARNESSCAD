/* HarnessCAD - utilitários de interface: diálogos, avisos, formulários */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI = {};
  UI.$ = function (s, r) { return (r || document).querySelector(s); };
  UI.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  UI.h = function (tag, attrs, html) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'on') Object.keys(attrs.on).forEach(function (ev) { e.addEventListener(ev, attrs.on[ev]); }); else e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html; return e;
  };

  UI.toast = function (msg, err, ms) {
    var t = UI.h('div', { class: 'toast' + (err ? ' err' : '') }, HX.esc(msg));
    t.style.bottom = (34 + UI.$$('.toast').length * 44) + 'px'; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || (err ? 5000 : 2200));
  };

  // Diálogo modal: buttons = [{t:'OK', pri:true, fn:function(dlg){ return false para manter aberto }}]
  UI.modal = function (title, body, buttons) {
    if (UI._mkey) document.removeEventListener('keydown', UI._mkey, true); // diálogo anterior não segura mais o teclado
    var m = UI.$('#modal'); m.innerHTML = '';
    var d = UI.h('div', { class: 'dlg' }); d.appendChild(UI.h('header', {}, HX.esc(title)));
    var b = UI.h('div', { class: 'body' }); if (typeof body === 'string') b.innerHTML = body; else b.appendChild(body); d.appendChild(b);
    var f = UI.h('footer'); d.appendChild(f);
    var api = { el: b, close: function () { if (m.contains(d)) { m.classList.remove('show'); m.innerHTML = ''; } document.removeEventListener('keydown', onKey, true); } };
    (buttons || [{ t: 'Fechar' }]).forEach(function (bt) {
      var x = UI.h('button', { class: bt.pri ? 'pri' : '' }, HX.esc(bt.t));
      x.onclick = function () { if (bt.fn && bt.fn(api) === false) return; api.close(); };
      f.appendChild(x); if (bt.pri) api.okBtn = x;
    });
    function onKey(e) { // só enquanto ESTE diálogo está aberto; se foi fechado por outro caminho, sai e libera as teclas
      if (!m.classList.contains('show') || !m.contains(d)) { document.removeEventListener('keydown', onKey, true); return; }
      if (e.key === 'Escape') { e.stopPropagation(); api.close(); }
      if (e.key === 'Enter' && api.okBtn && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); e.stopPropagation(); api.okBtn.click(); }
      e.stopPropagation();
    }
    document.addEventListener('keydown', onKey, true); UI._mkey = onKey;
    m.appendChild(d); m.classList.add('show');
    var first = b.querySelector('input,select,textarea'); if (first) setTimeout(function () { first.focus(); if (first.select) first.select(); }, 30);
    return api;
  };

  UI.ask = function (title, label, def) {
    return new Promise(function (res) {
      UI.modal(title, '<div class="row"><label>' + HX.esc(label) + '</label><input id="askV" value="' + HX.esc(def || '') + '"></div>', [
        { t: 'Cancelar', fn: function () { res(null); } },
        { t: 'OK', pri: true, fn: function (d) { res(UI.$('#askV', d.el).value); } }]);
    });
  };
  UI.confirm = function (title, msg) {
    return new Promise(function (res) {
      UI.modal(title, '<p>' + HX.esc(msg) + '</p>', [{ t: 'Não', fn: function () { res(false); } }, { t: 'Sim', pri: true, fn: function () { res(true); } }]);
    });
  };

  // Formulário a partir de campos: [{k, l, type:'text'|'number'|'select'|'check'|'textarea', opts:[[v,l]], step}]
  UI.form = function (fields, obj) {
    return fields.map(function (f) {
      if (f.type === 'head') return '<h5 class="fhead">' + HX.esc(f.l) + '</h5>';
      var v = obj[f.k] == null ? '' : obj[f.k], id = 'f_' + f.k, inp;
      if (f.type === 'select') inp = '<select id="' + id + '">' + f.opts.map(function (o) {
        var val = Array.isArray(o) ? o[0] : o, lab = Array.isArray(o) ? o[1] : o;
        return '<option value="' + HX.esc(val) + '"' + (String(val) === String(v) ? ' selected' : '') + '>' + HX.esc(lab) + '</option>';
      }).join('') + '</select>';
      else if (f.type === 'check') inp = '<input type="checkbox" id="' + id + '"' + (v ? ' checked' : '') + '>';
      else if (f.type === 'textarea') inp = '<textarea id="' + id + '" rows="3">' + HX.esc(v) + '</textarea>';
      else inp = '<input id="' + id + '" type="' + (f.type || 'text') + '"' + (f.step ? ' step="' + f.step + '"' : '') + ' value="' + HX.esc(v) + '"' + (f.list ? ' list="' + f.list + '"' : '') + '>';
      return '<div class="row"><label title="' + HX.esc(f.tip || '') + '">' + HX.esc(f.l) + '</label>' + inp + '</div>';
    }).join('');
  };
  UI.readForm = function (fields, root, obj) {
    obj = obj || {};
    fields.forEach(function (f) {
      var e = UI.$('#f_' + f.k, root); if (!e) return;
      obj[f.k] = f.type === 'check' ? e.checked : f.type === 'number' ? (e.value === '' ? '' : +e.value) : e.value;
    });
    return obj;
  };
  // Liga campos ao objeto com atualização imediata (painel de propriedades)
  UI.bindForm = function (fields, root, obj, onChange) {
    fields.forEach(function (f) {
      var e = UI.$('#f_' + f.k, root); if (!e) return;
      e.addEventListener('change', function () {
        var v = f.type === 'check' ? e.checked : f.type === 'number' ? (e.value === '' ? '' : +e.value) : e.value;
        onChange(f.k, v, f);
      });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
