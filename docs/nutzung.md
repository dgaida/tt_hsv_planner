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

#### 2. Kaderpflege (Spieler zuordnen)  
* Im Admin-Bereich (oder direkt in deiner Mannschaftsansicht) kannst du festlegen, welche Spieler fest zu deiner Mannschaft gehören (Stammspieler).  
* Du kannst Spieler zu deiner Mannschaft hinzufügen oder sie entfernen.  

#### 3. Team-Matrix & Rückmelde-Status  
* Im Reiter **"Team-Matrix"** siehst du alle Spiele deiner Mannschaft und alle deine Spieler in einer kompakten Tabelle.  
* Du erkennst sofort auf einen Blick, wer zugesagt, abgesagt, noch nicht geantwortet oder eine Bemerkung hinterlassen hat.  
* **Rückmeldungen für Ersatzspieler:** Du kannst die RSVP-Verfügbarkeiten von Ersatzspielern (Substitutes) bearbeiten, um kurzfristige Änderungen am Spieltag festzuhalten.  

#### 4. Abwesenheits-Kalender  
* Du hast Zugriff auf den Reiter **"Abwesenheits-Kalender"**, der die kommenden 4 Monate (jeweils zwei Monate nebeneinander) anzeigt. Klickst du auf einen Tag, siehst du alle abwesenden Spieler deines Vereins mit Grund. Das erleichtert die langfristige Suche nach Ersatzspielern erheblich.  

#### 5. On-Demand Online-Kalendersynchronisation  
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

#### 3. 4-Monats-Abwesenheits-Planer  
* Du hast Zugriff auf eine kalendarische Übersicht der kommenden 4 Monate in einem dedizierten Reiter **"Abwesenheits-Kalender"**.  
* Alle Abwesenheiten der Spieler werden farbig in einer Tages-Matrix visualisiert (zwei Monate nebeneinander dargestellt).  
* Klickst du auf einen Tag, siehst du im Detail, wer an diesem Tag aus welchen Gründen (Urlaub, Arbeit, etc.) fehlt.  

#### 4. Aufstellungs-Kontrolle (Lineup)  
* In der Gesamtübersicht siehst du für jedes Spiel die automatisch berechnete Aufstellung (Top 4 Stammspieler, ergänzt durch die am besten platzierten Ersatzspieler mit Zusage).  
* Du kannst die berechnete Aufstellung manuell überschreiben, um taktische Aufstellungen festzulegen.  

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
