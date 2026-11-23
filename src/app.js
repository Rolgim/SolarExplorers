/* =================================================================
   APPLICATION — en-tête, routage par ancre, pages.
   Squelette (étape 1 du dossier de lancement) : la vue 3D d'Observatories v1.0 (src/app.js là-bas)
   sera reprise avec la première mission (étape 4). Rien ici n'est propre à une mission : tout part de MISSIONS.
================================================================= */
(function(){
'use strict';
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function mission(id){ for (var i = 0; i < MISSIONS.length; i++) if (MISSIONS[i].id === id) return MISSIONS[i]; return null; }
var T = OBS_T;

function isDark(){ var a = document.documentElement.getAttribute('data-theme'); return a ? a === 'dark' : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches); }
(function(){ try { var v = localStorage.getItem('sse-theme'); if (v === 'dark' || v === 'light') document.documentElement.setAttribute('data-theme', v); } catch(e){} })();

/* vues d'ensemble : boutons fixes en haut à droite, même graisse quel que soit l'état (règle 6) */
var VIEWS = [['missions', 'Missions'], ['accueil', 'Système solaire'], ['comparer', 'Comparer'], ['flotte', 'Flotte']];
function renderHeader(route){
  /* onglets des sondes, comme les onglets d'observatoires d'Observatories : sur une page de mission, on passe d'une sonde à l'autre
     en restant sur le même type de page (vue 3D ou « Mission et données ») */
  var cur = mission(route.replace(/-donnees(-[\w-]+)?$/, '')), dat = /-donnees/.test(route);
  /* deux rangées, comme les domaines spectraux d'Observatories : les corps visés (filtrent), puis les sondes du corps choisi */
  function bodyOf(m){ return m.body ? m.body.name : m.targets[0]; }
  var bodies = []; MISSIONS.forEach(function(m){ if (bodies.indexOf(bodyOf(m)) < 0) bodies.push(bodyOf(m)); });
  if (cur && !window.SSE_BODY_LOCK) window.SSE_BODY = bodyOf(cur);
  var sb = window.SSE_BODY || (cur && bodyOf(cur));
  $('tabs').innerHTML = cur ? '<div class="drow" role="group" aria-label="' + T('Corps visé') + '">' + bodies.map(function(b){
    var n = MISSIONS.filter(function(m){ return bodyOf(m) === b; }).length;
    return '<button class="dsel' + (b === bodyOf(cur) ? ' cur' : '') + '" data-body="' + esc(b) + '" aria-pressed="' + (b === sb) + '"><span class="dl">' + esc(T(b)) + '</span><span class="ds">' + esc(T(b)) + '</span><span class="dn">' + n + '</span></button>';
  }).join('') + '</div><div class="trow" role="tablist" aria-label="' + T('Sonde') + '">' + MISSIONS.filter(function(m){ return bodyOf(m) === sb; }).map(function(m){
    return '<button class="tab" role="tab" data-go="' + m.id + (dat ? route.replace(/^\w+?(-donnees)/, '$1') : '') + '" aria-selected="' + (m.id === cur.id) + '">' + esc(m.short || m.name) + '<small>' + esc(m.year || '') + '</small></button>';
  }).join('') + '</div>' : '';
  $('views').innerHTML = '<div class="views">' + VIEWS.map(function(v){
    var on = route === v[0] || (v[0] === 'missions' && cur);
    return '<button class="vbtn" data-go="' + v[0] + '" aria-pressed="' + !!on + '">' + T(v[1]) + '</button>';
  }).join('') + '</div>';
  var ll = OBS_LANG === 'en' ? 'Lire en français' : 'Read in English';
  var h = '<button class="tab util lang" id="b-lang" title="' + ll + '" aria-label="' + ll + '" lang="' + (OBS_LANG === 'en' ? 'fr' : 'en') + '"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10" cy="10" r="7.6"/><path d="M2.4 10h15.2M10 2.4c2.2 2.1 3.3 4.6 3.3 7.6s-1.1 5.5-3.3 7.6M10 2.4C7.8 4.5 6.7 7 6.7 10s1.1 5.5 3.3 7.6"/></svg><span>' + (OBS_LANG === 'en' ? 'FR' : 'EN') + '</span></button>';
  var dk = isDark(), lab = T(dk ? 'Passer au thème clair' : 'Passer au thème sombre');
  h += '<button class="tab util theme" id="b-theme" title="' + lab + '" aria-label="' + lab + '"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">' +
       (dk ? '<circle cx="10" cy="10" r="3.6"/><path d="M10 1.8v2.2M10 16v2.2M1.8 10H4M16 10h2.2M4.2 4.2l1.6 1.6M14.2 14.2l1.6 1.6M4.2 15.8l1.6-1.6M14.2 5.8l1.6-1.6"/>'
           : '<path d="M16.6 12.1A7 7 0 0 1 7.9 3.4a7 7 0 1 0 8.7 8.7z" stroke-linejoin="round"/>') + '</svg></button>';
  $('utils').innerHTML = h;
}

/* ---------- pages ---------- */
function soon(title, what, step){
  return '<div class="sk"><h2>' + T(title) + '</h2><p class="lead">' + T(what) + '</p><p class="sk-state">' + T('En construction') + ' · ' + T(step) + '</p></div>';
}
function src(m, k){
  var r = k && m.refs && m.refs[k];
  return r ? ' <a class="src" href="' + esc(r.u) + '" rel="noopener" target="_blank" title="' + esc(r.t) + '">' + esc(r.p) + '</a>' : '';
}
function fiche(m){
  var h = '<p class="desc">' + esc(m.desc || '') + '</p>';
  (m.sections || []).forEach(function(sec){
    h += '<h3>' + esc(sec.title) + '</h3><table class="sk-table"><tbody>' + sec.rows.map(function(r){
      return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(OBS_NUM(r[1])) + src(m, r[2]) + '</td></tr>';
    }).join('') + '</tbody></table>';
  });
  return h + bodyCredit(m) + '<button class="cta" data-go="' + m.id + '-donnees">' + T('Mission et instruments') + '<small>' + T('Instruments, trajectoire réelle et données tirées des archives.') + '</small></button>';
}
function partsHtml(m, sel){
  return '<ul class="parts">' + m.parts.map(function(p){
    var on = p.key === sel;
    return '<li class="part' + (on ? ' on' : '') + '"><button data-part="' + p.key + '" aria-expanded="' + on + '">' + esc(p.name) + '</button>' +
      (on ? '<div class="part-body"><p>' + esc(p.desc) + '</p>' + (p.facts.length ? '<ul>' + p.facts.map(function(f){ return '<li>' + esc(OBS_NUM(f[0])) + src(m, f[1]) + '</li>'; }).join('') + '</ul>' : '') + '</div>' : '') + '</li>';
  }).join('') + '</ul>' + (m.file ? '<p class="note">' + T('Maquette') + ' : ' + esc(m.model.src) + ' · ' + T('Licence') + ' : ' + esc(m.model.license) + '</p>'
    : '<p class="note">' + T('Pas de maquette 3D libre de droits pour cette sonde : elle est figurée par un point bleu sur son orbite.') + '</p>') + bodyCredit(m);
}
function bodyCredit(m){
  var d = m.body && (window.DATA_FILES || {})['tex-' + m.body.tex]; if (!d) return '';
  return '<p class="note">' + T(m.body.name) + ' : ' + T(d.credit) + ' · ' + T('Licence') + ' : <a href="' + esc(d.page) + '" rel="noopener" target="_blank">' + esc(d.license) + '</a></p>';
}
var MS = { tab:'fiche', part:null, explode:0, view:'probe', run:!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) };
function missionPage(m){
  if (!m.file) MS.view = 'orbit';   /* sans maquette, la vue d'orbite montre mieux la sonde (un point) */
  return '<div class="mission"><section id="stage" class="m-stage" aria-label="' + T('Vue 3D de la sonde') + '">' +
    '<div class="m-hud"><div class="m-name">' + esc(m.name) + '</div><div class="m-sub">' + esc(m.agency) + ' · ' + esc(m.targets.join(', ')) + '</div></div>' +
    '<p class="m-msg" id="m-msg" hidden></p>' +
    (m.body ? '<p class="m-body-note" id="m-body-note" hidden>' + T(m.body.name) + ' : ' + T('orbite en schéma de principe (tailles, altitude, inclinaison et vitesse non respectées)') + (m.file ? '' : ' · ' + T('pas de maquette libre de droits : la sonde est un point bleu')) + '</p>' : '') +
    '<div class="m-tools" role="toolbar" aria-label="' + T('Affichage') + '">' +
      (m.file ? '<label class="m-ex"><span>' + T('Éclater') + '</span><input id="m-explode" type="range" min="0" max="100" value="' + Math.round(MS.explode*100) + '" aria-label="' + T('Écarter les pièces') + '"></label>' : '') +
      '<button class="m-b" id="m-reset">' + T('Recadrer') + '</button>' +
      (m.body ? '<button class="m-b" id="m-view" aria-pressed="' + (MS.view === 'orbit') + '">' + T('Vue d\'orbite') + '</button>' : '') +
      '<button class="m-b" id="m-run" aria-pressed="' + !MS.run + '">' + T('Pause') + '</button></div>' +
    '<p class="m-hint">' + T(m.file ? 'Glisser pour tourner, molette pour zoomer, cliquer une pièce pour l\'identifier' : 'Glisser pour tourner, molette pour zoomer') + '</p>' +
    '</section><aside class="m-panel"><h2 class="sr-only">' + esc(m.name) + '</h2>' +
    '<div class="ptl-row"><div class="ptl" role="tablist" aria-label="' + T('Contenu du panneau') + '">' +
      ['fiche', 'parts'].map(function(k){ return '<button class="ptab" role="tab" data-ptab="' + k + '" aria-selected="' + (MS.tab === k) + '">' + T(k === 'fiche' ? 'Fiche' : 'Pièces') + (k === 'parts' ? ' <small>' + m.parts.length + '</small>' : '') + '</button>'; }).join('') +
    '</div><a class="ptab go" href="#' + m.id + '-donnees">' + T('Mission et instruments') + '</a></div><div id="m-body">' + (MS.tab === 'fiche' ? fiche(m) : partsHtml(m, MS.part)) + '</div></aside></div>';
}
function mountMission(m){
  var msg = $('m-msg');
  if (!Viewer.available()){ msg.hidden = false; msg.textContent = T('La vue 3D demande WebGL, indisponible ici. La fiche reste lisible à droite.'); return; }
  Viewer.open($('stage'), m, {
    onPick:function(k){ MS.part = k; MS.tab = 'parts'; renderPanel(m); },
    onState:function(st, hasBody){ msg.hidden = st === 'ready'; if ($('m-body-note')) $('m-body-note').hidden = !(st === 'ready' && hasBody); msg.textContent = st === 'loading' ? T('Chargement de la maquette…') : st === 'nogl' ? T('La vue 3D demande WebGL, indisponible ici. La fiche reste lisible à droite.') : st === 'error' ? T('La maquette n\'a pas pu être chargée.') : ''; }
  });
  Viewer.select(MS.part); Viewer.explode(MS.explode);
  if ($('m-explode')) $('m-explode').addEventListener('input', function(e){ MS.explode = e.target.value / 100; Viewer.explode(MS.explode); });
  $('m-reset').addEventListener('click', function(){ Viewer.reset(m); });
  /* vue de la sonde (le sol défile dessous) ou vue d'orbite (le corps entier, sonde agrandie) ; pause : arrête l'orbite et la rotation (WCAG 2.2.2) */
  Viewer.view(MS.view); Viewer.run(MS.run);
  if ($('m-view')) $('m-view').addEventListener('click', function(e){ MS.view = MS.view === 'orbit' ? 'probe' : 'orbit'; Viewer.view(MS.view); e.currentTarget.setAttribute('aria-pressed', String(MS.view === 'orbit')); });
  $('m-run').addEventListener('click', function(e){ MS.run = !MS.run; Viewer.run(MS.run); e.currentTarget.setAttribute('aria-pressed', String(!MS.run)); });
}
function renderPanel(m){
  document.querySelectorAll('.m-panel [data-ptab]').forEach(function(b){ b.setAttribute('aria-selected', String(b.getAttribute('data-ptab') === MS.tab)); });
  $('m-body').innerHTML = MS.tab === 'fiche' ? fiche(m) : partsHtml(m, MS.part);
}

