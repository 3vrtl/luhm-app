import SwiftUI

/// Highlights / Readwise drawer (⌘I) — slides up from the bottom.
/// Readwise API integration is a future implementation; shows placeholder for now.
struct HighlightsDrawerView: View {
    @Binding var isPresented: Bool
    @Binding var isFullHeight: Bool

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

            HStack {
                Label("Highlights", systemImage: "quote.opening")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.inkMain)
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

            VStack(spacing: 12) {
                Image(systemName: "books.vertical")
                    .font(.system(size: 36))
                    .foregroundStyle(Color.inkGhost)
                Text("Readwise-Highlights")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.inkSoft)
                Text("Verbindung unter Einstellungen konfigurieren")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.inkGhost)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding()
        }
        .background(Color.paper)
    }
}
