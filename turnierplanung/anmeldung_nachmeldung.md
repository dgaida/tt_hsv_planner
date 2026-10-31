# Anmeldung, Nachmeldung & 2-Schlangen-System

**Praxisleitfaden für die Anmeldung und Einlasskontrolle am Turniertag**
**Zurück zur Hauptübersicht:** [README.md](README.md)

---

## 💡 Grundprinzipien

1. **Bezahlt = Anwesend:**  
   - In MKTT existiert im Menü `Spielerinfo` die Spalte **Bezahlt**.  
   - Im Menü `Spieler` heißt dieselbe Spalte **Anwesend**.  
   - **Es handelt sich um denselben Status:** Wenn ein Spieler sein Startgeld bezahlt hat und anwesend ist, wird der Haken gesetzt. Spieler ohne Bezahlung/Haken dürfen **nicht** in die Auslosung einbezogen werden!  
2. **Keine Startnummern:**  
   - Es werden **keine Startnummern vergeben**. Startnummernfelder bleiben in MKTT leer.  
3. **Meldeschluss vor Ort:**  
   - Exakt **30 Minuten** vor Beginn der jeweiligen Turnierklasse ist Vor-Ort-Meldeschluss. Nach diesem Zeitpunkt werden keine Anmeldungen mehr angenommen.  

---

## 👥 Das 2-Schlangen-System vor Ort

Um lange Wartezeiten, Hektik an der Kasse und Fehler in MKTT zu vermeiden, wird die Anmeldung strikt in zwei Schlangen aufgeteilt:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│           SCHLANGE 1            │       │           SCHLANGE 2            │
│  (Vorangemeldete Teilnehmer)   │       │         (Nachmeldungen)         │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 ▼                                         ▼
      ┌─────────────────────┐                   ┌─────────────────────┐
      │      RECHNER 2      │                   │      RECHNER 3      │
      │  (Turnierleitung)   │                   │ (click-TT Erfassung)│
      │                     │                   │                     │
      │ 1. Name prüfen      │                   │ 1. Spieler in       │
      │ 2. Startgeld kassier│                   │    click-TT erfassen│
      │ 3. Haken "Anwesend" │                   │ 2. Kein Geld kassier│
      └─────────────────────┘                   │ 3. Weiter zu        │
                                                │    Schlange 1       │
                                                └──────────┬──────────┘
                                                           │
                                                           ▼
                                                Reiht sich in Schlange 1
                                                zur Bezahlung & Abgleich ein!
```

---

## 💻 Rechner 3: Erfassung von Nachmeldungen

- **Warum Rechner 3 und click-TT?**  
  Wenn Nachmeldungen per Hand frei in MKTT getippt werden, stimmen Spielerkennungen und Vereinsnamen oft nicht exakt mit click-TT überein. Beim späteren XML-Export schlägt der Upload fehl. Daher werden Nachmelder **immer zuerst direkt in click-TT angelegt**.  
- **Wird an Rechner 3 bezahlt?**  
  **NEIN!** An Rechner 3 erfolgt ausschließlich die Datenaufnahme in click-TT.  
- **Ablauf für Nachmelder:**  
  1. Nachmelder geht zu **Schlange 2 (Rechner 3)**.  
  2. Die Helfer an Rechner 3 loggen sich in den Vereinszugang von click-TT ein, öffnen das Turnier und tragen den Spieler in die gewünschte Konkurrenz ein.  
  3. Der Nachmelder erhält einen Vermerk/Laufzettel und stellt sich an **Schlange 1 (Rechner 2)** an.  
  4. An Rechner 2 bezahlt der Nachmelder das Startgeld (Jugend: 5 €, Erwachsene: 10 €).  
  5. An Rechner 2 wird in MKTT der Menüpunkt `Spielerabgleich` aufgerufen und `click-TT Teilnehmerliste erneut importieren (direkt online)` ausgeführt.  
  6. Der neu importierte Spieler erscheint nun in der MKTT-Liste und wird auf **Anwesend** gesetzt.  

---

## 🔄 Spielerabgleich in MKTT (Schritt für Schritt)

Vor jeder Auslosung muss ein finaler Spielerabgleich durchgeführt werden:

1. In MKTT auf das Register bzw. Menü **Spielerabgleich** klicken.  
2. Den Button **click-TT Teilnehmerliste erneut importieren (direkt online)** anklicken (stabile Internetverbindung erforderlich).  
3. MKTT lädt alle online in click-TT erfassten Vor- und Nachmeldungen nach.  
4. Prüfen, ob alle bezahlten Spieler der Konkurrenz als **Anwesend** markiert sind.  
5. Nicht erschienene Spieler abgleichen und **nicht** als anwesend markieren.  
6. Erst wenn die Teilnehmerzahl und die Anwesenheiten exakt stimmen, wird 15 Minuten vor Spielbeginn die Auslosung gestartet.  

---

## ⚠️ Sonderregeln bei Anmeldungen

- **Mehrfachstarts am selben Tag:**  
  Ein Spieler darf pro Tag in einer weiteren Turnierklasse nur starten, wenn sein vorheriges Turnier **vollständig beendet** ist (keine offenen Einzel- oder Doppelspiele mehr). Ein zeitgleicher Parallelstart in zwei überlappenden Konkurrenzen ist **nicht gestattet**.  
- **Q-TTR-Grenzen strikt einhalten:**  
  Maßgebend ist ausnahmslos der Q-TTR-Wert vom **11.08.2026**. Spieler, deren Q-TTR außerhalb der Klassengrenze liegt, dürfen nicht in dieser Klasse starten (außer nach Genehmigung der Turnierleitung).  
- **Jugend-Stichtag:**  
  In der Klasse Jugend 19 dürfen nur Spielerinnen und Spieler starten, die am **01.01.2008 oder später** geboren wurden.

---

## 🔗 Verwandte Dokumente  
- [Hauptübersicht & Zeitplan (README.md)](README.md)  
- [MKTT-Schritt-für-Schritt-Leitfaden](mktt_anleitung.md)  
- [Spielsysteme & Doppelkonkurrenzen](spielsysteme_doppel.md)  
- [click-TT Export-Anleitung](clicktt_export.md)  
- [Checkliste & Notfallkontakte](checkliste.md)  
