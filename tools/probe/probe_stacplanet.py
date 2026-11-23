#!/usr/bin/env python3
"""Sonde de STAC-PLANET (PDSSP, https://stacplanet.pdssp.eu/) : ce que le catalogue expose vraiment.

Étape 2 du dossier de lancement. Rien n'est écrit dans le dépôt : tout va dans tools/probe/_out/stacplanet/,
que le workflow « Sonde » pousse seul sur la branche probe-out, et le résumé va dans le récapitulatif du job.

1. Adresse de l'API : la page publique est une application JavaScript ; on lit sa page et ses scripts
   pour y relever les URL candidates, puis on essaie quelques adresses usuelles (marquées « supposées »).
   Une adresse est retenue si elle répond un document STAC (champ stac_version ou liens rel=self/root).
2. Racine : stac_version, conformsTo, liens (children, data, search).
3. Collections : /collections (pages suivies) et, à défaut ou en plus, le parcours des catalogues enfants
   (le catalogue est rangé par corps cible puis par fournisseur). Pour chacune : titre, cible (ssys:targets),
   mission, plateforme, instruments (summaries), extensions, étendue, licence, fournisseurs.
4. Nombre d'items : /search (numberMatched ou context.matched), sinon /collections/{id}/items.
5. Un item par collection : propriétés, type de géométrie, bbox, assets (clé, type, rôles, hôte).

Usage : python tools/probe/probe_stacplanet.py [URL_API]   (URL_API facultative : saute la découverte)
Variables : MAX_COLL (défaut 3000) collections examinées au plus ; MAX_DEPTH (défaut 6) profondeur du parcours.
"""
import json, os, re, sys, time
from urllib.parse import urljoin, urlparse
import requests

PUBLIC = "https://stacplanet.pdssp.eu/"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "stacplanet")
os.makedirs(os.path.join(OUT, "items"), exist_ok=True)
MAX_COLL = int(os.environ.get("MAX_COLL", "3000"))
MAX_DEPTH = int(os.environ.get("MAX_DEPTH", "6"))
H = {"User-Agent": "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)", "Accept": "application/json, application/geo+json, */*;q=0.5"}
S = requests.Session(); S.headers.update(H)
LOG = []


def log(*a):
    s = " ".join(str(x) for x in a); print(s, flush=True); LOG.append(s)


def get(u, params=None, accept_json=True, tries=3, method="GET", body=None):
    """GET (ou POST) avec reprises ; renvoie (statut, json ou texte, url finale) ou (None, erreur, u)."""
    for k in range(tries):
        try:
            r = S.post(u, json=body, timeout=60) if method == "POST" else S.get(u, params=params, timeout=60)
            if r.status_code >= 500 and k < tries - 1: time.sleep(3 * (k + 1)); continue
            if accept_json:
                try: return r.status_code, r.json(), r.url
                except ValueError: return r.status_code, r.text[:2000], r.url
            return r.status_code, r.text, r.url
        except Exception as e:
            err = repr(e)[:200]
            if k < tries - 1: time.sleep(3 * (k + 1)); continue
            return None, err, u


def is_stac(j):
    return isinstance(j, dict) and ("stac_version" in j or any(isinstance(l, dict) and l.get("rel") in ("self", "root") for l in j.get("links", [])))


def links(j, *rels):
    return [l for l in (j.get("links") or []) if isinstance(l, dict) and (not rels or l.get("rel") in rels)]


def save(name, obj):
    with open(os.path.join(OUT, name), "w") as f: json.dump(obj, f, indent=1, ensure_ascii=False)