/* ---------- page « Mission et données » ---------- */
var MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
function hzDate(s){   /* « 2005-Aug-13 » (Horizons) → date lisible dans la langue du site */
  var m = /^(\d{4})-(\w{3})-(\d{2})/.exec(s); if (!m) return s;
  return new Date(Date.UTC(+m[1], MON[m[2]] - 1, +m[3])).toLocaleDateString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' });
}
var BODY_COL = { 'Terre':'#6FA8FF', 'Mars':'#E07A4F', 'Vénus':'#E8C26A', 'Mercure':'#B9B2A8', 'Jupiter':'#D9A66B', 'Saturne':'#E6D08A', 'Lune':'#C8C8C8' };
var STEP = { '1 d':['position par jour', 'position per day'], '2 d':['position tous les 2 jours', 'position every 2 days'], '1 h':['position par heure', 'position per hour'] };
function trajSvg(m){
  if (!m.horizons) return '<p class="note">' + T('JPL Horizons ne publie pas la trajectoire de cette sonde : pas de tracé réel possible.') + '</p>';
  var d = (window.DATA_FILES || {})[m.id + '-traj']; if (!d) return '<p class="note">' + T('Trajectoire pas encore téléchargée (workflow « Données réelles »).') + '</p>';
  var bodies = d.bodies || [{ name:'Terre', orbit:d.earth, marks:[] }, { name:d.target.name, orbit:d.target.orbit, marks:[] }];
  var pr = d.probe, a = pr[0], b = pr[pr.length - 1], R = 0;
  pr.concat.apply(pr, bodies.map(function(o){ return o.orbit; })).forEach(function(p){ R = Math.max(R, Math.hypot(p[1], p[2])); });
  var W = 520, c = W/2, S = (W/2 - 26) / R;   /* échelle : l'orbite la plus grande touche presque le bord */
  var X = function(p){ return (c + p[1]*S).toFixed(1); }, Y = function(p){ return (c - p[2]*S).toFixed(1); };
  function path(arr){ return arr.map(function(p, i){ return (i ? 'L' : 'M') + X(p) + ' ' + Y(p); }).join(''); }
  var role = { depart:'au départ', survol:'survol', arrivee:'à l\'arrivée' }, svg = '', lab = '';
  bodies.forEach(function(o, i){
    var col = BODY_COL[o.name] || '#9FB3C8';
    svg += '<path d="' + path(o.orbit) + '" class="orb-b" style="stroke:' + col + '"/>';
    (o.marks || []).forEach(function(k, j){
      svg += '<circle cx="' + X([0, k[2], k[3]]) + '" cy="' + Y([0, k[2], k[3]]) + '" r="' + (k[1] === 'survol' ? 3 : 4.5) + '" style="fill:' + col + '"/>';
      if (j === 0 || k[1] !== 'survol') lab += '<text x="' + (+X([0, k[2], k[3]]) + 7).toFixed(0) + '" y="' + (+Y([0, k[2], k[3]]) + 4 + 12 * j).toFixed(0) + '">' + T(o.name) + (k[1] === 'survol' ? ' (' + T('survol') + ')' : ' ' + T(role[k[1]])) + '</text>';
    });
  });
  var center = d.center === 'Terre' ? '<circle cx="' + c + '" cy="' + c + '" r="5" class="pt-e"/>' : '<circle cx="' + c + '" cy="' + c + '" r="6" class="sun"/>';
  var step = STEP[d.step || '1 d'] || [d.step, d.step];
  return '<figure class="traj"><svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' + T(d.center === 'Terre' ? 'Trajectoire vers la Lune autour de la Terre, vue du pôle nord de l\'écliptique' : 'Trajectoire de croisière vue du pôle nord de l\'écliptique') + '">' +
    center + svg + '<path d="' + path(pr) + '" class="orb-p"/>' + lab + '</svg><figcaption>' +
    T('Croisière du') + ' ' + esc(hzDate(a[0])) + ' ' + T('au') + ' ' + esc(hzDate(b[0])) + ' (' + pr.length + ' ' + T('positions') + ', ' + T('une') + ' ' + (OBS_LANG === 'en' ? step[1] : step[0]).replace(/^position /, '') + '), ' +
    T(d.center === 'Terre' ? 'centrée sur la Terre' : 'centrée sur le Soleil') + '. ' +
    T('Source') + (OBS_LANG === 'en' ? ': ' : ' : ') + esc(T(d.source)) + ', ' + T('objet') + ' ' + esc(d.horizons) + ', ' + T('téléchargé le') + ' ' + esc(d.fetched) + '.</figcaption></figure>';
}
/* date de l'aperçu : la date STAC d'une mosaïque assemblée après la mission n'est pas celle de la prise de vue */
function when(m, d){
  var day = String(d.datetime).slice(0, 10), end = (m.events || []).filter(function(e){ return e.type === 'end'; })[0];
  return end && day > end.date ? T('Date du produit dans le catalogue') + ' : ' + esc(day) + ' (' + T('après la fin de la mission : ce n\'est pas la date de prise de vue') + '). '
    : T('Prise le') + ' ' + esc(day) + '. ';
}
function realData(m){
  var key = m.real && m.real.key, d = key && (window.DATA_FILES || {})[key];
  if (!d) return '<p class="note">' + T(m.real && m.real.none || 'Aucune donnée réelle téléchargée pour l\'instant.') + '</p>';
  var out = d.out_size || [d.out_px, d.out_px], en = OBS_LANG === 'en';
  var how = d.crop ? (en ? 'Middle part (' + d.crop[0] + ' × ' + d.crop[1] + ' pixels) of the ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixel strip published by the archive' + (out[0] !== d.crop[0] ? ', scaled to ' + out[0] + ' × ' + out[1] : '')
                            : 'Partie centrale (' + d.crop[0] + ' × ' + d.crop[1] + ' pixels) de la bande de ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixels publiée par l\'archive' + (out[0] !== d.crop[0] ? ', ramenée à ' + out[0] + ' × ' + out[1] : ''))
          : d.crop_px ? (en ? 'Central square of the ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixel strip (' + d.crop_px + ' pixels wide), scaled to ' + out[0] + ' × ' + out[1]
                            : 'Carré central de la bande de ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixels (' + d.crop_px + ' pixels de côté), ramené à ' + out[0] + ' × ' + out[1])
                      : (en ? 'Whole preview published by the archive (' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixels)' + (out[0] !== d.full_size[0] ? ', scaled to ' + out[0] + ' × ' + out[1] : '')
                            : 'Aperçu entier publié par l\'archive (' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixels)' + (out[0] !== d.full_size[0] ? ', ramené à ' + out[0] + ' × ' + out[1] : ''));
  return '<figure class="real"><img src="data/' + key + '.jpg" width="' + out[0] + '" height="' + out[1] + '" alt="' + T(m.real.alt) + ' (' + esc(d.product) + ')">' +
    '<figcaption><strong>' + esc(d.instrument) + ' · ' + esc(d.product) + '</strong><br>' + when(m, d) + how +
    (d.stretch ? (en ? ', contrast stretched between the ' + d.stretch[0] + ' and ' + d.stretch[1] + ' percentiles' : ', contraste étiré entre les centiles ' + OBS_NUM(String(d.stretch[0]).replace('.', ',')) + ' et ' + OBS_NUM(String(d.stretch[1]).replace('.', ','))) : '') + '.<br>' +
    T('Archive') + ' : ' + T(d.archive) + ' · ' + T('collection') + ' <code>' + esc(d.collection) + '</code> · <a href="' + esc(d.href) + '" rel="noopener" target="_blank">' + T('aperçu d\'origine') + '</a> · ' + T('téléchargé le') + ' ' + esc(d.fetched) + '</figcaption></figure>';
}
var PAGES = {
  accueil: function(){ return SolarPage.html(); },
};

