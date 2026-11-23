#!/usr/bin/env python3
"""Données réelles : une recette par produit, indépendantes. Chaque recette télécharge le produit de l'archive,
en tire un aperçu léger dans data/, et écrit à côté une fiche JSON (archive, collection, identifiant, date, URL) (règle 3).
Usage : python tools/data/fetch_data.py [recette …]   (sans argument : toutes)."""
import io, json, os, re, sys, datetime, requests
from PIL import Image, ImageOps
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
        crop = ImageOps.autocontrast(im.crop((0, top, s, top + s)).resize((900, 900), Image.LANCZOS), cutoff=0.5)   # contraste étiré, signalé dans la légende
        crop.save(os.path.join(DATA, "mro-ctx.jpg"), quality=84, optimize=True)
        p = f["properties"]
        meta = {"archive": "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP", "collection": f.get("collection"),
                "product": f["id"], "datetime": p.get("datetime"), "href": ov[0]["href"], "stac": STAC + "/collections/" + f.get("collection", "") + "/items/" + f["id"],
                "instrument": "CTX", "full_size": [w, h], "crop_px": s, "out_px": 900, "stretch": [0.5, 99.5],
                "footprint": f.get("geometry"), "center": [p.get("proj:centroid")] if p.get("proj:centroid") else None,
                "fetched": datetime.date.today().isoformat()}
        json.dump(meta, open(os.path.join(DATA, "mro-ctx.json"), "w"), indent=1, ensure_ascii=False)
        print("mro_ctx :", f["id"], p.get("datetime"), w, "×", h); return
    raise RuntimeError("aucun aperçu CTX récupéré")

def browse(mid, collection, instrument, archive, max_px=900, stretch=None):
    """Aperçu publié par l'archive (asset « thumbnail » JPEG ou PNG) de l'item le plus récent qui a une emprise,
    entier, ramené à max_px de côté au plus ; contraste étiré seulement si stretch est donné (signalé dans la légende)."""
    for f in stac_items(collection):
        if not f.get("geometry"): continue
        th = [a for a in f["assets"].values() if "thumbnail" in (a.get("roles") or []) and re.search(r"image/(jpeg|png)", a.get("type") or "")]
        if not th: continue
        r = S.get(th[0]["href"], timeout=300)
        if not r.ok: print("  aperçu indisponible", r.status_code, th[0]["href"]); continue
        im = Image.open(io.BytesIO(r.content)); im = im.convert("L") if im.mode in ("L", "LA", "I", "I;16", "P") and not im.getpalette() else im.convert("RGB")
        w, h = im.size; k = min(1.0, max_px / max(w, h)); out = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS) if k < 1 else im
        if stretch: out = ImageOps.autocontrast(out, cutoff=stretch)
        out.save(os.path.join(DATA, mid + "-img.jpg"), quality=84, optimize=True)
        p = f["properties"]
        meta = {"archive": archive, "collection": f.get("collection"), "product": f["id"], "datetime": p.get("datetime"), "href": th[0]["href"],
                "stac": STAC + "/collections/" + f.get("collection", "") + "/items/" + f["id"], "instrument": instrument,
                "full_size": [w, h], "out_size": list(out.size), "stretch": [stretch, 100 - stretch] if stretch else None,
                "footprint": f.get("geometry"), "fetched": datetime.date.today().isoformat()}
        json.dump(meta, open(os.path.join(DATA, mid + "-img.json"), "w"), indent=1, ensure_ascii=False)
        print(mid, ":", f["id"], p.get("datetime"), w, "×", h); return
    raise RuntimeError("aucun aperçu récupéré pour " + collection)

def mex_hrsc(): browse("mex", "ode-mars-mex-hrsc-rdrv4", "HRSC", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def lro_lroc(): browse("lro", "ode-moon-lro-lroc-bdrroi", "LROC NAC", "PDS de LROC (Arizona State University), via le catalogue STAC-PLANET du PDSSP")
def messenger_mdis(): browse("messenger", "ode-mercury-messenger-mdis-nac-rtmnac", "MDIS NAC", "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def cassini_vims(): browse("cassini", "vim-cassini-vims-ir", "VIMS", "Université de Nantes (aperçus VIMS), via le catalogue STAC-PLANET du PDSSP")

# fonds des corps (vue 3D : le corps observé sous la sonde) : textures globales sous licence ouverte, créditées à côté de l'image (règle 8)
BODIES = {
    "mars": ("https://www.solarsystemscope.com/textures/download/2k_mars.jpg", "Solar System Scope, texture « Mars » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "moon": ("https://www.solarsystemscope.com/textures/download/2k_moon.jpg", "Solar System Scope, texture « Lune » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "mercury": ("https://www.solarsystemscope.com/textures/download/2k_mercury.jpg", "Solar System Scope, texture « Mercure » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "saturn": ("https://www.solarsystemscope.com/textures/download/2k_saturn.jpg", "Solar System Scope, texture « Saturne » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
}
def body_textures():
    for k, (u, credit, lic, page) in BODIES.items():
        r = S.get(u, timeout=300); r.raise_for_status()
        im = Image.open(io.BytesIO(r.content)).convert("RGB")
        if im.width > 2048: im = im.resize((2048, 1024), Image.LANCZOS)
        im.save(os.path.join(DATA, "tex-" + k + ".jpg"), quality=82, optimize=True)
        json.dump({"body": k, "href": u, "credit": credit, "license": lic, "page": page, "size": list(im.size), "fetched": datetime.date.today().isoformat()},
                  open(os.path.join(DATA, "tex-" + k + ".json"), "w"), indent=1, ensure_ascii=False)
        print("texture", k, im.size)

RECIPES = {"mro_ctx": mro_ctx, "mex_hrsc": mex_hrsc, "lro_lroc": lro_lroc, "messenger_mdis": messenger_mdis, "cassini_vims": cassini_vims, "textures": body_textures}
if __name__ == "__main__":
    want = sys.argv[1:] or list(RECIPES)
    bad = 0
    for k in want:
        try: RECIPES[k]()
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
