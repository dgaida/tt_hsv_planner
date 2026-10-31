# Anmeldung, Nachmeldung & 3-Schlangen-System

**Praxisleitfaden für die Anmeldung und Einlasskontrolle am Turniertag**
**Zurück zur Hauptübersicht:** [README.md](README.md)

---

## 💡 Grundprinzipien

1. **Bezahlt = Anwesend:**  
   - In MKTT existiert im Menü `Spielerinfo` die Spalte **Bezahlt**.  
   - Im Menü `Spieler` heißt dieselbe Spalte **Anwesend**.  
   - **Es handelt sich um denselben Status:** Wenn ein Spieler sein Startgeld bezahlt hat und anwesend ist, wird der Haken gesetzt. Spieler ohne Bezahlung/Haken dürfen **nicht** in die Auslosung einbezogen werden!  
2. **Startgeld pro Turnierklasse:**
   - Das Startgeld ist **für jede gestartete Turnierklasse separat** zu entrichten (Jugend: 5 €, Erwachsene: 10 €).
   - **Doppel:** Die Teilnahme am Doppel ist im Startgeld der jeweiligen Einzel-Turnierklasse **bereits enthalten** (es fällt kein zusätzliches Startgeld für Doppel an).
3. **Keine Startnummern:**
   - Es werden **keine Startnummern vergeben**. Startnummernfelder bleiben in MKTT leer.  
4. **Meldeschluss vor Ort:**
   - Exakt **30 Minuten** vor Beginn der jeweiligen Turnierklasse ist Vor-Ort-Meldeschluss. Nach diesem Zeitpunkt werden keine Anmeldungen mehr angenommen.  

---

## 👥 Das Schlangen- und Rechner-System vor Ort

Morgens beim großen Andrang gibt es **drei getrennte Schlangen** an drei Laptops, um Wartezeiten zu minimieren:
- **Laptop 1** wird morgens ebenfalls für die Anmeldung eingesetzt. Er übernimmt immer die **Turnierklasse, die als erstes am Tag startet** (Mo: Jugend 19; Di: Damen/Herren C; Mi: Damen/Herren D).
- **Laptop 2** übernimmt die Anmeldung der **anderen Konkurrenzen des Tages** (Mo: Damen/Herren F und B; Di: Damen/Herren E; Mi: Damen/Herren A).
- **Laptop 3** dient als separater **Nachmelde-Laptop** (Erfassung direkt in click-TT).

### Phasenwechsel von Laptop 1:
Sobald die erste Turnierklasse des Tages **ausgelost** wird (exakt 15 Minuten vor Turnierstart, also um 11:45 Uhr), wird **Laptop 1 aus der Anmeldung herausgenommen**. Die Auslosung und der gesamte weitere Spielbetrieb (Aufrufe, Tische, Ergebniseingabe) laufen auf Laptop 1.
Ab diesem Zeitpunkt übernimmt **Laptop 2** alle verbleibenden regulären Anmeldungen der späteren Turnierklassen allein.

