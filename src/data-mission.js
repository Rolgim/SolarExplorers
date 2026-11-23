/* =================================================================
   MISSION ET TRAITEMENTS — sous-page « Mission et traitements » de chaque sonde (schéma d'Observatories v1.0, src/data-mission.js).
   MISSION[id] = { intro, phases:[[date, titre, texte, sources]], ops:[[libellé, valeur, sources]], refs, checked }
   Textes bilingues par L(fr, en) (data-inst.js). Les clés de source renvoient à MISSION[id].refs, puis à INST_DATA[id].refs,
   puis aux refs de la fiche (data-missions.js). La chaîne de traitement est calculée à partir des collections STAC-PLANET
   (data-stac.js) : chaque collection est rangée dans un niveau de traitement d'après son suffixe (EDR, RDR, DDR…).
   Valeurs relevées dans les dossiers de presse et les fiches NSSDCA (tools/probe/probe_sources.py, 23 novembre 2026).
================================================================= */
var MISSION_LEVELS = [
  /* [clé, nom, ce que c'est, motif du suffixe de collection] ; définitions des niveaux : glossaire et normes du PDS (ref pds) */
  ['raw', L('Données brutes', 'Raw data'), L('Les valeurs telles que la sonde les a envoyées, remises en ordre et datées (EDR, « Experiment Data Record »).', 'Values as the spacecraft sent them, put back in order and time-tagged (EDR, “Experiment Data Record”).'),
    /(^|-)(edr\w*|raw\w*|sciedr|viredr|uvvedr|edrnac|edrwac|eng|status|command|hk\w*)$/],
  ['cal', L('Données étalonnées', 'Calibrated data'), L('Converties en grandeurs physiques (luminance, réflectance, temps aller-retour, comptages corrigés), instrument par instrument (RDR, CDR).', 'Converted into physical quantities (radiance, reflectance, round-trip time, corrected counts), instrument by instrument (RDR, CDR).'),
    /(^|-)(\w*rdr\w*|\w*cdr\w*|cal\w*|l1\w*|sci\w*)$/],
  ['der', L('Données dérivées', 'Derived data'), L('Géométrie d\'observation, éclairage, paramètres déduits des mesures (DDR) : ce qui sert à interpréter chaque produit.', 'Viewing geometry, lighting, parameters derived from the measurements (DDR): what is needed to interpret each product.'),
    /(^|-)(\w*ddr\w*|ancill\w*|geo\w*|spice\w*|\w*ter|lmlp|valrep)$/],
  ['map', L('Cartes et mosaïques', 'Maps and mosaics'), L('Produits assemblés sur une grille du corps : mosaïques, modèles de terrain, cartes globales (MRDR, GDR, DTM…).', 'Products assembled on a grid of the body: mosaics, terrain models, global maps (MRDR, GDR, DTM…).'),
    /(^|-)(\w*mrdr\w*|\w*gdr\w*|dtm\w*|\w*map\w*|\w*mos\w*|\w*mdr\w*|\w*shadr|ghrm|gcp|pcp|rcp|prp|epf|l2|l3)$/]
];
var MISSION_REFS = {
  pds:{ t:'Planetary Data System Standards Reference, version 3.8 (niveaux de traitement CODMAC et types de produits)', p:'NASA PDS', u:'https://pds.nasa.gov/datastandards/pds3/standards/sr/StdRef_20090227_v3.8.pdf' }
};
var MISSION = {
mro:{
  intro:L('Après sept mois de croisière, MRO s\'est mise en orbite autour de Mars en mars 2006, puis a passé six mois à freiner dans la haute atmosphère pour descendre sur son orbite de travail, basse et quasi polaire. Elle observe depuis la fin de 2006 et relaie aussi les données des engins posés sur Mars.',
          'After a seven-month cruise, MRO entered orbit around Mars in March 2006, then spent six months braking in the upper atmosphere to lower itself onto its low, near-polar working orbit. It has been observing since late 2006 and also relays data from landers and rovers.'),
  phases:[
    [L('12 août 2005', '12 August 2005'), L('Lancement', 'Launch'), L('Atlas V depuis Cap Canaveral.', 'Atlas V from Cape Canaveral.'), ['hz', 'kit']],
    [L('10 mars 2006', '10 March 2006'), L('Mise en orbite de Mars', 'Mars orbit insertion'), L('Freinage par le moteur principal, sur une orbite très allongée.', 'Braking with the main engines, onto a very elongated orbit.'), ['hz', 'kit']],
    [L('mars à octobre 2006', 'March to October 2006'), L('Aérofreinage', 'Aerobraking'), L('Des centaines de plongées calculées dans la haute atmosphère abaissent l\'orbite.', 'Hundreds of carefully calculated dips into the upper atmosphere lower the orbit.'), 'kit'],
    [L('novembre 2006 à décembre 2008', 'November 2006 to December 2008'), L('Phase scientifique principale', 'Primary science phase'), L('Deux ans de cartographie et d\'observations ciblées ; 34 térabits de données attendus.', 'Two years of mapping and targeted observations; 34 terabits of data expected.'), ['kit', 'mlk']],
    [L('janvier 2009 à décembre 2010', 'January 2009 to December 2010'), L('Phase de relais', 'Relay phase'), L('Relais des atterrisseurs et rovers, prévu ensuite pour être prolongé ; la sonde observe toujours.', 'Relay for landers and rovers, then planned to be extended; the spacecraft is still observing.'), 'kit']
  ],
  ops:[
    [L('Orbite de travail', 'Working orbit'), L('quasi polaire, 255 à 320 km, 112 min', 'near polar, 255 to 320 km, 112 min'), 'kit'],
    [L('Réception au sol', 'Ground stations'), L('Deep Space Network de la NASA (Goldstone, Madrid, Canberra)', 'NASA Deep Space Network (Goldstone, Madrid, Canberra)'), 'kit'],
    [L('Volume prévu', 'Planned volume'), L('34 térabits pendant la phase scientifique principale', '34 terabits during the primary science phase'), 'mlk']
  ],
  refs:{ mlk:{ t:'Mars Reconnaissance Orbiter Launch, Press Kit (août 2005)', p:'NASA JPL', u:'https://www.jpl.nasa.gov/news/press_kits/mro-launch.pdf' } },
  checked:'2026-11-23'
},
mex:{
  intro:L('Première mission de l\'ESA vers une autre planète. Mars Express a largué l\'atterrisseur Beagle 2, perdu à l\'arrivée, puis s\'est installée sur une orbite polaire très allongée : elle passe près de Mars pour observer, puis s\'en éloigne et tourne son antenne vers la Terre.',
          'ESA\'s first mission to another planet. Mars Express released the Beagle 2 lander, lost on arrival, then settled on a very elongated polar orbit: it swoops close to Mars to observe, then moves away and turns its antenna to Earth.'),
  phases:[
    [L('2 juin 2003', '2 June 2003'), L('Lancement', 'Launch'), L('Soyouz-Fregat depuis Baïkonour.', 'Soyuz-Fregat from Baikonur.'), 'fs'],
    [L('25 décembre 2003', '25 December 2003'), L('Arrivée à Mars', 'Arrival at Mars'), L('Mise en orbite, avec à bord l\'atterrisseur Beagle 2.', 'Orbit insertion, carrying the Beagle 2 lander.'), 'fs'],
    [L('6 février 2004', '6 February 2004'), L('Beagle 2 déclaré perdu', 'Beagle 2 declared lost'), L('L\'atterrisseur ne s\'est jamais manifesté ; l\'orbiteur poursuit seul avec ses sept instruments.', 'The lander was never heard from; the orbiter carries on alone with its seven instruments.'), 'fs']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire (86,3°), 258 × 11 560 km, 6 h 43 min', 'polar (86.3°), 258 × 11,560 km, 6 h 43 min'), 'hz'],
    [L('Partage du temps (orbite initiale)', 'Time sharing (initial orbit)'), L('jusqu\'à 6 h de communication avec la Terre par orbite de 7,5 h, 1,5 h d\'observation près de Mars', 'up to 6 h of communication with Earth per 7.5 h orbit, 1.5 h of observation close to Mars'), 'eng'],
    [L('Centre de contrôle', 'Control centre'), L('ESOC, Darmstadt ; station de l\'ESA à Perth (Australie)', 'ESOC, Darmstadt; ESA station in Perth (Australia)'), 'eng'],
    [L('Débit vers la Terre', 'Downlink rate'), L('jusqu\'à 230 kbit/s', 'up to 230 kbit/s'), 'eng']
  ],
  refs:{}, checked:'2026-11-23'
},
lro:{
  intro:L('LRO a été lancée avec l\'impacteur LCROSS pour préparer le retour d\'humains sur la Lune : une année d\'« exploration » sur une orbite circulaire basse, puis une mission scientifique prolongée sur une orbite plus économe en carburant.',
          'LRO was launched with the LCROSS impactor to prepare for humans returning to the Moon: a year of “exploration” on a low circular orbit, then a long science mission on an orbit that uses less fuel.'),
  phases:[
    [L('18 juin 2009', '18 June 2009'), L('Lancement', 'Launch'), L('Atlas V avec LCROSS, depuis le centre spatial Kennedy.', 'Atlas V with LCROSS, from Kennedy Space Center.'), 'nssdc'],
    [L('23 juin 2009', '23 June 2009'), L('Mise en orbite lunaire', 'Lunar orbit insertion'), L('Après environ quatre jours de trajet, orbite de mise en service de 30 × 216 km, jusqu\'à 60 jours.', 'After about four days of travel, a 30 × 216 km commissioning orbit, for up to 60 days.'), ['nssdc', 'kit']],
    [L('2009 – 2010', '2009 – 2010'), L('Mission d\'exploration', 'Exploration mission'), L('Un an sur une orbite circulaire de 50 km, pour la NASA Exploration.', 'One year on a 50 km circular orbit, for NASA Exploration.'), 'kit'],
    [L('depuis septembre 2010', 'since September 2010'), L('Mission scientifique', 'Science mission'), L('Orbite quasi stable d\'environ 30 × 180 km, qui demande peu de corrections ; missions prolongées depuis.', 'Quasi-stable orbit of about 30 × 180 km needing few corrections; extended missions since.'), 'nssdc']
  ],
  ops:[
    [L('Télémesure', 'Telemetry'), L('bande Ka à haut débit vers la Terre ; bande S dans les deux sens à bas débit', 'high-rate Ka-band downlink; low-rate S-band up and down'), 'kit'],
    [L('Orbite actuelle', 'Current orbit'), L('≈ 30 × 180 km, polaire', '≈ 30 × 180 km, polar'), 'nssdc']
  ],
  refs:{}, checked:'2026-11-23'
},
cassini:{
  intro:L('Sept ans de croisière avec quatre assistances gravitationnelles, puis treize ans autour de Saturne : une tournée principale de quatre ans, deux prolongations (Équinoxe et Solstice), et un « grand final » entre la planète et ses anneaux, jusqu\'à la plongée volontaire dans Saturne.',
          'Seven years of cruise with four gravity assists, then thirteen years around Saturn: a four-year prime tour, two extensions (Equinox and Solstice), and a “Grand Finale” between the planet and its rings, ending with a deliberate plunge into Saturn.'),
  phases:[
    [L('15 octobre 1997', '15 October 1997'), L('Lancement', 'Launch'), L('Titan IVB/Centaur depuis Cap Canaveral.', 'Titan IVB/Centaur from Cape Canaveral.'), 'end'],
    [L('1998 – 2000', '1998 – 2000'), L('Assistances gravitationnelles', 'Gravity assists'), L('Vénus (deux fois), Terre, Jupiter.', 'Venus (twice), Earth, Jupiter.'), 'end'],
    [L('1er juillet 2004', '1 July 2004'), L('Mise en orbite de Saturne', 'Saturn orbit insertion'), L('Début de la tournée principale de quatre ans, 76 orbites prévues.', 'Start of the four-year prime tour, 76 orbits planned.'), ['end', 'arr']],
    [L('14 janvier 2005', '14 January 2005'), L('Huygens sur Titan', 'Huygens on Titan'), L('La sonde européenne, larguée le 24 décembre 2004, descend dans l\'atmosphère et se pose.', 'The European probe, released on 24 December 2004, descends through the atmosphere and lands.'), 'end'],
    [L('2008 – 2010', '2008 – 2010'), L('Mission Équinoxe', 'Equinox mission'), L('Première prolongation, autour de l\'équinoxe de Saturne, quand le Soleil éclaire les anneaux par la tranche.', 'First extension, around Saturn\'s equinox, when the Sun lights the rings edge-on.'), 'end'],
    [L('2010 – 2017', '2010 – 2017'), L('Mission Solstice', 'Solstice mission'), L('Seconde prolongation, de sept ans, jusqu\'au solstice de Saturne.', 'Second, seven-year extension, up to Saturn\'s solstice.'), 'end'],
    [L('avril à septembre 2017', 'April to September 2017'), L('Grand final', 'Grand Finale'), L('22 orbites entre la planète et ses anneaux.', '22 orbits between the planet and its rings.'), 'end'],
    [L('15 septembre 2017', '15 September 2017'), L('Fin de mission', 'End of mission'), L('Plongée dans Saturne après 293 orbites, pour ne pas risquer de contaminer Encelade avec des microbes terrestres.', 'Plunge into Saturn after 293 orbits, so as not to risk contaminating Enceladus with Earth microbes.'), 'end']
  ],
  ops:[
    [L('Orbites autour de Saturne', 'Orbits around Saturn'), '293', 'end'],
    [L('Tournée principale', 'Prime tour'), L('4 ans, 76 orbites prévues', '4 years, 76 orbits planned'), 'arr']
  ],
  refs:{}, checked:'2026-11-23'
},
messenger:{
  intro:L('Six ans et demi de croisière et six survols (Terre, Vénus deux fois, Mercure trois fois) pour freiner assez et se placer autour de Mercure, si près du Soleil que la sonde garde toujours son pare-soleil tourné vers lui.',
          'Six and a half years of cruise and six flybys (Earth, Venus twice, Mercury three times) to slow down enough to enter orbit around Mercury, so close to the Sun that the spacecraft always keeps its sunshade facing it.'),
  phases:[
    [L('3 août 2004', '3 August 2004'), L('Lancement', 'Launch'), L('Delta II depuis Cap Canaveral.', 'Delta II from Cape Canaveral.'), 'nssdc'],
    [L('2005 – 2009', '2005 – 2009'), L('Six survols', 'Six flybys'), L('Terre (2005), Vénus (2006, 2007), Mercure (2008, 2008, 2009).', 'Earth (2005), Venus (2006, 2007), Mercury (2008, 2008, 2009).'), 'nssdc'],
    [L('18 mars 2011', '18 March 2011'), L('Mise en orbite de Mercure', 'Mercury orbit insertion'), L('Première sonde en orbite autour de Mercure.', 'First spacecraft in orbit around Mercury.'), ['nssdc', 'moi']],
    [L('2011 – 2012', '2011 – 2012'), L('Mission principale', 'Primary mission'), L('Une année terrestre, soit deux jours solaires de Mercure ; fin en mars 2012.', 'One Earth year, i.e. two Mercury solar days; ended in March 2012.'), ['moi', 'nssdc']],
    [L('2012 – 2015', '2012 – 2015'), L('Prolongations', 'Extensions'), L('Trois ans de plus, jusqu\'à épuisement des ergols qui maintenaient l\'orbite.', 'Three more years, until the propellant that kept up the orbit ran out.'), 'nssdc'],
    [L('30 avril 2015', '30 April 2015'), L('Fin de mission', 'End of mission'), L('Impact sur la surface de Mercure.', 'Impact on the surface of Mercury.'), 'nssdc']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('80°, 200 × 15 193 km, 12 h', '80°, 200 × 15,193 km, 12 h'), 'nssdc'],
    [L('Réception au sol', 'Ground stations'), L('Deep Space Network ; centre des opérations à l\'APL (Laurel, Maryland)', 'Deep Space Network; mission operations centre at APL (Laurel, Maryland)'), 'moi'],
    [L('Attitude', 'Attitude'), L('pare-soleil toujours tourné vers le Soleil', 'sunshade always facing the Sun'), 'moi']
  ],
  refs:{ moi:{ t:'MESSENGER Mercury Orbit Insertion, Press Kit (mars 2011)', p:'NASA', u:'https://www.nasa.gov/pdf/525164main_MercuryMOI_PK.pdf' } },
  checked:'2026-11-23'
}
};
