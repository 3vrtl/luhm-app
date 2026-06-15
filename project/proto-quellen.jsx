/* proto-quellen.jsx — Readwise-Quellen, Highlights, Werkbank, Belege */
const { useState: useSt } = React;

/* ---------- Readwise-Verbindung (Mockup mit Einstellungen) ---------- */
function ConnectionPanel({ stats, lastSync, onSync, syncing, vaultPath, autoSaveMd, onVaultChange, onToggleAutoSave }) {
  const [open, setOpen] = useSt(false);
  const [auto, setAuto] = useSt(true);
  const [kinds, setKinds] = useSt({ book: true, article: true, essay: true, tweet: false });
  const toggleKind = (k) => setKinds((p) => ({ ...p, [k]: !p[k] }));
  return (
    <div className="rwpanel">
      <div className="rwhead">
        <span className="rwmark"><Ic.plug /></span>
        <div className="rwid">
          <div className="rwtitle">Readwise <span className="rwdot" /> <span className="rwconn">Verbunden</span></div>
          <div className="rwsub">felix@zettel.io · {lastSync}</div>
        </div>
        <button className={"pill" + (syncing ? " is-busy" : "")} onClick={onSync} disabled={syncing}>
          <Ic.sync style={syncing ? { animation: "spin 1s linear infinite" } : null} /> {syncing ? "Synchronisiere…" : "Synchronisieren"}
        </button>
        <button className="rwgear" onClick={() => setOpen((o) => !o)} title="Einstellungen">{open ? <Ic.close /> : <Ic.layers />}</button>
      </div>
      <div className="rwstats">
        <span><b>{stats.total}</b> Highlights</span>
        <span><b>{stats.sources}</b> Quellen</span>
        <span><b className="rwneu">{stats.neu}</b> im Eingang</span>
        <span><b>{stats.verarbeitet}</b> verarbeitet</span>
      </div>
      <div className="rwsave">
        <span className="rwsave-ic"><Ic.doc /></span>
        <div className="rwsave-main">
          <div className="rwsave-label">Als Markdown speichern unter</div>
          <input className="vaultinput mono" value={vaultPath} onChange={(e) => onVaultChange(e.target.value)} spellCheck="false" />
        </div>
        <button className={"switch" + (autoSaveMd ? " on" : "")} onClick={onToggleAutoSave} aria-pressed={autoSaveMd} title="Beim Import &amp; Erstellen automatisch speichern"><span className="knob" /></button>
        <span className="rwsave-auto">automatisch</span>
      </div>
      {open && (
        <div className="rwsettings">
          <div className="rwsetrow">
            <span className="rwsetlabel">Automatisch synchronisieren</span>
            <button className={"switch" + (auto ? " on" : "")} onClick={() => setAuto((a) => !a)} aria-pressed={auto}><span className="knob" /></button>
          </div>
          <div className="rwsetrow">
            <span className="rwsetlabel">Kategorien importieren</span>
            <span className="rwchoices">
              {Object.keys(kinds).map((k) => (
                <button key={k} className={"choice" + (kinds[k] ? " on" : "")} onClick={() => toggleKind(k)}>
                  {kinds[k] && <Ic.check style={{ width: 12, height: 12 }} />} {SRC_KIND_LABEL[k] || (k === "tweet" ? "Tweets" : k)}
                </button>
              ))}
            </span>
          </div>
          <div className="rwsetrow">
            <span className="rwsetlabel">Readwise-Tags übernehmen</span>
            <button className="switch on" aria-pressed="true"><span className="knob" /></button>
          </div>
          <div className="rwnote">Verbindung und Export sind im Prototyp simuliert — das tatsächliche Abrufen und Schreiben der Dateien übernimmt später die App.</div>
        </div>
      )}
    </div>
  );
}

/* ---------- Quell-Symbol ---------- */
function SourceMark({ kind }) {
  return <span className={"smark smark-" + kind}><Ic.book /></span>;
}

