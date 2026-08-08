# Tischtennis-Spielbereitschafts-Planer (TTV Spielplaner)

Dieses Repository enthält eine vollständige, produktionsreife Web-Anwendung zur Organisation der Spielbereitschaft für drei (oder mehr) Tischtennis-Mannschaften eines Vereins.

Die Anwendung liest die Spieltermine automatisch aus den jeweiligen **Webcal-Kalendern von myTischtennis.de** ein und stellt eine gemeinsame, smartphone-optimierte Plattform zur Planung der Spielbereitschaft bereit.

---

## 🚀 Kern-Features

1. **Mehrere Mannschaften verwalten:** Drei Mannschaften sind vordefiniert. Über das Admin-Panel oder die Datenbank können beliebig viele weitere Mannschaften ohne Codeänderungen hinzugefügt werden.
2. **Automatischer & Manueller Sync:** Die Kalender synchronisieren sich vollautomatisch einmal täglich (über GitHub Actions). Zusätzlich kann ein Administrator die Synchronisation direkt im Frontend anstoßen.
3. **Erkennung von Spielverlegungen (Termin-Versionierung):**
   * Verlegungen werden über die stabile `UID` des ICS-Events erkannt.
   * **Wichtiger Datenschutz/Daten-Erhalt (Korrektur 1):** Bei einer Terminverschiebung gehen bisherige Rückmeldungen nicht verloren, sondern werden historisch archiviert. Da die Stimme für den alten Termin abgegeben wurde, markiert das System die Rückmeldung im Frontend als *„erneute Antwort erforderlich“ (⚠️)* und bittet den Spieler um Bestätigung für den neuen Termin.
4. **Globale Passwort-Sperre (Bypass-Links - Ergänzung 2):**
   * Die Anwendung ist standardmäßig durch ein globales Vereinspasswort geschützt.
   * Vereinsmitglieder können über einen personalisierten Link wie `https://username.github.io/repo/?pw=Passwort` direkt eingeloggt werden, ohne das Passwort manuell eingeben zu müssen.
5. **Mannschaftsübergreifende Verfügbarkeit & Ersatz-Organisation:**
   * Ermöglicht Spielern, sich bei mehreren Mannschaften als spielbereit einzutragen.
   * Die Vereinsführung sieht in der Gesamtübersicht chronologisch alle Spiele und erkennt sofort, wer als Ersatzspieler (Aushilfe) einspringen kann.
6. **Automatische Terminkonflikt-Erkennung:** Steht ein Spieler am selben Tag/Uhrzeit zeitgleich bei zwei verschiedenen Mannschaften als verfügbar eingetragen, warnt die Gesamtübersicht die Vereinsführung vor einem Terminkonflikt.
7. **Smartphone-Optimierung:** Großflächige, berührungsfreundliche Buttons für die Touch-Bedienung. Responsive Darstellung für alle Geräteklassen (Mobile-First).

---

## 🛠️ Technische Architektur

* **Frontend:** HTML5, CSS3, React, TypeScript, Tailwind CSS, Lucide Icons, Vite.
* **Backend & Datenbank:** Supabase (PostgreSQL, Realtime, Edge Functions).
* **Daten-Parser:** Standardkonformer, zeitzonenbewusster (Europe/Berlin) ICS-Kalenderparser.
* **Sicherheit:** Supabase Row Level Security (RLS) verhindert unbefugten Zugriff. Keine sensiblen Service-Keys im Frontend.
* **Deployment:** GitHub Actions & Hosting über GitHub Pages.

---

## 📂 Verzeichnisstruktur

```text
/
├── .github/workflows/
│   ├── deploy.yml            # Automatische Veröffentlichung auf GitHub Pages
│   └── sync-calendars.yml    # Täglicher Cronjob zur Kalender-Synchronisation
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx         # Webcal-Links, Rollen und manuelle Synchronisierung
│   │   ├── AuthScreen.tsx             # Login & Registrierung für Spieler
│   │   ├── GesamtUebersichtView.tsx   # Chronologische Übersicht & Konflikterkennung
│   │   ├── PasswordGate.tsx           # Globaler Passwortschutz (URL-Bypass)
│   │   ├── TeamMatrixView.tsx         # Mannschaftsführer-Rückmelde-Matrix
│   │   └── TeamTabView.tsx            # Spieltags-Listen & Voting-Fläche
│   ├── lib/
│   │   ├── icsParser.ts       # Zeitzonensicherer ICS-Parser
│   │   ├── supabaseClient.ts  # Supabase-Initialisierung
│   │   └── syncEngine.ts      # Kalender-Synchronisations-Engine
│   ├── App.tsx                # Haupt-Routing & Tab-Navigation
│   ├── index.css              # Globale CSS- & Tailwind-Stile
│   └── main.tsx               # React-Einstiegspunkt
├── supabase/
│   ├── migrations/
│   │   └── 20260808000000_init.sql  # Komplette DB-Migration, RLS & RPCs
│   └── functions/
│       └── sync-calendars/
│           └── index.ts       # Supabase Edge-Function für automatisierte Syncs
├── tests/
│   ├── icsParser.test.ts      # Tests für den ICS-Parser
│   └── syncEngine.test.ts     # Tests für die Synchronisations-Engine
├── package.json
└── vite.config.ts
```

---

## 🧱 Supabase-Einrichtung (Schritt-für-Schritt)

