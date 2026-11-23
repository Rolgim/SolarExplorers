#!/usr/bin/env python3
"""Fond de la carte « Système solaire » : le vrai ciel derrière le Système solaire vu de dessus.

    python tools/data/make_solarbg.py <sky-gaia.jpg d'Observatories>

On regarde le plan de l'écliptique depuis le nord, donc vers le pôle sud de l'écliptique (Dorade, avec le Grand Nuage de
Magellan tout près) : chaque pixel de sortie est une direction (x, y, -1) du repère écliptique J2000 (x vers le point vernal,
à droite ; y en haut), convertie en coordonnées galactiques puis lue dans la carte de Gaia en Mollweide galactique
d'Observatories (data/sky-gaia.jpg : centre de la Galaxie au milieu, longitudes croissantes vers la gauche).
Source : « The colour of the sky from Gaia's Early Data Release 3 », ESA/Gaia/DPAC, CC BY-SA 3.0 IGO (A. Moitinho) ;
image modifiée (reprojetée), redistribuée sous la même licence. Écrit data/solar-bg.jpg et data/solar-bg.json.
"""
import sys, os, json, datetime
import numpy as np
from PIL import Image
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
W, H, FOV = 2000, 1250, 110.0          # champ horizontal en degrés (projection gnomonique)
EPS = np.radians(23.4392911)
GAL = np.array([[-0.0548755604, -0.8734370902, -0.4838350155],
                [ 0.4941094279, -0.4448296300,  0.7469822445],
                [-0.8676661490, -0.1980763734,  0.4559837762]])   # équatorial J2000 → galactique
def main(src):
    Image.MAX_IMAGE_PIXELS = None
    sky = np.asarray(Image.open(src).convert("RGB")); SH, SW = sky.shape[:2]
    f = (W / 2) / np.tan(np.radians(FOV / 2))
    v, u = np.mgrid[0:H, 0:W]
    x = (u + 0.5 - W / 2) / f; y = -(v + 0.5 - H / 2) / f; z = -np.ones_like(x)
    n = np.sqrt(x*x + y*y + z*z); x, y, z = x/n, y/n, z/n
    eq = np.stack([x, np.cos(EPS)*y - np.sin(EPS)*z, np.sin(EPS)*y + np.cos(EPS)*z])
    g = np.tensordot(GAL, eq, axes=1)
    l = np.arctan2(g[1], g[0]); b = np.arcsin(np.clip(g[2], -1, 1))
    th = b.copy()
    for _ in range(30):
        d = (2*th + np.sin(2*th) - np.pi*np.sin(b)) / (2 + 2*np.cos(2*th) + 1e-12); th -= d
    X = -(2*np.sqrt(2)/np.pi) * l * np.cos(th); Y = np.sqrt(2) * np.sin(th)
    px = np.clip((X/(2*np.sqrt(2)) * (SW/2) + SW/2).astype(int), 0, SW - 1)
    py = np.clip((-Y/np.sqrt(2) * (SH/2) + SH/2).astype(int), 0, SH - 1)
    out = sky[py, px]
    Image.fromarray(out).save(os.path.join(ROOT, "data", "solar-bg.jpg"), quality=80, optimize=True)
    json.dump({"what": "Le ciel vers le pôle sud de l'écliptique (Gaia EDR3, la couleur du ciel)", "credit": "ESA/Gaia/DPAC, CC BY-SA 3.0 IGO, remerciements : A. Moitinho",
               "url": "https://sci.esa.int/web/gaia/-/the-colour-of-the-sky-from-gaia-s-early-data-release-3-equirectangular-projection",
               "licence": "CC BY-SA 3.0 IGO ; image modifiée (reprojetée en perspective vers le pôle sud de l'écliptique), redistribuée sous la même licence",
               "licence_url": "https://creativecommons.org/licenses/by-sa/3.0/igo/", "fov": FOV, "width": W, "height": H, "made": datetime.date.today().isoformat()},
              open(os.path.join(ROOT, "data", "solar-bg.json"), "w"), ensure_ascii=False)
if __name__ == "__main__":
    main(sys.argv[1])
