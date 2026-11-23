#!/usr/bin/env python3
"""Télécharge les documents sources des fiches (dossiers de presse, fiches NSSDC et ESA) et en extrait le texte,
pour relever les valeurs chiffrées hors du bac à sable (qui ne joint pas ces sites).
Sortie : tools/probe/_out/sources/<clé>.txt (+ .pdf) et index.md (statut HTTP, URL finale)."""
import os, re, subprocess, html
import requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "sources"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
SRC = {
  "mex-factsheet": "https://www.esa.int/Science_Exploration/Space_Science/Mars_Express_factsheet",
  "mex-spacecraft": "https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/The_spacecraft",
  "mex-sci-factsheet": "https://sci.esa.int/web/mars-express/-/31022-fact-sheet",
  "mex-sci-engineering": "https://sci.esa.int/web/mars-express/31034-engineering",
  "mex-nssdc": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-022A",
  "lro-presskit": "https://webarchive.library.unt.edu/web/20090922191046/http:/lro.gsfc.nasa.gov/images/LRO_LCROSS_presskit.pdf",
  "lro-factsheet": "https://science.nasa.gov/wp-content/uploads/2024/01/lro-fact-sheet-bdf26a.pdf",
  "lro-nssdc": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2009-031A",
  "cassini-launch": "https://www.jpl.nasa.gov/news/press_kits/cassini.pdf",
  "cassini-arrival": "https://www.jpl.nasa.gov/news/press_kits/cassini-arrival.pdf",
  "cassini-end": "https://www.jpl.nasa.gov/news/press_kits/cassiniEndofMission.pdf",
  "cassini-nssdc": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1997-061A",
  "messenger-moi": "https://www.nasa.gov/pdf/525164main_MercuryMOI_PK.pdf",
  "messenger-launch": "https://webarchive.library.unt.edu/eot2008/20081102145358/http://www.nasa.gov/pdf/168019main_MESSENGER_71504_PressKit.pdf",
  "messenger-nssdc": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2004-030A",
  "mex-instruments": "https://www.esa.int/Science_Exploration/Space_Science/Mars_Express/Mars_Express_orbiter_instruments",
  "lro-presskit-raw": "https://webarchive.library.unt.edu/web/20090922191046id_/http://lro.gsfc.nasa.gov/images/LRO_LCROSS_presskit.pdf",
  "messenger-launch-raw": "https://webarchive.library.unt.edu/eot2008/20081102145358id_/http://www.nasa.gov/pdf/168019main_MESSENGER_71504_PressKit.pdf",
  "mro-arrival": "https://mars.nasa.gov/files/mro/mro-arrival.pdf",
  "mro-launch": "https://www.jpl.nasa.gov/news/press_kits/mro-launch.pdf",
  "mro-launch-unt": "https://webarchive.library.unt.edu/eot2008/20081025014401id_/http://www.jpl.nasa.gov/news/press_kits/mro-launch.pdf",
  "mro-nssdc": "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2005-029A",
  # niveaux de traitement des produits (CODMAC / PDS), pour la page « Mission et traitements »
  "pds3-sr": "https://pds.nasa.gov/datastandards/pds3/standards/sr/StdRef_20090227_v3.8.pdf",
  "pds4-proc": "https://pds.nasa.gov/datastandards/documents/im/current/index_1M00.html",
  "ode-mars-help": "https://ode.rsl.wustl.edu/mars/pagehelp/Content/Missions_Instruments/Mars%20Reconnaissance%20Orbiter/CTX/CTX.htm",
  "pds-glossary": "https://pds.nasa.gov/datastandards/documents/glossary/",
}
# fiches d'expériences de la NSSDCA (une par instrument) : identifiant COSPAR de la sonde suivi de -01, -02…
for _k, _cospar in (("mro", "2005-029A"), ("mex", "2003-022A"), ("lro", "2009-031A"), ("cassini", "1997-061A"), ("messenger", "2004-030A")):
    for _i in range(1, 15):
        SRC[f"{_k}-exp{_i:02d}"] = f"https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id={_cospar}-{_i:02d}"
ONLY = set(os.environ.get("ONLY", "").split()) or set(__import__("sys").argv[1:])
if ONLY: SRC = {k: v for k, v in SRC.items() if k in ONLY}
idx = ["| clé | statut | octets | URL finale |", "|---|---|---|---|"]
for k, u in SRC.items():
    try:
        r = S.get(u, timeout=180, allow_redirects=True)
        ct = r.headers.get("content-type", "")
        if r.content[:5] == b"%PDF-" or "pdf" in ct:
            open(os.path.join(OUT, k + ".pdf"), "wb").write(r.content)
            try:
                from pypdf import PdfReader
                open(os.path.join(OUT, k + ".txt"), "w").write("\n".join((pg.extract_text() or "") for pg in PdfReader(os.path.join(OUT, k + ".pdf")).pages))
            except Exception as e:
                print("  texte du PDF non extrait (le PDF reste disponible) :", repr(e)[:120])
        else:
            t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", r.text)
            t = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|h\d|td|th)>", "\n", t)
            t = html.unescape(re.sub(r"<[^>]+>", " ", t))
            t = "\n".join(re.sub(r"[ \t]+", " ", l).strip() for l in t.splitlines() if l.strip())
            open(os.path.join(OUT, k + ".txt"), "w").write(t)
        idx.append(f"| {k} | {r.status_code} | {len(r.content)} | {r.url} |")
    except Exception as e:
        idx.append(f"| {k} | ÉCHEC {repr(e)[:120]} | | {u} |")
    print(idx[-1], flush=True)
open(os.path.join(OUT, "index.md"), "w").write("\n".join(idx) + "\n")
