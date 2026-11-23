/* =================================================================
   VUES D'ENSEMBLE « FLOTTE » ET « COMPARER » — tirées du registre (src/data-missions.js), sans autre donnée :
   chaque date, chaque valeur garde la source de la fiche (règle 1). Aucune agence n'a de couleur ni de badge (règle 5).
   FleetPage.html() : frise des missions par corps visé et « qui a fait quoi » ;
   ComparePage.html() : durée du voyage, masse au lancement, véhicules et instruments côte à côte.
================================================================= */
var Views = (function(){
'use strict';
var DAY = 864e5, COL = ['#D63C6E', '#0E8FA3', '#7B5CC4', '#C77700', '#3F8F46'];   /* une couleur par sonde, ordre du registre (même ordre que l'accueil) */
function T(s){ return OBS_T(s); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function day(s){ var m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(s); return Date.UTC(+m[1], +m[2] - 1, m[3] ? +m[3] : 1) / DAY; }
function fmt(s){ var o = { month:'long', year:'numeric', timeZone:'UTC' }; if (s.length > 7) o.day = 'numeric';
  return new Date(day(s) * DAY).toLocaleDateString(OBS_LANG === 'en' ? 'en-GB' : 'fr-FR', o); }
function today(){ var d = new Date(); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / DAY; }
function src(m, k){ var r = k && m.refs && m.refs[k]; return r ? ' <a class="src" href="' + esc(r.u) + '" rel="noopener" target="_blank" title="' + esc(r.t) + '">' + esc(r.p) + '</a>' : ''; }
function col(m){ return COL[MISSIONS.indexOf(m) % COL.length]; }
var EV = { launch:'Lancement', flyby:'Survol', arrival:'Arrivée', orbit:'Mise en orbite', landing:'Atterrissage de Huygens', end:'Fin de mission' };
function evName(e){ var b = e.type === 'launch' || e.type === 'landing' ? '' : (OBS_LANG === 'en' ? ': ' : ' : ') + T(e.body); return T(EV[e.type]) + b; }
function arrival(m){ return (m.events || []).filter(function(e){ return e.type === 'arrival' || e.type === 'orbit'; })[0]; }
function launch(m){ return (m.events || []).filter(function(e){ return e.type === 'launch'; })[0]; }
function end(m){ return (m.events || []).filter(function(e){ return e.type === 'end'; })[0]; }

/* ---------- Flotte ---------- */
function fleet(){
  var y0 = 1997, y1 = new Date().getUTCFullYear() + 1, t0 = Date.UTC(y0, 0, 1) / DAY, t1 = Date.UTC(y1, 0, 1) / DAY, now = today();
  var W = 900, L = 150, H = 34, x = function(t){ return (L + (t - t0) / (t1 - t0) * (W - L - 10)).toFixed(1); };
  var groups = [];   /* lignes rangées par corps visé principal, dans l'ordre du registre */
  MISSIONS.forEach(function(m){ var g = groups.filter(function(g){ return g.body === m.targets[0]; })[0]; if (!g) groups.push(g = { body:m.targets[0], ms:[] }); g.ms.push(m); });
  var rows = 0; groups.forEach(function(g){ rows += g.ms.length; });
  var Ht = 30 + rows * H + groups.length * 22, svg = '';
  for (var y = y0; y <= y1; y++){ var xx = x(Date.UTC(y, 0, 1) / DAY);
    svg += '<line x1="' + xx + '" y1="22" x2="' + xx + '" y2="' + Ht + '" class="fl-grid' + (y % 5 ? '' : ' major') + '"/>';
    if (y % 5 === 0 && y < y1) svg += '<text x="' + xx + '" y="14" class="fl-year">' + y + '</text>'; }
  svg += '<line x1="' + x(now) + '" y1="18" x2="' + x(now) + '" y2="' + Ht + '" class="fl-now"/><text x="' + x(now) + '" y="' + (Ht + 14) + '" class="fl-year" style="text-anchor:end">' + T('aujourd\'hui') + '</text>';
  var yy = 30;
  groups.forEach(function(g){
    svg += '<text x="0" y="' + (yy + 12) + '" class="fl-body">' + esc(T(g.body)) + '</text>'; yy += 22;
    g.ms.forEach(function(m){
      var l = launch(m), e = end(m), c = col(m), a = day(l.date), b = e ? day(e.date) : now, cy = yy + H / 2 - 4;
      svg += '<a href="#' + m.id + '"><text x="10" y="' + (cy + 4) + '" class="fl-name">' + esc(m.short) + '</text></a>';
      svg += '<rect x="' + x(a) + '" y="' + (cy - 5) + '" width="' + (x(b) - x(a)).toFixed(1) + '" height="10" style="fill:' + c + '" class="fl-bar' + (e ? '' : ' live') + '"><title>' + esc(m.short) + ' : ' + fmt(l.date) + ' – ' + (e ? fmt(e.date) : T('en cours')) + '</title></rect>';
      if (!e) svg += '<path d="M' + x(b) + ' ' + (cy - 8) + 'l7 8l-7 8z" style="fill:' + c + '"/>';
      (m.events || []).forEach(function(ev){
        if (ev.type === 'launch') return; var ex = +x(day(ev.date)), sh;
        if (ev.type === 'flyby') sh = '<circle cx="' + ex + '" cy="' + cy + '" r="3.5"/>';
        else if (ev.type === 'end') sh = '<rect x="' + (ex - 4) + '" y="' + (cy - 4) + '" width="8" height="8"/>';
        else if (ev.type === 'landing') sh = '<path d="M' + ex + ' ' + (cy - 6) + 'l6 10h-12z"/>';
        else sh = '<path d="M' + ex + ' ' + (cy - 7) + 'l7 7l-7 7l-7-7z"/>';
        svg += '<g class="fl-ev">' + sh.replace('/>', '><title>' + esc(evName(ev) + ' · ' + fmt(ev.date)) + '</title></' + sh.match(/^<(\w+)/)[1] + '>') + '</g>';
      });
      yy += H;
    });
  });
  var leg = [['Survol', '<circle cx="8" cy="8" r="3.5"/>'], ['Arrivée ou mise en orbite', '<path d="M8 1l7 7l-7 7l-7-7z"/>'], ['Atterrissage', '<path d="M8 2l6 10h-12z"/>'], ['Fin de mission', '<rect x="4" y="4" width="8" height="8"/>']];
  var h = '<div class="sk wide"><h2>' + T('Flotte') + '</h2><p class="lead">' + T('Les missions du site sur une même frise, rangées par corps visé : lancement, survols, arrivée et fin de mission, chaque date sourcée dans la liste plus bas.') + '</p>' +
    '<div class="fl-wrap"><svg viewBox="0 -4 ' + W + ' ' + (Ht + 22) + '" class="fl" role="group" aria-labelledby="fl-cap">' + svg + '</svg></div>' +
    '<p class="sr-only" id="fl-cap">' + T('Frise des missions de') + ' ' + y0 + ' ' + T('à aujourd\'hui') + '. ' + T('Le détail est dans la liste qui suit.') + '</p>' +
    '<p class="fl-leg">' + leg.map(function(l){ return '<span><svg viewBox="0 0 16 16" aria-hidden="true">' + l[1] + '</svg>' + T(l[0]) + '</span>'; }).join('') +
      '<span><i class="fl-live"></i>' + T('mission en cours') + '</span></p>';
  h += '<h3>' + T('Qui a fait quoi') + '</h3><div class="fl-who">' + MISSIONS.map(function(m){
    return '<section class="fl-card" style="--c:' + col(m) + '"><h4><a href="#' + m.id + '">' + esc(m.name) + '</a></h4><p class="fl-ag">' + esc(m.agency) + '</p><ul>' +
      (m.events || []).map(function(ev){ return '<li><span>' + fmt(ev.date) + '</span> ' + esc(evName(ev)) + src(m, ev.ref) + '</li>'; }).join('') +
      (end(m) ? '' : '<li><span>' + T('aujourd\'hui') + '</span> ' + T('mission en cours') + '</li>') + '</ul></section>';
  }).join('') + '</div><p class="note">' + T('Agences citées telles que les sources les nomment ; l\'ordre suit le registre du site, sans hiérarchie.') + '</p></div>';
  return h;
}

/* ---------- Comparer ---------- */
function massRow(m){ var v = (m.sections && m.sections[0] && m.sections[0].rows || []).filter(function(r){ return /^(Masse au lancement|Launch mass)$/.test(r[0]); })[0]; return v; }
function num(s){ var m = /^[\d\s  ,.]+/.exec(s); return m ? +m[0].replace(OBS_LANG === 'en' ? /[^\d.]/g : /[^\d,]/g, '').replace(',', '.') : NaN; }
function bars(items, unit){
  var max = Math.max.apply(null, items.map(function(i){ return i.v; }));
  return '<ul class="cp-bars">' + items.map(function(i){
    return '<li><a href="#' + i.m.id + '" class="cp-n">' + esc(i.m.short) + '</a><span class="cp-t"><i style="width:' + (i.v / max * 100).toFixed(1) + '%;background:' + col(i.m) + '"></i></span><span class="cp-v">' + i.label + '</span></li>';
  }).join('') + '</ul>';
}
function compare(){
  var h = '<div class="sk wide"><h2>' + T('Comparer') + '</h2><p class="lead">' + T('Les missions côte à côte, avec les valeurs de leurs fiches et les mêmes sources.') + '</p>';
  var trip = MISSIONS.map(function(m){ var l = launch(m), a = arrival(m); if (!l || !a) return null; var d = day(a.date) - day(l.date);
    return { m:m, v:d, label:OBS_NUM(String(Math.round(d))) + ' ' + T('jours') + ' (' + (d / 365.25).toFixed(1).replace('.', OBS_LANG === 'en' ? '.' : ',') + ' ' + T('ans') + ') · ' + esc(T(a.body)) + src(m, a.ref) }; }).filter(Boolean);
  h += '<h3>' + T('Durée du voyage') + '</h3><p class="note">' + T('Du lancement à l\'arrivée (ou à la mise en orbite) autour du corps visé.') + '</p>' + bars(trip);
  var mass = MISSIONS.map(function(m){ var r = massRow(m); if (!r) return null; var v = num(r[1]); return isNaN(v) ? null : { m:m, v:v, label:esc(OBS_NUM(r[1])) + src(m, r[2]) }; }).filter(Boolean);
  h += '<h3>' + T('Masse au lancement') + '</h3>' + bars(mass);
  [[0, 'Véhicules'], [3, 'Instruments']].forEach(function(s){
    h += '<h3>' + T(s[1]) + '</h3><div class="cp-grid">' + MISSIONS.map(function(m){ var sec = m.sections && m.sections[s[0]]; if (!sec) return '';
      return '<section class="fl-card" style="--c:' + col(m) + '"><h4><a href="#' + m.id + '">' + esc(m.short) + '</a></h4><table class="sk-table"><tbody>' +
        sec.rows.map(function(r){ return '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(OBS_NUM(r[1])) + src(m, r[2]) + '</td></tr>'; }).join('') + '</tbody></table></section>'; }).join('') + '</div>';
  });
  return h + '<p class="note">' + T('Durées calculées à partir des dates des fiches ; les valeurs suivies de « ≈ » sont approchées.') + '</p></div>';
}
return { fleet:fleet, compare:compare };
})();
