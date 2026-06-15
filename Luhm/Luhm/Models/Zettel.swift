import SwiftData
import Foundation

@Model
final class Zettel: Identifiable {
    @Attribute(.unique) var id: String
    var noteText: String
    var title: String
    var tags: [String]
    var reihe: String
    var vorgID: String?
    var folgeIDs: [String]
    var verzweigIDs: [String]
    var verweisIDs: [String]
    var createdAt: Date
    var modifiedAt: Date

    init(id: String, text: String = "", title: String = "", tags: [String] = [], reihe: String = "", vorgID: String? = nil) {
        self.id = id
        self.noteText = text
        self.title = title
        self.tags = tags
        self.reihe = reihe
        self.vorgID = vorgID
        self.folgeIDs = []
        self.verzweigIDs = []
        self.verweisIDs = []
        self.createdAt = Date()
        self.modifiedAt = Date()
    }
}
