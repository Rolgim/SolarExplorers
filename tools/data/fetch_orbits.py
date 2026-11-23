#!/usr/bin/env python3
"""Trajectoires réelles (JPL Horizons) : vecteurs dans le plan de l'écliptique J2000, en unités astronomiques.
Pour chaque mission : la croisière de la sonde (de la séparation du lanceur à l'arrivée) et l'orbite des corps utiles
(départ, survols, arrivée) autour du même centre. Écrit data/<id>-traj.json. Lancé par le workflow « Données réelles ».
Usage : python tools/data/fetch_orbits.py [id …]   (sans argument : toutes)."""
import json, os, re, sys, time, datetime, requests
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
API = "https://ssd.jpl.nasa.gov/api/horizons.api"
H = {"User-Agent": "explorateurs-data/1.0 (+https://github.com/Rolgim/SolarExplorers)"}
SUN, EARTH = "500@10", "500@399"
# corps : (nom affiché, identifiant Horizons, durée d'orbite tracée en jours, pas, repères [(date, rôle)])
#   rôle : depart | survol | arrivee (la position du corps à cette date est marquée sur le dessin)
MISSIONS = {
    "mro": {"sc": "-74", "center": SUN, "start": "2005-08-13", "stop": "2006-03-10", "step": "1 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2005-08-13", "depart")]),
        ("Mars", "499", 700, "4 d", [("2006-03-10", "arrivee")])]},
    "mex": {"sc": "-41", "center": SUN, "start": "2003-06-03", "stop": "2003-12-25", "step": "1 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2003-06-03", "depart")]),
        ("Mars", "499", 700, "4 d", [("2003-12-25", "arrivee")])]},
    "lro": {"sc": "-85", "center": EARTH, "start": "2009-06-19 00:00", "stop": "2009-06-23 09:00", "step": "1 h", "bodies": [
        ("Lune", "301", 28, "6 h", [("2009-06-23", "arrivee")])]},
    "cassini": {"sc": "-82", "center": SUN, "start": "1997-10-16", "stop": "2004-07-01", "step": "2 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("1997-10-16", "depart"), ("1999-08-18", "survol")]),
        ("Vénus", "299", 225, "3 d", [("1998-04-26", "survol"), ("1999-06-24", "survol")]),
        ("Jupiter", "599", 4333, "20 d", [("2000-12-30", "survol")]),
        ("Saturne", "699", 10760, "30 d", [("2004-07-01", "arrivee")])]},
    "messenger": {"sc": "-236", "center": SUN, "start": "2004-08-04", "stop": "2011-03-17", "step": "2 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2004-08-04", "depart"), ("2005-08-02", "survol")]),
        ("Vénus", "299", 225, "3 d", [("2006-10-24", "survol"), ("2007-06-05", "survol")]),
        ("Mercure", "199", 88, "1 d", [("2008-01-14", "survol"), ("2008-10-06", "survol"), ("2009-09-29", "survol"), ("2011-03-18", "arrivee")])]},
}
def query(cmd, center, start, stop, step):
    q = {"format": "json", "COMMAND": f"'{cmd}'", "OBJ_DATA": "NO", "MAKE_EPHEM": "YES", "EPHEM_TYPE": "VECTORS", "CENTER": f"'{center}'",
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
    return [l for l in m.group(1).strip().splitlines()]
def vectors(cmd, center, start, stop, step, prec=5):
    out = []
    for line in query(cmd, center, start, stop, step):
        p = [x.strip() for x in line.split(",")]
        d = p[1].replace("A.D. ", "")
        out.append([d[:11] if step.endswith("d") else d[:17], round(float(p[2]), prec), round(float(p[3]), prec)])   # date, x, y (UA)
    return out
def position(cmd, center, date, prec):
    d = datetime.date.fromisoformat(date)
    return vectors(cmd, center, date, (d + datetime.timedelta(days=1)).isoformat(), "1 d", prec)[0]
def build(mid, c):
    prec = 7 if c["center"] == EARTH else 5
    d0 = datetime.date.fromisoformat(c["start"][:10])
    data = {"source": "JPL Horizons (ssd.jpl.nasa.gov), vecteurs " + ("géocentriques" if c["center"] == EARTH else "héliocentriques") + ", écliptique J2000, UA",
            "fetched": datetime.date.today().isoformat(), "horizons": c["sc"], "center": "Terre" if c["center"] == EARTH else "Soleil",
            "start": c["start"], "stop": c["stop"], "step": c["step"],
            "probe": vectors(c["sc"], c["center"], c["start"], c["stop"], c["step"], prec), "bodies": []}
    for name, hid, days, step, marks in c["bodies"]:
        data["bodies"].append({"name": name, "horizons": hid,
                               "orbit": vectors(hid, c["center"], c["start"][:10], (d0 + datetime.timedelta(days=days)).isoformat(), step, prec),
                               "marks": [[d, role] + position(hid, c["center"], d, prec)[1:] for d, role in marks]})
    path = os.path.join(ROOT, "data", mid + "-traj.json")
    json.dump(data, open(path, "w"), separators=(",", ":"), ensure_ascii=False)
    print(mid, len(data["probe"]), "points ->", path)
if __name__ == "__main__":
    want = sys.argv[1:] or list(MISSIONS)
    bad = 0
    for k in want:
        try: build(k, MISSIONS[k])
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
