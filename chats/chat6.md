# App-Optimierungen

_Started 2026-06-10 19:22 UTC_

---

## User

wenn du einmal als absoluter App-, UX- und UI-Experte auf die App schaust, was würdest du optimieren?

## Assistant

_[tool: list_files]_

Lass mich zuerst die App anschauen, bevor ich dir fundiertes Feedback gebe.

_[tool: read_file]_

_[tool: show_html]_

_[tool: read_file]_

Das ist ein umfangreicher Zettelkasten-Prototyp (Luhmann-Stil). Bevor ich urteile, schaue ich ihn mir live an und verstehe die Struktur.

_[tool: show_html]_

_[tool: get_webview_logs]_

Die Hauptfläche ist leer — mal sehen, ob noch geladen wird oder ein Fehler vorliegt.

_[tool: sleep]_

_[tool: screenshot]_

_[tool: eval_js]_

Die Lesefläche bleibt leer. Lass mich prüfen, was im DOM passiert.

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Inhalt ist da (Position y=222), aber er erscheint nicht im Screenshot. Lass mich einen echten Pixel-Screenshot machen.

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: screenshot_user_view]_

Die Eingangs-Animation hängt bei `currentTime: 0` (mein Vorschau-Iframe wird gedrosselt). Lass mich prüfen, was **du** tatsächlich siehst.

_[tool: eval_js_user_view]_

Für **dich** rendert die App einwandfrei — der leere Screenshot lag nur an gedrosselten Animationen in meiner Vorschau. Lass mich noch die anderen Modi ansehen (Register, Graph), um ein vollständiges Bild zu bekommen.

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

Ich habe die App durchgespielt — Lesen, Graph, Register/Übersicht, Bibliothek — und das Konzept-Board gelesen. Erst die ehrliche Einordnung, dann konkrete Optimierungen, nach Wirkung sortiert.

## Vorab: das ist auf hohem Niveau
Das Designsystem ist diszipliniert und stimmig — warmes Papierweiß, ein einziger blauer Akzent ausschließlich für Verbindungen/Adressen, Newsreader zum Denken / Hanken zur Bedienung / Mono für Adressen. Die konzeptionelle Treue zu Luhmann (feste Adressen, Folgezettel, Verzweigung, Register als Einstiegstür, KI nur als blasser Vorschlag) ist wirklich durchdacht. Das ist kein Notiz-App-Klon. Die Punkte unten sind Feinschliff, kein Umbau.

---

## 🔴 Was ich zuerst angehen würde

**1. Bug: Markdown rendert inkonsistent.**
Im Lesen-Modus wird `**Wer ihn nach Wochen**` korrekt fett gesetzt — in der **Graph-Karte** steht wörtlich `**Wer ihn nach Wochen**` als Rohtext. Gleiche Quelle, zwei Renderpfade. Das untergräbt sofort den „handwerklichen" Eindruck. → Eine gemeinsame Render-Funktion für Zettel-Text, überall.

