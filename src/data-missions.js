/* =================================================================
   MISSIONS — registre des sondes (équivalent de TELESCOPES dans Observatories, src/data-tele.js).
   Registre : ajouter une mission = une entrée ici (et ses textes dans data-inst, data-mission, data-fleet, en/*) ;
   app.js n'a pas à changer. build.js et tools/smoke.js lisent ce registre (une ligne « id:'…' » par mission, indentée de 4 espaces).
     id, name, short, year      identifiant (ancre #id), nom complet, nom court, année de lancement
     agency                     agences, en texte (règle 5 : aucune n'est mise en avant)
     targets                    corps visités, du plus important au moins important (noms du thésaurus PDSSP : 'Mars', 'Titan'…)
     events                     [{ type:'launch'|'arrival'|'flyby'|'orbit'|'landing'|'end', body, date:'AAAA-MM-JJ', ref }] : étapes datées
     horizons                   identifiant JPL Horizons de la sonde (trajectoire, tools/data/fetch_orbits.py)
     stac                       préfixe des collections STAC-PLANET de la mission (sonde tools/probe/probe_stacplanet.py)
     file, bytes, axis, size    maquette (models/<id>.glb) ; size = dimension réelle en mètres le long de axis
     model                      { src, license } : provenance et licence de la maquette, écrites à côté d'elle (règle 8)
     body                       { name, tex, nadir } : corps survolé, dessiné sous la sonde (texture data/tex-<tex>.jpg) du côté
                                nadir (direction des instruments dans le repère de la maquette) ; taille et distance non respectées
     view, sun                  cadrage initial { az, el, dist } ; direction de la lumière dans le repère de la maquette
     parts                      pièces cliquables : { key (nom du nœud), name, desc, facts:[[texte, clé de source]] }
     refs                       sources : { clé:{ t:titre, p:éditeur, u:URL } } ; chaque valeur chiffrée cite une clé (règle 1)
     sections                   fiche : [{ title, rows:[[libellé, valeur, clé de source]] }] ; « ≈ » pour l'approximatif (règle 2)
     desc                       description courte (premier niveau de lecture)
     checked                    date de la dernière vérification des valeurs
================================================================= */
var MISSIONS = [
  {
    id:'mro', name:'Mars Reconnaissance Orbiter', short:'MRO', year:'2005',
    agency:'NASA (JPL) ; radar SHARAD fourni par l\'ASI',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'2005-08-12', ref:'kit' },
      { type:'arrival', body:'Mars', date:'2006-03-10', ref:'hz' },
      { type:'orbit', body:'Mars', date:'2006-11', ref:'kit' }
    ],
    horizons:'-74', stac:'ode-mars-mro-',
    file:'models/mro.glb', bytes:0, axis:'z', size:13.6,
    model:{ src:'NASA 3D Resources, « Mars Reconnaissance Orbiter (MRO) (A) »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Mars', tex:'mars', nadir:[0, -1, 0] },
    view:{ az:0.55, el:0.22, dist:1.7 }, sun:[0.6, 0.7, 0.4],
    desc:"Lancée en 2005, MRO tourne autour de Mars sur une orbite basse presque polaire. Sa caméra HiRISE voit des détails de la taille d'une table, CTX cartographie la planète entière, CRISM en dresse la minéralogie et le radar SHARAD sonde le sous-sol. Elle sert aussi de relais radio aux robots posés sur Mars.",
    checked:'2026-11-23',
    refs:{
      kit:{ t:'Mars Reconnaissance Orbiter Arrival, Press Kit (mars 2006)', p:'NASA', u:'https://mars.nasa.gov/files/mro/mro-arrival.pdf' },
      nssdc:{ t:'Mars Reconnaissance Orbiter (2005-029A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2005-029A' },
      hz:{ t:'JPL Horizons, objet -74 (Mars Reconnaissance Orbiter), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-mars-mro-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole de communication avec la Terre, montée sur un mât orientable.',
        facts:[['Diamètre : 3 m', 'kit']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux orientables qui alimentent la sonde.',
        facts:[['Chaque panneau : 5,35 × 2,53 m', 'kit'], ['Surface totale : 20 m²', 'kit']] },
      { key:'sharad', name:'Antenne du radar SHARAD', desc:'Antenne dipôle du radar de sondage du sous-sol, fourni par l\'Agence spatiale italienne.',
        facts:[['S\'étend de 5 m de chaque côté de la sonde', 'kit']] },
      { key:'bus', name:'Module et instruments', desc:'Structure centrale, réservoirs, propulsion et, sur la face tournée vers Mars, les instruments (HiRISE, CTX, CRISM, MARCI, MCS). La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et données ».',
        facts:[] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Hauteur', '6,5 m (avec l\'antenne)', 'kit'], ['Envergure', '13,6 m (panneaux déployés)', 'kit'],
        ['Masse au lancement', '2 180 kg, dont 1 149 kg d\'ergols et de pressurisant', 'kit'],
        ['Charge scientifique', '139 kg', 'kit'], ['Construction', 'Lockheed Martin Space Systems', 'kit'] ]},
      { title:'Mission', rows:[
        ['Lancement', '12 août 2005, Atlas V', 'hz'], ['Arrivée à Mars', '10 mars 2006', 'hz'],
        ['Aérofreinage', 'mars à octobre 2006', 'kit'], ['Début de la phase scientifique', 'novembre 2006', 'kit'] ]},
      { title:'Orbite scientifique', rows:[
        ['Type', 'quasi polaire', 'kit'], ['Altitude', '255 à 320 km', 'kit'], ['Période', '112 min', 'kit'] ]},
      { title:'Instruments', rows:[
        ['HiRISE', 'caméra, miroir de 50 cm ; pixels de 30 cm depuis 300 km', 'kit'],
        ['CTX', 'caméra de contexte, bandes de 30 km de large à 6 m par pixel', 'kit'],
        ['CRISM', 'spectromètre imageur, de 370 à 3 940 nm', 'kit'],
        ['MARCI', 'caméra couleur grand champ (météo)', 'kit'],
        ['MCS', 'sondeur climatique (profils de l\'atmosphère)', 'kit'],
        ['SHARAD', 'radar de sondage du sous-sol (ASI)', 'kit'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '34', 'stac'], ['Produits HiRISE (RDR v1.1)', '193 181', 'stac'], ['Produits CTX (EDR)', '164 625', 'stac'] ]}
    ]
  }
];
