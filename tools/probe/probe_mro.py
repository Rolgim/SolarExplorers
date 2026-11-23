#!/usr/bin/env python3
"""Sonde MRO (étape 4) : ce qu'il faut pour la première mission, sans rien écrire sur main.
1. Maquette : dossier « Mars Reconnaissance Orbiter » du dépôt nasa/NASA-3D-Resources (liste et téléchargement).
2. Trajectoire : JPL Horizons, identifiant de MRO (-74), nom et premier vecteur héliocentrique.
3. Donnée réelle : un item HiRISE RDR de STAC-PLANET (collection ode-mars-mro-hirise-rdrv11) et son aperçu BROWSE.
Sortie : tools/probe/_out/mro/ (poussé sur probe-out par le workflow « Sonde »)."""
import json, os, re, sys
from urllib.parse import quote
import requests

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "mro"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
GH = {"Accept": "application/vnd.github+json"}
if os.environ.get("GITHUB_TOKEN"): GH["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
REPORT = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); REPORT.append(s)

# ---------- 1. maquette NASA ----------
log("## Maquette (nasa/NASA-3D-Resources)")
try:
    tree = S.get("https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1", headers=GH, timeout=120).json()
    paths = [t["path"] for t in tree.get("tree", []) if t["type"] == "blob"]
    hits = [p for p in paths if re.search(r"reconnaissance|\bMRO\b", p, re.I)]
    log(f"- {len(paths)} fichiers dans le dépôt ; {len(hits)} pour MRO :")
    for p in hits: log("  - " + p)
    os.makedirs(os.path.join(OUT, "model"), exist_ok=True)
    for p in hits:
        if re.search(r"\.(glb|gltf|obj|mtl|3ds|fbx|blend|png|jpe?g|txt|pdf|zip)$", p, re.I):
            r = S.get("https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/" + quote(p), timeout=300)
            if r.ok and len(r.content) < 90_000_000:
                open(os.path.join(OUT, "model", os.path.basename(p)), "wb").write(r.content); log(f"  téléchargé {os.path.basename(p)} ({len(r.content)} o)")
            else: log(f"  non téléchargé {p} : {r.status_code} {len(r.content)} o")
except Exception as e:
    log("ÉCHEC maquette", repr(e)[:300])

# ---------- 2. Horizons ----------
log("\n## JPL Horizons")
try:
    q = {"format": "json", "COMMAND": "'-74'", "OBJ_DATA": "YES", "MAKE_EPHEM": "YES", "EPHEM_TYPE": "VECTORS", "CENTER": "'500@10'",
         "START_TIME": "'2005-08-13'", "STOP_TIME": "'2005-08-14'", "STEP_SIZE": "'1 d'", "VEC_TABLE": "'1'", "REF_PLANE": "ECLIPTIC", "OUT_UNITS": "AU-D"}
    j = S.get("https://ssd.jpl.nasa.gov/api/horizons.api", params=q, timeout=120).json()
    res = j.get("result", "")
    open(os.path.join(OUT, "horizons_-74.txt"), "w").write(res)
    head = "\n".join(res.splitlines()[:40])
    log("```\n" + head + "\n```")
    m = re.search(r"\$\$SOE(.*?)\$\$EOE", res, re.S); log("- premier vecteur : " + (m.group(1).strip()[:300] if m else "aucun"))
    # couverture : la dernière date disponible
    j2 = S.get("https://ssd.jpl.nasa.gov/api/horizons.api", params={"format": "json", "COMMAND": "'-74'", "MAKE_EPHEM": "NO", "OBJ_DATA": "YES"}, timeout=120).json()
    open(os.path.join(OUT, "horizons_-74_objdata.txt"), "w").write(j2.get("result", ""))
except Exception as e:
    log("ÉCHEC Horizons", repr(e)[:300])

# ---------- 3. HiRISE dans STAC-PLANET ----------
log("\n## HiRISE (STAC-PLANET)")
API = "https://stac.stacplanet.pdssp.eu"
try:
    body = {"collections": ["ode-mars-mro-hirise-rdrv11"], "limit": 5, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}
    r = S.post(API + "/search", json=body, timeout=120)
    if not r.ok: r = S.get(API + "/search", params={"collections": "ode-mars-mro-hirise-rdrv11", "limit": 5}, timeout=120)
    j = r.json(); feats = j.get("features", [])
    log(f"- /search : statut {r.status_code}, numberMatched={j.get('numberMatched')}, {len(feats)} items")
    json.dump(feats, open(os.path.join(OUT, "hirise_items.json"), "w"), indent=1)
    for f in feats[:5]:
        p = f.get("properties", {})
        log(f"- {f['id']} · {p.get('datetime')} · géométrie {(f.get('geometry') or {}).get('type')} · clés {sorted(p.keys())[:30]}")
    if feats:
        f = feats[0]
        for k, a in f.get("assets", {}).items():
            log(f"  - asset {k} : {a.get('type')} {a.get('roles')} {a.get('href')}")
        br = [a for k, a in f["assets"].items() if "thumbnail" in (a.get("roles") or []) and ".abrowse" not in k.lower()]
        br = br or [a for a in f["assets"].values() if (a.get("type") or "").startswith("image/jpeg")]
        if br:
            rr = S.get(br[0]["href"], timeout=300)
            ext = os.path.splitext(br[0]["href"])[1] or ".jpg"
            open(os.path.join(OUT, "hirise_browse" + ext), "wb").write(rr.content); log(f"- aperçu téléchargé : {rr.status_code}, {len(rr.content)} o, {br[0]['href']}")
except Exception as e:
    log("ÉCHEC HiRISE", repr(e)[:300])

txt = "# Sonde MRO\n\n" + "\n".join(REPORT) + "\n"
open(os.path.join(OUT, "probe.md"), "w").write(txt)
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write(txt)
