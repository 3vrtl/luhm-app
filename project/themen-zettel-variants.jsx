/* themen-zettel-variants.jsx — drei Gestaltungsrichtungen für den Themen-Zettel,
   jeweils über einem echten Beispiel-Zettel im Lese-Kontext gezeigt. */

const ICimg = {
  layers: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>),
  write: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>),
  close: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  bookmark: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>),
  corner: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="9 10 4 15 9 20" /><path d="M20 4v7a4 4 0 0 1-4 4H4" /></svg>),
};

/* Ein echter Beispiel-Zettel, wie ihn der Lese-Modus rendert. */
function SampleZettel({ id = "1", reihe = "Schreiben", text = "Schreiben ist kein Protokoll des Denkens, sondern sein Werkzeug.", tags = ["Schreiben"], dim }) {
  return (
    <div style={{ opacity: dim ? 0.92 : 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="mono" style={{ fontSize: 30, fontWeight: 600, color: "var(--accent-ink)", letterSpacing: "-0.02em" }}>{id}</span>
        <span style={{ width: 1, height: 22, background: "var(--line)" }} />
        <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Reihe · <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>{reihe}</span></span>
      </div>
      <p className="serif" style={{ fontSize: 27, lineHeight: 1.5, color: "var(--ink)", margin: "22px 0 0", fontWeight: 400, letterSpacing: "-0.005em", textWrap: "pretty" }}>{text}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 26 }}>
        {tags.map((t) => (<span key={t} className="tag">{t}</span>))}
      </div>
      <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px solid var(--line-soft)" }}>
        <div className="seclabel" style={{ marginBottom: 12 }}>Folgezettel</div>
        <div className="ncard">
          <div className="nid mono">1a</div>
          <div className="ntext serif">Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt.</div>
        </div>
      </div>
    </div>
  );
}

const SHELL = { background: "var(--paper)", height: "100%", padding: "34px 46px 40px", display: "flex", flexDirection: "column" };

/* ============================================================
   ECHTER DIGITALER ZETTEL — eine ernsthafte Übersetzung der
   Luhmann-Karte: keine Überschrift, kein Thema. Feste Stelle,
   dichter Text mit Verweisen im Satz, Verweisapparat am Fuß
   (Folge / Verzweigung / Verweis), Thema nur als Rückverweis.
   ============================================================ */
