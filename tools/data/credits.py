#!/usr/bin/env python3
"""Registre des crédits et licences de TOUT ce que le site montre (règles 1 et 8) :
images et tracés de data/, textures, trajectoires, maquettes 3D, polices et bibliothèques.
- Lit data/*.json (métadonnées écrites au téléchargement), src/data-missions.js (maquettes) et la liste fixe des ressources externes.
- Attribue à chaque fichier sa licence d'après sa source (table SOURCES ci-dessous, chaque règle avec la page qui l'énonce).
- Écrit la licence dans chaque data/*.json (champs license_fr, license_en, license_url, credit_line, status) pour que le site l'affiche
  sous l'image, puis écrit data/credits.json et CREDITS.md (le registre lisible).
Lancé par le workflow « Données réelles » après les téléchargements ; peut se relancer seul : python tools/data/credits.py"""
import os, re, json, glob, datetime

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
DATA = os.path.join(ROOT, "data")

NASA_MEDIA = "https://www.nasa.gov/nasa-brand-center/images-and-media/"
JPL_POLICY = "https://www.jpl.nasa.gov/jpl-image-use-policy/"
PDS_GEO = "https://pds-geosciences.wustl.edu/jplcopyright.html"
PDS_PPI = "https://pds-ppi.igpp.ucla.edu/citation_policy.jsp"
HIRISE = "https://hirise.lpl.arizona.edu/media/usage.php"
ISAS = "https://www.isas.jaxa.jp/en/researchers/data-policy/"
IGO = "https://creativecommons.org/licenses/by-sa/3.0/igo/"
ESA_IGO = "https://www.esa.int/Services/Creative_Commons_Attribution-ShareAlike_3.0_IGO_CC_BY-SA_3.0_IGO_licence"
HRSC = "https://www.dlr.de/en/blog/archive/2014/simpler-usage-rights-as-of-today-mars-express-hrsc-images-licensed-under-creative-commons-licence"
CCBY4 = "https://creativecommons.org/licenses/by/4.0/"

PD = ("Domaine public (données et images de la NASA, non protégées par le droit d'auteur)", "Public domain (NASA data and images, not copyrighted)")
# Crédit d'usage par mission, pour les produits d'archive (l'archive ne l'écrit pas dans le fichier)
MCREDIT = {"mro": "NASA/JPL-Caltech", "lro": "NASA/GSFC/Arizona State University", "cassini": "NASA/JPL-Caltech/Space Science Institute",
           "messenger": "NASA/Johns Hopkins University Applied Physics Laboratory/Carnegie Institution of Washington", "ody": "NASA/JPL-Caltech/Arizona State University",
           "mgs": "NASA/JPL-Caltech/MSSS", "mgn": "NASA/JPL-Caltech", "clem": "NASA/BMDO (Clementine)", "vo": "NASA/JPL-Caltech (Viking)",
           "ch1": "ISRO/NASA/JPL-Caltech", "lp": "NASA (Lunar Prospector)", "grail": "NASA/JPL-Caltech/MIT", "kplo": "NASA/KARI/Arizona State University",
           "sln": "ISAS/JAXA", "mex": "ESA", "tgo": "ESA/Roscosmos", "vex": "ESA"}
# Instruments européens de Mars Express dont les données sont recopiées au PDS de la NASA : crédit de l'équipe
MEX = {"mex-img": ("ESA/DLR/FU Berlin", "hrsc"), "i-mex-omega": ("ESA/CNES/IAS (OMEGA)", None), "i-mex-marsis": ("ESA/ASI/NASA/University of Rome (MARSIS)", None),
       "i-mex-vmc": ("ESA (VMC)", None)}

