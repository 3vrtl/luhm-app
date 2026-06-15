/* proto-overview.jsx — Register/Übersicht: nummerierter Index, Einstieg in die Pfade */

/* Pfade aus den Verknüpfungen ableiten: Wurzel = Zettel ohne Vorgänger,
   Hauptkette über folge, Verzweigungen als Abzweige. */
function buildPaths(notes, links) {
  const roots = Object.keys(notes).filter((id) => !String(id).includes("/")).sort(cmpAddr);
  return roots.map((root) => {
    const members = Object.keys(notes).filter((id) => String(id).split("/")[0] === root && id !== root);
    const direct = members.filter((id) => parentOf(id, links) === root).sort(cmpAddr); // Zahlen-Hauptlinie
    const deeper = members.filter((id) => parentOf(id, links) !== root).sort(cmpAddr); // Verzweigungen
    const chain = [root, ...direct];
    const branches = deeper.map((id) => ({ from: parentOf(id, links), id }));
    return { root, reihe: notes[root].reihe || root, chain, branches };
  });
}

/* eine Zeile aus klickbaren Zettel-Adressen: Einstieg in einzelne Zettel.
   Lange Pfade werden gekappt (Überblick bleibt einzeilig), per +N ausklappbar. */
function ZettelTrail({ chain, branches, notes, onEnter, cap = 7 }) {
  const [all, setAll] = React.useState(false);
  const truncated = !all && chain.length > cap;
  const shown = truncated ? chain.slice(0, cap - 1) : chain;
  const rest = chain.length - shown.length;
  const showBranches = !truncated && branches.length > 0;
  return (
    <div className="regtrail">
      {shown.map((id, i) => (
        <React.Fragment key={id}>
          {i > 0 && <span className="regsep" aria-hidden="true">›</span>}
          <button className="regchip" onClick={(e) => { e.stopPropagation(); onEnter(id); }} title={truncate(notes[id].text, 90)}>
            {id}
          </button>
        </React.Fragment>
      ))}
      {truncated && (
        <button className="regchip more" onClick={(e) => { e.stopPropagation(); setAll(true); }} title="Alle Zettel dieses Pfads zeigen">
          +{rest}
        </button>
      )}
      {showBranches && branches.map((b) => (
        <button key={b.id} className="regchip branch" onClick={(e) => { e.stopPropagation(); onEnter(b.id); }} title={truncate((notes[b.id] || {}).text || "", 90)}>
          <span className="bsplit" aria-hidden="true">↳</span>{b.id}
        </button>
      ))}
    </div>
  );
}

/* Editierbare Stammnummer — Klick öffnet die Notiz, Stift (bei Hover) benennt um */
function RegNum({ root, onOpen, onRename }) {
  const stamm = root.split("/")[0];
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(stamm);
  const inRef = React.useRef(null);
  React.useEffect(() => {
    if (editing) { setVal(stamm); requestAnimationFrame(() => inRef.current && inRef.current.select()); }
  }, [editing]);
  const commit = () => {
    const v = val.trim();
    if (v && v !== stamm && onRename) onRename(stamm, v);
    setEditing(false);
  };
  if (editing) {
    return (
      <input ref={inRef} className="regnum-edit mono" value={val} autoFocus inputMode="numeric"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ""))}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        onBlur={commit} />
    );
  }
  return (
    <span className="regnum-wrap">
      <button className="regnum mono regnum-open" title="Notiz öffnen"
        onClick={(e) => { e.stopPropagation(); onOpen(); }}>{stamm}</button>
      {onRename && (
        <button className="regnum-pen" title="Stammnummer ändern"
          onClick={(e) => { e.stopPropagation(); setEditing(true); }}><Ic.write /></button>
      )}
    </span>
  );
}

