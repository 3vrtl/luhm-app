import SwiftUI

struct GraphDrawerView: View {
    @Binding var isPresented: Bool
    @Binding var isFullHeight: Bool
    let focus: String
    let zettelList: [Zettel]
    var onNavigate: (String) -> Void = { _ in }

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
                    Image(systemName: isFullHeight ? "arrow.down.right.and.arrow.up.left" : "arrow.up.left.and.arrow.down.right")
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

            GraphCanvasView(focus: focus, zettelList: zettelList, onNavigate: onNavigate)
        }
        .background(Color.paper)
    }
}

// MARK: - Graph data model

struct GraphNode: Identifiable {
    let id: String
    let label: String
    let isFocus: Bool
    var position: CGPoint
    var velocity: CGPoint = .zero
}

struct GraphEdge: Identifiable {
    var id: String { "\(from)-\(to)-\(kind.rawValue)" }
    let from: String
    let to: String
    let kind: EdgeKind

    enum EdgeKind: String {
        case folge
        case verzweig
        case verweis
    }
}

// MARK: - Canvas

struct GraphCanvasView: View {
    let focus: String
    let zettelList: [Zettel]
    var onNavigate: (String) -> Void

    @State private var nodes: [GraphNode] = []
    @State private var edges: [GraphEdge] = []
    @State private var timer: Timer?
    @State private var settled = false
    @State private var draggedNode: String?
    @State private var canvasSize: CGSize = .zero

