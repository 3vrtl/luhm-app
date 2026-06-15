import SwiftUI

/// The writing surface — a plain TextEditor with placeholder and the correct font.
struct ZettelBodyView: View {
    @Binding var text: String
    let font: Font
    let placeholder: String
    var onTyping: (() -> Void)?

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text(placeholder)
                    .font(font)
                    .foregroundStyle(Color.inkGhost)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 8)
                    .allowsHitTesting(false)
            }
            TextEditor(text: $text)
                .font(font)
                .foregroundStyle(Color.inkMain)
                .scrollContentBackground(.hidden)
                .background(Color.clear)
                .onChange(of: text) { _, _ in onTyping?() }
        }
    }
}
