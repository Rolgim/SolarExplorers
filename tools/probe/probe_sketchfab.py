#!/usr/bin/env python3
"""Sonde : métadonnées publiques d'une maquette Sketchfab (licence, auteur, téléchargeable, description) via l'API v3.
Usage : python tools/probe/probe_sketchfab.py <uid> [...]. Sortie : tools/probe/_out/sketchfab/<uid>.json et report.md.
Le téléchargement lui-même demande un compte Sketchfab (jeton) : la sonde ne télécharge rien."""
import os, sys, json, requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "sketchfab"); os.makedirs(OUT, exist_ok=True)
rep = []
for uid in sys.argv[1:]:
    r = requests.get("https://api.sketchfab.com/v3/models/" + uid, timeout=60, headers={"User-Agent": "explorateurs-probe/1.0"})
    rep.append(f"## {uid} -> {r.status_code}")
    if not r.ok: continue
    d = r.json(); json.dump(d, open(os.path.join(OUT, uid + ".json"), "w"), indent=1, ensure_ascii=False)
    u = d.get("user") or {}
    for k in ("name", "isDownloadable", "downloadType", "faceCount", "vertexCount", "publishedAt", "createdAt", "viewerUrl", "tags"):
        rep.append(f"- {k} : {json.dumps(d.get(k), ensure_ascii=False)[:300]}")
    rep.append(f"- license : {json.dumps(d.get('license'), ensure_ascii=False)}")
    rep.append(f"- user : {u.get('displayName')} ({u.get('username')}) {u.get('profileUrl')}")
    rep.append(f"- archives : {json.dumps(d.get('archives'), ensure_ascii=False)[:600]}")
    rep.append("- description :\n" + (d.get("description") or ""))
open(os.path.join(OUT, "report.md"), "w").write("\n".join(rep) + "\n"); print("\n".join(rep))
