/* Textes anglais des missions : EN_MISSIONS[id] = { name, agency, desc, sections, refs, parts, model } (mêmes champs que MISSIONS).
   Les clés de source des lignes de la fiche sont reprises du français. */
var EN_MISSIONS = {
  mro:{
    agency:'NASA (JPL); SHARAD radar provided by ASI',
    desc:"Launched in 2005, MRO circles Mars in a low, nearly polar orbit. Its HiRISE camera resolves details the size of a table, CTX maps the whole planet, CRISM charts its mineralogy and the SHARAD radar probes the subsurface. It also relays radio traffic for the rovers on Mars.",
    refs:{ kit:'Mars Reconnaissance Orbiter Arrival, Press Kit (March 2006)', hz:'JPL Horizons, object -74 (Mars Reconnaissance Orbiter), object header', stac:'STAC-PLANET, ode-mars-mro-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Dish for communication with Earth, on a steerable mast.', facts:['Diameter: 3 m'] },
      solar:{ name:'Solar arrays', desc:'Two steerable arrays that power the spacecraft.', facts:['Each array: 5.35 × 2.53 m', 'Total area: 20 m²'] },
      sharad:{ name:'SHARAD radar antenna', desc:'Dipole antenna of the subsurface sounding radar, provided by the Italian Space Agency.', facts:['Extends 5 m to each side of the spacecraft'] },
      bus:{ name:'Bus and instruments', desc:'Central structure, tanks, propulsion and, on the Mars-facing side, the instruments (HiRISE, CTX, CRISM, MARCI, MCS). The model does not allow them to be separated reliably: they are described under “Mission and data”.' }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Height', '6.5 m (with the antenna)'], ['Span', '13.6 m (arrays deployed)'],
        ['Launch mass', '2,180 kg, including 1,149 kg of propellant and pressurant'],
        ['Science payload', '139 kg'], ['Built by', 'Lockheed Martin Space Systems'] ]},
      { title:'Mission', rows:[
        ['Launch', '12 August 2005, Atlas V'], ['Mars arrival', '10 March 2006'],
        ['Aerobraking', 'March to October 2006'], ['Start of science phase', 'November 2006'] ]},
      { title:'Science orbit', rows:[
        ['Type', 'near-polar'], ['Altitude', '255 to 320 km'], ['Period', '112 min'] ]},
      { title:'Instruments', rows:[
        ['HiRISE', 'camera, 50 cm mirror; 30 cm pixels from 300 km'],
        ['CTX', 'context camera, 30 km wide swaths at 6 m per pixel'],
        ['CRISM', 'imaging spectrometer, 370 to 3,940 nm'],
        ['MARCI', 'wide-angle colour camera (weather)'],
        ['MCS', 'climate sounder (atmospheric profiles)'],
        ['SHARAD', 'subsurface sounding radar (ASI)'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '34'], ['HiRISE products (RDR v1.1)', '193,181'], ['CTX products (EDR)', '164,625'] ]}
    ]
  },
  mex:{
    agency:'ESA',
    desc:"Launched in 2003, Mars Express is Europe's first spacecraft to Mars. From an elongated, nearly polar orbit, its HRSC camera maps the planet in colour and in 3D, OMEGA charts its mineralogy and the MARSIS radar probes the subsurface. Its Beagle 2 lander never made contact.",
    refs:{ sc:'Mars Express: The spacecraft', eng:'Mars Express: Engineering, Table of Facts', hz:'JPL Horizons, object -41 (Mars Express), object header', stac:'STAC-PLANET, ode-mars-mex-* collections (probe of 23 November 2026)' },
    model:{ license:'ESA, free to download and use under the ESA terms and conditions' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Fixed dish on one face of the bus, for links with Earth.', facts:['Diameter: 1.6 m'] },
      solar:{ name:'Solar arrays', desc:'Two steerable arrays, folded at launch and deployed shortly after.', facts:['Area: 11.42 m²', 'More than 500 W when Mars is farthest from the Sun'] },
      marsis:{ name:'MARSIS radar antennas', desc:'Long wire antennas of the radar that sounds the subsurface and the ionosphere, deployed in orbit.', facts:['40 m antenna'] },
      bus:{ name:'Bus and instruments', desc:'Central bus, tanks, main engine (underneath) and, on the top deck facing Mars, the instruments (HRSC, OMEGA, SPICAM, PFS, ASPERA-3). The model does not allow them to be separated reliably: they are described under “Mission and data”.', facts:['Bus: 1.5 × 1.8 × 1.4 m', 'Main engine: 400 N'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '1.5 × 1.8 × 1.4 m'], ['Launch mass', '1,223 kg, including 427 kg of propellant'],
        ['Science payload', '116 kg (and 71 kg for the Beagle 2 lander)'], ['Solar arrays', '11.42 m²'], ['High-gain antenna', '1.6 m in diameter'] ]},
      { title:'Mission', rows:[
        ['Launch', '2 June 2003, Soyuz-Fregat, Baikonur'], ['Mars arrival', '25 December 2003'], ['Beagle 2', 'declared lost on 6 February 2004'] ]},
      { title:'Orbit', rows:[
        ['Inclination', '86.3°'], ['Altitude', '258 km at closest, 11,560 km at farthest'], ['Period', '6 h 43 min'] ]},
      { title:'Instruments', rows:[
        ['HRSC', 'colour stereo camera: ≈ 10 m per pixel over the whole planet, 2 m over selected areas'],
        ['OMEGA', 'imaging spectrometer, 0.5 to 5.2 µm (mineralogy)'],
        ['MARSIS', 'subsurface sounding radar, 40 m antenna'],
        ['SPICAM', 'ultraviolet and infrared spectrometer (ozone, water vapour)'],
        ['PFS', 'Fourier spectrometer, 1.2 to 45 µm (atmosphere)'],
        ['ASPERA-3', 'ions, electrons and energetic neutral atoms'],
        ['MaRS', 'radio science with the spacecraft signal'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '18'], ['HRSC products (RDR v4)', '62,003'], ['OMEGA products (EDR)', '35,626'] ]}
    ]
  },
  lro:{
    agency:'NASA (Goddard)', targets:['Moon'],
    desc:"Launched in 2009, LRO maps the Moon from a low polar orbit. Its LROC cameras resolve one-metre details, LOLA measures the relief by laser, Diviner the temperatures and LEND looks for hydrogen from polar ice. It has photographed the Apollo landing sites.",
    refs:{ kit:'LRO/LCROSS Press Kit (June 2009), copy from the University of North Texas web archive', hz:'JPL Horizons, object -85 (LRO), object header', stac:'STAC-PLANET, ode-moon-lro-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'S- and Ka-band dish at the end of an articulated mast, sending the data to Earth.', facts:['Deployed, it reaches ≈ 2.6 m out from the bus (102 inches)', 'Downlink rate: 100 Mbit/s'] },
      solar:{ name:'Solar array', desc:'Three hinged panels on one side of the spacecraft.', facts:['Deployed: ≈ 4.3 × 3.2 m (168 × 126 inches)', 'Spacecraft power: 685 W'] },
      bus:{ name:'Bus and instruments', desc:'Bus, tanks, thrusters and, on the Moon-facing deck, the seven instruments (LROC, LOLA, Diviner, LAMP, LEND, CRaTER, Mini-RF). The model does not allow them to be separated reliably: they are described under “Mission and data”.', facts:['Dry mass: 1,018 kg'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Launch mass', '1,916 kg, including 898 kg of propellant'], ['Power', '685 W'], ['Deployed solar array', '≈ 4.3 × 3.2 m'], ['Built by', 'NASA Goddard Space Flight Center'] ]},
      { title:'Mission', rows:[
        ['Launch', '18 June 2009, Atlas V, with LCROSS'], ['Moon arrival', '23 June 2009'], ['Science phase', 'since September 2010'] ]},
      { title:'Orbit', rows:[
        ['Type', 'polar'], ['Altitude (first year)', '50 km, circular'], ['Period', '113 min'], ['Since September 2010', '≈ 30 × 180 km'] ]},
      { title:'Instruments', rows:[
        ['LROC', 'two narrow-angle cameras (one-metre details over 10 km wide swaths) and a wide-angle colour camera'],
        ['LOLA', 'laser altimeter (relief, slopes of landing sites)'],
        ['Diviner', 'radiometer (surface temperatures, cold traps)'],
        ['LAMP', 'far-ultraviolet mapper (Lyman alpha)'],
        ['LEND', 'neutron detector (hydrogen, ice), provided by IKI Moscow'],
        ['CRaTER', 'cosmic ray telescope (radiation doses)'],
        ['Mini-RF', 'miniature synthetic aperture radar'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '77'], ['LROC NAC products (CDR v4)', '852,485'], ['LROC WAC products (CDR v4)', '907,272'] ]}
    ]
  },
  cassini:{
    agency:'NASA (JPL), ESA (Huygens probe) and ASI (high-gain antenna)', targets:['Saturn', 'Titan'],
    desc:"Launched in 1997, Cassini orbited Saturn from 2004 to 2017. It released the European Huygens probe, which descended to Titan in 2005, flew past Titan 127 times and revealed oceans hidden beneath the surfaces of Titan and Enceladus. Its mission ended with a plunge into Saturn.",
    refs:{ end:'Cassini: End of Mission, Press Kit (September 2017)', arr:'Cassini-Huygens Saturn Arrival, Press Kit (June 2004)', launch:'Cassini Launch, Press Kit (October 1997)', hz:'JPL Horizons, object -82 (Cassini), object header', stac:'STAC-PLANET, vim-cassini-vims-ir collection (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Fixed dish on top of the spacecraft, provided by the Italian Space Agency.', facts:['Diameter: 4 m'] },
      mag:{ name:'Magnetometer boom', desc:'Boom deployed in flight, holding the sensors away from the spacecraft\'s own magnetic field.', facts:['Length: 11 m'] },
      rpws:{ name:'RPWS antennas', desc:'Three whip antennas of the radio and plasma wave instrument, unrolled in flight.', facts:['Each antenna: ≈ 10 m long'] },
      bus:{ name:'Bus, instruments and Huygens', desc:'Stack of modules (equipment, propulsion), two instrument pallets, three radioisotope generators and, on the side, the Huygens probe. The model does not allow them to be separated reliably.', facts:['Spacecraft height: 6.7 m', 'Huygens probe: 2.7 m in diameter, 320 kg'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Dimensions', '6.7 m high, 4 m wide'], ['Launch mass', '5,712 kg, with propellant and the Huygens probe'],
        ['Mass at end of mission', '2,125 kg'], ['Power', '885 W (633 W at end of mission), radioisotope generators'] ]},
      { title:'Mission', rows:[
        ['Launch', '15 October 1997, Titan IVB/Centaur'],
        ['Flybys', 'Venus (26 April 1998 and 24 June 1999), Earth (18 August 1999), Jupiter (30 December 2000)'],
        ['Saturn arrival', '1 July 2004 (UTC)'], ['Huygens', 'released on 24 December 2004, descent to Titan on 14 January 2005'],
        ['End of mission', '15 September 2017, plunge into Saturn'] ]},
      { title:'Around Saturn', rows:[
        ['Orbits', '293'], ['Targeted Titan flybys', '127'], ['Targeted Enceladus flybys', '23'], ['Images', '453,048'] ]},
      { title:'Instruments', rows:[
        ['ISS', 'wide- and narrow-angle cameras'],
        ['VIMS', 'visible and infrared mapping spectrometer (composition of surfaces and atmospheres)'],
        ['CIRS', 'infrared spectrometer'], ['UVIS', 'ultraviolet imaging spectrograph'],
        ['RADAR', 'imaging radar (Titan\'s surface)'], ['RSS', 'radio science'],
        ['CAPS, INMS, CDA, MIMI', 'plasma, ions and neutrals, dust, magnetosphere'],
        ['MAG, RPWS', 'magnetic field, radio and plasma waves'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '1 (VIMS, Titan)'], ['VIMS cubes of Titan', '20,672'] ]}
    ]
  },
  messenger:{
    agency:'NASA', targets:['Mercury', 'Venus'],
    desc:"Launched in 2004, MESSENGER entered orbit around Mercury in 2011, after six flybys of Earth, Venus and Mercury. Sheltered behind a ceramic-fabric sunshade, it mapped the whole planet and studied the volatiles in the permanently shadowed polar craters, then crashed into it in 2015.",
    refs:{ kit:'MESSENGER Launch Press Kit (August 2004), copy from the University of North Texas web archive', hz:'JPL Horizons, object -236 (MESSENGER), object header', stac:'STAC-PLANET, ode-mercury-messenger-* and ode-venus-messenger-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      shade:{ name:'Sunshade', desc:'Fixed ceramic-fabric screen, always facing the Sun, sheltering the rest of the spacecraft.', facts:['≈ 2.5 m tall, 2 m wide'] },
      solar:{ name:'Solar arrays', desc:'Two steerable wings reaching beyond the sunshade; they are tilted to limit their heating.', facts:['≈ 6 m from tip to tip', '70% reflectors, 30% cells', 'Nominal power in Mercury orbit: 450 W'] },
      mag:{ name:'Magnetometer boom', desc:'Boom holding the magnetometer away from the bus.', facts:['Length: 3.6 m'] },
      bus:{ name:'Bus and instruments', desc:'Bus, tanks, main engine and, on the bottom deck, the instruments (MDIS, GRNS, XRS, MLA, MASCS). The model does not allow them to be separated reliably: they are described under “Mission and data”.', facts:['Bus: 1.27 × 1.42 × 1.85 m', 'Main engine: 645 N'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '1.27 × 1.42 × 1.85 m'], ['Sunshade', '≈ 2.5 m tall, 2 m wide'],
        ['Launch mass', '1,093 kg, including 607.8 kg of propellant and helium'], ['Power in Mercury orbit', '450 W (nominal)'] ]},
      { title:'Mission', rows:[
        ['Launch', '3 August 2004, Delta II'], ['Flybys', 'Earth (2 August 2005), Venus (24 October 2006, 5 June 2007), Mercury (14 January 2008, 6 October 2008, 29 September 2009)'],
        ['Mercury orbit insertion', '18 March 2011'], ['End of mission', 'impact on Mercury on 30 April 2015'] ]},
      { title:'Orbit', rows:[
        ['Inclination', '80°'], ['Altitude', '200 km at closest, 15,193 km at farthest'], ['Period', '12 h'] ]},
      { title:'Instruments', rows:[
        ['MDIS', 'two cameras, wide and narrow angle; stereo map of the whole planet at 250 m per pixel'],
        ['GRNS', 'gamma-ray and neutron spectrometer'], ['XRS', 'X-ray spectrometer'],
        ['MLA', 'laser altimeter'], ['MASCS', 'atmospheric and surface composition spectrometer'],
        ['EPPS', 'energetic particles and plasma'], ['MAG', 'magnetometer, at the end of the 3.6 m boom'],
        ['RS', 'radio science with the telecommunications system'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '100 for Mercury, 61 for Venus'], ['MDIS NAC products (CDR)', '306,454'], ['MDIS WAC products (CDR)', '376,105'] ]}
    ]
  }
};
