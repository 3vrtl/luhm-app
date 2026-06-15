/* ============================================================
   LESEN — Lean-Konzepte für Belege + KI-Vermutung
   Vier Strategien, denselben Zettel ruhiger darzustellen.
   ============================================================ */

const Ic = {
  spark: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 13l4 4L19 7"/></svg>,
  close: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>,
  quote: (p) => <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" {...p}><path d="M7 7h4v4c0 2.2-1.3 3.7-3.5 4.4l-.5-1.3C8.2 13.6 9 12.9 9 11.7H7V7zm7 0h4v4c0 2.2-1.3 3.7-3.5 4.4l-.5-1.3c1.2-.5 2-1.2 2-2.4h-2V7z"/></svg>,
  book: (p) => <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a2 2 0 0 0-2 2V5.5z"/></svg>,
  arc: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 17c0-6 4-10 10-10M11 7h4v4"/></svg>,
};

/* Geteilter Zettel-Kopf: Adresse, Text, Tags — überall gleich */
function ZettelHead({ marker }) {
  return (
    <React.Fragment>
      <div className="rd-meta">
        <span className="addr">1a</span><span className="dot">·</span><span>Schreiben</span>
      </div>
      <p className="rd-body">
        Wer schreibt, denkt zweimal: einmal beim Formulieren, einmal beim Wiederlesen{marker}. Der Zettel hält den ersten Gedanken fest, damit der zweite ihm <span className="ref">widersprechen</span> kann.
      </p>
      <div className="rd-tags">
        <span className="rd-tag">Schreiben</span>
        <span className="rd-tag">Form</span>
        <span className="rd-tag">Reduktion</span>
      </div>
    </React.Fragment>
  );
}

const BELEG = {
  q: "Die eigentliche Arbeit beginnt erst, wenn aus der Literaturnotiz ein eigener Gedanke wird.",
  src: "Ahrens, Das Zettelkasten-Prinzip · S. 44",
};
const KI = { id: "2", text: "Wer zur Form zwingt, zwingt zur Entscheidung." };

/* ============================================================
   A — Stiller Apparat   (Progressive Disclosure)
   Belege & Vermutung schrumpfen zu ruhigen Fußnoten-Zeilen.
   Keine Kästen, keine Badges — der Zettel bleibt die Hauptsache.
   ============================================================ */
