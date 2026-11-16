# -*- coding: utf-8 -*-
"""HarnessCAD - armazenamento em pasta: projetos, backups, quem salvou, biblioteca compartilhada.

Estrutura (igual à do servidor Java):
  dados/projects/<nome>.json        projeto
  dados/projects/.bak/<nome>__<data>.json   backups (30 por projeto)
  dados/projects/.info/<nome>.json  {"user","ip","time"} do último salvamento
  dados/library/<sha1>.lib          1ª linha = chave, resto = JSON do conector (um arquivo por item)
"""
import hashlib
import json
import os
import re
import shutil
import threading
import time

NAME_RE = re.compile(r"^[\w\-. ]{1,80}$")
# nomes de dispositivo do Windows: "con.json", "nul.json"... não são arquivos
RESERVED = {"CON", "PRN", "AUX", "NUL"} | {"COM%d" % i for i in range(1, 10)} | {"LPT%d" % i for i in range(1, 10)}
STAMP = r"__\d{8}-\d{6}\.json$"
KEY_MAX = 120
KEEP_BACKUPS = 30
LOCK = threading.Lock()


class Conflict(Exception):
    pass


class Exists(Conflict):
    """Projeto novo (Salvar como) com nome que já existe no servidor."""


def safe_name(name):
    name = (name or "").strip()
    if name.lower().endswith(".json"):
        name = name[:-5]
    if not NAME_RE.match(name) or name.startswith(".") or name.endswith("."):
        return None
    if name.split(".")[0].strip().upper() in RESERVED:
        return None
    return name


def is_backup_of(name, f):
    """Backup deste projeto (nome__AAAAMMDD-HHMMSS.json), e não de outro cujo nome começa igual (ex.: nome__v2)."""
    return re.match(re.escape(name) + STAMP, f) is not None


def safe_key(key):
    key = (key or "").strip()
    if not key.startswith("USR:") or len(key) > KEY_MAX or "\n" in key or "\r" in key:
        return None
    return key


def write_atomic(path, data):
    tmp = path + ".tmp"
    with open(tmp, "wb") as f:
        f.write(data)
    os.replace(tmp, path)


class Store:
    def __init__(self, data):
        self.data = data
        self.proj = os.path.join(data, "projects")
        self.bak = os.path.join(self.proj, ".bak")
        self.info = os.path.join(self.proj, ".info")
        self.lib = os.path.join(data, "library")
        for d in (self.proj, self.bak, self.info, self.lib):
            os.makedirs(d, exist_ok=True)

    # ---------- projetos ----------
    def path(self, name, backup=False):
        return os.path.join(self.bak if backup else self.proj, name + ".json")

    def list_projects(self):
        out = []
        for f in os.listdir(self.proj):
            if not f.endswith(".json"):
                continue
            st = os.stat(os.path.join(self.proj, f))
            item = {"name": f[:-5], "mtime": st.st_mtime, "size": st.st_size}
            try:
                with open(os.path.join(self.info, f), "rb") as fi:
                    item["user"] = json.loads(fi.read().decode("utf-8")).get("user", "")
            except (OSError, ValueError):
                pass
            out.append(item)
        return out

    def load_project(self, name, backup=False):
        p = self.path(name, backup)
        if not os.path.exists(p):
            return None
        with open(p, "rb") as f:
            raw = f.read()
        try:
            proj = json.loads(raw.decode("utf-8"))
        except ValueError:
            raise ValueError("Arquivo do projeto corrompido no servidor (%s). Recupere um backup." % name)
        return proj, os.path.getmtime(p)

    def backup(self, name):
        src = self.path(name)
        if not os.path.exists(src):
            return
        stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime(os.path.getmtime(src)))
        shutil.copy2(src, os.path.join(self.bak, "%s__%s.json" % (name, stamp)))
        olds = sorted(f for f in os.listdir(self.bak) if is_backup_of(name, f))
        for f in olds[:-KEEP_BACKUPS]:
            try:
                os.remove(os.path.join(self.bak, f))
            except OSError:
                pass

    def save_project(self, name, raw, base, user, ip, new=False):
        p = self.path(name)
        with LOCK:
            if new and os.path.exists(p):
                raise Exists()
            if base is not None and os.path.exists(p) and abs(os.path.getmtime(p) - base) > 0.001:
                raise Conflict()
            self.backup(name)
            write_atomic(p, raw)
            info = {"user": user, "ip": ip, "time": time.time()}
            write_atomic(os.path.join(self.info, name + ".json"), json.dumps(info).encode("utf-8"))
            return os.path.getmtime(p)

    def delete_project(self, name):
        with LOCK:
            if not os.path.exists(self.path(name)):
                return False
            self.backup(name)
            os.remove(self.path(name))
            return True

    def list_backups(self, name):
        out = []
        for f in sorted(os.listdir(self.bak), reverse=True):
            if is_backup_of(name, f):
                out.append({"name": f[:-5], "mtime": os.path.getmtime(os.path.join(self.bak, f))})
        return out

    # ---------- biblioteca (um arquivo por conector) ----------
    def lib_path(self, key):
        return os.path.join(self.lib, hashlib.sha1(key.encode("utf-8")).hexdigest() + ".lib")

    def library(self):
        out = {}
        for f in os.listdir(self.lib):
            if not f.endswith(".lib"):
                continue
            try:
                with open(os.path.join(self.lib, f), "rb") as fh:
                    key, _, body = fh.read().decode("utf-8").partition("\n")
                out[key] = json.loads(body)
            except (OSError, ValueError):
                continue
        return out

    def save_lib(self, key, raw):
        with LOCK:
            write_atomic(self.lib_path(key), key.encode("utf-8") + b"\n" + raw)

    def delete_lib(self, key):
        with LOCK:
            p = self.lib_path(key)
            if os.path.exists(p):
                os.remove(p)
                return True
            return False
