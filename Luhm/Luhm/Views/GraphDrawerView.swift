import SwiftUI
import Combine

private enum EdgeKind: String, CaseIterable {
    case folge = "Reihe"
    case verzweig = "Verzweigung"
    case verweis = "Verweis"
}

private struct GraphNode: Identifiable {
    let id: String
    var position: CGPoint
    var velocity: CGPoint = .zero
    let isFocus: Bool
    let degree: Int
}

private struct GraphEdge: Identifiable {
    let id: String
    let from: String
    let to: String
    let kind: EdgeKind
}

private class ForceSimulation: ObservableObject {
    @Published var nodes: [String: GraphNode] = [:]
    @Published var edges: [GraphEdge] = []

    private var timer: Timer?
    private let centerForce: CGFloat = 0.01
    private let repulsion: CGFloat = 3000
    private let springLength: CGFloat = 80
    private let springStrength: CGFloat = 0.04
    private let damping: CGFloat = 0.85
    private var tick = 0

    func build(focus: String, zettelList: [Zettel], size: CGSize) {
        let dict = Dictionary(uniqueKeysWithValues: zettelList.map { ($0.id, $0) })
        guard let fz = dict[focus] else { return }

        var nodeSet: [String: Int] = [focus: 0]
        var edgeList: [GraphEdge] = []
        var edgeIDs: Set<String> = []

        func addEdge(from: String, to: String, kind: EdgeKind) {
            let eid = "\(from)->\(to):\(kind.rawValue)"
            let eidRev = "\(to)->\(from):\(kind.rawValue)"
            guard !edgeIDs.contains(eid), !edgeIDs.contains(eidRev) else { return }
            edgeIDs.insert(eid)
            edgeList.append(GraphEdge(id: eid, from: from, to: to, kind: kind))
        }

        func collectNeighbors(of z: Zettel, degree: Int) {
            if let v = z.vorgID, dict[v] != nil {
                if nodeSet[v] == nil { nodeSet[v] = degree }
                addEdge(from: v, to: z.id, kind: .folge)
            }
            for fid in z.folgeIDs where dict[fid] != nil {
                if nodeSet[fid] == nil { nodeSet[fid] = degree }
                addEdge(from: z.id, to: fid, kind: .folge)
            }
            for vid in z.verzweigIDs where dict[vid] != nil {
                if nodeSet[vid] == nil { nodeSet[vid] = degree }
                addEdge(from: z.id, to: vid, kind: .verzweig)
            }
            for rid in z.verweisIDs where dict[rid] != nil {
                if nodeSet[rid] == nil { nodeSet[rid] = degree }
                addEdge(from: z.id, to: rid, kind: .verweis)
            }
        }

        collectNeighbors(of: fz, degree: 1)

        let firstDegree = nodeSet.filter { $0.value == 1 }.map(\.key)
        for nid in firstDegree {
            if let nz = dict[nid] {
                collectNeighbors(of: nz, degree: 2)
            }
        }

        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let nonFocusIDs = nodeSet.keys.filter { $0 != focus }.sorted()
        let count = nonFocusIDs.count
        var builtNodes: [String: GraphNode] = [:]

        builtNodes[focus] = GraphNode(id: focus, position: center, isFocus: true, degree: 0)

        for (i, nid) in nonFocusIDs.enumerated() {
            let deg = nodeSet[nid]!
            let angle = (2 * .pi / Double(max(count, 1))) * Double(i)
            let radius: CGFloat = deg == 1 ? 90 : 150
            let pos = CGPoint(
                x: center.x + radius * cos(angle) + CGFloat.random(in: -10...10),
                y: center.y + radius * sin(angle) + CGFloat.random(in: -10...10)
            )
            builtNodes[nid] = GraphNode(id: nid, position: pos, isFocus: false, degree: deg)
        }

        self.nodes = builtNodes
        self.edges = edgeList
        self.tick = 0
        startSimulation(center: center)
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }

    private func startSimulation(center: CGPoint) {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            self?.step(center: center)
        }
    }

    private func step(center: CGPoint) {
        tick += 1
        if tick > 200 { stop(); return }

        var updated = nodes
        let ids = Array(updated.keys)

        for i in 0..<ids.count {
            for j in (i + 1)..<ids.count {
                let a = ids[i], b = ids[j]
                guard var na = updated[a], var nb = updated[b] else { continue }
                var dx = na.position.x - nb.position.x
                var dy = na.position.y - nb.position.y
                let dist = max(sqrt(dx * dx + dy * dy), 1)
                let force = repulsion / (dist * dist)
                dx = (dx / dist) * force
                dy = (dy / dist) * force
                if !na.isFocus { na.velocity.x += dx; na.velocity.y += dy }
                if !nb.isFocus { nb.velocity.x -= dx; nb.velocity.y -= dy }
                updated[a] = na
                updated[b] = nb
            }
        }

        for edge in edges {
            guard var na = updated[edge.from], var nb = updated[edge.to] else { continue }
            let dx = nb.position.x - na.position.x
            let dy = nb.position.y - na.position.y
            let dist = max(sqrt(dx * dx + dy * dy), 1)
            let displacement = dist - springLength
            let fx = (dx / dist) * displacement * springStrength
            let fy = (dy / dist) * displacement * springStrength
            if !na.isFocus { na.velocity.x += fx; na.velocity.y += fy }
            if !nb.isFocus { nb.velocity.x -= fx; nb.velocity.y -= fy }
            updated[edge.from] = na
            updated[edge.to] = nb
        }

        for id in ids {
            guard var n = updated[id], !n.isFocus else { continue }
            n.velocity.x += (center.x - n.position.x) * centerForce
            n.velocity.y += (center.y - n.position.y) * centerForce
            n.velocity.x *= damping
            n.velocity.y *= damping
            let maxV: CGFloat = 8
            n.velocity.x = max(-maxV, min(maxV, n.velocity.x))
            n.velocity.y = max(-maxV, min(maxV, n.velocity.y))
            n.position.x += n.velocity.x
            n.position.y += n.velocity.y
            updated[id] = n
        }

        nodes = updated
    }

    deinit { timer?.invalidate() }
}

private struct EdgeLine: View {
    let from: CGPoint
    let to: CGPoint
    let kind: EdgeKind
    let isSecondDegree: Bool

    var body: some View {
        Canvas { context, _ in
            var path = Path()
            path.move(to: from)
            path.addLine(to: to)

            let opacity: Double = isSecondDegree ? 0.3 : 0.7
            let lineWidth: CGFloat = 1.5

            switch kind {
            case .folge:
                context.stroke(path, with: .color(Color.accentBlue.opacity(opacity)),
                               style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            case .verzweig:
                context.stroke(path, with: .color(Color.inkGhost.opacity(opacity)),
                               style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, dash: [6, 4]))
            case .verweis:
                context.stroke(path, with: .color(Color.accentBlue.opacity(opacity)),
                               style: StrokeStyle(lineWidth: lineWidth, lineCap: .round, dash: [2, 3]))
            }
        }
        .allowsHitTesting(false)
    }
}

private struct NodeView: View {
    let node: GraphNode

    private var radius: CGFloat { node.isFocus ? 10 : 7 }

    private var fillColor: Color {
        if node.isFocus { return Color.accentBlue }
        return node.degree == 1 ? Color.inkMain : Color.inkGhost
    }

    var body: some View {
        VStack(spacing: 2) {
            Circle()
                .fill(fillColor)
                .frame(width: radius * 2, height: radius * 2)
            Text(node.id)
                .font(.system(size: node.isFocus ? 10 : 8,
                              weight: node.isFocus ? .semibold : .regular))
                .foregroundStyle(node.isFocus ? Color.accentBlue : Color.inkSoft)
        }
        .position(node.position)
    }
}

private struct GraphCanvas: View {
    let nodes: [String: GraphNode]
    let edges: [GraphEdge]
    let onTap: (String) -> Void

