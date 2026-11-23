#!/usr/bin/env python3
"""Trajectoires réelles (JPL Horizons) : vecteurs héliocentriques, plan de l'écliptique J2000, en unités astronomiques.
Pour chaque mission : la croisière de la sonde (de la séparation du lanceur à l'arrivée), et les orbites de la Terre
et du corps visé sur la même période. Écrit data/<id>-traj.json. Lancé par le workflow « Données réelles »."""
import json, os, re, time, datetime, requests
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
API = "https://ssd.jpl.nasa.gov/api/horizons.api"
H = {"User-Agent": "explorateurs-data/1.0 (+https://github.com/Rolgim/SolarExplorers)"}
# id : (identifiant Horizons de la sonde, début, fin de la croisière, corps visé (Horizons), pas)
MISSIONS = {
    "mro": ("-74", "2005-08-13", "2006-03-10", ("499", "Mars"), "1 d"),
}
def vectors(cmd, start, stop, step):
    q = {"format": "json", "COMMAND": f"'{cmd}'", "OBJ_DATA": "NO", "MAKE_EPHEM": "YES", "EPHEM_TYPE": "VECTORS", "CENTER": "'500@10'",
         "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'", "STEP_SIZE": f"'{step}'", "VEC_TABLE": "'1'", "REF_PLANE": "ECLIPTIC",
         "OUT_UNITS": "AU-D", "CSV_FORMAT": "YES", "VEC_LABELS": "NO"}
    for k in range(4):
        try:
            r = requests.get(API, params=q, headers=H, timeout=120); r.raise_for_status(); res = r.json()["result"]; break
        except Exception as e:
            print("  essai", k, cmd, repr(e)[:150]); time.sleep(10)
    else: raise RuntimeError("Horizons injoignable pour " + cmd)
    m = re.search(r"\$\$SOE(.*?)\$\$EOE", res, re.S)
    if not m: raise RuntimeError("réponse Horizons sans vecteurs pour " + cmd + " : " + res[:300])
    out = []
    for line in m.group(1).strip().splitlines():
        p = [x.strip() for x in line.split(",")]
        out.append([p[1].replace("A.D. ", "")[:11], round(float(p[2]), 5), round(float(p[3]), 5)])   # date, x, y (UA)
    return out
for mid, (sc, t0, t1, (body, bname), step) in MISSIONS.items():
    d0 = datetime.date.fromisoformat(t0)
    data = {"source": "JPL Horizons (ssd.jpl.nasa.gov), vecteurs héliocentriques, écliptique J2000, UA",
            "fetched": datetime.date.today().isoformat(), "horizons": sc, "start": t0, "stop": t1,
            "probe": vectors(sc, t0, t1, step),
            "earth": vectors("399", t0, (d0 + datetime.timedelta(days=366)).isoformat(), "4 d"),
            "target": {"name": bname, "horizons": body, "orbit": vectors(body, t0, (d0 + datetime.timedelta(days=700)).isoformat(), "4 d")}}
    path = os.path.join(ROOT, "data", mid + "-traj.json")
    json.dump(data, open(path, "w"), separators=(",", ":"))
    print(mid, len(data["probe"]), "points ->", path)
