# Basque Surf — Galerie de Captures & Index des Écrans

Ce dossier regroupe les captures d'écran de l'application sous différentes résolutions et états clés. Elles peuvent être directement visualisées ou transmises à Claude pour analyse et itération visuelle.

---

## 📱 Captures Mobiles (iPhone 15 Pro, 390x844)

### 1. Accueil Mobile — Liste des Spots & Calendrier 7 Jours
- **Fichier** : `screenshots/01_mobile_home.png`
- **Description** :
  - En-tête avec emblème basque et capsule Dynamic Island (hauteur d'eau en direct, flèche descendante, coefficient).
  - Sélecteur de date à 7 tuiles iOS 18 avec indicateur d'activation bleu Apple.
  - Cartes de spots Liquid Glass avec badge "Top", pastilles de score style Apple Watch (`9,7`, `9,4`), encart de dangers et créneaux horaires.
  - Dock inférieur Liquid Glass à deux niveaux avec barre de recherche pleine largeur et barre d'outils tactile.

### 2. Modale Détaillée — Courbe de Marée 24h façon Apple Météo
- **Fichier** : `screenshots/02_mobile_spot_modal.png`
- **Description** :
  - Fiche modale (bottom sheet) pour la **Côte des Basques**.
  - Hero card affichant la note en direct (`9,0 / 10`), le statut "Session parfaite" et le créneau idéal (`10:00 - 16:00`).
  - Alerte de danger digue et analyse textuelle des marées.
  - **Marégraphe continu 24h** : onde spline cubique SVG avec dégradé liquide, zone de surbrillance verte pour la fenêtre d'eau optimale, et marqueur orange pulsant à l'heure actuelle (`21h - 3.42m`).
  - Table groupée style Réglages iOS (Vent favorable, Houle, Marée requise).
  - Bouton fixe pleine largeur *"Itinéraire Apple Plans"* avec marge de sécurité iOS (*Safe Area*).

### 3. Vue Carte Interactive — Spots & Marqueurs Liquid Glass
- **Fichier** : `screenshots/03_mobile_map_view.png`
- **Description** :
  - Carte géographique de la Côte Basque (Anglet à Hendaye) sans filigrane.
  - Marqueurs personnalisés en verre fumé avec note de surf colorée et nom du spot.
  - Fiche d'action flottante sous la carte affichant le spot sélectionné avec accès direct aux détails et bouton *"Y aller"* GPS.

### 4. Filtre par Commune
- **Fichier** : `screenshots/04_mobile_town_filter.png`
- **Description** :
  - Liste filtrée sur une commune spécifique (Biarritz).
  - Affichage instantané des spots de la commune avec recalcule en temps réel des conditions et tri par note.

---

## 💻 Captures Ordinateur / Tablette (Desktop, 1280x880)

### 5. Vue d'Ensemble Desktop — Grille 3 Colonnes
- **Fichier** : `screenshots/05_desktop_overview.png`
- **Description** :
  - Grille responsive à 3 colonnes avec effet biseauté et reflets de lumière spéculaire.
  - Header complet avec horaires des pleines mers (PM) et basses mers (BM).
  - Dock inférieur unifié sur une seule ligne centrée.

### 6. Modale Détaillée sur Desktop
- **Fichier** : `screenshots/06_desktop_spot_modal.png`
- **Description** :
  - Fenêtre modale centrée avec flou d'arrière-plan profond (`backdrop-blur-md`).
  - Présentation complète du diagnostic de marée, courbe continue et itinéraire GPS.
