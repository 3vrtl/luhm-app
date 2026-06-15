/* z2-readwise.jsx — Readwise als Material.
   Highlights sind Rohstoff (Literaturnotizen), kein Zettel. Sie strömen in einen
   Posteingang; aus einem Highlight entsteht ein eigener Zettel, das Highlight
   bleibt als BELEG (Provenienz) am Zettel hängen. */

const { useState: useRW, useRef: useRWR, useEffect: useRWE, useMemo: useRWM } = React;

/* Quellen in der Reihenfolge des jüngsten Imports (wie ein Sync-Feed).
   Spiegelt die Readwise-Export-API: Highlights kommen je Quelle („book") gebündelt. */
function sourceOrder(sources, grouped) {
  const latest = (sid) => (grouped[sid] || []).reduce((m, h) => {
    const d = (SEED_HIGHLIGHTS[h] && SEED_HIGHLIGHTS[h].imported) || "";
    return d > m ? d : m;
  }, "");
  return Object.keys(sources).sort((a, b) => latest(b).localeCompare(latest(a)));
}

/* unverarbeitete Highlights = in keinem Beleg referenziert, neueste zuerst */
function unprocessedHighlights(highlights, belege) {
  const used = new Set();
  Object.values(belege || {}).forEach((arr) => (arr || []).forEach((h) => used.add(h)));
  return Object.keys(highlights)
    .filter((h) => !used.has(h))
    .sort((a, b) => (highlights[b].imported || "").localeCompare(highlights[a].imported || ""));
}

const SRC_IC = { book: "book", essay: "quote", article: "doc" };
function SourceMark({ kind }) {
  const name = SRC_IC[kind] || "doc";
  return <span className={"z2-smark s-" + (kind || "doc")}>{Ic[name]({})}</span>;
}

function lastName(author) {
  return author ? author.split(/\s+/).slice(-1)[0] : "Quelle";
}

/* Beleg-Fuß am Zettel — flüsterleise; Hover enthüllt das Zitat */
function BelegFoot({ ids, highlights, sources, onOpen }) {
  const [open, setOpen] = useRW(null);
  if (!ids || ids.length === 0) return null;
  return (
    <div className="z2-belege">
      <span className="z2-belegchips">
        {ids.map((hid, i) => {
          const h = highlights[hid]; if (!h) return null;
          const s = sources[h.src] || {};
          const ort = (h.ort || "").split("·")[0].trim();
          return (
            <span key={hid} className="z2-belegchip" onMouseEnter={() => setOpen(hid)} onMouseLeave={() => setOpen(null)}>
              {i > 0 && <span className="z2-belegsep">|</span>}
              <button type="button" className="z2-belegname" onClick={() => onOpen && onOpen(hid)} title="Highlight öffnen">{lastName(s.author)}{ort ? " " + ort : ""}</button>
              {open === hid && (
                <span className="z2-belegpop">
                  <span className="z2-belegquote">„{h.text}"</span>
                  <span className="z2-belegsrc"><SourceMark kind={s.kind} />{s.title} · {s.author}</span>
                </span>
              )}
            </span>
          );
        })}
      </span>
    </div>
  );
}

/* ---------- Highlights, quellenweise (Readwise-Export-Modell) ----------
   Drei Ebenen, in einer Lade von unten (verhält sich wie das Graph-Fenster):
     Ebene 0  Quellen — je Buch/Artikel ein Eintrag, mit „neu"-Zähler.
     Ebene 1  die Highlights EINER Quelle — kompakt, je 2 Zeilen Vorschau.
     Ebene 2  ein Highlight ganz geöffnet — voller Text, Verknüpfungen,
              „Neuer Zettel daraus" und „An Zettel heften …" (beliebiger Zettel). */
