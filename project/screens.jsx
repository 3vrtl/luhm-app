/* screens.jsx — Hauptansichten (3 Varianten), Register, Mobile + Canvas-Montage */
const { useState } = React;

/* ============================================================ */
/*  Zentraler Zettel (wiederverwendet)                          */
/* ============================================================ */
function FocusZettel({ id = "21/3a", size = "lg" }) {
  const note = NOTES[id];
  const bodyFs = size === "lg" ? 27 : 21;
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="mono" style={{ fontSize: size === "lg" ? 30 : 24, fontWeight: 600, color: "var(--accent-ink)", letterSpacing: "-0.02em" }}>{id}</span>
        <span style={{ width: 1, height: 22, background: "var(--line)" }} />
        <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Reihe 21 · <span style={{ fontWeight: 600, color: "var(--ink-soft)" }}>Schreiben</span></span>
      </div>
      <p className="zettel-body" style={{ fontSize: bodyFs, lineHeight: 1.52, margin: "26px 0 0", textWrap: "pretty" }}>
        {note.text}
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
        {note.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
  );
}

function ActionBar() {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <span className="pill solid"><Ic.plus style={{ width: 15, height: 15 }} /> Weiterschreiben</span>
      <span className="pill"><Ic.branch style={{ width: 15, height: 15 }} /> Verzweigen</span>
      <span className="pill"><Ic.link style={{ width: 15, height: 15 }} /> Verweisen</span>
    </div>
  );
}

function TopBar({ trail = ["21", "21/3", "21/3a"] }) {
  return (
    <div className="topbar">
      <span className="crumb">
        {trail.map((t, i) => (
          <React.Fragment key={t}>
            {i > 0 && <span className="sep">/</span>}
            <span style={{ color: i === trail.length - 1 ? "var(--accent-ink)" : "var(--ink-faint)" }}>{t.split("/").pop()}</span>
          </React.Fragment>
        ))}
      </span>
      <div style={{ flex: 1 }} />
      <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ink-faint)" }}>
        <Ic.search style={{ width: 15, height: 15 }} /> Springe zu <span className="kbd">⌘K</span>
      </span>
    </div>
  );
}

/* ============================================================ */
/*  VARIANTE A · Ruhiger Fokus                                  */
/* ============================================================ */
function NeighborGroup({ label, items, ghost }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="seclabel" style={{ marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((n) => <NeighborCard key={n.id} id={n.id} rel={n.rel} ghost={ghost} />)}
      </div>
    </div>
  );
}

function FocusA() {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--paper)" }}>
      <AppRail active="cards" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, display: "flex", padding: "0", minHeight: 0 }}>
          {/* Lesefläche */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", minWidth: 0 }}>
            <FocusZettel />
            <div style={{ marginTop: 40 }}><ActionBar /></div>
          </div>
          {/* Nachbarn */}
          <div className="scrollcol" style={{ width: 372, flex: "0 0 372px", borderLeft: "1px solid var(--line)", background: "var(--panel)", padding: "30px 28px", overflowY: "auto" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 22 }}>
              <span style={{ fontFamily: "var(--serif)", fontSize: 19, color: "var(--ink)" }}>Nachbarn</span>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>5</span>
            </div>
            <NeighborGroup label="Vorgänger" items={NEIGHBORS.vor} />
            <NeighborGroup label="Folgezettel" items={NEIGHBORS.folge} />
            <NeighborGroup label="Verzweigung" items={NEIGHBORS.verzweig} />
            <NeighborGroup label="Verweise" items={NEIGHBORS.verweis} />
            <div style={{ marginTop: 30, paddingTop: 22, borderTop: "1px dashed var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Ic.spark style={{ width: 15, height: 15, color: "var(--ink-faint)" }} />
                <span className="seclabel">Luhm vermutet</span>
              </div>
              {NEIGHBORS.ki.map((n) => <NeighborCard key={n.id} id={n.id} rel={n.rel} ghost />)}
              <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                <span style={{ fontSize: 12.5, color: "var(--accent-ink)", fontWeight: 600, cursor: "pointer" }}>Verweis anlegen</span>
                <span style={{ fontSize: 12.5, color: "var(--ink-faint)", cursor: "pointer" }}>Verwerfen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  VARIANTE B · Räumliche Nachbarschaft                        */
/* ============================================================ */
function SpatialNode({ x, y, w, id, rel, ghost }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, zIndex: 2 }}>
      <NeighborCard id={id} rel={rel} ghost={ghost} />
    </div>
  );
}

