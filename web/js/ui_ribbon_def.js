/* HarnessCAD - definição da faixa de opções: rótulos curtos dos botões e abas/grupos/comandos (ui_ribbon.js monta) */
(function (G) {
  'use strict';
  var HX = G.HX;
  HX.RIBBON_LBL = { select: 'Selecionar', wire: 'Fio', splice: 'Emenda', label: 'Label', text: 'Texto', line: 'Linha', rect: 'Retângulo', circle: 'Círculo', cable: 'Cabo',
    dim: 'Cota', brk: 'Derivação', paint: 'Pincel', pdet: 'Detalhe', ptag: 'Etiqueta', measure: 'Medir', rot: 'Girar', mx: 'Espelhar X', my: 'Espelhar Y', lock: 'Bloquear',
    fit: 'Ajustar', erc: 'ERC', pdf: 'PDF', bTrace: 'Rastro', hl: 'Catálogo', hd: 'Tabelas', hr: 'Propriedades', focus: 'Foco' };
  // aba: [legenda do grupo, [entradas]]; '*' = botão grande; 'e:seletor' = elemento da barra antiga; 'm:texto' = item do menu
  HX.RIBBON = [
    ['Início', [['Área de transferência', ['*m:Colar', 'm:Copiar', 'm:Duplicar', 'm:Excluir']], ['Desenhar', ['*e:select', '*e:wire', '*e:splice', '*e:label', '*e:cable', 'e:text', 'e:line', 'e:rect', 'e:circle', 'e:#lblStyle']],
      ['Transformar', ['e:rot', 'e:mx', 'e:my', 'e:lock']], ['Formatação', ['*e:paint', 'e:measure']], ['Grade', ['e:#gSize', 'e:#gSnap', 'e:#gVis']],
      ['Exibir', ['*e:fit', 'e:#pinSz', 'e:#bTrace']], ['Verificar e publicar', ['*e:erc', '*e:pdf']], ['Painéis', ['e:hl', 'e:hd', 'e:hr', '*e:focus']]]],
    ['Inserir', [['Elementos', ['*m:Inserir/Conector do catálogo', '*m:Inserir/Fio', '*m:Inserir/Emenda', '*m:Inserir/Label', 'm:Inserir/Texto', 'm:Inserir/Cabo']],
      ['Folhas', ['*m:Inserir/Nova folha', 'm:Inserir/Excluir folha']], ['Desenho físico', ['m:Inserir/Cota', 'm:Inserir/Derivação']]]],
    ['Editar', [['Histórico', ['*m:Desfazer', '*m:Refazer']], ['Seleção', ['m:Copiar', 'm:Colar', 'm:Duplicar', 'm:Excluir', 'm:Selecionar tudo']],
      ['Numeração', ['*m:Renumerar fios', 'm:Renumerar conectores']], ['Organizar', ['m:Bloquear', 'm:Alinhar nós na h', 'm:Alinhar nós na v', 'm:Distribuir nós na h', 'm:Distribuir nós na v']]]],
    ['Exibir', [['Zoom', ['*m:Ajustar à folha', '*m:Modo foco']], ['Textos', ['m:Texto dos pinos', 'm:Texto nos fios', 'm:Nomes dos sinais']],
      ['Aparência', ['*u:theme', 'm:Fios na cor real', 'm:Estilo dos símbolos', 'm:Grade…']], ['Marcadores', ['m:Marcadores do ERC', 'm:Rastro do fio']]]],
    ['Ferramentas', [['Verificação', ['*m:Verificação elétrica']], ['Projeto', ['*m:Gerar desenho físico', '*m:Conectar pino a pino', 'm:Conector personalizado', 'm:Pincel']],
      ['Utilitários', ['m:Medir', 'm:Meu nome']]]],
    ['Relatórios', [['Tabelas', ['d:*']], ['Exportar', ['*m:Arquivo/Imprimir', '*m:Exportar DXF', 'm:Exportar lista de fios', 'm:Exportar BOM']]]],
    ['Ajuda', [['Ajuda', ['*u:cmdk', '*m:Atalhos', '*m:Sobre']]]],
    ['Desenho físico', [['Chicote', ['*e:dim', '*e:brk', '*e:pdet', '*e:ptag', 'm:Inserir/Detalhe típico']], ['Organizar', ['m:Alinhar nós na h', 'm:Alinhar nós na v', 'm:Distribuir nós na h', 'm:Distribuir nós na v']],
      ['Gerar', ['*m:Gerar desenho físico']]], 'ctx']
  ];
})(typeof window !== 'undefined' ? window : globalThis);