# ---------- 1. adresse de l'API ----------
def discover():
    found = []   # (url, origine)
    st, html, fin = get(PUBLIC, accept_json=False)
    log(f"## Découverte\n\nPage publique {PUBLIC} : statut {st}, {len(html) if isinstance(html, str) else 0} caractères")
    if st == 200 and isinstance(html, str):
        with open(os.path.join(OUT, "page.html"), "w") as f: f.write(html)
        scripts = re.findall(r'<script[^>]+src="([^"]+)"', html) + re.findall(r"<script[^>]+src='([^']+)'", html)
        scripts += [m for m in re.findall(r'href="([^"]+\.js)"', html)]
        for cfg in ("config.json", "env.js", "config.js", "assets/config.json", "app.config.json", "runtime-config.js", "settings.json"):
            scripts.append(cfg)
        # l'application (React + Cesium) lit sa configuration au démarrage, dont STAC_API_URL :
        # /config/config.stacplanet.json, puis config.stacplanet.local.json, puis config.json (relevé dans son bundle, 23/11/2026)
        for cfg in ("config/config.stacplanet.json", "config/config.stacplanet.local.json", "config/config.json"):
            st3, cj, _ = get(urljoin(PUBLIC, cfg), tries=2)
            log(f"- configuration {cfg} : statut {st3}{' (JSON)' if isinstance(cj, dict) else ''}")
            if st3 == 200 and isinstance(cj, dict):
                save(os.path.basename(cfg), cj)
                for k, v in cj.items():
                    if isinstance(v, str) and v.startswith("http") and re.search(r"URL", k):
                        log(f"  - {k} = {v}")
                api = cj.get("STAC_API_URL")
                if api:
                    found.insert(0, (urljoin(PUBLIC, api), "STAC_API_URL de " + cfg))
                    break
        texts = [("page", html)]
        for s in dict.fromkeys(scripts):
            u = urljoin(fin or PUBLIC, s)
            if urlparse(u).netloc and urlparse(u).netloc != urlparse(PUBLIC).netloc and not u.startswith("https://stacplanet"):
                continue   # bibliothèques tierces (CDN) : inutiles ici
            st2, t, _ = get(u, accept_json=False, tries=1)
            log(f"- script {u} : statut {st2}, {len(t) if isinstance(t, str) else 0} caractères")
            if st2 == 200 and isinstance(t, str):
                if t.strip() == html.strip():
                    log("  (la même page HTML : l'application renvoie sa page pour toute adresse inconnue)"); continue
                texts.append((u, t))
                if "/cesium/" not in u:   # le bundle de l'application, gardé pour lecture hors ligne
                    os.makedirs(os.path.join(OUT, "bundle"), exist_ok=True)
                    with open(os.path.join(OUT, "bundle", os.path.basename(urlparse(u).path) or "index.js"), "w") as f: f.write(t)
        # extraits du bundle autour des mots qui désignent une API (l'adresse peut y être relative ou assemblée)
        with open(os.path.join(OUT, "snippets.txt"), "w") as f:
            for origin, t in texts:
                if "/cesium/" in origin: continue
                for m in re.finditer(r"stac_?url|stacUrl|STAC_|apiUrl|API_URL|baseURL|baseUrl|catalogUrl|/collections|/search|VITE_|fetch\(", t):
                    f.write(f"--- {origin} @{m.start()}\n{t[max(0, m.start() - 220):m.end() + 220]}\n")
        urls = {}
        for origin, t in texts:
            for m in re.findall(r'https?://[A-Za-z0-9._~:/?#\[\]@!$&()*+,;=%-]+', t):
                m = m.rstrip("\\'\",);")
                if re.search(r"stac|api|pdssp|catalog|search|collections", m, re.I) and not re.search(r"\.(png|jpe?g|svg|woff2?|css)(\?|$)", m, re.I) \
                        and not re.search(r"stac-extensions\.github\.io|schemas\.stacspec|api\.stacspec\.org|opengis\.net|stackoverflow|jsperf|arcgis|bentley|github\.com|w3\.org|openlayers|leaflet|maplibre|mapbox|cesium|googleapis", m, re.I):
                    urls.setdefault(m, origin)
            for m in re.findall(r'["\'](/(?:api|stac)[A-Za-z0-9/_.-]*)["\']', t):
                urls.setdefault(urljoin(PUBLIC, m), origin + " (chemin relatif)")
        log(f"\nURL candidates relevées dans la page et ses scripts : {len(urls)}")
        for u, o in sorted(urls.items()):
            log(f"- {u}  ← {o}"); found.append((u, "relevée dans " + o))
    for g in ("https://stacplanet.pdssp.eu/api/", "https://stacplanet.pdssp.eu/api/stac/", "https://stacplanet.pdssp.eu/stac/",
              "https://stacplanet.pdssp.eu/api/v1/", "https://api.stacplanet.pdssp.eu/", "https://stac.pdssp.eu/",
              "https://api.pdssp.eu/stac/", "https://pdssp.eu/stac/", "https://stacplanet.pdssp.eu/catalog.json"):
        found.append((g, "supposée"))
    log(f"\nAdresses essayées : {len(found)} (dont {sum(w == 'supposée' for _, w in found)} supposées, journalisées seulement si elles répondent autre chose que 404)")
    roots = []
    seen = set()
    for u, why in found:
        for v in dict.fromkeys([u, u.rstrip("/") + "/"]):
            if v in seen: continue
            seen.add(v)
            st, j, fin = get(v, tries=1)
            ok = st == 200 and is_stac(j)
            if ok or why != "supposée" or st not in (None, 404):
                log(f"- essai {v} ({why}) : statut {st}{' — document STAC' if ok else ''}")
            if ok:
                roots.append((fin, j, why))
    return roots