function currentRoute(){ var r = (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''); return r; }
function route(){
  var r = (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, '') || 'accueil';
  if (r === 'missions'){ r = window.SSE_LAST || MISSIONS[0].id; history.replaceState(null, '', '#' + ((location.hash.match(/^#((?:en|fr)-)/) || [])[1] || '') + r); }   /* « Missions » ouvre la vue 3D de la dernière sonde vue */
  var dm = /^(\w+)-donnees(?:-([\w-]+))?$/.exec(r), m = mission(dm ? dm[1] : r);
  if (m) window.SSE_LAST = m.id;
  var xp = !m && Views.page(r);   /* Flotte, Comparer et leurs sous-pages */
  if (!m && !xp && !PAGES[r]) r = 'accueil';
  renderHeader(m ? m.id + (dm ? '-donnees' + (dm[2] && /^(mission|orbite)$/.test(dm[2]) ? '-' + dm[2] : '') : '') : Views.base(r));
  $('page').innerHTML = m ? (dm ? MissionPage.html(m, dm[2] || '', { traj:trajSvg, real:realData }) : missionPage(m)) : xp || PAGES[r]();
  $('page').classList.toggle('is-mission', !!(m && !dm));
  $('page').classList.toggle('is-xp', !!(xp || dm));
  $('page').classList.toggle('is-solar', !m && !xp && r === 'accueil');
  if (m && !dm) mountMission(m);
  if (!m && r === 'accueil') SolarPage.mount(); else SolarPage.stop();
  var h2 = $('page').querySelector('h2');
  document.title = (h2 ? h2.textContent + ' · ' : '') + T('Explorateurs du Système solaire');
  $('live').textContent = h2 ? h2.textContent : '';
}

document.addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('#b-lang,#b-theme,[data-go],[data-ptab],[data-part],[data-body]') : null;
  if (!el) return;
  var cm = mission((location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''));
  if (el.hasAttribute('data-ptab') && cm){ MS.tab = el.getAttribute('data-ptab'); renderPanel(cm); return; }
  if (el.hasAttribute('data-part') && cm){ var k = el.getAttribute('data-part'); MS.part = MS.part === k ? null : k; Viewer.select(MS.part); renderPanel(cm); var b = document.querySelector('[data-part="' + k + '"]'); if (b) b.focus(); return; }
  if (el.hasAttribute('data-body')){ window.SSE_BODY = el.getAttribute('data-body'); window.SSE_BODY_LOCK = true; renderHeader(currentRoute()); window.SSE_BODY_LOCK = false;
    var f = document.querySelector('#tabs .trow .tab'); if (f) f.focus(); return; }
  if (el.id === 'b-lang'){ var nl = OBS_LANG === 'en' ? 'fr' : 'en'; try { localStorage.setItem('sse-lang', nl); } catch(x){} location.hash = nl + '-' + (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''); location.reload(); return; }
  if (el.id === 'b-theme'){ var nt = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); try { localStorage.setItem('sse-theme', nt); } catch(x){} route(); $('b-theme').focus(); return; }
  location.hash = el.getAttribute('data-go');
});
/* onglets des sondes : flèches gauche/droite, début, fin (motif « tablist ») */
document.addEventListener('keydown', function(e){
  var t = e.target.closest && e.target.closest('#tabs [role="tab"]'); if (!t) return;
  var all = [].slice.call(document.querySelectorAll('#tabs [role="tab"]')), i = all.indexOf(t), n = all.length, j = -1;
  if (e.key === 'ArrowRight') j = (i + 1) % n; else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n; else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
  if (j < 0) return; e.preventDefault(); location.hash = all[j].getAttribute('data-go');
  setTimeout(function(){ var a = document.querySelector('#tabs [aria-selected="true"]'); if (a) a.focus(); }, 0);
});
window.addEventListener('hashchange', route);
OBS_I18N.static();
route();
window.__sse = { route:route, mission:mission };
})();
