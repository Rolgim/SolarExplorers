/* Assemble le site à partir de src/ (même chaîne qu'Observatories v1.0).
   node build.js           -> index.html (site autonome, maquettes en models/*.glb) : c'est ce que sert GitHub Pages
   node build.js artifact  -> dist/index.html + dist/models/*.txt (variante pour l'artifact claude.ai, qui ne sert pas les .glb :
                              page sans <html>/<head>, maquettes encodées en base64) */
const fs = require('fs'), path = require('path');
const r = f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
/* missions : lues dans le registre (src/data-missions.js) ; seules celles qui ont une maquette (champ file) en demandent une */
const REG = r('data-missions.js');
if (!/var MISSIONS = \[/.test(REG)) throw new Error('registre des missions illisible');
const NAMES = [...REG.matchAll(/^    id:'(\w+)'/gm)].map(m => m[1]).filter(n => new RegExp("file:'models/" + n + "\\.").test(REG));
const artifact = process.argv[2] === 'artifact';

let data = REG;
for (const n of NAMES) {
  const size = fs.statSync(path.join(__dirname, 'models', n + '.glb')).size;
  const re = new RegExp("file:'models/" + n + "\\.(?:glb|txt)', bytes:\\d+");
  if (!re.test(data)) throw new Error('entrée de maquette introuvable : ' + n);
  data = data.replace(re, artifact ? "file:'models/" + n + ".txt', bytes:" + Math.ceil(size / 3) * 4 : "file:'models/" + n + ".glb', bytes:" + size);
}

const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap">';
const style = '<style>\n' + r('style.css') + '\n' + r('inst.css') + '\n' + r('site.css') + '\n</style>';
/* données réelles légères (data/*.json) intégrées à la page : un artifact ne charge rien d'un autre site ; les images restent dans data/ */
const DD = path.join(__dirname, 'data'), files = {};
for (const f of fs.readdirSync(DD).filter(f => f.endsWith('.json') && !/^map-/.test(f)).sort())   /* empreintes (map-*.json) : chargées à la demande */ files[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(DD, f), 'utf8'));
const dataFiles = 'var DATA_FILES = ' + JSON.stringify(files) + ';';
const scripts = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n' +
  '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>\n' +
  '<script>\n' + r('lang.js') + '\n' + dataFiles + '\n' + data + '\n' + r('data-fleet.js') + '\n' + r('data-inst.js') + '\n' + r('data-mission.js') + '\n' +
  r('en/missions.js') + '\n' + r('en/ui.js') + '\n' + r('i18n.js') + '\n' + r('viewer.js') + '\n' + r('app.js') + '\n</script>\n';

if (artifact) {
  const out = path.join(__dirname, 'dist');
  fs.mkdirSync(path.join(out, 'models'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), '<title>Explorateurs du Système solaire</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n' +
    '<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,' + encodeURIComponent(fs.readFileSync(path.join(__dirname, 'favicon.svg'), 'utf8')) + '">\n' + fonts + '\n' + style + '\n' + r('body.html') + scripts);
  for (const n of NAMES) fs.writeFileSync(path.join(out, 'models', n + '.txt'), fs.readFileSync(path.join(__dirname, 'models', n + '.glb')).toString('base64'));
  fs.mkdirSync(path.join(out, 'data'), { recursive: true });
  for (const f of fs.readdirSync(DD).filter(f => /\.(jpg|png)$/.test(f) || /^map-.*\.json$/.test(f))) fs.copyFileSync(path.join(DD, f), path.join(out, 'data', f));
  console.log('dist/index.html');
} else {
  fs.writeFileSync(path.join(__dirname, 'index.html'),
    '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
    '<meta name="description" content="Planetary probes in 3D, with sourced facts, instruments, trajectories and real archive data. In English and French.">\n' +
    '<title>Solar System Explorers</title>\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n<meta name="theme-color" content="#14171A">\n' + fonts + '\n<style>[hidden]{display:none!important}</style>\n' + style + '\n</head>\n<body>\n' + r('body.html') + scripts + '</body>\n</html>\n');
  console.log('index.html');
}
