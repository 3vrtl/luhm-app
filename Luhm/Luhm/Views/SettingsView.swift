import SwiftUI

struct SettingsView: View {
    @Binding var fontFamily: FontFamily
    @Binding var paperTone: Double
    var onClose: () -> Void

    @State private var expandedSections: Set<String> = ["schrift"]

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Image(systemName: "gearshape")
                    .font(.system(size: 14))
                    .foregroundStyle(Color.inkSoft)
                Text("Einstellungen")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color.inkMain)
                Spacer()
                Text("esc")
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(Color.inkGhost)
                    .padding(.horizontal, 6).padding(.vertical, 3)
                    .background(RoundedRectangle(cornerRadius: 4).fill(Color.lineColor.opacity(0.5)))
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.inkSoft)
                }
                .buttonStyle(.plain)
                .padding(.leading, 4)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 14)
            .background(Color.paper2)
            .overlay(alignment: .bottom) { Divider().background(Color.lineColor) }

            ScrollView {
                VStack(spacing: 0) {
                    // MARK: Konto
                    SectionHeader(
                        icon: "person.circle",
                        title: "Account",
                        value: "Bald",
                        isExpanded: expandedSections.contains("konto")
                    ) { toggle("konto") }

                    if expandedSections.contains("konto") {
                        AccountBody()
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    Divider().background(Color.lineColor).padding(.horizontal, 16)

                    // MARK: Design
                    SectionGroupLabel(title: "Design")

                    SectionHeader(
                        icon: "textformat",
                        title: "Schrift",
                        value: fontFamily.displayName,
                        isExpanded: expandedSections.contains("schrift")
                    ) { toggle("schrift") }

                    if expandedSections.contains("schrift") {
                        FontBody(fontFamily: $fontFamily)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    SectionHeader(
                        icon: "circle.lefthalf.filled",
                        title: "Oberfläche",
                        value: paperLabel(paperTone),
                        isExpanded: expandedSections.contains("ober")
                    ) { toggle("ober") }

                    if expandedSections.contains("ober") {
                        SurfaceBody(paperTone: $paperTone)
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    Divider().background(Color.lineColor).padding(.horizontal, 16)

                    // MARK: Daten & Speicher
                    SectionGroupLabel(title: "Daten & Speicher")

                    SectionHeader(
                        icon: "arrow.triangle.2.circlepath",
                        title: "Readwise",
                        value: "Nicht verbunden",
                        isExpanded: expandedSections.contains("readwise")
                    ) { toggle("readwise") }

                    if expandedSections.contains("readwise") {
                        ReadwiseBody()
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    SectionHeader(
                        icon: "folder",
                        title: "Lokaler Speicher",
                        value: "~/Documents/Luhm",
                        isExpanded: expandedSections.contains("speicher")
                    ) { toggle("speicher") }

                    if expandedSections.contains("speicher") {
                        StorageBody()
                            .transition(.opacity.combined(with: .move(edge: .top)))
                    }
                }
                .animation(.easeInOut(duration: 0.2), value: expandedSections)
            }
        }
        .background(Color.paper)
    }

    private func toggle(_ key: String) {
        if expandedSections.contains(key) { expandedSections.remove(key) }
        else { expandedSections.insert(key) }
    }
}

private func paperLabel(_ t: Double) -> String {
    if t < 0.04 { return "warm · 100 %" }
    if t > 0.96 { return "weiß · 100 %" }
    return "\(100 - Int(t * 100)) % warm"
}

// MARK: Section components

private struct SectionGroupLabel: View {
    let title: String
    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(Color.inkGhost)
                .textCase(.uppercase)
                .kerning(0.6)
            Spacer()
        }
        .padding(.horizontal, 18)
        .padding(.top, 16)
        .padding(.bottom, 4)
    }
}

private struct SectionHeader: View {
    let icon: String
    let title: String
    let value: String
    let isExpanded: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(Color.inkSoft)
                    .frame(width: 20)
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.inkMain)
                Spacer()
                Text(value)
                    .font(.system(size: 12))
                    .foregroundStyle(Color.inkGhost)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Color.inkGhost)
                    .rotationEffect(.degrees(isExpanded ? 0 : -90))
                    .animation(.easeInOut(duration: 0.2), value: isExpanded)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }
}

// MARK: Section bodies

private struct AccountBody: View {
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 28))
                .foregroundStyle(Color.inkGhost)
            VStack(alignment: .leading, spacing: 2) {
                Text("Account anlegen")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(Color.inkMain)
                Text("Sync & Backup über mehrere Geräte hinweg.")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.inkSoft)
            }
            Spacer()
            Text("BALD")
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .foregroundStyle(Color.accentBlue)
                .padding(.horizontal, 6).padding(.vertical, 3)
                .background(Capsule().fill(Color.accentBlue.opacity(0.1)))
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 14)
    }
}

