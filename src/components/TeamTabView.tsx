import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Check, X, HelpCircle, MessageSquare, AlertTriangle } from 'lucide-react';

interface TeamTabViewProps {
  teamId: string;
  userId: string;
  userRole: string;
  isClubAdmin: boolean;
}

export default function TeamTabView({ teamId, userId, userRole, isClubAdmin }: TeamTabViewProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [availabilities, setAvailabilities] = useState<Record<string, any>>({});
  const [matchChanges, setMatchChanges] = useState<Record<string, any[]>>({});
  const [allAvailabilities, setAllAvailabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [teamName, setTeamName] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: team } = await supabase.from('teams').select('name').eq('id', teamId).single();
      if (team) setTeamName(team.name);

      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .eq('team_id', teamId)
        .eq('active', true)
        .order('dtstart', { ascending: true });

      const fetchedMatches = matchesData || [];
      setMatches(fetchedMatches);

      if (fetchedMatches.length > 0) {
        const matchIds = fetchedMatches.map((m) => m.id);

        const { data: userAv } = await supabase
          .from('availabilities')
          .select('*')
          .eq('player_id', userId)
          .in('match_id', matchIds);

        const availMap: Record<string, any> = {};
        const commentMap: Record<string, string> = {};
        if (userAv) {
          userAv.forEach((av) => {
            availMap[av.match_id] = av;
            commentMap[av.match_id] = av.comment || '';
          });
        }
        setAvailabilities(availMap);
        setComments(commentMap);

        const { data: allAvail } = await supabase
          .from('availabilities')
          .select('*, profiles(name)')
          .in('match_id', matchIds);
        setAllAvailabilities(allAvail || []);

        const { data: changes } = await supabase
          .from('match_changes')
          .select('*')
          .in('match_id', matchIds)
          .eq('change_type', 'date_time_changed')
          .order('created_at', { ascending: false });

        const changesMap: Record<string, any[]> = {};
        if (changes) {
          changes.forEach((ch) => {
            if (!changesMap[ch.match_id]) changesMap[ch.match_id] = [];
            changesMap[ch.match_id].push(ch);
          });
        }
        setMatchChanges(changesMap);
      }
    } catch (err) {
      console.error('Error loading team tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [teamId, userId]);

  const handleVote = async (matchId: string, matchVersion: number, responseType: 'yes' | 'no' | 'maybe') => {
    const existing = availabilities[matchId];
    const commentText = comments[matchId] || '';

    try {
      if (existing) {
        const { data, error } = await supabase
          .from('availabilities')
          .update({
            response: responseType,
            comment: commentText,
            version_responded: matchVersion,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        setAvailabilities((prev) => ({ ...prev, [matchId]: data }));
      } else {
        const { data, error } = await supabase
          .from('availabilities')
          .insert({
            match_id: matchId,
            player_id: userId,
            response: responseType,
            comment: commentText,
            version_responded: matchVersion,
          })
          .select()
          .single();

        if (error) throw error;
        setAvailabilities((prev) => ({ ...prev, [matchId]: data }));
      }

      const { data: allAvail } = await supabase
        .from('availabilities')
        .select('*, profiles(name)')
        .in('match_id', matches.map((m) => m.id));
      setAllAvailabilities(allAvail || []);
    } catch (err: any) {
      alert('Fehler beim Abgeben der Stimme: ' + err.message);
    }
  };

  const handleSaveComment = async (matchId: string, matchVersion: number) => {
    const existing = availabilities[matchId];
    const commentText = comments[matchId] || '';

    try {
      if (existing) {
        const { error } = await supabase
          .from('availabilities')
          .update({
            comment: commentText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
        alert('Bemerkung erfolgreich gespeichert!');
      } else {
        const { data, error } = await supabase
          .from('availabilities')
          .insert({
            match_id: matchId,
            player_id: userId,
            response: 'maybe',
            comment: commentText,
            version_responded: matchVersion,
          })
          .select()
          .single();

        if (error) throw error;
        setAvailabilities((prev) => ({ ...prev, [matchId]: data }));
        alert('Bemerkung gespeichert (Verfügbarkeit auf "Vielleicht" gesetzt).');
      }

      const { data: allAvail } = await supabase
        .from('availabilities')
        .select('*, profiles(name)')
        .in('match_id', matches.map((m) => m.id));
      setAllAvailabilities(allAvail || []);
    } catch (err: any) {
      alert('Fehler beim Speichern der Bemerkung: ' + err.message);
    }
  };

  const formatGermanDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' Uhr';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            🏓 {teamName || 'Mannschaft'}
          </h2>
          <p className="text-sm text-gray-500">
            {matches.length} anstehende Spiele im Kalender
          </p>
        </div>
        <button
          onClick={loadData}
          className="text-sm px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl transition-colors self-start"
        >
          🔄 Aktualisieren
        </button>
      </div>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
            <span className="text-4xl">📅</span>
            <p className="text-gray-500 mt-2">Keine anstehenden Termine für diese Mannschaft gefunden.</p>
          </div>
        ) : (
          matches.map((match) => {
            const userAv = availabilities[match.id];
            const hasOutdatedResponse = userAv && userAv.version_responded < match.version;

            const changes = matchChanges[match.id] || [];
            const oldDateText = changes.length > 0 && changes[0].old_dtstart
              ? formatGermanDate(changes[0].old_dtstart)
              : null;

            const matchAvails = allAvailabilities.filter((av) => av.match_id === match.id);
            const countJa = matchAvails.filter((av) => av.response === 'yes' && av.version_responded === match.version).length;
            const countNein = matchAvails.filter((av) => av.response === 'no' && av.version_responded === match.version).length;
            const countVielleicht = matchAvails.filter((av) => av.response === 'maybe' && av.version_responded === match.version).length;

            const opponent = match.is_home
              ? (match.summary.split(' vs ')[1] || match.summary).trim()
              : (match.summary.split(' vs ')[0] || match.summary).trim();

            return (
              <div
                key={match.id}
                className={`bg-white rounded-2xl border p-5 sm:p-6 shadow-sm transition-all duration-200 ${
                  hasOutdatedResponse
                    ? 'border-amber-400 bg-amber-50/10 ring-2 ring-amber-300 ring-opacity-50'
                    : 'border-gray-100 hover:shadow-md'
                }`}
              >
                {hasOutdatedResponse && (
                  <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-4 text-amber-800 text-sm flex gap-2 items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">⚠️ Termin geändert!</p>
                      <p>
                        Dieses Spiel wurde auf einen neuen Termin verschoben.{' '}
                        {oldDateText && (
                          <span>
                            (Zuvor: <strong className="line-through text-gray-500">{oldDateText}</strong>).
                          </span>
                        )}{' '}
                        Bitte bestätige deine Verfügbarkeit für den neuen Termin erneut. Deine alte Stimme war:
                        <span className="font-semibold ml-1">
                          {userAv.response === 'yes' ? '✅ Ja' : userAv.response === 'no' ? '❌ Nein' : '🤔 Vielleicht'}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-full mb-2">
                      Spieltag {match.matchday || '-'}
                    </span>
                    <h3 className={`text-base sm:text-lg font-bold ${countJa < 4 ? 'text-red-600' : 'text-gray-800'}`}>
                      {match.is_home ? '🏠 Heimspiel' : '🚌 Auswärtsspiel'} gegen {opponent}
                    </h3>
                    <p className="text-sm font-semibold text-teal-700 mt-1">
                      📅 {formatGermanDate(match.dtstart)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 text-xs sm:text-sm">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        ✅ {countJa}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        🤔 {countVielleicht}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-rose-600">
                        ❌ {countNein}
                      </span>
                    </div>

                    {countJa < 4 && (
                      <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" title="Weniger als 4 Zusagen!" />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 mb-5 pb-4 border-b border-gray-100">
                  {match.location && (
                    <p>
                      <span className="font-medium text-gray-700">📍 Ort:</span> {match.location}
                    </p>
                  )}
                  {match.description && (
                    <p className="italic text-gray-500">
                      {match.description.replace(/\\n/g, '\n')}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                    Kannst du bei diesem Spiel mitspielen?
                  </p>
                  <div className="grid grid-cols-3 gap-2.5 max-w-md">
                    <button
                      type="button"
                      onClick={() => handleVote(match.id, match.version, 'yes')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-4 rounded-xl font-bold transition-all border text-xs sm:text-sm ${
                        userAv && userAv.response === 'yes' && !hasOutdatedResponse
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                          : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <Check className="h-5 w-5 shrink-0" />
                      <span>Ja</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(match.id, match.version, 'maybe')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-4 rounded-xl font-bold transition-all border text-xs sm:text-sm ${
                        userAv && userAv.response === 'maybe' && !hasOutdatedResponse
                          ? 'bg-amber-500 text-white border-amber-500 shadow-md transform scale-105'
                          : 'bg-white hover:bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <HelpCircle className="h-5 w-5 shrink-0" />
                      <span>Vielleicht</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote(match.id, match.version, 'no')}
                      className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-4 rounded-xl font-bold transition-all border text-xs sm:text-sm ${
                        userAv && userAv.response === 'no' && !hasOutdatedResponse
                          ? 'bg-rose-600 text-white border-rose-600 shadow-md transform scale-105'
                          : 'bg-white hover:bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <X className="h-5 w-5 shrink-0" />
                      <span>Nein</span>
                    </button>
                  </div>

                  <div className="max-w-md pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MessageSquare className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Bemerkung (z.B. erst ab 19 Uhr)"
                          value={comments[match.id] || ''}
                          onChange={(e) => setComments((prev) => ({ ...prev, [match.id]: e.target.value }))}
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveComment(match.id, match.version)}
                        className="px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>

                {matchAvails.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Aktuelle Rückmeldungen:</p>
                    <div className="flex flex-wrap gap-2">
                      {matchAvails.map((av) => (
                        <div
                          key={av.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            av.version_responded < match.version
                              ? 'bg-gray-50 text-gray-400 border-gray-200'
                              : av.response === 'yes'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                              : av.response === 'no'
                              ? 'bg-rose-50 text-rose-800 border-rose-100'
                              : 'bg-amber-50 text-amber-800 border-amber-100'
                          }`}
                        >
                          <span>{av.profiles?.name}</span>
                          <span>
                            {av.version_responded < match.version
                              ? '⚠️'
                              : av.response === 'yes'
                              ? '✅'
                              : av.response === 'no'
                              ? '❌'
                              : '🤔'}
                          </span>
                          {av.comment && (
                            <span className="text-[10px] text-gray-500 ml-1 italic border-l border-gray-300 pl-1" title={av.comment}>
                              💬
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
