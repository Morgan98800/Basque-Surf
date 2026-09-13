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
- **Gestionnaire de Clé API flexible** :
  - Prêt à recevoir votre clé d'API (Stormglass, WorldTides, etc.) via le modal "Paramètres API" de l'interface ou via un fichier `.env`.
  - En l'absence de clé, l'application utilise un modèle astronomique harmonique fidèle aux annuaires de marée officiels de la Côte Basque (Socoa/Biarritz) pour être **immédiatement utilisable à 100%**.

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

## 🔑 Configuration de la Clé API

Vous pouvez renseigner votre clé API de deux manières :
1. **Directement dans le site** : Cliquez sur le bouton "Clé API" dans la barre du haut ou le pied de page, puis collez votre clé.
2. **Via variable d'environnement** : Créez un fichier `.env` à la racine :
   ```env
   VITE_TIDE_API_KEY=votre_cle_api_ici
   ```

---

## 🚀 Push sur GitHub

Pour envoyer le projet sur votre dépôt GitHub :
```bash
git add .
git commit -m "feat: site Basque Surf avec évaluation des marées et favoris"
git branch -M main
git remote add origin https://github.com/Morgan98800/Basque-Surf.git
git push -u origin main
```
