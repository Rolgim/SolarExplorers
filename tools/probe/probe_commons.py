#!/usr/bin/env python3
"""Images de l'ESA réutilisables via Wikimedia Commons (copies des images d'esa.int, avec licence et crédit dans les métadonnées).
Pour chaque instrument : recherche dans l'espace « Fichier », on garde la licence, l'auteur, le crédit et un extrait de description.
Sortie : _out/commons/report.md et report.json (branche probe-out)."""
import os, re, json, html, requests
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "_out", "commons"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (https://github.com/Rolgim/SolarExplorers)"
API = "https://commons.wikimedia.org/w/api.php"
Q = {"tgo:cassis": ["CaSSIS Mars ESA", "ExoMars Trace Gas Orbiter CaSSIS"], "tgo:nomad": ["NOMAD Trace Gas Orbiter"], "tgo:acs": ["Atmospheric Chemistry Suite Trace Gas Orbiter"],
     "tgo:frend": ["FREND ExoMars water map"], "vex:vmc": ["Venus Monitoring Camera Venus Express"], "vex:virtis": ["VIRTIS Venus Express"], "vex:spicav": ["SPICAV Venus Express"],
     "vex:pfs": ["Venus Express Planetary Fourier Spectrometer"], "vex:aspera": ["ASPERA-4 Venus Express"], "vex:mag": ["Venus Express magnetometer"], "vex:vera": ["VeRa Venus Express"],
     "mex:pfs": ["Planetary Fourier Spectrometer Mars Express"], "mex:spicam": ["SPICAM Mars Express"], "mex:aspera": ["ASPERA-3 Mars Express"], "mex:mars": ["Mars Express radio science MaRS"],
     "mex:vmc": ["Mars Express VMC Mars webcam"], "ch1:tmc": ["Chandrayaan-1 Terrain Mapping Camera"], "ch1:hysi": ["Chandrayaan-1 HySI"], "kplo:lhc": ["Danuri LUTI image"],
     "kplo:pol": ["Danuri PolCam"], "kplo:shadowcam": ["ShadowCam Danuri"], "vo:irtm": ["Viking Infrared Thermal Mapper"], "vo:mawd": ["Viking Mars Atmospheric Water Detector"],
     "lro:lend": ["LEND Lunar Reconnaissance Orbiter neutron"], "lro:lamp": ["LAMP Lunar Reconnaissance Orbiter ultraviolet"], "lro:crater": ["CRaTER Lunar Reconnaissance Orbiter"],
     "grail:moonkam": ["GRAIL MoonKAM image"], "clem:lwir": ["Clementine LWIR"], "sln:upi": ["Kaguya UPI TEX Earth plasmasphere"], "ody:marie": ["MARIE Mars Odyssey radiation"],
     "messenger:epps": ["MESSENGER EPPS"], "cassini:caps": ["Cassini Plasma Spectrometer CAPS"], "cassini:rss": ["Cassini radio science occultation"], "mgs:mag": ["Mars Global Surveyor magnetometer crustal magnetic"],
     "mgn:rss": ["Magellan gravity Venus"], "kplo:gs": ["KPLO gamma ray spectrometer"], "kplo:mag": ["KMAG Danuri"], "lp:grs": ["Lunar Prospector gamma ray thorium map"], "ch1:sir2": ["SIR-2 Chandrayaan"]}
REP, RES = [], {}
def log(s): print(s, flush=True); REP.append(s)
for key, qs in Q.items():
    RES[key] = []; log(f"\n## {key}")
    for q in qs:
        try:
            r = S.get(API, params={"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 12, "prop": "imageinfo",
                                   "iiprop": "url|extmetadata|size", "iiurlwidth": 1200, "format": "json"}, timeout=60).json()
        except Exception as e: log(f"  ÉCHEC {e!r}"[:150]); continue
        for p in (r.get("query", {}).get("pages", {}) or {}).values():
            ii = (p.get("imageinfo") or [{}])[0]; md = ii.get("extmetadata", {})
            g = lambda k: re.sub(r"<[^>]+>", "", html.unescape((md.get(k) or {}).get("value", ""))).strip()
            row = {"title": p["title"], "license": g("LicenseShortName"), "artist": g("Artist")[:150], "credit": g("Credit")[:200], "desc": g("ImageDescription")[:300],
                   "date": g("DateTimeOriginal")[:40], "page": ii.get("descriptionurl"), "url": ii.get("url"), "thumb": ii.get("thumburl"), "size": [ii.get("width"), ii.get("height")]}
            RES[key].append(row)
            log(f"- {row['title']} | {row['license']} | {row['artist']} | {row['size']}\n    crédit : {row['credit'][:150]}\n    « {row['desc'][:220]} »")
json.dump(RES, open(os.path.join(OUT, "report.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
