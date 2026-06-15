/* proto-hubs.jsx — Themen (Übersichtszettel), nach Luhmanns Register-Prinzip
   Eine Index-/Registerkarte nennt ein Thema und verweist auf den/die Zettel,
   die den EINSTIEG in diesen Teil des Netzes bieten. Ein einziger Einstiegs-
   zettel genügt; weitere können verknüpft werden. Themen gehören zu einer Reihe
   und ordnen sich nach der Hierarchie ihres Einstiegszettels. Adressen (Ü…)
   bleiben rein intern und werden nicht angezeigt. */

const SEED_HUBS = {
  "h-schreiben-werkzeug": {
    reihe: "Schreiben",
    titel: "Schreiben als Denkwerkzeug",
    leitsatz: "Wie das Aufschreiben das Denken nicht protokolliert, sondern erzeugt.",
    eintraege: ["1"],
  },
  "h-schreiben-antwort": {
    reihe: "Schreiben",
    titel: "Der Zettel antwortet",
    leitsatz: "Wiedergefundene Gedanken werden zu fremden — und widersprechbar.",
    eintraege: ["1/2"],
  },
  "h-form": {
    reihe: "Form",
    titel: "Form & Reduktion",
    leitsatz: "Wer zur Form zwingt, zwingt zur Entscheidung.",
    eintraege: ["5"],
  },
  "h-gedaechtnis": {
    reihe: "Gedächtnis",
    titel: "Erinnern als Neukomposition",
    leitsatz: "Der Kasten erinnert anders als wir — gerade darin liegt sein Wert.",
    eintraege: ["21"],
  },
};

const isHub = (id, hubs) => !!(hubs && hubs[id]);
const hubsOfReihe = (reihe, hubs) => Object.keys(hubs || {}).filter((h) => hubs[h].reihe === reihe);

/* Themen einer Reihe nach der Hierarchie ihres Einstiegszettels sortieren.
   `order` = Zettel-Adressen der Reihe in Hierarchie-Reihenfolge (Kette, dann Abzweige). */
function sortHubsByHierarchy(ids, hubs, order) {
  const pos = (hid) => {
    const e = hubs[hid].eintraege[0];
    const i = order.indexOf(e);
    return i === -1 ? 9999 : i;
  };
  return [...ids].sort((a, b) => pos(a) - pos(b) || hubs[a].titel.localeCompare(hubs[b].titel));
}

/* klickbarer Zettel-Einstieg */
function EntryChip({ id, notes, onEnter }) {
  if (!notes[id]) return null;
  return (
    <button className="regchip" onClick={(e) => { e.stopPropagation(); onEnter(id); }} title={truncate(notes[id].text, 90)}>
      {id}
    </button>
  );
}

/* ===== Themen einer Reihe — prominent, über den einzelnen Zetteln ===== */
function ReiheThemen({ reihe, hubs, notes, order, onEnter, onOpenHub, onNewHub, variant = "karten" }) {
  const ids = sortHubsByHierarchy(hubsOfReihe(reihe, hubs), hubs, order);
  const kompakt = variant === "kompakt";
  return (
    <div className="reihethemen">
      {ids.map((hid, i) => {
        const h = hubs[hid];
        const einstieg = h.eintraege[0];
        const mehr = h.eintraege.length - 1;
        return (
          <div key={hid} role="button" tabIndex={-1} className={"rthema" + (kompakt ? " kompakt" : "")} onClick={(e) => { e.stopPropagation(); onOpenHub(hid); }}>
            <span className="rthema-num">{i + 1}</span>
            <div className="rthema-main">
              <div className="rthema-line">
                <span className="rthema-titel serif">{h.titel}</span>
                <span className="rthema-leader" aria-hidden="true" />
                {einstieg && <span className="rthema-pg">{einstieg}{mehr > 0 ? <em className="rthema-pgmore"> +{mehr}</em> : null}</span>}
              </div>
              {!kompakt && h.leitsatz && <div className="rthema-leit serif">{h.leitsatz}</div>}
            </div>
          </div>
        );
      })}
      <button className="th-new-mini" onClick={(e) => { e.stopPropagation(); onNewHub(reihe); }}>
        <Ic.plus /> Thema in dieser Reihe
      </button>
    </div>
  );
}

/* ===== Themen-Einstieg (A · Luhmann-treu) — Schwelle, nicht Mappe.
   Zwei Zustände: am Einstieg die volle Schwelle, beim Weiterlesen nur die Spur. ===== */
