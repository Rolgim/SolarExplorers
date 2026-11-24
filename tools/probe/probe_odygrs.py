#!/usr/bin/env python3
"""Sonde : pourquoi le spectre corrigé de Mars Odyssey GRS (CGS) tracé par plots.py est presque vide. Statistiques de la colonne."""
import os, sys, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data"))
import numpy as np, requests, plots
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "odygrs"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"; plots.S = S
R = []
def log(*a): s = " ".join(str(x) for x in a); print(s, flush=True); R.append(s)
c = "ode-mars-ody-grs-cgs"; f = plots.pick(c); lab = plots.label(plots.get(plots.asset(f, r"\.lbl$")).decode("latin-1")); u = plots.asset(f, r"\.dat$")
fmt = plots.get(plots.asset(f, r"\.fmt$")).decode("latin-1"); cols = plots.columns(fmt); raw = plots.get(u)
rows, rb = int(lab["TIME_SERIES.ROWS"]), int(lab["TIME_SERIES.ROW_BYTES"]); log("fichier", f["id"], len(raw), "octets ;", rows, "×", rb)
for x in cols[-12:]: log(" ", x)
log("FMT (fin) :", fmt[-2500:])
col = cols[-1]
for dt in (">f4", "<f4", ">i4", ">u4"):
    s = int(col["START_BYTE"]) - 1
    a = np.frombuffer(raw, dtype=np.uint8, count=rows * rb).reshape(rows, rb)[:, s:s + 65536]
    v = np.ascontiguousarray(a).view(np.dtype(dt)).reshape(rows, 16384).astype(float)
    log(dt, "min", np.nanmin(v), "max", np.nanmax(v), "nan", int(np.isnan(v).sum()), "zéros", int((v == 0).sum()), "négatifs", int((v < 0).sum()),
        "somme", np.nansum(v), "ligne 0 canaux 0-40 :", np.round(v[0, :40], 3).tolist())
    t = np.nansum(v, axis=0); log("   somme par canal, 1 canal sur 512 :", np.round(t[::512], 3).tolist())
for k in ("FIRST_CHANNEL", "LAST_CHANNEL", "FIRST_FULL_CHANNEL", "LAST_FULL_CHANNEL", "GAIN", "OFFSET", "PIXEL_DURATION"):
    x = next(y for y in cols if y["NAME"] == k); log(k, x, plots.column(raw, rows, rb, x)[:3, 0].tolist())
open(os.path.join(OUT, "report.md"), "w").write("\n".join(R) + "\n")