/* Buch-Cover-Farben je Quelle */
const SRC_HUES = [
  { bg: "oklch(0.93 0.045 250)", ink: "oklch(0.33 0.09 250)", spine: "oklch(0.55 0.11 250)" },
  { bg: "oklch(0.93 0.05 150)",  ink: "oklch(0.32 0.08 150)", spine: "oklch(0.50 0.10 150)" },
  { bg: "oklch(0.94 0.06 72)",   ink: "oklch(0.38 0.09 60)",  spine: "oklch(0.62 0.12 65)" },
  { bg: "oklch(0.93 0.05 28)",   ink: "oklch(0.38 0.11 28)",  spine: "oklch(0.58 0.15 28)" },
  { bg: "oklch(0.93 0.05 320)",  ink: "oklch(0.36 0.10 320)", spine: "oklch(0.55 0.12 320)" },
  { bg: "oklch(0.92 0.035 200)", ink: "oklch(0.33 0.07 200)", spine: "oklch(0.50 0.09 200)" },
];

/* ---------- Quell-Cover (oberste Ebene) ---------- */
function SourceCover({ s, idx }) {
  const h = SRC_HUES[idx % SRC_HUES.length];
  return (
    <div className="srccover" style={{ background: h.bg, color: h.ink, "--spine": h.spine }}>
      <span className="srccover-kind">{SRC_KIND_LABEL[s.kind]}</span>
      <div className="srccover-main">
        <div className="srccover-title serif">{s.title}</div>
        <div className="srccover-author">{s.author}</div>
      </div>
      <span className="srccover-year mono">{s.year}</span>
    </div>
  );
}

/* ---------- ein Highlight (Listenzeile) ---------- */
function HighlightCard({ hid, h, source, selected, verarbeitetIn, onToggle, onOpen, onEnterNote, cursor, showSource }) {
  const verarbeitet = verarbeitetIn.length > 0;
  return (
    <div className={"hl" + (selected ? " sel" : "") + (verarbeitet ? " done" : "") + (cursor ? " cursor" : "")} onClick={() => onOpen(hid)}>
      <button className="hlcheck" onClick={(e) => { e.stopPropagation(); onToggle(hid); }} title="Für Werkbank auswählen">{selected ? <Ic.check style={{ width: 13, height: 13 }} /> : null}</button>
      <div className="hlbody">
        {showSource && (
          <div className="hlsrc"><SourceMark kind={source.kind} /> <span className="hlsrc-t">{source.title}</span> <span className="hlsrc-a">· {source.author}</span></div>
        )}
        <p className="hltext serif">{h.text}</p>
        <div className="hlmeta">
          <span className="hlort">{h.ort}</span>
          <span className="hldot">·</span>
          <span>{fmtDate(h.imported)}</span>
          {h.tags.map((t) => <span key={t} className="hltag">{t}</span>)}
          <span style={{ flex: 1 }} />
          {verarbeitet
            ? <button className="hlstate done" onClick={(e) => { e.stopPropagation(); onEnterNote(verarbeitetIn[0]); }} title="Zum Zettel"><Ic.check style={{ width: 12, height: 12 }} /> in {verarbeitetIn.join(", ")}</button>
            : <span className="hlstate">im Eingang</span>}
          <span className="hlopen" aria-hidden="true"><Ic.arrow /></span>
        </div>
      </div>
    </div>
  );
}

