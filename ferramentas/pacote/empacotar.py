# -*- coding: utf-8 -*-
"""Gera ../HarnessCAD.zip a partir da raiz do repositório (Python 3.8+, só biblioteca padrão).
Fica fora do pacote: pastas ocultas (.git, .claude...), __pycache__, os PNG de web/img (já vão em web/js/imgpack)
e os dados do usuário em dados/ (projetos, biblioteca, backups) - só a pasta vazia com o .gitkeep vai junto,
para a instalação no destino nunca sobrescrever os dados de lá."""
import os
import zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(os.path.join(AQUI, "..", ".."))
SAIDA = os.path.join(RAIZ, "..", "HarnessCAD.zip")
PULAR_PASTAS = {"__pycache__", "node_modules"}
PULAR_EXT = (".pyc", ".lib", ".o", ".tmp")
SAIDAS = {"HarnessCAD.zip", "Setup_HarnessCAD.exe"}  # resultados de empacotamento (caso caiam na raiz)


def main():
    with open(os.path.join(AQUI, "LEIA_img.txt"), "rb") as f:
        leia = f.read()
    with zipfile.ZipFile(SAIDA, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for root, dirs, files in os.walk(RAIZ):
            dirs[:] = sorted(d for d in dirs if d not in PULAR_PASTAS and not d.startswith("."))
            rel = os.path.relpath(root, RAIZ).replace(os.sep, "/")
            arc = "HarnessCAD" if rel == "." else "HarnessCAD/" + rel
            if rel == ".":  # pasta de partes gerada pelo dividir.py, se estiver dentro do repositório
                dirs[:] = [d for d in dirs if d != "HarnessCAD_4k"]
            z.write(root, arc + "/")
            if rel == "web/img":
                dirs[:] = []
                z.writestr(arc + "/LEIA-ME.txt", leia)
                continue
            if rel == "dados" or rel.startswith("dados/"):
                dirs[:] = []
                if rel == "dados" and ".gitkeep" in files:
                    z.write(os.path.join(root, ".gitkeep"), arc + "/.gitkeep")
                continue
            for f in sorted(files):
                if f.endswith(PULAR_EXT) or (rel == "." and (f in SAIDAS or f.startswith("HarnessCAD_lote"))):
                    continue
                z.write(os.path.join(root, f), arc + "/" + f)
    with zipfile.ZipFile(SAIDA) as z:
        n = len(z.namelist())
    print("%s: %d bytes, %d entradas" % (os.path.normpath(SAIDA), os.path.getsize(SAIDA), n))


if __name__ == "__main__":
    main()
