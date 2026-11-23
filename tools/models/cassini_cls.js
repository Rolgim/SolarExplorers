// Cassini (maquette NASA 3D Resources « Cassini-Huygens (A) » ; unités = mètres : l'antenne grand gain fait 4,0 unités pour 4 m).
// Axes : +Y = antenne grand gain au sommet ; -Z = perche du magnétomètre ; les antennes du RPWS partent en éventail vers le bas.
module.exports = function classify(c, node, mat){
  const [x, y, z] = c.ctr, sx = c.max[0] - c.min[0], sy = c.max[1] - c.min[1], sz = c.max[2] - c.min[2];
  if (node === '_root') return null;
  if (mat === 'dish_AO' || (y > 1.4 && Math.hypot(x, z) < 2.1 && mat !== 'aluminum')) return 'hga';
  if (mat === 'aluminum' && Math.max(sx, sy, sz) > 3) return 'rpws';    // trois antennes fouets du RPWS (fils de 10 m)
  if (z < -2.3) return 'mag';                                            // perche du magnétomètre
  return 'bus';
};