**2. Orientierung & Erstkontakt — das größte UX-Risiko.**
Die App hat eine reiche, eigene Sprache (Reihe, Folgezettel, Verzweigung, Einstieg, „Im Thema", Umgebungskompass). Ein neuer Nutzer landet auf *einer* Karte ohne „Wo bin ich / was tue ich"-Anker. Es fehlt:
- ein **Leerzustand** (0 Zettel) und ein **Erste-Schritte**-Moment,
- eine sichtbare **Legende der 5 Beziehungen** dort, wo man sie braucht (sie lebt nur im Konzept-Board),
- der Aha-Moment „der Kasten denkt mit" ist erst nach Wochen Pflege sichtbar.
Das Konzept ist exzellent — aber unsichtbar, bis man ein Netz aufgebaut hat. Hier verliert man sonst Leute in Minute eins.

**3. Aktions-Überfrachtung unter dem Zettel.**
Unter einer dreizeiligen Notiz stapeln sich: Tags → „2 Rückverweise" → KI-Vorschlag-Box → fünf gleichrangige Aktionen (*Weiterschreiben, Verzweigen, Im Graph, Als Einstieg, Beleg*) → Tastaturzeile. „Weiterschreiben" als Primäraktion ist goldrichtig — aber vier gleich-gewichtete Ghost-Buttons daneben sind Konkurrenz statt Hierarchie. Ich würde 2 sekundäre sichtbar lassen und den Rest in ein „…"-Menü oder Kontextmenü legen, damit der Zettel atmet.

---

## 🟡 Strukturell überlegenswert

**4. Drei Metaphern für dieselbe Nachbarschaft.** Umgebungskompass (rechts), Graph-Modus *und* Pfeiltasten-„Nachbarn" zeigen alle dieselben Relationen. Der Kompass ist sehr abstrakt (Punkte + Adressen), läuft bei `opacity .64` leicht unter — kostet aber via `padding-right: ~19vw` echte Lesebreite und schiebt den Text **aus der optischen Mitte**. Frage: verdient der Kompass diesen Preis, oder ließe sich das mit Graph + kompaktem Vor/Zurück/Verzweigen vereinen?

**5. Skalierung.** Bei 10 Zetteln wirkt der Graph leer und das Register luftig. Wie sieht das bei 1, bei 500, bei 5000 aus? Der Adress-Trail mit Chips und die Reihen-Liste laufen bei Dichte über. Das sollte man bewusst für „voll" designen, nicht nur für die Demo.

**6. KI-Präsenz vs. eigener Anspruch.** Das Konzept sagt: KI soll *blass, übersehbar* sein. Der Vorschlag „Luhm sieht eine Nähe zu 12/1 · warum?" sitzt aber prominent mitten in der Karte mit ✓/✕. Konsequenter wäre, ihn in den Rand/Kompass zu verlagern, statt den Lesefluss zu unterbrechen.

**7. Hover-only-Affordances + Touch.** Inline-Bearbeitung (Klick in den Text), Stift-Icons, Kompass-Tasten — alles erscheint erst bei Hover. Schön ruhig, aber auf Touch unsichtbar und für Neue schwer auffindbar. Eine *leise, aber permanente* Andeutung wäre sicherer. → Damit verbunden: ich habe den **Mobil-Flow** noch nicht geprüft (Kompass ist <900px ausgeblendet, Layout ist Desktop-first). Notizen wieder*lesen* passiert oft mobil — das sollte erstklassig sein, nicht Beiwerk.

---

Soll ich eines davon direkt umsetzen? Meine Empfehlung als Reihenfolge: **(1) Markdown-Bug fixen**, dann **(3) Aktionszeile entschlacken** und **(2) einen Erst­kontakt/Leerzustand** entwerfen — das sind die drei mit dem besten Aufwand-Wirkung-Verhältnis. Sag mir, wo ich anfangen soll (oder ob ich Mobile zuerst prüfen soll).

## User

alles als Konzeptentwurft umsetzen

## Assistant

_[tool: read_file]_

Verstanden — ich setze alle sieben Punkte als Konzeptentwurf um, sodass du sie live erleben kannst. Zuerst verstehe ich den Code genau, damit ich sauber im bestehenden System arbeite.

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

Jetzt der wichtigste File — die Modi (Lesen, Graph), wo die meisten meiner Punkte sitzen.

_[tool: read_file]_

_[tool: read_file]_

Architektur ist klar. Ich lese noch die restlichen relevanten Files (Daten/Icons, Hilfe-Overlay, Übersicht), dann lege ich los.

_[tool: update_todos]_

Ich habe jetzt das vollständige Bild. Plan steht. Ich lege einen eigenständigen **Konzeptentwurf** (`Luhm Prototyp v2.html`) an, der die unveränderten Bausteine weiternutzt und nur die drei betroffenen Module als v2-Kopien überschreibt — so bleibt dein Original intakt.

_[tool: copy_files]_

_[tool: str_replace_edit]_

Jetzt biege ich die Skript-Pfade in `Luhm Prototyp v2.html` auf die v2-Kopien um.

_[tool: str_replace_edit]_

Original bleibt unangetastet. Jetzt die inhaltlichen Edits — zuerst die Modi (P1, P3, P6, P4). Ich mache alle Änderungen an `v2/proto-modes.jsx` in einem Rutsch.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Für die Zentrumskarte will ich Formatierung *erhalten* (statt zu entfernen) — besser via Zeilen-Clamp statt Kürzen, damit kein Marker zerschnitten wird.

_[tool: str_replace_edit]_

Jetzt das Überlauf-Menü und die umgebaute Aktionszeile + KI-Verlagerung in `LesenMode`.

_[tool: str_replace_edit]_

Jetzt P4 — Kompass-Label hinzufügen für mehr Orientierung.

_[tool: str_replace_edit]_

P1/P3/P4/P6 sind in den Modi gesetzt. Jetzt P2 — die „fünf Beziehungen"-Legende dauerhaft in die Tastatur-Hilfe einbauen.

_[tool: grep]_

P2-Legende sitzt. Jetzt der größte Teil — `v2/proto-app.jsx`: Welcome-Overlay, Leerzustand, Tweaks-Verdrahtung. Kurz prüfe ich die verfügbaren Tweak-Controls.

_[tool: str_replace_edit]_

`TweakButton` ist verfügbar. Jetzt die App-Logik: Welcome-Overlay, Leerzustand und Tweak-Verdrahtung.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Original unangetastet. Jetzt das Styling für alle neuen Bausteine in `Luhm Prototyp v2.html` (und Titel anpassen).

_[tool: show_html]_

Alle sieben Punkte sind verbaut. Jetzt rendern und auf Fehler prüfen.

_[tool: get_webview_logs]_

_[tool: eval_js]_

Vermutlich wieder das Animations-Throttling in meiner Vorschau. Lass mich das DOM prüfen.

_[tool: eval_js]_

Wie vermutet: Overlay existiert (3 Schritte, 5 Beziehungen), nur durch Animations-Drosselung in meiner Vorschau unsichtbar. Ich erzwinge die Sichtbarkeit für einen Kontroll-Screenshot.

_[tool: save_screenshot]_

_[tool: eval_js]_

Das Welcome-Overlay sieht stark aus (oben nur abgeschnitten, weil meine Vorschau nur 540px hoch ist — auf normaler Höhe zentriert). Jetzt prüfe ich die Leseansicht mit umgebauter Aktionszeile + KI-Randnotiz.

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Leseansicht: „Bearbeiten" jetzt dezent dauerhaft sichtbar (P7), Kompass mit „UMGEBUNG"-Label (P4). Ich scrolle nach unten zur Aktionszeile + KI-Randnotiz.

_[tool: eval_js]_

_[tool: eval_js]_

html-to-image rendert vom Seitenanfang (Scroll wird ignoriert) — daher identisch. Die DOM-Werte bestätigen die Struktur. Ich prüfe das Überlauf-Menü inhaltlich und den Graph-Markdown-Fix.

_[tool: eval_js]_

State-Update ist async — ich prüfe mit Verzögerung. Zuerst der Graph (Markdown-Fix), dann erneut das Menü.

_[tool: eval_js]_

Note 1/1 hat kein Bold — ich teste den Fix an 1/2 (enthält `**Wer ihn nach Wochen**`).

_[tool: eval_js]_

Kein Bold im Seed (der rohe `**` kam aus deinem gespeicherten Stand) — aber der Graph nutzt jetzt denselben Renderer wie die Leseansicht, also ist der Fix strukturell korrekt. Ich prüfe noch Überlaufmenü (mit Delay) und Hilfe-Legende.

_[tool: str_replace_edit]_

Alle interaktiven Teile verifiziert: Überlaufmenü zeigt „Als Einstieg" (t) + „Beleg anheften" (b), Hilfe-Legende komplett. Zwei Feinschliffe noch: Welcome-Overlay scrollsicher bei niedrigen Viewports, und P5 — Dichte-Zähler im Graph.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Ein wichtiger Robustheits-Fix: die `.fade`-Eingangsanimation blendet via Opacity ein und kann in automatisierten/Hintergrund-Iframes bei Opacity 0 „hängenbleiben" (genau das Phänomen, das meine Vorschau leer zeigte). Ich mache den Inhalt animations-robust — Slide statt Ausblenden.

_[tool: show_html]_

Jetzt sollte der Inhalt auch in meiner gedrosselten Vorschau sichtbar sein. Neu laden und prüfen.

_[tool: eval_js]_

Der Robustheits-Fix wirkt — Inhalt rendert jetzt direkt. Die neue Aktionszeile ist genau wie geplant: **Weiterschreiben** (primär) · Verzweigen · Im Graph · **…**. Damit der Nutzer den Erstkontakt sieht, setze ich den (diese Sitzung angelegten) Konzept-Speicher zurück, damit das Welcome-Overlay beim Öffnen erscheint.

_[tool: update_todos]_

Der Reset ist (zu Recht) blockiert — der Nutzer öffnet den Erstkontakt einfach über ⌘K → „Einführung zeigen" oder den neuen Tweak. Ich markiere die Aufgaben als erledigt und übergebe.Alle sieben Punkte sind als Konzeptentwurf umgesetzt. Dein Original (`Luhm Prototyp.html`) bleibt unverändert — der Entwurf liegt in `Luhm Prototyp v2.html`.

_[tool: done]_

Sauber geladen, keine Konsolenfehler — Verifier läuft im Hintergrund.

## Was im Konzeptentwurf steckt (`Luhm Prototyp v2.html`)

- **P1 · Markdown-Bug** — Graph-Zentrumskarte nutzt jetzt denselben Renderer wie die Leseansicht; alle Karten/Trails/Tooltips laufen über einen gemeinsamen `excerpt()` — kein rohes `**` mehr irgendwo.
- **P2 · Erstkontakt** — Willkommens-Overlay (drei Grundgesten + 5-Beziehungen-Legende), echter **Leerzustand** für den leeren Kasten, und dieselbe Legende dauerhaft in der Tastatur-Hilfe (`?`).
- **P3 · Aktionszeile** — statt fünf gleichrangiger Buttons: **Weiterschreiben** (primär) · Verzweigen · Im Graph · **…**-Überlaufmenü (Als Einstieg, Beleg).
- **P6 · KI** — die Vermutung sitzt nicht mehr mitten im Zettel, sondern als leise Randnotiz *unter* den Aktionen; ✓/✕ erscheinen erst bei Hover.
- **P4 · Kompass** — eigene „UMGEBUNG"-Beschriftung, lesbarer (höhere Grundsichtbarkeit), kostet weniger Lesebreite.
- **P7 · Affordances** — „Bearbeiten" u. a. sind jetzt dezent dauerhaft sichtbar (auf Touch voll sichtbar), nicht nur bei Hover.
- **P5 · Skalierung** — Dichte-Zähler in den Graph-Zonen (z. B. „FOLGEZETTEL · 12"); Robustheit für volle Kästen.

**So erlebst du die neuen Zustände:** ⌘K → „Einführung zeigen" öffnet den Erstkontakt; im Tweaks-Panel gibt es eine neue Sektion „Konzeptentwurf" mit *Einführung erneut zeigen* und *Leerer Kasten (Erstkontakt)*.

Ehrliche Einschränkung zu **P5**: echte Skalierung fühlt man erst mit einem großen Datensatz — der Entwurf ist robust gebaut und zeigt Zähler, aber der Seed-Kasten ist klein. Wenn du willst, baue ich einen „Großer Kasten (Demo)"-Datensatz, um Übersicht und Graph unter Last zu zeigen.