/* eine einklappbare Register-Zeile (Stammnummer) */
function RegRow({ p, notes, hubs, onEnter, onOpenHub, onNewHub, themenVariante, showLeads, onRenameStamm, expanded, onToggle }) {
  const order = [...p.chain, ...p.branches.map((b) => b.id)];
  const wrapRef = React.useRef(null);
  const mounted = React.useRef(false);
  // sanfte Höhen-Animation (0 ↔ Inhaltshöhe); nach dem Öffnen auf auto, damit
  // verschachtelte Inhalte (z. B. „+N" im Pfad) nicht abgeschnitten werden.
  React.useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (!mounted.current) { mounted.current = true; el.style.height = expanded ? "auto" : "0px"; return; }
    const content = el.scrollHeight;
    const from = (expanded ? 0 : content) + "px";
    const to = (expanded ? content : 0) + "px";
    el.style.height = to;                       // Endzustand sofort setzen
    const anim = el.animate([{ height: from }, { height: to }], { duration: 240, easing: "ease" });
    let done = false;
    anim.onfinish = () => { done = true; if (expanded) el.style.height = "auto"; };
    return () => { if (!done) anim.cancel(); };
  }, [expanded]);

  return (
    <div className={"regrow" + (expanded ? " open" : "")} data-root={p.root}>
      <div className="reghead" role="button" tabIndex={-1}
        onClick={(e) => { onToggle(); e.currentTarget.focus(); }}>
        <span className="regtwist" aria-hidden="true"><Ic.arrow /></span>
        <RegNum root={p.root} onOpen={() => onEnter(p.root)} onRename={onRenameStamm} />
        <span className="reghead-main">
          <span className="regname serif">{p.reihe}</span>
          {showLeads && !expanded && <span className="reglead serif">{truncate(notes[p.root].text, 96)}</span>}
        </span>
        <span className="regcount mono">{p.chain.length}</span>
      </div>
      <div className="regbody-wrap" ref={wrapRef} aria-hidden={!expanded}>
        <div className="regbody-pad">
          {showLeads && <p className="reglead serif" style={{ margin: "2px 0 14px" }}>{truncate(notes[p.root].text, 120)}</p>}
          {hubs && <ReiheThemen reihe={p.reihe} hubs={hubs} notes={notes} order={order} onEnter={onEnter} onOpenHub={onOpenHub} onNewHub={onNewHub} variant={themenVariante} />}
          <div className="reg-einzel">
            <span className="reg-einzel-label">Einzelne Zettel</span>
            <ZettelTrail chain={p.chain} branches={p.branches} notes={notes} onEnter={onEnter} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Variante A — kompakte, einklappbare Liste mit voller Tastatur-Navigation.
   ↑/↓ wandert durch Kopfzeilen UND (bei offener Reihe) durch Themen & Zettel im
   Inhalt · → klappt auf bzw. springt in den Inhalt · ← klappt zu bzw. zurück zur
   Kopfzeile · ⏎ öffnet (Kopf = Stammnummer-Notiz, sonst Thema/Zettel) · Leer klappt um. */
function RegisterListe({ paths, notes, onEnter, showLeads, hubs, onOpenHub, onNewHub, themenVariante, onRenameStamm }) {
  const [expanded, setExpanded] = React.useState(() => new Set());
  const listRef = React.useRef(null);
  const expand = (root) => setExpanded((prev) => new Set(prev).add(root));
  const collapse = (root) => setExpanded((prev) => { const n = new Set(prev); n.delete(root); return n; });
  const toggle = (root) => setExpanded((prev) => { const n = new Set(prev); n.has(root) ? n.delete(root) : n.add(root); return n; });

  // alle per Tastatur erreichbaren Elemente in Anzeige-Reihenfolge
  const navItems = () => {
    const root = listRef.current; if (!root) return [];
    const out = [];
    root.querySelectorAll(".regrow").forEach((row) => {
      const head = row.querySelector(".reghead");
      if (head) out.push(head);
      if (row.classList.contains("open")) {
        row.querySelectorAll(".regbody-wrap .rthema, .regbody-wrap button").forEach((el) => out.push(el));
      }
    });
    return out;
  };
  const isHead = (el) => el && el.classList && el.classList.contains("reghead");
  const rootOf = (el) => { const r = el && el.closest && el.closest(".regrow"); return r ? r.getAttribute("data-root") : null; };

  React.useEffect(() => {
    const onKey = (e) => {
      const tag = (document.activeElement || {}).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (window.__overlayOpen) return;
      const nav = navItems();
      if (!nav.length) return;
      let idx = nav.indexOf(document.activeElement);
      const cur = nav[idx < 0 ? 0 : idx];
      if (e.key === "ArrowDown") { e.preventDefault(); idx = idx < 0 ? 0 : Math.min(idx + 1, nav.length - 1); nav[idx].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); idx = idx <= 0 ? 0 : idx - 1; nav[idx].focus(); }
      else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isHead(cur)) {
          const r = rootOf(cur);
          const open = cur.closest(".regrow").classList.contains("open");
          if (r && !open) expand(r);
          else if (nav[(idx < 0 ? 0 : idx) + 1]) nav[(idx < 0 ? 0 : idx) + 1].focus();
        }
      }
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isHead(cur)) { const r = rootOf(cur); if (r) collapse(r); }
        else { const h = cur.closest(".regrow").querySelector(".reghead"); if (h) h.focus(); }
      }
      else if (e.key === " ") {
        if (isHead(cur)) { e.preventDefault(); const r = rootOf(cur); if (r) toggle(r); }
      }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (isHead(cur)) { const r = rootOf(cur); if (r) onEnter(r); }
        else if (cur) cur.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paths, expanded, onEnter]);

  return (
    <div className="reglist compact" ref={listRef}>
      {paths.map((p) => (
        <RegRow key={p.root} p={p} notes={notes} hubs={hubs} onEnter={onEnter} onOpenHub={onOpenHub} onNewHub={onNewHub}
          themenVariante={themenVariante} showLeads={showLeads} onRenameStamm={onRenameStamm}
          expanded={expanded.has(p.root)} onToggle={() => toggle(p.root)} />
      ))}
    </div>
  );
}

