import SwiftUI

/// Regex pattern matching Zettelkasten addresses like @1, @1/1a, @12/3b, etc.
private let addressPattern = /(@[\d]+(?:\/[\d]+[a-z]*)*[a-z]*)/

/// The writing surface — read mode shows styled @-links, edit mode uses TextEditor.
struct ZettelBodyView: View {
    @Binding var text: String
    let font: Font
    let placeholder: String
    var onTyping: (() -> Void)?
    var onNavigateToLink: ((String) -> Void)?

    @State private var isEditing: Bool = false
    @FocusState private var editorFocused: Bool

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty && !isEditing {
                Text(placeholder)
                    .font(font)
                    .foregroundStyle(Color.inkGhost)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 8)
                    .allowsHitTesting(false)
            }

            if isEditing {
                editModeView
            } else {
                readModeView
            }
        }
    }

    // MARK: - Edit mode (existing TextEditor)

    private var editModeView: some View {
        TextEditor(text: $text)
            .font(font)
            .foregroundStyle(Color.inkMain)
            .scrollContentBackground(.hidden)
            .background(Color.clear)
            .focused($editorFocused)
            .onChange(of: text) { _, _ in onTyping?() }
            .onAppear { editorFocused = true }
            .onKeyPress(.escape) {
                exitEditing()
                return .handled
            }
    }

    // MARK: - Read mode (styled Text with tappable @-links)

    private var readModeView: some View {
        ScrollView {
            linkedText
                .frame(maxWidth: .infinity, alignment: .topLeading)
                .padding(.horizontal, 5)
                .padding(.vertical, 8)
                .contentShape(Rectangle())
                .onTapGesture {
                    enterEditing()
                }
        }
    }

    /// Build an AttributedString where @-addresses are styled as tappable links
    /// using a custom `zettel://` URL scheme.
    @ViewBuilder
    private var linkedText: some View {
        if text.isEmpty {
            Text("")
        } else {
            Text(buildAttributedString())
                .font(font)
                .foregroundStyle(Color.inkMain)
                .environment(\.openURL, OpenURLAction { url in
                    if url.scheme == "zettel",
                       let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
                       let address = components.queryItems?.first(where: { $0.name == "addr" })?.value {
                        onNavigateToLink?(address)
                        return .handled
                    }
                    return .systemAction
                })
        }
    }

    private func buildAttributedString() -> AttributedString {
        var result = AttributedString()
        let matches = text.matches(of: addressPattern)
        var lastEnd = text.startIndex

        for match in matches {
            let matchRange = match.range
            // Plain text before match
            if lastEnd < matchRange.lowerBound {
                result.append(AttributedString(String(text[lastEnd..<matchRange.lowerBound])))
            }
            // The @-mention styled as a pill
            let fullMatch = String(match.output.1)
            let address = String(fullMatch.dropFirst()) // remove leading @

            var mention = AttributedString(fullMatch)
            mention.font = .system(size: 13.2, design: .monospaced)
            mention.foregroundColor = .accentBlue
            mention.backgroundColor = Color.accentBlue.opacity(0.12)
            let encoded = address.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? address
            if let url = URL(string: "zettel://link?addr=\(encoded)") {
                mention.link = url
            }
            result.append(mention)

            lastEnd = matchRange.upperBound
        }
        // Remaining plain text
        if lastEnd < text.endIndex {
            result.append(AttributedString(String(text[lastEnd...])))
        }
        return result
    }

    // MARK: - Mode switching

    private func enterEditing() {
        isEditing = true
    }

    private func exitEditing() {
        isEditing = false
        editorFocused = false
    }
}
