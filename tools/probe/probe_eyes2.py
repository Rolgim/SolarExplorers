#!/usr/bin/env python3
"""Sonde 2 : maquettes d'Eyes on the Solar System. Lit app.js de l'application, trouve la racine des ressources statiques
($STATIC_ASSETS_URL) et les chemins des maquettes des sondes visées, télécharge gltf, buffers et textures,
et relève le champ asset (generator, copyright) de chaque fichier. Sortie : tools/probe/_out/eyes2/."""
import os, re, json
from urllib.parse import urljoin
import requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "eyes2"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
REP = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); REP.append(s)
base = "https://eyes.nasa.gov/apps/solar-system/"
html = S.get(base, timeout=60).text
srcs = [urljoin(base, m) for m in re.findall(r'<script[^>]+src="([^"]+)"', html)]
log("scripts", srcs)
app = ""
for u in srcs:
    t = S.get(u, timeout=120).text
    if "STATIC_ASSETS_URL" in t: app += t; log("contient STATIC_ASSETS_URL :", u, len(t))
for m in re.finditer(r'.{0,200}STATIC_ASSETS_URL["\']?\s*[,:=].{0,200}', app): log("déf :", m.group(0)[:400])
for m in re.finditer(r'https://[a-z0-9.\-]+/[^"\'\s]*assets[^"\'\s]*', app): log("url :", m.group(0)[:200])
for m in re.finditer(r'.{0,300}viking_1_orbiter.{0,600}', app): log("viking :", m.group(0)[:900])
paths = sorted(set(re.findall(r'\$STATIC_ASSETS_URL/models/(sc_(?:danuri|grail|lunar_prospector|viking|kaguya|selene|chandrayaan)[^"\']*\.(?:gltf|glb))', app)))
log("chemins :", paths)
roots = ["https://eyes.nasa.gov/assets/static/", "https://eyes.nasa.gov/apps/solar-system/assets/static/", "https://eyes.nasa.gov/assets/", "https://eyes.nasa.gov/server/spice/static/"]
roots = sorted(set(re.findall(r'https://[a-z0-9.\-]+/[a-z0-9_/\-]*static[a-z0-9_/\-]*', app))) + roots
log("racines essayées :", roots)
for p in paths:
    for r0 in roots:
        u = r0.rstrip("/") + "/models/" + p
        try: r = S.get(u, timeout=120)
        except Exception as e: continue
        if not r.ok or len(r.content) < 200: continue
        log("TROUVÉ", u, len(r.content)); d = os.path.join(OUT, os.path.dirname(p)); os.makedirs(d, exist_ok=True)
        open(os.path.join(OUT, p), "wb").write(r.content)
        try:
            g = r.json(); log("  asset :", json.dumps(g.get("asset"), ensure_ascii=False))
            for b in g.get("buffers", []) + g.get("images", []):
                if b.get("uri") and not b["uri"].startswith("data:"):
                    rb = S.get(urljoin(u, b["uri"]), timeout=120)
                    if rb.ok:
                        q = os.path.join(d, b["uri"]); os.makedirs(os.path.dirname(q), exist_ok=True); open(q, "wb").write(rb.content); log("  ", b["uri"], len(rb.content))
                    else: log("  manque", b["uri"], rb.status_code)
        except Exception as e: log("  ?", repr(e)[:200])
        break
    else: log("introuvable :", p)
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
