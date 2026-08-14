# 🧑‍💻 Handbuch zur Nutzung (TTV Spielplaner)

Dieses Handbuch beschreibt die Nutzung des TTV Spielplaners aus der Sicht der vier verschiedenen Benutzerrollen: **Spieler**, **Mannschaftsführer**, **Sportwart** und **Administrator**.

---

## 🔒 1. Anmeldung & Passwortschutz

### Das globale Vereinspasswort (Password Gate)
Die gesamte Plattform ist vor unbefugtem Zugriff geschützt. Beim ersten Besuch der Seite wirst du aufgefordert, das **Vereinspasswort** einzugeben.  
* **Tipp für Bequemlichkeit (Bypass-Link):** Du kannst das Passwort in der URL mitsenden, um den Passworteingabebildschirm komplett zu überspringen (z. B. ideal zum Abspeichern als Lesezeichen oder zum Teilen in WhatsApp-Gruppen):  
  `https://deinverein.github.io/spielplaner/?pw=DasVereinsPasswort` oder `?password=DasVereinsPasswort`.

### Registrierung & Automatische Profil-Verknüpfung
Damit Spieler ihre Accounts registrieren können, ohne dass mühsam im Nachhinein manuell Berechtigungen, TTR-Punkte oder Mannschaftszuordnungen verknüpft werden müssen, verwendet die Plattform eine **intelligente, automatische Namenserkennung**:

* **Vorarbeit durch den Verein:** Der Sportwart oder Administrator importiert bzw. pflegt die Spieler-Datenbank im Voraus (z. B. über den HTML-Kader-Import). Hierbei existieren die Spieler mit ihrem vollen Namen (z. B. `"Max Mustermann"`), werden jedoch im Tool datenschutzfreundlich abgekürzt dargestellt (z. B. `"Max M"`).  
* **Der Registrierungsprozess:**  
  * Ein Spieler registriert sich neu im System mit seiner E-Mail-Adresse, einem Passwort und seinem **vollen Namen** (z. B. `"Max Mustermann"`).  
  * Das System vergleicht diesen Namen (ohne Berücksichtigung von Groß-/Kleinschreibung und führenden/nachfolgenden Leerzeichen) mit der bereits existierenden Liste der importierten Profile.  
  * Wird eine Übereinstimmung gefunden, **verknüpft das System dieses bestehende Profil sofort und vollautomatisch mit dem neuen Benutzer-Account**.  
* **Vorteile der automatischen Verknüpfung:**  
  * **Erhalt aller Daten:** Alle historischen Rückmeldungen (RSVPs), Abwesenheiten, Mannschaftszuordnungen, TTR-Punkte und bereits vorgenommenen Aufstellungen (Lineups) bleiben nahtlos erhalten.  
  * **Kein Administrativer Aufwand:** Es muss kein Administrator manuell eingreifen, um dem neu registrierten Account sein Profil zuzuordnen.  
  * **Cascade-Sicherheit:** Durch datenbankseitige CASCADE-Regeln werden alle Tabellenreferenzen sicher auf die neue Benutzer-ID umgeschrieben.  

---

## 🧑‍🤝‍🧑 2. Die Rollen und ihre Funktionen

### 🧑‍💻 A. Spieler (Rolle: `player`)
Als Spieler steht für dich die schnelle Rückmeldung und deine persönliche Planung im Vordergrund.

#### 1. Anmeldung  
* **Passwortlose Anmeldung (Schnellzugriff):** Wähle einfach deinen Namen aus der Liste aus und klicke auf "Anmelden". Du bist sofort eingeloggt und kannst deine Verfügbarkeiten eintragen.  
* **Passwort-Login (Optional):** Falls du dich mit E-Mail und Passwort registriert hast, kannst du dich auch darüber anmelden.  

