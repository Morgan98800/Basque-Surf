import React, { useState, useEffect, useMemo } from 'react';
import { BASQUE_SPOTS, TOWN_TO_SLUG } from './data/spots';
import { Spot, TideData, BasqueTown } from './types/index';
import { fetchTideData } from './services/tides';
import { evaluateSpotConditions } from './services/scoring';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { DateSelector } from './components/DateSelector';
import { SpotCard } from './components/SpotCard';
import { SpotMap } from './components/SpotMap';
import { SpotDetailModal } from './components/SpotDetailModal';
import { AlertCircle } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'basque_surf_favorites';

export const App: React.FC = () => {
  const [tidesByTown, setTidesByTown] = useState<Record<string, TideData>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Jour sélectionné : 0 = Aujourd'hui, 1 = Demain ... jusqu'à 6 (7 jours)
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Vue : Liste ou Carte
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Recherche & Filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<BasqueTown | 'ALL'>('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Spot sélectionné pour Bottom Sheet ou Carte
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Favoris persistants
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    } catch {
      return ['biarritz-cote-des-basques', 'anglet-cavaliers', 'st-jean-lafitenia'];
    }
  });

  // Deep linking par URL (?view=map, ?spot=biarritz-cote-des-basques, ?town=Biarritz)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView === 'map' || urlView === 'list') setViewMode(urlView);

      const urlTown = params.get('town');
      if (urlTown) setSelectedTown(urlTown as BasqueTown);

      const urlSpot = params.get('spot');
      if (urlSpot) {
        const found = BASQUE_SPOTS.find((s) => s.id === urlSpot);
        if (found) setSelectedSpot(found);
      }
    } catch {}
  }, []);

  // Chargement des marées officielles de la Côte Basque selon le jour choisi
  const loadAllTides = async (offset: number) => {
    setLoading(true);
    const slugs = ['biarritz', 'anglet', 'bidart', 'guethary', 'saint-jean-de-luz', 'hendaye'];
    const newTides: Record<string, TideData> = {};

    try {
      const biarritzData = await fetchTideData('biarritz', offset);
      newTides['biarritz'] = biarritzData;
      setTidesByTown({ ...newTides });

      const others = slugs.filter(s => s !== 'biarritz');
      const results = await Promise.allSettled(others.map(slug => fetchTideData(slug, offset)));
      
      results.forEach((res, index) => {
        const slug = others[index];
        newTides[slug] = res.status === 'fulfilled' ? res.value : biarritzData;
      });

      setTidesByTown({ ...newTides });
    } catch (err) {
      console.error('Erreur chargement marées', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTides(selectedDayOffset);
  }, [selectedDayOffset]);

  const handleToggleFavorite = (spotId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Marée active pour l'en-tête (dépend de la ville sélectionnée, ou Biarritz)
  const activeHeaderTide = useMemo(() => {
    if (selectedTown !== 'ALL') {
      const slug = TOWN_TO_SLUG[selectedTown];
      return tidesByTown[slug] || tidesByTown['biarritz'] || null;
    }
    return tidesByTown['biarritz'] || null;
  }, [selectedTown, tidesByTown]);

  // Scores par spot avec marée locale dédiée
  const spotsWithScores = useMemo(() => {
    const fallbackTide = tidesByTown['biarritz'];
    if (!fallbackTide) return [];

    return BASQUE_SPOTS.map((spot) => {
      const spotTide = tidesByTown[spot.coefMareeSlug] || fallbackTide;
      const score = evaluateSpotConditions(spot, spotTide);
      return {
        spot,
        score,
        tide: spotTide,
        isFavorite: favorites.includes(spot.id),
      };
    });
  }, [tidesByTown, favorites]);

  // Filtrage et Tri (Toujours trié par meilleure note pour le surfeur)
  const filteredSpots = useMemo(() => {
    return spotsWithScores
      .filter(({ spot, isFavorite }) => {
        if (showFavoritesOnly && !isFavorite) return false;
        if (selectedTown !== 'ALL' && spot.town !== selectedTown) return false;
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase().trim();
          return (
            spot.name.toLowerCase().includes(query) ||
            spot.town.toLowerCase().includes(query) ||
            spot.description.toLowerCase().includes(query) ||
            spot.level.toLowerCase().includes(query)
          );
        }
        return true;
      })
      .sort((a, b) => b.score.score - a.score.score);
  }, [spotsWithScores, searchTerm, selectedTown, showFavoritesOnly]);

  const selectedSpotTide = useMemo(() => {
    if (!selectedSpot) return null;
    return tidesByTown[selectedSpot.coefMareeSlug] || tidesByTown['biarritz'] || null;
  }, [selectedSpot, tidesByTown]);

  return (
    <div className="min-h-screen bg-[#03070d] relative text-white selection:bg-[#007AFF] selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Vrai Fond Lumineux Ambiant avec Dérive Continue (Ambient Orbs) */}
      <div className="ambient-glow" />

      {/* Couche de Grain Subtile (Film Grain SVG) */}
      <div className="noise-overlay" />

      {/* Racine de l'application avec recul de la vue parente pour les feuilles modales */}
      <div className="app-root min-h-screen flex flex-col">

        {/* Barre supérieure iOS Liquid Glass avec Lauburu */}
        <Header tideData={activeHeaderTide} />

        {/* Conteneur Principal : Mobile Single-Column / Desktop Split-View Apple Plans */}
        <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-4 sm:px-6 pt-3 pb-24 sm:pb-24 overflow-x-hidden">
          
          <div className="flex flex-col lg:flex-row gap-5 items-start w-full min-w-0">
            
            {/* Volet Gauche : Sélecteur 7 Jours + Liste de Spots (sur Desktop largeur fixe ~450px) */}
            <div className="w-full min-w-0 lg:w-[450px] xl:w-[480px] shrink-0 space-y-3">
              
              {/* Sélecteur hebdomadaire 7 jours Apple */}
              <DateSelector
                selectedOffset={selectedDayOffset}
                onSelectOffset={setSelectedDayOffset}
              />

              {/* Sur mobile : affichage carte si viewMode === 'map' */}
              <div className="block lg:hidden">
                {viewMode === 'map' ? (
                  <div className="h-[62vh] rounded-3xl overflow-hidden liquid-glass-card border border-white/[0.12] mb-2 shadow-xl animate-fade-in">
                    <SpotMap
                      spots={filteredSpots}
                      selectedSpot={selectedSpot}
                      onSelectSpot={(sp) => setSelectedSpot(sp)}
                      onOpenDetails={(sp) => setSelectedSpot(sp)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ) : null}
              </div>

              {/* Liste des spots : toujours visible sur Desktop, conditionnelle sur Mobile */}
              <div className={`${viewMode === 'map' ? 'hidden lg:block' : 'block'}`}>
                {loading && Object.keys(tidesByTown).length === 0 ? (
                  <div className="py-20 text-center space-y-2.5">
                    <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-white/50 font-medium">Chargement des conditions...</p>
                  </div>
                ) : filteredSpots.length === 0 ? (
                  <div className="py-14 text-center bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 space-y-2 animate-slide-up">
                    <AlertCircle className="w-8 h-8 text-white/30 mx-auto stroke-[1.8]" />
                    <h3 className="text-sm font-semibold text-white">Aucun spot trouvé</h3>
                    <p className="text-xs text-white/50 max-w-xs mx-auto font-normal">
                      {showFavoritesOnly 
                        ? "Ajoutez des spots en favoris pour les retrouver ici."
                        : "Essayez un autre mot clé ou sélectionnez une autre commune."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredSpots.map(({ spot, score, tide, isFavorite }, index) => (
                      <div
                        key={spot.id}
                        onMouseEnter={() => setSelectedSpot(spot)}
                        className="animate-fade-in"
                        style={{
                          animationDelay: `${Math.min(index * 25, 200)}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <SpotCard
                          spot={spot}
                          score={score}
                          tide={tide}
                          isFavorite={isFavorite}
                          isTop={index === 0 && !searchTerm && selectedTown === 'ALL' && !showFavoritesOnly}
                          onToggleFavorite={handleToggleFavorite}
                          onSelectSpot={(sp) => setSelectedSpot(sp)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Volet Droit Desktop : Carte Apple Plans Persistante */}
            <div className="hidden lg:block flex-1 sticky top-16 h-[calc(100vh-100px)] rounded-[2rem] overflow-hidden liquid-glass-card border border-white/[0.12] shadow-2xl">
              <SpotMap
                spots={filteredSpots}
                selectedSpot={selectedSpot}
                onSelectSpot={(sp) => setSelectedSpot(sp)}
                onOpenDetails={(sp) => setSelectedSpot(sp)}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>

          </div>

        </main>

        {/* Barre d'action inférieure flottante style iOS Liquid Glass Dock (1 Ligne Compacte) */}
        <nav className="fixed bottom-0 inset-x-0 z-40 liquid-glass-nav pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTown={selectedTown}
              onTownChange={setSelectedTown}
              showFavoritesOnly={showFavoritesOnly}
              onToggleFavoritesOnly={() => setShowFavoritesOnly(!showFavoritesOnly)}
              favoritesCount={favorites.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </nav>

      </div>

      {/* Spot Detail Mobile Bottom Sheet / Modal */}
      {selectedSpot && selectedSpotTide && (
        <SpotDetailModal
          spot={selectedSpot}
          score={evaluateSpotConditions(selectedSpot, selectedSpotTide)}
          tide={selectedSpotTide}
          isFavorite={favorites.includes(selectedSpot.id)}
          isToday={selectedDayOffset === 0}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedSpot(null)}
        />
      )}

    </div>
  );
};

export default App;
