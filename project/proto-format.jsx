/* proto-format.jsx — Auswahl-Formatierpille für die Editor-Textfelder.
   Formatierung wird direkt als Markdown gespeichert: **fett**, *kursiv*,
   <u>unterstrichen</u>. Eine kleine Pille erscheint über markiertem Text;
   ⌘/Strg + B / I / U funktionieren zusätzlich. Außerdem: Inline-Renderer,
   der diese Marker in der Leseansicht als echte Formatierung darstellt. */
const { useState: useFmtState, useRef: useFmtRef, useCallback: useFmtCb } = React;

/* Markdown-Marker einer Textstelle in echte Elemente übersetzen (Leseansicht) */
function fmtInline(str, kb) {
  if (!str || typeof str !== "string") return str;
  const out = []; let last = 0; let i = 0;
  const re = /\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|<u>([\s\S]*?)<\/u>/g; let m;
  while ((m = re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    if (m[1] != null) out.push(<strong key={kb + "b" + i}>{m[1]}</strong>);
    else if (m[2] != null) out.push(<em key={kb + "i" + i}>{m[2]}</em>);
    else out.push(<u key={kb + "u" + i}>{m[3]}</u>);
    last = re.lastIndex; i++;
  }
  if (!out.length) return str;
  if (last < str.length) out.push(str.slice(last));
  return out;
}

/* Marker für kompakte Vorschauen (Auszüge, Tooltips) entfernen */
function cleanMd(text) {
  if (!text) return text;
  return text.replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/\*([^*\n]+)\*/g, "$1").replace(/<\/?u>/g, "");
}

/* Pixel-Position der aktuellen Auswahl in einem Textarea (Spiegel-Technik) */
function selectionRect(ta) {
  const cs = getComputedStyle(ta);
  const div = document.createElement("div");
  const props = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight",
    "letterSpacing", "textTransform", "paddingTop", "paddingRight", "paddingBottom",
    "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth",
    "borderLeftWidth", "boxSizing"];
  props.forEach((p) => { div.style[p] = cs[p]; });
  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";
  div.style.overflowWrap = "break-word";
  div.style.width = cs.width;
  div.style.top = ta.offsetTop + "px";
  div.style.left = ta.offsetLeft + "px";
  const s = ta.selectionStart, e = ta.selectionEnd;
  div.appendChild(document.createTextNode(ta.value.slice(0, s)));
  const span = document.createElement("span");
  span.textContent = ta.value.slice(s, e) || " ";
  div.appendChild(span);
  div.appendChild(document.createTextNode(ta.value.slice(e)));
  ta.parentNode.appendChild(div);
  const top = ta.offsetTop + span.offsetTop - ta.scrollTop;
  const left = ta.offsetLeft + span.offsetLeft + span.offsetWidth / 2;
  ta.parentNode.removeChild(div);
  return { top, left };
}

/* Hook: Auswahl beobachten + Marker setzen/umschalten */
function useFormatPill({ taRef, value, setValue }) {
  const [state, setState] = useFmtState(null); // { start, end, rect }

  const refresh = useFmtCb(() => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (e > s) setState({ start: s, end: e, rect: selectionRect(ta) });
    else setState(null);
  }, [taRef]);

  const clear = useFmtCb(() => setState(null), []);

  const wrap = useFmtCb((a, b) => {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    if (e <= s) return;
    const before = value.slice(0, s), mid = value.slice(s, e), after = value.slice(e);
    let next, ns, ne;
    if (before.endsWith(a) && after.startsWith(b)) {            // außen umschließend → entfernen
      next = before.slice(0, -a.length) + mid + after.slice(b.length);
      ns = s - a.length; ne = e - a.length;
    } else if (mid.startsWith(a) && mid.endsWith(b) && mid.length >= a.length + b.length) { // innen → entfernen
      next = before + mid.slice(a.length, mid.length - b.length) + after;
      ns = s; ne = e - a.length - b.length;
    } else {                                                    // setzen
      next = before + a + mid + b + after;
      ns = s + a.length; ne = e + a.length;
    }
    setValue(next);
    requestAnimationFrame(() => {
      const t = taRef.current; if (!t) return;
      t.focus(); t.setSelectionRange(ns, ne);
      setState({ start: ns, end: ne, rect: selectionRect(t) });
    });
  }, [taRef, value, setValue]);

  const onKeyDown = useFmtCb((e) => {
    if (!(e.metaKey || e.ctrlKey)) return false;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); wrap("**", "**"); return true; }
    if (k === "i") { e.preventDefault(); wrap("*", "*"); return true; }
    if (k === "u") { e.preventDefault(); wrap("<u>", "</u>"); return true; }
    return false;
  }, [wrap]);

  return { state, refresh, clear, wrap, onKeyDown };
}

/* die schwebende Pille */
function FormatPill({ fmt }) {
  if (!fmt.state) return null;
  const { left, top } = fmt.state.rect;
  return (
    <div className="fmtpill" style={{ left, top }} onMouseDown={(e) => e.preventDefault()}>
      <button className="fmtpill-b" onClick={() => fmt.wrap("**", "**")} title="Fett · ⌘B"><span style={{ fontWeight: 800 }}>B</span></button>
      <button className="fmtpill-b" onClick={() => fmt.wrap("*", "*")} title="Kursiv · ⌘I"><span style={{ fontStyle: "italic", fontFamily: "var(--serif)" }}>I</span></button>
      <button className="fmtpill-b" onClick={() => fmt.wrap("<u>", "</u>")} title="Unterstreichen · ⌘U"><span style={{ textDecoration: "underline" }}>U</span></button>
    </div>
  );
}

Object.assign(window, { fmtInline, cleanMd, selectionRect, useFormatPill, FormatPill });