/* Variante B — kompaktes Karten-Raster */
function RegisterKarten({ paths, notes, onEnter, showLeads, hubs, onOpenHub, onNewHub, themenVariante, onRenameStamm }) {
  return (
    <div className="reggrid">
      {paths.map((p, i) => {
        const order = [...p.chain, ...p.branches.map((b) => b.id)];
        return (
          <div className="regcard" key={p.root}>
            <div className="regcard-head" onClick={() => onEnter(p.root)} style={{ cursor: "pointer" }}>
              <RegNum root={p.root} onOpen={() => onEnter(p.root)} onRename={onRenameStamm} />
              <span className="regname serif">{p.reihe}</span>
              <span className="regcount mono">{p.chain.length} Zettel</span>
            </div>
            {showLeads && <p className="reglead serif">{truncate(notes[p.root].text, 110)}</p>}
            {hubs && <ReiheThemen reihe={p.reihe} hubs={hubs} notes={notes} order={order} onEnter={onEnter} onOpenHub={onOpenHub} onNewHub={onNewHub} variant={themenVariante} />}
            <div className="reg-einzel">
              <span className="reg-einzel-label">Einzelne Zettel</span>
              <ZettelTrail chain={p.chain} branches={p.branches} notes={notes} onEnter={onEnter} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverviewMode({ notes, links, hubs, onEnter, onOpenHub, onNewHub, onRenameStamm, variant = "liste", themenVariante = "karten", showLeads = false }) {
  const paths = buildPaths(notes, links);
  const total = Object.keys(notes).length;
  const hubCount = hubs ? Object.keys(hubs).length : 0;
  return (
    <div className="ovwrap scrollcol">
      <div className="ovinner">
        <header className="ovhead">
          <div className="seclabel">Register</div>
          <h1 className="ovtitle serif">Übersicht</h1>
          <p className="ovsub">
            {paths.length} Reihen · {total} Zettel{hubCount > 0 ? " · " + hubCount + " Themen" : ""}. Wähle einen Pfad, ein Thema der Reihe — oder steige bei einem einzelnen Zettel ein.
          </p>
        </header>
        {variant === "karten"
          ? <RegisterKarten paths={paths} notes={notes} onEnter={onEnter} showLeads={showLeads} hubs={hubs} onOpenHub={onOpenHub} onNewHub={onNewHub} themenVariante={themenVariante} onRenameStamm={onRenameStamm} />
          : <RegisterListe paths={paths} notes={notes} onEnter={onEnter} showLeads={showLeads} hubs={hubs} onOpenHub={onOpenHub} onNewHub={onNewHub} themenVariante={themenVariante} onRenameStamm={onRenameStamm} />}
      </div>
    </div>
  );
}

Object.assign(window, { buildPaths, OverviewMode });