```
Morgens (Phase 1: bis 11:45 Uhr vor Auslosung der 1. Klasse):

┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌──────────────────────────────┐
│          SCHLANGE 1          │  │          SCHLANGE 2          │  │          SCHLANGE 3          │
│ (Vorangemeldet 1. Klasse)    │  │ (Vorangemeldet Spätere Kl.)  │  │       (Nachmeldungen)        │
└──────────────┬───────────────┘  └──────────────┬───────────────┘  └──────────────┬───────────────┘
               │                                 │                                 │
               ▼                                 ▼                                 ▼
    ┌──────────────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
    │       LAPTOP 1       │          │       LAPTOP 2       │          │       LAPTOP 3       │
    │  (1. Klasse des Tages)│          │ (Spätere Klassen Tag)│          │ (click-TT Erfassung) │
    │                      │          │                      │          │                      │
    │ Mo: Jugend 19        │          │ Mo: D/H F & D/H B    │          │ 1. Spieler in        │
    │ Di: D/H C            │          │ Di: D/H E            │          │    click-TT erfassen │
    │ Mi: D/H D            │          │ Mi: D/H A            │          │ 2. Kein Geld kassier │
    │                      │          │                      │          │ 3. Laufzettel geben  │
    │ 1. Name prüfen       │          │ 1. Name prüfen       │          └──────────┬───────────┘
    │ 2. Startgeld kassier.│          │ 2. Startgeld kassier.│                     │
    │ 3. Haken "Anwesend"  │          │ 3. Haken "Anwesend"  │                     ▼
    └──────────┬───────────┘          └──────────────────────┘          Reiht sich je nach
               │                                                        Klasse in Schlange 1
               ▼ (ab 11:45 Uhr)                                         oder Schlange 2 ein
   ┌──────────────────────┐                                             (zur Bezahlung/Abgl.)
   │ LAPTOP 1 WIRD AUS DER│
   │ ANMELDUNG GENOMMEN:  │
   │ Auslosung 1. Klasse  │
   │ & Spielbetrieb läuft │
   └──────────────────────┘

Nach 11:45 Uhr (Phase 2: Laptop 1 im Spielbetrieb):
- Reguläre Anmeldungen laufen nur noch über Schlange / Laptop 2.
- Nachmeldungen weiterhin an Schlange / Laptop 3, anschließend Bezahlung an Laptop 2.
```

---

## 💻 Laptop 3: Erfassung von Nachmeldungen

- **Warum Laptop 3 und click-TT?**
  Wenn Nachmeldungen per Hand frei in MKTT getippt werden, stimmen Spielerkennungen und Vereinsnamen oft nicht exakt mit click-TT überein. Beim späteren XML-Export schlägt der Upload fehl. Daher werden Nachmelder **immer zuerst direkt in click-TT angelegt**.  
- **Wird an Laptop 3 bezahlt?**
  **NEIN!** An Laptop 3 erfolgt ausschließlich die Datenaufnahme in click-TT.
- **Ablauf für Nachmelder:**  
  1. Nachmelder geht zu **Schlange 3 (Laptop 3)**.
  2. Die Helfer an Laptop 3 loggen sich in den Vereinszugang von click-TT ein, öffnen das Turnier und tragen den Spieler in die gewünschte Konkurrenz ein.
  3. Der Nachmelder erhält einen Vermerk/Laufzettel und stellt sich an die reguläre Anmeldeschlange an (morgens vor 11:45 Uhr für die 1. Klasse an Laptop 1, für andere Klassen an Laptop 2; nach 11:45 Uhr immer an Laptop 2).
  4. Am jeweiligen Anmelde-Laptop bezahlt der Nachmelder das Startgeld (Jugend: 5 €, Erwachsene: 10 €).
  5. In MKTT wird der Menüpunkt `Spielerabgleich` aufgerufen und `click-TT Teilnehmerliste erneut importieren (direkt online)` ausgeführt.
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

- **Mehrfachstarts am selben Tag & Vor-Ort-Anmeldung:**
  - Ein zeitgleicher Parallelstart in zwei überlappenden Konkurrenzen ist **strikt untersagt**.
  - **Ein Spieler kann sich immer nur für eine einzige Turnierklasse auf einmal vor Ort anmelden!**
  - Ein Spieler darf an einem Tag erst dann in einer weiteren Turnierklasse starten, wenn sein vorheriges Turnier **vollständig beendet** ist (d. h. der Spieler hat **weder offene Einzel- noch offene Doppelspiele** mehr in der vorherigen Klasse).
  - Erst nachdem das vorherige Turnier für den Spieler komplett abgeschlossen ist, muss der Spieler **erneut zur Anmeldung kommen** und sich für die zweite Turnierklasse anmelden (Meldeschluss vor Ort von 30 Minuten vor Start der zweiten Klasse muss eingehalten sein!).
  - **Startgeld:** Für jede gestartete Turnierklasse muss das reguläre Startgeld bezahlt werden (Jugend 5 €, Erwachsene 10 €). Das Doppel ist in der jeweiligen Turnierklasse inklusive; für eine weitere Konkurrenz wird jedoch das volle Startgeld der zweiten Klasse fällig.
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
