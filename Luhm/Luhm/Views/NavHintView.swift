import SwiftUI

/// Bottom hint bar: ⌘↑ · ⌘↓ · ⌘→ · ⌘K — fades when typing, reappears after pause
struct NavHintView: View {
    let nav: ReiheNav
    let show: Bool

    var body: some View {
        HStack(spacing: 14) {
            HintItem(key: "⌘↑", label: nav.up ?? nav.parent ?? "—")
            HintItem(key: "⌘↓", label: nav.down ?? "anlegen")
            HintItem(key: "⌘→", label: "verzweigen")
            HintItem(key: "⌘K", label: "springen")
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 9)
        .frame(maxWidth: .infinity)
        .background(Color.paper2.opacity(0.8))
        .overlay(alignment: .top) {
            Divider().background(Color.lineColor)
        }
        .opacity(show ? 1 : 0)
        .animation(.easeInOut(duration: 0.3), value: show)
    }
}

private struct HintItem: View {
    let key: String
    let label: String

    var body: some View {
        HStack(spacing: 4) {
            KeyCap(symbol: key)
            Text(label)
                .font(.system(size: 11))
                .foregroundStyle(Color.inkGhost)
                .lineLimit(1)
        }
    }
}