    var body: some View {
        GeometryReader { geo in
            let nodeDict = Dictionary(uniqueKeysWithValues: nodes.map { ($0.id, $0) })

            Canvas { context, size in
                for edge in edges {
                    guard let fromNode = nodeDict[edge.from],
                          let toNode = nodeDict[edge.to] else { continue }
                    var path = Path()
                    path.move(to: fromNode.position)
                    path.addLine(to: toNode.position)

                    let style: Color
                    let lineWidth: CGFloat
                    let dash: [CGFloat]
                    switch edge.kind {
                    case .folge:
                        style = .inkSoft
                        lineWidth = 1.2
                        dash = []
                    case .verzweig:
                        style = .inkGhost
                        lineWidth = 1.0
                        dash = []
                    case .verweis:
                        style = .accentBlue.opacity(0.4)
                        lineWidth = 0.8
                        dash = [4, 3]
                    }

                    if dash.isEmpty {
                        context.stroke(path, with: .color(style), lineWidth: lineWidth)
                    } else {
                        context.stroke(path, with: .color(style), style: StrokeStyle(lineWidth: lineWidth, dash: dash))
                    }
                }
            }
            .allowsHitTesting(false)
            .overlay {
                ForEach(nodes) { node in
                    NodeView(node: node)
                        .position(node.position)
                        .onTapGesture {
                            onNavigate(node.id)
                        }
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    draggedNode = node.id
                                    if let idx = nodes.firstIndex(where: { $0.id == node.id }) {
                                        nodes[idx].position = value.location
                                        nodes[idx].velocity = .zero
                                    }
                                    settled = false
                                    startSimulation()
                                }
                                .onEnded { _ in
                                    draggedNode = nil
                                }
                        )
                }
            }
            .onAppear {
                canvasSize = geo.size
                buildGraph(in: geo.size)
                startSimulation()
            }
            .onChange(of: focus) {
                canvasSize = geo.size
                buildGraph(in: geo.size)
                settled = false
                startSimulation()
            }
            .onChange(of: geo.size) {
                canvasSize = geo.size
            }
        }
    }

    private func buildGraph(in size: CGSize) {
        let dict = Dictionary(uniqueKeysWithValues: zettelList.map { ($0.id, $0) })
        guard let focusZettel = dict[focus] else {
            nodes = []
            edges = []
            return
        }

        var neighborIDs = Set<String>()
        var graphEdges: [GraphEdge] = []

        for fid in focusZettel.folgeIDs {
            neighborIDs.insert(fid)
            graphEdges.append(GraphEdge(from: focus, to: fid, kind: .folge))
        }
        for vid in focusZettel.verzweigIDs {
            neighborIDs.insert(vid)
            graphEdges.append(GraphEdge(from: focus, to: vid, kind: .verzweig))
        }
        for rid in focusZettel.verweisIDs {
            if dict[rid] != nil {
                neighborIDs.insert(rid)
                graphEdges.append(GraphEdge(from: focus, to: rid, kind: .verweis))
            }
        }
        if let vorgID = focusZettel.vorgID, dict[vorgID] != nil {
            neighborIDs.insert(vorgID)
            let parent = dict[vorgID]!
            let kind: GraphEdge.EdgeKind = parent.verzweigIDs.contains(focus) ? .verzweig : .folge
            graphEdges.append(GraphEdge(from: vorgID, to: focus, kind: kind))
        }

        // Also add edges between neighbors if they reference each other
        for nid in neighborIDs {
            guard let nz = dict[nid] else { continue }
            for rid in nz.verweisIDs where rid != focus && neighborIDs.contains(rid) {
                let edgeID = "\(nid)-\(rid)-verweis"
                if !graphEdges.contains(where: { $0.id == edgeID }) {
                    graphEdges.append(GraphEdge(from: nid, to: rid, kind: .verweis))
                }
            }
        }

        let center = CGPoint(x: size.width / 2, y: size.height / 2)
        let allIDs = [focus] + Array(neighborIDs)

        var graphNodes: [GraphNode] = []
        for (i, id) in allIDs.enumerated() {
            let angle = Double(i) / Double(allIDs.count) * 2 * .pi - .pi / 2
            let radius: CGFloat = id == focus ? 0 : min(size.width, size.height) * 0.3
            let pos = CGPoint(
                x: center.x + cos(angle) * radius,
                y: center.y + sin(angle) * radius
            )
            let label = id
            graphNodes.append(GraphNode(id: id, label: label, isFocus: id == focus, position: pos))
        }

        nodes = graphNodes
        edges = graphEdges
    }

    private func startSimulation() {
        timer?.invalidate()
        settled = false
        var ticks = 0
        timer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { t in
            if settled || ticks > 300 {
                t.invalidate()
                return
            }
            ticks += 1
            simulationStep()
        }
    }

    private func simulationStep() {
        let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
        let repulsion: CGFloat = 3000
        let attraction: CGFloat = 0.02
        let idealLength: CGFloat = 80
        let centerPull: CGFloat = 0.005
        let damping: CGFloat = 0.85
        let padding: CGFloat = 30

        var forces = [String: CGPoint]()
        for node in nodes { forces[node.id] = .zero }

        // Repulsion between all node pairs
        for i in 0..<nodes.count {
            for j in (i+1)..<nodes.count {
                let dx = nodes[i].position.x - nodes[j].position.x
                let dy = nodes[i].position.y - nodes[j].position.y
                let dist = max(sqrt(dx * dx + dy * dy), 1)
                let force = repulsion / (dist * dist)
                let fx = dx / dist * force
                let fy = dy / dist * force
                forces[nodes[i].id]!.x += fx
                forces[nodes[i].id]!.y += fy
                forces[nodes[j].id]!.x -= fx
                forces[nodes[j].id]!.y -= fy
            }
        }

        // Attraction along edges
        let nodeDict = Dictionary(uniqueKeysWithValues: nodes.map { ($0.id, $0) })
        for edge in edges {
            guard let from = nodeDict[edge.from], let to = nodeDict[edge.to] else { continue }
            let dx = to.position.x - from.position.x
            let dy = to.position.y - from.position.y
            let dist = max(sqrt(dx * dx + dy * dy), 1)
            let force = attraction * (dist - idealLength)
            let fx = dx / dist * force
            let fy = dy / dist * force
            forces[from.id]!.x += fx
            forces[from.id]!.y += fy
            forces[to.id]!.x -= fx
            forces[to.id]!.y -= fy
        }

        // Center gravity
        for node in nodes {
            let dx = center.x - node.position.x
            let dy = center.y - node.position.y
            forces[node.id]!.x += dx * centerPull
            forces[node.id]!.y += dy * centerPull
        }

        var totalMovement: CGFloat = 0
        for i in 0..<nodes.count {
            if nodes[i].id == draggedNode { continue }

            nodes[i].velocity.x = (nodes[i].velocity.x + forces[nodes[i].id]!.x) * damping
            nodes[i].velocity.y = (nodes[i].velocity.y + forces[nodes[i].id]!.y) * damping

            nodes[i].position.x += nodes[i].velocity.x
            nodes[i].position.y += nodes[i].velocity.y

            // Keep within bounds
            nodes[i].position.x = max(padding, min(canvasSize.width - padding, nodes[i].position.x))
            nodes[i].position.y = max(padding, min(canvasSize.height - padding, nodes[i].position.y))

            totalMovement += abs(nodes[i].velocity.x) + abs(nodes[i].velocity.y)
        }

        if totalMovement < 0.5 {
            settled = true
        }
    }
}

// MARK: - Node view

struct NodeView: View {
    let node: GraphNode

    var body: some View {
        VStack(spacing: 2) {
            Circle()
                .fill(node.isFocus ? Color.accentBlue : Color.inkSoft)
                .frame(width: node.isFocus ? 14 : 10, height: node.isFocus ? 14 : 10)
                .overlay {
                    Circle()
                        .stroke(Color.paper, lineWidth: 2)
                }
                .shadow(color: node.isFocus ? Color.accentBlue.opacity(0.3) : .clear, radius: 4)
            Text(node.label)
                .font(.system(size: 10, weight: node.isFocus ? .bold : .medium, design: .monospaced))
                .foregroundStyle(node.isFocus ? Color.accentBlue : Color.inkSoft)
        }
        .contentShape(Rectangle().size(width: 44, height: 44))
    }
}

// MARK: - Handle bar

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