/* ---------- einzelnes Highlight (Detail-Ebene) ---------- */
function HighlightDetail({ hid, h, source, verarbeitetIn, selected, onToggle, onWriteFrom, onEnterNote, onOpenMd }) {
  const verarbeitet = verarbeitetIn.length > 0;
  return (
    <div className="hldetail">
      <p className="hldetail-q">„{h.text}"</p>
      <div className="hldetail-src">
        <SourceMark kind={source.kind} />
        <span><span style={{ fontWeight: 600 }}>{source.author}</span>, <span className="serif" style={{ fontStyle: "italic" }}>{source.title}</span> · {h.ort}</span>
      </div>
      <div className="hldetail-meta">
        <span>Importiert {fmtDate(h.imported)}</span>
        {h.tags.map((t) => <span key={t} className="hltag">{t}</span>)}
        {verarbeitet
          ? <button className="hlstate done" onClick={() => onEnterNote(verarbeitetIn[0])}><Ic.check style={{ width: 12, height: 12 }} /> verarbeitet in {verarbeitetIn.join(", ")}</button>
          : <span className="hlstate">im Eingang</span>}
      </div>
      <div className="hldetail-actions">
        <button className="pill solid" onClick={() => onWriteFrom(hid)}><Ic.write /> Zettel daraus schreiben</button>
        <button className="pill" onClick={() => onToggle(hid)}>{selected ? <React.Fragment><Ic.check /> Ausgewählt</React.Fragment> : <React.Fragment><Ic.plus /> Zur Auswahl</React.Fragment>}</button>
        <button className="pill" onClick={() => onOpenMd("highlight", hid)}><Ic.doc /> Als Markdown</button>
      </div>
    </div>
  );
}

