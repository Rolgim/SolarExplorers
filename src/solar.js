/* =================================================================
   ACCUEIL « SYSTÈME SOLAIRE » — vue de dessus du plan de l'écliptique : orbites des planètes et trajectoires réelles des sondes
   (JPL Horizons, data/solar.json, recette « solar » de tools/data/fetch_orbits.py), avec un curseur des dates.
   Distances à l'échelle ; tailles des points non à l'échelle (signalé). SolarPage.html() rend la page, SolarPage.mount() la branche.
================================================================= */
var SolarPage = (function(){
'use strict';
var MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
var PCOL = { 'Mercure':'#B9B2A8', 'Vénus':'#E8C26A', 'Terre':'#6FA8FF', 'Mars':'#E07A4F', 'Jupiter':'#D9A66B', 'Saturne':'#E6D08A' };
var SCOL = ['#FF6B9A', '#4DD0E1', '#B39DDB', '#FFB74D', '#81C784'];   /* une couleur par sonde, dans l'ordre du registre (aucune agence mise en avant) */
var DAY = 864e5, S = { t:null, zoom:'in', run:false, raf:0 }, D = null;
function T(s){ return OBS_T(s); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function day(s){   /* « 2005-Aug-13 » (Horizons) ou « 2005-08-13 » / « 2006-11 » → jours depuis 1970 */
  var m = /^(\d{4})-(\w{3})-(\d{2})/.exec(s); if (m) return Date.UTC(+m[1], MON[m[2]] - 1, +m[3]) / DAY;
  m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) / DAY;
}
function fmt(t){ return new Date(t * DAY).toLocaleDateString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }); }
/* position interpolée d'une série { t0, step, n, xy } au jour t ; null hors de la série */
function at(s, t){
  var f = (t - s.t) / s.step; if (f < 0 || f > s.n) return null; f = Math.min(f, s.n - 1);   /* un pas de tolérance au bout de la série */
  var i = Math.min(s.n - 2, Math.floor(f)), u = f - i, a = s.xy;
  return [a[2*i] + (a[2*i+2] - a[2*i]) * u, a[2*i+1] + (a[2*i+3] - a[2*i+1]) * u];
}
/* une orbite complète : les points depuis le début jusqu'à ce que l'angle ait fait un tour */
function loop(s){
  var a = s.xy, acc = 0, prev = Math.atan2(a[1], a[0]), pts = [a[0], a[1]];
  for (var i = 1; i < s.n; i++){ var th = Math.atan2(a[2*i+1], a[2*i]), d = th - prev; if (d > Math.PI) d -= 2*Math.PI; if (d < -Math.PI) d += 2*Math.PI; acc += Math.abs(d); prev = th; pts.push(a[2*i], a[2*i+1]); if (acc >= 2*Math.PI) break; }
  return pts;
}
function P(x, y){ return x.toFixed(3) + ' ' + (-y).toFixed(3); }
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
function html(){
  return '<div class="sk wide solar"><h2>' + T('Système solaire') + '</h2>' +
    '<p class="lead">' + T('Les orbites des planètes et la trajectoire réelle de chaque sonde, vues de dessus. Faites glisser le curseur pour remonter le temps.') + '</p>' +
    '<div class="so-tools"><button class="m-b so-play" id="so-play" aria-pressed="false">' + T('Lecture') + '</button>' +
    '<label class="so-date"><span id="so-day" aria-live="off"></span><input id="so-t" type="range" step="1" aria-label="' + T('Date') + '"></label>' +
    '<div class="so-zoom" role="group" aria-label="' + T('Cadrage') + '"><button class="m-b" data-sz="in" aria-pressed="true">' + T('Jusqu\'à Mars') + '</button><button class="m-b" data-sz="out" aria-pressed="false">' + T('Jusqu\'à Saturne') + '</button></div></div>' +
    '<div class="so-wrap"><svg id="so-svg" role="group" aria-labelledby="so-cap"><g id="so-orb"></g><g id="so-trail"></g><g id="so-pts"></g></svg></div>' +
    '<p class="sr-only" id="so-cap"></p>' +
    '<h3>' + T('Les sondes à cette date') + '</h3><ul class="so-list" id="so-list"></ul>' +
    '<p class="note" id="so-note"></p></div>';
}
function render(){
  if (!D) return;
  var t = S.t, R = S.zoom === 'in' ? 1.75 : 10.4, svg = document.getElementById('so-svg'); if (!svg) return stop();
  var k = 2 * R / Math.max(280, svg.clientWidth || 600);   /* k : taille d'un pixel d'écran en UA (points et textes de taille fixe à l'écran) */
  svg.setAttribute('viewBox', [-R, -R, 2*R, 2*R].join(' '));
  document.getElementById('so-day').textContent = fmt(t);
  var pts = '<circle cx="0" cy="0" r="' + (7*k).toFixed(4) + '" class="so-sun"/>', cap = [];
  D.planets.forEach(function(p){
    var q = at(p, t); if (!q) return;
    pts += '<circle cx="' + q[0].toFixed(3) + '" cy="' + (-q[1]).toFixed(3) + '" r="' + (4.5*k).toFixed(4) + '" style="fill:' + PCOL[p.name] + '"/>';
    if (Math.hypot(q[0], q[1]) < R && !(S.zoom === 'out' && (p.name === 'Mercure' || p.name === 'Vénus'))) pts += '<text x="' + (q[0] + 7*k).toFixed(3) + '" y="' + (-q[1] - 6*k).toFixed(3) + '" style="font-size:' + (12*k).toFixed(4) + 'px">' + esc(T(p.name)) + '</text>';
  });
  var trail = '', list = '', rings = {};
  MISSIONS.forEach(function(m, i){
    var s = D.probes.filter(function(x){ return x.id === m.id; })[0], st = status(m, t), col = SCOL[i % SCOL.length];
    list += '<li><span class="sw" style="background:' + col + '"></span><a href="#' + m.id + '"><strong>' + esc(m.short) + '</strong></a> · ' + statusText(st) + '</li>';
    cap.push(m.short + ' : ' + statusText(st));
    if (!s || st.k === 'avant') return;
    /* trace : la croisière seulement (du lancement à l'arrivée) ; ensuite la sonde suit sa planète, dont l'orbite est déjà tracée */
    var arr = (m.events || []).filter(function(e){ return e.type === 'arrival' || e.type === 'orbit'; })[0], tc = arr ? day(arr.date) : Infinity;
    var end = Math.min(t, tc, s.t + s.step * (s.n - 1)), n = Math.floor((end - s.t) / s.step), d = '';
    for (var j = 0; j <= n; j++) d += (j ? 'L' : 'M') + P(s.xy[2*j], s.xy[2*j+1]);
    var q = at(s, end); if (q) d += 'L' + P(q[0], q[1]);
    trail += '<path d="' + d + '" style="stroke:' + col + '" class="so-tr' + (st.k === 'fin' ? ' done' : '') + '"/>';
    if (st.k === 'fin') return;
    if (st.k === 'orbite'){   /* en orbite : un anneau de sa couleur autour de la planète (la Lune : autour de la Terre) */
      var b = st.body === 'Lune' ? 'Terre' : st.body; (rings[b] = rings[b] || []).push([m, col]); return;
    }
    q = at(s, t); if (!q) return;
    trail += '<a href="#' + m.id + '"><circle cx="' + q[0].toFixed(3) + '" cy="' + (-q[1]).toFixed(3) + '" r="' + (5*k).toFixed(4) + '" style="fill:' + col + '" class="so-p"/>' +
      '<text x="' + (q[0] + 8*k).toFixed(3) + '" y="' + (-q[1] + 14*k).toFixed(3) + '" style="font-size:' + (12*k).toFixed(4) + 'px;fill:' + col + '" class="so-pl">' + esc(m.short) + '</text></a>';
  });
  D.planets.forEach(function(p){
    var q = at(p, t); if (!q || !rings[p.name]) return;
    rings[p.name].forEach(function(r, j){ trail += '<a href="#' + r[0].id + '" aria-label="' + esc(r[0].short) + '"><circle cx="' + q[0].toFixed(3) + '" cy="' + (-q[1]).toFixed(3) + '" r="' + ((8 + 3.5*j)*k).toFixed(4) + '" style="stroke:' + r[1] + '" class="so-ring"/></a>'; });
  });
  document.getElementById('so-pts').innerHTML = pts; document.getElementById('so-trail').innerHTML = trail;
  document.getElementById('so-list').innerHTML = list;
  document.getElementById('so-cap').textContent = T('Vue de dessus du Système solaire au') + ' ' + fmt(t) + '. ' + cap.join(' ; ') + '.';
}
function orbits(){
  document.getElementById('so-orb').innerHTML = D.planets.map(function(p){
    var a = loop(p), d = ''; for (var i = 0; i < a.length; i += 2) d += (i ? 'L' : 'M') + P(a[i], a[i+1]);
    return '<path d="' + d + 'Z" class="so-o" style="stroke:' + PCOL[p.name] + '"/>';
  }).join('');
}
function frame(){
  if (!S.run) return;
  var inp = document.getElementById('so-t'); if (!inp) return stop();
  S.t = Math.min(+inp.max, S.t + 6); inp.value = S.t; render();
  if (S.t >= +inp.max) return stop();
  S.raf = requestAnimationFrame(frame);
}
function stop(){ S.run = false; cancelAnimationFrame(S.raf); var b = document.getElementById('so-play'); if (b){ b.setAttribute('aria-pressed', 'false'); b.textContent = T('Lecture'); } }
function mount(){
  D = (window.DATA_FILES || {})['solar'];
  if (!D){ document.querySelector('.so-wrap').innerHTML = '<p class="note">' + T('Positions pas encore téléchargées (workflow « Données réelles »).') + '</p>'; return; }
  D.planets.concat(D.probes).forEach(function(s){ s.t = day(s.t0); });
  var t0 = Math.min.apply(null, D.probes.map(function(s){ return s.t; })), t1 = day(D.fetched) - 1, inp = document.getElementById('so-t');
  inp.min = t0; inp.max = t1; if (S.t == null || S.t < t0 || S.t > t1) S.t = t1; inp.value = S.t;
  inp.setAttribute('aria-valuetext', fmt(S.t));
  inp.addEventListener('input', function(){ S.t = +inp.value; inp.setAttribute('aria-valuetext', fmt(S.t)); render(); });
  document.getElementById('so-play').addEventListener('click', function(e){
    if (S.run) return stop();
    if (S.t >= t1) S.t = t0;
    S.run = true; e.currentTarget.setAttribute('aria-pressed', 'true'); e.currentTarget.textContent = T('Pause'); frame();
  });
  document.querySelector('.so-zoom').addEventListener('click', function(e){ var z = e.target.getAttribute('data-sz'); if (!z) return; S.zoom = z;
    document.querySelectorAll('[data-sz]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-sz') === z)); }); orbits(); render(); });
  document.querySelectorAll('[data-sz]').forEach(function(b){ b.setAttribute('aria-pressed', String(b.getAttribute('data-sz') === S.zoom)); });
  var miss = D.probes.filter(function(s){ return !s.full; }).map(function(s){ return s.id; });
  document.getElementById('so-note').textContent = T('Positions : JPL Horizons, vecteurs héliocentriques projetés sur le plan de l\'écliptique J2000, téléchargés le') + ' ' + fmt(day(D.fetched)) + '. ' +
    T('Distances à l\'échelle ; tailles du Soleil, des planètes et des sondes non à l\'échelle.') + ' ' + T('Une sonde en orbite autour d\'une planète se confond avec elle à cette échelle : elle est marquée par un anneau de sa couleur, et seule sa croisière est tracée.') +
    (miss.length ? ' ' + T('Horizons ne couvre que la croisière pour :') + ' ' + miss.map(function(id){ var m = MISSIONS.filter(function(x){ return x.id === id; })[0]; return m ? m.short : id; }).join(', ') + '.' : '');
  if (!window.__soResize){ window.__soResize = 1; window.addEventListener('resize', function(){ if (document.getElementById('so-svg')) render(); }); }
  orbits(); render();
}
return { html:html, mount:mount, stop:stop };
})();
