/* proto-data.jsx — vernetzter Zettelkasten + Helfer + Icons */

const SEED_NOTES = {
  "1":    { text: "Schreiben ist kein Protokoll des Denkens, sondern sein Werkzeug.", tags: ["Schreiben"], reihe: "Schreiben" },
  "1/1":  { text: "Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt. Der Zettel zwingt zur Entscheidung: dieser eine Gedanke, in diese eine Form. Was sich nicht aufschreiben lässt, war vielleicht nie ein Gedanke, sondern nur das Gefühl von einem.", tags: ["Schreiben", "Form", "Reduktion"], reihe: "Schreiben" },
  "1/1a": { text: "Stockt die Hand, stockt der Gedanke. Schreibhemmung ist selten ein Mangel an Worten — meist ein Mangel an einem klaren nächsten Schritt.", tags: ["Schreiben"], reihe: "Schreiben" },
  "1/2":  { text: "Der Zettel antwortet. Wer ihn nach Wochen wiederfindet, liest einen fremden Gedanken — und kann ihm widersprechen.", tags: ["Schreiben", "Gedächtnis"], reihe: "Schreiben" },
  "5":    { text: "Wer zur Form zwingt, zwingt zur Entscheidung.", tags: ["Form", "Reduktion"], reihe: "Form" },
  "5/1":  { text: "Reduktion ist kein Verlust. Sie ist eine Entscheidung darüber, was zählt — und das Eingeständnis, dass nicht alles zählen kann.", tags: ["Reduktion", "Form"], reihe: "Form" },
  "12":   { text: "Jede Verbindung hätte auch anders ausfallen können. Genau das macht sie zur Information.", tags: ["Kontingenz"], reihe: "Kontingenz" },
  "12/1": { text: "Information ist eine Differenz, die einen Unterschied macht. Ein Zettel ohne Verweise unterscheidet nichts.", tags: ["Kontingenz", "Information"], reihe: "Kontingenz" },
  "21":   { text: "Erinnern heißt neu zusammensetzen, nicht abrufen.", tags: ["Gedächtnis"], reihe: "Gedächtnis" },
  "21/1": { text: "Das Gedächtnis des Kastens ist verlässlicher als meines — aber dümmer. Es vergisst nichts und versteht nichts. Deshalb braucht es mich.", tags: ["Gedächtnis"], reihe: "Gedächtnis" },
};

const SEED_LINKS = {
  "1":    { folge: ["1/1", "1/2"] },
  "1/1":  { vorg: "1", verzweig: ["1/1a"], verweis: ["12", "21"], ki: ["5"] },
  "1/1a": { vorg: "1/1", verweis: ["5"] },
  "1/2":  { vorg: "1", verweis: ["21"], ki: ["12/1"] },
  "5":    { folge: ["5/1"], verweis: ["12", "1/1"] },
  "5/1":  { vorg: "5", verweis: ["1/1"] },
  "12":   { folge: ["12/1"], verweis: ["5", "1/1"] },
  "12/1": { vorg: "12", verweis: ["1/2"] },
  "21":   { folge: ["21/1"], verweis: ["1/2", "1/1"] },
  "21/1": { vorg: "21", ki: ["1/1a"] },
};

const REL = {
  vor:      { label: "Vorgänger",    cls: "vor" },
  folge:    { label: "Folgezettel",  cls: "folge" },
  verzweig: { label: "Verzweigung",  cls: "verzweig" },
  verweis:  { label: "Verweis",      cls: "verweis" },
  ki:       { label: "KI-Vorschlag", cls: "ki" },
  beleg:    { label: "Beleg",        cls: "beleg" },
};

/* ===== Quellen & Highlights (Readwise-Import) ===== */
const SEED_SOURCES = {
  "src-ahrens":     { title: "Das Zettelkasten-Prinzip", author: "Sönke Ahrens",      kind: "book",    year: 2017 },
  "src-bateson":    { title: "Ökologie des Geistes",      author: "Gregory Bateson",   kind: "book",    year: 1972 },
  "src-luhmann":    { title: "Kommunikation mit Zettelkästen", author: "Niklas Luhmann", kind: "essay", year: 1981 },
  "src-weinberger": { title: "Too Big to Know",            author: "David Weinberger", kind: "article", year: 2011 },
};

