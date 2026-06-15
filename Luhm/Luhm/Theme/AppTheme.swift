import SwiftUI

// Warm paper colors (approximating oklch values from prototype)
extension Color {
    static let paper        = Color(red: 0.965, green: 0.941, blue: 0.906) // warm cream
    static let paper2       = Color(red: 0.945, green: 0.921, blue: 0.884)
    static let inkMain      = Color(red: 0.12,  green: 0.10,  blue: 0.08)
    static let inkSoft      = Color(red: 0.40,  green: 0.36,  blue: 0.30)
    static let inkGhost     = Color(red: 0.60,  green: 0.56,  blue: 0.50)
    static let accentBlue   = Color(red: 0.22,  green: 0.45,  blue: 0.78)
    static let lineColor    = Color(red: 0.86,  green: 0.83,  blue: 0.78)
}

// Paper tone lerp (0=warm, 1=white)
func paperColor(tone: Double) -> Color {
    Color(
        red:   0.965 + (1.0 - 0.965) * tone,
        green: 0.941 + (1.0 - 0.941) * tone,
        blue:  0.906 + (1.0 - 0.906) * tone
    )
}

enum FontFamily: String, CaseIterable, Codable {
    case grotesk, serif, mono

    var displayName: String {
        switch self { case .grotesk: "Grotesk"; case .serif: "Serif"; case .mono: "Schreibmaschine" }
    }
    var meta: String {
        switch self {
        case .grotesk: "System Sans · klar & modern"
        case .serif:   "Georgia · ruhig & literarisch"
        case .mono:    "Monospaced · fokussiert"
        }
    }
    var bodyFont: Font {
        switch self {
        case .grotesk: .system(size: 16, weight: .regular, design: .default)
        case .serif:   .custom("Georgia", size: 16)
        case .mono:    .system(size: 14, weight: .regular, design: .monospaced)
        }
    }
}
