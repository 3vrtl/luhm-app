/* z2-sheet.jsx — Die Schreibfläche eines Zettels.
   Ein leeres Blatt: contentEditable, blinkender Cursor, nichts lenkt ab.
   @-Verweise werden als nicht-editierbare Marken im Fluss gesetzt; beim Tippen
   von „@" öffnet sich eine kleine Suche. Pfeil ↓/↑ am Text-Rand „fließt" auf den
   nächsten/vorigen Zettel über. */

const { useRef, useEffect, useState, useLayoutEffect } = React;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* Text → HTML mit @-Marken, Formatierung (**fett** *kursiv* __unterstrichen__) und Zeilenumbrüchen */
function inlineHtml(line) {
  let s = escapeHtml(line);
  s = s.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");
  s = s.replace(/__([^_]+)__/g, "<u>$1</u>");
  s = s.replace(/\*([^*]+)\*/g, "<i>$1</i>");
  s = s.replace(/@([0-9][0-9a-z]*(?:\/[0-9a-z]+)*)/gi, (full, addr) =>
    `<span class="atlink" contenteditable="false" data-addr="${addr}">@${addr}</span>`);
  return s;
}
function textToHtml(text) {
  const lines = String(text || "").split("\n");
  return lines.map((line) => (line === "" ? "<br>" : `<div>${inlineHtml(line)}</div>`)).join("");
}

/* DOM → Text zurücklesen (Formatierung als Marken) */
function serializeNode(node) {
  if (node.nodeType === 3) return node.nodeValue.replace(/\u00a0/g, " ");
  if (node.nodeName === "BR") return "\n";
  if (node.classList && node.classList.contains("atlink")) return "@" + node.dataset.addr;
  let inner = "";
  node.childNodes.forEach((c) => { inner += serializeNode(c); });
  const nn = node.nodeName;
  const cs = node.style || {};
  if (nn === "B" || nn === "STRONG" || /^(bold|[6-9]00)$/.test(cs.fontWeight || "")) return inner ? "**" + inner + "**" : "";
  if (nn === "I" || nn === "EM" || cs.fontStyle === "italic") return inner ? "*" + inner + "*" : "";
  if (nn === "U" || (cs.textDecoration || "").includes("underline")) return inner ? "__" + inner + "__" : "";
  if (nn === "DIV" || nn === "P" || /^H[1-6]$/.test(nn)) return "\n" + inner;
  return inner;
}
function serialize(root) {
  let out = "";
  root.childNodes.forEach((c) => { out += serializeNode(c); });
  return out.replace(/^\n+/, "").replace(/\n+$/, "");
}

function caretAtStart(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const r = sel.getRangeAt(0);
  if (!r.collapsed) return false;
  const pre = document.createRange();
  pre.selectNodeContents(el); pre.setEnd(r.startContainer, r.startOffset);
  return pre.toString().length === 0;
}
function caretAtEnd(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const r = sel.getRangeAt(0);
  if (!r.collapsed) return false;
  const post = document.createRange();
  post.selectNodeContents(el); post.setStart(r.startContainer, r.startOffset);
  return post.toString().length === 0;
}

