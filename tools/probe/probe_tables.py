#!/usr/bin/env python3
"""Produits sans aperçu : pour chaque collection, l'item le plus récent ; on télécharge l'étiquette (LBL/XML, 6 ko)
et le début du fichier de données (2 ko, ou la taille totale annoncée) pour décider comment le tracer.
Sortie : _out/tables/report.md (branche probe-out)."""
import os, re, requests
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "_out", "tables"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
STAC = "https://stac.stacplanet.pdssp.eu"
COLS = ["ode-moon-clem-lidar-topo", "ode-moon-clem-lidar-tab", "ode-venus-vex-mag-edr", "ode-mars-em16tgo-nomad-calsc", "ode-mars-em16tgo-nomad-parsc",
        "ode-mars-em16tgo-acs-tchanc", "ode-moon-lp-grs-rdr", "ode-moon-lp-ns-rdr", "ode-moon-lp-grs-derabu", "ode-mars-ody-grs-cgs", "ode-moon-grail-lgrs-cdrl1b",
        "ode-moon-sln-lmag-lmagts", "ode-moon-sln-lmag-mamap", "ode-mars-mro-mcs-ddr", "ode-moon-lro-lend-rdrrsci4", "ode-moon-sln-upi-tvisna",
        "ode-moon-clem-uvvis-mdim", "ode-moon-clem-lwir-rdr", "ode-mars-mro-rss-rsdmap", "ode-moon-lp-rss-grajpl", "ode-mars-em16tgo-cassis-dersc",
        "ode-venus-vex-virtis-rdr", "ode-moon-lro-lroc-cdrwac4", "ode-venus-mgn-rss-losapdr", "ode-moon-sln-ard-event", "ode-moon-grail-lgrs-rssedr"]
REP = []
def log(s): print(s, flush=True); REP.append(s)
for c in COLS:
    try:
        r = S.post(STAC + "/search", json={"collections": [c], "limit": 2, "sortby": [{"field": "properties.datetime", "direction": "desc"}]}, timeout=90)
        f = r.json()["features"][0]
    except Exception as e: log(f"\n## {c} : ÉCHEC {e!r}"[:200]); continue
    log(f"\n## {c} : {f['id']} {f['properties'].get('datetime')} géom={bool(f.get('geometry'))}")
    for k, a in f["assets"].items():
        h = a.get("href", ""); log(f"- {k} [{','.join(a.get('roles') or [])}] {a.get('type')} {h}")
    labs = [a["href"] for a in f["assets"].values() if re.search(r"\.(lbl|xml)$", a.get("href", ""), re.I) and "metadata" not in (a.get("roles") or [""])[:1]]
    labs = labs or [a["href"] for a in f["assets"].values() if re.search(r"\.(lbl|xml)$", a.get("href", ""), re.I)]
    for h in labs[:1]:
        try:
            t = S.get(h, timeout=90).text; log("```\n" + t[:5000] + "\n```")
        except Exception as e: log(f"  étiquette ÉCHEC {e!r}"[:150])
    data = [a["href"] for a in f["assets"].values() if "data" in (a.get("roles") or []) and not re.search(r"\.(lbl|xml)$", a.get("href", ""), re.I)]
    for h in data[:1]:
        try:
            g = S.get(h, timeout=120, stream=True); raw = g.raw.read(2000); size = g.headers.get("content-length")
            txt = raw.decode("latin-1"); printable = sum(ch.isprintable() or ch in "\r\n\t" for ch in txt) / max(1, len(txt))
            log(f"  données {g.status_code} {size} o, {'texte' if printable > 0.95 else 'binaire'}")
            if printable > 0.95: log("```\n" + txt[:1500] + "\n```")
        except Exception as e: log(f"  données ÉCHEC {e!r}"[:150])
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
