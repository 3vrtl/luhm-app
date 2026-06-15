/* z2-graph.jsx — „Umgebung": ein globaler Graph des Kastens, als Lade von unten.
   Organisches Kraft-Layout (Obsidian-Stil). Kanten: Reihe (Folge), Verzweigung,
   @-Querverweise, geteilte Beleg-Quelle. Klick auf einen Knoten wechselt sofort
   den Zettel; die Lade bleibt offen (geteiltes Bild). */

const { useState: useG, useRef: useGR, useMemo: useGM, useLayoutEffect: useGL } = React;

function buildGraph(notes, links, belege) {
  const ids = Object.keys(notes);
  const nodes = ids.map((id) => ({ id, title: (notes[id] && notes[id].titel) || "" }));
  const edges = []; const seen = new Set();
  const add = (a, b, kind) => {
    if (a === b || !notes[a] || !notes[b]) return;
    const key = kind + ":" + [a, b].sort().join("|");
    if (seen.has(key)) return; seen.add(key); edges.push({ a, b, kind });
  };
  ids.forEach((id) => {
    const l = links[id] || {};
    (l.folge || []).forEach((c) => add(id, c, "folge"));
    (l.verzweig || []).forEach((c) => add(id, c, "verzweig"));
    (l.verweis || []).forEach((c) => add(id, c, "verweis"));
  });
  const bySource = {};
  Object.keys(belege || {}).forEach((nid) => (belege[nid] || []).forEach((hid) => {
    const src = SEED_HIGHLIGHTS[hid] && SEED_HIGHLIGHTS[hid].src; if (!src) return;
    (bySource[src] = bySource[src] || []).push(nid);
  }));
  Object.values(bySource).forEach((arr) => {
    const u = [...new Set(arr)];
    for (let i = 0; i < u.length; i++) for (let j = i + 1; j < u.length; j++) add(u[i], u[j], "beleg");
  });
  return { nodes, edges };
}

/* Strukturiertes Luhmann-Layout: Reihe (Folge) senkrecht in einer Spalte,
   Verzweigung eine Spalte nach rechts eingerückt. Lesereihenfolge = Tiefensuche. */
function layoutStructured(nodes, links) {
  const ids = nodes.map((n) => n.id);
  const has = new Set(ids);
  const childrenSorted = (id) => ids.filter((k) => (links[k] && links[k].vorg) === id).sort(cmpAddr);
  const roots = ids.filter((id) => { const v = links[id] && links[id].vorg; return !v || !has.has(v); }).sort(cmpAddr);
  const pos = {}; const COL = 118, ROW = 46; let row = 0;
  const visit = (id, depth) => {
    pos[id] = { x: depth * COL, y: row * ROW }; row += 1;
    const kids = childrenSorted(id);
    kids.filter((k) => relTo(id, k, links) === "folge").forEach((k) => visit(k, depth));
    kids.filter((k) => relTo(id, k, links) === "verzweig").forEach((k) => visit(k, depth + 1));
  };
  roots.forEach((r) => { visit(r, 0); row += 1; });
  // unverbundene Restknoten unten anhängen
  ids.forEach((id) => { if (!pos[id]) { pos[id] = { x: 0, y: row * ROW }; row += 1; } });
  return pos;
}

/* Organisch & schwebend wie Obsidian, aber mit Luhmann-Tendenz: echtes,
   kompaktes Kraft-Layout (Abstoßung + Federn + Schwerkraft zur Mitte) plus eine
   sanfte Richtungs-Tendenz — Folge zieht nach unten, Verzweigung nach rechts.
   Deterministisch (kein Neu-Würfeln). */
