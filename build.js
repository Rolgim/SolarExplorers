/* Assemble le site à partir de src/ et du socle commun (socle/, copie de Rolgim/rolgim.github.io, voir socle/README.md).
   node build.js           -> index.html (ce que sert GitHub Pages)
   node build.js artifact  -> dist/ (variante pour l'artifact claude.ai)
   Réglages propres au site : site.json. */
require('./socle/build.js')(__dirname);
