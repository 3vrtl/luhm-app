import SwiftUI

struct HighlightSource: Identifiable {
    let id: String
    let title: String
    let author: String
    let highlights: [Highlight]
}

struct Highlight: Identifiable {
    let id: String
    let text: String
    let location: String
    let linkedZettelIDs: [String]

    var isLinked: Bool { !linkedZettelIDs.isEmpty }
}

private let sampleSources: [HighlightSource] = [
    HighlightSource(
        id: "src-1",
        title: "Wie man kluge Notizen schreibt",
        author: "Sönke Ahrens",
        highlights: [
            Highlight(id: "h-1a", text: "Das Schreiben ist nicht das, was auf das Denken folgt, sondern das Medium, in dem das Denken stattfindet.", location: "S. 34", linkedZettelIDs: ["1/1"]),
            Highlight(id: "h-1b", text: "Jede intellektuelle Leistung beginnt mit einer Notiz. Der Schlüssel liegt nicht in der einzelnen Notiz, sondern in der Verbindung zwischen den Notizen.", location: "S. 78", linkedZettelIDs: []),
            Highlight(id: "h-1c", text: "Ein Zettelkasten zwingt uns, über das nachzudenken, was wir gelesen haben, und es in eigenen Worten aufzuschreiben.", location: "S. 112", linkedZettelIDs: []),
        ]
    ),
    HighlightSource(
        id: "src-2",
        title: "Die Gesellschaft der Gesellschaft",
        author: "Niklas Luhmann",
        highlights: [
            Highlight(id: "h-2a", text: "Kommunikation ist die elementare Einheit sozialer Systeme. Nicht der Mensch kommuniziert, sondern die Kommunikation kommuniziert.", location: "S. 193", linkedZettelIDs: ["12", "12/1"]),
            Highlight(id: "h-2b", text: "Systeme operieren geschlossen, aber sie sind auf ihre Umwelt angewiesen. Diese Paradoxie ist konstitutiv.", location: "S. 451", linkedZettelIDs: []),
        ]
    ),
    HighlightSource(
        id: "src-3",
        title: "Tools of Thought",
        author: "Howard Rheingold",
        highlights: [
            Highlight(id: "h-3a", text: "The key idea is that thinking is not something that happens only inside the skull. Tools shape thought, and thought shapes tools.", location: "Ch. 4", linkedZettelIDs: []),
            Highlight(id: "h-3b", text: "Every new medium of communication transforms not just what we communicate but how we think about communication itself.", location: "Ch. 7", linkedZettelIDs: ["5"]),
        ]
    ),
    HighlightSource(
        id: "src-4",
        title: "Kommunikation mit Zettelkästen",
        author: "Niklas Luhmann",
        highlights: [
            Highlight(id: "h-4a", text: "Ohne zu schreiben, kann man nicht denken; jedenfalls nicht in anspruchsvoller, anschlussfähiger Weise.", location: "S. 7", linkedZettelIDs: []),
            Highlight(id: "h-4b", text: "Der Zettelkasten ist ein Zweitgedächtnis, ein Kommunikationspartner, der eigene Überraschungen produziert.", location: "S. 12", linkedZettelIDs: ["21/1"]),
        ]
    ),
]

private enum DrawerLevel: Equatable {
    case sources
    case highlights(sourceID: String)
    case detail(sourceID: String, highlightID: String)
}

struct HighlightsDrawerView: View {
    @Binding var isPresented: Bool
    @Binding var isFullHeight: Bool
    let currentZettelID: String
    var onAttach: (String) -> Void

    @State private var level: DrawerLevel = .sources

    var body: some View {
        VStack(spacing: 0) {
            HandleBar()
                .gesture(
                    DragGesture()
                        .onEnded { value in
                            if value.translation.height < -40 {
                                withAnimation(.spring(duration: 0.3)) { isFullHeight = true }
                            } else if value.translation.height > 40 {
                                if isFullHeight {
                                    withAnimation(.spring(duration: 0.3)) { isFullHeight = false }
                                } else {
                                    withAnimation(.spring(duration: 0.3)) { isPresented = false }
                                }
                            }
                        }
                )

            HStack(spacing: 6) {
                if level != .sources {
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            switch level {
                            case .detail(let sid, _): level = .highlights(sourceID: sid)
                            case .highlights: level = .sources
                            case .sources: break
                            }
                        }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(Color.inkSoft)
                    }
                    .buttonStyle(.plain)
                }

                Label(headerTitle, systemImage: "quote.opening")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.inkMain)
                    .lineLimit(1)

                Spacer()

                Button {
                    withAnimation(.spring(duration: 0.3)) { isFullHeight.toggle() }
                } label: {
                    Image(systemName: isFullHeight ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.inkSoft)
                }
                .buttonStyle(.plain)

