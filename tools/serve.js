/* Petit serveur statique commun aux tests (tools/smoke.js, a11y.js, i18n-scan.js, shot.js). */
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html':'text/html', '.glb':'model/gltf-binary', '.json':'application/json', '.jpg':'image/jpeg', '.png':'image/png', '.txt':'text/plain', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml' };
module.exports = port => http.createServer((q, s) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ROOT)) { s.writeHead(403); return s.end(); }
  fs.readFile(f, (e, d) => { if (e) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'content-length': d.length }); s.end(d); });
}).listen(port);
/* hors ligne (VENDOR=/chemin) : on coupe tout ce qui n'est pas local, polices comprises */
module.exports.offline = async (pg, port) => {
  const V = process.env.VENDOR;
  await pg.route('**/*', r => { const u = r.request().url();
    if (V && u.includes('three.min.js')) return r.fulfill({ path: path.join(V, 'three.min.js'), contentType: 'text/javascript' });
    if (V && u.includes('GLTFLoader.js')) return r.fulfill({ path: path.join(V, 'GLTFLoader.js'), contentType: 'text/javascript' });
    if (V && u.includes('fonts.googleapis')) return r.fulfill({ contentType: 'text/css', body: '' });
    return u.startsWith('http://localhost:' + port) || !V ? r.continue() : r.abort(); });
};
/* langue du site imposée une fois par onglet (le site est en anglais par défaut ; le bouton de langue reste libre ensuite) */
module.exports.lang = (pg, l) => pg.addInitScript(l => { try { if (!sessionStorage.getItem('sse-test-lang')){ localStorage.setItem('sse-lang', l); sessionStorage.setItem('sse-test-lang', '1'); } } catch(e){} }, l);
