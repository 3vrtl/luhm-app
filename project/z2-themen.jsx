/* z2-themen.jsx — Übersichtszettel (Themen): ein Zettel, der auf eine Reihe anderer zeigt.
   Bei Luhmann der Einstieg in einen Strang. Hier bewusst sparsam gehalten. */

const SEED_HUBS = {
  "S": {
    titel: "Schreiben als Denken",
    leit: "Der Faden, an dem die Schreib-Zettel hängen — vom ersten Wort bis zur Form.",
    eintraege: ["1", "1/1", "1/1a", "5", "5/1"],
  },
  "G": {
    titel: "Gedächtnis & Kontingenz",
    leit: "Wie der Kasten erinnert — und warum jede Verbindung auch anders hätte ausfallen können.",
    eintraege: ["21", "21/1", "12", "12/1"],
  },
};

/* Themen, deren Eintragsliste diesen Zettel enthält (Rückrichtung) */
function hubsForNote(noteId, hubs) {
  return Object.keys(hubs || {}).filter((h) => (hubs[h].eintraege || []).includes(noteId));
}

/* optionale Kurztitel je Zettel — erscheinen dezent in der Kopfzeile */
const Z2_TITLES = {
  "1": "Schreiben als Werkzeug",
  "1/1": "Denken im Schreiben",
  "1/1a": "Schreibhemmung",
  "1/2": "Der Zettel antwortet",
  "5": "Form erzwingt Wahl",
  "5/1": "Reduktion ist Wahl",
  "12": "Kontingenz",
  "12/1": "Information als Differenz",
  "21": "Erinnern heißt zusammensetzen",
  "21/1": "Gedächtnis des Kastens",
};

Object.assign(window, { SEED_HUBS, hubsForNote, Z2_TITLES });
