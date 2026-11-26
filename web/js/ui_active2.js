/* HarnessCAD - BARRA ATIVA v1.9.7: (1) cada botão com ÍCONE NOVO + NOME CURTO embaixo; (2) MÓVEL — arraste pela alça ⋮⋮
   (posição gravada; duplo clique na alça volta ao topo); (3) grupo "EDITAR <item>" com as ferramentas do item selecionado
   (lista única HX.itemActions: as mesmas do clique direito e das Propriedades), rotuladas. Complementa ui_active.js. */
(function (G) {
  'use strict';
  var HX = G.HX, UI = HX.UI; if (!UI || !HX.App) return;
  var SHORT = [[/^selecionar/i, 'Selecionar'], [/conector do cat/i, 'Conector'], [/^fio\b/i, 'Fio'], [/^emenda/i, 'Emenda'], [/^label/i, 'Label'], [/^tabela de nomes/i, 'Tabela nomes'], [/nome.? das vias/i, 'Nomes'],
    [/^cabo nos pinos/i, 'Cabo'], [/^blindagem/i, 'Blindagem'], [/^texto/i, 'Texto'], [/pino a pino/i, 'Pino a pino'], [/lista de fia/i, 'Lista'], [/verifica/i, 'ERC'],
    [/gerar desenho/i, 'Físico'], [/^deriva/i, 'Derivação'], [/cota do chicote/i, 'Cota'], [/cota livre/i, 'Cota livre'], [/^bal/i, 'Balão'], [/^etiqueta/i, 'Etiqueta'],
    [/^detalhe/i, 'Detalhe'], [/itens da cablagem/i, 'Itens'], [/cat[aá]logo de detalhes/i, 'Detalhes'], [/atualizar a partir/i, 'Atualizar'], [/^renomear/i, 'Renomear'], [/^bitola/i, 'Bitola'], [/^medida/i, 'Medida'], [/^ocultar pinos/i, 'Ocultar livres'], [/^mostrar todos os pinos/i, 'Mostrar pinos'], [/identifica[cç][aã]o$/i, 'Identificação'], [/^comprimento/i, 'Comprimento'], [/^posi/i, 'Posição']];
  HX.shortLabel = function (t) { t = String(t || ''); for (var i = 0; i < SHORT.length; i++) if (SHORT[i][0].test(t)) return SHORT[i][1];
    t = t.replace(/\s*\(.*$/, '').replace(/…$/, ''); return t.length > 13 ? t.slice(0, 12) + '…' : t; };
  var CSS = '#hxAB{flex-wrap:wrap;max-width:calc(100% - 16px);row-gap:2px}#hxAB button[data-i],#hxAB button[data-a]{width:auto!important;min-width:44px;height:40px!important;flex-direction:column;gap:1px;padding:2px 4px!important}' +
    '#hxAB button .lb{font:10px/1.1 sans-serif;white-space:nowrap}#hxAB .abg{cursor:move;color:var(--mut,#889);padding:0 3px;font:14px sans-serif;letter-spacing:-3px;user-select:none}' +
    '#hxAB .abh{font:600 11px sans-serif;color:var(--acc,#1e6bff);padding:0 4px;white-space:nowrap}#hxAB.drag{opacity:.85}#hxAB.min .abg{display:inline!important}';
  function deco(app, bar) {
    if (!bar.querySelector('.abg')) { var g = document.createElement('span'); g.className = 'abg'; g.textContent = '⋮⋮'; g.title = 'Arraste para mover a barra (duplo clique: volta ao topo)'; bar.insertBefore(g, bar.firstChild); grip(app, bar, g); }
    [].forEach.call(bar.querySelectorAll('button[data-i],button[data-a]'), function (b) { if (b.dataset.lb) return; b.dataset.lb = 1; var t = b.title || '', d = HX.iconFor && HX.iconFor(t), p = b.querySelector('svg path');
      if (d && p) p.setAttribute('d', d); else if (!p && d) b.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + d + '"/></svg>';
      if (!b.querySelector('svg')) b.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + HX.uiIcon(t) + '"/></svg>';
      var s = document.createElement('span'); s.className = 'lb'; s.textContent = HX.shortLabel(t); b.appendChild(s); });
    var main = {}, vis = 0; [].forEach.call(bar.querySelectorAll('button[data-i] .lb'), function (l) { main[l.textContent] = 1; });
    [].forEach.call(bar.querySelectorAll('button[data-a]'), function (b) { var l = b.querySelector('.lb'), hide = main[l && l.textContent] || vis >= 8; b.style.display = hide ? 'none' : ''; if (!hide) vis++; });
    var sb = bar.querySelector('button[data-a]'), sp = sb && sb.parentNode, s = app.doc.selected();
    if (sp && !sp.querySelector('.abh')) { var h = document.createElement('span'); h.className = 'abh'; var it = s[0], L = HX.RIBBON_LBL || {};
      h.textContent = 'Editar ' + (s.length > 1 ? s.length + ' itens' : ({ conn: 'conector', wire: 'fio', splice: 'emenda', cable: 'cabo', label: 'label', text: 'texto' }[it.type] || L[it.type] || it.type) + ' ' + (it.ref || it.num || it.text || ''));
      sp.insertBefore(h, sb); }
  }
  function grip(app, bar, g) {
    var host = bar.parentElement;
    function put(p) { if (!p) { bar.style.left = ''; bar.style.top = ''; bar.style.transform = ''; return; } var W = host.clientWidth, H = host.clientHeight;
      bar.style.left = Math.max(0, Math.min(W - 60, p[0])) + 'px'; bar.style.top = Math.max(0, Math.min(H - 30, p[1])) + 'px'; bar.style.transform = 'none'; }
    var pos = null; try { pos = HX.io.localGet('hx-ab-pos'); } catch (e) {} if (pos && pos.length === 2) put(pos);
    g.onmousedown = function (e) { if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); var r = bar.getBoundingClientRect(), hr = host.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top; bar.classList.add('drag');
      function mv(ev) { pos = [ev.clientX - hr.left - dx, ev.clientY - hr.top - dy]; put(pos); }
      function up() { bar.classList.remove('drag'); document.removeEventListener('mousemove', mv, true); document.removeEventListener('mouseup', up, true); if (pos) HX.io.localSet('hx-ab-pos', pos); }
      document.addEventListener('mousemove', mv, true); document.addEventListener('mouseup', up, true); };
    g.ondblclick = function (e) { e.stopPropagation(); pos = null; HX.io.localSet('hx-ab-pos', ''); put(null); };
    app.abPos = function (p) { pos = p; put(p); if (p) HX.io.localSet('hx-ab-pos', p); };
  }
  var A = HX.App.prototype, init0 = A.init;
  A.init = function () { init0.apply(this, arguments); var app = this, bar = document.getElementById('hxAB'); if (!bar || bar._deco) return; bar._deco = 1;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var busy = false; function run() { if (busy) return; busy = true; try { deco(app, bar); } finally { busy = false; } }
    new MutationObserver(function () { setTimeout(run, 0); }).observe(bar, { childList: true, subtree: true }); run(); };
})(typeof window !== 'undefined' ? window : globalThis);
