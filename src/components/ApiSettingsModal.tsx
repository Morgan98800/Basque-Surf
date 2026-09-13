import React, { useState } from 'react';
import { ApiSettings } from '../types/index';
import { saveApiSettings } from '../services/tides';
import { X, Key, CheckCircle2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ApiSettings;
  onSave: (newSettings: ApiSettings) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [provider, setProvider] = useState<'coefmaree' | 'stormglass' | 'worldtides'>(currentSettings.provider || 'coefmaree');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ApiSettings = {
      apiKey: apiKey.trim(),
      provider,
      enabled: provider === 'coefmaree' ? true : apiKey.trim().length > 0
    };
    saveApiSettings(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-ocean-500/10 text-ocean-400 border border-ocean-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Source & API Marées</h3>
              <p className="text-xs text-slate-400">Côte Basque (Anglet à Hendaye)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4">
          
          {/* Provider Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Fournisseur de données marées
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 transition cursor-pointer"
            >
              <option value="coefmaree">🌊 CoefMarée (Recommandé : Gratuit, Sans clé, Atlas IFREMER/SHOM)</option>
              <option value="stormglass">⚡ Stormglass.io (Requiert une clé API)</option>
              <option value="worldtides">🌐 WorldTides API (Requiert une clé API)</option>
            </select>
          </div>

          {/* Details on selected provider */}
          {provider === 'coefmaree' ? (
            <div className="p-3.5 rounded-xl bg-ocean-950/60 border border-ocean-800/80 text-xs text-slate-300 space-y-2">
              <div className="flex items-center space-x-1.5 text-ocean-300 font-semibold">
                <Sparkles className="w-4 h-4 text-ocean-400" />
                <span>API Développeur CoefMarée active</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Fournit les prédictions calculées à partir de l'atlas harmonique <strong>IFREMER / PREVIMER</strong> et calibrées sur les marégraphes officiels <strong>SHOM / REFMAR</strong>.
              </p>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Gratuit, sans clé API requise, requêtes CORS directes autorisées.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Clé API {provider === 'stormglass' ? 'Stormglass' : 'WorldTides'}
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Collez votre clé API ici..."
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500 transition"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-transparent rounded-xl transition"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-ocean-600 hover:bg-ocean-500 rounded-xl shadow-md shadow-ocean-600/30 transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Appliquer</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
