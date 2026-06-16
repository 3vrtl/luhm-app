import SwiftUI
import SwiftData

/// The central card window — the single Zettel on screen.
/// "Leeres Blatt" variant: just the card, nav hint fades when typing.
struct ZettelWindowView: View {
    @Bindable var appState: AppState
    let zettelList: [Zettel]
    @Environment(\.modelContext) private var modelContext

    @State private var graphFullHeight: Bool = false
    @State private var highlightsFullHeight: Bool = false
    @State private var typingTimer: Timer? = nil

    /// Custom cubic-bezier-ish spring for card transitions.
    private static let cardTransitionAnimation = Animation.timingCurve(0.2, 0.7, 0.25, 1.0, duration: 0.34)

    private var currentZettel: Zettel? {
        zettelList.first(where: { $0.id == appState.focus })
    }

    private var nav: ReiheNav {
        reiheNav(focus: appState.focus, zettelList: zettelList)
    }

    private var existingIDs: Set<String> {
        Set(zettelList.map(\.id))
    }

    // MARK: - Body

    var body: some View {
        ZStack {
            cardBackground

            VStack(spacing: 0) {
                cardHeader
                Divider().background(Color.lineColor.opacity(0.6))
                cardBody
                    .id(appState.focus)
                    .transition(cardTransition)
                relationApparat
                Divider().background(Color.lineColor.opacity(0.4))
                NavHintView(nav: nav, show: !appState.isTyping)
            }

            // Drawers (slide up from bottom)
            if appState.showGraph {
                VStack {
                    Spacer()
                    GraphDrawerView(
                        isPresented: $appState.showGraph,
                        isFullHeight: $graphFullHeight,
                        focus: appState.focus,
                        zettelList: zettelList,
                        onNavigate: { id in navigate(to: id) }
                    )
                    .frame(maxHeight: graphFullHeight ? .infinity : 280)
                    .transition(.move(edge: .bottom))
                }
                .ignoresSafeArea(edges: .bottom)
            }

            if appState.showHighlights {
                VStack {
                    Spacer()
                    HighlightsDrawerView(
                        isPresented: $appState.showHighlights,
                        isFullHeight: $highlightsFullHeight
                    )
                    .frame(maxHeight: highlightsFullHeight ? .infinity : 280)
                    .transition(.move(edge: .bottom))
                }
                .ignoresSafeArea(edges: .bottom)
            }

            // Full-screen overlays
            if appState.showCmdK {
                CmdKView(
                    zettelList: zettelList,
                    focus: appState.focus,
                    nav: nav,
                    onNavigate: { id in navigate(to: id) },
                    onCreateFolge: createFolge,
                    onCreateVerzweig: createVerzweig,
                    onCreateRoot: createRoot,
                    onOpenGraph: { withAnimation(.spring(duration: 0.3)) { appState.showCmdK = false; appState.showGraph = true } },
                    onOpenHighlights: { withAnimation(.spring(duration: 0.3)) { appState.showCmdK = false; appState.showHighlights = true } },
                    onOpenSettings: { withAnimation(.spring(duration: 0.3)) { appState.showCmdK = false; appState.showSettings = true } },
                    onClose: { withAnimation { appState.showCmdK = false } }
                )
                .transition(.opacity)
            }

            if appState.showSettings {
                SettingsView(
                    fontFamily: $appState.fontFamily,
                    paperTone: $appState.paperTone,
                    onClose: { withAnimation { appState.showSettings = false } }
                )
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .black.opacity(0.15), radius: 20, y: 8)
        // Global keyboard shortcuts
        .keyboardShortcut("k", modifiers: .command) { withAnimation { appState.showCmdK.toggle() } }
        .keyboardShortcut("g", modifiers: .command) { withAnimation(.spring(duration: 0.3)) { appState.showGraph.toggle() } }
        .keyboardShortcut("i", modifiers: .command) { withAnimation(.spring(duration: 0.3)) { appState.showHighlights.toggle() } }
        .keyboardShortcut("n", modifiers: .command) { createRoot() }
        .keyboardShortcut(",", modifiers: .command) { withAnimation { appState.showSettings.toggle() } }
        .onKeyPress(.escape) {
            if appState.showCmdK { withAnimation { appState.showCmdK = false }; return .handled }
            if appState.showSettings { withAnimation { appState.showSettings = false }; return .handled }
            if appState.showHighlights { withAnimation(.spring(duration: 0.3)) { appState.showHighlights = false }; return .handled }
            if appState.showGraph { withAnimation(.spring(duration: 0.3)) { appState.showGraph = false }; return .handled }
            return .ignored
        }
        .onKeyPress(.upArrow, phases: .down) { press in
            guard press.modifiers.contains(.command) else { return .ignored }
            goUp(); return .handled
        }
        .onKeyPress(.downArrow, phases: .down) { press in
            guard press.modifiers.contains(.command) else { return .ignored }
            goDown(); return .handled
        }
        .onKeyPress(.rightArrow, phases: .down) { press in
            guard press.modifiers.contains(.command) else { return .ignored }
            goBranch(); return .handled
        }
        .onKeyPress(.leftArrow, phases: .down) { press in
            guard press.modifiers.contains(.command) else { return .ignored }
            goLeft(); return .handled
        }
    }

    // MARK: - Card sections

    private var cardBackground: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(paperColor(tone: appState.paperTone))
    }

