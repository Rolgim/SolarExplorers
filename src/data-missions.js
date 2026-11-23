/* =================================================================
   MISSIONS — registre des sondes (équivalent de TELESCOPES dans Observatories, src/data-tele.js).
   Registre : ajouter une mission = une entrée ici (et ses textes dans data-inst, data-mission, data-fleet, en/*) ;
   app.js n'a pas à changer. build.js et tools/smoke.js lisent ce registre (une ligne « id:'…' » par mission, indentée de 4 espaces).
     id, name, short, year      identifiant (ancre #id), nom complet, nom court, année de lancement
     agency                     agences, en texte (règle 5 : aucune n'est mise en avant)
     targets                    corps visités, du plus important au moins important (noms du thésaurus PDSSP : 'Mars', 'Titan'…)
     events                     [{ type:'launch'|'flyby'|'orbit'|'landing'|'end', body, date:'AAAA-MM-JJ', ref }] : survols et mises en orbite datés
     horizons                   identifiant JPL Horizons de la sonde (trajectoire, tools/data/fetch_orbits.py)
     stac                       identifiants des collections STAC-PLANET de la mission (d'après la sonde tools/probe/probe_stacplanet.py)
     file, bytes, axis, size    maquette (models/<id>.glb), comme dans Observatories ; licence dans src (règle 8)
     refs                       sources : { clé:{ t:titre, p:éditeur, u:URL } } ; chaque valeur chiffrée cite une clé (règle 1)
     sections                   fiche : [{ title, rows:[[libellé, valeur, clé de source]] }] ; « ≈ » pour l'approximatif (règle 2)
     checked                    date de la dernière vérification des valeurs
================================================================= */
var MISSIONS = [
];
