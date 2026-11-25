/* HarnessCAD - CATÁLOGO ORGANIZADO (v1.9.11): filtro por FAMÍLIA (D38999, MS3470/3476, D-Sub, M80, Equipamentos,
   Discretos, Minha biblioteca) no lugar de "Militar/Comercial"; grupos com o que a família tem ("✔ vista + desenho do
   datasheet") e cada peça com os selos VISTA ✓ / DESENHO ✓; pesquisa por arranjo (13-35), nº de vias (9 vias), apelidos
   (db25, 3476, harwin…). Painel de Propriedades do conector mostra a mesma situação. Dados em lib_scope.js. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.libStatus) return;
  function esc(v) { return HX.esc(String(v == null ? '' : v)); }
  var CSS = '.tag.ok{background:#2a6a3a;color:#d6f5dc}.tag.no{background:#6a2a2a;color:#f5d6d6}.tag.na{background:#555;color:#ddd}body.light .tag.ok{background:#d9f2df;color:#1d6a33}' +
    'body.light .tag.no{background:#f7dada;color:#8a1f1f}body.light .tag.na{background:#e6e6e6;color:#555}#clist .grp small{display:block;font-weight:normal;opacity:.75;margin-left:14px;font-size:10px}' +
    '#clist .it small{margin-left:6px}#cstd{font-weight:600}body.light .list .it.on{background:#1e6bff;color:#fff}body.light .list .it.on small{color:#e8eeff}';
  function badges(st) { if (st.na) return ''; return '<span class="tag ' + (st.face ? 'ok' : 'no') + '" title="Vista frontal do datasheet">VISTA ' + (st.face ? '✓' : '✗') + '</span>' +
    '<span class="tag ' + (st.side ? 'ok' : 'no') + '" title="Desenho lateral com cotas do datasheet">DESENHO ' + (st.side ? '✓' : '✗') + '</span>'; }
  UI.libRender = function (list, q, std, sel, closed, p) {
    var by = {}, ord = []; list.forEach(function (e) { var g = HX.libGroup(e.fam), id = g ? g.id : 'USER'; if (!by[id]) { by[id] = []; ord.push(id); } by[id].push(e); });
    var one = ord.length === 1, h = '';
    ord.forEach(function (id) { var g = HX.LIB_FAMS.filter(function (x) { return x.id === id; })[0] || { nome: 'Minha biblioteca (peças do usuário)' }, L = by[id], op = one || q || closed['G_' + id] === true; /* grupo começa fechado; clique abre */
      var comp = g.na ? '' : g.vista ? ' <span class="tag ok">✔ vista + desenho do datasheet</span>' : '';
      h += '<div class="grp" data-f="G_' + esc(id) + '">' + (op ? '▾ ' : '▸ ') + esc(g.nome) + ' (' + L.length + ')' + comp + (g.des ? '<small>Desenho: ' + esc(g.des) + ' · Vista: ' + esc(g.vista) + '</small>' : '') + '</div>';
      if (op) L.forEach(function (e) { var st = HX.libStatus(e.key, p);
        h += '<div class="it' + (sel === e.key ? ' on' : '') + '" data-k="' + esc(e.key) + '"><b>' + esc(e.label) + '</b> — ' + esc(e.n) + (e.fam === 'EQUIP' ? ' terminais' : ' vias') + badges(st) + '<small>' + esc(e.mfr || '') + '</small></div>'; }); });
    return h || '<div class="it">Nada encontrado — tente o arranjo (13-35), o nº de vias (9 vias) ou a família (38999, 3476, db25, m80).</div>';
  };
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, s = document.getElementById('cstd'), q = document.getElementById('cq'); if (!s || !q) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    s.innerHTML = '<option value="ALL">Todas as famílias da biblioteca</option>' + HX.LIB_FAMS.map(function (g) { return '<option value="F:' + g.id + '">' + esc(g.nome) + '</option>'; }).join('') + '<option value="F:USER">Minha biblioteca (peças do usuário)</option>';
    q.placeholder = 'Buscar: 13-35 · 38999 15-19 · 3476 14-19 · db25 · m80 2x5 · 9 vias';
    if (app.refreshLib) app.refreshLib(); };
  /* Propriedades do conector: situação na biblioteca */
  var pe0 = UI.propsExtra;
  UI.propsExtra = function (it, app) { var h = pe0 ? pe0.apply(this, arguments) : ''; if (it.type !== 'conn' || HX.isPhys(app.doc.cur())) return h; var s = HX.libStatus(it.part, app.doc.p);
    if (s.na) return h;
    return '<div class="hxLib" style="padding:4px 8px;font-size:11px;border-bottom:1px solid var(--line,#ddd)">' + (s.fora ? '<span class="tag no">FORA DA BIBLIOTECA</span> sem vista e desenho do datasheet — troque por uma peça da biblioteca'
      : badges(s) + (s.vista ? '<br>Vista: ' + esc(s.vista) + ' · Desenho: ' + esc(s.des) : s.user ? ' Peça do usuário' : '')) + '</div>' + h; };
})(typeof window !== 'undefined' ? window : globalThis);
