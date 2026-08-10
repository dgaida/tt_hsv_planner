# 🚀 Erst-Einrichtung & Installation (TTV Spielplaner)

Dieses Dokument beschreibt die detaillierten Installationsschritte, die Einrichtung der Datenbank in Supabase sowie die Automatisierung des Kalenderabgleichs und Deployments.

---

## 💻 1. Lokale Entwicklungseinrichtung

Um das Projekt lokal auf deinem Computer zu installieren und auszuführen, befolge diese Schritte:

### Voraussetzungen
* **Node.js** (Version 18.x oder neuer empfohlen)
* **npm** (wird automatisch mit Node.js installiert)
* Ein GitHub-Konto (für Deployment und Actions)

### Schritte
1. **Repository klonen:**
   ```bash
   git clone https://github.com/DEIN_BENUTZERNAME/DEIN_REPOSITORY.git
   cd DEIN_REPOSITORY
   ```
2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```
3. **Lokale Umgebungsvariablen konfigurieren:**
   Erstelle eine Datei namens `.env.local` im Stammverzeichnis deines Projekts und trage dort deine Supabase-Verbindungsinformationen ein:
   ```env
   VITE_SUPABASE_URL=https://deine-projekt-id.supabase.co
   VITE_SUPABASE_ANON_KEY=dein-public-anon-key
   VITE_SYNC_SECRET=ein-sicheres-passwort-fuer-den-sync
   ```
4. **Entwicklungsserver starten:**
   ```bash
   npm run dev
   ```
   Die Anwendung läuft nun unter [http://localhost:5173](http://localhost:5173).

---

## 🗄️ 2. Supabase-Datenbank-Setup

Die Anwendung verwendet Supabase als Backend. Um die Datenbanktabellen, Sicherheitsrichtlinien (RLS) und Helferfunktionen anzulegen:

1. Registriere dich kostenlos auf [supabase.com](https://supabase.com) und erstelle ein neues Projekt.
2. Gehe in deinem Supabase-Dashboard zum Bereich **SQL Editor** (Symbol mit der Aufschrift `SQL` in der linken Navigationsleiste).
3. Erstelle eine neue Abfrage ("New Query") und füge den gesamten Inhalt der Datei `supabase/migrations/20260808000000_init.sql` ein.
4. Klicke oben rechts auf **Run**, um das Skript auszuführen.

### Was macht dieses Migrationsskript?
* **Tabellen erstellen:** Richtet Tabellen für `teams`, `profiles`, `team_players`, `matches`, `availabilities`, `absences`, `sync_runs`, `match_changes` und `club_settings` ein.
* **Idempotenz garantieren:** Das Skript ist so konzipiert, dass es beliebig oft hintereinander ausgeführt werden kann. Es fügt Spalten (z. B. `position_number` in `profiles`) oder Tabellen (z. B. `absences`) nur hinzu, wenn diese noch nicht existieren.
* **RLS (Row Level Security) aktivieren:** Jede Tabelle wird abgesichert. Nur berechtigte Benutzer können Daten lesen oder schreiben.
* **Schnittstellen entkoppeln:** Es entfernt die native Foreign Key Constraint `profiles_id_fkey` zwischen `public.profiles` und `auth.users`, damit der Sportwart/Administrator Profile passwortlos im Voraus eintragen kann.
* **Trigger & Helfer:** Fügt Trigger hinzu, die bei einer Terminverschiebung die alten Rückmeldungen archivieren und im Frontend als ungültig (⚠️) markieren.

---

## ⚡ 3. Supabase Edge Function bereitstellen (`sync-calendars`)

Die Synchronisations-Engine, welche die ICS-Kalender direkt von myTischtennis.de herunterlädt, ist als **Supabase Edge Function** implementiert. Dadurch wird sichergestellt, dass der Abgleich serverseitig und frei von CORS-Einschränkungen abläuft.

Du kannst die Funktion auf zwei Wegen bereitstellen:

### Weg A: Automatisch über GitHub Actions (Empfohlen 🚀)
Es ist keine lokale Installation der Supabase-CLI nötig. Die Bereitstellung geschieht vollautomatisch bei jedem Push auf den `main`-Branch:

1. Gehe in deinem GitHub-Repository auf **Settings > Secrets and variables > Actions**.
2. Erstelle ein Secret namens **`SUPABASE_ACCESS_TOKEN`**:
   * Generiere das Token in deinem Supabase-Konto unter [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
3. Erstelle ein Secret namens **`SUPABASE_PROJECT_ID`**:
   * Trage dort deine Projekt-Referenz-ID ein (z. B. `abcde12345`). Du findest sie im Supabase-Dashboard unter **Project Settings** > **General** > **Reference ID**.
4. Der GitHub-Workflow `.github/workflows/deploy-edge-functions.yml` übernimmt beim nächsten Commit den Rest.
5. **Wichtig:** Hinterlege die Umgebungsvariablen für die Edge-Function einmalig im Supabase-Dashboard unter **Settings > Edge Functions**:
   * `SUPABASE_URL` = `https://DEINE_PROJEKT_REFERENZ_ID.supabase.co`
   * `SUPABASE_SERVICE_ROLE_KEY` = (Dein geheimer `service_role`-Schlüssel aus *Settings > API*)
   * `SYNC_SECRET` = (Dein langes Synchronisations-Passwort)

