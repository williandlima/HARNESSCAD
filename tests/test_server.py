# -*- coding: utf-8 -*-
"""Testes do servidor HarnessCAD (somente biblioteca padrão).

python -m unittest tests/test_server.py   -> sobe o server.py numa porta livre (admins: "chefe")
Servidor externo (ex.: Java) iniciado com admins "chefe":
  HX_URL=http://localhost:8080 HX_DATA=<pasta dados> python -m unittest tests/test_server.py
"""
import json
import os
import shutil
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "server"))


def call(base, method, path, body=None, headers=None, user=None):
    data = json.dumps(body).encode("utf-8") if isinstance(body, (dict, list)) else body
    req = urllib.request.Request(base + path, data=data, method=method, headers=headers or {})
    req.add_header("Content-Type", "application/json")
    if user:
        req.add_header("X-User", urllib.parse.quote(user))
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            raw = r.read()
            ct = r.headers.get("Content-Type", "")
            return r.status, (json.loads(raw.decode("utf-8")) if "json" in ct else raw)
    except urllib.error.HTTPError as e:
        txt = e.read().decode("utf-8") or "{}"
        return e.code, json.loads(txt)


class ServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base = os.environ.get("HX_URL")
        cls.data = os.environ.get("HX_DATA")
        cls.srv = None
        if not cls.base:
            import server
            cls.data = tempfile.mkdtemp()
            cls.srv = server.make_server("127.0.0.1", 0, os.path.join(HERE, "..", "web"), cls.data, "chefe")
            threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
            cls.base = "http://127.0.0.1:%d" % cls.srv.server_address[1]
        cls.name = "teste_%d" % int(time.time() * 1000)

    @classmethod
    def tearDownClass(cls):
        if cls.srv:
            cls.srv.shutdown()
            shutil.rmtree(cls.data, ignore_errors=True)

    def test_01_ping_e_estaticos(self):
        st, d = call(self.base, "GET", "/api/ping", user="Zé")
        self.assertEqual(st, 200)
        self.assertEqual((d["app"], d["user"]), ("HarnessCAD", "Zé"))
        st, html = call(self.base, "GET", "/")
        self.assertEqual(st, 200)
        self.assertIn(b"HarnessCAD", html)

    def test_02_bloqueia_path_traversal(self):
        for p in ["/../server/server.py", "/%2e%2e/server/server.py", "/js/../../server/server.py"]:
            self.assertEqual(call(self.base, "GET", p)[0], 404, p)
        self.assertEqual(call(self.base, "PUT", "/api/projects/..%2Fx", {"a": 1})[0], 400)

    def test_03_crud_conflito_e_quem_salvou(self):
        proj = {"app": "HarnessCAD", "meta": {"title": "Ação"}, "sheets": []}
        st, r = call(self.base, "PUT", "/api/projects/" + self.name, proj, user="Maria")
        self.assertEqual(st, 200)
        m1 = r["mtime"]
        st, lst = call(self.base, "GET", "/api/projects")
        mine = [x for x in lst if x["name"] == self.name][0]
        self.assertEqual(mine["user"], "Maria")
        st, g = call(self.base, "GET", "/api/projects/" + self.name)
        self.assertEqual(g["project"]["meta"]["title"], "Ação")
        time.sleep(0.05)
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + self.name, proj, {"X-Base-Mtime": str(m1)})[0], 200)
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + self.name, proj, {"X-Base-Mtime": str(m1)})[0], 409)
        st, bk = call(self.base, "GET", "/api/backups/" + self.name)
        self.assertGreaterEqual(len(bk), 1)
        self.assertEqual(call(self.base, "GET", "/api/projects/.bak/" + bk[0]["name"])[0], 200)

    def test_04_cabecalho_mtime_invalido_vira_400(self):
        st, d = call(self.base, "PUT", "/api/projects/" + self.name + "_h", {"a": 1}, {"X-Base-Mtime": "abc"})
        self.assertEqual(st, 400)
        self.assertIn("X-Base-Mtime", d["error"])

    def test_05_json_invalido(self):
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + self.name + "x", b"nao e json")[0], 400)
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + self.name + "x", b"[1,2]")[0], 400)

    def test_06_projeto_corrompido_vira_500_legivel(self):
        if not self.data:
            self.skipTest("defina HX_DATA para servidor externo")
        with open(os.path.join(self.data, "projects", "corrompido.json"), "w") as f:
            f.write("{oops")
        st, d = call(self.base, "GET", "/api/projects/corrompido")
        self.assertEqual(st, 500)
        self.assertIn("corrompido", d["error"])

    def test_07_biblioteca_por_item_sem_perder_dados(self):
        # dois usuários gravando ao mesmo tempo: nenhum item se perde
        errs = []

        def put(i):
            st, _ = call(self.base, "PUT", "/api/library/" + urllib.parse.quote("USR:Conector %d" % i), {"key": "USR:Conector %d" % i, "n": 2, "pins": []})
            if st != 200:
                errs.append(st)
        ts = [threading.Thread(target=put, args=(i,)) for i in range(12)]
        [t.start() for t in ts]
        [t.join() for t in ts]
        self.assertEqual(errs, [])
        st, lib = call(self.base, "GET", "/api/library")
        self.assertTrue(all(("USR:Conector %d" % i) in lib for i in range(12)))
        self.assertEqual(call(self.base, "PUT", "/api/library/OUTRO", {"a": 1})[0], 400)
        self.assertEqual(call(self.base, "DELETE", "/api/library/" + urllib.parse.quote("USR:Conector 0"))[0], 403)
        self.assertEqual(call(self.base, "DELETE", "/api/library/" + urllib.parse.quote("USR:Conector 0"), user="chefe")[0], 200)
        st, lib = call(self.base, "GET", "/api/library")
        self.assertNotIn("USR:Conector 0", lib)

    def test_08_excluir_so_admin(self):
        call(self.base, "PUT", "/api/projects/" + self.name + "_d", {"a": 1})
        self.assertEqual(call(self.base, "DELETE", "/api/projects/" + self.name + "_d", user="estagiario")[0], 403)
        self.assertEqual(call(self.base, "DELETE", "/api/projects/" + self.name + "_d", user="Chefe")[0], 200)
        self.assertEqual(call(self.base, "GET", "/api/projects/" + self.name + "_d")[0], 404)

    def test_09_backups_nao_misturam_projetos_com_prefixo_igual(self):
        a, b = self.name + "_bk", self.name + "_bk__v2"
        for n in (a, b, a, b):
            self.assertEqual(call(self.base, "PUT", "/api/projects/" + n, {"n": n})[0], 200)
            time.sleep(1.05)  # carimbo do backup tem resolução de 1 s
        st, bka = call(self.base, "GET", "/api/backups/" + a)
        self.assertEqual(st, 200)
        self.assertEqual(len(bka), 1, bka)
        self.assertFalse(any("__v2" in x["name"] for x in bka), bka)
        st, bkb = call(self.base, "GET", "/api/backups/" + b)
        self.assertEqual(len(bkb), 1, bkb)

    def test_10_nomes_reservados_do_windows(self):
        for n in ["con", "NUL", "com1", "Lpt9.json", "aux.x", "prn ", "nome."]:
            self.assertEqual(call(self.base, "PUT", "/api/projects/" + urllib.parse.quote(n), {"a": 1})[0], 400, n)
        self.assertEqual(call(self.base, "PUT", "/api/projects/console_" + self.name, {"a": 1})[0], 200)

    def test_11_salvar_como_nao_sobrescreve_sem_confirmar(self):
        n = self.name + "_novo"
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + n, {"v": 1}, {"X-New": "1"})[0], 200)
        st, d = call(self.base, "PUT", "/api/projects/" + n, {"v": 2}, {"X-New": "1"})
        self.assertEqual(st, 409)
        self.assertIn("existe", d["error"])
        self.assertEqual(call(self.base, "GET", "/api/projects/" + n)[1]["project"]["v"], 1)
        self.assertEqual(call(self.base, "PUT", "/api/projects/" + n, {"v": 3})[0], 200)  # confirmado: sem X-New
        self.assertEqual(call(self.base, "GET", "/api/projects/" + n)[1]["project"]["v"], 3)

    def test_12_biblioteca_recusa_json_invalido(self):
        k = "/api/library/" + urllib.parse.quote("USR:Ruim")
        for body in [b"{a}", b'{"x":1,}', b'{"x":01}', b'{"x":"\\q"}', b"{} {}", b'{"x":[1,2}']:
            self.assertEqual(call(self.base, "PUT", k, body)[0], 400, body)
        st, lib = call(self.base, "GET", "/api/library")
        self.assertEqual(st, 200)
        self.assertIsInstance(lib, dict)
        self.assertEqual(call(self.base, "PUT", k, b' {"ok": [true, false, null, -1.5e3, "\\u00e7"]} ')[0], 200)

    def test_13_item_corrompido_no_disco_nao_derruba_biblioteca(self):
        if not self.data:
            self.skipTest("defina HX_DATA para servidor externo")
        with open(os.path.join(self.data, "library", "0" * 40 + ".lib"), "wb") as f:
            f.write(b"USR:Corrompido\n{quebrado")
        st, lib = call(self.base, "GET", "/api/library")
        self.assertEqual(st, 200)
        self.assertNotIn("USR:Corrompido", lib)


if __name__ == "__main__":
    unittest.main(verbosity=2)
