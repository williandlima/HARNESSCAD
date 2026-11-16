/* HarnessCAD - painel inferior: lista de fios, BOM, conectores, circuitos, ERC */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI;

  UI.initTables = function (app) {
    var doc = app.doc, tab = 'wl', sortK = null, sortD = 1, data = null, dirty = true;
    var TABS = [['wl', 'Lista de fios (De-Para)'], ['bom', 'Lista de materiais'], ['cn', 'Conectores'], ['nets', 'Circuitos'], ['dims', 'Cotas'], ['pn', 'Quantidade de fio'], ['erc', 'Verificação (ERC)']];
    var tabs = UI.$('#dockTabs'), body = UI.$('#dockBody'), dock = UI.$('#dock');
    tabs.innerHTML = TABS.map(function (t) { return '<button data-t="' + t[0] + '">' + t[1] + '<span id="b_' + t[0] + '"></span></button>'; }).join('') +
      '<span class="grow"></span><button id="tCsv" title="Exportar tabela atual em CSV (Excel)">CSV</button><button id="tMin" title="Recolher/expandir">▾</button>';
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-t]'); if (!b) return;
      tab = b.dataset.t; sortK = null; dock.classList.remove('min'); render();
    });
    UI.$('#tMin').onclick = function () { dock.classList.toggle('min'); setTimeout(function () { app.view.resize(); }, 10); };
    UI.$('#tCsv').onclick = function () { exportCSV(); };

    function sheetOf(id) { var f = doc.findAll(id); return f ? f.sheet : 0; }
    function compute() {
      var nl = app.view.netlist(), p = doc.p;
      data = { nl: nl, wl: HX.wireList(p, nl), bom: HX.buildBOM(p, nl), cn: HX.connList(p, nl), erc: HX.runERC(p, nl) }; app.ercWaivedCount = (data.erc.waived || []).length; if (UI.ercList) data.erc = UI.ercList(data.erc);
      data.nets = nl.nets.map(function (n) {
        return { name: n.name, pins: n.pins.map(function (t) { return t.ref + ':' + t.pin; }).join(', '), np: n.pins.length, nw: n.wires.length,
          wires: n.wires.map(function (w) { return w.num; }).sort(HX.natCmp).join(', '), id: n.pins[0] && n.pins[0].id, sheet: n.nodes[0] && n.nodes[0].sheet };
      });
      var LL = nl._dims || (nl._dims = HX.computeLengths(p, nl)), names = {}, k = 0;
      p.sheets.forEach(function (sh) { sh.items.forEach(function (i) { names[i.id] = i.ref || i.text || ''; }); });
      data.dims = Object.keys(LL.dims).map(function (id) {
        var x = LL.dims[id], d = x.d; k++;
        return { id: id, sheet: sheetOf(id), cota: 'C' + k, de: names[d.a] || '(ponto livre)', para: names[d.b] || '(ponto livre)', len: d.len, n: x.count, tot: (x.total / 1000).toFixed(2) };
      });
      data.pn = LL.pns.map(function (t) { return { pn: t.pn, n: t.n, m: t.m.toFixed(2), sem: t.semCota || '' }; });
      dirty = false;
      var e = data.erc.filter(function (x) { return x.sev === 'erro'; }).length, w = data.erc.filter(function (x) { return x.sev === 'aviso'; }).length;
      UI.$('#b_erc').innerHTML = e ? '<span class="badge">' + e + '</span>' : w ? '<span class="badge w">' + w + '</span>' : '<span class="badge ok">✓</span>';
      UI.$('#b_wl').innerHTML = ' <span class="muted">(' + data.wl.length + ')</span>';
      app.view.ercMarks = app.showErcMarks ? data.erc : null;
    }
    var COLS = {
      wl: [['num', 'Fio', 1], ['name', 'Nome', 1], ['twist', 'Par', 1], ['from', 'De'], ['stripA', 'Decap. De (mm)'], ['to', 'Para'], ['stripB', 'Decap. Para (mm)'], ['signal', 'Circuito'], ['pn', 'Part number'], ['gauge', 'Bitola'], ['color', 'Cor'],
        ['len', 'Compr. mm', 1], ['cable', 'Cabo'], ['sheetName', 'Folha'], ['note', 'Obs.', 1]],
      bom: [['cat', 'Categoria'], ['pn', 'Part number'], ['desc', 'Descrição'], ['qtyTxt', 'Qtd'], ['unit', 'Un'], ['refsTxt', 'Referências']],
      cn: [['ref', 'Ref'], ['pn', 'Part number'], ['desc', 'Descrição'], ['variant', 'Variante'], ['gender', 'Gên.'], ['n', 'Vias'], ['used', 'Usadas']],
      nets: [['name', 'Circuito'], ['np', 'Pinos'], ['pins', 'Pontos'], ['nw', 'Fios'], ['wires', 'Números dos fios']],
      dims: [['cota', 'Cota'], ['de', 'De'], ['para', 'Para'], ['len', 'Comprimento (mm)', 1], ['n', 'Nº de fios no trecho'], ['tot', 'Σ fios no trecho (m)']],
      pn: [['pn', 'Part number do fio'], ['n', 'Nº de fios'], ['m', 'Total (m) c/ folga e perda'], ['sem', 'Fios sem cota']],
      erc: [['sev', 'Severidade'], ['msg', 'Mensagem'], ['ruleName', 'Regra'], ['sheetTxt', 'Folha'], ['act', '']]
    };
    function rows() {
      var r = data[tab].slice();
      if (tab === 'bom') r.forEach(function (x) { x.qtyTxt = x.unit === 'm' ? (x.qty ? x.qty.toFixed(2) : 'definir compr.') : x.qty; x.refsTxt = x.refs.join(', '); });
      if (tab === 'erc') r.forEach(function (x) { x.sheetTxt = (doc.p.sheets[x.sheet] || {}).name || ''; });
      if (sortK) r.sort(function (a, b) { return sortD * HX.natCmp(a[sortK] == null ? '' : a[sortK], b[sortK] == null ? '' : b[sortK]); });
      return r;
    }
    function render() {
      UI.$$('button[data-t]', tabs).forEach(function (b) { b.classList.toggle('on', b.dataset.t === tab); });
      if (dock.classList.contains('min')) return;
      if (dirty || !data) compute();
      var cols = COLS[tab], rs = rows();
      var h = '<table class="t"><thead><tr>' + cols.map(function (c) { return '<th data-k="' + c[0] + '">' + c[1] + (sortK === c[0] ? (sortD > 0 ? ' ▲' : ' ▼') : '') + '</th>'; }).join('') + '</tr></thead><tbody>';
      h += rs.map(function (r, i) {
        var on = r.id && doc.sel.has(r.id) ? ' class="on"' : '';
        return '<tr data-i="' + i + '"' + on + '>' + cols.map(function (c) {
          var v = r[c[0]] == null ? '' : r[c[0]];
          if ((tab === 'wl' || tab === 'dims') && c[2]) return '<td><input data-k="' + c[0] + '" value="' + HX.esc(v) + '"></td>';
          if (tab === 'erc' && c[0] === 'sev') return '<td class="sev-' + v + '">' + v + '</td>';
          if (tab === 'erc' && c[0] === 'act') return '<td>' + (UI.ercAct ? UI.ercAct(r) : '') + '</td>';
          return '<td>' + HX.esc(v) + '</td>';
        }).join('') + '</tr>';
      }).join('');
      body.innerHTML = (tab === 'erc' && UI.ercBar ? UI.ercBar(app) : '') + h + '</tbody></table>' + (rs.length ? '' : '<p class="muted" style="padding:8px">Sem itens.</p>');
      body._rows = rs;
    }
    body.addEventListener('click', function (e) {
      var th = e.target.closest('th'); if (th) { var k = th.dataset.k; sortD = sortK === k ? -sortD : 1; sortK = k; render(); return; }
      if (e.target.tagName === 'INPUT') return;
      var tr = e.target.closest('tr[data-i]'); if (!tr) return;
      var r = body._rows[+tr.dataset.i]; app.gotoItem(r.id, r.sheet, r.pt);
    });
    body.addEventListener('change', function (e) {
      var inp = e.target; if (inp.tagName !== 'INPUT') return;
      var r = body._rows[+inp.closest('tr').dataset.i], f = doc.findAll(r.id); if (!f) return;
      var k = inp.dataset.k, v = inp.value;
      doc.change('Editar ' + k, function () { f.item[k] = k === 'len' ? (v === '' ? '' : +v) : v; });
    });
    function exportCSV() {
      if (dirty || !data) compute();
      var cols = COLS[tab].map(function (c) { return [c[0], c[1]]; });
      HX.io.download(HX.io.safeName(doc.p.meta.docNo + '_' + tab) + '.csv', HX.toCSV(rows(), cols), 'text/csv;charset=utf-8');
    }
    var timer = null;
    doc.on('change', function () { dirty = true; clearTimeout(timer); timer = setTimeout(render, 150); });
    doc.on('select', function () {
      if (!body._rows) return;
      UI.$$('tr[data-i]', body).forEach(function (tr) { var r = body._rows[+tr.dataset.i]; tr.classList.toggle('on', !!(r.id && doc.sel.has(r.id))); });
    });
    app.showTab = function (t) { tab = t; dock.classList.remove('min'); dirty = true; render(); };
    app.ercData = function () { if (dirty || !data) compute(); return data.erc; };
    render();
  };
})(typeof window !== 'undefined' ? window : globalThis);