    private var cardHeader: some View {
        HStack(spacing: 0) {
            // macOS traffic lights
            #if os(macOS)
            TrafficLights()
                .padding(.leading, 14)
                .padding(.trailing, 10)
            #else
            Spacer().frame(width: 16)
            #endif

            // Address badge
            Text(appState.focus)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundStyle(Color.accentBlue)
                .padding(.trailing, 8)

            // Editable title
            TitleField(
                text: Binding(
                    get: { currentZettel?.title ?? "" },
                    set: { currentZettel?.title = $0; currentZettel?.modifiedAt = Date() }
                ),
                placeholder: "ohne Titel"
            )

            Spacer()

            // ⌘K button
            Button {
                withAnimation { appState.showCmdK = true }
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 11))
                    KeyCap(symbol: "⌘K")
                }
                .foregroundStyle(Color.inkGhost)
            }
            .buttonStyle(.plain)
            .padding(.trailing, 14)
        }
        .frame(height: 42)
        .background(Color.paper2.opacity(0.6))
    }

    @ViewBuilder
    private var cardBody: some View {
        if let z = currentZettel {
            ZettelBodyView(
                text: Binding(
                    get: { z.noteText },
                    set: {
                        z.noteText = $0
                        z.modifiedAt = Date()
                        markTyping()
                    }
                ),
                font: appState.fontFamily.bodyFont,
                placeholder: appState.focus == "1/1" ? "" : "…"
            )
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
        } else {
            Text("Zettel nicht gefunden")
                .foregroundStyle(Color.inkGhost)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    // MARK: - Relation apparatus (Beziehungs-Apparat)

    @ViewBuilder
    private var relationApparat: some View {
        if let z = currentZettel {
            let entries = relationEntries(for: z)
            if !entries.isEmpty {
                VStack(spacing: 0) {
                    Divider().background(Color.lineColor.opacity(0.25))
                    HStack(spacing: 0) {
                        ForEach(Array(entries.enumerated()), id: \.offset) { index, entry in
                            if index > 0 {
                                Text(" \u{00B7} ")
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.inkGhost.opacity(0.5))
                            }
                            Text("\(entry.label): ")
                                .font(.system(size: 11))
                                .foregroundStyle(Color.inkGhost)
                            ForEach(Array(entry.ids.enumerated()), id: \.offset) { idIndex, addr in
                                if idIndex > 0 {
                                    Text(", ")
                                        .font(.system(size: 11))
                                        .foregroundStyle(Color.inkGhost.opacity(0.5))
                                }
                                Text(addr)
                                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                                    .foregroundStyle(Color.accentBlue)
                                    .onTapGesture { navigate(to: addr) }
                            }
                        }
                        Spacer()
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 6)
                }
            }
        }
    }

    private struct RelationEntry {
        let label: String
        let ids: [String]
    }

    private func relationEntries(for z: Zettel) -> [RelationEntry] {
        var result: [RelationEntry] = []
        if let vorg = z.vorgID, !vorg.isEmpty {
            result.append(RelationEntry(label: "Vorg\u{00E4}nger", ids: [vorg]))
        }
        if !z.folgeIDs.isEmpty {
            result.append(RelationEntry(label: "Folge", ids: z.folgeIDs))
        }
        if !z.verzweigIDs.isEmpty {
            result.append(RelationEntry(label: "Verzweigung", ids: z.verzweigIDs))
        }
        if !z.verweisIDs.isEmpty {
            result.append(RelationEntry(label: "Verweis", ids: z.verweisIDs))
        }
        return result
    }

    // MARK: - Directional card transition

    /// Builds an asymmetric transition based on the current navDirection.
    /// Insertion = where the new card comes FROM; removal = where the old card goes TO.
    /// Opacity transitions between 0.3 (entering/exiting) and 1.0 (on-screen).
    private var cardTransition: AnyTransition {
        let distance: CGFloat = 22
        let fade = AnyTransition.modifier(
            active:   CardFadeModifier(opacity: 0.3),
            identity: CardFadeModifier(opacity: 1.0)
        )
        switch appState.navDirection {
        case .down:
            return .asymmetric(
                insertion: .offset(x: 0, y: distance).combined(with: fade),
                removal:   .offset(x: 0, y: -distance).combined(with: fade)
            )
        case .up:
            return .asymmetric(
                insertion: .offset(x: 0, y: -distance).combined(with: fade),
                removal:   .offset(x: 0, y: distance).combined(with: fade)
            )
        case .right:
            return .asymmetric(
                insertion: .offset(x: distance, y: 0).combined(with: fade),
                removal:   .offset(x: -distance, y: 0).combined(with: fade)
            )
        case .left:
            return .asymmetric(
                insertion: .offset(x: -distance, y: 0).combined(with: fade),
                removal:   .offset(x: distance, y: 0).combined(with: fade)
            )
        case .none:
            return .opacity
        }
    }

    // MARK: - Navigation

    /// Navigate without a directional animation (used by CmdK, graph, etc.).
    private func navigate(to id: String) {
        withAnimation(.easeInOut(duration: 0.15)) {
            appState.navDirection = .none
            appState.focus = id
            appState.showCmdK = false
        }
    }

    /// Navigate with a directional card slide.
    private func navigateDirectional(to id: String, direction: NavDirection) {
        appState.navDirection = direction
        withAnimation(Self.cardTransitionAnimation) {
            appState.focus = id
        }
        // Reset direction after animation completes so subsequent non-directional
        // navigations (CmdK, graph tap) use a simple opacity fade.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.36) {
            appState.navDirection = .none
        }
    }

    private func goUp() {
        if let id = nav.up ?? nav.left ?? nav.parent { navigateDirectional(to: id, direction: .up) }
    }

    private func goDown() {
        if let id = nav.down { navigateDirectional(to: id, direction: .down) }
        else { createFolge() }
    }

    private func goBranch() {
        if let id = nav.branches.first { navigateDirectional(to: id, direction: .right) }
        else { createVerzweig() }
    }

    private func goLeft() {
        if let id = nav.left ?? nav.parent { navigateDirectional(to: id, direction: .left) }
    }

    // MARK: - Creation

    private func currentIsEmpty() -> Bool {
        (currentZettel?.noteText ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func createFolge() {
        guard !currentIsEmpty() else { nudge(); return }
        let addr = nextFolge(focus: appState.focus, existingIDs: existingIDs)
        let parentID = nav.line.first ?? appState.focus
        let z = Zettel(id: addr, vorgID: parentID)
        z.reihe = currentZettel?.reihe ?? ""
        modelContext.insert(z)
        zettelList.first(where: { $0.id == parentID })?.folgeIDs.append(addr)
        try? modelContext.save()
        navigate(to: addr)
    }

    private func createVerzweig() {
        guard !currentIsEmpty() else { nudge(); return }
        let addr = nextVerzweig(focus: appState.focus, existingIDs: existingIDs)
        let z = Zettel(id: addr, vorgID: appState.focus)
        z.reihe = currentZettel?.reihe ?? ""
        modelContext.insert(z)
        currentZettel?.verzweigIDs.append(addr)
        try? modelContext.save()
        navigate(to: addr)
    }

    private func createRoot() {
        let addr = nextRootID(existingIDs: Array(existingIDs))
        let z = Zettel(id: addr)
        z.reihe = currentZettel?.reihe ?? ""
        modelContext.insert(z)
        try? modelContext.save()
        navigate(to: addr)
    }

    private func nudge() {
        withAnimation(.default) { appState.nudging = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.38) {
            appState.nudging = false
        }
    }

    private func markTyping() {
        appState.isTyping = true
        typingTimer?.invalidate()
        typingTimer = Timer.scheduledTimer(withTimeInterval: 1.5, repeats: false) { _ in
            appState.isTyping = false
        }
    }
}

// MARK: - Traffic lights (macOS)

#if os(macOS)
private struct TrafficLights: View {
    var body: some View {
        HStack(spacing: 6) {
            Circle().fill(Color(red: 1.0, green: 0.37, blue: 0.34)).frame(width: 11, height: 11)
            Circle().fill(Color(red: 0.99, green: 0.74, blue: 0.18)).frame(width: 11, height: 11)
            Circle().fill(Color(red: 0.16, green: 0.78, blue: 0.25)).frame(width: 11, height: 11)
        }
    }
}
#endif

// MARK: - Inline title field

private struct TitleField: View {
    @Binding var text: String
    let placeholder: String

    var body: some View {
        ZStack(alignment: .leading) {
            if text.isEmpty {
                Text(placeholder)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.inkGhost)
                    .allowsHitTesting(false)
            }
            TextField("", text: $text)
                .textFieldStyle(.plain)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.inkMain)
        }
    }
}

// MARK: - Card fade modifier (0.3 → 1.0 opacity for transitions)

private struct CardFadeModifier: ViewModifier {
    let opacity: Double
    func body(content: Content) -> some View {
        content.opacity(opacity)
    }
}

// MARK: - View modifier for keyboard shortcuts

extension View {
    func keyboardShortcut(_ key: KeyEquivalent, modifiers: EventModifiers, action: @escaping () -> Void) -> some View {
        self.background(
            Button("") { action() }
                .keyboardShortcut(key, modifiers: modifiers)
                .opacity(0)
                .allowsHitTesting(false)
        )
    }
}
