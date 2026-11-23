/* =================================================================
   ACCUEIL « SYSTÈME SOLAIRE » — vue de dessus du plan de l'écliptique (JPL Horizons, data/solar.json, recette « solar » de
   tools/data/fetch_orbits.py) : planètes, Pluton et sondes à la date choisie (aujourd'hui par défaut), avec curseur, lecture et vitesse.
   Vue héliocentrique : distances à l'échelle, tailles des points non à l'échelle (signalé).
   Vue centrée sur une planète : ses satellites, placés à partir des éléments orbitaux Horizons interpolés entre deux époques (≈, signalé) ; distances et taille de la planète à l'échelle.
   SolarPage.html() rend la page, SolarPage.mount() la branche.
================================================================= */
var SolarPage = (function(){
'use strict';
var MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
var PCOL = { 'Mercure':'#B9B2A8', 'Vénus':'#E8C26A', 'Terre':'#6FA8FF', 'Mars':'#E07A4F', 'Jupiter':'#D9A66B', 'Saturne':'#E6D08A', 'Uranus':'#9FE3E8', 'Neptune':'#6C8CFF', 'Pluton':'#C9A88A' };
/* rayons moyens en km, NASA NSSDCA « Planetary Fact Sheet » (ref. SRC.nssdc) : taille de la planète dans la vue centrée */
var RAD = { 'Mercure':2440, 'Vénus':6052, 'Terre':6371, 'Mars':3390, 'Jupiter':69911, 'Saturne':58232, 'Uranus':25362, 'Neptune':24622, 'Pluton':1188 };
var HZ = { '399':'Terre', '499':'Mars', '599':'Jupiter', '699':'Saturne', '799':'Uranus', '899':'Neptune', '999':'Pluton' };
var ZOOM = { in:[1.75, 'Jusqu\'à Mars'], mid:[10.4, 'Jusqu\'à Saturne'], out:[33, 'Jusqu\'à Neptune'] };
var SPEED = [[1/24, 'une heure par seconde'], [1, 'un jour par seconde'], [7, 'une semaine par seconde'], [30, 'un mois par seconde'], [365, 'un an par seconde']];
var SCOL = ['#FF6B9A', '#4DD0E1', '#B39DDB', '#FFB74D', '#81C784'];   /* une couleur par sonde, dans l'ordre du registre (aucune agence mise en avant) */
var DAY = 864e5, S = { t:null, zoom:'in', focus:'', near:false, run:false, raf:0, last:0, speed:30 }, D = null, T0 = 0, T1 = 0;
function T(s){ return OBS_T(s); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function day(s){   /* « 2005-Aug-13 » (Horizons) ou « 2005-08-13 » / « 2006-11 » → jours depuis 1970 */
  var m = /^(\d{4})-(\w{3})-(\d{2})/.exec(s); if (m) return Date.UTC(+m[1], MON[m[2]] - 1, +m[3]) / DAY;
  m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) / DAY;
}
function fmt(t){
  var o = { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }; if (S.speed < 1) { o.hour = '2-digit'; o.minute = '2-digit'; }
  return new Date(t * DAY).toLocaleString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', o) + (S.speed < 1 ? ' TU' : '');
}
function now(){ return Date.now() / DAY; }
/* position interpolée d'une série { t0, step, n, xy } au jour t ; null hors de la série */
function at(s, t){
  var f = (t - s.t) / s.step; if (f < 0 || f > s.n) return null; f = Math.min(f, s.n - 1);   /* un pas de tolérance au bout de la série */
  var i = Math.min(s.n - 2, Math.floor(f)), u = f - i, a = s.xy;
  return [a[2*i] + (a[2*i+2] - a[2*i]) * u, a[2*i+1] + (a[2*i+3] - a[2*i+1]) * u];
}
/* un tour d'orbite : la série « orbit » de la recette, sinon les points de la série datée jusqu'à un tour complet */
function loop(s){
  if (s.orbit) return s.orbit;
  var a = s.xy, acc = 0, prev = Math.atan2(a[1], a[0]), pts = [a[0], a[1]];
  for (var i = 1; i < s.n; i++){ var th = Math.atan2(a[2*i+1], a[2*i]), d = th - prev; if (d > Math.PI) d -= 2*Math.PI; if (d < -Math.PI) d += 2*Math.PI; acc += Math.abs(d); prev = th; pts.push(a[2*i], a[2*i+1]); if (acc >= 2*Math.PI) break; }
  return pts;
}
/* satellite : éléments [JD, a km, e, i, Ω, ω, M, n °/j] de l'époque la plus proche → position (km) dans le plan de l'écliptique */
var RD = Math.PI / 180;
/* éléments à la date t : interpolés entre les deux époques qui l'encadrent ; la longitude moyenne avance au mouvement moyen effectif
   qui relie les deux époques (le mouvement osculateur seul dérive vite pour Phobos ou Encelade) */
function wrap(x){ return ((x + 180) % 360 + 360) % 360 - 180; }
function moonEl(m, t){
  var jd = t + 2440587.5, E = m.el, k = 0; while (k < E.length - 2 && E[k + 1][0] <= jd) k++;
  var A = E[k], B = E[k + 1] || A; if (B === A || jd <= A[0]) return A;
  var Dt = B[0] - A[0], u = Math.min(1, (jd - A[0]) / Dt), lA = A[4] + A[5] + A[6], lB = B[4] + B[5] + B[6];
  var n = A[7] + wrap(lB - (lA + A[7] * Dt)) / Dt, O = A[4] + wrap(B[4] - A[4]) * u, w = A[5] + wrap(B[5] - A[5]) * u;
  return [jd, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u, A[3] + (B[3] - A[3]) * u, O, w, lA + n * (jd - A[0]) - O - w, n];
}
function kep(el, E){
  var a = el[1], e = el[2], i = el[3]*RD, O = el[4]*RD, w = el[5]*RD, x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e*e) * Math.sin(E);
  var cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i);
  return [(cO*cw - sO*sw*ci) * x + (-cO*sw - sO*cw*ci) * y, (sO*cw + cO*sw*ci) * x + (-sO*sw + cO*cw*ci) * y];
}
function moonAt(m, t){
  var el = moonEl(m, t), M = (el[6] % 360) * RD, E = M;
  for (var k = 0; k < 8; k++) E = E - (E - el[2] * Math.sin(E) - M) / (1 - el[2] * Math.cos(E));
  return kep(el, E);
}
function P(x, y){ return (+x).toFixed(4) + ' ' + (-y).toFixed(4); }
function status(m, t){
  var ev = m.events || [], st = { k:'avant' };
  ev.forEach(function(e){ if (day(e.date) > t) return;
    if (e.type === 'launch') st = { k:'croisiere' };
    else if (e.type === 'arrival' || e.type === 'orbit') st = { k:'orbite', body:e.body };
    else if (e.type === 'end') st = { k:'fin', date:e.date }; });
  return st;
}
function statusText(st){
  return st.k === 'avant' ? T('pas encore lancée') : st.k === 'croisiere' ? T('en croisière') : st.k === 'orbite' ? T('en orbite autour de ' + (st.body === 'Lune' ? 'la Lune' : st.body)) : T('mission terminée');
}
function moonsOf(p){ return (D && D.moons || []).filter(function(m){ return HZ[m.center] === p; }); }
function html(){
  var foc = ['Terre', 'Mars', 'Jupiter', 'Saturne', 'Uranus', 'Neptune', 'Pluton'];
  return '<div class="sk full solar"><h2>' + T('Système solaire') + '</h2>' +
    '<p class="lead">' + T('Les planètes, leurs satellites et les sondes à leur position réelle, vus de dessus. Par défaut, la date du jour ; le curseur remonte le temps.') + '</p>' +
    '<div class="so-tools">' +
      '<button class="m-b so-play" id="so-play" aria-pressed="false">' + T('Lecture') + '</button>' +
      '<label class="so-sel">' + T('Vitesse') + ' <select id="so-speed">' + SPEED.map(function(s){ return '<option value="' + s[0] + '"' + (s[0] === S.speed ? ' selected' : '') + '>' + T(s[1]) + '</option>'; }).join('') + '</select></label>' +
      '<label class="so-date"><span id="so-day"></span><input id="so-t" type="range" step="any" aria-label="' + T('Date') + '"></label>' +
      '<button class="m-b" id="so-now">' + T('Aujourd\'hui') + '</button>' +
    '</div><div class="so-tools">' +
      '<label class="so-sel">' + T('Centrer sur') + ' <select id="so-focus"><option value="">' + T('le Soleil') + '</option>' + foc.map(function(p){ return '<option value="' + p + '"' + (p === S.focus ? ' selected' : '') + '>' + T(p) + '</option>'; }).join('') + '</select></label>' +
      '<div class="so-zoom" role="group" aria-label="' + T('Cadrage') + '" id="so-zoom"></div>' +
    '</div>' +
    '<div class="so-main"><div class="so-wrap" id="so-wrap"><svg id="so-svg" role="group" aria-labelledby="so-cap" preserveAspectRatio="xMidYMid meet"><g id="so-orb"></g><g id="so-trail"></g><g id="so-pts"></g></svg></div>' +
    '<aside class="so-side"><p class="sr-only" id="so-cap"></p><h3>' + T('Les sondes à cette date') + '</h3><ul class="so-list" id="so-list"></ul>' +
    '<div id="so-moons"></div><p class="note" id="so-note"></p></aside></div></div>';
}
function zoomButtons(){
  var h = S.focus ? [['all', 'Tous les satellites'], ['near', 'Satellites proches']].map(function(z){ return '<button class="m-b" data-sz="' + z[0] + '" aria-pressed="' + ((z[0] === 'near') === S.near) + '">' + T(z[1]) + '</button>'; }).join('')
    : Object.keys(ZOOM).map(function(z){ return '<button class="m-b" data-sz="' + z + '" aria-pressed="' + (z === S.zoom) + '">' + T(ZOOM[z][1]) + '</button>'; }).join('');
  document.getElementById('so-zoom').innerHTML = h;
}
/* cadre : rayon R (unités de la vue) dans la plus petite dimension ; k : taille d'un pixel d'écran dans ces unités */
function frameBox(R){
  var svg = document.getElementById('so-svg'), w = Math.max(280, svg.clientWidth || 600), h = Math.max(280, svg.clientHeight || 600), m = Math.min(w, h);
  var k = 2 * R / m, W = w * k, H = h * k;
  svg.setAttribute('viewBox', [-W/2, -H/2, W, H].map(function(v){ return v.toFixed(5); }).join(' '));
  return { k:k, W:W, H:H };
}
/* étiquette de taille fixe à l'écran : texte de 12 px mis à l'échelle k (les navigateurs plafonnent les très grandes tailles de police) */
function label(x, y, k, txt, cls, col){ return '<text transform="translate(' + (x + 7*k).toFixed(5) + ' ' + (-y - 6*k).toFixed(5) + ') scale(' + k.toPrecision(6) + ')" style="font-size:12px' + (col ? ';fill:' + col : '') + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(txt) + '</text>'; }
function render(){
  if (!D || !document.getElementById('so-svg')) return stop();
  var t = S.t;
  document.getElementById('so-day').textContent = fmt(t);
  var inp = document.getElementById('so-t'); inp.value = t; inp.setAttribute('aria-valuetext', fmt(t));
  var list = '', cap = [];
  MISSIONS.forEach(function(m, i){ var st = status(m, t);
    list += '<li><span class="sw" style="background:' + SCOL[i % SCOL.length] + '"></span><a href="#' + m.id + '"><strong>' + esc(m.short) + '</strong></a> · ' + statusText(st) + '</li>'; cap.push(m.short + ' : ' + statusText(st)); });
  document.getElementById('so-list').innerHTML = list;
  if (S.focus) renderFocus(t, cap); else renderSun(t, cap);
}
function renderSun(t, cap){
  var R = ZOOM[S.zoom][0], B = frameBox(R), k = B.k, pts = '<circle cx="0" cy="0" r="' + (7*k).toFixed(5) + '" class="so-sun"/>';
  document.getElementById('so-orb').innerHTML = D.planets.map(function(p){
    var a = loop(p), d = ''; for (var i = 0; i < a.length; i += 2) d += (i ? 'L' : 'M') + P(a[i], a[i+1]);
    return '<path d="' + d + 'Z" class="so-o" style="stroke:' + PCOL[p.name] + '"/>';
  }).join('');
  var small = { in:{}, mid:{ 'Mercure':1, 'Vénus':1 }, out:{ 'Mercure':1, 'Vénus':1, 'Terre':1, 'Mars':1 } }[S.zoom];
  D.planets.forEach(function(p){
    var q = at(p, t); if (!q) return;
    pts += '<g class="so-pl-g" data-focus="' + (RAD[p.name] && p.name !== 'Mercure' && p.name !== 'Vénus' ? p.name : '') + '"><circle cx="' + q[0].toFixed(4) + '" cy="' + (-q[1]).toFixed(4) + '" r="' + (4.5*k).toFixed(5) + '" style="fill:' + PCOL[p.name] + '"/>' +
      (small[p.name] ? '' : label(q[0], q[1], k, T(p.name))) + '</g>';
  });
  var trail = '', rings = {};
  MISSIONS.forEach(function(m, i){
    var s = D.probes.filter(function(x){ return x.id === m.id; })[0], st = status(m, t), col = SCOL[i % SCOL.length];
    if (!s || st.k === 'avant') return;
    /* trace : la croisière seulement (du lancement à l'arrivée) ; ensuite la sonde suit sa planète, dont l'orbite est déjà tracée */
    var arr = (m.events || []).filter(function(e){ return e.type === 'arrival' || e.type === 'orbit'; })[0], tc = arr ? day(arr.date) : Infinity;
    var end = Math.min(t, tc, s.t + s.step * (s.n - 1)), n = Math.floor((end - s.t) / s.step), d = '';
    for (var j = 0; j <= n; j++) d += (j ? 'L' : 'M') + P(s.xy[2*j], s.xy[2*j+1]);
    var q = at(s, end); if (q) d += 'L' + P(q[0], q[1]);
    trail += '<path d="' + d + '" style="stroke:' + col + '" class="so-tr' + (st.k === 'fin' ? ' done' : '') + '"/>';
    if (st.k === 'fin') return;
    if (st.k === 'orbite'){ var b = st.body === 'Lune' ? 'Terre' : st.body; (rings[b] = rings[b] || []).push([m, col]); return; }   /* anneau autour de la planète */
    q = at(s, t); if (!q) return;
    trail += '<a href="#' + m.id + '"><circle cx="' + q[0].toFixed(4) + '" cy="' + (-q[1]).toFixed(4) + '" r="' + (5*k).toFixed(5) + '" style="fill:' + col + '" class="so-p"/>' +
      label(q[0] + k, q[1] - 20*k, k, m.short, '', col) + '</a>';
  });
  D.planets.forEach(function(p){ var q = at(p, t); if (!q || !rings[p.name]) return;
    rings[p.name].forEach(function(r, j){ trail += '<a href="#' + r[0].id + '" aria-label="' + esc(r[0].short) + '"><circle cx="' + q[0].toFixed(4) + '" cy="' + (-q[1]).toFixed(4) + '" r="' + ((8 + 3.5*j)*k).toFixed(5) + '" style="stroke:' + r[1] + '" class="so-ring"/></a>'; }); });
  document.getElementById('so-pts').innerHTML = pts; document.getElementById('so-trail').innerHTML = trail;
  document.getElementById('so-moons').innerHTML = '';
  document.getElementById('so-cap').textContent = T('Vue de dessus du Système solaire au') + ' ' + fmt(t) + '. ' + cap.join(' ; ') + '.';
  document.getElementById('so-note').innerHTML = esc(T('Positions : JPL Horizons, vecteurs héliocentriques projetés sur le plan de l\'écliptique J2000, téléchargés le') + ' ' + fmt(day(D.fetched)).replace(/ \d\d:\d\d TU$/, '') + '. ' +
    T('Distances à l\'échelle ; tailles du Soleil, des planètes et des sondes non à l\'échelle.') + ' ' + T('Une sonde en orbite autour d\'une planète se confond avec elle à cette échelle : elle est marquée par un anneau de sa couleur, et seule sa croisière est tracée.') + ' ' +
    T('Cliquer sur une planète, ou choisir « Centrer sur », montre ses satellites.'));
}
function renderFocus(t, cap){
  var p = S.focus, ms = moonsOf(p), aMax = ms.reduce(function(r, m){ return Math.max(r, moonEl(m, t)[1] * (1 + moonEl(m, t)[2])); }, RAD[p] * 4);
  var sorted = ms.map(function(m){ return moonEl(m, t)[1]; }).sort(function(a, b){ return a - b; });
  var R = S.near && sorted.length > 2 ? sorted[Math.floor(sorted.length / 2) - 1] * 1.25 : aMax * 1.12;
  var B = frameBox(R), k = B.k, orb = '', pts = '', rows = '';
  ms.forEach(function(m){
    var el = moonEl(m, t), d = ''; for (var j = 0; j <= 96; j++){ var q = kep(el, j / 96 * 2 * Math.PI); d += (j ? 'L' : 'M') + P(q[0], q[1]); }
    orb += '<path d="' + d + 'Z" class="so-o" style="stroke:#9FB3C8"/>';
    var q = moonAt(m, t);
    pts += '<circle cx="' + q[0].toFixed(1) + '" cy="' + (-q[1]).toFixed(1) + '" r="' + (3.2*k).toFixed(2) + '" class="so-moon"/>' + (el[1] * (1 + el[2]) < R * 1.4 ? label(q[0], q[1], k, T(m.name)) : '');
    rows += '<li><strong>' + esc(T(m.name)) + '</strong> · ' + OBS_NUM(Math.round(el[1]).toLocaleString('fr-FR')) + ' km · ' + T('un tour en') + ' ' + OBS_NUM((360 / el[7]).toFixed(2).replace('.', ',')) + ' ' + T('jours') + '</li>';
  });
  pts = '<circle cx="0" cy="0" r="' + Math.max(RAD[p], 4*k).toFixed(1) + '" style="fill:' + PCOL[p] + '"/>' + label(Math.max(RAD[p], 4*k) * 0.7, Math.max(RAD[p], 4*k) * 0.7, k, T(p)) + pts;
  var here = MISSIONS.filter(function(m){ var st = status(m, t); return st.k === 'orbite' && (st.body === p || (p === 'Terre' && st.body === 'Lune')); });
  document.getElementById('so-orb').innerHTML = orb; document.getElementById('so-pts').innerHTML = pts; document.getElementById('so-trail').innerHTML = '';
  document.getElementById('so-moons').innerHTML = '<h3>' + T('Satellites de') + ' ' + esc(T(p)) + '</h3>' + (rows ? '<ul class="so-list so-ml">' + rows + '</ul>' : '<p class="note">' + T('Aucun satellite dans les données.') + '</p>') +
    (here.length ? '<p class="note">' + here.map(function(m){ return esc(m.short); }).join(', ') + ' : ' + T('en orbite à cette date, trop près de la planète pour être placée à cette échelle (position sur l\'orbite non publiée ici).') + '</p>' : '');
  document.getElementById('so-cap').textContent = T('Vue centrée sur') + ' ' + T(p) + ', ' + fmt(t) + '. ' + ms.map(function(m){ return T(m.name); }).join(', ') + '.';
  document.getElementById('so-note').innerHTML = esc(T('Vue de dessus de l\'écliptique centrée sur la planète : distances et taille de la planète à l\'échelle (rayon moyen, NASA NSSDCA), satellites agrandis.') + ' ' +
    T('Satellites placés à partir des éléments orbitaux JPL Horizons (tous les 180 jours, 30 pour les plus rapides), interpolés entre deux dates : position approchée (≈, quelques degrés sur l\'orbite au plus).')) +
    ' <a class="src" href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" rel="noopener" target="_blank">NASA NSSDCA</a> <a class="src" href="https://ssd.jpl.nasa.gov/horizons/" rel="noopener" target="_blank">JPL Horizons</a>';
}
function frame(ts){
  if (!S.run) return;
  if (!document.getElementById('so-t')) return stop();
  var dt = S.last ? Math.min(0.1, (ts - S.last) / 1000) : 0; S.last = ts;
  S.t = Math.min(T1, S.t + dt * S.speed); render();
  if (S.t >= T1) return stop();
  S.raf = requestAnimationFrame(frame);
}
function stop(){ S.run = false; S.last = 0; cancelAnimationFrame(S.raf); var b = document.getElementById('so-play'); if (b){ b.setAttribute('aria-pressed', 'false'); b.textContent = T('Lecture'); } }
function setFocus(p){ S.focus = p || ''; S.near = false; var sel = document.getElementById('so-focus'); if (sel) sel.value = S.focus; zoomButtons(); render(); }
function mount(){
  D = (window.DATA_FILES || {})['solar'];
  if (!D){ document.getElementById('so-wrap').innerHTML = '<p class="note">' + T('Positions pas encore téléchargées (workflow « Données réelles »).') + '</p>'; return; }
  D.planets.concat(D.probes).forEach(function(s){ s.t = day(s.t0); });
  D.moons = D.moons || [];
  T0 = Math.min.apply(null, D.probes.map(function(s){ return s.t; })); T1 = day(D.fetched);
  var inp = document.getElementById('so-t'); inp.min = T0; inp.max = T1;
  if (S.t == null || S.t < T0 || S.t > T1) S.t = Math.min(T1, now());   /* par défaut : maintenant (dans la limite des données) */
  inp.addEventListener('input', function(){ S.t = +inp.value; render(); });
  document.getElementById('so-now').addEventListener('click', function(){ S.t = Math.min(T1, now()); render(); });
  document.getElementById('so-speed').addEventListener('change', function(e){ S.speed = +e.target.value; render(); });
  document.getElementById('so-focus').addEventListener('change', function(e){ setFocus(e.target.value); });
  document.getElementById('so-play').addEventListener('click', function(e){
    if (S.run) return stop();
    if (S.t >= T1) S.t = T0;
    S.run = true; e.currentTarget.setAttribute('aria-pressed', 'true'); e.currentTarget.textContent = T('Pause'); S.raf = requestAnimationFrame(frame);
  });
  document.getElementById('so-zoom').addEventListener('click', function(e){ var z = e.target.getAttribute('data-sz'); if (!z) return;
    if (S.focus) S.near = z === 'near'; else S.zoom = z; zoomButtons(); render(); });
  document.getElementById('so-svg').addEventListener('click', function(e){ var g = e.target.closest && e.target.closest('[data-focus]'); if (g && g.getAttribute('data-focus')) setFocus(g.getAttribute('data-focus')); });
  if (!window.__soResize){ window.__soResize = 1; window.addEventListener('resize', function(){ if (document.getElementById('so-svg')) render(); }); }
  zoomButtons(); render();
}
return { html:html, mount:mount, stop:stop };
})();
