# Migration vers le Moteur de Scoring Basque Surf v2

Ce guide documente les changements architecturaux introduits par le moteur de scoring v2 et la manière de brancher les nouveaux champs (`quality`, `hazard`, `confidence`, `breakdown`) sur l'interface utilisateur existante.

---

## 1. Ce qui a changé

### Modèle mathématique
- **v1** : Modèle additif basé uniquement sur la hauteur et la phase de marée ($6.5 + \text{bonus} - \text{malus}$).
- **v2** : **Modèle multiplicatif à facteur limitant** intégrant la houle ($H, T, \theta$), l'exposition spécifique du spot, le vent et son orientation offshore, la marée continue $C^1$ et la durée réelle de la session :
  $$Q = 10 \times f_{\text{swell}}^{0.40} \times f_{\text{period}}^{0.15} \times f_{\text{wind}}^{0.25} \times f_{\text{tide}}^{0.30} \times f_{\text{window}}^{0.10}$$

### Règle d'or : Sécurité et Qualité séparées
Dans la version 1, un danger (ex: Côte des Basques à marée haute) écrasait arbitrairement la note de vagues à 1.2/10.
Dans la version 2 :
- `quality` mesure **la qualité pure des vagues**.
- `hazard` (`'none'` | `'caution'` | `'critical'`) et `recommended: boolean` gèrent **la sécurité physique**.
- Si `hazard === 'critical'`, l'UI affiche le badge de danger explicite (ex: *Danger Digue*) et le score avec indicateur d'alerte, mais ne tronque pas la réalité hydrodynamique.

---

## 2. Nouveaux Fichiers Disponibles

- [`src/scoring/types.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/types.ts) : Interfaces TypeScript complètes (`MarineConditions`, `SpotEnriched`, `SpotScoreV2`, `HazardSeverity`).
- [`src/scoring/weights.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/weights.ts) : Objet `WEIGHTS` configurable sans toucher au code métier.
- [`src/scoring/factors.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/factors.ts) : Fonctions pures $C^1$ `calculateFSwell`, `calculateFPeriod`, `calculateFWind`, `calculateFTide`, `calculateFWindow`.
- [`src/scoring/solar.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/solar.ts) : Éphéméride solaire locale haute précision pour 43.48° N (zéro dépendance externe).
- [`src/scoring/engine.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/engine.ts) : Fonction maîtresse `scoreSpot()` et `findBestWindowV2()`.
- [`src/providers/openMeteoMarine.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/providers/openMeteoMarine.ts) : Provider Open-Meteo Marine (open-access gratuit sans clé API) avec cache 30 minutes.
- [`src/scoring/__tests__/scoring.test.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/scoring/__tests__/scoring.test.ts) : Harnais de tests automatisé validant les 6 journées archétypes basques.

---

## 3. Rétro-compatibilité Immédiate

Le module [`src/services/scoring.ts`](file:///Users/morgancanteri/Documents/Basque%20Surf/src/services/scoring.ts) reste rétro-compatible avec l'UI actuelle :
- L'UI consomme `score.scoreFormatted` (`9,6`), `score.score` (`9.6`), `score.label` et `score.bestWindowToday`.
- Les nouveaux champs `score.confidence` ($0.40$ à $0.95$) et `score.breakdown` sont déjà injectés dans l'objet `SpotScore` pour permettre l'affichage des détails (énergie, houle efficace, vent, marée) dans la modale détaillée.
