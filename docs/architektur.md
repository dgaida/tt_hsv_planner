# 🏗️ Technische Architektur (TTV Spielplaner)

Dieses Dokument beschreibt den technischen Aufbau, das Datenmodell, die Sicherheitsarchitektur und die Algorithmen des TTV Spielplaners.

---

## 🛠️ 1. Technologiestack

Die Anwendung ist als moderne, serverlose Single-Page-Application (SPA) konzipiert:

```text
┌────────────────────────────────────────────────────────┐
│                        Frontend                        │
│          React + TypeScript + Tailwind CSS             │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS / WebSockets)
                            ▼
┌────────────────────────────────────────────────────────┐
│                        Backend                         │
│                    Supabase (SaaS)                     │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────┐ │
│ │  PostgreSQL DB   │ │  Edge Functions  │ │ Auth/RLS │ │
│ └──────────────────┘ └──────────────────┘ └──────────┘ │
└────────────────────────────────────────────────────────┘
```

* **Frontend:**  
  * **React & Vite:** Schnelles Bootstrapping, Hot Module Replacement (HMR) und performantes Asset-Bundling.  
  * **TypeScript:** Typensicherheit über die gesamte Codebasis.  
  * **Tailwind CSS:** Utility-First CSS-Framework für hochgradig responsive und mobil-optimierte Oberflächen.  
  * **Lucide React:** Modernes und einheitliches Icon-Set.  
* **Backend:**  
  * **Supabase:** Liefert die PostgreSQL-Datenbank, Echtzeitsynchronisation (Realtime), Authentifizierung und serverlose TypeScript/Deno-Laufzeitumgebungen (Edge Functions).  

---

## 🗄️ 2. Datenmodell & Schema

Das relationale Datenbankschema ist in `supabase/migrations/20260808000000_init.sql` definiert. Die wichtigsten Tabellen im Überblick:

### `profiles` (Benutzerprofile)
Speichert die Stammdaten aller Vereinsmitglieder.  
* **Besonderheit:** Die Spalte `id` ist ein generierter UUIDv4-Hauptschlüssel, der **nicht** an `auth.users` gekoppelt ist. Dies ermöglicht es dem Sportwart, Spieler vorab anzulegen, ohne dass diese sich registrieren müssen.  
* **Wichtige Spalten:**  
  * `id`: `UUID` (Primary Key)  
  * `name`: `TEXT`  
  * `role`: `user_role` (`'player'`, `'team_manager'`, `'sportwart'`, `'club_admin'`)  
  * `team_number`: `INT` (Vereinsmannschaft, z. B. `1` für Herren I)  
  * `position_number`: `INT` (Listenposition im Verein, z. B. `3` für Position 3)  
  * `ttr_points`: `INT` (Tischtennis-Rating)  

### `matches` (Spieltermine)
Speichert alle importierten und manuell erstellten Spiele.  
* **Wichtige Spalten:**  
  * `id`: `UUID` (Primary Key)  
  * `uid`: `TEXT` (Stabile, eindeutige Kennung aus dem ICS-Event von myTischtennis)  
  * `team_id`: `UUID` (Fremdschlüssel auf `teams`)  
  * `opponent`: `TEXT` (Gegner)  
  * `date`: `TIMESTAMPTZ` (Spielzeitpunkt, zeitzonensicher)  
  * `is_home`: `BOOLEAN` (Heimspiel-Flag)  
  * `match_version`: `INT` (Zähler für Terminverschiebungen, startet bei `1`)  
  * `lineup`: `JSONB` (Optionales, angepasstes Lineup aus vier Spieler-UUIDs)  

### `availabilities` (Rückmeldungen)
Speichert die Bereitschaft der Spieler für ein bestimmtes Spiel.  
* **Wichtige Spalten:**  
  * `id`: `UUID` (Primary Key)  
  * `match_id`: `UUID` (Fremdschlüssel auf `matches`)  
  * `profile_id`: `UUID` (Fremdschlüssel auf `profiles`)  
  * `status`: `TEXT` (`'yes'` / `'no'` / `'maybe'`)  
  * `comment`: `TEXT` (Optionale Bemerkung)  
  * `answered_version`: `INT` (Die Version des Spiels zum Zeitpunkt der Stimmabgabe)  