function layoutOrganic(nodes, edges) {
  const n = nodes.length; const pos = {};
  nodes.forEach((nd, i) => { const a = (i / Math.max(1, n)) * Math.PI * 2; const rr = 64 + (i % 3) * 16; pos[nd.id] = { x: Math.cos(a) * rr, y: Math.sin(a) * rr }; });
  const L = 40, k = 15;
  const bias = (kind) => kind === "folge" ? { x: 0, y: 1 } : kind === "verzweig" ? { x: 1, y: 0.22 } : null;
  for (let it = 0; it < 440; it++) {
    const cool = 1 - it / 440;
    const disp = {}; nodes.forEach((nd) => disp[nd.id] = { x: 0, y: 0 });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const A = nodes[i].id, B = nodes[j].id;
      let dx = pos[A].x - pos[B].x, dy = pos[A].y - pos[B].y; let d = Math.hypot(dx, dy) || 0.01;
      const f = (k * k) / d; const ux = dx / d, uy = dy / d;
      disp[A].x += ux * f; disp[A].y += uy * f; disp[B].x -= ux * f; disp[B].y -= uy * f;
    }
    edges.forEach((e) => {
      const struct = e.kind === "folge" || e.kind === "verzweig";
      let dx = pos[e.b].x - pos[e.a].x, dy = pos[e.b].y - pos[e.a].y; let d = Math.hypot(dx, dy) || 0.01;
      const f = (d - L) * (struct ? 0.12 : 0.03); const ux = dx / d, uy = dy / d;
      disp[e.a].x += ux * f; disp[e.a].y += uy * f; disp[e.b].x -= ux * f; disp[e.b].y -= uy * f;
      const b = bias(e.kind);
      if (b) { const m = 3 * cool; disp[e.b].x += b.x * m; disp[e.b].y += b.y * m; disp[e.a].x -= b.x * m; disp[e.a].y -= b.y * m; }
    });
    nodes.forEach((nd) => { disp[nd.id].x -= pos[nd.id].x * 0.09; disp[nd.id].y -= pos[nd.id].y * 0.09; });
    const t = 22 * cool + 1.5;
    nodes.forEach((nd) => { const dd = disp[nd.id]; const dl = Math.hypot(dd.x, dd.y) || 0.01; pos[nd.id].x += (dd.x / dl) * Math.min(dl, t); pos[nd.id].y += (dd.y / dl) * Math.min(dl, t); });
  }
  return pos;
}

function layout(nodes, edges) {
  const n = nodes.length; const pos = {};
  nodes.forEach((nd, i) => { const a = (i / Math.max(1, n)) * Math.PI * 2; pos[nd.id] = { x: Math.cos(a) * 260, y: Math.sin(a) * 260 }; });
  const k = 130;
  for (let it = 0; it < 340; it++) {
    const disp = {}; nodes.forEach((nd) => disp[nd.id] = { x: 0, y: 0 });
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const A = nodes[i].id, B = nodes[j].id;
      let dx = pos[A].x - pos[B].x, dy = pos[A].y - pos[B].y;
      let d = Math.hypot(dx, dy) || 0.01; const f = (k * k) / d; const ux = dx / d, uy = dy / d;
      disp[A].x += ux * f; disp[A].y += uy * f; disp[B].x -= ux * f; disp[B].y -= uy * f;
    }
    edges.forEach((e) => {
      let dx = pos[e.a].x - pos[e.b].x, dy = pos[e.a].y - pos[e.b].y;
      let d = Math.hypot(dx, dy) || 0.01; const f = (d * d) / k; const ux = dx / d, uy = dy / d;
      disp[e.a].x -= ux * f; disp[e.a].y -= uy * f; disp[e.b].x += ux * f; disp[e.b].y += uy * f;
    });
    const t = 14 * (1 - it / 340) + 1;
    nodes.forEach((nd) => { const dd = disp[nd.id]; const dl = Math.hypot(dd.x, dd.y) || 0.01; pos[nd.id].x += (dd.x / dl) * Math.min(dl, t); pos[nd.id].y += (dd.y / dl) * Math.min(dl, t); });
  }
  return pos;
}

