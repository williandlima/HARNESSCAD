/* HarnessCAD - estilo de símbolo "equip": equipamentos de bancada e acessórios.
   A figura é o símbolo e cada terminal nasce EXATAMENTE no borne/BNC/porta/parafuso desenhado
   (posições em equip_pins.js), com o fio saindo na direção natural daquele conector. */
(function (G) {
  'use strict';
  var HX = G.HX;
  var SMALL = { banana: 1, jack: 1, clip: 1 };

  // caixa onde a figura é desenhada (coordenadas locais do símbolo)
  function eqBox(c, L) {
    if (SMALL[c.eq]) return [0.5, L.H + L.p / 2 - 3.6, L.w - 1, 7.2];
    return [0, L.H, L.w, L.h - L.H];
  }
  function fit(ic, b) {
    var k = Math.min(b[2] / ic[0], b[3] / ic[1]), iw = ic[0] * k, ih = ic[1] * k;
    return { k: k, iw: iw, ih: ih, ox: b[0] + (b[2] - iw) / 2, oy: b[1] + (b[3] - ih) / 2 };
  }

  // chamado por HX.connLayout: substitui os pinos pelas posições reais na figura
  HX.eqPins = function (c, R, mx, my) {
    var ic = HX.EQ_ICONS[c.eq]; if (!ic) return;
    var map = Object.assign({}, HX.EQ_PINS[c.eq] || {});
    if (c.eq === 'usb') Object.assign(map, HX.eqUsbPins(c.eqTxt, c.pins.filter(function (q) { return q.n !== 'USB'; }).map(function (q) { return q.n; })));
    var box = eqBox(c, R), f = fit(ic, box), hid = new Set(c.hidden || []);
    var vis = c.pins.filter(function (q) { return !hid.has(q.n); }), free = vis.filter(function (q) { return !map[q.n]; });
    var cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2;
    R.pins = vis.map(function (q) {
      var m = map[q.n], ux, uy, dir, drawn = 0;
      if (m) { ux = m[0]; uy = m[1]; dir = HX.DIRS[m[2]]; drawn = m[3]; }
      else { var i = free.indexOf(q), n = free.length; ux = ic[0] * (0.15 + 0.7 * (n === 1 ? 0.5 : i / (n - 1))); uy = ic[1]; dir = [0, 1]; }
      var lx = f.ox + ux * f.k, ly = f.oy + uy * f.k, dx = dir[0], dy = dir[1];
      if (mx) { lx = 2 * cx - lx; dx = -dx; }
      if (my) { ly = 2 * cy - ly; dy = -dy; }
      return { n: q.n, name: q.name, pin: q, side: dx < 0 ? 'L' : 'R', lx: lx, ly: ly, pt: R.xf(lx, ly), row: 0, ldir: [dx, dy], drawn: drawn, elen: 2 * R.u };
    });
    R.icon = { fit: f, mx: mx, my: my, small: !!SMALL[c.eq] };
    R.bbox = HX.normRect(R.xf(box[0] - 0.5, 0), R.xf(box[0] + box[2] + 0.5, box[1] + box[3] + 1.5));
  };

  // largura automática: a figura ocupa a altura das linhas de terminais, mantendo a proporção
  HX.eqAutoWu = function (def, unit) {
    var ic = HX.EQ_ICONS[def.eq], u = unit || 2.5; if (!ic) return 20;
    var nl = def.pins.filter(function (q) { return def.side === 'M' && q.s === 'L'; }).length, nr = def.pins.length - nl;
    var rows = Math.max(def.minRows || 1, nl, nr);
    return Math.max(4, Math.min(60, Math.ceil(rows * 2 * u * ic[0] / ic[1] / u)));
  };

  HX.SYMBOLS.equip = function (g, c, p, sheet, o, L) {
    var T = o.theme, mono = !!o.mono, I = L.icon, ic = HX.EQ_ICONS[c.eq]; if (!I || !ic) return;
    var d = { s: mono ? '#000' : '#4a5562', mono: mono, t: c.eqTxt, c: (c.pins[0] && c.pins[0].col) || '#888', f: function (col) { return mono ? null : col; }, mx: I.mx, my: I.my };
    var f = I.fit;
    if (I.small) g.text(c.ref || '?', f.ox + f.iw / 2, 2.4, { size: 1.8, align: 'c', bold: true, color: T.txt });
    else {
      var desc = (HX.getConnDef(c.part, p) || {}).label || c.part;
      g.text(c.ref || '?', 0, L.H * 0.32, { size: 2.2, bold: true, color: T.txt });
      g.text(c.pnOverride ? c.pnOverride + ' — ' + desc : desc, 0, L.H * 0.72, { size: 1.4, color: T.txt });
    }
    g.push([(I.mx ? -1 : 1) * f.k, 0, 0, (I.my ? -1 : 1) * f.k, I.mx ? f.ox + f.iw : f.ox, I.my ? f.oy + f.ih : f.oy]);
    ic[2](g, d);
    g.pop();
    L.pins.forEach(function (pn) {
      var x = pn.lx, y = pn.ly, dx = pn.ldir[0], dy = pn.ldir[1];
      if (!pn.drawn) { // conector não desenhado: marca o ponto (borne colorido ou porta)
        g.style({ stroke: mono ? '#000' : '#333', lw: 0.12, fill: mono ? null : (pn.pin.col || '#c8d0da'), dash: null });
        if (pn.pin.col) g.circle(x, y, 0.6); else g.rect(x - 0.55, y - 0.55, 1.1, 1.1);
      }
      if (I.small || pn.drawn === 2) return;
      // nome do terminal: na horizontal acima do fio (saída lateral) ou na vertical ao lado do fio (saída para cima/baixo)
      var F = HX.pinK(p), sz = 1.5 * F, nm = pn.n + (p.view.pinNames !== false && pn.pin.name ? ' ' + pn.pin.name : '');
      if (dy) {
        // símbolo girado 90°: o nome gira para o outro lado, para não ficar de cabeça para baixo na folha
        var rq = L.m[0] === 0;
        g.push(rq ? [0, 1, -1, 0, x + 0.25 + sz * 0.5, y + dy * 1.3] : [0, -1, 1, 0, x + 0.25 + sz * 0.5, y + dy * 1.0]);
        g.text(nm, 0, 0, { size: sz, bold: true, align: (dy > 0) !== rq ? 'r' : 'l', color: T.pinTxt });
        g.pop();
      } else g.text(nm, x + dx * 1.3, y - 0.5 - sz * 0.45, { size: sz, bold: true, align: dx < 0 ? 'r' : 'l', color: T.pinTxt });
    });
  };

  // projetos antigos: leva as pontas dos fios das posições antigas (laterais) para os conectores da figura
  HX.migrateEquipPins = function (p) {
    p.sheets.forEach(function (sh) {
      var wires = sh.items.filter(function (w) { return w.type === 'wire'; });
      sh.items.forEach(function (c) {
        if (c.type !== 'conn' || !c.eq) return;
        HX._eqOff = true; var old = HX.connLayout(c, p.unit).pins; HX._eqOff = false;
        var nw = {}; HX.connLayout(c, p.unit).pins.forEach(function (q) { nw[q.n] = q.pt; });
        old.forEach(function (q) {
          var to = nw[q.n]; if (!to) return;
          wires.forEach(function (w) {
            [0, 1].forEach(function (e) {
              var i = e ? w.pts.length - 1 : 0;
              if (!HX.same(w.pts[i], q.pt)) return;
              if (HX.ops && HX.ops.moveEnd) HX.ops.moveEnd(w, e, to, p.grid.size); else w.pts[i] = to.slice();
            });
          });
        });
      });
    });
  };
})(typeof window !== 'undefined' ? window : globalThis);
