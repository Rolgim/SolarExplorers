/* Réglages propres au site pour le module « Trajet de la lumière » (socle/page/optics.js).
   craft : nom du véhicule dans les schémas ; echo : 2e étape de la radioscience ;
   types : type d'instrument → famille de dessin ; data : valeurs sourcées des caméras principales
   (figs : un dessin par voie ; rows : [libellé, valeur, clé de source], règle 1). */
var OPTICS_SITE = {
  craft: function(){ return L('sonde', 'spacecraft'); },
  echo: function(){ return L('La sonde le renvoie ; son mouvement décale la fréquence (effet Doppler).', 'The spacecraft sends it back; its motion shifts the frequency (Doppler effect).'); },
  types: { cam:'cam', rad:'rad', alt:'alt', radar:'radar', radio:'radio' },
  data: function(){ return {
    'mro:hirise':{ figs:[{ kind:'refl', tma:true, D:'50 cm', f:L('12 m', '12 m'), det:L('14 CCD', '14 CCDs') }],
      rows:[[L('Combinaison', 'Design'), L('Cassegrain à trois miroirs, f/24', 'three-mirror Cassegrain, f/24'), 'e01'], [L('Miroir primaire', 'Primary mirror'), '50 cm', 'kit'], [L('Focale', 'Focal length'), '12 m', 'e01'], [L('Détecteurs', 'Detectors'), L('14 CCD de 2 048 pixels', '14 CCDs of 2,048 pixels'), 'e01']] },
    'mro:ctx':{ figs:[{ kind:'refl', corr:true, f:'350 mm', det:L('barrette CCD', 'CCD line') }],
      rows:[[L('Combinaison', 'Design'), L('Cassegrain catadioptrique (type Maksutov)', 'catadioptric Cassegrain (Maksutov type)'), 'ctxd'], [L('Focale', 'Focal length'), '350 mm', 'ctxd'], [L('Détecteur', 'Detector'), L('barrette CCD de 5 064 pixels', '5,064-pixel CCD line array'), 'ctxd']] },
    'lro:lroc':{ figs:[{ kind:'refl', title:'NAC', D:'195 mm', f:'700 mm', det:'KLI-5001G' }, { kind:'refr', title:'WAC', f:'6 mm', filt:true, det:'KAI-1001' }],
      rows:[[L('NAC : combinaison', 'NAC: design'), L('Ritchey-Chrétien, f/3,59', 'Ritchey-Chretien, f/3.59'), 'lrs'], [L('NAC : miroir primaire', 'NAC: primary mirror'), '195 mm', 'lrs'], [L('NAC : focale', 'NAC: focal length'), '700 mm', 'lrs'],
        [L('NAC : détecteur', 'NAC: detector'), L('Kodak KLI-5001G, 1 × 5 064 pixels', 'Kodak KLI-5001G, 1 × 5,064 pixels'), 'lrs'], [L('WAC : optique', 'WAC: optics'), L('f/5,05 (visible), f/5,65 (UV)', 'f/5.05 (visible), f/5.65 (UV)'), 'lrs'],
        [L('WAC : focale', 'WAC: focal length'), L('6,0 mm (visible), 4,7 mm (UV)', '6.0 mm (visible), 4.7 mm (UV)'), 'lrs'], [L('WAC : détecteur', 'WAC: detector'), L('Kodak KAI-1001, 1 024 × 1 024 pixels', 'Kodak KAI-1001, 1,024 × 1,024 pixels'), 'lrs']] },
    'cassini:iss':{ figs:[{ kind:'refl', title:L('Petit champ (NAC)', 'Narrow angle (NAC)'), f:L('2 m', '2 m'), det:L('CCD 1 024²', 'CCD 1,024²') }, { kind:'refr', title:L('Grand champ (WAC)', 'Wide angle (WAC)'), f:'200 mm', filt:true, det:L('CCD 1 024²', 'CCD 1,024²') }],
      rows:[[L('NAC : combinaison', 'NAC: design'), L('Ritchey-Chrétien, f/10,5', 'Ritchey-Chretien, f/10.5'), 'issna'], [L('NAC : focale', 'NAC: focal length'), L('2 002,70 mm', '2,002.70 mm'), 'issna'],
        [L('Détecteurs', 'Detectors'), L('CCD de 1 024 × 1 024 pixels de 12 µm', 'CCD of 1,024 × 1,024 pixels, 12 µm'), 'issna'], [L('WAC : combinaison', 'WAC: design'), L('lunette (réfracteur), f/3,5', 'refractor, f/3.5'), 'issp'], [L('WAC : focale', 'WAC: focal length'), L('200,77 mm', '200.77 mm'), 'issp']] },
    'messenger:mdis':{ figs:[{ kind:'refl', title:L('Petit champ (NAC)', 'Narrow angle (NAC)'), D:'25 mm', f:'550 mm', det:'TH7888A' }, { kind:'refr', title:L('Grand champ (WAC)', 'Wide angle (WAC)'), f:'78 mm', filt:true, det:'TH7888A', lens:L('objectif à 4 lentilles', '4-element lens') }],
      rows:[[L('NAC : combinaison', 'NAC: design'), L('Ritchey-Chrétien hors d\'axe, f/22', 'off-axis Ritchey-Chretien, f/22'), 'mdisc'], [L('NAC : ouverture', 'NAC: aperture'), '25 mm', 'mdisc'], [L('NAC : focale', 'NAC: focal length'), '550 mm', 'mdisc'],
        [L('WAC : combinaison', 'WAC: design'), L('objectif à quatre lentilles (Dogmar)', 'four-element lens (Dogmar)'), 'mdisc'], [L('WAC : focale', 'WAC: focal length'), '78 mm', 'mdisc'], [L('Détecteur', 'Detector'), L('CCD TH7888A, 1 024 × 1 024 pixels de 14 µm', 'TH7888A CCD, 1,024 × 1,024 pixels of 14 µm'), 'mdisc']] },
    'tgo:cassis':{ figs:[{ kind:'refl', tma:true, D:'135 mm', f:'880 mm', det:L('Si-PIN 2k × 2k', 'Si-PIN 2k × 2k') }],
      rows:[[L('Combinaison', 'Design'), L('anastigmat à trois miroirs, plus un miroir de renvoi courbe ; f/6,5', 'three-mirror anastigmat and a curved fold mirror; f/6.5'), 'cop'], [L('Pupille d\'entrée', 'Entrance pupil'), '135 mm', 'cop'], [L('Focale', 'Focal length'), L('880 mm (valeur de conception)', '880 mm (design value)'), 'cop'],
        [L('Détecteur', 'Detector'), L('matrice hybride Si-PIN de 2k × 2k, pixels de 10 µm', 'hybrid Si-PIN array of 2k × 2k, 10 µm pixels'), 'cop']] }
  }; }
};
