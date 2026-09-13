import { Spot, BasqueTown } from '../types/index';

export const TOWN_TO_SLUG: Record<BasqueTown, string> = {
  'Anglet': 'anglet',
  'Biarritz': 'biarritz',
  'Bidart': 'bidart',
  'Guéthary': 'guethary',
  'Saint-Jean-de-Luz': 'saint-jean-de-luz',
  'Hendaye': 'hendaye'
};

export const BASQUE_SPOTS: Spot[] = [
  // --- ANGLET ---
  {
    id: 'anglet-cavaliers',
    name: 'Les Cavaliers',
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Confirmé',
    optimalTideRange: {
      minHeight: 1.2,
      maxHeight: 2.8,
      preferredPhases: ['incoming', 'outgoing', 'low']
    },
    tideDescription: 'Marée basse à mi-marée. À marée haute, les vagues saturent ou ferment brutalement.',
    hazards: 'Forts courants de baïne, shorebreak puissant, localisme courtois.',
    hazardLevel: 'caution',
    hazardChip: 'Baïnes',
    bestWind: 'Est / Sud-Est (Offshore)',
    bestSwell: 'Ouest / Nord-Ouest 1m à 2.2m',
    description: 'Le spot de beach-break réputé mondialement pour ses tubes creux et puissants le long des épis.',
    lat: 43.5242,
    lon: -1.5303
  },
  {
    id: 'anglet-chambre-amour',
    name: "La Chambre d'Amour (VVF)",
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.4,
      maxHeight: 3.1,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée montante idéale. Abrité du vent de sud par la falaise du phare de Biarritz.',
    hazards: 'Rochers sous le phare, baïnes marquées.',
    hazardLevel: 'caution',
    hazardChip: 'Rochers',
    bestWind: 'Sud / Sud-Est',
    bestSwell: 'Nord-Ouest / Ouest 1m à 2m',
    description: 'Niché au pied de la falaise du phare de Biarritz, offre de jolies gauches et droites plus calmes.',
    lat: 43.5025,
    lon: -1.5428
  },
  {
    id: 'anglet-marinella',
    name: 'Marinella',
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 1.5,
      maxHeight: 3.2,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée idéale. Les bancs de sable y sont généralement doux et bien répartis.',
    hazards: 'Affluence estivale, baïnes.',
    hazardLevel: 'safe',
    hazardChip: 'Tous niveaux',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 0.8m à 1.8m',
    description: 'Plage très conviviale et polyvalente, idéale pour progresser ou surfer en shortboard / longboard.',
    lat: 43.5086,
    lon: -1.5383
  },
  {
    id: 'anglet-corsaires',
    name: 'Les Corsaires',
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.3,
      maxHeight: 2.9,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Basse à mi-marée. Attention au shorebreak à marée haute.',
    hazards: 'Courant de vidange près des digues.',
    hazardLevel: 'caution',
    hazardChip: 'Digues',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Beach-break encadré par des digues rocheuses qui canalisent de belles sections dynamiques.',
    lat: 43.5115,
    lon: -1.5365
  },
  {
    id: 'anglet-madrague',
    name: 'La Madrague',
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.3,
      maxHeight: 3.0,
      preferredPhases: ['incoming', 'low', 'outgoing']
    },
    tideDescription: 'Basse à mi-marée. Espace large avec de multiples pics.',
    hazards: 'Courants latéraux.',
    hazardLevel: 'safe',
    hazardChip: 'Accessible',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Grande plage ouverte offrant de multiples pics pour répartir les surfeurs.',
    lat: 43.5181,
    lon: -1.5336
  },
  {
    id: 'anglet-la-barre',
    name: 'La Barre',
    town: 'Anglet',
    coefMareeSlug: 'anglet',
    type: 'beach_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 1.8,
      maxHeight: 3.6,
      preferredPhases: ['incoming', 'high']
    },
    tideDescription: 'Mi-marée à marée haute. Spot de repli par forte houle.',
    hazards: 'Courant puissant de l’embouchure de l’Adour.',
    hazardLevel: 'caution',
    hazardChip: 'Courants Adour',
    bestWind: 'Sud / Sud-Est',
    bestSwell: 'Grosse houle Ouest / Nord-Ouest > 2.5m',
    description: 'Spot historique du surf français, aujourd’hui spot de repli protégé quand l’océan sature ailleurs.',
    lat: 43.5302,
    lon: -1.5244
  },

  // --- BIARRITZ ---
  {
    id: 'biarritz-cote-des-basques',
    name: 'Côte des Basques',
    town: 'Biarritz',
    coefMareeSlug: 'biarritz',
    type: 'beach_break',
    level: 'Tous niveaux',
    highTideRisk: true,
    optimalTideRange: {
      minHeight: 0.8,
      maxHeight: 2.7,
      preferredPhases: ['low', 'incoming', 'outgoing']
    },
    tideDescription: 'Marée basse à mi-marée seulement. À marée haute, les vagues heurtent directement la digue et la falaise (accès impossible et dangereux).',
    hazards: 'Disparition de la plage à marée haute, shorebreak sur la digue de pierre, escaliers glissants.',
    hazardLevel: 'caution',
    hazardChip: 'Marée basse',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest / Nord-Ouest 0.8m à 2m',
    description: 'Le berceau du surf européen ! Cadre exceptionnel avec vue sur la Villa Belza et la côte espagnole. Paradis des longboarders.',
    lat: 43.4776,
    lon: -1.5694
  },
  {
    id: 'biarritz-grande-plage',
    name: 'Grande Plage',
    town: 'Biarritz',
    coefMareeSlug: 'biarritz',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.4,
      maxHeight: 3.2,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée. À marée basse le plan d’eau peut être plat ou fermer ; à marée haute, puissant shorebreak sur le sable incliné.',
    hazards: 'Rochers immergés au nord et sud, baigneurs en saison, shorebreak violent à marée haute.',
    hazardLevel: 'caution',
    hazardChip: 'Shorebreak',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest / Nord-Ouest 1m à 1.8m',
    description: 'Au cœur de la ville impériale entre le Casino et l’Hôtel du Palais, vagues rapides et dynamiques.',
    lat: 43.4851,
    lon: -1.5583
  },
  {
    id: 'biarritz-miramar',
    name: 'Miramar',
    town: 'Biarritz',
    coefMareeSlug: 'biarritz',
    type: 'beach_break',
    level: 'Confirmé',
    optimalTideRange: {
      minHeight: 1.5,
      maxHeight: 3.0,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée montante. Les vagues déroulent devant la roche de la Frégate.',
    hazards: 'Rochers très coupants, courants violents.',
    hazardLevel: 'danger',
    hazardChip: 'Rochers coupants',
    bestWind: 'Sud / Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Petite plage au nord de la Grande Plage, plus sauvage avec un pic technique apprécié des bodyboarders et shortboards.',
    lat: 43.4883,
    lon: -1.5539
  },
  {
    id: 'biarritz-marbella',
    name: 'Marbella',
    town: 'Biarritz',
    coefMareeSlug: 'biarritz',
    type: 'beach_break',
    level: 'Confirmé',
    optimalTideRange: {
      minHeight: 1.2,
      maxHeight: 2.8,
      preferredPhases: ['low', 'incoming', 'outgoing']
    },
    tideDescription: 'Marée basse à mi-marée. À marée basse, attention aux cailloux affleurants.',
    hazards: 'Rochers sous l’eau, courants forts.',
    hazardLevel: 'caution',
    hazardChip: 'Rochers',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2.2m',
    description: 'Prolongement sauvage de la Côte des Basques, vagues plus puissantes et plus creuses sur fond mixte sable et roches.',
    lat: 43.4716,
    lon: -1.5727
  },
  {
    id: 'biarritz-milady',
    name: 'La Milady',
    town: 'Biarritz',
    coefMareeSlug: 'biarritz',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.4,
      maxHeight: 2.9,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée. Shorebreak très agressif à marée haute.',
    hazards: 'Shorebreak violent au bord, rochers sur les côtés.',
    hazardLevel: 'caution',
    hazardChip: 'Shorebreak',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Grande plage familiale avec promenade, proposant un beach-break rapide et tonique.',
    lat: 43.4678,
    lon: -1.5746
  },

  // --- BIDART ---
  {
    id: 'bidart-ilbarritz',
    name: 'Ilbarritz',
    town: 'Bidart',
    coefMareeSlug: 'bidart',
    type: 'beach_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 1.3,
      maxHeight: 3.1,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée montante idéale. Fonctionne bien sans trop saturer.',
    hazards: 'Roches sur les extrémités de plage.',
    hazardLevel: 'safe',
    hazardChip: 'Débutants',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 1.8m',
    description: 'Spot somptueux surplombé par le château d’Ilbarritz, parfait pour une session décontractée.',
    lat: 43.4578,
    lon: -1.5786
  },
  {
    id: 'bidart-erretegia',
    name: 'Erretegia',
    town: 'Bidart',
    coefMareeSlug: 'bidart',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.3,
      maxHeight: 2.9,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée montante. Espace réduit à marée très haute.',
    hazards: 'Fonds rocheux disséminés, accès en pente raide.',
    hazardLevel: 'safe',
    hazardChip: 'Tous niveaux',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Crique naturelle préservée au pied de falaises verdoyantes, vague authentique et cadre sauvage.',
    lat: 43.4475,
    lon: -1.5912
  },
  {
    id: 'bidart-centre',
    name: 'Bidart Centre',
    town: 'Bidart',
    coefMareeSlug: 'bidart',
    type: 'beach_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 1.4,
      maxHeight: 3.0,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée. À marée haute, la vague casse près des enrochements.',
    hazards: 'Enrochements et digue.',
    hazardLevel: 'caution',
    hazardChip: 'Enrochements',
    bestWind: 'Est',
    bestSwell: 'Ouest 1m à 1.8m',
    description: 'Plage centrale accessible depuis le village basque typique de Bidart, plusieurs pics accessibles.',
    lat: 43.4402,
    lon: -1.5971
  },
  {
    id: 'bidart-uhabia',
    name: 'Uhabia',
    town: 'Bidart',
    coefMareeSlug: 'bidart',
    type: 'beach_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.2,
      maxHeight: 2.8,
      preferredPhases: ['low', 'incoming']
    },
    tideDescription: 'Marée basse à mi-marée montante.',
    hazards: 'Embouchure de rivière, courant sortant.',
    hazardLevel: 'caution',
    hazardChip: 'Courant embouchure',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Bancs de sable alimentés par la rivière de l’Uhabia, offrant parfois de jolis bancs calés.',
    lat: 43.4338,
    lon: -1.6033
  },

  // --- GUÉTHARY ---
  {
    id: 'guethary-parlementia',
    name: 'Parlementia',
    town: 'Guéthary',
    coefMareeSlug: 'guethary',
    type: 'reef_break',
    level: 'Confirmé',
    optimalTideRange: {
      minHeight: 1.8,
      maxHeight: 3.8,
      preferredPhases: ['incoming', 'high', 'outgoing']
    },
    tideDescription: 'Mi-marée à marée haute. À marée basse, le récif est affleurant et la rame est longue.',
    hazards: 'Dalles de rochers plates, longue rame au large (300m), puissance par grosse houle.',
    hazardLevel: 'caution',
    hazardChip: 'Rame 300m',
    bestWind: 'Sud / Est / Sud-Est',
    bestSwell: 'Ouest / Nord-Ouest 1.5m à 4m+',
    description: 'L’un des reefs de gros les plus célèbres d’Europe. Une droite majestueuse qui tient la houle jusqu’à plus de 5 mètres.',
    lat: 43.4258,
    lon: -1.6112
  },
  {
    id: 'guethary-cenitz',
    name: 'Cenitz',
    town: 'Guéthary',
    coefMareeSlug: 'guethary',
    type: 'reef_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 2.0,
      maxHeight: 3.6,
      preferredPhases: ['incoming', 'high']
    },
    tideDescription: 'Mi-marée montante à marée haute. À marée basse, trop de cailloux découverts.',
    hazards: 'Platier rocheux, oursins, cailloux ronds glissants.',
    hazardLevel: 'safe',
    hazardChip: 'Tous niveaux',
    bestWind: 'Sud / Sud-Est',
    bestSwell: 'Ouest 1m à 2.2m',
    description: 'Baie classée espace naturel. Offre une longue droite au fond pour les longboards et une gauche plus creuse sur la plage.',
    lat: 43.4192,
    lon: -1.6174
  },
  {
    id: 'guethary-alcyons',
    name: 'Les Alcyons',
    town: 'Guéthary',
    coefMareeSlug: 'guethary',
    type: 'reef_break',
    level: 'Expert',
    optimalTideRange: {
      minHeight: 1.0,
      maxHeight: 2.4,
      preferredPhases: ['low', 'incoming']
    },
    tideDescription: 'Marée basse à mi-marée montante.',
    hazards: 'Dalle de roche très peu profonde, vague creuse et rapide.',
    hazardLevel: 'danger',
    hazardChip: 'Reef coupant',
    bestWind: 'Est / Sud-Est',
    bestSwell: 'Ouest 1.5m à 2.5m',
    description: 'Reef break de gauche court, rapide et très technique réservé aux surfeurs aguerris.',
    lat: 43.4241,
    lon: -1.6091
  },

  // --- SAINT-JEAN-DE-LUZ ---
  {
    id: 'st-jean-lafitenia',
    name: 'Lafitenia',
    town: 'Saint-Jean-de-Luz',
    coefMareeSlug: 'saint-jean-de-luz',
    type: 'point_break',
    level: 'Confirmé',
    optimalTideRange: {
      minHeight: 1.1,
      maxHeight: 2.7,
      preferredPhases: ['low', 'incoming']
    },
    tideDescription: 'Marée basse à mi-marée montante. À marée haute, la vague devient molle et disparaît sur les falaises.',
    hazards: 'Fond rocheux irrégulier, oursins, mise à l’eau sur les galets, fort monde au pic.',
    hazardLevel: 'caution',
    hazardChip: 'Rochers & Galets',
    bestWind: 'Sud / Sud-Est / Est',
    bestSwell: 'Nord-Ouest / Ouest 1.2m à 3m',
    description: 'Le joyau basque ! Point break de droite parfait déroulant sur plusieurs centaines de mètres le long de la falaise.',
    lat: 43.4144,
    lon: -1.6258
  },
  {
    id: 'st-jean-erromardie',
    name: 'Erromardie',
    town: 'Saint-Jean-de-Luz',
    coefMareeSlug: 'saint-jean-de-luz',
    type: 'reef_break',
    level: 'Intermédiaire',
    optimalTideRange: {
      minHeight: 1.5,
      maxHeight: 3.1,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée. À marée trop basse, les roches sont trop proches de la surface.',
    hazards: 'Dalle rocheuse au bord, galets.',
    hazardLevel: 'caution',
    hazardChip: 'Galets',
    bestWind: 'Sud / Sud-Est',
    bestSwell: 'Ouest 1m à 2m',
    description: 'Jolie baie protégée avec un pic de gauche et de droite sur fond mixte galets/roches.',
    lat: 43.4075,
    lon: -1.6386
  },
  {
    id: 'st-jean-sainte-barbe',
    name: 'Sainte-Barbe / Baie',
    town: 'Saint-Jean-de-Luz',
    coefMareeSlug: 'saint-jean-de-luz',
    type: 'point_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 2.2,
      maxHeight: 4.0,
      preferredPhases: ['incoming', 'high']
    },
    tideDescription: 'Marée haute et gros coefficients. Ne fonctionne que par forte tempête.',
    hazards: 'Digue en béton, surfeurs nombreux lors des gros swells.',
    hazardLevel: 'safe',
    hazardChip: 'Repli abrité',
    bestWind: 'Sud / Ouest abrité',
    bestSwell: 'Grosse houle Ouest / Nord-Ouest > 3m',
    description: 'Spot de repli absolu ! Quand la côte est déchaînée et impraticable, une droite magique et abritée se lève au fond de la baie.',
    lat: 43.3986,
    lon: -1.6622
  },

  // --- HENDAYE ---
  {
    id: 'hendaye-plage',
    name: 'Hendaye - Les Deux Jumeaux',
    town: 'Hendaye',
    coefMareeSlug: 'hendaye',
    type: 'beach_break',
    level: 'Tous niveaux',
    optimalTideRange: {
      minHeight: 1.0,
      maxHeight: 3.8,
      preferredPhases: ['incoming', 'low', 'outgoing', 'high']
    },
    tideDescription: 'Fonctionne à toutes les marées, optimale à mi-marée montante.',
    hazards: 'Très peu de dangers, pente très douce. Idéal débutants.',
    hazardLevel: 'safe',
    hazardChip: 'Débutants',
    bestWind: 'Sud / Sud-Est / Est',
    bestSwell: 'Ouest / Nord-Ouest 1.2m à 3.5m',
    description: 'La plus grande plage de la Côte Basque française, abritée dans la baie de Chingoudy. Le paradis des débutants et le spot de repli ultime quand la côte sature.',
    lat: 43.3742,
    lon: -1.7711
  },
  {
    id: 'hendaye-casino',
    name: 'Hendaye - Le Casino',
    town: 'Hendaye',
    coefMareeSlug: 'hendaye',
    type: 'beach_break',
    level: 'Débutant',
    optimalTideRange: {
      minHeight: 1.2,
      maxHeight: 3.5,
      preferredPhases: ['incoming', 'outgoing']
    },
    tideDescription: 'Mi-marée montante. Vagues longues et faciles.',
    hazards: 'Zone de baignade.',
    hazardLevel: 'safe',
    hazardChip: 'Débutants',
    bestWind: 'Sud / Est',
    bestSwell: 'Ouest 1m à 2.5m',
    description: 'Au centre de la promenade hendayaise, vagues douces et sécurisantes pour apprendre et progresser sans stress.',
    lat: 43.3725,
    lon: -1.7803
  }
];

export const BASQUE_TOWNS: BasqueTown[] = [
  'Anglet',
  'Biarritz',
  'Bidart',
  'Guéthary',
  'Saint-Jean-de-Luz',
  'Hendaye'
];
