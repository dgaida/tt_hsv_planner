import React, { useState, useEffect } from 'react';
import { BookOpen, Shield, User, Users, Award, Calendar, Settings, Info, Lock, Key, ChevronRight } from 'lucide-react';

interface GuideViewProps {
  role?: 'player' | 'team_manager' | 'sportwart' | 'club_admin';
}

export default function GuideView({ role = 'player' }: GuideViewProps) {
  const [selectedRole, setSelectedRole] = useState<'player' | 'team_manager' | 'sportwart' | 'club_admin'>(role);

  // Sync state if initial prop changes (e.g. on late profile load)
  useEffect(() => {
    if (role) {
      setSelectedRole(role);
    }
  }, [role]);

  const roleLabels: Record<'player' | 'team_manager' | 'sportwart' | 'club_admin', string> = {
    player: 'Spieler',
    team_manager: 'Mannschaftsführer',
    sportwart: 'Sportwart',
    club_admin: 'Admin',
  };

  const getRoleIcon = (r: 'player' | 'team_manager' | 'sportwart' | 'club_admin') => {
    switch (r) {
      case 'player':
        return <User className="h-4 w-4" />;
      case 'team_manager':
        return <Users className="h-4 w-4" />;
      case 'sportwart':
        return <Award className="h-4 w-4" />;
      case 'club_admin':
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-teal-600" />
            📖 Handbuch & Bedienungsanleitung
          </h2>
          <p className="text-sm text-gray-500">
            Hier findest du eine Übersicht aller Funktionen, angepasst an deine Rolle im Verein.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-150">
          {(['player', 'team_manager', 'sportwart', 'club_admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedRole === r
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {getRoleIcon(r)}
              {roleLabels[r]}
              {role === r && (
                <span className="text-[9px] bg-white text-teal-700 px-1 py-0.2 rounded font-black uppercase tracking-wider ml-1">
                  Aktiv
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Info Badge */}
      {role !== selectedRole && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            Du betrachtest die Anleitung für die Rolle <strong>{roleLabels[selectedRole]}</strong>. Deine aktive Rolle ist <strong>{roleLabels[role]}</strong>.
          </span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: General password & lock info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-base font-black text-gray-800 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Lock className="h-5 w-5 text-teal-600" />
              Anmeldung & Sicherheit
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Key className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Passwort-Gate</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Die gesamte Anwendung ist durch ein globales Vereinspasswort vor unbefugtem Zugriff von außen geschützt.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Bypass-Link</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    Um die Eingabe zu überspringen, kannst du das Passwort an die URL anhängen:
                    <code className="block bg-gray-100 text-[10px] p-1.5 rounded border border-gray-200 mt-1.5 font-mono overflow-x-auto whitespace-pre-wrap">
                      ?pw=DeinPasswort
                    </code>
                    Ideal, um den Link als Lesezeichen zu speichern oder in WhatsApp-Gruppen zu teilen!
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">Zwei Login-Wege</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mt-1">
                    <strong>1. Passwortlos (Dropdown):</strong> Schnellzugriff für normale Spieler. Du hast hierbei nur Spieler-Rechte.<br />
                    <strong>2. E-Mail & Passwort:</strong> Erforderlich, um erweiterte Rechte (Mannschaftsführer, Sportwart, Admin) freizuschalten.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Selected role documentation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="h-10 w-10 bg-teal-50 border border-teal-200 rounded-xl text-teal-600 flex items-center justify-center">
                {getRoleIcon(selectedRole)}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-800">
                  Funktionen für {roleLabels[selectedRole]}
                </h3>
                <p className="text-xs text-gray-400">Rolle: `{selectedRole}`</p>
              </div>
            </div>

            {/* Role specific content conditional render */}
            {selectedRole === 'player' && (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Als <strong>Spieler</strong> steht für dich die schnelle Rückmeldung und deine persönliche Planung im Vordergrund:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🟢 1. Spielbereitschaft zurückmelden (RSVP)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Im Reiter <strong>"Mannschaften"</strong> siehst du anstehende Spiele deines Teams. Trage deine Bereitschaft mit den berührungsfreundlichen Tasten ein:
                    </p>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-xs text-gray-500">
                      <li><strong className="text-emerald-700">Zusage (Grün):</strong> Du bist spielbereit und stehst zur Verfügung.</li>
                      <li><strong className="text-rose-700">Absage (Rot):</strong> Du kannst an diesem Termin nicht spielen.</li>
                      <li><strong className="text-amber-700">Unsicher (Gelb):</strong> Du bist noch unsicher (z.B. wegen Schichtarbeit).</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-1">
                      Hinterlasse bei Bedarf auch direkt eine kurze Bemerkung (z.B. "Komme direkt zum Spiel").
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🏓 2. Ersatzspieler-Meldung
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du möchtest in einer anderen Mannschaft als Ersatzspieler aushelfen? Navigiere einfach zu dem entsprechenden Team, klicke auf das Spiel und trage dich mit <strong>"Zusage" (Grün)</strong> ein. Das System führt dich dort sofort als verfügbaren Ersatzspieler auf.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      📅 3. Abwesenheiten eintragen (Mein Kalender)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Im Reiter <strong>"Mein Kalender"</strong> kannst du Zeiträume eintragen, an denen du generell nicht zur Verfügung stehst (Urlaub, Dienstreisen, Krankheit). Diese werden Mannschaftsführern und dem Sportwart automatisch angezeigt.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'team_manager' && (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Als <strong>Mannschaftsführer</strong> bist du für die Aufstellung, Kaderpflege und Organisation deines Teams verantwortlich:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🔑 1. Login-Voraussetzung
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du musst dich zwingend mit deiner <strong>E-Mail-Adresse und Passwort</strong> anmelden. Eine passwortlose Anmeldung über die Namensliste stuft dich aus Sicherheitsgründen als normalen Spieler ein!
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      📊 2. Team-Matrix & Rückmeldungen
                    </h4>
                    <p className="text-xs text-gray-500">
                      Unterhalb der Spieleliste deiner Mannschaft siehst du die <strong>Team-Matrix</strong>. Hier erkennst du auf einen Blick, wer zugesagt, abgesagt, noch nicht geantwortet oder eine Bemerkung hinterlassen hat.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      ⚙️ 3. Kader verwalten & Ersatzspieler-RSVP
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du kannst Spieler fest zu deiner Mannschaft als Stammspieler zuordnen oder entfernen (in der Matrix oder im Sportwart/Admin-Reiter falls berechtigt). Außerdem hast du das Recht, die Rückmeldungen von Ersatzspielern für deine Teamspiele anzupassen, um kurzfristige Änderungen festzuhalten.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'sportwart' && (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Als <strong>Sportwart</strong> hast du die sportliche Gesamtleitung und planst die Aufstellungen mannschaftsübergreifend im Verein:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🛠️ 1. Spieler & TTR-Punkte verwalten
                    </h4>
                    <p className="text-xs text-gray-500">
                      Im Reiter <strong>"Sportwart"</strong> kannst du neue Spielerprofile anlegen (ohne dass diese ein Supabase-Konto benötigen), TTR-Punkte aktualisieren und ihre Vereinsrangfolge (Team- & Positionsnummer) festlegen. Diese Rangfolge steuert die automatische Nachrücker-Hierarchie bei Ersatzspielern.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      📅 2. 2-Monats-Abwesenheits-Planer
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du hast exklusiven Zugriff auf die langfristige Abwesenheits-Planung. Eine Tages-Matrix visualisiert farblich alle Abwesenheiten der kommenden 60 Tage. Ein Klick auf einen Tag zeigt alle Details und Gründe für Abwesenheiten.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🏓 3. Aufstellungs-Kontrolle & Lineups
                    </h4>
                    <p className="text-xs text-gray-500">
                      In der Gesamtübersicht und in den Teamansichten siehst du die berechnete Aufstellung (Top 4 Stammspieler, ergänzt durch bestplatzierte verfügbare Nachrücker). Du kannst diese Aufstellung jederzeit manuell überschreiben, um die Aufstellung taktisch anzupassen.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'club_admin' && (
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  Als <strong>Vereinsadministrator</strong> verwaltest du die technischen Grundeinstellungen und Berechtigungen der Plattform:
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🛡️ 1. Mannschafts- & Webcal-Verwaltung
                    </h4>
                    <p className="text-xs text-gray-500">
                      Im Reiter <strong>"Admin"</strong> kannst du neue Mannschaften erstellen, Webcal-Links von myTischtennis.de hinterlegen oder anpassen sowie Teams aktiv/inaktiv schalten.
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      👥 2. Rollenverteilung
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du kannst die Benutzerrollen aller registrierten Vereinsmitglieder ändern (z. B. einen Spieler zum Mannschaftsführer, Sportwart oder Admin ernennen).
                    </p>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-150">
                    <h4 className="font-bold text-gray-800 flex items-center gap-1.5 text-xs uppercase tracking-wider mb-1">
                      🔄 3. Kalender-Synchronisation & Berichte
                    </h4>
                    <p className="text-xs text-gray-500">
                      Du kannst die automatische Spielplan-Synchronisation manuell anstoßen und Berichte/Logs über die letzten Import-Prozesse einsehen (wie viele Spiele importiert wurden, Fehler etc.).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
