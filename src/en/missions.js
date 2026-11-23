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
  }
};
