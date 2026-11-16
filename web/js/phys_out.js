/* HarnessCAD - desenho físico: SAÍDAS PARA A PRODUÇÃO.
   Tabela de crimpagem (contato, ferramenta e posicionador típicos por família/tamanho; o nó do conector pode sobrescrever:
   crimpTool / crimpPos), lista de corte (CSV para máquina de corte e decapagem) e DXF do gabarito em tamanho real (mm). */
(function (G) {
  'use strict';
  var HX = G.HX;
  var MILC = /^(D38999|MS3476|MS26482|MS5015)$/;
  // ferramenta típica: [ferramenta, posicionador/matriz] — confirme no datasheet do contato
  HX.crimpToolFor = function (c, ct) {
    var fam = (c.part || '').split(':')[0], sz = ct && ct.size ? String(ct.size) : '';
    if (MILC.test(fam) || fam === 'M24308') {
      if (/^2[2-8]/.test(sz)) return ['M22520/2-01', 'posicionador M22520/2-xx do contato #' + sz];
      if (/^(20|16|12)$/.test(sz)) return ['M22520/1-01', fam === 'M24308' ? 'posicionador do contato #' + sz : 'torre TH1A (M22520/1-02)'];
      if (sz) return ['ferramenta para contato #' + sz, 'matriz do contato #' + sz];
    }
    if (fam === 'M83513') return ['—', 'contato pré-crimpado (pigtail)'];
    if (/^DT/.test(fam)) return ['HDT-48-00', 'matriz integrada (#' + (sz || '?') + ')'];
    return ['alicate do fabricante', 'ver datasheet do terminal'];
  };
  function nodesByOf(p) { var o = {}, sh = HX.physSheet && HX.physSheet(p); if (sh) sh.items.forEach(function (n) { if (n.type === 'pnode' && n.of) o[n.of] = n; }); return o; }
  HX.physCrimp = function (p) {
    var nl = HX.buildNetlist(p), N = nodesByOf(p), rows = [];
    p.sheets.forEach(function (S, si) {
      if (HX.isPhys(S)) return;
      S.items.forEach(function (c) {
        if (c.type !== 'conn' || c.eq || (HX.CAT.conns[c.part] || {}).disc) return;
        HX.connLayout(c, p.unit).pins.forEach(function (q) {
          var nd = nl.nodes[si + '|' + HX.key(q.pt[0], q.pt[1])]; if (!nd) return;
          nd.wireEnds.forEach(function (we) {
            var w = we.w, g = HX.gaugeAWG(w), ct = HX.contactFor ? HX.contactFor(c, q.pin, g) : null, t = HX.crimpToolFor(c, ct), o = N[c.id] || {}, st = HX.stripFor ? HX.stripFor(c, q.pin, g, we.end === 0 ? w.stripA : w.stripB) : null;
            rows.push({ ref: c.ref, pin: q.n, num: w.num || '', gauge: HX.gaugeLabel(w), contact: ct ? (ct.pn || '') + (ct.size ? ' #' + ct.size : '') + (ct.fit === false ? ' (!)' : '') : '', tool: o.crimpTool || t[0], pos: o.crimpPos || t[1], strip: st ? st.txt : '' });
          });
        });
      });
    });
    rows.sort(function (a, b) { return HX.natCmp(a.ref, b.ref) || HX.natCmp(String(a.pin), String(b.pin)); });
    return rows;
  };
  HX.physCutList = function (p) {
    var nl = HX.buildNetlist(p), L = HX.computeLengths(p, nl);
    return HX.wireList(p, nl).map(function (r) {
      var e = r.w.len > 0 ? +r.w.len : (L.wires[r.id] || {}).eff;
      return { num: r.num, pn: r.pn, gauge: r.gauge, color: r.color, len: e != null ? Math.round(e) : '', stripA: r.stripA || '', stripB: r.stripB || '', from: r.from, to: r.to, twist: r.twist || '' };
    }).sort(function (a, b) { return String(a.pn).localeCompare(String(b.pn)) || (+b.len || 0) - (+a.len || 0) || HX.natCmp(a.num, b.num); });
  };
  HX.physCutCSV = function (p) {
    var q = function (v) { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    var h = ['Fio', 'Part number', 'Bitola', 'Cor', 'Corte (mm)', 'Decap. A (mm)', 'Decap. B (mm)', 'De', 'Para', 'Par trançado'];
    return '﻿' + [h].concat(HX.physCutList(p).map(function (r) { return [r.num, r.pn, r.gauge, r.color, r.len, r.stripA, r.stripB, r.from, r.to, r.twist]; })).map(function (l) { return l.map(q).join(';'); }).join('\r\n') + '\r\n';
  };
  // DXF R12 do gabarito, tamanho real (mm), Y para cima. Camadas: RAMOS, NOS, PINOS (cruzes de fixação nos BR), ITENS, TEXTO
  HX.physDXF = function (p) {
    var sh = HX.physSheet(p); if (!sh) return null;
    var m = HX.physIdx(sh), N = +sh.scale || 1, o = [], x0 = Infinity, y0 = -Infinity;
    sh.items.forEach(function (n) { if (n.type === 'pnode') { x0 = Math.min(x0, n.x); y0 = Math.max(y0, n.y); } });
    function X(x) { return Math.round((x - x0) * N * 100) / 100; } function Y(y) { return Math.round((y0 - y) * N * 100) / 100; }
    function ent(t, lay, kv) { o.push('0', t, '8', lay); kv.forEach(function (v) { o.push(String(v[0]), String(v[1])); }); }
    function line(a, b, lay) { ent('LINE', lay, [[10, X(a[0])], [20, Y(a[1])], [30, 0], [11, X(b[0])], [21, Y(b[1])], [31, 0]]); }
    function text(s, q, h, lay) { ent('TEXT', lay || 'TEXTO', [[10, X(q[0])], [20, Y(q[1])], [30, 0], [40, h], [1, String(s).replace(/[^\x20-\x7e]/g, function (c) { return ({ 'Ø': '%%c', '°': '%%d', '±': '%%p' })[c] || '?'; })]]); }
    sh.items.forEach(function (i) {
      if (i.type === 'pseg') { var P = HX.physSegPts(i, m); if (!P) return; for (var k = 1; k < P.length; k++) line(P[k - 1], P[k], 'RAMOS'); var c = HX.polyAt(P, 0.5).pt; text(HX.physSegLen(i, m, N) + ' mm', [c[0], c[1] - 1.5], 6, 'TEXTO'); }
      if (i.type === 'pnode') {
        if (i.nkind === 'conn') { ent('CIRCLE', 'NOS', [[10, X(i.x)], [20, Y(i.y)], [30, 0], [40, 8]]); text(i.ref || '', [i.x + 1.5, i.y - 1.5], 8, 'TEXTO'); }
        else { var r = 6 / N; line([i.x - r, i.y], [i.x + r, i.y], 'PINOS'); line([i.x, i.y - r], [i.x, i.y + r], 'PINOS'); if (i.ref) text(i.ref, [i.x + 1, i.y - 1], 5, 'TEXTO'); }
      }
      if (i.type === 'pacc' && HX.physAccAt) { var A = HX.physAccAt(i, sh, m, N); if (!A) return; var h = 8 / N; line([A.pt[0] - A.d[1] * h, A.pt[1] + A.d[0] * h], [A.pt[0] + A.d[1] * h, A.pt[1] - A.d[0] * h], 'ITENS'); text((HX.physAccLabel ? HX.physAccLabel(i) : i.kind) + ' @' + Math.round(+i.dist || 0), [A.pt[0] + h, A.pt[1] - h], 4, 'ITENS'); }
    });
    return ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES'].concat(o, ['0', 'ENDSEC', '0', 'EOF']).join('\r\n') + '\r\n';
  };
})(typeof window !== 'undefined' ? window : globalThis);
