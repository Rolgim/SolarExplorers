# Explorateurs du Système solaire

*Solar System Explorers: an interactive guide to planetary probes, with 3D models, sourced fact sheets, instruments, trajectories and real archive data, in English (default) and French.*

Pendant pour les sondes planétaires d'[Observatoires en orbite](https://github.com/Rolgim/Observatories) (tag `v1.0`), dont ce dépôt reprend l'architecture : chaque mission aura sa maquette 3D, sa fiche sourcée, ses instruments, sa trajectoire et de vraies données tirées des archives, en priorité du catalogue [STAC-PLANET](https://stacplanet.pdssp.eu/) du PDSSP (CNES). Public : de l'élève à l'expert, avec deux niveaux de lecture.

**État : squelette (étape 1 du lancement).** La chaîne de construction, les tests, les workflows et les outils de maquettes sont en place ; les registres de missions sont vides. La sonde de STAC-PLANET (étape 2) se lance depuis l'onglet Actions. Voir [SPECS.md](SPECS.md) pour les règles et la suite.

Pour le lancer en local : `node build.js`, puis `python3 -m http.server` et ouvrir http://localhost:8000.

## Organisation du dépôt

| Chemin | Rôle |
|---|---|
| `index.html`, `models/*.glb` | le site tel qu'il est servi par GitHub Pages |
| `build.js` | `node build.js` assemble `src/` en `index.html` (aucune dépendance) ; `node build.js artifact` produit une variante dans `dist/` (maquettes encodées en base64) pour l'artifact claude.ai |
| `src/data-missions.js` | **registre des missions** (`MISSIONS`) : fiche, cibles, survols et mises en orbite, collections STAC, maquette ; schéma en tête du fichier |
| `src/data-inst.js`, `src/data-mission.js`, `src/data-fleet.js` | instruments ; déroulé des missions et chaînes de traitement ; « qui a fait quoi » |
| `src/app.js` | en-tête, routage, pages ; ne contient rien de propre à une mission |
| `src/en/`, `src/i18n.js`, `src/lang.js` | version anglaise : textes anglais et leur application |
| `src/style.css`, `src/inst.css`, `src/site.css` | styles (repris d'Observatories ; `site.css` pour le squelette) |
| `data/` | données réelles, produites par les scripts de `tools/data/` ; ne pas modifier à la main |
| `tools/probe/` | sondes qui montrent ce qu'expose une archive, sans rien écrire sur `main` (voir son `README.md`) |
| `tools/models/` | conversion, allègement et redécoupage des maquettes ; procédure d'ajout d'une mission dans son `README.md` |
| `tools/smoke.js`, `tools/a11y.js`, `tools/i18n-scan.js` | tests dans un vrai navigateur (Playwright) : parcours du site et registre ; accessibilité WCAG 2.1 A et AA (axe-core) ; textes non traduits ; les trois parcourent les 172 pages listées par `tools/pages.js` (dont chaque page d'instrument) |
| `tools/shot.js`, `tools/serve.js` | captures d'écran ; serveur local commun aux tests |
| `SPECS.md` | spécifications : règles, périmètre, étapes |

Après une modification dans `src/`, relancer `node build.js` et commiter `index.html` avec les sources : le workflow « Tests » vérifie que les deux correspondent.

## Intégration continue

| Workflow | Quand | Rôle |
|---|---|---|
| Tests | à chaque push touchant le site, et sur les pull requests | `index.html` à jour, `tools/smoke.js`, `tools/a11y.js`, `tools/i18n-scan.js` |
| Sonde | à la demande | lance un script de `tools/probe/` ; résumé dans le récapitulatif du job, fichiers sur la branche `probe-out` |

Le workflow « Données réelles » (recettes STAC du PDSSP, PDS, PSA ; trajectoires JPL Horizons) arrivera avec la première mission.

Pour lancer les tests en local : `npm install --no-save playwright@1.56.0 axe-core@4.10.2`, `npx playwright install chromium`, puis `node tools/smoke.js`, `node tools/a11y.js` et `node tools/i18n-scan.js`.

## Crédits et licences

Le code du dépôt est sous licence [Apache 2.0](LICENSE) (voir aussi [NOTICE](NOTICE)). Cette licence ne couvre pas les médias. Tout ce que le site montre sans l'avoir créé (images, tracés de données, textures, trajectoires, maquettes 3D, polices, bibliothèques) est listé dans [CREDITS.md](CREDITS.md), avec sa source, sa licence, son crédit, sa date de téléchargement et les transformations faites. Ce registre est généré par `tools/data/credits.py` ; la licence de chaque image est aussi affichée sous l'image.