/* ---------- Bibliothek: Quellen → Highlights → Highlight (mit Tastatur) ---------- */
function QuellenMode({ sources, highlights, belege, sel, onToggle, onEnterNote, onSync, syncing, lastSync, onWriteFrom, vaultPath, autoSaveMd, onVaultChange, onToggleAutoSave, onOpenMd }) {
  const [srcOpen, setSrcOpen] = useSt(null);
  const [hlOpen, setHlOpen] = useSt(null);
  const [filter, setFilter] = useSt("alle"); // innerhalb einer Quelle
  const [cursor, setCursor] = useSt(0);
  const gridRef = React.useRef(null);
  const wrapRef = React.useRef(null);

  const srcIds = Object.keys(sources);
  const grouped = groupBySource(highlights);
  const stats = {
    total: Object.keys(highlights).length,
    sources: srcIds.length,
    neu: Object.keys(highlights).filter((h) => !isVerarbeitet(h, belege)).length,
    verarbeitet: Object.keys(highlights).filter((h) => isVerarbeitet(h, belege)).length,
  };
  const match = (hid) => { const v = isVerarbeitet(hid, belege); return filter === "alle" ? true : filter === "done" ? v : !v; };
  const srcHls = srcOpen ? (grouped[srcOpen] || []).filter(match) : [];
  const neuOf = (sid) => (grouped[sid] || []).filter((h) => !isVerarbeitet(h, belege)).length;

  const openSource = (sid) => { setSrcOpen(sid); setHlOpen(null); setCursor(0); if (wrapRef.current) wrapRef.current.scrollTop = 0; };
  const backToSources = () => { const i = Math.max(0, srcIds.indexOf(srcOpen)); setSrcOpen(null); setHlOpen(null); setCursor(i); };
  const openHl = (hid) => { setHlOpen(hid); };

  // Tastatur-Navigation über die Ebenen
  React.useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement || {}).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (window.__overlayOpen) return;
      if (hlOpen) {
        if (["Escape", "Backspace", "ArrowLeft"].includes(e.key)) { e.preventDefault(); setHlOpen(null); }
        else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); const i = srcHls.indexOf(hlOpen); const ni = Math.min(Math.max(i + (e.key === "ArrowDown" ? 1 : -1), 0), srcHls.length - 1); setHlOpen(srcHls[ni]); setCursor(ni); }
        else if (e.key === " ") { e.preventDefault(); onToggle(hlOpen); }
        return;
      }
      if (srcOpen) {
        if (["Escape", "Backspace", "ArrowLeft"].includes(e.key)) { e.preventDefault(); backToSources(); }
        else if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, srcHls.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); if (srcHls[cursor]) openHl(srcHls[cursor]); }
        else if (e.key === " ") { e.preventDefault(); if (srcHls[cursor]) onToggle(srcHls[cursor]); }
        return;
      }
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, srcIds.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); if (srcIds[cursor]) openSource(srcIds[cursor]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [srcOpen, hlOpen, cursor, srcHls, srcIds]);

  const filters = [
    { k: "alle", label: "Alle" },
    { k: "neu", label: "Eingang" },
    { k: "done", label: "Verarbeitet" },
  ];

  // ---------- Ebene 2: einzelnes Highlight ----------
  if (hlOpen) {
    const h = highlights[hlOpen], s = sources[h.src];
    return (
      <div className="ovwrap scrollcol" ref={wrapRef}>
        <div className="ovinner ovinner-wide">
          <div className="biblevel-head">
            <button className="backbtn" onClick={() => setHlOpen(null)}><Ic.reply /> {s.title}</button>
            <span className="bibcrumb"><span className="bibcrumb-l" onClick={backToSources}>Bibliothek</span> › {s.author}</span>
          </div>
          <HighlightDetail hid={hlOpen} h={h} source={s} verarbeitetIn={notesForHighlight(hlOpen, belege)} selected={sel.includes(hlOpen)} onToggle={onToggle} onWriteFrom={onWriteFrom} onEnterNote={onEnterNote} onOpenMd={onOpenMd} />
          <div className="bibhint"><span><span className="kbd">↑↓</span> blättern</span><span><span className="kbd">Esc</span> zurück</span><span><span className="kbd">Leer</span> auswählen</span></div>
        </div>
      </div>
    );
  }

  // ---------- Ebene 1: Highlights einer Quelle ----------
  if (srcOpen) {
    const s = sources[srcOpen];
    return (
      <div className="ovwrap scrollcol" ref={wrapRef}>
        <div className="ovinner ovinner-wide">
          <div className="biblevel-head">
            <button className="backbtn" onClick={backToSources}><Ic.reply /> Bibliothek</button>
          </div>
          <header className="qsource-head qsource-head-lg">
            <SourceCover s={s} idx={Math.max(0, srcIds.indexOf(srcOpen))} />
            <div className="qsource-id">
              <div className="qsource-title serif">{s.title}</div>
              <div className="qsource-meta">{s.author} · {SRC_KIND_LABEL[s.kind]} · {s.year}</div>
              <div className="qsource-stat">{(grouped[srcOpen] || []).length} Highlights · {neuOf(srcOpen)} im Eingang</div>
            </div>
          </header>
          <div className="qfilter">
            {filters.map((f) => <button key={f.k} className={"qtab" + (filter === f.k ? " on" : "")} onClick={() => { setFilter(f.k); setCursor(0); }}>{f.label}</button>)}
          </div>
          {srcHls.length === 0 && <div className="qempty">Keine Highlights in dieser Ansicht.</div>}
          <div className="qsource-list">
            {srcHls.map((hid, i) => (
              <HighlightCard key={hid} hid={hid} h={highlights[hid]} source={s}
                selected={sel.includes(hid)} verarbeitetIn={notesForHighlight(hid, belege)}
                onToggle={onToggle} onOpen={openHl} onEnterNote={onEnterNote} cursor={i === cursor} showSource={false} />
            ))}
          </div>
          <div className="bibhint"><span><span className="kbd">↑↓</span> wählen</span><span><span className="kbd">↵</span> öffnen</span><span><span className="kbd">Leer</span> auswählen</span><span><span className="kbd">Esc</span> zurück</span></div>
        </div>
      </div>
    );
  }

  // ---------- Ebene 0: Quellen (Cover-Raster) ----------
  return (
    <div className="ovwrap scrollcol" ref={wrapRef}>
      <div className="ovinner ovinner-wide">
        <header className="ovhead">
          <div className="seclabel">Quellen</div>
          <h1 className="ovtitle serif">Bibliothek</h1>
          <p className="ovsub">Deine Quellen aus Readwise. Öffne eine Quelle, um ihre Highlights zu lesen — und daraus eigene Zettel zu formen.</p>
        </header>

        <ConnectionPanel stats={stats} lastSync={lastSync} onSync={onSync} syncing={syncing} vaultPath={vaultPath} autoSaveMd={autoSaveMd} onVaultChange={onVaultChange} onToggleAutoSave={onToggleAutoSave} />

        <div className="biblist" ref={gridRef}>
          {srcIds.map((sid, i) => {
            const s = sources[sid], hue = SRC_HUES[i % SRC_HUES.length];
            return (
              <div key={sid} className={"bibrow" + (i === cursor ? " cursor" : "")} onClick={() => openSource(sid)} onMouseEnter={() => setCursor(i)}>
                <div className="bibthumb" style={{ background: hue.bg, "--spine": hue.spine }} />
                <div className="bibrow-main">
                  <div className="bibrow-title serif">{s.title}</div>
                  <div className="bibrow-meta">{s.author} · {SRC_KIND_LABEL[s.kind]} · {s.year}</div>
                </div>
                <div className="bibrow-counts">
                  <span>{(grouped[sid] || []).length} Highlights</span>
                  {neuOf(sid) > 0 && <span className="dot-neu">{neuOf(sid)} im Eingang</span>}
                </div>
                <span className="bibrow-chev" aria-hidden="true"><Ic.arrow /></span>
              </div>
            );
          })}
        </div>
        <div className="bibhint"><span><span className="kbd">↑↓</span> wählen</span><span><span className="kbd">↵</span> Quelle öffnen</span></div>
      </div>
    </div>
  );
}

