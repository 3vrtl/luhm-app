/* proto-app.jsx — Shell: Rail, Topbar mit Modus-Umschalter, State, Persistenz */
const { useState: useS, useEffect: useE, useRef: useR } = React;

const LS_KEY = "luhm.proto.v5-concept";

// Simulierter Readwise-Nachschub (wird beim Synchronisieren importiert)
const SYNC_SOURCES = {
  "src-forte": { title: "Building a Second Brain", author: "Tiago Forte", kind: "book", year: 2022 },
};
const SYNC_POOL = {
  "h-forte-1":   { src: "src-forte", text: "Notizen sind keine Aufbewahrung, sondern Bausteine — sie sind dazu da, neu kombiniert zu werden.", ort: "S. 58 · Kap. 4", imported: "2026-06-04", tags: ["Form", "Schreiben"] },
  "h-forte-2":   { src: "src-forte", text: "Der Wert einer Idee zeigt sich erst im Moment, in dem du sie mit einer anderen verknüpfst.", ort: "S. 73", imported: "2026-06-04", tags: ["Kontingenz"] },
  "h-weinberger-3": { src: "src-weinberger", text: "In einem Netz ist jeder Gedanke immer nur einen Verweis von seinem Widerspruch entfernt.", ort: "S. 44", imported: "2026-06-04", tags: ["Kontingenz", "Information"] },
};

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (s && s.focus && s.mode) return s;
  } catch {}
  return null;
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "registerVariante": "liste",
  "themenVariante": "karten",
  "leitsaetze": false,
  "quellenVariante": "quellen",
  "rueckverweisVariante": "marke",
  "schreibVariante": "gegenueber"
}/*EDITMODE-END*/;

/* ===== Erstkontakt: Willkommens-Overlay (P2) =====
   Erklärt in einem Atemzug, was Luhm ist, die drei Grundgesten und die fünf
   Beziehungen. Erscheint beim ersten Start, jederzeit über „?" oder Tweaks wieder. */
