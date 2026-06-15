# Digitaler Zettelkasten

_Started 2026-06-04 09:31 UTC_

---

## User

Wie könnte ein App aussehen, die sich an Niklas Luhmann's Zettelkasten orientiert, aber auf die heutige digitale Welt gedacht ist

## Assistant

_[tool: questions_v2]_

Eine schöne Aufgabe — der Zettelkasten ist ein faszinierendes System, und die spannende Designfrage ist, *welche* seiner Prinzipien man digital übersetzt (Verlinkung, fortlaufende Nummerierung/Folgezettel, Verzweigungen, der „Kommunikationspartner"-Gedanke) und welche man bewusst neu denkt.

Bevor ich loslege, möchte ich ein paar Dinge klären, damit das Ergebnis wirklich zu deiner Vorstellung passt. Ich habe noch keinen Kontext (Design-System, Codebase, Referenzen) — du kannst gerne welche über das Import-Menü anhängen, ansonsten kläre ich die Richtung über ein paar Fragen:

## User

Questions answered:
- platform: Beides (responsive)
- fidelity: Konzept + ein paar Schlüssel-Screens
- core_principles: Verlinkung / Querverweise zwischen Zetteln, Folgezettel & fortlaufende Nummerierung, Verzweigungen (Gedanken aufspalten), Zettel als Gesprächspartner / Emergenz neuer Ideen, Bewusste Reduktion: ein Gedanke pro Zettel, Schlagwort-Register (Index)
- ai_role: Mischung — dezent
- vibe: Klar & modern — viel Weißraum, minimalistisch
- main_view: Fokus auf einen Zettel + seine Nachbarn
- variations: Ja, mehrere Varianten zum Vergleichen
- language: Deutsch

## Assistant

_[tool: copy_starter_component]_

_[tool: copy_starter_component]_

_[tool: update_todos]_

Danke — das ist eine klare Richtung. Ich fasse zusammen, was ich daraus baue:

**Konzept:** *Luhm* — ein digitaler Zettelkasten, der Luhmanns Logik (Folgezettel-Nummerierung, Verzweigung, Querverweise, der Zettel als Gesprächspartner, *ein Gedanke pro Zettel*, Schlagwortregister) ernst nimmt, aber für heute denkt. KI bleibt **dezent**: sie schlägt nur Verbindungen vor (das, was Luhmann manuell tat), das Denken bleibt beim Menschen. Zentrale Ansicht = **ein Zettel + seine Nachbarn**. Ästhetik: klar, modern, viel Weißraum. Deutsch, responsive.

Ich liefere ein **Konzept-Board** (Haltung + Designsystem) plus **mehrere Varianten der Hauptansicht** zum Vergleichen, ein **Register** und einen **Mobile-Screen** — alles auf einer Canvas nebeneinander.

Lass mich die Bausteine holen und loslegen.

_[tool: write_file]_

Beide Bausteine sind da. Ich lege das Designsystem als CSS-Token-Set an und baue die Screens in mehreren kleinen JSX-Dateien. Zuerst die Shell mit Schrift- und Farbsystem:

_[tool: write_file]_

Jetzt die gemeinsamen Bausteine (Daten, Icons, Karten):

_[tool: write_file]_

Jetzt das Konzept-Board — Haltung + Designsystem als gestaltetes Dokument:

_[tool: write_file]_

Jetzt die Hauptscreens und die Canvas-Montage:Lass mich das Ergebnis prüfen:

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Konzept-Board sieht gut aus. Lass mich Konsole prüfen und die anderen Artboards verifizieren:

_[tool: eval_js]_

Keine Fehler. Lass mich die Hauptansicht-Varianten visuell prüfen — ich verschiebe die Canvas zu den Focus-Artboards:

_[tool: eval_js]_

_[tool: grep]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Alle drei Varianten rendern. Lass mich Variante B (räumlich, mit Linien) genauer prüfen:

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: update_todos]_

_[tool: done]_

Variante B (räumliche Nachbarschaft) sieht hervorragend aus — zentraler Zettel, umgebende Nachbarn, beschriftete Verbindungslinien, der KI-Vorschlag gestrichelt unten. Alles rendert sauber. Lass mich die Todos abschließen und an den Nutzer übergeben:

_[tool: fork_verifier_agent]_

Fertig. Du landest auf einer Pan/Zoom-Canvas mit allem nebeneinander.

**Luhm — ein Zettelkasten, der mitdenkt.** Was auf der Canvas liegt:

