/* Liste des pages du site, partagée par les tests (smoke.js, i18n-scan.js, a11y.js) : une seule source, lue dans les registres.
   IDS : missions (src/data-missions.js) ; INST : [mission, instrument] pour chaque instrument (src/data-inst.js) ;
   PAGES : pages générales et pages de mission ; ALL : PAGES + toutes les pages d'instrument. */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const IDS = [...fs.readFileSync(path.join(ROOT, 'src', 'data-missions.js'), 'utf8').matchAll(/^    id:'(\w+)'/gm)].map(m => m[1]);
const inst = fs.readFileSync(path.join(ROOT, 'src', 'data-inst.js'), 'utf8');
const INST = [];
inst.split(/^(\w+):\{\s*$/m).forEach((blk, i, a) => { if (i % 2 === 1) for (const m of a[i + 1].matchAll(/\{ id:'(\w+)', name:/g)) INST.push([blk, m[1]]); });
const PAGES = ['accueil', 'missions', 'comparer', 'flotte', 'flotte-qui', 'comparer-voyage', 'comparer-masse', 'comparer-vehicules', 'comparer-orbites', 'comparer-instruments',
  ...IDS, ...IDS.map(i => i + '-donnees'), ...IDS.map(i => i + '-donnees-mission'), ...IDS.map(i => i + '-donnees-orbite')];
const ALL = PAGES.concat(INST.map(([m, i]) => m + '-donnees-' + i));
module.exports = { ROOT, IDS, INST, PAGES, ALL };