#### 2. Spielbereitschaft zurückmelden (RSVP)  
* Im Reiter **"Mannschaften"** siehst du die anstehenden Spiele deines Teams.  
* Nutze die großen, berührungsfreundlichen Tasten, um deine Bereitschaft einzutragen:  
  * **Zusage (Grün):** Du bist spielbereit und stehst zur Verfügung.  
  * **Absage (Rot):** Du kannst an diesem Termin nicht spielen.  
  * **Unsicher (Gelb):** Du weißt es noch nicht genau (z. B. wegen Schichtarbeit).  
* Du kannst zu jeder Rückmeldung eine **Bemerkung** hinzufügen (z. B. "Kann erst ab 19:30 Uhr" oder "Fahre direkt zum Auswärtsspiel").  

#### 3. Ersatzspieler-Meldung (Mannschaftsübergreifend)  
* Du möchtest in einer anderen Mannschaft als Ersatzspieler aushelfen? Navigiere einfach zu dem entsprechenden Team und klicke auf ein Spiel.  
* Trage dich dort mit **"Zusage" (Grün)** ein. Du wirst in der Teamübersicht und beim Sportwart sofort als verfügbarer Ersatzspieler aufgeführt.  

#### 4. Mein Kalender (Abwesenheiten)  
* Im Reiter **"Mein Kalender"** kannst du Zeiträume eintragen, an denen du generell nicht zur Verfügung stehst (Urlaub, Dienstreisen, Lehrgänge, Krankheit).  
* Gib ein Start- und Enddatum sowie einen optionalen Grund ein.  
* Diese Abwesenheiten werden dem Sportwart, den Mannschaftsführern und den Admins übersichtlich in ihrem 4-Monats-Abwesenheitskalender angezeigt.  

#### 5. Aktualisieren-Button (Datenabgleich)  
* Wenn du im Mannschafts-Tab auf **"🔄 Aktualisieren"** klickst, wird dein lokaler Stand direkt mit der Datenbank abgeglichen. Es findet kein erneuter Abruf des Online-Kalenders von myTischtennis.de statt, was Ladezeit spart und Schnittstellen-Sperren (Rate Limits) verhindert.  

---

### 📋 B. Mannschaftsführer (Rolle: `team_manager`)
Als Mannschaftsführer bist du für die Aufstellung und Pflege deines Teams verantwortlich.

#### 1. Anmeldung  
* **Wichtig:** Du musst dich zwingend mit deiner **E-Mail und deinem Passwort anmelden**, um deine erweiterten Rechte freizuschalten. Bei einer passwortlosen Anmeldung über das Dropdown wirst du vom System als normaler Spieler eingestuft!  

#### 2. Spieler & Ersatzspieler zu Spielen hinzufügen (RSVP-Steuerung)
Du kannst Rückmeldungen (Zusagen/Absagen) für dein Team direkt eintragen und steuern. Dies ist ideal, wenn dir ein Spieler mündlich, per E-Mail oder per WhatsApp Bescheid gibt:  
* **Wo finde ich das?** Navigiere zum Reiter **"Mannschaften"** und wähle deine Mannschaft aus. In der Aufstellungsliste des jeweiligen Spiels ("Aufstellung (Stamm 1-4 / Ersatz)") befindet sich neben jedem Spieler ein Dropdown-Feld mit den Statuswerten "Ja", "Nein", "Vielleicht" und "Keine Antwort".  
* **Ersatzspieler hinzufügen:** Wenn ein spielberechtigter Spieler eines anderen Teams aushelfen soll, muss er entweder selbst für das Spiel zugesagt haben, oder du änderst seinen RSVP-Status auf "Ja" (bzw. lässt dies tun). Sobald er zugesagt hat, rückt er automatisch in die Aufstellung nach.  
* **Berechtigungs-Einschränkung:** Du kannst die RSVPs deiner eigenen Stammspieler jederzeit ändern. Für Ersatzspieler (Spieler anderer Mannschaften) gilt: **Nur der Mannschaftsführer ihrer jeweiligen Stamm-Mannschaft** (oder Sportwarte/Admins) kann deren Rückmelde-Status ändern. Das verhindert ungewollte RSVP-Manipulationen zwischen den Mannschaften.  

