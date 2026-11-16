set -e
D=${1:-../HarnessCAD_4k}
mk(){ rm -rf /tmp/t && mkdir /tmp/t && cp "$D"/* /tmp/t; }
run(){ echo | python3 /tmp/t/montar.py "$@" | grep -E "OK|ERRO|Extraido|Nenhuma" ; }
mk; echo "== nomes padrão (.p001.txt)"; run
mk; echo "== sem .txt (renomeado)"; cd /tmp/t; for f in *.txt; do [ "$f" = LEIA-ME.txt ] || mv "$f" "${f%.txt}"; done; cd - >/dev/null; run
mk; echo "== maiúsculas + _P"; cd /tmp/t; for f in HarnessCAD.zip.p*; do mv "$f" "$(echo $f | sed 's/\.zip\.p/.zip_P/; s/\.txt$/.TXT/')"; done; cd - >/dev/null; run
mk; echo "== arrastando uma parte para o montar"; run /tmp/t/HarnessCAD.zip.p005.txt
mk; echo "== montar em outra pasta"; mv /tmp/t/montar.py /tmp/montar.py; echo | python3 /tmp/montar.py /tmp/t | grep -E "OK|ERRO|Extraido"
mk; echo "== sem .sha256"; rm /tmp/t/*.sha256*; run
mk; echo "== parte faltando"; rm /tmp/t/HarnessCAD.zip.p009.txt; run || true
mk; echo "== parte truncada"; truncate -s 2000 /tmp/t/HarnessCAD.zip.p030.txt; run || true
mk; echo "== pasta vazia"; rm /tmp/t/HarnessCAD.zip.p*; echo | python3 /tmp/t/montar.py | head -4
mk; echo "== sem o .sha256-2 (só a 1a parte da lista de hashes)"; rm -f /tmp/t/*.sha256-2*; run || true
mk; echo "== montar.py e .sha256 cabem em 3.900 bytes"; for f in /tmp/t/*; do [ $(wc -c < "$f") -le 3900 ] || echo "GRANDE: $f"; done
