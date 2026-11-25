# HarnessCAD — novidades (continuação do INTERFACE3.md)

## v1.9.4 — ordem dos pinos no esquema e novo símbolo padrão
* **Trocar o pino de posição (para evitar cruzamento de vias):** no esquema, clique no pino (na perna ou no número) —
  ele fica destacado em laranja — e use **↑/↓** para trocá-lo de lugar com o vizinho (com o conector girado, **←/→**).
  Os fios ligados acompanham o pino e se refazem limpos (retos quando os pinos ficam alinhados, ou com um só degrau),
  sem encostar em outro fio. Só muda o desenho: número, nome e ligação do pino continuam os mesmos. **Esc** solta o pino.
* Painel do conector: **Voltar à ordem dos pinos do catálogo** (aparece quando a ordem foi mudada).
* **Símbolo padrão (lado arredondado):** o número/letra do contato fica **dentro** do corpo, junto ao lado das vias, e o
  **nome da via fica fora, do outro lado** (por fora da face reta), na linha do pino correspondente. Para o arranjo antigo: painel do conector (ou padrão do
  projeto) › *Números e nomes* › "Nº fora na perna, nome dentro (antigo)".
* **Formatar o nome dos sinais:** painel do conector › *Nome dos sinais: tamanho (mm)*, *estilo* (normal, negrito, itálico,
  negrito itálico) e *cor*. Vale por conector ou para o projeto inteiro ("Usar como padrão do projeto"), vai junto em
  "Aplicar em todos" e no Pincel de formatação, e sai igual no PDF e no DXF (itálico = Helvetica-Oblique no PDF e texto
  oblíquo 15° no DXF).
* **Novo padrão visual do esquema:** conector **sem preenchimento**, contorno e pinos **pretos**, textos (referência, PN,
  números e nomes) em **2,5 mm**; fios e bolinha de emenda **pretos**; **fio novo sem identificação** no desenho (ligar
  por fio, no clique direito ou na ferramenta Fio). Desenhos já existentes mantêm as identificações dos fios; cada
  conector continua personalizável (preenchimento, cores, tamanhos).
* **Barra ativa** (como no Altium): barra flutuante no topo do desenho com as ferramentas principais da folha aberta —
  Esquema: selecionar, conector, fio, emenda, label, cabo, texto, pino a pino, lista de fiação, ERC, gerar físico;
  Físico: selecionar, derivação, cotas, balão, etiqueta, detalhe, itens da cablagem, catálogo de detalhes, atualizar,
  ERC. A ferramenta atual fica destacada; passe o mouse para ver o nome e o atalho.
* **Clique direito no esquema** (sem arrastar — arrastar com o direito continua movendo a tela): ações do item sob o
  mouse — conector (pino a pino, lista de fiação, girar, espelhar, voltar à ordem dos pinos, pincel, excluir), fio
  (mostrar/ocultar identificação, selecionar o circuito, excluir), emenda (tipo), área vazia (inserir, colar, ajustar).
* Menus de contexto legíveis no tema claro (o texto saía cinza-claro sobre branco).
