import SwiftUI

struct CmdKView: View {
    let zettelList: [Zettel]
    let focus: String
    let nav: ReiheNav
    var onNavigate: (String) -> Void
    var onCreateFolge: () -> Void
    var onCreateVerzweig: () -> Void
    var onCreateRoot: () -> Void
    var onOpenGraph: () -> Void
    var onOpenHighlights: () -> Void
    var onOpenSettings: () -> Void
    var onClose: () -> Void

    @State private var query: String = ""
    @State private var selectedIndex: Int = 0
    @FocusState private var inputFocused: Bool
    @State private var expandedIDs: Set<String> = []

    private var currentNote: Zettel? { zettelList.first(where: { $0.id == focus }) }
    private var currentEmpty: Bool { (currentNote?.noteText ?? "").trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
    private var existingIDs: Set<String> { Set(zettelList.map(\.id)) }

    // MARK: Commands

    private var commands: [CmdItem] {
        var list: [CmdItem] = []
        if !currentEmpty {
            let folgeAddr = LuhmannAddress.nextFolge(focus: focus, existingIDs: existingIDs)
            let verzweigAddr = LuhmannAddress.nextVerzweig(focus: focus, existingIDs: existingIDs)
            list.append(CmdItem(id: "folge",    group: .neu,   icon: "arrow.down",         label: "Weiterschreiben", desc: "Reihe fortführen",  addr: folgeAddr,    kbd: "⌘↓", action: onCreateFolge))
            list.append(CmdItem(id: "verzweig", group: .neu,   icon: "arrow.turn.down.right", label: "Verzweigen",   desc: "neuer Abzweig",     addr: verzweigAddr, kbd: "⌘→", action: onCreateVerzweig))
        }
        list.append(CmdItem(id: "root",     group: .neu,    icon: "plus",               label: "Neuer Strang",    desc: "eigenständiger Zettel", kbd: "⌘N", action: onCreateRoot))
        list.append(CmdItem(id: "graph",    group: .befehl, icon: "circle.hexagongrid", label: "Umgebung",        desc: "Graph der Nachbarn",    kbd: "⌘G", action: onOpenGraph))
        list.append(CmdItem(id: "inbox",    group: .befehl, icon: "quote.opening",      label: "Highlights",      desc: "aus Readwise",          kbd: "⌘I", action: onOpenHighlights))
        list.append(CmdItem(id: "settings", group: .befehl, icon: "gearshape",          label: "Einstellungen",   desc: "Schrift · Oberfläche",  kbd: "⌘,", action: onOpenSettings))
        return list
    }

    // MARK: Search results

    private var trimmedQuery: String { query.trimmingCharacters(in: .whitespaces) }
    private var isSearching: Bool { !trimmedQuery.isEmpty }

    private var filteredCommands: [CmdItem] {
        guard isSearching else { return commands }
        let q = trimmedQuery.lowercased()
        return commands.filter { $0.label.lowercased().contains(q) || ($0.desc ?? "").lowercased().contains(q) }
    }

    private var noteHits: [Zettel] {
        guard isSearching else { return [] }
        let terms = trimmedQuery.lowercased().split(separator: " ").map(String.init)
        return zettelList.filter { z in
            let hay = (z.id + " " + z.title + " " + z.noteText).lowercased()
            return terms.allSatisfy { hay.contains($0) }
        }
        .sorted { compare($0.id, $1.id) == .orderedAscending }
        .prefix(12)
        .map { $0 }
    }

    // Tree rows (shown when not searching)
    private var treeRows: [TreeRow] {
        guard !isSearching else { return [] }
        let allIDs = zettelList.map(\.id).sorted { compare($0, $1) == .orderedAscending }
        let roots = allIDs.filter { id in
            zettelList.first(where: { $0.id == id })?.vorgID == nil
        }
        var result: [TreeRow] = []
        func walk(_ id: String, depth: Int) {
            let z = zettelList.first(where: { $0.id == id })
            let childIDs = allIDs.filter { kid in
                zettelList.first(where: { $0.id == kid })?.vorgID == id
            }
            let isOpen = expandedIDs.contains(id)
            let title = (z?.title.isEmpty == false ? z!.title : nil) ?? z?.noteText ?? ""
            result.append(TreeRow(id: id, title: title, depth: depth, hasChildren: !childIDs.isEmpty, isOpen: isOpen))
            if isOpen {
                for cid in childIDs { walk(cid, depth: depth + 1) }
            }
        }
        for r in roots { walk(r, depth: 0) }
        return result
    }

    // MARK: Flat list for keyboard navigation

    enum FlatItem {
        case cmd(CmdItem)
        case note(Zettel)
        case tree(TreeRow)
    }

    private var flatItems: [FlatItem] {
        var items: [FlatItem] = filteredCommands.map { .cmd($0) }
        if isSearching {
            items += noteHits.map { .note($0) }
        } else {
            items += treeRows.map { .tree($0) }
        }
        return items
    }

    // MARK: Body

    var body: some View {
        ZStack {
            Color.black.opacity(0.15)
                .ignoresSafeArea()
                .onTapGesture { onClose() }

            VStack(spacing: 0) {
                // Search input
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.inkGhost)
                    TextField("Springen, suchen, anlegen …", text: $query)
                        .textFieldStyle(.plain)
                        .font(.system(size: 14))
                        .foregroundStyle(Color.inkMain)
                        .focused($inputFocused)
                        .onSubmit { activate(flatItems[safe: selectedIndex]) }
                    if !query.isEmpty {
                        Button { query = "" } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(Color.inkGhost)
                        }
                        .buttonStyle(.plain)
                    } else {
                        Text("esc")
                            .font(.system(size: 11, weight: .medium, design: .monospaced))
                            .foregroundStyle(Color.inkGhost)
                            .padding(.horizontal, 5).padding(.vertical, 2)
                            .background(RoundedRectangle(cornerRadius: 3).fill(Color.lineColor.opacity(0.5)))
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(Color.paper)
                .overlay(alignment: .bottom) { Divider().background(Color.lineColor) }

                // List
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            let cmdNeu = filteredCommands.filter { $0.group == .neu }
                            let cmdBef = filteredCommands.filter { $0.group == .befehl }

                            if !cmdNeu.isEmpty {
                                SectionLabel(title: "Neuer Zettel")
                                ForEach(Array(cmdNeu.enumerated()), id: \.element.id) { i, cmd in
                                    let fi = flatItems.firstIndex(where: { if case .cmd(let c) = $0 { return c.id == cmd.id } else { return false } }) ?? 0
                                    CommandRow(item: cmd, isSelected: fi == selectedIndex)
                                        .id("flat-\(fi)")
                                        .onTapGesture { activate(.cmd(cmd)) }
                                        .onHover { if $0 { selectedIndex = fi } }
                                }
                            }
                            if !cmdBef.isEmpty {
                                SectionLabel(title: "Befehle")
                                ForEach(Array(cmdBef.enumerated()), id: \.element.id) { i, cmd in
                                    let fi = flatItems.firstIndex(where: { if case .cmd(let c) = $0 { return c.id == cmd.id } else { return false } }) ?? 0
                                    CommandRow(item: cmd, isSelected: fi == selectedIndex)
                                        .id("flat-\(fi)")
                                        .onTapGesture { activate(.cmd(cmd)) }
                                        .onHover { if $0 { selectedIndex = fi } }
                                }
                            }

                            if isSearching {
                                if !noteHits.isEmpty {
                                    SectionLabel(title: "Zettel")
                                    ForEach(noteHits) { note in
                                        let fi = flatItems.firstIndex(where: { if case .note(let n) = $0 { return n.id == note.id } else { return false } }) ?? 0
                                        NoteRow(note: note, query: trimmedQuery, isSelected: fi == selectedIndex)
                                            .id("flat-\(fi)")
                                            .onTapGesture { activate(.note(note)) }
                                            .onHover { if $0 { selectedIndex = fi } }
                                    }
                                }
                                if noteHits.isEmpty && filteredCommands.isEmpty {
                                    Text("Nichts gefunden")
                                        .font(.system(size: 13))
                                        .foregroundStyle(Color.inkGhost)
                                        .padding()
                                        .frame(maxWidth: .infinity)
                                }
                            } else {
                                if !treeRows.isEmpty {
                                    SectionLabel(title: "Register")
                                    ForEach(Array(treeRows.enumerated()), id: \.element.id) { i, row in
                                        let fi = flatItems.firstIndex(where: { if case .tree(let r) = $0 { return r.id == row.id } else { return false } }) ?? 0
                                        TreeRowView(row: row, isCurrent: row.id == focus, isSelected: fi == selectedIndex) {
                                            if row.hasChildren {
                                                if expandedIDs.contains(row.id) { expandedIDs.remove(row.id) }
                                                else { expandedIDs.insert(row.id) }
                                            }
                                        }
                                        .id("flat-\(fi)")
                                        .onTapGesture { activate(.tree(row)) }
                                        .onHover { if $0 { selectedIndex = fi } }
                                    }
                                }
                            }
                        }
                        .padding(.bottom, 4)
                    }
                    .frame(maxHeight: 320)
                    .onChange(of: selectedIndex) { _, idx in
                        withAnimation { proxy.scrollTo("flat-\(idx)", anchor: .center) }
                    }
                }

