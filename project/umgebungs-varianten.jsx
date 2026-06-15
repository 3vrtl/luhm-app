/* ============================================================
   UMGEBUNGS-BAUM — Varianten (rechts angedockt, feste Grundform)
   Jede Variante bekommt ein Zettel-Objekt:
     { id, reihe, vor, folge:[], verzweig:[] }
   Entscheidend: der aktuelle Zettel sitzt an fester Stelle,
   Slots für Vorgänger/Folge/Verzweigung bleiben reserviert —
   die Form springt beim Wechsel nicht.
   ============================================================ */

/* zwei Beispiel-Zettel: einer reich verknüpft, einer karg.
   Eine stabile Variante muss bei beiden gleich „sitzen". */
const NB_RICH   = { id: "1a",  reihe: "Schreiben", vor: "1",  folge: ["1a1"], verzweig: ["1b", "1c"] };
const NB_SPARSE = { id: "2c",  reihe: "Lesen",     vor: "2b", folge: [],      verzweig: [] };

/* ---- gemeinsamer Mock-Rahmen: ruhiger Zettel links, Karte rechts ---- */
function ReadingFrame({ z, children }) {
  return (
    <div className="uv-frame">
      <div className="uv-paper">
        <div className="uv-zhead">
          <div className="uv-zkw"><span className="uv-zkwl">Reihe</span><span className="uv-zkwv">{z.reihe}</span></div>
          <div className="uv-zaddr mono">{z.id}</div>
        </div>
        <div className="uv-zbody">
          <span style={{ width: "96%" }} /><span style={{ width: "100%" }} /><span style={{ width: "92%" }} />
          <span style={{ width: "98%" }} /><span style={{ width: "70%" }} />
        </div>
      </div>
      {children}
    </div>
  );
}

/* ============================================================
   1 · FESTE SPUR — vertikale Schiene rechts.
   Aktueller Zettel immer mittig; Vorgänger oben, Folge unten
   (leere Slots als zarte Geister), Verzweigungen als Ticks links.
   ============================================================ */
function MapSpur({ z }) {
  const Slot = ({ n, cls, ghost }) =>
    n ? (
      <button className="sp-node" title={n}><span className={"reldot " + cls} /><span className="sp-addr mono">{n}</span></button>
    ) : (
      <span className="sp-node ghost"><span className="sp-tick" /><span className="sp-addr mono">—</span></span>
    );
  return (
    <ReadingFrame z={z}>
      <div className="uv-dock uv-spur">
        <Slot n={z.vor} cls="vor" />
        <div className="sp-line" />
        <div className="sp-currow">
          {z.verzweig.length > 0 && (
            <div className="sp-branches">
              {z.verzweig.map((v) => (
                <span key={v} className="sp-branch"><span className="sp-elbow" /><span className="sp-baddr mono">{v}</span></span>
              ))}
            </div>
          )}
          <span className="sp-node cur"><span className="sp-dotcur" /><span className="sp-addr mono">{z.id}</span></span>
        </div>
        <div className="sp-line" />
        <Slot n={z.folge[0]} cls="folge" />
      </div>
    </ReadingFrame>
  );
}

/* ============================================================
   2 · KOMPASS — festes Kreuz rechts.
   Mitte = aktuell, ↑ Vorgänger, ↓ Folge, ← Verzweigung.
   Jeder Arm immer da (gedimmt, wenn leer) → springt nie.
   ============================================================ */
function MapKompass({ z }) {
  const Arm = ({ n, dir, cls }) => (
    <span className={"kp-arm kp-" + dir + (n ? "" : " empty")} title={n || ""}>
      <span className="kp-k">{dir === "up" ? "↑" : dir === "down" ? "↓" : "←"}</span>
      {n ? <span className="kp-addr mono"><span className={"reldot " + cls} />{n}</span> : <span className="kp-addr mono dim">—</span>}
    </span>
  );
  return (
    <ReadingFrame z={z}>
      <div className="uv-dock uv-kompass">
        <Arm n={z.vor} dir="up" cls="vor" />
        <div className="kp-mid">
          <Arm n={z.verzweig[0]} dir="left" cls="verzweig" />
          <span className="kp-cur"><span className="kp-dotcur" /><span className="kp-curaddr mono">{z.id}</span></span>
        </div>
        <Arm n={z.folge[0]} dir="down" cls="folge" />
        {z.verzweig.length > 1 && <span className="kp-more">+{z.verzweig.length - 1}</span>}
      </div>
    </ReadingFrame>
  );
}

/* ============================================================
   3 · REGISTER-LEISTE — feste, beschriftete Zeilen rechts.
   Immer dieselben vier Zeilen; leere zeigen „—".
   Am ausdrücklichsten, am ruhigsten lesbar.
   ============================================================ */
function MapLeiste({ z }) {
  const Row = ({ label, cls, items, cur }) => (
    <div className={"ls-row" + (cur ? " cur" : "")}>
      <span className="ls-label">{label}</span>
      <span className="ls-vals">
        {cur ? (
          <span className="ls-val cur"><span className="ls-dotcur" />{z.id}</span>
        ) : items.length ? (
          items.map((n, i) => (
            <React.Fragment key={n}>
              {i > 0 && <span className="ls-sep">·</span>}
              <span className="ls-val mono"><span className={"reldot " + cls} />{n}</span>
            </React.Fragment>
          ))
        ) : (
          <span className="ls-val dim mono">—</span>
        )}
      </span>
    </div>
  );
  return (
    <ReadingFrame z={z}>
      <div className="uv-dock uv-leiste">
        <Row label="Vorgänger"   cls="vor"      items={z.vor ? [z.vor] : []} />
        <Row label="Dieser"      cur />
        <Row label="Folge"       cls="folge"    items={z.folge} />
        <Row label="Verzweigung" cls="verzweig" items={z.verzweig} />
      </div>
    </ReadingFrame>
  );
}

/* jede Variante zweimal: reich + karg, untereinander → Stabilität sichtbar */
function VariantPair({ Map }) {
  return (
    <div className="uv-pair">
      <div className="uv-cell"><span className="uv-celltag">verzweigt · 1a</span><Map z={NB_RICH} /></div>
      <div className="uv-cell"><span className="uv-celltag">karg · 2c</span><Map z={NB_SPARSE} /></div>
    </div>
  );
}

function SpurPair()    { return <VariantPair Map={MapSpur} />; }
function KompassPair() { return <VariantPair Map={MapKompass} />; }
function LeistePair()  { return <VariantPair Map={MapLeiste} />; }

window.UmgebungVarianten = { SpurPair, KompassPair, LeistePair };
