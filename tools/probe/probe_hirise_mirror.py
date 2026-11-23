#!/usr/bin/env python3
"""HiRISE par le miroir du PDS Imaging Node : l'URL d'un asset de STAC-PLANET (hirise.lpl.arizona.edu/PDS/EXTRAS/…)
est réécrite en planetarydata.jpl.nasa.gov/img/data/mro/hirise/EXTRAS/…. Sortie : _out/hirise_mirror/."""
import json, os, requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "hirise_mirror"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
L = []
def log(s): print(s, flush=True); L.append(s)
j = S.post("https://stac.stacplanet.pdssp.eu/search", json={"collections": ["ode-mars-mro-hirise-rdrv11"], "limit": 4,
           "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=120).json()
json.dump(j.get("features", []), open(os.path.join(OUT, "items.json"), "w"), indent=1)
M = "https://planetarydata.jpl.nasa.gov/img/data/mro/hirise/"
for f in j.get("features", []):
    for k, a in f["assets"].items():
        if not k.upper().endswith((".BROWSE.JPG", ".ABROWSE.JPG")) or "NOMAP" in k.upper(): continue
        u = a["href"].replace("https://hirise.lpl.arizona.edu/PDS/", M)
        for v in (u, u.replace("/EXTRAS/", "/EXTRAS.20221214/")):
            try:
                r = S.get(v, timeout=120); log(f"- {f['id']} {k} : {r.status_code} {r.headers.get('content-type')} {len(r.content)} o ← {v}")
                if r.ok and r.headers.get("content-type", "").startswith("image/"):
                    open(os.path.join(OUT, os.path.basename(v)), "wb").write(r.content); break
            except Exception as e: log(f"- {v} : {e!r}"[:300])
# la racine du miroir RDR (pour la recette)
for u in (M + "RDR/", M + "EXTRAS/RDR/ESP/"):
    try: r = S.get(u, timeout=60); log(f"- {u} : {r.status_code} {len(r.content)} o")
    except Exception as e: log(f"- {u} : {e!r}"[:200])
txt = "# HiRISE par le miroir du PDS Imaging Node\n\n" + "\n".join(L) + "\n"
open(os.path.join(OUT, "probe.md"), "w").write(txt)
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write(txt)
