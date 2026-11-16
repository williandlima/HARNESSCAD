# D-Sub para cabo (Amphenol "D-Sub Cable Connectors") — v1.6.6

Só conectores **de cabo** do datasheet (DIN 41652 / MIL-C-24308). Na biblioteca:

* **D-Sub p/ cabo (Amphenol)** — DE-9, DA-15, DB-25, DC-37, DD-50.
  * Série **D** (caçapa de solda): PN `D` + carcaça + nº + P/S + `064T` + `X` (só macho) + `LF` → ex. `DE09P064TXLF`.
  * Série **8656** (crimp removível): PN `8656` + nº + P/S + `LT` + `X` + `LF` → ex. `865615PLTXLF`. Contatos: AWG 20/24 `865635206` (pino) / `865635306` (soquete); AWG 24/28 `865635006` / `865635106`.
* **D-Sub misto/potência p/ cabo (Amphenol)** — os 17 leiautes da página *Layouts*: 5W1, 11W1, 7W2, 3W3, 3V3, 21W1, 17W2, 13W3, 9W4, 5W5, 25W3, 21WA4, 27W2, 8W8, 47W1, 24W7, 36W4. PN `D` + carcaça + leiaute + P/S + `A00LF` (ex. `DB13W3PA00LF`). Contatos grandes = A1, A2… (potência 8638 / coaxiais).

A fixação (L = inserto M3, O = inserto UNC 4-40, V = parafuso fêmea sextavado) é escolhida no nó do desenho físico.

## Desenho (modo "desenho técnico" do conector)
* **Vista lateral** como as figuras *Specific dimensions*: face de encaixe com cantos arredondados, flange (com olhais), corpo traseiro com degrau do isolador e:
  * solda: caçapas (2,50) da fileira da frente, cota **7,75 máx**;
  * crimp 8656: corpo até a cota **A máx** (pino 17,19/17,35 — soquete 17,44);
  * misto/potência: contatos até **15,70 máx** (solda com a caçapa chanfrada; crimp com a presilha hachurada).
  * Linhas de centro nos furos, no eixo e em cada contato de potência.
* **Vista frontal** como *Layouts — male insulator front view*: D com cantos arredondados, pontos cheios (macho) ou vazados (soquete, espelhado), contatos grandes A1…, numeração acima da 1ª fileira e abaixo das demais; flange com furos Ø3,10.
* Terminação no nó: *Pelo catálogo* (8656 = crimp; série D = solda), *Solda* ou *Crimpagem*.
* Os conectores sem capa e com capa saem na **mesma escala** (pela largura do flange). Sem cotas na cablagem — veja "Medidas do conector só para consulta".

## Ligação fio × conector (v1.6.7)
* Sem capa (contatos expostos), cada fio vai ao **seu contato** (pino do esquemático): condutor decapado na caçapa com filete de solda, ~0,6 mm de cobre aparente, isolação na cor do fio e **luva termo-retrátil** sobre a caçapa (campo `dsSleeve = off` tira). Na série 8656 (crimp) a isolação entra direto na cavidade do corpo; nos contatos de potência o fio entra no contato grande.
* A fileira de trás também aparece (caçapas entre as da frente). Os fios saem paralelos e fazem curva suave até o feixe: **com capa** ordenados pela posição do contato (sem cruzar); **sem capa** os fios soltos já seguem a ordem da fileira.
* Soquete é espelho do pino: num cabo 1:1 macho × fêmea o feixe não torce.
* A cota de comprimento continua medindo até a traseira do conector (pontas dos contatos).

## Medidas do conector só para consulta
O desenho da cablagem **não leva cotas do conector**. Para ver as medidas do datasheet: selecione o conector › **Consultar medidas do conector (datasheet)…** (ou botão direito no conector). Abre uma janela com as vistas cotadas (D-Sub: lateral e frontal) e a tabela de medidas.
