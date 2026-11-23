#!/usr/bin/env python3
"""HiRISE : l'hôte hirise.lpl.arizona.edu refusait la connexion depuis GitHub Actions (23/11/2026).
Essaie le même aperçu par plusieurs adresses et note ce qui répond. Sortie : _out/hirise/."""
import os, socket, time, requests
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_out", "hirise"); os.makedirs(OUT, exist_ok=True)
P = "/PDS/EXTRAS/RDR/ESP/ORB_088700_088799/ESP_088799_2535/ESP_088799_2535_RED.browse.jpg"
L = []
for h in ("hirise.lpl.arizona.edu", "hirise-pds.lpl.arizona.edu", "www.uahirise.org"):
    try: L.append(f"DNS {h} : {socket.gethostbyname_ex(h)[2]}")
    except Exception as e: L.append(f"DNS {h} : {e!r}"[:200])
for u in ["https://hirise.lpl.arizona.edu" + P, "http://hirise.lpl.arizona.edu" + P, "https://hirise-pds.lpl.arizona.edu" + P,
          "https://hirise-pds.lpl.arizona.edu/PDS/EXTRAS/RDR/ESP/ORB_088700_088799/ESP_088799_2535/ESP_088799_2535_RED.browse.jpg".replace("/PDS/", "/download/PDS/"),
          "https://www.uahirise.org/ESP_088799_2535"]:
    for k in range(3):
        try:
            r = requests.get(u, timeout=60, headers={"User-Agent": "explorateurs-probe/1.0"})
            L.append(f"{u} : {r.status_code} {r.headers.get('content-type')} {len(r.content)} o")
            if r.ok and r.headers.get("content-type", "").startswith("image/"):
                open(os.path.join(OUT, "ESP_088799_2535_RED.browse.jpg"), "wb").write(r.content)
            break
        except Exception as e:
            L.append(f"{u} essai {k} : {e!r}"[:300]); time.sleep(10)
txt = "# Hôte HiRISE\n\n" + "\n".join("- " + x for x in L) + "\n"
open(os.path.join(OUT, "probe.md"), "w").write(txt); print(txt)
if os.environ.get("GITHUB_STEP_SUMMARY"): open(os.environ["GITHUB_STEP_SUMMARY"], "a").write(txt)