def rule(name, d):
    """-> (licence fr, licence en, url de la règle, crédit, statut). Statut : « ok », « à confirmer », « ok (site non commercial) »."""
    arch = d.get("archive", ""); m = re.sub(r"^[a-z]-", "", name).split("-")[0]
    if d.get("commons"):
        lic = d.get("license", "")
        if lic == "CC BY-SA 3.0 IGO":
            return ("CC BY-SA 3.0 IGO (partage dans les mêmes conditions)", "CC BY-SA 3.0 IGO (share-alike)", d.get("license_url") or IGO, d.get("attribution") or d.get("credit"), "ok")
        return (PD[0], PD[1], d.get("page"), d.get("credit"), "ok")
    if d.get("press"):
        u = HIRISE if "Arizona" in (d.get("credit") or "") and "HiRISE" in (d.get("instrument") or "") else (JPL_POLICY if "JPL" in (d.get("credit") or "") else NASA_MEDIA)
        return (PD[0] + " ; sans logo de la NASA", PD[1] + "; no NASA logo", u, d.get("credit") or "NASA", "ok")
    if name == "i-sln-hdtv":
        return ("© JAXA/NHK : usage non commercial avec ce crédit ; usage commercial interdit sans accord", "© JAXA/NHK: non-commercial use with this credit; no commercial use without permission",
                "https://darts.isas.jaxa.jp/planet/project/selene/hdtv/", "JAXA/NHK", "ok (site non commercial)")
    if "JAXA" in arch or "SELENE" in arch:
        return ("Données ouvertes de l'ISAS/JAXA (politique de données de l'ISAS) : citer « ISAS/JAXA » et signaler les modifications", "ISAS/JAXA open data (ISAS data policy): credit “ISAS/JAXA” and state changes", ISAS, "ISAS/JAXA", "ok")
    if name in MEX or (m == "mex" and not d.get("press")):
        cr, k = MEX.get(name, ("ESA", None)); cr = MEX.get(name.replace("d-", "i-"), (cr, k))[0]
        if k == "hrsc":
            return ("CC BY-SA 3.0 IGO (images HRSC, ESA/DLR/FU Berlin)", "CC BY-SA 3.0 IGO (HRSC images, ESA/DLR/FU Berlin)", HRSC, cr, "ok")
        return ("Données d'archive de l'ESA (copie au PDS de la NASA) ; aucune licence écrite sur le produit : traitée comme CC BY-SA 3.0 IGO, la licence des images de l'ESA",
                "ESA archive data (copy at NASA's PDS); no licence written on the product: treated as CC BY-SA 3.0 IGO, ESA's image licence", ESA_IGO, cr, "à confirmer")
    if "Plasma" in arch:
        return (PD[0] + " ; citer le PDS (politique de citation du nœud PPI)", PD[1] + "; cite the PDS (PPI node citation policy)", PDS_PPI, MCREDIT.get(m, "NASA") + " / NASA Planetary Data System", "ok")
    if "HiRISE" in arch:
        return (PD[0], PD[1], HIRISE, "NASA/JPL-Caltech/University of Arizona", "ok")
    if "PDS" in arch or "Arizona" in arch or "NASA" in arch:
        return (PD[0] + " ; citer le PDS", PD[1] + "; cite the PDS", PDS_GEO, MCREDIT.get(m, "NASA") + " / NASA Planetary Data System", "ok")
    return ("inconnue", "unknown", None, None, "à confirmer")

def transform(d):
    """Ce que le site a fait au fichier d'origine (en français), d'après les champs écrits au téléchargement."""
    if d.get("plot"): return "tracé par ce site (matplotlib) à partir du fichier de données : " + (d.get("how_fr") or "")[:220]
    t = []
    if d.get("crop"): t.append("recadré (partie centrale %d × %d px)" % tuple(d["crop"][:2]))
    if d.get("crop_px"): t.append("carré central de %d px" % d["crop_px"])
    fs, os_ = d.get("full_size"), d.get("out_size")
    if fs and os_ and list(fs)[:1] != list(os_)[:1]: t.append("réduit de %s × %s à %s × %s px" % (fs[0], fs[1], os_[0], os_[1]))
    if d.get("stretch"): t.append("contraste étiré (centiles %s–%s)" % tuple(d["stretch"][:2]))
    t.append("enregistré en JPEG")
    return ", ".join(t)

