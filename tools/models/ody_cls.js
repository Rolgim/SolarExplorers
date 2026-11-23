// 2001 Mars Odyssey (NASA 3D Resources, « Mars Odyssey »), unités = mètres (envergure du panneau 5,67 unités pour 5,7 m annoncés).
// Axes : +Y = panneau solaire (replié), +Z = perche du spectromètre gamma (pont scientifique), -Z = antenne grand gain sur son mât.
// Repère NAIF m01_v28.tf : +Z sonde = poussée du moteur, pont scientifique dessus ; +Y normal au panneau replié ; THEMIS vise -X sonde.
module.exports = function classify(c, node){
  const [x, y, z] = c.ctr;
  if (node === 'tex_boom' || node === 'tex_AO' || z > 1.3) return 'grs';
  if (node === 'shiny_panel' || (y > 0.5 && (Math.abs(x) > 0.95 || c.max[0] - c.min[0] > 1.5))) return 'solar';
  if (z < -1.5) return 'hga';
  return 'bus';
};
