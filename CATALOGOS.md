# HarnessCAD — catálogos

* **Militar**: MIL-DTL-38999 Série III (ver abaixo), MIL-DTL-5015 (MS3106/3108/3102…), MIL-DTL-26482 (MS3116…), MIL-DTL-24308 D-Sub (padrão e HD), MIL-DTL-83513 Micro-D, terminais.
* **Comercial/industrial/automotivo**: Molex Micro-Fit 3.0 e Mini-Fit Jr., JST XH/PH/VH, Deutsch DT/DTM/DTP, TE Superseal, D-Sub, M12 (A/B/D), M8, RJ45 T568A/B, RJ11/12, USB, XLR/P10, barra de pinos, IDC, bornes, terminais, RF (BNC, SMA, N, TNC…).
* **Ampliado** (`cat_com2.js`): MIL-DTL-26482 Série II MS3476/3470/3474 (11 arranjos), Harting Han 3A…24E, M16, M23, 7/8", M12 X-code, DIN 41612 (32/64/96), Phoenix MSTB, Amphenol AT, OBD-II J1962 e J1939 9p (com nomes dos sinais), Anderson Powerpole, XT30/60/90, jack DC, IEC C13/C14, NBR 14136, NEMA 5-15, RCA, P2, Speakon NL4, HDMI, DisplayPort, Molex PicoBlade e KK 254, JST SH/GH/ZH/EH/PA.
* **Fios**: M22759/16, /32, /34, /11, M16878/4, M27500, UL1007/1015/1569/1061, SAE GXL/TXL, FLRY-B, H05V-K, H07V-K, silicone, LiYY, LiYCY, par trançado 120 Ω, coaxiais RG-58/316/174/178/59/142. Tabelas AWG e mm² (IEC 60228) com Ø, área, Ω/km e corrente indicativa. Cores IEC 60757 com listra; PN MIL com código de cor MIL-STD-681 (`M22759/16-22-92`).
* **Conector personalizado** (+ Novo): nome, PN, vias, lado dos pinos, pinagem colada do Excel; fica na biblioteca compartilhada do servidor.

> PNs são montados pelo padrão de codificação de cada família. **Confirme arranjo, contato e PN no datasheet antes de comprar.** Correntes da tabela são indicativas (dimensione por AS50881 / NBR 5410 / fabricante).

* **Equipamentos/acessórios** (desenho realista genérico): fontes de bancada 1 e 2 canais, fonte AC/DC chaveada, osciloscópios 2/4 canais e portátil, analisador de espectro, multímetro portátil e de bancada, alicate amperímetro, geradores de funções (1 e 2 canais), carga eletrônica, estação de solda, módulo DAQ USB, conversores USB-RS232/RS485/TTL/CAN, conversor USB-RS422/485 isolado com borne de 5 vias, notebook, desktop, monitor, impressora, switch 8 portas, roteador Wi-Fi, patch panel 12 portas, bateria, tomada AC, ponta de prova, pinos banana 4 mm, bornes banana de painel, garras jacaré.

## MIL-DTL-38999 Série III (catálogos Glenair e Amphenol)
* **53 arranjos IAW MIL-STD-1560** (9-35 a 25-61) com quantidade e **tamanho de cada contato** (22D, 20, 16, 12) conforme a tabela "Insert Arrangements" (Glenair pág. D-4).
* **Vista frontal = recorte do catálogo**, pixel a pixel, sem redesenho: os 53 arranjos (`web/img/face/D38999/*.png`). 50 vêm do catálogo Amphenol (págs. 7–12, "Front face of pin inserts illustrated") e 3 da Glenair (19-45, 21-24, 23-36; págs. B-2/B-3, onde a página não indica a face). A legenda no desenho cita fonte e página.
* **Modelos**: /20 receptáculo flange, /24 porca (jam nut), /26 plugue reto, /21 caixa, /23 porca, /25 solda e /27 weld (herméticos).
* **Acabamento / classe** (W, Z, F, G, C, T, J, M, K, S, L, N, Y), **tipo de contato** (P/S 500 ciclos, H/J 1500 ciclos, A/B sem contatos, X ilhós) e **chave** (N, A–E) em Propriedades; o PN militar é montado: `D38999/20ZD97HB`.
* **Bitolas aceitas** (MIL-DTL-38999 §3.4.3.1): #22D 22–28 AWG · #20 20–24 · #16 16–20 · #12 12–14 · #10 10–12. Bitola fora da faixa do contato (qualquer conector com contatos no catálogo, ex. MIL-DTL-5015 #16 = 16–20 AWG): o fio fica **vermelho tracejado no desenho** com o aviso junto do pino, as Propriedades do fio mostram a faixa de cada contato e o alerta, e o ERC registra o erro (fios métricos pela equivalência da IEC 60228). Contatos M39029/58 (pino) e /56 (soquete).
* Dados de referência dos catálogos — confira sempre a revisão vigente do fabricante.

## Imagens da vista frontal (datasheet)

A vista frontal mostra só a imagem do datasheet, sem nenhuma marcação por cima e sem espelhar. Ao lado fica a tabela de pinagem.
Para cadastrar outro conector: **Biblioteca › selecione o conector › Imagem do datasheet…**. Recorte a vista no PDF (Ferramenta de Captura do Windows), clique na caixa e cole com **Ctrl+V**, ou abra um PNG/JPEG. Pode haver uma imagem para a face de pinos e outra para a de soquetes. A imagem é guardada como veio, sem recompressão, na biblioteca compartilhada do servidor (chave `USR:FACE:<part>`), e tem prioridade sobre a oficial. No PDF os pixels entram sem alteração.
