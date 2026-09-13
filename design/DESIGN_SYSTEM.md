# Basque Surf — Apple Liquid Glass Design System v2

Spécification complète du design system **Apple Liquid Glass v2** (inspiré d'iOS 18, VisionOS, Apple Watch et Apple Météo) développé pour l'application **Basque Surf**. Ce document détaille les règles visuelles, typographiques, physiques et de composants pour toute reproduction ou extension dans Claude ou d'autres environnements.

---

## 1. Philosophie & Principes Fondateurs

1. **Matérialité & Réfraction Physique (Liquid Glass v2)** :
   - L'interface n'est pas un thème sombre plat classique. Elle est constituée de **matériaux physiques translucides** qui laissent transparaître et réfractent la lumière d'orbes ambiantes animées en dérive continue (*Ambient Mesh Glow* : cyan atlantique, bleu nuit, indigo avec cycle de 36s).
   - Couche de grain subtile (Film Grain SVG en turbulence fractale) éliminant tout effet de bande de couleur (*banding*).
   - Chaque panneau possède un biseau spéculaire supérieur zénithal (`inset 0 1px 0 rgba(255,255,255,0.24)`) et un rebond lumineux inférieur (`inset 0 -1px 0 rgba(255,255,255,0.05)`) simulant l'arête d'un verre taillé recevant une source lumineuse supérieure.
   - Support d'accessibilité natif `@media (prefers-reduced-transparency: reduce)` augmentant l'opacité à 94%.

2. **Typographie San Francisco & Chiffres Tabulaires Apple** :
   - Police système Apple (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display"`).
   - Note de surf et complications numériques : `ui-rounded, "SF Pro Rounded", system-ui`.
   - Activation stricte d'OpenType `font-variant-numeric: tabular-nums` et `font-feature-settings: "tnum" 1, "zero" 0` pour un espacement parfait des chiffres sans tressautement. Format français avec virgule native (`9,5`, `9,4`) sans espacements superflus.

3. **Physique des Ressorts (*Apple Springs*) & Recul iOS 18** :
   - Fonction d'amorti fluide CSS `var(--spring)` basée sur la fonction standard `linear(...)` simulant un ressort critique sans rebond brutal.
   - Effet de profondeur parent iOS 18 : à l'ouverture d'une feuille modale, le corps de l'application recule à `scale(0.96)` avec adoucissement des coins (`rounded-[2rem]`) et assombrissement d'arrière-plan.
   - Retour tactile visuel instantané sur tous les contrôles (`active:scale-[0.98]` ou `active:scale-90`).

---

## 2. Palette Chromatique & Tokens Sémantiques

### Arrière-plans & Éclairage Ambiant
| Token | Valeur CSS | Utilisation |
|---|---|---|
| `--bg-base` | `#03070d` | Noir abyssal profond (fond d'écran) |
| `--glow-teal` | `rgba(20, 184, 166, 0.26)` | Orbe lumineuse diffuse haute (lumière océanique) |
| `--glow-blue` | `rgba(37, 99, 235, 0.20)` | Orbe latérale droite (profondeur) |
| `--glow-cyan` | `rgba(6, 182, 212, 0.16)` | Orbe inférieure gauche |

### Matériaux Liquid Glass
| Matériau | Background | Flou & Saturation | Bordures | Ombres |
|---|---|---|---|---|
| **`.liquid-glass-card`** | `linear-gradient(160deg, rgba(255,255,255,0.085), rgba(255,255,255,0.02))` | `blur(32px) saturate(190%)` | `1px solid rgba(255,255,255,0.08)` | Inset sup `rgba(255,255,255,0.24)`, Inset inf `rgba(255,255,255,0.05)`, Ombre `0 18px 48px -12px rgba(0,0,0,0.7)` |
| **`.liquid-glass-nav`** | `linear-gradient(180deg, rgba(10,14,24,0.85), rgba(3,7,13,0.96))` | `blur(36px) saturate(200%)` | `border-top: 1px solid rgba(255,255,255,0.12)` | `0 -12px 36px rgba(0,0,0,0.85)` |
| **`.liquid-glass-pill`** | `rgba(255, 255, 255, 0.06)` | `blur(20px) saturate(180%)` | `1px solid rgba(255,255,255,0.1)` | Inset `0 1px 1px rgba(255,255,255,0.18)` |

### Hiérarchie Sémantique des Niveaux de Danger
Fin des alertes rouges omniprésentes. Le rouge est strictement réservé au danger immédiat :
| Niveau | Token | Valeur Hex | Badge Inline (24px) | Règle d'usage |
|---|---|---|---|---|
| **`safe`** | Vert Apple | `#30D158` | `bg-[#30D158]/12 text-[#30D158]` (ex: *✔ Débutants*, *✔ Tous niveaux*) | Spot accessible sans risque particulier (ex: Hendaye). |
| **`caution`** | Ambre Apple | `#FF9F0A` | `bg-[#FF9F0A]/12 text-[#FF9F0A]` (ex: *⚠️ Rochers*, *⚠️ Shorebreak*) | Prudence normale de session côtière. |
| **`danger`** | Rouge Apple | `#FF453A` | `bg-[#FF453A]/15 text-[#FF6961]` (ex: *🛑 Danger Digue*) | Péril immédiat (ex: Côte des Basques à marée haute). Seul cas d'alerte rouge pleine largeur dans la modale. |

---

## 3. Composants Clés

### A. Le Marégraphe 24h Tactile Continu (Style Apple Météo)
- Tracé vectoriel en spline cubique continue sur 24 points horaires interpolés.
- Remplissage liquide bleuté avec dégradé vertical et surbrillance verte semi-transparente pour la plage d'eau recommandée.
- **Scrubbing tactile interactif** : curseur déplaçable au doigt ou à la souris sur les 24h avec affichage instantané de la hauteur calculée et ligne repère verticale.
- Grille temporelle épurée à 4 repères (`00h`, `06h`, `12h`, `18h`, `24h`) et axe vertical minimal à droite.

### B. Header Dynamic Island avec Lauburu Monochrome
- Emblème basque Lauburu vectoriel monochrome blanc/argenté intégré dans une pastille en verre biseauté.
- Capsule Dynamic Island affichant la hauteur d'eau en direct, la flèche de sens (`ArrowUp` cyan / `ArrowDown` orange) et le coefficient officiel.
- Sur grand écran, affichage des heures des pleines mers (PM) et basses mers (BM).

### C. Sélecteur 7 Jours Uniforme (Complication iOS 18)
- 7 tuiles horizontales scroll-snap avec abréviation stricte à 3 lettres (`DIM`, `LUN`, `MAR`, `MER`, `JEU`, `VEN`, `SAM`).
- Tuile active en blanc pur contrasté avec typographie noire et pastille bleue Apple en dessous.

### D. Cartes de Spots Compactes (~108px)
- Format haute densité permettant d'afficher 5 à 6 spots simultanément sur mobile.
- Ligne 1 : Commune (cyan), type de vague, badge Top éventuel et étoile de favori.
- Ligne 2 : Nom du spot en gras et pastille de note SF Pro Rounded sur la **même ligne**.
- Ligne 3 : Créneau horaire compact (`08h–12h · 14h–18h`), chip sémantique 24px et chevron discret.

### E. Dock Inférieur Unifié (50px, 1 Ligne)
- Compact et unifié sur une seule ligne.
- Sélecteur de commune avec popover modal Liquid Glass.
- Segmented control tactile basculant entre Vue Liste et Vue Carte.
- Bouton favoris avec compteur en pastille.
- Bouton de recherche dépliable tactilement sur mobile et intégré sur desktop.

### F. Desktop Split-View (Style Apple Plans macOS)
- Sur écran large (>= 1024px) :
  - **Volet gauche fixe (~450px)** : Liste continue des spots avec sélecteur 7 jours et synchronisation au survol.
  - **Volet droit persistant** : Carte géographique plein écran interactive (tuiles Esri Dark Gray sans filigrane, marqueurs scores declutterisés, fiche d'action flottante au clic).

### G. Sélecteur Intelligent d'Application GPS (*GPSActionSheet*)
- Permet à l'utilisateur de choisir entre Apple Plans, Google Maps et Waze.
- Mémorise le choix dans le stockage local pour les sessions futures, avec possibilité de réinitialiser à tout moment.
- Masque de fondu inférieur (`.sheet-scroll`) au-dessus de la zone d'action pour un défilement propre sans collision visuelle.

