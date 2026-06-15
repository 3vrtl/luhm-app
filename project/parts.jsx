/* parts.jsx — geteilte Bausteine: Daten, Icons, Zettel-Karten */

/* ----------------------------- Das Zettel-Netz ----------------------------- */
const NOTES = {
  "21/3":   { text: "Schreiben ist kein Protokoll des Denkens, sondern sein Werkzeug.", tags: ["Schreiben"] },
  "21/3a":  { text: "Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt. Der Zettel zwingt zur Entscheidung: dieser eine Gedanke, in diese eine Form. Was sich nicht aufschreiben lässt, war vielleicht nie ein Gedanke, sondern nur das Gefühl von einem.", tags: ["Schreiben", "Form", "Reduktion"] },
  "21/3a1": { text: "Stockt die Hand, stockt der Gedanke. Schreibhemmung ist selten ein Mangel an Worten — meist ein Mangel an einem klaren nächsten Schritt.", tags: ["Schreiben"] },
  "21/3b":  { text: "Der Zettel antwortet. Wer ihn nach Wochen wiederfindet, liest einen fremden Gedanken — und kann ihm widersprechen.", tags: ["Schreiben", "Gedächtnis"] },
  "9/8":    { text: "Jede Verbindung hätte auch anders ausfallen können. Genau das macht sie zur Information.", tags: ["Kontingenz"] },
  "17/2":   { text: "Erinnern heißt neu zusammensetzen, nicht abrufen.", tags: ["Gedächtnis"] },
  "4/1":    { text: "Wer zur Form zwingt, zwingt zur Entscheidung.", tags: ["Form", "Reduktion"] },
};

// Nachbarn des Fokus-Zettels 21/3a
const NEIGHBORS = {
  vor:      [{ id: "21/3",   rel: "Vorgänger" }],
  folge:    [{ id: "21/3a1", rel: "Folgezettel" }],
  verzweig: [{ id: "21/3b",  rel: "Verzweigung" }],
  verweis:  [{ id: "9/8",    rel: "Verweis" }, { id: "17/2", rel: "Verweis" }],
  ki:       [{ id: "4/1",    rel: "KI-Vorschlag" }],
};

const REL_META = {
  "Vorgänger":   { cls: "vor",      hint: "in der Reihe davor" },
  "Folgezettel": { cls: "folge",    hint: "führt den Gedanken fort" },
  "Verzweigung": { cls: "verzweig", hint: "spaltet einen Nebenstrang ab" },
  "Verweis":     { cls: "verweis",  hint: "freier Querverweis" },
  "KI-Vorschlag":{ cls: "ki",       hint: "Luhm vermutet eine Nähe" },
};

/* ----------------------------- Icons (stroke) ----------------------------- */
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
};

/* ----------------------------- Linke App-Leiste ----------------------------- */
function AppRail({ active = "cards" }) {
  const items = [
    { key: "search", Icon: Ic.search, label: "Suche" },
    { key: "cards",  Icon: Ic.cards,  label: "Zettel" },
    { key: "index",  Icon: Ic.index,  label: "Register" },
  ];
  return (
    <div className="rail">
      <div className="logo">L</div>
      {items.map(({ key, Icon }) => (
        <div key={key} className={"railbtn" + (active === key ? " active" : "")} title={key}>
          <Icon />
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div className="railbtn" title="Neuer Zettel" style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <Ic.plus />
      </div>
    </div>
  );
}

/* ----------------------------- Relations-Etikett ----------------------------- */
function RelTag({ rel }) {
  const meta = REL_META[rel] || { cls: "verweis" };
  return (
    <span className="reltag">
      <span className={"reldot " + meta.cls} />
      {rel}
    </span>
  );
}

/* ----------------------------- Nachbar-Karte ----------------------------- */
function NeighborCard({ id, rel, ghost = false, compact = false }) {
  const note = NOTES[id] || { text: "" };
  return (
    <div className={"ncard" + (ghost ? " ghost" : "")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span className="nid">{id}</span>
        <RelTag rel={rel} />
      </div>
      {!compact && <div className="ntext">{truncate(note.text, 96)}</div>}
    </div>
  );
}

function truncate(t, n) {
  if (t.length <= n) return t;
  return t.slice(0, n).replace(/\s+\S*$/, "") + " …";
}

Object.assign(window, {
  NOTES, NEIGHBORS, REL_META, Ic, AppRail, RelTag, NeighborCard, truncate,
});
