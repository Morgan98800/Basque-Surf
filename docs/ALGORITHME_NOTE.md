# Algorithme de Scoring Surf – Basque Surf

Ce document détaille le fonctionnement de l'algorithme d'évaluation des spots et le raisonnement hydrodynamique appliqué à la Côte Basque.

---

## 1. Raisonnement & Philosophie de l'Algorithme

Sur la Côte Basque, la **hauteur de marée et sa cinétique** sont les facteurs n°1 qui déterminent si une session est praticable ou non :
- **Beach-breaks (Anglet)** : Les bancs de sable demandent un volume d'eau précis. Trop bas = vagues fermantes violentes ; trop haut = vagues molles saturant en shorebreak.
- **Falaises et digues (Biarritz Côte des Basques)** : À pleine mer, l'eau engloutit complètement le sable et percute la digue rocheuse, rendant la session impraticable et dangereuse.
- **Courants de baïnes** : Les gros coefficients (>80) multiplient la vitesse de vidange d'eau, rendant les spots d'Anglet très physiques.

L'algorithme pondère ces réalités de terrain pour délivrer une note fiable et immédiatement compréhensible.

---

## 2. Déroulé du Calcul (/10)

L'évaluation s'appuie sur une base neutre de **6,5 / 10** modifiée par 5 étapes successives :

### 1. Règle de Sécurité Impérative (ex. Côte des Basques)
Si un spot présente un danger structurel direct lié à la marée (comme la Côte des Basques au-delà de 3,3 m de marée haute) :
- Le score est écrasé entre **1,0 et 1,8 / 10**.
- Statut basculé en `danger` (rouge) avec avertissement clair.

### 2. Adéquation avec la Hauteur d'Eau Optimale
Chaque spot a un intervalle d'eau idéal défini : `[minHeight, maxHeight]`.
- **Dans la plage** : Bonus de **+1,3 à +2,2 points** proportionnel à la proximité avec le centre de la plage d'eau.
- **En dessous (manque d'eau)** : Malus de $-2,8 \times \text{écart}$ (fermeture / roches affleurantes).
- **Au-dessus (trop d'eau)** : Malus de $-2,5 \times \text{écart}$ (mollesse / saturation au bord).

### 3. Sens de la Marée (Phase)
- **Phase préférentielle (ex: marée montante)** : **+0,8 point**. Le courant montant pousse les séries et ouvre les épaules de vagues.
- **Phase non optimale** : **-0,6 point**.

### 4. Coefficient de Marée
- **Anglet avec coefficient $\ge 80$** : **-0,4 point** en raison du fort courant de baïne.
- **Coefficient standard propice (60 à 85)** : **+0,3 point**.

### 5. Micro-variation Déterministe & Bornage
- Ajustement fin non-aléatoire issu du hash du spot pour départager les ex-aequo sans fausser les conditions.
- Score final borné entre **1,0 et 9,8**, arrondi au dixième (ex: `9,6/10`).

---

## 3. Calcul du Créneau Idéal (`Idéal : 10h–16h`)

La fonction `findBestWindow` analyse les 24 heures de la courbe du jour :
1. Repère les plages continues où la hauteur d'eau est optimale ($\pm 15$ cm).
2. Isole et formate les fenêtres de jour (07h00 à 21h00).
