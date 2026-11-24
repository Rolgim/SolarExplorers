#!/usr/bin/env python3
"""Données réelles TRACÉES par le site, pour les instruments dont l'archive ne publie pas d'aperçu (tables, cartes binaires).
Chaque recette lit un vrai fichier de données (trouvé par STAC-PLANET), le décode d'après son étiquette PDS, et trace
une carte, un profil ou une série. Le tracé est fait ici : la légende le dit, avec le fichier source (règles 2 et 3).
Sortie : data/d-<mission>-<instrument>.jpg et .json. Appelé par fetch_data.py (recette « traces »)."""
import io, os, re, json, datetime, struct
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
DATA = os.path.join(ROOT, "data")
STAC = "https://stac.stacplanet.pdssp.eu"
S = None   # session requests, fournie par fetch_data.py
INK, MID = "#14171A", "#3A4147"
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.edgecolor": MID, "axes.labelcolor": INK, "xtick.color": MID, "ytick.color": MID})

def items(collection, n=60):
    r = S.post(STAC + "/search", json={"collections": [collection], "limit": n, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=120)
    r.raise_for_status(); return r.json().get("features", [])
def pick(collection, rx=None, avoid=None):
    for f in items(collection):
        if rx and not re.search(rx, f["id"], re.I): continue
        if avoid and re.search(avoid, f["id"], re.I): continue
        return f
    raise RuntimeError("aucun item " + collection + " " + str(rx))
def asset(f, rx):
    for a in f["assets"].values():
        if re.search(rx, a.get("href", ""), re.I): return a["href"]
    raise RuntimeError("pas d'asset " + rx + " dans " + f["id"])
def get(u): r = S.get(u, timeout=600); r.raise_for_status(); return r.content

def label(text):
    """Étiquette PDS3 aplatie : clés « OBJET.CLÉ » (objets imbriqués joints par des points), valeurs brutes."""
    out, path = {}, []
    for line in re.sub(r"/\*.*?\*/", "", text).splitlines():
        m = re.match(r"\s*([\^A-Z_0-9:]+)\s*=\s*(.*?)\s*$", line)
        if not m: continue
        k, v = m.group(1), m.group(2).strip('"')
        if k == "OBJECT": path.append(v); continue
        if k == "END_OBJECT": path and path.pop(); continue
        out[".".join(path + [k])] = v
        out.setdefault(k, v)
    return out
def num(v): return float(re.sub(r"<.*?>", "", str(v)).strip())

def pds3_image(lab, raw, key="IMAGE"):
    """Image PDS3 (une ou plusieurs bandes) -> tableau numpy [bande, ligne, colonne], mise à l'échelle appliquée."""
    L, Sm = int(lab[key + ".LINES"]), int(lab[key + ".LINE_SAMPLES"]); B = int(lab.get(key + ".BANDS", 1))
    bits, st = int(lab[key + ".SAMPLE_BITS"]), lab[key + ".SAMPLE_TYPE"]
    ptr = lab.get("^" + key, "1"); off = 0
    m = re.search(r"(\d+)\s*<BYTES>", ptr)
    if m: off = int(m.group(1)) - 1
    else:
        m = re.search(r"(\d+)\s*\)?\s*$", ptr)
        if m: off = (int(m.group(1)) - 1) * int(lab.get("RECORD_BYTES", 0) or 0)
    end = "<" if st.startswith(("PC", "LSB", "VAX")) else ">"
    kind = "f" if "REAL" in st else ("u" if "UNSIGNED" in st else "i")
    dt = np.dtype(end + kind + str(bits // 8))
    a = np.frombuffer(raw, dtype=dt, count=L * Sm * B, offset=off).astype(float)
    a = a.reshape(L, Sm, B).transpose(2, 0, 1) if "SAMPLE_INTERLEAVED" in lab.get(key + ".BAND_STORAGE_TYPE", "") else a.reshape(B, L, Sm)
    inv = lab.get(key + ".INVALID_CONSTANT") or lab.get(key + ".MISSING_CONSTANT")
    if inv is not None:
        try: a[a == num(inv)] = np.nan
        except ValueError: pass
    return a * num(lab.get(key + ".SCALING_FACTOR", 1)) + num(lab.get(key + ".OFFSET", 0))

def save(name, fig, meta):
    buf = io.BytesIO(); fig.savefig(buf, format="png", dpi=110, facecolor="white"); plt.close(fig)
    im = Image.open(buf).convert("RGB"); im.save(os.path.join(DATA, name + ".jpg"), quality=88, optimize=True)
    meta.update({"out_size": list(im.size), "plot": True, "fetched": datetime.date.today().isoformat()})
    json.dump(meta, open(os.path.join(DATA, name + ".json"), "w"), indent=1, ensure_ascii=False)
    print(name, ":", meta["product"], im.size)
def base(f, collection, href, instrument, archive):
    return {"archive": archive + ", via le catalogue STAC-PLANET du PDSSP", "collection": collection, "product": f["id"], "datetime": f["properties"].get("datetime"),
            "href": href, "stac": STAC + "/collections/" + collection + "/items/" + f["id"], "instrument": instrument}

def gravity_map(name, collection, instrument, archive, body, rx=r"anom", avoid=r"err|sig|unc"):
    """Carte d'anomalie de gravité (image PDS3, milligals), d'après un champ publié par l'équipe de radioscience."""
    f = pick(collection, rx, avoid); lab_u = asset(f, r"\.lbl$"); img_u = asset(f, r"\.img$")
    lab = label(get(lab_u).decode("latin-1")); a = pds3_image(lab, get(img_u))[0]
    v = np.nanpercentile(np.abs(a), 99)
    fig, ax = plt.subplots(figsize=(8.2, 4.6))
    w0, e0 = num(lab.get("IMAGE_MAP_PROJECTION.WESTERNMOST_LONGITUDE", 0)), num(lab.get("IMAGE_MAP_PROJECTION.EASTERNMOST_LONGITUDE", 360))
    s0, n0 = num(lab.get("IMAGE_MAP_PROJECTION.MINIMUM_LATITUDE", -90)), num(lab.get("IMAGE_MAP_PROJECTION.MAXIMUM_LATITUDE", 90))
    im = ax.imshow(a, cmap="RdBu_r", vmin=-v, vmax=v, extent=[w0, e0, s0, n0], aspect="auto")
    ax.set_xlabel("longitude (°E)"); ax.set_ylabel("latitude (°)")
    cb = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02); cb.set_label("mGal")
    ax.set_title(f["id"], fontsize=9, color=MID); fig.tight_layout()
    save(name, fig, dict(base(f, collection, img_u, instrument, archive), unit="mGal",
         how_fr="Carte tracée par ce site à partir du fichier image de l'archive : anomalie de gravité en milligals (rouge : excès de masse, bleu : déficit), échelle de couleur coupée au centile 99. " + body[0],
         how_en="Map drawn by this site from the archive's image file: gravity anomaly in milligals (red: mass excess, blue: deficit), colour scale clipped at the 99th percentile. " + body[1]))

def mro_rss(): gravity_map("d-mro-rss", "ode-mars-mro-rss-rsdmap", "Gravité (MRO)", "PDS Geosciences Node (NASA)", ("Champ de gravité de Mars calculé par le JPL avec le suivi radio de MRO.", "Mars gravity field computed by JPL from MRO radio tracking."))
def grail_lgrs(): gravity_map("d-grail-lgrs", "ode-moon-grail-lgrs-rsdmap", "LGRS", "PDS Geosciences Node (NASA)", ("Champ de gravité de la Lune calculé à partir des mesures de distance entre les deux sondes GRAIL.", "Lunar gravity field computed from the distance measurements between the two GRAIL spacecraft."))

def sln_lmag():
    """Carte de l'anomalie magnétique lunaire à 30 km d'altitude (SELENE LMAG) : bande « F » (intensité totale), en nT."""
    c = "ode-moon-sln-lmag-mamap"; f = pick(c); lab = label(get(asset(f, r"\.lbl$")).decode("latin-1")); img_u = asset(f, r"\.img$")
    raw = get(img_u); lab["IMAGE.SAMPLE_TYPE"] = "MSB_UNSIGNED_INTEGER"   # octets lus sans signe : l'intensité F est positive, la lecture signée la replie au-delà de 2,54 nT
    a = pds3_image(lab, raw); F = a[3]
    fig, ax = plt.subplots(figsize=(8.2, 4.4))
    im = ax.imshow(F, cmap="magma", extent=[0, 360, -89.5, 89.5], aspect="auto", vmin=0, vmax=np.nanpercentile(F, 99.5))
    ax.set_xlabel("longitude (°E)"); ax.set_ylabel("latitude (°)"); cb = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02); cb.set_label("nT")
    ax.set_title(f["id"] + " (F)", fontsize=9, color=MID); fig.tight_layout()
    save("d-sln-lmag", fig, dict(base(f, c, img_u, "LMAG", "JAXA DARTS (archive de SELENE)"), unit="nT",
         how_fr="Carte tracée par ce site à partir du fichier image de l'archive (4e des 9 bandes : intensité totale F du champ magnétique d'origine crustale, à 30 km d'altitude, en nanoteslas). Octets lus sans signe (l'étiquette dit « entier signé », mais une intensité est positive) ; en blanc : pas de valeur.",
         how_en="Map drawn by this site from the archive's image file (4th of 9 bands: total intensity F of the crustal magnetic field, at 30 km altitude, in nanotesla). Bytes read as unsigned (the label says “signed integer”, but an intensity is positive); white: no value."))

def lp_ns():
    """Lunar Prospector, spectromètre à neutrons : comptage des neutrons épithermiques, échantillons de 32 s (phase d'orbite basse)."""
    c = "ode-moon-lp-ns-rdr"; f = pick(c, r"epitherm"); u = asset(f, r"\.dat$"); raw = get(u)
    n = struct.unpack("<I", raw[:4])[0]; a = np.frombuffer(raw, dtype="<f4", count=n, offset=4)
    k = 1350   # 1 350 échantillons de 32 s = 12 heures
    fig, ax = plt.subplots(figsize=(8.2, 3.6)); t = np.arange(k) * 32 / 3600
    ax.plot(t, a[:k], lw=0.6, color="#B9B0E8"); w = 10; ax.plot(t[w//2:k - w//2 + 1], np.convolve(a[:k], np.ones(w) / w, "valid"), lw=1.4, color="#6B55C9"); ax.set_xlabel("heures depuis le début du fichier / hours since file start (32 s)"); ax.set_ylabel("neutrons épithermiques\nepithermal neutrons / 32 s")
    ax.set_title(f["id"], fontsize=9, color=MID); fig.tight_layout()
    save("d-lp-ns", fig, dict(base(f, c, u, "NS", "PDS Geosciences Node (NASA)"), xlab_en="hours since start of file (32 s per point)", ylab_en="epithermal neutrons / 32 s",
         how_fr="Série tracée par ce site à partir du fichier binaire de l'archive : les 12 premières heures de comptage (" + str(n) + " échantillons au total). En trait foncé : moyenne glissante sur 10 points (5 min 20 s).",
         how_en="Series drawn by this site from the archive's binary file: the first 12 hours of counts (" + str(n) + " samples in all). Dark line: running mean over 10 points (5 min 20 s)."))

def ascii_table(lab, txt, key="TABLE"):
    """Colonnes d'une table ASCII PDS3 d'après START_BYTE et BYTES de chaque COLUMN."""
    cols = []; cur = None
    for line in re.sub(r"/\*.*?\*/", "", lab).splitlines():
        m = re.match(r"\s*([A-Z_]+)\s*=\s*(.*?)\s*$", line)
        if not m: continue
        k, v = m.group(1), m.group(2).strip('"')
        if k == "OBJECT" and v == "COLUMN": cur = {}
        elif k == "END_OBJECT" and v == "COLUMN" and cur is not None: cols.append(cur); cur = None
        elif cur is not None and k in ("NAME", "START_BYTE", "BYTES", "UNIT"): cur[k] = v
    rows = txt.splitlines(); out = {}
    for c in cols:
        if "START_BYTE" not in c or "BYTES" not in c: continue
        s, b = int(c["START_BYTE"]) - 1, int(c["BYTES"]); vals = []
        for r in rows:
            try: vals.append(float(r[s:s + b]))
            except ValueError: vals.append(np.nan)
        out[c["NAME"]] = (np.array(vals), c.get("UNIT", ""))
    return out, rows

def clem_lidar():
    """Clementine, télémètre laser : rayon lunaire mesuré le long d'une révolution."""
    c = "ode-moon-clem-lidar-topo"; f = pick(c); lab = get(asset(f, r"\.lbl$")).decode("latin-1"); u = asset(f, r"\.tab$")
    T, rows = ascii_table(lab, get(u).decode("latin-1"))
    print("  colonnes lidar :", list(T)[:40])
    lat = next(v for k, v in T.items() if "LATITUDE" in k)[0]; rev = next(v for k, v in T.items() if "REVOLUTION" in k)[0]
    rk = "FIRST RADIUS INSIDE WINDOW" if "FIRST RADIUS INSIDE WINDOW" in T else next(k for k in T if "RADIUS" in k and "SPHEROID" not in k); rad = T[rk][0]
    ok = np.isfinite(rad) & (rad > 1.70e6) & (rad < 1.76e6)
    best = max(set(rev[ok]), key=lambda r: int(np.sum(ok & (rev == r))))
    sel = ok & (rev == best)
    fig, ax = plt.subplots(figsize=(8.2, 3.6))
    ax.plot(lat[sel], (rad[sel] - 1737400) / 1000, ".", ms=2.5, color="#0F8A7A")
    ax.set_xlabel("latitude (°)"); ax.set_ylabel("rayon / radius − 1737.4 km (km)"); ax.set_title(f"{f['id']}, rev. {int(best)} ({int(sel.sum())})", fontsize=9, color=MID); fig.tight_layout()
    save("d-clem-lidar", fig, dict(base(f, c, u, "LIDAR", "PDS Geosciences Node (NASA)"), ylab_en="radius − 1,737.4 km (km)", column=rk,
         how_fr="Profil tracé par ce site à partir de la table de l'archive (colonne « " + rk + " ») : un point par tir laser valide, le long d'une révolution. Les valeurs hors de 1 700 à 1 760 km sont écartées comme échos parasites ; l'étiquette prévient que le premier écho n'est pas toujours le bon.",
         how_en="Profile drawn by this site from the archive's table (column “" + rk + "”): one point per valid laser shot, along one revolution. Values outside 1,700 to 1,760 km are discarded as spurious echoes; the label warns that the first echo is not always the right one."))

def lp_rss():
    """Lunar Prospector : grille d'anomalies de Bouguer (JPL), 1° × 1°."""
    c = "ode-moon-lp-rss-grajpl"; f = pick(c); lab = get(asset(f, r"\.lbl$")).decode("latin-1"); u = asset(f, r"\.dat$")
    print("  étiquette LP RSS :", re.sub(r"\s+", " ", lab)[:1500])
    a = np.array([float(x) for x in get(u).decode("latin-1").split()])
    if a.size != 64800: raise RuntimeError("grille LP inattendue : %d valeurs" % a.size)
    g = a.reshape(180, 360); v = np.nanpercentile(np.abs(g), 99)
    fig, ax = plt.subplots(figsize=(8.2, 4.4))
    im = ax.imshow(g, cmap="RdBu_r", vmin=-v, vmax=v, extent=[-180, 180, -90, 90], aspect="auto", origin="upper")
    ax.set_xlabel("longitude (°E)"); ax.set_ylabel("latitude (°)"); cb = fig.colorbar(im, ax=ax, fraction=0.04, pad=0.02); cb.set_label("mGal")
    ax.set_title(f["id"], fontsize=9, color=MID); fig.tight_layout()
    save("d-lp-rss", fig, dict(base(f, c, u, "RSS", "PDS Geosciences Node (NASA)"), unit="mGal",
         how_fr="Carte tracée par ce site à partir de la grille ASCII de l'archive : anomalie de Bouguer (gravité corrigée du relief) en milligals, d'après le suivi radio de Lunar Prospector ; échelle coupée au centile 99.",
         how_en="Map drawn by this site from the archive's ASCII grid: Bouguer anomaly (gravity corrected for topography) in milligals, from Lunar Prospector radio tracking; scale clipped at the 99th percentile."))

def sln_upi():
    """SELENE UPI-TVIS : une image du télescope visible (fichier PDS3, réels 32 bits)."""
    c = "ode-moon-sln-upi-tvisna"; f = pick(c); lab = label(get(asset(f, r"\.lbl$")).decode("latin-1")); u = asset(f, r"\.img$")
    a = pds3_image(lab, get(u))[0]; lo, hi = np.nanpercentile(a, [1, 99.5])
    fig, ax = plt.subplots(figsize=(5.6, 5.4)); ax.imshow(np.clip((a - lo) / (hi - lo + 1e-12), 0, 1), cmap="gray"); ax.set_axis_off()
    ax.set_title(f["id"], fontsize=9, color=MID); fig.tight_layout()
    save("d-sln-upi", fig, dict(base(f, c, u, "UPI (TVIS)", "JAXA DARTS (archive de SELENE)"), stretch=[1, 99.5],
         how_fr="Image affichée par ce site à partir du fichier de l'archive (" + lab.get("DATA_SET_NAME", "") + "), contraste étiré entre les centiles 1 et 99,5.",
         how_en="Image displayed by this site from the archive's file (" + lab.get("DATA_SET_NAME", "") + "), contrast stretched between the 1st and 99.5th percentiles."))

RECIPES = {"mro:rss": mro_rss, "grail:lgrs": grail_lgrs, "sln:lmag": sln_lmag, "lp:ns": lp_ns, "clem:lidar": clem_lidar, "lp:rss": lp_rss}   # sln:upi retiré : l'image TVIS la plus récente n'est que du bruit
def run(session):
    global S; S = session; bad = []
    for k, fn in RECIPES.items():
        try: fn()
        except Exception as e: bad.append(k); print("  tracé", k, "ÉCHEC", repr(e)[:300])
    if bad: print("tracés non faits :", ", ".join(bad))
