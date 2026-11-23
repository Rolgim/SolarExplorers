// Mars Global Surveyor (NASA 3D Resources), unités ≈ mètres.
// Axes : +Y = pont des instruments (MOC, MOLA, TES), -Y = moteur et antenne grand gain sur sa perche, ±Z = panneaux solaires.
// Repère NAIF mgs_v10.tf : +Z sonde parallèle aux axes de visée des instruments, donc +Y de la maquette.
module.exports = function classify(c){
  const [x, y, z] = c.ctr;
  if (Math.abs(z) > 0.85) return 'solar';
  if (y < -1.85 || (c.max[1] - c.min[1] > 1 && c.max[1] < -0.3)) return 'hga';
  if (y > 1.05) return 'inst';
  return 'bus';
};
