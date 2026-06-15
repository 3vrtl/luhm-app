/* proto-keys.jsx — Tastatur-Bedienkonzept: Befehlspalette (⌘K) + Hilfe (?) + Keycap */
const { useState: useKS, useEffect: useKE, useRef: useKR, useMemo: useKM } = React;

/* kleine Taste */
function Kbd({ children }) { return <span className="kbd">{children}</span>; }

/* ---------- Befehls-/Sprungpalette (⌘K) ----------
   Sucht zugleich in Befehlen und in allen Zetteln (Adresse ODER Inhalt).
   Befehle zuerst, dann Zettel. ↑/↓ wählt · ↵ führt aus/springt · Esc schließt. */
function CommandPalette({ notes, commands, onJump, onClose }) {
  const [q, setQ] = useKS("");
  const [sel, setSel] = useKS(0);
  const listRef = useKR(null);

  const ql = q.trim().toLowerCase();
  const tokens = ql.split(/\s+/).filter(Boolean);

  const cmdHits = useKM(() => {
    if (!tokens.length) return commands;
    return commands.filter((c) => {
      const hay = (c.label + " " + (c.keywords || "")).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
  }, [ql, commands]);

  const zettelHits = useKM(() => {
    const ids = Object.keys(notes);
    if (!tokens.length) return [];
    const scored = ids.map((id) => {
      const idl = id.toLowerCase();
      const nt = notes[id];
      const hay = (idl + " " + (nt.text || "") + " " + (nt.reihe || "") + " " + (nt.tags || []).join(" ")).toLowerCase();
      if (!tokens.every((t) => hay.includes(t))) return null;
      let score = 0;
      if (idl === tokens[0]) score += 6;
      else if (idl.startsWith(tokens[0])) score += 4;
      else if (idl.includes(tokens[0])) score += 2;
      return { id, score };
    }).filter(Boolean);
    scored.sort((a, b) => b.score - a.score || cmpAddr(a.id, b.id));
    return scored.slice(0, 8).map((x) => x.id);
  }, [ql, notes]);

  // flache, indizierbare Trefferliste
  const rows = useKM(() => {
    const r = cmdHits.map((c) => ({ type: "cmd", cmd: c }));
    zettelHits.forEach((id) => r.push({ type: "zettel", id }));
    return r;
  }, [cmdHits, zettelHits]);

  useKE(() => { setSel(0); }, [ql]);
  useKE(() => {
    const el = listRef.current && listRef.current.querySelector(".cmdk-row.on");
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const run = (row) => {
    if (!row) return;
    if (row.type === "cmd") { onClose(); row.cmd.run(); }
    else { onClose(); onJump(row.id); }
  };

  const onKey = (e) => {
    const n = rows.length;
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (n ? (s + 1) % n : 0)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (n ? (s - 1 + n) % n : 0)); }
    else if (e.key === "Enter") { e.preventDefault(); run(rows[sel]); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
  };

  return (
    <div className="cmdk-scrim" onMouseDown={onClose}>
      <div className="cmdk" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmdk-head">
          <Ic.search style={{ width: 17, height: 17, color: "var(--ink-faint)", flex: "0 0 auto" }} />
          <input className="cmdk-input" autoFocus value={q} placeholder="Springe zu Zettel oder Befehl …"
            onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} />
          <Kbd>Esc</Kbd>
        </div>
        <div className="cmdk-list" ref={listRef}>
          {rows.length === 0 && <div className="cmdk-empty">Nichts gefunden für „{q}".</div>}
          {cmdHits.length > 0 && <div className="cmdk-sec">Befehle</div>}
          {rows.map((row, i) => row.type === "cmd" ? (
            <button key={"c" + i} className={"cmdk-row" + (i === sel ? " on" : "")}
              onMouseEnter={() => setSel(i)} onClick={() => run(row)}>
              <span className="cmdk-ic">{row.cmd.icon || <Ic.arrow />}</span>
              <span className="cmdk-label">{row.cmd.label}</span>
              {row.cmd.hint && <span className="cmdk-hint">{row.cmd.hint}</span>}
            </button>
          ) : null)}
          {zettelHits.length > 0 && <div className="cmdk-sec">Zettel</div>}
          {rows.map((row, i) => row.type === "zettel" ? (
            <button key={"z" + i} className={"cmdk-row" + (i === sel ? " on" : "")}
              onMouseEnter={() => setSel(i)} onClick={() => run(row)}>
              <span className="cmdk-addr mono">{row.id}</span>
              <span className="cmdk-txt">{truncate(cleanMd(notes[row.id].text), 72)}</span>
            </button>
          ) : null)}
        </div>
        <div className="cmdk-foot">
          <span><Kbd>↑</Kbd><Kbd>↓</Kbd> wählen</span>
          <span><Kbd>↵</Kbd> öffnen</span>
          <span><Kbd>⌘K</Kbd> jederzeit</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tastatur-Hilfe (?) — kontextabhängige Übersicht ---------- */
function HelpOverlay({ screen, mode, onClose }) {
  useKE(() => {
    const onKey = (e) => { if (e.key === "Escape" || e.key === "?") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const global = {
    title: "Überall",
    rows: [
      [["⌘", "K"], "Springen & Befehle"],
      [["/"], "Suche öffnen"],
      [["1"], "Übersicht"],
      [["2"], "Zettel"],
      [["3"], "Bibliothek"],
      [["?"], "Diese Hilfe"],
      [["Esc"], "Schließen / zurück"],
    ],
  };
  const ctx = (() => {
    if (screen === "overview") return {
      title: "Übersicht",
      rows: [
        [["↑", "↓"], "Durch Reihen & Inhalte"],
        [["→"], "Aufklappen / hinein"],
        [["←"], "Zuklappen / zurück"],
        [["↵"], "Öffnen"],
        [["Leer"], "Auf-/zuklappen"],
      ],
    };
    if (screen === "quellen") return {
      title: "Bibliothek",
      rows: [
        [["↑", "↓"], "Blättern"],
        [["↵"], "Öffnen"],
        [["Leer"], "Auswählen"],
        [["Esc"], "Zurück"],
      ],
    };
    if (mode === "schreiben") return {
      title: "Schreiben",
      rows: [
        [["@"], "Zettel verweisen"],
        [["⌘", "↵"], "Zettel anhängen"],
        [["Esc"], "Zurück zum Lesen"],
      ],
    };
    if (mode === "graph") return {
      title: "Graph",
      rows: [[["Esc"], "Zurück zum Lesen"]],
    };
    return {
      title: "Lesen",
      rows: [
        [["↑"], "Vorgänger der Reihe"],
        [["↓"], "Folgezettel"],
        [["→"], "In die Verzweigung"],
        [["←"], "Zum übergeordneten Zettel"],
        [["e"], "Bearbeiten"],
        [["w"], "Weiterschreiben"],
        [["v"], "Verzweigen"],
        [["g"], "Im Graph"],
        [["b"], "Beleg anhängen"],
        [["⌫"], "Zurück"],
      ],
    };
  })();

  const Section = ({ s }) => (
    <div className="help-col">
      <div className="help-coltitle">{s.title}</div>
      <div className="help-rows">
        {s.rows.map(([keys, label], i) => (
          <div className="help-row" key={i}>
            <span className="help-keys">{keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</span>
            <span className="help-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="help-scrim" onMouseDown={onClose}>
      <div className="help" onMouseDown={(e) => e.stopPropagation()}>
        <div className="help-head">
          <span className="seclabel">Tastatur</span>
          <span className="help-title serif">Alles ohne Maus</span>
          <div style={{ flex: 1 }} />
          <button className="help-x" onClick={onClose} title="Schließen"><Ic.close /></button>
        </div>
        <div className="help-grid">
          <Section s={ctx} />
          <Section s={global} />
        </div>
        <div className="help-foot">Drücke <Kbd>?</Kbd> jederzeit für diese Übersicht.</div>
      </div>
    </div>
  );
}

Object.assign(window, { Kbd, CommandPalette, HelpOverlay });
