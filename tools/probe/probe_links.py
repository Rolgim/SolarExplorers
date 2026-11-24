#!/usr/bin/env python3
"""Sonde : liens cassés. Toutes les URL citées par le site (src/*.js, src/en/*.js, data/*.json, CREDITS.md, README.md) sont
demandées une à une (HEAD, puis GET si le serveur refuse HEAD). Sortie : tools/probe/_out/links/report.md (branche probe-out)."""
import os, re, glob, json
from concurrent.futures import ThreadPoolExecutor
import requests
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "links"); os.makedirs(OUT, exist_ok=True)
files = glob.glob(os.path.join(ROOT, "src", "*.js")) + glob.glob(os.path.join(ROOT, "src", "en", "*.js")) + glob.glob(os.path.join(ROOT, "data", "*.json")) + [os.path.join(ROOT, "CREDITS.md"), os.path.join(ROOT, "README.md")]
urls = {}
for f in files:
    for u in re.findall(r"https?://[^\s'\"<>()\[\]\\|`]+", open(f, encoding="utf-8").read()):
        u = u.rstrip(".,;:»")
        if re.search(r"stac\.stacplanet\.pdssp\.eu/(search|collections/[^/]+/items\?)|\{|%s", u): continue
        urls.setdefault(u, set()).add(os.path.relpath(f, ROOT))
H = {"User-Agent": "Mozilla/5.0 (compatible; explorateurs-linkcheck/1.0; +https://github.com/Rolgim/SolarExplorers)"}
def check(u):
    try:
        r = requests.head(u, headers=H, timeout=40, allow_redirects=True)
        if r.status_code in (403, 405, 400, 404, 501) or r.status_code >= 500:
            r = requests.get(u, headers=H, timeout=60, allow_redirects=True, stream=True); r.close()
        return u, r.status_code, r.url
    except Exception as e: return u, "ERR " + type(e).__name__, ""
with ThreadPoolExecutor(12) as ex: res = list(ex.map(check, sorted(urls)))
bad = [r for r in res if not (isinstance(r[1], int) and r[1] < 400)]
rep = ["# Liens : %d URL, %d en erreur" % (len(res), len(bad)), ""] + ["- %s → %s  (%s)%s" % (u, s, ", ".join(sorted(urls[u])[:3]), (" redirigé vers " + f) if f and f != u else "") for u, s, f in bad]
open(os.path.join(OUT, "report.md"), "w").write("\n".join(rep) + "\n")
json.dump([[u, s, f] for u, s, f in res], open(os.path.join(OUT, "all.json"), "w"), indent=0)
print("\n".join(rep))
