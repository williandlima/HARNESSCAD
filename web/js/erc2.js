/* HarnessCAD - ERC severo: envolve o ERC original (sem alterá-lo) e acrescenta regras, severidade configurável por
   regra (p.erc.rules[id] = 'erro'|'aviso'|'info'|'off') e aceite de aviso (p.erc.waived[chave] = {by, em, nota}).
   Cada mensagem ganha rule (id), ruleName e key (estável: regra|item|mensagem). Aceitas saem da lista (ficam em .waived). */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.ERC_RULES = [
    ['dupRef', 'Referência duplicada', 'erro', /^Referência duplicada/], ['loose', 'Ponta de fio solta', 'erro', /^Ponta de fio solta/],
    ['short', 'Possível curto', 'erro', /^Possível curto/], ['gauge', 'Bitola × contato', 'erro', /fora da faixa do contato/],
    ['noNum', 'Fio sem número', 'aviso', /^Fio sem número/], ['multiWire', 'Vários fios no pino', 'aviso', /fios \(usar emenda/],
    ['midTouch', 'Fio termina no meio de outro', 'aviso', /termina no meio/], ['singlePin', 'Circuito com um pino', 'aviso', /com um só pino/],
    ['splice', 'Emenda com menos de 2 fios', 'aviso', /^Emenda .* com \d+ fio/], ['pinFree', 'Pino com sinal sem ligação', 'info', /sem ligação$/],
    ['pinOverlap', 'Pinos sobrepostos', 'info', /^Pinos sobrepostos/], ['noSpec', 'Fio sem especificação', 'info', /sem especificação$/],
    ['current', 'Corrente acima da capacidade', 'erro'], ['overlap', 'Fios sobrepostos', 'erro'], ['overPin', 'Fio passa sobre pino', 'aviso'],
    ['label1', 'Label global usado uma vez', 'aviso'], ['sameName', 'Mesmo sinal em circuitos separados', 'aviso'], ['noPN', 'Conector sem PN', 'aviso'],
    ['twist', 'Par trançado incompleto', 'aviso'], ['plug', 'Cavidade vazia em conector vedado', 'info'], ['mixGauge', 'Bitolas diferentes no circuito', 'info'],
    ['noLen', 'Fio sem comprimento', 'info'], ['orphan', 'Fio não roteado no desenho físico', 'aviso'], ['emptyBundle', 'Ramo sem fios', 'aviso'],
    ['bend', 'Raio de curvatura abaixo do mínimo', 'aviso'], ['other', 'Outras', 'aviso']
  ];
  var BY = {}; HX.ERC_RULES.forEach(function (r) { BY[r[0]] = r; });
  HX.ercCfg = function (p) { p.erc = p.erc || {}; p.erc.rules = p.erc.rules || {}; p.erc.waived = p.erc.waived || {}; return p.erc; };
  function classify(m) { for (var i = 0; i < HX.ERC_RULES.length; i++) { var r = HX.ERC_RULES[i]; if (r[3] && r[3].test(m)) return r[0]; } return 'other'; }
  var R = HX.SEV_RANK = { erro: 0, aviso: 1, info: 2 };
  function extra(p, nl, add) {
    var LL = HX.computeLengths ? (nl._dims || (nl._dims = HX.computeLengths(p, nl))) : null, glob = {}, names = {}, tw = {};
    p.sheets.forEach(function (sh, s) {
      if (HX.isPhys && HX.isPhys(sh)) return;
      var pins = [], segs = { h: {}, v: {} };
      sh.items.forEach(function (it) {
        if (it.type === 'conn') {
          HX.connLayout(it, p.unit).pins.forEach(function (q) { pins.push(q.pt); });
          var d = HX.CAT.conns[it.part] || {};
          if (!it.eq && !it.disc && !d.disc) { var pn = HX.connPN(it); if (!pn || /\?/.test(pn)) add('noPN', 'aviso', 'Conector ' + it.ref + ' sem part number definido', s, it.id, [it.x, it.y]); }
          var f = HX.CAT.fams[(it.part || '').split(':')[0]];
          if (f && f.sealed && !it.eq) {
            var P = HX.connLayout(it, p.unit).pins, empty = P.filter(function (q) { return !nl.connected.has(s + '|' + HX.key(q.pt[0], q.pt[1])); });
            if (empty.length && empty.length < P.length) { var pl = HX.plugFor ? HX.plugFor(it, empty[0].pin) : ''; add('plug', 'info', 'Conector ' + it.ref + ' vedado com ' + empty.length + ' cavidade(s) vazia(s) — usar tampão' + (pl ? ' ' + pl : ''), s, it.id, [it.x, it.y]); }
          }
        } else if (it.type === 'label' && it.style === 'global' && it.text) (glob[it.text] = glob[it.text] || []).push([s, it]);
        else if (it.type === 'wire' && it.pts.length > 1) {
          if (it.twist) (tw[it.twist] = tw[it.twist] || []).push([s, it]);
          var A = parseFloat(it.amps); if (A > 0) {
            var g = HX.gaugeAWG(it), row = (HX.AWG || []).filter(function (r) { return +r[0] === +g; })[0];
            if (row && A > row[4]) add('current', 'erro', 'Fio ' + (it.num || '') + ': ' + A + ' A acima da referência de ' + row[4] + ' A para ' + g + ' AWG', s, it.id, it.pts[0]);
            [it.pts[0], it.pts[it.pts.length - 1]].forEach(function (pt) {
              var nd = nl.nodes[s + '|' + HX.key(pt[0], pt[1])]; if (!nd) return;
              nd.terms.forEach(function (t) { if (t.kind !== 'pin' || !HX.contactFor) return; var ct = HX.contactFor(t.item, t.pinObj, g); if (ct && ct.a && A > ct.a) add('current', 'erro', 'Fio ' + (it.num || '') + ': ' + A + ' A acima de ' + ct.a + ' A do contato de ' + t.ref + ':' + t.pin, s, it.id, pt); });
            });
          }
          if (LL && !(parseFloat(it.len) > 0) && !(LL.wires[it.id] && LL.wires[it.id].eff != null)) add('noLen', 'info', 'Fio ' + (it.num || '') + ' sem comprimento (sem caminho no desenho físico nem valor manual)', s, it.id, it.pts[0]);
          for (var i = 1; i < it.pts.length; i++) {
            var a = it.pts[i - 1], b = it.pts[i];
            if (Math.abs(a[1] - b[1]) < 1e-6) (segs.h[HX.key(0, a[1])] = segs.h[HX.key(0, a[1])] || []).push([Math.min(a[0], b[0]), Math.max(a[0], b[0]), it]);
            else if (Math.abs(a[0] - b[0]) < 1e-6) (segs.v[HX.key(a[0], 0)] = segs.v[HX.key(a[0], 0)] || []).push([Math.min(a[1], b[1]), Math.max(a[1], b[1]), it]);
            pins.forEach(function (q) { if (HX.onSegInterior(q, a, b)) add('overPin', 'aviso', 'Fio ' + (it.num || '') + ' passa sobre um pino sem ligar', s, it.id, q); });
          }
        }
      });
      ['h', 'v'].forEach(function (k) { Object.keys(segs[k]).forEach(function (r) { var L = segs[k][r].sort(function (x, y) { return x[0] - y[0]; });
        for (var i = 0; i < L.length; i++) for (var j = i + 1; j < L.length && L[j][0] < L[i][1] - 0.01; j++) if (L[j][2] !== L[i][2]) add('overlap', 'erro', 'Fios ' + (L[i][2].num || '?') + ' e ' + (L[j][2].num || '?') + ' sobrepostos', s, L[j][2].id, L[j][2].pts[0]); }); });
    });
    Object.keys(glob).forEach(function (t) { if (glob[t].length === 1) add('label1', 'aviso', 'Label global "' + t + '" usado uma só vez (sem par)', glob[t][0][0], glob[t][0][1].id, [glob[t][0][1].x, glob[t][0][1].y]); });
    Object.keys(tw).forEach(function (t) { if (tw[t].length < 2) add('twist', 'aviso', 'Par trançado ' + t + ' com 1 fio só (' + (tw[t][0][1].num || '') + ')', tw[t][0][0], tw[t][0][1].id, tw[t][0][1].pts[0]); });
    nl.nets.forEach(function (net, ni) {
      net.pins.forEach(function (t) { if (t.name && !/^(NC|N\/C|RES|RESERVA|SPARE|-)$/i.test(t.name)) (names[t.name] = names[t.name] || {})[ni] = t; });
      var gs = {}; net.wires.forEach(function (w) { gs[HX.gaugeLabel(w)] = 1; }); var gk = Object.keys(gs);
      if (gk.length > 1 && net.wires[0]) add('mixGauge', 'info', 'Circuito ' + net.name + ' com bitolas diferentes: ' + gk.join(', '), 0, net.wires[0].id);
    });
    Object.keys(names).forEach(function (n) { var k = Object.keys(names[n]); if (k.length > 1) { var t = names[n][k[0]]; add('sameName', 'aviso', 'Sinal ' + n + ' em ' + k.length + ' circuitos separados (falta ligação?)', 0, t.id); } });
    if (HX.ercPhys) HX.ercPhys(p, nl, add);
  }
  var base = HX.runERC;
  HX.runERC = function (p, nl) {
    nl = nl || HX.buildNetlist(p);
    var cfg = HX.ercCfg(p), out = [], waived = [], ncEnds = {};
    p.sheets.forEach(function (sh, s) { sh.items.forEach(function (w) { if (w.type === 'wire' && w.pts.length > 1) { if (w.ncA) ncEnds[s + '|' + HX.key(w.pts[0][0], w.pts[0][1])] = 1; if (w.ncB) { var q = w.pts[w.pts.length - 1]; ncEnds[s + '|' + HX.key(q[0], q[1])] = 1; } } }); });
    function push(rule, sev, msg, s, id, pt) {
      var o = cfg.rules[rule]; if (o === 'off') return; if (o && R[o] != null) sev = o;
      var e = { sev: sev, msg: msg, sheet: s, id: id, pt: pt, rule: rule, ruleName: (BY[rule] || BY.other)[1] }; e.key = rule + '|' + (id || '') + '|' + msg + (pt ? '|' + HX.key(pt[0], pt[1]) : '');
      if (cfg.waived[e.key]) { e.waived = cfg.waived[e.key]; waived.push(e); } else out.push(e);
    }
    base(p, nl).forEach(function (e) {
      var r = classify(e.msg);
      if (r === 'loose' && e.pt && ncEnds[e.sheet + '|' + HX.key(e.pt[0], e.pt[1])]) return; // ponta marcada N/C
      push(r, e.sev, e.msg, e.sheet, e.id, e.pt);
    });
    extra(p, nl, push);
    out.sort(function (a, b) { return R[a.sev] - R[b.sev]; });
    Object.defineProperty(out, 'waived', { value: waived, enumerable: false });
    return out;
  };
  HX.ercWaive = function (p, e, note) { HX.ercCfg(p).waived[e.key] = { em: new Date().toISOString().slice(0, 10), nota: note || '' }; };
  HX.ercUnwaive = function (p, key) { delete HX.ercCfg(p).waived[key]; };
})(typeof window !== 'undefined' ? window : globalThis);
