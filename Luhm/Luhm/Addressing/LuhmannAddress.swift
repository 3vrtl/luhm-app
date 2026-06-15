import Foundation

// MARK: - ReiheNav

struct ReiheNav {
    var line: [String]      // Full Reihe (head + folge children in order)
    var up: String?         // Previous node in the reihe line
    var down: String?       // Next node in the reihe line
    var moreUp: Bool        // Whether there are nodes before `up`
    var moreDown: Bool      // Whether there are nodes after `down`
    var left: String?       // Parent if current node is a Verzweigung head
    var parent: String?     // The vorgID of the focus node
    var branches: [String]  // verzweigIDs of the focus note
}

// MARK: - Token helpers

/// Split a Luhmann address into alternating number/letter segments.
/// e.g. "1/1a2b" -> ["1", "/", "1", "a", "2", "b"]  (but we want semantic tokens)
/// Actually: split on boundaries between digit-runs and letter-runs.
/// Separators (/) are ignored for ordering but delimit depth levels.
private func tokenize(_ id: String) -> [String] {
    var tokens: [String] = []
    var current = ""
    var isDigit: Bool? = nil

    for ch in id {
        if ch == "/" {
            if !current.isEmpty { tokens.append(current); current = "" }
            isDigit = nil
            continue
        }
        let d = ch.isNumber
        if isDigit == nil {
            isDigit = d
            current.append(ch)
        } else if d == isDigit {
            current.append(ch)
        } else {
            tokens.append(current)
            current = String(ch)
            isDigit = d
        }
    }
    if !current.isEmpty { tokens.append(current) }
    return tokens
}

// MARK: - Address comparison

/// Compare two Luhmann addresses.
/// Numbers compare numerically; letters compare alphabetically.
/// Numbers sort before letters at the same depth position.
func compare(_ a: String, _ b: String) -> ComparisonResult {
    let ta = tokenize(a)
    let tb = tokenize(b)
    let count = max(ta.count, tb.count)
    for i in 0..<count {
        if i >= ta.count { return .orderedAscending }
        if i >= tb.count { return .orderedDescending }
        let sa = ta[i]
        let sb = tb[i]
        let aIsNum = sa.first?.isNumber ?? false
        let bIsNum = sb.first?.isNumber ?? false
        if aIsNum && bIsNum {
            let na = Int(sa) ?? 0
            let nb = Int(sb) ?? 0
            if na != nb { return na < nb ? .orderedAscending : .orderedDescending }
        } else if aIsNum && !bIsNum {
            // numbers before letters
            return .orderedAscending
        } else if !aIsNum && bIsNum {
            return .orderedDescending
        } else {
            let cmp = sa.compare(sb)
            if cmp != .orderedSame { return cmp }
        }
    }
    return .orderedSame
}

// MARK: - Address generation helpers

/// Increment the last segment of a Luhmann address.
/// Numbers: 1->2, 9->10
/// Letters: a->b, z->aa
func incTrail(_ id: String) -> String {
    var segments = id.components(separatedBy: "/")
    var last = segments.removeLast()

    // Split last into numeric prefix + letter suffix (or vice versa)
    // The last token of the last segment is what we increment.
    var tokens: [(String, Bool)] = [] // (value, isDigit)
    var current = ""
    var isDigit: Bool? = nil
    for ch in last {
        let d = ch.isNumber
        if isDigit == nil {
            isDigit = d
            current.append(ch)
        } else if d == isDigit {
            current.append(ch)
        } else {
            if !current.isEmpty { tokens.append((current, isDigit!)) }
            current = String(ch)
            isDigit = d
        }
    }
    if !current.isEmpty { tokens.append((current, isDigit ?? true)) }

    guard !tokens.isEmpty else { return id + "1" }

    // Increment the last token
    var (val, wasDigit) = tokens.removeLast()
    if wasDigit {
        let n = (Int(val) ?? 0) + 1
        val = String(n)
    } else {
        val = incrementLetters(val)
    }
    tokens.append((val, wasDigit))

    last = tokens.map { $0.0 }.joined()
    segments.append(last)
    return segments.joined(separator: "/")
}

/// Increment a letter string: a->b, z->aa, az->ba, zz->aaa
private func incrementLetters(_ s: String) -> String {
    var chars = Array(s)
    var i = chars.count - 1
    while i >= 0 {
        if chars[i] < "z" {
            chars[i] = Character(UnicodeScalar(chars[i].asciiValue! + 1))
            return String(chars)
        } else {
            chars[i] = "a"
            i -= 1
        }
    }
    return "a" + String(chars)
}