                // Footer hints
                if !isSearching {
                    HStack(spacing: 12) {
                        HintPair(key: "↑↓", label: "wählen")
                        HintPair(key: "→", label: "aufklappen")
                        HintPair(key: "←", label: "einklappen")
                        HintPair(key: "↵", label: "springen")
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(Color.paper2)
                    .overlay(alignment: .top) { Divider().background(Color.lineColor) }
                }
            }
            .background(Color.paper)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(color: .black.opacity(0.18), radius: 24, y: 8)
            .frame(maxWidth: 400)
            .padding(.horizontal, 20)
            .padding(.top, 60)
        }
        .onAppear { inputFocused = true; expandedIDs = ancestorsOf(focus) }
        .onKeyPress(.escape) { onClose(); return .handled }
        .onKeyPress(.downArrow) { move(1); return .handled }
        .onKeyPress(.upArrow)   { move(-1); return .handled }
        .onKeyPress(.return)    { activate(flatItems[safe: selectedIndex]); return .handled }
        .onKeyPress(.rightArrow) {
            if case .tree(let r) = flatItems[safe: selectedIndex], r.hasChildren, !r.isOpen {
                expandedIDs.insert(r.id)
            }
            return .handled
        }
        .onKeyPress(.leftArrow) {
            if case .tree(let r) = flatItems[safe: selectedIndex], r.hasChildren, r.isOpen {
                expandedIDs.remove(r.id)
            }
            return .handled
        }
        .onChange(of: query) { _, _ in selectedIndex = 0 }
    }

    private func move(_ delta: Int) {
        let count = flatItems.count
        guard count > 0 else { return }
        selectedIndex = max(0, min(count - 1, selectedIndex + delta))
    }

    private func activate(_ item: FlatItem?) {
        guard let item else { return }
        switch item {
        case .cmd(let c): c.action()
        case .note(let n): onNavigate(n.id)
        case .tree(let r): onNavigate(r.id)
        }
    }

    private func ancestorsOf(_ id: String) -> Set<String> {
        var result = Set<String>()
        var current = id
        while let z = zettelList.first(where: { $0.id == current }), let parent = z.vorgID {
            result.insert(parent)
            current = parent
        }
        return result
    }
}

