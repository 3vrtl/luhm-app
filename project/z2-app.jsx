/* z2-app.jsx — Luhm 2.0 · Der eine Zettel.
   Ein kleines macOS-Fenster, das EIN Zettel ist. 80% der Zeit sieht man genau
   den Zettel, auf dem man steht — und schreibt. Navigation per Tastatur (⌘↑↓→
   bzw. Pfeil-Überlauf am Rand) und ⌘K. Drei Varianten unterscheiden sich darin,
   WIE man die Struktur des Kastens spürt, während nur ein Zettel sichtbar ist. */

const { useState: useS, useRef: useR, useEffect: useE, useCallback } = React;

const VARIANT_META = {
  karte: { name: "Karteikarte", note: "Ein physischer Stapel — der nächste Zettel lugt am Rand hervor." },
  blatt: { name: "Leeres Blatt", note: "Nichts als die Seite. Hinweise erscheinen nur, wenn die Hand ruht." },
  faden: { name: "Faden",       note: "Ein dünner Faden links zeigt, wo in der Reihe man steht." },
};

function TrafficLights() {
  return (
    <div className="z2-lights">
      <span style={{ background: "#ff5f57" }} /><span style={{ background: "#febc2e" }} /><span style={{ background: "#28c840" }} />
    </div>
  );
}

