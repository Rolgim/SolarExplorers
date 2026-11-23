// MESSENGER (maquette NASA 3D Resources ; unités ≈ mètres : perche du magnétomètre ≈ 3,6 unités, panneaux ≈ 7 unités de bout en bout).
// Axes : +X = pare-soleil, -X = perche du magnétomètre, ±Z = panneaux solaires.
module.exports = function classify(c, node, mat){
  const [x, y, z] = c.ctr;
  if (node === '_root') return null;
  if (mat === 'AO_heatshield' || x > 0.45) return 'shade';
  if (mat === 'Mess_tex_01' || Math.abs(z) > 1.3) return 'solar';
  if (x < -1.1) return 'mag';
  return 'bus';
};
