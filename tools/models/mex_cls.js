// Mars Express (maquette ESA SCIFLEET « mars_express », un seul maillage ; unités ≈ 0,84 cm : l'antenne grand gain de 1,6 m fait ≈ 190 unités).
// Axes : +Y = pont supérieur (instruments, ancien emplacement de Beagle 2), -Y = moteur principal, +Z = antenne grand gain, ±X = panneaux solaires.
// Antennes du radar MARSIS : le long de Z (dipôle) et vers -Y (monopôle), bien au-delà du module.
module.exports = function classify(c){
  const [x, y, z] = c.ctr;
  if (Math.abs(z) > 160 || y < -40 || c.max[1] - c.min[1] > 400 || c.max[2] - c.min[2] > 400) return 'marsis';
  if (Math.abs(x) > 130) return 'solar';
  if (z > 60 && y > 30 && c.max[2] > 90) return 'hga';
  return 'bus';
};