**Konzept-Board** — die Haltung als gestaltetes Dokument: jedes Luhmann-Prinzip (ein Gedanke pro Zettel, feste Nummern-Adressen, Folgezettel, Verzweigung, Querverweise, Register als Einstiegspunkte) heute übersetzt, plus das Designsystem (Newsreader fürs Lesen, Hanken Grotesk für die Oberfläche, Mono für die Adressen; *ein* Tinten-Blau für Verbindungen, KI immer nur gestrichelt-blass).

**Hauptansicht — 3 Varianten zum Vergleichen:**
- **A · Ruhiger Fokus** — Zettel zentral zum Lesen, Nachbarn als ruhige Spalte rechts, KI-Vermutung dezent abgesetzt.
- **B · Räumliche Nachbarschaft** — der Zettel im Zentrum, Nachbarn ringsum, beschriftete Verbindungslinien, der KI-Vorschlag als gestricheltes Geister-Kärtchen.
- **C · Zwiegespräch** — der „Kommunikationspartner"-Gedanke: der Zettel *spricht*, am Rand entstehen Antworten, die zu Folgezetteln werden; KI als leise Randnotiz.

**Register** (Schlagwort → nur Einstiegszettel) und **Mobile** (Fokus-Zettel im iPhone-Frame) runden es ab.

Die KI bleibt überall **dezent** — sie schlägt nur Verbindungen vor, das Denken bleibt bei dir.

Sag mir, welche Richtung der Hauptansicht dich am meisten anspricht — die kann ich dann zu einem **echten klickbaren Prototyp** ausbauen (Navigieren zwischen Zetteln, Weiterschreiben, Verzweigen). Soll ich außerdem den Moment des *Zettel-Erstellens* (Reduktion/Teilen-Geste) oder die Graph-Übersicht des ganzen Kastens dazunehmen?

## User

Mir gefällt B als optionale Sicht sehr gut. Das heißt, egal wofür wir uns entscheiden, sollte möglich sein, dass ich auf diese Graph-Ansicht umschalten kann. Was ist der Unterschied zwischen A und C?

## Assistant

Sehr gut — und das ist eine kluge Entscheidung: **B wird kein „Entweder-oder", sondern ein Modus.** Egal ob wir A oder C als Standard nehmen, oben gibt es einen Umschalter (z. B. *Lesen · Graph*), mit dem du jederzeit in die räumliche Graph-Ansicht von B springst und wieder zurück. Der Graph ist die *Übersicht*, A/C ist der *Arbeitsplatz am einzelnen Zettel*.

**Der Unterschied zwischen A und C ist die Grundhaltung — Lesen vs. Schreiben:**

**A · Ruhiger Fokus → konsumierend / navigierend**
- Der Zettel steht im Zentrum, *um gelesen zu werden*.
- Rechts liegen **alle** Nachbarn gleichberechtigt als ruhige Referenz-Liste (Vorgänger, Folgezettel, Verzweigung, Verweise, KI-Vermutung). Du überfliegst, klickst, bewegst dich weiter.
- Die Geste ist: *„Wo bin ich, was hängt hier dran, wohin als Nächstes?"* — du **wanderst** durch ein bestehendes Netz.
- KI sitzt still in der Seitenleiste, leicht zu ignorieren.

