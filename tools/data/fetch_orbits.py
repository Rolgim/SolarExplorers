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
    "ody": {"sc": "-53", "center": SUN, "start": "2001-04-08", "stop": "2001-10-24", "step": "1 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2001-04-08", "depart")]),
        ("Mars", "499", 700, "4 d", [("2001-10-24", "arrivee")])]},
    "tgo": {"sc": "-143", "center": SUN, "start": "2016-03-15", "stop": "2016-10-19", "step": "1 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2016-03-15", "depart")]),
        ("Mars", "499", 700, "4 d", [("2016-10-19", "arrivee")])]},
    "vex": {"sc": "-248", "center": SUN, "start": "2005-11-10", "stop": "2006-04-11", "step": "1 d", "bodies": [
        ("Terre", "399", 366, "4 d", [("2005-11-10", "depart")]),
        ("Vénus", "299", 225, "3 d", [("2006-04-11", "arrivee")])]},
    # Clementine : Horizons ne couvre que l'orbite lunaire (19 février – 3 mai 1994), pas le transfert depuis la Terre
    "clem": {"sc": "-40", "center": EARTH, "start": "1994-02-19 13:00", "stop": "1994-05-03 12:00", "step": "6 h", "bodies": [
        ("Lune", "301", 28, "6 h", [("1994-02-20", "arrivee")])]},
}
def query(cmd, center, start, stop, step, units="AU-D"):
    q = {"format": "json", "COMMAND": f"'{cmd}'", "OBJ_DATA": "NO", "MAKE_EPHEM": "YES", "EPHEM_TYPE": "VECTORS", "CENTER": f"'{center}'",
         "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'", "STEP_SIZE": f"'{step}'", "VEC_TABLE": "'1'", "REF_PLANE": "ECLIPTIC",
         "OUT_UNITS": units, "CSV_FORMAT": "YES", "VEC_LABELS": "NO"}
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
# vue d'ensemble (accueil « Système solaire ») : positions héliocentriques des planètes, de Pluton et des sondes, éléments des satellites, à pas régulier,
# du lancement de Cassini à aujourd'hui ; chaque série = { t0, step (jours), xy:[x0, y0, x1, y1, …] } en UA (3 décimales ≈ 150 000 km)
SOLAR_T0 = "1997-10-01"
# planètes et Pluton : (nom, id Horizons, pas de la série datée en jours, période orbitale approchée en jours, servant seulement à
# échantillonner un tour complet pour tracer l'orbite)
PLANETS = [("Mercure", "199", 3, 88), ("Vénus", "299", 6, 225), ("Terre", "399", 6, 365), ("Mars", "499", 8, 687), ("Jupiter", "599", 30, 4333),
           ("Saturne", "699", 30, 10759), ("Uranus", "799", 60, 30687), ("Neptune", "899", 60, 60190), ("Pluton", "999", 60, 90560)]
# satellites : (nom, id Horizons, corps central) ; éléments orbitaux osculateurs autour du corps central tous les 180 jours (30 jours pour
# les plus rapides, FAST), interpolés par la page entre deux époques (longitude moyenne au mouvement moyen effectif entre les deux)
FAST = {"401", "601", "602"}
MOONS = [("Lune", "301", "399"), ("Phobos", "401", "499"), ("Deimos", "402", "499"),
         ("Io", "501", "599"), ("Europe", "502", "599"), ("Ganymède", "503", "599"), ("Callisto", "504", "599"),
         ("Mimas", "601", "699"), ("Encelade", "602", "699"), ("Téthys", "603", "699"), ("Dioné", "604", "699"), ("Rhéa", "605", "699"),
         ("Titan", "606", "699"), ("Japet", "608", "699"),
         ("Miranda", "705", "799"), ("Ariel", "701", "799"), ("Umbriel", "702", "799"), ("Titania", "703", "799"), ("Obéron", "704", "799"),
         ("Triton", "801", "899"), ("Charon", "901", "999")]
def elements(cmd, center, start, stop, step):
    q = {"format": "json", "COMMAND": f"'{cmd}'", "OBJ_DATA": "NO", "MAKE_EPHEM": "YES", "EPHEM_TYPE": "ELEMENTS", "CENTER": f"'500@{center}'",
         "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'", "STEP_SIZE": f"'{step}'", "REF_PLANE": "ECLIPTIC", "OUT_UNITS": "KM-D", "CSV_FORMAT": "YES"}
    for k in range(4):
        try:
            r = requests.get(API, params=q, headers=H, timeout=120); r.raise_for_status(); res = r.json()["result"]; break
        except Exception as e:
            print("  essai", k, cmd, repr(e)[:150]); time.sleep(10)
    else: raise RuntimeError("Horizons injoignable pour " + cmd)
    m = re.search(r"\$\$SOE(.*?)\$\$EOE", res, re.S)
    if not m: raise RuntimeError("réponse Horizons sans éléments pour " + cmd + " : " + res[:300])
    out = []
    for line in m.group(1).strip().splitlines():
        p = [x.strip() for x in line.split(",")]
        # JD, a (km), e, i, Ω, ω (degrés), M (degrés), n (degrés/jour)
        out.append([round(float(p[0]), 1), round(float(p[11]), 1), round(float(p[2]), 6), round(float(p[4]), 4), round(float(p[5]), 4), round(float(p[6]), 4), round(float(p[9]), 4), float("%.9g" % float(p[8]))])
    return out
# sondes : du lancement à la fin de mission (ou à aujourd'hui) ; repli sur la croisière si Horizons ne couvre pas toute la durée
PROBES = [("mro", "-74", "2005-08-13", None), ("mex", "-41", "2003-06-03", None), ("lro", "-85", "2009-06-19", None),
          ("cassini", "-82", "1997-10-16", "2017-09-15"), ("messenger", "-236", "2004-08-04", "2015-04-30"),
          ("ody", "-53", "2001-04-08", None), ("tgo", "-143", "2016-03-15", None), ("vex", "-248", "2005-11-10", "2014-11-27")]
