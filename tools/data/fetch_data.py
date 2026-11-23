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

def browse(mid, collection, instrument, archive, max_px=900, stretch=None, roles=("thumbnail",), skip=None, min_px=0, alt=None):
    """Aperçu publié par l'archive (asset « thumbnail » JPEG ou PNG) de l'item le plus récent qui a une emprise,
    entier, ramené à max_px de côté au plus ; contraste étiré seulement si stretch est donné (signalé dans la légende)."""
    for f in stac_items(collection):
        if not f.get("geometry") or (skip and re.search(skip, f["id"])): continue
        th = [a for a in f["assets"].values() if set(roles) & set(a.get("roles") or []) and re.search(r"image/(jpeg|png)", a.get("type") or "")]
        if not th: continue
        href = th[0]["href"]
        if alt:   # variante plus grande du même aperçu publiée par l'archive (ex. dossier « large » au lieu de « small »), essayée d'abord
            r = S.get(re.sub(alt[0], alt[1], href), timeout=300)
            if r.ok and r.headers.get("content-type", "").startswith("image/"): href = r.url
            else: r = S.get(href, timeout=300)
        else: r = S.get(href, timeout=300)
        if not r.ok: print("  aperçu indisponible", r.status_code, href); continue
        im = Image.open(io.BytesIO(r.content))
        if max(im.size) < min_px: print("  aperçu trop petit", im.size, href); continue
        im = im.convert("L") if im.mode in ("L", "LA", "I", "I;16", "P") and not im.getpalette() else im.convert("RGB")
        w, h = im.size; k = min(1.0, max_px / max(w, h)); out = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS) if k < 1 else im
        if stretch: out = ImageOps.autocontrast(out, cutoff=stretch)
        out.save(os.path.join(DATA, mid + "-img.jpg"), quality=84, optimize=True)
        p = f["properties"]
        meta = {"archive": archive, "collection": f.get("collection"), "product": f["id"], "datetime": p.get("datetime"), "href": href,
                "stac": STAC + "/collections/" + f.get("collection", "") + "/items/" + f["id"], "instrument": instrument,
                "full_size": [w, h], "out_size": list(out.size), "stretch": [stretch, 100 - stretch] if stretch else None,
                "footprint": f.get("geometry"), "fetched": datetime.date.today().isoformat()}
        json.dump(meta, open(os.path.join(DATA, mid + "-img.json"), "w"), indent=1, ensure_ascii=False)
        print(mid, ":", f["id"], p.get("datetime"), w, "×", h); return
    raise RuntimeError("aucun aperçu récupéré pour " + collection)

