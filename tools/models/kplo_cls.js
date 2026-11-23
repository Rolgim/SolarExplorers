// Danuri (Eyes on the Solar System, NASA/JPL-Caltech), unités en mètres.
// Axes : ±X = panneaux, +Y = antenne grand gain, instruments sur la face +Z ; ShadowCam (corps brun, axe long selon Y),
// PolCam (matériau « PolCam01 »), perche du magnétomètre (vers -Y, +Z). Pièces nommées d'après les nœuds et matériaux de la maquette.
module.exports = function classify(c, node, mat){
  if (/^array/.test(node)) return 'solar';
  if (/Antenna|aluminum/.test(mat)) return 'hga';
  if (/ShadowCam/.test(mat)) return 'shadowcam';
  if (/PolCam/.test(mat)) return 'polcam';
  if (/Core_Square/.test(mat) && c.max[1] - c.min[1] > 0.8 && c.min[2] > 0.9) return 'mag';
  return 'bus';
};