function ZettelApp({ variant = "karte", start = "1/1", autostart = false }) {
  const [notes, setNotes] = useS(() => {
    const base = JSON.parse(JSON.stringify(SEED_NOTES));
    Object.keys(base).forEach((id) => { if (Z2_TITLES[id]) base[id].titel = Z2_TITLES[id]; });
    return base;
  });
  const [links, setLinks] = useS(() => JSON.parse(JSON.stringify(SEED_LINKS)));
  const [focus, setFocusRaw] = useS(start);
  const [overlay, setOverlay] = useS(null);     // null | 'cmdk'
  const [dir, setDir] = useS("none");           // letzte Navigationsrichtung (für Animation)
  const [armed, setArmed] = useS(autostart);     // erst nach erster Interaktion Cursor setzen
  const [typing, setTyping] = useS(false);
  const [nudging, setNudging] = useS(false);
  const [belege, setBelege] = useS(() => JSON.parse(JSON.stringify(SEED_BELEGE)));
  const [inbox, setInbox] = useS(null);          // null | { src, hid, cursor }
  const [inboxMode, setInboxMode] = useS("half"); // 'half' | 'full'
  const [inboxClosing, setInboxClosing] = useS(false);
  const [inboxPicking, setInboxPicking] = useS(false); // Zettel-Picker im Detail offen?
  const [syncing, setSyncing] = useS(false);
  const [lastSync, setLastSync] = useS("vor 2 Std");
  const [graphMode, setGraphMode] = useS(null);  // null | 'half' | 'full'
  const [graphClosing, setGraphClosing] = useS(false);
  /* Einstellungen (Schrift + Papierton), lokal gesichert */
  const [settings, setSettings] = useS(() => {
    try { const s = JSON.parse(localStorage.getItem("luhm2-settings")); if (s && typeof s === "object") return { font: s.font || "serif", paper: typeof s.paper === "number" ? s.paper : 0 }; } catch (e) {}
    return { font: "serif", paper: 0 };
  });
  useE(() => { try { localStorage.setItem("luhm2-settings", JSON.stringify(settings)); } catch (e) {} }, [settings]);
  const [settingsClosing, setSettingsClosing] = useS(false);
  const settingsTimer = useR(null);
  const openSettings = () => { clearTimeout(settingsTimer.current); setSettingsClosing(false); setOverlay("settings"); };
  const closeSettings = () => {
    if (settingsClosing) return;
    setSettingsClosing(true);
    settingsTimer.current = setTimeout(() => { setOverlay((o) => (o === "settings" ? null : o)); setSettingsClosing(false); }, 280);
  };

  /* Highlights kommen quellenweise aus Readwise (Export-API: je „book" ein Bündel) */
  const grouped = React.useMemo(() => groupBySource(SEED_HIGHLIGHTS), []);
  const srcOrder = React.useMemo(() => sourceOrder(SEED_SOURCES, grouped), [grouped]);
  /* Picker schließen, sobald man das Highlight wechselt oder die Lade verlässt */
  useE(() => { setInboxPicking(false); }, [inbox && inbox.hid, inbox && inbox.src, !inbox]);
  const rootRef = useR(null);
  const typingTimer = useR(null);
  const nudgeTimer = useR(null);
  const keyHandlerRef = useR(null);
  const titleRef = useR(null);
  /* Fokus per Tastatur zwischen Titel und Zettel wechseln */
  const focusBody = (atStart) => {
    const el = rootRef.current && rootRef.current.querySelector(".z2-sheet");
    if (!el) return;
    el.focus();
    const r = document.createRange(); r.selectNodeContents(el); r.collapse(!!atStart);
    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  };
  const focusTitle = () => { const t = titleRef.current; if (t) { t.focus(); t.select(); } };
  /* Tastatur global am Dokument lauschen, statt vom Fokus des Fensters
     abzuhängen — so geht die Navigation nie verloren (auch nicht, wenn der
     Fokus nach dem Schließen der ⌘K-Palette auf den <body> fällt). */
  useE(() => {
    const h = (e) => { if (keyHandlerRef.current) keyHandlerRef.current(e); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);

  const ids = Object.keys(notes);
  const nav = reiheNav(focus, links, ids);

  const setFocus = (id, d = "none") => { if (!id) return; setDir(d); setArmed(true); setFocusRaw(id); setOverlay(null); };

  const updateNote = (id, text) => setNotes((n) => ({ ...n, [id]: { ...(n[id] || { tags: [], reihe: "" }), text } }));
  const updateTitle = (id, titel) => setNotes((n) => ({ ...n, [id]: { ...(n[id] || { tags: [], reihe: "" }), titel } }));

  /* --- neue Zettel anlegen --- */
  const makeNote = (addr, parent, rel) => {
    setNotes((n) => ({ ...n, [addr]: { text: "", titel: "", tags: [], reihe: (n[parent] && n[parent].reihe) || "" } }));
    setLinks((l) => {
      const nl = JSON.parse(JSON.stringify(l));
      nl[parent] = nl[parent] || {};
      nl[parent][rel] = [...(nl[parent][rel] || []), addr];
      nl[addr] = { vorg: parent };
      return nl;
    });
  };
  /* „Nur der nächst mögliche": kein neuer Zettel, solange der aktuelle leer ist.
     Der leere Zettel ist bereits der nächste — erst füllen, dann weiter. */
  const noteEmpty = (id) => !(((notes[id] || {}).text) || "").trim();
  const doNudge = () => { setNudging(true); clearTimeout(nudgeTimer.current); nudgeTimer.current = setTimeout(() => setNudging(false), 380); };
  const createFolge = () => { if (noteEmpty(focus)) { doNudge(); return; } const a = nextFolge(focus, notes); const head = (nav.line && nav.line[0]) || focus; makeNote(a, head, "folge"); setFocus(a, "down"); };
  const createVerzweig = () => { if (noteEmpty(focus)) { doNudge(); return; } const a = nextVerzweig(focus, notes); makeNote(a, focus, "verzweig"); setFocus(a, "right"); };
  const createRoot = () => {
    // schon vorhandenen leeren Wurzel-Zettel wiederverwenden statt neu anzulegen
    const roots = ids.filter((id) => !(links[id] && links[id].vorg));
    const emptyRoot = roots.find((id) => noteEmpty(id));
    if (emptyRoot) { setFocus(emptyRoot, "down"); return; }
    const a = nextRootId(notes);
    setNotes((n) => ({ ...n, [a]: { text: "", tags: [], reihe: "" } }));
    setLinks((l) => ({ ...l, [a]: {} }));
    setFocus(a, "down");
  };

  /* --- Readwise / „Highlights": Lade von unten (wie der Graph) --- */
  const openInbox = (atHid) => {
    setInboxClosing(false); setGraphMode(null);
    if (atHid && SEED_HIGHLIGHTS[atHid]) {
      const sid = SEED_HIGHLIGHTS[atHid].src; const hids = grouped[sid] || [];
      setInbox({ src: sid, hid: atHid, cursor: Math.max(0, hids.indexOf(atHid)) });
    } else {
      setInbox({ src: null, hid: null, cursor: 0 });
    }
    setInboxMode("half"); setOverlay(null);
  };
  const openSource = (sid) => setInbox((s) => ({ ...s, src: sid, hid: null, cursor: 0 }));
  const openHl = (hid, i) => setInbox((s) => ({ ...s, hid, cursor: i }));
  const backToList = () => setInbox((s) => ({ ...s, hid: null }));
  const backToSources = () => setInbox((s) => ({ ...s, cursor: Math.max(0, srcOrder.indexOf(s.src)), src: null, hid: null }));
  const doSync = () => { if (syncing) return; setSyncing(true); setTimeout(() => { setSyncing(false); setLastSync("gerade eben"); }, 1000); };
  /* einen verknüpften Zettel öffnen — Lade bleibt offen (paralleles Bild) */
  const gotoNote = (id) => setFocus(id, "none");
  const closeInbox = () => { if (inboxClosing) return; setInboxClosing(true); setTimeout(() => { setInbox(null); setInboxClosing(false); }, 280); };
  const attachHL = (hid, noteId) => {
    const t = noteId || focus; if (!t) return;
    setBelege((b) => (b[t] || []).includes(hid) ? b : ({ ...b, [t]: [...(b[t] || []), hid] }));
  };
  const detachHL = (hid, noteId) => setBelege((b) => ({ ...b, [noteId]: (b[noteId] || []).filter((x) => x !== hid) }));

  /* --- Bewegungen --- */
  const goUp = () => { if (nav.up) setFocus(nav.up, "up"); else if (nav.left) setFocus(nav.left, "left"); else if (nav.parent) setFocus(nav.parent, "left"); };
  const goDown = () => { if (nav.down) setFocus(nav.down, "down"); else createFolge(); };
  const goBranch = () => { if (nav.branches[0]) setFocus(nav.branches[0], "right"); else createVerzweig(); };
  const goLeft = () => { if (nav.left) setFocus(nav.left, "left"); else if (nav.parent) setFocus(nav.parent, "left"); };

  /* --- Tastatur auf Fensterebene --- */
  const openGraph = (m = "half") => { setGraphClosing(false); setInbox(null); setGraphMode(m); setOverlay(null); };
  const closeGraph = () => { if (graphClosing) return; setGraphClosing(true); setTimeout(() => { setGraphMode(null); setGraphClosing(false); }, 280); };
  const onRootKey = (e) => {
    setArmed(true);
    const meta = e.metaKey || e.ctrlKey;
    if (meta && (e.key === "k" || e.key === "K")) { e.preventDefault(); setOverlay((o) => (o === "cmdk" ? null : "cmdk")); return; }
    if (meta && (e.key === "g" || e.key === "G")) { e.preventDefault(); if (graphMode) closeGraph(); else openGraph("half"); return; }
    if (meta && (e.key === "n" || e.key === "N")) { e.preventDefault(); createRoot(); return; }
    if (meta && (e.key === "i" || e.key === "I")) { e.preventDefault(); if (inbox) closeInbox(); else openInbox(); return; }
    if (meta && e.key === ",") { e.preventDefault(); (overlay === "settings" ? closeSettings() : openSettings()); return; }
    if (overlay === "settings") { if (e.key === "Escape") { e.preventDefault(); closeSettings(); } return; }
    if (overlay) { if (e.key === "Escape") { e.preventDefault(); setOverlay(null); } return; }
    if (inbox) {
      if (e.key === "Escape") { e.preventDefault(); closeInbox(); return; }
      if (!meta) {
        const ae = document.activeElement;
        // Eingabefeld aktiv (z. B. Picker-Suche): Tasten dort belassen
        if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
        const hids = inbox.src ? (grouped[inbox.src] || []) : [];
        if (inbox.src == null) {
          if (e.key === "ArrowDown") { e.preventDefault(); setInbox((s) => ({ ...s, cursor: Math.min(srcOrder.length - 1, s.cursor + 1) })); return; }
          if (e.key === "ArrowUp") { e.preventDefault(); setInbox((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) })); return; }
          if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); const sid = srcOrder[inbox.cursor]; if (sid) openSource(sid); return; }
        } else if (inbox.hid == null) {
          if (e.key === "ArrowDown") { e.preventDefault(); setInbox((s) => ({ ...s, cursor: Math.min(hids.length - 1, s.cursor + 1) })); return; }
          if (e.key === "ArrowUp") { e.preventDefault(); setInbox((s) => ({ ...s, cursor: Math.max(0, s.cursor - 1) })); return; }
          if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); const hid = hids[inbox.cursor]; if (hid) openHl(hid, inbox.cursor); return; }
          if (e.key === "ArrowLeft" || e.key === "Backspace") { e.preventDefault(); backToSources(); return; }
        } else {
          if (e.key === "ArrowDown") { e.preventDefault(); setInbox((s) => { const ni = Math.min(hids.length - 1, s.cursor + 1); return { ...s, cursor: ni, hid: hids[ni] }; }); return; }
          if (e.key === "ArrowUp") { e.preventDefault(); setInbox((s) => { const ni = Math.max(0, s.cursor - 1); return { ...s, cursor: ni, hid: hids[ni] }; }); return; }
          if (e.key === "ArrowLeft" || e.key === "Backspace") { e.preventDefault(); backToList(); return; }
          if (e.key === "Enter") { e.preventDefault(); if (!notesForHighlight(inbox.hid, belege).includes(focus)) attachHL(inbox.hid, focus); return; }
          if (e.key === "ArrowRight") { e.preventDefault(); setInboxPicking(true); return; }
        }
      }
      // ⌘-Pfeile fallen durch → Navigation des Zettels hinter der Lade
    }
    if (e.key === "Escape") { if (graphMode) { e.preventDefault(); closeGraph(); } return; }
    if (meta) {
      if (e.key === "ArrowDown") { e.preventDefault(); goDown(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); goUp(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goBranch(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goLeft(); }
    }
  };
  keyHandlerRef.current = onRootKey;

  const onSpill = (d) => { if (d === "down") goDown(); else if (d === "up") goUp(); };

  const markTyping = () => {
    setTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => setTyping(false), 1500);
  };

  const note = notes[focus] || { text: "", tags: [], reihe: "" };
  const ruled = variant !== "blatt";

  /* Schrift + Papierton aufs Fenster anwenden */
  const rootStyle = {
    ...(window.paperVars ? window.paperVars(settings.paper) : {}),
    "--reading-font": window.fontStackOf ? window.fontStackOf(settings.font) : undefined,
  };

  /* gemeinsame Overlay-Requisiten */
  const ovProps = {
    notes, links, focus, onClose: () => setOverlay(null),
    onNavigate: (id) => setFocus(id, "none"),
  };

  return (
    <div ref={rootRef} className={"z2-win v-" + variant} tabIndex={0} style={rootStyle}>
      {/* Fensterkopf */}
      <div className="z2-top">
        <TrafficLights />
        {variant === "karte" && (
          <div className="z2-tab">
            <span className="z2-tabaddr">{focus}</span>
            {note.reihe && <span className="z2-tabreihe">· {note.reihe}</span>}
          </div>
        )}
        {variant === "blatt" && (
          <React.Fragment>
            <span className="z2-topaddr">{focus}</span>
            <input key={focus} ref={titleRef} className="z2-titlefield" value={note.titel || ""} placeholder="ohne Titel"
              spellCheck={false} onChange={(e) => updateTitle(focus, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "ArrowDown") { e.preventDefault(); focusBody(true); }
                else if (e.key === "Escape") { e.preventDefault(); e.currentTarget.blur(); }
              }} />
          </React.Fragment>
        )}
        {variant === "faden" && note.reihe && <div className="z2-topreihe">{note.reihe}</div>}
        {variant !== "blatt" && <div className="z2-flex" />}
        <button className="z2-jump" title="Springen (⌘K)" onClick={() => setOverlay("cmdk")}>{Ic.search({})}<span>⌘K</span></button>
      </div>

      {/* Bühne */}
      <div className="z2-stage">
        {variant === "faden" && <ThreadRail nav={nav} focus={focus} onGo={setFocus} />}

        <div className={"z2-card dir-" + dir + (nudging ? " nudge" : "")} key={focus}>
          <Sheet
            key={focus}
            noteId={focus}
            text={note.text}
            notes={notes}
            autoFocus={armed}
            placeholder={focus === start ? "" : "…"}
            className={ruled ? "ruled" : "plain"}
            onChange={(t) => { updateNote(focus, t); markTyping(); }}
            onNavigate={(id) => setFocus(id, "none")}
            onSpill={onSpill}
            onTop={variant === "blatt" ? focusTitle : null}
          />
          <BelegFoot ids={belege[focus]} highlights={SEED_HIGHLIGHTS} sources={SEED_SOURCES} onOpen={openInbox} />
        </div>

        {/* Orientierung je Variante */}
        {variant === "karte" && <PeekEdges nav={nav} notes={notes} onGo={setFocus} onBranch={goBranch} />}
        {variant === "blatt" && <NavHint nav={nav} show={!typing} />}
      </div>

      {/* Ebenen */}
      {overlay === "cmdk" && (
        <CmdK {...ovProps}
          highlights={SEED_HIGHLIGHTS} sources={SEED_SOURCES}
          onOpenInbox={() => openInbox()} onOpenHighlight={(hid) => openInbox(hid)}
          onOpenGraph={() => openGraph("half")}
          currentEmpty={noteEmpty(focus)}
          folgeAddr={nextFolge(focus, notes)} verzweigAddr={nextVerzweig(focus, notes)}
          onCreateFolge={createFolge} onCreateVerzweig={createVerzweig}
          onNewZettel={createRoot}
          onOpenSettings={openSettings} />
      )}

      {graphMode && (
        <GraphDrawer mode={graphMode} closing={graphClosing} notes={notes} links={links} belege={belege} focus={focus}
          onPick={(id) => setFocus(id, "none")} onMode={setGraphMode} onClose={closeGraph} />
      )}
      {(overlay === "settings" || settingsClosing) && (
        <SettingsPanel settings={settings} onChange={setSettings} onClose={closeSettings} closing={settingsClosing}
          previewAddr={focus} previewReihe={note.reihe}
          previewText={((note.text || "").trim()) ? truncate(note.text.replace(/\s+/g, " ").trim(), 120) : null} />
      )}

      {inbox && (
        <HighlightsDrawer
          mode={inboxMode} closing={inboxClosing} onMode={setInboxMode} onClose={closeInbox}
          view={inbox} sources={SEED_SOURCES} highlights={SEED_HIGHLIGHTS} belege={belege} notes={notes}
          grouped={grouped} order={srcOrder} cursor={inbox.cursor} attachTarget={focus}
          lastSync={lastSync} syncing={syncing} onSync={doSync}
          onOpenSource={openSource} onOpenHl={openHl} onBack={backToSources} onBackToList={backToList}
          onSetCursor={(i) => setInbox((s) => ({ ...s, cursor: i }))}
          onProcessNew={null} onAttachTo={attachHL} onDetach={detachHL} onOpenNote={gotoNote}
          picking={inboxPicking} onSetPicking={setInboxPicking} />
      )}
    </div>
  );
}