    var body: some View {
        ZStack {
            ForEach(edges) { edge in
                if let from = nodes[edge.from], let to = nodes[edge.to] {
                    EdgeLine(from: from.position, to: to.position, kind: edge.kind,
                             isSecondDegree: from.degree == 2 || to.degree == 2)
                }
            }
            ForEach(Array(nodes.values)) { node in
                NodeView(node: node)
                    .onTapGesture { onTap(node.id) }
            }
        }
    }
}

private struct GraphLegend: View {
    var body: some View {
        HStack(spacing: 16) {
            legendItem(label: "Reihe", color: Color.accentBlue, dash: [])
            legendItem(label: "Verzweigung", color: Color.inkGhost, dash: [4, 3])
            legendItem(label: "Verweis", color: Color.accentBlue, dash: [2, 2])
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }

    private func legendItem(label: String, color: Color, dash: [CGFloat]) -> some View {
        HStack(spacing: 6) {
            Canvas { context, size in
                var path = Path()
                path.move(to: CGPoint(x: 0, y: size.height / 2))
                path.addLine(to: CGPoint(x: size.width, y: size.height / 2))
                context.stroke(path, with: .color(color),
                               style: StrokeStyle(lineWidth: 1.5, lineCap: .round, dash: dash))
            }
            .frame(width: 20, height: 10)
            Text(label)
                .font(.system(size: 9))
                .foregroundStyle(Color.inkSoft)
        }
    }
}

struct GraphDrawerView: View {
    @Binding var isPresented: Bool
    @Binding var isFullHeight: Bool
    let focus: String
    let zettelList: [Zettel]
    var onNavigate: (String) -> Void

    @StateObject private var simulation = ForceSimulation()

    var body: some View {
        VStack(spacing: 0) {
            HandleBar()
                .gesture(
                    DragGesture()
                        .onEnded { value in
                            if value.translation.height < -40 {
                                withAnimation(.spring(duration: 0.3)) { isFullHeight = true }
                            } else if value.translation.height > 40 {
                                if isFullHeight {
                                    withAnimation(.spring(duration: 0.3)) { isFullHeight = false }
                                } else {
                                    withAnimation(.spring(duration: 0.3)) { isPresented = false }
                                }
                            }
                        }
                )

            HStack {
                Label("Umgebung", systemImage: "circle.hexagongrid")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.inkMain)
                Spacer()
                Button {
                    withAnimation(.spring(duration: 0.3)) { isFullHeight.toggle() }
                } label: {
                    Image(systemName: isFullHeight
                          ? "arrow.down.right.and.arrow.up.left"
                          : "arrow.up.left.and.arrow.down.right")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.inkSoft)
                }
                .buttonStyle(.plain)
                Button {
                    withAnimation(.spring(duration: 0.3)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Color.inkSoft)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .overlay(alignment: .bottom) { Divider().background(Color.lineColor) }

            GeometryReader { geo in
                GraphCanvas(
                    nodes: simulation.nodes,
                    edges: simulation.edges,
                    onTap: { id in onNavigate(id) }
                )
                .clipped()
                .onAppear {
                    simulation.build(focus: focus, zettelList: zettelList, size: geo.size)
                }
                .onChange(of: focus) { _, newFocus in
                    simulation.stop()
                    simulation.build(focus: newFocus, zettelList: zettelList, size: geo.size)
                }
                .onChange(of: geo.size) { _, newSize in
                    simulation.stop()
                    simulation.build(focus: focus, zettelList: zettelList, size: newSize)
                }
            }

            GraphLegend()
                .overlay(alignment: .top) { Divider().background(Color.lineColor) }
        }
        .background(Color.paper)
        .onDisappear { simulation.stop() }
    }
}

struct HandleBar: View {
    var body: some View {
        HStack {
            Spacer()
            RoundedRectangle(cornerRadius: 2)
                .fill(Color.inkGhost.opacity(0.5))
                .frame(width: 32, height: 4)
            Spacer()
        }
        .padding(.vertical, 8)
        .contentShape(Rectangle())
    }
}
