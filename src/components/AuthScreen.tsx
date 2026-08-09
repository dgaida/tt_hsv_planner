import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AuthScreenProps {
  onSelectPlayer: (profile: any) => void;
}

export default function AuthScreen({ onSelectPlayer }: AuthScreenProps) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('name');

        if (error) throw error;
        const list = data || [];
        setProfiles(list);

        // Pre-select cached player if exists
        const cachedId = localStorage.getItem('ttv_selected_player_id');
        if (cachedId && list.some((p) => p.id === cachedId)) {
          setSelectedId(cachedId);
        } else if (list.length > 0) {
          setSelectedId(list[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching profiles:', err);
        setError('Fehler beim Laden der Spielerliste.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Bitte wähle einen Spieler aus.');
      return;
    }

    const player = profiles.find((p) => p.id === selectedId);
    if (player) {
      localStorage.setItem('ttv_selected_player_id', player.id);
      onSelectPlayer(player);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-sm font-semibold text-gray-500">Lade Spieler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-gray-100 text-center">
        <div className="text-4xl mb-4">🏓</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Spieler-Anmeldung</h2>
        <p className="text-sm text-gray-500 mb-6">
          Wähle deinen Namen aus der Vereinsliste aus, um dich anzumelden.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium text-left">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="text-left">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Dein Name / Profil
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-base"
              required
            >
              <option value="" disabled>-- Bitte wählen --</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.ttr_points ? `(${p.ttr_points} TTR-Punkte)` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 text-base"
          >
            Anmelden
          </button>
        </form>
      </div>
    </div>
  );
}
