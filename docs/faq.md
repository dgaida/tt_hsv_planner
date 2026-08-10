# ❓ FAQ & Fehlerbehebung (TTV Spielplaner)

Dieses Dokument enthält Antworten auf häufig gestellte Fragen (FAQs) und konkrete Lösungswege bei technischen Problemen.

---

## ❓ 1. Häufig gestellte Fragen (FAQs)

### Q1: Wie greife ich direkt auf den Spielplaner zu, ohne jedes Mal das Passwort eingeben zu müssen?
**Antwort:** Du kannst das Passwort als URL-Parameter mitsenden. Speichere dir den Link einfach als Lesezeichen im Browser deines Handys ab:
`https://deinverein.github.io/spielplaner/?pw=DasVereinsPasswort` oder `?password=DasVereinsPasswort`.

### Q2: Warum kann ich mich nicht als Mannschaftsführer/Sportwart/Admin einloggen, wenn ich mich passwortlos anmelde?
**Antwort:** Die passwortlose Anmeldung über die Dropdown-Namensliste dient dem schnellen Zugriff für reguläre Spieler. Aus Sicherheitsgründen weist das Frontend bei diesem Login-Weg grundsätzlich nur die Standardrolle `player` (Spieler) zu.
Um deine erweiterten administrativen Rechte zu nutzen, musst du dich zwingend über das klassische Login-Formular mit deiner **E-Mail-Adresse und deinem persönlichen Passwort** anmelden.

### Q3: Was passiert mit meinen Rückmeldungen, wenn ein Spiel verschoben wird?
**Antwort:** Deine alte Rückmeldung geht nicht verloren, sondern wird in der Datenbank archiviert. Da das Spiel nun aber an einem anderen Tag oder zu einer anderen Uhrzeit stattfindet, fordert das System dich im Frontend mit einem Warnsymbol (⚠️) dazu auf, deine Verfügbarkeit für den neuen Termin zu bestätigen.

### Q4: Warum wird der Spieltitel in der Übersicht rot dargestellt?
**Antwort:** Wenn ein Spiel weniger als **4 positive Zusagen ('yes')** aufweist, färbt das System den Spieltitel rot ein und zeigt ein Warndreieck (`AlertTriangle`) an. Dies dient als visuelle Warnung für die Mannschaftsführer und den Sportwart, dass für dieses Spiel noch nicht genügend Spieler zur Verfügung stehen.

---

## 🛠️ 2. Technische Fehlerbehebung

### Fehler A: "Could not find column or table in the schema cache" (PostgREST-Fehler)
Dieser Fehler tritt meistens nach dem Ausführen einer Datenbank-Migration (z. B. nach einem Update des Repositories) auf. Supabase (bzw. die API-Schnittstelle PostgREST) hat dann seinen internen Cache für das Tabellenschema noch nicht aktualisiert.

#### Lösungswege (der Reihe nach ausprobieren):

1. **Cache-Neuaufbau erzwingen (SQL Editor):**
   Führe folgenden Befehl im **SQL Editor** in Supabase aus, um den Cache manuell neu zu laden:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. **Benachrichtigungswarteschlange leeren:**
   Sollte Schritt 1 blockiert sein, hilft dieser Befehl, um die Postgres-Queue im Hintergrund zu bereinigen:
   ```sql
   SELECT pg_notification_queue_usage();
   ```
3. **API-Einstellung im Dashboard toggeln (Erzwingt Backend-Rebuild):**
   * Gehe im Supabase-Dashboard auf **Project Settings** > **Data API**.
   * Nimm eine minimale Änderung vor (z. B. kurz eine Einstellung umschalten oder ein Schema hinzufügen/entfernen) und klicke auf **Save**. Dies zwingt Supabase, den Cache komplett neu aufzubauen.
4. **Projekt pausieren & fortsetzen (Harter Neustart):**
   * Klicke im Supabase-Dashboard unten links auf das Zahnrad-Symbol und wähle **Pause Project**.
   * Warte 2 Minuten und klicke dann auf **Resume Project**. Dadurch wird der gesamte Container neu gestartet und liest das Schema frisch ein.

---

### Fehler B: Ich erhalte keine Bestätigungs-E-Mail nach der Registrierung
Supabase verwendet für neue Projekte standardmäßig eine eingebaute E-Mail-Schnittstelle, die jedoch sehr restriktiven Limits unterliegt (z. B. maximal 3 E-Mails pro Stunde für das gesamte Projekt) und unzuverlässig zustellt.

#### Lösungswege:

* **Weg 1: E-Mail-Bestätigung komplett deaktivieren (Empfohlen für schnellen Start):**
  Wenn du keine E-Mail-Verifizierung benötigst, kannst du diese einfach abschalten. Benutzer sind dann sofort nach der Registrierung aktiv und eingeloggt:
  1. Gehe im Supabase-Dashboard auf **Authentication** > **Providers** > **Email**.
  2. Deaktiviere die Option **"Confirm email"** und klicke auf **Save**.
* **Weg 2: Eigenen SMTP-Server hinterlegen:**
  Für den produktiven Betrieb solltest du einen professionellen E-Mail-Dienst (z. B. Resend, SendGrid, Mailgun) anbinden:
  1. Gehe in Supabase zu **Project Settings** > **Auth** > **SMTP Settings**.
  2. Trage dort die Zugangsdaten deines E-Mail-Providers ein.

---

### Fehler C: Webcal-Synchronisation schlägt fehl oder importiert keine Spiele
* **CORS-Blockade im Browser (Manueller Sync):** Der clientseitige Fallback versucht, CORS-Blockaden über öffentliche Proxies zu umgehen. Wenn diese temporär überlastet sind, kann der Sync fehlschlagen. Versuche es in diesem Fall nach einigen Minuten erneut.
* **Ungültiger Link:** Stelle sicher, dass der Webcal-Link exakt so eingetragen ist, wie von myTischtennis.de bereitgestellt. Das System korrigiert das Protokoll `webcal://` automatisch zu `https://`, aber Tippfehler in der URL verhindern den Download.
* **Keine Spiele im Kalender:** Prüfe auf myTischtennis.de, ob für die betroffene Mannschaft und den aktuellen Zeitraum tatsächlich Spiele im Webcal-Kalender hinterlegt sind.
