# Chaîne de préparation des maquettes

Reprise telle quelle d'Observatories v1.0 (`tools/models/`). Les fichiers `models/<id>.glb` du site seront produits ici à partir des maquettes d'origine, qui ne sont pas dans le dépôt. Sources prévues pour les sondes : NASA 3D Resources et ESA SCIFLEET (`tools/probe/fetch_scifleet_models.py` les récupère depuis la CI, sur la branche `probe-out`).

| Maquette | Source à télécharger | Traitement |
|---|---|---|
| *(aucune pour l'instant : première mission à l'étape 4)* | | |

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
