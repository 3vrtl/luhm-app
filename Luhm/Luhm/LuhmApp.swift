import SwiftUI
import SwiftData

@main
struct LuhmApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(for: Zettel.self)
        }
#if os(macOS)
        .defaultSize(width: 430, height: 640)
        .windowResizability(.contentSize)
#endif
    }
}
