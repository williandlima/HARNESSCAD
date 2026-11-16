# Padrão MS — cablagem militar (v1.6)

**Ferramentas › Aplicar padrão MS** (também na aba laranja *Desenho físico* e no painel da folha física). Aplica em um clique:

| Item | O que faz | Medidas |
|---|---|---|
| Conector MS (MIL-DTL-5015) | Desenho técnico: porca de acoplamento, corpo e rosca traseira (MS3106A/3108B; receptáculos 3101A e 3100A/3102A) | **típicas** do catálogo 97 — ajuste em *Comprimento/Ø do corpo* do nó |
| Adaptador reto + cordoalha | Porca, corpo, anel e rabicho de cordoalha trançada | **típicas** — falta o datasheet do adaptador |
| Bota Raychem | 202K (reta) ou 222K (90°) com lábio; tamanho escolhido pelo Ø do adaptador; PN `202K1xx-25-0` na lista | **datasheet TE** (Molded Parts Visual Reference Guide, p. 23) |
| Cordoalha | Camada interna em todos os ramos (campo *Camada interna* do ramo), metragem na lista | PN digitado no diálogo |
| Termorretrátil | Cobertura de todos os ramos (DR-25 por padrão) | — |
| Transição Raychem | Y moldado 382A em cada ramificação de 3 ramos; tamanho pelo Ø dos feixes (≤ 90% do fornecido); aviso de folga | **datasheet TE** (382A012…382A046: H, J, K, P, R) |
| Luva de solda | Emenda da cordoalha geral no rabicho do adaptador, a até 50 mm do conector | PN digitado no diálogo |

Ramificação com mais de 3 ramos: desenha a transição e pede o PN (*Transição › PN manual* no nó). Reaplicar não duplica as luvas de solda. Emendas de fios com luva de solda: tipo *Luva de solda (M83519)* na emenda do esquema.

## Formato da casa — modelo "Contorno" (v1.6.1)
Ao aplicar o padrão MS a folha passa para o modelo **Contorno — formato da casa** (painel da folha › *Modelo*), igual ao desenho de referência:
* conector em desenho técnico → bota **sombreada** → **espaguete em contorno contínuo** (sem fios soltos) → **transição sombreada** → ramos;
* **balões em cadeia** com o nº da lista de materiais: conector + adaptador/contatos, espaguete + cordoalha interna (ex. 5·16), transição, luva de solda;
* com balão, a luva de solda não mostra texto de chamada; bandeira de nota (△) e notas continuam pelas ferramentas de sempre.
Dá para voltar a *Traço* ou *Imagens* a qualquer momento pelo *Modelo* da folha.
