import Foundation
import Observation

@Observable
final class MarkdownExporter {

    var basePath: URL

    private let fileManager = FileManager.default

    private let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    init(basePath: URL? = nil) {
        if let basePath {
            self.basePath = basePath
        } else {
            #if os(macOS)
            self.basePath = FileManager.default
                .homeDirectoryForCurrentUser
                .appendingPathComponent("Documents/Luhm")
            #else
            self.basePath = FileManager.default
                .urls(for: .documentDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("Luhm")
            #endif
        }
    }

    func ensureDirectories() throws {
        let zettelDir = basePath.appendingPathComponent("Zettel")
        let highlightsDir = basePath.appendingPathComponent("Highlights")

        for dir in [zettelDir, highlightsDir] {
            if !fileManager.fileExists(atPath: dir.path) {
                try fileManager.createDirectory(at: dir, withIntermediateDirectories: true)
            }
        }
    }

    func exportAll(zettelList: [Zettel]) throws {
        try ensureDirectories()
        for zettel in zettelList {
            try exportOne(zettel: zettel)
        }
    }

    func exportOne(zettel: Zettel) throws {
        try ensureDirectories()

        let markdown = buildMarkdown(for: zettel)
        let filename = sanitizedFilename(for: zettel.id)
        let fileURL = basePath
            .appendingPathComponent("Zettel")
            .appendingPathComponent(filename)

        try markdown.write(to: fileURL, atomically: true, encoding: .utf8)
    }

    private func buildMarkdown(for zettel: Zettel) -> String {
        var lines: [String] = []

        lines.append("---")
        lines.append("id: \"\(zettel.id)\"")
        lines.append("title: \"\(escapedYAML(zettel.title))\"")
        lines.append("reihe: \"\(escapedYAML(zettel.reihe))\"")
        lines.append("tags: [\(zettel.tags.joined(separator: ", "))]")

        if let vorgID = zettel.vorgID {
            lines.append("vorgänger: \"\(vorgID)\"")
        }

        lines.append("folgezettel: [\(formatStringArray(zettel.folgeIDs))]")
        lines.append("verzweigungen: [\(formatStringArray(zettel.verzweigIDs))]")
        lines.append("verweise: [\(formatStringArray(zettel.verweisIDs))]")
        lines.append("erstellt: \(dateFormatter.string(from: zettel.createdAt))")
        lines.append("geändert: \(dateFormatter.string(from: zettel.modifiedAt))")
        lines.append("---")
        lines.append("")
        lines.append(zettel.noteText)
        lines.append("")

        return lines.joined(separator: "\n")
    }

    private func sanitizedFilename(for id: String) -> String {
        id.replacingOccurrences(of: "/", with: "-") + ".md"
    }

    private func formatStringArray(_ values: [String]) -> String {
        values.map { "\"\($0)\"" }.joined(separator: ", ")
    }

    private func escapedYAML(_ value: String) -> String {
        value.replacingOccurrences(of: "\\", with: "\\\\")
             .replacingOccurrences(of: "\"", with: "\\\"")
    }
}
