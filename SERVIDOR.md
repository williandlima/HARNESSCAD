# HarnessCAD — servidor

`GET /api/ping` · `GET /api/projects` · `GET|PUT|DELETE /api/projects/<nome>` · `GET /api/backups/<nome>` · `GET /api/library` · `PUT|DELETE /api/library/<chave>` (um conector por vez, sem perda quando dois usuários gravam juntos).
Gravação atômica, 30 backups por projeto, detecção de conflito entre usuários (cabeçalho `X-Base-Mtime` → HTTP 409; `X-New: 1` no "Salvar como" → 409 se o nome já existe), proteção contra path traversal, erros sempre devolvidos como JSON legível, autosave local no navegador a cada 20 s (apagado ao salvar). Dados de bibliotecas e arquivos importados são validados antes de exibir.
Armazenamento: `dados/projects` (+ `.bak`, `.info`) e `dados/library/*.lib`. Python: `server.py` + `store.py`; Java: `HarnessServer.java` + `HarnessStore.java` + `JsonCheck.java` (validador de JSON, sem bibliotecas).

