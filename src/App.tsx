import React, { useState, useEffect, useMemo } from 'react';
import { BASQUE_SPOTS, TOWN_TO_SLUG } from './data/spots';
import { Spot, TideData, BasqueTown } from './types/index';
import { fetchTideData } from './services/tides';
import { evaluateSpotConditions } from './services/scoring';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SpotCard } from './components/SpotCard';
import { SpotMap } from './components/SpotMap';
import { SpotDetailModal } from './components/SpotDetailModal';
import { AlertCircle } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'basque_surf_favorites';

export const App: React.FC = () => {
  const [tidesByTown, setTidesByTown] = useState<Record<string, TideData>>({});
  const [loading, setLoading] = useState<boolean>(true);

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

  // Chargement des marées officielles de la Côte Basque
  const loadAllTides = async () => {
    setLoading(true);
    const slugs = ['biarritz', 'anglet', 'bidart', 'guethary', 'saint-jean-de-luz', 'hendaye'];
    const newTides: Record<string, TideData> = {};

    try {
      const biarritzData = await fetchTideData('biarritz');
      newTides['biarritz'] = biarritzData;
      setTidesByTown({ ...newTides });

      const others = slugs.filter(s => s !== 'biarritz');
      const results = await Promise.allSettled(others.map(slug => fetchTideData(slug)));
      
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
    loadAllTides();
    const interval = setInterval(() => loadAllTides(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-nautical-900 flex flex-col text-slate-100">
      
      {/* Barre supérieure ultra-fine : Marque + Marée live IFREMER/SHOM */}
      <Header tideData={activeHeaderTide} />

      {/* Main Content avec padding-bottom suffisant pour le dock inférieur */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 pt-3 pb-28 sm:pb-32 space-y-2.5 sm:space-y-3">

        {/* Dynamic View: Map or List */}
        {viewMode === 'map' ? (
          <section className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Carte interactive ({filteredSpots.length} spots)</span>
              <span className="text-slate-500 font-mono">Anglet • Hendaye</span>
            </div>

            <SpotMap
              spots={filteredSpots}
              selectedSpot={selectedSpot}
              onSelectSpot={(sp) => setSelectedSpot(sp)}
              onOpenDetails={(sp) => setSelectedSpot(sp)}
              onToggleFavorite={handleToggleFavorite}
            />
          </section>
        ) : (
          <section className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>
                {filteredSpots.length} {filteredSpots.length > 1 ? 'spots classés par note' : 'spot'}
                {selectedTown !== 'ALL' && ` à ${selectedTown}`}
                {showFavoritesOnly && ' (favoris)'}
              </span>
              <span className="text-slate-500 font-mono">
                Marées IFREMER / SHOM
              </span>
            </div>

            {loading && Object.keys(tidesByTown).length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400">Chargement des marées...</p>
              </div>
            ) : filteredSpots.length === 0 ? (
              <div className="py-12 text-center bg-nautical-850 border border-nautical-750 rounded-xl p-6 space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-200">Aucun spot trouvé</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {showFavoritesOnly 
                    ? "Ajoutez des spots en favoris en cliquant sur l'étoile pour les retrouver ici."
                    : "Essayez un autre mot clé ou sélectionnez une autre commune."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredSpots.map(({ spot, score, tide, isFavorite }, index) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    score={score}
                    tide={tide}
                    isFavorite={isFavorite}
                    isTop={index === 0 && !searchTerm && selectedTown === 'ALL' && !showFavoritesOnly}
                    onToggleFavorite={handleToggleFavorite}
                    onSelectSpot={(sp) => setSelectedSpot(sp)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

      </main>

      {/* Dock inférieur ergonomique (Thumb Zone pour smartphone) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-nautical-900/95 backdrop-blur-md border-t border-nautical-750/90 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6">
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

      {/* Clean Footer */}
      <footer className="border-t border-nautical-800 bg-nautical-950 py-4 text-[11px] text-slate-400 mb-24 sm:mb-20">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-sm bg-ikurrina-red"></span>
            <span className="font-bold text-slate-300">BASQUE SURF</span>
            <span className="text-slate-600">•</span>
            <span>Anglet à Hendaye</span>
          </div>

          <div className="text-slate-500">
            Données marées officielles CoefMarée (IFREMER / SHOM)
          </div>
        </div>
      </footer>

      {/* Spot Detail Mobile Bottom Sheet / Modal */}
      {selectedSpot && selectedSpotTide && (
        <SpotDetailModal
          spot={selectedSpot}
          score={evaluateSpotConditions(selectedSpot, selectedSpotTide)}
          tide={selectedSpotTide}
          isFavorite={favorites.includes(selectedSpot.id)}
          onToggleFavorite={handleToggleFavorite}
          onClose={() => setSelectedSpot(null)}
        />
      )}

    </div>
  );
};

export default App;
