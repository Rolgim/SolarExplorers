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
  $('views').innerHTML = '<div class="views">' + VIEWS.map(function(v){
    var on = route === v[0] || (v[0] === 'missions' && mission(route));
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
function missionsPage(){
  var h = '<div class="sk"><h2>' + T('Missions') + '</h2>';
  if (!MISSIONS.length) return h + '<p class="lead">' + T('Aucune mission pour l\'instant : la liste sera choisie d\'après ce que la sonde de STAC-PLANET trouve dans le catalogue.') + '</p></div>';
  h += '<ul class="sk-list">' + MISSIONS.map(function(m){
    return '<li><a href="#' + m.id + '"><strong>' + esc(m.short || m.name) + '</strong> <span>' + esc(m.year || '') + ' · ' + esc((m.targets || []).join(', ')) + '</span></a></li>';
  }).join('') + '</ul></div>';
  return h;
}
function missionPage(m){
  var h = '<div class="sk"><h2>' + esc(m.name) + '</h2><p class="lead">' + esc(m.agency || '') + '</p>';
  (m.sections || []).forEach(function(sec){
    h += '<h3>' + esc(sec.title) + '</h3><table class="sk-table"><tbody>' + sec.rows.map(function(r){
      var ref = r[2] && m.refs && m.refs[r[2]];
      return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(OBS_NUM(r[1])) + (ref ? ' <a class="src" href="' + esc(ref.u) + '" rel="noopener" target="_blank">' + esc(ref.p) + '</a>' : '') + '</td></tr>';
    }).join('') + '</tbody></table>';
  });
  return h + '</div>';
}
var PAGES = {
  missions: missionsPage,
  accueil: function(){ return soon('Système solaire', 'Les orbites des planètes et la trajectoire réelle de chaque sonde, avec un curseur des années ; un clic sur un corps ouvre sa carte et les empreintes des observations.', 'étape 6'); },
  comparer: function(){ return soon('Comparer', 'Domaine spectral, résolution au sol, trajectoires et tableau des instruments.', 'étape 6'); },
  flotte: function(){ return soon('Flotte', 'Frise des missions par agence et par cible, et « qui a fait quoi », chaque ligne sourcée.', 'étape 6'); }
};

function route(){
  var r = (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, '') || 'accueil';
  var m = mission(r);
  if (!m && !PAGES[r]) r = 'accueil';
  renderHeader(r);
  $('page').innerHTML = m ? missionPage(m) : PAGES[r]();
  var h2 = $('page').querySelector('h2');
  document.title = (h2 ? h2.textContent + ' · ' : '') + T('Explorateurs du Système solaire');
  $('live').textContent = h2 ? h2.textContent : '';
}

document.addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('#b-lang,#b-theme,[data-go]') : null;
  if (!el) return;
  if (el.id === 'b-lang'){ var nl = OBS_LANG === 'en' ? 'fr' : 'en'; try { localStorage.setItem('sse-lang', nl); } catch(x){} location.hash = nl + '-' + (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''); location.reload(); return; }
  if (el.id === 'b-theme'){ var nt = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); try { localStorage.setItem('sse-theme', nt); } catch(x){} route(); $('b-theme').focus(); return; }
  location.hash = el.getAttribute('data-go');
});
window.addEventListener('hashchange', route);
OBS_I18N.static();
route();
window.__sse = { route:route, mission:mission };
})();