function Sheet({ noteId, text, notes, onChange, onNavigate, onSpill, onTop, placeholder, className, autoFocus }) {
  const ref = useRef(null);
  const wrapRef = useRef(null);
  const [pick, setPick] = useState(null); // { query, x, y, idx }
  const [fmt, setFmt] = useState(null);   // { x, y } Position der Formatier-Blase

  // Auswahl prüfen: nicht-leere Markierung in der Schreibfläche → Blase zeigen
  const updateSel = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) { setFmt(null); return; }
    const r = sel.getRangeAt(0);
    if (!ref.current || !ref.current.contains(r.commonAncestorContainer)) { setFmt(null); return; }
    if (r.toString().trim().length === 0) { setFmt(null); return; }
    const rect = r.getBoundingClientRect();
    const wrap = wrapRef.current.getBoundingClientRect();
    const below = (rect.top - wrap.top) < 44; // zu wenig Platz oben → unter die Auswahl klappen
    setFmt({ x: rect.left + rect.width / 2 - wrap.left, y: below ? (rect.bottom - wrap.top) : (rect.top - wrap.top), below });
  };
  const applyFmt = (cmd) => {
    try { document.execCommand("styleWithCSS", false, false); } catch (e) {}
    document.execCommand(cmd, false, null);
    emit();
    requestAnimationFrame(updateSel);
  };

  // Inhalt nur bei Zettelwechsel neu setzen (sonst springt der Cursor)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = text ? textToHtml(text) : "";
    if (autoFocus) {
      el.focus();
      // Cursor ans Ende
      const r = document.createRange(); r.selectNodeContents(el); r.collapse(false);
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
    }
  }, [noteId]); // eslint-disable-line

  const emit = () => { if (onChange) onChange(serialize(ref.current)); };

  const stripHeadings = () => {
    const el = ref.current;
    if (!el) return;
    const headings = el.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (!headings.length) return;
    const sel = window.getSelection();
    const savedRange = sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
    headings.forEach((h) => {
      const div = document.createElement("div");
      while (h.firstChild) div.appendChild(h.firstChild);
      h.parentNode.replaceChild(div, h);
    });
    if (savedRange) { try { sel.removeAllRanges(); sel.addRange(savedRange); } catch (e) {} }
  };

  // @-Trigger: rückwärts vom Cursor im aktuellen Textknoten ein "@wort" suchen
  const detectAt = () => {
    const sel = window.getSelection();
    if (!sel.rangeCount) { setPick(null); return; }
    const r = sel.getRangeAt(0);
    const node = r.startContainer;
    if (node.nodeType !== 3) { setPick(null); return; }
    const before = node.nodeValue.slice(0, r.startOffset);
    const m = before.match(/(?:^|\s)@([0-9a-z/]*)$/i);
    if (!m) { setPick(null); return; }
    const rect = r.getClientRects()[0] || r.getBoundingClientRect();
    const wrap = wrapRef.current.getBoundingClientRect();
    setPick({ query: m[1], x: rect.left - wrap.left, y: rect.bottom - wrap.top, idx: 0 });
  };

  const candidates = () => {
    const q = (pick?.query || "").toLowerCase();
    return Object.keys(notes)
      .filter((id) => id !== noteId)
      .filter((id) => !q || id.toLowerCase().includes(q) || (notes[id].text || "").toLowerCase().includes(q))
      .sort((a, b) => cmpAddr(a, b))
      .slice(0, 6);
  };

  const insertLink = (addr) => {
    const el = ref.current;
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    const node = r.startContainer;
    // "@query" vor dem Cursor entfernen
    const before = node.nodeValue.slice(0, r.startOffset);
    const m = before.match(/@([0-9a-z/]*)$/i);
    const at = m ? r.startOffset - m[0].length : r.startOffset;
    const del = document.createRange();
    del.setStart(node, at); del.setEnd(node, r.startOffset);
    del.deleteContents();
    // Marke + Leerzeichen einsetzen
    const chip = document.createElement("span");
    chip.className = "atlink"; chip.setAttribute("contenteditable", "false");
    chip.dataset.addr = addr; chip.textContent = "@" + addr;
    const space = document.createTextNode("\u00a0");
    del.insertNode(space); del.insertNode(chip);
    // Cursor hinter das Leerzeichen
    const nr = document.createRange(); nr.setStartAfter(space); nr.collapse(true);
    sel.removeAllRanges(); sel.addRange(nr);
    setPick(null); emit(); el.focus();
  };

  const onKeyDown = (e) => {
    if (pick) {
      const list = candidates();
      if (e.key === "ArrowDown") { e.preventDefault(); setPick({ ...pick, idx: (pick.idx + 1) % list.length }); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setPick({ ...pick, idx: (pick.idx - 1 + list.length) % list.length }); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); if (list[pick.idx]) insertLink(list[pick.idx]); return; }
      if (e.key === "Escape") { e.preventDefault(); setPick(null); return; }
    }
    // Pfeil hoch am Textanfang → in die Titelzeile (nur Variante „Leeres Blatt“)
    if (e.key === "ArrowUp" && !e.metaKey && !e.ctrlKey && onTop && caretAtStart(ref.current)) { e.preventDefault(); onTop(); return; }
  };

  const onClickSheet = (e) => {
    const chip = e.target.closest && e.target.closest(".atlink");
    if (chip) { e.preventDefault(); onNavigate && onNavigate(chip.dataset.addr); }
  };

  const list = pick ? candidates() : [];

  return (
    <div className="z2-sheetwrap" ref={wrapRef}>
      <div
        ref={ref}
        className={"z2-sheet " + (className || "")}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        data-placeholder={placeholder || ""}
        onInput={() => { stripHeadings(); emit(); detectAt(); setFmt(null); }}
        onKeyUp={() => { detectAt(); updateSel(); }}
        onKeyDown={onKeyDown}
        onMouseUp={() => { detectAt(); updateSel(); }}
        onScroll={() => setFmt(null)}
        onClick={onClickSheet}
        onBlur={() => { emit(); setFmt(null); }}
      />
      {fmt && (
        <div className={"z2-fmt" + (fmt.below ? " below" : "")} style={{ left: fmt.x, top: fmt.y }}>
          <button className="z2-fmtb" style={{ fontWeight: 800 }} onMouseDown={(e) => { e.preventDefault(); applyFmt("bold"); }} title="Fett (⌘B)">B</button>
          <button className="z2-fmtb" style={{ fontStyle: "italic", fontFamily: "Georgia, serif" }} onMouseDown={(e) => { e.preventDefault(); applyFmt("italic"); }} title="Kursiv (⌘I)">I</button>
          <button className="z2-fmtb" style={{ textDecoration: "underline" }} onMouseDown={(e) => { e.preventDefault(); applyFmt("underline"); }} title="Unterstrichen (⌘U)">U</button>
        </div>
      )}
      {pick && (
        <div className="z2-atmenu" style={{ left: Math.max(6, pick.x), top: pick.y + 8 }}>
          {list.length === 0 && <div className="z2-atempty">kein Zettel gefunden</div>}
          {list.map((id, i) => (
            <button key={id} className={"z2-atrow" + (i === pick.idx ? " on" : "")}
              onMouseDown={(e) => { e.preventDefault(); insertLink(id); }}
              onMouseEnter={() => setPick({ ...pick, idx: i })}>
              <span className="z2-atid">@{id}</span>
              <span className="z2-attxt">{truncate(notes[id].text || "", 46)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Sheet });
