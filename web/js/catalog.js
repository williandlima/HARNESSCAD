/* HarnessCAD - catálogo: registro, numeração de pinos, PN, busca */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.CAT = { conns: {}, fams: {}, wires: {}, splices: {} };

  // Letras MIL (sem I, O, Q) maiúsculas e depois minúsculas (sem i, l, o, q)
  var UP = 'ABCDEFGHJKLMNPRSTUVWXYZ', LO = 'abcdefghjkmnprstuvwxyz';
  HX.milLetters = function (n) {
    var r = [], all = UP + LO;
    for (var i = 0; i < n; i++) r.push(i < all.length ? all[i] : (all[Math.floor(i / all.length) - 1] + all[i % all.length]).toUpperCase());
    return r;
  };
  HX.nums = function (n, start) { var r = []; for (var i = 0; i < n; i++) r.push(String(i + (start || 1))); return r; };

  // Registra família: def = {fam, std, mfr, desc, variants, pn(fn), contacts, numbering, items:[...]}
  HX.catFamily = function (def) {
    HX.CAT.fams[def.fam] = def;
    def.items.forEach(function (a) {
      var e = Object.assign({ fam: def.fam, std: def.std, mfr: def.mfr || '', pitch: def.pitch || 0 }, a);
      if (!e.pins) {
        var names = a.names || [];
        var numFn = (a.numbering || def.numbering) === 'letters' ? HX.milLetters : HX.nums;
        var ids = a.ids || numFn(a.n);
        var sizes = expandSizes(a.sz || def.sz, a.n);
        e.pins = ids.map(function (id, i) { return { n: id, name: names[i] || '', sz: sizes[i] || '' }; });
      }
      e.n = e.pins.length;
      e.desc = a.desc || (def.desc + ' ' + (a.label || '')).trim();
      e.key = def.fam + ':' + (a.label || a.ins || e.n);
      e.label = a.label || a.ins || String(e.n);
      HX.CAT.conns[e.key] = e;
    });
  };
  function expandSizes(sz, n) {
    if (!sz) return [];
    if (typeof sz === 'string') return new Array(n).fill(sz);
    var r = []; sz.forEach(function (g) { for (var i = 0; i < g[0]; i++) r.push(g[1]); }); return r;
  }

  HX.getConnDef = function (key, project) {
    return (project && project.library.conns[key]) || HX.CAT.conns[key] || null;
  };
  HX.allConns = function (project) {
    var a = Object.keys(HX.CAT.conns).map(function (k) { return HX.CAT.conns[k]; });
    if (project) Object.keys(project.library.conns).forEach(function (k) { a.push(project.library.conns[k]); });
    return a;
  };
  HX.searchConns = function (q, std, project) {
    function na(x) { return String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    var t = na(q || '').split(/\s+/).filter(Boolean);
    var r = HX.allConns(project).filter(function (e) {
      if (std && std !== 'ALL' && e.std !== std) return false;
      var s = na(e.key + ' ' + e.desc + ' ' + e.mfr + ' ' + e.n + 'p');
      return t.every(function (w) { return s.indexOf(w) >= 0; });
    });
    // relevância: família exata, depois rótulo/quantidade exatos
    function score(e) {
      var f = na(e.fam), l = na(e.label), sc = 0;
      t.forEach(function (w) {
        if (f === w) sc += 20; else if (f.indexOf(w) === 0) sc += 8;
        if (l === w || l.split(/\s+/)[0] === w || String(e.n) === w) sc += 6;
      });
      return sc;
    }
    if (t.length) r.sort(function (a, b) { return score(b) - score(a); });
    return r;
  };

  // Part number da instância
  HX.connPN = function (c) {
    var f = HX.CAT.fams[(c.part || '').split(':')[0]];
    var def = HX.getConnDef(c.part);
    if (c.pnOverride) return c.pnOverride;
    if (f && f.pn && def) return f.pn(def, c.variant || (f.variants && f.variants[0].v) || '', c.gender || 'S', c);
    return (def && def.pnBase) || c.part || '';
  };
  HX.variantDesc = function (c) {
    var f = HX.CAT.fams[(c.part || '').split(':')[0]];
    if (!f || !f.variants) return '';
    var v = f.variants.filter(function (x) { return x.v === c.variant; })[0] || f.variants[0];
    return v.d;
  };

  // Contato de um pino (para BOM e ERC de bitola)
  // HX.contactFor / HX.contactOpts / HX.plugFor: ver cat_official.js (opções de contato por bitola)

  // Cria instância a partir do catálogo
  HX.makeConn = function (doc, key, x, y) {
    var def = HX.getConnDef(key, doc.p);
    if (!def) throw new Error('Conector não encontrado: ' + key);
    var f = HX.CAT.fams[def.fam] || {};
    var maxName = Math.max.apply(0, def.pins.map(function (p) { return (p.name || '').length; }).concat([6]));
    var r = {
      type: 'conn', id: doc.uid('c'), ref: doc.nextRef(def.refPfx || f.refPfx || 'J'),
      part: key, x: x, y: y, rot: 0, mx: false, my: false,
      side: def.side || 'R', wu: def.wu || (def.eq && HX.eqAutoWu ? HX.eqAutoWu(def, doc.p.unit) : (doc.p.defaults || {}).connWu || Math.min(24, Math.max(12, Math.ceil(maxName * 0.55) + 8))),
      gender: def.gender || 'S', variant: f.variants ? f.variants[0].v : '',
      pins: def.pins.map(function (p) { var q = { n: p.n, name: p.name || '', sz: p.sz || '' }; if (p.s) q.s = p.s; if (p.col) q.col = p.col; return q; }),
      eq: def.eq || '', eqTxt: def.eqTxt || '', disc: def.disc || '', val: def.val || '', minRows: def.minRows || 0, stubU: def.eq && !/^(banana|jack|clip)$/.test(def.eq) ? 4 : 0,
      hidden: [], backshell: '', locked: false, note: '', pnOverride: ''
    };
    (f.opts || []).forEach(function (o) { r[o.k] = o.def; }); // opções da família (acabamento, chave…)
    return r;
  };

  // Valida/limpa definição vinda de biblioteca compartilhada ou arquivo (dados não confiáveis)
  HX.MAX_PINS = 500;
  function str(v, max) { return String(v == null ? '' : v).slice(0, max); }
  HX.sanitizeConnDef = function (e) {
    if (!e || typeof e !== 'object' || !Array.isArray(e.pins) || !e.pins.length) return null;
    var key = str(e.key, 120); if (!/^USR:/.test(key)) return null;
    var pins = e.pins.slice(0, HX.MAX_PINS).map(function (p) { p = p || {}; return { n: str(p.n, 12), name: str(p.name, 60), sz: str(p.sz, 6) }; });
    return { key: key, fam: 'USR', std: e.std === 'MIL' ? 'MIL' : 'COM', mfr: str(e.mfr, 60), desc: str(e.desc, 120), label: str(e.label || key.slice(4), 80),
      pnBase: str(e.pnBase, 60), n: pins.length, side: ({ R: 1, L: 1, B: 1 })[e.side] ? e.side : 'R', gender: e.gender === 'P' ? 'P' : 'S', pins: pins };
  };
  HX.sanitizeLibrary = function (lib) {
    var out = {}; if (!lib || typeof lib !== 'object') return out;
    Object.keys(lib).slice(0, 2000).forEach(function (k) { var e = HX.sanitizeConnDef(lib[k]); if (e) out[e.key] = e; });
    return out;
  };

  // Biblioteca do usuário (conector personalizado)
  HX.customConn = function (o) {
    var ids = o.ids || HX.nums(Math.max(1, Math.min(HX.MAX_PINS, Math.floor(+o.n) || 1)));
    return {
      key: 'USR:' + o.name, fam: 'USR', std: o.std || 'COM', mfr: o.mfr || '', desc: o.desc || o.name,
      label: o.name, pnBase: o.pn || o.name, n: ids.length, side: o.side || 'R', gender: o.gender || 'S',
      pins: ids.map(function (id, i) { return { n: id, name: (o.names || [])[i] || '', sz: o.sz || '' }; })
    };
  };
})(typeof window !== 'undefined' ? window : globalThis);