# ---------- 2 à 5 ----------
def pick_root(roots):
    """Racine d'API : on préfère un document qui annonce /search ou une conformité « item-search »."""
    def score(r):
        _, j, why = r
        c = " ".join(j.get("conformsTo") or [])
        return (("item-search" in c) + ("collections" in c) + bool(links(j, "search")) + bool(links(j, "data")), why != "supposée")
    roots.sort(key=score, reverse=True)
    return roots[0] if roots else None


def collection_ids_from_api(root_url, root):
    cols = []
    data = links(root, "data")
    u = data[0]["href"] if data else urljoin(root_url.rstrip("/") + "/", "collections")
    pages = 0
    while u and pages < 50 and len(cols) < MAX_COLL:
        st, j, _ = get(u)
        pages += 1
        if st != 200 or not isinstance(j, dict): log(f"- {u} : statut {st}"); break
        cols += [c for c in j.get("collections", []) if isinstance(c, dict)]
        nx = links(j, "next")
        u = nx[0]["href"] if nx else None
        if pages == 1: log(f"- {u or 'pas de page suivante'} ; numberMatched={j.get('numberMatched')} numberReturned={j.get('numberReturned')}")
    return cols


def walk_children(url, doc, depth, path, acc, seen):
    """Parcours des catalogues enfants (rangement corps → fournisseur) ; acc reçoit (chemin, collection)."""
    if depth > MAX_DEPTH or len(acc) >= MAX_COLL: return
    for l in links(doc, "child"):
        cu = urljoin(url, l["href"])
        if cu in seen: continue
        seen.add(cu)
        st, j, fin = get(cu, tries=2)
        if st != 200 or not isinstance(j, dict): log(f"  {'  ' * depth}- {cu} : statut {st}"); continue
        label = j.get("title") or j.get("id") or cu
        if j.get("type") == "Collection" or "extent" in j:
            acc.append((path + [label], j, fin or cu))
        else:
            log(f"  {'  ' * depth}- catalogue « {label} » ({len(links(j, 'child'))} enfants)")
        walk_children(fin or cu, j, depth + 1, path + [label], acc, seen)


def first(x):
    if isinstance(x, list): return ", ".join(str(v) for v in x[:6]) + (" …" if len(x) > 6 else "")
    return "" if x is None else str(x)


def summ(c, *keys):
    s = c.get("summaries") or {}
    for k in keys:
        v = c.get(k)
        if v is None: v = s.get(k)
        if isinstance(v, dict) and "minimum" not in v: v = list(v.keys())
        if v not in (None, [], ""): return first(v)
    return ""


def count_items(root_url, root, cid, col_url):
    if root and (links(root, "search") or "item-search" in " ".join(root.get("conformsTo") or [])):
        su = links(root, "search")[0]["href"] if links(root, "search") else urljoin(root_url.rstrip("/") + "/", "search")
        st, j, _ = get(su, params={"collections": cid, "limit": 1}, tries=2)
        if st != 200 or not isinstance(j, dict):
            st, j, _ = get(su, method="POST", body={"collections": [cid], "limit": 1}, tries=2)
        if st == 200 and isinstance(j, dict):
            n = j.get("numberMatched", (j.get("context") or {}).get("matched"))
            feats = j.get("features") or []
            if feats or not n: return n, (feats[0] if feats else None), "search"
            # compte donné mais aucun item renvoyé : on lit l'item par /collections/{id}/items
            st2, j2, _ = get(urljoin(root_url.rstrip("/") + "/", f"collections/{cid}/items"), params={"limit": 1}, tries=2)
            f2 = (j2.get("features") or []) if st2 == 200 and isinstance(j2, dict) else []
            if not f2: log(f"  {cid} : search sans item (clés {sorted(j.keys())}) ; items : statut {st2}")
            return n, (f2[0] if f2 else None), "search + items"
    iu = None
    for l in links(col_url[1], "items"): iu = urljoin(col_url[0], l["href"])
    if not iu and root_url: iu = urljoin(root_url.rstrip("/") + "/", f"collections/{cid}/items")
    if iu:
        st, j, _ = get(iu, params={"limit": 1}, tries=2)
        if st == 200 and isinstance(j, dict):
            feats = j.get("features") or []
            return j.get("numberMatched", (j.get("context") or {}).get("matched")), (feats[0] if feats else None), "items"
    # catalogue statique : liens rel=item
    il = links(col_url[1], "item")
    if il:
        st, j, _ = get(urljoin(col_url[0], il[0]["href"]), tries=2)
        return f"≥ {len(il)} (liens item)", (j if st == 200 and isinstance(j, dict) else None), "statique"
    return None, None, "aucun"


