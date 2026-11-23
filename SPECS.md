# Explorateurs du Système solaire : spécifications

Repris du dossier de lancement du 23 novembre 2026. Projet de référence : [Rolgim/Observatories](https://github.com/Rolgim/Observatories), tag `v1.0`.

## 1. Objet, public et périmètre

Le projet transpose « Observatoires en orbite » aux sondes du Système solaire : chaque mission a sa maquette 3D, sa fiche sourcée, ses instruments, sa trajectoire et de vraies données tirées des archives, avec en priorité le catalogue STAC du PDSSP.

- Public : de l'élève à l'expert ; deux niveaux de lecture (fiche courte, pages détaillées).
- Langues : anglais par défaut, français disponible.
- Repris du premier projet : la structure des pages (vue 3D + fiche, page « Mission et données », vues d'ensemble dans l'en-tête), les règles de sourçage, la chaîne de construction, les tests et l'intégration continue.
- Ce qui change : on ne suit plus des télescopes qui regardent le ciel, mais des sondes qui visitent des corps ; la vue d'ensemble centrale devient le Système solaire (au lieu du ciel), et les données sont surtout des images et cartes de surfaces planétaires.

## 2. Règles héritées

1. **Tout est sourcé.** Chaque valeur chiffrée renvoie à une source ouverte et vérifiée (page de l'agence, article, documentation d'archive). Une affirmation sans source est retirée ou adoucie, jamais inventée.
2. **L'approximatif est signalé** (« ≈ », « schéma de principe », « valeur indicative ») ; une forme ou une position non publiée n'est pas dessinée.
3. **Vraies données seulement** : une observation n'apparaît que si le produit a réellement été téléchargé ; chaque aperçu cite l'archive, l'identifiant du produit et la date.
4. **Bilingue** : tout texte visible a sa traduction anglaise ; `tools/i18n-scan.js` vérifie qu'aucune chaîne française ne reste en anglais.
5. **Pas d'agence mise en avant** : les filtres et la flotte nomment des agences (NASA, ESA, CNES, JAXA…), sans badge ni couleur réservée à l'une d'elles.
6. **Navigation stable** : les vues d'ensemble sont des boutons fixes en haut à droite ; rien ne bouge quand on clique (même graisse de police, titres alignés en haut). `tools/smoke.js` le vérifie.
7. **Accessibilité** : aucune violation WCAG A/AA (axe-core, `tools/a11y.js`), clavier, contraste, mouvement réduit respecté.
8. **Licences** : maquettes 3D et images libres ou créditées ; la licence est écrite à côté de l'objet.
9. **Avant de livrer** : tests, captures d'écran relues, commit, publication de l'artifact.

Contrainte technique : un artifact ne charge rien d'un autre site (images, tuiles, API). Toute donnée affichée est donc précalculée par l'intégration continue et publiée avec la page. L'espace de travail de Claude n'accède pas aux archives : tout passe par des scripts lancés dans GitHub Actions, qui écrivent des fichiers légers dans `data/`.

## 3. Architecture

| Brique | Repris d'Observatories | Ici |
|---|---|---|
| Site | `src/` (HTML, CSS, JS sans framework, three.js r128) assemblé par `node build.js` en un seul `index.html` | fait : registre renommé `data-tele.js` → `data-missions.js` ; vue 3D à reprendre avec la première mission |
| Publication | GitHub Pages + artifact claude.ai (`node build.js artifact` → `dist/`, maquettes en `.txt`) | fait (chaîne) ; Pages et artifact à ouvrir |
| Registres | `data-tele.js`, `data-inst.js`, `data-mission.js`, `data-fleet.js`, `src/en/*` | fait, vides ; schéma adapté aux sondes (cibles, survols, mises en orbite, collections STAC) |
| Maquettes 3D | `tools/models/` : `obj2glb`, segmentation par nœud, allègement, `zfind.mjs` / `zfix.mjs` | fait (outils génériques) ; sources NASA 3D Resources et ESA SCIFLEET |
| Données réelles | `tools/data/fetch_data.py`, workflow « Données réelles » quotidien | à faire : recettes STAC du PDSSP, PDS, PSA de l'ESA |
| Trajectoires | `fetch_orbits.py` (JPL Horizons) | à faire : Horizons pour les sondes et les corps visés |
| Sondes d'archives | workflow « Sonde », `tools/probe/`, sortie sur la branche `probe-out` | fait ; `probe_stacplanet.py` |
| Tests | `smoke.js`, `a11y.js`, `i18n-scan.js`, `shot.js` (Playwright) | fait, adaptés au squelette |

## 4. Données : STAC-PLANET du PDSSP d'abord

STAC-PLANET est le catalogue STAC du Pôle de données et services Surfaces planétaires (PDSSP), développé par le CNES. Il est hiérarchique, rangé par corps cible puis par fournisseur.

- Modèle de données : extension [STACPlanet](https://github.com/pdssp/stacplanet) (préfixe `pdssp`), qui s'appuie sur les extensions `ssys` (cibles), `processing`, `product`, `scientific`, `file`, `version` et `projection`. Les champs `platform`, `mission`, `instruments` et `ssys:targets` prennent les valeurs du thésaurus PDSSP.
- À vérifier par la sonde avant toute recette : adresse de l'API (racine, `/collections`, `/search`), extensions réellement utilisées, liens vers les fichiers (aperçus, COG), nombre d'items par collection.
- Usages prévus : empreintes des observations sur la carte de chaque corps, aperçus et produits réels dans les pages d'instruments, comptages par mission et par instrument.
- Compléments : PDS (NASA), PSA (ESA), JPL Horizons pour les trajectoires, NASA 3D Resources et ESA SCIFLEET pour les maquettes, modèles numériques et mosaïques globales sous licence ouverte pour les fonds de cartes. Partenaires nommés par le PDSSP : PSUP, SSHADE, VESPA.

### Résultats de la sonde (23 novembre 2026, workflow « Sonde », branche `probe-out`)

- **API** : `https://stac.stacplanet.pdssp.eu` (stac-fastapi, « CNES PDSSP - STAC Planet API », STAC 1.0.0), lue dans la configuration de l'application (`/config/config.stacplanet.json`, champ `STAC_API_URL`). Conformités : `/search` (GET et POST, `fields`, `sort`, `query`, filtre CQL2), `collection-search`, agrégation (`/aggregate`, `/aggregations`). Aucune authentification pour lire.
- **555 collections**, toutes à plat dans `/collections` (aucun catalogue enfant) : 553 viennent de PDS ODE (fournisseur « NASA PDS Geosciences Node / ODE », licence CC0-1.0) ; 2 seulement viennent d'ailleurs : `vim-cassini-vims-ir` (Titan, 20 672 items, aperçus JPEG/PNG orthographiques et équirectangulaires, cubes ISIS, CC-BY-4.0) et `rosetta-anaglyphs` (67P, OSIRIS-NAC, 0 item, CC-BY-NC-ND-4.0).
- **Corps** : Mars, Lune, Mercure, Vénus, Titan, 67P. Absents aujourd'hui : HRSC de la FU Berlin, collections IAS/IDOC (l'OMEGA présent est celui d'ODE), PSUP.
- **Champs** : `ssys:targets` au niveau de la collection ; `mission`, `platform`, `instruments`, `product:type` en `summaries`. Les orthographes du champ `mission` varient pour une même sonde (« MARS RECONNAISSANCE ORBITER » et « Mars Reconnaissance Orbiter », ou « OBSERVING SYSTEM ») : regrouper par `platform` ou par préfixe d'identifiant (`ode-<corps>-<sonde>-<instrument>-<produit>`).
- **Géométrie** : sur 487 items lus (un par collection), 233 ont une empreinte (Polygon, MultiPolygon, LineString) et 254 n'en ont pas (`geometry: null`, par exemple CRISM CDR) : les empreintes ne seront disponibles que pour une partie des collections.
- **Fichiers** : hébergés chez les nœuds PDS (pds-geosciences.wustl.edu, ode.rsl.wustl.edu, pds.lroc.im-ldi.com, data.darts.isas.jaxa.jp, hirise.lpl.arizona.edu…). Aperçus prêts : HiRISE (JPEG browse, JP2), CTX (JPEG), HRSC (JPEG), LROC (PNG, GeoTIFF), Kaguya TC (JPEG), Cassini VIMS (JPEG/PNG). Sans aperçu : MDIS (MESSENGER), OMEGA, Magellan (fichiers PDS à convertir en CI).

## 5. Périmètre proposé (à valider d'après la sonde)

| Mission | Cible | Pourquoi en premier |
|---|---|---|
| Mars Express (OMEGA, HRSC) | Mars | collections citées dans le modèle STAC du PDSSP |
| Mars Reconnaissance Orbiter (HiRISE) | Mars | collections PDS ODE citées |
| Cassini (VIMS) | Saturne, Titan | collection Titan citée |
| Une mission lunaire | Lune | catalogue Lune prévu |
| À choisir après la sonde | — | selon les collections réellement présentes |

Pages, sur le modèle du premier site :

- **Mission** : vue 3D de la sonde (pièces, Soleil réel, éclaté), fiche sourcée, page « Mission et données » (instruments, trajet de la lumière, trajectoire, données réelles, chaîne de traitement).
- **Système solaire** (accueil) : les orbites des planètes et la trajectoire réelle de chaque sonde, avec un curseur des années ; un clic sur un corps ouvre sa carte.
- **Carte d'un corps** : fond global du corps et empreintes des observations de chaque instrument tirées de STAC-PLANET (zoom, filtres, clic « qui a observé ici »).
- **Comparer** : sous-pages (domaine spectral, résolution au sol, trajectoires, tableau).
- **Flotte** : frise des missions par agence et par cible, « qui a fait quoi » sourcé.

## 6. Étapes

1. **Squelette** — fait (23 novembre 2026) : chaîne d'Observatories (build, tests, workflows, `tools/models`, `tools/probe`), contenu vidé.
2. **Sonde STAC-PLANET** — faite le 23 novembre 2026 (résultats en section 4) : racine de l'API, collections (corps, mission, instrument, nombre d'items), un item par collection (propriétés, géométrie, assets).
3. Choix des missions avec l'utilisatrice, d'après la sonde.
4. Première mission complète : maquette, fiche, instruments, trajectoire Horizons, une donnée réelle (et retour de la vue 3D d'Observatories).
5. Carte d'un corps (Mars) avec les empreintes STAC.
6. Accueil Système solaire, puis Comparer et Flotte.

## Sources

- PDSSP STAC Model, documentation du PDSSP ; extension STACPlanet : https://github.com/pdssp/stacplanet
- EPSC-DPS 2025, abstract 313 et EPSC 2026, abstract 78 : présentation du PDSSP et de STAC-PLANET
- Dépôt Observatories : `SPECS.md`, `README.md`, `tools/`
