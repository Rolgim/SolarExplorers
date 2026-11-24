#!/usr/bin/env python3
"""1. Images de l'ESA par instrument (moteur de recherche d'esa.int) : titre, crédit, licence affichée, URL de l'image.
2. Formats (FMT) et étiquettes complètes des tables binaires à tracer (LEND, GRS d'Odyssey, GRS de Lunar Prospector, MCS, Magellan RSS).
Sortie : _out/esa_fmt/ (branche probe-out)."""
import os, re, html, requests
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "_out", "esa_fmt"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
STAC = "https://stac.stacplanet.pdssp.eu"
REP = []
def log(s): print(s, flush=True); REP.append(s)
log("# 1. ESA")
Q = {"tgo:cassis": "CaSSIS", "tgo:nomad": "NOMAD Trace Gas Orbiter", "tgo:acs": "Atmospheric Chemistry Suite", "tgo:frend": "FREND water", "vex:vmc": "Venus Monitoring Camera",
     "vex:virtis": "VIRTIS Venus", "vex:spicav": "SPICAV", "vex:pfs": "Venus Express PFS", "vex:aspera": "ASPERA Venus", "vex:mag": "Venus Express magnetometer", "vex:vera": "VeRa Venus",
     "mex:pfs": "Planetary Fourier Spectrometer Mars", "mex:spicam": "SPICAM", "mex:aspera": "ASPERA Mars Express", "mex:mars": "MaRS Mars Express radio", "mex:omega": "OMEGA Mars Express"}
for key, q in Q.items():
    try: r = S.get("https://www.esa.int/ESA_Multimedia/Search", params={"SearchText": q, "result_type": "images"}, timeout=60)
    except Exception as e: log(f"\n## {key} ÉCHEC {e!r}"[:200]); continue
    links = list(dict.fromkeys(re.findall(r'href="(/ESA_Multimedia/Images/\d{4}/\d{2}/[^"]+)"', r.text)))[:6]
    log(f"\n## {key} « {q} » : {r.status_code}, {len(links)} images")
    for l in links:
        u = "https://www.esa.int" + l
        try: p = S.get(u, timeout=60).text
        except Exception as e: log(f"- {u} ÉCHEC"); continue
        t = re.search(r"<title>(.*?)</title>", p, re.S); og = re.search(r'property="og:image" content="([^"]+)"', p)
        lic = re.findall(r"(?i)(CC BY-SA 3\.0 IGO|CC BY-SA IGO 3\.0|ESA Standard Licen[cs]e|All rights reserved|Creative Commons)", p)
        cred = re.search(r"(?is)Copyright\s*</[^>]+>\s*(.{0,200}?)<", p) or re.search(r"(?is)(?:Copyright|Credit)[^<]{0,10}<[^>]+>([^<]{3,200})<", p)
        desc = re.search(r'name="description" content="([^"]{0,300})', p)
        log(f"- {html.unescape(t.group(1).strip()) if t else '?'} | {u}\n    image : {og.group(1) if og else '?'}\n    licence : {sorted(set(lic))} | crédit : {html.unescape(cred.group(1).strip()) if cred else '?'}\n    « {html.unescape(desc.group(1)) if desc else ''} »")
log("\n# 2. Formats")
for c, rx in [("ode-moon-lro-lend-rdrrsci4", r"\.(fmt|lbl)$"), ("ode-mars-ody-grs-cgs", r"\.(fmt|lbl)$"), ("ode-moon-lp-grs-rdr", r"\.lbl$"), ("ode-mars-mro-mcs-ddr", r"\.(fmt|lbl)$"),
              ("ode-venus-mgn-rss-losapdr", r"\.(xml|lbl|001)$"), ("ode-mars-ody-grs-gammas", r"\.(fmt|lbl|tab)$"), ("ode-mars-ody-grs-neutns", r"\.(fmt|lbl)$")]:
    try: f = S.post(STAC + "/search", json={"collections": [c], "limit": 1, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=90).json()["features"][0]
    except Exception as e: log(f"\n## {c} ÉCHEC {e!r}"[:200]); continue
    log(f"\n## {c} : {f['id']}")
    for a in f["assets"].values():
        h = a.get("href", "")
        log(f"- {h}")
        if re.search(rx, h, re.I) and not h.lower().endswith(".001"):
            try: t = S.get(h, timeout=90).text; log("```\n" + re.sub(r"\n\s*\n", "\n", t)[:9000] + "\n```")
            except Exception as e: log(f"  ÉCHEC {e!r}"[:120])
        elif h.lower().endswith(".001"):
            try: g = S.get(h, timeout=90, stream=True); log("```\n" + g.raw.read(3000).decode("latin-1") + "\n```")
            except Exception: pass
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
