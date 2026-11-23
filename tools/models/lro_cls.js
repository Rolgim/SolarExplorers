// LRO (maquette NASA 3D Resources « Lunar Reconnaissance Orbiter (B) » ; unités ≈ mètres : panneau de 2,8 × 4,2 unités pour 10,7 m² de surface déclarée).
// Axes : +X = panneau solaire, -Z = mât et antenne grand gain ; le reste forme le module et ses instruments.
module.exports = function classify(c, node, mat){
  const [x, y, z] = c.ctr;
  if (mat === 'shiny_panel' || mat === 'tex_02' || x > 1.36) return 'solar';
  if (mat === 'foil_silver_dish' || z < -1.0) return 'hga';
  if (node === '_root') return null;
  return 'bus';
};
