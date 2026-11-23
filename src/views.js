/* =================================================================
   VUES D'ENSEMBLE « FLOTTE » ET « COMPARER », sur le modèle des pages du même nom d'Observatories (src/fleet.js, inst-render.js) :
   sous-pages dans une colonne à gauche (.inst-nav), en-tête (.inst-head), filtres en pastilles (.chip), frise et tableaux (.ctable).
   Tout vient du registre (src/data-missions.js) : chaque date, chaque valeur garde la source de la fiche (règle 1).
   Aucune agence n'a de couleur ni de badge (règle 5) : les couleurs sont celles des sondes, dans l'ordre du registre.
   Views.page(route) rend #flotte, #flotte-qui, #comparer, #comparer-<sous-page> ; null pour une autre route.
================================================================= */
var Views = (function(){
'use strict';
var DAY = 864e5, COL = ['#D63C6E', '#0E8FA3', '#7B5CC4', '#C77700', '#3F8F46'];   /* une couleur par sonde, ordre du registre (même ordre que l'accueil) */
var FS = { ag:null, st:null, body:null }, CS = { body:null, st:null }, cur = null;
function T(s){ return OBS_T(s); }
function en(){ return OBS_LANG === 'en'; }
function colon(){ return en() ? ': ' : ' : '; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function day(s){ var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) / DAY; }
function fmt(s){ var o = { month:'long', year:'numeric', timeZone:'UTC' }; if (s.length > 7) o.day = 'numeric';
  return new Date(day(s) * DAY).toLocaleDateString(en() ? 'en-GB' : 'fr-FR', o); }
function today(){ var d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / DAY; }
function src(m, k){ var r = k && m.refs && m.refs[k]; return r ? ' <a class="src" href="' + esc(r.u) + '" rel="noopener" target="_blank" title="' + esc(r.t) + '">' + esc(r.p) + '</a>' : ''; }
function col(m){ return COL[MISSIONS.indexOf(m) % COL.length]; }
var EV = { launch:'Lancement', flyby:'Survol', arrival:'Arrivée', orbit:'Mise en orbite', landing:'Atterrissage de Huygens', end:'Fin de mission' };
function evName(e){ var b = e.type === 'launch' || e.type === 'landing' ? '' : colon() + T(e.body); return T(EV[e.type]) + b; }
function ev(m, ty){ return (m.events || []).filter(function(e){ return ty.indexOf(e.type) >= 0; })[0]; }
function launch(m){ return ev(m, ['launch']); }
function arrival(m){ return ev(m, ['arrival', 'orbit']); }
function end(m){ return ev(m, ['end']); }
/* agences nommées dans le texte de la fiche, telles qu'écrites (sigles) */
function agencies(m){ var a = []; (String(m.agency).match(/\b(NASA|ESA|ASI|JAXA|CNES|DLR|ISRO|KARI|Roscosmos|CNSA)\b/g) || []).forEach(function(x){ if (a.indexOf(x) < 0) a.push(x); }); return a; }
function allAgencies(){ var n = {}; MISSIONS.forEach(function(m){ agencies(m).forEach(function(a){ n[a] = (n[a] || 0) + 1; }); });
  return Object.keys(n).sort(function(a, b){ return n[b] - n[a] || (a < b ? -1 : 1); }); }
function bodies(){ var b = []; MISSIONS.forEach(function(m){ if (b.indexOf(m.targets[0]) < 0) b.push(m.targets[0]); }); return b; }
function keep(F, m){
  if (F.ag && agencies(m).indexOf(F.ag) < 0) return false;
  if (F.st === 'on' && end(m)) return false; if (F.st === 'off' && !end(m)) return false;
  if (F.body && m.targets[0] !== F.body) return false;
  return true;
}
function chips(scope, F, key, label, opts){
  return '<div class="fl-f" role="group" aria-label="' + esc(T(label)) + '"><span>' + esc(T(label)) + '</span><div class="fl-opts">' +
    '<button class="chip" data-xf="' + scope + ':' + key + ':" aria-pressed="' + !F[key] + '">' + esc(T('Toutes')) + '</button>' +
    opts.map(function(o){ return '<button class="chip" data-xf="' + scope + ':' + key + ':' + esc(o[0]) + '" aria-pressed="' + (F[key] === o[0]) + '">' + esc(T(o[1])) + '</button>'; }).join('') + '</div></div>';
}
var STATES = [['on', 'En cours'], ['off', 'Terminées']];
/* gabarit commun : sous-pages à gauche, contenu à droite */
function shell(label, items, on, main){
  return '<div class="xp inst-body"><nav class="inst-nav" aria-label="' + esc(T(label)) + '">' + items.map(function(x){
    return '<a class="nav-i' + (x[0] === on ? ' on' : '') + '" href="#' + x[0] + '"' + (x[0] === on ? ' aria-current="page"' : '') + '><span class="n">' + esc(T(x[1])) + '</span><span class="k">' + esc(T(x[2])) + '</span></a>';
  }).join('') + '</nav><div class="inst-main" id="xp-main">' + main + '</div></div>';
}
function head(name, full, right){
  return '<div class="inst-head"><div class="inst-h"><h2 class="inst-name">' + esc(T(name)) + '</h2><div class="inst-full">' + esc(T(full)) + '</div></div>' + right + '</div>';
}

/* ---------- Flotte ---------- */
var FLEET_SECS = [['flotte', 'Frise chronologique', 'Du lancement à la fin de mission'], ['flotte-qui', 'Qui a fait quoi', 'Agences, corps visés, étapes datées']];
var SHAPE = {
  flyby:function(x, y){ return '<circle cx="' + x + '" cy="' + y + '" r="3.5"/>'; },
  end:function(x, y){ return '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="8" height="8"/>'; },
  landing:function(x, y){ return '<path d="M' + x + ' ' + (y - 6) + 'l6 10h-12z"/>'; },
  orbit:function(x, y){ return '<path d="M' + x + ' ' + (y - 6) + 'l6 6l-6 6l-6-6z"/>'; }
};
SHAPE.arrival = SHAPE.orbit;
function timeline(L){
  var y0 = Math.floor(Math.min.apply(null, [2000].concat(L.map(function(m){ return +String(m.year).slice(0, 4); }))) / 5) * 5, y1 = Math.max(2028, new Date().getUTCFullYear() + 2), W = 1000, lw = 120, rh = 30, top = 26, H = top + L.length * rh + 30, now = today();
  var t0 = Date.UTC(y0, 0, 1) / DAY, t1 = Date.UTC(y1, 0, 1) / DAY;
  function X(t){ return +(lw + (t - t0) / (t1 - t0) * (W - lw - 40)).toFixed(1); }
  var s = '';
  for (var y = y0; y <= y1; y += 5){ var xx = X(Date.UTC(y, 0, 1) / DAY); s += '<line x1="' + xx + '" y1="' + (top - 6) + '" x2="' + xx + '" y2="' + (H - 22) + '" class="fl-grid"/><text x="' + xx + '" y="14" text-anchor="middle" class="fl-year">' + y + '</text>'; }
  s += '<line x1="' + X(now) + '" y1="' + (top - 6) + '" x2="' + X(now) + '" y2="' + (H - 22) + '" stroke-width="1.5" stroke-dasharray="3 3" class="fl-now"/><text x="' + X(now) + '" y="' + (H - 8) + '" text-anchor="middle" class="fl-nowt">' + esc(T('aujourd\'hui')) + '</text>';
  L.forEach(function(m, i){
    var l = launch(m), e = end(m), a = X(day(l.date)), b = e ? X(day(e.date)) : X(now), yy = top + i * rh, cy = yy + 12, c = col(m);
    var tip = m.short + colon() + fmt(l.date) + ' – ' + (e ? fmt(e.date) : T('en cours'));
    s += '<g class="fl-row" data-go="' + m.id + '" tabindex="0" role="link" aria-label="' + esc(tip) + '"><title>' + esc(tip) + '</title>' +
      '<rect x="0" y="' + (yy - 3) + '" width="' + W + '" height="' + rh + '" fill="transparent"/>' +
      '<text x="' + (lw - 10) + '" y="' + (cy + 4.5) + '" text-anchor="end" class="fl-lab">' + esc(m.short) + '</text>' +
      '<rect x="' + a + '" y="' + (cy - 7) + '" width="' + Math.max(3, b - a).toFixed(1) + '" height="14" fill="' + c + '"' + (e ? ' fill-opacity="0.55"' : '') + '/>' +
      (e ? '' : '<path d="M' + b + ' ' + (cy - 7) + ' l7 7 l-7 7 z" fill="' + c + '"/>') +
      '<g class="fl-ev">' + (m.events || []).filter(function(x){ return SHAPE[x.type]; }).map(function(x){ return SHAPE[x.type](X(day(x.date)), cy); }).join('') + '</g></g>';
  });
  var leg = [['Survol', SHAPE.flyby(8, 8)], ['Arrivée ou mise en orbite', SHAPE.orbit(8, 8)], ['Atterrissage', SHAPE.landing(8, 8)], ['Fin de mission', SHAPE.end(8, 8)]];
  return '<div class="isec"><h3>' + esc(T('Les missions, du lancement à la fin')) + '</h3><div class="svgwrap fl-tl"><svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="' + esc(T('Frise chronologique des missions')) + '">' + s + '</svg></div>' +
    '<p class="fl-leg">' + leg.map(function(l){ return '<span><svg viewBox="0 0 16 16" aria-hidden="true">' + l[1] + '</svg>' + esc(T(l[0])) + '</span>'; }).join('') + '<span><i class="fl-live"></i>' + esc(T('mission en cours')) + '</span></p>' +
    '<div class="cap">' + esc(T('Une barre par mission, du lancement à la fin de mission ; pleine et fléchée si elle est en cours. Les étapes datées sont marquées sur la barre ; leurs sources sont dans « Qui a fait quoi ». Cliquer une barre ouvre la sonde en 3D.')) + '</div></div>';
}
function who(L){
  var nums = {}, refs = [], h = '';
  function ref(m, k){ if (!k || !m.refs || !m.refs[k]) return ''; var id = m.id + ':' + k; if (!nums[id]){ refs.push(m.refs[k]); nums[id] = refs.length; } return '<sup class="ref">' + nums[id] + '</sup>'; }
  L.forEach(function(m){
    var l = launch(m), e = end(m);
    h += '<div class="fl-who"><h3><a href="#' + m.id + '">' + esc(m.name) + '</a> <small>' + fmt(l.date) + ' – ' + (e ? fmt(e.date) : esc(T('en cours'))) + '</small></h3>' +
      '<div class="spec-row"><div class="k"><b>' + esc(T('Agences')) + '</b></div><div class="v">' + esc(m.agency) + '</div></div>' +
      '<div class="spec-row"><div class="k"><b>' + esc(T('Corps visés')) + '</b></div><div class="v">' + m.targets.map(function(b){ return esc(T(b)); }).join(', ') + '</div></div>' +
      (m.events || []).map(function(x){ return '<div class="spec-row"><div class="k"><b>' + esc(evName(x)) + '</b></div><div class="v">' + fmt(x.date) + ref(m, x.ref) + '</div></div>'; }).join('') + '</div>';
  });
  return h + (refs.length ? '<div class="spec-section"><div class="spec-section-title">' + esc(T('Sources')) + '</div><ol class="refs">' + refs.map(function(r){
    return '<li><a href="' + esc(r.u) + '" target="_blank" rel="noopener">' + esc(r.t) + '</a> <span>' + esc(r.p) + '</span></li>'; }).join('') + '</ol></div>' : '') +
    '<p class="cap">' + esc(T('Agences citées telles que les sources les nomment ; l\'ordre suit le registre du site, sans hiérarchie.')) + '</p>';
}
function fleet(sec){
  var L = MISSIONS.filter(function(m){ return keep(FS, m); }).sort(function(a, b){ return day(launch(a).date) - day(launch(b).date); });
  var main = head('Flotte', 'Toutes les sondes présentées sur ce site', '<p class="inst-sum">' + esc(T('Chaque sonde a sa fiche, sa maquette et ses données. Les filtres se combinent ; le nombre affiché est celui des missions retenues.')) + '</p>') +
    '<div class="fl-filters">' + chips('f', FS, 'ag', 'Agence', allAgencies().map(function(a){ return [a, a]; })) + chips('f', FS, 'st', 'État', STATES) +
      chips('f', FS, 'body', 'Corps visé', bodies().map(function(b){ return [b, b]; })) + '</div>' +
    '<p class="fl-count">' + esc(T('Missions affichées')) + colon() + '<b>' + L.length + '</b> / ' + MISSIONS.length + '</p>';
  main += !L.length ? '<p class="cap">' + esc(T('Aucune mission ne correspond à ces filtres.')) + '</p>' : sec === 'flotte-qui' ? who(L) : timeline(L);
  return shell('Flotte', FLEET_SECS, sec, main);
}

/* ---------- Comparer ---------- */
var CMP_SECS = [['comparer', 'Vue d\'ensemble', 'Années, masses, corps visés, agences'], ['comparer-voyage', 'Durée du voyage', 'Du lancement à l\'arrivée'],
                ['comparer-masse', 'Masse au lancement', 'Ergols compris'], ['comparer-vehicules', 'Véhicules', 'Dimensions et construction'],
                ['comparer-orbites', 'Orbites', 'Autour du corps visé'], ['comparer-instruments', 'Instruments', 'Tous les instruments, côte à côte']];
function massRow(m){ return (m.sections && m.sections[0] && m.sections[0].rows || []).filter(function(r){ return /^(Masse au lancement|Launch mass)$/.test(r[0]); })[0]; }
function num(s){ var m = /^[\d\s  ,.]+/.exec(s); return m ? +m[0].replace(en() ? /[^\d.]/g : /[^\d,]/g, '').replace(',', '.') : NaN; }
function trip(m){ var l = launch(m), a = arrival(m); return l && a ? day(a.date) - day(l.date) : null; }
function years(d){ return (d / 365.25).toFixed(1).replace('.', en() ? '.' : ','); }
function bars(items){
  var max = Math.max.apply(null, items.map(function(i){ return i.v; }));
  return '<ul class="cp-bars">' + items.map(function(i){
    return '<li><a href="#' + i.m.id + '" class="cp-n">' + esc(i.m.short) + '</a><span class="cp-t"><i style="width:' + (i.v / max * 100).toFixed(1) + '%;background:' + col(i.m) + '"></i></span><span class="cp-v">' + i.label + '</span></li>';
  }).join('') + '</ul>';
}
function overview(L){
  var maxK = Math.max.apply(null, L.map(function(m){ var r = massRow(m); return r ? num(r[1]) || 0 : 0; })) || 1;
  var rows = L.map(function(m){
    var l = launch(m), e = end(m), r = massRow(m), k = r ? num(r[1]) : NaN, d = trip(m), a = arrival(m), ins = m.sections && m.sections[3];
    return '<tr><td class="o" style="--c:' + col(m) + '"><a href="#' + m.id + '">' + esc(m.short) + '</a></td>' +
      '<td>' + l.date.slice(0, 4) + '–' + (e ? e.date.slice(0, 4) : ' <small>' + esc(T('en cours')) + '</small>') + '</td>' +
      '<td>' + (isNaN(k) ? '—' : '<div class="barcell"><i class="alt" style="width:' + Math.round(k / maxK * 54) + 'px"></i>' + esc(OBS_NUM((r[1].match(/^\D*[\d\s  ,.]*\d\s*kg/) || [r[1]])[0])) + '</div>') + '</td>' +
      '<td>' + m.targets.map(function(b){ return esc(T(b)); }).join(', ') + '</td>' +
      '<td>' + esc(agencies(m).join(', ')) + '</td>' +
      '<td>' + (d == null ? '—' : OBS_NUM(Math.round(d).toLocaleString('fr-FR')) + ' ' + esc(T('jours')) + ' <small>' + (a ? esc(T(a.body)) : '') + '</small>') + '</td>' +
      '<td>' + (ins ? ins.rows.length : '—') + '</td></tr>';
  }).join('');
  return '<div class="isec"><h3>' + esc(T('Les missions côte à côte')) + '</h3><div class="tablewrap"><table class="ctable"><thead><tr><th scope="col">' + esc(T('Mission')) + '</th><th scope="col">' + esc(T('Années')) + '</th><th scope="col">' + esc(T('Masse au lancement')) + '</th>' +
    '<th scope="col">' + esc(T('Corps visés')) + '</th><th scope="col">' + esc(T('Agences')) + '</th><th scope="col">' + esc(T('Durée du voyage')) + '</th><th scope="col">' + esc(T('Instruments')) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="cap">' + esc(T('Valeurs des fiches de chaque sonde, où leur source est citée ; « Durée du voyage » : du lancement à l\'arrivée (ou à la mise en orbite) autour du corps visé. Cliquer un nom ouvre la sonde en 3D.')) + '</div></div>';
}
function rowsTable(L, idx, title, cap){
  var rows = '';
  L.forEach(function(m){ var s = m.sections && m.sections[idx]; if (!s) return;
    s.rows.forEach(function(r, j){ rows += '<tr' + (j ? '' : ' class="first"') + '><td class="o" style="--c:' + col(m) + '">' + (j ? '' : '<a href="#' + m.id + '">' + esc(m.short) + '</a><small class="cp-sec">' + esc(s.title) + '</small>') + '</td>' +
      '<td class="n">' + esc(r[0]) + '</td><td>' + esc(OBS_NUM(r[1])) + src(m, r[2]) + '</td></tr>'; }); });
  return '<div class="isec"><h3>' + esc(T(title)) + '</h3><div class="tablewrap"><table class="ctable cp-rows"><thead><tr><th scope="col">' + esc(T('Mission')) + '</th><th scope="col">' + esc(T('Élément')) + '</th><th scope="col">' + esc(T('Valeur et source')) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="cap">' + esc(T(cap)) + '</div></div>';
}
function compare(sec){
  var L = MISSIONS.filter(function(m){ return keep(CS, m); }), cs = CMP_SECS.filter(function(x){ return x[0] === sec; })[0];
  var main = head(cs[1], 'Comparer : les missions sur les mêmes axes, avec les valeurs et les sources de leurs fiches',
    '<div class="fl-filters">' + chips('c', CS, 'body', 'Corps visé', bodies().map(function(b){ return [b, b]; })) + chips('c', CS, 'st', 'État', STATES) + '</div>');
  if (!L.length) return shell('Comparer', CMP_SECS, sec, main + '<p class="cap">' + esc(T('Aucune mission ne correspond à ces filtres.')) + '</p>');
  if (sec === 'comparer') main += overview(L);
  else if (sec === 'comparer-voyage'){
    var tr = L.map(function(m){ var d = trip(m), a = arrival(m); if (d == null) return null;
      return { m:m, v:d, label:OBS_NUM(Math.round(d).toLocaleString('fr-FR')) + ' ' + esc(T('jours')) + ' (' + years(d) + ' ' + esc(T('ans')) + ') · ' + esc(T(a.body)) + src(m, a.ref) }; }).filter(Boolean);
    main += '<div class="isec"><h3>' + esc(T('Du lancement à l\'arrivée')) + '</h3>' + bars(tr) + '<div class="cap">' + esc(T('Du lancement à l\'arrivée (ou à la mise en orbite) autour du corps visé, calculé à partir des dates des fiches. Les survols en chemin allongent le voyage mais économisent du carburant.')) + '</div></div>';
  } else if (sec === 'comparer-masse'){
    var ms = L.map(function(m){ var r = massRow(m); if (!r) return null; var v = num(r[1]); return isNaN(v) ? null : { m:m, v:v, label:esc(OBS_NUM(r[1])) + src(m, r[2]) }; }).filter(Boolean);
    main += '<div class="isec"><h3>' + esc(T('Masse au lancement')) + '</h3>' + bars(ms) + '<div class="cap">' + esc(T('Masse totale au lancement, ergols compris, telle que la publie la source citée ; les valeurs suivies de « ≈ » sont approchées.')) + '</div></div>';
  } else if (sec === 'comparer-vehicules') main += rowsTable(L, 0, 'Véhicules', 'Valeurs de la section « Véhicule » de chaque fiche.');
  else if (sec === 'comparer-orbites') main += rowsTable(L, 2, 'Orbites', 'Valeurs de la section « Orbite » de chaque fiche ; Cassini a changé d\'orbite autour de Saturne tout au long de sa mission.');
  else main += rowsTable(L, 3, 'Instruments', 'Valeurs de la section « Instruments » de chaque fiche ; le détail de chaque instrument est dans « Mission et données » de la sonde.');
  return shell('Comparer', CMP_SECS, sec, main);
}

