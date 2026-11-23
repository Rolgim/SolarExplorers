#!/usr/bin/env python3
"""Sonde de la deuxième vague (autres missions de STAC-PLANET), sans rien écrire sur main. Sans DL=1 : liste seulement les maquettes.
1. Maquettes : dépôt nasa/NASA-3D-Resources (LRO, Cassini, MESSENGER) et SCIFLEET de l'ESA (Mars Express).
2. Trajectoires : JPL Horizons, en-tête de chaque sonde (nom, couverture).
3. Données réelles : un item par collection candidate de STAC-PLANET et son plus petit aperçu image.
Sortie : tools/probe/_out/wave1/ (poussé sur probe-out par le workflow « Sonde »)."""
import json, os, re
from urllib.parse import quote
import requests

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "wave2"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
GH = {"Accept": "application/vnd.github+json"}
if os.environ.get("GITHUB_TOKEN"): GH["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
REPORT = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); REPORT.append(s)

MISSIONS = {
    "ody": {"nasa": r"odyssey", "scifleet": None, "hz": "-53", "stac": ["ode-mars-ody-themis-vgeo2"]},
    "mgs": {"nasa": r"global.?surveyor|\bMGS\b", "scifleet": None, "hz": "-94", "stac": ["ode-mars-mgs-moc-na-wa-wasdp"]},
    "tgo": {"nasa": None, "scifleet": r"trace.?gas|exomars|\btgo\b", "hz": "-143", "stac": ["ode-mars-em16tgo-cassis-calsc"]},
    "vex": {"nasa": None, "scifleet": r"venus.?express|\bvex\b", "hz": "-248", "stac": []},
    "mgn": {"nasa": r"magellan", "scifleet": None, "hz": "-18", "stac": []},
    "sln": {"nasa": r"kaguya|selene", "scifleet": None, "hz": "-131", "stac": []},
    "clem": {"nasa": r"clementine", "scifleet": None, "hz": "-40", "stac": []},
    "lp": {"nasa": r"lunar.?prospector", "scifleet": None, "hz": "-25", "stac": []},
    "ch1": {"nasa": r"chandrayaan", "scifleet": None, "hz": "-86", "stac": []},
    "grail": {"nasa": r"grail", "scifleet": None, "hz": "-177", "stac": []},
    "kplo": {"nasa": r"danuri|kplo|pathfinder.?lunar", "scifleet": None, "hz": "-155", "stac": []},
    "vo": {"nasa": r"viking", "scifleet": None, "hz": "-27", "stac": []},
    "rosetta": {"nasa": r"rosetta", "scifleet": r"rosetta", "hz": "-226", "stac": []},
}
MODEL_EXT = r"\.(glb|gltf|obj|mtl|3ds|fbx|blend|zip|txt|pdf)$"

# ---------- 1. maquettes ----------
log("## Maquettes NASA 3D Resources")
try:
    tree = S.get("https://api.github.com/repos/nasa/NASA-3D-Resources/git/trees/master?recursive=1", headers=GH, timeout=120).json()
    paths = [t["path"] for t in tree.get("tree", []) if t["type"] == "blob"]
    for mid, m in MISSIONS.items():
        if not m["nasa"]: continue
        hits = [p for p in paths if re.search(m["nasa"], p, re.I)]
        log(f"### {mid} : {len(hits)} fichiers")
        for p in hits: log("  - " + p)
        d = os.path.join(OUT, mid, "model"); os.makedirs(d, exist_ok=True)
        for p in hits:
            if not re.search(MODEL_EXT, p, re.I) or not os.environ.get("DL"): continue
            r = S.get("https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/" + quote(p), timeout=300)
            if r.ok and len(r.content) < 90_000_000:
                open(os.path.join(d, os.path.basename(p)), "wb").write(r.content); log(f"  téléchargé {os.path.basename(p)} ({len(r.content)} o)")
            else: log(f"  non téléchargé {p} : {r.status_code} {len(r.content)} o")
except Exception as e:
    log("ÉCHEC NASA", repr(e)[:300])