// imported: ISO-Datum · ort: Seite/Kapitel · tags: aus Readwise
const SEED_HIGHLIGHTS = {
  "h-ahrens-1":     { src: "src-ahrens",     text: "Wer alles aufschreibt, was ihm wichtig erscheint, hält am Ende nur eine Sammlung in Händen — noch kein Denken.", ort: "S. 39 · Kap. 3", imported: "2026-05-26", tags: ["Schreiben", "Reduktion"] },
  "h-ahrens-2":     { src: "src-ahrens",     text: "Die eigentliche Arbeit beginnt erst, wenn aus der Literaturnotiz ein eigener Gedanke wird.", ort: "S. 44 · Kap. 3", imported: "2026-05-26", tags: ["Schreiben"] },
  "h-ahrens-3":     { src: "src-ahrens",     text: "Struktur entsteht nicht durch Ordnung von oben, sondern durch viele kleine Entscheidungen unterwegs.", ort: "S. 91 · Kap. 5", imported: "2026-05-31", tags: ["Form"] },
  "h-bateson-1":    { src: "src-bateson",    text: "Information ist ein Unterschied, der einen Unterschied macht.", ort: "S. 488", imported: "2026-05-29", tags: ["Information", "Kontingenz"] },
  "h-bateson-2":    { src: "src-bateson",    text: "Die Landkarte ist nicht das Gebiet; jede Beschreibung trifft bereits eine Auswahl.", ort: "S. 461", imported: "2026-05-29", tags: ["Form", "Reduktion"] },
  "h-bateson-3":    { src: "src-bateson",    text: "Wir denken in Geschichten, nicht in isolierten Daten.", ort: "S. 23", imported: "2026-06-02", tags: ["Gedächtnis"] },
  "h-luhmann-1":    { src: "src-luhmann",    text: "Der Zettelkasten ist ein Kommunikationspartner gerade deshalb, weil er anders erinnert als wir.", ort: "Abs. 4", imported: "2026-05-30", tags: ["Gedächtnis"] },
  "h-luhmann-2":    { src: "src-luhmann",    text: "Ohne Verweise verkommt jede Notiz zum Friedhof ihrer selbst.", ort: "Abs. 7", imported: "2026-05-30", tags: ["Kontingenz", "Information"] },
  "h-luhmann-3":    { src: "src-luhmann",    text: "Schreiben heißt, sich von sich selbst überraschen lassen zu können.", ort: "Abs. 11", imported: "2026-06-02", tags: ["Schreiben"] },
  "h-weinberger-1": { src: "src-weinberger", text: "Wissen wird zur Eigenschaft des Netzes, nicht mehr des einzelnen Knotens.", ort: "S. 17", imported: "2026-06-01", tags: ["Information"] },
  "h-weinberger-2": { src: "src-weinberger", text: "Das Klügste im Raum ist der Raum selbst.", ort: "S. 5", imported: "2026-06-01", tags: ["Information", "Gedächtnis"] },
};

// bereits verarbeitete Highlights: Zettel ← Belege (Provenienz)
const SEED_BELEGE = {
  "12/1": ["h-bateson-1"],
  "21/1": ["h-luhmann-1"],
  "1/1":  ["h-ahrens-2"],
};

/* gruppierte Nachbarn eines Zettels */
function neighborsOf(id, links) {
  const l = links[id] || {};
  return {
    vor:      l.vorg ? [{ id: l.vorg, rel: "vor" }] : [],
    folge:    (l.folge || []).map((x) => ({ id: x, rel: "folge" })),
    verzweig: (l.verzweig || []).map((x) => ({ id: x, rel: "verzweig" })),
    verweis:  (l.verweis || []).map((x) => ({ id: x, rel: "verweis" })),
    ki:       (l.ki || []).map((x) => ({ id: x, rel: "ki" })),
  };
}

/* flache, fürs Graph-Ringlayout sortierte Liste (Vorgänger oben → Folge unten) */
function flatNeighbors(g) {
  return [...g.vor, ...g.verzweig, ...g.verweis, ...g.ki, ...g.folge];
}

function countNeighbors(g) {
  return g.vor.length + g.folge.length + g.verzweig.length + g.verweis.length + g.ki.length;
}

/* nächste Folgezettel-Adresse (Luhmann-Alternation; Stammnummer/Schrägstrich) */
function incTrail(id) {
  const m = String(id).match(/^(.*?)([0-9]+|[a-z]+)$/i);
  if (!m) return id + "1";
  const head = m[1], tail = m[2];
  if (/[0-9]/.test(tail)) return head + (parseInt(tail, 10) + 1);
  return head + String.fromCharCode(tail.charCodeAt(tail.length - 1) + 1);
}
function nextChild(focus, links) {
  const kids = (links[focus] && links[focus].folge) || [];
  if (kids.length) return incTrail(kids[kids.length - 1]);
  // Stammnummer (noch ohne Schrägstrich) → erste Unterstelle: 21 → 21/1
  if (!String(focus).includes("/")) return focus + "/1";
  // sonst alternierend: endet auf Ziffer → Buchstabe, endet auf Buchstabe → Ziffer
  const last = focus[focus.length - 1];
  return /[0-9]/.test(last) ? focus + "a" : focus + "1";
}

