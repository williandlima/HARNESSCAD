/* HarnessCAD - entrada/saída: servidor da intranet (Python ou Java), arquivos locais, autosave */
(function (G) {
  'use strict';
  var HX = G.HX, io = HX.io = { online: false, user: '' };

  function req(method, url, body, headers) {
    var h = Object.assign({ 'Content-Type': 'application/json' }, headers || {});
    if (io.user) h['X-User'] = encodeURIComponent(io.user);
    return fetch(url, { method: method, body: body, headers: h, cache: 'no-store' })
      .then(function (r) {
        return r.text().then(function (t) {
          var data; try { data = t ? JSON.parse(t) : null; } catch (e) { data = t; }
          if (!r.ok) { var err = new Error((data && data.error) || ('HTTP ' + r.status)); err.status = r.status; err.data = data; throw err; }
          return data;
        });
      });
  }
  io.detect = function () {
    if (G.location && G.location.protocol === 'file:') return Promise.resolve(false);
    return req('GET', 'api/ping').then(function (d) { io.online = !!(d && d.app === 'HarnessCAD'); io.server = d; return io.online; })
      .catch(function () { io.online = false; return false; });
  };
  io.list = function () { return req('GET', 'api/projects'); };
  io.load = function (name) { return req('GET', 'api/projects/' + encodeURIComponent(name)); };
  io.save = function (name, project, baseMtime) {
    return req('PUT', 'api/projects/' + encodeURIComponent(name), JSON.stringify(project), baseMtime ? { 'X-Base-Mtime': String(baseMtime) } : {});
  };
  io.remove = function (name) { return req('DELETE', 'api/projects/' + encodeURIComponent(name)); };
  io.backups = function (name) { return req('GET', 'api/backups/' + encodeURIComponent(name)); };
  // Biblioteca compartilhada: um item por vez (evita que um usuário apague o conector do outro)
  io.loadLibrary = function () {
    var p = io.online ? req('GET', 'api/library') : Promise.resolve(io.localGet('hx-library') || {});
    return p.then(function (lib) { if (HX.onLibLoad) HX.onLibLoad(lib); return HX.sanitizeLibrary(lib); }); // imagens da vista frontal à parte
  };
  io.saveLibEntry = function (e) {
    var loc = io.localGet('hx-library') || {}; loc[e.key] = e; io.localSet('hx-library', loc);
    return io.online ? req('PUT', 'api/library/' + encodeURIComponent(e.key), JSON.stringify(e)) : Promise.resolve(true);
  };
  io.deleteLibEntry = function (key) {
    var loc = io.localGet('hx-library') || {}; delete loc[key]; io.localSet('hx-library', loc);
    return io.online ? req('DELETE', 'api/library/' + encodeURIComponent(key)) : Promise.resolve(true);
  };
  io.user = (function () { try { return G.localStorage.getItem('hx-user') || ''; } catch (e) { return ''; } })();
  io.setUser = function (u) { io.user = String(u || '').slice(0, 40); try { G.localStorage.setItem('hx-user', io.user); } catch (e) { /* ignore */ } };

  io.localGet = function (k) { try { var s = G.localStorage.getItem(k); return s ? JSON.parse(s) : null; } catch (e) { return null; } };
  io.localSet = function (k, v) { try { G.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

  io.download = function (name, data, mime) {
    var blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'application/octet-stream' });
    if (G.navigator && G.navigator.msSaveOrOpenBlob) { G.navigator.msSaveOrOpenBlob(blob, name); return; }
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  };
  io.pickFile = function (accept) {
    return new Promise(function (res) {
      var inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept || '.json,.hxc';
      inp.onchange = function () {
        var f = inp.files[0]; if (!f) return;
        var rd = new FileReader(); rd.onload = function () { res({ name: f.name, text: rd.result }); }; rd.readAsText(f, 'utf-8');
      };
      inp.click();
    });
  };
  io.safeName = function (s) { return String(s || 'projeto').replace(/[^\w\-. ]+/g, '_').replace(/^\.+/, '').slice(0, 80) || 'projeto'; };

  // Importa lista de pinos de CSV simples: "pino;sinal" por linha
  io.parsePinCSV = function (text) {
    return String(text).split(/\r?\n/).map(function (l) { return l.split(/[;,\t]/); })
      .filter(function (c) { return c[0] && c[0].trim() && !/^pino|^pin$/i.test(c[0].trim()); })
      .map(function (c) { return { n: c[0].trim(), name: (c[1] || '').trim(), sz: (c[2] || '').trim() }; });
  };
})(typeof window !== 'undefined' ? window : globalThis);
