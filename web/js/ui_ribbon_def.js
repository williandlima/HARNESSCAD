/* HarnessCAD - definição da faixa de opções: rótulos curtos dos botões e abas/grupos/comandos (ui_ribbon.js monta).
   REGRA: cada ferramenta aparece em UMA aba só (v1.9.6). Início = edição e exibição (sem ferramentas de desenho);
   Esquema = tudo do esquema por fase; Desenho físico (contextual) = tudo da cablagem. ui_ribbon.js ainda pula, na
   montagem, qualquer comando repetido pelo nome (HX.ribbonKey) — inclusive os que outros módulos acrescentam. */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.RIBBON_LBL = { select: 'Selecionar', wire: 'Fio', splice: 'Emenda', label: 'Label', text: 'Texto', line: 'Linha', rect: 'Retângulo', circle: 'Círculo', cable: 'Blindagem',
    dim: 'Cota', brk: 'Derivação', paint: 'Pincel', pdet: 'Detalhe', ptag: 'Etiqueta', measure: 'Medir', rot: 'Girar', mx: 'Espelhar X', my: 'Espelhar Y', lock: 'Bloquear',
    fit: 'Ajustar', erc: 'ERC', pdf: 'PDF', bTrace: 'Rastro', hl: 'Catálogo', hd: 'Tabelas', hr: 'Propriedades', focus: 'Foco' };
  /* chave de comparação: sem acento, minúscula, sem "(…)", e sinônimos do mesmo comando */
  var SYN = { 'label de circuito': 'label', 'cabo / blindagem': 'blindagem', 'blindagem sobre fios': 'blindagem', 'cabo': 'blindagem', 'ajustar a folha': 'ajustar', 'modo foco': 'foco',
    'verificacao eletrica': 'erc', 'medir distancia': 'medir', 'pincel de formatacao': 'pincel', 'conector do catalogo': 'conector', 'imprimir': 'pdf', 'imprimir / pdf': 'pdf' };
  HX.ribbonKey = function (t) { var s = String(t || '').toLowerCase().replace(/\s*\(.*$/, '').replace(/…$/, '').replace(/[áàâã]/g, 'a').replace(/[éê]/g, 'e').replace(/í/g, 'i').replace(/[óôõ]/g, 'o').replace(/ú/g, 'u').replace(/ç/g, 'c').trim(); return SYN[s] || s; };
  // aba: [legenda do grupo, [entradas]]; '*' = botão grande; 'e:seletor' = elemento da barra antiga; 'm:texto' = item do menu
  HX.RIBBON = [
    ['Início', [['Área de transferência', ['*m:Colar', 'm:Copiar', 'm:Duplicar', 'm:Excluir']], ['Seleção', ['*e:select', '*e:paint', 'e:measure']],
      ['Transformar', ['e:rot', 'e:mx', 'e:my', 'e:lock']], ['Grade', ['e:#gSize', 'e:#gSnap', 'e:#gVis']],
      ['Exibir', ['*e:fit', 'e:#pinSz', 'e:#bTrace']], ['Painéis', ['e:hl', 'e:hd', 'e:hr', '*e:focus']]]],
    ['Esquema', [['Conectores', ['*m:Inserir/Conector do catálogo', '*m:Ferramentas/Nome das vias', 'm:Ferramentas/Conector personalizado']],
      ['Ligações', ['*e:wire', '*e:splice', '*e:label', 'e:#lblStyle', '*m:Ferramentas/Conectar pino a pino', '*m:Ferramentas/Lista de fiação']],
      ['Cabos', ['*m:Inserir/Cabo nos pinos', 'm:Inserir/Cabo do catálogo', 'e:cable']], ['Desenho', ['e:text', 'e:line', 'e:rect', 'e:circle']],
      ['Verificar', ['*e:erc', '*m:Ferramentas/Gerar desenho físico']]]],
    ['Inserir', [['Folhas', ['*m:Inserir/Nova folha', 'm:Inserir/Excluir folha']]]],
    ['Editar', [['Histórico', ['*m:Desfazer', '*m:Refazer']], ['Seleção', ['m:Selecionar tudo']], ['Numeração', ['*m:Renumerar fios', 'm:Renumerar conectores']]]],
    ['Exibir', [['Textos', ['m:Texto dos pinos', 'm:Texto nos fios', 'm:Nomes dos sinais']],
      ['Aparência', ['*u:theme', 'm:Fios na cor real', 'm:Estilo dos símbolos', 'm:Grade…']], ['Marcadores', ['m:Marcadores do ERC', 'm:Rastro do fio']]]],
    ['Ferramentas', [['Utilitários', ['m:Meu nome']]]],
    ['Relatórios', [['Tabelas', ['d:*']], ['Exportar', ['*e:pdf', '*m:Exportar DXF', 'm:Exportar lista de fios', 'm:Exportar BOM']]]],
    ['Ajuda', [['Ajuda', ['*u:cmdk', '*m:Atalhos', '*m:Sobre']]]],
    ['Desenho físico', [['Conector', ['*m:Inserir/Itens da cablagem']], ['Chicote', ['*e:dim', '*e:brk', '*e:pdet', '*e:ptag', '*m:Inserir/Catálogo de detalhes']],
      ['Organizar', ['m:Alinhar nós na h', 'm:Alinhar nós na v', 'm:Distribuir nós na h', 'm:Distribuir nós na v']]], 'ctx']
  ];
})(typeof window !== 'undefined' ? window : globalThis);
