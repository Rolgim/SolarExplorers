# Sondes d'archives

L'espace de travail de Claude n'accède pas aux archives (PDSSP, PDS, PSA, Horizons) : chaque question posée à une archive passe par un script de ce dossier, lancé dans GitHub Actions par le workflow **Sonde** (onglet Actions → Sonde → Run workflow, ou `gh workflow run probe.yml -f script=probe_stacplanet.py`).

- Le script écrit ses fichiers dans `tools/probe/_out/` (ignoré par git) ; le workflow les pousse seuls sur la branche `probe-out` (écrasée à chaque lancement).
- Rien n'est écrit sur `main` : une sonde sert à savoir ce qu'expose une archive avant d'écrire une recette dans `tools/data/`.

| Script | Rôle |
|---|---|
| `probe_stacplanet.py [URL_API]` | STAC-PLANET du PDSSP : découverte de l'adresse de l'API depuis la page publique, racine (`conformsTo`, liens), collections (cible, mission, instrument, extensions, licence), nombre d'items, un item par collection (propriétés, géométrie, assets). Sortie : `stacplanet/probe.md` (tableau), `summary.json`, `collections.json`, `items/<collection>.json`, `page.html`, `log.txt`. |
| `fetch_scifleet_models.py` | maquettes ESA SCIFLEET ; `MISSIONS="id1 id2"` choisit les missions, vide = liste seulement. |
