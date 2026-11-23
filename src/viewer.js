/* =================================================================
   VUE 3D — maquette d'une sonde : rotation, zoom, pièces cliquables, vue éclatée.
   Version allégée de la vue d'Observatories v1.0 (src/app.js là-bas) : même lecture des maquettes quantifiées
   (positions converties en flottants pour le lancer de rayon), mêmes règles de surlignage.
   Viewer.open(stageEl, mission, { onPick(key|null), onState(text) }) ; Viewer.select(key) ; Viewer.explode(0..1).
================================================================= */
var Viewer = (function(){
'use strict';
var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var renderer = null, scene, camera, key, fill, hemi, loader, M = null, host = null, opts = {}, raf = 0, sel = null, hov = null, spin = !REDUCED, ex = 0;
var C = { az:0.5, el:0.25, dist:20 };
var models = {}, globe = null, globeFor = null;
/* corps survolé : grande sphère texturée posée sous la sonde, du côté de ses instruments (schéma de principe : ni la taille ni la distance ne sont à l'échelle) */
function setBody(t, R){
  if (globe){ scene.remove(globe); globe = null; }
  var meta = t.body && (window.DATA_FILES || {})['tex-' + t.body.tex];
  if (!meta) return false;
  var rb = R * 30, n = new THREE.Vector3().fromArray(t.body.nadir).normalize();
  var tex = new THREE.TextureLoader().load('data/tex-' + t.body.tex + '.jpg'); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  globe = new THREE.Mesh(new THREE.SphereGeometry(rb, 96, 48), new THREE.MeshStandardMaterial({ map:tex, roughness:1, metalness:0 }));
  globe.position.copy(n).multiplyScalar(rb + R * 2.4);
  globe.lookAt(0, 0, 0); globe.rotateX(Math.PI / 2);   /* le pôle de la texture vers l'horizon : on survole une région, pas un pôle */
  scene.add(globe); globeFor = t.id;
  return true;
}

function ok(){ return !!(window.THREE && THREE.GLTFLoader); }
function init(){
  if (renderer || !ok()) return !!renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias:true }); } catch(e){ renderer = null; return false; }
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); renderer.outputEncoding = THREE.sRGBEncoding;
  scene = new THREE.Scene(); camera = new THREE.PerspectiveCamera(35, 1, 0.05, 2000);
  key = new THREE.DirectionalLight(0xffffff, 2.6); fill = new THREE.DirectionalLight(0x8fb0e8, 0.45); hemi = new THREE.HemisphereLight(0xffffff, 0x223344, 0.5);
  scene.add(key, fill, hemi);
  loader = new THREE.GLTFLoader();
  var cv = renderer.domElement, drag = null;
  cv.setAttribute('aria-hidden', 'true');
  cv.addEventListener('pointerdown', function(e){ drag = { x:e.clientX, y:e.clientY, moved:false }; cv.setPointerCapture(e.pointerId); spin = false; });
  cv.addEventListener('pointermove', function(e){
    if (drag){ var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
      C.az -= dx * 0.008; C.el = Math.max(globe ? -0.3 : -1.4, Math.min(1.4, C.el + dy * 0.006)); drag.x = e.clientX; drag.y = e.clientY; cv.classList.add('dragging'); return; }
    var k = pick(e); if (k !== hov){ hov = k; highlight(); cv.classList.toggle('over-part', !!k); }
  });
  cv.addEventListener('pointerup', function(e){ cv.classList.remove('dragging'); if (drag && !drag.moved){ var k = pick(e); select(sel === k ? null : k); if (opts.onPick) opts.onPick(sel); } drag = null; });
  cv.addEventListener('pointerleave', function(){ if (hov){ hov = null; highlight(); } });
  cv.addEventListener('wheel', function(e){ e.preventDefault(); if (!M) return; C.dist = Math.max(M.radius * 1.1, Math.min(M.radius * 8, C.dist * (1 + Math.sign(e.deltaY) * 0.1))); }, { passive:false });
  return true;
}
function pick(e){
  if (!M) return null;
  var r = renderer.domElement.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  var rc = new THREE.Raycaster(); rc.setFromCamera(v, camera);
  var hit = rc.intersectObjects(M.meshes, false)[0];
  return hit ? hit.object.userData.part || null : null;
}
function prepare(t, gltf){
  var inner = gltf.scene, root = new THREE.Group();
  /* three r128 ne dénormalise pas les attributs entiers côté CPU (lancer de rayon, boîtes) : positions converties en flottants */
  inner.traverse(function(o){
    if (!o.isMesh) return; var g = o.geometry, pa = g.attributes.position;
    if (!pa || !(pa.normalized || pa.isInterleavedBufferAttribute)) return;
    var arr = pa.array || pa.data.array, nm = pa.normalized, den = arr instanceof Int16Array ? 32767 : arr instanceof Uint16Array ? 65535 : arr instanceof Int8Array ? 127 : arr instanceof Uint8Array ? 255 : 1;
    var out = new Float32Array(pa.count * 3);
    for (var i = 0; i < pa.count; i++){ var x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (nm){ x = Math.max(x/den, -1); y = Math.max(y/den, -1); z = Math.max(z/den, -1); } out[i*3] = x; out[i*3+1] = y; out[i*3+2] = z; }
    g.setAttribute('position', new THREE.BufferAttribute(out, 3)); g.boundingBox = null; g.boundingSphere = null; g.computeBoundingSphere();
  });
  inner.updateMatrixWorld(true);
  var box = new THREE.Box3().setFromObject(inner), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  var s = t.axis ? t.size / size[t.axis] : 1;
  inner.scale.setScalar(s); inner.position.copy(ctr).multiplyScalar(-s); root.add(inner); root.updateMatrixWorld(true);
  var R = { root:root, radius:size.length() * s / 2, meshes:[], parts:{} };
  t.parts.forEach(function(p){ R.parts[p.key] = { meshes:[], box:new THREE.Box3() }; });
  inner.traverse(function(o){
    if (!o.isMesh) return;
    var k = null; for (var p = o; p && p !== root && !k; p = p.parent) if (R.parts[(p.name || '').replace(/_\d+$/, '')]) k = (p.name || '').replace(/_\d+$/, '');
    o.material = o.material.clone(); o.material.side = THREE.DoubleSide; o.userData.part = k; R.meshes.push(o);
    if (k){ R.parts[k].meshes.push(o); R.parts[k].box.expandByObject(o); }
  });
  /* vue éclatée : chaque pièce s'écarte du centre le long de la direction de son propre centre (schéma de principe) */
  for (var k in R.parts){ var P = R.parts[k]; if (P.box.isEmpty()) continue;
    var dir = P.box.getCenter(new THREE.Vector3()); if (dir.length() < R.radius * 0.15) dir.set(0, 0, 0); else dir.normalize().multiplyScalar(R.radius * 0.5);
    P.meshes.forEach(function(o){ o.userData.base = o.position.clone(); o.userData.ex = dir.clone().divideScalar(s); }); }   /* nœuds de la maquette sans rotation propre (seg_lib.js) */
  return R;
}
function highlight(){
  if (!M) return;
  M.meshes.forEach(function(o){ var m = o.material, k = o.userData.part; if (!m.emissive) return;
    if (m.userData.c0 === undefined){ m.userData.c0 = m.color.clone(); m.userData.e0 = m.emissive.clone(); }
    m.emissive.copy(m.userData.e0); m.color.copy(m.userData.c0);
    if (k && k === sel){ m.emissive.setHex(0x3D7BFF); m.emissiveIntensity = 0.35; }
    else if (k && k === hov){ m.emissive.setHex(0xffffff); m.emissiveIntensity = 0.1; }
    else if (sel) m.color.multiplyScalar(0.5); });
}
function resize(){ if (!host || !renderer) return; var w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); }
function frame(){
  raf = requestAnimationFrame(frame);
  if (!M || !host || !host.isConnected) return;
  if (spin) C.az += 0.0025;
  var ce = Math.cos(C.el); camera.position.set(Math.sin(C.az) * ce * C.dist, Math.sin(C.el) * C.dist, Math.cos(C.az) * ce * C.dist); camera.lookAt(0, 0, 0);
  M.meshes.forEach(function(o){ if (o.userData.base) o.position.copy(o.userData.base).addScaledVector(o.userData.ex, ex); });
  renderer.render(scene, camera);
}
function open(el, t, o){
  opts = o || {}; host = el;
  if (!init()){ if (opts.onState) opts.onState('nogl'); return; }
  el.insertBefore(renderer.domElement, el.firstChild); resize();
  if (!raf) { window.addEventListener('resize', resize); frame(); }
  sel = null; hov = null; ex = 0;
  if (M) scene.remove(M.root);
  var show = function(R){ M = R; scene.add(M.root); C.az = t.view.az; C.el = t.view.el; C.dist = M.radius * 2 * t.view.dist;
    key.position.fromArray(t.sun).multiplyScalar(M.radius * 4); fill.position.set(-0.6, -0.2, -0.5); highlight();
    var hasBody = setBody(t, M.radius); camera.far = M.radius * 200; camera.updateProjectionMatrix();
    if (opts.onState) opts.onState('ready', hasBody); };
  if (models[t.id]) return show(models[t.id]);
  if (opts.onState) opts.onState('loading');
  var url = t.file;
  fetch(url).then(function(r){ if (!r.ok) throw new Error(r.status); return /\.txt$/.test(url) ? r.text().then(function(b){ var s = atob(b.trim()), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a.buffer; }) : r.arrayBuffer(); })
    .then(function(buf){ loader.parse(buf, '', function(g){ show(models[t.id] = prepare(t, g)); }, function(e){ if (opts.onState) opts.onState('error'); }); })
    .catch(function(){ if (opts.onState) opts.onState('error'); });
}
function select(k){ sel = k || null; highlight(); }
return { open:open, select:select, explode:function(v){ ex = v; }, spin:function(v){ spin = v && !REDUCED; }, reset:function(t){ if (M){ C.az = t.view.az; C.el = t.view.el; C.dist = M.radius * 2 * t.view.dist; } }, available:ok };
})();
