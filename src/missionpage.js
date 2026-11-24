/* =================================================================
   PAGE « MISSION ET INSTRUMENTS » d'une sonde, sur le modèle de la page Instruments d'Observatories v1.0 (src/inst-render.js) :
   sous-pages à gauche (vue d'ensemble, mission et traitements, trajectoire et orbite, un instrument par entrée), contenu à droite.
   Données : INST_DATA (data-inst.js), MISSION (data-mission.js), STAC_COLS (data-stac.js), DATA_FILES (data/*.json).
   Chaque valeur chiffrée porte un numéro de source (règle 1) ; les classements approchés sont signalés par « ≈ » (règle 2).
   MissionPage.html(m, sec, extra) rend la route #<id>-donnees[-<sec>] ; extra = { traj, real } (fonctions de app.js).
================================================================= */
var MissionPage = (function(){
'use strict';
function en(){ return OBS_LANG === 'en'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function num(v, d){ var t = v.toFixed(d); if (t.indexOf('.') >= 0) t = t.replace(/0+$/,'').replace(/\.$/,''); return en() ? t : t.replace('.', ','); }
function big(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, en() ? ',' : '\u202f'); }
function host(u){ return u.replace(/^https?:\/\//,'').replace(/\/.*$/,''); }
/* longueur d'onde en µm → texte lisible (nm, µm, mm, cm, m) */
function wl(um){
  if (um < 1) return num(um * 1000, um * 1000 < 100 ? 1 : 0) + ' nm';
  if (um < 1000) return num(um, um < 10 ? 2 : 1) + ' µm';
  if (um < 1e4) return num(um / 1000, 1) + ' mm';
  if (um < 1e6) return num(um / 1e4, 1) + ' cm';
  return num(um / 1e6, 1) + ' m';
}
function span(lo, hi){ var a = wl(lo), b = wl(hi); return a === b ? a : a + ' – ' + b; }
function range(it){ if (!it.bands || !it.bands.length) return L('hors spectre', 'not spectral');
  var lo = Math.min.apply(null, it.bands.map(function(b){ return b.lo; })), hi = Math.max.apply(null, it.bands.map(function(b){ return b.hi; }));
  return span(lo, hi); }
function color(it){ return (INST_TYPES[it.type] || INST_TYPES.radio).c; }
function kind(it){ return (INST_TYPES[it.type] || INST_TYPES.radio).l; }
function prefixes(it){ return [].concat(it.stac || []); }
function cols(m, it){ var p = prefixes(it); return (STAC_COLS[m.id] || []).filter(function(c){ return p.some(function(q){ return c[0].indexOf(q) === 0; }); }); }
function suffix(it, c){ var p = prefixes(it).filter(function(q){ return c.indexOf(q) === 0; })[0] || ''; return c.slice(p.length); }

/* ---------- sources : refs de la mission (MISSION), des instruments (INST_DATA), de la fiche (MISSIONS) et générales ---------- */
function refsOf(m){
  var r = {}, k, all = [m.refs || {}, (INST_DATA[m.id] || {}).refs || {}, (MISSION[m.id] || {}).refs || {}, MISSION_REFS];
  all.forEach(function(o){ for (k in o) r[k] = o[k]; }); return r;
}
function Marks(m){
  var refs = refsOf(m), nums = {}, n = 0;
  return {
    mark:function(keys){ var ks = [].concat(keys || []).filter(function(x){ return refs[x]; }); if (!ks.length) return '';
      return '<sup class="ref">' + ks.map(function(x){ if (!nums[x]) nums[x] = ++n; return '<a href="#" data-ref="' + nums[x] + '" aria-label="' + esc(L('source ', 'source ') + nums[x]) + '">' + nums[x] + '</a>'; }).join(',') + '</sup>'; },
    list:function(checked){
      var keys = Object.keys(nums).sort(function(a, b){ return nums[a] - nums[b]; }); if (!keys.length) return '';
      var c = (checked || '').split('-');
      return '<div class="isec wide"><h3>' + L('Sources', 'Sources') + '</h3><ol class="refs">' + keys.map(function(k){ var x = refs[k];
        return '<li id="ref-' + nums[k] + '"><a href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(OBS_T(x.t)) + '</a> <span>' + esc(x.p) + '</span></li>'; }).join('') + '</ol>' +
        (checked ? '<p class="source-note">' + (en() ? 'Checked against the sources above on ' + checked + '.' : 'Vérifié le ' + c[2] + '/' + c[1] + '/' + c[0] + ' face aux sources ci-dessus.') + '</p>' : '') + '</div>';
    }
  };
}

/* ---------- couverture spectrale : axe logarithmique de l'ultraviolet à la radio ---------- */
var TICKS = [0.1, 0.3, 1, 3, 10, 30, 100, 1000, 1e4, 1e5, 1e6, 1e7, 1e8];
function coverage(m, sel){
  var list = INST_DATA[m.id].instruments.filter(function(it){ return it.bands && it.bands.length; });
  if (!list.length) return '';
  var lo = Infinity, hi = 0; list.forEach(function(it){ it.bands.forEach(function(b){ lo = Math.min(lo, b.lo); hi = Math.max(hi, b.hi); }); });
  lo = Math.pow(10, Math.floor(Math.log(lo) / Math.LN10 * 2) / 2); hi = Math.pow(10, Math.ceil(Math.log(hi) / Math.LN10 * 2) / 2);
  var W = 560, Lm = 80, R = 14, a = Math.log(lo), b = Math.log(hi);
  function X(v){ return Lm + (Math.log(Math.max(lo, Math.min(hi, v))) - a) / (b - a) * (W - Lm - R); }
  var y = 30, rows = list.map(function(it){ var r = { it:it, y:y, h:it.bands.length > 1 && overlap(it.bands) ? it.bands.length * 15 + 9 : 24 }; y += r.h; return r; });
  function overlap(bs){ for (var i = 1; i < bs.length; i++) if (bs[i].lo < bs[i - 1].hi) return true; return false; }
  var s = '<svg class="cov" viewBox="0 0 ' + W + ' ' + (y + 34) + '" role="group" aria-label="' + esc(L('Couverture spectrale des instruments de ', 'Spectral coverage of the instruments of ') + m.short) + '">' +
    '<defs><linearGradient id="gvis" x1="0" x2="1"><stop offset="0" stop-color="#7a5cff"/><stop offset="0.25" stop-color="#3fa0ff"/><stop offset="0.5" stop-color="#5fe07a"/><stop offset="0.72" stop-color="#ffd85a"/><stop offset="1" stop-color="#ff5a4a"/></linearGradient></defs>';
  if (lo < 0.75 && hi > 0.38){ s += '<rect x="' + X(0.38) + '" y="22" width="' + (X(0.75) - X(0.38)) + '" height="' + (y - 22) + '" fill="url(#gvis)" opacity="0.26"/><text class="cov-vis" x="' + ((X(0.38) + X(0.75)) / 2) + '" y="14" text-anchor="middle">' + L('visible', 'visible') + '</text>'; }
  var last = -99; TICKS.forEach(function(v){ if (v < lo || v > hi) return; var x = X(v); if (x - last < 38) return; last = x;
    s += '<line class="cov-grid" x1="' + x + '" y1="22" x2="' + x + '" y2="' + y + '"/><text class="cov-tick" x="' + x + '" y="' + (y + 15) + '" text-anchor="middle">' + wl(v).replace(/^0,|^0\./, en() ? '0.' : '0,') + '</text>'; });
  s += '<line class="cov-axis" x1="' + Lm + '" y1="' + y + '" x2="' + (W - R) + '" y2="' + y + '"/><text class="cov-unit" x="' + (W - R) + '" y="' + (y + 30) + '" text-anchor="end">' + L('longueur d\'onde, échelle logarithmique', 'wavelength, logarithmic scale') + '</text>';
  rows.forEach(function(r){
    var it = r.it, st = overlap(it.bands);
    s += '<g class="cov-row' + (it.id === sel ? ' sel' : '') + '"><a href="#' + m.id + '-donnees-' + it.id + '" aria-label="' + esc(it.name) + '"><rect x="0" y="' + r.y + '" width="' + W + '" height="' + r.h + '" fill="transparent"/>' +
      '<text class="cov-lab" x="4" y="' + (r.y + r.h / 2 + 4) + '">' + esc(it.name) + '</text>';
    it.bands.forEach(function(bd, i){ var x0 = X(bd.lo), w = Math.max(3, X(bd.hi) - x0), yy = r.y + 5 + (st ? i * 15 : 0);
      s += '<rect x="' + x0.toFixed(1) + '" y="' + yy + '" width="' + w.toFixed(1) + '" height="13" rx="2" fill="' + color(it) + '"' + (sel && it.id !== sel ? ' opacity="0.35"' : '') + '><title>' + esc(it.name + ' ' + bd.l + ' : ' + wl(bd.lo) + ' – ' + wl(bd.hi)) + '</title></rect>'; });
    s += '</a></g>';
  });
  return '<div class="svgwrap">' + s + '</svg></div>';
}

/* ---------- niveaux de traitement (CODMAC, normes du PDS) : classement des collections d'après leur suffixe (≈) ---------- */
var LV = [
  ['anc', /^(ancill|command|status\w*|fpga|microphonics|ratecounters|hdiagnostic\w*|[\w-]*eng|geom|usgeomv2|footprint|clutter|shsimu|valrep|raw-(calibration|command|status)|cal-\w+|shield-counter)$/],
  ['raw', /edr|^raw|-raw|^(odf4|tnf4|ant4|ddor4|mpd4|sff4|wea4|tro4|ion4|ltf4|rsr4|meap\d|occ|hpge-ac)$/],
  ['der', /mrdr|gdr|mdr|map|mos|dtm|dem|topo|photo|anagly|ddr|shadr|sharad3d|rtm|^(ghrm|gcp|pcp|rcp|prp|epf|ldr|mtrdr|ter|lmlp|sha|dap|virdap|pdr|ionosph|rmhe|rmmas|radar\w+|bdr\w*|shbdr|sd\w+|refdr\d|mdm4)$/],
  ['cal', /rdr|cdr|spectra|counts|burst|radr|^$/]
];
var LVN = {
  raw:[L('Brutes et éditées', 'Raw and edited'), 'CODMAC 1–2', L('Télémesure découpée par instrument, datée et localisée : l\'« Experiment Data Record » (EDR).', 'Telemetry split by instrument, time-tagged and located: the “Experiment Data Record” (EDR).')],
  cal:[L('Étalonnées', 'Calibrated'), 'CODMAC 3', L('Valeurs ramenées à une grandeur physique (luminance par exemple), sans rééchantillonnage : RDR, et CDR chez certaines équipes.', 'Values brought to a physical quantity (radiance for instance), without resampling: RDR, and CDR for some teams.')],
  der:[L('Rééchantillonnées et dérivées', 'Resampled and derived'), 'CODMAC 4–5', L('Données projetées ou transformées en résultats : cartes, mosaïques, modèles de terrain, enregistrements globaux (DDR, MRDR, GDR, MDR…).', 'Data projected or turned into results: maps, mosaics, terrain models, global records (DDR, MRDR, GDR, MDR…).')],
  anc:[L('Auxiliaires', 'Ancillary'), 'CODMAC 6', L('Ce qu\'il faut pour étalonner et interpréter : état de l\'instrument, ingénierie, géométrie et pointage.', 'What is needed to calibrate and interpret: instrument state, engineering, geometry and pointing.')]
};
function level(sfx){ for (var i = 0; i < LV.length; i++) if (LV[i][1].test(sfx)) return LV[i][0]; return 'cal'; }

/* ---------- briques ---------- */
function table(rows, mk){
  return '<div class="stable">' + rows.map(function(r){ return '<div class="srow"><div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(OBS_NUM(r[1])) + (mk ? mk.mark(r[2]) : '') + '</div></div>'; }).join('') + '</div>';
}
var copyStore = [];
function code(text){ copyStore.push(text); return '<div class="codewrap"><pre class="code" tabindex="0" aria-label="' + L('Code', 'Code') + '">' + esc(text) + '</pre><button class="copy" data-copy="' + (copyStore.length - 1) + '">' + L('Copier', 'Copy') + '</button></div>'; }
function navItem(m, sec, cur, n, k, c){
  var on = sec === cur, h = '#' + m.id + '-donnees' + (sec ? '-' + sec : '');
  return '<a class="nav-i' + (on ? ' on' : '') + '" href="' + h + '"' + (on ? ' aria-current="page"' : '') + (c ? ' style="--c:' + c + '"' : '') + '><span class="n">' + esc(n) + '</span><span class="k">' + esc(k) + '</span></a>';
}
function get(m, id){ var a = INST_DATA[m.id].instruments; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function realInst(m){ var key = m.real && m.real.key, d = key && (window.DATA_FILES || {})[key]; if (!d) return null;
  var n = String(d.instrument || '').toUpperCase(); return INST_DATA[m.id].instruments.filter(function(it){ return n.indexOf(it.name.toUpperCase()) >= 0; })[0] || null; }

/* ---------- vue d'ensemble ---------- */
function overview(m, X){
  var d = INST_DATA[m.id], mk = Marks(m), s = '';
  var total = (STAC_COLS[m.id] || []).reduce(function(a, c){ return a + c[3]; }, 0);
  s += '<div class="inst-head"><div class="inst-h"><h2 class="inst-name">' + esc(L('Instruments de ', 'Instruments of ') + m.short) + '</h2><div class="inst-full">' + d.instruments.length + ' ' + L('instruments ou expériences. Cliquer une ligne du graphique ou une case pour ouvrir le détail.', 'instruments or investigations. Click a row of the chart or a card to open its page.') + '</div></div><p class="inst-sum">' + esc(d.summary) + '</p></div>';
  s += '<div class="inst-cols"><div class="isec"><h3>' + L('Couverture spectrale', 'Spectral coverage') + '</h3>' + coverage(m, null) +
    '<div class="cap">' + L('Plages reprises des pages d\'instruments, où chaque valeur renvoie à sa source. Les expériences de particules, de champs et de radioscience n\'ont pas de bande d\'observation : elles n\'apparaissent pas ici.', 'Ranges taken from the instrument pages, where each value cites its source. Particle, field and radio science investigations have no observing band and are not shown here.') + '</div></div>';
  s += '<div class="isec"><h3>' + L('Données dans STAC-PLANET', 'Data in STAC-PLANET') + '</h3>' + table([
      [L('Collections', 'Collections'), String((STAC_COLS[m.id] || []).length), 'stac'],
      [L('Produits (items)', 'Products (items)'), big(total), 'stac']
    ].concat(d.instruments.filter(function(it){ return cols(m, it).length; }).map(function(it){ var c = cols(m, it);
      return [it.name, big(c.reduce(function(a, x){ return a + x[3]; }, 0)) + ' ' + L('produits', 'products') + ' · ' + c.length + ' ' + (c.length > 1 ? L('collections', 'collections') : L('collection', 'collection')), 'stac']; })), mk) +
    '<div class="cap">' + L('Relevé du catalogue le 23 novembre 2026. Une même observation peut figurer dans plusieurs collections (brute, étalonnée, dérivée).', 'Catalogue surveyed on 23 November 2026. One observation can appear in several collections (raw, calibrated, derived).') + '</div></div>';
  s += '<div class="isec wide"><h3>' + L('Instruments', 'Instruments') + '</h3><div class="icards">' + d.instruments.map(function(it){
    return '<a class="icard" style="--c:' + color(it) + '" href="#' + m.id + '-donnees-' + it.id + '"><span class="ic-n">' + esc(it.name) + '</span><span class="ic-k">' + esc(kind(it)) + '</span><span class="ic-r">' + esc(range(it)) + '</span></a>';
  }).join('') + '</div></div>';
  if (!realInst(m)) s += '<div class="isec wide"><h3>' + L('Une donnée réelle', 'Real data') + '</h3>' + X.real(m) + '</div>';
  s += '<div class="isec wide"><h3>' + L('Archives et documentation', 'Archives and documentation') + '</h3><div class="archs">' + d.archives.map(function(a){
    return '<a class="arch" href="' + esc(a.url) + '" target="_blank" rel="noopener"><span class="a-l">' + esc(a.label) + '</span><span class="a-d">' + esc(a.desc) + '</span><span class="a-u">' + esc(host(a.url)) + '</span></a>';
  }).join('') + '</div></div>';
  return s + mk.list() + '</div>';
}

/* ---------- mission et traitements ---------- */
function missionSec(m){
  var M = MISSION[m.id], mk = Marks(m), s = '';
  s += '<div class="inst-head"><div class="inst-h"><h2 class="inst-name">' + L('Mission et traitements', 'Mission and processing') + '</h2><div class="inst-full">' + esc(m.name) + '</div></div><p class="inst-sum">' + esc(M.intro) + '</p></div><div class="inst-cols">';
  s += '<div class="isec"><h3>' + L('Déroulé', 'Timeline') + '</h3><ol class="ms-tl">' + M.phases.map(function(p){
    return '<li><span class="ms-d">' + esc(p[0]) + '</span><div><strong>' + esc(p[1]) + '</strong>' + mk.mark(p[3]) + '<p>' + esc(OBS_NUM(p[2])) + '</p></div></li>'; }).join('') + '</ol></div>';
  s += '<div class="isec"><h3>' + L('Exploitation', 'Operations') + '</h3>' + table(M.ops, mk) + '</div>';
  /* chaîne : collections STAC-PLANET de la mission rangées par niveau */
  var by = { raw:[], cal:[], der:[], anc:[] };
  INST_DATA[m.id].instruments.forEach(function(it){ cols(m, it).forEach(function(c){ by[level(suffix(it, c))].push([it, c]); }); });
  s += '<div class="isec wide"><h3>' + L('Chaîne de traitement', 'Processing chain') + '</h3><p class="ms-intro">' +
    L('Les équipes d\'instrument transforment la télémesure en produits de plus en plus élaborés, archivés au Planetary Data System selon des niveaux normalisés', 'Instrument teams turn telemetry into more and more refined products, archived in the Planetary Data System along standard levels') + mk.mark('pds') +
    L('. Voici les collections de la sonde dans STAC-PLANET, rangées par niveau', '. Here are the spacecraft\'s collections in STAC-PLANET, sorted by level') + mk.mark('stac') + '.</p><ol class="ms-chain">' +
    ['raw', 'cal', 'der', 'anc'].map(function(k){ var a = by[k], n = a.reduce(function(t, x){ return t + x[1][3]; }, 0), ins = [];
      a.forEach(function(x){ if (ins.indexOf(x[0].name) < 0) ins.push(x[0].name); });
      return '<li><div class="ms-lv">' + LVN[k][1] + '</div><div class="ms-st"><strong>' + esc(LVN[k][0]) + '</strong><p>' + esc(LVN[k][2]) + '</p><p>' +
        (a.length ? '≈ ' + a.length + ' ' + L('collections', 'collections') + ', ' + big(n) + ' ' + L('produits', 'products') + ' · ' + esc(ins.join(', ')) : L('aucune collection de ce niveau dans le catalogue', 'no collection at this level in the catalogue')) + '</p></div></li>';
    }).join('') + '</ol><p class="ms-intro">' + L('≈ Rangement d\'après le suffixe du nom de chaque collection (edr, rdr, ddr, gdr…) : il peut se tromper pour quelques produits propres à une équipe.', '≈ Sorted from the suffix of each collection name (edr, rdr, ddr, gdr…): it may be wrong for a few team-specific products.') + '</p></div>';
  return s + mk.list(M.checked) + '</div>';
}

/* ---------- trajectoire et orbite ---------- */
var RADIUS = { 'Mars':3389.5, 'Lune':1737.4, 'Mercure':2439.7, 'Saturne':58232 };   /* rayons moyens, km (fiches planétaires de la NSSDCA) */
var BCOL = { 'Mars':'#E07A4F', 'Lune':'#B8B8B8', 'Mercure':'#B9B2A8', 'Saturne':'#E6D08A' };
var MON = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function date(s){ var p = s.split('-'); return en() ? new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }) : (+p[2] === 1 ? '1er' : +p[2]) + ' ' + MON[+p[1]] + ' ' + p[0]; }
function orbitPlot(m){
  var so = (window.DATA_FILES || {}).solar, o = so && (so.orbits || []).filter(function(x){ return x.id === m.id; })[0];
  if (!o || !o.samples.length) return '';
  var today = new Date().toISOString().slice(0, 10), smp = o.samples.filter(function(x){ return x.t0 <= today; }).pop() || o.samples[0];
  var xy = smp.xy, R = RADIUS[o.body] || 1000, mx = R;
  for (var i = 0; i < xy.length; i += 2) mx = Math.max(mx, Math.abs(xy[i]), Math.abs(xy[i + 1]));
  var W = 420, c = W / 2, k = (W / 2 - 16) / mx, d = '', dh = '', prev = null;
  /* vue de dessus : un point sous l'écliptique (z < 0) qui se projette sur le disque est caché par le corps (tirets pâles) */
  for (i = 0; i < xy.length; i += 2){ var hid = !!(smp.z && smp.z[i / 2] < 0 && Math.hypot(xy[i], xy[i + 1]) < R), pt = (c + xy[i] * k).toFixed(1) + ' ' + (c - xy[i + 1] * k).toFixed(1);
    if (prev === null){ if (hid) dh += 'M' + pt; else d += 'M' + pt; }
    else if (hid) dh += (prev.h ? '' : 'M' + prev.p) + 'L' + pt;
    else d += (prev.h ? 'M' + prev.p : '') + 'L' + pt;
    prev = { h:hid, p:pt }; }
  var mins = smp.step_min * (xy.length / 2 - 1), dur = mins >= 2880 ? num(mins / 1440, 0) + ' ' + L('jours', 'days') : mins >= 120 ? num(mins / 60, 1) + ' h' : mins + ' min';
  var mk = Marks(m);
  return '<figure class="traj"><svg viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="' + esc(L('Orbite réelle de ', 'Real orbit of ') + m.short + L(' autour de ', ' around ') + OBS_T(o.body)) + '">' +
    '<circle cx="' + c + '" cy="' + c + '" r="' + Math.max(2, R * k).toFixed(1) + '" fill="' + (BCOL[o.body] || '#999') + '" fill-opacity="0.85"/>' +
    '<path d="' + d + '" class="orb-p"/>' + (dh ? '<path d="' + dh + '" class="orb-p" stroke-dasharray="3 4" opacity="0.45"/>' : '') + '<circle cx="' + (c + xy[0] * k).toFixed(1) + '" cy="' + (c - xy[1] * k).toFixed(1) + '" r="3.5" class="pt-s"/></svg><figcaption>' +
    L('Orbite autour de ', 'Orbit around ') + esc(OBS_T(o.body)) + L(' à partir du ', ' from ') + esc(date(smp.t0)) + ', ' + L('sur ', 'over ') + dur + ' (' + (xy.length / 2) + ' ' + L('positions', 'positions') + '), ' +
    L('vue du pôle nord de l\'écliptique, centrée sur ', 'seen from the north ecliptic pole, centred on ') + esc(OBS_T(o.body)) + L('. Le point marque le début ; en tirets, la partie cachée derrière le corps. Une orbite polaire vue de dessus paraît aplatie : c\'est la projection, pas une erreur. Source : JPL Horizons, objet ', '. The dot marks the start; dashed, the part hidden behind the body. A polar orbit seen from above looks flattened: that is the projection, not an error. Source: JPL Horizons, object ') +
    esc(m.horizons) + mk.mark('hz') + L(', téléchargé le ', ', downloaded on ') + esc(so.fetched) + '. ' + L('Rayon du corps : ', 'Body radius: ') + big(Math.round(R)) + ' km (NSSDCA).</figcaption></figure>';
}
function orbitSec(m, X){
  var mk = Marks(m), s = '<div class="inst-head"><div class="inst-h"><h2 class="inst-name">' + L('Trajectoire et orbite', 'Trajectory and orbit') + '</h2><div class="inst-full">' + esc(m.name) + '</div></div><p class="inst-sum">' +
    L('Positions réelles calculées par le JPL (Horizons) : d\'abord le voyage depuis la Terre, puis l\'orbite autour du corps étudié.', 'Real positions computed by JPL (Horizons): first the journey from Earth, then the orbit around the body studied.') + '</p></div><div class="inst-cols">';
  s += '<div class="isec"><h3>' + L('Croisière', 'Cruise') + '</h3>' + X.traj(m) + '</div>';
  var op = orbitPlot(m), sec = (m.sections || []).filter(function(x){ return /^Orbite/.test(x.title); })[0];
  s += '<div class="isec"><h3>' + L('Autour de ', 'Around ') + esc(OBS_T(m.targets[0])) + '</h3>' + (op || '<p class="note">' + (m.horizons ? L('Orbite pas encore téléchargée.', 'Orbit not downloaded yet.') : L('JPL Horizons ne publie pas l\'orbite de cette sonde : pas de tracé réel possible.', 'JPL Horizons does not publish this spacecraft\'s orbit: no real plot possible.')) + '</p>') +
    (sec ? table(sec.rows.map(function(r){ return [OBS_T(r[0]), OBS_T(r[1]), r[2]]; }), mk) : '') + '</div>';
  return s + mk.list() + '</div>';
}

/* ---------- un instrument ---------- */
function stacCode(c){
  return 'curl "' + STAC_API + '/search?collections=' + c + '&limit=1"\n\n# Python\nfrom pystac_client import Client\ncat = Client.open("' + STAC_API + '")\nitems = cat.search(collections=["' + c + '"], max_items=10).item_collection()\nfor it in items:\n    print(it.id, it.datetime, list(it.assets))';
}
/* pourquoi un instrument n'a pas encore d'illustration (manque signalé, règle 2) */
function noData(m, it){
  var cs = cols(m, it);
  if (it.type === 'part') return L('Pas encore d\'illustration : cet instrument mesure des particules ou des champs, et ses produits sont des séries de mesures sans aperçu publié par l\'archive.', 'No illustration yet: this instrument measures particles or fields, and its products are measurement series with no preview published by the archive.');
  if (it.type === 'radio') return L('Pas encore d\'illustration : la radioscience produit des suivis de fréquence et des modèles de gravité, sans aperçu publié par l\'archive.', 'No illustration yet: radio science produces frequency tracking and gravity models, with no preview published by the archive.');
  if (cs.length) return L('Pas encore d\'illustration : les produits de cet instrument dans STAC-PLANET sont des tables ou des fichiers binaires, sans aperçu publié par l\'archive.', 'No illustration yet: this instrument\'s products in STAC-PLANET are tables or binary files, with no preview published by the archive.');
  return L('Pas encore d\'illustration : cet instrument n\'a pas de collection dans STAC-PLANET, et aucune image publique sourcée n\'a été retenue.', 'No illustration yet: this instrument has no collection in STAC-PLANET, and no sourced public image has been selected.');
}
function detail(m, it, X){
  var mk = Marks(m), s = '', cs = cols(m, it);
  s += '<div class="inst-head"><div class="inst-h"><h2 class="inst-name">' + esc(it.name) + '</h2><div class="inst-full">' + esc(it.full) + '</div><span class="kind">' + esc(kind(it)) + '</span></div><div>' +
    '<p class="inst-use"><b>' + L('À quoi ça sert', 'What it is for') + '</b>' + esc(it.use) + '</p><p class="inst-sum">' + esc(OBS_NUM(it.summary)) + '</p>';
  if (it.bands && it.bands.length) s += '<div class="inst-range">' + it.bands.map(function(b){ return '<span class="rng" style="--c:' + color(it) + '"><b>' + esc(b.l) + '</b> ' + span(b.lo, b.hi) + '</span>'; }).join('') + '</div>';
  s += '</div></div><div class="inst-cols">';
  s += '<div class="isec"><h3>' + L('Caractéristiques', 'Characteristics') + '</h3>' + table(it.specs, mk) + '</div>';
  if (it.bands && it.bands.length) s += '<div class="isec"><h3>' + L('Place dans le spectre', 'Place in the spectrum') + '</h3>' + coverage(m, it.id) + '<div class="cap">' + L('Plages reprises des caractéristiques ci-dessus.', 'Ranges taken from the characteristics above.') + '</div></div>';
  s += Optics.section(m, it, mk, table);
  if (realInst(m) === it) s += '<div class="isec wide"><h3>' + L('Une donnée réelle', 'Real data') + '</h3>' + X.real(m) + '</div>';
  var ik = 'i-' + m.id + '-' + it.id, figs = [];
  if ((window.DATA_FILES || {})[ik] && realInst(m) !== it) figs.push(X.real(m, { key:ik, altRaw:L('Aperçu d\'un produit ', 'Preview of a product of ') + it.name }));
  if ((window.DATA_FILES || {})['d-' + ik.slice(2)]) figs.push(X.real(m, { key:'d-' + ik.slice(2), altRaw:L('Tracé des données de ', 'Plot of data from ') + it.name }));
  if (it.real) figs.push(X.real(m, it.real));
  if ((window.DATA_FILES || {})['p-' + ik.slice(2)]) figs.push(X.real(m, { key:'p-' + ik.slice(2), altRaw:L('Image publiée par la NASA à partir des données de ', 'Image released by NASA from data of ') + it.name }));
  if (figs.length) s += '<div class="isec wide"><h3>' + L('Une donnée réelle', 'Real data') + '</h3>' + figs.join('') + '</div>';
  else if (realInst(m) !== it) s += '<div class="isec wide"><h3>' + L('Une donnée réelle', 'Real data') + '</h3><p class="note">' + esc(noData(m, it)) + '</p></div>';
  s += '<div class="isec wide"><h3>' + L('Produits de données', 'Data products') + '</h3>';
  if (cs.length){
    s += '<div class="tablewrap"><table class="ctable"><thead><tr><th scope="col">' + L('Collection STAC-PLANET', 'STAC-PLANET collection') + '</th><th scope="col">' + L('Niveau ≈', 'Level ≈') + '</th><th scope="col">' + L('Type', 'Type') + '</th><th scope="col">' + L('Produits', 'Products') + '</th><th scope="col">' + L('Période', 'Period') + '</th></tr></thead><tbody>' +
      cs.slice().sort(function(a, b){ return b[3] - a[3]; }).map(function(c){ var lv = LVN[level(suffix(it, c[0]))], p = c[4] ? c[4].split('/') : null;
        return '<tr><td><code>' + esc(c[0]) + '</code></td><td>' + esc(lv[0]) + '</td><td>' + esc(OBS_T(c[2] || '')) + '</td><td class="n">' + big(c[3]) + '</td><td>' + (p ? esc(p[0].slice(0, 4) + '–' + p[1].slice(0, 4)) : '—') + '</td></tr>'; }).join('') +
      '</tbody></table></div><div class="cap">' + L('Relevé du catalogue STAC-PLANET le 23 novembre 2026', 'STAC-PLANET catalogue surveyed on 23 November 2026') + mk.mark('stac') + L('. Le niveau est déduit du suffixe du nom (≈).', '. The level is inferred from the name suffix (≈).') + '</div>';
  } else s += '<p class="note">' + L('Aucune collection de cet instrument dans STAC-PLANET au 23 novembre 2026 : ses données sont à chercher dans les archives ci-dessous.', 'No collection for this instrument in STAC-PLANET as of 23 November 2026: look for its data in the archives below.') + '</p>';
  s += '</div>';
  if (cs.length){ var top = cs.slice().sort(function(a, b){ return b[3] - a[3]; })[0][0];
    s += '<div class="isec wide"><h3>' + L('Accéder aux données', 'Accessing the data') + '</h3><div class="ex-head"><span class="ex-title">' + L('Interroger STAC-PLANET (collection la plus fournie)', 'Query STAC-PLANET (largest collection)') + '</span></div>' + code(stacCode(top)) + '</div>'; }
  var links = INST_DATA[m.id].archives.map(function(a){ return { l:a.label, u:a.url }; }).concat(it.docs || []);
  s += mk.list(INST_DATA[m.id].checked || (MISSION[m.id] || {}).checked);
  s += '<div class="isec wide"><h3>' + L('Archive et documentation', 'Archive and documentation') + '</h3><div class="lnks">' + links.map(function(l){ return '<a class="lnk" href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.l) + '<em>' + esc(host(l.u)) + '</em></a>'; }).join('') + '</div></div>';
  return s + '</div>';
}

function html(m, sec, X){
  copyStore = [];
  var d = INST_DATA[m.id]; if (!d) return '';
  var it = sec && get(m, sec); if (sec && !it && sec !== 'mission' && sec !== 'orbite') sec = '';
  var nav = navItem(m, '', sec || '', L('Vue d\'ensemble', 'Overview'), L('Spectre, instruments, archives', 'Spectrum, instruments, archives')) +
    (MISSION[m.id] ? navItem(m, 'mission', sec, L('Mission et traitements', 'Mission and processing'), L('Déroulé, exploitation, chaîne de traitement', 'Timeline, operations, processing chain')) : '') +
    navItem(m, 'orbite', sec, L('Trajectoire et orbite', 'Trajectory and orbit'), L('Croisière réelle, orbite autour du corps', 'Real cruise, orbit around the body')) +
    d.instruments.map(function(x){ return navItem(m, x.id, sec, x.name, kind(x), color(x)); }).join('');
  var main = it ? detail(m, it, X) : sec === 'mission' ? missionSec(m) : sec === 'orbite' ? orbitSec(m, X) : overview(m, X);
  return '<div class="xp inst-body"><nav class="inst-nav" aria-label="' + esc(L('Sous-pages de ', 'Sub-pages of ') + m.short) + '">' + nav + '</nav><div class="inst-main" id="xp-main">' + main + '</div></div>';
}
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('[data-copy],[data-ref]'); if (!b) return;
  if (b.hasAttribute('data-ref')){ e.preventDefault(); var t = document.getElementById('ref-' + b.getAttribute('data-ref')); if (t){ t.scrollIntoView({ block:'center' }); t.classList.add('hl'); setTimeout(function(){ t.classList.remove('hl'); }, 1500); } return; }
  var txt = copyStore[+b.getAttribute('data-copy')];
  try { navigator.clipboard.writeText(txt).then(function(){ b.textContent = L('Copié', 'Copied'); setTimeout(function(){ b.textContent = L('Copier', 'Copy'); }, 1500); }); } catch(x){}
});
return { html:html };
})();