function FocusB() {
  // Koordinaten im 1220 × 766 Raum
  const cCenter = { x: 610, y: 392 };
  const lines = [
    { to: { x: 470, y: 132 }, rel: "Vorgänger", cls: "vor" },
    { to: { x: 610, y: 648 }, rel: "Folgezettel", cls: "folge" },
    { to: { x: 188, y: 410 }, rel: "Verzweigung", cls: "verzweig" },
    { to: { x: 1000, y: 232 }, rel: "Verweis", cls: "verweis" },
    { to: { x: 1018, y: 520 }, rel: "Verweis", cls: "verweis" },
    { to: { x: 952, y: 666 }, rel: "KI", cls: "ki" },
  ];
  const strokeFor = (cls) => cls === "folge" ? "var(--accent)" : cls === "ki" ? "var(--ink-faint)" : cls === "vor" ? "var(--ink-ghost)" : "var(--ink-soft)";
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--paper)" }}>
      <AppRail active="cards" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <div style={{ position: "relative", width: 1220, height: 766, overflow: "hidden" }}>
          {/* Verbindungslinien */}
          <svg width="1220" height="766" style={{ position: "absolute", inset: 0, zIndex: 1 }}>
            {lines.map((l, i) => {
              const mx = (cCenter.x + l.to.x) / 2, my = (cCenter.y + l.to.y) / 2;
              return (
                <g key={i}>
                  <line x1={cCenter.x} y1={cCenter.y} x2={l.to.x} y2={l.to.y}
                    stroke={strokeFor(l.cls)} strokeWidth={l.cls === "folge" ? 1.6 : 1.2}
                    strokeDasharray={l.cls === "ki" ? "3 5" : "none"} opacity={l.cls === "ki" ? 0.7 : 0.55} />
                  <rect x={mx - 38} y={my - 10} width="76" height="20" rx="10" fill="var(--paper)" opacity="0.92" />
                  <text x={mx} y={my + 4} textAnchor="middle" fontFamily="var(--sans)" fontSize="10.5" fontWeight="600" letterSpacing="0.4" fill="var(--ink-faint)" style={{ textTransform: "uppercase" }}>{l.rel}</text>
                </g>
              );
            })}
          </svg>

          {/* Nachbarn */}
          <SpatialNode x={350} y={68} w={250} id="21/3" rel="Vorgänger" />
          <SpatialNode x={470} y={602} w={280} id="21/3a1" rel="Folgezettel" />
          <SpatialNode x={56} y={360} w={250} id="21/3b" rel="Verzweigung" />
          <SpatialNode x={876} y={178} w={250} id="9/8" rel="Verweis" />
          <SpatialNode x={892} y={470} w={250} id="17/2" rel="Verweis" />
          <SpatialNode x={830} y={622} w={244} id="4/1" rel="KI-Vorschlag" ghost />

          {/* Fokus-Zettel */}
          <div style={{ position: "absolute", left: 430, top: 292, width: 360, zIndex: 3 }}>
            <div style={{ background: "var(--paper)", border: "1.5px solid var(--ink)", borderRadius: 14, padding: "22px 24px", boxShadow: "0 24px 60px -28px oklch(0.3 0.04 250 / .4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--accent-ink)" }}>21/3a</span>
                <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 600 }}>IM FOKUS</span>
              </div>
              <p className="zettel-body" style={{ fontSize: 16, lineHeight: 1.5, margin: "14px 0 0", textWrap: "pretty" }}>
                {truncate(NOTES["21/3a"].text, 168)}
              </p>
              <div style={{ display: "flex", gap: 7, marginTop: 16 }}>
                {NOTES["21/3a"].tags.map((t) => <span key={t} className="tag" style={{ height: 22, fontSize: 11 }}>{t}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  VARIANTE C · Zwiegespräch (Zettel als Gesprächspartner)     */
/* ============================================================ */
function FocusC() {
  const [draft, setDraft] = useState("");
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--paper)" }}>
      <AppRail active="cards" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Stimme des Zettels */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px", minWidth: 0, borderRight: "1px solid var(--line)" }}>
            <span className="seclabel" style={{ marginBottom: 18 }}>Der Zettel sagt</span>
            <FocusZettel />
          </div>

          {/* Margin / Zwiegespräch */}
          <div className="scrollcol" style={{ width: 430, flex: "0 0 430px", background: "var(--panel)", padding: "30px 30px 24px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
            <span className="seclabel" style={{ marginBottom: 20 }}>Am Rand notiert</span>

            {/* KI Randnotiz – dezent */}
            <div style={{ display: "flex", gap: 11, marginBottom: 22 }}>
              <Ic.spark style={{ width: 16, height: 16, color: "var(--ink-faint)", flex: "0 0 16px", marginTop: 2 }} />
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--ink-soft)", fontStyle: "italic", fontFamily: "var(--serif)" }}>
                Vor drei Wochen hast du fast das Gegenteil notiert.
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginLeft: 6, fontStyle: "normal", fontFamily: "var(--mono)", fontSize: 12, color: "var(--accent-ink)", cursor: "pointer" }}>→ 17/2</span>
              </div>
            </div>

            {/* Eine Antwort, die bereits zum Folgezettel wurde */}
            <div style={{ borderLeft: "2px solid var(--accent-line)", paddingLeft: 16, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--accent-ink)", fontWeight: 600 }}>21/3a1</span>
                <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>deine Antwort · vor 3 Wochen</span>
              </div>
              <p className="zettel-body" style={{ fontSize: 16, lineHeight: 1.5, margin: 0, textWrap: "pretty" }}>{NOTES["21/3a1"].text}</p>
            </div>

            <div style={{ flex: 1 }} />

            {/* Antwortfeld → wird Folgezettel */}
            <div style={{ marginTop: 24, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Ic.reply style={{ width: 15, height: 15, color: "var(--ink-faint)" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>Antworten — wird zu Zettel <span className="mono" style={{ color: "var(--accent-ink)" }}>21/3a2</span></span>
              </div>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Widersprich. Frag nach. Denk weiter …"
                style={{ width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", fontFamily: "var(--serif)", fontSize: 16, lineHeight: 1.5, color: "var(--ink)", minHeight: 54 }} />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <span className="pill solid" style={{ opacity: draft ? 1 : 0.45 }}><Ic.plus style={{ width: 14, height: 14 }} /> Anhängen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  REGISTER · Schlagwort-Navigation                            */
/* ============================================================ */
const INDEX = [
  { w: "Aufmerksamkeit", n: 4 }, { w: "Form", n: 9 }, { w: "Gedächtnis", n: 6 },
  { w: "Kommunikation", n: 12 }, { w: "Komplexität", n: 7 }, { w: "Kontingenz", n: 5 },
  { w: "Reduktion", n: 8 }, { w: "Schreiben", n: 11, active: true },
];

function RegisterScreen() {
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "var(--paper)" }}>
      <AppRail active="index" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar"><span style={{ fontFamily: "var(--serif)", fontSize: 16, color: "var(--ink)" }}>Register</span><div style={{ flex: 1 }} /><span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--ink-faint)" }}><Ic.search style={{ width: 15, height: 15 }} /> Schlagwort suchen</span></div>
        <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
          {/* Schlagwortliste */}
          <div className="scrollcol" style={{ width: 300, flex: "0 0 300px", borderRight: "1px solid var(--line)", padding: "26px 20px", overflowY: "auto" }}>
            <span className="seclabel">A – Z</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 16 }}>
              {INDEX.map((k) => (
                <div key={k.w} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, cursor: "pointer", background: k.active ? "var(--accent-wash)" : "transparent" }}>
                  <span style={{ fontFamily: "var(--serif)", fontSize: 17, color: k.active ? "var(--accent-ink)" : "var(--ink)", fontWeight: k.active ? 500 : 400 }}>{k.w}</span>
                  <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>{k.n}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Detail */}
          <div style={{ flex: 1, padding: "44px 56px", minWidth: 0 }}>
            <div style={{ maxWidth: 600 }}>
              <span className="seclabel">Schlagwort</span>
              <h2 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 400, color: "var(--ink)", margin: "10px 0 0" }}>Schreiben</h2>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--ink-soft)", marginTop: 16 }}>
                Das Register zeigt nicht alle elf Zettel. Wie bei Luhmann öffnet es nur die <em>Einstiegspunkte</em> —
                von dort folgst du den Verweisen selbst. So bleibt das Suchen ein Denken, kein Filtern.
              </p>

              <div style={{ marginTop: 38 }}>
                <div className="seclabel" style={{ marginBottom: 16 }}>Einstiegszettel</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["21/3", "9/8"].map((id, i) => (
                    <div key={id} className="ncard" style={{ padding: "18px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="nid" style={{ fontSize: 15 }}>{id}</span>
                        <span style={{ fontSize: 11.5, color: "var(--ink-faint)" }}>{i === 0 ? "Anfang der Reihe 21" : "von außen verbunden"}</span>
                        <div style={{ flex: 1 }} />
                        <Ic.arrow style={{ width: 16, height: 16, color: "var(--ink-ghost)" }} />
                      </div>
                      <p className="zettel-body" style={{ fontSize: 17, lineHeight: 1.5, margin: "12px 0 0", textWrap: "pretty" }}>{NOTES[id].text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--ink-faint)" }}>
                <Ic.link style={{ width: 15, height: 15 }} />
                Von <span className="mono" style={{ color: "var(--accent-ink)" }}>21/3</span> aus erreichst du die ganze Reihe 21/3a → 21/3a1 → 21/3b.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  MOBILE                                                       */
/* ============================================================ */
function MobileScreen() {
  const chips = [
    { id: "21/3", rel: "Vorgänger", cls: "vor" },
    { id: "21/3a1", rel: "Folgezettel", cls: "folge" },
    { id: "21/3b", rel: "Verzweigung", cls: "verzweig" },
    { id: "9/8", rel: "Verweis", cls: "verweis" },
    { id: "17/2", rel: "Verweis", cls: "verweis" },
  ];
  return (
    <IOSDevice title="Luhm">
      <div style={{ height: "100%", background: "var(--paper)", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--accent-ink)" }}>21/3a</span>
            <span style={{ width: 1, height: 16, background: "var(--line)" }} />
            <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>Reihe 21 · Schreiben</span>
          </div>
          <p className="zettel-body" style={{ fontSize: 20, lineHeight: 1.5, margin: 0, textWrap: "pretty" }}>{NOTES["21/3a"].text}</p>
          <div style={{ display: "flex", gap: 7, marginTop: 18 }}>
            {NOTES["21/3a"].tags.map((t) => <span key={t} className="tag">{t}</span>)}
          </div>

          <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <div className="seclabel" style={{ marginBottom: 14 }}>Nachbarn · 5</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {chips.map((c) => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper)" }}>
                  <span className={"reldot " + c.cls} />
                  <span className="mono" style={{ fontSize: 13, color: "var(--accent-ink)", fontWeight: 500 }}>{c.id}</span>
                  <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>{c.rel}</span>
                  <div style={{ flex: 1 }} />
                  <Ic.arrow style={{ width: 15, height: 15, color: "var(--ink-ghost)" }} />
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 14px", border: "1px dashed var(--ink-ghost)", borderRadius: 10 }}>
                <Ic.spark style={{ width: 14, height: 14, color: "var(--ink-faint)" }} />
                <span className="mono" style={{ fontSize: 13, color: "var(--ink-faint)", fontWeight: 500 }}>4/1</span>
                <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>Luhm vermutet</span>
              </div>
            </div>
          </div>
        </div>
        {/* untere Aktionsleiste */}
        <div style={{ display: "flex", gap: 10, padding: "12px 22px 8px", borderTop: "1px solid var(--line)", background: "var(--panel)" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 46, borderRadius: 12, background: "var(--ink)", color: "var(--paper)", fontSize: 14, fontWeight: 600 }}>
            <Ic.plus style={{ width: 16, height: 16 }} /> Weiterschreiben
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 12, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
            <Ic.branch style={{ width: 18, height: 18 }} />
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 12, border: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-soft)" }}>
            <Ic.link style={{ width: 18, height: 18 }} />
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

/* ============================================================ */
/*  CANVAS-MONTAGE                                               */
/* ============================================================ */
function App() {
  return (
    <DesignCanvas>
      <DCSection id="konzept" title="Konzept" subtitle="Haltung & Designsystem — das Warum hinter Luhm">
        <DCArtboard id="concept" label="Konzept · Haltung & System" width={940} height={1480}><ConceptBoard /></DCArtboard>
      </DCSection>

      <DCSection id="haupt" title="Hauptansicht · ein Zettel & seine Nachbarn" subtitle="Drei Varianten zum Vergleichen — von ruhig bis dialogisch">
        <DCArtboard id="focus-a" label="A · Ruhiger Fokus" width={1280} height={820}><FocusA /></DCArtboard>
        <DCArtboard id="focus-b" label="B · Räumliche Nachbarschaft" width={1280} height={820}><FocusB /></DCArtboard>
        <DCArtboard id="focus-c" label="C · Zwiegespräch" width={1280} height={820}><FocusC /></DCArtboard>
      </DCSection>

      <DCSection id="weiter" title="Register & Mobile" subtitle="Schlagwort-Navigation und die responsive Ansicht">
        <DCArtboard id="register" label="Register · Einstiegszettel" width={1280} height={820}><RegisterScreen /></DCArtboard>
        <DCArtboard id="mobile" label="Mobile · Fokus-Zettel" width={460} height={900}><MobileScreen /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