// MARK: Supporting types

struct CmdItem: Identifiable {
    let id: String
    let group: CmdGroup
    let icon: String
    let label: String
    var desc: String? = nil
    var addr: String? = nil
    var kbd: String? = nil
    let action: () -> Void

    enum CmdGroup { case neu, befehl }
}

struct TreeRow: Identifiable {
    let id: String
    let title: String
    let depth: Int
    let hasChildren: Bool
    let isOpen: Bool
}

// MARK: Row views

private struct CommandRow: View {
    let item: CmdItem
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: item.icon)
                .font(.system(size: 13))
                .foregroundStyle(isSelected ? Color.accentBlue : Color.inkSoft)
                .frame(width: 20)
            Text(item.label)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Color.inkMain)
            if let desc = item.desc {
                Text(desc)
                    .font(.system(size: 12))
                    .foregroundStyle(Color.inkGhost)
            }
            if let addr = item.addr {
                Text(addr)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Color.accentBlue)
                    .padding(.horizontal, 5).padding(.vertical, 2)
                    .background(Capsule().fill(Color.accentBlue.opacity(0.1)))
            }
            Spacer()
            if let kbd = item.kbd {
                KeyCap(symbol: kbd)
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 9)
        .background(isSelected ? Color.accentBlue.opacity(0.08) : Color.clear)
        .contentShape(Rectangle())
    }
}

