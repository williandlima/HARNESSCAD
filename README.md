# HarnessCAD — esquemas elétricos de cablagens (intranet)

Editor de esquema elétrico de chicotes/cablagens no navegador, inspirado no **KiCad** (fio desenhado à mão, emendas automáticas, atalhos) e no **EPLAN Harness / Siemens Capital** (catálogo de conectores, lista De-Para, BOM com contatos).

* Interface: **HTML + CSS + JavaScript puro** (sem bibliotecas, sem internet)
* Servidor: **Python 3.8+ só com biblioteca padrão** *ou* **Java 8+** (mesma API) — escolha um
* PDF vetorial gerado pelo próprio código (sem bibliotecas)
* **Todos os arquivos têm menos de 10 KB** (restrição de transferência da rede) — o teste automático verifica isso

## Transferir para a rede da empresa (limite de 4 KB por arquivo)
O pacote `HarnessCAD_4k` traz o projeto compactado e cortado em partes de 3.900 bytes (`.p001.txt`…) + `montar.py` (Python 3.8) e `montar.bat` (sem Python). Copie tudo para uma pasta e rode um deles: junta, confere SHA-256 (aponta a parte exata que corrompeu ou faltou) e extrai. Para outros arquivos: `python ferramentas/dividir.py ARQUIVO SAIDA [--tam 3900]`.

## Como usar

| Modo | Como iniciar | Onde salva |
|---|---|---|
| Servidor Python | `iniciar_servidor_python.bat` → abra `http://NOME-DO-PC:8080` no Edge | pasta `dados\projects` (com backups automáticos) |
| Servidor Java | `iniciar_servidor_java.bat` (compila na 1ª vez) | idem |
| Local, sem servidor | **`Instalar_HarnessCAD.exe`** (atalho com ícone; ver `INSTALAR.txt`) ou `HarnessCAD.exe` | baixa/abre arquivos `.json` |

**Imagens**: vêm embutidas em `web\js\imgpack` (dados `data:`), por isso o PDF sai com conectores e vistas até com o `index.html` aberto direto do disco. O pacote distribuído não traz os PNG de `web\img` (seriam duplicados); para trocar uma imagem oficial ponha o PNG lá e rode `ferramentas\embutir_imagens.py`.

Opções do servidor Python: `python server.py --port 8080 --data \\servidor\compartilhado\harness --admins "joao,maria,10.0.0.5"`.
Java: `javac -encoding UTF-8 *.java` e `java HarnessServer <porta> <pasta web> <pasta dados> "<admins>"`.

`--admins` define quem pode **excluir** projetos e itens da biblioteca (nome de usuário informado em *Ferramentas › Meu nome de usuário* ou IP). Vazio = todos. É uma proteção contra acidentes, não substitui login do domínio. Cada salvamento registra usuário e IP (aparece em *Abrir*).

Exemplo pronto: **Arquivo › Importar arquivo** → `exemplos\CAB-1001_exemplo.json`.

