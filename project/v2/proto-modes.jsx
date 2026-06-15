/* proto-modes.jsx — die drei Sichten: Lesen (A), Schreiben (C), Graph (B) */
const { useState, useRef, useEffect, useLayoutEffect } = React;

/* Auszug für Karten, Trails & Vorschauen: erst Markdown-Marker entfernen, dann
   kürzen — so erscheint nie ein rohes ** oder * in Graph, Trail oder Tooltip (P1). */
function excerpt(text, n) { return truncate(cleanMd(text || ""), n); }

/* Text mit internen @-Verweisen als klickbare Inline-Links rendern.
   Adresse = Anker (keine Titel nötig); nur gültige Zettel werden verlinkt. */
function renderWithRefs(text, notes, onRef) {
  if (!text || !onRef) return text;
  const parts = []; let last = 0; const re = /@([0-9][0-9a-z]*(?:\/[0-9a-z]+)*)/gi; let m;
  while ((m = re.exec(text))) {
    const id = m[1];
    if (!notes[id]) continue;
    if (m.index > last) parts.push(...[].concat(fmtInline(text.slice(last, m.index), "p" + last)));
    parts.push(
      <RefLink key={m.index} id={id} note={notes[id]} onRef={onRef} />
    );
    last = m.index + m[0].length;
  }
  if (!parts.length) return fmtInline(text, "p0");
  if (last < text.length) parts.push(...[].concat(fmtInline(text.slice(last), "pE")));
  return parts;
}

/* Inline-Verweis mit Hover-Vorschau des verlinkten Zettels */
function RefLink({ id, note, onRef }) {
  return <PreviewLink id={id} note={note} onClick={() => onRef(id)} className="z-at-inline">{id}</PreviewLink>;
}

/* Generischer Link mit Hover-Vorschaukarte (Adresse · Textauszug · Tags).
   Beliebig stylebar über className/children — für Inline-@-Verweise wie für
   Rückverweis-Chips. */
