#!/usr/bin/env python3
"""Fiches NSSDCA (sonde + toutes ses expériences) avec reprises : la base renvoie parfois « ORA-01403 » sous charge.
Les identifiants d'expériences sont lus dans la page de la sonde (pas devinés).
Sortie : tools/probe/_out/nssdc/<clé>.txt (texte) et <clé>.html."""
import os, re, sys, time, html
import requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "nssdc"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "Mozilla/5.0 (explorateurs-probe/1.0; +https://github.com/Rolgim/SolarExplorers)"
SC = {"ody": "2001-014A", "mgs": "1996-062A", "tgo": "2016-017A", "vex": "2005-045A", "mgn": "1989-033B", "clem": "1994-004A",
      "sln": "2007-039A", "lp": "1998-001A", "ch1": "2008-052A", "grail": "2011-046A", "kplo": "2022-096A", "vo1": "1975-075A"}
ONLY = sys.argv[1:]
if ONLY: SC = {k: v for k, v in SC.items() if k in ONLY}
BASE = "https://nssdc.gsfc.nasa.gov/nmc/"
def text(h):
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", h)
    t = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|h\d|td|th)>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return "\n".join(re.sub(r"[ \t]+", " ", l).strip() for l in t.splitlines() if l.strip())
def get(url):
    for i in range(6):
        try:
            r = S.get(url, timeout=90)
            if r.ok and "ORA-" not in r.text and "Errors and Messages" not in r.text: return r.text
        except Exception as e: print("  ", repr(e)[:100])
        time.sleep(4 * (i + 1))
    return None
for k, c in SC.items():
    h = get(BASE + "spacecraft/display.action?id=" + c)
    print(k, c, "OK" if h else "ÉCHEC", flush=True)
    if not h: continue
    open(f"{OUT}/{k}.html", "w").write(h); open(f"{OUT}/{k}.txt", "w").write(text(h))
    lh = get(BASE + "spacecraft/displayExperiment.action?spacecraftId=" + c) or ""   # liste des expériences de la sonde
    if lh: open(f"{OUT}/{k}_exps.txt", "w").write(text(lh))
    for e in sorted(set(re.findall(r"experiment/display\.action\?id=([0-9A-Z-]+)", h + lh))):
        time.sleep(2)
        eh = get(BASE + "experiment/display.action?id=" + e)
        print("  ", e, "OK" if eh else "ÉCHEC", flush=True)
        if eh: open(f"{OUT}/{k}_{e}.txt", "w").write(text(eh))
    time.sleep(3)