function GraphView({ notes, links, belege, focus, onPick }) {
  const { nodes, edges } = useGM(() => buildGraph(notes, links, belege), [Object.keys(notes).length, JSON.stringify(links).length, JSON.stringify(belege).length]);
  const pos = useGM(() => layoutOrganic(nodes, edges), [nodes.length, edges.length]);
  const wrapRef = useGR(null);
  const [view, setView] = useG({ tx: 0, ty: 0, s: 0.95 });
  const [hover, setHover] = useG(null);
  const pan = useGR(null);

  useGL(() => {
    const el = wrapRef.current; if (!el || !pos[focus]) return;
    setView((v) => ({ ...v, tx: el.clientWidth / 2 - pos[focus].x * v.s, ty: el.clientHeight / 2 - pos[focus].y * v.s }));
  }, [focus, pos]);

  const onWheel = (e) => {
    const r = wrapRef.current.getBoundingClientRect(); const mx = e.clientX - r.left, my = e.clientY - r.top;
    setView((v) => { const ns = Math.min(2.6, Math.max(0.3, v.s * (e.deltaY < 0 ? 1.12 : 0.89))); const wx = (mx - v.tx) / v.s, wy = (my - v.ty) / v.s; return { s: ns, tx: mx - wx * ns, ty: my - wy * ns }; });
  };
  const onDown = (e) => { pan.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty }; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if (!pan.current) return; setView((v) => ({ ...v, tx: pan.current.tx + (e.clientX - pan.current.x), ty: pan.current.ty + (e.clientY - pan.current.y) })); };
  const onUp = () => { pan.current = null; };

  return (
    <div className="z2-graph-body" ref={wrapRef} onWheel={onWheel} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <svg width="100%" height="100%">
        <g transform={`translate(${view.tx} ${view.ty}) scale(${view.s})`}>
          {edges.map((e, i) => (
            <line key={i} className={"gedge " + e.kind} x1={pos[e.a].x} y1={pos[e.a].y} x2={pos[e.b].x} y2={pos[e.b].y} />
          ))}
          {nodes.map((nd) => {
            const p = pos[nd.id]; const cur = nd.id === focus; const hot = hover === nd.id;
            return (
              <g key={nd.id} className={"gnode" + (cur ? " cur" : "")} transform={`translate(${p.x} ${p.y})`}
                onPointerDown={(ev) => ev.stopPropagation()} onClick={() => onPick(nd.id)}
                onMouseEnter={() => setHover(nd.id)} onMouseLeave={() => setHover(null)}>
                <circle r={cur ? 9 : hot ? 7 : 5.5} />
                <text className="glabel" x={cur ? 13 : 10} y={3}>{nd.id}</text>
                {(cur || hot) && nd.title && <text className="gtitle" x={cur ? 13 : 10} y={14}>{truncate(nd.title, 22)}</text>}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="z2-graph-legend">
        <span style={{ color: "var(--accent)" }}><i /> Reihe</span>
        <span style={{ color: "var(--ink-ghost)" }}><i /> Verzweigung</span>
        <span style={{ color: "var(--accent-ink)" }}><i style={{ borderTopStyle: "dashed" }} /> @-Verweis</span>
        <span style={{ color: "oklch(0.66 0.12 35)" }}><i style={{ borderTopStyle: "dotted" }} /> Beleg</span>
      </div>
    </div>
  );
}

/* Die Lade: Griff zum Ziehen (Voll/Halb/Schließen), Titel, der Graph. */
function GraphDrawer({ mode, closing, notes, links, belege, focus, onPick, onMode, onClose }) {
  const hdrag = useGR(null);
  const wheelG = useGR({ acted: false, last: 0 });
  const onHDown = (e) => { if (e.target.closest(".z2-graph-tools")) return; hdrag.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const onHUp = (e) => {
    if (hdrag.current == null) return; const dy = e.clientY - hdrag.current; hdrag.current = null;
    if (dy < -28) onMode("full");
    else if (dy > 28) { if (mode === "full") onMode("half"); else onClose(); }
  };
  // Am oberen Rand (Doppelpfeil): hochscrollen vergrößert, herunterscrollen
  // verkleinert bzw. schließt — genau eine Stufe pro Wischbewegung. Eine
  // durchgehende Trackpad-Geste zählt als eine Stufe (Pause = neue Geste),
  // damit „voll" beim Herunterscrollen zuerst auf „mittel" wechselt.
  const onHWheel = (e) => {
    if (Math.abs(e.deltaY) < 2) return;
    const now = Date.now(); const g = wheelG.current;
    if (now - g.last > 220) g.acted = false; g.last = now;
    if (g.acted) return; g.acted = true;
    if (e.deltaY < 0) { if (mode !== "full") onMode("full"); }
    else { if (mode === "full") onMode("half"); else onClose(); }
  };
  return (
    <div className={"z2-graph " + mode + (closing ? " closing" : "")}>
      <div className="z2-graph-handle" onPointerDown={onHDown} onPointerUp={onHUp} onWheel={onHWheel}>
        <span className="z2-graph-grip" />
        <div className="z2-graph-tools">
          <button className="z2-graph-btn" title={mode === "full" ? "Verkleinern" : "Auf volle Größe"} onClick={() => onMode(mode === "full" ? "half" : "full")}>
            {mode === "full" ? Ic.arrow({ style: { transform: "rotate(90deg)" } }) : Ic.arrow({ style: { transform: "rotate(-90deg)" } })}
          </button>
          <button className="z2-graph-btn" title="Schließen (Esc)" onClick={onClose}>{Ic.close({})}</button>
        </div>
      </div>
      <GraphView notes={notes} links={links} belege={belege} focus={focus} onPick={onPick} />
    </div>
  );
}

Object.assign(window, { GraphDrawer, GraphView, buildGraph });