private struct FontBody: View {
    @Binding var fontFamily: FontFamily

    var body: some View {
        VStack(spacing: 0) {
            ForEach(FontFamily.allCases, id: \.self) { family in
                Button {
                    fontFamily = family
                } label: {
                    HStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .strokeBorder(fontFamily == family ? Color.accentBlue : Color.lineColor, lineWidth: 1.5)
                                .frame(width: 16, height: 16)
                            if fontFamily == family {
                                Circle()
                                    .fill(Color.accentBlue)
                                    .frame(width: 8, height: 8)
                            }
                        }
                        VStack(alignment: .leading, spacing: 1) {
                            Text(family.displayName)
                                .font(.system(size: 13, weight: fontFamily == family ? .semibold : .regular))
                                .foregroundStyle(Color.inkMain)
                            Text(family.meta)
                                .font(.system(size: 11))
                                .foregroundStyle(Color.inkSoft)
                        }
                        Spacer()
                        Text("Aa")
                            .font(family.bodyFont)
                            .foregroundStyle(Color.inkSoft)
                            .frame(width: 32)
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 10)
                    .background(fontFamily == family ? Color.accentBlue.opacity(0.04) : Color.clear)
                    .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.bottom, 8)
    }
}

private struct SurfaceBody: View {
    @Binding var paperTone: Double

    var body: some View {
        VStack(spacing: 10) {
            HStack {
                Text("Warm").font(.system(size: 11, weight: .semibold)).foregroundStyle(Color.inkSoft)
                Slider(value: $paperTone, in: 0...1)
                    .tint(Color.accentBlue)
                Text("Weiß").font(.system(size: 11, weight: .semibold)).foregroundStyle(Color.inkSoft)
            }
            HStack {
                Text("Tönung des Papiers")
                    .font(.system(size: 11))
                    .foregroundStyle(Color.inkGhost)
                Spacer()
                Text(paperLabel(paperTone))
                    .font(.system(size: 11, weight: .medium, design: .monospaced))
                    .foregroundStyle(Color.inkSoft)
            }
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 14)
    }
}

private struct ReadwiseBody: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 6) {
                Circle().fill(Color.inkGhost.opacity(0.4)).frame(width: 7, height: 7)
                Text("Nicht verbunden")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.inkSoft)
            }
            HStack(spacing: 8) {
                SecureField("Readwise API-Token einfügen", text: .constant(""))
                    .font(.system(size: 12, design: .monospaced))
                    .textFieldStyle(.roundedBorder)
                Button("Verbinden") {}
                    .buttonStyle(.bordered)
                    .controlSize(.small)
                    .tint(Color.accentBlue)
            }
            Text("Token unter **readwise.io/access_token** erzeugen.")
                .font(.system(size: 11))
                .foregroundStyle(Color.inkGhost)
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 14)
    }
}

private struct StorageBody: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 8) {
                Text("~/Documents/Luhm")
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(Color.inkSoft)
                    .padding(.horizontal, 8).padding(.vertical, 5)
                    .background(RoundedRectangle(cornerRadius: 5).fill(Color.paper2))
                    .overlay(RoundedRectangle(cornerRadius: 5).strokeBorder(Color.lineColor, lineWidth: 0.5))
                Spacer()
                Button("Ordner wählen") {}
                    .buttonStyle(.bordered)
                    .controlSize(.small)
            }
            VStack(alignment: .leading, spacing: 2) {
                StorageRow(name: "Luhm/", indent: 0, isDir: true)
                StorageRow(name: "Zettel/", indent: 1, isDir: true, comment: "# Notizen als .md")
                StorageRow(name: "1-1.md · 1-1a.md …", indent: 2, isDir: false)
                StorageRow(name: "Highlights/", indent: 1, isDir: true, comment: "# Readwise als .md")
                StorageRow(name: "Ahrens.md · Luhmann.md …", indent: 2, isDir: false)
            }
            .padding(10)
            .background(RoundedRectangle(cornerRadius: 6).fill(Color.paper2))
            .overlay(RoundedRectangle(cornerRadius: 6).strokeBorder(Color.lineColor, lineWidth: 0.5))
            Text("Alle Notizen werden laufend als Markdown gesichert.")
                .font(.system(size: 11))
                .foregroundStyle(Color.inkGhost)
        }
        .padding(.horizontal, 18)
        .padding(.bottom, 14)
    }
}

private struct StorageRow: View {
    let name: String
    let indent: Int
    let isDir: Bool
    var comment: String? = nil

    var body: some View {
        HStack(spacing: 4) {
            Spacer().frame(width: CGFloat(indent * 14))
            Text(name)
                .font(.system(size: 11, design: .monospaced))
                .foregroundStyle(isDir ? Color.accentBlue : Color.inkSoft)
            if let comment {
                Text(comment)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundStyle(Color.inkGhost)
            }
            Spacer()
        }
    }
}
