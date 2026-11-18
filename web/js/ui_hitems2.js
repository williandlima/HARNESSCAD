/* HarnessCAD - CUSTOMIZAÇÃO DA CABLAGEM (fase física): no nó do conector, o que veio do esquema fica só para leitura e
   abaixo vêm os acessórios anexados (biblioteca ou novo item). Janela "Customização da cablagem" (como a tabela de
   configuração dos CADs de chicote): uma linha por conector (adaptador/backshell, bota, capa, barbante, acessórios) e uma
   por ramo (cobertura e PN) — tudo aplicado na hora; o que é do esquema não muda aqui. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.HITEMS) return;
  function esc(t) { return HX.esc ? HX.esc(t) : String(t); }
  function opts(L, v) { return L.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v || '') ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join(''); }
  function pds(kind, none) { return [['', none]].concat(Object.keys(HX.PDS).filter(function (k) { return HX.PDS[k].kind === kind; }).map(function (k) { return [k, HX.PDS[k].n]; })); }
  function accOpts() {
    return Object.keys(HX.HITEM_CATS).filter(function (c) { return /conn|shield|wire|cons/.test(c); }).map(function (c) {
      return '<optgroup label="' + esc(HX.HITEM_CATS[c]) + '">' + HX.hitemsOf([c]).filter(function (k) { return !HX.HITEMS[k].node; }).map(function (k) { return '<option value="' + esc(k) + '">' + esc(HX.hitemLabel(HX.HITEMS[k])) + '</option>'; }).join('') + '</optgroup>'; }).join('');
  }
  /* ---------- painel do nó do conector ---------- */
  var ex0 = UI.propsExtra, bd0 = UI.propsBind;
  UI.propsExtra = function (it, app) {
    var h = ex0(it, app); if (it.type !== 'pnode' || it.nkind !== 'conn') return h;
    var p = app.doc.p, c = HX.physSchem(p)[it.of]; if (!c) return h; var df = HX.CAT.conns[c.part] || {};
    var ro = function (l, v) { return '<div class="row"><label>' + l + '</label><input disabled value="' + esc(v) + '"></div>'; };
    h += '<h4>Definido no esquemático</h4>' + ro('Referência', c.ref) + ro('Part number', HX.connPN(c)) + ro('Família', (df.fam || '') + ' ' + (HX.variantDesc ? HX.variantDesc(c) : '')) +
      ro('Gênero', c.gender === 'P' ? 'Pino (macho)' : 'Soquete (fêmea)') + ro('Contatos ligados', HX.connWiredPins(p, c)) + '<p class="muted">Não muda no físico — altere no esquemático.</p>';
    h += '<h4>Acessórios do conector (customização)</h4><table class="tbl" style="width:100%">' + (it.acc || []).map(function (a, i) {
      var x = HX.HITEMS[a.k] || { n: a.k + ' (fora da biblioteca)', un: 'pç' };
      return '<tr><td>' + esc(HX.hitemLabel(x)) + '</td><td><input data-ai="' + i + '" data-af="q" style="width:52px" title="Quantidade' + (x.per === 'pin' ? ' (× contatos ligados)' : '') + '" value="' + esc(a.q === '' ? 1 : a.q) + '"></td>' +
        '<td><input data-ai="' + i + '" data-af="pn" style="width:90px" placeholder="' + esc(x.pn || 'PN') + '" value="' + esc(a.pn || '') + '"></td><td><button data-ad="' + i + '" title="Remover">×</button></td></tr>'; }).join('') + '</table>' +
      '<div class="row"><select id="haAdd" style="flex:1">' + accOpts() + '</select><button id="haAddB">Adicionar</button></div><div class="row"><button id="haNew" style="flex:1">Novo item na biblioteca…</button></div>';
    return h;
  };
  UI.propsBind = function (it, app, root, set) {
    bd0(it, app, root, set); if (it.type !== 'pnode' || it.nkind !== 'conn' || !root.querySelector('#haAdd')) return;
    var doc = app.doc, ch = function (t, f) { doc.change(t, function () { it.acc = (it.acc || []).slice(); f(); }); };
    root.querySelector('#haAddB').onclick = function () { var k = root.querySelector('#haAdd').value; if (k) ch('Acessório do conector', function () { it.acc.push({ k: k, q: 1, pn: '' }); }); };
    root.querySelector('#haNew').onclick = function () { var c = HX.physSchem(doc.p)[it.of], df = c && HX.CAT.conns[c.part];
      UI.hitemForm(app, { cat: 'conn', fam: df && df.fam, shell: c && HX.shellOf ? HX.shellOf(c) : '' }, function (k) { if (HX.HITEMS[k] && !/cov|point/.test(HX.HITEMS[k].cat)) ch('Acessório do conector', function () { it.acc.push({ k: k, q: 1, pn: '' }); }); }); };
    [].forEach.call(root.querySelectorAll('[data-ai]'), function (inp) { inp.onchange = function () { var i = +inp.dataset.ai, f = inp.dataset.af, v = inp.value.trim();
      ch('Acessório do conector', function () { it.acc[i] = Object.assign({}, it.acc[i]); it.acc[i][f] = f === 'q' ? (v === '' ? 1 : +v || 0) : v; }); }; });
    [].forEach.call(root.querySelectorAll('[data-ad]'), function (b) { b.onclick = function () { var i = +b.dataset.ad; ch('Remover acessório', function () { it.acc.splice(i, 1); }); }; });
  };
  /* ---------- janela "Customização da cablagem" ---------- */
  UI.harnessCustom = function (app) {
    var doc = app.doc, sh = doc.cur(); if (!HX.isPhys(sh)) return UI.toast('Abra a folha do desenho físico.', true);
    var S = HX.physSchem(doc.p), m = HX.physIdx(sh), N = +sh.scale || 1;
    var cov = [['', '(nenhuma)']].concat(Object.keys(HX.PSPR).filter(function (k) { return HX.PSPR[k].cat === 'cov'; }).map(function (k) { return [k, HX.PSPR[k].name]; }));
    var cn = sh.items.filter(function (i) { return i.type === 'pnode' && i.nkind === 'conn' && S[i.of]; }), sg = sh.items.filter(function (i) { return i.type === 'pseg'; });
    var sel = function (id, f, L, v) { return '<select data-n="' + id + '" data-f="' + f + '">' + opts(L, v) + '</select>'; };
    var h = '<p class="muted">O que é do esquemático (conector, contatos, fios) não muda aqui. Mudanças valem na hora.</p><div style="max-height:460px;overflow:auto"><table class="tbl"><tr><th>Conector</th><th>PN (esquema)</th><th>Adaptador / backshell</th><th>Bota</th><th>Capa D-Sub</th><th>Barbante (mm)</th><th>Acessórios</th></tr>' +
      cn.map(function (n) { var c = S[n.of], ds = HX.isDsub && HX.isDsub(c);
        return '<tr><td>' + esc(c.ref) + '</td><td>' + esc(HX.connPN(c)) + '</td><td>' + (ds ? '—' : sel(n.id, 'bsKind', pds('bs', 'Nenhum'), n.bsKind)) + '</td><td>' + (ds ? '—' : sel(n.id, 'bootKind', pds('boot', 'Nenhuma'), n.bootKind)) +
          '</td><td>' + (ds ? sel(n.id, 'dsHood', [['', 'Pela imagem'], ['hood', 'Com capa'], ['none', 'Sem capa']], n.dsHood) : '—') + '</td><td>' + (ds ? '—' : '<input data-n="' + n.id + '" data-f="lany" style="width:60px" value="' + esc(n.lany || '') + '">') +
          '</td><td>' + esc((n.acc || []).map(function (a) { return (HX.HITEMS[a.k] || { n: a.k }).n; }).join(', ') || '—') + '</td></tr>'; }).join('') +
      '</table><table class="tbl" style="margin-top:8px"><tr><th>Ramo</th><th>Compr. (mm)</th><th>Cobertura</th><th>PN da cobertura</th></tr>' +
      sg.map(function (s) { return '<tr><td>' + esc(((m[s.a] || {}).ref || '•') + ' – ' + ((m[s.b] || {}).ref || '•')) + '</td><td>' + Math.round(HX.physSegLen(s, m, N)) + '</td><td>' + sel(s.id, 'cover', cov, s.cover) +
        '</td><td><input data-n="' + s.id + '" data-f="coverTxt" value="' + esc(s.coverTxt || '') + '"></td></tr>'; }).join('') + '</table></div>' +
      '<p class="muted">Acessórios extras (tampa, luva de solda, espaguete na solda…): selecione o conector e use o painel de propriedades.</p>';
    var dlg = UI.modal('Customização da cablagem', h, [{ t: 'Biblioteca de itens…', fn: function () { UI.hitemsDialog(app); return false; } }, { t: 'Fechar', pri: true }]);
    [].forEach.call(dlg.el.querySelectorAll('[data-n]'), function (e) { e.onchange = function () { var it = m[e.dataset.n], f = e.dataset.f, v = e.value;
      if (!it) return; doc.change('Customização: ' + f, function () { it[f] = v; if (f === 'cover' && v && !it.coverTxt && HX.PSPR[v] && HX.PSPR[v].pn) it.coverTxt = HX.PSPR[v].pn; }); app.view.redraw(); }; });
  };
})(typeof window !== 'undefined' ? window : globalThis);
