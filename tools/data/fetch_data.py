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

def browse(mid, collection, instrument, archive, max_px=900, stretch=None, roles=("thumbnail",), skip=None, min_px=0, alt=None, crop=None, min_side=0, name=None, need_geom=True):
    """Aperçu publié par l'archive (asset « thumbnail » JPEG ou PNG) de l'item le plus récent qui a une emprise,
    entier, ramené à max_px de côté au plus ; contraste étiré seulement si stretch est donné (signalé dans la légende)."""
    for f in stac_items(collection):
        if (need_geom and not f.get("geometry")) or (skip and re.search(skip, f["id"])): continue
        th = [a for a in f["assets"].values() if (roles is None or set(roles) & set(a.get("roles") or [])) and (re.search(r"image/(jpeg|png|gif)", a.get("type") or "") or (roles is None and re.search(r"\.(jpe?g|png|gif)$", a.get("href", ""), re.I)))]
        if not th: continue
        href = th[0]["href"]
        if alt:   # variante plus grande du même aperçu publiée par l'archive (ex. dossier « large » au lieu de « small »), essayée d'abord
            r = S.get(re.sub(alt[0], alt[1], href), timeout=300)
            if r.ok and r.headers.get("content-type", "").startswith("image/"): href = r.url
            else: r = S.get(href, timeout=300)
        else: r = S.get(href, timeout=300)
        if not r.ok: print("  aperçu indisponible", r.status_code, href); continue
        im = Image.open(io.BytesIO(r.content))
        if max(im.size) < min_px or min(im.size) < min_side: print("  aperçu trop petit", im.size, href); continue
        full = im.size
        if crop and im.height > crop * im.width:   # longue bande (spectromètre imageur à balayage) : on garde le milieu, signalé dans la légende
            c = crop * im.width; im = im.crop((0, (im.height - c) // 2, im.width, (im.height - c) // 2 + c))
        im = im.convert("L") if im.mode in ("L", "LA", "I", "I;16", "P") and not im.getpalette() else im.convert("RGB")
        w, h = im.size; k = min(1.0, max_px / max(w, h)); out = im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS) if k < 1 else im
        if stretch: out = ImageOps.autocontrast(out, cutoff=stretch)
        out.save(os.path.join(DATA, (name or mid + "-img") + ".jpg"), quality=84, optimize=True)
        if archive is None: archive = archive_of(href)
        p = f["properties"]
        meta = {"archive": archive, "collection": f.get("collection"), "product": f["id"], "datetime": p.get("datetime"), "href": href,
                "stac": STAC + "/collections/" + f.get("collection", "") + "/items/" + f["id"], "instrument": instrument,
                "full_size": list(full), "crop": list(im.size) if im.size != full else None, "out_size": list(out.size), "stretch": [stretch, 100 - stretch] if stretch else None,
                "footprint": f.get("geometry"), "fetched": datetime.date.today().isoformat()}
        json.dump(meta, open(os.path.join(DATA, (name or mid + "-img") + ".json"), "w"), indent=1, ensure_ascii=False)
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
def mro_hirise():
    """MRO, HiRISE : les serveurs de l'université d'Arizona refusent GitHub Actions (sonde du 23/11/2026). Voie de repli vérifiée le
    24/11/2026 (tools/probe/probe_hirise_routes.py) : la bibliothèque d'images de la NASA (images.nasa.gov), qui republie les images
    HiRISE diffusées par le Photojournal du JPL. Image publiée entière (déjà traitée par l'équipe : c'est une image de presse, pas un produit PDS)."""
    nid = "PIA26553"   # « HiRISE Views Curiosity During a Drive »
    r = S.get("https://images-api.nasa.gov/search", params={"nasa_id": nid}, timeout=120); r.raise_for_status()
    it = r.json()["collection"]["items"][0]; d = it["data"][0]
    a = S.get("https://images-api.nasa.gov/asset/" + nid, timeout=120); a.raise_for_status()
    hrefs = [x["href"] for x in a.json()["collection"]["items"]]
    href = next((h for h in hrefs if "~medium" in h), None) or next(h for h in hrefs if re.search(r"\.jpe?g$", h, re.I))
    href = href.replace("http://", "https://")
    im = Image.open(io.BytesIO(S.get(href, timeout=300).content)).convert("L"); full = im.size
    k = min(1.0, 900 / max(full)); out = im.resize((round(full[0] * k), round(full[1] * k)), Image.LANCZOS) if k < 1 else im
    out.save(os.path.join(DATA, "mro-hirise.jpg"), quality=86, optimize=True)
    desc = re.sub(r"<[^>]+>", "", d.get("description", ""))
    meta = {"archive": "NASA Image and Video Library (images.nasa.gov), reprise du Photojournal du JPL", "collection": None, "product": nid,
            "title": d.get("title"), "datetime": d.get("date_created"), "credit": d.get("secondary_creator") or "NASA/JPL-Caltech/University of Arizona",
            "description": desc[:1200], "href": href, "page": "https://images.nasa.gov/details/" + nid, "instrument": "HiRISE",
            "full_size": list(full), "out_size": list(out.size), "stretch": None, "press": True, "fetched": datetime.date.today().isoformat()}
    json.dump(meta, open(os.path.join(DATA, "mro-hirise.json"), "w"), indent=1, ensure_ascii=False)
    print("mro_hirise :", nid, d.get("date_created"), full)

HOSTS = {"pds-geosciences.wustl.edu": "PDS Geosciences Node (NASA)", "planetarydata.jpl.nasa.gov": "PDS Imaging Node (NASA)",
         "data.darts.isas.jaxa.jp": "JAXA DARTS (archive de SELENE)", "pds-ppi.igpp.ucla.edu": "PDS Planetary Plasma Interactions Node (NASA)",
         "static.mars.asu.edu": "Arizona State University (THEMIS)", "hirise.lpl.arizona.edu": "HiRISE (université d'Arizona)",
         "pds.shadowcam.im-ldi.com": "PDS de ShadowCam (Arizona State University)", "pds.lroc.im-ldi.com": "PDS de LROC (Arizona State University)"}
def archive_of(href):
    h = re.sub(r"^https?://([^/]+)/.*$", r"\1", href); return HOSTS.get(h, h) + ", via le catalogue STAC-PLANET du PDSSP"

# Aperçu publié par l'archive, instrument par instrument (relevé : tools/probe/probe_inst_previews.py, 24/11/2026).
# Clé « mission:instrument » -> collections essayées dans l'ordre ; options de browse() en plus. Fichiers data/i-<mission>-<instrument>.*
INST_PREVIEWS = {
    "mro:hirise": (("ode-mars-mro-hirise-rdrv11", "ode-mars-mro-hirise-edr"), {"min_px": 300}),
    "mro:crism": (("ode-mars-mro-crism-mtrdr", "ode-mars-mro-crism-trdr", "ode-mars-mro-crism-edr"), {"min_px": 200}),
    "mro:sharad": (("ode-mars-mro-sharad-rdr",), {"crop": 2}),
    "mex:omega": (("ode-mars-mex-omega-ddrgm",), {}),
    "mex:marsis": (("ode-mars-mex-marsis-radarch",), {"crop": 2}),
    "mex:vmc": (("ode-mars-mex-vmc-edr",), {"min_px": 200}),
    "lro:lola": (("ode-moon-lro-lola-rdr4",), {}),
    "lro:diviner": (("ode-moon-lro-dlre-gdr-l2",), {}),
    "lro:lamp": (("ode-moon-lro-lamp-edr",), {"min_px": 200}),
    "lro:minirf": (("ode-moon-lro-mrflro-bsddr4",), {"crop": 3}),
    "mgs:mola": (("ode-mars-mgs-mola-pedr", "ode-mars-mgs-mola-megdr", "ode-mars-mgs-mola-toponat"), {"skip_href": r"marsis"}),
    "mgs:tes": (("ode-mars-mgs-tes-timap",), {}),
    "clem:nir": (("ode-moon-clem-nir-mdim",), {"alt": (r"/small/", "/large/")}),
    "clem:hires": (("ode-moon-clem-hires-mdim",), {"alt": (r"/small/", "/large/")}),
    "sln:mi": (("ode-moon-sln-mi-mi3c",), {"alt": (r"/small/", "/large/")}),
    "sln:lalt": (("ode-moon-sln-lalt-topom",), {}),
    "sln:lrs": (("ode-moon-sln-lrs-sar10c",), {"alt": (r"/small/", "/large/"), "crop": 2}),
    "sln:grs": (("ode-moon-sln-grs-imap",), {"alt": (r"/small/", "/large/")}),
    "sln:pace": (("ode-moon-sln-pace-etsum",), {}),
    "sln:rsat": (("ode-moon-sln-rsat-vrad-grav",), {"alt": (r"/small/", "/large/")}),
    "sln:hdtv": (("ode-moon-sln-hdtv-hdtvedr",), {}),
    "ch1:minisar": (("ode-moon-ch1-orb-mrffr-moscdr",), {"crop": 2}),
    "lp:mag": (("ode-moon-lp-mag-datal4",), {}),
    "lp:er": (("ode-moon-lp-er-datal2",), {}),
}
NAMES = {o["m"] + ":" + o["id"]: o["name"] for o in json.load(open(os.path.join(ROOT, "tools", "probe", "instruments.json")))}
def inst_previews(only=None):
    bad = []
    for key, (cols, kw) in INST_PREVIEWS.items():
        if only and key not in only: continue
        m, i = key.split(":"); kw = dict(kw); sk = kw.pop("skip_href", None); done = False
        for c in cols:
            try:
                browse(m, c, NAMES.get(key, i.upper()), None, roles=None, name="i-" + m + "-" + i, skip=None, need_geom=False, **kw)
                meta = json.load(open(os.path.join(DATA, "i-" + m + "-" + i + ".json")))
                if sk and re.search(sk, meta["href"], re.I): print("  écarté (", sk, ")", meta["href"]); continue
                meta["inst"] = key; json.dump(meta, open(os.path.join(DATA, "i-" + m + "-" + i + ".json"), "w"), indent=1, ensure_ascii=False)
                done = True; break
            except Exception as e: print("  ", key, c, repr(e)[:200])
        if not done: bad.append(key)
    if bad: print("instruments sans aperçu :", ", ".join(bad))

def _try(mid, cols, inst, arch, **kw):
    for c in cols:
        try: return browse(mid, c, inst, arch, roles=("thumbnail", "overview", "browse"), min_px=200, **kw)
        except RuntimeError as e: print(" ", e)
    raise RuntimeError("aucun aperçu pour " + mid)
def vo_vis(): _try("vo", ("ode-mars-vo-visab-mdim", "ode-mars-vo-visab-mdimc", "ode-mars-vo-visab-edr"), "VIS", "PDS Geosciences Node (NASA), via le catalogue STAC-PLANET du PDSSP")
def sln_tc(): _try("sln", ("ode-moon-sln-tc-tcwl2b", "ode-moon-sln-tc-tcsl2b", "ode-moon-sln-tc-tcort"), "TC", "JAXA (SELENE Data Archive) / PDS Geosciences Node, via le catalogue STAC-PLANET du PDSSP", crop=3)
def ch1_m3(): _try("ch1", ("ode-moon-ch1-orb-m3-refimg", "ode-moon-ch1-orb-m3-caliv3"), "M3", "PDS Imaging Node (NASA), via le catalogue STAC-PLANET du PDSSP", crop=3)
# kplo : pas « dtm » : ses aperçus sont des graphiques d'erreur, pas des images
def kplo_shadowcam(): _try("kplo", ("ode-moon-kplo-shadowcam-cmos", "ode-moon-kplo-shadowcam-umos", "ode-moon-kplo-shadowcam-cal"), "ShadowCam", "PDS de ShadowCam (Arizona State University), via le catalogue STAC-PLANET du PDSSP", stretch=0.5, min_side=200, crop=3)
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

RECIPES = {"mro_ctx": mro_ctx, "mro_hirise": mro_hirise, "mex_hrsc": mex_hrsc, "lro_lroc": lro_lroc, "messenger_mdis": messenger_mdis, "cassini_vims": cassini_vims,
           "ody_themis": ody_themis, "mgs_moc": mgs_moc, "tgo_cassis": tgo_cassis, "clem_uvvis": clem_uvvis, "mgn_sar": mgn_sar, "vo_vis": vo_vis, "sln_tc": sln_tc, "ch1_m3": ch1_m3, "kplo_shadowcam": kplo_shadowcam, "instruments": inst_previews, "textures": body_textures}
if __name__ == "__main__":
    want = sys.argv[1:] or list(RECIPES)
    bad = 0
    for k in want:
        try: RECIPES[k]()
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
