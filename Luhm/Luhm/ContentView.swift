import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var zettelList: [Zettel]
    @State private var appState = AppState()
    @State private var seeded = false

    var body: some View {
        ZStack {
            // Warm background gradient
            LinearGradient(
                colors: [
                    Color(red: 0.955, green: 0.931, blue: 0.895),
                    Color(red: 0.905, green: 0.882, blue: 0.848)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            ZettelWindowView(appState: appState, zettelList: zettelList)
        }
        .task {
            guard !seeded, zettelList.isEmpty else { return }
            seeded = true
            for s in seedNotes {
                let z = Zettel(id: s.id, text: s.text, title: s.title, tags: s.tags, reihe: s.reihe, vorgID: s.vorgID)
                z.folgeIDs = s.folgeIDs
                z.verzweigIDs = s.verzweigIDs
                z.verweisIDs = s.verweisIDs
                modelContext.insert(z)
            }
            try? modelContext.save()
        }
    }
}
