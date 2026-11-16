/* HarnessCAD - impressão personalizável: o que sai no PDF, em que ordem e com quais colunas
   opts.sections = [{ id, on, cols: [chaves], sheets: [índices] }] (ordem do array = ordem no PDF)
   Sem opts.sections vale o formato antigo (wirelist/bom/pinout/only) para compatibilidade. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function sheetName(p, s) { return (p.sheets[s] || {}).name || ''; }
  function lengths(p, nl) { return nl._dims || (nl._dims = HX.computeLengths(p, nl)); }

  // id, título, colunas {k, t, w}, linhas(p, nl). def: ligada por padrão
  HX.PRINT_SECTIONS = [
    { id: 'index', t: 'ÍNDICE', name: 'Índice (sumário)', cols: [{ k: 'pg', t: 'Pág.', w: 6 }, { k: 'title', t: 'Conteúdo', w: 60 }, { k: 'kind', t: 'Tipo', w: 18 }] },
    { id: 'sheets', name: 'Esquema elétrico (folhas)', def: true },
    { id: 'wirelist', t: 'LISTA DE FIOS (DE-PARA)', name: 'Lista de fios / fiação (De-Para)', def: true,
      cols: [{ k: 'num', t: 'Fio', w: 8 }, { k: 'from', t: 'De', w: 12 }, { k: 'to', t: 'Para', w: 12 }, { k: 'signal', t: 'Sinal', w: 14 }, { k: 'pn', t: 'Part number', w: 22 },
        { k: 'gauge', t: 'Bitola', w: 9 }, { k: 'color', t: 'Cor', w: 7 }, { k: 'len', t: 'Compr. mm', w: 8 }, { k: 'cable', t: 'Cabo', w: 7 }, { k: 'sheetName', t: 'Folha', w: 9, off: 1 }, { k: 'note', t: 'Obs.', w: 14 }],
      rows: function (p, nl) { return HX.wireList(p, nl); } },
    { id: 'bom', t: 'LISTA DE MATERIAIS', name: 'Lista de materiais (BOM)', def: true,
      cols: [{ k: '_i', t: 'Item', w: 5 }, { k: 'pn', t: 'Part number', w: 26 }, { k: 'desc', t: 'Descrição', w: 40 }, { k: 'qtyTxt', t: 'Qtd', w: 7 }, { k: 'unit', t: 'Un', w: 5 }, { k: 'refsTxt', t: 'Referências', w: 30 }],
      rows: function (p, nl) { return HX.buildBOM(p, nl).map(function (r, i) { r._i = i + 1; r.qtyTxt = r.qty == null ? '' : r.unit === 'm' ? r.qty.toFixed(2) : r.qty; r.refsTxt = (r.refs || []).join(', '); return r; }); } },
    { id: 'conns', t: 'LISTA DE CONECTORES', name: 'Lista de conectores',
      cols: [{ k: 'ref', t: 'Ref', w: 7 }, { k: 'pn', t: 'Part number', w: 22 }, { k: 'desc', t: 'Descrição', w: 34 }, { k: 'variant', t: 'Variante', w: 12 }, { k: 'gender', t: 'Gên.', w: 5 }, { k: 'n', t: 'Vias', w: 5 }, { k: 'used', t: 'Usadas', w: 6 }],
      rows: function (p, nl) { return HX.connList(p, nl); } },
    { id: 'pinout', t: 'PINAGEM DOS CONECTORES', name: 'Pinagem dos conectores', def: true,
      cols: [{ k: 'ref', t: 'Ref', w: 7 }, { k: 'pn', t: 'Part number', w: 22 }, { k: 'pin', t: 'Pino', w: 6 }, { k: 'name', t: 'Sinal', w: 16 }, { k: 'net', t: 'Circuito', w: 14 }, { k: 'wires', t: 'Fios', w: 12 }, { k: 'ct', t: 'Contato', w: 18 }],
      rows: function (p, nl) {
        var rows = [];
        p.sheets.forEach(function (sh, s) {
          sh.items.filter(function (i) { return i.type === 'conn'; }).sort(function (a, b) { return HX.natCmp(a.ref, b.ref); }).forEach(function (c) {
            HX.connLayout(c, p.unit).pins.forEach(function (pp) {
              var nd = nl.nodes[s + '|' + HX.key(pp.pt[0], pp.pt[1])], we0 = nd && nd.wireEnds[0], ct = HX.contactFor(c, pp.pin, we0 ? HX.gaugeAWG(we0.w) : null);
              rows.push({ ref: c.ref, pn: HX.connPN(c), pin: pp.n, name: pp.pin.name, net: nd && nd.net ? nd.net.name : '', wires: nd ? nd.wireEnds.map(function (e) { return e.w.num; }).join(', ') : '', ct: ct ? ct.pn : '' });
            });
          });
        });
        return rows;
      } },
    { id: 'nets', t: 'CIRCUITOS', name: 'Circuitos (netlist)',
      cols: [{ k: 'name', t: 'Circuito', w: 14 }, { k: 'np', t: 'Pinos', w: 5 }, { k: 'pins', t: 'Pontos', w: 45 }, { k: 'nw', t: 'Fios', w: 5 }, { k: 'wires', t: 'Números dos fios', w: 25 }],
      rows: function (p, nl) { return nl.nets.map(function (n) { return { name: n.name, np: n.pins.length, pins: n.pins.map(function (t) { return t.ref + ':' + t.pin; }).join(', '), nw: n.wires.length, wires: n.wires.map(function (w) { return w.num; }).sort(HX.natCmp).join(', ') }; }); } },
    { id: 'dims', t: 'COTAS DO CHICOTE', name: 'Cotas do chicote',
      cols: [{ k: 'cota', t: 'Cota', w: 6 }, { k: 'de', t: 'De', w: 16 }, { k: 'para', t: 'Para', w: 16 }, { k: 'len', t: 'Comprimento (mm)', w: 12 }, { k: 'n', t: 'Nº de fios', w: 9 }, { k: 'tot', t: 'Σ fios (m)', w: 10 }],
      rows: function (p, nl) {
        var LL = lengths(p, nl), names = {}, k = 0;
        p.sheets.forEach(function (sh) { sh.items.forEach(function (i) { names[i.id] = i.ref || i.text || ''; }); });
        return Object.keys(LL.dims).map(function (id) { var x = LL.dims[id], d = x.d; k++; return { cota: 'C' + k, de: names[d.a] || '(ponto livre)', para: names[d.b] || '(ponto livre)', len: d.len, n: x.count, tot: (x.total / 1000).toFixed(2) }; });
      } },
    { id: 'wireqty', t: 'QUANTIDADE DE FIO', name: 'Quantidade de fio (corte/compra)',
      cols: [{ k: 'pn', t: 'Part number do fio', w: 30 }, { k: 'n', t: 'Nº de fios', w: 10 }, { k: 'm', t: 'Total (m) c/ folga e perda', w: 18 }, { k: 'sem', t: 'Fios sem cota', w: 25 }],
      rows: function (p, nl) { return lengths(p, nl).pns.map(function (t) { return { pn: t.pn, n: t.n, m: t.m.toFixed(2), sem: t.semCota || '' }; }); } },
    { id: 'erc', t: 'RELATÓRIO DE VERIFICAÇÃO (ERC)', name: 'Relatório de verificação (ERC)',
      cols: [{ k: 'sev', t: 'Severidade', w: 10 }, { k: 'msg', t: 'Mensagem', w: 60 }, { k: 'sh', t: 'Folha', w: 12 }],
      rows: function (p, nl) { return HX.runERC(p, nl).map(function (x) { return { sev: x.sev, msg: x.msg, sh: x.sheet == null ? '' : sheetName(p, x.sheet) }; }); } }
  ];
  HX.printSection = function (id) { return HX.PRINT_SECTIONS.filter(function (s) { return s.id === id; })[0]; };

  // configuração padrão (todas as seções, ligadas conforme def, colunas padrão)
  HX.printDefault = function (p) {
    return { sections: HX.PRINT_SECTIONS.map(function (s) {
      var o = { id: s.id, on: !!s.def };
      if (s.cols) o.cols = s.cols.filter(function (c) { return !c.off; }).map(function (c) { return c.k; });
      if (s.id === 'sheets') o.sheets = (p ? p.sheets : []).map(function (_, i) { return i; });
      return o;
    }) };
  };
  HX.PRINT_PRESETS = {
    'Completo': ['index', 'sheets', 'wirelist', 'bom', 'conns', 'pinout', 'nets', 'dims', 'wireqty'],
    'Só esquema': ['sheets'],
    'Fabricação (montagem)': ['sheets', 'wirelist', 'pinout', 'dims', 'wireqty'],
    'Compras': ['bom', 'wireqty'],
    'Conferência / inspeção': ['sheets', 'wirelist', 'nets', 'erc']
  };
  // aplica uma predefinição: liga só as seções da lista, na ordem dela
  HX.printPreset = function (p, name) {
    var ids = HX.PRINT_PRESETS[name], cfg = HX.printDefault(p); if (!ids) return cfg;
    var by = {}; cfg.sections.forEach(function (s) { by[s.id] = s; s.on = ids.indexOf(s.id) >= 0; });
    cfg.sections = ids.map(function (id) { return by[id]; }).concat(cfg.sections.filter(function (s) { return ids.indexOf(s.id) < 0; }));
    return cfg;
  };
  // formato antigo → seções
  HX.printFromLegacy = function (p, opts) {
    var cfg = HX.printDefault(p);
    cfg.sections.forEach(function (s) {
      if (s.id === 'sheets') { s.on = true; if (opts.only != null) s.sheets = [opts.only]; }
      else if (s.id === 'wirelist' || s.id === 'bom') s.on = opts[s.id] !== false;
      else s.on = s.id === 'pinout' ? !!opts.pinout : false;
    });
    return cfg;
  };
})(typeof window !== 'undefined' ? window : globalThis);
