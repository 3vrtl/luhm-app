/* proto-export.jsx — Markdown-Export (Format-Helfer + Vorschau-Modal + Download) */
const { useState: useMdState } = React;

function mdSlug(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function fileForZettel(id) { return id.replace(/\//g, "-") + ".md"; }
function fileForHighlight(hid, highlights, sources) {
  const h = highlights[hid], s = sources[h.src];
  return (mdSlug(s.author.split(" ").pop()) + "-" + mdSlug(s.title).slice(0, 24) + "-" + mdSlug(h.ort || hid)) + ".md";
}
const yamlList = (arr) => "[" + (arr || []).join(", ") + "]";

/* Markdown eines Zettels: YAML-Frontmatter + Text + Belege */
function mdForZettel(id, { notes, links, belege, highlights, sources }) {
  const n = notes[id], l = links[id] || {};
  const bel = (belege[id] || []).filter((hid) => highlights[hid]).map((hid) => ({ h: highlights[hid], s: sources[highlights[hid].src] }));
  const fm = ["---", "id: " + id];
  if (n.reihe) fm.push("reihe: " + n.reihe);
  fm.push("tags: " + yamlList(n.tags));
  if (l.vorg) fm.push("vorgaenger: " + l.vorg);
  fm.push("folgezettel: " + yamlList(l.folge));
  if (l.verweis && l.verweis.length) fm.push("verweise: " + yamlList(l.verweis));
  if (bel.length) { fm.push("belege:"); bel.forEach(({ h, s }) => fm.push('  - "' + s.author + ", " + s.title + ", " + h.ort + '"')); }
  fm.push("---");
  let body = "\n" + n.text + "\n";
  if (bel.length) {
    body += "\n## Belege\n\n";
    bel.forEach(({ h, s }) => { body += "> „" + h.text + '"\n> — ' + s.author + ", *" + s.title + "*, " + h.ort + "\n\n"; });
  }
  return fm.join("\n") + "\n" + body;
}

/* Markdown eines Highlights (Literaturnotiz) */
function mdForHighlight(hid, { highlights, sources }) {
  const h = highlights[hid], s = sources[h.src];
  const fm = ["---", "quelle: " + s.title, "autor: " + s.author, "typ: " + (SRC_KIND_LABEL[s.kind] || s.kind),
    "jahr: " + s.year, "ort: " + h.ort, "importiert: " + h.imported, "tags: " + yamlList(h.tags), "---"];
  return fm.join("\n") + "\n\n> " + h.text + "\n";
}

/* echten .md-Download auslösen (im Browser-Sandbox; Fallback: Kopieren) */
function downloadText(filename, text) {
  try {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (e) { return false; }
}

/* Vorschau-Modal: zeigt die fertige .md-Datei, mit Download / Kopieren / „In Vault ablegen" */
function MarkdownModal({ view, vaultPath, onSave, onClose }) {
  const [copied, setCopied] = useMdState(false);
  if (!view) return null;
  const copy = () => {
    try { navigator.clipboard.writeText(view.text); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="wkscrim" onClick={onClose}>
      <div className="mdmodal" onClick={(e) => e.stopPropagation()}>
        <header className="wk-head">
          <div><div className="seclabel">Markdown-Datei</div><div className="wk-title serif">{view.title}</div></div>
          <button className="rwgear" onClick={onClose} title="Schließen"><Ic.close /></button>
        </header>
        <div className="mdfile"><Ic.doc /> <span className="mono">{vaultPath}/{view.filename}</span></div>
        <pre className="mdpre">{view.text}</pre>
        <footer className="mdfoot">
          <button className="pill" onClick={copy}>{copied ? <React.Fragment><Ic.check /> Kopiert</React.Fragment> : "Kopieren"}</button>
          <span style={{ flex: 1 }} />
          <button className="pill" onClick={() => downloadText(view.filename, view.text)}><Ic.download /> Herunterladen</button>
          <button className="pill solid" onClick={onSave}><Ic.check /> In Vault ablegen</button>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { mdForZettel, mdForHighlight, fileForZettel, fileForHighlight, downloadText, MarkdownModal });
