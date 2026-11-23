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
  return h + '<button class="cta" data-go="' + m.id + '-donnees">' + T('Mission et données') + '<small>' + T('Instruments, trajectoire réelle et données tirées des archives.') + '</small></button>';
}
function partsHtml(m, sel){
  return '<ul class="parts">' + m.parts.map(function(p){
    var on = p.key === sel;
    return '<li class="part' + (on ? ' on' : '') + '"><button data-part="' + p.key + '" aria-expanded="' + on + '">' + esc(p.name) + '</button>' +
      (on ? '<div class="part-body"><p>' + esc(p.desc) + '</p>' + (p.facts.length ? '<ul>' + p.facts.map(function(f){ return '<li>' + esc(OBS_NUM(f[0])) + src(m, f[1]) + '</li>'; }).join('') + '</ul>' : '') + '</div>' : '') + '</li>';
  }).join('') + '</ul><p class="note">' + T('Maquette') + ' : ' + esc(m.model.src) + ' · ' + T('Licence') + ' : ' + esc(m.model.license) + '</p>';
}
var MS = { tab:'fiche', part:null, explode:0 };
function missionPage(m){
  return '<div class="mission"><section id="stage" class="m-stage" aria-label="' + T('Vue 3D de la sonde') + '">' +
    '<div class="m-hud"><div class="m-name">' + esc(m.name) + '</div><div class="m-sub">' + esc(m.agency) + ' · ' + esc(m.targets.join(', ')) + '</div></div>' +
    '<p class="m-msg" id="m-msg" hidden></p>' +
    '<div class="m-tools" role="toolbar" aria-label="' + T('Affichage') + '">' +
      '<label class="m-ex"><span>' + T('Éclater') + '</span><input id="m-explode" type="range" min="0" max="100" value="' + Math.round(MS.explode*100) + '" aria-label="' + T('Écarter les pièces') + '"></label>' +
      '<button class="m-b" id="m-reset">' + T('Recadrer') + '</button></div>' +
    '<p class="m-hint">' + T('Glisser pour tourner, molette pour zoomer, cliquer une pièce pour l\'identifier') + '</p>' +
    '</section><aside class="m-panel"><h2 class="sr-only">' + esc(m.name) + '</h2>' +
    '<div class="ptl" role="tablist" aria-label="' + T('Contenu du panneau') + '">' +
      ['fiche', 'parts'].map(function(k){ return '<button class="ptab" role="tab" data-ptab="' + k + '" aria-selected="' + (MS.tab === k) + '">' + T(k === 'fiche' ? 'Fiche' : 'Pièces') + '</button>'; }).join('') +
    '</div><div id="m-body">' + (MS.tab === 'fiche' ? fiche(m) : partsHtml(m, MS.part)) + '</div></aside></div>';
}
function mountMission(m){
  var msg = $('m-msg');
  if (!m.file || !Viewer.available()){ msg.hidden = false; msg.textContent = T('La vue 3D demande WebGL, indisponible ici. La fiche reste lisible à droite.'); return; }
  Viewer.open($('stage'), m, {
    onPick:function(k){ MS.part = k; MS.tab = 'parts'; renderPanel(m); },
    onState:function(st){ msg.hidden = st === 'ready'; msg.textContent = st === 'loading' ? T('Chargement de la maquette…') : st === 'nogl' ? T('La vue 3D demande WebGL, indisponible ici. La fiche reste lisible à droite.') : st === 'error' ? T('La maquette n\'a pas pu être chargée.') : ''; }
  });
  Viewer.select(MS.part); Viewer.explode(MS.explode);
  $('m-explode').addEventListener('input', function(e){ MS.explode = e.target.value / 100; Viewer.explode(MS.explode); });
  $('m-reset').addEventListener('click', function(){ Viewer.reset(m); });
}
function renderPanel(m){
  document.querySelectorAll('.m-panel .ptab').forEach(function(b){ b.setAttribute('aria-selected', String(b.getAttribute('data-ptab') === MS.tab)); });
  $('m-body').innerHTML = MS.tab === 'fiche' ? fiche(m) : partsHtml(m, MS.part);
}

