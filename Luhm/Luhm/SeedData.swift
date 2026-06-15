import Foundation

struct SeedNote {
    let id: String
    let text: String
    let title: String
    let tags: [String]
    let reihe: String
    let vorgID: String?
    let folgeIDs: [String]
    let verzweigIDs: [String]
    let verweisIDs: [String]
}

let seedNotes: [SeedNote] = [
    SeedNote(id: "1",    text: "Schreiben ist kein Protokoll des Denkens, sondern sein Werkzeug.", title: "", tags: ["Schreiben"], reihe: "Schreiben", vorgID: nil,   folgeIDs: ["1/1","1/2"], verzweigIDs: [], verweisIDs: []),
    SeedNote(id: "1/1",  text: "Man schreibt nicht auf, was man denkt — man denkt, indem man schreibt. Der Zettel zwingt zur Entscheidung: dieser eine Gedanke, in diese eine Form. Was sich nicht aufschreiben lässt, war vielleicht nie ein Gedanke, sondern nur das Gefühl von einem.", title: "", tags: ["Schreiben","Form","Reduktion"], reihe: "Schreiben", vorgID: "1",   folgeIDs: [], verzweigIDs: ["1/1a"], verweisIDs: ["12","21"]),
    SeedNote(id: "1/1a", text: "Stockt die Hand, stockt der Gedanke. Schreibhemmung ist selten ein Mangel an Worten — meist ein Mangel an einem klaren nächsten Schritt.", title: "", tags: ["Schreiben"], reihe: "Schreiben", vorgID: "1/1", folgeIDs: [], verzweigIDs: [], verweisIDs: ["5"]),
    SeedNote(id: "1/2",  text: "Der Zettel antwortet. Wer ihn nach Wochen wiederfindet, liest einen fremden Gedanken — und kann ihm widersprechen.", title: "", tags: ["Schreiben","Gedächtnis"], reihe: "Schreiben", vorgID: "1",   folgeIDs: [], verzweigIDs: [], verweisIDs: ["21"]),
    SeedNote(id: "5",    text: "Wer zur Form zwingt, zwingt zur Entscheidung.", title: "", tags: ["Form","Reduktion"], reihe: "Form", vorgID: nil,   folgeIDs: ["5/1"], verzweigIDs: [], verweisIDs: ["12","1/1"]),
    SeedNote(id: "5/1",  text: "Reduktion ist kein Verlust. Sie ist eine Entscheidung darüber, was zählt — und das Eingeständnis, dass nicht alles zählen kann.", title: "", tags: ["Reduktion","Form"], reihe: "Form", vorgID: "5",   folgeIDs: [], verzweigIDs: [], verweisIDs: ["1/1"]),
    SeedNote(id: "12",   text: "Jede Verbindung hätte auch anders ausfallen können. Genau das macht sie zur Information.", title: "", tags: ["Kontingenz"], reihe: "Kontingenz", vorgID: nil,   folgeIDs: ["12/1"], verzweigIDs: [], verweisIDs: ["5","1/1"]),
    SeedNote(id: "12/1", text: "Information ist eine Differenz, die einen Unterschied macht. Ein Zettel ohne Verweise unterscheidet nichts.", title: "", tags: ["Kontingenz","Information"], reihe: "Kontingenz", vorgID: "12",  folgeIDs: [], verzweigIDs: [], verweisIDs: ["1/2"]),
    SeedNote(id: "21",   text: "Erinnern heißt neu zusammensetzen, nicht abrufen.", title: "", tags: ["Gedächtnis"], reihe: "Gedächtnis", vorgID: nil,   folgeIDs: ["21/1"], verzweigIDs: [], verweisIDs: []),
    SeedNote(id: "21/1", text: "Das Gedächtnis des Kastens ist verlässlicher als meines — aber dümmer. Es vergisst nichts und versteht nichts. Deshalb braucht es mich.", title: "", tags: ["Gedächtnis"], reihe: "Gedächtnis", vorgID: "21",  folgeIDs: [], verzweigIDs: [], verweisIDs: []),
]
