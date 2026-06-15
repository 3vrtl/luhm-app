import SwiftUI

/// A single keyboard cap badge, e.g. ⌘K or ⌘↑
struct KeyCap: View {
    let symbol: String

    var body: some View {
        HStack(spacing: 1) {
            ForEach(Array(symbol.unicodeScalars), id: \.value) { scalar in
                Text(String(scalar))
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .foregroundStyle(Color.inkSoft)
                    .padding(.horizontal, 3)
                    .padding(.vertical, 2)
                    .background(
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Color.lineColor.opacity(0.6))
                            .overlay(
                                RoundedRectangle(cornerRadius: 3)
                                    .strokeBorder(Color.lineColor, lineWidth: 0.5)
                            )
                    )
            }
        }
    }
}

#Preview {
    HStack(spacing: 6) {
        KeyCap(symbol: "⌘K")
        KeyCap(symbol: "⌘↑")
        KeyCap(symbol: "↵")
    }
    .padding()
    .background(Color.paper)
}