1. Erstelle ein neues, kostenloses Projekt auf [supabase.com](https://supabase.com).
2. Navigiere in deinem Supabase-Dashboard zum **SQL Editor**.
3. Kopiere den Inhalt der Datei `supabase/migrations/20260808000000_init.sql` und führe das Skript aus. Es legt alle Tabellen, Enums, Trigger, RPC-Funktionen und RLS-Richtlinien an:
   * **`teams`:** Konfiguration der Mannschaften und Webcal-Links.
   * **`profiles`:** Erweitert die Benutzerverwaltung um Namen und Rollen (`player`, `team_manager`, `club_admin`).
   * **`team_players`:** Zuordnungstabelle (Spieler können mehreren Mannschaften zugeordnet sein).
   * **`matches`:** Speichert alle importierten Spiele inkl. Spieltag, Termin und Version.
   * **`availabilities`:** Spieler-Rückmeldungen inkl. Bemerkung und der beantworteten Spiel-Version.
   * **`sync_runs`:** Protokollierung der Synchronisierungs-Läufe.
   * **`match_changes`:** Protokollierung von Terminverschiebungen (Spielverlegungen).
4. Standard-Vereinspasswort ändern (optional): In der Tabelle `club_settings` wird standardmäßig der Hash des Passworts `Tischtennis2026` hinterlegt. Du kannst im SQL Editor ein eigenes Passwort hashen lassen:
   ```sql
   UPDATE public.club_settings
   SET value = crypt('DEIN_NEUES_PASSWORT', gen_salt('bf', 8))
   WHERE key = 'club_password_hash';
   ```

---

## 🎛️ GitHub-Secrets konfigurieren

Damit die Webseite über GitHub Pages gebaut und veröffentlicht werden kann, müssen in den **Settings** des GitHub-Repositorys unter **Secrets and variables > Actions** folgende Repository Secrets hinterlegt werden:

* **`VITE_SUPABASE_URL`:** Deine Supabase API URL (z.B. `https://xyz.supabase.co`).
* **`VITE_SUPABASE_ANON_KEY`:** Dein Supabase Public Anon Key (Sicher im Frontend verwendbar).
* **`VITE_SYNC_SECRET`:** Ein beliebiges, langes Passwort (z.B. ein UUID-String) zur Absicherung der Edge-Function vor unbefugten Aufrufen.

---

## 🚀 Deployment (GitHub Pages)

1. Gehe in deinem Repository auf **Settings > Pages**.
2. Wähle unter **Build and deployment > Source** die Option **GitHub Actions** aus.
3. Sobald du deinen Code auf `main` oder `master` pushst, startet die GitHub Actions Pipeline automatisch, baut das React-Frontend mit den Secrets und veröffentlicht es auf GitHub Pages.

---

## 🔄 Kalender-Synchronisation (Täglicher Cronjob)

Die Datei `.github/workflows/sync-calendars.yml` führt einmal täglich (um 04:00 Uhr UTC) einen Aufruf an die Supabase Edge Function aus. Sie nutzt dafür die Secrets `VITE_SUPABASE_URL` und `VITE_SYNC_SECRET` zur Authentifizierung.

Solltest du die Supabase Edge Function nicht einsetzen wollen, besitzt das Admin-Dashboard im Frontend einen **vollwertigen, clientseitigen Fallback**: Wenn ein Admin auf `Spielpläne jetzt synchronisieren` klickt und die Edge Function nicht erreicht wird, übernimmt der integrierte Frontend-Sync die Aktualisierung direkt über die API des Browsers und protokolliert das Ergebnis in der Datenbank.

---

## 🧑‍🤝‍🧑 Rollen und Rechtekonzept

Die RLS-Richtlinien in PostgreSQL erzwingen folgende Berechtigungen:

* **Spieler (`player`):**
  * Kann alle Mannschaften, Spiele und Rückmeldungen einsehen.
  * Kann nur die *eigene* Verfügbarkeit und Bemerkung eintragen und ändern.
* **Mannschaftsführer (`team_manager`):**
  * Besitzt alle Spieler-Rechte.
  * Kann Spieler der eigenen Mannschaft zuordnen und entfernen (Team-Zugehörigkeiten pflegen).
* **Vereinsadministrator (`club_admin`):**
  * Besitzt alle Rechte der Mannschaftsführer.
  * Kann Mannschaften anlegen, deaktivieren und deren Webcal-Links bearbeiten.
  * Kann die Rollen aller Vereinsmitglieder ändern.
  * Kann Synchronisations-Vorgänge manuell auslösen und die Protokolle einsehen.

---

## 🔒 Datenschutz-Hinweise

* Es werden keine sensiblen personenbezogenen Daten erhoben (nur Name und E-Mail-Adresse).
* Die gesamte Oberfläche ist passwortgeschützt. Nicht-Mitglieder ohne das globale Vereinspasswort sehen keinerlei Spielerdaten, Namen oder Spieltermine.
* RLS-Regeln im Backend verhindern, dass ein Spieler fremde Rückmeldungen manipuliert.

---

## 🛠️ Lokale Entwicklung & Tests

1. Repository klonen und Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Lokalen Server starten:
   ```bash
   npm run dev
   ```
3. Alle automatisierten Tests (Parser, Sync-Engine, Zeitzonen) ausführen:
   ```bash
   npm run test
   ```

---

## ❓ Fehlerbehebung

* **Webcal-Link liefert Fehler:** Stelle sicher, dass die Webcal-Adresse korrekt eingetragen ist. Das System konvertiert `webcal://` automatisch in `https://` für den Download.
* **Änderungen werden nicht angezeigt:** Klicke im Frontend auf den Aktualisieren-Button der Mannschaft, um die neuesten Daten aus der Datenbank zu laden.
* **Fehler beim Passwort-Gate:** Falls du dein Passwort geändert hast, lösche den Browser-Cache oder klicke im Footer auf "Passwort-Gate zurücksetzen", um das Passwort neu einzugeben.
