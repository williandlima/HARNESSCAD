# Sugestões de funcionalidades e roteiro de teste

## Próximas funcionalidades sugeridas (por prioridade)

### Alta — ganho direto no dia a dia
1. **Vista de formboard (desenho físico 1:1)** – segunda vista do mesmo projeto com ramos, comprimentos, pontos de derivação e cotas; o comprimento de cada fio sai da soma dos ramos (hoje é digitado).
2. **Tabela de terminação por fio** – decapagem, contato, ferramenta de crimpagem (ex.: M22520/2-01 + posicionador), anilha/identificação, luva termocontrátil, torque do backshell.
3. **Importar/exportar planilha De-Para** – criar o esquema a partir de um Excel/CSV de ligações (conector, pino, fio, conector, pino) com posicionamento automático.
4. **Menu de contexto (botão direito)** com girar, espelhar, editar, excluir, "selecionar circuito".
5. **Destacar circuito** – clicar num fio acende todo o circuito em todas as folhas (como o "highlight net" do KiCad).
6. **Pares trançados e blindagem multinível** – marcar pares/triplas, malha individual + malha geral, terminação 360° no backshell.

### Média — qualidade e engenharia
7. **Queda de tensão e dimensionamento** – corrente por circuito → queda de tensão (já há Ω/km e comprimento), temperatura e fator de agrupamento (AS50881 / NBR 5410).
8. **Peso e diâmetro do feixe** por ramo (soma das seções externas dos fios + fator de preenchimento), para escolher capa/abraçadeira.
9. **Revisões com comparação (diff)** entre duas versões do servidor: fios adicionados/removidos/alterados, com nuvem de revisão no PDF.
10. **Biblioteca de símbolos de componentes em linha** – fusível, diodo, resistor, relé, ferrite, que entram na netlist.
11. **Ligações cruzadas entre folhas** com referência automática de zona (ex.: "→ Folha 2 / C4"), usando as zonas do template.
12. **Variantes/opcionais** – fios e conectores marcados por variante; PDF/BOM por variante.

### Integrações
13. **Exportar netlist** KiCad (.net) / CSV EPLAN e importar pinagem de PDF/Excel do fabricante.
14. **Integração com o VisMAT/obsolescência** – checar PN de conectores/contatos na base de materiais da empresa e marcar itens obsoletos na BOM.
15. **Etiquetas de identificação** – gerar PDF de etiquetas/anilhas por fio (W101 J1:A → P1:A) para impressora térmica.
16. **Instrução de teste de continuidade** – a partir da netlist, gerar a tabela ponto-a-ponto e de isolação para testador de chicotes (ou script para o LabTester/SCPI).

## Roteiro de teste manual (aceitação)

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Iniciar `iniciar_servidor_python.bat`, abrir no Edge de outro PC | Interface carrega, rodapé mostra "🟢 servidor" |
| 2 | Catálogo: buscar `38999 13-35`, posicionar; buscar `DT 4`, apertar X e posicionar | J1 com 22 pinos, X1 espelhado (pinos à esquerda) |
| 3 | W: ligar J1:1→X1:1 com um canto | Fio W1 verde ortogonal; tabela De-Para mostra J1:1 → X1:1 |
| 4 | Arrastar X1 com o mouse | Fio acompanha, segmentos continuam H/V |
| 5 | Alt+arrastar X1 | Fio fica para trás; ERC acusa "ponta solta" |
| 6 | Ctrl+Z | Volta ao estado ligado |
| 7 | Selecionar X1 e apertar R quatro vezes; X; Y | Ligações preservadas em todas as posições |
| 8 | Fio de J1:3 terminando no meio de W1 | Emenda SP1 criada, W1 dividido em dois fios |
| 9 | Selecionar W1, arrastar o segmento do meio | Só aquele trecho se move; pontas continuam nos pinos |
| 10 | Bloquear X1 (Ctrl+L) e tentar arrastar | Não se move |
| 11 | Selecionar 3 conectores por caixa e "Alinhar à esquerda" / "Distribuir V" | Alinhados, fios acompanham |
| 12 | Trocar a grade para 1,27 e depois 2,5; desligar snap | Grade redesenha; com snap desligado o cursor fica livre |
| 13 | Fio 20 AWG em contato #22D (38999 x-35) e F2 | ERC: "bitola incompatível com contato #22D (22-28 AWG)" |
| 14 | Dois pinos com sinais +28V e GND ligados | ERC: "possível curto" |
| 15 | Label VCC na folha 1 e na folha 2 | Aba Circuitos mostra VCC com pinos das duas folhas |
| 16 | Cabo (C) sobre 2 fios | Coluna "Cabo" = CB1 nos dois fios |
| 17 | Exportar PDF A3 ISO, depois A4 com "Ajustar desenho" e P&B | PDF abre no leitor; folhas + De-Para + BOM + pinagem; carimbo com Folha x/y |
| 18 | Salvar no servidor em dois navegadores e salvar de novo no primeiro | Aviso de conflito (outro usuário alterou) |
| 19 | Arquivo › Backups no servidor | Lista versões anteriores; duplo clique recupera |
| 20 | Fechar a aba sem salvar e reabrir | Oferece recuperar o rascunho automático |
| 21 | Abrir `abrir_modo_local.bat` (sem servidor) | Rodapé "🟠 local"; Salvar baixa .json, Importar abre |
| 22 | Abrir `tests\testes.html` | 214 testes passam |

## Pontos a validar com a engenharia
* Confirmar PNs gerados (D38999, MS31xx, Deutsch, Molex) e faixas de bitola dos contatos com os datasheets usados na empresa.
* Definir o template oficial do carimbo (campos, logo) — o template ISO/ANSI pode ser ajustado em `web/js/template.js`.
* Padronizar prefixos (W para fio, SP para emenda, J/P/X para conectores) e regras de numeração.
