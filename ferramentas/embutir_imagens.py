# -*- coding: utf-8 -*-
"""Embute as imagens (web/img/**/*.png) em arquivos .js para o MODO LOCAL (index.html aberto direto, sem servidor).
Sem isso o navegador bloqueia a leitura dos pixels de arquivos locais e o PDF sai sem as imagens dos conectores.
Gera web/js/imgpack/lista.js + web/js/imgpack/pNNN.js (cada um < 10 KB). Roda sozinho pelo abrir_modo_local.bat.
Uso: python embutir_imagens.py   (Python 3.8+, só biblioteca padrão)"""
import base64
import os
import sys

LIM = 9000


def main():
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    web = os.path.join(raiz, "web")
    img = os.path.join(web, "img")
    out = os.path.join(web, "js", "imgpack")
    os.makedirs(out, exist_ok=True)
    pecas = []
    for base, dirs, files in os.walk(img):
        dirs.sort()
        for f in sorted(files):
            if not f.lower().endswith(".png"):
                continue
            caminho = os.path.join(base, f)
            url = os.path.relpath(caminho, web).replace(os.sep, "/")
            with open(caminho, "rb") as fh:
                b64 = "data:image/png;base64," + base64.b64encode(fh.read()).decode("ascii")
            for i in range(0, len(b64), LIM - 200):
                pecas.append((url, b64[i:i + LIM - 200]))
    if not pecas:
        print("Nenhum PNG em web/img: mantido o web/js/imgpack que veio no pacote.")
        return 0
    for f in os.listdir(out):
        if f.endswith(".js"):
            os.remove(os.path.join(out, f))
    arquivos, atual, tam = [], [], 0
    def fecha():
        if not atual:
            return
        nome = "p%03d.js" % (len(arquivos) + 1)
        corpo = "var H=window.HX_IMG=window.HX_IMG||{};\n" + "".join(
            "H['%s']=(H['%s']||'')+'%s';\n" % (u, u, s) for u, s in atual)
        with open(os.path.join(out, nome), "w", encoding="ascii", newline="\n") as fh:
            fh.write(corpo)
        arquivos.append(nome)
    for u, s in pecas:
        linha = len(s) + 2 * len(u) + 30
        if atual and tam + linha > LIM:
            fecha()
            atual, tam = [], 0
        atual.append((u, s))
        tam += linha
    fecha()
    with open(os.path.join(out, "lista.js"), "w", encoding="ascii", newline="\n") as fh:
        fh.write("window.HX_IMGPACK=" + repr(arquivos).replace("'", '"') + ";\n")
    print("Imagens embutidas: %d arquivo(s) em web/js/imgpack (modo local com imagens no PDF)." % len(arquivos))
    return 0


if __name__ == "__main__":
    sys.exit(main())
