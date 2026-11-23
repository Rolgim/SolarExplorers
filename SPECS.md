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
| Publication | GitHub Pages + artifact claude.ai (`node build.js artifact` → `dist/`, maquettes en `.txt`) | fait : GitHub Pages (https://rolgim.github.io/SolarExplorers/) et artifact |
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
- Usages prévus : aperçus et produits réels dans les pages d'instruments, comptages par mission et par instrument.
- Compléments : PDS (NASA), PSA (ESA), JPL Horizons pour les trajectoires, NASA 3D Resources et ESA SCIFLEET pour les maquettes, modèles numériques et mosaïques globales sous licence ouverte pour les fonds de cartes. Partenaires nommés par le PDSSP : PSUP, SSHADE, VESPA.

### Résultats de la sonde (23 novembre 2026, workflow « Sonde », branche `probe-out`)

- **API** : `https://stac.stacplanet.pdssp.eu` (stac-fastapi, « CNES PDSSP - STAC Planet API », STAC 1.0.0), lue dans la configuration de l'application (`/config/config.stacplanet.json`, champ `STAC_API_URL`). Conformités : `/search` (GET et POST, `fields`, `sort`, `query`, filtre CQL2), `collection-search`, agrégation (`/aggregate`, `/aggregations`). Aucune authentification pour lire.
- **555 collections**, toutes à plat dans `/collections` (aucun catalogue enfant) : 553 viennent de PDS ODE (fournisseur « NASA PDS Geosciences Node / ODE », licence CC0-1.0) ; 2 seulement viennent d'ailleurs : `vim-cassini-vims-ir` (Titan, 20 672 items, aperçus JPEG/PNG orthographiques et équirectangulaires, cubes ISIS, CC-BY-4.0) et `rosetta-anaglyphs` (67P, OSIRIS-NAC, 0 item, CC-BY-NC-ND-4.0).
- **Corps** : Mars, Lune, Mercure, Vénus, Titan, 67P. Absents aujourd'hui : HRSC de la FU Berlin, collections IAS/IDOC (l'OMEGA présent est celui d'ODE), PSUP.
- **Champs** : `ssys:targets` au niveau de la collection ; `mission`, `platform`, `instruments`, `product:type` en `summaries`. Les orthographes du champ `mission` varient pour une même sonde (« MARS RECONNAISSANCE ORBITER » et « Mars Reconnaissance Orbiter », ou « OBSERVING SYSTEM ») : regrouper par `platform` ou par préfixe d'identifiant (`ode-<corps>-<sonde>-<instrument>-<produit>`).
- **Géométrie** : sur 487 items lus (un par collection), 233 ont une empreinte (Polygon, MultiPolygon, LineString) et 254 n'en ont pas (`geometry: null`, par exemple CRISM CDR) : les empreintes ne seront disponibles que pour une partie des collections.
- **Fichiers** : hébergés chez les nœuds PDS (pds-geosciences.wustl.edu, ode.rsl.wustl.edu, pds.lroc.im-ldi.com, data.darts.isas.jaxa.jp, hirise.lpl.arizona.edu…). Aperçus prêts : HiRISE (JPEG browse, JP2), CTX (JPEG), HRSC (JPEG), LROC (PNG, GeoTIFF), Kaguya TC (JPEG), Cassini VIMS (JPEG/PNG). Sans aperçu : MDIS (MESSENGER), OMEGA, Magellan (fichiers PDS à convertir en CI).

## 5. Périmètre retenu (choisi le 23 novembre 2026, d'après la sonde)

| Mission | Cible | Collections STAC-PLANET (préfixe) | Aperçus prêts |
|---|---|---|---|
| Mars Reconnaissance Orbiter (HiRISE, CTX, CRISM) | Mars | `ode-mars-mro-` (34) | oui : HiRISE JPEG/JP2, CTX JPEG |
| Mars Express (HRSC, OMEGA, MARSIS) | Mars | `ode-mars-mex-` (18) | HRSC JPEG ; OMEGA et MARSIS sans aperçu |
| Lunar Reconnaissance Orbiter (LROC, LOLA, Diviner…) | Lune | `ode-moon-lro-` (77) | LROC PNG et GeoTIFF |
| Cassini (VIMS) | Titan | `vim-cassini-vims-ir` (1) | oui : orthographique et équirectangulaire |
| MESSENGER (MDIS, MASCS, MLA…) | Mercure, survols de Vénus | `ode-mercury-messenger-`, `ode-venus-messenger-` | non : images PDS à convertir en CI |

Ordre de l'étape 4 : MRO d'abord (HiRISE).

Pages, sur le modèle du premier site :

- **Mission** : vue 3D de la sonde (pièces, Soleil réel, éclaté), fiche sourcée, page « Mission et données » (instruments, trajet de la lumière, trajectoire, données réelles, chaîne de traitement).
- **Sélection de la sonde** : deux rangées dans l'en-tête, comme les domaines spectraux et les observatoires du premier site : les corps visés (Mars, Lune, Saturne, Mercure), puis les sondes du corps choisi (avec l'année) ; on reste sur le même type de page (vue 3D ou « Mission et données ») en changeant de sonde.
- **Vue 3D en orbite** : la sonde tourne autour du corps qu'elle observe, instruments tournés vers lui. Le corps tourne aussi sur lui-même. Deux vues : « sonde » (caméra attachée à la sonde, le sol défile dessous) et « orbite » (le corps entier, la trace de l'orbite, sonde agrandie). Schéma de principe signalé : tailles, altitude, inclinaison et vitesse non respectées ; bouton Pause (WCAG 2.2.2), mouvement arrêté si « mouvement réduit ».
- **Système solaire** (accueil, pleine page) : planètes jusqu'à Neptune, Pluton et sondes à leur position réelle à la date choisie (aujourd'hui par défaut), curseur, lecture à vitesse réglable ; vue centrée sur une planète avec ses satellites.
- **Comparer** et **Flotte** : pleine page.
- **Comparer** : sous-pages (domaine spectral, résolution au sol, trajectoires, tableau).
- **Flotte** : frise des missions par agence et par cible, « qui a fait quoi » sourcé.