/* eine Ebene tiefer (Verzweigung): Stammnummer → /1, sonst alternierend Ziffer↔Buchstabe */
function deeperChild(focus) {
  focus = String(focus);
  if (!focus.includes("/")) return focus + "/1";
  const last = focus[focus.length - 1];
  return /[0-9]/.test(last) ? focus + "a" : focus + "1";
}
/* nächste freie Adresse ab `addr`, indem das letzte Segment hochgezählt wird */
function freeAddr(addr, notes) { let a = addr; while (notes && notes[a]) a = incTrail(a); return a; }
/* Folgezettel: setzt die Reihe FORT (gleiche Ebene, nächste Zahl/Buchstabe = Geschwister).
   Von einer Stammnummer aus startet die Reihe mit der ersten Unterstelle. */
function nextFolge(focus, notes) {
  const base = String(focus).includes("/") ? incTrail(focus) : deeperChild(focus);
  return freeAddr(base, notes);
}
/* Verzweigung: öffnet einen Seitenast EINE EBENE TIEFER (Kind von focus). */
function nextVerzweig(focus, notes) {
  return freeAddr(deeperChild(focus), notes);
}

function truncate(t, n) {
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, "") + " …";
}

/* ===== Baum-Struktur: Eltern / Kinder / Geschwister =====
   Eine Adresse zerfällt in Segmente (1a1 → 1 · a · 1). Der Elternzettel ist die
   Adresse ohne das letzte Segment. Geschwister teilen denselben Elternzettel und
   werden alphabetisch/numerisch von links (a/1) nach rechts sortiert. */
function addrTokens(id) {
  return (String(id).match(/\d+|[a-z]+/gi) || []).map((t) => (/\d/.test(t) ? { n: parseInt(t, 10) } : { s: t.toLowerCase() }));
}
function cmpAddr(a, b) {
  const ta = addrTokens(a), tb = addrTokens(b);
  for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
    const x = ta[i], y = tb[i];
    if (!x) return -1;
    if (!y) return 1;
    if ("n" in x && "n" in y) { if (x.n !== y.n) return x.n - y.n; }
    else if ("s" in x && "s" in y) { if (x.s !== y.s) return x.s < y.s ? -1 : 1; }
    else return "n" in x ? -1 : 1;
  }
  return 0;
}
function parentOf(id, links) { return (links[id] && links[id].vorg) || null; }
function childrenOf(id, links, ids) { return ids.filter((k) => parentOf(k, links) === id).sort(cmpAddr); }
function siblingsOf(id, links, ids) { const p = parentOf(id, links); return ids.filter((k) => parentOf(k, links) === p).sort(cmpAddr); }
/* Gemeinsame Reihen-Navigation für Karte UND Pfeiltasten — konsistent mit der Übersicht.
   Die „Reihe" eines Zettels ist seine senkrechte Linie: bei einem Unterzettel
   [Eltern, …Geschwister], bei einer Stammnummer [Stamm, …Kinder]. Verzweigungen
   (eigene, tiefere Kinder) zweigen seitlich ab. */
/* Gemeinsame Reihen-Navigation für Karte UND Pfeiltasten — eine feste räumliche Struktur:
   SENKRECHT = Reihe (Folge): Vorgänger ↑ · Folgezettel ↓.
   WAAGERECHT = Verzweigungs-Tiefe: Eltern ← · Verzweigung →  (Verzweigung immer rechts
   ihres übergeordneten Zettels — und damit der übergeordnete immer links der Verzweigung). */
