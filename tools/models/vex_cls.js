// Venus Express (ESA SCIFLEET, OBJ), unités ≈ 2,8 cm.
// Axes : ±X = panneaux solaires, -Z = grande antenne (HGA1), +Y = pont tourné vers Vénus, -Y = moteur principal.
// Repère ESA VEX_V11.TF : +Z sonde vers Vénus, moteur sur -Z sonde, HGA1 sur +X sonde, panneaux sur ±Y sonde.
module.exports = function classify(c){
  const [x, y, z] = c.ctr;
  if (Math.abs(x) > 60) return 'solar';
  if (z < -30 && c.max[2] - c.min[2] < 30) return 'hga';
  return 'bus';
};
