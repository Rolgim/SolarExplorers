// ExoMars Trace Gas Orbiter (ESA SCIFLEET, OBJ), unités ≈ 2,5 cm.
// Axes : ±Z = panneaux solaires, +X = antenne grand gain, -Y = anneau d'interface lanceur et moteur principal, -X = pont scientifique.
// Repère NAIF em16_tgo_v24.tf : -Y sonde vers Mars (pont scientifique), moteur côté -X sonde, antenne sur la face +Y sonde.
module.exports = function classify(c){
  const [x, y, z] = c.ctr;
  if (Math.abs(z) > 62) return 'solar';
  if (x > 62) return 'hga';
  return 'bus';
};