function reiheNav(focus, links, ids) {
  // Reihenkopf: nach oben laufen, solange die Verbindung eine Folge ist
  let head = focus;
  while (true) {
    const p = parentOf(head, links);
    if (p && relTo(p, head, links) === "folge") head = p; else break;
  }
  // Reihe = Kopf + seine Folge-Kinder (Geschwister einer Ebene), adresssortiert
  const folgeKids = (id) => childrenOf(id, links, ids).filter((k) => relTo(id, k, links) === "folge");
  const line = [head, ...folgeKids(head)];
  const i = line.indexOf(focus);
  const up = i > 0 ? line[i - 1] : null;
  const down = i >= 0 && i < line.length - 1 ? line[i + 1] : null;
  const moreUp = i - 2 >= 0 ? line[i - 2] : null;
  const moreDown = i + 2 < line.length ? line[i + 2] : null;
  // Eltern links — nur wenn der aktuelle Zettel selbst eine Verzweigung ist (Reihenkopf mit Verzweig-Eltern)
  const parent = parentOf(focus, links);
  const left = (focus === head && parent && relTo(parent, focus, links) === "verzweig") ? parent : null;
  // Verzweigungen rechts — die eigenen, tieferen Verzweig-Kinder
  const branches = childrenOf(focus, links, ids).filter((k) => relTo(focus, k, links) === "verzweig");
  return { line, up, down, moreUp, moreDown, left, branches, parent };
}
/* Beziehungstyp eines Kindes zum Elternzettel (für die Punktfarbe) */
function relTo(parent, child, links) {
  const l = links[parent] || {};
  if ((l.verzweig || []).includes(child)) return "verzweig";
  return "folge";
}

/* Icons */
const Ic = {
  search: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>,
  index:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" {...p}><path d="M4 6h16M4 12h16M4 18h10"/></svg>,
  cards:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="13" height="14" rx="2"/><path d="M19 8v9a2 2 0 0 1-2 2H8"/></svg>,
  plus:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  link:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>,
  branch: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="6" cy="6" r="2.4"/><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="9" r="2.4"/><path d="M6 8.4v7.2M6 12h6a3 3 0 0 0 3-3"/></svg>,
  spark:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4l1.4 4.6L18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4z"/></svg>,
  arrow:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  reply:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 7 4 12l5 5"/><path d="M4 12h11a5 5 0 0 1 5 5v1"/></svg>,
  read:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 6.5C10.5 5 8 4.5 4 5v13c4-.5 6.5 0 8 1.5 1.5-1.5 4-2 8-1.5V5c-4-.5-6.5 0-8 1.5z"/><path d="M12 6.5V20"/></svg>,
  write:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16.5 4.5l3 3L8 19l-4 1 1-4z"/><path d="M14 7l3 3"/></svg>,
  graph:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="2.6"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="7" r="2"/><circle cx="17" cy="18" r="2"/><path d="M10 11 6.5 7.5M14 11l3-2.5M13.5 13.5 16 16"/></svg>,
  close:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>,
  check:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5 10 17l9-10"/></svg>,
  book:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v14H6.5A1.5 1.5 0 0 0 5 18.5z"/><path d="M5 18.5A1.5 1.5 0 0 0 6.5 20H19"/></svg>,
  quote:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 6C6.5 7 5 9.3 5 12.5V18h5v-6H7.5C7.5 9 8.2 7.8 10 7zM19 6c-2.5 1-4 3.3-4 6.5V18h5v-6h-2.5C17.5 9 18.2 7.8 20 7z"/></svg>,
  sync:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/></svg>,
  inbox:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M4 13h4l1.2 2.2h5.6L16 13h4"/></svg>,
  plug:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 3v5M15 3v5"/><path d="M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v5"/></svg>,
  pin:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 16v4"/></svg>,
  layers: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3 3 8l9 5 9-5z"/><path d="M3 13l9 5 9-5"/></svg>,
  doc:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>,
  download: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v11"/><path d="M8 11l4 4 4-4"/><path d="M5 19h14"/></svg>,
  overview: (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>,
  books:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="4" y="5" width="3.6" height="15" rx="1"/><rect x="9.2" y="4" width="3.6" height="16" rx="1"/><path d="M15.4 6.2l3.3.7-2.6 13.3-3.3-.7z"/></svg>,
  gear:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>,
};

const MONTHS_DE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
function fmtDate(iso) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  return d.getDate() + ". " + MONTHS_DE[d.getMonth()];
}
const SRC_KIND_LABEL = { book: "Buch", essay: "Essay", article: "Artikel" };

/* Belege eines Zettels (Highlight-IDs) */
function belegeOf(noteId, belege) { return (belege && belege[noteId]) || []; }
/* Rückverweise: Zettel, die per Querverweis auf diesen hier zeigen
   (eingehende „verweis"-Kanten). Strukturkanten (Folge/Verzweigung) bleiben
   außen vor — die zeigt der Baum rechts. */
