# Tischtennis-Spielbereitschafts-Planer (TTV Spielplaner)

Dieses Repository enthält eine vollständige, produktionsreife und smartphone-optimierte Web-Anwendung zur Organisation der Spielbereitschaft für Tischtennis-Vereine.

[![Version](https://img.shields.io/github/v/tag/dgaida/tt_hsv_planner?label=version)](https://github.com/dgaida/tt_hsv_planner/tags)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://dgaida.github.io/tt_hsv_planner/)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/dgaida/tt_hsv_planner/graphs/commit-activity)
![Last commit](https://img.shields.io/github/last-commit/dgaida/tt_hsv_planner)


Die Anwendung liest Spieltermine automatisch aus den jeweiligen **Webcal-Kalendern von myTischtennis.de** ein und bietet eine gemeinsame Plattform zur unkomplizierten Rückmeldung und Organisation der Spieltage.

---

## 📖 Dokumentation (docs/)

Für eine detaillierte Übersicht und Anleitung haben wir eine umfassende Dokumentation im Ordner [`docs/`](./docs/) hinterlegt:

1. 🚀 **[Erst-Einrichtung & Installation](./docs/einrichtung.md)**  
   * Lokale Entwicklung einrichten (`npm run dev`)  
   * Supabase-Datenbank-Setup (Tabellen, RLS, RPCs)  
   * Bereitstellung der Edge Function (`sync-calendars`)  
   * CI/CD via GitHub Actions (Hosting & automatisierter Cronjob-Sync)  
2. 🧑‍💻 **[Nutzung & Benutzerhandbuch](./docs/nutzung.md)**  
   * **Spieler:** Abwesenheitskalender, Zu- und Absagen (RSVP), passwortloser Login  
   * **Mannschaftsführer:** Stammspieler-Verwaltung, Teamzuordnungen  
   * **Sportwart:** Spielerverwaltung, TTR-Punkte, Aufstellungen (Lineups), Abwesenheitsmatrix (60 Tage)  
   * **Administrator:** Teampflege, Webcal-Links, Rollenzuweisungen, Synchronisationsberichte  
3. 🏗️ **[Technische Architektur](./docs/architektur.md)**  
   * Technologiestack (React, Vite, TypeScript, Tailwind, Supabase)  
   * Datenmodell & Datenbankschema (Lineup JSONB, Absences, etc.)  
   * Kalender-Synchronisations-Engine (Proxy-Bypass, Edge-Function-Logik)  
   * Ersatzspieler-Nachrückerlogik & Berechtigungskonzept (RLS)  
4. ❓ **[FAQ & Fehlerbehebung](./docs/faq.md)**  
   * Fehlerbehebung beim PostgREST-Cache (`NOTIFY pgrst, 'reload schema'`)  
   * Globale Passwort-Sperre & URL-Bypass-Links  
   * Probleme beim E-Mail-Versand oder Webcal-Import  

---

## 🚀 Kern-Features im Überblick

* **Mehrere Mannschaften verwalten:** Mannschaften können flexibel über das Admin-Panel oder direkt in der Datenbank angelegt, aktiviert/deaktiviert und mit eigenen Webcal-Kalendern verknüpft werden.  
* **Automatischer & Manueller Sync:** Kalender synchronisieren sich vollautomatisch einmal täglich (via GitHub Actions Cronjob). Alternativ können Administratoren oder Sportwarte die Synchronisation direkt im Frontend auslösen.  
* **Erkennung von Spielverlegungen (Termin-Versionierung):**  
  * Verschiebt sich ein Spiel auf myTischtennis.de, wird dies über die stabile `UID` des ICS-Events erkannt.  
  * Bereits abgegebene Rückmeldungen werden archiviert und im Frontend als *„erneute Antwort erforderlich“ (⚠️)* markiert, damit Spieler den neuen Termin explizit bestätigen können.  
* **Abwesenheits-Kalender (Mein Kalender & 4-Monats-Planer):**  
  * Spieler können Abwesenheiten (z. B. Urlaub, Arbeit, Krankheit) im persönlichen Kalender pflegen.  
  * Mannschaftsführer, Sportwarte und Admins steht eine visuelle 4-Monats-Abwesenheitsmatrix (zwei Monate nebeneinander) aller Spieler in einem eigenen Tab zur langfristigen, mannschaftsübergreifenden Planung zur Verfügung.  
* **Intelligente Ersatzspieler-Regelung (Ersatzspieler-Logik):**  
  * Das System stellt automatisch die Top 4 Stammspieler eines Teams auf.  
  * Fehlt ein Stammspieler oder sagt ab, rückt automatisch der am besten platzierte, verfügbare Ersatzspieler (basierend auf Vereinsrangliste: Teamnummer und Position) nach.  
* **Automatische Terminkonflikt-Erkennung:** Ist ein Spieler zeitgleich bei zwei Spielen als verfügbar eingetragen, wird die Vereinsleitung sofort optisch gewarnt.  
* **Zweigeteiltes Login-Verfahren:**  
  * **Passwortloser Login:** Spieler können sich für schnelle Rückmeldungen direkt über ein Namens-Dropdown einloggen (erhält standardmäßig die Rolle `player`).  
  * **Passwort-Login:** Um administrative Rollen (Mannschaftsführer, Sportwart, Admin) freizuschalten, ist eine Anmeldung mit E-Mail und Passwort erforderlich.  
* **Smartphone-Optimierung:** Konsequentes Mobile-First-Design mit großen, berührungsfreundlichen Schaltflächen für eine reibungslose Bedienung auf jedem Smartphone.  
* **Globale Passwort-Sperre:** Schutz aller Vereinsdaten durch ein globales Passwort. Unterstützt URL-Bypass per Parameter (`?pw=Passwort`), um Mitgliedern den direkten Zugriff zu erleichtern.  

---

## 🛠️ Schnelleinstieg für Entwickler

1. **Repository klonen und Abhängigkeiten installieren:**  
   ```bash
   git clone https://github.com/DEIN_USER/DEIN_REPO.git
   cd DEIN_REPO
   npm install
   ```
2. **Lokalen Entwicklungsserver starten:**  
   ```bash
   npm run dev
   ```
   Die Anwendung öffnet sich unter `http://localhost:5173`.  
3. **Automatisierte Tests ausführen:**  
   ```bash
   npm run test
   ```

Für die komplette Anleitung zur Anbindung von Supabase und dem Deployment auf GitHub Pages siehe **[Erst-Einrichtung & Installation](./docs/einrichtung.md)**.
