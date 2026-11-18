# Interface — novidades (continuação de `INTERFACE2.md`)

## v1.8.7 — atualização automática
* Ao abrir pelo atalho, o **HarnessCAD.exe procura uma versão mais nova** e, se achar, pergunta "Atualizar agora?". Com
  **Sim**, instala na mesma pasta em silêncio, mantém a pasta `dados` (projetos e biblioteca) e reabre o programa.
* **Onde procura** (sem internet também funciona): um `Setup_HarnessCAD*.exe` mais novo em `Downloads`, na Área de
  Trabalho, em `Área de Trabalho\GERAL` e nas pastas listadas em `dados\atualizar.txt` (uma por linha — ex.: a pasta da
  rede `\\servidor\publico\HarnessCAD` ou o pendrive). Basta copiar o Setup novo para lá; cada PC se atualiza ao abrir.
* **Com internet**: uma vez por dia confere a versão no GitHub (no máximo 5 s; sem rede, segue normal) e baixa o
  instalador de `atualizacao/Setup_HarnessCAD.exe`.
* Opções em `dados\atualizar.txt`: `perguntar=0` (atualiza sem perguntar), `internet=0` (só pastas locais/rede).
  `HarnessCAD.exe /n` abre sem procurar.
* Esta é a última vez que é preciso rodar o Setup à mão: a partir da 1.8.7 as próximas versões chegam sozinhas.