## 6. Étapes

1. **Squelette** — fait (23 novembre 2026) : chaîne d'Observatories (build, tests, workflows, `tools/models`, `tools/probe`), contenu vidé.
2. **Sonde STAC-PLANET** — faite le 23 novembre 2026 (résultats en section 4) : racine de l'API, collections (corps, mission, instrument, nombre d'items), un item par collection (propriétés, géométrie, assets).
3. **Choix des missions** — fait le 23 novembre 2026 (section 5).
4. **Première mission complète (MRO)** — livrée le 23 novembre 2026, avec des restes :
   - fait : maquette NASA 3D Resources « MRO (A) » redécoupée en quatre pièces (`tools/models/mro_cls.js` : antenne grand gain, panneaux, antenne SHARAD, module et instruments) ; fiche sourcée (dossier de presse d'arrivée de la NASA, NSSDCA, Horizons, STAC-PLANET) ; vue 3D allégée (`src/viewer.js` : rotation, zoom, pièces cliquables, vue éclatée) ; page « Mission et données » avec la croisière réelle (Horizons -74, Terre et Mars) et une image CTX réelle (contraste étiré et signalé) ; workflow « Données réelles » ; artifact publié ;
   - HiRISE : le serveur de l'Université d'Arizona refuse les connexions de GitHub Actions, sans miroir trouvé au PDS Imaging Node ; CTX tient lieu de première donnée réelle ;
   - reste à faire : éclairage « Soleil réel », pages d'instruments détaillées (trajet de la lumière, chaîne de traitement), instruments séparés sur la maquette (non distinguables de façon sûre aujourd'hui), orbite autour de Mars, comparaison des sources sur la puissance électrique (2 000 W au plus loin du Soleil selon le dossier de presse, 1 000 W à Mars selon la NSSDCA : non affichée tant que ce n'est pas tranché).
   - ajouté le 23 novembre 2026 : Mars Express, LRO, Cassini et MESSENGER (maquettes NASA 3D Resources et ESA SCIFLEET, fiches sourcées, croisières Horizons, une image réelle par mission sauf Cassini : le serveur VIMS refuse GitHub Actions) ; publication sur GitHub Pages (https://rolgim.github.io/SolarExplorers/).
5. **Sondes en orbite et sélection** — 23 novembre 2026 : onglets de sonde dans l'en-tête ; la sonde tourne autour de son corps (vue sonde, vue d'orbite, pause). La carte d'un corps avec les empreintes STAC a été abandonnée à la demande de l'utilisateur.
6. **Accueil Système solaire** — 23 novembre 2026 : vue de dessus du plan de l'écliptique, positions réelles des planètes (Mercure à Saturne) et des sondes de 1997 à aujourd'hui (JPL Horizons, `data/solar.json`, recette `solar` de `tools/data/fetch_orbits.py`) ; curseur des dates, lecture/pause, cadrage « jusqu'à Mars » ou « jusqu'à Saturne » ; seule la croisière est tracée, une sonde en orbite est un anneau de sa couleur autour de sa planète ; liste de l'état de chaque sonde à la date choisie (d'après les `events` du registre).
7. **Flotte et Comparer** — 23 novembre 2026 (`src/views.js`, tirés du registre seulement) :
   - Flotte : frise de 1997 à aujourd'hui, une ligne par mission rangée par corps visé (lancement, survols, arrivée ou mise en orbite, atterrissage, fin ou « en cours ») ; « qui a fait quoi » : agences et dates de chaque mission, chaque date sourcée ;
   - Comparer : durée du voyage (lancement → arrivée), masse au lancement, véhicules et instruments côte à côte, avec les sources des fiches ;
   - pas encore faits faute de valeurs structurées et sourcées : domaine spectral et résolution au sol des instruments.
