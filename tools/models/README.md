# Chaîne de préparation des maquettes

> **Outils génériques dans le socle.** `seg_lib.js`, `dump.js`, `islands.js`, `cls_view.js`, `render.py`, `notex.mjs`, `slim.mjs`, `slimtex.mjs`, `split_mats.mjs` et `schema.mjs` sont dans `socle/models/` (commun aux sites, voir `socle/README.md`) : `cd socle/models && npm ci` une fois, puis par exemple `node socle/models/dump.js in.glb out.json`. Ce dossier garde ce qui est propre au site (classifieurs, scripts de découpage).

Reprise telle quelle d'Observatories v1.0 (`tools/models/`). Les fichiers `models/<id>.glb` du site seront produits ici à partir des maquettes d'origine, qui ne sont pas dans le dépôt. Sources prévues pour les sondes : NASA 3D Resources et ESA SCIFLEET (`tools/probe/fetch_scifleet_models.py` les récupère depuis la CI, sur la branche `probe-out`).

| Maquette | Source à télécharger | Traitement |
|---|---|---|
| `mro.glb` | NASA 3D Resources « Mars Reconnaissance Orbiter (MRO) (A) » | `gltf-transform copy` (Draco) → `seg_lib` + `mro_cls.js` → resize 1024, weld, quantize |
| `mex.glb` | ESA SCIFLEET « mars_express » (OBJ + texture 4K, sonde `probe_wave1.py`) | `obj2glb.py` (texture BaseColor) → `seg_lib` + `mex_cls.js` → idem |
| `lro.glb` | NASA 3D Resources « Lunar Reconnaissance Orbiter (B) » (la version A a son antenne repliée au centre) | `copy` → `seg_lib` + `lro_cls.js` → idem |
| `cassini.glb` | NASA 3D Resources « Cassini-Huygens (A) » | `copy` → `seg_lib` + `cassini_cls.js` → idem |
| `messenger.glb` | NASA 3D Resources « MESSENGER » | `copy` → `seg_lib` + `messenger_cls.js` → idem |
| `ody.glb` | NASA 3D Resources « Mars Odyssey » | `copy` → `seg_lib` + `ody_cls.js` → idem |
| `mgs.glb` | NASA 3D Resources « Mars Global Surveyor » (version complète, antenne déployée) | `copy` → `seg_lib` + `mgs_cls.js` → idem |
| `mgn.glb` | NASA 3D Resources « Magellan » | `copy` → `seg_lib` + `mgn_cls.js` → idem |
| `clem.glb` | NASA 3D Resources « Clementine » | `copy` → `seg_lib` + `clem_cls.js` → idem |
| `tgo.glb` | ESA SCIFLEET « trace_gas_orbiter » (OBJ + textures) | `obj2glb.py` → `seg_lib` + `tgo_cls.js` → idem |
| `vex.glb` | ESA SCIFLEET « venus_express » (OBJ + textures, 271 000 sommets) | `obj2glb.py` → `seg_lib` + `vex_cls.js` → resize 1024 → `slimtex.mjs` (simplification à 12 % en gardant les textures, quantize) |
| `lp.glb` | NASA Eyes on the Solar System « Lunar Prospector » (`tools/probe/probe_eyes2.py`, NASA/JPL-Caltech) | `copy` → `seg_lib` + `lp_cls.js` → resize 1024, weld, quantize → `webp` |
| `grail.glb` | NASA Eyes on the Solar System « GRAIL » (GRAIL-B) | `copy` → `seg_lib` + `grail_cls.js` → idem → `webp` |
| `kplo.glb` | NASA Eyes on the Solar System « Danuri » (Draco + textures KTX2) | `copy` (décode Draco) → `notex.mjs` (textures KTX2 retirées, couleurs) → `seg_lib` + `kplo_cls.js` → `notex.mjs` (couleur des panneaux par nœud) → resize, weld, quantize |

Maquettes « schéma de principe » (formes simples d'après les dimensions publiées) : `schema.mjs` (Viking 1 orbiteur, Lunar Prospector), pour les sondes sans maquette réutilisable ; non utilisé sur le site pour l'instant.

Les classifieurs propres à chaque maquette (`<id>_cls.js`) s'ajoutent ici, mission par mission. Ceux d'Observatories restent consultables au tag `v1.0` de ce dépôt-là.

## Redécoupage en pièces

Les fichiers d'origine sont découpés par texture ou d'un seul bloc, pas par pièce physique. `seg_lib.js` :

1. soude les sommets par position et calcule les îlots connexes de chaque primitive ;
2. appelle un classifieur `classify(îlot, nomDuNœud, nomDuMatériau)` qui renvoie le nom de la pièce (centre, boîte englobante et matériau de l'îlot à l'appui) ;
3. écrit un nœud par pièce et par matériau, nommé d'après la pièce.

Le site retrouve ensuite les pièces par le nom des nœuds (`key` ou `nodes` dans `src/data-missions.js`).

Outils de mise au point : `dump.js` (liste des îlots en JSON), `render.py` (rendu logiciel six vues, coloré par classe), `cls_view.js`, `view.js` (six vues dans Chromium, texturées ou colorées par pièce : `node view.js in.glb out.png cls`). Un classifieur qui renvoie `null` écarte l'îlot.

## Points d'attention

- Le site décode les maquettes sans Draco (pas de décodeur chargé) : seule l'extension `KHR_mesh_quantization` est utilisée.
- three.js r128 ne dénormalise pas les attributs entiers côté CPU ; `src/app.js` convertit donc les positions en flottants au chargement pour que le clic sur une pièce tombe juste.

## Ajouter une mission

1. Maquette : convertir et redécouper (ci-dessus), déposer `models/<id>.glb`. Licence écrite à côté de l'objet (règle 8).
2. `src/data-missions.js` : une entrée dans `MISSIONS` (schéma en tête du fichier) ; `build.js` et `tools/smoke.js` lisent ce registre.
3. Textes et données : `INST_DATA` (`src/data-inst.js`), `MISSION` (`src/data-mission.js`), `FLEET` (`src/data-fleet.js`).
4. Anglais : `EN_MISSIONS` (`src/en/missions.js`) et les chaînes d'interface dans `src/en/ui.js`.
5. `node build.js`, puis `node tools/smoke.js` : le test signale les champs manquants du registre.