### Weg B: Manuell über die Supabase CLI
1. Installiere die CLI auf deinem Computer:
   * macOS/Linux: `brew install supabase/tap/supabase`
   * Windows (npm): `npm install -g supabase`
2. Melde dich an und verknüpfe dein Projekt:
   ```bash
   supabase login
   supabase link --project-ref DEINE_PROJEKT_REFERENZ_ID
   ```
3. Setze die Secrets über das Terminal:
   ```bash
   supabase secrets set SUPABASE_URL="https://DEINE_PROJEKT_REFERENZ_ID.supabase.co"
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY="DEIN_SERVICE_ROLE_KEY"
   supabase secrets set SYNC_SECRET="DEIN_VITE_SYNC_SECRET"
   ```
4. Veröffentliche die Funktion:
   ```bash
   supabase functions deploy sync-calendars
   ```

---

## 🛠️ 4. GitHub-Secrets für Frontend & Hosting einrichten

Damit GitHub Pages das Frontend bauen und hosten kann, müssen in den **Settings** des GitHub-Repositorys unter **Secrets and variables > Actions** folgende Repository Secrets eingetragen werden:

* **`VITE_SUPABASE_URL`:** Deine Supabase API URL (z.B. `https://xyz.supabase.co`).
* **`VITE_SUPABASE_ANON_KEY`:** Dein öffentlicher Supabase Anon-Schlüssel (zu finden unter *Project Settings > API > anon / public*).
* **`VITE_SYNC_SECRET`:** Ein beliebiges, langes Passwort (z. B. eine UUID), das du auch als `SYNC_SECRET` in Supabase eingetragen hast.

---

## 🚀 5. Deployment auf GitHub Pages

1. Navigiere in deinem GitHub-Repository zu **Settings > Pages**.
2. Wähle unter **Build and deployment > Source** den Eintrag **GitHub Actions** aus.
3. Der Workflow `.github/workflows/deploy.yml` wird nun bei jedem Push auf den `main`-Branch die App bauen, die Umgebungsvariablen einbetten und die statischen Dateien auf GitHub Pages veröffentlichen.

---

## 🔄 6. Automatischer Kalender-Sync (Cronjob)

Die Datei `.github/workflows/sync-calendars.yml` enthält eine geplante GitHub Action, die **einmal täglich um 04:00 Uhr UTC** (05:00/06:00 Uhr deutsche Zeit) ausgeführt wird.
Diese sendet einen HTTP-POST-Aufruf mit dem `VITE_SYNC_SECRET` im Header an deine bereitgestellte Edge Function, um alle Kalender im Hintergrund zu aktualisieren. Du musst dafür nichts weiter konfigurieren – der Wecker läuft vollautomatisch über GitHub!
