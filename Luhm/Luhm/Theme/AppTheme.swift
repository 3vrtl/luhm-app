import SwiftUI

// Warm paper colors — OKLch design spec converted to sRGB
extension Color {
    // Surfaces
    static let paper        = Color(red: 0.965, green: 0.945, blue: 0.910) // oklch(0.968 0.016 86)
    static let paper2       = Color(red: 0.940, green: 0.920, blue: 0.880) // oklch(0.948 0.018 84)
    static let paperTop     = Color(red: 0.953, green: 0.932, blue: 0.895) // oklch(0.958 0.018 85)

    // Ink
    static let inkMain      = Color(red: 0.15,  green: 0.13,  blue: 0.11)  // oklch(0.31 0.020 60)
    static let inkSoft      = Color(red: 0.27,  green: 0.24,  blue: 0.20)  // oklch(0.46 0.018 62)
    static let inkFaint     = Color(red: 0.42,  green: 0.39,  blue: 0.35)  // oklch(0.60 0.014 64)
    static let inkGhost     = Color(red: 0.58,  green: 0.55,  blue: 0.51)  // oklch(0.74 0.012 70)

    // Accent
    static let accentBlue   = Color(red: 0.20,  green: 0.38,  blue: 0.62)  // oklch(0.50 0.085 252)
    static let accentInk    = Color(red: 0.15,  green: 0.33,  blue: 0.58)  // oklch(0.45 0.090 252)
    static let accentWash   = Color.accentBlue.opacity(0.12)
    static let accentLine   = Color.accentBlue.opacity(0.34)

    // Lines
    static let lineColor    = Color(red: 0.84,  green: 0.82,  blue: 0.79)  // oklch(0.885 0.012 82)
    static let lineSoft     = Color(red: 0.89,  green: 0.87,  blue: 0.85)  // oklch(0.925 0.010 84)
}

// Paper tone lerp (0 = warm, 1 = white)
func paperColor(tone: Double) -> Color {
    Color(
        red:   0.965 + (1.0 - 0.965) * tone,
        green: 0.945 + (1.0 - 0.945) * tone,
        blue:  0.910 + (1.0 - 0.910) * tone
    )
}

func paper2Color(tone: Double) -> Color {
    Color(
        red:   0.940 + (1.0 - 0.940) * tone,
        green: 0.920 + (1.0 - 0.920) * tone,
        blue:  0.880 + (1.0 - 0.880) * tone
    )
}

func lineColor(tone: Double) -> Color {
    Color(
        red:   0.84 + (1.0 - 0.84) * tone,
        green: 0.82 + (1.0 - 0.82) * tone,
        blue:  0.79 + (1.0 - 0.79) * tone
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
