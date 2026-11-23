#!/usr/bin/env python3
"""Donnée réelle MRO hors du serveur HiRISE (qui refuse GitHub Actions) : aperçu CTX servi par le PDS Imaging Node
(planetarydata.jpl.nasa.gov), et recherche d'un miroir HiRISE au même endroit. Sortie : _out/mro_data/."""
import json, os, requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "mro_data"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
API = "https://stac.stacplanet.pdssp.eu"; L = []
def log(s): print(s, flush=True); L.append(s)
# CTX : trois items récents avec empreinte, aperçu « overview »
j = S.post(API + "/search", json={"collections": ["ode-mars-mro-ctx-edr"], "limit": 3, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=120).json()
json.dump(j.get("features", []), open(os.path.join(OUT, "ctx_items.json"), "w"), indent=1)
for f in j.get("features", []):
    ov = [a for a in f["assets"].values() if "overview" in (a.get("roles") or [])]
    if not ov: continue
    try:
        r = S.get(ov[0]["href"], timeout=180)
        log(f"- CTX {f['id']} {f['properties'].get('datetime')} : {r.status_code} {r.headers.get('content-type')} {len(r.content)} o ← {ov[0]['href']}")
        if r.ok: open(os.path.join(OUT, f["id"] + ".jpeg"), "wb").write(r.content); break
    except Exception as e: log(f"- CTX {f['id']} : {e!r}"[:300])
# HiRISE : miroir éventuel au PDS Imaging Node
for u in ["https://planetarydata.jpl.nasa.gov/img/data/mro/hirise/", "https://planetarydata.jpl.nasa.gov/img/data/mro/", "https://pds-imaging.jpl.nasa.gov/data/mro/"]:
    try:
        r = S.get(u, timeout=60); log(f"- {u} : {r.status_code} {len(r.content)} o")
        open(os.path.join(OUT, "index_" + u.strip('/').split('/')[-1] + ".html"), "wb").write(r.content[:400000])
    except Exception as e: log(f"- {u} : {e!r}"[:300])
txt = "# Donnée réelle MRO\n\n" + "\n".join(L) + "\n"
open(os.path.join(OUT, "probe.md"), "w").write(txt)
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write(txt)
