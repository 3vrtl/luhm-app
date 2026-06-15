/* z2-settings.jsx — Einstellungen als Vollflächen-Panel (über ⌘K oder ⌘,).
   Thematisch gruppiert (Konto · Design · Daten & Speicher), Sektionen als
   Akkordeon. Volle Tastatur-Bedienung: ↑/↓ wandern, → klappt auf, ← klappt ein,
   ↵ schaltet/​wählt, Esc schließt. Schrift & Papierton wirken live auf das Fenster. */

const { useState: useSetS, useRef: useSetR, useEffect: useSetE } = React;

/* Die drei Lesetypen der Schreibfläche */
const Z2_FONTS = [
  { key: "grotesk", name: "Grotesk",        meta: "Hanken Grotesk · klar & modern",  stack: "'Hanken Grotesk', system-ui, sans-serif", sample: "'Hanken Grotesk', sans-serif", size: 21 },
  { key: "serif",   name: "Serif",          meta: "Source Serif · ruhig & literarisch", stack: "'Source Serif 4', Georgia, serif",     sample: "'Source Serif 4', serif",     size: 21 },
  { key: "mono",    name: "Schreibmaschine", meta: "JetBrains Mono · fokussiert",      stack: "'JetBrains Mono', ui-monospace, monospace", sample: "'JetBrains Mono', monospace", size: 18 },
];
const fontStackOf = (key) => (Z2_FONTS.find((f) => f.key === key) || Z2_FONTS[0]).stack;
const fontNameOf  = (key) => (Z2_FONTS.find((f) => f.key === key) || Z2_FONTS[0]).name;

/* Papierton: t=0 warmes Karteikarten-Papier … t=1 reines Weiß */
function paperVars(t) {
  const L = (a, b) => (a + (b - a) * t).toFixed(4);
  return {
    "--paper":     `oklch(${L(0.968, 1.0)} ${L(0.016, 0)} 86)`,
    "--paper-2":   `oklch(${L(0.948, 0.992)} ${L(0.018, 0)} 84)`,
    "--paper-top": `oklch(${L(0.958, 0.997)} ${L(0.018, 0)} 85)`,
    "--line":      `oklch(${L(0.885, 0.905)} ${L(0.012, 0)} 82)`,
    "--line-soft": `oklch(${L(0.925, 0.945)} ${L(0.010, 0)} 84)`,
  };
}
const paperLabel = (t) => (t < 0.04 ? "warm · 100 %" : (t > 0.96 ? "weiß · 100 %" : `${100 - Math.round(t * 100)} % warm`));

