/* HarnessCAD - rastro do fio: guias de orientação ao levar o fio até o pino
   - cruz em tela inteira passando pelo cursor
   - guias laranja para todo pino alinhado na horizontal/vertical com o cursor
   - linha pontilhada até o pino livre mais próximo (com o nome do pino)
   - durante o fio: prolongamento H/V a partir do último canto
   - pino sob o ímã: destaque e etiqueta "X1:3 SINAL"
   Liga/desliga: Exibir › Rastro do fio, ou botão na barra (fica salvo neste navegador). */
(function (G) {
  'use strict';
  var HX = G.HX, T = HX.Tools.prototype, TOOLS = { wire: 1, splice: 1, label: 1 };
  HX.trace = { on: (HX.io && HX.io.localGet('hx-trace')) !== false };
  HX.trace.set = function (v) { HX.trace.on = !!v; if (HX.io) HX.io.localSet('hx-trace', HX.trace.on); };

  // pinos visíveis: ponto, conector, pino e se já tem fio
  function pins(view) {
    var p = view.doc.p, out = [];
    view.doc.items().forEach(function (it) {
      if (it.type !== 'conn') return;
      HX.connLayout(it, p.unit).pins.forEach(function (q) { out.push({ pt: q.pt, c: it, q: q }); });
    });
    return out;
  }
  function used(view) {
    var s = {}; view.doc.items().forEach(function (w) {
      if (w.type === 'wire') [w.pts[0], w.pts[w.pts.length - 1]].forEach(function (q) { s[HX.key(q[0], q[1])] = 1; });
    });
    return s;
  }
  HX.tracePins = pins;
  function tag(g, s, x, y, k, col) {
    var sz = 11 * k, w = HX.textW(s, sz) + 6 * k;
    g.style({ stroke: col, lw: k, fill: 'rgba(255,255,255,0.93)', dash: null });
    g.rect(x, y - sz * 0.75, w, sz * 1.5);
    g.text(s, x + 3 * k, y, { size: sz, color: col, bold: true });
  }
  HX.pinTag = function (pn) { return (pn.c.ref || '?') + ':' + pn.q.n + (pn.q.name ? ' ' + pn.q.name : ''); };

  var draw0 = T.drawOverlay;
  T.drawOverlay = function (g) {
    var v = this.view;
    if (HX.trace.on && TOOLS[this.tool]) {
      var k = 1 / v.s, c = this.snapPt, a = v.toWorld(0, 0), b = v.toWorld(v.W || 2000, v.H || 2000), eps = 0.01;
      // cruz em tela inteira
      g.style({ stroke: 'rgba(30,107,255,0.35)', lw: k, fill: null, dash: [4 * k, 4 * k] });
      g.line(a[0], c[1], b[0], c[1]); g.line(c[0], a[1], c[0], b[1]);
      // prolongamento H/V a partir do último canto do fio
      var last = this.wpts && this.wpts.length ? this.wpts[this.wpts.length - 1] : null;
      if (last) {
        g.style({ stroke: 'rgba(0,132,0,0.45)', lw: k, dash: [2 * k, 3 * k] });
        g.line(a[0], last[1], b[0], last[1]); g.line(last[0], a[1], last[0], b[1]);
      }
      var key = v.connPts(); // cache: refeito só quando o desenho muda
      if (v._tpKey !== key) { v._tpKey = key; v._tp = pins(v); v._tpU = used(v); }
      var P = v._tp, u = v._tpU, near = null, best = 60 * k;
      var hit = this.magnet && P.filter(function (pn) { return HX.same(pn.pt, c); })[0], dirs = {};
      P.forEach(function (pn) {
        var dx = pn.pt[0] - c[0], dy = pn.pt[1] - c[1], d = Math.hypot(dx, dy);
        // alinhado com o cursor em um eixo: guarda só o mais próximo em cada direção (←→↑↓)
        if (!hit && (Math.abs(dx) < eps) !== (Math.abs(dy) < eps)) {
          var dk = Math.abs(dx) < eps ? (dy > 0 ? 'd' : 'u') : (dx > 0 ? 'r' : 'l');
          if (!dirs[dk] || d < dirs[dk].d) dirs[dk] = { d: d, pn: pn };
        }
        if (d > eps && d < best && !u[HX.key(pn.pt[0], pn.pt[1])]) { best = d; near = pn; }
      });
      Object.keys(dirs).forEach(function (dk) {
        var q = dirs[dk].pn.pt;
        g.style({ stroke: '#ff8f00', lw: 1.2 * k, fill: null, dash: [5 * k, 3 * k] }); g.line(c[0], c[1], q[0], q[1]);
        g.style({ stroke: '#ff8f00', lw: 1.2 * k, fill: 'rgba(255,143,0,0.25)', dash: null }); g.circle(q[0], q[1], 4 * k);
        tag(g, HX.pinTag(dirs[dk].pn), q[0] + 6 * k, q[1] - 10 * k, k, '#b35f00');
      });
      if (hit) {
        g.style({ stroke: '#e60073', lw: 1.5 * k, fill: 'rgba(230,0,115,0.18)', dash: null }); g.circle(c[0], c[1], 7 * k);
        tag(g, HX.pinTag(hit), c[0] + 10 * k, c[1] - 12 * k, k, '#b0005a');
      } else if (near) {
        g.style({ stroke: '#1e6bff', lw: k, dash: [1.5 * k, 2.5 * k], fill: null }); g.line(c[0], c[1], near.pt[0], near.pt[1]);
        g.style({ stroke: '#1e6bff', lw: k, dash: null }); g.circle(near.pt[0], near.pt[1], 3.5 * k);
        tag(g, HX.pinTag(near), near.pt[0] + 6 * k, near.pt[1] - 10 * k, k, '#1e4fb8');
      }
    }
    draw0.call(this, g);
  };
})(typeof window !== 'undefined' ? window : globalThis);