#### 3. Automatische Mannschaftsaufstellung & Sortier-Logik (Lineup-Engine)
Die Aufstellung pro Spiel (maximal 5 Spieler auf dem Spielbericht) wird automatisch berechnet und sortiert:  
* **A. Kandidaten-Auswahl:** Das System sucht alle offiziellen Stammspieler deiner Mannschaft und kombiniert sie mit allen externen Spielern (Ersatzspielern), die eine Rückmeldung abgegeben haben.  
* **B. RSVP-Priorität (4-Stufen-Logik):** Die Kandidaten werden primär nach ihrer Rückmeldung sortiert:  
  1. **Ja (Zusage):** Haben höchste Priorität und wandern ganz nach oben.  
  2. **Keine Antwort (unentschieden):** Werden nachrangig aufgeführt.  
  3. **Vielleicht:** Stehen an dritter Stelle.  
  4. **Nein (Absage):** Werden ans Ende der Liste einsortiert.  
* **C. Vereinsrangfolge (Tie-Breaker):** Haben mehrere Spieler denselben RSVP-Status (z. B. vier Spieler haben "Ja" zugesagt), entscheidet die feste Rangfolge im Verein (bestimmt durch den Sportwart):  
  * **Team-Nummer** aufsteigend ➔ **Positions-Nummer** aufsteigend ➔ **Name** alphabetisch.  
  * Dadurch rücken bei Ausfällen automatisch die stärksten/nächstbesten verfügbaren Spieler des Vereins nach.  
* **D. Der Kader (4 Stamm + 1 Ersatz):** Aus der sortierten Liste werden die Top 5 Spieler genommen. Die ersten 4 Spieler bilden die Stammaufstellung des Spiels. Der 5. Spieler wird deutlich als **"Ersatz"** (mit amberfarbener Markierung und "Ersatz"-Badge) dargestellt.  
* **E. Manuelle Reihenfolge (Reorder):** Du kannst diese Standard-Berechnung manuell überschreiben, indem du die Schaltflächen **▲** (nach oben) und **▼** (nach unten) neben dem Namen des Spielers verwendest. Dies ist ideal für taktische Aufstellungen. Die geänderte Reihenfolge wird sofort für das Spiel in der Datenbank hinterlegt.  

#### 4. Team-Matrix  
* Im Reiter **"Team-Matrix"** siehst du alle Spiele deiner Mannschaft und alle deine Spieler in einer kompakten Tabelle.  
* Du erkennst sofort auf einen Blick, wer zugesagt, abgesagt, noch nicht geantwortet oder eine Bemerkung hinterlassen hat.  

#### 5. Abwesenheits-Kalender  
* Du hast Zugriff auf den Reiter **"Abwesenheits-Kalender"**, der die kommenden 4 Monate (jeweils zwei Monate nebeneinander) anzeigt. Klickst du auf einen Tag, siehst du alle abwesenden Spieler deines Vereins mit Grund. Das erleichtert die langfristige Suche nach Ersatzspielern erheblich.  

#### 6. On-Demand Online-Kalendersynchronisation  
* Wenn du als Mannschaftsführer im Mannschafts-Tab auf **"🔄 Aktualisieren"** klickst, wird der Online-Kalender von myTischtennis.de für deine Mannschaft live im Hintergrund auf Änderungen, neue Spiele oder Spielabsagen geprüft.  
* Das Ergebnis wird dir direkt neben dem Button als Bestätigung angezeigt (z. B. wie viele Spiele hinzugefügt, aktualisiert oder verschoben wurden). Erst danach werden die Termine neu aus der Datenbank geladen.  

---

