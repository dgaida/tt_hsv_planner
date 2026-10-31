# click-TT Ergebnisexport & Spielerabgleich

**Leitfaden für die Schnittstelle zwischen MKTT und click-TT**
**Zurück zur Hauptübersicht:** [README.md](README.md)

---

## 🎯 Überblick über die Schnittstelle

Für eine reibungslose Übergabe der Ergebnisse und TTR-Punkte an den Verband (WTTV / click-TT) müssen vor und nach dem Turnier Daten ausgetauscht werden:

1. **Vor dem Turnier / bei der Anmeldung:** Import der Teilnehmerdaten und Abgleich online erfasster Nachmeldungen.
2. **Nach dem Turnier / nach jeder Klasse:** Generierung der Ergebnis-XML-Datei und Upload im click-TT Ergebnis-Importer.

---

## 📥 1. Spielerabgleich vor dem Turnierstart

Damit alle Spieler inkl. Passdaten und Lizenznummern sauber zugeordnet sind:

1. Am Turnierrechner MKTT starten und die Turnierdatenbank öffnen.
2. Sicherstellen, dass der Rechner mit dem Internet verbunden ist.
3. Im Menü auf **Spielerabgleich** klicken.
4. Die Schaltfläche **„click-TT Teilnehmerliste erneut importieren (direkt online)“** betätigen.
5. MKTT zieht automatisch alle Voranmeldungen sowie alle an Rechner 3 in click-TT neu erfassten Nachmeldungen.
6. Kontrollieren, ob alle Teilnehmer mit korrekten Namen und Vereinen aufgelistet sind.
7. Bei Nachmeldungen, die erst vor Ort bezahlt wurden: Den Haken bei **Anwesend** setzen.

---

## 📤 2. Ergebnisexport nach Turnierende

Sobald eine Konkurrenz (oder der Turniertag) vollständig abgeschlossen ist:

### Schritt A: Datenstand in MKTT kontrollieren
- Prüfen, ob wirklich **alle Begegnungen** beendet und mit gültigen Satzergebnissen erfasst sind.
- Kontrollieren, ob das Spiel um den 3. Platz im Einzel eingetragen ist.
- Prüfen, ob der Endstand und die Platzierungen (1.–3. Platz Einzel, 1.–2. Platz Doppel) logisch und vollständig sind.
- Im Zweifel vor dem Export eine Kopie der Turnierdatenbank auf einen USB-Stick sichern!

### Schritt B: XML-Exportdatei in MKTT erzeugen
1. In der MKTT-Menüleiste auf **Menü** > **Ergebnis Export** klicken.
2. Den Menüpunkt **„Turnierdaten Export nach clickTT erzeugen“** auswählen.
3. Als Zielordner den Turnierordner (z. B. `HSV_Turnier_2026`) auf der Festplatte wählen.
4. **Wichtig:** Den von MKTT automatisch generierten Dateinamen **nicht ändern**! click-TT erwartet eine standardisierte Namenskonvention.
5. Den Export mit `OK` bestätigen.

### Schritt C: Nachmeldungen abgleichen (falls Warnungen auftreten)
- Sollte MKTT beim Export melden, dass Spieler nicht mit click-TT verknüpft sind:
  1. Zuerst prüfen, ob der Spieler an Rechner 3 ordnungsgemäß in click-TT erfasst wurde.
  2. In MKTT erneut `Spielerabgleich` > `click-TT Teilnehmerliste erneut importieren (direkt online)` ausführen.
  3. Den Export wiederholen.

### Schritt D: XML-Datei in click-TT importieren
1. Am Laptop den Browser öffnen und sich im **Vereinszugang von click-TT** anmelden.
2. Zum Menüpunkt **Turniere** navigieren und das Turnier *Heiligenhauser Tischtennis-Turnier 2026* öffnen.
3. Den Reiter bzw. Unterpunkt **Ergebnis-Importer** aufrufen.
4. Auf **Datei auswählen** klicken und die erzeugte XML-Datei aus dem Ordner `HSV_Turnier_2026` auswählen.
5. Den Button **Import starten / Hochladen** klicken.

### Schritt E: Import-Kontrolle
- Das System zeigt ein Importprotokoll mit Status *Erfolgreich* oder eventuellen Fehlermeldungen an.
- Stichprobenkontrolle durchführen:
  - Wurde der Sieger und die Platzierten korrekt übernommen?
  - Stimmen die Satzergebnisse überein?
- Exportdatei und MKTT-Datenbank auf dem Sicherungsstick aufbewahren, bis der Verband das Turnier offiziell bestätigt und verbucht hat.

---

## 🔗 Verwandte Dokumente
- [Hauptübersicht & Zeitplan (README.md)](README.md)
- [MKTT-Schritt-für-Schritt-Leitfaden](mktt_anleitung.md)
- [Anmeldung, Nachmeldung & 2-Schlangen-System](anmeldung_nachmeldung.md)
- [Spielsysteme & Doppelkonkurrenzen](spielsysteme_doppel.md)
- [Checkliste & Notfallkontakte](checkliste.md)