log("\n## Maquettes SCIFLEET (ESA)")
try:
    sat = S.get("https://scifleet.esa.int/data/satellites.json", timeout=120).json()
    def walk(x):
        if isinstance(x, dict):
            yield x
            for v in x.values(): yield from walk(v)
        elif isinstance(x, list):
            for v in x: yield from walk(v)
    for mid, m in MISSIONS.items():
        if not m["scifleet"]: continue
        for d in walk(sat):
            if not isinstance(d.get("downloads"), dict): continue
            label = " ".join(str(d.get(k, "")) for k in ("id", "fname", "name", "title"))
            if not re.search(m["scifleet"], label, re.I): continue
            log(f"### {mid} : {label} · {json.dumps({k: v for k, v in d.items() if k != 'downloads'}, ensure_ascii=False)[:400]}")
            log(f"  téléchargements : {d['downloads']}")
            dl = d["downloads"]; keys = [k for k in ("glb", "gltf", "obj", "textures") if dl.get(k)] or [k for k in ("cosmographia", "fbx") if dl.get(k)][:1]
            od = os.path.join(OUT, mid, "scifleet"); os.makedirs(od, exist_ok=True)
            for k in (keys if os.environ.get("DL") else []):
                r = S.get("https://scifleet.esa.int/downloads/" + str(d.get("id")) + "/" + dl[k], timeout=300)
                if r.ok: open(os.path.join(od, dl[k].split("/")[-1]), "wb").write(r.content); log(f"  téléchargé {k} {dl[k]} ({len(r.content)} o)")
                else: log(f"  échec {k} {r.status_code}")
except Exception as e:
    log("ÉCHEC SCIFLEET", repr(e)[:300])

# ---------- 2. Horizons ----------
log("\n## JPL Horizons")
for mid, m in MISSIONS.items():
    try:
        j = S.get("https://ssd.jpl.nasa.gov/api/horizons.api", params={"format": "json", "COMMAND": f"'{m['hz']}'", "MAKE_EPHEM": "NO", "OBJ_DATA": "YES"}, timeout=120).json()
        res = j.get("result", ""); open(os.path.join(OUT, f"horizons_{mid}.txt"), "w").write(res)
        log(f"### {mid} ({m['hz']})\n```\n" + "\n".join(res.splitlines()[:30]) + "\n```")
    except Exception as e:
        log("ÉCHEC Horizons", mid, repr(e)[:200])

# ---------- 3. STAC-PLANET ----------
log("\n## STAC-PLANET")
API = "https://stac.stacplanet.pdssp.eu"
for mid, m in MISSIONS.items():
    for c in m["stac"]:
        try:
            body = {"collections": [c], "limit": 3}
            r = S.post(API + "/search", json=body, timeout=120); j = r.json(); feats = j.get("features", [])
            log(f"### {mid} · {c} : statut {r.status_code}, numberMatched={j.get('numberMatched')}, {len(feats)} items")
            json.dump(feats, open(os.path.join(OUT, f"{mid}_{c}.json"), "w"), indent=1)
            for f in feats[:1]:
                p = f.get("properties", {})
                log(f"- {f['id']} · {p.get('datetime')} · géométrie {(f.get('geometry') or {}).get('type')}")
                log(f"  propriétés : {json.dumps(p, ensure_ascii=False)[:900]}")
                imgs = []
                for k, a in f.get("assets", {}).items():
                    log(f"  - asset {k} : {a.get('type')} {a.get('roles')} {a.get('href')}")
                    if re.search(r"image/(jpeg|png)", a.get("type") or ""): imgs.append(a)
                for a in imgs[:4]:
                    try:
                        h = S.get(a["href"], timeout=120, stream=True); n = int(h.headers.get("content-length") or 0)
                        log(f"  taille {a['href'].rsplit('/', 1)[-1]} : {h.status_code} {n} o {h.headers.get('content-type')}")
                        if not h.ok: log("  réponse : " + h.text[:200].replace("\n", " "))
                        if h.ok and n < 15_000_000:
                            rr = h
                            open(os.path.join(OUT, f"{mid}_{c}_" + a["href"].rsplit("/", 1)[-1]), "wb").write(rr.content); log(f"  téléchargé ({len(rr.content)} o)")
                    except Exception as e:
                        log("  échec aperçu", repr(e)[:200])
        except Exception as e:
            log("ÉCHEC STAC", mid, c, repr(e)[:300])

txt = "# Sonde deuxième vague\n\n" + "\n".join(REPORT) + "\n"
open(os.path.join(OUT, "probe.md"), "w").write(txt)
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write(txt[:900000])