/* ---------- Auswahl-Leiste + Werkbank ---------- */
function SelectionBar({ sel, onOpen, onClear }) {
  if (!sel.length) return null;
  return (
    <div className="selbar">
      <span className="selbar-n">{sel.length} Highlight{sel.length > 1 ? "s" : ""} ausgewählt</span>
      <button className="pill" onClick={onClear}>Leeren</button>
      <button className="pill solid" onClick={onOpen}><Ic.write /> Zettel daraus schreiben</button>
    </div>
  );
}

function Werkbank({ sel, highlights, sources, reihen, onCreate, onClose, onRemove }) {
  const [text, setText] = useSt("");
  const [reihe, setReihe] = useSt("");
  const can = text.trim().length > 0;
  return (
    <div className="wkscrim" onClick={onClose}>
      <div className="wk" onClick={(e) => e.stopPropagation()}>
        <header className="wk-head">
          <div><div className="seclabel">Werkbank</div><div className="wk-title serif">Aus Highlights einen Zettel formen</div></div>
          <button className="rwgear" onClick={onClose} title="Schließen"><Ic.close /></button>
        </header>
        <div className="wk-body">
          <div className="wk-sources scrollcol">
            <div className="wk-collabel">{sel.length} Belege</div>
            {sel.map((hid) => {
              const h = highlights[hid], s = sources[h.src];
              return (
                <div className="wk-hl" key={hid}>
                  <button className="wk-rm" onClick={() => onRemove(hid)} title="Entfernen"><Ic.close style={{ width: 13, height: 13 }} /></button>
                  <p className="serif">{h.text}</p>
                  <div className="wk-hlmeta"><SourceMark kind={s.kind} /> {s.author}, <span className="serif" style={{ fontStyle: "italic" }}>{s.title}</span> · {h.ort}</div>
                </div>
              );
            })}
          </div>
          <div className="wk-write">
            <div className="wk-collabel">Dein Gedanke</div>
            <textarea className="wk-textarea serif" autoFocus placeholder="Was verbindet diese Stellen? Formuliere deinen eigenen Gedanken — in einem Satz, in deinen Worten." value={text} onChange={(e) => setText(e.target.value)} />
            <div className="wk-foot">
              <label className="wk-reihe">Reihe
                <input list="reihen-list" value={reihe} onChange={(e) => setReihe(e.target.value)} placeholder="z. B. Information" />
                <datalist id="reihen-list">{reihen.map((r) => <option key={r} value={r} />)}</datalist>
              </label>
              <span style={{ flex: 1 }} />
              <button className="pill solid" disabled={!can} onClick={() => onCreate(reihe.trim() || "Ohne Reihe", text.trim(), sel)}>
                <Ic.plus /> Zettel anlegen
              </button>
            </div>
            <div className="wk-hint">Der neue Zettel führt die {sel.length} Stellen als Belege — als Fußnoten unter deinem Text.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Highlight-Picker (zum Anheften an bestehende/neue Zettel) ---------- */
function HighlightPicker({ highlights, sources, belege, exclude, onConfirm, onClose }) {
  const [q, setQ] = useSt("");
  const [pick, setPick] = useSt([]);
  const toggle = (hid) => setPick((p) => p.includes(hid) ? p.filter((x) => x !== hid) : [...p, hid]);
  const ids = Object.keys(highlights).filter((hid) => !exclude.includes(hid))
    .filter((hid) => { const h = highlights[hid], s = sources[h.src]; const hay = (h.text + " " + s.title + " " + s.author + " " + h.tags.join(" ")).toLowerCase(); return hay.includes(q.toLowerCase()); })
    .sort((a, b) => highlights[b].imported.localeCompare(highlights[a].imported));
  return (
    <div className="wkscrim" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <header className="picker-head">
          <Ic.search style={{ width: 16, height: 16, color: "var(--ink-faint)" }} />
          <input autoFocus className="picker-input" placeholder="Highlight suchen — Text, Quelle, Tag…" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="rwgear" onClick={onClose}><Ic.close /></button>
        </header>
        <div className="picker-list scrollcol">
          {ids.length === 0 && <div className="qempty">Nichts gefunden.</div>}
          {ids.map((hid) => {
            const h = highlights[hid], s = sources[h.src], on = pick.includes(hid);
            return (
              <div className={"pick-hl" + (on ? " sel" : "")} key={hid} onClick={() => toggle(hid)}>
                <span className="hlcheck">{on ? <Ic.check style={{ width: 13, height: 13 }} /> : null}</span>
                <div>
                  <p className="serif">{truncate(h.text, 130)}</p>
                  <div className="hlmeta"><SourceMark kind={s.kind} /> {s.author} · {h.ort}</div>
                </div>
              </div>
            );
          })}
        </div>
        <footer className="picker-foot">
          <span className="selbar-n">{pick.length} ausgewählt</span>
          <span style={{ flex: 1 }} />
          <button className="pill" onClick={onClose}>Abbrechen</button>
          <button className="pill solid" disabled={!pick.length} onClick={() => onConfirm(pick)}><Ic.pin /> Anheften</button>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Belege als Fußnoten unter dem Zetteltext ---------- */
function BelegeFootnotes({ ids, highlights, sources, onOpenSource, onAdd, onRemove }) {
  return (
    <div className="belege-lean">
      <ol className="bl-list">
        {ids.map((hid, i) => {
          const h = highlights[hid]; if (!h) return null;
          const s = sources[h.src];
          return (
            <li className="bl-fn" key={hid}>
              <span className="bl-n mono">{i + 1}</span>
              <span className="bl-text" onClick={() => onOpenSource && onOpenSource(hid)}>
                <span className="bl-q">„{truncate(h.text, 150)}"</span>
                <span className="bl-src">{s.author}, <span className="serif" style={{ fontStyle: "italic" }}>{s.title}</span> · {h.ort}</span>
              </span>
              {onRemove && <button className="bl-rm" onClick={(e) => { e.stopPropagation(); onRemove(hid); }} title="Lösen"><Ic.close style={{ width: 12, height: 12 }} /></button>}
            </li>
          );
        })}
      </ol>
      {onAdd && <button className="bl-add" onClick={onAdd}><Ic.plus style={{ width: 12, height: 12 }} /> Beleg anheften</button>}
    </div>
  );
}

Object.assign(window, { QuellenMode, SelectionBar, Werkbank, HighlightPicker, BelegeFootnotes, SourceMark });