/* Rand-Stummel der Nachbarzettel (Variante „Karteikarte") */
function PeekEdges({ nav, notes, onGo, onBranch }) {
  return (
    <>
      {nav.up && (
        <button className="z2-peek z2-peek-top" onClick={() => onGo(nav.up, "up")} title={"Vorgänger " + nav.up}>
          <span className="z2-peeklabel">{nav.up}</span>
        </button>
      )}
      <button className="z2-peek z2-peek-bottom" onClick={() => onGo(nav.down, "down")} title={nav.down ? "Folgezettel " + nav.down : "Folgezettel anlegen"}>
        <span className="z2-peeklabel">{nav.down || "+ Folge"}</span>
      </button>
      <button className="z2-peek z2-peek-right" onClick={onBranch} title={nav.branches[0] ? "Verzweigung " + nav.branches[0] : "Verzweigung anlegen"}>
        <span className="z2-peeklabel">{nav.branches[0] || "+ Ast"}</span>
      </button>
    </>
  );
}

/* Verblassende Hinweiszeile (Variante „Leeres Blatt") */
function NavHint({ nav, show }) {
  return (
    <div className={"z2-navhint" + (show ? " on" : "")}>
      <span><Kc k="⌘↑" />{nav.up || nav.parent || "—"}</span>
      <span><Kc k="⌘↓" />{nav.down || "anlegen"}</span>
      <span><Kc k="⌘→" />verzweigen</span>
      <span><Kc k="⌘K" />springen</span>
    </div>
  );
}

/* Faden links: Reihe als Ticks, aktueller Zettel als gefüllter Punkt (Variante „Faden") */
function ThreadRail({ nav, focus, onGo }) {
  const line = nav.line || [focus];
  return (
    <div className="z2-thread">
      <div className="z2-threadline" />
      {line.map((id) => {
        const cur = id === focus;
        return (
          <button key={id} className={"z2-tick" + (cur ? " cur" : "")} onClick={() => onGo(id, "none")} title={id}>
            <span className="z2-tickdot" />
            {cur && <span className="z2-tickaddr">{id}</span>}
          </button>
        );
      })}
      {nav.branches && nav.branches.length > 0 && (
        <button className="z2-branchtick" onClick={() => onGo(nav.branches[0], "right")} title={"Verzweigung " + nav.branches[0]}>
          <span className="z2-branchline" /><span className="z2-tickdot branch" />
        </button>
      )}
    </div>
  );
}

Object.assign(window, { ZettelApp, VARIANT_META });
