// Clementine (NASA 3D Resources), unités ≈ mètres.
// Axes : +Y = tuyère du moteur, -Y = antenne grand gain, ±X = panneaux solaires, +Z = bloc des capteurs (caméras, LIDAR).
module.exports = function classify(c){
  const [x, y, z] = c.ctr;
  if (Math.abs(x) > 0.75) return 'solar';
  if (y < -0.62) return 'hga';
  if (y > 0.72) return 'engine';
  if (c.min[2] > 0.55) return 'sensors';
  return 'bus';
};