/// Go one level deeper in the Luhmann hierarchy.
/// 1   -> 1/1   (append /1)
/// 1/1 -> 1/1a  (append 'a' if last segment is numeric, or '1' if last is alpha)
func deeperChild(_ id: String) -> String {
    let segments = id.components(separatedBy: "/")
    let last = segments.last ?? id
    // Determine the type of the last token of the last segment
    let lastChar = last.last
    if let c = lastChar, c.isNumber {
        // numeric ending -> append letter
        return id + "a"
    } else {
        // letter ending -> go deeper with /1
        return id + "/1"
    }
}

// MARK: - Next ID generators

/// Compute the next folge ID for a given focus node.
/// Folge = sequential child at the same depth level (append /N).
func nextFolge(focus: String, existingIDs: Set<String>) -> String {
    // Folge children share the same parent prefix + /N
    // The focus node is at depth D. Its folge children are at depth D+1 via /N.
    var candidate = focus + "/1"
    while existingIDs.contains(candidate) {
        candidate = incTrail(candidate)
    }
    return candidate
}

/// Compute the next Verzweigung (branch) ID for a given focus node.
/// Verzweig = branch off by appending a letter then deepening.
func nextVerzweig(focus: String, existingIDs: Set<String>) -> String {
    var candidate = deeperChild(focus)
    while existingIDs.contains(candidate) {
        candidate = incTrail(candidate)
    }
    return candidate
}

/// Find the next root-level ID (e.g. after 21 -> 22).
func nextRootID(existingIDs: [String]) -> String {
    // Collect all root-level numeric IDs
    let roots = existingIDs.filter { !$0.contains("/") && $0.first?.isNumber == true }
    let maxNum = roots.compactMap { Int($0) }.max() ?? 0
    return String(maxNum + 1)
}

// MARK: - Reihe navigation

/// Build ReiheNav for the given focus node from the full list of Zettel.
func reiheNav(focus: String, zettelList: [Zettel]) -> ReiheNav {
    let dict = Dictionary(uniqueKeysWithValues: zettelList.map { ($0.id, $0) })
    guard let focusZettel = dict[focus] else {
        return ReiheNav(line: [], up: nil, down: nil, moreUp: false, moreDown: false, left: nil, parent: nil, branches: [])
    }

    // Determine if this node is a Verzweigung head:
    // A node is a Verzweig head if its parent's verzweigIDs contains its ID.
    var verzweigParent: String? = nil
    if let vorgID = focusZettel.vorgID, let parent = dict[vorgID] {
        if parent.verzweigIDs.contains(focus) {
            verzweigParent = vorgID
        }
    }

    // Walk UP through folge links to find the head of this Reihe.
    // A node is a folge child if its parent's folgeIDs contains it (and it's NOT in verzweigIDs).
    func isFolgeChild(_ nodeID: String) -> Bool {
        guard let node = dict[nodeID], let vorgID = node.vorgID, let parent = dict[vorgID] else { return false }
        return parent.folgeIDs.contains(nodeID) && !parent.verzweigIDs.contains(nodeID)
    }

    var head = focus
    while isFolgeChild(head) {
        if let vorgID = dict[head]?.vorgID {
            head = vorgID
        } else {
            break
        }
    }

    // Build the Reihe: head + all folge descendants in order (BFS through folgeIDs, excluding verzweig).
    var line: [String] = []
    var queue: [String] = [head]
    while !queue.isEmpty {
        let current = queue.removeFirst()
        line.append(current)
        if let node = dict[current] {
            // Only follow folge children (not verzweig branches)
            let folgeChildren = node.folgeIDs.filter { !node.verzweigIDs.contains($0) }
            let sorted = folgeChildren.sorted { compare($0, $1) == .orderedAscending }
            queue.append(contentsOf: sorted)
        }
    }

    // Find focus position in line
    let focusIdx = line.firstIndex(of: focus)

    let up: String?
    let down: String?
    let moreUp: Bool
    let moreDown: Bool

    if let idx = focusIdx {
        up = idx > 0 ? line[idx - 1] : nil
        down = idx < line.count - 1 ? line[idx + 1] : nil
        moreUp = idx > 1
        moreDown = idx < line.count - 2
    } else {
        up = nil; down = nil; moreUp = false; moreDown = false
    }

    return ReiheNav(
        line: line,
        up: up,
        down: down,
        moreUp: moreUp,
        moreDown: moreDown,
        left: verzweigParent,
        parent: focusZettel.vorgID,
        branches: focusZettel.verzweigIDs
    )
}
