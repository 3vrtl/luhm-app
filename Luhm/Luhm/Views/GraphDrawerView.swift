import SwiftUI

/// Graph drawer (⌘G) — slides up from the bottom.
/// Full graph layout is a future implementation; shows a placeholder for now.
struct GraphDrawerView: View {
    @Binding var isPresented: Bool
    @Binding var isFullHeight: Bool
    let focus: String

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle
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

            // Header
            HStack {
                Label("Umgebung", systemImage: "circle.hexagongrid")
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

            // Placeholder content
            VStack(spacing: 12) {
                Image(systemName: "circle.hexagongrid")
                    .font(.system(size: 36))
                    .foregroundStyle(Color.inkGhost)
                Text("Zettel \(focus) und seine Nachbarn")
                    .font(.system(size: 13))
                    .foregroundStyle(Color.inkSoft)
                Text("Graphansicht · bald verfügbar")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.inkGhost)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .background(Color.paper)
    }
}

struct HandleBar: View {
    var body: some View {
        HStack {
            Spacer()
            RoundedRectangle(cornerRadius: 2)
                .fill(Color.inkGhost.opacity(0.5))
                .frame(width: 32, height: 4)
            Spacer()
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
    }
}