**C · Zwiegespräch → produzierend / dialogisch**
- Genau Luhmanns Idee vom Zettel als *Kommunikationspartner*: der alte Zettel **spricht**, du **antwortest**.
- Rechts ist keine Nachbarliste, sondern ein **Gesprächsrand**: deine Antwort wird direkt zum Folgezettel (21/3a → 21/3a2). Im Vordergrund steht der eine Strang, an dem du *gerade weiterdenkst* — die übrigen Verweise treten zurück.
- Die Geste ist: *„Was sagst du dazu — und was sage ich dir zurück?"* — du **schreibst** das Netz weiter.
- KI flüstert am Rand („Vor 3 Wochen hast du das Gegenteil notiert"), statt eine Liste anzubieten.

Kurz: **A ist die Bibliothek (durchsehen), C ist die Werkstatt (weiterschreiben).** B ist die Landkarte über beidem.

Eine ehrliche Möglichkeit wäre auch, **A und C gar nicht als Konkurrenten zu sehen**, sondern als zwei Zustände desselben Zettels: ruhig beim Ankommen (A), und sobald du „Weiterschreiben" drückst, klappt rechts der Zwiegespräch-Rand (C) auf. Dann hättest du im Prototyp **A als Lesemodus, C als Schreibmodus, B als Graph** — alle drei über denselben Zettel erreichbar.

Wie möchtest du weitermachen? Soll ich diese drei als *einen* zusammenhängenden, klickbaren Prototyp bauen (Lesen → Schreiben → Graph, umschaltbar), oder erst A vs. C noch schärfer als getrennte Richtungen ausarbeiten?

## User

okay, dann lass alle drei ansichten ermöglichen

## Assistant

_[tool: update_todos]_

Perfekt — dann baue ich daraus einen **echten, klickbaren Prototyp**: ein Zettel, drei umschaltbare Sichten (**Lesen** · **Schreiben** · **Graph**), echte Navigation zwischen den Zetteln, und „Weiterschreiben" legt wirklich einen Folgezettel an. Das Konzept-Board bleibt als separate Datei erhalten.

Lass mich die Todos setzen und die App bauen.Zuerst die Shell mit dem kompletten Token-System und Prototyp-spezifischem CSS:

_[tool: write_file]_

_[tool: write_file]_

Jetzt der Daten-Graph mit echten Relationen und den Navigations-Helfern:

_[tool: write_file]_

Jetzt die drei Modi (Lesen, Schreiben, Graph):

_[tool: write_file]_

Jetzt die App-Shell mit State, Persistenz und Modus-Umschalter:

_[tool: show_html]_

_[tool: get_webview_logs]_

Chrome rendert, aber der Inhalt fehlt — wahrscheinlich ein Fehler. Konsole prüfen:

_[tool: eval_js]_

_[tool: save_screenshot]_

Der Inhalt ist da — der Screenshot war nur zu früh. Nochmal:

_[tool: eval_js]_

Der Inhalt existiert im DOM (Eval bestätigt), aber die Entrance-Animation lässt den Screenshot-Renderer leer erfassen. Ich prüfe mit deaktivierter Animation:

_[tool: save_screenshot]_

_[tool: eval_js]_

Lesen-Modus rendert wunderschön (der Screenshot-Renderer überspringt nur die Entrance-Animation — im echten Browser läuft sie sauber). Jetzt prüfe ich Graph und Schreiben:

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Graph rendert, aber das radiale Layout nutzt eine veraltete Breite (Karten laufen rechts aus dem Bild) und der Modus-Schalter zeigt noch „Lesen". Lass mich messen:

_[tool: save_screenshot]_

Messung ist jetzt korrekt (862 breit, zentriert, „Graph" aktiv) — der frühere Screenshot war ein veralteter Frame. Frischer Screenshot:

_[tool: eval_js]_

Die Live-Messung ist korrekt — der Screenshot-Renderer skaliert den Viewport beim Erfassen anders, daher der Versatz. Ich prüfe die echten Kartenpositionen im DOM und mache das Layout zusätzlich robust gegen Überlauf:

_[tool: str_replace_edit]_

Jetzt sehe ich echten Überlauf (Karten `21/3b`, `9/8` laufen rechts raus) — das radiale Layout braucht Klammerung gegen die Ränder und saubere Radius-Deckel. Ich fixe das:

_[tool: show_html]_

Damit bleiben die Karten im Rahmen. Neu laden und live verifizieren:

_[tool: eval_js]_

_[tool: save_screenshot]_

Kein Überlauf mehr — alle Karten sitzen im Rahmen. Visueller Check:

_[tool: str_replace_edit]_

„Graph" ist jetzt korrekt aktiv. Im sehr niedrigen Vorschaufenster (480px) drängen sich die Knoten aber hinter die breite Fokus-Karte. Ich verteile die Knoten auf die Seiten (weg von der vertikalen Achse) und mache die Mittelkarte etwas schmaler — das skaliert auf jeder Höhe besser:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Viel besser — Knoten an den Seiten, Linien mit Etiketten fächern sauber auf. (Der Mittel-Versatz ist erneut nur der Screenshot-Renderer, der breiter erfasst; live ist alles zentriert.) Jetzt Schreiben-Modus + Anhängen-Flow testen:

_[tool: eval_js]_

Anhängen funktioniert: `21/3a2` wurde als echter Folgezettel erzeugt, erscheint im Thread, Toast bestätigt, nächste Adresse springt auf `21/3a3`, Feld geleert. Jetzt zurücksetzen und Schreiben-Modus sauber screenshotten:

_[tool: save_screenshot]_

_[tool: eval_js]_

_[tool: update_todos]_

Schreiben-Modus ist komplett: KI-Randnotiz, Antwort-Thread, Komposer mit nächster Adresse `21/3a2`. Alle drei Modi funktionieren samt Navigation und echtem Anhängen. Ich setze auf den sauberen Startzustand zurück und übergebe:

_[tool: done]_

_[tool: fork_verifier_agent]_

Fertig — der klickbare Prototyp steht. **Luhm Prototyp.html** ist ein echter, funktionierender Zettelkasten mit deinen drei umschaltbaren Sichten über *demselben* Zettel:

**Oben der Umschalter — Lesen · Schreiben · Graph:**
- **Lesen (A)** — Zettel zentral, Nachbarn als ruhige Spalte. Jede Nachbar-Karte ist klickbar und navigiert wirklich durch das Netz (~10 vernetzte Zettel). „Weiterschreiben" springt in den Schreiben-Modus.
- **Schreiben (C)** — der Zettel *spricht*, rechts der Gesprächsrand: deine Antwort wird zu einem **echten Folgezettel** (21/3a → 21/3a2, mit Luhmann-Nummerierung), erscheint im Thread, Toast bestätigt. KI flüstert dezent am Rand.
- **Graph (B)** — radiale Nachbarschaft mit beschrifteten Verbindungslinien; ein Knoten anklicken **re-zentriert** den Graphen animiert auf ihn.

**Echte App-Logik:** Navigation, Anhängen, Zustand (Zettel + Modus) übersteht den Reload, „Zurücksetzen" (✦ in der Leiste) stellt das Saat-Netz wieder her. Responsive: unter 900px stapeln sich die Spalten.

Das Konzept-Board mit den Varianten bleibt unter **index.html** erhalten.

Ein ehrlicher Hinweis: Im sehr niedrigen Vorschaufenster wirkt der Graph etwas gedrängt — auf einem normalen Bildschirm atmet er deutlich mehr.

Nächste mögliche Schritte, wenn du magst:
- **⌘K-Sprung** und **Register** real verdrahten (sind aktuell nur angedeutet)
- Den **„Neuen Zettel"**-Moment (Reduktion/Teilen-Geste) als eigenen Flow
- KI-Vorschläge per **Klick in echte Verweise** verwandeln (Annehmen/Verwerfen)

Soll ich einen davon angehen?

## User

Wie kann ich einen Zettel inhaltlich bearbeiten?

## Assistant

_[tool: read_file]_

Gute Frage — und der ehrliche Stand: **bisher konntest du den Text eines bestehenden Zettels gar nicht ändern.** Im Schreiben-Modus *hängst* du nur einen Folgezettel an (Luhmanns Logik: alte Zettel bleiben stehen, man antwortet ihnen). Aber für eine moderne App fehlt das direkte Bearbeiten — also baue ich es ein: **im Lesen-Modus den Zetteltext anklicken → direkt in-place editieren.**

Lass mich das ergänzen.

_[tool: read_file]_

_[tool: read_file]_

Jetzt baue ich In-place-Editing in `FocusZettelView` ein:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Jetzt `onSave` durch Lesen-Modus durchreichen:Jetzt den `editNote`-Handler in der App + `onEdit` an Lesen übergeben:

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Jetzt das CSS für den Bearbeiten-Button und die Klick-Affordanz am Text:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

Bearbeiten funktioniert: Text gespeichert, Toast „Zettel 21/3a gespeichert". Konsole prüfen + Editier-Zustand screenshotten:

_[tool: save_screenshot]_

_[tool: str_replace_edit]_

Funktioniert — aber ein echter Bug: nach dem Zurücksetzen zeigt der Editor noch den alten geänderten Text. Grund: `val` synchronisiert sich nicht, wenn sich der Notiztext ändert, ohne dass die ID wechselt. Ich fixe die Synchronisation:

_[tool: str_replace_edit]_

Und die Edit-Auslöser auf `startEdit` umstellen, damit immer der aktuelle Text geladen wird:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

Synchronisation gefixt — sauberer Ausgangstext, Bearbeitung greift korrekt. Zurücksetzen auf Saatzustand und übergeben:

_[tool: done]_

_[tool: fork_verifier_agent]_

Erledigt — Zettel lassen sich jetzt **inhaltlich bearbeiten**.

**So geht's (im Lesen-Modus):**
- Fahre über den Zetteltext oder die ID-Zeile → rechts erscheint **„Bearbeiten"** (Stift).
- Klick darauf **oder direkt in den Text** → er wird zum Editierfeld, das mit der aktuellen Höhe mitwächst.
- **Speichern** (oder **⌘↵**) übernimmt, **Abbrechen** (oder **Esc**) verwirft. Ein Toast bestätigt „Zettel … gespeichert".
- Die Änderung bleibt erhalten — beim Navigieren zu Nachbarn und zurück, und über den Reload hinweg.

Zwei Wege, einen Zettel weiterzuentwickeln — passend zu Luhmanns Logik:
- **Bearbeiten** = den Gedanken *selbst* korrigieren (moderne Ergänzung).
- **Weiterschreiben** (Schreiben-Modus) = den alten Zettel stehen lassen und ihm einen **Folgezettel** *antworten*.

Mögliche nächste Schritte: auch **Schlagworte editierbar** machen (anklicken, hinzufügen/entfernen), Bearbeiten ebenfalls im **Graph-Zentrum** anbieten, oder eine kleine **„zuletzt bearbeitet"-Markierung** am Zettel. Sag Bescheid, was du brauchst.

## User

ich würde gern zwischen den Nachbar-Zetteln einfach wechseln, indem ich mittels scrollen oder Pfeiltaste zwischen ihnen wechsle

## Assistant

_[tool: read_file]_

Sehr klares Mockup — danke! Ich baue **räumliche Navigation** im Lesen-Modus ein, die Luhmanns Struktur folgt:

- **↑** → Vorgänger · **↓** → Folgezettel (die Reihe rauf/runter)
- **→** → in die Verzweigung/Verweise springen
- **←** → zurück, woher du kamst (Verlauf)
- **Scrollen** (hoch/runter/seitlich) macht dasselbe

Dazu kleine Tasten-Hinweise an den Nachbar-Gruppen, damit es auffindbar ist. Los geht's:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Jetzt `onNav` an den Lesen-Modus übergeben:

_[tool: str_replace_edit]_

_[tool: read_file]_

Jetzt der Lesen-Modus: Wheel-Navigation, Tasten-Hinweise an den Gruppen und eine Hinweiszeile. Lass mich die aktuelle `LesenMode` und `NGroup` lesen:

_[tool: read_file]_

Jetzt füge ich einen Keycap-Helfer und die Tasten-Hinweise in `NGroup` ein:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Jetzt `LesenMode` mit Wheel-Navigation, Tasten-Hinweisen und Hinweiszeile:Jetzt das CSS für Keycaps und die Hinweiszeile:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: eval_js]_

_[tool: eval_js]_

_[tool: eval_js]_

↑↓← funktionieren exakt. Jetzt → (Verzweigung) und Scroll-Navigation testen:

_[tool: str_replace_edit]_

Alles funktioniert (→ Verzweigung, Scroll löst Navigation aus). Ein Detail: die Hinweis-Beschriftung sagt immer „Verzweigung", auch wenn → zu einem Verweis führt. Ich passe das Label an das echte Ziel an:

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: save_screenshot]_