### `absences` (Abwesenheiten)
Speichert geplante Abwesenheiten von Spielern für den Kalender des Sportwarts.  
* **Wichtige Spalten:**  
  * `id`: `UUID` (Primary Key)  
  * `profile_id`: `UUID` (Fremdschlüssel auf `profiles`)  
  * `start_date`: `DATE`  
  * `end_date`: `DATE`  
  * `reason`: `TEXT` (Grund der Abwesenheit)  

---

## 🔄 3. Kalender-Synchronisations-Engine

Der Abgleich mit myTischtennis.de ist hochgradig ausfallsicher implementiert:

### Server-Sync (Edge Function `sync-calendars`)  
* Läuft auf Deno-Servern in Supabase.  
* Umgeht Browser-CORS-Blockaden und lädt die `.ics`-Dateien direkt über HTTPS.  
* Verwendet einen stabilen ICS-Parser, der Termine und Zeitzonen (Europe/Berlin) korrekt auflöst.  

### Clientseitiger Fallback (`src/lib/syncEngine.ts`)  
* Schlägt der Aufruf der Edge Function fehl (z. B. Netzwerkfehler, Limitierungen), springt das React-Frontend nahtlos ein.  
* Verwendet öffentliche CORS-Proxies (`api.allorigins.win/raw` mit Fallback auf `api.codetabs.com`), um die Webcal-Daten im Browser bereitzustellen.  
* Führt bis zu 3 Retries mit exponentiellem Backoff und gestaffelten Pausen (1500ms zwischen Mannschaften) aus, um API-Sperren zu verhindern.  

### Termin-Versionierung (Erkennung von Spielverlegungen)  
1. Beim Import eines Kalender-Events wird geprüft, ob bereits ein Spiel mit derselben `uid` in der Datenbank existiert.  
2. Weichen das Spieldatum, die Uhrzeit oder der Heimspiel-Status (`is_home`) ab, gilt das Spiel als verlegt.  
3. Das System erhöht `match_version` um `1` und speichert die Änderung in `match_changes`.  
4. Das Frontend vergleicht bei der Darstellung die `answered_version` der Rückmeldung mit der aktuellen `match_version` des Spiels. Bei einer Abweichung wird die Stimme als archiviert betrachtet, und im Frontend erscheint das Warnsymbol (⚠️) für eine erneute Bestätigung.  

### On-Demand Synchronisation im Mannschafts-Tab (Rollenbasiert)  
* **Verhalten bei Spielern (`player`):** Der Klick auf den Button "🔄 Aktualisieren" ruft ausschließlich das lokale Laden der Daten über `loadData()` auf, welches die Tabellen `matches`, `profiles`, `availabilities` und `match_changes` direkt aus der Supabase-Datenbank abfragt. Dies schont Ressourcen und vermeidet API-Sperren bei häufiger Nutzung.  
* **Verhalten bei erhöhten Rollen (`team_manager`, `sportwart`, `club_admin`):** Der Klick auf den Button "🔄 Aktualisieren" führt zuerst die clientseitige Kalender-Sync-Engine `syncTeamCalendar(supabase, teamId)` für das spezifische Team aus. Diese lädt den Online-ICS-Kalender über einen CORS-Proxy live herunter, gleicht ihn mit den bestehenden Terminen in der Datenbank ab (erstellt ggf. neue Spiele oder `match_changes` bei Verlegungen) und führt erst im Anschluss das lokale `loadData()` aus. So können Mannschaftsführer und Vereinsfunktionäre Spielplan-Verschiebungen in Echtzeit und on-demand abfragen.  

---

## 🏓 4. Ersatzspieler-Nachrückerlogik

Um die Aufstellung eines Spieltages zu visualisieren, nutzt das System eine automatisierte Nachrücker-Logik im Frontend (`TeamTabView.tsx`):

