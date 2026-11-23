// MRO (maquette NASA 3D Resources « Mars Reconnaissance Orbiter (MRO) (A) », unités de la maquette : envergure des panneaux ≈ 90 unités).
// Axes : +Y vers l'antenne grand gain, Z le long des panneaux et de l'antenne SHARAD ; la face -Y porte les instruments.
// Découpage prudent : seules les pièces reconnaissables sans ambiguïté sont nommées (règle 2) ; le reste forme le module.
module.exports = function classify(c, node, mat){
  const [cx, cy] = c.ctr;
  if (/^solar/.test(mat)) return 'solar';                       // deux panneaux solaires et leurs tranches
  if (mat === 'pole') return 'sharad';                          // antenne dipôle du radar SHARAD
  if (mat === 'cover' || mat === 'tower') return 'hga';         // réflecteur de l'antenne grand gain et son support
  if (cy > 3) return 'hga';                                     // au-dessus du module : réflecteur, cornet et mât de l'antenne
  if (mat === 'rocket') return 'bus';
  return 'bus';
};