# orbites des sondes autour de leur corps : une fenêtre par an (du début de la phase en orbite à la fin, ou au téléchargement),
# vecteurs centrés sur le corps, en km, écliptique J2000 : (id, sonde, corps Horizons, nom du corps, début, fin, durée en minutes, pas en minutes)
ORBITERS = [("mro", "-74", "499", "Mars", "2006-11-15", None, 120, 1), ("mex", "-41", "499", "Mars", "2004-02-01", None, 440, 2),
            ("lro", "-85", "301", "Lune", "2009-09-20", None, 120, 1), ("cassini", "-82", "699", "Saturne", "2004-08-01", "2017-09-10", 43200, 180),
            ("messenger", "-236", "199", "Mercure", "2011-04-04", "2015-04-28", 750, 3),
            ("ody", "-53", "499", "Mars", "2002-02-20", None, 120, 1), ("tgo", "-143", "499", "Mars", "2018-04-21", None, 120, 1),
            ("vex", "-248", "299", "Vénus", "2006-06-01", "2014-11-20", 1440, 5), ("clem", "-40", "301", "Lune", "1994-02-22", "1994-05-01", 330, 1)]
def probe_orbits(today):
    out = []
    for mid, sc, cen, body, first, last, dur, st in ORBITERS:
        last = last or today; y0, y1 = int(first[:4]), int(last[:4]); samples = []
        for y in range(y0, y1 + 1):
            d = max(datetime.date.fromisoformat(first), datetime.date(y, 1, 15)) if y == y0 else datetime.date(y, 1, 15)
            if y == y1 and y1 != y0: d = min(datetime.date(y, 1, 15), datetime.date.fromisoformat(last) - datetime.timedelta(days=dur // 1440 + 1))
            a = datetime.datetime.combine(d, datetime.time()); b = a + datetime.timedelta(minutes=dur)
            try:
                rows = query(sc, f"500@{cen}", a.strftime("%Y-%m-%d %H:%M"), b.strftime("%Y-%m-%d %H:%M"), f"{st} m", "KM-S")
                xy, z = [], []   # z : hauteur au-dessus de l'écliptique, pour cacher la partie de l'orbite passée derrière le corps (vue de dessus)
                for line in rows:
                    p = [x.strip() for x in line.split(",")]; xy += [round(float(p[2])), round(float(p[3]))]; z.append(round(float(p[4])))
                samples.append({"t0": d.isoformat(), "step_min": st, "xy": xy, "z": z}); print("orbite", mid, d, len(xy) // 2)
            except Exception as e: print("  ÉCHEC orbite", mid, d, repr(e)[:200])
        out.append({"id": mid, "body": body, "center": cen, "samples": samples})
    return out
def series(cmd, start, stop, step_d):
    v = vectors(cmd, SUN, start, stop, f"{step_d} d", 3)
    return {"t0": v[0][0], "step": step_d, "n": len(v), "xy": [c for p in v for c in p[1:]]}
def solar():
    today = datetime.date.today().isoformat()
    # planètes et satellites : jusqu'à deux ans après le téléchargement (éphémérides calculées par Horizons, signalées « prévision » sur la page),
    # pour que la lecture parte d'aujourd'hui ; les sondes s'arrêtent au jour du téléchargement
    until = (datetime.date.today() + datetime.timedelta(days=730)).isoformat()
    out = {"source": "JPL Horizons (ssd.jpl.nasa.gov), vecteurs héliocentriques, écliptique J2000, UA", "fetched": today, "until": until,
           "planets": [], "probes": []}
    d0 = datetime.date.fromisoformat(SOLAR_T0)
    for name, hid, st, per in PLANETS:
        o0 = d0 if per < 60000 else datetime.date(1950, 1, 1)   # Horizons ne donne pas Pluton après 2199 : son tour commence en 1950
        o = series(hid, o0.isoformat(), (o0 + datetime.timedelta(days=per + per // 240 + 1)).isoformat(), max(1, per // 240))
        out["planets"].append(dict(name=name, horizons=hid, orbit=o["xy"], **series(hid, SOLAR_T0, until, st)))
        print("planète", name, out["planets"][-1]["n"], "orbite", o["n"])
    out["moons"] = []
    for name, hid, center in MOONS:
        try:
            out["moons"].append({"name": name, "horizons": hid, "center": center, "el": elements(hid, center, SOLAR_T0, until, "30 d" if hid in FAST else "180 d")}); print("satellite", name, len(out["moons"][-1]["el"]))
        except Exception as e: print("  ÉCHEC satellite", name, repr(e)[:200])
    for mid, hid, start, stop in PROBES:
        stop = stop or today
        for a, b in ((start, stop), (start, MISSIONS[mid]["stop"][:10])):
            try:
                out["probes"].append(dict(id=mid, horizons=hid, full=(b == stop), **series(hid, start, b, 4))); print("sonde", mid, a, b, out["probes"][-1]["n"]); break
            except Exception as e: print("  repli", mid, repr(e)[:200])
    out["orbits"] = probe_orbits(today)
    json.dump(out, open(os.path.join(ROOT, "data", "solar.json"), "w"), separators=(",", ":"), ensure_ascii=False)
if __name__ == "__main__":
    want = sys.argv[1:] or list(MISSIONS) + ["solar"]
    bad = 0
    for k in want:
        try: solar() if k == "solar" else build(k, MISSIONS[k])
        except Exception as e: bad += 1; print("ÉCHEC", k, repr(e)[:300])
    sys.exit(1 if bad == len(want) else 0)
