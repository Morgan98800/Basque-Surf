# Basque Surf — Galerie de Captures & Index des Écrans

Ce dossier regroupe les captures d'écran de haute précision de l'application après refonte intégrale **Apple HIG & Liquid Glass**. Elles peuvent être directement visualisées ou transmises à Claude pour analyse et itération visuelle.

---

## 📱 Captures Mobiles (iPhone 15 Pro, 390x844)

### 1. Accueil Mobile — Liste des Spots & Calendrier 7 Jours
- **Fichier** : `screenshots/01_mobile_home.png`
- **Description** :
  - **En-tête iOS épuré** : Emblème Lauburu monochrome vectoriel en verre fumé, capsule Dynamic Island affichant la hauteur d'eau en direct (`2.25m`), flèche de marée descendante et coefficient officiel.
  - **Sélecteur 7 Jours uniforme** : Tuiles scroll-snap avec abréviations strictes à 3 lettres (`DIM`, `LUN`, `MAR`, `MER`, `JEU`, `VEN`, `SAM`), point bleu iOS 18 sous le jour actif.
  - **Cartes ultra-compactes (~108px)** : Visibilité de 5 à 6 spots sans défilement.
  - **Hiérarchie sémantique des dangers** : Fin des bandeaux rouges omniprésents. Chips compacts de 24px inline (`safe` vert #30D158 ex: *✔ Débutants* sur Hendaye, `caution` ambre #FF9F0A, et `danger` rouge #FF453A réservé aux véritables périls).
  - **Typographie Apple Watch** : SF Pro Rounded à espacement fixe (`tabular-nums`) pour les notes (`9,5`, `9,4`), pastille de score et titre sur la même ligne.
  - **Créneau compact** : Format concis `08h–12h · 14h–18h`.
  - **Dock unifié sur 1 seule ligne (50px)** : Sélecteur de commune avec popover, segmented control Vue Liste / Carte, bouton favoris et recherche dépliable tactile.

### 2. Fiche Modale Détaillée — Marégraphe 24h façon Apple Météo
- **Fichier** : `screenshots/02_mobile_spot_modal.png`
- **Description** :
  - **Recul de la vue parente iOS 18** : Effet de profondeur `scale(0.96)` avec assombrissement et rayon de courbure sur l'arrière-plan.
  - **Hero Card de Synthèse** : Note en direct (`9,3 / 10`), statut qualitatif ("Session parfaite"), hauteur instantanée et créneau idéal.
  - **Marégraphe interactif Apple** :
    - Onde spline cubique continue avec dégradé liquide bleuté.
    - Zone de marée optimale surlignée en vert transparent sous la courbe.
    - Curseur interactif tactile déplaçable avec badge de hauteur en temps réel (`2.47m`) et repère vertical.
    - Échelle temporelle épurée à 4 repères (`00h`, `06h`, `12h`, `18h`, `24h`) et axe vertical minimal à droite.
  - **Table groupée iOS** : Vent favorable, houle recommandée, marée requise avec typographie naturelle (casse de phrase, sans majuscules forcées).
  - **Bouton d'Itinéraire GPS intelligent** : Sélecteur d'application préférée (Apple Plans, Google Maps, Waze) avec mémorisation du choix utilisateur.
  - **Dégradé de fondu inférieur (`.sheet-scroll`)** : Masquage progressif pour éliminer toute coupure brutale au-dessus du bouton d'action.

### 3. Vue Carte Interactive — Apple Plans Minimal & Tuiles Esri Dark
- **Fichier** : `screenshots/03_mobile_map_view.png`
- **Description** :
  - **Fond cartographique sans filigrane** : Tuiles Esri World Dark Gray Canvas officielles (océan noir profond, côte contrastée sans marquage diagonal).
  - **Marqueurs épurés** : Pastilles de score minimalistes (`9,4`, `9,1`, `8,2`...) style iOS, évitant l'encombrement visuel.
  - **Fiche d'action flottante** : Spot sélectionné avec accès direct à la fiche complète et bouton de guidage GPS immédiat.
  - **Boutons de zoom Liquid Glass** : Commandes tactiles `+` / `-` avec biseau zénithal et flou spéculaire.

### 4. Filtre par Commune
- **Fichier** : `screenshots/04_mobile_town_filter.png`
- **Description** :
  - Liste instantanément filtrée (ex: Biarritz).
  - Bouton du dock mis en évidence en blanc opaque avec libellé sélectionné.
  - Re-calcul en temps réel des créneaux et tri par pertinence.

---

## 💻 Captures Ordinateur / Tablette (Desktop, 1280x880)

### 5. Vue d'Ensemble Desktop — Split-View façon Apple Plans
- **Fichier** : `screenshots/05_desktop_overview.png`
- **Description** :
  - **Architecture Split-View 2 volets** inspirée de Plans sur macOS :
    - **Volet gauche (~450px)** : Liste continue des spots avec sélecteur de date, cartes Liquid Glass, et synchronisation instantanée au survol.
    - **Volet droit persistant** : Carte géographique plein écran interactive affichant tous les spots le long du littoral basque.
  - **Dock unifié avec champ de recherche intégré** : Recherche textuelle directe sans modale.
  - **En-tête enrichi** : Horaires des marées haute (PM) et basse (BM) en direct.

### 6. Modale Détaillée sur Desktop
- **Fichier** : `screenshots/06_desktop_spot_modal.png`
- **Description** :
  - Fenêtre modale centrée avec estompage d'arrière-plan profond.
  - Présentation complète du marégraphe 24h, des paramètres de houle et du choix de l'application GPS.
