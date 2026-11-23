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
  },
  ody:{
    agency:'NASA (JPL), built by Lockheed Martin; HEND detector provided by IKI (Russia)',
    desc:"Launched in 2001, Mars Odyssey is the oldest spacecraft still working around Mars. Its THEMIS camera maps surface minerals and temperatures in the infrared, and its gamma-ray spectrometer revealed water ice buried under the polar regions. It also relays data from rovers on Mars.",
    refs:{ kit:'2001 Mars Odyssey Arrival, Press Kit (October 2001)', hz:'JPL Horizons, object -53 (Mars Odyssey), object header', naif:'Spacecraft frame, SPICE kernel m01_v28.tf', stac:'STAC-PLANET, ode-mars-ody-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Dish on a mast, latched during aerobraking, then deployed and pointed by a two-axis gimbal.', facts:['Diameter: 1.3 m'] },
      solar:{ name:'Solar array', desc:'Three panels folded at launch, on one side of the spacecraft, pointed by a two-axis gimbal.', facts:['Span: 5.7 m', '1,500 W after launch, 750 W at Mars'] },
      grs:{ name:'Gamma-ray spectrometer boom', desc:'The gamma-ray spectrometer head, at the end of a boom, is kept away from gamma rays emitted by the spacecraft itself.', facts:['Length: 6.2 m', 'Deployed in 2002, after aerobraking'] },
      bus:{ name:'Bus and instruments', desc:'Propulsion module and equipment module. On the science deck: THEMIS, the neutron detectors and the star cameras. The model does not allow them to be separated reliably: they are described under “Mission and instruments”.', facts:['Bus: 2.2 × 1.7 × 2.6 m', 'Main engine: 695 N'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '2.2 m long, 1.7 m tall, 2.6 m wide'], ['Launch mass', '729.7 kg, including 353.4 kg of propellant and 44.5 kg of instruments'],
        ['Power', '1,500 W after launch, 750 W at Mars'], ['High-gain antenna', '1.3 m in diameter'], ['Built by', 'Lockheed Martin Astronautics, Denver'] ]},
      { title:'Mission', rows:[
        ['Launch', '7 April 2001, Delta II 7925, Cape Canaveral'], ['Mars arrival', '24 October 2001'],
        ['Aerobraking', 'from 26 October 2001, about three months'], ['Primary mission', 'February 2002 – August 2004, extended since 24 August 2004'] ]},
      { title:'Orbit', rows:[
        ['Type', 'polar, nearly Sun-synchronous'], ['Altitude', '≈ 400 km, circular'], ['Period', '118 min'] ]},
      { title:'Instruments', rows:[
        ['THEMIS', 'infrared camera (9 bands, 100 m per pixel) and visible camera (5 bands, 18 m per pixel)'],
        ['GRS', 'gamma-ray spectrometer on a boom, with a neutron spectrometer and the HEND detector (hydrogen, ice)'],
        ['MARIE', 'radiation measurements in Mars orbit'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '49'], ['THEMIS IR products (EDR)', '841,297'], ['THEMIS VIS products (EDR)', '263,196'] ]}
    ]
  },
  mgs:{
    agency:'NASA (JPL), built by Lockheed Martin; radio relay provided by CNES',
    desc:"Launched in 1996, Mars Global Surveyor mapped Mars for more than seven years. Its MOLA laser altimeter produced the first accurate map of Martian topography, its MOC camera revealed recent gullies and its magnetometer traces of an ancient magnetic field. Contact was lost in November 2006.",
    refs:{ mocx:'NSSDCA experiment page: Mars Orbiter Camera (1996-062A-01)', kit:'Mars Global Surveyor Arrival, Press Kit (September 1997)', naif:'Spacecraft frame, SPICE kernel mgs_v10.tf', stac:'STAC-PLANET, ode-mars-mgs-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Dish at the end of a boom, held away from the bus during mapping.', facts:['Diameter: 1.5 m', 'Boom: 2 m'] },
      solar:{ name:'Solar arrays', desc:'Two wings that track the Sun. One array that failed to latch at deployment forced slower braking in the atmosphere. The magnetometer sensors sit at the tips of the arrays.', facts:['Each array: 3.5 × 1.9 m', 'Power: 980 W'] },
      inst:{ name:'Instrument deck', desc:'Side of the bus that always faces Mars: MOC camera, MOLA laser altimeter, TES spectrometer and radio relay.', facts:['MOC camera: 21 kg, 8 W on average'] },
      bus:{ name:'Bus', desc:'Equipment module and propulsion module, with the main engine opposite the instruments.', facts:['Bus: 1.17 × 1.17 × 1.7 m', 'Main engine: 596 N'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '1.17 × 1.17 × 1.7 m'], ['Launch mass', '1,030.5 kg'],
        ['Propellant', '216.5 kg of hydrazine and 144 kg of nitrogen tetroxide'], ['Power', '980 W'], ['High-gain antenna', '1.5 m in diameter, on a 2 m boom'] ]},
      { title:'Mission', rows:[
        ['Launch', '7 November 1996, Delta II 7925, Cape Canaveral'], ['Mars arrival', '12 September 1997'],
        ['Aerobraking', 'until February 1999, slowed by a damaged solar array'], ['Mapping', 'from March 1999'],
        ['End of mission', 'contact lost on 2 November 2006'] ]},
      { title:'Orbit', rows:[
        ['Type', 'polar, Sun-synchronous (2 a.m. / 2 p.m.)'], ['Altitude', '378 km'], ['Period', '118 min'] ]},
      { title:'Instruments', rows:[
        ['MOC', 'camera: 2 to 3 m per pixel in narrow angle, 7.5 km in wide angle'],
        ['MOLA', 'laser altimeter: 10 shots per second, 160 m footprint on the ground'],
        ['TES', 'thermal infrared spectrometer (minerals, dust, clouds)'],
        ['MAG/ER', 'magnetometer and electron reflectometer'],
        ['RS', 'radio science with an ultra-stable oscillator (gravity, atmosphere)'],
        ['MR', 'radio relay provided by CNES'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '12'], ['MOC wide-angle products', '100,499'], ['MOC narrow-angle products', '95,797'] ]}
    ]
  },
  tgo:{
    agency:'ESA and Roscosmos (ACS and FREND instruments led by IKI, Moscow)',
    desc:"Launched in 2016 with the Schiaparelli lander, which crashed, the European and Russian Trace Gas Orbiter searches the atmosphere of Mars for gases present in tiny amounts, including methane. Its CaSSIS camera photographs the surface in colour and in 3D, and it relays radio traffic for rovers on Mars.",
    refs:{ naif:'Spacecraft frame, SPICE kernel em16_tgo_v24.tf', hz:'JPL Horizons, object -143 (ExoMars TGO), object header', stac:'STAC-PLANET, ode-mars-em16tgo-* collections (probe of 23 November 2026)', fs:'ExoMars Factsheet (October 2016)' },
    model:{ license:'ESA, free to download and use under the ESA terms and conditions' },
    parts:{
      hga:{ name:'High-gain antenna', desc:'Dish pointed by a two-axis gimbal, for links with Earth.', facts:['Diameter: 2.2 m'] },
      solar:{ name:'Solar arrays', desc:'Two steerable wings on either side of the bus.', facts:['17.5 m tip to tip', 'Power: ≈ 2,000 W'] },
      bus:{ name:'Bus and instruments', desc:'Box-shaped bus, main engine, and on the deck facing Mars the four instruments (ACS, CaSSIS, FREND, NOMAD) and the Electra UHF radio. The model does not allow them to be separated reliably: they are described under “Mission and instruments”.', facts:['Bus: 3.5 × 2 × 2 m', 'Main engine: 424 N'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '3.5 × 2 × 2 m'], ['Launch mass', '3,732 kg, including 113.8 kg of instruments (4,332 kg with Schiaparelli)'],
        ['Power', '≈ 2,000 W'], ['Solar arrays', '17.5 m tip to tip'], ['High-gain antenna', '2.2 m in diameter'] ]},
      { title:'Mission', rows:[
        ['Launch', '14 March 2016, Proton-M/Breeze-M, Baikonur'], ['Mars arrival', '19 October 2016'],
        ['Schiaparelli', 'did not land successfully (19 October 2016)'], ['Aerobraking', 'March 2017 – February 2018'], ['Science phase', 'since 2018'] ]},
      { title:'Orbit', rows:[
        ['Type', 'circular'], ['Altitude', '≈ 400 km'], ['Period', '≈ 2 h'] ]},
      { title:'Instruments', rows:[
        ['ACS', 'three infrared spectrometers (0.7 to 17 µm): composition and structure of the atmosphere'],
        ['NOMAD', 'three spectrometers, infrared (2.2 to 4.3 µm) and ultraviolet-visible (0.2 to 0.65 µm)'],
        ['CaSSIS', 'colour and stereo camera: ≈ 5 m per pixel over an 8 km swath'],
        ['FREND', 'neutron detector: hydrogen (water ice) down to ≈ 1 m deep'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '12'], ['CaSSIS products (calibrated)', '205,861'], ['NOMAD products (raw)', '155,691'] ]}
    ]
  },
  vex:{
    agency:'ESA', targets:['Venus'],
    desc:"Europe's first spacecraft to Venus, Venus Express was built on the Mars Express platform with instruments inherited from Mars Express and Rosetta. From 2006 to 2014 it studied the planet's thick atmosphere, its clouds, its winds that circle the planet in a few days and its upper atmosphere swept by the solar wind.",
    refs:{ frame:'Spacecraft frame, SPICE kernel VEX_V11.TF', hz:'JPL Horizons, object -248 (Venus Express), object header', stac:'STAC-PLANET, ode-venus-vex-* collections (probe of 23 November 2026)' },
    model:{ license:'ESA, free to download and use under the ESA terms and conditions' },
    parts:{
      hga:{ name:'Large antenna', desc:'Fixed dish on one face of the bus; a second, smaller antenna on top was used close to the Sun.', facts:['Pointed 5° from the spacecraft X axis'] },
      solar:{ name:'Solar arrays', desc:'Two steerable arrays on either side of the bus.', facts:['Area: 5.7 m²', '1,100 W in Venus orbit'] },
      bus:{ name:'Bus and instruments', desc:'Aluminium honeycomb bus, inherited from Mars Express; on the deck facing Venus, the instruments, and underneath the main engine. The model does not allow them to be separated reliably: they are described under “Mission and instruments”.', facts:['Bus: 1.7 × 1.7 × 1.4 m'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Bus', '1.7 × 1.7 × 1.4 m'], ['Launch mass', '1,270 kg'], ['Solar arrays', '5.7 m², 1,100 W in orbit'], ['Platform', 'that of Mars Express, modified'] ]},
      { title:'Mission', rows:[
        ['Launch', '9 November 2005, Soyuz-Fregat, Baikonur'], ['Venus orbit insertion', '11 April 2006, ≈ 50-minute burn'],
        ['Contact lost', '28 November 2014'], ['End of mission', '16 December 2014'] ]},
      { title:'Orbit', rows:[
        ['Type', 'elliptical, quasi-polar'], ['Period', '24 h'], ['Altitude', '≈ 250 km at closest, ≈ 66,000 km at farthest (at first)'] ]},
      { title:'Instruments', rows:[
        ['VIRTIS', 'visible and thermal infrared imaging spectrometer'], ['SPICAV', 'atmospheric spectrometer (ultraviolet and infrared)'],
        ['PFS', 'Fourier spectrometer'], ['VMC', 'Venus monitoring camera'], ['ASPERA-4', 'plasma and energetic atoms'],
        ['MAG', 'magnetometer'], ['VeRa', 'radio science'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '12'], ['VIRTIS products (raw)', '25,381'], ['MAG products (raw)', '6,875'] ]}
    ]
  },
  mgn:{
    agency:'NASA (JPL)', targets:['Venus'],
    desc:"Launched in 1989, Magellan mapped 98% of the surface of Venus by radar, through the clouds, with details below 100 m, then measured its gravity field. It was the first spacecraft to lower its orbit by braking in an atmosphere, before plunging into that of Venus in 1994.",
    refs:{ stac:'STAC-PLANET, ode-venus-mgn-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      hga:{ name:'Large dish and radar', desc:'High-gain antenna for links with Earth, which also served as the antenna of the synthetic aperture radar: on each orbit, a strip of surface was mapped.', facts:['Strip ≈ 20 km wide and 17,000 km long per orbit', '75 m per pixel'] },
      alt:{ name:'Altimeter antenna', desc:'Horn of the radar altimeter, which measured the relief beneath the spacecraft.' },
      solar:{ name:'Solar arrays', desc:'Two arrays on either side of the bus.' },
      bus:{ name:'Bus and propulsion', desc:'Equipment module and, underneath, the propulsion module that put the spacecraft into Venus orbit.' }
    },
    sections:[
      { title:'Mission', rows:[
        ['Launch', '4 May 1989'], ['Venus arrival', '10 August 1990, near-polar elliptical orbit'],
        ['Radar mapping', 'three 243-day cycles, September 1990 to September 1992'],
        ['Gravity', 'cycles 4 and 5, September 1992 to 1994'], ['Aerobraking', 'from 24 May 1993, to a circular orbit'],
        ['End of mission', 'signal lost on 12 October 1994'] ]},
      { title:'Orbit', rows:[
        ['Type', 'elliptical, near-polar'], ['Altitude at closest', '294 km (near 9.5° N)'] ]},
      { title:'Results', rows:[
        ['Surface mapped', '98%, with details below 100 m'], ['Usable radar orbits', '4,225'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '43'], ['Radar products (FMAP mosaics)', '19,691'], ['Radar products (basic images)', '4,587'] ]}
    ]
  },
  clem:{
    agency:'BMDO (US missile defence) and NASA; spacecraft by the Naval Research Laboratory', targets:['Moon'],
    desc:"A small spacecraft built to test lightweight US missile-defence sensors, Clementine spent two months in polar orbit around the Moon in 1994. It made the first complete map of the Moon in eleven colours, nearly a million images, and measured its relief by laser. A failure then kept it from reaching asteroid Geographos.",
    refs:{ info:'Clementine Mission (mission CD-ROM text, October 1994)', hz:'JPL Horizons, object -40 (Clementine), object header', stac:'STAC-PLANET, ode-moon-clem-* collections (probe of 23 November 2026)' },
    model:{ license:'NASA, free use (NASA media usage guidelines)' },
    parts:{
      sensors:{ name:'Sensors', desc:'Ultraviolet-visible, near-infrared, thermal infrared and high-resolution cameras, and the laser rangefinder, grouped on one face of the spacecraft.', facts:['Sensor package: 8 kg'] },
      solar:{ name:'Solar arrays', desc:'Two steerable arrays on either side of the bus, on a single axis.', facts:['Power: 360 W'] },
      engine:{ name:'Engine', desc:'Nozzle of the main engine, on top of the bus.' },
      hga:{ name:'High-gain antenna', desc:'Antenna for links with Earth, under the bus.' },
      bus:{ name:'Bus', desc:'Octagonal bus: electronics, tanks, star cameras.', facts:['Dry mass: ≈ 227 kg'] }
    },
    sections:[
      { title:'Spacecraft', rows:[
        ['Mass', '≈ 227 kg dry, as much propellant; 1,690 kg with the departure stage'], ['Power', '360 W'], ['Sensors', '8 kg in all'] ]},
      { title:'Mission', rows:[
        ['Launch', '25 January 1994, Titan II, Vandenberg'], ['Lunar orbit insertion', '19 February 1994'],
        ['Mapping', '26 February to 21 April 1994, two cycles'], ['Departure from the Moon', '5 May 1994'],
        ['Failure', '7 May 1994: a thruster drained the tanks, spacecraft spinning at 80 rpm; Geographos flyby cancelled'] ]},
      { title:'Orbit', rows:[
        ['Type', 'polar, elliptical'], ['Altitude at closest', '425 ± 25 km'], ['Period', '≈ 5 h'] ]},
      { title:'Instruments', rows:[
        ['UVVIS', 'ultraviolet-visible camera, 0.3 to 1.1 µm, 5 filters and one broad'], ['NIR', 'near-infrared camera, ≈ 1 to 5.5 µm, 6 filters'],
        ['LWIR', 'thermal infrared camera, 8 to 9.5 µm'], ['HIRES', 'high-resolution camera, 0.4 to 0.8 µm'],
        ['LIDAR', 'laser rangefinder at 1,064 nm, 40 m range resolution'] ]},
      { title:'Data in STAC-PLANET', rows:[
        ['Collections', '20'], ['HIRES images (raw)', '574,546'], ['UVVIS images (raw)', '570,533'] ]}
    ]
  }
};