function HighlightsBrowser({ view, sources, highlights, belege, notes, grouped, order, cursor, attachTarget, lastSync, syncing, onSync, onOpenSource, onOpenHl, onBack, onBackToList, onSetCursor, onProcessNew, onAttachTo, onDetach, onOpenNote, picking, onSetPicking }) {
  const listRef = useRWR(null);
  const zinputRef = useRWR(null);
  const [zq, setZq] = useRW("");
  useRWE(() => { setZq(""); }, [view.hid, view.src]);
  useRWE(() => { if (picking) requestAnimationFrame(() => { if (zinputRef.current) zinputRef.current.focus(); }); }, [picking]);
  useRWE(() => {
    const c = listRef.current; if (!c) return;
    const el = c.querySelector(".cursor"); if (!el) return;
    const top = el.offsetTop, bot = top + el.offsetHeight;
    if (top < c.scrollTop) c.scrollTop = top - 8;
    else if (bot > c.scrollTop + c.clientHeight) c.scrollTop = bot - c.clientHeight + 8;
  }, [cursor, view.src, view.hid]);
  const prevent = (fn) => (e) => { e.preventDefault(); fn(); };

  /* ----- Ebene 2: ein einzelnes Highlight, ganz geöffnet ----- */
  if (view.src && view.hid) {
    const s = sources[view.src] || {};
    const h = highlights[view.hid] || {};
    const inNotes = notesForHighlight(view.hid, belege || {});
    const here = attachTarget && inNotes.includes(attachTarget);
    const ql = zq.trim().toLowerCase();
    const zNoteIds = Object.keys(notes || {})
      .filter((id) => !inNotes.includes(id))
      .filter((id) => !ql || id.toLowerCase().includes(ql) || (((notes[id] || {}).titel || "") + " " + ((notes[id] || {}).text || "")).toLowerCase().includes(ql))
      .sort((a, b) => (a === attachTarget ? -1 : b === attachTarget ? 1 : cmpAddr(a, b)));
    return (
      <div className="z2-hlpanel">
        <div className="z2-hlhead">
          <button className="z2-hlback" onMouseDown={prevent(onBackToList)}>{Ic.arrow({})} Liste</button>
          <SourceMark kind={s.kind} />
          <div className="z2-hlhead-id">
            <div className="z2-hlhead-title">{s.author}</div>
            <div className="z2-hlhead-meta">{SRC_KIND_LABEL[s.kind] || s.kind} · {h.ort} · {fmtDate(h.imported)}</div>
          </div>
        </div>
        <div className="z2-hldetailbody">
          <p className="z2-hldetail-q">„{h.text}"</p>
          {(h.tags || []).length > 0 && <div className="z2-hldetail-tags">{h.tags.map((t) => <span key={t} className="z2-hltag">{t}</span>)}</div>}
          <div className="z2-hldetail-links">
            <span className="z2-hldetail-lbl">
              {inNotes.length ? "Verknüpft mit " + inNotes.length + " Zettel" + (inNotes.length > 1 ? "n" : "") : "Noch mit keinem Zettel verknüpft"}
            </span>
            {inNotes.length > 0 && (
              <div className="z2-hldetail-chips">
                {inNotes.map((id) => (
                  <span key={id} className="z2-linkchip">
                    <button className="z2-linkchip-id" onMouseDown={prevent(() => onOpenNote(id))}>{id}</button>
                    <button className="z2-linkchip-x" onMouseDown={prevent(() => onDetach(view.hid, id))} title="Verknüpfung lösen">{Ic.close({})}</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {picking ? (
          <div className="z2-zpick">
            <div className="z2-zpick-head">
              {Ic.search({})}
              <input ref={zinputRef} className="z2-zpick-input" autoFocus value={zq} placeholder="Zettel suchen — Nr., Titel, Text …"
                spellCheck={false} onChange={(e) => setZq(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onSetPicking(false); } }} />
              <button className="z2-graph-btn" onMouseDown={prevent(() => onSetPicking(false))}>{Ic.close({})}</button>
            </div>
            <div className="z2-zpick-list">
              {zNoteIds.map((id) => (
                <button key={id} className="z2-zpick-row" onMouseDown={prevent(() => { onAttachTo(view.hid, id); onOpenNote(id); onSetPicking(false); setZq(""); })}>
                  <span className="z2-zpick-addr">{id}</span>
                  <span className="z2-zpick-txt">{(notes[id] && notes[id].titel) || truncate((notes[id] && notes[id].text) || "", 48) || "—"}</span>
                  {id === attachTarget && <span className="z2-zpick-cur">offen</span>}
                </button>
              ))}
              {zNoteIds.length === 0 && <div className="z2-zpick-empty">Kein Zettel gefunden.</div>}
            </div>
          </div>
        ) : (
          <div className="z2-hldetail-acts">
            {here
              ? <span className="z2-hldetail-done">{Ic.check({})} an {attachTarget} geheftet</span>
              : <button className="z2-ibtn primary" onMouseDown={prevent(() => onAttachTo(view.hid, attachTarget))}>An Zettel {attachTarget} heften <Kc k="↵" /></button>}
            <button className="z2-ibtn" onMouseDown={prevent(() => onSetPicking(true))}>anderer Zettel <Kc k="→" /></button>
          </div>
        )}
      </div>
    );
  }

  /* ----- Ebene 1: die Highlights EINER Quelle, kompakt ----- */
  if (view.src) {
    const s = sources[view.src] || {};
    const hids = grouped[view.src] || [];
    return (
      <div className="z2-hlpanel">
        <div className="z2-hlhead">
          <button className="z2-hlback" onMouseDown={prevent(onBack)}>{Ic.arrow({})} Quellen</button>
          <SourceMark kind={s.kind} />
          <div className="z2-hlhead-id">
            <div className="z2-hlhead-title">{s.title}</div>
            <div className="z2-hlhead-meta">{s.author} · {SRC_KIND_LABEL[s.kind] || s.kind} · {hids.length} Highlights</div>
          </div>
        </div>
        <div className="z2-hllist" ref={listRef}>
          {hids.map((hid, i) => {
            const h = highlights[hid]; if (!h) return null;
            const inNotes = notesForHighlight(hid, belege || {});
            const done = inNotes.length > 0;
            return (
              <button key={hid} className={"z2-hlrow" + (i === cursor ? " cursor" : "") + (done ? " done" : "")} onClick={() => onOpenHl(hid, i)} onMouseEnter={() => onSetCursor(i)}>
                <p className="z2-hlrow-q">„{h.text}"</p>
                <span className="z2-hlrow-foot">
                  <span className="z2-hlrow-ort">{h.ort}</span>
                  <span className="z2-flex" />
                  {done
                    ? <span className="z2-hlbadge done">{Ic.check({})} {inNotes.length}</span>
                    : <span className="z2-hlbadge">neu</span>}
                  <span className="z2-hlrow-chev">{Ic.arrow({})}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  /* ----- Ebene 0: die Quellen ----- */
  return (
    <div className="z2-hlpanel">
      <div className="z2-hlsync">
        <span className="z2-rwdot" />
        <span className="z2-hlsync-txt">Readwise · verbunden</span>
        <span className="z2-hlsync-sub">{lastSync}</span>
        <span className="z2-flex" />
        <button className="z2-hlsyncbtn" onClick={onSync} disabled={syncing}>
          {Ic.sync({ style: syncing ? { animation: "spin 1s linear infinite" } : null })} {syncing ? "Lädt…" : "Sync"}
        </button>
      </div>
      <div className="z2-srclist" ref={listRef}>
        {order.map((sid, i) => {
          const s = sources[sid] || {}; const hids = grouped[sid] || [];
          const neu = hids.filter((h) => !isVerarbeitet(h, belege)).length;
          return (
            <button key={sid} className={"z2-srcrow" + (i === cursor ? " cursor" : "")} onClick={() => onOpenSource(sid)} onMouseEnter={() => onSetCursor(i)}>
              <SourceMark kind={s.kind} />
              <span className="z2-srcrow-main">
                <span className="z2-srcrow-title">{s.title}</span>
                <span className="z2-srcrow-auth">{s.author} · {SRC_KIND_LABEL[s.kind] || s.kind}</span>
              </span>
              <span className="z2-srcrow-counts">
                {neu > 0 && <span className="z2-srcrow-neu">{neu} neu</span>}
                <span className="z2-srcrow-n">{hids.length}</span>
              </span>
              <span className="z2-srcrow-chev">{Ic.arrow({})}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Die Lade: identisches Verhalten wie der Graph — Griff zum Ziehen/Scrollen
   (Voll/Halb/Schließen). Der Zettel bleibt oben sichtbar, das Highlight unten. */
function HighlightsDrawer({ mode, closing, onMode, onClose, ...rest }) {
  const hdrag = useRWR(null);
  const wheelG = useRWR({ acted: false, last: 0 });
  const onHDown = (e) => { if (e.target.closest(".z2-graph-tools")) return; hdrag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const onHUp = (e) => {
    if (hdrag.current == null) return; const dy = e.clientY - hdrag.current; hdrag.current = null;
    if (dy < -28) onMode("full");
    else if (dy > 28) { if (mode === "full") onMode("half"); else onClose(); }
  };
  const onHWheel = (e) => {
    if (Math.abs(e.deltaY) < 2) return;
    const now = Date.now(); const g = wheelG.current;
    if (now - g.last > 220) g.acted = false; g.last = now;
    if (g.acted) return; g.acted = true;
    if (e.deltaY < 0) { if (mode !== "full") onMode("full"); }
    else { if (mode === "full") onMode("half"); else onClose(); }
  };
  return (
    <div className={"z2-graph z2-hldraw " + mode + (closing ? " closing" : "")}>
      <div className="z2-graph-handle" onPointerDown={onHDown} onPointerUp={onHUp} onWheel={onHWheel}>
        <span className="z2-graph-grip" />
        <div className="z2-graph-tools">
          <button className="z2-graph-btn" title={mode === "full" ? "Verkleinern" : "Auf volle Größe"} onClick={() => onMode(mode === "full" ? "half" : "full")}>
            {mode === "full" ? Ic.arrow({ style: { transform: "rotate(90deg)" } }) : Ic.arrow({ style: { transform: "rotate(-90deg)" } })}
          </button>
          <button className="z2-graph-btn" title="Schließen (Esc)" onClick={onClose}>{Ic.close({})}</button>
        </div>
      </div>
      <div className="z2-hldraw-body">
        <HighlightsBrowser {...rest} />
      </div>
    </div>
  );
}

Object.assign(window, { unprocessedHighlights, BelegFoot, HighlightsBrowser, HighlightsDrawer, SourceMark, sourceOrder });
