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
},
ody:{
  intro:L('Après six mois de croisière, Odyssey s\'est placée autour de Mars en octobre 2001, puis a freiné trois mois dans la haute atmosphère pour rejoindre son orbite de travail, basse et polaire. Plus de vingt ans après, elle observe encore et relaie les données des robots martiens.',
          'After a six-month cruise, Odyssey entered orbit around Mars in October 2001, then braked for three months in the upper atmosphere to reach its low, polar working orbit. More than twenty years on, it is still observing and relaying data from Mars rovers.'),
  phases:[
    [L('7 avril 2001', '7 April 2001'), L('Lancement', 'Launch'), L('Delta II 7925 depuis Cap Canaveral.', 'Delta II 7925 from Cape Canaveral.'), 'kit'],
    [L('24 octobre 2001', '24 October 2001'), L('Mise en orbite de Mars', 'Mars orbit insertion'), L('Poussée de ≈ 20 minutes du moteur principal de 695 N.', 'A ≈ 20-minute burn of the 695 N main engine.'), 'kit'],
    [L('fin 2001 – début 2002', 'late 2001 – early 2002'), L('Aérofreinage', 'Aerobraking'), L('Environ trois mois de passages dans la haute atmosphère pour arrondir l\'orbite.', 'About three months of passes through the upper atmosphere to circularise the orbit.'), 'kit'],
    [L('février 2002 – août 2004', 'February 2002 – August 2004'), L('Mission principale', 'Primary mission'), L('Cartographie des minéraux et de l\'hydrogène.', 'Mapping of minerals and hydrogen.'), 'hz'],
    [L('depuis août 2004', 'since August 2004'), L('Missions prolongées', 'Extended missions'), L('Science et relais radio des robots posés sur Mars.', 'Science and radio relay for rovers on Mars.'), 'hz']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire, presque héliosynchrone, ≈ 400 km, 118 min', 'polar, nearly Sun-synchronous, ≈ 400 km, 118 min'), 'kit'],
    [L('Relais', 'Relay'), L('radio UHF pour les engins posés sur Mars', 'UHF radio for landers and rovers on Mars'), 'kit'],
    [L('Opérations', 'Operations'), L('JPL (Pasadena) et Lockheed Martin (Denver)', 'JPL (Pasadena) and Lockheed Martin (Denver)'), 'kit']
  ],
  refs:{}, checked:'2026-11-23'
},
mgs:{
  intro:L('MGS a mis dix mois à rejoindre Mars, puis près d\'un an et demi à descendre sur son orbite de cartographie, à cause d\'un panneau solaire endommagé qui obligeait à freiner doucement. Elle a ensuite observé Mars pendant plus de sept ans.',
          'MGS took ten months to reach Mars, then nearly a year and a half to descend to its mapping orbit, because a damaged solar array forced gentle braking. It then observed Mars for more than seven years.'),
  phases:[
    [L('7 novembre 1996', '7 November 1996'), L('Lancement', 'Launch'), L('Delta II 7925 depuis Cap Canaveral.', 'Delta II 7925 from Cape Canaveral.'), 'nssdc'],
    [L('12 septembre 1997', '12 September 1997'), L('Mise en orbite de Mars', 'Mars orbit insertion'), L('Orbite de capture très allongée.', 'Very elongated capture orbit.'), 'nssdc'],
    [L('1997 – février 1999', '1997 – February 1999'), L('Aérofreinage', 'Aerobraking'), L('Ralenti, puis interrompu cinq mois, pour ménager le panneau solaire endommagé.', 'Slowed, then paused for five months, to spare the damaged solar array.'), 'nssdc'],
    [L('mars 1999 – janvier 2001', 'March 1999 – January 2001'), L('Mission principale', 'Primary mission'), L('Une année martienne de cartographie.', 'One Martian year of mapping.'), 'nssdc'],
    [L('2 novembre 2006', '2 November 2006'), L('Fin de mission', 'End of mission'), L('Contact perdu, après plusieurs prolongations.', 'Contact lost, after several extensions.'), 'nssdc']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire, héliosynchrone (2 h / 14 h), 378 km, 118 min', 'polar, Sun-synchronous (2 a.m. / 2 p.m.), 378 km, 118 min'), 'nssdc'],
    [L('Cycle', 'Cycle'), L('quasi-répétition tous les 7 jours, carte complète en 26 jours', 'near-repeat every 7 days, full map in 26 days'), 'nssdc'],
    [L('Coût', 'Cost'), L('≈ 154 millions de dollars (construction), 65 (lancement)', '≈ $154 million (development), $65 million (launch)'), 'nssdc']
  ],
  refs:{}, checked:'2026-11-23'
},
tgo:{
  intro:L('Lancée avec l\'atterrisseur Schiaparelli, la sonde l\'a largué trois jours avant l\'arrivée puis s\'est placée sur une orbite très allongée. Un an d\'aérofreinage l\'a amenée sur son orbite de travail, basse et circulaire.',
          'Launched with the Schiaparelli lander, the spacecraft released it three days before arrival, then entered a very elongated orbit. A year of aerobraking brought it down to its low, circular working orbit.'),
  phases:[
    [L('14 mars 2016', '14 March 2016'), L('Lancement', 'Launch'), L('Proton-M/Briz-M depuis Baïkonour.', 'Proton-M/Breeze-M from Baikonur.'), 'fs'],
    [L('16 octobre 2016', '16 October 2016'), L('Largage de Schiaparelli', 'Schiaparelli release'), L('L\'atterrisseur ne s\'est pas posé correctement le 19 octobre.', 'The lander failed to land correctly on 19 October.'), ['nssdc', 'fs']],
    [L('19 octobre 2016', '19 October 2016'), L('Mise en orbite de Mars', 'Mars orbit insertion'), L('Orbite de 4 jours, 200 × 98 000 km.', '4-day orbit, 200 × 98,000 km.'), ['fs', 'nssdc']],
    [L('mars 2017 – février 2018', 'March 2017 – February 2018'), L('Aérofreinage', 'Aerobraking'), L('L\'orbite descend à 200 × 1 050 km, puis devient circulaire.', 'The orbit comes down to 200 × 1,050 km, then becomes circular.'), 'nssdc'],
    [L('2018', '2018'), L('Début de la science', 'Science begins'), L('Mesures de l\'atmosphère et images CaSSIS ; relais radio des missions au sol.', 'Atmospheric measurements and CaSSIS images; radio relay for surface missions.'), 'fs']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('circulaire, ≈ 400 km, ≈ 2 h', 'circular, ≈ 400 km, ≈ 2 h'), 'nssdc'],
    [L('Relais', 'Relay'), L('radios UHF Electra, pour les robots posés sur Mars', 'Electra UHF radios, for rovers on Mars'), 'nssdc'],
    [L('Maître d\'œuvre', 'Prime contractor'), 'Thales Alenia Space Italia', 'fs']
  ],
  refs:{}, checked:'2026-11-23'
},
vex:{
  intro:L('Construite en un temps record sur le modèle de Mars Express, Venus Express a mis cinq mois à rejoindre Vénus. Prévue pour 500 jours, sa mission a duré plus de huit ans, jusqu\'à l\'épuisement des ergols.',
          'Built in record time on the Mars Express design, Venus Express took five months to reach Venus. Planned for 500 days, its mission lasted more than eight years, until its propellant ran out.'),
  phases:[
    [L('9 novembre 2005', '9 November 2005'), L('Lancement', 'Launch'), L('Soyouz-Fregat depuis Baïkonour.', 'Soyuz-Fregat from Baikonur.'), 'fs'],
    [L('11 avril 2006', '11 April 2006'), L('Mise en orbite de Vénus', 'Venus orbit insertion'), L('Poussée d\'≈ 50 minutes ; orbite de capture de 9 jours, puis abaissement de l\'apocentre en mai.', 'A ≈ 50-minute burn; 9-day capture orbit, then apocentre lowering in May.'), 'voi'],
    [L('2006 – 2014', '2006 – 2014'), L('Observations', 'Observations'), L('Orbite de 24 h, quasi polaire ; périapside abaissée en 2008.', '24-hour, quasi-polar orbit; pericentre lowered in 2008.'), 'fs'],
    [L('mai – juillet 2014', 'May – July 2014'), L('Aérofreinage expérimental', 'Experimental aerobraking'), L('Plongées dans l\'atmosphère, puis remontée de l\'orbite.', 'Dips into the atmosphere, then orbit raising.'), 'fs'],
    [L('28 novembre – 16 décembre 2014', '28 November – 16 December 2014'), L('Fin de mission', 'End of mission'), L('Contact perdu pendant des manœuvres, fin officielle le 16 décembre.', 'Contact lost during manoeuvres, official end on 16 December.'), 'fs']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('24 h, quasi polaire, ≈ 250 × 66 000 km au début', '24 h, quasi-polar, ≈ 250 × 66,000 km at first'), 'fs'],
    [L('Plateforme', 'Platform'), L('celle de Mars Express, modifiée', 'that of Mars Express, modified'), 'fs']
  ],
  refs:{}, checked:'2026-11-23'
},
mgn:{
  intro:L('Arrivée à Vénus en août 1990, Magellan a cartographié la planète au radar pendant trois cycles de 243 jours, le temps que Vénus tourne une fois sous son orbite. Elle a ensuite abaissé son orbite en freinant dans l\'atmosphère pour mesurer la gravité.',
          'Arriving at Venus in August 1990, Magellan mapped the planet by radar over three 243-day cycles, the time it takes Venus to turn once under its orbit. It then lowered its orbit by braking in the atmosphere to measure gravity.'),
  phases:[
    [L('4 mai 1989', '4 May 1989'), L('Lancement', 'Launch'), L('Départ de la Terre.', 'Departure from Earth.'), 'nssdc'],
    [L('10 août 1990', '10 August 1990'), L('Mise en orbite de Vénus', 'Venus orbit insertion'), L('Orbite elliptique presque polaire, 294 km au plus près.', 'Near-polar elliptical orbit, 294 km at closest.'), 'nssdc'],
    [L('septembre 1990 – septembre 1992', 'September 1990 – September 1992'), L('Cartographie radar', 'Radar mapping'), L('Trois cycles : visée à gauche, à droite, puis à gauche.', 'Three cycles: left-looking, right-looking, then left again.'), 'nssdc'],
    [L('1992 – 1994', '1992 – 1994'), L('Gravité', 'Gravity'), L('Cycles 4 et 5 ; aérofreinage vers une orbite circulaire à partir de mai 1993.', 'Cycles 4 and 5; aerobraking to a circular orbit from May 1993.'), 'nssdc'],
    [L('12 octobre 1994', '12 October 1994'), L('Fin de mission', 'End of mission'), L('Expérience finale dans l\'atmosphère, puis perte du signal.', 'Final experiment in the atmosphere, then loss of signal.'), 'nssdc']
  ],
  ops:[
    [L('Cycle de cartographie', 'Mapping cycle'), L('243 jours (une rotation de Vénus)', '243 days (one rotation of Venus)'), 'nssdc'],
    [L('Orbites radar utilisables', 'Usable radar orbits'), '4 225', 'nssdc']
  ],
  refs:{}, checked:'2026-11-23'
},
clem:{
  intro:L('Clementine devait montrer que des capteurs légers de la défense antimissile pouvaient servir à l\'exploration. Elle a passé un peu plus de deux mois autour de la Lune avant de repartir vers l\'astéroïde Geographos, qu\'une panne l\'a empêchée d\'atteindre.',
          'Clementine was meant to show that lightweight missile-defence sensors could serve exploration. It spent a little over two months around the Moon before heading for asteroid Geographos, which a failure prevented it from reaching.'),
  phases:[
    [L('25 janvier 1994', '25 January 1994'), L('Lancement', 'Launch'), L('Titan II depuis Vandenberg.', 'Titan II from Vandenberg.'), 'info'],
    [L('19 février 1994', '19 February 1994'), L('Mise en orbite lunaire', 'Lunar orbit insertion'), L('Orbite polaire elliptique de ≈ 5 h.', 'Polar elliptical orbit of ≈ 5 h.'), 'info'],
    [L('26 février – 21 avril 1994', '26 February – 21 April 1994'), L('Cartographie', 'Mapping'), L('Deux cycles, en onze couleurs.', 'Two cycles, in eleven colours.'), 'info'],
    [L('5 mai 1994', '5 May 1994'), L('Départ de la Lune', 'Departure from the Moon'), L('Cap sur l\'astéroïde Geographos.', 'Bound for asteroid Geographos.'), 'info'],
    [L('7 mai 1994', '7 May 1994'), L('Panne', 'Failure'), L('Un propulseur vide les réservoirs ; la sonde tourne à 80 tours par minute et le survol est abandonné.', 'A thruster drains the tanks; the spacecraft spins at 80 rpm and the flyby is abandoned.'), 'info']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire, ≈ 5 h, 425 ± 25 km au plus près', 'polar, ≈ 5 h, 425 ± 25 km at closest'), 'info'],
    [L('Images', 'Images'), L('près d\'un million en onze couleurs, 620 000 en haute résolution, 320 000 en infrarouge thermique', 'nearly one million in eleven colours, 620,000 high-resolution, 320,000 thermal infrared'), 'info'],
    [L('Appui de la NASA', 'NASA support'), L('Deep Space Network, Goddard et JPL', 'Deep Space Network, Goddard and JPL'), 'info']
  ],
  refs:{}, checked:'2026-11-23'
},
sln:{
  intro:L('Kaguya devait étudier l\'origine et l\'évolution de la Lune. L\'orbiteur principal a largué deux petits satellites qui ont servi de relais et de balises radio, pour mesurer la gravité jusque sur la face cachée.',
          'Kaguya was to study the origin and evolution of the Moon. The main orbiter released two small satellites used as a relay and radio beacons, to measure gravity even on the far side.'),
  phases:[
    [L('14 septembre 2007', '14 September 2007'), L('Lancement', 'Launch'), L('H-IIA depuis Tanegashima.', 'H-IIA from Tanegashima.'), 'jaxa'],
    [L('3 octobre 2007', '3 October 2007'), L('Mise en orbite lunaire', 'Lunar orbit insertion'), L('Orbite polaire initiale de ≈ 101 × 11 741 km.', 'Initial polar orbit of ≈ 101 × 11,741 km.'), 'nasa'],
    [L('9 et 12 octobre 2007', '9 and 12 October 2007'), L('Okina et Ouna', 'Okina and Ouna'), L('Largage des deux petits satellites.', 'Release of the two small satellites.'), 'nasa'],
    [L('19 octobre 2007', '19 October 2007'), L('Orbite de mission', 'Mission orbit'), L('Circulaire, à ≈ 100 km.', 'Circular, at ≈ 100 km.'), 'nasa'],
    [L('1er février 2009', '1 February 2009'), L('Orbite abaissée', 'Orbit lowered'), L('À ≈ 50 km, après une panne de roue de réaction.', 'To ≈ 50 km, after a reaction wheel failure.'), 'nasa'],
    [L('10 juin 2009', '10 June 2009'), L('Fin de mission', 'End of mission'), L('Impact près du cratère Gill (65,5° S, 80,4° E).', 'Impact near Gill crater (65.5° S, 80.4° E).'), 'nasa']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('circulaire, polaire, 100 km', 'circular, polar, 100 km'), 'jaxa'],
    [L('Durée prévue', 'Planned duration'), L('1 an', '1 year'), 'jaxa']
  ],
  refs:{}, checked:'2026-11-23'
},
ch1:{
  intro:L('Chandrayaan-1 a ouvert l\'exploration lunaire de l\'Inde. Prévue pour deux ans, la mission s\'est arrêtée au bout de dix mois, mais ses instruments ont livré la première détection d\'eau à la surface de la Lune.',
          'Chandrayaan-1 opened India\'s lunar exploration. Planned for two years, the mission stopped after ten months, but its instruments gave the first detection of water on the Moon\'s surface.'),
  phases:[
    [L('22 octobre 2008', '22 October 2008'), L('Lancement', 'Launch'), L('PSLV-C11 depuis Sriharikota, puis cinq poussées en 13 jours.', 'PSLV-C11 from Sriharikota, then five burns over 13 days.'), 'nasa'],
    [L('8 novembre 2008', '8 November 2008'), L('Mise en orbite lunaire', 'Lunar orbit insertion'), L('Orbite initiale de ≈ 7 502 × 504 km, puis 100 km.', 'Initial orbit of ≈ 7,502 × 504 km, then 100 km.'), 'nasa'],
    [L('novembre 2008', 'November 2008'), L('Sonde d\'impact', 'Impact probe'), L('La MIP tombe près du cratère Shackleton, au pôle Sud.', 'The MIP crashes near Shackleton crater, at the south pole.'), 'nasa'],
    [L('mai 2009', 'May 2009'), L('Orbite relevée', 'Orbit raised'), L('À 200 km.', 'To 200 km.'), 'isro'],
    [L('28 août 2009', '28 August 2009'), L('Fin de mission', 'End of mission'), L('Dernier contact ; panne d\'alimentation par surchauffe probable.', 'Last contact; power failure from overheating likely.'), 'nasa']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire, 100 km puis 200 km', 'polar, 100 km then 200 km'), 'sci'],
    [L('Durée prévue', 'Planned duration'), L('2 ans', '2 years'), 'isro']
  ],
  refs:{}, checked:'2026-11-23'
},
kplo:{
  intro:L('Danuri est la première sonde lunaire de la Corée du Sud. Elle a pris une route longue mais économe, en s\'éloignant d\'abord vers le Soleil avant de revenir être capturée par la Lune.',
          'Danuri is South Korea\'s first lunar spacecraft. It took a long but economical route, first heading out toward the Sun before coming back to be captured by the Moon.'),
  phases:[
    [L('4 août 2022 (5 août en Corée)', '4 August 2022 (5 August in Korea)'), L('Lancement', 'Launch'), L('Falcon 9 depuis Cap Canaveral.', 'Falcon 9 from Cape Canaveral.'), 'nasa'],
    [L('août – décembre 2022', 'August – December 2022'), L('Transfert balistique', 'Ballistic transfer'), L('≈ 4,5 mois de croisière.', '≈ 4.5 months of cruise.'), 'nasa'],
    [L('27 décembre 2022', '27 December 2022'), L('Orbite de mission', 'Mission orbit'), L('Dernière manœuvre d\'insertion confirmée ; une orbite en ≈ 2 h.', 'Final insertion manoeuvre confirmed; one orbit in ≈ 2 h.'), 'kr'],
    [L('janvier 2023', 'January 2023'), L('Début de la science', 'Science begins'), L('Orbite polaire d\'≈ 100 km.', 'Polar orbit of ≈ 100 km.'), 'tps']
  ],
  ops:[
    [L('Orbite', 'Orbit'), L('polaire, ≈ 100 km, ≈ 2 h', 'polar, ≈ 100 km, ≈ 2 h'), 'nasa'],
    [L('Mission prévue', 'Planned mission'), L('11 mois après l\'arrivée', '11 months after arrival'), 'nasa']
  ],
  refs:{}, checked:'2026-11-23'
},
lp:{
  intro:L('Lunar Prospector, petite mission du programme Discovery, n\'avait ni caméra ni ordinateur de bord. Elle a cartographié la composition de toute la Lune depuis une orbite polaire basse.',
          'Lunar Prospector, a small Discovery mission, had neither a camera nor an onboard computer. It mapped the composition of the whole Moon from a low polar orbit.'),
  phases:[
    [L('7 janvier 1998', '7 January 1998'), L('Lancement', 'Launch'), L('Athena 2 depuis Cap Canaveral ; 105 heures de croisière.', 'Athena 2 from Cape Canaveral; 105-hour cruise.'), 'nssdc'],
    [L('11 – 16 janvier 1998', '11 – 16 January 1998'), L('Mise en orbite', 'Orbit insertion'), L('Orbite de capture, puis orbite de cartographie de 100 km.', 'Capture orbit, then 100 km mapping orbit.'), 'nssdc'],
    [L('28 janvier 1999', '28 January 1999'), L('Mission prolongée', 'Extended mission'), L('Orbite abaissée pour des mesures plus fines.', 'Orbit lowered for finer measurements.'), 'nssdc'],
    [L('31 juillet 1999', '31 July 1999'), L('Fin de mission', 'End of mission'), L('Impact volontaire dans un cratère près du pôle Sud.', 'Deliberate impact in a crater near the south pole.'), 'nssdc']
  ],
  ops:[[L('Orbite', 'Orbit'), L('polaire, 100 km, 118 min', 'polar, 100 km, 118 min'), 'nssdc']],
  refs:{}, checked:'2026-11-23'
},
grail:{
  intro:L('GRAIL a fait voler deux sondes l\'une derrière l\'autre : les variations de la distance qui les séparait trahissent les irrégularités de la gravité lunaire.',
          'GRAIL flew two spacecraft one behind the other: changes in the distance between them reveal irregularities in the Moon\'s gravity.'),
  phases:[
    [L('10 septembre 2011', '10 September 2011'), L('Lancement', 'Launch'), L('Delta II depuis Cap Canaveral, route par le point L1.', 'Delta II from Cape Canaveral, route via the L1 point.'), 'nssdc'],
    [L('31 décembre 2011 – 1er janvier 2012', '31 December 2011 – 1 January 2012'), L('Mise en orbite lunaire', 'Lunar orbit insertion'), L('GRAIL-A puis GRAIL-B.', 'GRAIL-A then GRAIL-B.'), 'nssdc'],
    [L('mars – mai 2012', 'March – May 2012'), L('Phase scientifique', 'Science phase'), L('Trois cycles de 27,3 jours à 50 km.', 'Three 27.3-day cycles at 50 km.'), 'nssdc'],
    [L('17 décembre 2012', '17 December 2012'), L('Fin de mission', 'End of mission'), L('Impacts volontaires près du pôle Nord.', 'Deliberate impacts near the north pole.'), 'nssdc']
  ],
  ops:[[L('Orbite', 'Orbit'), L('polaire, 50 km, 113 min, en tandem', 'polar, 50 km, 113 min, in tandem'), 'nssdc']],
  refs:{}, checked:'2026-11-23'
},
vo:{
  intro:L('L\'orbiteur de Viking 1 a d\'abord servi à choisir un site sûr pour son atterrisseur, puis a cartographié Mars pendant quatre ans.',
          'The Viking 1 orbiter first served to choose a safe site for its lander, then mapped Mars for four years.'),
  phases:[
    [L('20 août 1975', '20 August 1975'), L('Lancement', 'Launch'), L('Titan IIIE-Centaur depuis Cap Canaveral.', 'Titan IIIE-Centaur from Cape Canaveral.'), 'nssdc'],
    [L('19 juin 1976', '19 June 1976'), L('Mise en orbite de Mars', 'Mars orbit insertion'), L('Orbite de 1 513 × 33 000 km.', 'Orbit of 1,513 × 33,000 km.'), 'nssdc'],
    [L('20 juillet 1976', '20 July 1976'), L('Atterrissage', 'Landing'), L('L\'atterrisseur se pose à Chryse Planitia.', 'The lander touches down at Chryse Planitia.'), 'nssdc'],
    [L('17 août 1980', '17 August 1980'), L('Fin des opérations', 'End of operations'), L('Après 1 485 orbites.', 'After 1,485 orbits.'), 'nssdc']
  ],
  ops:[[L('Orbite', 'Orbit'), L('1 513 × 33 000 km, 24,66 h', '1,513 × 33,000 km, 24.66 h'), 'nssdc']],
  refs:{}, checked:'2026-11-23'
}
};
