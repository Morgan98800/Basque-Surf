# 🌊 Basque Surf - Marées & Conditions de Surf sur la Côte Basque

Application web épurée et moderne dédiée **exclusivement à la Côte Basque** (Anglet, Biarritz, Bidart, Guéthary, Saint-Jean-de-Luz, Hendaye).

Elle évalue en temps réel les conditions de surf en fonction des marées (hauteur d'eau, phase montante/descendante, coefficient et spécificités bathymétriques de chaque plage) pour attribuer une **note sur 10 précise avec décimale** (ex: `8,4 / 10`).

---

## 🏄‍♂️ Fonctionnalités

- **100% Côte Basque** : Couverture complète des spots mythiques :
  - **Anglet** : Les Cavaliers, La Chambre d'Amour (VVF), Marinella, Les Corsaires, La Madrague, La Barre.
  - **Biarritz** : Côte des Basques, Grande Plage, Miramar, Marbella, La Milady.
  - **Bidart** : Ilbarritz, Erretegia, Bidart Centre, Uhabia.
  - **Guéthary** : Parlementia, Cenitz, Les Alcyons.
  - **Saint-Jean-de-Luz** : Lafitenia, Erromardie, Sainte-Barbe, Mayarco.
  - **Hendaye** : Plage des Deux Jumeaux, Le Casino.
- **Notation sur 10 avec virgule** : Calcul précis (ex: `8,2 / 10`) prenant en compte :
  - L'adéquation entre la hauteur d'eau actuelle et la fenêtre optimale du spot.
  - La phase de marée (montante vs descendante).
  - Le coefficient de marée (gestion des courants et baïnes).
  - Les alertes critiques (ex: **Alerte digue / marée haute à la Côte des Basques** où la plage disparaît sous les vagues).
- **Courbe visuelle de marée sur 24h** : Visualisez d'un coup d'œil les créneaux idéaux sur chaque spot.
- **Recherche instantanée** : Filtrez par nom de plage, ville ou niveau de surf.
- **Système de Favoris** : Enregistrez vos spots préférés d'un clic avec persistance dans le navigateur (`localStorage`).
- **Gestionnaire d'API & Marées en Direct** :
  - Intégration native de l'**API Développeur CoefMarée** :
    - **100% Gratuit, sans clé API requise, requêtes CORS autorisées**.
    - Données calculées à partir de l'atlas harmonique **IFREMER / PREVIMER** et calibrées sur les marégraphes officiels **SHOM / REFMAR**.
    - Données précises par ville/plage de la Côte Basque (`anglet`, `biarritz`, `bidart`, `guethary`, `saint-jean-de-luz`, `hendaye`).
    - Horaires de pleine mer & basse mer, coefficients officiels, hauteur d'eau en direct et évolution de la marée.
  - Support optionnel d'autres API (Stormglass, WorldTides) si souhaité.
  - Modèle harmonique local de secours si perte de connexion réseau.

---

## 🛠️ Démarrage Rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancer en local
```bash
npm run dev
```

### 3. Compiler pour production
```bash
npm run build
```

---

## 📡 Source des Données & Attribution

Les prédictions de marée sont fournies via l'API [CoefMarée](https://coefmaree.fr/api).
*Attribution légale requise* : « Données IFREMER/PREVIMER (Pineau-Guillou, 2013, CC-BY) · marégraphes SHOM/REFMAR ».

---

## 🚀 Push sur GitHub

Pour synchroniser le projet :
```bash
git add .
git commit -m "feat: integration CoefMaree API (IFREMER/SHOM) pour la Cote Basque"
git push origin main
```