/* ---------- page « Mission et données » ---------- */
var MON = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
function hzDate(s){   /* « 2005-Aug-13 » (Horizons) → date lisible dans la langue du site */
  var m = /^(\d{4})-(\w{3})-(\d{2})/.exec(s); if (!m) return s;
  return new Date(Date.UTC(+m[1], MON[m[2]] - 1, +m[3])).toLocaleDateString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' });
}
function trajSvg(m){
  var d = (window.DATA_FILES || {})[m.id + '-traj']; if (!d) return '<p class="note">' + T('Trajectoire pas encore téléchargée (workflow « Données réelles »).') + '</p>';
  var W = 520, c = W/2, S = W/2/1.75;   /* échelle : 1,75 UA au bord */
  function path(a){ return a.map(function(p, i){ return (i ? 'L' : 'M') + (c + p[1]*S).toFixed(1) + ' ' + (c - p[2]*S).toFixed(1); }).join(''); }
  var pr = d.probe, a = pr[0], b = pr[pr.length - 1];
  var dot = function(p, r, cl){ return '<circle cx="' + (c + p[1]*S).toFixed(1) + '" cy="' + (c - p[2]*S).toFixed(1) + '" r="' + r + '" class="' + cl + '"/>'; };
  var near = function(arr, date){ for (var i = 0; i < arr.length; i++) if (arr[i][0] >= date) return arr[i]; return arr[arr.length - 1]; };
  var ea = near(d.earth, a[0]), mb = near(d.target.orbit, b[0]);
  return '<figure class="traj"><svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' + T('Trajectoire de croisière vue du pôle nord de l\'écliptique') + '">' +
    '<circle cx="' + c + '" cy="' + c + '" r="6" class="sun"/>' +
    '<path d="' + path(d.earth) + '" class="orb-e"/><path d="' + path(d.target.orbit) + '" class="orb-t"/><path d="' + path(pr) + '" class="orb-p"/>' +
    dot(ea, 4, 'pt-e') + dot(mb, 4, 'pt-t') +
    '<text x="' + (c + ea[1]*S + 8).toFixed(0) + '" y="' + (c - ea[2]*S + 14).toFixed(0) + '">' + T('Terre au départ') + '</text>' +
    '<text x="' + (c + mb[1]*S + 8).toFixed(0) + '" y="' + (c - mb[2]*S).toFixed(0) + '">' + T(d.target.name) + ' ' + T('à l\'arrivée') + '</text>' +
    '</svg><figcaption>' + T('Croisière du') + ' ' + esc(hzDate(a[0])) + ' ' + T('au') + ' ' + esc(hzDate(b[0])) + ' (' + pr.length + ' ' + T('positions quotidiennes') + '). ' +
    T('Source') + ' : ' + esc(d.source) + ', ' + T('objet') + ' ' + esc(d.horizons) + ', ' + T('téléchargé le') + ' ' + esc(d.fetched) + '.</figcaption></figure>';
}
function realData(m){
  var d = (window.DATA_FILES || {})[m.id + '-ctx']; if (!d) return '<p class="note">' + T('Aucune donnée réelle téléchargée pour l\'instant.') + '</p>';
  return '<figure class="real"><img src="data/' + m.id + '-ctx.jpg" width="900" height="900" alt="' + T('Extrait d\'une image CTX de la surface de Mars') + ' (' + esc(d.product) + ')">' +
    '<figcaption><strong>' + esc(d.instrument) + ' · ' + esc(d.product) + '</strong><br>' + T('Prise le') + ' ' + esc(String(d.datetime).slice(0, 10)) + '. ' +
    (OBS_LANG === 'en' ? 'Central square of the ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixel strip (' + d.crop_px + ' pixels wide), scaled to ' + d.out_px + ' × ' + d.out_px
                       : 'Carré central de la bande de ' + d.full_size[0] + ' × ' + d.full_size[1] + ' pixels (' + d.crop_px + ' pixels de côté), ramené à ' + d.out_px + ' × ' + d.out_px) +
    (d.stretch ? (OBS_LANG === 'en' ? ', contrast stretched between the ' + d.stretch[0] + ' and ' + d.stretch[1] + ' percentiles' : ', contraste étiré entre les centiles ' + OBS_NUM(String(d.stretch[0]).replace('.', ',')) + ' et ' + OBS_NUM(String(d.stretch[1]).replace('.', ','))) : '') + '.<br>' +
    T('Archive') + ' : ' + T(d.archive) + ' · ' + T('collection') + ' <code>' + esc(d.collection) + '</code> · <a href="' + esc(d.href) + '" rel="noopener" target="_blank">' + T('aperçu d\'origine') + '</a> · ' + T('téléchargé le') + ' ' + esc(d.fetched) + '</figcaption></figure>';
}
function dataPage(m){
  var inst = (m.sections || [])[3];   /* section « Instruments » de la fiche */
  var h = '<div class="sk wide"><p class="crumb"><a href="#' + m.id + '">' + esc(m.short) + '</a></p><h2>' + T('Mission et données') + '</h2>';
  h += '<h3>' + T('Trajectoire réelle') + '</h3>' + trajSvg(m);
  h += '<h3>' + T('Une donnée réelle') + '</h3>' + realData(m);
  if (inst) h += '<h3>' + esc(inst.title) + '</h3><table class="sk-table"><tbody>' + inst.rows.map(function(r){ return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(OBS_NUM(r[1])) + src(m, r[2]) + '</td></tr>'; }).join('') + '</tbody></table>';
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
  var dm = /^(\w+)-donnees$/.exec(r), m = mission(dm ? dm[1] : r);
  if (!m && !PAGES[r]) r = 'accueil';
  renderHeader(m ? m.id : r);
  $('page').innerHTML = m ? (dm ? dataPage(m) : missionPage(m)) : PAGES[r]();
  $('page').classList.toggle('is-mission', !!(m && !dm));
  if (m && !dm) mountMission(m);
  var h2 = $('page').querySelector('h2');
  document.title = (h2 ? h2.textContent + ' · ' : '') + T('Explorateurs du Système solaire');
  $('live').textContent = h2 ? h2.textContent : '';
}

