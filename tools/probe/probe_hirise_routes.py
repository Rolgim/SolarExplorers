#!/usr/bin/env python3
"""HiRISE : les serveurs de l'université d'Arizona refusent GitHub Actions (23/11/2026). Essaie d'autres voies :
1. Photojournal (NASA/JPL) : pages instrument HiRISE et JPEG PIA ;
2. images-api.nasa.gov (bibliothèque d'images de la NASA), recherche « HiRISE » ;
3. Wayback Machine (archive.org) pour un aperçu de hirise-pds ;
4. ODE (Géosciences, WUSTL) : liens de produits HiRISE ;
5. Mars Trek (NASA) : tuiles de mosaïques HiRISE.
Sortie : _out/hirise_routes/ (branche probe-out)."""
import os, re, json, requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "hirise_routes"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
REP = []
def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); REP.append(s)
def get(u, **kw):
    try:
        r = S.get(u, timeout=60, **kw); log(f"  {u} -> {r.status_code} {r.headers.get('content-type')} {len(r.content)} o"); return r
    except Exception as e: log("  ÉCHEC", u, repr(e)[:200]); return None
def save(name, r):
    if r is not None and r.ok and r.headers.get("content-type", "").startswith("image/"): open(os.path.join(OUT, name), "wb").write(r.content); log("   enregistré", name)

log("## 1. Photojournal")
r = get("https://photojournal.jpl.nasa.gov/instrument/HiRISE")
if r is not None and r.ok:
    pias = list(dict.fromkeys(re.findall(r'PIA\d{5}', r.text)))[:10]; log("  PIA :", pias)
    for m in re.finditer(r'(?i)(credit|courtesy)[^<]{0,200}', r.text[:200000]): log("  crédit :", m.group(0)[:200]); break
    for p in pias[:2]:
        rp = get(f"https://photojournal.jpl.nasa.gov/catalog/{p}")
        if rp is not None and rp.ok:
            for m in re.finditer(r'(?i)[^<>]{0,80}(Image Credit|credit)[^<>]{0,200}', rp.text): log("   ", m.group(0).strip()[:250])
            for m in re.finditer(r'(?i)(?:href|src)="([^"]+\.jpg)"', rp.text): log("    jpg", m.group(1))
        save(p + ".jpg", get(f"https://photojournal.jpl.nasa.gov/jpeg/{p}.jpg"))
        save(p + "_br.jpg", get(f"https://photojournal.jpl.nasa.gov/browse/{p}.jpg"))
log("\n## 2. images-api.nasa.gov")
r = get("https://images-api.nasa.gov/search?q=HiRISE&media_type=image")
if r is not None and r.ok:
    it = r.json().get("collection", {}).get("items", [])[:5]
    for i in it:
        d = i["data"][0]; log("  ", d.get("nasa_id"), "|", d.get("title"), "|", d.get("center"), "|", (d.get("secondary_creator") or "")[:80])
        for l in i.get("links", [])[:1]: save(d["nasa_id"] + ".jpg", get(l["href"]))
log("\n## 3. Wayback Machine")
P = "hirise-pds.lpl.arizona.edu/PDS/EXTRAS/RDR/ESP/ORB_088700_088799/ESP_088799_2535/ESP_088799_2535_RED.browse.jpg"
r = get("https://archive.org/wayback/available?url=" + P)
if r is not None and r.ok: log("  ", r.text[:400])
r = get("https://web.archive.org/cdx/search/cdx?url=hirise-pds.lpl.arizona.edu/PDS/EXTRAS/RDR/ESP/ORB_0*&matchType=prefix&limit=20&filter=mimetype:image/jpeg")
if r is not None and r.ok: log("  cdx :", r.text[:1500])
log("\n## 4. ODE")
r = get("https://oderest.rsl.wustl.edu/live2/?query=product&results=fp&output=JSON&target=mars&ihid=MRO&iid=HIRISE&pt=RDRV11&limit=3")
if r is not None and r.ok:
    log("  ", r.text[:800])
    for u in re.findall(r'https?://[^"\s]+\.(?:jpg|JPG|png)', r.text)[:3]: save(os.path.basename(u), get(u))
log("\n## 5. Mars Trek")
r = get("https://trek.nasa.gov/mars/TrekServices/ws/index/eq/searchItems?q=HiRISE&rows=5")
if r is not None and r.ok: log("  ", r.text[:1500])
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write("\n".join(REP) + "\n")
