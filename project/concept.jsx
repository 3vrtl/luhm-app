/* concept.jsx — Konzept-Board: Haltung & Designsystem */

function PrincipleRow({ luh, dig }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr", alignItems: "start", gap: 0, padding: "18px 0", borderTop: "1px solid var(--line-soft)" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 18, lineHeight: 1.4, color: "var(--ink)" }}>{luh}</div>
      <div style={{ display: "flex", justifyContent: "center", paddingTop: 4, color: "var(--ink-ghost)" }}>
        <Ic.arrow style={{ width: 16, height: 16 }} />
      </div>
      <div style={{ fontSize: 14.5, lineHeight: 1.55, color: "var(--ink-soft)", paddingTop: 1 }}>{dig}</div>
    </div>
  );
}

function Swatch({ name, varname, val, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ height: 52, borderRadius: 8, background: `var(${varname})`, border: "1px solid var(--line)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{name}</span>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ink-faint)" }}>{val}</span>
      </div>
    </div>
  );
}

function LegendRow({ cls, name, desc, dashed, hollow }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", borderTop: "1px solid var(--line-soft)" }}>
      <div style={{ width: 56, flex: "0 0 56px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className={"reldot " + cls} style={{ transform: "scale(1.6)" }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{name}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 1 }}>{desc}</div>
      </div>
    </div>
  );
}

function ConceptBoard() {
  return (
    <div style={{ background: "var(--paper)", width: "100%", height: "100%", padding: "60px 72px 70px", display: "flex", flexDirection: "column" }}>

      {/* Masthead */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", borderBottom: "2px solid var(--ink)", paddingBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 64, fontWeight: 400, lineHeight: 0.9, letterSpacing: "-0.02em", color: "var(--ink)" }}>Luhm</div>
          <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 21, color: "var(--ink-soft)", marginTop: 12 }}>Ein Zettelkasten, der mitdenkt.</div>
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="seclabel">Konzept</span>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>Designsystem · v0.1 · Juni 2026</span>
        </div>
      </div>

      {/* Intro */}
      <p style={{ fontFamily: "var(--serif)", fontSize: 20, lineHeight: 1.55, color: "var(--ink)", maxWidth: 720, margin: "34px 0 0" }}>
        Luhmann nannte seinen Zettelkasten einen <em>Kommunikationspartner</em>. Nicht ein Speicher,
        sondern ein Gegenüber, das antwortet. Luhm überträgt diese Haltung — nicht die Holzkästen.
        Die Maschine ordnet nicht für dich. Sie merkt sich, was du verbindest, und schlägt — <span style={{ color: "var(--accent-ink)" }}>dezent</span> — vor,
        was du übersehen hast.
      </p>

      {/* Haltung */}
      <div style={{ marginTop: 52 }}>
        <span className="seclabel">01 · Die Haltung</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 22px 1fr", gap: 0, margin: "20px 0 4px", fontSize: 11, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-ghost)" }}>
          <span>Luhmanns Prinzip</span><span /><span>Heute übersetzt</span>
        </div>
        <PrincipleRow luh="Ein Gedanke pro Zettel." dig="Karten bleiben kurz. Wird ein Zettel zu groß, schlägt Luhm das Teilen vor — Reduktion als Standardgeste." />
        <PrincipleRow luh="Fortlaufende Nummerierung statt Themen-Ordnern." dig="Jeder Zettel bekommt eine feste Adresse (21/3a). Sie ändert sich nie — der Ort eines Gedankens bleibt auffindbar." />
        <PrincipleRow luh="Der Folgezettel führt einen Gedanken weiter." dig="„Weiterschreiben“ hängt einen Zettel direkt an (21/3a → 21/3a1). Reihen entstehen, ohne dass man sie plant." />
        <PrincipleRow luh="Verzweigung spaltet Nebenstränge ab." dig="Ein Nebengedanke wird zum eigenen Ast (21/3b), statt den Hauptstrang zu verwässern." />
        <PrincipleRow luh="Querverweise verbinden Entferntes." dig="Freie Verweise zwischen beliebigen Zetteln. Hier, und nur hier, hilft die KI: sie schlägt Nähe vor, du entscheidest." />
        <PrincipleRow luh="Das Register kennt nur Einstiegspunkte." dig="Schlagworte zeigen nicht alles — sie öffnen ein, zwei Türen. Von dort folgst du den Spuren selbst." />
      </div>

      {/* System */}
      <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
        <div>
          <span className="seclabel">02 · Schrift</span>
          <div style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 30, color: "var(--ink)" }}>Newsreader</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>Zettel-Text · zum Lesen & Denken</div>
          </div>
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <div style={{ fontFamily: "var(--sans)", fontSize: 26, fontWeight: 600, color: "var(--ink)" }}>Hanken Grotesk</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>Oberfläche · Etiketten & Navigation</div>
          </div>
          <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <div className="mono" style={{ fontSize: 24, fontWeight: 500, color: "var(--accent-ink)" }}>21/3a1</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 4 }}>JetBrains Mono · die Adressen der Zettel</div>
          </div>
        </div>

        <div>
          <span className="seclabel">03 · Farbe</span>
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Swatch name="Papier" varname="--paper" val="oklch .99" />
            <Swatch name="Tinte" varname="--ink" val="oklch .26" />
            <Swatch name="Verbindung" varname="--accent" val="oklch .52 250" />
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 22 }}>
            Warmes Papierweiß, fast-schwarze Tinte, <span style={{ color: "var(--accent-ink)", fontWeight: 600 }}>ein</span> Akzent —
            das Tinten-Blau steht ausschließlich für Verbindungen und Adressen. Sonst nichts ist bunt.
            KI-Vorschläge bekommen <em>keine</em> eigene Farbe; sie erscheinen gestrichelt und blass, damit
            der Mensch sie übersieht, wenn er will.
          </p>
        </div>
      </div>

      {/* Verbindungs-Legende */}
      <div style={{ marginTop: 50 }}>
        <span className="seclabel">04 · Die fünf Beziehungen</span>
        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 56 }}>
          <div>
            <LegendRow cls="vor" name="Vorgänger" desc="Der Zettel, aus dem dieser hervorging." />
            <LegendRow cls="folge" name="Folgezettel" desc="Führt den Gedanken in gerader Linie fort." />
            <LegendRow cls="verzweig" name="Verzweigung" desc="Ein Nebenast, der eigenständig wird." />
          </div>
          <div>
            <LegendRow cls="verweis" name="Verweis" desc="Freier Querverweis zu Entferntem." />
            <LegendRow cls="ki" name="KI-Vorschlag" desc="Gestrichelt. Eine Vermutung, kein Befehl." />
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />
      <div style={{ marginTop: 44, paddingTop: 18, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-faint)" }}>
        <span>Luhm · Konzeptstudie</span>
        <span className="mono">→ Hauptansicht, Register & Mobile rechts daneben</span>
      </div>
    </div>
  );
}

window.ConceptBoard = ConceptBoard;