8. **Retours du 23 novembre 2026** : corps qui tourne sur lui-même ; sondes regroupées par corps dans l'en-tête ; Système solaire, Comparer et Flotte en pleine page ; lecture plus lente (un mois par seconde par défaut, réglable d'une heure à un an par seconde) ; Uranus, Neptune, Pluton et 21 satellites (éléments orbitaux Horizons tous les 180 jours, 30 pour Phobos, Mimas et Encelade, interpolés : écart ≤ 3° vérifié en retirant une époque sur deux).
9. **Mise en page d'Observatories (second retour du 23 novembre 2026)** :
   - Flotte et Comparer reprennent la page « Flotte » et « Comparer » d'Observatories (`src/views.js`, classes de `src/inst.css`) : sous-pages dans une colonne à gauche (Flotte : frise, qui a fait quoi ; Comparer : vue d'ensemble, durée du voyage, masse au lancement, véhicules, orbites, instruments), grand titre, filtres en pastilles (agence, état, corps visé), frise triée par date de lancement avec les étapes marquées, tableaux `ctable` ; sources numérotées dans « Qui a fait quoi » ;
   - Système solaire reprend le « Ciel » d'Observatories : carte noire avec boutons de cadrage dessus (+, −, planètes intérieures, système entier), barre de lecture dessous (lecture, curseur, date, vitesse, aujourd'hui), colonne à droite (centrer sur un corps, satellites, état des sondes) ; zoom continu à la molette, au double clic ou au pincement, déplacement en glissant, du système entier jusqu'aux satellites d'une planète, la vue suit le corps choisi ; la lecture démarre à l'ouverture (une semaine par seconde, sauf « mouvement réduit ») ;
   - planètes et satellites téléchargés jusqu'à deux ans après la date du jour (prévision Horizons, signalée « prévision » à côté de la date), pour que la lecture parte d'aujourd'hui ; positions des planètes interpolées par spline (Catmull-Rom).

10. **Mission et instruments, orbites réelles (troisième retour du 23 novembre 2026)** :
   - « Missions » ouvre la vue 3D de la dernière sonde vue ; le panneau de la vue 3D a un lien « Mission et instruments » ;
   - page « Mission et instruments » de chaque sonde (`src/missionpage.js`, route `#<id>-donnees[-<sous-page>]`), sur le modèle de la page Instruments d'Observatories : vue d'ensemble (couverture spectrale de l'UV à la radio, cases des instruments, collections et produits STAC-PLANET, archives), mission et traitements (`src/data-mission.js` : déroulé et exploitation sourcés ; chaîne de traitement aux niveaux CODMAC des normes du PDS, avec les collections STAC-PLANET rangées par suffixe, signalé ≈), trajectoire et orbite (croisière Horizons et orbite réelle autour du corps), une page par instrument (37, `src/data-inst.js` : usage, caractéristiques sourcées par les fiches d'expérience NSSDCA et les dossiers de presse, place dans le spectre, tableau des collections STAC-PLANET, requête d'accès, sources numérotées, archives) ; collections relevées par `tools/data/stac_catalog.py` dans `src/data-stac.js` ;
   - Système solaire : en zoomant sur le corps d'une sonde en orbite, son orbite réelle remplace l'anneau (Horizons centré sur le corps, une fenêtre par an à partir du 15 janvier, hauteur z gardée pour mettre en tirets la partie cachée derrière le corps) ; la sonde y est placée en répétant ce tour (≈), seule l'orbite est tracée en lecture rapide ; fond de ciel réel : carte du ciel de Gaia EDR3 reprojetée vers le pôle sud de l'écliptique (`tools/data/make_solarbg.py`, ESA/Gaia/DPAC, A. Moitinho, CC BY-SA 3.0 IGO), assombri ;
   - pas faits : bande du radar de Cassini (fréquence non trouvée dans les sources relevées), trajet de la lumière des instruments, collections STAC-PLANET pour plusieurs instruments de Mars Express et de Cassini (absentes du catalogue).

## Sources

- PDSSP STAC Model, documentation du PDSSP ; extension STACPlanet : https://github.com/pdssp/stacplanet
- EPSC-DPS 2025, abstract 313 et EPSC 2026, abstract 78 : présentation du PDSSP et de STAC-PLANET
- Dépôt Observatories : `SPECS.md`, `README.md`, `tools/`
