# Basque Surf — Apple Liquid Glass Design System

Spécification complète du design system **Apple Liquid Glass** (inspiré d'iOS 18, VisionOS et Apple Météo) développé pour l'application **Basque Surf**. Ce document détaille les règles visuelles, typographiques, physiques et de composants pour toute reproduction ou extension dans Claude ou d'autres environnements.

---

## 1. Philosophie & Principes Fondateurs

1. **Matérialité & Réfraction Physique** :
   - L'interface n'est pas un thème sombre plat classique. Elle est constituée de **matériaux physiques translucides** qui laissent transparaître et réfractent la lumière d'orbes ambiantes colorées (*Ambient Mesh Glow* : cyan atlantique, bleu nuit, indigo).
   - Chaque panneau possède un biseau spéculaire supérieur (`border-top: 1px solid rgba(255,255,255,0.22)`) simulant l'arête biseautée d'un verre taillé recevant une source lumineuse zénithale.

2. **Typographie San Francisco & Chiffres Tabulaires** :
   - Police système Apple (`-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"`).
   - Pour les données numériques critiques (notes de surf, hauteurs de marée, horaires et coefficients), activation obligatoire d'OpenType `tnum` (chiffres tabulaires) et `zero` pour éliminer tout tressautement de mise en page.

3. **Physique des Ressorts (*Apple Springs*)** :
   - Pas de transitions linéaires ou saccadées : utilisation exclusive de courbes d'accélération douces et de retours élastiques (`cubic-bezier(0.25, 1, 0.5, 1)`).
   - Retour haptique visuel instantané sur tous les éléments cliquables (`active:scale-[0.98]` ou `active:scale-90`).

---

## 2. Palette Chromatique & Tokens Sémantiques

### Arrière-plans & Éclairage Ambiant
| Token | Valeur CSS | Utilisation |
|---|---|---|
| `--bg-base` | `#03070d` | Noir abyssal profond (fond d'écran) |
| `--glow-teal` | `rgba(20, 184, 166, 0.15)` | Orbe lumineuse diffuse haute (lumière océanique) |
| `--glow-blue` | `rgba(37, 99, 235, 0.12)` | Orbe latérale droite (profondeur) |
| `--glow-cyan` | `rgba(6, 182, 212, 0.10)` | Orbe inférieure gauche |

### Matériaux Liquid Glass
| Matériau | Background | Flou & Saturation | Bordures | Ombres |
|---|---|---|---|---|
| **`.liquid-glass-card`** | `linear-gradient(160deg, rgba(255,255,255,0.075), rgba(255,255,255,0.015))` | `blur(32px) saturate(200%)` | `1px solid rgba(255,255,255,0.1)`, haut `rgba(255,255,255,0.22)` | `0 14px 40px -4px rgba(0,0,0,0.55)`, inset `0 1px 1.5px rgba(255,255,255,0.22)` |
| **`.liquid-glass-nav`** | `linear-gradient(180deg, rgba(14,18,28,0.82), rgba(4,7,12,0.94))` | `blur(36px) saturate(220%)` | `border-top: 1px solid rgba(255,255,255,0.16)` | `0 -14px 44px rgba(0,0,0,0.85)` |
| **`.liquid-glass-pill`** | `rgba(255, 255, 255, 0.08)` | `blur(20px) saturate(180%)` | `1px solid rgba(255,255,255,0.12)`, haut `rgba(255,255,255,0.2)` | Inset `0 1px 1px rgba(255,255,255,0.2)` |

### Couleurs Fonctionnelles (Accents Apple)
| Rôle | Teinte Apple | Code Hex | Halo / Glow |
|---|---|---|---|
| **Excellentes conditions (>= 8.0)** | Apple Green | `#34C759` / `#30D158` | `shadow-[0_0_14px_rgba(52,199,89,0.3)]` |
| **Bonnes conditions (6.0 - 7.9)** | Apple Blue | `#007AFF` / `#0A84FF` | `shadow-[0_0_12px_rgba(0,122,255,0.25)]` |
| **Conditions moyennes (4.0 - 5.9)** | Apple Orange | `#FF9500` / `#FF9F0A` | `shadow-[0_0_12px_rgba(255,149,0,0.25)]` |
| **Danger / Falaise / Mur** | Apple Red | `#FF3B30` / `#FF453A` | `shadow-[0_0_12px_rgba(255,59,48,0.3)]` |
| **Favoris** | Apple Star Gold | `#FF9500` | Remplissage plein et surbrillance |

---

## 3. Composants d'Élite

### A. Le Marégraphe 24h Continu (Style Apple Météo)
- Tracé vectoriel en **spline cubique continue** (courbe de Bézier cubique calculée dynamiquement sur 24 points horaires).
- Remplissage océanique en dégradé vertical (`#0A84FF` avec opacité 32% vers 0%).
- Bande horizontale émeraude translucide (`#30D158` avec tirets `strokeDasharray="3 3"`) indiquant la plage d'eau idéale du spot sélectionné.
- Anneau indicateur animé (`animate-ping`) et point plein orange à l'heure courante avec affichage dynamique de la hauteur (`X.XXm`).

### B. Header Dynamic Island
- Barre supérieure compacte translucide (`bg-[#070b12]/75 backdrop-blur-2xl`).
- Emblème basque minimaliste en orbes de couleur émeraude et rouge rubis.
- Capsule d'état avec flèche de sens de la marée (`ArrowUp` cyan / `ArrowDown` orange), hauteur en direct, et coefficient officiel IFREMER/SHOM.
- Heures des pleines et basses mers au format tabulaire mono.

### C. Sélecteur 7 Jours (Tuiles Complication iOS 18)
- 7 tuiles journalières horizontales avec label de jour abrégé, grand numéro de date et mois.
- La tuile active se détache en blanc plein avec ombre portée douce (`shadow-[0_6px_24px_rgba(255,255,255,0.3)]`) et point d'accent bleu Apple en dessous.
- Masque de fondu latéral droit sur mobile pour suggérer le défilement horizontal fluide.

### D. Cartes de Spots
- Bords arrondis continus (*Squircles* `rounded-[1.75rem]`).
- Pastille de score style complication Apple Watch avec halo diffus et point coloré.
- Bouton favori haute précision tactile (`w-10 h-10`).
- Capsule créneau horaire avec icône d'horloge et séparation soignée.

### E. Dock Inférieur Flottant (Liquid Glass Dock)
- Positionné au-dessus de la zone de sécurité (`env(safe-area-inset-bottom)`).
- Organisation à deux niveaux sur mobile :
  1. Champ de recherche pleine largeur sans compression.
  2. Sélecteur de commune en menu popover, Segmented Control Liste/Carte, et bouton favoris avec compteur.
