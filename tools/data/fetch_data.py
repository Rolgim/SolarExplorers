#!/usr/bin/env python3
"""Données réelles : une recette par produit, indépendantes. Chaque recette télécharge le produit de l'archive,
en tire un aperçu léger dans data/, et écrit à côté une fiche JSON (archive, collection, identifiant, date, URL) (règle 3).
Usage : python tools/data/fetch_data.py [recette …]   (sans argument : toutes)."""
import io, json, os, sys, datetime, requests
from PIL import Image
Image.MAX_IMAGE_PIXELS = 400_000_000          # les bandes CTX font 5 056 × 26 624 pixels
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
DATA = os.path.join(ROOT, "data")
STAC = "https://stac.stacplanet.pdssp.eu"
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-data/1.0 (+https://github.com/Rolgim/SolarExplorers)"

def stac_items(collection, n=10):
    r = S.post(STAC + "/search", json={"collections": [collection], "limit": n,
               "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=120)
    r.raise_for_status(); return r.json().get("features", [])

def mro_ctx():
    """MRO, CTX : la bande la plus récente dont l'aperçu (asset « overview ») est servi par le PDS Imaging Node ;
    on garde un carré central de la bande, ramené à 900 pixels."""
    for f in stac_items("ode-mars-mro-ctx-edr"):
        if not f.get("geometry"): continue
        ov = [a for a in f["assets"].values() if "overview" in (a.get("roles") or [])]
        if not ov: continue
        r = S.get(ov[0]["href"], timeout=300)
        if not r.ok: print("  aperçu indisponible", r.status_code, ov[0]["href"]); continue
        im = Image.open(io.BytesIO(r.content)).convert("L")
        w, h = im.size; s = min(w, h); top = (h - s) // 2
        crop = im.crop((0, top, s, top + s)).resize((900, 900), Image.LANCZOS)
        crop.save(os.path.join(DATA, "mro-ctx.jpg"), quality=84, optimize=True)
        p = f["properties"]
        meta = {"archive": "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP", "collection": f.get("collection"),
                "product": f["id"], "datetime": p.get("datetime"), "href": ov[0]["href"], "stac": STAC + "/collections/" + f.get("collection", "") + "/items/" + f["id"],
                "instrument": "CTX", "full_size": [w, h], "crop_px": s, "out_px": 900,
                "footprint": f.get("geometry"), "center": [p.get("proj:centroid")] if p.get("proj:centroid") else None,
                "fetched": datetime.date.today().isoformat()}
        json.dump(meta, open(os.path.join(DATA, "mro-ctx.json"), "w"), indent=1, ensure_ascii=False)
        print("mro_ctx :", f["id"], p.get("datetime"), w, "×", h); return
    raise RuntimeError("aucun aperçu CTX récupéré")

RECIPES = {"mro_ctx": mro_ctx}
if __name__ == "__main__":
    want = sys.argv[1:] or list(RECIPES)
    bad = 0
    for k in want:
        try: RECIPES[k]()
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