_[tool: eval_js]_

Tasten-Hinweise erscheinen an den Gruppen („VORGÄNGER ↑", „VERWEISE →") und die Beschriftung stimmt jetzt („→ Verweis"). Keine Fehler. Ich setze auf den sauberen Startzettel zurück und übergebe:

_[tool: done]_

_[tool: fork_verifier_agent]_

Erledigt — du kannst jetzt **per Pfeiltasten und Scrollen** durch die Nachbar-Zettel wandern, genau nach deinem Mockup:

- **↑ / hochscrollen** → Vorgänger (die Reihe rauf)
- **↓ / runterscrollen** → Folgezettel (die Reihe runter)
- **→ / rechts scrollen** → in die Verzweigung bzw. den ersten Verweis
- **← / links scrollen** → zurück, woher du kamst (Navigations-Verlauf)

Damit es auffindbar ist: an den passenden Nachbar-Gruppen sitzen kleine **Tastenkappen** (↑ ↓ →), und unter den Aktions-Buttons läuft eine dezente Hinweiszeile mit den verfügbaren Richtungen. Die Hinweise passen sich pro Zettel an — fehlt z. B. ein Folgezettel, verschwindet das ↓.

Zwei bewusste Feinheiten:
- Das **rechte Nachbarn-Panel scrollt weiterhin normal** — die Navigation per Mausrad greift nur über der linken Lesefläche, mit kurzer Pause zwischen Sprüngen, damit ein Trackpad-Wisch nicht durch mehrere Zettel rauscht.
- Während du **schreibst oder einen Zettel bearbeitest**, sind die Pfeiltasten fürs Texteditieren reserviert (keine versehentliche Navigation).

Magst du noch, dass **→/←** durch *mehrere* Verweise eines Zettels durchzykeln (statt nur zum ersten), oder reicht „erster Verweis + Rest per Klick"?

## User

Ich würde aber gern in der Leseansicht ein kleines Hinweiselement am Rand des geöffneten Zettels sehen, damit ich weiß, wo ich lande, wenn ich hoch, runter, links oder rechts klicke bzw. scrolle.

## Assistant

_[tool: str_replace_edit]_

Gute Idee — viel direkter als eine Legende. Ich setze **kleine Richtungs-„Peek"-Chips an die vier Ränder der Lesefläche**, die jeweils Ziel-ID und Beziehung zeigen (und anklickbar sind). Die Hinweiszeile unten ersetze ich dadurch.

Zuerst den `backId` (das Ziel von „Zurück") aus der App durchreichen:

_[tool: str_replace_edit]_

Jetzt das CSS: die alte Hinweiszeile durch die Peek-Chips ersetzen:

_[tool: str_replace_edit]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: eval_js]_

_[tool: eval_js]_

Peeks erscheinen korrekt (oben/rechts/links, kein „unten" da `21/3a1` keinen Folgezettel hat). Ich navigiere zu `21/3a` mit Verlauf, damit alle vier Peeks sichtbar sind, und screenshotte:

_[tool: save_screenshot]_

_[tool: eval_js]_

Im sehr niedrigen Vorschaufenster (480px) überlappt der obere Peek den Text, weil der Zettel zentriert ist und die Höhe knapp ist. Auf normaler Höhe sitzt er sauber am Rand. Ich prüfe das, indem ich die App-Höhe temporär auf 820px setze:

_[tool: save_screenshot]_

_[tool: eval_js]_

Lass mich die echten Positionen der Peeks im DOM prüfen — sie scheinen im Screenshot nicht aufzutauchen:

_[tool: str_replace_edit]_

Gefunden: mein Peek-Breakpoint lag bei 980px, das Vorschaufenster ist 922px breit → Peeks waren ausgeblendet. Ich senke ihn auf 900px (passend zum Spaltenlayout):

_[tool: show_html]_

_[tool: eval_js]_

_[tool: save_screenshot]_

Jetzt sitzen alle vier Peeks korrekt an den Rändern. Screenshot:

## User

bitte fortsetzen

## Assistant

_[tool: snip]_

_[tool: snip]_

Die vier Peek-Chips sitzen jetzt an den Rändern. Ich setze auf den Startzettel zurück und übergebe:

_[tool: eval_js]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Erledigt — am Rand des geöffneten Zettels siehst du jetzt **vier kleine Richtungs-Chips**, die dir verraten, wo du landest:

- **oben** ↑ Vorgänger + Ziel-ID
- **unten** ↓ Folgezettel + Ziel-ID
- **rechts** → Verzweigung/Verweis + Ziel-ID
- **links** ← Zurück + die ID, von der du kamst

Jeder Chip ist **anklickbar** (gleiche Wirkung wie Pfeiltaste/Scrollen) und erscheint nur, wenn es in der Richtung wirklich ein Ziel gibt — fehlt z. B. ein Folgezettel, fehlt der untere Chip. Beim Überfahren schiebt sich der Chip leicht in seine Richtung, als kleine Bestätigung. Die alte Hinweiszeile ist dadurch ersetzt; die Tastenkappen an den Nachbar-Gruppen bleiben als zusätzliche Orientierung.

Ein Hinweis: In sehr niedrigen Fenstern können sich oberer/unterer Chip mit dem zentrierten Text überlappen — auf normaler Bildschirmhöhe sitzen sie frei in den Rändern.

Magst du, dass die Chips zusätzlich eine **kurze Textvorschau** des Ziel-Zettels beim Überfahren zeigen (Tooltip), oder soll es bei ID + Beziehung bleiben?

## User

Verifier agent check completed

## Assistant

The verifier confirmed the directional peek chips work correctly. Everything is in place — nothing further needed right now.

