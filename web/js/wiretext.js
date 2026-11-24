/* HarnessCAD - LISTA DE FIAÇÃO EM TEXTO (motor): escreve-se a ligação e o esquema é desenhado.
     J4 = D38999:13-35          declara conector novo (opcional: P/S no fim = macho/fêmea)
     J1:A > J2:B, J2:C          pino A do J1 vai no B e no C do J2 (emenda automática no barramento)
     J1B > J3:D,E | 22 PR "SINAL_X"   pino sem conector herda o anterior; depois de "|": bitola, cor, nome do sinal
   Pontas: J1:A, J1-A, J1.A ou J1A (quando J1 existe). Setas: > -> → =>. Comentário: # ou //.
   Traçado: wiretext2.js. */
(function (G) {
  'use strict';
  var HX = G.HX, ops = HX.ops, PTC = { BC: 'WH', PR: 'BK', VM: 'RD', AZ: 'BU', VD: 'GN', AM: 'YE', LR: 'OG', MR: 'BN', VI: 'VT', CZ: 'GY', RS: 'PK' };
  var ENC = { WH: 1, BK: 1, RD: 1, BU: 1, GN: 1, YE: 1, OG: 1, BN: 1, VT: 1, GY: 1, PK: 1, TQ: 1 };
  function pinOf(pins, p) { var e = pins.filter(function (q) { return String(q.n) === p; }); if (e.length) return e[0]; e = pins.filter(function (q) { return String(q.n).toUpperCase() === p.toUpperCase(); }); return e.length === 1 ? e[0] : null; }
  HX.wtParse = function (doc, text) {
    var sh = doc.cur(), C = {}, out = { conns: [], links: [], errors: [] };
    sh.items.forEach(function (i) { if (i.type === 'conn') C[i.ref] = { pins: i.pins, item: i }; });
    String(text || '').split(/\r?\n/).forEach(function (raw, li) {
      var ln = li + 1, s = raw.replace(/(#|\/\/).*$/, '').trim(), m; if (!s) return;
      function err(t) { out.errors.push({ line: ln, msg: t }); }
      if ((m = /^([A-Za-z][\w]*)\s*=\s*(.+)$/.exec(s))) { var w = m[2].trim().split(/\s+/), gd = /^(P|S|MACHO|F[EÊ]MEA)$/i.test(w[w.length - 1]) && w.length > 1 ? w.pop().toUpperCase() : '', part = w.join(' '), def = HX.getConnDef(part, doc.p);
        if (C[m[1]]) return err(m[1] + ' já existe na folha.'); if (!def) return err('Conector "' + part + '" não está no catálogo.');
        C[m[1]] = { pins: def.pins, decl: true }; return out.conns.push({ line: ln, ref: m[1], part: part, gender: gd ? (gd[0] === 'P' || gd[0] === 'M' ? 'P' : 'S') : '' }); }
      var pr = s.split('|'), parts = pr[0].split(/\s*(?:->|=>|→|>)\s*/); if (parts.length !== 2) return err('Use "origem > destino(s)", ex.: J1:A > J2:B, J2:C');
      var last = null;
      function end(tok) { tok = tok.trim(); if (!tok) return null; var r = null, p = null, q = /^([A-Za-z][\w]*?)[:.\-](.+)$/.exec(tok);
        if (q && C[q[1]]) { r = q[1]; p = q[2]; } else if (C[tok]) { err('Falta o pino em "' + tok + '".'); return null; }
        else { Object.keys(C).sort(function (a, b) { return b.length - a.length; }).some(function (k) { if (tok.indexOf(k) === 0 && tok.length > k.length) { r = k; p = tok.slice(k.length); return true; } }); if (!r && last) { r = last; p = tok; } }
        if (!r) { err('Conector não encontrado em "' + tok + '" (declare com "' + tok.replace(/[:.\-].*$/, '') + ' = PEÇA").'); return null; }
        var pp = pinOf(C[r].pins, p); if (!pp) { err(r + ' não tem o pino "' + p + '".'); return null; } last = r; return { ref: r, pin: String(pp.n) }; }
      var src = end(parts[0]); last = null; var dst = parts[1].split(/\s*[,;]\s*|\s+e\s+|\s+/).map(end).filter(Boolean);
      if (!src || !dst.length) return; var props = {};
      (pr[1] || '').replace(/"([^"]*)"|(\S+)/g, function (_, nm, t) { if (nm != null) return props.name = nm; var u = t.toUpperCase().replace(/AWG$/, '');
        if (/^\d+(\.\d+)?$/.test(u)) props.gauge = u; else if (ENC[u] || PTC[u]) props.color = ENC[u] ? u : PTC[u]; else if (/^NOME=/.test(u)) props.name = t.slice(5); else err('Atributo "' + t + '" não reconhecido (bitola, cor ou "nome").'); });
      out.links.push({ line: ln, src: src, dst: dst, props: props });
    });
    return out;
  };
  /* texto a partir do esquema (para editar): uma linha por rede com 2+ pinos de conector */
  HX.wtFromDoc = function (doc) { var nl = HX.buildNetlist(doc.p), L = [];
    nl.nets.forEach(function (n) { var T = n.pins.filter(function (t) { return t.item && t.item.type === 'conn' && !t.item.eq; }); if (T.length < 2) return; var prev = '';
      L.push(T[0].ref + ':' + T[0].pin + ' > ' + T.slice(1).map(function (t) { var s = t.ref === prev ? t.pin : t.ref + ':' + t.pin; prev = t.ref; return s; }).join(', ') + (n.name && !/^N\$/.test(n.name) ? ' | "' + n.name + '"' : '')); });
    return L.sort(HX.natCmp).join('\n'); };
})(typeof window !== 'undefined' ? window : globalThis);