def mex_hrsc(): browse("mex", "ode-mars-mex-hrsc-rdrv4", "HRSC", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def lro_lroc(): browse("lro", "ode-moon-lro-lroc-bdrroi", "LROC NAC", "PDS de LROC (Arizona State University), via le catalogue STAC-PLANET du PDSSP")
def messenger_mdis(): browse("messenger", "ode-mercury-messenger-mdis-nac-rtmnac", "MDIS NAC", "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def ody_themis(): browse("ody", "ode-mars-ody-themis-vgeo2", "THEMIS VIS", "Arizona State University (THEMIS), via le catalogue STAC-PLANET du PDSSP", stretch=0.5, skip=r"POL$")
def mgs_moc(): browse("mgs", "ode-mars-mgs-moc-na-wa-nasdp", "MOC NA", "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def tgo_cassis(): browse("tgo", "ode-mars-em16tgo-cassis-calsc", "CaSSIS", "Planetary Science Archive (ESA), via le catalogue STAC-PLANET du PDSSP", roles=("thumbnail", "overview"))
def clem_uvvis():
    for c in ("ode-moon-clem-uvvis-mdim", "ode-moon-clem-hires-mdim", "ode-moon-clem-nir-mdim"):
        try: return browse("clem", c, "UVVIS" if "uvvis" in c else "HIRES" if "hires" in c else "NIR", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP",
                           roles=("thumbnail", "overview", "browse"), min_px=300, alt=(r"/small/", "/large/"))
        except RuntimeError as e: print(" ", e)
    raise RuntimeError("aucun aperçu Clementine assez grand")
def mgn_sar(): browse("mgn", "ode-venus-mgn-rdrs-fmidr", "SAR", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP", roles=("thumbnail", "overview", "browse"))
def _try(mid, cols, inst, arch, **kw):
    for c in cols:
        try: return browse(mid, c, inst, arch, roles=("thumbnail", "overview", "browse"), min_px=200, **kw)
        except RuntimeError as e: print(" ", e)
    raise RuntimeError("aucun aperçu pour " + mid)
def vo_vis(): _try("vo", ("ode-mars-vo-visab-mdim", "ode-mars-vo-visab-mdimc", "ode-mars-vo-visab-edr"), "VIS", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def sln_tc(): _try("sln", ("ode-moon-sln-tc-tcort", "ode-moon-sln-mi-mimap", "ode-moon-sln-tc-tcsl2b"), "TC", "JAXA (SELENE Data Archive) / PDS Geosciences Node, via le catalogue STAC-PLANET du PDSSP")
def ch1_m3(): _try("ch1", ("ode-moon-ch1-orb-m3-refimg", "ode-moon-ch1-orb-m3-caliv3"), "M3", "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def kplo_shadowcam(): _try("kplo", ("ode-moon-kplo-shadowcam-umos", "ode-moon-kplo-shadowcam-cal"), "ShadowCam", "PDS de ShadowCam (Arizona State University), via le catalogue STAC-PLANET du PDSSP", stretch=0.5)
def cassini_vims(): browse("cassini", "vim-cassini-vims-ir", "VIMS", "Université de Nantes (aperçus VIMS), via le catalogue STAC-PLANET du PDSSP")

# fonds des corps (vue 3D : le corps observé sous la sonde) : textures globales sous licence ouverte, créditées à côté de l'image (règle 8)
BODIES = {
    "mars": ("https://www.solarsystemscope.com/textures/download/2k_mars.jpg", "Solar System Scope, texture « Mars » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "moon": ("https://www.solarsystemscope.com/textures/download/2k_moon.jpg", "Solar System Scope, texture « Lune » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "mercury": ("https://www.solarsystemscope.com/textures/download/2k_mercury.jpg", "Solar System Scope, texture « Mercure » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "venus": ("https://www.solarsystemscope.com/textures/download/2k_venus_atmosphere.jpg", "Solar System Scope, texture « Vénus (atmosphère) » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "venus-surface": ("https://www.solarsystemscope.com/textures/download/2k_venus_surface.jpg", "Solar System Scope, texture « Vénus (surface) » 2k, d'après des données radar de Magellan (NASA)", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
    "saturn": ("https://www.solarsystemscope.com/textures/download/2k_saturn.jpg", "Solar System Scope, texture « Saturne » 2k, d'après des données de la NASA", "CC BY 4.0", "https://www.solarsystemscope.com/textures/"),
}
def body_textures():
    bad = []
    for k, (u, credit, lic, page) in BODIES.items():
        r = S.get(u, timeout=300)
        try: im = Image.open(io.BytesIO(r.content)).convert("RGB")
        except Exception: print("  texture", k, "illisible :", r.status_code, r.headers.get("content-type"), r.url, r.content[:120]); bad.append(k); continue
        if im.width > 2048: im = im.resize((2048, 1024), Image.LANCZOS)
        im.save(os.path.join(DATA, "tex-" + k + ".jpg"), quality=82, optimize=True)
        json.dump({"body": k, "href": u, "credit": credit, "license": lic, "page": page, "size": list(im.size), "fetched": datetime.date.today().isoformat()},
                  open(os.path.join(DATA, "tex-" + k + ".json"), "w"), indent=1, ensure_ascii=False)
        print("texture", k, im.size)
    if bad: raise RuntimeError("textures non récupérées : " + ", ".join(bad))

RECIPES = {"mro_ctx": mro_ctx, "mex_hrsc": mex_hrsc, "lro_lroc": lro_lroc, "messenger_mdis": messenger_mdis, "cassini_vims": cassini_vims,
           "ody_themis": ody_themis, "mgs_moc": mgs_moc, "tgo_cassis": tgo_cassis, "clem_uvvis": clem_uvvis, "mgn_sar": mgn_sar, "vo_vis": vo_vis, "sln_tc": sln_tc, "ch1_m3": ch1_m3, "kplo_shadowcam": kplo_shadowcam, "textures": body_textures}
if __name__ == "__main__":
    want = sys.argv[1:] or list(RECIPES)
    bad = 0
    for k in want:
        try: RECIPES[k]()
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