## Fluxo de trabalho
1. **Arquivo › Configurar página** – formato (A4…A0, Letter, ANSI B…E, personalizado), template (ISO 5457/7200, ASME/ANSI, simples), carimbo e tabela de revisões.
2. **Catálogo** (painel esquerdo) – busque (`38999 13-35`, `DT 4`, `M12`, `RJ45`…), duplo clique e clique na folha. Antes de clicar: **R** gira, **X/Y** espelha. Shift+clique coloca várias cópias.
3. **Nomeie os sinais** dos pinos no painel Propriedades (ou cole do Excel: `pino;sinal`).
4. **Fio (W)** – clique no pino, clique nos cantos, termina ao clicar em outro pino/fio/emenda. `/` alterna canto H/V, Shift = ângulo livre, Backspace desfaz o canto, Alt ignora a grade.
5. **Junções automáticas** (padrão = ponto de junção, como no KiCad) – aparecem sozinhas quando: a ponta do fio cai no meio de outro fio (o fio é dividido), pontas de fios se encontram, ou dois ou mais fios chegam ao mesmo pino. Ferramenta **J** coloca manualmente. Na aba Emendas troque o tipo padrão ou o tipo das selecionadas: crimpada (M81824/1), luva de solda (M83519), ultrassônica, topo. *Unir pontas* (aba Fios) faz pontas iguais virarem um fio só em vez de junção.
6. **Labels (L)** ligam circuitos por nome, inclusive entre folhas; estilos terra/chassi.
7. **Cabo/blindagem (C)** – elipse sobre os fios: eles passam a pertencer ao cabo (coluna "Cabo").
7b. **Conectar pino a pino** (Ferramentas › Conectar pino a pino…, tecla **Shift+P**, ou o botão que aparece com 2 conectores selecionados): liga A→A, B→B, C→C… (ou pelo nome do sinal, ou pela ordem), pula pinos que já têm fio, mostra a prévia e roteia os fios em colunas escalonadas, sem sobreposição.
8. **Cotas e formatação do chicote: no desenho físico** (Ferramentas › Gerar desenho físico). Lá: **W** ramo/derivação, **B** BR sobre o ramo, **D** cota (ABNT NBR 10126), arrastar nós muda o traçado, as alças do ramo selecionado mudam de onde ele sai. Ramo sem valor = medido no desenho (escala); digitado = cota fixa. O comprimento de cada fio sai dos ramos do físico + folga por ponta (aba Fios); a aba **Cotas** mostra os fios por ramo e **Quantidade de fio** soma os metros por PN. Comprimento digitado no fio tem prioridade. Ver DESENHO_FISICO.md, FERRAMENTAS_FISICO.md e ANALISE_REALISMO.md.
9. **ERC (F2)** – pontas soltas, curtos (sinais diferentes no mesmo circuito), referência duplicada, **bitola incompatível com o contato** (ex.: 20 AWG em contato #22D), emenda com 1 fio, etc. Clique na linha para ir ao item.
10. **PDF (Ctrl+P)** – folhas + lista de fios + BOM + pinagem, paginadas no mesmo template; colorido ou P&B; formato diferente com ajuste.
11. **DXF (Solid Edge / AutoCAD)** – *Arquivo › Exportar DXF…*: a folha em DXF R12 (mm, 1:1, com carimbo). No Solid Edge, abra o .dxf e salve como .dft.

## Símbolos, equipamentos e componentes
**Padrão de projeto novo: estilo Altium, largura 3, seta de engate no corpo: saindo pela face (lado oposto aos fios) = macho, entrando = fêmea.** Outros 11 estilos (Altium com símbolo único > < no centro, Tabela EPLAN, KiCad, Harness, IEC, ANSI, MIL, bornes, compacto, circular, OrCAD) por conector ou para o projeto; trocar não desliga fios. Também: **equipamentos de bancada** com conexões nos bornes desenhados e **componentes discretos** (resistor, capacitor, fusível, diodo, LED…) com campo Valor. Detalhes em `SIMBOLOS.md`.

**Desenho físico (fase 2):** Ferramentas › *Gerar desenho físico…* monta o chicote em escala a partir das cotas do esquemático, com a imagem de cada conector, coberturas e acessórios. Veja `DESENHO_FISICO.md`.

## Pincel de formatação de fios (P)
Clique num fio para copiar tipo, bitola, cor e PN; depois clique (ou arraste uma caixa) nos fios de destino. Alt+clique copia outro fio. Se um fio estiver selecionado ao abrir, ele é a origem.

## Imprimir / PDF (Ctrl+P)
Marque o que sai: índice, folhas (escolha quais), lista de fios, BOM, conectores, pinagem, circuitos, cotas, quantidade de fio e ERC. ▲▼ muda a ordem; *Colunas* escolhe as colunas de cada tabela. Predefinições prontas (Completo, Só esquema, Fabricação, Compras, Conferência) e as suas (★, salvas no navegador).

## Manipulação de conectores (cuidado especial)
* **Arrastar com o mouse mantém os fios ligados** (elástico ortogonal: os segmentos continuam H/V). **Alt+arrastar** desliga.
* **G** arrasta mantendo fios, **M** move desligando — o item segue o cursor, clique confirma, **Esc cancela tudo**.
* **R / X / Y** giram e espelham a seleção (ou o item sob o cursor) **sem perder as ligações**; 180° mantém o texto legível.
* Setas movem 1 passo de grade (Shift = 10), também com elástico.
* Seleção por caixa: esquerda→direita = janela (inteiro dentro), direita→esquerda = cruzando.
* Alinhar (esquerda, centro, direita, topo, base) e distribuir H/V para vários conectores.
* **Bloquear** (Ctrl+L) impede mover por engano. Ocultar pinos não usados preserva os fios.
* Arrastar **ponta** de fio selecionado reconecta; arrastar **segmento** move só aquele trecho mantendo os vizinhos ortogonais.
* Ctrl+D duplica (novas referências J2, X3…), Ctrl+C/V entre abas, desfazer/refazer ilimitado (150 passos).

## Tela
* **Interface v1.5**: faixa de opções (ribbon), busca de comandos **Ctrl+K**, tela inicial, grade de propriedades e tema claro/escuro — veja `INTERFACE.md`. Cablagem militar MS (adaptador + cordoalha, botas e transições Raychem): `PADRAO_MS.md`. Traçado e manipulação dos ramos: `RAMIFICACAO.md`.
Painéis laterais e inferior: arraste os divisores para redimensionar, duplo clique recolhe; botões no fim da barra mostram/ocultam cada painel. **F9** = modo foco (só o desenho). O layout fica salvo. **Texto** na barra: tamanho dos números/nomes dos pinos (normal / grande / extra). **Rastro do fio** (botão na barra ou **K**): ao desenhar fio, cruz em tela inteira, guia até o pino alinhado em cada direção e etiqueta do pino alvo (ex. `X1:3 CAN-H`).

## Grade
Barra de ferramentas: passo (0,5 a 10 mm ou outro valor), snap e visibilidade; **Exibir › Grade** para estilo pontos/linhas, intervalo da linha maior e cores. Os pinos ficam em múltiplos de 2,5 mm — use grade 2,5 ou 1,25 para encaixe perfeito.

## Catálogos incluídos
Lista completa de conectores, fios e equipamentos em [CATALOGOS.md](CATALOGOS.md).

## Servidor (API)
Detalhes da API, armazenamento e segurança em [SERVIDOR.md](SERVIDOR.md).

## Testes
* `node tests/run_tests.js` — 214 testes de lógica (inclui as correções da revisão de código e desempenho: netlist de 1000 fios < 400 ms) (catálogo, vista frontal com imagem do datasheet, geometria, emendas, elástico, giro/espelho, alinhamento, netlist, ERC, BOM, PDF em todos os formatos/templates, arquivos < 10 KB).
* `tests/testes.html` — os mesmos testes no navegador (para o PC sem Node).
* `python -m unittest tests/test_server.py` — 8 testes da API (conflito, permissões, biblioteca concorrente, erros). Para o Java: inicie com admins `chefe`, `set HX_URL=http://localhost:8080`, `set HX_DATA=<pasta dados>` e rode o mesmo comando.

## Estrutura
```
web/index.html, css/app.css, js/*.js   interface (≈30 módulos pequenos)
server/server.py, HarnessServer.java   servidores
tests/                                 testes
exemplos/                              projeto de exemplo
```
Ordem dos módulos: core → geom → catálogos → netlist/reports → pdf/draw/template → canvas → edit → tools → io → ui_*.
