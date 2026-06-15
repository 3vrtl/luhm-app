/* z2-overlays.jsx — Ebenen, die sich über den Zettel legen (alle innerhalb des Fensters):
   ⌘K-Sprungpalette · Register (Strang-Baum aller Zettel). */

const { useState: useStateO, useRef: useRefO, useEffect: useEffectO, useMemo } = React;

/* ---------- ⌘K Sprungpalette ---------- */
function CmdK({ notes, links, focus, highlights, sources, onNavigate, onNewZettel, onOpenInbox, onOpenHighlight, onOpenGraph, onClose,
                currentEmpty, folgeAddr, verzweigAddr, onCreateFolge, onCreateVerzweig, onOpenSettings }) {
  const [q, setQ] = useStateO("");
  const [idx, setIdx] = useStateO(0);
  const inputRef = useRefO(null);
  const bodyRef = useRefO(null);
  useEffectO(() => { inputRef.current && inputRef.current.focus(); }, []);

  const ids = Object.keys(notes);
  /* Anlegen: zwei Richtungen relativ zum aktuellen Zettel + neuer Strang.
     Jede Zeile: Icon · Aktion · Beschreibung (mit Zieladresse) · direktes Kürzel. */
  const cmds = useMemo(() => {
    const list = [];
    if (!currentEmpty) {
      list.push({ key: "folge", group: "neu", label: "Weiterschreiben", desc: "Reihe fortführen", addr: folgeAddr, kbd: "⌘↓", run: onCreateFolge, ic: "arrow", icStyle: { transform: "rotate(90deg)" } });
      list.push({ key: "verzweig", group: "neu", label: "Verzweigen", desc: "neuer Abzweig", addr: verzweigAddr, kbd: "⌘→", run: onCreateVerzweig, ic: "branch" });
    }
    list.push({ key: "root", group: "neu", label: "Neuer Strang", desc: "eigenständiger Zettel", kbd: "⌘N", run: onNewZettel, ic: "plus" });
    list.push({ key: "graph", group: "befehl", label: "Umgebung", desc: "Graph der Nachbarn", kbd: "⌘G", run: onOpenGraph, ic: "graph" });
    list.push({ key: "inbox", group: "befehl", label: "Highlights", desc: "aus Readwise", kbd: "⌘I", run: onOpenInbox, ic: "quote" });
    list.push({ key: "settings", group: "befehl", label: "Einstellungen", desc: "Schrift · Oberfläche · Daten", kbd: "⌘,", run: onOpenSettings, ic: "gear" });
    return list;
  }, [currentEmpty, folgeAddr, verzweigAddr]);

  /* --- Register-Baum (bei leerer Suche): Stränge auf-/zuklappbar --- */
  const ancestorsOf = (id) => { const out = []; let p = parentOf(id, links); while (p) { out.push(p); p = parentOf(p, links); } return out; };
  const roots = useMemo(() => ids.filter((id) => !parentOf(id, links)).sort(cmpAddr), [notes, links]);
  const kidsOf = (id) => childrenOf(id, links, ids);
  const descCount = useMemo(() => {
    const memo = {};
    const count = (id) => { if (memo[id] != null) return memo[id]; const k = kidsOf(id); let n = k.length; k.forEach((c) => { n += count(c); }); memo[id] = n; return n; };
    ids.forEach(count); return memo;
  }, [notes, links]);
  const [expanded, setExpanded] = useStateO(() => new Set(ancestorsOf(focus)));
  const setOpen = (id, open) => setExpanded((s) => { const n = new Set(s); open ? n.add(id) : n.delete(id); return n; });
  const treeRows = useMemo(() => {
    const out = [];
    const walk = (id, depth) => {
      const k = kidsOf(id); const open = expanded.has(id);
      out.push({ id, depth, hasKids: k.length > 0, open });
      if (open) k.forEach((c) => walk(c, depth + 1));
    };
    roots.forEach((r) => walk(r, 0));
    return out;
  }, [roots, expanded, notes, links]);

  const ql = q.trim().toLowerCase();
  const terms = useMemo(() => ql.split(/\s+/).filter(Boolean), [ql]);
  /* alle Suchwörter müssen vorkommen — in beliebiger Reihenfolge */
  const matchAll = (s) => { const t = (s || "").toLowerCase(); return terms.length > 0 && terms.every((w) => t.includes(w)); };
  /* React-Knoten mit hervorgehobenen Suchwörtern */
  const highlightParts = (text, key) => {
    if (!terms.length || !text) return text;
    const esc = terms.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
    if (!esc.length) return text;
    const re = new RegExp("(" + esc.join("|") + ")", "ig");
    const out = []; let last = 0, m, k = 0;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(<mark key={(key || "h") + (k++)}>{m[0]}</mark>);
      last = m.index + m[0].length;
      if (m.index === re.lastIndex) re.lastIndex++;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  };
  const noteHits = useMemo(() => ids
    .filter((id) => matchAll(id + " " + (notes[id].titel || "") + " " + (notes[id].text || "")))
    .sort(cmpAddr).slice(0, 12), [ql, notes]);
  /* Fundstelle im Fließtext: kurzer Ausschnitt rund um den ersten Treffer, alle Wörter hervorgehoben */
  const bodySnippet = (id) => {
    const body = notes[id].text || "";
    if (!terms.length || !body) return null;
    const lc = body.toLowerCase();
    let first = Infinity;
    terms.forEach((w) => { const i = lc.indexOf(w); if (i >= 0 && i < first) first = i; });
    if (first === Infinity) return null; // Treffer nur in Titel/Adresse
    const start = Math.max(0, first - 26), end = Math.min(body.length, first + 84);
    return (start > 0 ? "… " : "") + body.slice(start, end) + (end < body.length ? " …" : "");
  };
  const hlHits = useMemo(() => Object.keys(highlights || {})
    .filter((h) => matchAll((highlights[h].text || "") + " " + ((sources[highlights[h].src] || {}).author || "")))
    .slice(0, 4), [ql, highlights, sources]);
  const cmdHits = ql ? cmds.filter((c) => matchAll(c.label + " " + (c.desc || ""))) : cmds;
  const cmdNeu = cmdHits.filter((c) => c.group === "neu");
  const cmdBef = cmdHits.filter((c) => c.group === "befehl");

  const flat = [
    ...cmdHits.map((c) => ({ kind: "cmd", c })),
    ...(ql ? noteHits.map((id) => ({ kind: "note", id })) : treeRows.map((r) => ({ kind: "tree", ...r }))),
    ...hlHits.map((h) => ({ kind: "hl", h })),
  ];
  const clampIdx = Math.min(idx, Math.max(0, flat.length - 1));
  useEffectO(() => { if (idx > flat.length - 1) setIdx(Math.max(0, flat.length - 1)); }, [flat.length]);
  useEffectO(() => {
    const c = bodyRef.current; if (!c) return;
    const el = c.querySelector(".z2-cmdrow.on, .z2-trow.on"); if (!el) return;
    const top = el.offsetTop, bot = top + el.offsetHeight;
    if (top < c.scrollTop) c.scrollTop = top - 6;
    else if (bot > c.scrollTop + c.clientHeight) c.scrollTop = bot - c.clientHeight + 6;
  }, [clampIdx]);

  const run = (item) => {
    if (!item) return;
    if (item.kind === "cmd") item.c.run();
    else if (item.kind === "hl") onOpenHighlight(item.h);
    else onNavigate(item.id);
  };

  const onKey = (e) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) e.stopPropagation();
    const item = flat[clampIdx];
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); run(item); }
    else if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "ArrowRight" && item && item.kind === "tree") {
      e.preventDefault(); e.stopPropagation();
      if (item.hasKids && !item.open) setOpen(item.id, true);
      else if (item.hasKids && item.open) setIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowLeft" && item && item.kind === "tree") {
      e.preventDefault(); e.stopPropagation();
      if (item.hasKids && item.open) setOpen(item.id, false);
      else { const p = parentOf(item.id, links); if (p) { const pi = flat.findIndex((r) => r.kind === "tree" && r.id === p); if (pi >= 0) setIdx(pi); } }
    }
  };

  let row = -1;
  const CmdRow = (c) => {
    row += 1; const me = row; const on = me === clampIdx;
    return (
      <button key={"cmd-" + c.key} className={"z2-cmdrow z2-cmdcmd" + (on ? " on" : "")}
        onMouseDown={(e) => { e.preventDefault(); run({ kind: "cmd", c }); }} onMouseEnter={() => setIdx(me)}>
        <span className="z2-cmdic">{Ic[c.ic](c.icStyle ? { style: c.icStyle } : {})}</span>
        <span className="z2-cmdlabel">{c.label}</span>
        <span className="z2-cmddesc">
          {c.desc}
          {c.addr && <span className="z2-cmdgoto">{c.addr}</span>}
        </span>
        {c.kbd && <Kc k={c.kbd} />}
      </button>
    );
  };
  const Row = (item, label, sub, addr, icon) => {
    row += 1; const me = row; const on = me === clampIdx;
    return (
      <button key={(item.kind) + (item.id || item.h || item.c?.key)} className={"z2-cmdrow" + (on ? " on" : "")}
        onMouseDown={(e) => { e.preventDefault(); run(item); }} onMouseEnter={() => setIdx(me)}>
        <span className="z2-cmdic">{Ic[icon](item.c && item.c.icStyle ? { style: item.c.icStyle } : {})}</span>
        {addr && <span className="z2-cmdaddr">{addr}</span>}
        <span className="z2-cmdlabel">{label}</span>
        {sub && <span className="z2-cmdsub">{sub}</span>}
      </button>
    );
  };
  const NoteRow = (id) => {
    row += 1; const me = row; const on = me === clampIdx;
    const label = truncate((notes[id].titel || notes[id].text || "") || "leerer Zettel", 52);
    const snip = bodySnippet(id);
    return (
      <button key={"note-" + id} className={"z2-cmdrow" + (on ? " on" : "") + (snip ? " has-snip" : "")}
        onMouseDown={(e) => { e.preventDefault(); run({ kind: "note", id }); }} onMouseEnter={() => setIdx(me)}>
        <span className="z2-cmdic">{Ic.doc({})}</span>
        <span className="z2-cmdaddr">{id}</span>
        <span className="z2-cmdmain">
          <span className="z2-cmdlabel">{highlightParts(label, "l" + id)}</span>
          {snip && <span className="z2-cmdsnip">{highlightParts(snip, "s" + id)}</span>}
        </span>
      </button>
    );
  };
  const TreeRow = (r) => {
    row += 1; const me = row; const on = me === clampIdx;
    return (
      <button key={"tree-" + r.id} className={"z2-trow" + (on ? " on" : "") + (r.depth === 0 ? " root" : "") + (r.id === focus ? " here" : "")}
        style={{ paddingLeft: (10 + r.depth * 17) + "px" }}
        onMouseDown={(e) => { e.preventDefault(); onNavigate(r.id); }} onMouseEnter={() => setIdx(me)}>
        <span className="z2-ttwist" onMouseDown={(e) => { if (r.hasKids) { e.preventDefault(); e.stopPropagation(); setOpen(r.id, !r.open); } }}>
          {r.hasKids ? Ic.arrow({ className: "z2-tchev" + (r.open ? " open" : "") }) : null}
        </span>
        <span className="z2-taddr">{r.id}</span>
        <span className="z2-ttxt">{truncate((notes[r.id].titel || notes[r.id].text || "") || "leerer Zettel", 52)}</span>
        {r.id === focus && <span className="z2-tdot" title="aktuell geöffnet" />}
        {r.hasKids && !r.open && <span className="z2-tcount">{descCount[r.id]}</span>}
      </button>
    );
  };

  return (
    <div className="z2-layer z2-cmdscrim" onMouseDown={onClose}>
      <div className="z2-cmdk" onMouseDown={(e) => e.stopPropagation()}>
        <div className="z2-cmdhead">
          {Ic.search({ className: "z2-cmdsearch" })}
          <input ref={inputRef} className="z2-cmdinput" placeholder="Springen, im Inhalt suchen, anlegen …"
            value={q} onChange={(e) => { setQ(e.target.value); setIdx(0); }} onKeyDown={onKey} />
          <span className="z2-cmdesc">esc</span>
        </div>
        <div className="z2-cmdlist" ref={bodyRef}>
          {cmdNeu.length > 0 && <div className="z2-cmdsec">Neuer Zettel</div>}
          {cmdNeu.map((c) => CmdRow(c))}
          {cmdBef.length > 0 && <div className="z2-cmdsec">Befehle</div>}
          {cmdBef.map((c) => CmdRow(c))}
          {ql ? (
            <React.Fragment>
              {noteHits.length > 0 && <div className="z2-cmdsec">Zettel</div>}
              {noteHits.map((id) => NoteRow(id))}
            </React.Fragment>
          ) : (
            <React.Fragment>
              {treeRows.length > 0 && <div className="z2-cmdsec">Register</div>}
              {treeRows.map((r) => TreeRow(r))}
            </React.Fragment>
          )}
          {hlHits.length > 0 && <div className="z2-cmdsec">Highlights</div>}
          {hlHits.map((h) => Row({ kind: "hl", h }, truncate(highlights[h].text || "", 52), null, null, "quote"))}
          {flat.length === 0 && <div className="z2-cmdempty">Nichts gefunden — „{q}" als neuen Zettel anlegen?</div>}
        </div>
        {!ql && (
          <div className="z2-cmdfoot">
            <span><Kc k="↑↓" /> wählen</span>
            <span><Kc k="→" /> aufklappen</span>
            <span><Kc k="←" /> einklappen</span>
            <span><Kc k="↵" /> springen</span>
          </div>
        )}
      </div>
    </div>
  );
}


Object.assign(window, { CmdK });