function backlinksOf(focus, links) {
  if (!focus || !links) return [];
  return Object.keys(links)
    .filter((id) => id !== focus && ((links[id] && links[id].verweis) || []).includes(focus))
    .sort(cmpAddr);
}
/* Zettel, die ein Highlight verarbeitet haben */
function notesForHighlight(hid, belege) {
  return Object.keys(belege || {}).filter((nid) => (belege[nid] || []).includes(hid));
}
function isVerarbeitet(hid, belege) { return notesForHighlight(hid, belege).length > 0; }
/* Highlights nach Quelle gruppieren, jeweils nach Importdatum absteigend */
function groupBySource(highlights) {
  const g = {};
  Object.keys(highlights).forEach((hid) => {
    const s = highlights[hid].src;
    (g[s] = g[s] || []).push(hid);
  });
  Object.values(g).forEach((arr) => arr.sort((a, b) => highlights[b].imported.localeCompare(highlights[a].imported)));
  return g;
}
/* neue eigenständige Zettel-Adresse: nächste freie Stammnummer (ohne Schrägstrich) */
function nextRootId(notes) {
  let max = 0;
  Object.keys(notes).forEach((id) => {
    if (String(id).includes("/")) return;
    const n = parseInt(id, 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return String(max + 1);
}

/* Stammnummer (Wurzel-Adresse) samt aller abhängigen Adressen umbenennen.
   Zieht Unterstellen (21/1 …), Verknüpfungen, Themen-Einstiege, Belege und die
   @-Verweise im Zetteltext konsistent mit. Liefert { notes, links, belege, hubs,
   map } oder null bei ungültiger/belegter Nummer. */
function renameStammnummer(state, oldRoot, newRoot) {
  oldRoot = String(oldRoot).trim();
  newRoot = String(newRoot).trim();
  if (!/^[0-9]+$/.test(newRoot)) return null;   // nur Ziffern erlaubt
  if (newRoot === oldRoot) return null;         // keine Änderung
  const { notes, links, belege = {}, hubs = {} } = state;
  if (!notes[oldRoot]) return null;             // Quelle ist keine Stammnummer
  if (notes[newRoot]) return null;              // Ziel-Stammnummer schon vergeben

  // betroffene Adressen: die Stammnummer selbst + alle ihre Unterstellen
  const map = {};
  Object.keys(notes).forEach((id) => {
    if (id.split("/")[0] === oldRoot) map[id] = newRoot + id.slice(oldRoot.length);
  });
  const m = (id) => (id != null && map[id]) || id;
  const mArr = (arr) => (arr ? arr.map(m) : arr);
  const reRef = /@([0-9][0-9a-z]*(?:\/[0-9a-z]+)*)/gi;

  const nNotes = {};
  Object.keys(notes).forEach((id) => {
    const note = notes[id];
    const text = (note.text || "").replace(reRef, (full, ref) =>
      map[ref.toLowerCase()] ? "@" + map[ref.toLowerCase()] : full);
    nNotes[m(id)] = text === note.text ? note : { ...note, text };
  });

  const nLinks = {};
  Object.keys(links).forEach((id) => {
    const l = links[id] || {};
    const o = {};
    if (l.vorg) o.vorg = m(l.vorg);
    if (l.folge) o.folge = mArr(l.folge);
    if (l.verzweig) o.verzweig = mArr(l.verzweig);
    if (l.verweis) o.verweis = mArr(l.verweis);
    if (l.ki) o.ki = mArr(l.ki);
    nLinks[m(id)] = o;
  });

  const nBelege = {};
  Object.keys(belege).forEach((id) => { nBelege[m(id)] = belege[id]; });

  const nHubs = {};
  Object.keys(hubs).forEach((hid) => {
    const h = hubs[hid];
    nHubs[hid] = { ...h, eintraege: (h.eintraege || []).map(m) };
  });

  return { notes: nNotes, links: nLinks, belege: nBelege, hubs: nHubs, map };
}

/* Einheitliche Tasten-Kappe: jedes Symbol in eigener, zentrierter Box mit Abstand.
   So sitzen kombinierte Kürzel (⌘↑) sauber ausgerichtet und mit genug Luft. */
function Kc({ k }) {
  const syms = Array.from(String(k));
  return (
    <i className="z2-kc">
      {syms.map((s, i) => <span key={i} className="z2-kc-s">{s}</span>)}
    </i>
  );
}

Object.assign(window, {
  SEED_NOTES, SEED_LINKS, REL, neighborsOf, flatNeighbors, countNeighbors,
  nextChild, incTrail, truncate, Ic, Kc,
  cmpAddr, parentOf, childrenOf, siblingsOf, relTo,
  SEED_SOURCES, SEED_HIGHLIGHTS, SEED_BELEGE, fmtDate, SRC_KIND_LABEL,
  belegeOf, backlinksOf, notesForHighlight, isVerarbeitet, groupBySource, nextRootId, renameStammnummer,
  deeperChild, nextFolge, nextVerzweig, reiheNav,
});