function WelcomeOverlay({ onClose }) {
  useE(() => {
    const k = (e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const Step = ({ n, title, children }) => (
    <div className="welcome-step">
      <span className="welcome-step-n mono">{n}</span>
      <div className="welcome-step-body"><b>{title}</b><span>{children}</span></div>
    </div>
  );
  return (
    <div className="welcome-scrim" onMouseDown={onClose}>
      <div className="welcome" onMouseDown={(e) => e.stopPropagation()}>
        <button className="help-x welcome-x" onClick={onClose} title="Schließen"><Ic.close /></button>
        <div className="welcome-mast">
          <div className="welcome-logo serif">Luhm</div>
          <div className="welcome-tag serif">Ein Zettelkasten, der mitdenkt.</div>
        </div>
        <p className="welcome-lead">
          Du schreibst kurze Zettel — ein Gedanke pro Karte. Jeder bekommt eine feste
          Adresse wie <span className="mono" style={{ color: "var(--accent-ink)" }}>21/3a</span>, die sich nie ändert.
          Statt in Ordnern zu sortieren, <em>verbindest</em> du Zettel. Luhm merkt sich, was du
          verknüpfst, und schlägt leise vor, was du übersehen hast.
        </p>
        <div className="welcome-steps">
          <Step n="1" title="Weiterschreiben">Hängt einen Folgezettel an und führt einen Gedanken in gerader Linie fort.</Step>
          <Step n="2" title="Verzweigen">Öffnet einen Nebenast, statt den Hauptstrang zu verwässern.</Step>
          <Step n="3" title="Verweisen">Mit <span className="mono">@adresse</span> verbindest du Entferntes — nur hier hilft die KI.</Step>
        </div>
        <div className="welcome-rels">
          <span className="seclabel" style={{ display: "block", marginBottom: 11 }}>Die fünf Beziehungen</span>
          <div className="welcome-rels-grid">
            <span className="help-rel"><span className="reldot vor" /> Vorgänger</span>
            <span className="help-rel"><span className="reldot folge" /> Folgezettel</span>
            <span className="help-rel"><span className="reldot verzweig" /> Verzweigung</span>
            <span className="help-rel"><span className="reldot verweis" /> Verweis</span>
            <span className="help-rel"><span className="reldot ki" /> Vermutung</span>
          </div>
        </div>
        <div className="welcome-foot">
          <button className="pill solid" onClick={onClose}><Ic.read /> Loslegen</button>
          <span className="welcome-hint">Jederzeit über <span className="kbd">?</span> wieder aufrufbar</span>
        </div>
      </div>
    </div>
  );
}

/* ===== Leerzustand: der leere Kasten (P2) ===== */
function EmptyKasten({ onWrite, onExample, onIntro }) {
  return (
    <div className="empty-wrap">
      <div className="empty-inner">
        <div className="empty-mark"><Ic.cards /></div>
        <h1 className="empty-title serif">Dein Kasten ist leer.</h1>
        <p className="empty-sub">
          Der erste Zettel ist der schwerste. Schreib einen Gedanken — kurz, in einem Satz.
          Der Rest wächst von selbst, Verbindung um Verbindung.
        </p>
        <div className="empty-acts">
          <button className="pill solid" onClick={onWrite}><Ic.plus /> Ersten Zettel schreiben</button>
          <button className="pill" onClick={onExample}><Ic.layers /> Beispiel-Kasten laden</button>
        </div>
        <button className="empty-intro" onClick={onIntro}>Wie funktioniert Luhm?</button>
      </div>
    </div>
  );
}

function App() {
  const saved = loadState();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [focus, setFocus] = useS(saved?.focus || "1/1");
  const [mode, setMode] = useS(saved?.mode || "lesen");
  // Übersicht ist die Startseite (außer eine Sitzung wird fortgesetzt)
  const [screen, setScreen] = useS(saved?.screen || (saved ? "note" : "overview"));
  // veränderbarer Graph (Folgezettel können hinzukommen)
  const [notes, setNotes] = useS(() => saved?.notes || SEED_NOTES);
  const [links, setLinks] = useS(() => saved?.links || SEED_LINKS);
  const [hubs, setHubs] = useS(() => saved?.hubs || SEED_HUBS);
  const [sources, setSources] = useS(() => saved?.sources || SEED_SOURCES);
  const [highlights, setHighlights] = useS(() => saved?.highlights || SEED_HIGHLIGHTS);
  const [belege, setBelege] = useS(() => saved?.belege || SEED_BELEGE);
  const [toast, setToast] = useS(null);
  // transiente UI-Zustände
  const [sel, setSel] = useS([]);            // ausgewählte Highlights (Werkbank)
  const [werkbank, setWerkbank] = useS(false);
  const [picker, setPicker] = useS(null);    // { exclude, onConfirm }
  const [pendBelege, setPendBelege] = useS([]); // Belege für den nächsten geschriebenen Zettel
  const [syncing, setSyncing] = useS(false);
  const [lastSync, setLastSync] = useS("vor 2 Std. synchronisiert");
  const [vaultPath, setVaultPath] = useS(saved?.vaultPath || "~/Zettelkasten");
  const [autoSaveMd, setAutoSaveMd] = useS(saved?.autoSaveMd !== undefined ? saved.autoSaveMd : true);
  const [mdView, setMdView] = useS(null);
  // Themen / Übersichtszettel
  const [activeTheme, setActiveTheme] = useS(() => saved?.activeTheme || null); // hubId, dessen Banner über dem Zettel liegt
  const [editHub, setEditHub] = useS(null);     // hubId → Editor-Modal offen
  const [hubPick, setHubPick] = useS(null);     // hubId → Zettel verknüpfen
  const [themePick, setThemePick] = useS(null); // noteId → Thema zuordnen
  // KI-Vermutung: Lern-/Feedback-Zustand
  const [affinity, setAffinity] = useS(() => saved?.affinity || {});
  const [kiFeedback, setKiFeedback] = useS(() => saved?.kiFeedback || { accepted: 0, rejected: 0 });
  // Tastatur-Overlays
  const [paletteOpen, setPaletteOpen] = useS(false);
  const [helpOpen, setHelpOpen] = useS(false);
  const [welcome, setWelcome] = useS(() => !saved);
  const [editReq, setEditReq] = useS(0);  // Signal: aktuellen Zettel bearbeiten
  const [schreibArt, setSchreibArt] = useS("folge");  // "folge" (weiterschreiben) | "verzweig"

  useE(() => {
    localStorage.setItem(LS_KEY, JSON.stringify({ focus, mode, screen, notes, links, hubs, activeTheme, sources, highlights, belege, vaultPath, autoSaveMd, affinity, kiFeedback }));
  }, [focus, mode, screen, notes, links, hubs, activeTheme, sources, highlights, belege, vaultPath, autoSaveMd, affinity, kiFeedback]);

  // Themen-Banner nur halten, solange man im selben Reihen-Bereich liest; sonst verlassen
  useE(() => {
    if (screen !== "note") { if (activeTheme) setActiveTheme(null); return; }
    if (activeTheme && hubs[activeTheme] && notes[focus] && notes[focus].reihe !== hubs[activeTheme].reihe) setActiveTheme(null);
  }, [focus, screen]);

  useE(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const histRef = useR([]);
  const open = (id) => { if (notes[id] && id !== focus) { histRef.current.push(focus); setFocus(id); } };
  const back = () => { const h = histRef.current; if (h.length) setFocus(h.pop()); };

  // Einstieg aus der Übersicht: direkt im Lesen-Modus beim gewählten Zettel
  const enter = (id) => { if (notes[id]) { histRef.current = []; setFocus(id); setMode("lesen"); setScreen("note"); } };

  // Weiterschreiben (Folgezettel) vs. Verzweigen (Verzweigung) — Schreibmodus mit Art
  const startWrite = (art) => { setSchreibArt(art); setScreen("note"); setMode("schreiben"); };

  // räumliche Navigation = Kompass: ↑ Vorgänger der Reihe · ↓ Folgezettel ·
  // → in die Verzweigung (rechts) · ← zum übergeordneten Zettel (links).
  const navDir = (dir) => {
    const ids = Object.keys(notes);
    const nav = reiheNav(focus, links, ids);
    if (dir === "up") { if (nav.up) open(nav.up); }
    else if (dir === "down") { if (nav.down) open(nav.down); }
    else if (dir === "right") { if (nav.branches[0]) open(nav.branches[0]); }
    else if (dir === "left") { if (nav.left) open(nav.left); }
  };

  // Tastatur im Lesen-Modus: Pfeile = Baum, Buchstaben = Aktionen
  useE(() => {
    if (mode !== "lesen" || screen !== "note") return;
    const onKey = (e) => {
      if (window.__overlayOpen) return;
      const tag = (document.activeElement || {}).tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowRight: "right", ArrowLeft: "left" };
      if (map[e.key]) { e.preventDefault(); navDir(map[e.key]); return; }
      switch (e.key) {
        case "e": e.preventDefault(); setEditReq((n) => n + 1); break;
        case "w": e.preventDefault(); startWrite("folge"); break;
        case "v": e.preventDefault(); startWrite("verzweig"); break;
        case "g": e.preventDefault(); setMode("graph"); break;
        case "b": e.preventDefault(); openPicker(belegeOf(focus, belege), (ids) => attachBelege(focus, ids)); break;
        case "t": e.preventDefault(); setThemePick(focus); break;
        case "Backspace": if (histRef.current.length) { e.preventDefault(); back(); } break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, screen, focus, links, notes, belege]);

  // ----- Globale Tasten: Palette (⌘K / /), Hilfe (?), Screens (1/2/3), Esc -----
  const anyModal = werkbank || !!picker || !!mdView || !!editHub || !!hubPick || !!themePick;
  const anyOverlay = anyModal || paletteOpen || helpOpen;
  useE(() => { window.__overlayOpen = anyOverlay; }, [anyOverlay]);
  useE(() => {
    const onKey = (e) => {
      const tag = (document.activeElement || {}).tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      // ⌘K / Strg+K — Palette, auch beim Tippen
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault(); setHelpOpen(false); setPaletteOpen(true); return;
      }
      // Esc schließt das oberste Overlay (auch aus Feldern heraus)
      if (e.key === "Escape") {
        if (paletteOpen) { setPaletteOpen(false); return; }
        if (helpOpen) { setHelpOpen(false); return; }
        if (themePick) { setThemePick(null); return; }
        if (hubPick) { setHubPick(null); return; }
        if (editHub) { setEditHub(null); return; }
        if (mdView) { setMdView(null); return; }
        if (picker) { setPicker(null); return; }
        if (werkbank) { setWerkbank(false); return; }
        if (screen === "note" && (mode === "schreiben" || mode === "graph")) { setMode("lesen"); return; }
        return;
      }
      if (typing || anyOverlay) return;
      if (e.key === "/") { e.preventDefault(); setPaletteOpen(true); return; }
      if (e.key === "?") { e.preventDefault(); setHelpOpen(true); return; }
      if (e.key === "1") { e.preventDefault(); setScreen("overview"); return; }
      if (e.key === "2") { e.preventDefault(); setScreen("note"); return; }
      if (e.key === "3") { e.preventDefault(); setScreen("quellen"); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen, helpOpen, anyModal, anyOverlay, werkbank, picker, mdView, editHub, hubPick, themePick, mode, screen]);

  const append = (text, belegeIds = []) => {
    // Folgezettel = Geschwister (Reihe fortsetzen) · Verzweigung = Kind (Seitenast)
    const newId = schreibArt === "verzweig" ? nextVerzweig(focus, notes) : nextFolge(focus, notes);
    const parent = schreibArt === "verzweig" ? focus : (focus.includes("/") ? (parentOf(focus, links) || focus) : focus);
    const relKey = schreibArt === "verzweig" ? "verzweig" : "folge";
    const refs = [...new Set((text.match(/@([0-9][0-9a-z]*(?:\/[0-9a-z]+)*)/gi) || []).map((s) => s.slice(1).toLowerCase()))].filter((a) => a !== newId && notes[a]);
    setNotes((prev) => ({ ...prev, [newId]: { text, tags: [], reihe: (prev[parent] || prev[focus]).reihe } }));
    setLinks((prev) => {
      const cur = prev[parent] || {};
      return {
        ...prev,
        [parent]: { ...cur, [relKey]: [...(cur[relKey] || []), newId] },
        [newId]: { vorg: parent, ...(refs.length ? { verweis: refs } : {}) },
      };
    });
    if (belegeIds.length) setBelege((prev) => ({ ...prev, [newId]: belegeIds }));
    setPendBelege([]);
    setToast(autoSaveMd ? { plain: true, id: "Zettel " + newId + " · als " + fileForZettel(newId) + " gespeichert" } : { id: newId });
  };

  const editNote = (id, text) => {
    const refs = [...new Set((text.match(/@([0-9][0-9a-z]*(?:\/[0-9a-z]+)*)/gi) || []).map((s) => s.slice(1).toLowerCase()))].filter((a) => a !== id && notes[a]);
    setNotes((prev) => ({ ...prev, [id]: { ...prev[id], text } }));
    setLinks((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), verweis: refs } }));
    setToast({ id, verb: "gespeichert" });
  };

  const editTags = (id, tags) => {
    setNotes((prev) => ({ ...prev, [id]: { ...prev[id], tags } }));
    setToast({ id, verb: "Schlagwörter aktualisiert" });
  };

  // Stammnummer (Wurzel) umbenennen — zieht alle abhängigen Adressen mit
  const renameStamm = (oldRoot, newRoot) => {
    const res = renameStammnummer({ notes, links, belege, hubs }, oldRoot, newRoot);
    if (!res) { setToast({ plain: true, id: "Nummer „" + newRoot + "“ ist ungültig oder schon vergeben" }); return false; }
    setNotes(res.notes); setLinks(res.links); setBelege(res.belege); setHubs(res.hubs);
    if (res.map[focus]) setFocus(res.map[focus]);
    histRef.current = histRef.current.map((id) => res.map[id] || id);
    setToast({ plain: true, id: "Stammnummer " + oldRoot + " → " + newRoot + " (alle Unterzettel angepasst)" });
    return true;
  };

  // ----- Themen / Übersichtszettel (Hubs) -----
  // Thema betreten = nahtlos in seinen Einstiegszettel springen, Banner einblenden
  const enterTheme = (hubId) => {
    const h = hubs[hubId];
    if (!h) return;
    const eid = h.eintraege[0];
    if (eid && notes[eid]) { setActiveTheme(hubId); histRef.current = []; setFocus(eid); setMode("lesen"); setScreen("note"); }
    else { setActiveTheme(hubId); setEditHub(hubId); }  // leeres Thema: erst einrichten
  };
  const nextHubId = () => { let n = 1; while (hubs["h" + n]) n++; return "h" + n; };
  const createHub = (reihe, firstEntry) => {
    const id = nextHubId();
    setHubs((prev) => ({ ...prev, [id]: { reihe, titel: "Neues Thema", leitsatz: "", eintraege: firstEntry ? [firstEntry] : [] } }));
    setThemePick(null);
    if (firstEntry) setActiveTheme(id);
    setEditHub(id);  // direkt benennen
    setToast({ plain: true, id: "Neues Thema in Reihe „" + reihe + "“ angelegt" });
  };
  const editHubMeta = (id, meta) => {
    setHubs((prev) => ({ ...prev, [id]: { ...prev[id], ...meta } }));
  };
  const addHubEntry = (hubId, entryId) => {
    setHubs((prev) => {
      const h = prev[hubId];
      if (!h || h.eintraege.includes(entryId)) return prev;
      return { ...prev, [hubId]: { ...h, eintraege: [...h.eintraege, entryId] } };
    });
    setHubPick(null); setThemePick(null);
    if (!editHub) setActiveTheme(hubId);
    setToast({ plain: true, id: entryId + " ist jetzt Einstieg in „" + hubs[hubId].titel + "“" });
  };
  const removeHubEntry = (hubId, entryId) =>
    setHubs((prev) => ({ ...prev, [hubId]: { ...prev[hubId], eintraege: prev[hubId].eintraege.filter((x) => x !== entryId) } }));
  const moveHubEntry = (hubId, i, dir) => setHubs((prev) => {
    const arr = [...prev[hubId].eintraege]; const j = i + dir;
    if (j < 0 || j >= arr.length) return prev;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return { ...prev, [hubId]: { ...prev[hubId], eintraege: arr } };
  });
  const deleteHub = (id) => {
    setHubs((prev) => {
      const n = { ...prev }; delete n[id];
      return n;
    });
    setEditHub(null);
    if (activeTheme === id) setActiveTheme(null);
    setToast({ plain: true, id: "Thema gelöscht" });
  };

  // ----- Highlights & Belege -----
  const reihen = [...new Set(Object.values(notes).map((n) => n.reihe).filter(Boolean))];
  const toggleSel = (hid) => setSel((p) => p.includes(hid) ? p.filter((x) => x !== hid) : [...p, hid]);
  const openPicker = (exclude, onConfirm) => setPicker({ exclude, onConfirm });

  const createFromHighlights = (reihe, text, ids) => {
    const newId = nextRootId(notes);
    setNotes((prev) => ({ ...prev, [newId]: { text, tags: [], reihe } }));
    setLinks((prev) => ({ ...prev, [newId]: {} }));
    setBelege((prev) => ({ ...prev, [newId]: ids }));
    setSel([]); setWerkbank(false);
    histRef.current = []; setFocus(newId); setMode("lesen"); setScreen("note");
    setToast(autoSaveMd ? { plain: true, id: "Zettel " + newId + " · als " + fileForZettel(newId) + " gespeichert" } : { id: newId, verb: "angelegt" });
  };

  const attachBelege = (noteId, ids) => {
    setBelege((prev) => ({ ...prev, [noteId]: [...new Set([...(prev[noteId] || []), ...ids])] }));
    setToast({ id: noteId, verb: "belegt" });
  };
  const removeBeleg = (noteId, hid) => setBelege((prev) => ({ ...prev, [noteId]: (prev[noteId] || []).filter((x) => x !== hid) }));
  // aus einem einzelnen Highlight heraus einen Zettel schreiben (Werkbank mit dieser einen Stelle)
  const writeFrom = (hid) => { setSel([hid]); setWerkbank(true); };

  // Markdown-Export
  const openMd = (kind, id) => {
    if (kind === "zettel") setMdView({ title: "Zettel " + id, filename: fileForZettel(id), text: mdForZettel(id, { notes, links, belege, highlights, sources }) });
    else setMdView({ title: sources[highlights[id].src].title, filename: fileForHighlight(id, highlights, sources), text: mdForHighlight(id, { highlights, sources }) });
  };
  const saveMd = () => { if (mdView) setToast({ plain: true, id: "gespeichert in " + vaultPath + "/" + mdView.filename }); setMdView(null); };

  // ----- KI-Vermutung: Live-Begründung + Feedback-Lernen -----
  const whyKi = async (f, id) => {
    const a = notes[f].text, b = notes[id].text;
    const prompt = "Du bist ein Zettelkasten-Assistent. Zwei Notizen:\nA: \"" + a + "\"\nB: \"" + b + "\"\nNenne in EINEM kurzen deutschen Satz (ohne Einleitung, ohne Anführungszeichen), worin ihre gedankliche Verbindung besteht.";
    if (window.claude && window.claude.complete) {
      const r = await window.claude.complete(prompt);
      return (r || "").trim().replace(/^["'„]|["'“]$/g, "");
    }
    await new Promise((r) => setTimeout(r, 700));
    return "Beide kreisen um denselben Gedanken — aus unterschiedlicher Richtung.";
  };
  const kiConfidence = (id) => {
    const a = affinity[notes[id] && notes[id].reihe] || 0;
    if (a > 0) return { cls: "hi", label: "hohe Übereinstimmung" };
    if (a < 0) return { cls: "lo", label: "niedrige Übereinstimmung" };
    return { cls: "mid", label: "mögliche Verbindung" };
  };
  const acceptKi = (f, id) => {
    setLinks((prev) => {
      const cur = prev[f] || {};
      return { ...prev, [f]: { ...cur, ki: (cur.ki || []).filter((x) => x !== id), verweis: [...new Set([...(cur.verweis || []), id])] } };
    });
    const r = notes[id] && notes[id].reihe;
    setAffinity((prev) => ({ ...prev, [r]: (prev[r] || 0) + 1 }));
    setKiFeedback((prev) => ({ ...prev, accepted: prev.accepted + 1 }));
    setToast({ plain: true, id: "Verweis zu " + id + " übernommen · Luhm lernt" });
  };
  const rejectKi = (f, id) => {
    setLinks((prev) => { const cur = prev[f] || {}; return { ...prev, [f]: { ...cur, ki: (cur.ki || []).filter((x) => x !== id) } }; });
    const r = notes[id] && notes[id].reihe;
    setAffinity((prev) => ({ ...prev, [r]: (prev[r] || 0) - 1 }));
    setKiFeedback((prev) => ({ ...prev, rejected: prev.rejected + 1 }));
    setToast({ plain: true, id: "Vorschlag verworfen · Luhm lernt" });
  };

  const doSync = () => {
    if (syncing) return;
    setSyncing(true);
    setTimeout(() => {
      const take = Object.keys(SYNC_POOL).filter((id) => !highlights[id]).slice(0, 2);
      if (take.length) {
        setSources((prev) => ({ ...prev, ...SYNC_SOURCES }));
        setHighlights((prev) => { const n = { ...prev }; take.forEach((id) => { n[id] = SYNC_POOL[id]; }); return n; });
        setToast({ plain: true, id: take.length + " neue Highlights importiert" + (autoSaveMd ? " · als Markdown gespeichert" : "") });
      } else {
        setToast({ plain: true, id: "Alles aktuell — keine neuen Highlights" });
      }
      setLastSync("gerade eben synchronisiert");
      setSyncing(false);
    }, 850);
  };

  const loadExample = () => {
    setNotes(SEED_NOTES); setLinks(SEED_LINKS); setHubs(SEED_HUBS);
    setSources(SEED_SOURCES); setHighlights(SEED_HIGHLIGHTS); setBelege(SEED_BELEGE);
    setActiveTheme(null); setFocus("1/1"); setMode("lesen"); setScreen("overview");
    setToast({ plain: true, id: "Beispiel-Kasten geladen" });
  };
  const clearAll = () => {
    setNotes({}); setLinks({}); setHubs({}); setBelege({});
    setActiveTheme(null); setEditHub(null); setHubPick(null); setThemePick(null);
    setSel([]); setPendBelege([]); setWerkbank(false); setPicker(null);
    setToast({ plain: true, id: "Kasten geleert — so beginnt der Erstkontakt" });
  };
  const writeFirst = () => {
    const id = "1";
    setNotes({ [id]: { text: "", tags: [], reihe: "Reihe 1" } });
    setLinks({ [id]: {} }); setHubs({}); setBelege({});
    setFocus(id); setMode("lesen"); setScreen("note"); setEditReq((n) => n + 1);
  };

  const reset = () => {
    localStorage.removeItem(LS_KEY);
    setNotes(SEED_NOTES); setLinks(SEED_LINKS); setSources(SEED_SOURCES); setHighlights(SEED_HIGHLIGHTS); setBelege(SEED_BELEGE);
    setHubs(SEED_HUBS); setActiveTheme(null); setEditHub(null); setHubPick(null); setThemePick(null);
    setSel([]); setPendBelege([]); setWerkbank(false); setPicker(null);
    setAffinity({}); setKiFeedback({ accepted: 0, rejected: 0 });
    setFocus("1/1"); setMode("lesen"); setScreen("overview");
  };

  const modes = [
    { key: "lesen", label: "Lesen", Icon: Ic.read },
    { key: "schreiben", label: "Schreiben", Icon: Ic.write },
    { key: "graph", label: "Graph", Icon: Ic.graph },
  ];

  const trail = focus.split("/");
  const isEmpty = Object.keys(notes).length === 0;
  // Vorgänger-Kette bis zur Wurzel (klickbare Breadcrumb)
  const crumbTrail = (() => {
    const chain = []; let cur = focus; const seen = new Set();
    while (cur && notes[cur] && !seen.has(cur)) { seen.add(cur); chain.unshift(cur); cur = links[cur] && links[cur].vorg; }
    return chain.length ? chain : [focus];
  })();

  // Befehle der Sprung-/Befehlspalette (⌘K)
  const commands = [
    { label: "Übersicht", hint: "1", icon: <Ic.overview />, keywords: "register übersicht start home", run: () => setScreen("overview") },
    { label: "Zettel-Ansicht", hint: "2", icon: <Ic.cards />, keywords: "zettel note lesen", run: () => setScreen("note") },
    { label: "Bibliothek / Quellen", hint: "3", icon: <Ic.books />, keywords: "quellen bibliothek highlights readwise", run: () => setScreen("quellen") },
    { label: "Aktuellen Zettel bearbeiten", hint: "e", icon: <Ic.write />, keywords: "edit bearbeiten ändern", run: () => { setScreen("note"); setMode("lesen"); setEditReq((n) => n + 1); } },
    { label: "Weiterschreiben (Folgezettel)", hint: "w", icon: <Ic.plus />, keywords: "schreiben folgezettel weiter reihe anhängen", run: () => startWrite("folge") },
    { label: "Verzweigen (Seitenast)", hint: "v", icon: <Ic.branch />, keywords: "verzweigen verzweigung ast abzweig", run: () => startWrite("verzweig") },
    { label: "Im Graph ansehen", hint: "g", icon: <Ic.graph />, keywords: "graph netz verbindungen", run: () => { setScreen("note"); setMode("graph"); } },
    { label: "Quellen synchronisieren", icon: <Ic.sync />, keywords: "sync readwise import highlights", run: doSync },
    { label: "Tastatur-Hilfe", hint: "?", icon: <Ic.search />, keywords: "hilfe help shortcuts tastatur tasten", run: () => setHelpOpen(true) },
    { label: "Einführung zeigen", icon: <Ic.read />, keywords: "einführung onboarding willkommen erstkontakt start", run: () => setWelcome(true) },
    { label: "Alles zurücksetzen", icon: <Ic.spark />, keywords: "reset zurücksetzen demo", run: reset },
  ];

  return (
    <React.Fragment>
      {/* Rail */}
      <div className="rail">
        <div className="logo" title="Übersicht" onClick={() => setScreen("overview")} style={{ cursor: "pointer" }}>L</div>
        <button className={"railbtn" + (screen === "overview" ? " active" : "")} title="Übersicht · 1" onClick={() => setScreen("overview")}><Ic.overview /></button>
        <button className={"railbtn" + (screen === "note" ? " active" : "")} title="Zettel · 2" onClick={() => setScreen("note")}><Ic.cards /></button>
        <button className={"railbtn" + (screen === "quellen" ? " active" : "")} title="Bibliothek · 3" onClick={() => setScreen("quellen")}><Ic.books /></button>
        <div style={{ flex: 1 }} />
        <button className="railbtn" title="Tastatur-Hilfe · ?" onClick={() => setHelpOpen(true)} style={{ color: "var(--ink-ghost)" }}><Ic.search /></button>
        <button className="railbtn" title="Zurücksetzen" onClick={reset} style={{ color: "var(--ink-ghost)" }}><Ic.spark /></button>
        <button className="railbtn" title="Neuer Zettel" style={{ background: "var(--ink)", color: "var(--paper)" }}><Ic.plus /></button>
      </div>

      {/* Hauptspalte */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div className="topbar">
          {isEmpty ? (
            <span className="crumb" style={{ letterSpacing: ".02em" }}>Luhm · Leerer Kasten</span>
          ) : screen === "overview" ? (
            <span className="crumb" style={{ letterSpacing: ".02em" }}>Register · Übersicht</span>
          ) : screen === "quellen" ? (
            <span className="crumb" style={{ letterSpacing: ".02em" }}>Quellen · Bibliothek</span>
          ) : (
            <span className="crumb">
              {crumbTrail.map((id, i) => (
                <React.Fragment key={id}>
                  {i > 0 && <span className="sep">›</span>}
                  {id === focus
                    ? <span style={{ color: "var(--accent-ink)" }}>{id}</span>
                    : <span className="seg-id" style={{ color: "var(--ink-faint)" }} onClick={() => open(id)} title={"Zu " + id + " springen"}>{id}</span>}
                </React.Fragment>
              ))}
            </span>
          )}

          <div style={{ flex: 1 }} />

          <button className="kbhint" onClick={() => setPaletteOpen(true)} title="Springen & Befehle">
            <Ic.search /> Springe zu <span className="kbd">⌘K</span>
          </button>
          <button className="kbhelp" onClick={() => setHelpOpen(true)} title="Tastenkürzel (?)">?</button>
        </div>

        <div className="stage">
          {isEmpty ? (
            <div className="fade" key="empty">
              <EmptyKasten onWrite={writeFirst} onExample={loadExample} onIntro={() => setWelcome(true)} />
            </div>
          ) : screen === "overview" ? (
            <div className="fade" key="overview">
              <OverviewMode notes={notes} links={links} hubs={hubs} onEnter={enter} onOpenHub={enterTheme} onNewHub={createHub} onRenameStamm={renameStamm} variant={t.registerVariante} themenVariante={t.themenVariante} showLeads={t.leitsaetze} />
            </div>
          ) : screen === "quellen" ? (
            <div className="fade" key="quellen">
              <QuellenMode sources={sources} highlights={highlights} belege={belege} sel={sel} onToggle={toggleSel} onEnterNote={enter} onSync={doSync} syncing={syncing} lastSync={lastSync} onWriteFrom={writeFrom} vaultPath={vaultPath} autoSaveMd={autoSaveMd} onVaultChange={setVaultPath} onToggleAutoSave={() => setAutoSaveMd((v) => !v)} onOpenMd={openMd} />
            </div>
          ) : (
            <div className="fade" key={mode + ":" + focus}>
              {mode === "lesen" && <LesenMode focus={focus} notes={notes} links={links} onOpen={open} onMode={setMode} onWrite={startWrite} onEdit={editNote} onEditTags={editTags} onNav={navDir} canBack={histRef.current.length > 0} backId={histRef.current[histRef.current.length - 1] || null} editReq={editReq}
                activeTheme={activeTheme && hubs[activeTheme] ? hubs[activeTheme] : null} activeThemeId={activeTheme}
                onEnterEntry={open} onEditTheme={(hid) => setEditHub(hid || activeTheme)} onExitTheme={() => setActiveTheme(null)}
                onAddThemeEntry={(hid) => (hid || activeTheme) && setHubPick(hid || activeTheme)}
                entryFor={Object.keys(hubs).filter((hid) => hid !== activeTheme && hubs[hid].eintraege.includes(focus)).map((hid) => ({ id: hid, ...hubs[hid] }))}
                onOpenTheme={enterTheme}
                belege={belege} highlights={highlights} sources={sources}
                onOpenQuelle={() => setScreen("quellen")}
                onAttachBeleg={() => openPicker(belegeOf(focus, belege), (ids) => attachBelege(focus, ids))}
                onRemoveBeleg={removeBeleg} onOpenMd={openMd} onAddToHub={() => setThemePick(focus)}
                onAcceptKi={acceptKi} onRejectKi={rejectKi} onWhyKi={whyKi} kiConfidence={kiConfidence} feedbackStats={kiFeedback} rueckverweisVariante={t.rueckverweisVariante} />}
              {mode === "schreiben" && <SchreibenMode focus={focus} notes={notes} links={links} onOpen={open} onAppend={append} onMode={setMode} art={schreibArt}
                highlights={highlights} sources={sources} pendBelege={pendBelege} variant={t.schreibVariante}
                onOpenPicker={() => openPicker(pendBelege, (ids) => setPendBelege((p) => [...new Set([...p, ...ids])]))}
                onRemovePend={(hid) => setPendBelege((p) => p.filter((x) => x !== hid))} />}
              {mode === "graph" && <GraphMode focus={focus} notes={notes} links={links} onOpen={open} onMode={setMode} />}
            </div>
          )}
        </div>
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Konzeptentwurf" />
        <TweakButton label="Einführung erneut zeigen" onClick={() => setWelcome(true)} />
        <TweakToggle label="Leerer Kasten (Erstkontakt)" value={isEmpty}
          onChange={(v) => (v ? clearAll() : loadExample())} />
        <TweakSection label="Register" />
        <TweakRadio label="Variante" value={t.registerVariante}
          options={[{ value: "liste", label: "Liste" }, { value: "karten", label: "Karten" }]}
          onChange={(v) => { setTweak("registerVariante", v); setScreen("overview"); }} />
        <TweakToggle label="Leitsätze zeigen" value={t.leitsaetze}
          onChange={(v) => { setTweak("leitsaetze", v); setScreen("overview"); }} />
        <TweakSection label="Themen / Übersichtszettel" />
        <TweakRadio label="Darstellung je Reihe" value={t.themenVariante}
          options={[{ value: "karten", label: "Karten" }, { value: "kompakt", label: "Kompakt" }]}
          onChange={(v) => { setTweak("themenVariante", v); setScreen("overview"); }} />
        <TweakSection label="Rückverweise" />
        <TweakRadio label="Konzept" value={t.rueckverweisVariante}
          options={[{ value: "marke", label: "Marke" }, { value: "fuss", label: "Fußzeile" }, { value: "marginalie", label: "Marginalie" }]}
          onChange={(v) => setTweak("rueckverweisVariante", v)} />
        <TweakSection label="Weiterschreiben" />
        <TweakRadio label="Konzept" value={t.schreibVariante}
          options={[{ value: "gegenueber", label: "Gegenüber" }, { value: "anbau", label: "Anbau" }, { value: "werkstatt", label: "Werkstatt" }, { value: "randspalte", label: "Randspalte" }]}
          onChange={(v) => { setTweak("schreibVariante", v); setScreen("note"); setMode("schreiben"); }} />
      </TweaksPanel>

      {screen === "quellen" && <SelectionBar sel={sel} onOpen={() => setWerkbank(true)} onClear={() => setSel([])} />}
      {werkbank && <Werkbank sel={sel} highlights={highlights} sources={sources} reihen={reihen} onCreate={createFromHighlights} onClose={() => setWerkbank(false)} onRemove={toggleSel} />}
      {picker && <HighlightPicker highlights={highlights} sources={sources} belege={belege} exclude={picker.exclude} onConfirm={(ids) => { picker.onConfirm(ids); setPicker(null); }} onClose={() => setPicker(null)} />}
      {mdView && <MarkdownModal view={mdView} vaultPath={vaultPath} onSave={saveMd} onClose={() => setMdView(null)} />}
      {editHub && hubs[editHub] && (
        <HubEditor id={editHub} hubs={hubs} notes={notes}
          onEnter={(eid) => { setActiveTheme(editHub); setEditHub(null); histRef.current = []; setFocus(eid); setMode("lesen"); setScreen("note"); }}
          onEditMeta={editHubMeta} onAddEntry={(hid) => setHubPick(hid)} onRemoveEntry={removeHubEntry} onMoveEntry={moveHubEntry}
          onDelete={deleteHub} onClose={() => setEditHub(null)} />
      )}
      {hubPick && hubs[hubPick] && (() => {
        const rp = buildPaths(notes, links).find((p) => p.reihe === hubs[hubPick].reihe);
        const order = rp ? [...rp.chain, ...rp.branches.map((b) => b.id)] : [];
        return <HubEntryPicker hub={hubPick} hubs={hubs} notes={notes} order={order} onConfirm={addHubEntry} onClose={() => setHubPick(null)} />;
      })()}
      {themePick && notes[themePick] && <ThemePicker noteId={themePick} hubs={hubs} notes={notes} onAdd={addHubEntry} onCreate={createHub} onClose={() => setThemePick(null)} />}

      {toast && (
        <div className="toast">
          <Ic.check style={{ width: 16, height: 16, color: "oklch(0.78 0.13 150)" }} />
          {toast.plain ? toast.id : <React.Fragment>Zettel <span className="mono" style={{ color: "var(--paper)", fontWeight: 600 }}>{toast.id}</span> {toast.verb || "angehängt"}</React.Fragment>}
        </div>
      )}

      {paletteOpen && <CommandPalette notes={notes} commands={commands} onJump={(id) => enter(id)} onClose={() => setPaletteOpen(false)} />}
      {helpOpen && <HelpOverlay screen={screen} mode={mode} onClose={() => setHelpOpen(false)} />}
      {welcome && <WelcomeOverlay onClose={() => setWelcome(false)} />}
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