function PreviewLink({ id, note, onClick, className, children }) {
  const btnRef = useRef(null);
  const timer = useRef(null);
  const [hover, setHover] = useState(false);
  const [pos, setPos] = useState(null);

  const place = () => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const W = 300, GAP = 9, M = 10;
    let left = r.left + r.width / 2 - W / 2;
    left = Math.max(M, Math.min(left, window.innerWidth - W - M));
    const below = r.top < 230; // wenig Platz oben → unten zeigen
    const top = below ? r.bottom + GAP : r.top - GAP;
    setPos({ left, top, below });
  };

  const open = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { place(); setHover(true); }, 140);
  };
  const close = () => { clearTimeout(timer.current); setHover(false); };
  useEffect(() => () => clearTimeout(timer.current), []);

  const tags = (note.tags || []).slice(0, 4);
  return (
    <>
      <button ref={btnRef} className={className}
        onMouseEnter={open} onMouseLeave={close} onFocus={open} onBlur={close}
        onClick={(e) => { e.stopPropagation(); close(); onClick(); }}>{children}</button>
      {hover && pos && ReactDOM.createPortal(
        <div className={"z-preview on"} style={{
          left: pos.left, top: pos.top,
          transform: pos.below ? "translateY(0)" : "translateY(-100%)",
        }}>
          <div className="z-preview-head">
            <span className="z-preview-addr">@{id}</span>
          </div>
          <div className="z-preview-body">{cleanMd(note.text) || "—"}</div>
          {tags.length > 0 ? (
            <div className="z-preview-tags">
              {tags.map((t) => <span key={t} className="z-preview-tag">#{t}</span>)}
            </div>
          ) : null}
        </div>,
        document.body
      )}
    </>
  );
}

/* ---------- Rückverweise: wer zeigt auf diesen Zettel? ----------
   Drei Konzept-Varianten, alle dezenter als die Belege; per Tweak umschaltbar.
   • fuss  — stille Fußzeile (gestrichelte Trennlinie, @-Chips mit Vorschau)
   • marginalie — Glosse im Randton (Serif-Kursiv-Lead + Chips)
   • marke — eingeklappte Sammelmarke, klappt bei Hover/Klick auf            */
function Backlinks({ ids, notes, onOpen, variant = "fuss" }) {
  const [open, setOpen] = useState(false);
  const closeT = useRef(null);
  useEffect(() => () => clearTimeout(closeT.current), []);
  if (!ids || !ids.length) return null;

  const cancelClose = () => clearTimeout(closeT.current);
  const scheduleClose = () => { cancelClose(); closeT.current = setTimeout(() => setOpen(false), 160); };

  const Chip = ({ id }) => (
    <PreviewLink id={id} note={notes[id] || {}} onClick={() => onOpen(id)} className="bl-chip">@{id}</PreviewLink>
  );
  const n = ids.length;
  const word = n === 1 ? "Zettel verweist" : "Zettel verweisen";

  if (variant === "marginalie") {
    return (
      <div className="bl-marg">
        <span className="bl-marg-lead">Hierauf verweist</span>
        <span className="bl-marg-list">{ids.map((id) => <Chip key={id} id={id} />)}</span>
      </div>
    );
  }

  if (variant === "marke") {
    return (
      <div className={"bl-mark" + (open ? " open" : "")}
        onMouseEnter={() => { cancelClose(); setOpen(true); }} onMouseLeave={scheduleClose}>
        <button className="bl-mark-toggle" onClick={() => setOpen((o) => !o)}>
          <Ic.reply style={{ transform: "scaleX(-1)" }} />
          <span>{n} {n === 1 ? "Rückverweis" : "Rückverweise"}</span>
        </button>
        {open && (
          <div className="bl-mark-pop" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
            <span className="bl-mark-lead">{n} {word} auf diesen Zettel</span>
            <div className="bl-mark-rows">
              {ids.map((id) => (
                <button key={id} className="bl-mark-row" onClick={() => { cancelClose(); setOpen(false); onOpen(id); }}>
                  <span className="bl-mark-addr">{id}</span>
                  <span className="bl-mark-txt">{truncate(cleanMd((notes[id] || {}).text) || "", 64)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard: stille Fußzeile
  return (
    <div className="bl-foot">
      <Ic.reply style={{ transform: "scaleX(-1)" }} />
      <span className="bl-foot-lead">Hierauf verweist</span>
      <span className="bl-foot-list">{ids.map((id) => <Chip key={id} id={id} />)}</span>
    </div>
  );
}

/* Vorschläge für @-Erwähnungen: nach Adresse ODER Volltext. Mehrere Wörter werden
   einzeln (UND-Verknüpft) gesucht — Reihenfolge egal (kein Titel vorhanden). */
function atSuggestions(query, notes, excludeId) {
  const tokens = (query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
  const arr = Object.keys(notes).filter((id) => id !== excludeId).map((id) => {
    const idl = id.toLowerCase();
    const hay = (idl + " " + (notes[id].text || "")).toLowerCase();
    if (!tokens.length) return { id, score: 0 };
    if (!tokens.every((t) => hay.includes(t))) return null;
    let score = 1;
    if (idl.startsWith(tokens[0])) score += 4;
    else if (idl.includes(tokens[0])) score += 2;
    return { id, score };
  }).filter(Boolean);
  arr.sort((a, b) => b.score - a.score || cmpAddr(a.id, b.id));
  return arr.slice(0, 8).map((x) => x.id);
}

/* Wiederverwendbare @-Suchmaske: tippt man @, öffnet sich eine eigene Suche
   (Index ODER Inhalt, mehrere Wörter). Auswahl fügt @adresse an der @-Stelle ein. */
function useMention({ value, setValue, taRef, notes, excludeId }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(0);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const results = open ? atSuggestions(query, notes, excludeId) : [];

  const handleChange = (e) => {
    const v = e.target.value;
    const caret = e.target.selectionStart || 0;
    setValue(v);
    if (!open && caret > 0 && v[caret - 1] === "@") {
      const prev = caret >= 2 ? v[caret - 2] : " ";
      if (caret === 1 || /[\s(\[„"']/.test(prev)) { setPos(caret - 1); setQuery(""); setSel(0); setOpen(true); }
    }
  };
  const close = () => { setOpen(false); setQuery(""); };
  const pick = (id) => {
    const before = value.slice(0, pos);
    const after = value.slice(pos + 1);
    const ins = "@" + id + " ";
    setValue(before + ins + after); close();
    requestAnimationFrame(() => { const ta = taRef.current; if (ta) { const p = (before + ins).length; ta.focus(); ta.setSelectionRange(p, p); } });
  };
  return { open, query, setQuery, sel, setSel, results, handleChange, pick, close };
}

function MentionMenu({ m, notes, placement = "bottom" }) {
  if (!m.open) return null;
  const n = m.results.length;
  return (
    <div className={"atmenu atmenu-" + placement}>
      <input className="atmenu-input" autoFocus value={m.query}
        onChange={(e) => { m.setQuery(e.target.value); m.setSel(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); m.setSel((s) => (n ? (s + 1) % n : 0)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); m.setSel((s) => (n ? (s - 1 + n) % n : 0)); }
          else if (e.key === "Enter") { e.preventDefault(); if (m.results[m.sel]) m.pick(m.results[m.sel]); }
          else if (e.key === "Escape" || (e.key === "Backspace" && !m.query)) { e.preventDefault(); m.close(); }
        }}
        onBlur={() => setTimeout(m.close, 130)}
        placeholder="Adresse oder Inhalt suchen — mehrere Wörter möglich" />
      <div className="atmenu-list">
        {n ? m.results.map((id, i) => (
          <button key={id} className={"atmenu-row" + (i === m.sel ? " on" : "")}
            onMouseEnter={() => m.setSel(i)}
            onMouseDown={(e) => { e.preventDefault(); m.pick(id); }}>
            <span className="atmenu-id">@{id}</span>
            <span className="atmenu-txt">{excerpt(notes[id].text, 64)}</span>
          </button>
        )) : <div className="atmenu-empty">Kein Zettel gefunden</div>}
      </div>
    </div>
  );
}

/* ---------- geteilte Bausteine ---------- */
function RelTag({ rel }) {
  const m = REL[rel];
  return <span className="reltag"><span className={"reldot " + m.cls} />{m.label}</span>;
}

function NeighborCard({ id, rel, notes, onOpen, ghost }) {
  const note = notes[id];
  if (!note) return null;
  return (
    <div className={"ncard" + (ghost ? " ghost" : "")} onClick={() => onOpen(id)}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span className="nid">{id}</span>
        <RelTag rel={rel} />
      </div>
      <div className="ntext">{excerpt(note.text, 88)}</div>
    </div>
  );
}

/* Editierbare Schlagwörter — Chips mit ×, plus Inline-Eingabe zum Hinzufügen */
function TagRow({ id, tags, onSaveTags }) {
  const editable = !!onSaveTags;
  const [adding, setAdding] = useState(false);
  const [val, setVal] = useState("");
  const inRef = useRef(null);
  useLayoutEffect(() => { if (adding && inRef.current) inRef.current.focus(); }, [adding]);

  const remove = (t) => onSaveTags(id, tags.filter((x) => x !== t));
  const commit = () => {
    const t = val.trim().replace(/^#/, "");
    if (t && !tags.some((x) => x.toLowerCase() === t.toLowerCase())) onSaveTags(id, [...tags, t]);
    setVal(""); setAdding(false);
  };

  if (!editable) {
    return (
      <div style={{ display: "flex", gap: 8, marginTop: 26, flexWrap: "wrap" }}>
        {tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 26, flexWrap: "wrap", alignItems: "center" }}>
      {tags.map((t) => (
        <span key={t} className="tag tag-ed">
          {t}
          <button className="tag-x" title="Schlagwort entfernen" onClick={() => remove(t)}><Ic.close /></button>
        </span>
      ))}
      {adding ? (
        <input ref={inRef} className="tag-input" value={val} placeholder="Schlagwort …"
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { setVal(""); setAdding(false); }
          }}
          onBlur={commit} />
      ) : (
        <button className="tag-add" onClick={() => setAdding(true)}><Ic.plus /> Schlagwort</button>
      )}
    </div>
  );
}

function FocusZettelView({ id, notes, size = "lg", onSave, onSaveTags, onOpenRef, editSignal }) {
  const note = notes[id];
  const bodyFs = size === "lg" ? 27 : 21;
  const editable = !!onSave;
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(note.text);
  const taRef = useRef(null);
  const mention = useMention({ value: val, setValue: setVal, taRef, notes, excludeId: id });
  const fmt = useFormatPill({ taRef, value: val, setValue: setVal });

  // val mit dem aktuellen Notiztext synchron halten (außer während des Editierens)
  useEffect(() => { if (!editing) setVal(note.text); }, [id, note.text, editing]);
  // „e" / Befehl: Bearbeiten von außen anstoßen
  useEffect(() => { if (editSignal && editable) { setVal(note.text); setEditing(true); } }, [editSignal]);

  const grow = (el) => { if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; } };
  useLayoutEffect(() => { if (editing) { grow(taRef.current); taRef.current && taRef.current.focus(); } }, [editing]);

  const startEdit = () => { setVal(note.text); setEditing(true); };
  const save = () => {
    const t = val.trim();
    if (t && t !== note.text) onSave(id, t);
    setEditing(false);
  };
  const cancel = () => { setVal(note.text); setEditing(false); };

  return (
    <div style={{ maxWidth: 660 }}>
      <div className="z-head">
        <span className="z-addr">{id}</span>
        <span className="z-sep">·</span>
        <span className="z-reihe">{note.reihe}</span>
        <span style={{ flex: 1 }} />
        {editable && !editing && (
          <button className="editbtn editbtn-quiet" onClick={startEdit} title="Zettel bearbeiten · Taste E"><Ic.write /> Bearbeiten</button>
        )}
      </div>

      {editing ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ position: "relative" }}>
            <MentionMenu m={mention} notes={notes} placement="bottom" />
            <FormatPill fmt={fmt} />
            <textarea ref={taRef} value={val}
              onChange={(e) => { mention.handleChange(e); grow(e.target); fmt.clear(); }}
              onSelect={fmt.refresh}
              onMouseUp={fmt.refresh}
              onKeyUp={fmt.refresh}
              onScroll={fmt.clear}
              onKeyDown={(e) => {
                if (mention.open) return;
                if (fmt.onKeyDown(e)) return;
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
                if (e.key === "Escape") cancel();
              }}
              className="zettel-body zedit"
              style={{ fontSize: bodyFs, lineHeight: 1.52, width: "100%", border: "none", outline: "none", resize: "none", background: "transparent", color: "var(--ink)", overflow: "hidden", display: "block" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
            <button className="pill solid" onClick={save}><Ic.check /> Speichern</button>
            <button className="pill" onClick={cancel}>Abbrechen</button>
            <span style={{ fontSize: 11.5, color: "var(--ink-ghost)", marginLeft: 2 }}>⌘↵ speichern · Esc abbrechen</span>
          </div>
        </div>
      ) : (
        <p className={"zettel-body" + (editable ? " zbody-edit" : "")}
          onClick={editable ? startEdit : undefined}
          title={editable ? "Zum Bearbeiten klicken" : undefined}
          style={{ fontSize: bodyFs, lineHeight: 1.52, margin: "22px 0 0", textWrap: "pretty" }}>{renderWithRefs(note.text, notes, onOpenRef)}</p>
      )}

      <TagRow id={id} tags={note.tags} onSaveTags={editing ? onSaveTags : undefined} />
    </div>
  );
}

function Keycap({ children }) {
  return <span className="keycap">{children}</span>;
}

function NGroup({ title, items, notes, onOpen, ghost, keyhint }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
        <span className="seclabel">{title}</span>
        {keyhint && <Keycap>{keyhint}</Keycap>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {items.map((n) => <NeighborCard key={n.id} id={n.id} rel={n.rel} notes={notes} onOpen={onOpen} ghost={ghost} />)}
      </div>
    </div>
  );
}

/* ---------- KI-Vermutung mit Live-Begründung + Feedback ---------- */
function KiSuggestion({ id, focus, notes, onOpen, onWhy, onAccept, onReject, confidence }) {
  const [why, setWhy] = useState(null);
  const [loading, setLoading] = useState(false);
  const fetchWhy = async () => {
    setLoading(true);
    try { const r = await onWhy(focus, id); setWhy(r || "Beide berühren denselben Gedanken aus unterschiedlicher Richtung."); }
    catch (e) { setWhy("Begründung gerade nicht verfügbar."); }
    setLoading(false);
  };
  return (
    <div className="kil-wrap">
      <div className="kil">
        <Ic.spark className="kil-spark" />
        <span className="kil-text">Nähe zu <button className="kil-to" onClick={() => onOpen(id)} title={excerpt(notes[id].text, 88)}>{id}</button></span>
        {why === null && <button className="kil-why" onClick={fetchWhy} disabled={loading}>· {loading ? "Luhm denkt nach …" : "warum?"}</button>}
        <span className="kil-acts">
          <button className="kil-ic yes" title="Übernehmen" onClick={() => onAccept(focus, id)}><Ic.check style={{ width: 15, height: 15 }} /></button>
          <button className="kil-ic" title="Verwerfen" onClick={() => onReject(focus, id)}><Ic.close style={{ width: 15, height: 15 }} /></button>
        </span>
      </div>
      {why !== null && <div className="kil-why-text"><Ic.spark /> <span>{why}</span></div>}
    </div>
  );
}

/* ---------- Verweisapparat: Luhmanns Verweise als kompakte Fußzeile ---------- */
/* ---------- Verweise: freie Querverweise als interne @-Links in Textform.
   Vorgänger/Folge/Verzweigung stehen im Baum rechts — hier nur die Quer-Verweise,
   die das lokale Baumbild nicht zeigt. Adresse = Anker; Kontext per Hover. ---------- */
function ReferenceApparatus({ g, notes, onOpen }) {
  if (!g.verweis.length) return null;
  return (
    <div className="z-refs">
      <span className="z-refs-lead">Siehe auch</span>
      <span className="z-refs-list">
        {g.verweis.map((n) => (
          <button key={n.id} className="z-at" onClick={() => onOpen(n.id)} title={truncate((notes[n.id] || {}).text || "", 100)}>@{n.id}</button>
        ))}
      </span>
    </div>
  );
}

/* ---------- Umgebungs-Kompass: rechts angedockt, feste räumliche Struktur ----------
   Der aktuelle Zettel ist der Dreh- und Angelpunkt in der Mitte. SENKRECHT läuft die
   Reihe (Vorgänger ↑ / Folgezettel ↓), WAAGERECHT die Verzweigungs-Tiefe: der
   übergeordnete Zettel sitzt LINKS, Verzweigungen zweigen RECHTS ab. Dieselbe Struktur
   gilt aus jeder Perspektive — öffnet man die Verzweigung, rückt ihr Elternzettel nach
   links. Steuerung: ↑ ↓ Reihe · → in die Verzweigung · ← zum übergeordneten Zettel. */
function NeighborhoodMap({ focus, notes, links, onOpen }) {
  const ids = Object.keys(notes);
  const { up, down, moreUp, moreDown, left, branches } = reiheNav(focus, links, ids);
  if (!up && !down && !moreUp && !moreDown && !left && branches.length === 0) return null;

  const V = 40, H = 54, BG = 24;
  const addrPos = {
    right: { left: 12, top: 0, transform: "translateY(-50%)" },
    left: { right: 12, top: 0, transform: "translateY(-50%)", textAlign: "right" },
  };
  const Node = ({ id, x, y, dot, side, k }) => (
    <button className="cmp-node" style={{ left: x, top: y }} onClick={() => onOpen(id)} title={truncate((notes[id] || {}).text || "", 90)}>
      <span className={"reldot " + dot} />
      <span className="cmp-addr" style={addrPos[side]}>
        {side === "left" && <span className="cmp-key">{k} </span>}
        {id}
        {side === "right" && <span className="cmp-key"> {k}</span>}
      </span>
    </button>
  );
  const More = ({ id, x, y, hint }) => (
    <button className="cmp-node more" style={{ left: x, top: y }} onClick={() => onOpen(id)} title={hint}><span>…</span></button>
  );
  const Link = ({ x, y, w, h }) => (
    <span className="cmp-link" style={{ left: x, top: y, width: w == null ? 1.5 : w, height: h == null ? 1.5 : h, transform: w == null ? "translateX(-50%)" : "translateY(-50%)" }} />
  );

  const n = branches.length;
  const bys = branches.map((_, k) => (k - (n - 1) / 2) * BG);

  return (
    <div className="nmap" aria-label="Umgebung">
      <div className="nmap-label">Umgebung</div>
      <div className="nmap-compass">
        {/* Konnektoren */}
        {up && <Link x={0} y={-V} h={V} />}
        {moreUp && <Link x={0} y={-2 * V} h={V} />}
        {down && <Link x={0} y={0} h={V} />}
        {moreDown && <Link x={0} y={V} h={V} />}
        {left && <Link x={-H} y={0} w={H} />}
        {n > 0 && <Link x={0} y={0} w={H} />}
        {n > 1 && <span className="cmp-link" style={{ left: H, top: bys[0], width: 1.5, height: bys[n - 1] - bys[0], transform: "translateX(-50%)" }} />}
        {n > 1 && branches.map((b, k) => <Link key={"s" + b} x={H} y={bys[k]} w={0} />)}

        {/* Knoten */}
        {moreUp && <More id={moreUp} x={0} y={-2 * V} hint={"Weiter zurück · " + moreUp} />}
        {up && <Node id={up} x={0} y={-V} dot="vor" side="right" k="↑" />}
        {down && <Node id={down} x={0} y={V} dot="folge" side="right" k="↓" />}
        {moreDown && <More id={moreDown} x={0} y={2 * V} hint={"Weiter vor · " + moreDown} />}
        {left && <Node id={left} x={-H} y={0} dot="vor" side="left" k="←" />}
        {branches.map((b, k) => <Node key={b} id={b} x={H} y={bys[k]} dot="verzweig" side="right" k={k === 0 ? "→" : ""} />)}

        {/* aktueller Zettel */}
        <div className="cmp-cur"><span className="cmp-curdot" /><span className="cmp-curaddr mono">{focus}</span></div>
      </div>
    </div>
  );
}

/* Überlauf-Menü „…“ für sekundäre Zettel-Aktionen — hält die Aktionszeile ruhig (P3) */
function MoreMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    window.addEventListener("mousedown", onDoc);
    return () => window.removeEventListener("mousedown", onDoc);
  }, [open]);
  if (!items || !items.length) return null;
  return (
    <div className="moremenu" ref={ref}>
      <button className={"act act-more" + (open ? " on" : "")} onClick={() => setOpen((o) => !o)} title="Weitere Aktionen" aria-label="Weitere Aktionen">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>
      </button>
      {open && (
        <div className="moremenu-pop">
          {items.map((it) => (
            <button key={it.label} className="moremenu-row" onClick={() => { setOpen(false); it.run(); }}>
              <span className="moremenu-ic">{it.icon}</span>
              <span className="moremenu-lbl">{it.label}</span>
              {it.hint && <span className="moremenu-hint mono">{it.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/*  LESEN (A)                                                   */
/* ============================================================ */
function LesenMode({ focus, notes, links, onOpen, onMode, onWrite, onEdit, onEditTags, onNav, canBack, backId, editReq, activeTheme, activeThemeId, onEnterEntry, onEditTheme, onExitTheme, onAddThemeEntry, entryFor, onOpenTheme, belege, highlights, sources, onOpenQuelle, onAttachBeleg, onRemoveBeleg, onOpenMd, onAddToHub, onAcceptKi, onRejectKi, onWhyKi, kiConfidence, feedbackStats, rueckverweisVariante = "fuss" }) {
  const g = neighborsOf(focus, links);
  const total = countNeighbors(g);
  const belegeIds = belegeOf(focus, belege);
  const backlinkIds = backlinksOf(focus, links);
  const rightGroup = g.verzweig.length ? "verzweig" : null;

  // Theme-Banner: aktive Session hat Vorrang; sonst zeigt jeder Zettel, der
  // selbst Register-Einstieg ist, automatisch seine volle Themenschwelle.
  const entryHub = entryFor && entryFor.length ? entryFor[0] : null; // { id, ...hub }
  const bannerHub = activeTheme || entryHub;
  const bannerHubId = activeTheme ? activeThemeId : (entryHub && entryHub.id);
  const bannerIsSession = !!activeTheme;
  // Fußzeilen-Hinweis nur für weitere Themen, die nicht schon als Banner stehen
  const restEntryFor = (entryFor || []).filter((h) => h.id !== bannerHubId);

  return (
    <div className="splitcol">
      <div className="reading lesen-reading" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-start", overflowY: "auto", padding: "clamp(40px, 7vh, 84px) clamp(40px, 7vw, 96px)", minWidth: 0 }}>
        <NeighborhoodMap focus={focus} notes={notes} links={links} onOpen={onOpen} />

        <div style={{ width: "100%", maxWidth: 660, margin: "0 auto" }}>
          {bannerHub && (
            <div style={{ marginBottom: 24 }}>
              <ThemeBanner hub={bannerHub} focus={focus} notes={notes} onEnter={onEnterEntry}
                onEdit={() => onEditTheme(bannerHubId)}
                onExit={bannerIsSession ? onExitTheme : null}
                onAddEntry={() => onAddThemeEntry(bannerHubId)} />
            </div>
          )}

          <FocusZettelView id={focus} notes={notes} onSave={onEdit} onSaveTags={onEditTags} onOpenRef={onOpen} editSignal={editReq} />

          {belegeIds.length > 0 ? (
            <BelegeFootnotes ids={belegeIds} highlights={highlights} sources={sources}
              onOpenSource={onOpenQuelle} onAdd={onAttachBeleg} onRemove={(hid) => onRemoveBeleg(focus, hid)} />
          ) : null}

          {restEntryFor && restEntryFor.length > 0 && (
            <div className="z-backlink">
              <Ic.reply style={{ transform: "scaleX(-1)" }} />
              <span>Register-Einstieg für</span>              {restEntryFor.map((h, i) => (
                <React.Fragment key={h.id}>
                  {i > 0 && <span style={{ color: "var(--ink-ghost)" }}>·</span>}
                  <button className="z-bllink" onClick={() => onOpenTheme(h.id)}>„{h.titel}"</button>
                </React.Fragment>
              ))}
            </div>
          )}

          <Backlinks ids={backlinkIds} notes={notes} onOpen={onOpen} variant={rueckverweisVariante} />

          <div className="z-actions" style={{ marginTop: 36 }}>
            <button className="pill solid" onClick={() => onWrite("folge")}><Ic.plus /> Weiterschreiben</button>
            <span className="act-div" />
            <button className="act" onClick={() => onWrite("verzweig")}><Ic.branch /> Verzweigen</button>
            <button className="act" onClick={() => onMode("graph")}><Ic.graph /> Im Graph</button>
            <MoreMenu items={[
              ...(onAddToHub ? [{ label: "Als Einstieg ins Register", icon: <Ic.layers />, hint: "t", run: onAddToHub }] : []),
              ...(belegeIds.length === 0 ? [{ label: "Beleg anheften", icon: <Ic.quote />, hint: "b", run: onAttachBeleg }] : []),
            ]} />
          </div>

          <div className="readkeys">
            <span><span className="kbd">↑</span><span className="kbd">↓</span><span className="kbd">←</span><span className="kbd">→</span> Nachbarn</span>
            <span><span className="kbd">?</span> alle Tasten</span>
          </div>

          {g.ki.length > 0 && (
            <aside className="ki-aside">
              <div className="ki-aside-lead"><Ic.spark style={{ width: 13, height: 13 }} /> Luhm vermutet — am Rand, nicht im Weg</div>
              {g.ki.map((n) => <KiSuggestion key={n.id} id={n.id} focus={focus} notes={notes} onOpen={onOpen} onWhy={onWhyKi} onAccept={onAcceptKi} onReject={onRejectKi} confidence={kiConfidence(n.id)} />)}
              <div className="kil-foot">{(feedbackStats.accepted + feedbackStats.rejected) > 0
                ? "Luhm lernt aus deinem Feedback — " + feedbackStats.accepted + " übernommen, " + feedbackStats.rejected + " verworfen."
                : "Ein Vorschlag, kein Befehl. Übernimm oder verwirf ihn — Luhm lernt daraus."}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  SCHREIBEN (C)                                               */
/* ============================================================ */

/* gemeinsames Schreibfeld (Adresse · Belege · Textfeld · Anhängen) */
function Composer({ notes, draft, mention, fmt, taRef, nextId, artLabel = "Folgezettel", pendBelege, highlights, sources, onOpenPicker, onRemovePend, onGrow, submit, tone = "card" }) {
  return (
    <div className={"composer composer-" + tone}>
      <div className="composer-head">
        <Ic.reply style={{ width: 15, height: 15, color: "var(--ink-faint)" }} />
        <span>{artLabel} <span className="mono" style={{ color: "var(--accent-ink)" }}>{nextId}</span></span>
      </div>
      <div className="composer-belege">
        {pendBelege.map((hid) => highlights[hid] && (
          <span key={hid} className="pendchip" title={highlights[hid].text}>
            <Ic.quote style={{ width: 11, height: 11 }} /> {sources[highlights[hid].src].author.split(" ").pop()}
            <button onClick={() => onRemovePend(hid)} title="Entfernen"><Ic.close style={{ width: 11, height: 11 }} /></button>
          </span>
        ))}
        <button className="belege-add" onClick={onOpenPicker}><Ic.quote style={{ width: 13, height: 13 }} /> Beleg anheften</button>
      </div>
      <div style={{ position: "relative" }}>
        <MentionMenu m={mention} notes={notes} placement="top" />
        {fmt && <FormatPill fmt={fmt} />}
        <textarea ref={taRef} value={draft}
          onChange={(e) => { mention.handleChange(e); onGrow && onGrow(); fmt && fmt.clear(); }}
          onSelect={fmt ? fmt.refresh : undefined}
          onMouseUp={fmt ? fmt.refresh : undefined}
          onKeyUp={fmt ? fmt.refresh : undefined}
          onKeyDown={(e) => {
            if (mention.open) return;
            if (fmt && fmt.onKeyDown(e)) return;
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="Widersprich. Frag nach. Denk weiter …  (@ verweist auf einen Zettel)"
          className="composer-ta" />
      </div>
      <div className="composer-foot">
        <span className="composer-hint">@ verweisen · ⌘↵ anhängen</span>
        <button className="pill solid" disabled={!draft.trim()} onClick={submit}><Ic.plus /> Anhängen</button>
      </div>
    </div>
  );
}

/* vorhandene Folgezettel als ruhige Spur */
function ReplyTrail({ replies, notes, onOpen, label = "Bereits angehängt" }) {
  if (!replies.length) return null;
  return (
    <div className="replytrail">
      <span className="seclabel" style={{ display: "block", marginBottom: 12 }}>{label}</span>
      {replies.map((r) => (
        <button key={r.id} className="replytrail-item" onClick={() => onOpen(r.id)}>
          <span className="mono replytrail-id">{r.id}</span>
          <span className="replytrail-txt">{excerpt(notes[r.id].text, 130)}</span>
        </button>
      ))}
    </div>
  );
}

/* Kontext-Zeile: Vermutung + vorhandene Antworten als Chips */
function ContextRow({ whisper, replies, notes, onOpen }) {
  if (!whisper && !replies.length) return null;
  return (
    <div className="ctxrow">
      {whisper && (
        <span className="ctxrow-hint">
          <Ic.spark style={{ width: 14, height: 14, color: "var(--ink-faint)" }} />
          {whisper.rel === "ki" ? "Etwas Verwandtes" : "Verweist auf"}
          <button className="ctxrow-id" onClick={() => onOpen(whisper.id)}>{whisper.id}</button>
        </span>
      )}
      {replies.map((r) => (
        <button key={r.id} className="ctxrow-chip" onClick={() => onOpen(r.id)} title={excerpt(notes[r.id].text, 100)}>
          <Ic.reply style={{ width: 12, height: 12 }} /> {r.id}
        </button>
      ))}
    </div>
  );
}

function SchreibenMode({ focus, notes, links, onOpen, onAppend, onMode, art = "folge", highlights, sources, pendBelege = [], onOpenPicker, onRemovePend, variant = "anbau" }) {
  const [draft, setDraft] = useState("");
  const taRef = useRef(null);
  const g = neighborsOf(focus, links);
  const replies = g.folge;
  const whisper = g.ki[0] || g.verweis[0];
  const artLabel = art === "verzweig" ? "Verzweigung" : "Folgezettel";
  const nextId = art === "verzweig" ? nextVerzweig(focus, notes) : nextFolge(focus, notes);
  const mention = useMention({ value: draft, setValue: setDraft, taRef, notes, excludeId: focus });
  const fmt = useFormatPill({ taRef, value: draft, setValue: setDraft });
  const grow = (el) => { if (el) { el.style.height = "auto"; el.style.height = Math.max(el.scrollHeight, 60) + "px"; } };
  useLayoutEffect(() => { grow(taRef.current); }, [draft, variant, focus]);
  const submit = () => { if (!draft.trim()) return; onAppend(draft.trim(), pendBelege); setDraft(""); };

  const composer = (tone) => (
    <Composer notes={notes} draft={draft} mention={mention} fmt={fmt} taRef={taRef} nextId={nextId}
      pendBelege={pendBelege} highlights={highlights} sources={sources}
      onOpenPicker={onOpenPicker} onRemovePend={onRemovePend} onGrow={() => grow(taRef.current)} submit={submit} tone={tone} artLabel={artLabel} />
  );
  const back = (
    <button className="pill backpill" onClick={() => onMode("lesen")}><Ic.read /> Zurück zum Lesen</button>
  );

  /* ---- Konzept: Randspalte (bisher) ---- */
  if (variant === "randspalte") {
    return (
      <div className="splitcol">
        <div className="reading" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 clamp(36px, 6vw, 72px)", minWidth: 0, borderRight: "1px solid var(--line)" }}>
          {back}
          <span className="seclabel" style={{ margin: "22px 0 18px" }}>Der Zettel sagt</span>
          <FocusZettelView id={focus} notes={notes} onOpenRef={onOpen} />
        </div>
        <div className="sidecol scrollcol" style={{ width: 440, flex: "0 0 440px", background: "var(--panel)", padding: "30px 30px 24px", display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <span className="seclabel" style={{ marginBottom: 20 }}>Am Rand notiert</span>
          <ContextRow whisper={whisper} replies={[]} notes={notes} onOpen={onOpen} />
          <ReplyTrail replies={replies} notes={notes} onOpen={onOpen} label="Deine Antworten" />
          <div style={{ flex: 1, minHeight: 16 }} />
          {composer("card")}
        </div>
      </div>
    );
  }

  /* ---- Konzept: Gegenüber (zwei Karteikarten) ---- */
  if (variant === "gegenueber") {
    return (
      <div className="reading scrollcol schreibcol-scroll">
        <div className="schreibcol" style={{ maxWidth: 940 }}>
          {back}
          <div className="gegen">
            <div className="gegen-card source">
              <div className="gegen-tab"><span className="mono">{focus}</span> · {notes[focus].reihe}</div>
              <p className="zettel-body" style={{ fontSize: 21, lineHeight: 1.5, margin: 0, textWrap: "pretty" }}>{renderWithRefs(notes[focus].text, notes, onOpen)}</p>
            </div>
            <div className="gegen-link" aria-hidden="true"><Ic.reply style={{ transform: "scaleX(-1)" }} /></div>
            <div className="gegen-card neu">
              <div className="gegen-tab neu"><span className="mono">{nextId}</span> · {artLabel.toLowerCase()}</div>
              {composer("bare")}
            </div>
          </div>
          <ReplyTrail replies={replies} notes={notes} onOpen={onOpen} label="Bereits angehängt" />
        </div>
      </div>
    );
  }

  /* ---- Konzept: Werkstatt (zentriert, fokussiert) ---- */
  if (variant === "werkstatt") {
    return (
      <div className="reading scrollcol schreibcol-scroll">
        <div className="schreibcol werkstatt">
          {back}
          <div className="wk-source">
            <span className="wk-source-lbl">Anschluss an <span className="mono">{focus}</span></span>
            <p className="wk-source-text serif">{notes[focus].text}</p>
          </div>
          {composer("bare")}
          <ContextRow whisper={whisper} replies={replies} notes={notes} onOpen={onOpen} />
        </div>
      </div>
    );
  }

  /* ---- Konzept: Anbau (Standard, inline-Fortsetzung) ---- */
  return (
    <div className="reading scrollcol schreibcol-scroll">
      <div className="schreibcol">
        {back}
        <span className="seclabel" style={{ display: "block", margin: "18px 0 16px" }}>Der Zettel sagt</span>
        <FocusZettelView id={focus} notes={notes} onOpenRef={onOpen} />
        <div className="anbau-connector">
          <span className="anbau-line" />
          <span className="anbau-lbl"><Ic.reply style={{ width: 13, height: 13, transform: "scaleX(-1)" }} /> {artLabel} <span className="mono">{nextId}</span></span>
        </div>
        {composer("bare")}
        <ReplyTrail replies={replies} notes={notes} onOpen={onOpen} label="Bereits angehängt" />
      </div>
    </div>
  );
}

/* ============================================================ */
/*  GRAPH (B) — dynamisches radiales Layout                     */
/* ============================================================ */
function GraphMode({ focus, notes, links, onOpen, onMode }) {
  const wrapRef = useRef(null);
  const centerRef = useRef(null);
  const [sz, setSz] = useState({ w: 1100, h: 680 });
  const [cHalf, setCHalf] = useState({ w: 158, h: 96 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSz({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSz({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // tatsächliche Größe der Zentrumskarte messen (variiert mit Textlänge)
  useLayoutEffect(() => {
    const c = centerRef.current;
    if (c) setCHalf({ w: c.offsetWidth / 2, h: c.offsetHeight / 2 });
  }, [focus, sz.w, sz.h]);

  const g = neighborsOf(focus, links);
  const cx = sz.w / 2, cy = sz.h / 2;
  const HALF = 106, PADX = 18, PADY = 14; // Kartenhalbbreite + Rand
  const cardHH = 58;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  // Richtungsbasiertes Layout = Lesemodell: Vorgänger ↑, Folgezettel ↓ (Index-Linie),
  // Verzweigung → (im Index), Verweise & Vermutungen ← (führen in andere Indizes).
  const xR = clamp(cx + cHalf.w + HALF + 56, cx + 150, sz.w - HALF - PADX);
  const xL = clamp(cx - cHalf.w - HALF - 56, HALF + PADX, cx - 150);
  const yT = clamp(cy - (cHalf.h + cardHH + 54), 60 + PADY, cy - 110);
  const yB = clamp(cy + (cHalf.h + cardHH + 54), cy + 110, sz.h - 60 - PADY);
  const vStack = 132, fanX = 232;

  const items = [];
  g.vor.forEach((n, i, a) => items.push({ ...n, zone: "top", x: cx + (i - (a.length - 1) / 2) * fanX, y: yT }));
  g.folge.forEach((n, i, a) => items.push({ ...n, zone: "bottom", x: cx + (i - (a.length - 1) / 2) * fanX, y: yB }));
  g.verzweig.forEach((n, i, a) => items.push({ ...n, zone: "right", x: xR, y: cy + (i - (a.length - 1) / 2) * vStack }));
  const leftItems = [...g.verweis, ...g.ki];
  leftItems.forEach((n, i, a) => items.push({ ...n, zone: "left", x: xL, y: cy + (i - (a.length - 1) / 2) * vStack }));
  items.forEach((p) => { p.x = clamp(p.x, HALF + PADX, sz.w - HALF - PADX); p.y = clamp(p.y, 60 + PADY, sz.h - 60 - PADY); });

  const strokeFor = (cls) => cls === "folge" ? "var(--accent)" : cls === "ki" ? "var(--ink-faint)" : cls === "vor" ? "var(--ink-soft)" : cls === "verweis" ? "var(--accent-ink)" : "var(--ink-soft)";
  const note = notes[focus];

  const seg = (p) => {
    const dx = p.x - cx, dy = p.y - cy, len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len, ax = Math.abs(ux) || 1e-3, ay = Math.abs(uy) || 1e-3;
    const cEdge = Math.min(cHalf.w / ax, cHalf.h / ay);
    const nEdge = Math.min(HALF / ax, cardHH / ay);
    return { ux, uy, x1: cx + ux * cEdge, y1: cy + uy * cEdge, x2: p.x - ux * nEdge, y2: p.y - uy * nEdge };
  };
  const head = (tx, ty, ux, uy, color, key) => {
    const s = 7, w = 4.2, bx = tx - ux * s, by = ty - uy * s, px = -uy, py = ux;
    return <polygon key={key} points={`${tx},${ty} ${bx + px * w},${by + py * w} ${bx - px * w},${by - py * w}`} fill={color} opacity="0.8" />;
  };
  const zoneLabel = (cond, x, y, txt) => cond ? <text x={clamp(x, 60, sz.w - 60)} y={clamp(y, 18, sz.h - 8)} textAnchor="middle" fontFamily="var(--sans)" fontSize="10.5" fontWeight="700" letterSpacing="1.2" fill="var(--ink-faint)">{txt}</text> : null;
  const minY = (zone) => { const ys = items.filter((p) => p.zone === zone).map((p) => p.y); return ys.length ? Math.min(...ys) : cy; };

  return (
    <div className="gwrap" ref={wrapRef}>
      <svg width={sz.w} height={sz.h} style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {items.map((p, i) => {
          const cls = REL[p.rel].cls, color = strokeFor(cls);
          const s = seg(p);
          return (
            <g key={i}>
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={color} strokeWidth={cls === "folge" ? 2 : 1.4} strokeDasharray={cls === "ki" ? "3 5" : "none"} opacity={cls === "ki" || cls === "vor" ? 0.55 : 0.5} />
              {(p.zone === "bottom" || p.zone === "right") && head(s.x2, s.y2, s.ux, s.uy, color, "h")}
              {p.zone === "top" && head(s.x1, s.y1, -s.ux, -s.uy, color, "h")}
            </g>
          );
        })}
      </svg>

      {items.map((p) => (
        <div key={p.id} className={"gcard gcard-" + p.zone + (p.rel === "ki" ? " is-ki" : "")} style={{ left: p.x, top: p.y }} onClick={() => onOpen(p.id)}>
          <div className={"ncard" + (p.rel === "ki" ? " ghost" : "")}>
            <span className="nid">{p.id}</span>
            <div className="ntext">{excerpt(notes[p.id].text, 58)}</div>
          </div>
        </div>
      ))}

      <svg width={sz.w} height={sz.h} style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
        {zoneLabel(g.vor.length, cx, yT - cardHH - 12, "VORGÄNGER")}
        {zoneLabel(g.folge.length, cx, yB + cardHH + 22, g.folge.length > 1 ? "FOLGEZETTEL · " + g.folge.length : "FOLGEZETTEL")}
        {zoneLabel(g.verzweig.length, xR, minY("right") - cardHH - 12, g.verzweig.length > 1 ? "VERZWEIGUNG · " + g.verzweig.length : "VERZWEIGUNG")}
        {zoneLabel(leftItems.length, xL, minY("left") - cardHH - 12, leftItems.length > 1 ? "ANDERE INDIZES · " + leftItems.length : "ANDERE INDIZES")}
      </svg>

      {items.length > 0 && (
        <div className="glegend">
          {g.folge.length > 0 && <span><i className="lg lg-folge" /> Folgezettel</span>}
          {g.vor.length > 0 && <span><i className="lg lg-vor" /> Vorgänger</span>}
          {g.verzweig.length > 0 && <span><i className="lg lg-verzweig" /> Verzweigung</span>}
          {g.verweis.length > 0 && <span><i className="lg lg-verweis" /> Verweis</span>}
          {g.ki.length > 0 && <span><i className="lg lg-ki" /> Vermutung</span>}
        </div>
      )}

      <div className="gcenter" style={{ left: cx, top: cy }}>
        <div className="inner" ref={centerRef}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="mono" style={{ fontSize: 21, fontWeight: 600, color: "var(--accent-ink)" }}>{focus}</span>
            <span style={{ fontSize: 11, color: "var(--ink-faint)", fontWeight: 700, letterSpacing: ".08em" }}>IM FOKUS</span>
          </div>
          <p className="zettel-body gc-clamp" style={{ fontSize: 16.5, lineHeight: 1.5, margin: "14px 0 0", textWrap: "pretty" }}>{fmtInline(note.text, "gc")}</p>
          <div style={{ display: "flex", gap: 7, marginTop: 16, alignItems: "center" }}>
            <button className="pill solid" style={{ height: 32, fontSize: 12.5 }} onClick={() => onMode("lesen")}><Ic.read /> Lesen</button>
            <button className="pill" style={{ height: 32, fontSize: 12.5 }} onClick={() => onMode("schreiben")}><Ic.write /> Schreiben</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LesenMode, SchreibenMode, GraphMode });