### 🏓 C. Sportwart (Rolle: `sportwart`)
Als Sportwart hast du die sportliche Gesamtleitung des Vereins und planst die Aufstellungen mannschaftsübergreifend.

#### 1. Anmeldung  
* Melde dich mit deiner **E-Mail und deinem Passwort** an.  

#### 2. Spieler & TTR-Punkte verwalten  
* Im Reiter **"Sportwart"** kannst du neue Spielerprofile anlegen (vollkommen unabhängig von einem registrierten Supabase-Konto).  
* Du kannst für jeden Spieler die aktuellen **TTR-Punkte** eintragen.  
* Weise den Spielern ihre feste Position im Verein zu (z. B. `team_number = 1` und `position_number = 3` für Team 1, Position 3). Dies bestimmt die automatische Nachrücker-Hierarchie bei Ersatzspielern.  

#### 3. HTML-Kader-Import & Abgleich  
* Über die Import-Funktion im Sportwart-Reiter kannst du die Mannschaftsmeldung (HTML-Kopie von myTischtennis.de) einfügen.  
* Das System führt im Hintergrund einen intelligenten Abgleich durch und zeigt farblich gruppiert an:  
  * **Bereits aktuell:** Keine Änderungen erforderlich.  
  * **Nur aktualisiert:** TTR-Punkte oder Positionen haben sich geändert.  
  * **Ersetzt:** Spieler wurden ersetzt oder neu hinzugefügt.  
* Erst nach deiner ausdrücklichen Bestätigung werden die Daten übernommen.  

#### 4. 4-Monats-Abwesenheits-Planer  
* Du hast Zugriff auf eine kalendarische Übersicht der kommenden 4 Monate in einem dedizierten Reiter **"Abwesenheits-Kalender"**.  
* Alle Abwesenheiten der Spieler werden farbig in einer Tages-Matrix visualisiert (zwei Monate nebeneinander dargestellt).  
* Klickst du auf einen Tag, siehst du im Detail, wer an diesem Tag aus welchen Gründen (Urlaub, Arbeit, etc.) fehlt.  

#### 5. Aufstellungs-Kontrolle & mannschaftsübergreifendes Lineup  
* In der Gesamtübersicht siehst du für jedes Spiel die automatisch berechnete Aufstellung (Top 4 Stammspieler, ergänzt durch die am besten platzierten Ersatzspieler mit Zusage).  
* Als Sportwart hast du das Recht, **die Aufstellungen aller Mannschaften manuell zu sortieren (▲/▼) oder die Rückmeldungen (RSVP) von beliebigen Spielern direkt über die Aufstellungsliste im Mannschafts-Reiter zu bearbeiten**, um Ausfälle mannschaftsübergreifend optimal zu koordinieren.  

---

### ⚙️ D. Vereinsadministrator (Rolle: `club_admin`)
Als Administrator hast du vollen Zugriff auf alle technischen Einstellungen des Vereins.

#### 1. Anmeldung  
* Melde dich mit deiner **E-Mail und deinem Passwort** an.  

#### 2. Mannschafts- & Webcal-Verwaltung  
* Im Reiter **"Admin"** kannst du neue Mannschaften erstellen (z. B. "Damen I" oder "Senioren").  
* Hinterlege oder ändere die **Webcal-Kalender-Links von myTischtennis.de** für jede Mannschaft.  
* Du kannst Mannschaften aktiv oder inaktiv schalten.  

#### 3. Globale Rollenverteilung  
* Du kannst die Berechtigungen aller Benutzer im Verein hochstufen (z. B. einen Spieler zum Mannschaftsführer befördern) oder anpassen.  

#### 4. Manuelle Synchronisation & Berichte  
* Du kannst den Import der Spieltermine von myTischtennis.de direkt im Browser anstoßen.  
* Du siehst die Protokolle der letzten Synchronisationen mit Details darüber, wie viele Spiele importiert wurden und ob Fehler aufgetreten sind.  
