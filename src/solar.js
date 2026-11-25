/* =================================================================
   ACCUEIL « SYSTÈME SOLAIRE » — vue de dessus du plan de l'écliptique, sur le modèle du « Ciel » d'Observatories (home.js) :
   la carte, des boutons de cadrage posés dessus, la barre de lecture en dessous, la liste des corps et des sondes à droite.
   Données : JPL Horizons (data/solar.json, recette « solar » de tools/data/fetch_orbits.py) : planètes, Pluton et satellites
   jusqu'à deux ans après le téléchargement (prévision, signalée), sondes jusqu'au téléchargement.
   Zoom continu, du système entier jusqu'aux satellites d'une planète : les coordonnées d'écran sont calculées par rapport au
   centre de la vue (en double précision), et la vue suit le corps choisi. Distances à l'échelle ; tailles du Soleil et des planètes
   à l'échelle dès qu'elles dépassent quelques pixels, sinon agrandies (signalé) ; satellites placés à partir des éléments
   orbitaux Horizons interpolés entre deux époques (≈, signalé).
   SolarPage.html() rend la page, SolarPage.mount() la branche, SolarPage.stop() l'arrête.
================================================================= */
var SolarPage = (function(){
'use strict';
var MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
var PCOL = { 'Mercure':'#B9B2A8', 'Vénus':'#E8C26A', 'Terre':'#6FA8FF', 'Mars':'#E07A4F', 'Jupiter':'#D9A66B', 'Saturne':'#E6D08A', 'Uranus':'#9FE3E8', 'Neptune':'#6C8CFF', 'Pluton':'#C9A88A' };
/* rayons moyens en km, NASA NSSDCA « Planetary Fact Sheet » et « Moon Fact Sheet » ; Soleil : NSSDCA « Sun Fact Sheet » */
var RAD = { 'Mercure':2440, 'Vénus':6052, 'Terre':6371, 'Mars':3390, 'Jupiter':69911, 'Saturne':58232, 'Uranus':25362, 'Neptune':24622, 'Pluton':1188, 'Lune':1737 };
var RSUN = 695700, AU = 149597870.7;
var HZ = { '399':'Terre', '499':'Mars', '599':'Jupiter', '699':'Saturne', '799':'Uranus', '899':'Neptune', '999':'Pluton' };
var SPEED = [[1/24, 'une heure par seconde'], [1, 'un jour par seconde'], [7, 'une semaine par seconde'], [30, 'un mois par seconde'], [365, 'un an par seconde']];
var SCOL = ['#FF6B9A', '#4DD0E1', '#B39DDB', '#FFB74D', '#81C784'];   /* une couleur par sonde, dans l'ordre du registre (aucune agence mise en avant) */
var DAY = 864e5, RMIN = 1e-5, RMAX = 60;
var S = { t:null, speed:7, run:false, raf:0, last:0, focus:'', off:[0, 0], c:[0, 0], R:1.75, goal:null, dirty:true, auto:false, hits:[], ptr:{} };
var D = null, T0 = 0, T1 = 0, TF = 0;
function T(s){ return OBS_T(s); }
function en(){ return OBS_LANG === 'en'; }
function colon(){ return en() ? ': ' : ' : '; }
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function reduce(){ return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
function dec(x, d){ return OBS_NUM(x.toFixed(d).replace('.', en() ? '.' : ',')); }
function day(s){   /* « 2005-Aug-13 » (Horizons) ou « 2005-08-13 » / « 2006-11 » → jours depuis 1970 */
  var m = /^(\d{4})-(\w{3})-(\d{2})/.exec(s); if (m) return Date.UTC(+m[1], MON[m[2]] - 1, +m[3]) / DAY;
  m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) / DAY;
}
function fmt(t, hours){
  var o = { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }; if (hours) { o.hour = '2-digit'; o.minute = '2-digit'; }
  return new Date(t * DAY).toLocaleString(en() ? 'en-GB' : 'fr-FR', o) + (hours ? (en() ? ' UT' : ' TU') : '');
}
function now(){ return Date.now() / DAY; }
/* position d'une série { t, step, n, xy } au jour t, interpolée par une spline de Catmull-Rom (le segment droit coupe trop
   les virages pour un zoom sur la Terre et la Lune) ; null hors de la série */
function cr(p0, p1, p2, p3, u){ return p1 + 0.5 * u * (p2 - p0 + u * (2*p0 - 5*p1 + 4*p2 - p3 + u * (3*(p1 - p2) + p3 - p0))); }
function at(s, t){
  var f = (t - s.t) / s.step; if (f < 0 || f > s.n) return null; f = Math.min(f, s.n - 1);   /* un pas de tolérance au bout de la série */
  var i = Math.min(s.n - 2, Math.floor(f)), u = f - i, a = s.xy, i0 = Math.max(0, i - 1), i3 = Math.min(s.n - 1, i + 2);
  return [cr(a[2*i0], a[2*i], a[2*i+2], a[2*i3], u), cr(a[2*i0+1], a[2*i+1], a[2*i+3], a[2*i3+1], u)];
}
/* un tour d'orbite : la série « orbit » de la recette, sinon les points de la série datée jusqu'à un tour complet */
function loop(s){
  if (s.orbit) return s.orbit;
  var a = s.xy, acc = 0, prev = Math.atan2(a[1], a[0]), pts = [a[0], a[1]];
  for (var i = 1; i < s.n; i++){ var th = Math.atan2(a[2*i+1], a[2*i]), d = th - prev; if (d > Math.PI) d -= 2*Math.PI; if (d < -Math.PI) d += 2*Math.PI; acc += Math.abs(d); prev = th; pts.push(a[2*i], a[2*i+1]); if (acc >= 2*Math.PI) break; }
  return pts;
}
/* satellites : éléments [JD, a km, e, i, Ω, ω, M, n °/j] interpolés entre les deux époques qui encadrent la date ; la longitude
   moyenne avance au mouvement moyen effectif qui relie les deux époques (le mouvement osculateur seul dérive vite pour Phobos ou Encelade) */
var RD = Math.PI / 180;
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
function status(m, t){
  var st = { k:'avant' };
  (m.events || []).forEach(function(e){ if (day(e.date) > t) return;
    if (e.type === 'launch') st = { k:'croisiere' };
    else if (e.type === 'arrival' || e.type === 'orbit') st = { k:'orbite', body:e.body };
    else if (e.type === 'end') st = { k:'fin', date:e.date }; });
  return st;
}
function statusText(st){
  return st.k === 'avant' ? T('pas encore lancée') : st.k === 'croisiere' ? T('en croisière') : st.k === 'orbite' ? T('en orbite autour de ' + (st.body === 'Lune' ? 'la Lune' : st.body)) : T('mission terminée');
}
function mission(id){ return MISSIONS.filter(function(x){ return x.id === id; })[0]; }
function moonsOf(p){ return (D && D.moons || []).filter(function(m){ return HZ[m.center] === p; }); }
function planet(name){ return D.planets.filter(function(p){ return p.name === name; })[0]; }
function probe(id){ return D.probes.filter(function(p){ return p.id === id; })[0]; }
/* position héliocentrique (UA) d'une cible : planète, satellite (« Lune »…), sonde « probe:id » (son corps quand elle est en orbite) */
function posOf(f, t){
  if (!f) return [0, 0];
  var p = planet(f); if (p) return at(p, t);
  if (/^probe:/.test(f)){ var id = f.slice(6), st = status(mission(id), t);
    if (st.k === 'orbite') return posOf(st.body, t); var s = probe(id); return s && at(s, Math.min(t, s.t + s.step * (s.n - 1))); }
  var mo = (D.moons || []).filter(function(x){ return x.name === f; })[0]; if (!mo) return null;
  var c = at(planet(HZ[mo.center]), t), q = moonAt(mo, t); return c && [c[0] + q[0] / AU, c[1] + q[1] / AU];
}
/* demi-largeur de vue (UA) qui montre une cible et son entourage : les satellites d'une planète, le voisinage d'une sonde */
function reach(f, t){
  if (/^probe:/.test(f)){ var st = status(mission(f.slice(6)), t), ob = st.k === 'orbite' && orbitAt(f.slice(6), t); return ob ? Math.max(ob.s.rmax, (RAD[st.body] || 0)) * 1.5 / AU : st.k === 'orbite' ? reach(st.body, t) : 0.25; }
  var ms = moonsOf(f), a = ms.reduce(function(r, m){ var el = moonEl(m, t); return Math.max(r, el[1] * (1 + el[2])); }, 0);
  return (a ? a * 1.15 : (RAD[f] || 3000) * 30) / AU;
}

/* orbite réelle d'une sonde autour de son corps (data/solar.json, « orbits ») : fenêtre Horizons la plus récente avant t.
   Période : premier tour complet de l'angle autour du corps dans la fenêtre ; hors de la fenêtre, la sonde est placée en répétant
   ce tour (≈ : la phase dérive avec le temps, l'orbite elle-même évolue d'une année à l'autre). */
function orbitAt(id, t){
  var o = (D.orbits || []).filter(function(x){ return x.id === id; })[0]; if (!o || !o.samples.length) return null;
  var sm = null; o.samples.forEach(function(x){ if (x.tt == null) x.tt = day(x.t0); if (x.tt <= t) sm = x; }); sm = sm || o.samples[0];
  if (sm.per === undefined){ var xy = sm.xy, a0 = Math.atan2(xy[1], xy[0]), acc = 0, prev = a0, rm = 0; sm.per = 0;
    for (var i = 1; i < xy.length / 2; i++){ var a = Math.atan2(xy[2*i+1], xy[2*i]), d = a - prev; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; acc += d; prev = a;
      if (!sm.per && Math.abs(acc) >= 2 * Math.PI){ sm.per = i - (Math.abs(acc) - 2 * Math.PI) / Math.abs(d); } }
    for (i = 0; i < xy.length; i += 2) rm = Math.max(rm, Math.hypot(xy[i], xy[i+1])); sm.rmax = rm; }
  return { o:o, s:sm };
}
function onOrbit(sm, t){   /* position (km, relative au corps) à l'instant t, et minutes par tour */
  var n = sm.xy.length / 2, u = (t - sm.tt) * 1440 / sm.step_min;
  if (sm.per) u = ((u % sm.per) + sm.per) % sm.per; else if (u < 0 || u > n - 1) return null;
  var i = Math.min(n - 2, Math.floor(u)), f = u - i;
  return [sm.xy[2*i] + (sm.xy[2*i+2] - sm.xy[2*i]) * f, sm.xy[2*i+1] + (sm.xy[2*i+3] - sm.xy[2*i+1]) * f];
}
function html(){
  var sp = SPEED.map(function(s){ return '<option value="' + s[0] + '"' + (s[0] === S.speed ? ' selected' : '') + '>' + esc(T(s[1])) + '</option>'; }).join('');
  return '<div class="home solar">' +
    '<div class="home-map">' +
      '<div class="home-head"><h2>' + esc(T('Système solaire')) + '</h2><p>' + esc(T('Les planètes, leurs satellites et les sondes à leur position réelle, vus de dessus du plan de l\'écliptique. La lecture part d\'aujourd\'hui ; le curseur remonte jusqu\'au lancement de Cassini.')) + '</p></div>' +
      '<div class="home-sky so-sky" id="so-wrap">' +
        '<svg id="so-svg" role="img" aria-labelledby="so-cap"></svg>' +
        '<div class="home-zoom" role="group" aria-label="' + esc(T('Cadrage')) + '">' +
          '<button id="so-zin" aria-label="' + esc(T('Zoomer')) + '" title="' + esc(T('Zoomer')) + '">+</button><button id="so-zout" aria-label="' + esc(T('Dézoomer')) + '" title="' + esc(T('Dézoomer')) + '">−</button>' +
          '<button data-sz="in">' + esc(T('Planètes intérieures')) + '</button><button data-sz="all">' + esc(T('Système entier')) + '</button>' +
          '<button id="so-3d" aria-pressed="false">' + esc(T('Vue 3D')) + '</button></div>' +
        '<div class="home-tip" id="so-tip" hidden></div>' +
      '</div>' +
      '<div class="home-ctl so-ctl">' +
        '<button class="dep-b" id="so-play" aria-label="' + esc(T('Lecture')) + '" title="' + esc(T('Lecture')) + '"></button>' +
        '<input id="so-t" type="range" step="any" aria-label="' + esc(T('Date')) + '">' +
        '<span class="home-yr" id="so-day"></span>' +
        '<label class="so-sel"><span>' + esc(T('Vitesse')) + '</span> <select id="so-speed">' + sp + '</select></label>' +
        '<button class="chip" id="so-now">' + esc(T('Aujourd\'hui')) + '</button>' +
      '</div>' +
      '<p class="cap" id="so-note"></p><p class="sr-only" id="so-cap"></p>' +
    '</div>' +
    '<aside class="home-side" aria-label="' + esc(T('Corps et sondes')) + '">' +
      '<p class="home-al">' + esc(T('Cliquez une planète, ou choisissez-la ici, pour la suivre et voir ses satellites. Molette, double clic ou boutons pour zoomer ; glisser pour se déplacer.')) + '</p>' +
      '<div class="home-pick"><h3>' + esc(T('Centrer sur')) + '</h3><div class="home-leg" id="so-bodies"></div></div>' +
      '<div id="so-moons"></div>' +
      '<h3>' + esc(T('Les sondes à cette date')) + '</h3><div class="home-leg" id="so-probes"></div>' +
    '</aside></div>';
}
/* listes de la colonne : construites une fois (les boutons ne doivent pas être remplacés pendant un clic), textes mis à jour à chaque image */
function side(){
  $('so-bodies').innerHTML = '<button class="home-li" data-sf="" aria-pressed="false"><i style="background:#FFD54F"></i><b>' + esc(T('Soleil')) + '</b><span></span></button>' +
    D.planets.map(function(p){ return '<button class="home-li" data-sf="' + esc(p.name) + '" aria-pressed="false"><i style="background:' + PCOL[p.name] + '"></i><b>' + esc(T(p.name)) + '</b><span data-d></span></button>'; }).join('');
  $('so-probes').innerHTML = MISSIONS.map(function(m, i){ return '<button class="home-li" data-sf="probe:' + m.id + '" aria-pressed="false"><i style="background:' + SCOL[i % SCOL.length] + '"></i><b>' + esc(m.short) + '</b><span></span><small data-st></small></button>'; }).join('');
}
function moonsPanel(){
  var p = planet(S.focus) && S.focus, ms = p ? moonsOf(p) : [];
  $('so-moons').innerHTML = !p ? '' : '<div class="home-pick"><h3>' + esc(T('Satellites de') + ' ' + T(p)) + '</h3>' + (ms.length ? '<ul class="home-sv">' + ms.map(function(m){
      var el = moonEl(m, S.t); return '<li><b>' + esc(T(m.name)) + '</b> · ' + OBS_NUM(Math.round(el[1]).toLocaleString('fr-FR')) + ' km · ' + esc(T('un tour en')) + ' ' + dec(360 / el[7], 2) + ' ' + esc(T('jours')) + '</li>'; }).join('') + '</ul>'
    : '<p class="cap">' + esc(T('Aucun satellite dans les données.')) + '</p>') + '</div>';
}
function setFocus(f){
  S.focus = f || ''; S.goal = f ? { R:reach(f, S.t) } : { R:S.R > 2 ? S.R : 1.75, c:[0, 0] };
  if (f){ var p = posOf(f, S.t); S.off = p ? [S.c[0] - p[0], S.c[1] - p[1]] : [0, 0]; }
  moonsPanel(); kick();
}
function frameAll(){ var m = 0; D.planets.forEach(function(p){ var q = at(p, S.t); if (q) m = Math.max(m, Math.hypot(q[0], q[1])); }); return m * 1.08 || 33; }

/* ---------- dessin ---------- */
function render(){
  if (S.mode === '3d') return render3();
  var svg = $('so-svg'); if (!svg) return;
  var w = Math.max(200, svg.clientWidth), h = Math.max(200, svg.clientHeight), k = 2 * S.R / Math.min(w, h), t = S.t, cx = S.c[0], cy = S.c[1];
  svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
  function X(x){ return w / 2 + (x - cx) / k; } function Y(y){ return h / 2 - (y - cy) / k; }
  function vis(x, y, m){ return x > -m && x < w + m && y > -m && y < h + m; }
  function f1(v){ return v.toFixed(1); }
  var labs = [], hits = [], orb = '', body = '', top = '';
  function label(x, y, txt, cls, c){   /* étiquettes : la première posée gagne, les suivantes qui la chevauchent sont omises */
    var lw = txt.length * 6.6 + 4; if (labs.some(function(b){ return Math.abs(b[0] - x - lw / 2) < (lw + b[2]) / 2 + 2 && Math.abs(b[1] - y) < 14; })) return '';
    labs.push([x + lw / 2, y, lw]); return '<text x="' + f1(x) + '" y="' + f1(y) + '"' + (cls ? ' class="' + cls + '"' : '') + (c ? ' style="fill:' + c + '"' : '') + '>' + esc(txt) + '</text>';
  }
  var sr = Math.max(RSUN / AU / k, 6), sx = X(0), sy = Y(0);
  body += '<circle cx="' + f1(sx) + '" cy="' + f1(sy) + '" r="' + f1(Math.min(sr, 4e4)) + '" class="so-sun"/>';
  if (vis(sx, sy, sr)) hits.push([sx, sy, T('Soleil'), '', sr]);
  /* orbites des planètes : tracées tant que l'écart de la ligne brisée à l'orbite vraie reste sous un pixel et demi */
  D.planets.forEach(function(p){
    var a = loop(p), r = Math.hypot(a[0], a[1]); if (r * 9e-5 / k > 1.5) return;
    var d = ''; for (var i = 0; i < a.length; i += 2) d += (i ? 'L' : 'M') + f1(X(a[i])) + ' ' + f1(Y(a[i+1]));
    orb += '<path d="' + d + 'Z" class="so-o" style="stroke:' + PCOL[p.name] + '"/>';
  });
  var showTrails = S.R > 0.02, pos = {};
  D.planets.forEach(function(p){
    var q = at(p, t); if (!q) return; pos[p.name] = q;
    var x = X(q[0]), y = Y(q[1]), pr = Math.max(RAD[p.name] / AU / k, 4.5); if (!vis(x, y, pr + 40)) return;
    body += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(Math.min(pr, 4e4)) + '" style="fill:' + PCOL[p.name] + '"/>';
    hits.push([x, y, T(p.name), p.name, pr]);
    /* satellites dès que leurs orbites se séparent de la planète à l'écran */
    moonsOf(p.name).forEach(function(m){
      var el = moonEl(m, t), ar = el[1] / AU / k; if (ar < 5) return;
      var d = ''; for (var j = 0; j <= 72; j++){ var o = kep(el, j / 72 * 2 * Math.PI); d += (j ? 'L' : 'M') + f1(x + o[0] / AU / k) + ' ' + f1(y - o[1] / AU / k); }
      orb += '<path d="' + d + 'Z" class="so-o so-mo"/>';
      var o2 = moonAt(m, t), mx = x + o2[0] / AU / k, my = y - o2[1] / AU / k, mr = Math.max((RAD[m.name] || 0) / AU / k, 3);
      top += '<circle cx="' + f1(mx) + '" cy="' + f1(my) + '" r="' + f1(Math.min(mr, 4e4)) + '" class="so-moon"/>';
      if (ar > 26) top += label(mx + mr + 4, my + 4, T(m.name), 'so-ml');
      pos[m.name] = [q[0] + o2[0] / AU, q[1] + o2[1] / AU]; hits.push([mx, my, T(m.name), m.name === 'Lune' ? 'Lune' : p.name, mr]);
    });
  });
  /* sondes : croisière tracée ; en orbite, un anneau de sa couleur autour du corps (position sur l'orbite non publiée ici) */
  var rings = {}, probes = '';
  MISSIONS.forEach(function(m, i){
    var s = probe(m.id), st = status(m, t), c = SCOL[i % SCOL.length];
    if (!s || st.k === 'avant') return;
    var arr = (m.events || []).filter(function(e){ return e.type === 'arrival' || e.type === 'orbit'; })[0], tc = arr ? day(arr.date) : Infinity;
    if (showTrails){
      var e = Math.min(t, tc, s.t + s.step * (s.n - 1)), n = Math.floor((e - s.t) / s.step), d = '';
      for (var j = 0; j <= n; j++) d += (j ? 'L' : 'M') + f1(X(s.xy[2*j])) + ' ' + f1(Y(s.xy[2*j+1]));
      var q = at(s, e); if (q) d += 'L' + f1(X(q[0])) + ' ' + f1(Y(q[1]));
      orb += '<path d="' + d + '" style="stroke:' + c + '" class="so-tr' + (st.k === 'fin' ? ' done' : '') + '"/>';
    }
    if (st.k === 'fin') return;
    if (st.k === 'orbite'){ (rings[st.body] = rings[st.body] || []).push([m, c]); return; }
    var p = at(s, Math.min(t, s.t + s.step * (s.n - 1))); if (!p) return;
    var x = X(p[0]), y = Y(p[1]); if (!vis(x, y, 20)) return;
    probes += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="5" style="fill:' + c + '" class="so-p"/>' + label(x + 8, y - 8, m.short, 'so-pl', c);
    hits.push([x, y, m.short, 'probe:' + m.id, 5]);
  });
  Object.keys(rings).forEach(function(b){ var q = pos[b]; if (!q) return; var x = X(q[0]), y = Y(q[1]), br = Math.max((RAD[b] || 0) / AU / k, b === 'Lune' ? 3 : 4.5), RB = RAD[b] || 0;
    rings[b] = rings[b].filter(function(r){
      /* assez de zoom : l'orbite réelle (Horizons) remplace l'anneau ; en tirets, la partie cachée derrière le corps */
      var ob = orbitAt(r[0].id, t); if (!ob || ob.s.rmax / AU / k < 9 || !vis(x, y, ob.s.rmax / AU / k)) return true;
      var sm = ob.s, P = { v:['', ''], h:['', ''] }, pv = null, ph = false;
      function seg(w, a, z){ var o = P[w]; o[0] += (o[1] === a ? '' : 'M' + a) + 'L' + z; o[1] = z; }
      for (var i = 0; i < sm.xy.length; i += 2){ var hid = !!(sm.z && sm.z[i / 2] < 0 && Math.hypot(sm.xy[i], sm.xy[i+1]) < RB), pt = f1(x + sm.xy[i] / AU / k) + ' ' + f1(y - sm.xy[i+1] / AU / k);
        if (pv) seg(hid || ph ? 'h' : 'v', pv, pt); pv = pt; ph = hid;
        if (sm.per && i / 2 > sm.per + 1) break; }
      probes += '<path d="' + P.v[0] + '" style="stroke:' + r[1] + '" class="so-orb"/>' + (P.h[0] ? '<path d="' + P.h[0] + '" style="stroke:' + r[1] + '" class="so-orb hid"/>' : '');
      var fast = sm.per && S.run && S.speed * 1440 / (sm.per * sm.step_min) > 1.5, pq = !fast && onOrbit(sm, t);
      if (pq){ var px = x + pq[0] / AU / k, py = y - pq[1] / AU / k;
        probes += '<circle cx="' + f1(px) + '" cy="' + f1(py) + '" r="5" style="fill:' + r[1] + '" class="so-p"/>' + label(px + 8, py - 8, r[0].short, 'so-pl', r[1]);
        hits.push([px, py, r[0].short, 'probe:' + r[0].id, 5]); }
      else probes += label(x + sm.rmax / AU / k * 0.72 + 4, y - sm.rmax / AU / k * 0.72, r[0].short, 'so-pl', r[1]);
      S.orbShown = S.orbShown || {}; S.orbShown[r[0].id] = sm.t0;
      return false;
    });
    rings[b].forEach(function(r, j){ var rr = Math.max(br * 1.35, br + 4) + 3.5 * j; probes += '<circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="' + f1(Math.min(rr, 4e4)) + '" style="stroke:' + r[1] + '" class="so-ring"/>';
      if (br > 12) probes += label(x + rr * 0.72 + 4, y - rr * 0.72 - 2 - 14 * j, r[0].short, 'so-pl', r[1]); }); });
  /* étiquettes des planètes après celles des sondes, à l'écart du Soleil quand le système entier est cadré */
  var plab = '';
  D.planets.forEach(function(p){ var q = pos[p.name]; if (!q) return; var x = X(q[0]), y = Y(q[1]), pr = Math.max(RAD[p.name] / AU / k, 4.5);
    if (Math.hypot(x - sx, y - sy) < 16 + sr || !vis(x, y, 40)) return; plab += label(x + pr * 0.7 + 5, y - pr * 0.7 - 4, T(p.name)); });
  svg.innerHTML = '<g>' + orb + '</g><g>' + body + '</g><g>' + top + '</g><g>' + probes + '</g><g class="so-labs">' + plab + '</g>' + scale(h, k);
  S.hits = hits;
  ui();
}
/* échelle : une longueur ronde (km ou UA) en bas à gauche */
function scale(h, k){
  var L = 120 * k, au = L >= 0.05, v = au ? L : L * AU, p = Math.pow(10, Math.floor(Math.log10(v))), r = [5, 2, 1].map(function(x){ return x * p; }).filter(function(x){ return x <= v; })[0] || p;
  var px = (au ? r : r / AU) / k, txt = au ? dec(r, r < 1 ? (r < 0.1 ? 2 : 1) : 0) + ' ' + T('UA') : OBS_NUM(Math.round(r).toLocaleString('fr-FR')) + ' km';
  return '<g class="so-scale"><path d="M16 ' + (h - 18) + 'v6h' + px.toFixed(1) + 'v-6"/><text x="16" y="' + (h - 24) + '">' + esc(txt) + '</text></g>';
}
/* textes hors carte : date, boutons, état des sondes, légende */
function ui(){
  var t = S.t, fut = t > TF + 0.5;
  $('so-day').innerHTML = esc(fmt(t, S.speed < 1)) + (fut ? ' <small class="so-fut">' + esc(T('prévision')) + '</small>' : '');
  var inp = $('so-t'); if (document.activeElement !== inp) inp.value = t; inp.setAttribute('aria-valuetext', fmt(t));
  var b = $('so-play'); b.textContent = S.run ? '❚❚' : '▶'; b.setAttribute('aria-label', T(S.run ? 'Pause' : 'Lecture')); b.title = T(S.run ? 'Pause' : 'Lecture');
  [].forEach.call(document.querySelectorAll('#so-bodies .home-li, #so-probes .home-li'), function(el){
    var f = el.getAttribute('data-sf'); el.setAttribute('aria-pressed', f === S.focus);
    var p = planet(f), q = p && at(p, t); if (q) el.querySelector('[data-d]').textContent = dec(Math.hypot(q[0], q[1]), 2) + ' ' + T('UA');
  });
  var cap = [];
  MISSIONS.forEach(function(m){ var st = statusText(status(m, t)), el = document.querySelector('#so-probes [data-sf="probe:' + m.id + '"] [data-st]'); if (el && el.textContent !== st) el.textContent = st; cap.push(m.short + colon() + st); });
  var fn = S.focus ? (/^probe:/.test(S.focus) ? mission(S.focus.slice(6)).short : T(S.focus)) : T('le Soleil');
  $('so-cap').textContent = T(S.mode === '3d' ? 'Vue en 3D du Système solaire au' : 'Vue de dessus du Système solaire au') + ' ' + fmt(t) + ', ' + T('centrée sur') + ' ' + fn + '. ' + cap.join(' ; ') + '.';
}
function note(){
  $('so-note').innerHTML = LIVE.warn(D.fetched, 14) + esc(T('Positions : JPL Horizons, vecteurs héliocentriques projetés sur le plan de l\'écliptique J2000, téléchargés le') + ' ' + fmt(TF) + (T1 > TF + 1 ? ' ; ' + T('au-delà, prévision Horizons jusqu\'au') + ' ' + fmt(T1) : '') + '. ' +
    T('Distances à l\'échelle. Soleil, planètes et Lune à l\'échelle dès qu\'ils dépassent quelques pixels ; en deçà, et pour les autres satellites et les sondes, des points de taille fixe.') + ' ' +
    T('Satellites placés à partir des éléments orbitaux Horizons (tous les 180 jours, 30 pour les plus rapides), interpolés entre deux dates : position approchée (≈, quelques degrés sur l\'orbite au plus).') + ' ' +
    T('Une sonde en orbite est marquée de loin par un anneau de sa couleur. En zoomant sur son corps, son orbite réelle apparaît (Horizons, centrée sur le corps, une fenêtre par an à partir du 15 janvier ; en tirets, la partie cachée derrière le corps) : entre deux fenêtres, la sonde y est placée en répétant ce tour (≈, la phase dérive). En lecture rapide, seule l\'orbite est tracée.') ) +
    (S.mode === '3d' ? ' ' + T(hasZ(D.planets[0]) ? 'Vue 3D : mêmes positions, avec la hauteur au-dessus du plan de l\'écliptique donnée par Horizons ; glisser ou flèches du clavier pour tourner, molette ou + et − pour zoomer.' : 'Vue 3D : hauteurs au-dessus de l\'écliptique pas encore téléchargées, tous les corps sont posés sur l\'écliptique (≈) ; glisser ou flèches du clavier pour tourner, molette ou + et − pour zoomer.') : '') +
    ' <a class="src" href="https://ssd.jpl.nasa.gov/horizons/" rel="noopener" target="_blank">JPL Horizons</a> <a class="src" href="https://nssdc.gsfc.nasa.gov/planetary/factsheet/" rel="noopener" target="_blank">NASA NSSDCA</a>';
}

/* ---------- vue 3D (three.js r128, déjà chargé pour les maquettes) ----------
   Mêmes positions que la vue de dessus, avec la hauteur au-dessus de l'écliptique (champ z des séries Horizons ; s'il manque,
   les corps sont posés sur l'écliptique et la note le dit). Repère three.js : X = x écliptique, Y = z (nord de l'écliptique), Z = −y.
   Pour garder la précision en zoomant sur un satellite, tout est dessiné relativement au point visé (calcul en double précision),
   et le demi-champ S.R (UA) de la vue de dessus sert de distance de caméra : le zoom, le cadrage et le suivi sont partagés. */
var V3 = null, FOV = 45, TANH = Math.tan(FOV / 2 * Math.PI / 180);
S.mode = '2d'; S.az = -1.15; S.el = 0.5;
function hasZ(s){ return !!(s && s.z && s.z.length >= s.n); }
function atz(s, t){
  if (!hasZ(s)) return 0;
  var f = Math.max(0, Math.min((t - s.t) / s.step, s.n - 1)), i = Math.min(s.n - 2, Math.floor(f)), u = f - i, a = s.z;
  return cr(a[Math.max(0, i - 1)], a[i], a[i + 1], a[Math.min(s.n - 1, i + 2)], u);
}
function kep3(el, E){   /* comme kep(), avec la hauteur au-dessus de l'écliptique (km) */
  var a = el[1], e = el[2], i = el[3]*RD, O = el[4]*RD, w = el[5]*RD, x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e*e) * Math.sin(E);
  var cO = Math.cos(O), sO = Math.sin(O), cw = Math.cos(w), sw = Math.sin(w), ci = Math.cos(i), si = Math.sin(i);
  return [(cO*cw - sO*sw*ci) * x + (-cO*sw - sO*cw*ci) * y, (sO*cw + cO*sw*ci) * x + (-sO*sw + cO*cw*ci) * y, sw*si * x + cw*si * y];
}
function moon3(m, t){ var el = moonEl(m, t), M = (el[6] % 360) * RD, E = M; for (var k = 0; k < 8; k++) E = E - (E - el[2] * Math.sin(E) - M) / (1 - el[2] * Math.cos(E)); return kep3(el, E); }
/* position héliocentrique [x, y, z] (UA), comme posOf() */
function pos3(f, t){
  if (!f) return [0, 0, 0];
  var p = planet(f); if (p){ var q = at(p, t); return q && [q[0], q[1], atz(p, t)]; }
  if (/^probe:/.test(f)){ var id = f.slice(6), st = status(mission(id), t);
    if (st.k === 'orbite') return pos3(st.body, t);
    var s = probe(id), te = s && Math.min(t, s.t + s.step * (s.n - 1)), r = s && at(s, te); return r && [r[0], r[1], atz(s, te)]; }
  var mo = (D.moons || []).filter(function(x){ return x.name === f; })[0]; if (!mo) return null;
  var c = pos3(HZ[mo.center], t), o = moon3(mo, t); return c && [c[0] + o[0] / AU, c[1] + o[1] / AU, c[2] + o[2] / AU];
}
function v3(p, o){ return new THREE.Vector3(p[0] - o[0], p[2] - o[2], -(p[1] - o[1])); }
function init3(){
  var wrap = $('so-wrap');
  if (V3){ wrap.insertBefore(V3.renderer.domElement, wrap.firstChild); wrap.insertBefore(V3.labs, V3.renderer.domElement.nextSibling); return true; }
  if (!window.THREE) return false;
  var r; try { r = new THREE.WebGLRenderer({ antialias:true, logarithmicDepthBuffer:true }); } catch(e){ return false; }
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); r.setClearColor(0x05070A, 1); r.outputEncoding = THREE.sRGBEncoding;
  var cv = r.domElement; cv.id = 'so-gl'; cv.className = 'so-gl'; cv.tabIndex = 0; cv.setAttribute('role', 'img'); cv.setAttribute('aria-labelledby', 'so-cap');
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(FOV, 1, 1e-7, 1e4), root = new THREE.Group(); scene.add(root);
  scene.add(new THREE.AmbientLight(0xffffff, 0.22)); var light = new THREE.PointLight(0xffffff, 1.25, 0, 0); scene.add(light);
  var ball = new THREE.SphereGeometry(1, 64, 32);
  var sun = new THREE.Mesh(ball, new THREE.MeshBasicMaterial({ color:0xFFD54F })); scene.add(sun);
  var bodies = {}, orbits = new THREE.Group(); root.add(orbits);
  D.planets.forEach(function(p){
    bodies[p.name] = new THREE.Mesh(ball, new THREE.MeshLambertMaterial({ color:PCOL[p.name] })); scene.add(bodies[p.name]);
    var a = loop(p), oz = p.orbit_z || [], pts = [];
    for (var i = 0; i < a.length; i += 2) pts.push(new THREE.Vector3(a[i], oz[i / 2] || 0, -a[i + 1]));
    var ln = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color:PCOL[p.name], transparent:true, opacity:0.5 })); orbits.add(ln);
  });
  (D.moons || []).forEach(function(m){ bodies[m.name] = new THREE.Mesh(ball, new THREE.MeshLambertMaterial({ color:0xE3E6E8 })); scene.add(bodies[m.name]); });
  var probes = {};
  MISSIONS.forEach(function(m, i){ var c = SCOL[i % SCOL.length];
    probes[m.id] = { dot:new THREE.Mesh(ball, new THREE.MeshBasicMaterial({ color:c })), trail:new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color:c })),
      orb:new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color:c, transparent:true, opacity:0.8 })), c:c };
    scene.add(probes[m.id].dot); root.add(probes[m.id].trail); scene.add(probes[m.id].orb); });
  var labs = document.createElement('div'); labs.className = 'so-labs3'; labs.setAttribute('aria-hidden', 'true');
  wrap.insertBefore(cv, wrap.firstChild); wrap.insertBefore(labs, cv.nextSibling);
  V3 = { renderer:r, scene:scene, cam:cam, root:root, light:light, sun:sun, bodies:bodies, probes:probes, labs:labs, trailT:null };
  events3(cv);
  return true;
}
/* sillage d'une sonde en croisière : du lancement à t (ou à l'arrivée) ; reconstruit seulement quand la date change */
function trail3(m, s, e){
  var n = Math.floor((e - s.t) / s.step), pts = [];
  for (var j = 0; j <= n; j++) pts.push(new THREE.Vector3(s.xy[2*j], hasZ(s) ? s.z[j] : 0, -s.xy[2*j+1]));
  var q = at(s, e); if (q) pts.push(new THREE.Vector3(q[0], atz(s, e), -q[1]));
  return pts;
}
function render3(){
  var cv = $('so-gl'); if (!cv || !V3) return;
  var w = Math.max(200, cv.parentNode.clientWidth), h = Math.max(200, cv.parentNode.clientHeight), t = S.t;
  if (cv.width !== Math.round(w * V3.renderer.getPixelRatio()) || cv.height !== Math.round(h * V3.renderer.getPixelRatio())){ V3.renderer.setSize(w, h); V3.cam.aspect = w / h; V3.cam.updateProjectionMatrix(); }
  var tg = S.focus ? (pos3(S.focus, t) || [S.c[0], S.c[1], 0]) : [S.c[0], S.c[1], 0], dist = S.R / TANH;
  var cam = V3.cam, ce = Math.cos(S.el); cam.position.set(dist * ce * Math.cos(S.az), dist * Math.sin(S.el), dist * ce * Math.sin(S.az)); cam.lookAt(0, 0, 0);
  cam.near = dist * 1e-4; cam.far = dist * 1e4 + 200; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  V3.root.position.copy(v3([0, 0, 0], tg));
  var px = 2 * TANH / h;   /* taille angulaire d'un pixel (par unité de distance) */
  function size(mesh, p, rKm, minPx){ mesh.position.copy(v3(p, tg)); var d = mesh.position.distanceTo(cam.position); mesh.scale.setScalar(Math.max(rKm / AU, d * px * minPx)); return mesh.position; }
  var labs = [], hits = [], html = '';
  var occ = [];   /* corps assez gros à l'écran pour cacher ce qui passe derrière eux : [centre, rayon] */
  function hidden(v){
    var o = cam.position, d = v.clone().sub(o), L = d.length(); d.divideScalar(L);
    return occ.some(function(b){ var oc = b[0].clone().sub(o), tc = oc.dot(d); if (tc <= 0 || tc >= L - b[1] * 1.001) return false; return oc.lengthSq() - tc * tc < b[1] * b[1]; });
  }
  function lab(v, txt, f, c, r, cls){
    if (hidden(v)) return;
    var q = v.clone().project(cam); if (q.z > 1 || q.z < -1) return; var x = (q.x + 1) / 2 * w, y = (1 - q.y) / 2 * h; if (x < -40 || x > w + 40 || y < -40 || y > h + 40) return;
    if (f != null) hits.push([x, y, txt, f, r || 6]);
    var lw = txt.length * 6.6 + 4; if (labs.some(function(b){ return Math.abs(b[0] - x - lw / 2) < (lw + b[2]) / 2 + 2 && Math.abs(b[1] - y) < 14; })) return;
    labs.push([x + lw / 2, y, lw]); html += '<span class="' + (cls || '') + '" style="left:' + (x + 8).toFixed(0) + 'px;top:' + (y - 18).toFixed(0) + 'px' + (c ? ';color:' + c : '') + '">' + esc(txt) + '</span>';
  }
  var sp = size(V3.sun, [0, 0, 0], RSUN, 6); V3.light.position.copy(sp); lab(sp, T('Soleil'), '', null, 8);
  var pos = {};
  D.planets.forEach(function(p){ var q = pos3(p.name, t), m = V3.bodies[p.name]; m.visible = !!q; if (!q) return; pos[p.name] = q;
    var v = size(m, q, RAD[p.name], 4.5); if (m.scale.x > cam.position.distanceTo(v) * px * 8) occ.push([v.clone(), m.scale.x]); lab(v, T(p.name), p.name, null, 8);
    moonsOf(p.name).forEach(function(mo){ var el = moonEl(mo, t), mm = V3.bodies[mo.name], far = el[1] / AU < cam.position.distanceTo(v) * px * 5;
      mm.visible = !far; if (far) return; var o = moon3(mo, t), mq = [q[0] + o[0] / AU, q[1] + o[1] / AU, q[2] + o[2] / AU];
      var mv = size(mm, mq, RAD[mo.name] || 0, 3); if (el[1] / AU > cam.position.distanceTo(v) * px * 26) lab(mv, T(mo.name), mo.name === 'Lune' ? 'Lune' : p.name, null, 5, 'so-ml'); });
  });
  (D.moons || []).forEach(function(mo){ if (!pos[HZ[mo.center]]) V3.bodies[mo.name].visible = false; });
  var rebuild = V3.trailT !== t;
  MISSIONS.forEach(function(m){
    var P = V3.probes[m.id], s = probe(m.id), st = status(m, t); P.dot.visible = P.trail.visible = P.orb.visible = false;
    if (!s || st.k === 'avant') return;
    var arr = (m.events || []).filter(function(e){ return e.type === 'arrival' || e.type === 'orbit'; })[0], tc = arr ? day(arr.date) : Infinity;
    if (S.R > 0.02){ if (rebuild) P.trail.geometry.setFromPoints(trail3(m, s, Math.min(t, tc, s.t + s.step * (s.n - 1)))); P.trail.visible = true; P.trail.material.opacity = st.k === 'fin' ? 0.35 : 1; P.trail.material.transparent = st.k === 'fin'; }
    if (st.k === 'fin') return;
    var p3 = pos3('probe:' + m.id, t); if (!p3) return;
    if (st.k === 'orbite'){
      var ob = orbitAt(m.id, t), bp = pos[st.body] || pos3(st.body, t);
      if (ob && bp){ var sm = ob.s, pts = [], nn = sm.per ? Math.min(sm.xy.length / 2, Math.ceil(sm.per) + 2) : sm.xy.length / 2;
        for (var i = 0; i < nn; i++) pts.push(v3([bp[0] + sm.xy[2*i] / AU, bp[1] + sm.xy[2*i+1] / AU, bp[2] + (sm.z ? sm.z[i] : 0) / AU], tg));
        P.orb.geometry.setFromPoints(pts); P.orb.visible = sm.rmax / AU > cam.position.distanceTo(v3(bp, tg)) * px * 9;
        var oq = P.orb.visible && onOrbit(sm, t), zz = 0;
        if (oq){ var j = Math.min(sm.z ? sm.z.length - 1 : 0, Math.round((t - sm.tt) * 1440 / sm.step_min % (sm.per || 1e9))); zz = sm.z ? sm.z[Math.max(0, j)] : 0; p3 = [bp[0] + oq[0] / AU, bp[1] + oq[1] / AU, bp[2] + zz / AU]; }
        else if (P.orb.visible) p3 = null;
      }
      if (!p3){ lab(v3(bp, tg), m.short, 'probe:' + m.id, P.c, 6, 'so-pl'); return; }
    }
    P.dot.visible = true; var pv = size(P.dot, p3, 0, 4); lab(pv, m.short, 'probe:' + m.id, P.c, 6, 'so-pl');
  });
  V3.trailT = t;
  V3.renderer.render(V3.scene, cam);
  V3.labs.innerHTML = html; S.hits = hits;
  ui();
}
function events3(cv){
  var P = {}, drag = null, tip = $('so-tip');
  function loc(e){ var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function zoom3(f){ S.R = Math.min(RMAX, Math.max(RMIN, S.R * f)); S.goal = null; follow(); kick(); }
  cv.addEventListener('wheel', function(e){ e.preventDefault(); zoom3(Math.exp(Math.max(-1, Math.min(1, e.deltaY * (e.deltaMode ? 0.05 : 0.0018))))); }, { passive:false });
  cv.addEventListener('dblclick', function(e){ zoom3(e.shiftKey ? 2.5 : 0.4); });
  cv.addEventListener('pointerdown', function(e){ try { cv.setPointerCapture(e.pointerId); } catch(x){} P[e.pointerId] = loc(e); drag = { moved:0 }; });
  cv.addEventListener('pointermove', function(e){
    var p = loc(e), ids = Object.keys(P);
    if (ids.length === 2 && P[e.pointerId]){ var o = ids.filter(function(i){ return +i !== e.pointerId; })[0], a = P[o], b0 = P[e.pointerId], d0 = Math.hypot(a[0] - b0[0], a[1] - b0[1]), d1 = Math.hypot(a[0] - p[0], a[1] - p[1]);
      P[e.pointerId] = p; if (d0 > 0 && d1 > 0) zoom3(d0 / d1); if (drag) drag.moved = 99; return; }
    if (P[e.pointerId] && drag){ var q = P[e.pointerId]; drag.moved += Math.hypot(p[0] - q[0], p[1] - q[1]); P[e.pointerId] = p;
      if (drag.moved > 4){ S.az += (p[0] - q[0]) * 0.008; S.el = Math.max(-1.45, Math.min(1.45, S.el + (p[1] - q[1]) * 0.008)); kick(); tip.hidden = true; return; } }
    var h = hitAt(p[0], p[1]); tip.hidden = !h; if (h){ tip.textContent = h[2]; tip.style.left = (p[0] + 22) + 'px'; tip.style.top = (p[1] - 6) + 'px'; }
    cv.style.cursor = h && h[3] != null ? 'pointer' : 'grab';
  });
  function up(e){ var p = loc(e); delete P[e.pointerId];
    if (drag && drag.moved <= 4 && !Object.keys(P).length){ var h = hitAt(p[0], p[1]); if (h && h[3] != null) setFocus(h[3]); }
    if (!Object.keys(P).length) drag = null; }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', function(e){ delete P[e.pointerId]; drag = null; });
  cv.addEventListener('pointerleave', function(){ tip.hidden = true; });
  /* clavier : flèches pour tourner, + et − pour zoomer */
  cv.addEventListener('keydown', function(e){
    var k = e.key, d = 0.08;
    if (k === 'ArrowLeft') S.az -= d; else if (k === 'ArrowRight') S.az += d; else if (k === 'ArrowUp') S.el = Math.min(1.45, S.el + d); else if (k === 'ArrowDown') S.el = Math.max(-1.45, S.el - d);
    else if (k === '+' || k === '=') return zoom3(1 / 1.4), e.preventDefault(); else if (k === '-') return zoom3(1.4), e.preventDefault(); else return;
    e.preventDefault(); kick(); });
}
function setMode(m){
  if (m === '3d' && !init3()){ S.mode = '2d'; $('so-3d').hidden = true; return; }
  S.mode = m; var is3 = m === '3d', b = $('so-3d');
  $('so-svg').style.display = is3 ? 'none' : ''; if (V3){ V3.renderer.domElement.style.display = is3 ? '' : 'none'; V3.labs.style.display = is3 ? '' : 'none'; }
  b.setAttribute('aria-pressed', is3); b.textContent = T(is3 ? 'Vue de dessus' : 'Vue 3D');
  note(); kick();
}

/* ---------- animation et caméra ---------- */
function step(dt){
  if (S.run){ S.t = Math.min(T1, S.t + dt * S.speed); if (S.t >= T1) S.run = false; S.dirty = true; }
  var g = S.goal;
  if (g){
    var a = reduce() ? 1 : 1 - Math.exp(-dt * 4.5), lr = Math.log(S.R), lg = Math.log(g.R);
    S.R = Math.exp(lr + (lg - lr) * a);
    if (S.focus) S.off = [S.off[0] * (1 - a), S.off[1] * (1 - a)]; else if (g.c) S.c = [S.c[0] + (g.c[0] - S.c[0]) * a, S.c[1] + (g.c[1] - S.c[1]) * a];
    var k = 2 * S.R / 600, done = Math.abs(lg - Math.log(S.R)) < 0.002 && (S.focus ? Math.hypot(S.off[0], S.off[1]) < k * 0.3 : !g.c || Math.hypot(g.c[0] - S.c[0], g.c[1] - S.c[1]) < k * 0.3);
    if (done){ S.R = g.R; if (S.focus) S.off = [0, 0]; else if (g.c) S.c = g.c.slice(); S.goal = null; }
    S.dirty = true;
  }
  if (S.focus){ var p = posOf(S.focus, S.t); if (p) S.c = [p[0] + S.off[0], p[1] + S.off[1]]; }
}
function frame(ts){
  S.raf = 0; if (!$('so-svg')) return stop();
  var dt = S.last ? Math.min(0.1, (ts - S.last) / 1000) : 0; S.last = ts;
  step(dt);
  if (S.dirty){ S.dirty = false; render(); }
  if (S.run || S.goal) S.raf = requestAnimationFrame(frame); else S.last = 0;
}
function kick(){ S.dirty = true; if (!S.raf) S.raf = requestAnimationFrame(frame); }
function stop(){ S.run = false; S.last = 0; if (S.raf) cancelAnimationFrame(S.raf); S.raf = 0; }
function play(on){ S.run = on; if (on && S.t >= T1 - 0.01) S.t = T0; S.last = 0; kick(); }
/* zoom autour d'un point de l'écran : le point visé reste sous le curseur ; trop loin, la vue cesse de suivre */
function zoomAt(px, py, f){
  if (S.mode === '3d'){ S.R = Math.min(RMAX, Math.max(RMIN, S.R * f)); S.goal = null; follow(); kick(); return; }
  var svg = $('so-svg'), w = svg.clientWidth, h = svg.clientHeight, k = 2 * S.R / Math.min(w, h);
  var wx = S.c[0] + (px - w / 2) * k, wy = S.c[1] - (py - h / 2) * k;
  S.R = Math.min(RMAX, Math.max(RMIN, S.R * f)); var k2 = 2 * S.R / Math.min(w, h);
  S.c = [wx - (px - w / 2) * k2, wy + (py - h / 2) * k2]; S.goal = null; follow(); kick();
}
function follow(){
  if (!S.focus) return;
  if (S.R > Math.max(3, reach(S.focus, S.t) * 40)){ S.focus = ''; moonsPanel(); return; }
  var p = posOf(S.focus, S.t); if (p) S.off = [S.c[0] - p[0], S.c[1] - p[1]];
}
function hitAt(x, y){ var b = null, bd = 16; S.hits.forEach(function(h){ var d = Math.hypot(h[0] - x, h[1] - y) - Math.max(0, (h[4] || 0) - 6); if (d < bd){ bd = d; b = h; } }); return b; }
function mount(){
  D = (window.DATA_FILES || {})['solar'];
  if (!D){ $('so-wrap').innerHTML = '<p class="cap">' + esc(T('Positions pas encore téléchargées (workflow « Données réelles »).')) + '</p>'; return; }
  if (!D._ready){ D.planets.concat(D.probes).forEach(function(s){ s.t = day(s.t0); }); D.moons = D.moons || []; D._ready = true; }
  T0 = Math.min.apply(null, D.probes.map(function(s){ return s.t; })); TF = day(D.fetched); T1 = Math.min.apply(null, D.planets.map(function(p){ return p.t + p.step * (p.n - 1); }));
  var inp = $('so-t'); inp.min = T0; inp.max = T1;
  if (S.t == null || S.t < T0 || S.t > T1) S.t = Math.min(T1, now());   /* par défaut : maintenant */
  side(); moonsPanel(); note();
  $('so-3d').addEventListener('click', function(){ setMode(S.mode === '3d' ? '2d' : '3d'); });
  if (S.mode === '3d') setMode('3d');
  inp.addEventListener('input', function(){ S.t = +inp.value; kick(); });
  $('so-now').addEventListener('click', function(){ S.t = Math.min(T1, now()); kick(); });
  $('so-speed').addEventListener('change', function(e){ S.speed = +e.target.value; kick(); });
  $('so-play').addEventListener('click', function(){ play(!S.run); });
  $('so-zin').addEventListener('click', function(){ var s = $('so-svg'); zoomAt(s.clientWidth / 2, s.clientHeight / 2, 1 / 1.8); });
  $('so-zout').addEventListener('click', function(){ var s = $('so-svg'); zoomAt(s.clientWidth / 2, s.clientHeight / 2, 1.8); });
  [].forEach.call(document.querySelectorAll('[data-sz]'), function(b){ b.addEventListener('click', function(){
    S.focus = ''; moonsPanel(); S.goal = { R:b.getAttribute('data-sz') === 'in' ? 1.75 : frameAll(), c:[0, 0] }; kick(); }); });
  document.querySelector('.home-side').addEventListener('click', function(e){ var b = e.target.closest('[data-sf]'); if (b) setFocus(b.getAttribute('data-sf')); });
  var svg = $('so-svg'), tip = $('so-tip'), P = {}, drag = null;
  function loc(e){ var r = svg.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  svg.addEventListener('wheel', function(e){ e.preventDefault(); var p = loc(e); zoomAt(p[0], p[1], Math.exp(Math.max(-1, Math.min(1, e.deltaY * (e.deltaMode ? 0.05 : 0.0018))))); }, { passive:false });
  svg.addEventListener('dblclick', function(e){ var p = loc(e); zoomAt(p[0], p[1], e.shiftKey ? 2.5 : 0.4); });
  svg.addEventListener('pointerdown', function(e){ try { svg.setPointerCapture(e.pointerId); } catch(x){} P[e.pointerId] = loc(e); drag = { moved:0 }; });
  svg.addEventListener('pointermove', function(e){
    var p = loc(e), ids = Object.keys(P);
    if (ids.length === 2 && P[e.pointerId]){   /* pincement : zoom autour du milieu des deux doigts */
      var o = ids.filter(function(i){ return +i !== e.pointerId; })[0], a = P[o], b0 = P[e.pointerId], d0 = Math.hypot(a[0] - b0[0], a[1] - b0[1]), d1 = Math.hypot(a[0] - p[0], a[1] - p[1]);
      P[e.pointerId] = p; if (d0 > 0 && d1 > 0) zoomAt((a[0] + p[0]) / 2, (a[1] + p[1]) / 2, d0 / d1); if (drag) drag.moved = 99; return;
    }
    if (P[e.pointerId] && drag){
      var q = P[e.pointerId], k = 2 * S.R / Math.min(svg.clientWidth, svg.clientHeight); drag.moved += Math.hypot(p[0] - q[0], p[1] - q[1]); P[e.pointerId] = p;
      if (drag.moved > 4){ S.c = [S.c[0] - (p[0] - q[0]) * k, S.c[1] + (p[1] - q[1]) * k]; S.goal = null; follow(); kick(); tip.hidden = true; return; }
    }
    var h = hitAt(p[0], p[1]); tip.hidden = !h; if (h){ tip.textContent = h[2]; tip.style.left = (p[0] + 22) + 'px'; tip.style.top = (p[1] - 6) + 'px'; }
    svg.style.cursor = h && h[3] ? 'pointer' : 'grab';
  });
  function up(e){ var p = loc(e); delete P[e.pointerId];
    if (drag && drag.moved <= 4 && !Object.keys(P).length){ var h = hitAt(p[0], p[1]); if (h && h[3]) setFocus(h[3]); }
    if (!Object.keys(P).length) drag = null; }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function(e){ delete P[e.pointerId]; drag = null; });
  svg.addEventListener('pointerleave', function(){ tip.hidden = true; });
  if (!window.__soResize){ window.__soResize = 1; window.addEventListener('resize', function(){ if ($('so-svg')) kick(); }); }
  if (S.focus) setFocus(S.focus);
  if (!S.auto){ S.auto = true; if (!reduce()) S.run = true; }   /* première visite : la lecture démarre doucement (sauf mouvement réduit) */
  kick();
}
return { html:html, mount:mount, stop:stop };
})();