def describe_item(it):
    if not isinstance(it, dict): return {}
    p = it.get("properties") or {}
    g = it.get("geometry") or {}
    assets = []
    for k, a in (it.get("assets") or {}).items():
        if not isinstance(a, dict): continue
        assets.append({"key": k, "type": a.get("type"), "roles": a.get("roles"), "host": urlparse(a.get("href", "")).netloc,
                       "ext": os.path.splitext(urlparse(a.get("href", "")).path)[1], "title": a.get("title")})
    return {"id": it.get("id"), "datetime": p.get("datetime") or p.get("start_datetime"), "geometry": g.get("type") if isinstance(g, dict) else None,
            "bbox": it.get("bbox"), "stac_extensions": it.get("stac_extensions"), "property_keys": sorted(p.keys()),
            "targets": p.get("ssys:targets"), "platform": p.get("platform"), "mission": p.get("mission"), "instruments": p.get("instruments"),
            "product_type": p.get("product:type"), "processing_level": p.get("processing:level"), "assets": assets,
            "links": sorted({l.get("rel") for l in links(it)})}


def main():
    t0 = time.time()
    roots = []
    if len(sys.argv) > 1:
        st, j, fin = get(sys.argv[1])
        log(f"API imposée {sys.argv[1]} : statut {st}")
        if st == 200 and is_stac(j): roots = [(fin, j, "imposée")]
    else:
        roots = discover()
    save("roots.json", [{"url": u, "why": w, "id": j.get("id"), "title": j.get("title")} for u, j, w in roots])
    R = pick_root(roots)
    md = ["# Sonde STAC-PLANET", "", f"Date : {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}", ""]
    if not R:
        log("\nAUCUNE racine STAC trouvée : voir page.html et la liste des URL candidates ci-dessus.")
        md += ["**Aucune racine STAC trouvée.**", "", "```", *LOG, "```"]
        finish(md); return
    root_url, root, why = R
    save("root.json", root)
    conf = root.get("conformsTo") or []
    md += ["## Racine", "", f"- URL : {root_url} ({why})", f"- id : {root.get('id')} · titre : {root.get('title')}",
           f"- stac_version : {root.get('stac_version')}", f"- type : {root.get('type')}",
           "- liens : " + ", ".join(sorted({str(l.get("rel")) for l in links(root)})),
           f"- search : {', '.join(l['href'] for l in links(root, 'search')) or 'non annoncé'}",
           f"- conformsTo ({len(conf)}) :", *[f"  - {c}" for c in conf], ""]
    other = [u for u, _, _ in roots if u != root_url]
    if other: md += ["Autres documents STAC trouvés : " + ", ".join(other), ""]

    # collections : API puis parcours des enfants
    log("\n## Collections")
    api_cols = collection_ids_from_api(root_url, root)
    log(f"- /collections : {len(api_cols)} collections")
    tree = []
    walk_children(root_url, root, 0, [], tree, set())
    log(f"- parcours des catalogues enfants : {len(tree)} collections")
    paths = {c.get("id"): (p, u) for p, c, u in tree}
    cols = {}
    for c in api_cols: cols[c.get("id")] = (c, urljoin(root_url.rstrip("/") + "/", f"collections/{c.get('id')}"))
    for p, c, u in tree: cols.setdefault(c.get("id"), (c, u))
    save("collections.json", [c for c, _ in cols.values()])

    rows, details = [], []
    for i, (cid, (c, cu)) in enumerate(cols.items()):
        if i >= MAX_COLL: break
        n, it, how = count_items(root_url, root, cid, (cu, c))
        d = describe_item(it)
        if it: save(os.path.join("items", re.sub(r"[^A-Za-z0-9_.-]", "_", str(cid)) + ".json"), it)
        ext = c.get("extent") or {}
        tint = ((ext.get("temporal") or {}).get("interval") or [[None, None]])[0]
        row = {"id": cid, "title": c.get("title"), "path": " / ".join(paths.get(cid, ([], ""))[0]),
               "targets": summ(c, "ssys:targets") or first(d.get("targets")), "target_class": summ(c, "ssys:target_class"),
               "mission": summ(c, "mission") or first(d.get("mission")), "platform": summ(c, "platform") or first(d.get("platform")),
               "instruments": summ(c, "instruments") or first(d.get("instruments")), "product_type": summ(c, "product:type") or first(d.get("product_type")),
               "items": n, "count_via": how, "temporal": tint, "license": c.get("license"),
               "providers": [p.get("name") for p in c.get("providers") or [] if isinstance(p, dict)],
               "extensions": c.get("stac_extensions"), "item_assets": list((c.get("item_assets") or {}).keys()),
               "first_item": d}
        rows.append(row)
        log(f"- {cid} : {row['targets']} | {row['mission'] or row['platform']} | {row['instruments']} | {n} items ({how})")
    save("summary.json", rows)

    md += [f"## Collections ({len(rows)})", "", "| Collection | Rangement | Cible | Mission / plateforme | Instruments | Type de produit | Items | Période |",
           "|---|---|---|---|---|---|---|---|"]
    for r in sorted(rows, key=lambda r: (str(r["targets"]), str(r["mission"] or r["platform"]), str(r["id"]))):
        per = " → ".join(str(x)[:10] for x in (r["temporal"] or []) if x)
        md.append(f"| `{r['id']}` | {r['path']} | {r['targets']} | {r['mission'] or r['platform']} | {r['instruments']} | {r['product_type']} | {r['items'] if r['items'] is not None else '?'} | {per} |")
    agg = {}
    for r in rows:
        k = (r["targets"] or "?", (r["mission"] or r["platform"] or "?"))
        a = agg.setdefault(k, {"n": 0, "items": 0, "inst": set(), "platform": set()})
        a["n"] += 1; a["items"] += r["items"] if isinstance(r["items"], int) else 0
        a["inst"].add(r["instruments"] or "?"); a["platform"].add(r["platform"] or "")
    md += ["", "## Synthèse par cible et par mission", "", "| Cible | Mission (champ mission, sinon platform) | Plateforme | Collections | Items | Instruments |", "|---|---|---|---|---|---|"]
    for (t, m), a in sorted(agg.items(), key=lambda kv: (kv[0][0], -kv[1]["items"])):
        md.append(f"| {t} | {m} | {', '.join(sorted(x for x in a['platform'] if x))} | {a['n']} | {a['items']} | {'; '.join(sorted(a['inst']))} |")
    md += ["", "## Un item par collection", ""]
    for r in rows:
        d = r["first_item"]
        if not d: md.append(f"- `{r['id']}` : aucun item lu"); continue
        a = "; ".join(f"{x['key']} ({x['type'] or '?'}, {','.join(x['roles'] or [])}, {x['host']}{x['ext']})" for x in d["assets"])
        md.append(f"- `{r['id']}` → item `{d['id']}` · {d['datetime']} · géométrie {d['geometry']} · assets : {a}")
        md.append(f"  - propriétés : {', '.join(d['property_keys'])}")
    exts = sorted({e for r in rows for e in (r["extensions"] or []) + ((r["first_item"] or {}).get("stac_extensions") or [])})
    md += ["", "## Extensions utilisées", "", *[f"- {e}" for e in exts], "", f"Durée : {time.time() - t0:.0f} s"]
    finish(md)


def finish(md):
    txt = "\n".join(md) + "\n"
    with open(os.path.join(OUT, "probe.md"), "w") as f: f.write(txt)
    with open(os.path.join(OUT, "log.txt"), "w") as f: f.write("\n".join(LOG) + "\n")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f: f.write(txt[:900000])
    print("\n" + txt)


if __name__ == "__main__":
    main()
