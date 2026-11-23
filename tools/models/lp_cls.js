// Lunar Prospector (Eyes on the Solar System, NASA/JPL-Caltech), unités en mètres.
// Axes : +Y = axe de rotation (antenne sur le dessus), perches dans le plan X-Z. Fiches NSSDCA 1998-001A-01 à -06 :
// perche -X : spectromètre à neutrons (deux compteurs perpendiculaires à la perche et à l'axe) et spectromètre alpha (cube) ;
// perche +Z : spectromètre gamma (cylindre) ; perche -Z : réflectomètre à électrons et rallonge de 1,1 m du magnétomètre.
module.exports = function classify(c){
  const [x, y, z] = c.ctr, r = Math.hypot(x, z), a = Math.atan2(z, x) * 180 / Math.PI;
  if (r < 0.3 && y > 0.75) return 'antenna';
  if (r > 2.92){ if (Math.abs(a) > 150) return 'ns'; return a > 0 ? 'grs' : 'mag'; }
  if (r > 0.76) return 'booms';
  return 'bus';
};