/* kleine Icon-Sammlung fürs Panel */
const Si = {
  gear:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/></svg>,
  type:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 7V5h16v2M9 19h6M12 5v14"/></svg>,
  contrast:(p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>,
  sync:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/></svg>,
  folder:  (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>,
  user:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>,
  chev:    (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  close:   (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>,
};

const SECTIONS = [
  { key: "account",     group: "Konto",            title: "Account",         ic: "user" },
  { key: "schrift",     group: "Design",           title: "Schrift",         ic: "type" },
  { key: "oberflaeche",                            title: "Oberfläche",      ic: "contrast" },
  { key: "readwise",    group: "Daten & Speicher", title: "Readwise",        ic: "sync" },
  { key: "speicher",                               title: "Lokaler Speicher", ic: "folder" },
];

function SettingsPanel({ settings, onChange, onClose, closing, previewText, previewAddr, previewReihe }) {
  const fontKey = settings.font || "grotesk";
  const paper = typeof settings.paper === "number" ? settings.paper : 0;
  const [open, setOpen] = useSetS(() => new Set(["schrift"]));
  const [cursor, setCursor] = useSetS(1); // Start auf „Schrift"
  const bodyRef = useSetR(null);

  const valOf = (key) => {
    if (key === "account") return "Bald";
    if (key === "schrift") return fontNameOf(fontKey);
    if (key === "oberflaeche") return paperLabel(paper);
    if (key === "readwise") return "Nicht verbunden";
    if (key === "speicher") return "~/Documents/Luhm";
    return "";
  };

  /* Flache, per Tastatur ansteuerbare Liste — abhängig vom Aufklapp-Zustand */
  const items = [];
  SECTIONS.forEach((s) => {
    items.push({ type: "head", key: s.key });
    if (open.has(s.key)) {
      if (s.key === "schrift") Z2_FONTS.forEach((f, i) => items.push({ type: "font", key: s.key, fi: i }));
      else if (s.key === "oberflaeche") items.push({ type: "slider", key: s.key });
    }
  });
  const cur = items[Math.min(cursor, items.length - 1)] || {};
  const isHeadFocused = (key) => cur.type === "head" && cur.key === key;
  const isFontFocused = (i) => cur.type === "font" && cur.fi === i;
  const isSliderFocused = () => cur.type === "slider";

  const toggle = (key) => setOpen((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const expand = (key) => setOpen((s) => { const n = new Set(s); n.add(key); return n; });
  const collapse = (key) => setOpen((s) => { const n = new Set(s); n.delete(key); return n; });
  const chooseFont = (key) => onChange({ ...settings, font: key });
  const setPaper = (t) => onChange({ ...settings, paper: Math.max(0, Math.min(1, t)) });

  /* Tastatur global lauschen, solange das Panel offen ist.
     Esc übernimmt die App (schließt das Overlay). Eingabefelder bleiben unberührt. */
  useSetE(() => {
    const onKey = (e) => {
      if (e.key === "Escape") return; // App schließt das Overlay
      const ae = document.activeElement;
      if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
      const list = items;
      const it = list[Math.min(cursor, list.length - 1)];
      if (!it) return;
      if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); setCursor((c) => Math.min(list.length - 1, c + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); e.stopPropagation(); setCursor((c) => Math.max(0, c - 1)); }
      else if (e.key === "ArrowRight") {
        if (it.type === "head") { e.preventDefault(); e.stopPropagation(); expand(it.key); }
        else if (it.type === "slider") { e.preventDefault(); e.stopPropagation(); setPaper(Math.round(paper * 20 + 1) / 20); }
      }
      else if (e.key === "ArrowLeft") {
        if (it.type === "head") { e.preventDefault(); e.stopPropagation(); collapse(it.key); }
        else if (it.type === "slider") { e.preventDefault(); e.stopPropagation(); setPaper(Math.round(paper * 20 - 1) / 20); }
        else if (it.type === "font") { e.preventDefault(); e.stopPropagation(); setCursor(list.findIndex((x) => x.type === "head" && x.key === it.key)); }
      }
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); e.stopPropagation();
        if (it.type === "head") toggle(it.key);
        else if (it.type === "font") chooseFont(Z2_FONTS[it.fi].key);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  /* fokussierte Zeile sichtbar halten (ohne scrollIntoView) */
  useSetE(() => {
    const c = bodyRef.current; if (!c) return;
    const el = c.querySelector(".kfocus"); if (!el) return;
    const top = el.offsetTop, bot = top + el.offsetHeight;
    if (top < c.scrollTop) c.scrollTop = top - 10;
    else if (bot > c.scrollTop + c.clientHeight) c.scrollTop = bot - c.clientHeight + 10;
  }, [cursor, open]);

  const Head = (s) => (
    <button className={"z2-acchead" + (isHeadFocused(s.key) ? " kfocus" : "")} type="button"
      onClick={() => { toggle(s.key); setCursor(items.findIndex((x) => x.type === "head" && x.key === s.key)); }}>
      <span className="z2-accic">{Si[s.ic]({})}</span>
      <span className="z2-acctitle">{s.title}</span>
      <span className="z2-accval">{valOf(s.key)}</span>
      <span className="z2-accchev">{Si.chev({})}</span>
    </button>
  );

  const Body = (key) => {
    if (key === "account") return (
      <div className="z2-soon">
        <span className="z2-soon-ic">{Si.user({})}</span>
        <span className="z2-soon-txt"><span className="t">Account anlegen</span><span className="d">Sync &amp; Backup über mehrere Geräte hinweg.</span></span>
        <span className="z2-badge">BALD</span>
      </div>
    );
    if (key === "schrift") return (
      <React.Fragment>
        <div className="z2-preview">
          <div className="z2-preview-top">
            <span className="z2-preview-addr">{previewAddr || "1/1"}</span>
            {previewReihe && <span className="z2-preview-reihe">· {previewReihe}</span>}
          </div>
          <div className="z2-preview-body">{previewText || "Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt."}</div>
        </div>
        <div className="z2-fonts">
          {Z2_FONTS.map((f, i) => (
            <button key={f.key} type="button"
              className={"z2-fontopt" + (fontKey === f.key ? " on" : "") + (isFontFocused(i) ? " kfocus" : "")}
              onClick={() => { chooseFont(f.key); setCursor(items.findIndex((x) => x.type === "font" && x.fi === i)); }}>
              <span className="z2-fontradio"><i></i></span>
              <span className="z2-fonttext"><span className="z2-fontname">{f.name}</span><span className="z2-fontmeta">{f.meta}</span></span>
              <span className="z2-fontsample" style={{ fontFamily: f.sample, fontSize: f.size + "px" }}>Aa</span>
            </button>
          ))}
        </div>
      </React.Fragment>
    );
    if (key === "oberflaeche") return (
      <React.Fragment>
        <div className={"z2-slider-wrap" + (isSliderFocused() ? " kfocus" : "")}>
          <div className="z2-slider-ends"><b>Warm</b><b>Weiß</b></div>
          <input type="range" className="z2-range" min="0" max="100" value={Math.round(paper * 100)}
            onChange={(e) => setPaper((+e.target.value) / 100)} />
          <div className="z2-slider-val"><span>Tönung des Papiers</span><span className="v">{paperLabel(paper)}</span></div>
        </div>
        <div className="z2-sethint">Verschiebt die gesamte Zetteloberfläche stufenlos vom warmen Karteikarten-Ton bis zu reinem Weiß. <span className="mono" style={{ fontSize: "11px", color: "var(--ink-ghost)" }}>← →</span> zum Feinjustieren.</div>
      </React.Fragment>
    );
    if (key === "readwise") return (
      <React.Fragment>
        <div className="z2-status"><span className="z2-dot off"></span> Nicht verbunden</div>
        <div className="z2-field">
          <input className="z2-input mono" type="password" placeholder="Readwise API-Token einfügen" defaultValue="••••••••••••••••" />
          <button className="z2-btn primary" type="button">Verbinden</button>
        </div>
        <div className="z2-substatus">Token unter <b>readwise.io/access_token</b> erzeugen. Nach dem Verbinden werden Highlights automatisch geladen.</div>
      </React.Fragment>
    );
    if (key === "speicher") return (
      <React.Fragment>
        <div className="z2-field">
          <input className="z2-input mono" type="text" defaultValue="~/Documents/Luhm" readOnly />
          <button className="z2-btn ghost" type="button">Ordner wählen</button>
        </div>
        <div className="z2-ftree">
          <div className="z2-frow"><span className="nm root">Luhm/</span></div>
          <div className="z2-frow" style={{ paddingLeft: "16px" }}><span className="nm sub">Zettel/</span><span className="cmt"># Notizen als .md</span></div>
          <div className="z2-frow" style={{ paddingLeft: "32px" }}><span className="nm file">1-1.md · 1-1a.md …</span></div>
          <div className="z2-frow" style={{ paddingLeft: "16px" }}><span className="nm sub">Highlights/</span><span className="cmt"># Readwise als .md</span></div>
          <div className="z2-frow" style={{ paddingLeft: "32px" }}><span className="nm file">Ahrens.md · Luhmann.md …</span></div>
        </div>
        <div className="z2-sethint">Alle Notizen werden laufend als Markdown gesichert — du gibst nur den Ort an, die Unterordner <b>Zettel</b> und <b>Highlights</b> entstehen automatisch.</div>
      </React.Fragment>
    );
    return null;
  };

  return (
    <div className={"z2-layer z2-setlayer" + (closing ? " closing" : "")}>
      <div className="z2-panelhead">
        <span className="z2-accic" style={{ marginLeft: "2px" }}>{Si.gear({})}</span>
        <span className="z2-paneltitle">Einstellungen</span>
        <span className="z2-flex"></span>
        <span className="z2-cmdesc">esc</span>
        <button className="z2-x" type="button" onClick={onClose} title="Schließen">{Si.close({})}</button>
      </div>
      <div className="z2-setbody" ref={bodyRef}>
        {SECTIONS.map((s) => (
          <React.Fragment key={s.key}>
            {s.group && (s.key !== "account") && <hr className="z2-groupsep" />}
            {s.group && <div className="z2-grouphead">{s.group}</div>}
            <div className={"z2-acc" + (open.has(s.key) ? " open" : "")}>
              {Head(s)}
              <div className="z2-accbody"><div className="z2-accpad">{Body(s.key)}</div></div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SettingsPanel, Z2_FONTS, paperVars, paperLabel, fontStackOf, fontNameOf });