function ThemeBanner({ hub, focus, notes, onEnter, onEdit, onExit, onAddEntry }) {
  if (!hub) return null;
  const atEntry = hub.eintraege.includes(focus);
  const primary = atEntry ? focus : hub.eintraege[0];
  const others = hub.eintraege.filter((id) => id !== primary);

  // eingeklappte Spur — man hat im Thema weitergelesen, der Rahmen tritt zurück
  if (!atEntry) {
    return (
      <div className="thm-trace">
        <span className="thm-tracedot" />
        <span className="thm-tracelbl">Im Thema</span>
        <button className="thm-traceback" onClick={() => primary && onEnter(primary)} title={"Zum Einstieg " + primary}>{hub.titel}</button>
        <span className="thm-tracehint">↩ Einstieg {primary}</span>
        <button className="thm-ghost" onClick={onEdit} title="Thema bearbeiten"><Ic.write /></button>
        <button className="thm-ghost" onClick={onExit} title="Thema verlassen"><Ic.close /></button>
      </div>
    );
  }

  // volle Schwelle am Einstieg
  return (
    <div>
      <div className="thm-thresh">
        <span className="thm-eyebrow">Im Thema</span>
        <span className="thm-title">{hub.titel}</span>
        <span className="thm-ptr">
          <span className="thm-ptrlabel">Einstieg</span>
          <Ic.reply style={{ width: 13, height: 13, color: "var(--accent-ink)", transform: "scaleX(-1)" }} />
          <span className="thm-addr">{primary}</span>
        </span>
        <span className="thm-vline" />
        <div className="thm-actions">
          <button className="thm-ghost" onClick={onEdit} title="Thema bearbeiten"><Ic.write /></button>
          {onExit && <button className="thm-ghost" onClick={onExit} title="Thema verlassen"><Ic.close /></button>}
        </div>
      </div>
      <div className="thm-rule" />
      {others.length > 0 && (
        <div className="thm-alts">
          <span className="thm-altlabel">Weitere Einstiege</span>
          {others.map((id) => (
            <button key={id} className="thm-door" onClick={() => onEnter(id)} title={truncate((notes[id] || {}).text || "", 90)}>{id}</button>
          ))}
          {onAddEntry && <button className="thm-door thm-door-add" onClick={onAddEntry}>+ Einstieg</button>}
        </div>
      )}
    </div>
  );
}

/* ===== Themen-Editor (Modal) — Titel, Leitsatz, verknüpfte Zettel verwalten ===== */
function HubEditor({ id, hubs, notes, onEnter, onEditMeta, onAddEntry, onRemoveEntry, onMoveEntry, onDelete, onClose }) {
  const h = hubs[id];
  const [titel, setTitel] = useState(h ? h.titel : "");
  const [leit, setLeit] = useState(h ? h.leitsatz : "");
  useEffect(() => { if (h) { setTitel(h.titel); setLeit(h.leitsatz); } }, [id]);
  if (!h) return null;
  const save = () => onEditMeta(id, { titel: titel.trim() || h.titel, leitsatz: leit.trim() });
  const done = () => { save(); onClose(); };

  return (
    <div className="wkscrim" onClick={done}>
      <div className="hubmodal" onClick={(e) => e.stopPropagation()}>
        <div className="hubmodal-head">
          <Ic.layers style={{ width: 17, height: 17, color: "var(--accent-ink)" }} />
          <span className="hub-kind">Thema bearbeiten</span>
          <span className="hub-reihe">Reihe · {h.reihe}</span>
          <div style={{ flex: 1 }} />
          <button className="wk-rm" onClick={done}><Ic.close /></button>
        </div>
        <div className="hubmodal-body scrollcol">
          <input className="hub-titel-edit serif" value={titel} onChange={(e) => setTitel(e.target.value)} onBlur={save} placeholder="Thema" />
          <textarea className="hub-leit-edit serif" rows={2} value={leit} onChange={(e) => setLeit(e.target.value)} onBlur={save} placeholder="Leitsatz — worum es bei diesem Thema geht" />

          <div className="hub-entries-head">
            <span className="seclabel">Einstiege</span>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-faint)" }}>{h.eintraege.length}</span>
          </div>
          <div className="hub-entries">
            {h.eintraege.length === 0 && (
              <div className="th-empty" style={{ margin: 0 }}>Noch kein Einstieg. Verknüpfe einen Zettel dieser Reihe — einer genügt.</div>
            )}
            {h.eintraege.map((eid, i) => {
              const target = notes[eid];
              if (!target) return null;
              return (
                <div key={eid} className="hub-entry">
                  <div className="hub-ord">
                    <button disabled={i === 0} onClick={() => onMoveEntry(id, i, -1)} title="Nach oben">↑</button>
                    <button disabled={i === h.eintraege.length - 1} onClick={() => onMoveEntry(id, i, 1)} title="Nach unten">↓</button>
                  </div>
                  <button className="hub-entry-body" onClick={() => { save(); onEnter(eid); }}>
                    <div className="hub-entry-addr"><span className="mono">{eid}</span><span className="hub-open-hint">Öffnen</span></div>
                    <div className="hub-entry-text serif">{truncate(target.text, 150)}</div>
                  </button>
                  <button className="hub-rm" onClick={() => onRemoveEntry(id, eid)} title="Verknüpfung lösen"><Ic.close /></button>
                </div>
              );
            })}
          </div>
          <button className="hub-add" onClick={() => onAddEntry(id)}><Ic.link /> Mit weiterem Zettel verknüpfen</button>
        </div>
        <div className="hubmodal-foot">
          <button className="pill th-del" onClick={() => onDelete(id)} title="Thema löschen"><Ic.close /> Thema löschen</button>
          <div style={{ flex: 1 }} />
          <button className="pill solid" onClick={done}><Ic.check /> Fertig</button>
        </div>
      </div>
    </div>
  );
}