def main():
    rows = []
    for f in sorted(glob.glob(os.path.join(DATA, "*.json"))):
        name = os.path.basename(f)[:-5]
        if name == "credits": continue
        d = json.load(open(f, encoding="utf-8"))
        if name.startswith("tex-"):
            rows.append(dict(kind="texture", file="data/" + name + ".jpg", title=d.get("credit"), source=d.get("href"), page=d.get("page"),
                             license="CC BY 4.0", license_url=CCBY4, credit="Solar System Scope (solarsystemscope.com)", fetched=d.get("fetched"),
                             transform="réduite pour le web, enregistrée en JPEG", status="ok"))
            d.update(license_fr="CC BY 4.0", license_en="CC BY 4.0", license_url=CCBY4, credit_line="Solar System Scope", status="ok")
        elif name.endswith("-traj") or name == "solar":
            rows.append(dict(kind="trajectoire", file="data/" + name + ".json", title=d.get("source"), source="https://ssd.jpl.nasa.gov/horizons/", page="https://ssd.jpl.nasa.gov/horizons/",
                             license="Données publiques du JPL (NASA), sans restriction d'usage", license_url="https://ssd.jpl.nasa.gov/", credit="NASA/JPL-Caltech, JPL Horizons",
                             fetched=d.get("fetched"), transform="positions échantillonnées, réduites en coordonnées écliptiques", status="ok"))
            continue   # pas de légende d'image : rien à écrire dans le fichier
        else:
            lf, le, lu, cr, st = rule(name, d)
            kind = "tracé" if d.get("plot") else ("image Commons" if d.get("commons") else ("image de presse" if d.get("press") else "aperçu d'archive"))
            rows.append(dict(kind=kind, file="data/" + name + ".jpg", title=(d.get("title") or d.get("product")), instrument=d.get("instrument"),
                             source=d.get("href"), page=d.get("page") or d.get("stac"), archive=d.get("archive"), license=lf, license_url=lu, credit=cr,
                             fetched=d.get("fetched"), transform=transform(d), status=st))
            d.update(license_fr=lf, license_en=le, license_url=lu, credit_line=cr, status=st)
        json.dump(d, open(f, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    src = open(os.path.join(ROOT, "src", "data-missions.js"), encoding="utf-8").read()
    for body in re.split(r"\n  \{\s*\n", src)[1:]:
        mm = re.search(r"model:\{ src:'((?:[^'\\]|\\.)*)', license:'((?:[^'\\]|\\.)*)', u:'([^']+)'", body)
        fm = re.search(r"file:'(models/[^']+)'", body)
        if not mm or not fm: continue
        s, lic, u = (x.replace("\\'", "'") for x in mm.groups())
        st = "à confirmer" if "SCIFLEET" in s else "ok"
        rows.append(dict(kind="maquette 3D", file=fm.group(1), title=s, source=u, page=u, license=lic,
                         license_url=(u if st != "ok" else NASA_MEDIA), credit=("ESA" if st != "ok" else ("NASA/JPL-Caltech" if "Eyes" in s else "NASA")),
                         fetched=None, transform="convertie en glTF binaire, redécoupée en pièces, géométrie quantifiée (voir tools/models/README.md)", status=st))
    rows += [
        dict(kind="police", file="Google Fonts", title="Archivo ; IBM Plex Mono", source="https://fonts.google.com/", page="https://fonts.google.com/", license="SIL Open Font License 1.1",
             license_url="https://openfontlicense.org/", credit="Omnibus-Type (Archivo) ; IBM (Plex)", fetched=None, transform="aucune (chargées depuis Google Fonts)", status="ok"),
        dict(kind="schémas", file="src/optics.js, src/app.js (SVG)", title="Trajets de la lumière, orbites, bandes spectrales", source=None, page=None,
             license="créés pour ce site", license_url=None, credit="Explorateurs du Système solaire", fetched=None, transform="schémas de principe dessinés à partir des références citées sous chaque schéma", status="ok")]
    # Code : celui du dépôt, celui repris d'Observatories, et les dépendances (versions relevées le 24/11/2026)
    lic = os.path.join(ROOT, "LICENSE")
    own = ("Apache-2.0 (code seulement : les médias gardent leur licence, voir NOTICE)" if "Apache License" in open(lic, encoding="utf-8").read(400) else "voir LICENSE") if os.path.exists(lic) else "aucune licence déclarée (tous droits réservés)"
    def dep(name, use, license, url, served=False):
        return dict(kind="code", file=name, title=use, source=url, page=url, license=license, license_url=url, credit=None, fetched=None,
                    transform="servi aux visiteurs tel quel" if served else "outil de préparation ou de test, pas distribué avec le site", status="ok")
    rows += [
        dict(kind="code", file="src/, build.js, tools/", title="Code du site (Explorateurs du Système solaire)", source="https://github.com/Rolgim/SolarExplorers", page=None,
             license=own, license_url=("https://github.com/Rolgim/SolarExplorers/blob/main/LICENSE" if os.path.exists(lic) else None), credit="Rolgim", fetched=None, transform="—", status="ok" if os.path.exists(lic) else "à confirmer"),
        dict(kind="code", file="build.js, src/app.js, src/viewer.js, src/i18n.js, tools/models/, tools/smoke.js, tools/a11y.js", title="Architecture reprise d'Observatories v1.0 (même auteur)",
             source="https://github.com/Rolgim/Observatories/tree/v1.0", page=None, license="code du même auteur, réutilisé par lui (Observatories n'a pas de licence déclarée)",
             license_url=None, credit="Rolgim", fetched=None, transform="adapté aux sondes planétaires", status="ok"),
        dep("three.js r128 (cdnjs)", "rendu 3D dans le navigateur", "MIT", "https://github.com/mrdoob/three.js/blob/r128/LICENSE", True),
        dep("GLTFLoader.js (three@0.128.0, jsDelivr)", "lecture des maquettes glTF", "MIT", "https://github.com/mrdoob/three.js/blob/r128/LICENSE", True),
        dep("@gltf-transform/core, cli, extensions, functions 4.5.1", "conversion et allègement des maquettes", "MIT", "https://github.com/donmccurdy/glTF-Transform/blob/main/LICENSE.md"),
        dep("meshoptimizer 1.2.0", "simplification des maquettes", "MIT", "https://github.com/zeux/meshoptimizer/blob/master/LICENSE.md"),
        dep("obj2gltf 3.2.0", "conversion OBJ vers glTF", "Apache-2.0", "https://github.com/CesiumGS/obj2gltf/blob/main/LICENSE.md"),
        dep("trimesh (Python)", "conversion des maquettes ESA (tools/models/obj2glb.py)", "MIT", "https://github.com/mikedh/trimesh/blob/main/LICENSE.md"),
        dep("Playwright", "tests et captures (tools/smoke.js, tools/a11y.js)", "Apache-2.0", "https://github.com/microsoft/playwright/blob/main/LICENSE"),
        dep("axe-core", "audit d'accessibilité (tools/a11y.js)", "MPL-2.0", "https://github.com/dequelabs/axe-core/blob/develop/LICENSE"),
        dep("requests", "téléchargements (tools/data, tools/probe)", "Apache-2.0", "https://github.com/psf/requests/blob/main/LICENSE"),
        dep("Pillow", "traitement des images", "MIT-CMU (HPND)", "https://github.com/python-pillow/Pillow/blob/main/LICENSE"),
        dep("NumPy", "lecture des fichiers binaires", "BSD-3-Clause", "https://github.com/numpy/numpy/blob/main/LICENSE.txt"),
        dep("Matplotlib", "tracés des données", "Matplotlib License (type PSF)", "https://github.com/matplotlib/matplotlib/blob/main/LICENSE/LICENSE"),
        dep("PyYAML, pypdf", "sondes (tools/probe)", "MIT ; BSD-3-Clause", "https://github.com/py-pdf/pypdf/blob/main/LICENSE")]
    today = datetime.date.today().isoformat()
    json.dump({"generated": today, "items": rows}, open(os.path.join(DATA, "credits.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    def cell(x): return (str(x) if x else "—").replace("|", "\\|").replace("\n", " ")
    def link(t, u): return "[" + cell(t) + "](" + u + ")" if u else cell(t)
    out = ["# Crédits et licences", "",
           "Registre de tout ce que le site affiche et qui ne vient pas de lui : images, tracés de données, textures, trajectoires, maquettes 3D, polices et bibliothèques.",
           "Il est **généré** par `tools/data/credits.py` à partir des métadonnées écrites au téléchargement (`data/*.json`) et de `src/data-missions.js` : ne pas le modifier à la main.",
           "La licence de chaque image est aussi affichée sous l'image, sur le site.", "",
           "Généré le " + today + ". Statuts : **ok** (licence vérifiée sur la page citée), **à confirmer** (aucune licence écrite trouvée : voir la colonne licence), **ok (site non commercial)** (licence limitée à l'usage non commercial, ce qui est le cas de ce site).", "",
           "## Règles appliquées, par source", "",
           "| Source | Licence retenue | Page qui l'énonce |", "|---|---|---|",
           "| Archives du PDS de la NASA (Geosciences, Imaging, PPI, LROC, ShadowCam, THEMIS) | Domaine public ; citer le PDS et l'équipe | " + PDS_GEO + " ; " + PDS_PPI + " |",
           "| HiRISE (université d'Arizona) | Domaine public, crédit NASA/JPL-Caltech/University of Arizona | " + HIRISE + " |",
           "| Bibliothèque d'images de la NASA, Photojournal du JPL | Domaine public, sans logo de la NASA | " + NASA_MEDIA + " ; " + JPL_POLICY + " |",
           "| JAXA DARTS (SELENE/Kaguya) | Données ouvertes, crédit ISAS/JAXA, modifications signalées | " + ISAS + " |",
           "| Caméra HDTV de Kaguya | © JAXA/NHK, usage non commercial | https://darts.isas.jaxa.jp/planet/project/selene/hdtv/ |",
           "| Images HRSC de Mars Express | CC BY-SA 3.0 IGO, ESA/DLR/FU Berlin | " + HRSC + " |",
           "| Autres données de Mars Express (OMEGA, MARSIS, VMC), copies au PDS | à confirmer ; traitées comme CC BY-SA 3.0 IGO | " + ESA_IGO + " |",
           "| Images de l'ESA sur Wikimedia Commons | CC BY-SA 3.0 IGO, licence relue dans les métadonnées de Commons au téléchargement | " + ESA_IGO + " |",
           "| Textures Solar System Scope | CC BY 4.0 | https://www.solarsystemscope.com/textures/ |",
           "| Maquettes NASA 3D Resources et Eyes on the Solar System | Usage libre (règles d'usage des médias de la NASA) | " + NASA_MEDIA + " |",
           "| Maquettes ESA SCIFLEET | à confirmer : site sans licence lisible (application sans texte, relevé du 24/11/2026) | https://scifleet.esa.int/ |", ""]
    for kind in ("aperçu d'archive", "tracé", "image de presse", "image Commons", "texture", "trajectoire", "maquette 3D", "police", "bibliothèque", "schémas", "code"):
        sel = [r for r in rows if r["kind"] == kind]
        if not sel: continue
        out += ["## " + kind[0].upper() + kind[1:] + " (" + str(len(sel)) + ")", "",
                "| Fichier | Titre / produit | Crédit | Licence | Statut | Source | Téléchargé le | Transformations |", "|---|---|---|---|---|---|---|---|"]
        for r in sel:
            out.append("| `" + cell(r["file"]) + "` | " + cell(r.get("title")) + (" (" + cell(r.get("instrument")) + ")" if r.get("instrument") else "") + " | " + cell(r.get("credit")) + " | " +
                       link(r.get("license"), r.get("license_url")) + " | " + cell(r.get("status")) + " | " + link("fichier", r.get("source")) + (" · " + link("page", r.get("page")) if r.get("page") and r.get("page") != r.get("source") else "") +
                       " | " + cell(r.get("fetched")) + " | " + cell(r.get("transform")) + " |")
        out.append("")
    open(os.path.join(ROOT, "CREDITS.md"), "w", encoding="utf-8").write("\n".join(out))
    bad = [r["file"] for r in rows if not r["status"].startswith("ok")]
    print("crédits :", len(rows), "entrées ;", len(bad), "à confirmer ou restreintes :", ", ".join(bad))

if __name__ == "__main__": main()
