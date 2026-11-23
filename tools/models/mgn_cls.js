// Magellan (NASA 3D Resources), unités ≈ mètres (parabole de 3,7 unités pour 3,7 m annoncés).
// Axes : +Y = antenne grand gain (aussi antenne du radar SAR), ±X = panneaux solaires, -Y = module de propulsion.
module.exports = function classify(c, node){
  const [x, y, z] = c.ctr;
  if (Math.abs(x) > 1.7) return 'solar';
  if (node === 'dish_etc' || y > 1.05) return 'hga';
  if (node === 'aluminum' && z < -0.8) return 'alt';
  return 'bus';
};
