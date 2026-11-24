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
     unit                       à la place de axis/size : mètres par unité de la maquette (mesurés sur une pièce de taille connue)
     model                      { src, license } : provenance et licence de la maquette, écrites à côté d'elle (règle 8)
     body                       { name, tex, nadir[, inc] } : corps visé, au centre de la vue (texture data/tex-<tex>.jpg) ; la sonde
                                tourne autour, nadir (direction des instruments dans le repère de la maquette) vers le centre ; inc :
                                inclinaison de l'orbite dessinée en degrés (90 : polaire, par défaut) ; orbite schématique
     view, sun                  cadrage initial { az, el, dist, r } (r : rayon de cadrage en mètres si de longues antennes faussent la boîte) ;
                                direction de la lumière dans le repère de la maquette
     real                       { key, alt } : donnée réelle (data/<key>.jpg et .json, tools/data/fetch_data.py) et son texte alternatif
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
    real:{ key:'mro-ctx', alt:"Extrait d'une image CTX de la surface de Mars" },
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
  },
  {
    id:'mex', name:'Mars Express', short:'Mars Express', year:'2003',
    agency:'ESA',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'2003-06-02', ref:'fs' },
      { type:'arrival', body:'Mars', date:'2003-12-25', ref:'fs' }
    ],
    horizons:'-41', stac:'ode-mars-mex-',
    file:'models/mex.glb', bytes:0, unit:0.008466,   /* antenne grand gain : 189 unités pour 1,6 m */
    model:{ src:'ESA SCIFLEET, « Mars Express »', license:'ESA SCIFLEET, téléchargement libre ; aucune licence de réutilisation écrite trouvée sur le site (à confirmer auprès de l\'ESA)', u:'https://scifleet.esa.int/' },
    body:{ name:'Mars', tex:'mars', nadir:[0, 1, 0] },   /* pont supérieur : HRSC, OMEGA et l'ancien emplacement de Beagle 2 */
    view:{ az:0.7, el:0.3, dist:1.5, r:5.5 }, sun:[0.5, 0.8, 0.4],
    real:{ key:'mex-img', alt:"Aperçu d'une image HRSC de la surface de Mars" },
    desc:"Lancée en 2003, Mars Express est la première sonde européenne vers Mars. Sur une orbite allongée et presque polaire, sa caméra HRSC cartographie la planète en couleur et en relief, OMEGA en dresse la minéralogie et le radar MARSIS sonde le sous-sol. Son atterrisseur Beagle 2 n'a jamais donné signe de vie.",
    checked:'2026-11-23',
    refs:{
      sc:{ t:'Mars Express : The spacecraft', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/The_spacecraft' },
      eng:{ t:'Mars Express : Engineering, Table of Facts', p:'ESA', u:'https://sci.esa.int/web/mars-express/31034-engineering' },
      fs:{ t:'Mars Express factsheet', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/Mars_Express_factsheet' },
      inst:{ t:'Mars Express orbiter instruments', p:'ESA', u:'https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/Mars_Express_orbiter_instruments' },
      hz:{ t:'JPL Horizons, objet -41 (Mars Express), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-mars-mex-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole fixe sur une face du module, pour les liaisons avec la Terre.',
        facts:[['Diamètre : 1,6 m', 'sc']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux orientables, repliés au lancement et déployés peu après.',
        facts:[['Surface : 11,42 m²', 'sc'], ['Plus de 500 W quand Mars est au plus loin du Soleil', 'sc']] },
      { key:'marsis', name:'Antennes du radar MARSIS', desc:'Longues antennes filaires du radar qui sonde le sous-sol et l\'ionosphère, déployées en orbite.',
        facts:[['Antenne de 40 m', 'inst']] },
      { key:'bus', name:'Module et instruments', desc:'Module central, réservoirs, moteur principal (dessous) et, sur le pont supérieur tourné vers Mars, les instruments (HRSC, OMEGA, SPICAM, PFS, ASPERA-3). La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et données ».',
        facts:[['Module : 1,5 × 1,8 × 1,4 m', 'sc'], ['Moteur principal : 400 N', 'sc']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '1,5 × 1,8 × 1,4 m', 'sc'], ['Masse au lancement', '1 223 kg, dont 427 kg d\'ergols', 'eng'],
        ['Charge scientifique', '116 kg (plus 71 kg pour l\'atterrisseur Beagle 2)', 'eng'], ['Panneaux solaires', '11,42 m²', 'sc'],
        ['Antenne grand gain', '1,6 m de diamètre', 'sc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '2 juin 2003, Soyouz-Fregat, Baïkonour', 'fs'], ['Arrivée à Mars', '25 décembre 2003', 'fs'],
        ['Beagle 2', 'déclaré perdu le 6 février 2004', 'fs'] ]},
      { title:'Orbite', rows:[
        ['Inclinaison', '86,3°', 'hz'], ['Altitude', '258 km au plus près, 11 560 km au plus loin', 'hz'], ['Période', '6 h 43 min', 'hz'] ]},
      { title:'Instruments', rows:[
        ['HRSC', 'caméra stéréo couleur : ≈ 10 m par pixel sur toute la planète, 2 m sur des zones choisies', 'inst'],
        ['OMEGA', 'spectromètre imageur de 0,5 à 5,2 µm (minéralogie)', 'inst'],
        ['MARSIS', 'radar de sondage du sous-sol, antenne de 40 m', 'inst'],
        ['SPICAM', 'spectromètre ultraviolet et infrarouge (ozone, vapeur d\'eau)', 'inst'],
        ['PFS', 'spectromètre de Fourier, de 1,2 à 45 µm (atmosphère)', 'inst'],
        ['ASPERA-3', 'ions, électrons et atomes neutres énergétiques', 'inst'],
        ['MaRS', 'radioscience avec le signal de la sonde', 'inst'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '18', 'stac'], ['Produits HRSC (RDR v4)', '62 003', 'stac'], ['Produits OMEGA (EDR)', '35 626', 'stac'] ]}
    ]
  },
  {
    id:'lro', name:'Lunar Reconnaissance Orbiter', short:'LRO', year:'2009',
    agency:'NASA (Goddard)',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'2009-06-18', ref:'nssdc' },
      { type:'arrival', body:'Lune', date:'2009-06-23', ref:'nssdc' }
    ],
    horizons:'-85', stac:'ode-moon-lro-',
    file:'models/lro.glb', bytes:0, unit:1,   /* unités ≈ mètres : panneau de 4,2 × 2,8 unités pour ≈ 4,3 × 3,2 m annoncés */
    model:{ src:'NASA 3D Resources, « Lunar Reconnaissance Orbiter (B) »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Lune', tex:'moon', nadir:[0, 0, 1] },   /* +Z de la maquette = +Z de la sonde : visée des LROC NAC, LOLA et LAMP vers le sol, antenne grand gain du côté -Z (NAIF, lro_frames_2014049_v01.tf) ; corrigé le 23/11/2026 (+Y visait le côté) */
    view:{ az:0.9, el:0.25, dist:1.5 }, sun:[0.6, 0.6, 0.5],
    real:{ key:'lro-img', alt:"Aperçu d'une mosaïque LROC de la surface de la Lune" },
    desc:"Lancée en 2009, LRO cartographie la Lune depuis une orbite polaire basse. Ses caméras LROC distinguent des détails d'un mètre, LOLA mesure le relief au laser, Diviner les températures et LEND cherche l'hydrogène des glaces polaires. Elle a photographié les sites d'atterrissage des missions Apollo.",
    checked:'2026-11-23',
    refs:{
      kit:{ t:'LRO/LCROSS Press Kit (juin 2009), copie de l\'archive web de l\'université de North Texas', p:'NASA', u:'https://webarchive.library.unt.edu/web/20090922191046/http://lro.gsfc.nasa.gov/images/LRO_LCROSS_presskit.pdf' },
      nssdc:{ t:'Lunar Reconnaissance Orbiter (2009-031A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-031A' },
      fs:{ t:'Lunar Reconnaissance Orbiter, NASA Facts FS-2013-04-025-GSFC', p:'NASA', u:'https://science.nasa.gov/wp-content/uploads/2024/01/lro-fact-sheet-bdf26a.pdf' },
      hz:{ t:'JPL Horizons, objet -85 (LRO), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-lro-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole en bandes S et Ka au bout d\'un mât articulé, pour envoyer les données vers la Terre.',
        facts:[['Déployée, elle s\'écarte de ≈ 2,6 m du module (102 pouces)', 'kit'], ['Débit vers la Terre : 100 Mbit/s', 'kit']] },
      { key:'solar', name:'Panneau solaire', desc:'Trois panneaux articulés d\'un seul côté de la sonde.',
        facts:[['Déployé : ≈ 4,3 × 3,2 m (168 × 126 pouces)', 'kit'], ['Puissance de la sonde : 685 W', 'kit']] },
      { key:'bus', name:'Module et instruments', desc:'Module, réservoirs, moteurs et, sur le pont tourné vers la Lune, les sept instruments (LROC, LOLA, Diviner, LAMP, LEND, CRaTER, Mini-RF). La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et données ».',
        facts:[['Masse sèche : 1 018 kg', 'kit']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Masse au lancement', '1 916 kg, dont 898 kg d\'ergols', 'kit'], ['Puissance', '685 W', 'kit'],
        ['Panneau solaire déployé', '≈ 4,3 × 3,2 m', 'kit'], ['Construction', 'NASA Goddard Space Flight Center', 'kit'] ]},
      { title:'Mission', rows:[
        ['Lancement', '18 juin 2009, Atlas V, avec LCROSS', 'nssdc'], ['Arrivée à la Lune', '23 juin 2009', 'nssdc'],
        ['Phase scientifique', 'depuis septembre 2010', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire', 'kit'], ['Altitude (première année)', '50 km, circulaire', 'kit'], ['Période', '113 min', 'kit'],
        ['Depuis septembre 2010', '≈ 30 × 180 km', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['LROC', 'deux caméras à petit champ (détails d\'un mètre sur 10 km de large) et une caméra grand champ couleur', 'kit'],
        ['LOLA', 'altimètre laser (relief, pentes des sites d\'atterrissage)', 'nssdc'],
        ['Diviner', 'radiomètre (températures de surface, pièges froids)', 'nssdc'],
        ['LAMP', 'cartographe en ultraviolet lointain (Lyman alpha)', 'nssdc'],
        ['LEND', 'détecteur de neutrons (hydrogène, glace), fourni par l\'IKI de Moscou', 'fs'],
        ['CRaTER', 'télescope à rayons cosmiques (doses de rayonnement)', 'nssdc'],
        ['Mini-RF', 'radar à synthèse d\'ouverture miniature', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '77', 'stac'], ['Produits LROC NAC (CDR v4)', '852 485', 'stac'], ['Produits LROC WAC (CDR v4)', '907 272', 'stac'] ]}
    ]
  },
  {
    id:'cassini', name:'Cassini-Huygens', short:'Cassini', year:'1997',
    agency:'NASA (JPL), ESA (sonde Huygens) et ASI (antenne grand gain)',
    targets:['Saturne', 'Titan'],
    events:[
      { type:'launch', body:'Terre', date:'1997-10-15', ref:'end' },
      { type:'flyby', body:'Vénus', date:'1998-04-26', ref:'end' },
      { type:'flyby', body:'Vénus', date:'1999-06-24', ref:'end' },
      { type:'flyby', body:'Terre', date:'1999-08-18', ref:'end' },
      { type:'flyby', body:'Jupiter', date:'2000-12-30', ref:'end' },
      { type:'orbit', body:'Saturne', date:'2004-07-01', ref:'end' },
      { type:'landing', body:'Titan', date:'2005-01-14', ref:'end' },
      { type:'end', body:'Saturne', date:'2017-09-15', ref:'end' }
    ],
    horizons:'-82', stac:'vim-cassini-',
    file:'models/cassini.glb', bytes:0, unit:1,   /* unités = mètres : antenne grand gain de 4,0 unités pour 4 m */
    model:{ src:'NASA 3D Resources, « Cassini-Huygens (A) »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Saturne', tex:'saturn', nadir:[0, 0, 1], inc:20 },   /* +Z de la maquette = -Y de la sonde, axe de visée de la palette de télédétection (ISS) ; vérifié avec le repère NAIF (cas_v43.tf, cas_iss_v10.ti) : antenne grand gain en -Z sonde (+Y maquette), Huygens en -X sonde (+X maquette), perche du magnétomètre en +Y sonde (-Z maquette) */
    view:{ az:0.6, el:0.2, dist:1.7, r:8 }, sun:[0.5, 0.7, 0.5],
    real:{ key:'cassini-img', alt:"Aperçu d'un cube VIMS de Titan", none:"Pas d'aperçu VIMS pour l'instant : le serveur qui publie les aperçus (Université de Nantes) refuse les connexions venant de GitHub Actions, d'où le site télécharge ses données." },
    desc:"Lancée en 1997, Cassini a tourné autour de Saturne de 2004 à 2017. Elle a largué la sonde européenne Huygens, qui s'est posée sur Titan en 2005, survolé Titan 127 fois et révélé des océans cachés sous la surface de Titan et d'Encelade. Sa mission s'est achevée par une plongée dans Saturne.",
    checked:'2026-11-23',
    refs:{
      end:{ t:'Cassini : End of Mission, Press Kit (septembre 2017)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/cassiniEndofMission.pdf' },
      arr:{ t:'Cassini-Huygens Saturn Arrival, Press Kit (juin 2004)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/cassini-arrival.pdf' },
      launch:{ t:'Cassini Launch, Press Kit (octobre 1997)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/cassini.pdf' },
      hz:{ t:'JPL Horizons, objet -82 (Cassini), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collection vim-cassini-vims-ir (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole fixe au sommet de la sonde, fournie par l\'Agence spatiale italienne.',
        facts:[['Diamètre : 4 m', 'arr']] },
      { key:'mag', name:'Perche du magnétomètre', desc:'Perche déployée en vol, qui éloigne les capteurs du champ magnétique de la sonde.',
        facts:[['Longueur : 11 m', 'arr']] },
      { key:'rpws', name:'Antennes du RPWS', desc:'Trois antennes fouets de l\'instrument d\'ondes radio et plasma, déroulées en vol.',
        facts:[['Longueur de chaque antenne : ≈ 10 m', 'arr']] },
      { key:'bus', name:'Module, instruments et Huygens', desc:'Pile de modules (équipements, propulsion), deux palettes d\'instruments, trois générateurs à radio-isotopes et, sur le côté, la sonde Huygens. La maquette ne permet pas de les séparer de façon sûre.',
        facts:[['Hauteur de la sonde : 6,7 m', 'end'], ['Sonde Huygens : 2,7 m de diamètre, 320 kg', 'launch']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Dimensions', '6,7 m de haut, 4 m de large', 'end'], ['Masse au lancement', '5 712 kg, avec les ergols et la sonde Huygens', 'end'],
        ['Masse en fin de mission', '2 125 kg', 'end'], ['Énergie', '885 W (633 W en fin de mission), générateurs à radio-isotopes', 'end'] ]},
      { title:'Mission', rows:[
        ['Lancement', '15 octobre 1997, Titan IVB/Centaur', 'end'],
        ['Survols', 'Vénus (26 avril 1998 et 24 juin 1999), Terre (18 août 1999), Jupiter (30 décembre 2000)', 'end'],
        ['Arrivée à Saturne', '1er juillet 2004 (TU)', 'end'], ['Huygens', 'larguée le 24 décembre 2004, descente sur Titan le 14 janvier 2005', 'end'],
        ['Fin de mission', '15 septembre 2017, plongée dans Saturne', 'end'] ]},
      { title:'Autour de Saturne', rows:[
        ['Orbites', '293', 'end'], ['Survols ciblés de Titan', '127', 'end'], ['Survols ciblés d\'Encelade', '23', 'end'], ['Images', '453 048', 'end'] ]},
      { title:'Instruments', rows:[
        ['ISS', 'caméras grand champ et petit champ', 'end'],
        ['VIMS', 'spectromètre imageur visible et infrarouge (composition des surfaces et des atmosphères)', 'arr'],
        ['CIRS', 'spectromètre infrarouge', 'end'], ['UVIS', 'spectrographe imageur ultraviolet', 'end'],
        ['RADAR', 'radar imageur (surface de Titan)', 'end'], ['RSS', 'radioscience', 'end'],
        ['CAPS, INMS, CDA, MIMI', 'plasma, ions et neutres, poussières, magnétosphère', 'end'],
        ['MAG, RPWS', 'champ magnétique, ondes radio et plasma', 'end'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '1 (VIMS, Titan)', 'stac'], ['Cubes VIMS de Titan', '20 672', 'stac'] ]}
    ]
  },
  {
    id:'messenger', name:'MESSENGER', short:'MESSENGER', year:'2004',
    agency:'NASA',
    targets:['Mercure', 'Vénus'],
    events:[
      { type:'launch', body:'Terre', date:'2004-08-03', ref:'nssdc' },
      { type:'flyby', body:'Terre', date:'2005-08-02', ref:'nssdc' },
      { type:'flyby', body:'Vénus', date:'2006-10-24', ref:'nssdc' },
      { type:'flyby', body:'Vénus', date:'2007-06-05', ref:'nssdc' },
      { type:'flyby', body:'Mercure', date:'2008-01-14', ref:'nssdc' },
      { type:'flyby', body:'Mercure', date:'2008-10-06', ref:'nssdc' },
      { type:'flyby', body:'Mercure', date:'2009-09-29', ref:'nssdc' },
      { type:'orbit', body:'Mercure', date:'2011-03-18', ref:'nssdc' },
      { type:'end', body:'Mercure', date:'2015-04-30', ref:'nssdc' }
    ],
    horizons:'-236', stac:'ode-mercury-messenger-',
    file:'models/messenger.glb', bytes:0, unit:1,   /* unités ≈ mètres : perche du magnétomètre ≈ 3,6 unités pour 3,6 m */
    model:{ src:'NASA 3D Resources, « MErcury Surface, Space ENvironment, GEochemistry, and Ranging (MESSENGER) »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Mercure', tex:'mercury', nadir:[0, -1, 0] },   /* pont inférieur : instruments dans l'anneau d'adaptation (NSSDCA : « bottom deck ») */
    view:{ az:0.5, el:0.2, dist:1.6 }, sun:[1, 0.3, 0.2],
    real:{ key:'messenger-img', alt:"Aperçu d'une mosaïque MDIS de la surface de Mercure" },
    desc:"Lancée en 2004, MESSENGER s'est placée en orbite autour de Mercure en 2011, après six survols de la Terre, de Vénus et de Mercure. Abritée derrière un pare-soleil en tissu céramique, elle a cartographié toute la planète et étudié les composés volatils des cratères polaires toujours à l'ombre, puis s'y est écrasée en 2015.",
    checked:'2026-11-23',
    refs:{
      nssdc:{ t:'MESSENGER (2004-030A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2004-030A' },
      kit:{ t:'MESSENGER Launch Press Kit (août 2004), copie de l\'archive web de l\'université de North Texas', p:'NASA', u:'https://webarchive.library.unt.edu/eot2008/20081102145358/http://www.nasa.gov/pdf/168019main_MESSENGER_71504_PressKit.pdf' },
      hz:{ t:'JPL Horizons, objet -236 (MESSENGER), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-mercury-messenger-* et ode-venus-messenger-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'shade', name:'Pare-soleil', desc:'Écran fixe en tissu céramique, toujours tourné vers le Soleil, derrière lequel s\'abrite le reste de la sonde.',
        facts:[['≈ 2,5 m de haut, 2 m de large', 'nssdc']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux ailes orientables qui dépassent du pare-soleil ; on les incline pour limiter leur échauffement.',
        facts:[['≈ 6 m de bout en bout', 'nssdc'], ['70 % de réflecteurs, 30 % de cellules', 'nssdc'], ['Puissance nominale en orbite de Mercure : 450 W', 'nssdc']] },
      { key:'mag', name:'Perche du magnétomètre', desc:'Perche qui porte le magnétomètre loin du module.',
        facts:[['Longueur : 3,6 m', 'nssdc']] },
      { key:'bus', name:'Module et instruments', desc:'Module, réservoirs, moteur principal et, sur le pont inférieur, les instruments (MDIS, GRNS, XRS, MLA, MASCS). La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et données ».',
        facts:[['Module : 1,27 × 1,42 × 1,85 m', 'nssdc'], ['Moteur principal : 645 N', 'nssdc']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '1,27 × 1,42 × 1,85 m', 'nssdc'], ['Pare-soleil', '≈ 2,5 m de haut, 2 m de large', 'nssdc'],
        ['Masse au lancement', '1 093 kg, dont 607,8 kg d\'ergols et d\'hélium', 'nssdc'], ['Puissance en orbite de Mercure', '450 W (nominale)', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '3 août 2004, Delta II', 'nssdc'], ['Survols', 'Terre (2 août 2005), Vénus (24 octobre 2006, 5 juin 2007), Mercure (14 janvier 2008, 6 octobre 2008, 29 septembre 2009)', 'nssdc'],
        ['Mise en orbite de Mercure', '18 mars 2011', 'nssdc'], ['Fin de mission', 'impact sur Mercure le 30 avril 2015', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Inclinaison', '80°', 'nssdc'], ['Altitude', '200 km au plus près, 15 193 km au plus loin', 'nssdc'], ['Période', '12 h', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['MDIS', 'deux caméras, grand champ et petit champ ; carte stéréo de toute la planète à 250 m par pixel', 'nssdc'],
        ['GRNS', 'spectromètre gamma et neutrons', 'nssdc'], ['XRS', 'spectromètre X', 'nssdc'],
        ['MLA', 'altimètre laser', 'nssdc'], ['MASCS', 'spectromètre de l\'atmosphère et de la surface', 'nssdc'],
        ['EPPS', 'particules énergétiques et plasma', 'nssdc'], ['MAG', 'magnétomètre, au bout de la perche de 3,6 m', 'nssdc'],
        ['RS', 'radioscience avec le système de télécommunications', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '100 pour Mercure, 61 pour Vénus', 'stac'], ['Produits MDIS NAC (CDR)', '306 454', 'stac'], ['Produits MDIS WAC (CDR)', '376 105', 'stac'] ]}
    ]
  },
  {
    id:'ody', name:'2001 Mars Odyssey', short:'Mars Odyssey', year:'2001',
    agency:'NASA (JPL), construite par Lockheed Martin ; détecteur HEND fourni par l\'IKI (Russie)',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'2001-04-07', ref:'kit' },
      { type:'arrival', body:'Mars', date:'2001-10-24', ref:'kit' }
    ],
    horizons:'-53', stac:'ode-mars-ody-',
    file:'models/ody.glb', bytes:0, unit:1,   /* unités = mètres : envergure du panneau 5,67 unités pour 5,7 m annoncés (dossier de presse) */
    model:{ src:'NASA 3D Resources, « Mars Odyssey »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Mars', tex:'mars', nadir:[-1, 0, 0] },   /* repère NAIF m01_v28.tf : THEMIS vise -X de la sonde ; +Z sonde (pont scientifique, perche GRS) = +Z maquette, +Y sonde (panneau replié) = +Y maquette */
    view:{ az:0.8, el:0.3, dist:1.5, r:4.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'ody-img', alt:"Aperçu d'une image THEMIS en lumière visible de la surface de Mars" },
    desc:"Lancée en 2001, Mars Odyssey est la plus ancienne sonde encore en service autour de Mars. Sa caméra THEMIS cartographie les minéraux et les températures de la surface en infrarouge, et son spectromètre gamma a révélé la glace d'eau enfouie sous les régions polaires. Elle relaie aussi les données des robots posés sur Mars.",
    checked:'2026-11-23',
    refs:{
      kit:{ t:'2001 Mars Odyssey Arrival, Press Kit (octobre 2001)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/odysseyarrival.pdf' },
      hz:{ t:'JPL Horizons, objet -53 (Mars Odyssey), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      naif:{ t:'Repère de la sonde, noyau SPICE m01_v28.tf', p:'NASA NAIF / PDS', u:'https://pds.nasa.gov/data/pds4/test-data/registry/odya_bundle/Document/PDS3_extras/CODE/m01_v28.tf' },
      stac:{ t:'STAC-PLANET, collections ode-mars-ody-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole sur un mât, verrouillée pendant l\'aérofreinage puis déployée et orientée par un cardan à deux axes.',
        facts:[['Diamètre : 1,3 m', 'kit']] },
      { key:'solar', name:'Panneau solaire', desc:'Trois panneaux repliés au lancement, d\'un seul côté de la sonde, orientés par un cardan à deux axes.',
        facts:[['Envergure : 5,7 m', 'kit'], ['1 500 W après le lancement, 750 W à Mars', 'kit']] },
      { key:'grs', name:'Perche du spectromètre gamma', desc:'La tête du spectromètre gamma, au bout d\'une perche, s\'éloigne des rayons gamma émis par la sonde elle-même.',
        facts:[['Longueur : 6,2 m', 'kit'], ['Déployée en 2002, après l\'aérofreinage', 'kit']] },
      { key:'bus', name:'Module et instruments', desc:'Module de propulsion et module d\'équipement. Sur le pont scientifique : THEMIS, les détecteurs de neutrons et les caméras stellaires. La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et instruments ».',
        facts:[['Module : 2,2 × 1,7 × 2,6 m', 'kit'], ['Moteur principal : 695 N', 'kit']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '2,2 m de long, 1,7 m de haut, 2,6 m de large', 'kit'], ['Masse au lancement', '729,7 kg, dont 353,4 kg d\'ergols et 44,5 kg d\'instruments', 'kit'],
        ['Puissance', '1 500 W après le lancement, 750 W à Mars', 'kit'], ['Antenne grand gain', '1,3 m de diamètre', 'kit'], ['Construction', 'Lockheed Martin Astronautics, Denver', 'kit'] ]},
      { title:'Mission', rows:[
        ['Lancement', '7 avril 2001, Delta II 7925, Cap Canaveral', 'kit'], ['Arrivée à Mars', '24 octobre 2001', 'kit'],
        ['Aérofreinage', 'à partir du 26 octobre 2001, environ trois mois', 'kit'], ['Mission principale', 'février 2002 – août 2004, prolongée depuis le 24 août 2004', 'hz'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, presque héliosynchrone', 'kit'], ['Altitude', '≈ 400 km, circulaire', 'kit'], ['Période', '118 min', 'kit'] ]},
      { title:'Instruments', rows:[
        ['THEMIS', 'caméra infrarouge (9 bandes, 100 m par pixel) et visible (5 bandes, 18 m par pixel)', 'kit'],
        ['GRS', 'spectromètre gamma sur perche, avec un spectromètre à neutrons et le détecteur HEND (hydrogène, glace)', 'kit'],
        ['MARIE', 'mesure du rayonnement en orbite de Mars', 'kit'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '49', 'stac'], ['Produits THEMIS IR (EDR)', '841 297', 'stac'], ['Produits THEMIS VIS (EDR)', '263 196', 'stac'] ]}
    ]
  },
  {
    id:'mgs', name:'Mars Global Surveyor', short:'MGS', year:'1996',
    agency:'NASA (JPL), construite par Lockheed Martin ; relais radio fourni par le CNES',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'1996-11-07', ref:'nssdc' },
      { type:'arrival', body:'Mars', date:'1997-09-12', ref:'nssdc' },
      { type:'end', body:'Mars', date:'2006-11-02', ref:'nssdc' }
    ],
    horizons:null, stac:'ode-mars-mgs-',
    file:'models/mgs.glb', bytes:0, unit:1,   /* unités ≈ mètres (panneaux de ≈ 3,5 unités pour 3,5 m annoncés) */
    model:{ src:'NASA 3D Resources, « Mars Global Surveyor »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Mars', tex:'mars', nadir:[0, 1, 0] },   /* pont nadir (MOC, MOLA, TES) sur +Y de la maquette, moteur sur -Y (NSSDCA) ; NAIF mgs_v10.tf : +Z sonde parallèle aux visées des instruments */
    view:{ az:0.8, el:0.3, dist:1.5, r:6.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'mgs-img', alt:"Aperçu d'une image MOC à petit champ de la surface de Mars" },
    desc:"Lancée en 1996, Mars Global Surveyor a cartographié Mars pendant plus de sept ans. Son altimètre laser MOLA a donné la première carte précise du relief martien, sa caméra MOC a révélé des ravines récentes et son magnétomètre les traces d'un ancien champ magnétique. Le contact a été perdu en novembre 2006.",
    checked:'2026-11-23',
    refs:{
      mocx:{ t:'Fiche d\'expérience NSSDCA : Mars Orbiter Camera (1996-062A-01)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1996-062A-01' },
      nssdc:{ t:'Mars Global Surveyor (1996-062A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-062A' },
      kit:{ t:'Mars Global Surveyor Arrival, Press Kit (septembre 1997)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/mgsarriv.pdf' },
      naif:{ t:'Repère de la sonde, noyau SPICE mgs_v10.tf', p:'NASA NAIF', u:'https://naif.jpl.nasa.gov/pub/naif/pds/data/mgs-m-spice-6-v1.0/mgsp_1000/data/fk/mgs_v10.tf' },
      stac:{ t:'STAC-PLANET, collections ode-mars-mgs-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole au bout d\'une perche, écartée du module pendant la cartographie.',
        facts:[['Diamètre : 1,5 m', 'nssdc'], ['Perche : 2 m', 'nssdc']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux ailes qui suivent le Soleil. Un panneau mal verrouillé au déploiement a obligé à freiner plus lentement dans l\'atmosphère. Les capteurs du magnétomètre sont au bout des panneaux.',
        facts:[['Chaque panneau : 3,5 × 1,9 m', 'nssdc'], ['Puissance : 980 W', 'nssdc']] },
      { key:'inst', name:'Pont des instruments', desc:'Face du module toujours tournée vers Mars : caméra MOC, altimètre laser MOLA, spectromètre TES et relais radio.',
        facts:[['Caméra MOC : 21 kg, 8 W en moyenne', 'mocx']] },
      { key:'bus', name:'Module', desc:'Module d\'équipement et module de propulsion, avec le moteur principal à l\'opposé des instruments.',
        facts:[['Module : 1,17 × 1,17 × 1,7 m', 'nssdc'], ['Moteur principal : 596 N', 'nssdc']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '1,17 × 1,17 × 1,7 m', 'nssdc'], ['Masse au lancement', '1 030,5 kg', 'nssdc'],
        ['Ergols', '216,5 kg d\'hydrazine et 144 kg de peroxyde d\'azote', 'nssdc'], ['Puissance', '980 W', 'nssdc'], ['Antenne grand gain', '1,5 m de diamètre, sur une perche de 2 m', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '7 novembre 1996, Delta II 7925, Cap Canaveral', 'nssdc'], ['Arrivée à Mars', '12 septembre 1997', 'nssdc'],
        ['Aérofreinage', 'jusqu\'en février 1999, ralenti par un panneau solaire endommagé', 'nssdc'], ['Cartographie', 'à partir de mars 1999', 'nssdc'],
        ['Fin de mission', 'contact perdu le 2 novembre 2006', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, héliosynchrone (2 h / 14 h)', 'nssdc'], ['Altitude', '378 km', 'nssdc'], ['Période', '118 min', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['MOC', 'caméra : 2 à 3 m par pixel au petit champ, 7,5 km au grand champ', 'kit'],
        ['MOLA', 'altimètre laser : 10 tirs par seconde, tache de 160 m au sol', 'kit'],
        ['TES', 'spectromètre infrarouge thermique (minéraux, poussière, nuages)', 'kit'],
        ['MAG/ER', 'magnétomètre et réflectomètre à électrons', 'kit'],
        ['RS', 'radioscience avec un oscillateur ultra-stable (gravité, atmosphère)', 'kit'],
        ['MR', 'relais radio fourni par le CNES', 'kit'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '12', 'stac'], ['Produits MOC grand champ', '100 499', 'stac'], ['Produits MOC petit champ', '95 797', 'stac'] ]}
    ]
  },
  {
    id:'tgo', name:'ExoMars Trace Gas Orbiter', short:'TGO', year:'2016',
    agency:'ESA et Roscosmos (instruments ACS et FREND menés par l\'IKI, Moscou)',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'2016-03-14', ref:'fs' },
      { type:'arrival', body:'Mars', date:'2016-10-19', ref:'fs' }
    ],
    horizons:'-143', stac:'ode-mars-em16tgo-',
    file:'models/tgo.glb', bytes:0, unit:0.0254,   /* ≈ 2,5 cm par unité : panneaux de 688 unités de bout en bout pour 17,5 m annoncés */
    model:{ src:'ESA SCIFLEET, « trace_gas_orbiter »', license:'ESA SCIFLEET, téléchargement libre ; aucune licence de réutilisation écrite trouvée sur le site (à confirmer auprès de l\'ESA)', u:'https://scifleet.esa.int/' },
    body:{ name:'Mars', tex:'mars', nadir:[-1, 0, 0] },   /* NAIF em16_tgo_v24.tf : -Y sonde vers Mars (pont scientifique), moteur et anneau du lanceur côté -X sonde (-Y maquette), antenne sur la face +Y sonde (+X maquette) */
    view:{ az:0.8, el:0.3, dist:1.5, r:9.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'tgo-img', alt:"Aperçu d'une image CaSSIS de la surface de Mars", none:'Les aperçus CaSSIS de l\'archive de l\'ESA ne sont pas accessibles sans compte (réponse 401) : pas encore de donnée réelle.' },
    desc:"Lancée en 2016 avec l'atterrisseur Schiaparelli, qui s'est écrasé, la sonde européenne et russe Trace Gas Orbiter cherche dans l'atmosphère de Mars les gaz présents en très faibles quantités, dont le méthane. Sa caméra CaSSIS photographie la surface en couleur et en relief, et elle sert de relais radio pour les robots posés sur Mars.",
    checked:'2026-11-23',
    refs:{
      fs:{ t:'ExoMars Factsheet (octobre 2016)', p:'ESA', u:'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/ExoMars/ExoMars_Factsheet' },
      nssdc:{ t:'ExoMars Trace Gas Orbiter (2016-017A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2016-017A' },
      inst:{ t:'ExoMars Trace Gas Orbiter Instruments', p:'ESA', u:'https://exploration.esa.int/web/mars/-/48523-trace-gas-orbiter-instruments' },
      naif:{ t:'Repère de la sonde, noyau SPICE em16_tgo_v24.tf', p:'NASA NAIF', u:'https://naif.jpl.nasa.gov/pub/naif/EXOMARS2016/kernels/fk/em16_tgo_v24.tf' },
      hz:{ t:'JPL Horizons, objet -143 (ExoMars TGO), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-mars-em16tgo-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Antenne grand gain', desc:'Parabole orientable par un cardan à deux axes, pour les liaisons avec la Terre.',
        facts:[['Diamètre : 2,2 m', 'nssdc']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux ailes orientables de part et d\'autre du module.',
        facts:[['17,5 m de bout en bout', 'fs'], ['Puissance : ≈ 2 000 W', 'nssdc']] },
      { key:'bus', name:'Module et instruments', desc:'Module en forme de boîte, moteur principal, et sur le pont tourné vers Mars les quatre instruments (ACS, CaSSIS, FREND, NOMAD) et la radio UHF Electra. La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et instruments ».',
        facts:[['Module : 3,5 × 2 × 2 m', 'fs'], ['Moteur principal : 424 N', 'nssdc']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '3,5 × 2 × 2 m', 'fs'], ['Masse au lancement', '3 732 kg, dont 113,8 kg d\'instruments (4 332 kg avec Schiaparelli)', 'fs'],
        ['Puissance', '≈ 2 000 W', 'nssdc'], ['Panneaux solaires', '17,5 m de bout en bout', 'fs'], ['Antenne grand gain', '2,2 m de diamètre', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '14 mars 2016, Proton-M/Briz-M, Baïkonour', 'fs'], ['Arrivée à Mars', '19 octobre 2016', 'fs'],
        ['Schiaparelli', 'ne s\'est pas posé correctement (19 octobre 2016)', 'fs'], ['Aérofreinage', 'mars 2017 – février 2018', 'nssdc'], ['Phase scientifique', 'depuis 2018', 'fs'] ]},
      { title:'Orbite', rows:[
        ['Type', 'circulaire', 'nssdc'], ['Altitude', '≈ 400 km', 'nssdc'], ['Période', '≈ 2 h', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['ACS', 'trois spectromètres infrarouges (0,7 à 17 µm) : composition et structure de l\'atmosphère', 'inst'],
        ['NOMAD', 'trois spectromètres, infrarouge (2,2 à 4,3 µm) et ultraviolet-visible (0,2 à 0,65 µm)', 'inst'],
        ['CaSSIS', 'caméra couleur et stéréo : ≈ 5 m par pixel sur une bande de 8 km', 'inst'],
        ['FREND', 'détecteur de neutrons : hydrogène (glace d\'eau) jusqu\'à ≈ 1 m de profondeur', 'inst'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '12', 'stac'], ['Produits CaSSIS (étalonnés)', '205 861', 'stac'], ['Produits NOMAD (bruts)', '155 691', 'stac'] ]}
    ]
  },
  {
    id:'vex', name:'Venus Express', short:'Venus Express', year:'2005',
    agency:'ESA',
    targets:['Vénus'],
    events:[
      { type:'launch', body:'Terre', date:'2005-11-09', ref:'fs' },
      { type:'arrival', body:'Vénus', date:'2006-04-11', ref:'voi' },
      { type:'end', body:'Vénus', date:'2014-12-16', ref:'fs' }
    ],
    horizons:'-248', stac:'ode-venus-vex-',
    file:'models/vex.glb', bytes:0, unit:0.025,   /* ≈ 2,5 cm par unité, estimé sur le module (1,7 m pour ≈ 70 unités) */
    model:{ src:'ESA SCIFLEET, « venus_express »', license:'ESA SCIFLEET, téléchargement libre ; aucune licence de réutilisation écrite trouvée sur le site (à confirmer auprès de l\'ESA)', u:'https://scifleet.esa.int/' },
    body:{ name:'Vénus', tex:'venus', nadir:[0, 1, 0] },   /* ESA VEX_V11.TF : +Z sonde vers Vénus (+Y maquette), moteur sur -Z sonde (-Y maquette), grande antenne HGA1 sur +X sonde (-Z maquette), panneaux sur ±Y sonde (±X maquette) */
    view:{ az:0.8, el:0.3, dist:1.5, r:4.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'vex-img', alt:'Donnée de Venus Express', none:'Les collections de Venus Express dans STAC-PLANET sont des spectres (VIRTIS) et des séries de mesures (MAG), sans aperçu image : pas de donnée réelle à montrer ici.' },
    desc:"Première sonde européenne vers Vénus, Venus Express a reposé sur la plateforme de Mars Express et des instruments hérités de Mars Express et de Rosetta. De 2006 à 2014, elle a étudié l'atmosphère épaisse de la planète, ses nuages, ses vents qui en font le tour en quelques jours et sa haute atmosphère balayée par le vent solaire.",
    checked:'2026-11-23',
    refs:{
      fs:{ t:'Venus Express fact sheet', p:'ESA', u:'https://sci.esa.int/web/venus-express/-/47115-fact-sheet' },
      voi:{ t:'Venus Express : Orbit insertion', p:'ESA', u:'https://sci.esa.int/web/venus-express/-/38947-orbit-insertion' },
      frame:{ t:'Repère de la sonde, noyau SPICE VEX_V11.TF', p:'ESA SPICE', u:'https://spiftp.esac.esa.int/data/PSA/VEX-E-V-SPICE-6-V2.0/DATA/FK/VEX_V11.TF' },
      hz:{ t:'JPL Horizons, objet -248 (Venus Express), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-venus-vex-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Grande antenne', desc:'Parabole fixe sur une face du module ; une seconde antenne plus petite, sur le dessus, servait près du Soleil.',
        facts:[['Visée à 5° de l\'axe X de la sonde', 'frame']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux orientables de part et d\'autre du module.',
        facts:[['Surface : 5,7 m²', 'fs'], ['1 100 W en orbite de Vénus', 'fs']] },
      { key:'bus', name:'Module et instruments', desc:'Module en nid d\'abeilles d\'aluminium, hérité de Mars Express ; sur le pont tourné vers Vénus, les instruments, et au-dessous le moteur principal. La maquette ne permet pas de les séparer de façon sûre : ils sont décrits dans « Mission et instruments ».',
        facts:[['Module : 1,7 × 1,7 × 1,4 m', 'fs']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Module', '1,7 × 1,7 × 1,4 m', 'fs'], ['Masse au lancement', '1 270 kg', 'fs'],
        ['Panneaux solaires', '5,7 m², 1 100 W en orbite', 'fs'], ['Plateforme', 'celle de Mars Express, modifiée', 'fs'] ]},
      { title:'Mission', rows:[
        ['Lancement', '9 novembre 2005, Soyouz-Fregat, Baïkonour', 'fs'], ['Mise en orbite de Vénus', '11 avril 2006, poussée d\'≈ 50 min', 'voi'],
        ['Contact perdu', '28 novembre 2014', 'fs'], ['Fin de mission', '16 décembre 2014', 'fs'] ]},
      { title:'Orbite', rows:[
        ['Type', 'elliptique, quasi polaire', 'fs'], ['Période', '24 h', 'fs'], ['Altitude', '≈ 250 km au plus près, ≈ 66 000 km au plus loin (au début)', 'fs'] ]},
      { title:'Instruments', rows:[
        ['VIRTIS', 'spectromètre imageur visible et infrarouge thermique', 'fs'], ['SPICAV', 'spectromètre de l\'atmosphère (ultraviolet et infrarouge)', 'fs'],
        ['PFS', 'spectromètre de Fourier', 'fs'], ['VMC', 'caméra de suivi de Vénus', 'fs'], ['ASPERA-4', 'plasma et atomes énergétiques', 'fs'],
        ['MAG', 'magnétomètre', 'fs'], ['VeRa', 'radioscience', 'fs'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '12', 'stac'], ['Produits VIRTIS (bruts)', '25 381', 'stac'], ['Produits MAG (bruts)', '6 875', 'stac'] ]}
    ]
  },
  {
    id:'mgn', name:'Magellan', short:'Magellan', year:'1989',
    agency:'NASA (JPL)',
    targets:['Vénus'],
    events:[
      { type:'launch', body:'Terre', date:'1989-05-04', ref:'nssdc' },
      { type:'arrival', body:'Vénus', date:'1990-08-10', ref:'nssdc' },
      { type:'end', body:'Vénus', date:'1994-10-12', ref:'nssdc' }
    ],
    horizons:null, stac:'ode-venus-mgn-',
    file:'models/mgn.glb', bytes:0, unit:1,   /* unités supposées en mètres (comme les autres maquettes NASA 3D Resources), non vérifiées sur une cote publiée */
    model:{ src:'NASA 3D Resources, « Magellan »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Vénus', tex:'venus-surface', nadir:[0, 1, 0] },   /* la grande parabole (+Y maquette) servait d'antenne au radar : tournée vers Vénus pendant la cartographie (schéma de principe : le radar visait en fait de côté) */
    view:{ az:0.8, el:0.3, dist:1.5, r:5.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'mgn-img', alt:"Aperçu d'une mosaïque radar Magellan de la surface de Vénus" },
    desc:"Lancée en 1989, Magellan a cartographié au radar, à travers les nuages, 98 % de la surface de Vénus avec des détails de moins de 100 m, puis mesuré son champ de gravité. Elle a été la première sonde à abaisser son orbite en freinant dans une atmosphère, avant de plonger dans celle de Vénus en 1994.",
    checked:'2026-11-23',
    refs:{
      nssdc:{ t:'Magellan Mission to Venus', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/planetary/magellan.html' },
      stac:{ t:'STAC-PLANET, collections ode-venus-mgn-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'hga', name:'Grande parabole et radar', desc:'Antenne grand gain des liaisons avec la Terre, qui servait aussi d\'antenne au radar à synthèse d\'ouverture : chaque orbite, une bande de surface était cartographiée.',
        facts:[['Bande d\'≈ 20 km de large sur 17 000 km de long par orbite', 'nssdc'], ['75 m par pixel', 'nssdc']] },
      { key:'alt', name:'Antenne de l\'altimètre', desc:'Cornet de l\'altimètre radar, qui mesurait le relief sous la sonde.',
        facts:[] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux de part et d\'autre du module.',
        facts:[] },
      { key:'bus', name:'Module et propulsion', desc:'Module d\'équipement et, au-dessous, le module de propulsion qui a placé la sonde en orbite de Vénus.',
        facts:[] }
    ],
    sections:[
      { title:'Mission', rows:[
        ['Lancement', '4 mai 1989', 'nssdc'], ['Arrivée à Vénus', '10 août 1990, orbite elliptique presque polaire', 'nssdc'],
        ['Cartographie radar', 'trois cycles de 243 jours, de septembre 1990 à septembre 1992', 'nssdc'],
        ['Gravité', 'cycles 4 et 5, de septembre 1992 à 1994', 'nssdc'], ['Aérofreinage', 'à partir du 24 mai 1993, vers une orbite circulaire', 'nssdc'],
        ['Fin de mission', 'signal perdu le 12 octobre 1994', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Type', 'elliptique, presque polaire', 'nssdc'], ['Altitude au plus près', '294 km (vers 9,5° N)', 'nssdc'] ]},
      { title:'Résultats', rows:[
        ['Surface cartographiée', '98 %, avec des détails de moins de 100 m', 'nssdc'], ['Orbites radar utilisables', '4 225', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '43', 'stac'], ['Produits radar (mosaïques FMAP)', '19 691', 'stac'], ['Produits radar (images de base)', '4 587', 'stac'] ]}
    ]
  },
  {
    id:'clem', name:'Clementine', short:'Clementine', year:'1994',
    agency:'BMDO (défense antimissile, États-Unis) et NASA ; sonde du Naval Research Laboratory',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'1994-01-25', ref:'info' },
      { type:'arrival', body:'Lune', date:'1994-02-19', ref:'info' },
      { type:'end', body:'Lune', date:'1994-05-05', ref:'info' }
    ],
    horizons:'-40', stac:'ode-moon-clem-',
    file:'models/clem.glb', bytes:0, unit:1,   /* unités supposées en mètres (comme les autres maquettes NASA 3D Resources), non vérifiées sur une cote publiée */
    model:{ src:'NASA 3D Resources, « Clementine »', license:'NASA, usage libre (conditions d\'utilisation des médias de la NASA)', u:'https://github.com/nasa/NASA-3D-Resources' },
    body:{ name:'Lune', tex:'moon', nadir:[0, 0, 1] },   /* bloc des capteurs sur la face +Z de la maquette, repéré à l'œil (pas de repère SPICE publié) */
    view:{ az:0.8, el:0.3, dist:1.5, r:3 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'clem-img', alt:"Aperçu d'une mosaïque Clementine UVVIS en rapports de couleurs (fausses couleurs : chaque teinte code un rapport entre filtres, lié à la composition)" },
    desc:"Petite sonde construite pour essayer des capteurs légers de la défense antimissile américaine, Clementine a passé deux mois en orbite polaire autour de la Lune en 1994. Elle en a fait la première carte complète en onze couleurs, près d'un million d'images, et mesuré son relief au laser. Une panne l'a ensuite empêchée de rejoindre l'astéroïde Geographos.",
    checked:'2026-11-23',
    refs:{
      info:{ t:'Clementine Mission (texte du CD-ROM de la mission, octobre 1994)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/planetary/cleminfo.html' },
      nssdc:{ t:'Clementine Project Information', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/planetary/clementine.html' },
      hz:{ t:'JPL Horizons, objet -40 (Clementine), en-tête de l\'objet', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-clem-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'sensors', name:'Capteurs', desc:'Caméras ultraviolet-visible, proche infrarouge, infrarouge thermique et haute résolution, et télémètre laser, regroupés sur une face de la sonde.',
        facts:[['Ensemble des capteurs : 8 kg', 'info']] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux orientables de part et d\'autre du module, sur un même axe.',
        facts:[['Puissance : 360 W', 'info']] },
      { key:'engine', name:'Moteur', desc:'Tuyère du moteur principal, sur le dessus du module.', facts:[] },
      { key:'hga', name:'Antenne grand gain', desc:'Antenne des liaisons avec la Terre, sous le module.', facts:[] },
      { key:'bus', name:'Module', desc:'Module octogonal : électronique, réservoirs, caméras stellaires.',
        facts:[['Masse à sec : ≈ 227 kg', 'info']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Masse', '≈ 227 kg à sec, autant d\'ergols ; 1 690 kg avec l\'étage de départ', 'info'], ['Puissance', '360 W', 'info'], ['Capteurs', '8 kg en tout', 'info'] ]},
      { title:'Mission', rows:[
        ['Lancement', '25 janvier 1994, Titan II, Vandenberg', 'info'], ['Mise en orbite lunaire', '19 février 1994', 'info'],
        ['Cartographie', 'du 26 février au 21 avril 1994, deux cycles', 'info'], ['Départ de la Lune', '5 mai 1994', 'info'],
        ['Panne', '7 mai 1994 : un propulseur a vidé les réservoirs, sonde en rotation à 80 tours par minute ; survol de Geographos annulé', 'info'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, elliptique', 'info'], ['Altitude au plus près', '425 ± 25 km', 'info'], ['Période', '≈ 5 h', 'info'] ]},
      { title:'Instruments', rows:[
        ['UVVIS', 'caméra ultraviolet-visible, 0,3 à 1,1 µm, 5 filtres et un large', 'info'], ['NIR', 'caméra proche infrarouge, ≈ 1 à 5,5 µm, 6 filtres', 'info'],
        ['LWIR', 'caméra infrarouge thermique, 8 à 9,5 µm', 'info'], ['HIRES', 'caméra haute résolution, 0,4 à 0,8 µm', 'info'],
        ['LIDAR', 'télémètre laser à 1 064 nm, résolution en distance de 40 m', 'info'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '20', 'stac'], ['Images HIRES (brutes)', '574 546', 'stac'], ['Images UVVIS (brutes)', '570 533', 'stac'] ]}
    ]
  },
  {
    id:'sln', name:'Kaguya (SELENE)', short:'Kaguya', year:'2007',
    agency:'JAXA',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'2007-09-14', ref:'jaxa' },
      { type:'arrival', body:'Lune', date:'2007-10-03', ref:'nasa' },
      { type:'end', body:'Lune', date:'2009-06-10', ref:'nasa' }
    ],
    horizons:null, stac:'ode-moon-sln-',   /* Horizons : « No such record » pour -131 (essai du 23 novembre 2026) */
    file:null, bytes:0,
    model:{ none:true },
    body:{ name:'Lune', tex:'moon', nadir:[0, -1, 0] },
    view:{ az:0.8, el:0.3, dist:1.5, r:3 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'sln-img', alt:'Aperçu d\'une image de la caméra TC de Kaguya', none:'Pas encore d\'aperçu image de Kaguya téléchargé depuis STAC-PLANET.' },
    desc:"Grande sonde lunaire japonaise, Kaguya a tourné autour de la Lune de 2007 à 2009 avec quinze instruments et deux petits satellites, Okina et Ouna. Ensemble, ils ont mesuré le relief, la composition, le sous-sol et la gravité de la Lune, y compris celle de la face cachée. La sonde a été précipitée sur la Lune à la fin de la mission.",
    checked:'2026-11-23',
    refs:{
      jaxa:{ t:'KAGUYA (SELENE) : About the satellite', p:'JAXA', u:'https://www.selene.jaxa.jp/en/about/about_sat_e.htm' },
      nasa:{ t:'Kaguya', p:'NASA Science', u:'https://science.nasa.gov/mission/kaguya/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-sln-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[],
    sections:[
      { title:'Véhicule', rows:[
        ['Orbiteur principal', '2,1 × 2,1 × 4,8 m, stabilisé sur trois axes', 'jaxa'], ['Masse', '≈ 3 t au lancement avec les deux petits satellites (2 900 kg selon la NASA)', 'jaxa'],
        ['Puissance', '3,5 kW au plus', 'jaxa'], ['Petits satellites', 'Okina (relais) et Ouna (radio VRAD), 50 kg chacun, stabilisés par rotation', 'jaxa'] ]},
      { title:'Mission', rows:[
        ['Lancement', '14 septembre 2007, H-IIA, Tanegashima', 'jaxa'], ['Mise en orbite lunaire', '3 octobre 2007', 'nasa'],
        ['Okina et Ouna', 'largués les 9 et 12 octobre 2007 ; Okina tombe sur la Lune le 12 février 2009', 'nasa'],
        ['Orbite abaissée', 'à ≈ 50 km le 1er février 2009', 'nasa'],
        ['Fin de mission', 'impact le 10 juin 2009, 65,5° S, 80,4° E, près du cratère Gill', 'nasa'] ]},
      { title:'Orbite', rows:[
        ['Type', 'circulaire, polaire (90°)', 'jaxa'], ['Altitude', '100 km, atteinte le 19 octobre 2007', 'jaxa'] ]},
      { title:'Instruments', rows:[
        ['TC', 'caméra stéréo du relief', 'jaxa'], ['MI', 'imageur multibande, neuf bandes visible et proche infrarouge', 'jaxa'], ['SP', 'spectromètre visible et proche infrarouge', 'jaxa'],
        ['LALT', 'altimètre laser', 'jaxa'], ['LRS', 'radar sondeur de la croûte, sur quelques kilomètres', 'jaxa'],
        ['XRS et GRS', 'spectromètres X et gamma : éléments de la surface', 'jaxa'], ['RSAT et VRAD', 'suivi radio des petits satellites : gravité, y compris face cachée', 'jaxa'],
        ['Autres', 'LMAG, CPS, PACE, RS, UPI, et deux caméras HDTV (Terre et Lune)', 'jaxa'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '64', 'stac'], ['Images MI (niveau 3C)', '378 072', 'stac'], ['Images HDTV', '275 100', 'stac'] ]}
    ]
  },
  {
    id:'ch1', name:'Chandrayaan-1', short:'Chandrayaan-1', year:'2008',
    agency:'ISRO (Inde), avec des instruments de l\'ESA, de la NASA et de la Bulgarie',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'2008-10-22', ref:'isro' },
      { type:'arrival', body:'Lune', date:'2008-11-08', ref:'nasa' },
      { type:'end', body:'Lune', date:'2009-08-28', ref:'nasa' }
    ],
    horizons:null, stac:'ode-moon-ch1-',   /* Horizons -86 : pas d'éphémérides avant juillet 2016 (essai du 23 novembre 2026) */
    file:null, bytes:0,
    model:{ none:true },
    body:{ name:'Lune', tex:'moon', nadir:[0, -1, 0] },
    view:{ az:0.8, el:0.3, dist:1.5, r:3 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'ch1-img', alt:'Aperçu d\'une bande d\'images du spectromètre M3 de Chandrayaan-1', none:'Pas encore d\'aperçu image de Chandrayaan-1 téléchargé depuis STAC-PLANET.' },
    desc:"Première sonde lunaire de l'Inde, Chandrayaan-1 a tourné autour de la Lune de novembre 2008 à août 2009 avec onze instruments, dont six venus d'autres pays. Son spectromètre M3, fourni par la NASA, a détecté de l'eau et des molécules hydroxyle à la surface, et son radar Mini-SAR des signes de glace au fond des cratères polaires.",
    checked:'2026-11-23',
    refs:{
      isro:{ t:'Chandrayaan-1', p:'ISRO', u:'https://www.isro.gov.in/Chandrayaan_1.html' },
      sci:{ t:'Chandrayaan-1 : science', p:'ISRO', u:'https://www.isro.gov.in/Chandrayaan-1_science.html' },
      nasa:{ t:'Chandrayaan-1', p:'NASA Science', u:'https://science.nasa.gov/mission/chandrayaan-1/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-ch1-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[],
    sections:[
      { title:'Véhicule', rows:[
        ['Masse', '1 380 kg au lancement', 'isro'], ['Puissance', '700 W', 'isro'], ['Durée prévue', '2 ans', 'isro'] ]},
      { title:'Mission', rows:[
        ['Lancement', '22 octobre 2008, PSLV-C11, Sriharikota', 'isro'], ['Mise en orbite lunaire', '8 novembre 2008', 'nasa'],
        ['Sonde d\'impact (MIP)', 'larguée en novembre 2008, tombée près du cratère Shackleton', 'nasa'],
        ['Orbite relevée', 'à 200 km en mai 2009', 'isro'],
        ['Fin de mission', 'dernier contact le 28 août 2009 (29 août selon l\'ISRO), panne d\'alimentation probable', 'nasa'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire', 'sci'], ['Altitude', '100 km, puis 200 km', 'isro'] ]},
      { title:'Instruments', rows:[
        ['TMC', 'caméra stéréo du relief, 5 m au sol, fauchée de 20 km', 'sci'], ['HySI', 'imageur hyperspectral, 64 bandes de 0,4 à 0,95 µm, 80 m', 'sci'],
        ['M3', 'spectromètre imageur de 0,7 à 3,0 µm (NASA : Brown, JPL)', 'sci'], ['Mini-SAR', 'radar à 2,38 GHz : glace des cratères polaires (NASA : APL)', 'sci'],
        ['SIR-2 et C1XS', 'spectromètres infrarouge et X (ESA)', 'sci'], ['SARA', 'imageur d\'atomes neutres (ESA, Suède, ISRO)', 'sci'],
        ['Autres', 'LLRI (altimètre laser), HEX (gamma), RADOM (radiations, Bulgarie), MIP', 'sci'] ]},
      { title:'Résultats', rows:[
        ['Eau en surface', 'M3 détecte des molécules hydroxyle et d\'eau (publications de septembre 2009)', 'nasa'],
        ['Glace', 'plus de 40 petits cratères avec de la glace près du pôle Nord (Mini-SAR)', 'nasa'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '8', 'stac'], ['Images M3 brutes', '1 509', 'stac'], ['Cartes Mini-SAR', '6 848', 'stac'] ]}
    ]
  },
  {
    id:'kplo', name:'Danuri (KPLO)', short:'Danuri', year:'2022',
    agency:'KARI (Corée du Sud), avec une caméra de la NASA',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'2022-08-04', ref:'nasa' },
      { type:'arrival', body:'Lune', date:'2022-12-27', ref:'kr' }
    ],
    horizons:'-155', stac:'ode-moon-kplo-',
    file:'models/kplo.glb', bytes:0, unit:1,
    model:{ src:'NASA Eyes on the Solar System, « Danuri » (textures retirées : couleurs simplifiées)', license:'NASA/JPL-Caltech, usage libre (règles d\'usage des médias de la NASA, qui couvrent les maquettes 3D)', u:'https://eyes.nasa.gov/apps/solar-system/' },
    body:{ name:'Lune', tex:'moon', nadir:[0, -1, 0] },   /* ShadowCam et PolCam tournées vers -Y, antenne grand gain vers +Y, d\'après la maquette (≈) */
    view:{ az:0.8, el:0.3, dist:1.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'kplo-img', alt:'Aperçu d\'une image ShadowCam (cratère d\'ombre permanente)', none:'Pas encore d\'aperçu ShadowCam téléchargé depuis STAC-PLANET.' },
    desc:"Première sonde lunaire de la Corée du Sud, Danuri a rejoint la Lune fin 2022 par une longue trajectoire de quatre mois et demi qui économise le carburant. En orbite polaire, elle photographie la surface, mesure son magnétisme et sa composition. Sa caméra ShadowCam, fournie par la NASA, voit le fond des cratères qui ne reçoivent jamais le Soleil.",
    checked:'2026-11-23',
    refs:{
      tps:{ t:'Danuri, South Korea\'s first Moon mission', p:'The Planetary Society', u:'https://planetary.org/space-missions/kplo' },
      nasa:{ t:'NASA\'s ShadowCam Launches Aboard Korea Pathfinder Lunar Orbiter (4 août 2022)', p:'NASA', u:'https://www.nasa.gov/blogs/missions/2022/08/04/nasas-shadowcam-launches-aboard-korea-pathfinder-lunar-orbiter' },
      kr:{ t:'Danuri\'s lunar orbit makes Korea 7th nation to send craft to moon (29 décembre 2022)', p:'Korea.net', u:'https://www.korea.net/NewsFocus/Sci-Tech/view?articleId=226643' },
      hz:{ t:'JPL Horizons, objet -155 (KPLO)', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-kplo-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'shadowcam', name:'ShadowCam', desc:'Caméra de la NASA pour le fond des cratères d\'ombre permanente, éclairé seulement par la lumière renvoyée par les reliefs voisins (cylindre brun).',
        facts:[['Jusqu\'à 1,7 m par pixel', 'nasa']] },
      { key:'polcam', name:'Caméra polarimétrique', desc:'Caméra grand angle coréenne qui reconnaît la nature des matériaux d\'après la lumière diffusée (nom « PolCam » dans la maquette).', facts:[] },
      { key:'hga', name:'Antenne grand gain', desc:'Antenne parabolique orientable des liaisons avec la Terre, au sommet de la sonde.', facts:[] },
      { key:'mag', name:'Perche du magnétomètre', desc:'Perche qui éloigne le magnétomètre des champs de la sonde.', facts:[] },
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux de part et d\'autre du module.', facts:[] },
      { key:'bus', name:'Module', desc:'Module, réservoirs et équipements ; il porte aussi la caméra haute résolution et le spectromètre gamma, non distingués sur la maquette.', facts:[] }
    ],
    sections:[
      { title:'Mission', rows:[
        ['Lancement', '4 août 2022 à 19 h 08 (heure de Floride), Falcon 9, Cap Canaveral', 'nasa'],
        ['Trajectoire', 'transfert balistique de ≈ 4,5 mois, économe en carburant', 'nasa'],
        ['Orbite de mission', 'atteinte le 27 décembre 2022', 'kr'], ['Science', 'à partir de janvier 2023', 'tps'],
        ['Carburant', '93 kg restants sur 260 kg à l\'arrivée', 'kr'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, ≈ circulaire', 'nasa'], ['Altitude', '≈ 100 km', 'tps'], ['Période', '≈ 2 h', 'kr'] ]},
      { title:'Instruments', rows:[
        ['Caméra haute résolution', '2,5 m par pixel', 'tps'], ['Caméra polarimétrique grand angle', 'nature des matériaux d\'après la lumière diffusée', 'tps'],
        ['Spectromètre gamma', 'composition en éléments', 'tps'], ['Magnétomètre', 'anomalies magnétiques locales (« swirls »)', 'tps'],
        ['ShadowCam', 'caméra de la NASA (ASU, MSSS), des centaines de fois plus sensible que celle de LRO, jusqu\'à 1,7 m par pixel', 'nasa'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '5 (ShadowCam seulement)', 'stac'], ['Images ShadowCam brutes', '38 461', 'stac'] ]}
    ]
  },
  {
    id:'lp', name:'Lunar Prospector', short:'Lunar Prospector', year:'1998',
    agency:'NASA (programme Discovery, Ames)',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'1998-01-07', ref:'nssdc' },
      { type:'arrival', body:'Lune', date:'1998-01-11', ref:'nssdc' },
      { type:'end', body:'Lune', date:'1999-07-31', ref:'nssdc' }
    ],
    horizons:'-25', stac:'ode-moon-lp-',
    file:'models/lp.glb', bytes:0, unit:1,
    model:{ src:'NASA Eyes on the Solar System, « Lunar Prospector »', license:'NASA/JPL-Caltech, usage libre (règles d\'usage des médias de la NASA, qui couvrent les maquettes 3D)', u:'https://eyes.nasa.gov/apps/solar-system/' },
    body:{ name:'Lune', tex:'moon', nadir:[0, 0, 1] },   /* sonde en rotation (axe +Y) : le corps est placé du côté de la perche du spectromètre gamma (+Z), schéma de principe */
    view:{ az:0.8, el:0.3, dist:1.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'lp-img', alt:'Donnée de Lunar Prospector', none:'Les instruments de Lunar Prospector comptent des particules et mesurent des champs : leurs collections dans STAC-PLANET n\'ont pas d\'aperçu image.' },
    desc:"Petite sonde en forme de tambour, sans ordinateur de bord, Lunar Prospector a tourné un an et demi autour de la Lune en 1998 et 1999. Ses spectromètres ont cartographié les éléments de la surface et trouvé un excès d'hydrogène aux pôles, signe possible de glace. Elle a été précipitée dans un cratère du pôle Sud à la fin de la mission.",
    checked:'2026-11-23',
    refs:{
      nssdc:{ t:'Lunar Prospector (1998-001A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1998-001A' },
      ns:{ t:'Fiche d\'expérience NSSDCA : Neutron Spectrometer (NS)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1998-001A-02' },
      grs:{ t:'Fiche d\'expérience NSSDCA : Gamma Ray Spectrometer (GRS)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1998-001A-01' },
      hz:{ t:'JPL Horizons, objet -25 (Lunar Prospector)', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      aps:{ t:'Fiche d\'expérience NSSDCA : Alpha Particle Spectrometer (APS)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1998-001A-03' },
      stac:{ t:'STAC-PLANET, collections ode-moon-lp-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'bus', name:'Tambour', desc:'Tambour en graphite-époxy couvert de cellules solaires, qui tourne sur lui-même ; trois réservoirs d\'hydrazine à l\'intérieur.',
        facts:[['1,37 m de diamètre, 1,28 m de haut', 'nssdc'], ['Puissance : 186 W en moyenne', 'nssdc'], ['Rotation : 12 tours par minute', 'nssdc']] },
      { key:'booms', name:'Perches', desc:'Trois perches radiales, déployées pendant la croisière, qui éloignent les instruments du tambour.',
        facts:[['Longueur : 2,5 m', 'nssdc']] },
      { key:'grs', name:'Spectromètre gamma (GRS)', desc:'Cylindre au bout d\'une perche : un cristal de germanate de bismuth entouré d\'un bouclier anticoïncidence.',
        facts:[['Boîtier de 55,4 cm de long', 'grs']] },
      { key:'ns', name:'Spectromètres à neutrons et alpha (NS, APS)', desc:'Deux compteurs à hélium 3 perpendiculaires à la perche, et le cube du spectromètre alpha, au bout de la même perche.',
        facts:[['Compteurs de 29 cm de long', 'ns'], ['Cube APS : ≈ 18 cm de côté', 'aps']] },
      { key:'mag', name:'Réflectomètre et magnétomètre (ER, MAG)', desc:'Le réflectomètre à électrons au bout de la troisième perche, et le magnétomètre au bout d\'une rallonge, loin des champs de la sonde.',
        facts:[['Rallonge : 1,1 m', 'nssdc']] },
      { key:'antenna', name:'Antenne', desc:'Antenne moyen gain à fentes, sur l\'axe de rotation (identifiée d\'après la maquette).', facts:[] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Forme', 'tambour de 1,37 m de diamètre et 1,28 m de haut, trois perches de 2,5 m', 'nssdc'], ['Masse', '296,4 kg avec les ergols, 158,7 kg à sec', 'nssdc'],
        ['Puissance', '186 W en moyenne (cellules sur la coque)', 'nssdc'], ['Stabilisation', 'par rotation, 12 tours par minute', 'nssdc'], ['Ordinateur de bord', 'aucun : tout est commandé depuis le sol', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '7 janvier 1998, Athena 2, Cap Canaveral', 'nssdc'], ['Croisière', '105 heures', 'nssdc'],
        ['Orbite de cartographie', 'atteinte le 16 janvier 1998', 'nssdc'], ['Mission prolongée', 'à partir du 28 janvier 1999, orbite abaissée', 'nssdc'],
        ['Fin de mission', 'impact volontaire près du pôle Sud le 31 juillet 1999 (87,7° S, 42,0° E)', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, quasi circulaire', 'nssdc'], ['Altitude', '100 km, puis 40 km et 15 × 45 km', 'nssdc'], ['Période', '118 min', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['GRS', 'spectromètre gamma : uranium, thorium, potassium et autres éléments', 'grs'], ['NS', 'spectromètre à neutrons : hydrogène, donc glace d\'eau possible', 'ns'],
        ['APS', 'spectromètre alpha : dégazages de radon', 'nssdc'], ['MAG et ER', 'magnétomètre et réflectomètre à électrons : champs magnétiques de la croûte', 'nssdc'],
        ['DGE', 'gravité par effet Doppler sur le signal radio', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '15', 'stac'] ]}
    ]
  },
  {
    id:'grail', name:'GRAIL (Ebb et Flow)', short:'GRAIL', year:'2011',
    agency:'NASA (JPL, programme Discovery), sondes construites par Lockheed Martin',
    targets:['Lune'],
    events:[
      { type:'launch', body:'Terre', date:'2011-09-10', ref:'nssdc' },
      { type:'arrival', body:'Lune', date:'2011-12-31', ref:'nssdc' },
      { type:'end', body:'Lune', date:'2012-12-17', ref:'nssdc' }
    ],
    horizons:'-177', stac:'ode-moon-grail-',
    file:'models/grail.glb', bytes:0, unit:1,
    model:{ src:'NASA Eyes on the Solar System, « GRAIL » (GRAIL-B « Flow » ; GRAIL-A est identique)', license:'NASA/JPL-Caltech, usage libre (règles d\'usage des médias de la NASA, qui couvrent les maquettes 3D)', u:'https://eyes.nasa.gov/apps/solar-system/' },
    body:{ name:'Lune', tex:'moon', nadir:[0, -1, 0] },   /* orientation vers la Lune non publiée dans les sources relevées : face opposée aux panneaux, ≈ */
    view:{ az:0.8, el:0.3, dist:1.5 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'grail-img', alt:'Donnée de GRAIL', none:'GRAIL mesure la distance entre ses deux sondes : ses collections dans STAC-PLANET sont des séries de mesures et des modèles de gravité, sans aperçu image.' },
    desc:"Deux sondes jumelles, GRAIL-A et GRAIL-B, ont volé l'une derrière l'autre autour de la Lune en 2012. En mesurant en permanence la distance qui les séparait, elles ont dressé la carte la plus précise du champ de gravité lunaire, qui révèle la structure de la croûte et des grands bassins d'impact.",
    checked:'2026-11-23',
    refs:{
      nssdc:{ t:'GRAIL-A (2011-046A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2011-046A' },
      hz:{ t:'JPL Horizons, objet -177 (GRAIL-A)', p:'NASA JPL', u:'https://ssd.jpl.nasa.gov/horizons/app.html#/' },
      stac:{ t:'STAC-PLANET, collections ode-moon-grail-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[
      { key:'solar', name:'Panneaux solaires', desc:'Deux panneaux déployés depuis la plateforme supérieure ; une batterie lithium-ion stocke l\'énergie.', facts:[] },
      { key:'engine', name:'Propulseur', desc:'Propulseur principal, sur la plateforme supérieure ; un système à gaz chaud et trois roues de réaction assurent le contrôle fin.',
        facts:[['Poussée : 22 N', 'nssdc']] },
      { key:'bus', name:'Module', desc:'Prisme rectangulaire de la plateforme XSS-11 de Lockheed Martin. Il porte l\'instrument LGRS (antenne en bande Ka alignée avec le centre de masse des deux sondes) et les caméras MoonKAM, non distingués ici.',
        facts:[['Masse à sec : 132,6 kg', 'nssdc']] }
    ],
    sections:[
      { title:'Véhicule', rows:[
        ['Deux sondes', 'GRAIL-A et GRAIL-B, sur la plateforme XSS-11 de Lockheed Martin', 'nssdc'], ['Masse de chaque sonde', '132,6 kg à sec, 202,4 kg avec les ergols', 'nssdc'],
        ['Mesure', 'liaison radio en bande Ka entre les deux sondes (LGRS), héritée de la mission terrestre GRACE', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '10 septembre 2011, Delta II, Cap Canaveral', 'nssdc'], ['Croisière', '≈ 3,5 mois, par le point de Lagrange L1 Soleil-Terre', 'nssdc'],
        ['Mise en orbite lunaire', '31 décembre 2011 (A) et 1er janvier 2012 (B)', 'nssdc'], ['Phase scientifique', '90 jours, trois cycles de 27,3 jours', 'nssdc'],
        ['Fin de mission', 'impacts le 17 décembre 2012, près de 75,6° N', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Type', 'polaire, quasi circulaire, en tandem', 'nssdc'], ['Altitude', '50 km', 'nssdc'], ['Période', '113 min', 'nssdc'], ['Écart entre les sondes', '175 à 225 km', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['LGRS', 'mesure de la distance entre les deux sondes, d\'où le champ de gravité', 'nssdc'], ['MoonKAM', 'caméras pour les élèves (jusqu\'à 5 par sonde)', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections', '7', 'stac'] ]}
    ]
  },
  {
    id:'vo', name:'Viking 1 (orbiteur)', short:'Viking 1', year:'1975',
    agency:'NASA (Langley, JPL)',
    targets:['Mars'],
    events:[
      { type:'launch', body:'Terre', date:'1975-08-20', ref:'nssdc' },
      { type:'arrival', body:'Mars', date:'1976-06-19', ref:'nssdc' },
      { type:'end', body:'Mars', date:'1980-08-17', ref:'nssdc' }
    ],
    horizons:null, stac:'ode-mars-vo-',
    file:null, bytes:0,
    model:{ none:true },
    body:{ name:'Mars', tex:'mars', nadir:[0, -1, 0] },
    view:{ az:0.8, el:0.3, dist:1.5, r:3 }, sun:[0.4, 0.8, 0.4],
    real:{ key:'vo-img', alt:"Aperçu d'une mosaïque d'images des orbiteurs Viking" },
    desc:"Les deux sondes Viking, lancées en 1975, associaient chacune un orbiteur et un atterrisseur. L'orbiteur de Viking 1 a photographié Mars pour choisir le site d'atterrissage, déposé l'atterrisseur à Chryse Planitia en juillet 1976, puis cartographié la planète jusqu'en 1980. Ses images ont longtemps été la référence pour la géographie martienne.",
    checked:'2026-11-23',
    refs:{
      nssdc:{ t:'Viking 1 Orbiter (1975-075A)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1975-075A' },
      vis:{ t:'Fiche d\'expérience NSSDCA : Visual Imaging Subsystem (VIS)', p:'NASA NSSDCA', u:'https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1975-075A-01' },
      stac:{ t:'STAC-PLANET, collections ode-mars-vo-* (sonde du 23 novembre 2026)', p:'PDSSP (CNES)', u:'https://stacplanet.pdssp.eu/' }
    },
    parts:[],
    sections:[
      { title:'Véhicule', rows:[
        ['Forme', 'octogone d\'≈ 2,5 m, hérité de Mariner 9', 'nssdc'], ['Masse au lancement', '2 328 kg, dont 1 445 kg d\'ergols et de gaz', 'nssdc'],
        ['Panneaux solaires', '4 ailes, 9,75 m de bout en bout, 620 W à Mars', 'nssdc'], ['Antenne grand gain', '≈ 1,5 m, orientable', 'nssdc'], ['Moteur', '1 323 N', 'nssdc'] ]},
      { title:'Mission', rows:[
        ['Lancement', '20 août 1975, Titan IIIE-Centaur, Cap Canaveral', 'nssdc'], ['Mise en orbite de Mars', '19 juin 1976', 'nssdc'],
        ['Atterrisseur', 'posé à Chryse Planitia le 20 juillet 1976', 'nssdc'], ['Fin des opérations', '17 août 1980, après 1 485 orbites', 'nssdc'] ]},
      { title:'Orbite', rows:[
        ['Au début', '1 513 × 33 000 km, 24,66 h', 'nssdc'], ['Depuis 1980', '320 × 56 000 km, pour éviter toute chute sur Mars avant 2019', 'nssdc'] ]},
      { title:'Instruments', rows:[
        ['VIS', 'deux caméras de télévision, filtres de couleur, plateforme orientable', 'vis'], ['IRTM', 'radiomètre infrarouge : températures de la surface et de l\'atmosphère', 'nssdc'],
        ['MAWD', 'spectromètre : vapeur d\'eau de l\'atmosphère (bande de 1,4 µm)', 'nssdc'], ['Radioscience', 'suivi radio de l\'orbiteur (gravité, atmosphère)', 'nssdc'] ]},
      { title:'Données dans STAC-PLANET', rows:[
        ['Collections (orbiteurs Viking 1 et 2 réunis)', '5', 'stac'], ['Images VIS brutes', '47 797', 'stac'] ]}
    ]
  }
];