/* ===== Picker: einen Zettel DERSELBEN Reihe mit dem Thema verknüpfen ===== */
function HubEntryPicker({ hub, hubs, notes, order, onConfirm, onClose }) {
  const [q, setQ] = useState("");
  const reihe = hubs[hub].reihe;
  const existing = new Set(hubs[hub].eintraege);
  const ql = q.trim().toLowerCase();
  const ord = order || [];

  const noteIds = Object.keys(notes)
    .filter((id) => notes[id].reihe === reihe && !existing.has(id) &&
      (!ql || id.toLowerCase().includes(ql) || notes[id].text.toLowerCase().includes(ql)))
    .sort((a, b) => (ord.indexOf(a) + 1 || 9999) - (ord.indexOf(b) + 1 || 9999));

  return (
    <div className="wkscrim" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-head">
          <Ic.search style={{ width: 18, height: 18, color: "var(--ink-faint)" }} />
          <input className="picker-input" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={"Zettel der Reihe „" + reihe + "“ verknüpfen …"} />
          <button className="wk-rm" onClick={onClose}><Ic.close /></button>
        </div>
        <div className="picker-list">
          {noteIds.map((id) => (
            <div key={id} className="pick-hl" onClick={() => onConfirm(hub, id)}>
              <span className="mono" style={{ fontSize: 12, color: "var(--accent-ink)", marginTop: 2, flex: "0 0 auto", minWidth: 34 }}>{id}</span>
              <p>{truncate(notes[id].text, 110)}</p>
            </div>
          ))}
          {noteIds.length === 0 && (
            <div className="th-empty" style={{ margin: "8px 4px" }}>Kein weiterer Zettel in dieser Reihe.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Picker: einen Zettel einem Thema SEINER Reihe zuordnen (aus dem Zettel heraus) ===== */
function ThemePicker({ noteId, hubs, notes, onAdd, onCreate, onClose }) {
  const reihe = notes[noteId].reihe;
  const ids = hubsOfReihe(reihe, hubs).filter((hid) => !hubs[hid].eintraege.includes(noteId));
  return (
    <div className="wkscrim" onClick={onClose}>
      <div className="picker" onClick={(e) => e.stopPropagation()}>
        <div className="picker-head">
          <Ic.reply style={{ width: 18, height: 18, color: "var(--ink-faint)", transform: "scaleX(-1)" }} />
          <span className="picker-input" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            Von welchem Stichwort aus soll man direkt zu <span className="mono" style={{ color: "var(--accent-ink)", fontSize: 13 }}>{noteId}</span> springen?
          </span>
          <button className="wk-rm" onClick={onClose}><Ic.close /></button>
        </div>
        <div className="pick-hint">Kein Ablegen — ein Einstieg. Das Stichwort wird zur Tür, die hier mitten im Ast aufgeht, statt sich von oben durchzuklicken. Wenige Türen sind luhmann’scher als viele.</div>
        <div className="picker-list">
          {ids.length > 0 && <div className="pick-group">Stichwörter der Reihe „{reihe}“</div>}
          {ids.map((hid) => (
            <div key={hid} className="pick-hl" onClick={() => onAdd(hid, noteId)}>
              <Ic.layers style={{ width: 16, height: 16, color: "var(--accent-ink)", marginTop: 2, flex: "0 0 16px" }} />
              <div style={{ minWidth: 0 }}>
                <span className="serif" style={{ fontSize: 15, color: "var(--ink)" }}>{hubs[hid].titel}</span>
                <div style={{ fontSize: 12.5, color: "var(--ink-faint)", marginTop: 2 }}>{hubs[hid].eintraege.length} Tür{hubs[hid].eintraege.length === 1 ? "" : "en"} ins Netz</div>
              </div>
            </div>
          ))}
          {ids.length === 0 && (
            <div className="th-empty" style={{ margin: "8px 4px" }}>Noch kein Stichwort in dieser Reihe.</div>
          )}
        </div>
        <div className="picker-foot">
          <button className="pill solid" onClick={() => onCreate(reihe, noteId)}><Ic.plus /> Neues Stichwort — von hier aus erreichbar</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SEED_HUBS, isHub, hubsOfReihe, sortHubsByHierarchy, EntryChip, ReiheThemen, ThemeBanner, HubEditor, HubEntryPicker, ThemePicker });
