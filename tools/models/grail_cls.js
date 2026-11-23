// GRAIL-B « Flow » (Eyes on the Solar System, NASA/JPL-Caltech), unités en mètres ; GRAIL-A est identique.
// Axes : +Y = plateforme supérieure qui porte les deux panneaux (±X) et le propulseur de 22 N (NSSDCA 2011-046A).
module.exports = function classify(c, node){
  const [x, y] = c.ctr;
  if (node === 'nozzle') return 'engine';
  if (node === 'shiny_panel' || (Math.abs(x) > 0.62 && y > 0.5)) return 'solar';
  return 'bus';
};
