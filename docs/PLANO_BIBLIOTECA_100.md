# Plano — biblioteca 100% completa (tudo, não só conectores)

Situação medida na v1.8.0 (nov/2026). Regra que vale para tudo: **só entra como "completo" o que veio de datasheet
oficial** (fonte, página); sem datasheet = "aguardando" e pede-se o documento.

## O que é "100%" — ficha completa por tipo
| Biblioteca | Ficha completa (critério de pronto) |
|---|---|
| Conectores | vista lateral com cotas por carcaça · vista frontal de cada arranjo com numeração · PN montado pelo construtor · fonte |
| Contatos / tampões / ferramentas | PN do contato por tamanho e faixa de bitola (pino e soquete) · tampão de vedação · alicate e posicionador · fonte |
| Fios e cabos | norma · Ø externo por bitola · peso (g/m) · cores · tensão e temperatura · construtor de PN · fonte |
| Emendas e terminais | PN por faixa de bitola · Ø/comprimento · ferramenta · fonte |
| Itens da cablagem (10 alças) | PN real · fabricante · medidas do datasheet · desenho (se aparece no traço) · fonte |
| Peças desenhadas (adaptador, bota, transição) | traço do datasheet (não "aguardando") · cotas por tamanho |

## Onde estamos
| Biblioteca | Total | Completo | % |
|---|---|---|---|
| Conectores (51 famílias) | 531 peças | 120 (D38999, D-Sub ×4, M80, MS3476 plugue) | 23% |
| Vistas frontais | 531 | D38999 53 + D-Sub 38 + M80 18 = 109 | 21% |
| Contatos / tampões | 51 famílias | 13 com fonte oficial | 25% |
| Fios e cabos | 25 tipos | 0 com fonte registrada | 0% |
| Emendas | 6 tipos | 0 (genéricas) | 0% |
| Itens: Adaptadores / Botas / Transições | 90 | PN 100%; traço só Pre-Shield; 202K aproximada | ~60% |
| Itens: Luvas, Espaguetes, Amarração | 58 | PN de memória (sem PDF conferido) | ~0% validado |
| Itens: Cordoalhas, Capas, Kits, Etiquetas | 61 | sem PN (genéricos) | 0% |

## Passo a passo
Cada passo: **Você manda** → **Eu entrego** → **Pronto quando**.

### Passo 0 — Medidor de cobertura (eu, sem depender de nada)
Eu entrego: relatório "Cobertura da biblioteca" no programa (Relatórios): % por biblioteca/família e a lista do que
falta, já com **qual datasheet pedir**. Teste automático que impede item "completo" sem fonte.
Pronto quando: os números desta tabela saem do próprio programa.

### Passo 1 — Prioridade (você)
Você manda: os **15–20 PNs / famílias mais usados** na empresa e as famílias que **nunca** usam.
Eu entrego: lotes A (usados), B (raros) e C (retirar do catálogo). Retirar o que ninguém usa também é chegar a 100%.

### Passo 2 — Fechar com os PDFs que já temos (eu)
Amphenol Backshells M85049, Matrix 26482 série 2, TE 202K, Milnec MS3476:
traço dos 6 adaptadores (/60-1, /69, /26, /20, /82, /88) · perfil exato da bota 202K · receptáculos MS3470/3471/3474 ·
contatos e tampões do MS3476 · vistas frontais MS3476 (se a página de arranjos tiver as figuras).
Pronto quando: Adaptadores e MS3476 a 100% no medidor.

### Passo 3 — MIL restantes (você manda, eu faço)
| Família | Datasheet a mandar |
|---|---|
| MS26482 série 1 (MS3110/3111/3116) | catálogo Amphenol PT / MIL-DTL-26482 série 1: desenhos e arranjos de inserto |
| MS5015 (MS3100/3101/3102/3106/3108) | catálogo Amphenol 97 / ITT Cannon MS: desenhos e arranjos |
| Micro-D M83513 | catálogo Glenair ou ITT Micro-D: desenho por tamanho e numeração |
| MILTERM | norma/catálogo do terminal (MS25036 / M7928, conforme o usado) |
| D38999 extras | só se usarem outros arranjos/estilos além dos 53 já vetorizados |
Pronto quando: lote A MIL a 100%.

### Passo 4 — Comerciais do lote A (você manda, eu faço)
Desenho do fabricante (vista de cima e frontal) e tabela de terminais. Prováveis: TE Deutsch DT/DTM/DTP, Molex
Micro-Fit/Mini-Fit, M8/M12, TE Superseal. Pronto quando: lote A comercial a 100%.

### Passo 5 — Contatos, tampões e ferramentas (você manda, eu faço)
Guia de contatos de cada família do lote A/B (as 13 que já têm fonte ficam; faltam as outras).
Pronto quando: todo conector do lote A/B sai com contato, tampão e ferramenta com fonte na lista de materiais.

### Passo 6 — Fios e cabos (você manda, eu faço)
Folhas das normas usadas: M22759 (slash sheets /11, /16, /32, /34), M27500, M16878, UL (1007/1015/1061/1569), SAE
GXL/TXL, coaxiais RG. Retirar os tipos que a empresa não usa. Pronto quando: cada tipo com Ø e peso por bitola e fonte.

### Passo 7 — Emendas e terminais (você manda, eu faço)
Emendas usadas (ex.: M81824 crimp, luvas de emenda solda) e terminais olhal/forquilha. Pronto quando: PN por bitola com fonte.

### Passo 8 — Itens da cablagem (você manda, eu faço)
* **Validar o que está de memória**: PDFs TE RNF-100 e DR-25, MS21919, M83519/2 (faixa de Ø e PN completo com cor).
* **Trocar genéricos por PN real**: os PNs que a empresa compra de cordoalha, capas D-Sub, tampas protetoras, kits de
  retenção, abraçadeiras e etiquetas (lista de compras ou almoxarifado já serve).
* **Desenhos**: bota 222K (PDF TE), transição em T / 4 vias (dados pendentes), luva de solda no traço.
Pronto quando: as 10 alças a 100% no medidor.

### Passo 9 — Governança (eu)
Item "rascunho" × "validado" (só admin valida, com fonte obrigatória) · PN único (avisa duplicado) · exportar/importar a
biblioteca em arquivo (rede offline ↔ PC de casa) · histórico (quem criou/validou).
Pronto quando: item novo não entra como validado sem fonte e sem PN único.

### Passo 10 — Fechamento (nós dois)
Medidor a 100% nos lotes A e B · testes automáticos passando · revisão por amostragem: você confere 10 peças sorteadas
contra o datasheet · um chicote real feito do início ao fim só com itens validados.

## Ordem e dependências
0 e 2 começam já (não dependem de você). 1 destrava 3, 4, 5, 6 e 7. 8 roda em paralelo. 9 antes de abrir a biblioteca para
outros usuários. 10 por último.