private struct NoteRow: View {
    let note: Zettel
    let query: String
    let isSelected: Bool

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: "doc.text")
                .font(.system(size: 13))
                .foregroundStyle(isSelected ? Color.accentBlue : Color.inkSoft)
                .frame(width: 20)
            Text(note.id)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundStyle(Color.accentBlue)
                .padding(.horizontal, 4).padding(.vertical, 1)
                .background(Capsule().fill(Color.accentBlue.opacity(0.08)))
            VStack(alignment: .leading, spacing: 2) {
                let label = note.title.isEmpty ? note.noteText : note.title
                Text(label.isEmpty ? "leerer Zettel" : String(label.prefix(60)))
                    .font(.system(size: 13))
                    .foregroundStyle(Color.inkMain)
                    .lineLimit(1)
                if !note.noteText.isEmpty && !note.title.isEmpty {
                    Text(String(note.noteText.prefix(80)))
                        .font(.system(size: 11))
                        .foregroundStyle(Color.inkGhost)
                        .lineLimit(1)
                }
            }
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 8)
        .background(isSelected ? Color.accentBlue.opacity(0.08) : Color.clear)
        .contentShape(Rectangle())
    }
}

private struct TreeRowView: View {
    let row: TreeRow
    let isCurrent: Bool
    let isSelected: Bool
    let onToggle: () -> Void

    var body: some View {
        HStack(spacing: 0) {
            Spacer().frame(width: CGFloat(10 + row.depth * 17))
            Button(action: onToggle) {
                if row.hasChildren {
                    Image(systemName: row.isOpen ? "chevron.down" : "chevron.right")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundStyle(Color.inkGhost)
                        .frame(width: 16)
                } else {
                    Spacer().frame(width: 16)
                }
            }
            .buttonStyle(.plain)
            Text(row.id)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundStyle(Color.accentBlue)
            Text(row.title.isEmpty ? "leerer Zettel" : String(row.title.prefix(50)))
                .font(.system(size: row.depth == 0 ? 13 : 12))
                .foregroundStyle(Color.inkMain)
                .lineLimit(1)
                .padding(.leading, 6)
            Spacer()
            if isCurrent {
                Circle()
                    .fill(Color.accentBlue)
                    .frame(width: 5, height: 5)
                    .padding(.trailing, 6)
            }
            if row.hasChildren && !row.isOpen {
                Text("+")
                    .font(.system(size: 10))
                    .foregroundStyle(Color.inkGhost)
                    .padding(.trailing, 4)
            }
        }
        .padding(.vertical, 7)
        .background(isSelected ? Color.accentBlue.opacity(0.08) : (isCurrent ? Color.accentBlue.opacity(0.04) : Color.clear))
        .contentShape(Rectangle())
    }
}

private struct SectionLabel: View {
    let title: String
    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(Color.inkGhost)
                .textCase(.uppercase)
                .kerning(0.5)
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.top, 10)
        .padding(.bottom, 4)
    }
}

private struct HintPair: View {
    let key: String
    let label: String
    var body: some View {
        HStack(spacing: 4) {
            KeyCap(symbol: key)
            Text(label)
                .font(.system(size: 10))
                .foregroundStyle(Color.inkGhost)
        }
    }
}

// MARK: Safe subscript

extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
