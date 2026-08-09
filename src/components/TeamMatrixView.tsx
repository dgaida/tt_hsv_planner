import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Users, Plus, Check, Trash2 } from 'lucide-react';

interface TeamMatrixViewProps {
  teamId: string;
  isManagerOrAdmin: boolean;
}

export default function TeamMatrixView({ teamId, isManagerOrAdmin }: TeamMatrixViewProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManagePlayers, setShowManagePlayers] = useState(false);

  const loadMatrixData = async () => {
    setLoading(true);
    try {
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('team_id', teamId)
        .eq('active', true)
        .order('dtstart', { ascending: true });

      const fetchedMatches = matchesData || [];
      setMatches(fetchedMatches);

      const { data: tpData } = await supabase
        .from('team_players')
        .select('*, profiles(*)')
        .eq('team_id', teamId);

      setTeamPlayers(tpData || []);

      if (fetchedMatches.length > 0) {
        const avData = await supabase
          .from('availabilities')
          .select('*')
          .in('match_id', fetchedMatches.map((m) => m.id));

        setAvailabilities(avData.data || []);
      }

      if (isManagerOrAdmin) {
        const { data: profiles } = await supabase.from('profiles').select('*').order('name');
        setAllProfiles(profiles || []);
      }
    } catch (err) {
      console.error('Error loading matrix data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrixData();
  }, [teamId]);

  const handleAddPlayerToTeam = async (playerId: string) => {
    try {
      const { error } = await supabase.from('team_players').insert({
        team_id: teamId,
        player_id: playerId,
      });

      if (error) {
        if (error.code === '23505') {
          alert('Dieser Spieler ist bereits zugeordnet.');
        } else {
          throw error;
        }
      } else {
        loadMatrixData();
      }
    } catch (err: any) {
      alert('Fehler beim Hinzufügen des Spielers: ' + err.message);
    }
  };

  const handleRemovePlayerFromTeam = async (tpId: string) => {
    if (!confirm('Möchtest du diesen Spieler wirklich aus dieser Mannschaft entfernen?')) return;
    try {
      const { error } = await supabase.from('team_players').delete().eq('id', tpId);
      if (error) throw error;
      loadMatrixData();
    } catch (err: any) {
      alert('Fehler beim Entfernen des Spielers: ' + err.message);
    }
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + '.';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📊 Verfügbarkeits-Matrix
          </h3>
          <p className="text-xs text-gray-500">
            Übersicht über alle Spieler dieser Mannschaft
          </p>
        </div>

        {isManagerOrAdmin && (
          <button
            onClick={() => setShowManagePlayers(!showManagePlayers)}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-teal-200 hover:bg-teal-50 text-teal-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
          >
            <Users className="h-4 w-4" />
            {showManagePlayers ? 'Matrix anzeigen' : 'Spieler verwalten'}
          </button>
        )}
      </div>

      {showManagePlayers ? (
        <div className="space-y-4">
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
            <h4 className="text-sm font-bold text-teal-900 mb-1">Spieler verwalten</h4>
            <p className="text-xs text-teal-700">
              Füge registrierte Spieler zu dieser Mannschaft hinzu oder entferne sie. Ein Spieler kann in mehreren Mannschaften gleichzeitig eingetragen sein.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Zugeordnete Spieler ({teamPlayers.length})
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {teamPlayers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Noch keine Spieler zugeordnet.</p>
                ) : (
                  teamPlayers.map((tp) => (
                    <div key={tp.id} className="flex items-center justify-between p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-150 text-sm">
                      <span className="font-semibold text-gray-800">{tp.profiles?.name}</span>
                      <button
                        onClick={() => handleRemovePlayerFromTeam(tp.id)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                        title="Spieler entfernen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Alle Vereinsmitglieder
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {allProfiles
                  .filter((p) => !teamPlayers.some((tp) => tp.player_id === p.id))
                  .map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:border-teal-200 transition-all">
                      <span className="font-medium text-gray-700">{p.name} ({p.role})</span>
                      <button
                        onClick={() => handleAddPlayerToTeam(p.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg text-xs transition-colors"
                      >
                        <Plus className="h-3 w-3" /> Hinzufügen
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {teamPlayers.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-500 italic">Keine Spieler zugeordnet. Bitte klicke auf "Spieler verwalten", um Spieler zu dieser Mannschaft hinzuzufügen.</p>
            </div>
          ) : matches.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Keine anstehenden Spiele für die Matrix.</p>
          ) : (
            <div className="overflow-x-auto border border-gray-150 rounded-2xl">
              <table className="min-w-full divide-y divide-gray-150 text-left border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 border-r border-gray-150 min-w-[120px]">
                      Spieler
                    </th>
                    {matches.map((m) => (
                      <th key={m.id} className="px-3 py-3 text-xs font-bold text-gray-600 text-center min-w-[64px]" title={m.summary}>
                        <div>{formatShortDate(m.dtstart)}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{m.is_home ? 'H' : 'A'}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {teamPlayers.map((tp) => {
                    const player = tp.profiles;
                    if (!player) return null;

                    return (
                      <tr key={tp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-800 sticky left-0 bg-white hover:bg-gray-50 z-10 border-r border-gray-150 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                          {player.name}
                        </td>
                        {matches.map((m) => {
                          const av = availabilities.find(
                            (a) => a.match_id === m.id && a.player_id === player.id
                          );

                          const isOutdated = av && av.version_responded < m.version;

                          if (isManagerOrAdmin) {
                            return (
                              <td key={m.id} className="px-1.5 py-2 text-center text-sm">
                                <div className="flex flex-col items-center">
                                  <select
                                    value={av ? av.response : ''}
                                    onChange={async (e) => {
                                      const val = e.target.value;
                                      let comment = av?.comment || '';

                                      if (val) {
                                        const enteredComment = window.prompt(
                                          `Optionaler Kommentar für ${player.name} bei diesem Spiel:`,
                                          comment
                                        );
                                        if (enteredComment !== null) {
                                          comment = enteredComment;
                                        }

                                        if (av) {
                                          const { error } = await supabase
                                            .from('availabilities')
                                            .update({
                                              response: val,
                                              comment: comment,
                                              version_responded: m.version,
                                              updated_at: new Date().toISOString(),
                                            })
                                            .eq('id', av.id);
                                          if (error) alert('Fehler: ' + error.message);
                                        } else {
                                          const { error } = await supabase
                                            .from('availabilities')
                                            .insert({
                                              match_id: m.id,
                                              player_id: player.id,
                                              response: val,
                                              comment: comment,
                                              version_responded: m.version,
                                            });
                                          if (error) alert('Fehler: ' + error.message);
                                        }
                                      } else {
                                        if (av) {
                                          const { error } = await supabase
                                            .from('availabilities')
                                            .delete()
                                            .eq('id', av.id);
                                          if (error) alert('Fehler: ' + error.message);
                                        }
                                      }
                                      loadMatrixData();
                                    }}
                                    className={`text-xs p-1 rounded-md border outline-none font-bold bg-white cursor-pointer ${
                                      av?.response === 'yes' && !isOutdated
                                        ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
                                        : av?.response === 'no' && !isOutdated
                                        ? 'border-rose-300 text-rose-800 bg-rose-50'
                                        : av?.response === 'maybe' && !isOutdated
                                        ? 'border-amber-300 text-amber-800 bg-amber-50'
                                        : 'border-gray-300 text-gray-500'
                                    }`}
                                    title={av?.comment ? `Kommentar: ${av.comment}` : 'Status wählen'}
                                  >
                                    <option value="">–</option>
                                    <option value="yes">Ja</option>
                                    <option value="maybe">Vielleicht</option>
                                    <option value="no">Nein</option>
                                  </select>
                                  {isOutdated && (
                                    <span className="text-[10px] leading-tight text-amber-600 font-bold" title="Termin geändert - Neu abstimmen!">
                                      ⚠️
                                    </span>
                                  )}
                                  {av?.comment && (
                                    <span className="text-[9px] text-gray-400 truncate max-w-[50px] mt-1" title={av.comment}>
                                      💬
                                    </span>
                                  )}
                                </div>
                              </td>
                            );
                          }

                          return (
                            <td key={m.id} className="px-2 py-3 text-center text-sm">
                              {av ? (
                                <div className="flex flex-col items-center">
                                  <span className={`text-base select-none ${isOutdated ? 'opacity-40' : ''}`}>
                                    {av.response === 'yes' ? '✅' : av.response === 'no' ? '❌' : '🤔'}
                                  </span>
                                  {isOutdated && (
                                    <span className="text-[10px] leading-tight text-amber-600 font-bold" title="Termin geändert - Neu abstimmen!">
                                      ⚠️
                                    </span>
                                  )}
                                  {av.comment && (
                                    <span className="text-[9px] text-gray-400 truncate max-w-[50px]" title={av.comment}>
                                      💬
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-300 font-medium">–</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td className="px-4 py-3 text-xs font-bold text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-gray-150">
                      Summe (✅)
                    </td>
                    {matches.map((m) => {
                      const matchAvs = availabilities.filter((a) => a.match_id === m.id && a.version_responded === m.version);
                      const yesCount = matchAvs.filter((a) => a.response === 'yes').length;
                      return (
                        <td key={m.id} className="px-2 py-3 text-center text-xs font-bold text-emerald-700">
                          {yesCount}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 py-3 text-xs font-bold text-gray-700 sticky left-0 bg-gray-50 z-10 border-r border-gray-150">
                      Summe (🤔)
                    </td>
                    {matches.map((m) => {
                      const matchAvs = availabilities.filter((a) => a.match_id === m.id && a.version_responded === m.version);
                      const maybeCount = matchAvs.filter((a) => a.response === 'maybe').length;
                      return (
                        <td key={m.id} className="px-2 py-3 text-center text-xs font-bold text-amber-700">
                          {maybeCount}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-150 flex flex-wrap gap-4 text-xs text-gray-600">
            <div><span className="font-bold">H:</span> Heimspiel</div>
            <div><span className="font-bold">A:</span> Auswärtsspiel</div>
            <div><span className="font-bold">✅:</span> Ja</div>
            <div><span className="font-bold">❌:</span> Nein</div>
            <div><span className="font-bold">🤔:</span> Vielleicht</div>
            <div><span className="font-bold">⚠️:</span> Termin geändert (Zustimmung ausstehend)</div>
            <div><span className="font-bold">–:</span> Keine Rückmeldung</div>
          </div>
        </div>
      )}
    </div>
  );
}
