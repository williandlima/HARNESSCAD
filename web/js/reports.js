/* HarnessCAD - ERC (verificação elétrica), BOM, CSV */
(function (G) {
  'use strict';
  var HX = G.HX;

  // ERC: retorna [{sev:'erro'|'aviso'|'info', msg, sheet, id, pt}]
  // bitola × contato: { idDoFio: [ {ref, pin, size, awg:[min,max], g} ] } — usada no ERC, no desenho e nas propriedades
  HX.gaugeIssues = function (p, nl) {
    nl = nl || HX.buildNetlist(p); if (nl._gi) return nl._gi;
    var out = {};
    Object.keys(nl.nodes).forEach(function (k) {
      var n = nl.nodes[k];
      n.terms.forEach(function (t) {
        if (t.kind !== 'pin') return;
        n.wireEnds.forEach(function (we) {
          var g = HX.gaugeAWG(we.w); if (g == null) return;
          var ct = HX.contactFor(t.item, t.pinObj, g); if (!ct || ct.fit || !ct.awg) return;
          (out[we.w.id] = out[we.w.id] || []).push({ ref: t.ref, pin: t.pin, size: ct.size, awg: ct.range, rtxt: ct.rtxt, g: g, sheet: n.sheet, pt: n.pt, w: we.w });
        });
      });
    });
    return (nl._gi = out);
  };
  HX.gaugeMsg = function (x) { return 'Fio ' + (x.w.num || '') + ' (' + HX.gaugeLabel(x.w) + ') fora da faixa do contato #' + x.size + ' de ' + x.ref + ':' + x.pin + ' (' + x.rtxt + ')'; };
  HX.runERC = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var out = [];
    function add(sev, msg, s, id, pt) { out.push({ sev: sev, msg: msg, sheet: s, id: id, pt: pt }); }

    // Referências duplicadas
    var refs = {};
    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (it) {
        var r = it.type === 'wire' ? it.num : (it.type === 'conn' || it.type === 'splice' || it.type === 'cable') ? it.ref : null;
        if (!r) { if (it.type === 'wire') add('aviso', 'Fio sem número', s, it.id, it.pts[0]); return; }
        if (refs[r]) add('erro', 'Referência duplicada: ' + r, s, it.id, it.pts ? it.pts[0] : [it.x, it.y]);
        refs[r] = 1;
      });
    });

    Object.keys(nl.nodes).forEach(function (k) {
      var n = nl.nodes[k];
      // Pontas soltas: ponta de fio sem nada além dela
      if (n.wireEnds.length === 1 && n.terms.length === 0) {
        var touch = nl.midTouches.some(function (m) { return m.sheet === n.sheet && HX.same(m.pt, n.pt); });
        if (!touch) add('erro', 'Ponta de fio solta (' + (n.wireEnds[0].w.num || 'sem nº') + ')', n.sheet, n.wireEnds[0].w.id, n.pt);
      }
      // Pino com sinal mas sem ligação
      n.terms.forEach(function (t) {
        if (t.kind === 'pin' && t.name && !nl.connected.has(k) && t.item.side !== 'B')
          add('info', 'Pino ' + t.ref + ':' + t.pin + ' (' + t.name + ') sem ligação', n.sheet, t.id, n.pt);
      });
      // Mais de um fio no mesmo pino (verificar contato p/ 2 fios)
      var pins = n.terms.filter(function (t) { return t.kind === 'pin'; });
      if (pins.length && n.wireEnds.length > 1)
        add('aviso', 'Pino ' + pins[0].ref + ':' + pins[0].pin + ' com ' + n.wireEnds.length + ' fios (usar emenda?)', n.sheet, pins[0].id, n.pt);
      if (pins.length > 1) add('info', 'Pinos sobrepostos ' + pins.map(function (t) { return t.ref + ':' + t.pin; }).join(', '), n.sheet, pins[0].id, n.pt);
    });

    nl.midTouches.forEach(function (m) {
      add('aviso', 'Fio ' + (m.wire.num || '') + ' termina no meio do fio ' + (m.other.num || '') + ' sem emenda', m.sheet, m.wire.id, m.pt);
    });

    nl.nets.forEach(function (net) {
      // Curto: sinais diferentes no mesmo net
      var names = {};
      net.pins.forEach(function (t) { if (t.name) names[t.name.replace(/\s*\(.*\)$/, '')] = 1; });
      var nm = Object.keys(names);
      if (nm.length > 1) add('erro', 'Possível curto: sinais ' + nm.join(' / ') + ' no mesmo circuito', net.pins[0] ? sheetOf(net) : 0, net.pins[0] && net.pins[0].id);
      if (net.pins.length === 1 && !net.terms.some(function (t) { return t.kind === 'label' || t.kind === 'drain'; }) && net.wires.length)
        add('aviso', 'Circuito ' + net.name + ' com um só pino (' + net.pins[0].ref + ':' + net.pins[0].pin + ')', sheetOf(net), net.pins[0].id);
    });

    var gi = HX.gaugeIssues(p, nl); // bitola x contato
    Object.keys(gi).forEach(function (id) { gi[id].forEach(function (x) { add('erro', HX.gaugeMsg(x), x.sheet, id, x.pt); }); });

    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (it) {
        if (it.type === 'wire' && !it.wtype) add('info', 'Fio ' + (it.num || '') + ' sem especificação', s, it.id, it.pts[0]);
        if (it.type === 'splice') {
          var n = nl.nodes[s + '|' + HX.key(it.x, it.y)];
          var c = n ? n.wireEnds.length : 0;
          if (c < 2) add('aviso', 'Emenda ' + it.ref + ' com ' + c + ' fio(s)', s, it.id, [it.x, it.y]);
        }
      });
    });
    var ord = { erro: 0, aviso: 1, info: 2 };
    out.sort(function (a, b) { return ord[a.sev] - ord[b.sev]; });
    return out;
  };
  function sheetOf(net) { return net.nodes[0] ? net.nodes[0].sheet : 0; }

  // Lista de materiais
  HX.buildBOM = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var g = {};
    function add(cat, pn, desc, qty, unit, ref) {
      var k = cat + '|' + pn;
      var r = g[k] || (g[k] = { cat: cat, pn: pn, desc: desc, qty: 0, unit: unit, refs: [] });
      r.qty += qty; if (ref && r.refs.indexOf(ref) < 0) r.refs.push(ref);
    }
    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (it) {
        if (it.type === 'conn' && it.eq) {
          add('0-Equipamento', HX.connPN(it), 'Equipamento / acessório (referência)', 1, 'pç', it.ref);
        } else if (it.type === 'conn' && it.disc) {
          add('1-Componente', HX.connPN(it), 'Componente discreto', 1, 'pç', it.ref);
        } else if (it.type === 'conn') {
          var def = HX.getConnDef(it.part, p) || {};
          add('1-Conector', HX.connPN(it), (def.desc || '') + ' ' + HX.variantDesc(it) + ' ' + (it.gender === 'P' ? 'pino' : 'soquete'), 1, 'pç', it.ref);
          if (it.backshell) add('2-Acessório', it.backshell, 'Backshell / acessório de ' + it.ref, 1, 'pç', it.ref);
          HX.connLayout(it, p.unit).pins.forEach(function (pp) {
            var k = s + '|' + HX.key(pp.pt[0], pp.pt[1]);
            if (!nl.connected.has(k)) { var pl = HX.plugFor(it, pp.pin); if (pl) add('3-Tampão', pl, 'Tampão de vedação p/ cavidade vazia' + (pp.pin.sz ? ' #' + pp.pin.sz : ''), 1, 'pç', it.ref); return; }
            var we = nl.nodes[k] && nl.nodes[k].wireEnds[0], ct = HX.contactFor(it, pp.pin, we ? HX.gaugeAWG(we.w) : null); // contato pela bitola do fio
            if (ct && ct.pn && ct.pn !== 'integral') add('3-Contato', ct.pn, 'Contato #' + ct.size + ' ' + (it.gender === 'P' ? 'pino' : 'soquete') + (ct.awg ? ' ' + ct.awg[0] + (ct.awg[1] !== ct.awg[0] ? '–' + ct.awg[1] : '') + ' AWG' : ''), 1, 'pç', it.ref);
          });
        } else if (it.type === 'splice' && it.kind !== 'junction') {
          var sp = HX.CAT.splices[it.kind] || {};
          add('4-Emenda', it.part || sp.pn || it.kind, sp.d || 'Emenda', 1, 'pç', it.ref);
        } else if (it.type === 'wire') {
          var t = HX.wireType(it.wtype);
          var LL = HX.computeLengths ? (nl._dims || (nl._dims = HX.computeLengths(p, nl))) : null, lw = LL && LL.wires[it.id];
          add('5-Fio', HX.wirePN(it), (t ? t.desc : '') + ' ' + HX.gaugeLabel(it) + ' ' + HX.colorName(it.color), ((lw && lw.eff) || +it.len || 0) / 1000 * (LL ? LL.scrap : 1), 'm', it.num);
        } else if (it.type === 'cable') {
          add('6-Cabo', it.part || it.ref, it.desc || 'Cabo', (+it.len || 0) / 1000, 'm', it.ref);
        }
      });
    });
    return Object.keys(g).map(function (k) { return g[k]; }).sort(function (a, b) {
      return a.cat.localeCompare(b.cat) || a.pn.localeCompare(b.pn);
    });
  };

  // Lista de conectores
  HX.connList = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var rows = [];
    p.sheets.forEach(function (sh, s) {
      sh.items.forEach(function (it) {
        if (it.type !== 'conn') return;
        var used = HX.connLayout(it, p.unit).pins.filter(function (pp) { return nl.connected.has(s + '|' + HX.key(pp.pt[0], pp.pt[1])); }).length;
        var def = HX.getConnDef(it.part, p) || {};
        rows.push({ id: it.id, sheet: s, ref: it.ref, pn: HX.connPN(it), desc: def.desc || '', n: it.pins.length, used: used, gender: it.gender, variant: HX.variantDesc(it) });
      });
    });
    return rows.sort(function (a, b) { return HX.natCmp(a.ref, b.ref); });
  };

  HX.toCSV = function (rows, cols) {
    function q(v) { v = v == null ? '' : String(v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
    return '﻿' + [cols.map(function (c) { return q(c[1]); }).join(';')].concat(rows.map(function (r) {
      return cols.map(function (c) { return q(typeof c[0] === 'function' ? c[0](r) : r[c[0]]); }).join(';');
    })).join('\r\n');
  };
  HX.WL_COLS = [['num', 'Fio'], ['from', 'De'], ['to', 'Para'], ['signal', 'Sinal'], ['pn', 'PN fio'], ['gauge', 'Bitola'],
    ['color', 'Cor'], ['len', 'Compr. (mm)'], ['cable', 'Cabo'], ['sheetName', 'Folha'], ['note', 'Obs.']];
  HX.BOM_COLS = [['cat', 'Categoria'], ['pn', 'Part number'], ['desc', 'Descrição'], [function (r) { return r.unit === 'm' ? r.qty.toFixed(2) : r.qty; }, 'Qtd'],
    ['unit', 'Un.'], [function (r) { return r.refs.join(', '); }, 'Referências']];
})(typeof window !== 'undefined' ? window : globalThis);
