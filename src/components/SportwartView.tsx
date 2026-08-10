import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Plus, Edit2, Trash2, Check, X, Shield, Calendar, AlertCircle } from 'lucide-react';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function SportwartView() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [absences, setAbsences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings
  const [registeredTeamsCount, setRegisteredTeamsCount] = useState<number>(3);
  const [savingSettings, setSavingSettings] = useState(false);

  // Player Form State
  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' or profile.id
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<'player' | 'team_manager' | 'sportwart' | 'club_admin'>('player');
  const [formTtrPoints, setFormTtrPoints] = useState<number>(1500);
  const [formTeamNumber, setFormTeamNumber] = useState<string>('');
  const [formPositionNumber, setFormPositionNumber] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      setProfiles(profs || []);

      // 2. Fetch active teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*')
        .eq('active', true)
        .order('name');
      setTeams(teamsData || []);

      // 3. Fetch registered teams count setting
      const { data: setting } = await supabase
        .from('club_settings')
        .select('*')
        .eq('key', 'registered_teams_count')
        .single();
      if (setting) {
        setRegisteredTeamsCount(parseInt(setting.value, 10) || 3);
      }

      // 4. Fetch all player absences
      const { data: absData } = await supabase
        .from('absences')
        .select('*, profiles(name)')
        .order('start_date', { ascending: true });
      setAbsences(absData || []);
    } catch (err) {
      console.error('Error loading Sportwart data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase
        .from('club_settings')
        .upsert({
          key: 'registered_teams_count',
          value: String(registeredTeamsCount),
        });

      if (error) throw error;
      alert('Einstellungen erfolgreich gespeichert!');
    } catch (err: any) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenNewForm = () => {
    setIsEditing('new');
    setFormName('');
    setFormRole('player');
    setFormTtrPoints(1500);
    setFormTeamNumber('');
    setFormPositionNumber('');
  };

  const handleOpenEditForm = (p: any) => {
    setIsEditing(p.id);
    setFormName(p.name);
    setFormRole(p.role);
    setFormTtrPoints(p.ttr_points || 0);
    setFormTeamNumber(p.team_number ? String(p.team_number) : '');
    setFormPositionNumber(p.position_number ? String(p.position_number) : '');
  };

  const handleCancelForm = () => {
    setIsEditing(null);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const ttr = Number(formTtrPoints) || 0;
    const teamNum = formTeamNumber ? Number(formTeamNumber) : null;
    const posNum = formPositionNumber ? Number(formPositionNumber) : null;

    try {
      let playerId = '';

      if (isEditing === 'new') {
        const generatedId = generateUUID();
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: generatedId,
            name: formName.trim(),
            role: formRole,
            ttr_points: ttr,
            team_number: teamNum,
            position_number: posNum,
          })
          .select()
          .single();

        if (error) throw error;
        playerId = data?.id || generatedId;
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: formName.trim(),
            role: formRole,
            ttr_points: ttr,
            team_number: teamNum,
            position_number: posNum,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditing);

        if (error) throw error;
        playerId = isEditing;
      }

      // Sync team_players many-to-many map automatically if team_number is provided
      if (teamNum && teams.length >= teamNum) {
        const targetTeam = teams[teamNum - 1];
        if (targetTeam) {
          // Delete old team association
          await supabase.from('team_players').delete().eq('player_id', playerId);
          // Insert new team association
          await supabase.from('team_players').insert({
            team_id: targetTeam.id,
            player_id: playerId,
          });
        }
      } else {
        // If team number was removed, delete mappings
        await supabase.from('team_players').delete().eq('player_id', playerId);
      }

      setIsEditing(null);
      loadData();
      alert('Spieler erfolgreich gespeichert!');
    } catch (err: any) {
      alert('Fehler beim Speichern des Spielers: ' + err.message);
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Möchtest du den Spieler "${name}" wirklich unwiderruflich löschen? Alle zugehörigen Stimmen und Abwesenheiten werden ebenfalls gelöscht.`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
      alert('Spieler erfolgreich gelöscht!');
    } catch (err: any) {
      alert('Fehler beim Löschen des Spielers: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Group players by team numbers
  const groupedPlayers: Record<string, any[]> = { unassigned: [] };
  for (let i = 1; i <= registeredTeamsCount; i++) {
    groupedPlayers[i] = [];
  }

  profiles.forEach((p) => {
    if (p.team_number && p.team_number >= 1 && p.team_number <= registeredTeamsCount) {
      groupedPlayers[p.team_number].push(p);
    } else {
      groupedPlayers.unassigned.push(p);
    }
  });

  // Sort each team's players by position_number, then name
  Object.keys(groupedPlayers).forEach((key) => {
    groupedPlayers[key].sort((a, b) => {
      if (a.position_number && b.position_number) {
        return a.position_number - b.position_number;
      }
      if (a.position_number) return -1;
      if (b.position_number) return 1;
      return a.name.localeCompare(b.name);
    });
  });

  return (
    <div className="space-y-8">
      {/* 1. Header and Team Count Config */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            📋 Sportwart-Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Mannschaften registrieren, Spieler mit TTR-Punkten verwalten und Abwesenheiten überwachen.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150 shrink-0 self-start md:self-auto">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Gemeldete Mannschaften</label>
            <input
              type="number"
              min="1"
              max="10"
              value={registeredTeamsCount}
              onChange={(e) => setRegisteredTeamsCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1.5 font-bold text-gray-700 outline-none text-center"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            Speichern
          </button>
        </div>
      </div>

      {/* 2. Players Management */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            Mannschaftsaufstellungen & Listenplätze
          </h3>
          {isEditing !== 'new' && (
            <button
              onClick={handleOpenNewForm}
              className="inline-flex items-center gap-1 text-xs px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" /> Spieler anlegen
            </button>
          )}
        </div>

        {/* Player Add/Edit Form */}
        {isEditing && (
          <form onSubmit={handleSavePlayer} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
            <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-widest">
              {isEditing === 'new' ? 'Neuen Spieler anlegen' : 'Spielerdaten bearbeiten'}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Voller Name</label>
                <input
                  type="text"
                  placeholder="z.B. Max Mustermann"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Rolle im Verein</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as any)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="player">Spieler (player)</option>
                  <option value="team_manager">M-Führer (team_manager)</option>
                  <option value="sportwart">Sportwart (sportwart)</option>
                  <option value="club_admin">Vereinsadmin (club_admin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">TTR Punkte</label>
                <input
                  type="number"
                  placeholder="z.B. 1600"
                  value={formTtrPoints}
                  onChange={(e) => setFormTtrPoints(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mannschafts-Index</label>
                <input
                  type="number"
                  min="1"
                  max={registeredTeamsCount}
                  placeholder="z.B. 1 für Herren I"
                  value={formTeamNumber}
                  onChange={(e) => setFormTeamNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">Leer lassen für Ersatzspieler</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Listenposition</label>
                <input
                  type="number"
                  min="1"
                  placeholder="z.B. 3 für Position 3"
                  value={formPositionNumber}
                  onChange={(e) => setFormPositionNumber(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">z.B. 1.3 (Team 1, Position 3)</p>
              </div>

              <div className="md:col-span-2 flex items-end justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 font-bold text-gray-700 rounded-xl text-xs transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                >
                  Speichern
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Aufstellungs-Ansicht */}
        <div className="space-y-6">
          {Array.from({ length: registeredTeamsCount }).map((_, idx) => {
            const teamNum = idx + 1;
            const players = groupedPlayers[teamNum] || [];

            return (
              <div key={teamNum} className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                <div className="bg-gray-50 border-b border-gray-150 px-4 py-3 flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-800">
                    🏅 Mannschaft {teamNum} ({teams[idx]?.name || `Herren ${teamNum}`})
                  </h4>
                  <span className="text-xs bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2.5 py-0.5 rounded-full">
                    {players.length} Spieler gemeldet
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {players.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-400 italic">Noch keine Spieler für diese Mannschaft eingetragen.</div>
                  ) : (
                    players.map((p) => (
                      <div key={p.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/50 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-teal-700 w-8">
                            {teamNum}.{p.position_number || '?'}
                          </span>
                          <span className="font-bold text-gray-800">{p.name}</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                            {p.ttr_points} TTR
                          </span>
                          {p.role !== 'player' && (
                            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold uppercase px-1.5 py-0.5 rounded">
                              {p.role}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditForm(p)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(p.id, p.name)}
                            className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          {/* Ersatzspieler / Unassigned */}
          {groupedPlayers.unassigned.length > 0 && (
            <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
              <div className="bg-gray-50 border-b border-gray-150 px-4 py-3">
                <h4 className="text-sm font-black text-gray-800">
                  ⚠️ Ersatzspieler / Sonstige Vereinsmitglieder
                </h4>
              </div>

              <div className="divide-y divide-gray-100">
                {groupedPlayers.unassigned.map((p) => (
                  <div key={p.id} className="px-4 py-3.5 flex items-center justify-between hover:bg-gray-50/50 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{p.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">
                        {p.ttr_points} TTR
                      </span>
                      {p.role !== 'player' && (
                        <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold uppercase px-1.5 py-0.5 rounded">
                          {p.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditForm(p)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        title="Bearbeiten"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
