import SwiftUI
import Observation

@Observable
final class AppState {
    var focus: String = "1/1"
    var navDirection: NavDirection = .none
    var nudging: Bool = false
    var isTyping: Bool = false

    // Overlay state
    var showCmdK: Bool = false
    var showSettings: Bool = false
    var showGraph: Bool = false
    var showHighlights: Bool = false

    // Settings (persisted in UserDefaults)
    var fontFamily: FontFamily {
        didSet { UserDefaults.standard.set(fontFamily.rawValue, forKey: "luhm.font") }
    }
    var paperTone: Double {
        didSet { UserDefaults.standard.set(paperTone, forKey: "luhm.paper") }
    }

    init() {
        let savedFont = UserDefaults.standard.string(forKey: "luhm.font") ?? "serif"
        fontFamily = FontFamily(rawValue: savedFont) ?? .serif
        paperTone = UserDefaults.standard.double(forKey: "luhm.paper")
    }

    func closeAll() {
        showCmdK = false
        showSettings = false
        showGraph = false
        showHighlights = false
    }
}

enum NavDirection { case none, up, down, left, right }
