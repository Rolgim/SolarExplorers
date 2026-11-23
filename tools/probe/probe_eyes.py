#!/usr/bin/env python3
"""Sonde : maquettes de l'application Eyes on the Solar System (NASA/JPL) pour les sondes sans maquette libre
(Kaguya, Lunar Prospector, Chandrayaan-1, GRAIL, Danuri, orbiteur de Viking), et conditions d'utilisation affichées.
1. pages et scripts de l'application : noms de maquettes (sc_*), liens « terms / copyright / license » ;
2. essai des URL de maquettes candidates (assets/dynamic/models/<nom>/<nom>.gltf ou .glb) ;
3. moteur de recherche de science.nasa.gov/3d-resources pour les six sondes.
Sortie : tools/probe/_out/eyes/ (branche probe-out)."""
import os, re, json
from urllib.parse import urljoin, quote
import requests

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "eyes"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
REP = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); REP.append(s)
def get(u, **kw):
    try: return S.get(u, timeout=90, **kw)
    except Exception as e: log("  ÉCHEC", u, repr(e)[:200]); return None

WANT = r"prospector|grail|ebb|flow|viking|kaguya|selene|chandrayaan|danuri|kplo"
log("## 1. Application Eyes")
seen, scripts, names = set(), [], set()
for page in ("https://eyes.nasa.gov/apps/solar-system/", "https://eyes.nasa.gov/", "https://eyes.nasa.gov/apps/solar-system/#/home"):
    r = get(page)
    if not r: continue
    log(f"{page} -> {r.status_code} {r.url} {len(r.text)} o")
    open(os.path.join(OUT, re.sub(r'\W+', '_', page)[:80] + ".html"), "w").write(r.text)
    for m in re.finditer(r'(?i)[^<>]{0,120}(terms|copyright|license|licence|usage polic|image use)[^<>]{0,160}', r.text): log("  mention :", m.group(0).strip()[:280])
    for m in re.finditer(r'href="([^"]+)"', r.text):
        if re.search(r'(?i)terms|copyright|license|polic|privacy|image', m.group(1)): log("  lien :", urljoin(r.url, m.group(1)))
    for m in re.finditer(r'<script[^>]+src="([^"]+)"', r.text):
        u = urljoin(r.url, m.group(1))
        if u not in seen: seen.add(u); scripts.append(u)
log("scripts :", len(scripts))
for u in scripts[:40]:
    r = get(u)
    if not r or not r.ok: continue
    t = r.text
    for m in re.finditer(r'["\'/](sc_[a-z0-9_]+)', t): names.add(m.group(1))
    for m in re.finditer(r'(?i)["\']([^"\']{0,80}(?:' + WANT + r')[^"\']{0,80})["\']', t): log("  script", u.rsplit('/', 1)[-1], ":", m.group(1)[:200])
    for m in re.finditer(r'(?i)https?://[^"\'\s]+(?:assets|models)[^"\'\s]*', t): names.add("URL " + m.group(0)[:200])
    # scripts chargés par les scripts (morceaux webpack)
    for m in re.finditer(r'["\']([^"\']+\.js)["\']', t):
        v = urljoin(u, m.group(1))
        if v not in seen and "eyes.nasa.gov" in v and len(scripts) < 120: seen.add(v); scripts.append(v)
log("noms sc_* trouvés :", len([n for n in names if n.startswith("sc_")]))
for n in sorted(names):
    if re.search(WANT, n, re.I) or n.startswith("URL"): log("  ", n)
json.dump(sorted(names), open(os.path.join(OUT, "names.json"), "w"), indent=0)

log("\n## 2. URL candidates")
CAND = ["sc_lunar_prospector", "sc_grail_a", "sc_grail_b", "sc_grail", "sc_viking_1_orbiter", "sc_viking_orbiter", "sc_viking_1", "sc_kaguya", "sc_selene",
        "sc_chandrayaan_1", "sc_chandrayaan", "sc_danuri", "sc_kplo"]
CAND += sorted(n for n in names if n.startswith("sc_") and re.search(WANT, n, re.I))
for n in dict.fromkeys(CAND):
    for base in ("https://eyes.nasa.gov/assets/dynamic/models/", "https://eyes.nasa.gov/apps/solar-system/assets/dynamic/models/", "https://eyes.nasa.gov/assets/static/models/"):
        for ext in (".gltf", ".glb"):
            u = base + n + "/" + n + ext; r = get(u)
            if r is not None and r.ok and len(r.content) > 200:
                log(f"TROUVÉ {u} {len(r.content)} o {r.headers.get('content-type')}")
                d = os.path.join(OUT, n); os.makedirs(d, exist_ok=True); open(os.path.join(d, n + ext), "wb").write(r.content)
                if ext == ".gltf":
                    try:
                        g = r.json(); log("  asset :", json.dumps(g.get("asset", {}), ensure_ascii=False)[:300])
                        for b in g.get("buffers", []) + g.get("images", []):
                            if b.get("uri") and not b["uri"].startswith("data:"):
                                rb = get(urljoin(u, b["uri"]))
                                if rb is not None and rb.ok: open(os.path.join(d, os.path.basename(b["uri"])), "wb").write(rb.content); log("  ", b["uri"], len(rb.content))
                    except Exception as e: log("  json ?", repr(e)[:100])
                elif r.content[:4] == b"glTF":
                    jl = int.from_bytes(r.content[12:16], "little"); g = json.loads(r.content[20:20 + jl]); log("  asset :", json.dumps(g.get("asset", {}), ensure_ascii=False)[:300])

log("\n## 3. science.nasa.gov/3d-resources")
for q in ("Lunar Prospector", "GRAIL", "Viking Orbiter", "Kaguya", "Chandrayaan", "Danuri"):
    for u in ("https://science.nasa.gov/?s=" + quote(q) + "&post_type=3d-resource", "https://science.nasa.gov/3d-resources/?search=" + quote(q)):
        r = get(u)
        if not r: continue
        hits = sorted(set(re.findall(r'https://science\.nasa\.gov/3d-resources/[a-z0-9-]+/?', r.text)))
        log(f"{q} : {u} -> {r.status_code}, {len(hits)} liens 3d-resources")
        for h in hits:
            if re.search(WANT.replace("ebb|flow|", ""), h, re.I): log("   ", h)
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