                Button {
                    withAnimation(.spring(duration: 0.3)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.inkSoft)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .overlay(alignment: .bottom) { Divider().background(Color.lineColor) }

            switch level {
            case .sources:
                sourcesGrid
            case .highlights(let sourceID):
                if let source = sampleSources.first(where: { $0.id == sourceID }) {
                    highlightsList(source: source)
                }
            case .detail(let sourceID, let highlightID):
                if let source = sampleSources.first(where: { $0.id == sourceID }),
                   let highlight = source.highlights.first(where: { $0.id == highlightID }) {
                    highlightDetail(source: source, highlight: highlight)
                }
            }
        }
        .background(Color.paper)
    }

    private var headerTitle: String {
        switch level {
        case .sources: "Highlights"
        case .highlights(let sid): sampleSources.first(where: { $0.id == sid })?.title ?? "Highlights"
        case .detail: "Highlight"
        }
    }

    private var sourcesGrid: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150, maximum: 200), spacing: 12)], spacing: 12) {
                ForEach(sampleSources) { source in
                    sourceCard(source)
                }
            }
            .padding(16)
        }
    }

    private func sourceCard(_ source: HighlightSource) -> some View {
        Button {
            withAnimation(.easeInOut(duration: 0.2)) {
                level = .highlights(sourceID: source.id)
            }
        } label: {
            VStack(alignment: .leading, spacing: 8) {
                RoundedRectangle(cornerRadius: 4)
                    .fill(Color.inkGhost.opacity(0.15))
                    .frame(height: 60)
                    .overlay {
                        Image(systemName: "book.closed")
                            .font(.system(size: 22))
                            .foregroundStyle(Color.inkGhost)
                    }

                VStack(alignment: .leading, spacing: 3) {
                    Text(source.title)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(Color.inkMain)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    Text(source.author)
                        .font(.system(size: 11))
                        .foregroundStyle(Color.inkSoft)
                        .lineLimit(1)
                }

                HStack(spacing: 4) {
                    Image(systemName: "highlighter")
                        .font(.system(size: 10))
                        .foregroundStyle(Color.inkGhost)
                    Text("\(source.highlights.count)")
                        .font(.system(size: 11))
                        .foregroundStyle(Color.inkSoft)
                    Spacer()
                    let linked = source.highlights.filter(\.isLinked).count
                    if linked > 0 {
                        Circle().fill(Color.accentBlue).frame(width: 6, height: 6)
                        Text("\(linked)")
                            .font(.system(size: 11))
                            .foregroundStyle(Color.accentBlue)
                    }
                }
            }
            .padding(10)
            .background(RoundedRectangle(cornerRadius: 8).fill(Color.paper2))
            .overlay(RoundedRectangle(cornerRadius: 8).strokeBorder(Color.lineColor, lineWidth: 0.5))
        }
        .buttonStyle(.plain)
    }

    private func highlightsList(source: HighlightSource) -> some View {
        ScrollView {
            LazyVStack(spacing: 1) {
                ForEach(source.highlights) { highlight in
                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            level = .detail(sourceID: source.id, highlightID: highlight.id)
                        }
                    } label: {
                        HStack(alignment: .top, spacing: 10) {
                            Circle()
                                .fill(highlight.isLinked ? Color.accentBlue : Color.inkGhost.opacity(0.4))
                                .frame(width: 7, height: 7)
                                .padding(.top, 5)

                            VStack(alignment: .leading, spacing: 4) {
                                Text(highlight.text)
                                    .font(.system(size: 12))
                                    .foregroundStyle(Color.inkMain)
                                    .lineLimit(3)
                                    .multilineTextAlignment(.leading)
                                Text(highlight.location)
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.inkGhost)
                            }

                            Spacer(minLength: 0)

                            Image(systemName: "chevron.right")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundStyle(Color.inkGhost)
                                .padding(.top, 4)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .background(Color.paper)
                    }
                    .buttonStyle(.plain)

                    Divider().background(Color.lineColor).padding(.leading, 33)
                }
            }
        }
    }

    private func highlightDetail(source: HighlightSource, highlight: Highlight) -> some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text(highlight.text)
                    .font(.system(size: 13))
                    .foregroundStyle(Color.inkMain)
                    .lineSpacing(4)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(RoundedRectangle(cornerRadius: 6).fill(Color.paper2))
                    .overlay(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 1)
                            .fill(Color.accentBlue.opacity(0.5))
                            .frame(width: 3)
                            .padding(.vertical, 4)
                    }

                HStack(spacing: 8) {
                    Image(systemName: "book.closed")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.inkGhost)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(source.title)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(Color.inkSoft)
                        Text(source.author)
                            .font(.system(size: 11))
                            .foregroundStyle(Color.inkGhost)
                    }
                }

                Text(highlight.location)
                    .font(.system(size: 11))
                    .foregroundStyle(Color.inkGhost)

                Button {
                    onAttach(highlight.id)
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "paperclip")
                            .font(.system(size: 12, weight: .medium))
                        Text("An Zettel heften")
                            .font(.system(size: 13, weight: .medium))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Capsule().fill(Color.accentBlue))
                }
                .buttonStyle(.plain)

                if !highlight.linkedZettelIDs.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Verknüpfte Zettel")
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(Color.inkSoft)
                            .textCase(.uppercase)

                        ForEach(highlight.linkedZettelIDs, id: \.self) { zettelID in
                            HStack(spacing: 6) {
                                Image(systemName: "note.text")
                                    .font(.system(size: 11))
                                    .foregroundStyle(Color.accentBlue)
                                Text(zettelID)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundStyle(Color.accentBlue)
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(RoundedRectangle(cornerRadius: 5).fill(Color.accentBlue.opacity(0.08)))
                        }
                    }
                }
            }
            .padding(16)
        }
    }
}
