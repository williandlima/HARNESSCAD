/* HarnessCAD - NOME DAS VIAS (nome do sinal no pino, ex.: VCC no pino 2). HX.pinNameSet grava o nome no pino e, por padrão,
   leva o mesmo nome a todos os pinos de conector da MESMA via (outra ponta, também passando por emendas) — pela netlist.
   HX.pinNamesBulk aplica uma lista (ex.: coluna colada do Excel) na ordem dos pinos do conector. Usado por ui_pinname.js. */
(function (G) {
  'use strict';
  var HX = G.HX;
  function sheetOf(doc, c) { for (var s = 0; s < doc.p.sheets.length; s++) if (doc.p.sheets[s].items.indexOf(c) >= 0) return s; return doc.sheet; }
  /* devolve as pontas alteradas ['J1:2', 'J2:2'] */
  HX.pinNameSet = function (doc, c, n, name, prop, nl) {
    var q = (c.pins || []).filter(function (x) { return String(x.n) === String(n); })[0]; if (!q) return []; name = String(name == null ? '' : name).trim();
    var out = [], done = []; function set(cc, pin) { if (done.indexOf(pin) >= 0) return; done.push(pin); if ((pin.name || '') !== name) { pin.name = name; } out.push(cc.ref + ':' + pin.n); }
    set(c, q); if (prop === false) return out;
    nl = nl || HX.buildNetlist(doc.p); var s = sheetOf(doc, c), lp = HX.connLayout(c, doc.p.unit).pins.filter(function (x) { return x.pin === q; })[0]; if (!lp) return out;
    var nd = nl.nodes[s + '|' + HX.key(lp.pt[0], lp.pt[1])], net = nd && nd.net; if (!net) return out;
    net.pins.forEach(function (t) { if (t.item && t.item.type === 'conn' && t.pinObj) set(t.item, t.pinObj); });
    return out;
  };
  /* lista de nomes na ordem dos pinos visíveis do conector; linhas vazias não mudam o pino */
  HX.pinNamesBulk = function (doc, c, names, prop) {
    var hid = new Set(c.hidden || []), P = (c.pins || []).filter(function (q) { return !hid.has(q.n); }), nl = prop === false ? null : HX.buildNetlist(doc.p), n = 0;
    names.forEach(function (nm, i) { if (P[i] && nm != null && String(nm).trim() !== '') { HX.pinNameSet(doc, c, P[i].n, nm, prop, nl); n++; } });
    return n;
  };
  /* texto colado (Excel: uma coluna, ou "pino<TAB>nome" por linha) → lista na ordem dos pinos ou mapa pino→nome */
  HX.pinNamesParse = function (txt, c) { var L = String(txt || '').replace(/\r/g, '').split('\n'); while (L.length && !L[L.length - 1].trim()) L.pop();
    var two = L.length && L.every(function (l) { return !l.trim() || /\t|;/.test(l); }), P = (c && c.pins || []).map(function (q) { return String(q.n); });
    if (!two) return L.map(function (l) { return l.trim(); });
    var by = {}; L.forEach(function (l) { var a = l.split(/\t|;/); if (a.length >= 2) by[a[0].trim()] = a.slice(1).join(' ').trim(); }); return P.map(function (n) { return by[n] != null ? by[n] : null; }); };
})(typeof window !== 'undefined' ? window : globalThis);
