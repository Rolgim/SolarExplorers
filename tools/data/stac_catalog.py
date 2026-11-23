#!/usr/bin/env python3
"""Collections STAC-PLANET des missions du site, tirées du relevé de la sonde (tools/probe/stacplanet-2026-11-23.md,
sortie de tools/probe/probe_stacplanet.py) : écrit src/data-stac.js, STAC_COLS[id] = [[collection, instrument, type, items, période]].
Usage : python tools/data/stac_catalog.py"""
import os, re, json
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "tools", "probe", "stacplanet-2026-11-23.md")
reg = open(os.path.join(ROOT, "src", "data-missions.js"), encoding="utf8").read()
pref = dict(re.findall(r"^    id:'(\w+)'.*?\n(?:.*\n)*?    horizons:'[^']*', stac:'([^']+)'", reg, re.M))
extra = {"messenger": ["ode-venus-messenger-"]}
out = {k: [] for k in pref}
for line in open(SRC, encoding="utf8"):
    m = re.match(r"^\| `([^`]+)` \|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|", line)
    if not m: continue
    cid, inst, typ, items, per = m.group(1), m.group(5).strip(), m.group(6).strip(), m.group(7).strip(), m.group(8).strip()
    for k, p in pref.items():
        if cid.startswith(p) or any(cid.startswith(x) for x in extra.get(k, [])):
            out[k].append([cid, inst, typ, int(items or 0), per.replace("→", "/").replace(" ", "")])
for k in out: out[k].sort()
open(os.path.join(ROOT, "src", "data-stac.js"), "w", encoding="utf8").write(
    "/* COLLECTIONS STAC-PLANET (PDSSP, CNES) par mission, relevées par la sonde du 23 novembre 2026 (tools/data/stac_catalog.py, ne pas éditer).\n"
    "   STAC_COLS[id] = [[collection, instrument, type de produit, nombre d'items, période]] ; API : https://stac.stacplanet.pdssp.eu */\n"
    "var STAC_API = 'https://stac.stacplanet.pdssp.eu';\nvar STAC_COLS = " + json.dumps(out, ensure_ascii=False, separators=(",", ":")).replace('],[', '],\n  [') + ";\n")
print({k: len(v) for k, v in out.items()})