function page(r){
  if (FLEET_SECS.some(function(x){ return x[0] === r; })){ cur = r; return fleet(r); }
  if (CMP_SECS.some(function(x){ return x[0] === r; })){ cur = r; return compare(r); }
  return null;
}
/* pastilles de filtre : la page est redessinée sur place, défilement et focus gardés */
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-xf]'); if (!b || !cur) return;
  var p = b.getAttribute('data-xf').split(':'), F = p[0] === 'f' ? FS : CS; F[p[1]] = p[2] || null;
  var mm = document.getElementById('xp-main'), top = mm ? mm.scrollTop : 0, key = b.getAttribute('data-xf');
  document.getElementById('page').innerHTML = page(cur);
  mm = document.getElementById('xp-main'); if (mm) mm.scrollTop = top;
  var nb = document.querySelector('[data-xf="' + key.replace(/"/g, '\\"') + '"]'); if (nb) nb.focus();
});
/* lignes de la frise : Entrée ou Espace ouvrent la sonde (role=link) */
document.addEventListener('keydown', function(e){
  var g = e.target.closest && e.target.closest('.fl-row[data-go]'); if (!g || (e.key !== 'Enter' && e.key !== ' ')) return;
  e.preventDefault(); location.hash = g.getAttribute('data-go');
});
return { page:page, base:function(r){ return /^flotte/.test(r) ? 'flotte' : /^comparer/.test(r) ? 'comparer' : r; } };
})();