1. **Stammspieler-Ermittlung:** Es werden die Top 4 Spieler der jeweiligen Mannschaft geladen (definiert durch `team_number` und `position_number` zwischen 1 und 4).  
2. **Prüfung der Verfügbarkeit:** Für jeden Stammspieler wird geprüft, ob eine Zusage (`status = 'yes'`) vorliegt.  
3. **Ersatzspieler-Nachrücken (Substitutes):**  
   * Sagt ein Stammspieler ab (`'no'`), steht auf `'maybe'` oder hat noch gar nicht geantwortet, wird er temporär aus der aktiven Aufstellung entfernt.  
   * Das System sucht nach Ersatzspielern: Das sind alle Spieler aus dem Verein, die für dieses Spiel aktiv mit `yes` zugesagt haben, aber nicht zu den Top 4 Stammspielern dieses Teams gehören.  
   * **Sortierung & Priorität:** Die Ersatzspieler werden nach ihrer globalen Einstufung sortiert:  
     $$\text{Priorität} = \text{team\_number} \text{ (aufsteigend)} \rightarrow \text{position\_number} \text{ (aufsteigend)}$$
     *Beispiel:* Ein Spieler aus der 2. Mannschaft auf Position 1 (`team=2, position=1`) rückt vor einem Spieler aus der 2. Mannschaft auf Position 3 (`team=2, position=3`) nach.  
   * Die freien Plätze in der Aufstellung werden mit den am besten eingestuften Ersatzspielern besetzt.  

---

## 🔒 5. Automatische Profil-Verknüpfung bei Registrierung

Um den Registrierungsprozess für die Spieler so einfach wie möglich zu gestalten und den administrativen Aufwand zu minimieren, verfügt das System über eine integrierte, automatische Profil-Verknüpfung:

### Technische Funktionsweise  
1. **Unabhängiges Profil-Konzept:**  
   Die Profile-Tabelle (`public.profiles`) ist vollkommen von `auth.users` entkoppelt. Das bedeutet, dass der Sportwart über den HTML-Kader-Import oder die manuelle Eingabe Spieler-Profile mit einem zufälligen UUID-Hauptschlüssel anlegen kann (`id = gen_random_uuid()`).  
2. **Der `public.handle_new_user()` Trigger:**  
   Sobald sich ein Spieler mit E-Mail, Passwort und seinem **vollen Namen** (`name`) registriert, wird in der Supabase-Datenbank ein After-Insert-Trigger auf der Tabelle `auth.users` ausgeführt. Dieser führt die Funktion `public.handle_new_user()` aus:  
   * **Namens-Matching:** Die Funktion sucht nach einem existierenden Profil, bei dem der Name (bereinigt um Whitespaces und case-insensitive) mit dem Registrierungs-Namen übereinstimmt:  
     `LOWER(TRIM(profiles.name)) = LOWER(TRIM(default_name))`
     und das Profil noch nicht mit einem Auth-Benutzer verknüpft ist (d. h. die Profil-ID existiert noch nicht in `auth.users`).  
   * **ID-Umschreibung (ID Mapping):**  
     Wird ein Treffer erzielt, wird die ID des existierenden Profils in `public.profiles` auf die neu generierte ID des registrierten Benutzers (`new.id`) aktualisiert.  
   * **Kaskadierende Aktualisierungen (`ON UPDATE CASCADE`):**  
     Um die Integrität aller verknüpften Daten zu wahren, sind die Fremdschlüsselbeziehungen auf den Tabellen `team_players`, `availabilities` und `absences` mit `ON UPDATE CASCADE` konfiguriert. Durch das Umschreiben der Profil-ID werden somit alle Mannschaftszuordnungen, Rückmeldungen und Abwesenheiten automatisch im selben Moment auf die neue ID aktualisiert.  
   * **Lineup-JSONB-Aktualisierung:**  
     Zusätzlich durchläuft die Trigger-Funktion alle Einträge in `public.matches`, in denen die alte Profil-ID im `lineup` (JSONB-Array von UUIDs) enthalten ist, rekonstruiert das JSON-Array und ersetzt die alte ID-Zeichenkette durch die neue ID-Zeichenkette des Benutzers.

---

## 🔒 6. Sicherheitskonzept (RLS-Richtlinien)

Die Datenbank verwendet PostgreSQL Row Level Security (RLS) zur Absicherung aller Schreib- und Lesevorgänge:

* **Erzwingung der eigenen Identität:** Ein Spieler kann nur Zeilen in `availabilities` oder `absences` einfügen oder ändern, bei denen die `profile_id` mit seiner eigenen Benutzer-ID übereinstimmt.  
* **Rollenbasierter Schreibzugriff:**  
  * Nur Benutzer mit der Rolle `sportwart` oder `club_admin` können Daten in `profiles` ändern.  
  * Nur `club_admin` kann Webcal-Links in `teams` bearbeiten.  
  * Mannschaftsführer (`team_manager`) können Zuordnungen in `team_players` für Spieler der eigenen Mannschaft verwalten.  
