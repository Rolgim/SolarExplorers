#!/usr/bin/env python3
"""Images de presse par instrument (bibliothèque d'images de la NASA) pour les instruments sans aperçu d'archive.
Pour chaque instrument : plusieurs requêtes ; on garde les images dont la description NOMME l'instrument, avec l'extrait.
Sortie : _out/press/report.md (branche probe-out)."""
import os, json, re, requests
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, "_out", "press"); os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers["User-Agent"] = "explorateurs-probe/1.0 (+https://github.com/Rolgim/SolarExplorers)"
INST = json.load(open(os.path.join(HERE, "instruments.json")))
MN = {"mro": "Mars Reconnaissance Orbiter", "mex": "Mars Express", "lro": "Lunar Reconnaissance Orbiter", "cassini": "Cassini", "messenger": "MESSENGER",
      "ody": "Mars Odyssey", "mgs": "Mars Global Surveyor", "tgo": "Trace Gas Orbiter", "vex": "Venus Express", "mgn": "Magellan", "clem": "Clementine",
      "sln": "Kaguya", "ch1": "Chandrayaan-1", "kplo": "Danuri", "lp": "Lunar Prospector", "grail": "GRAIL", "vo": "Viking"}
ALIAS = {"cassini:iss": ["Imaging Science Subsystem", "narrow-angle camera", "wide-angle camera"], "cassini:radar": ["radar"], "cassini:rss": ["radio science"],
         "messenger:mdis": ["Mercury Dual Imaging System", "MDIS"], "messenger:rs": ["radio science", "gravity"], "mgs:rs": ["radio science", "gravity"],
         "grail:lgrs": ["gravity"], "grail:moonkam": ["MoonKAM"], "lro:crater": ["CRaTER"], "lro:lroc": ["LROC", "Narrow Angle Camera"],
         "mro:rss": ["gravity"], "mgn:rss": ["gravity"], "lp:rss": ["gravity"], "vo:irtm": ["Infrared Thermal Mapper", "IRTM"], "vo:mawd": ["Mars Atmospheric Water Detector", "MAWD"],
         "ody:marie": ["MARIE", "radiation"], "ody:grs": ["Gamma Ray Spectrometer", "neutron", "GRS"], "lp:grs": ["Gamma Ray Spectrometer", "gamma"], "lp:ns": ["Neutron Spectrometer", "neutron"],
         "messenger:grns": ["Gamma-Ray", "Neutron Spectrometer", "GRNS"], "messenger:mag": ["Magnetometer", "magnetic"], "messenger:epps": ["EPPS", "Energetic Particle"],
         "mro:mcs": ["Mars Climate Sounder", "MCS"], "mro:marci": ["MARCI", "Mars Color Imager"], "lro:lend": ["LEND", "neutron"], "lro:lroc": ["LROC"],
         "cassini:vims": ["VIMS", "Visual and Infrared Mapping Spectrometer"], "cassini:cirs": ["CIRS", "Composite Infrared Spectrometer"], "cassini:uvis": ["UVIS", "Ultraviolet Imaging"],
         "cassini:caps": ["CAPS", "Plasma Spectrometer"], "tgo:cassis": ["CaSSIS"], "tgo:nomad": ["NOMAD"], "tgo:acs": ["ACS", "Atmospheric Chemistry Suite"], "tgo:frend": ["FREND"],
         "vex:virtis": ["VIRTIS"], "vex:vmc": ["VMC", "Venus Monitoring Camera"], "mex:pfs": ["PFS", "Planetary Fourier"], "mex:spicam": ["SPICAM"], "mex:aspera": ["ASPERA"],
         "clem:uvvis": ["UVVIS", "ultraviolet/visible"], "clem:lwir": ["LWIR", "long-wave"], "clem:lidar": ["LIDAR", "laser altimeter"], "ch1:tmc": ["TMC", "Terrain Mapping Camera"],
         "ch1:hysi": ["HySI", "Hyper"], "ch1:sir2": ["SIR-2"], "kplo:lhc": ["LUTI", "LHC"], "kplo:pol": ["PolCam"], "kplo:gs": ["KGRS", "gamma"], "messenger:xrs": ["X-Ray Spectrometer", "XRS"],
         "messenger:mla": ["Mercury Laser Altimeter", "MLA"], "messenger:mascs": ["MASCS", "Atmospheric and Surface Composition"], "cassini:caps": ["CAPS"], "mgs:mag": ["magnetometer", "magnetic"],
         "vex:mag": ["magnetometer", "magnetic"], "vex:vera": ["VeRa", "radio science"], "vex:spicav": ["SPICAV"], "vex:pfs": ["PFS"], "kplo:mag": ["KMAG", "magnetometer"],
         "sln:lmag": ["magnetometer", "magnetic"], "sln:upi": ["UPI", "plasma imager"], "sln:ard": ["alpha"], "mex:mars": ["MaRS", "radio science"]}
SKIP = {"mro:hirise", "mro:ctx", "mex:hrsc", "ody:themis", "mgs:moc", "mgn:rdrs", "vo:vis", "sln:tc", "ch1:m3", "kplo:shadowcam"}
REP = []
def log(s): print(s, flush=True); REP.append(s)
for ins in INST:
    key = ins["m"] + ":" + ins["id"]
    if key in SKIP: continue
    names = ALIAS.get(key, [ins["name"]]); seen = set(); hits = []
    for q in [MN[ins["m"]] + " " + n for n in names[:2]] + [names[0]]:
        try: items = S.get("https://images-api.nasa.gov/search", params={"q": q, "media_type": "image"}, timeout=60).json()["collection"]["items"][:40]
        except Exception as e: log(f"{key} ÉCHEC {e!r}"[:150]); continue
        for it in items:
            d = it["data"][0]; nid = d.get("nasa_id")
            if nid in seen: continue
            seen.add(nid); desc = re.sub(r"<[^>]+>", "", d.get("description", "") + " " + d.get("title", ""))
            if not re.search(MN[ins["m"]].split()[0], desc, re.I): continue
            m = next((re.search(r"(?i).{0,90}\b" + re.escape(n) + r"\b.{0,90}", desc) for n in names if re.search(r"(?i)\b" + re.escape(n) + r"\b", desc)), None)
            if m: hits.append((nid, d.get("title"), d.get("date_created", "")[:10], m.group(0).replace("\n", " ")))
    log(f"\n### {key} ({ins['name']}) : {len(hits)} images qui nomment l'instrument")
    for h in hits[:8]: log(f"- {h[0]} | {h[1]} | {h[2]}\n    « {h[3]} »")
open(os.path.join(OUT, "report.md"), "w").write("\n".join(REP) + "\n")
