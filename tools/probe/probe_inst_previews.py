#!/usr/bin/env python3
"""Aperçus par instrument : pour chaque instrument (instruments.json, tiré de src/data-inst.js et src/data-stac.js),
cherche dans STAC-PLANET, collection par collection (les plus fournies d'abord, 6 au plus), un item récent dont un asset
est une image (jpeg/png) ou un fichier de données léger, et teste si l'aperçu se télécharge depuis GitHub Actions.
Pour les instruments sans collection : recherche dans la bibliothèque d'images de la NASA (titres seulement, à trier à la main).
Sortie : _out/inst_previews/report.md et report.json (branche probe-out)."""
import os, json, re, requests
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "_out", "inst_previews"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
STAC = "https://stac.stacplanet.pdssp.eu"
INST = json.load(open(os.path.join(HERE, "instruments.json")))
MNAME = {"mro": "Mars Reconnaissance Orbiter", "mex": "Mars Express", "lro": "Lunar Reconnaissance Orbiter", "cassini": "Cassini", "messenger": "MESSENGER",
         "ody": "Mars Odyssey", "mgs": "Mars Global Surveyor", "tgo": "Trace Gas Orbiter", "vex": "Venus Express", "mgn": "Magellan", "clem": "Clementine",
         "sln": "Kaguya", "ch1": "Chandrayaan-1", "kplo": "Danuri", "lp": "Lunar Prospector", "grail": "GRAIL", "vo": "Viking Orbiter"}
REP, RES = [], {}
def log(s): print(s, flush=True); REP.append(s)
for ins in INST:
    key = ins["m"] + ":" + ins["id"]; res = RES[key] = {"cols": [], "nasa": []}
    log(f"\n### {key} ({ins['name']}, {ins['type']}) : {len(ins['cols'])} collections")
    for c in ins["cols"][:6]:
        try:
            r = S.post(STAC + "/search", json={"collections": [c], "limit": 3, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=90)
            feats = r.json().get("features", []) if r.ok else []
        except Exception as e: log(f"- {c} : ÉCHEC {e!r}"[:200]); continue
        if not feats: log(f"- {c} : 0 item"); continue
        f = feats[0]; assets = f.get("assets", {})
        desc = "; ".join(f"{k}[{','.join(a.get('roles') or [])}|{(a.get('type') or '')[:20]}]" for k, a in list(assets.items())[:10])
        imgs = [(k, a) for k, a in assets.items() if re.search(r"image/(jpeg|png|gif)", a.get("type") or "") or re.search(r"\.(jpe?g|png|gif)$", a.get("href", ""), re.I)]
        st = ""
        if imgs:
            h = imgs[0][1]["href"]
            try:
                g = S.get(h, timeout=90, stream=True); n = len(g.raw.read(400000)); st = f"{g.status_code} {g.headers.get('content-type')} ≥{n} o {h}"
            except Exception as e: st = f"ÉCHEC {e!r}"[:150] + " " + h
        res["cols"].append({"col": c, "item": f["id"], "dt": f["properties"].get("datetime"), "geom": bool(f.get("geometry")), "img": st, "assets": desc})
        log(f"- {c} : {f['id']} {f['properties'].get('datetime')} géom={bool(f.get('geometry'))}\n    assets : {desc[:400]}\n    image : {st or 'aucune'}")
    if not ins["cols"] or not any(x["img"].startswith("200 image") for x in res["cols"]):
        q = f"{MNAME.get(ins['m'], ins['m'])} {ins['name']}"
        try:
            r = S.get("https://images-api.nasa.gov/search", params={"q": q, "media_type": "image"}, timeout=60)
            for it in r.json()["collection"]["items"][:6]:
                d = it["data"][0]; res["nasa"].append([d.get("nasa_id"), d.get("title"), d.get("date_created", "")[:10]])
                log(f"    NASA « {q} » : {d.get('nasa_id')} | {d.get('title')} | {d.get('date_created','')[:10]}")
        except Exception as e: log(f"    NASA : ÉCHEC {e!r}"[:200])
json.dump(RES, open(os.path.join(OUT, "report.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