function ConceptA() {
  return (
    <div className="rd">
      <p className="cap"><b>Stiller Apparat.</b> Alles Sekundäre wird zur Fußnote: eine Zeile pro Beleg, eine Zeile für Luhms Nähe. Klick klappt auf — im Ruhezustand konkurriert nichts mit dem Zettel.</p>
      <ZettelHead marker={<sup className="fn-sup">1</sup>} />
      <div className="aA-sep" />
      <div className="aA-fn">
        <span className="n">1</span>
        <span><span className="aA-q">„{BELEG.q}"</span> <span className="aA-src">— {BELEG.src}</span></span>
      </div>
      <div className="aA-link">
        <Ic.spark className="spark" />
        <span>Luhm sieht eine Nähe zu <span className="to">{KI.id}</span></span>
        <span className="why">· warum?</span>
        <span className="aA-acts">
          <button className="aA-ic" title="Übernehmen"><Ic.check /></button>
          <button className="aA-ic" title="Verwerfen"><Ic.close /></button>
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   B — Marginalien   (wissenschaftliche Edition)
   Lesespalte bleibt rein. Belege als Fußnoten-Marken im Text,
   ihr Text + Luhms Vermutung wandern in die rechte Marginalie.
   ============================================================ */
function ConceptB() {
  return (
    <div className="rd">
      <p className="cap"><b>Marginalien.</b> Wie in einer kritischen Edition: die Lesespalte bleibt unberührt, Apparat und Vermutung stehen als feine Randnotizen daneben.</p>
      <div className="aB">
        <div className="aB-main">
          <ZettelHead marker={<sup className="fn-sup">1</sup>} />
        </div>
        <div className="aB-marg">
          <div className="mn">
            <span className="n">1 · Beleg</span>
            <span className="mn-q">„{BELEG.q}"</span>
            <span className="mn-src">{BELEG.src}</span>
          </div>
          <div className="mn mn-ki">
            <span className="n"><Ic.spark style={{ width: 11, height: 11, verticalAlign: "-1px" }} /> Luhm · Nähe</span>
            <span className="mn-q" style={{ fontStyle: "normal" }}>{KI.text}</span>
            <span className="mn-to">→ {KI.id}</span>
            <span className="mn-acts">
              <button>Übernehmen</button><span className="mn-mid">·</span><button className="dim">verwerfen</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   C — Apparat-Leiste   (ein geordnetes Register)
   Statt zweier Kästen: eine Leiste mit fester Label-Spalte.
   Beleg und Vermutung als ausgerichtete Zeilen — wie ein Register.
   ============================================================ */
function ConceptC() {
  return (
    <div className="rd">
      <p className="cap"><b>Eine Apparat-Leiste.</b> Beide Blöcke verschmelzen zu einem Register mit fester Label-Spalte. Gleiche Ausrichtung schafft Ruhe — keine geschachtelten Rahmen, keine Badges.</p>
      <ZettelHead />
      <div className="aC">
        <div className="aC-row">
          <span className="aC-lbl">Beleg</span>
          <span className="aC-val">
            <span className="aC-q">„{BELEG.q}"</span>
            <span className="aC-src"><Ic.book style={{ verticalAlign: "-1px", marginRight: 4, color: "var(--ink-ghost)" }} />{BELEG.src}</span>
          </span>
          <span className="aC-n mono">1</span>
        </div>
        <div className="aC-row">
          <span className="aC-lbl">Vermutung</span>
          <span className="aC-val">
            <span className="aC-q" style={{ fontStyle: "normal", color: "var(--ink)" }}>{KI.text}</span>
            <span className="aC-src">Luhm sieht eine Nähe · <span className="aC-why">warum?</span></span>
          </span>
          <span className="aC-acts">
            <span className="aC-to mono">{KI.id}</span>
            <button className="aC-ic" title="Übernehmen"><Ic.check /></button>
            <button className="aC-ic" title="Verwerfen"><Ic.close /></button>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   D — Vermutung später   (Lesen bleibt ungestört)
   Im Lesefluss nur der Zettel + eigene Belege. Luhms Vorschläge
   sammeln sich ruhig in einer Ablage und werden separat gesichtet.
   ============================================================ */
function ConceptD() {
  return (
    <div className="rd">
      <p className="cap"><b>Vermutung später.</b> KI-Vorschläge unterbrechen das Lesen nicht mehr — sie sammeln sich in einer ruhigen Ablage. Nur der Zettel und die eigenen Belege bleiben sichtbar.</p>
      <ZettelHead marker={<sup className="fn-sup">1</sup>} />
      <div className="aA-sep" />
      <div className="aA-fn">
        <span className="n">1</span>
        <span><span className="aA-q">„{BELEG.q}"</span> <span className="aA-src">— {BELEG.src}</span></span>
      </div>
      <div className="aD-bar">
        <button className="aD-write"><span style={{ fontSize: 16, lineHeight: 0 }}>+</span> Weiterschreiben</button>
        <button className="aD-chip"><Ic.spark style={{ width: 13, height: 13 }} /> 1 Vermutung <span className="aD-badge">offen</span></button>
      </div>

      <div className="aD-pop">
        <div className="aD-pop-head"><Ic.spark style={{ width: 13, height: 13 }} /> Luhm vermutet <span className="aD-pop-x">×</span></div>
        <div className="aD-pop-body">
          <span className="aD-pop-q">{KI.text}</span>
          <span className="aD-pop-to mono">→ {KI.id}</span>
        </div>
        <div className="aD-pop-acts">
          <button className="aD-yes"><Ic.check style={{ width: 13, height: 13 }} /> Übernehmen</button>
          <button className="aD-no">Verwerfen</button>
        </div>
      </div>
    </div>
  );
}

window.LesenKonzepte = { ConceptA, ConceptB, ConceptC, ConceptD };