function BareSlip() {
  return (
    <div style={{ ...SHELL, justifyContent: "center" }}>
      <div className="z-card">
        {/* Kopf: links das Register-Schlagwort, rechts die feste Stelle */}
        <div className="z-head">
          <div className="z-kw">
            <span className="z-kwlbl">Reihe</span>
            <span className="z-kwval">Schreiben</span>
          </div>
          <div className="z-addrwrap">
            <span className="z-addr mono">1a</span>
            <span className="z-addrcap">feste Stelle</span>
          </div>
        </div>

        <div className="z-body serif">
          <p>Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt. Der Zettel zwingt zur Entscheidung: dieser eine Gedanke, in diese eine Form. Was sich nicht aufschreiben lässt, war vielleicht kein Gedanke, sondern eine Stimmung.</p>
          <p>Die Hand stockt, wo der Anschluss fehlt — nicht, wo das Wort fehlt <span className="z-ref">→ 1a1</span>. Dass die Form erzwingt, was zählt, ist keine Einschränkung, sondern die eigentliche Leistung <span className="z-ref">vgl. 2</span>.</p>
        </div>

        {/* Verweisapparat — die eigentliche Intelligenz des Zettels */}
        <div className="z-app">
          <div className="z-applbl">Verweise</div>
          <div className="z-grid">
            <div className="z-grp"><span className="reldot vor" /><span className="z-grplbl">Vorgänger</span><span className="z-num mono">1</span></div>
            <div className="z-grp"><span className="reldot folge" /><span className="z-grplbl">Folge</span><span className="z-num mono">1a1</span></div>
            <div className="z-grp"><span className="reldot verzweig" /><span className="z-grplbl">Verzweigung</span><span className="z-num mono">1b</span></div>
            <div className="z-grp"><span className="reldot verweis" /><span className="z-grplbl">Verweis</span><span className="z-num mono">2 · 3 · 4</span></div>
          </div>
        </div>

        {/* Thema = Rückverweis, kein Kopf. Bleibt am Rand. */}
        <div className="z-backlink">
          <ICimg.corner style={{ width: 12, height: 12, transform: "scaleX(-1)" }} />
          <span>Register-Einstieg für <span className="z-bltitle">„Schreiben als Denkwerkzeug"</span></span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   A · LUHMANN-TREU — Reiter als Schwelle, nicht als Mappe.
   Kein Meta-Leitsatz, Adresse sichtbar, mehrere gleichwertige
   Einstiege, Rahmen tritt beim Lesen zurück.
   ============================================================ */
function VariantALuhmann() {
  return (
    <div style={SHELL}>
      <div className="al-wrap">
        {/* Schwelle: Reiter sitzt auf einer Haarlinie, kein umschließender Kasten */}
        <div className="al-threshrow">
          <span className="al-eyebrow">Im Thema</span>
          <span className="al-title serif">Schreiben als Denkwerkzeug</span>
          <span className="al-flex" />
          <span className="al-ptr">
            <span className="al-ptrlabel">Einstieg</span>
            <ICimg.corner style={{ width: 13, height: 13, color: "var(--accent-ink)", transform: "scaleX(-1)" }} />
            <span className="mono al-addr">1</span>
          </span>
          <span className="al-vline" />
          <div className="al-actions">
            <button className="al-ghost" title="Thema bearbeiten"><ICimg.write style={{ width: 13, height: 13 }} /></button>
            <button className="al-ghost" title="Thema verlassen"><ICimg.close style={{ width: 14, height: 14 }} /></button>
          </div>
        </div>
        <div className="al-rule" />
        {/* gleichwertige Einstiege — nach Hierarchie geordnet, nicht nach „Wichtigkeit" */}
        <div className="al-alts">
          <span className="al-altlabel">Weitere Einstiege</span>
          <button className="al-door mono">1b</button>
          <button className="al-door al-door-add">+ Einstieg</button>
        </div>

        <div className="al-zettel">
          <SampleZettel />
        </div>

        {/* der Reiter tritt beim Weiterlesen zur Spur zurück */}
        <div className="al-trace">
          <span className="al-tracedot" />
          <span>Beim Weiterlesen bleibt nur die Spur — die Verweise führen, nicht der Rahmen.</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   A · REGISTER-REITER — der Zettel ist hinter einem Karteireiter abgelegt.
   ============================================================ */
function VariantA() {
  return (
    <div style={SHELL}>
      <div className="va-wrap">
        {/* Reiter */}
        <div className="va-tabrow">
          <div className="va-tab">
            <ICimg.bookmark style={{ width: 13, height: 13, color: "var(--accent-ink)" }} />
            <span className="va-tabtitle serif">Schreiben als Denkwerkzeug</span>
          </div>
          <div className="va-tabactions">
            <button className="va-ghost" title="Thema bearbeiten"><ICimg.write style={{ width: 13, height: 13 }} /></button>
            <button className="va-ghost" title="Thema verlassen"><ICimg.close style={{ width: 14, height: 14 }} /></button>
          </div>
        </div>
        {/* Karteikarte */}
        <div className="va-card">
          <div className="va-leit serif">Wie das Aufschreiben das Denken nicht protokolliert, sondern erzeugt.</div>
          <div className="va-divide" />
          <SampleZettel />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   B · FADEN — eine Randspalte/ein Faden führt durch das Thema.
   ============================================================ */
function VariantB() {
  return (
    <div style={SHELL}>
      <div className="vb-wrap">
        <div className="vb-spine" />
        <div className="vb-body">
          <div className="vb-head">
            <div className="vb-eyebrow">
              <span className="vb-kicker">Im Thema</span>
              <span className="vb-dot" />
              <span className="vb-reihe">Reihe Schreiben</span>
              <div style={{ flex: 1 }} />
              <button className="vb-ghost" title="Thema bearbeiten"><ICimg.write style={{ width: 13, height: 13 }} /> Bearbeiten</button>
              <button className="vb-ghost vb-x" title="Thema verlassen"><ICimg.close style={{ width: 14, height: 14 }} /></button>
            </div>
            <div className="vb-title serif">Schreiben als Denkwerkzeug</div>
            <div className="vb-leit serif">Wie das Aufschreiben das Denken nicht protokolliert, sondern erzeugt.</div>
          </div>
          <div className="vb-zettel">
            <SampleZettel />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   C · LEITSATZ-KOPF — typografischer Kopf, kein Container.
   ============================================================ */
function VariantC() {
  return (
    <div style={SHELL}>
      <div className="vc-wrap">
        <div className="vc-toprow">
          <span className="vc-eyebrow">Im Thema</span>
          <span className="vc-rule" />
          <span className="vc-reihe mono">Reihe · Schreiben</span>
          <div style={{ flex: 1 }} />
          <button className="vc-ghost" title="Thema bearbeiten"><ICimg.write style={{ width: 13, height: 13 }} /> Bearbeiten</button>
          <button className="vc-ghost vc-x" title="Thema verlassen"><ICimg.close style={{ width: 15, height: 15 }} /></button>
        </div>
        <h1 className="vc-title serif">Schreiben als Denkwerkzeug</h1>
        <p className="vc-leit serif">Wie das Aufschreiben das Denken nicht protokolliert, sondern erzeugt.</p>
        <div className="vc-hr" />
        <SampleZettel />
      </div>
    </div>
  );
}

window.ThemenVariants = { VariantA, VariantALuhmann, VariantB, VariantC, BareSlip };