document.addEventListener('click', function(e){
  var el = e.target.closest ? e.target.closest('#b-lang,#b-theme,[data-go],[data-ptab],[data-part]') : null;
  if (!el) return;
  var cm = mission((location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''));
  if (el.hasAttribute('data-ptab') && cm){ MS.tab = el.getAttribute('data-ptab'); renderPanel(cm); return; }
  if (el.hasAttribute('data-part') && cm){ var k = el.getAttribute('data-part'); MS.part = MS.part === k ? null : k; Viewer.select(MS.part); renderPanel(cm); var b = document.querySelector('[data-part="' + k + '"]'); if (b) b.focus(); return; }
  if (el.id === 'b-lang'){ var nl = OBS_LANG === 'en' ? 'fr' : 'en'; try { localStorage.setItem('sse-lang', nl); } catch(x){} location.hash = nl + '-' + (location.hash || '').replace(/^#/, '').replace(/^(en|fr)-/, ''); location.reload(); return; }
  if (el.id === 'b-theme'){ var nt = isDark() ? 'light' : 'dark'; document.documentElement.setAttribute('data-theme', nt); try { localStorage.setItem('sse-theme', nt); } catch(x){} route(); $('b-theme').focus(); return; }
  location.hash = el.getAttribute('data-go');
});
window.addEventListener('hashchange', route);
OBS_I18N.static();
route();
window.__sse = { route:route, mission:mission };
})();
