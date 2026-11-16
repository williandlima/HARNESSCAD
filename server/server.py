#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""HarnessCAD - servidor de intranet (Python 3.8+, somente biblioteca padrão).

Uso:  python server.py --port 8080 --data D:\\HarnessCAD\\dados [--admins "joao,maria,10.0.0.5"]
--admins: quem pode EXCLUIR projetos/itens da biblioteca (nome informado no programa ou IP).
Vazio = todos podem. Controle simples para evitar acidentes, não substitui login do domínio.
"""
import argparse
import json
import mimetypes
import os
import sys
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse

from store import Conflict, Store, safe_key, safe_name

VERSION = "1.1.0"
MAX_BODY = 30 * 1024 * 1024
CFG = {"web": "", "store": None, "admins": set()}


class HttpError(Exception):
    def __init__(self, code, msg):
        Exception.__init__(self, msg)
        self.code = code


class Handler(BaseHTTPRequestHandler):
    server_version = "HarnessCAD/" + VERSION

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s %s - %s\n" % (time.strftime("%H:%M:%S"), self.client_address[0], self.user(), fmt % args))

    def user(self):
        return unquote(self.headers.get("X-User") or "")[:40]

    def is_admin(self):
        a = CFG["admins"]
        return not a or self.user().lower() in a or self.client_address[0] in a

    def send_json(self, obj, code=200):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def read_json(self):
        n = int(self.headers.get("Content-Length") or 0)
        if n <= 0 or n > MAX_BODY:
            raise HttpError(400, "Tamanho do corpo inválido")
        raw = self.rfile.read(n)
        try:
            obj = json.loads(raw.decode("utf-8"))
        except ValueError:
            raise HttpError(400, "JSON inválido")
        if not isinstance(obj, dict):
            raise HttpError(400, "Esperado um objeto JSON")
        return raw

    def dispatch(self, method):
        try:
            path = urlparse(self.path).path
            if not path.startswith("/api/"):
                if method != "GET":
                    raise HttpError(405, "Método não permitido")
                return self.static(path)
            parts = path[5:].split("/", 1)
            what, arg = parts[0], unquote(parts[1]) if len(parts) > 1 else ""
            fn = getattr(self, "%s_%s" % (method.lower(), what), None)
            if not fn:
                raise HttpError(404, "Rota desconhecida")
            fn(arg)
        except HttpError as e:
            self.send_json({"error": str(e)}, e.code)
        except Exception as e:  # noqa: BLE001 - qualquer falha vira resposta 500 legível
            self.log_message("ERRO %r", e)
            try:
                self.send_json({"error": "Erro interno: %s" % e}, 500)
            except OSError:
                pass

    def do_GET(self):
        self.dispatch("GET")

    def do_PUT(self):
        self.dispatch("PUT")

    def do_DELETE(self):
        self.dispatch("DELETE")

    # ---------------- rotas ----------------
    def name_of(self, arg):
        n = safe_name(arg)
        if not n:
            raise HttpError(400, "Nome inválido (use letras, números, espaço, - _ .)")
        return n

    def get_ping(self, arg):
        self.send_json({"app": "HarnessCAD", "version": VERSION, "server": "python", "time": time.time(),
                        "user": self.user(), "ip": self.client_address[0], "admin": self.is_admin()})

    def get_projects(self, arg):
        st = CFG["store"]
        if not arg:
            return self.send_json(st.list_projects())
        backup = arg.startswith(".bak/")
        r = st.load_project(self.name_of(arg[5:] if backup else arg), backup)
        if r is None:
            raise HttpError(404, "Projeto não encontrado")
        self.send_json({"project": r[0], "mtime": r[1], "name": arg})

    def put_projects(self, arg):
        name, raw = self.name_of(arg), self.read_json()
        base = self.headers.get("X-Base-Mtime")
        try:
            base = float(base) if base else None
        except ValueError:
            raise HttpError(400, "Cabeçalho X-Base-Mtime inválido")
        try:
            mt = CFG["store"].save_project(name, raw, base, self.user(), self.client_address[0])
        except Conflict:
            raise HttpError(409, "Arquivo alterado por outro usuário")
        self.send_json({"ok": True, "mtime": mt, "name": name})

    def delete_projects(self, arg):
        if not self.is_admin():
            raise HttpError(403, "Sem permissão para excluir (peça a um administrador)")
        if not CFG["store"].delete_project(self.name_of(arg)):
            raise HttpError(404, "Projeto não encontrado")
        self.send_json({"ok": True})

    def get_backups(self, arg):
        self.send_json(CFG["store"].list_backups(self.name_of(arg)))

    def get_library(self, arg):
        self.send_json(CFG["store"].library())

    def put_library(self, arg):
        key = safe_key(arg)
        if not key:
            raise HttpError(400, "Chave inválida (deve começar com USR: e ter até 120 caracteres)")
        CFG["store"].save_lib(key, self.read_json())
        self.send_json({"ok": True, "key": key})

    def delete_library(self, arg):
        if not self.is_admin():
            raise HttpError(403, "Sem permissão para excluir")
        key = safe_key(arg)
        if not key or not CFG["store"].delete_lib(key):
            raise HttpError(404, "Item não encontrado")
        self.send_json({"ok": True})

    def static(self, path):
        path = unquote(path)
        if path.endswith("/"):
            path += "index.html"
        root = os.path.realpath(CFG["web"])
        full = os.path.realpath(os.path.join(root, path.lstrip("/")))
        if not (full == root or full.startswith(root + os.sep)) or not os.path.isfile(full):
            raise HttpError(404, "Não encontrado")
        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype.endswith("javascript"):
            ctype += "; charset=utf-8"
        with open(full, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(data)


def make_server(host, port, web, data, admins=""):
    CFG["web"] = web
    CFG["store"] = Store(data)
    CFG["admins"] = set(a.strip().lower() for a in admins.split(",") if a.strip())
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")
    return ThreadingHTTPServer((host, port), Handler)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description="Servidor HarnessCAD")
    ap.add_argument("--host", default="0.0.0.0")
    ap.add_argument("--port", type=int, default=8080)
    ap.add_argument("--web", default=os.path.join(here, "..", "web"))
    ap.add_argument("--data", default=os.path.join(here, "..", "dados"))
    ap.add_argument("--admins", default="", help="usuários/IPs que podem excluir, separados por vírgula")
    a = ap.parse_args()
    srv = make_server(a.host, a.port, os.path.abspath(a.web), os.path.abspath(a.data), a.admins)
    print("HarnessCAD %s em http://%s:%d  (dados: %s, admins: %s)" % (
        VERSION, a.host, a.port, os.path.abspath(a.data), ", ".join(sorted(CFG["admins"])) or "todos"))
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("Encerrado.")


if __name__ == "__main__":
    main()
