import SwiftUI

/// The writing surface — a plain TextEditor with placeholder and the correct font.
struct ZettelBodyView: View {
    @Binding var text: String
    let fontFamily: FontFamily
    let placeholder: String
    var onTyping: (() -> Void)?

    var body: some View {
        ZStack(alignment: .topLeading) {
            if text.isEmpty {
                Text(placeholder)
                    .font(fontFamily.bodyFont)
                    .foregroundStyle(Color.inkGhost)
                    .padding(.horizontal, 5)
                    .padding(.vertical, 8)
                    .allowsHitTesting(false)
            }
            #if os(macOS)
            PlainTextEditor(text: $text, fontFamily: fontFamily, onTyping: onTyping)
            #else
            TextEditor(text: $text)
                .font(fontFamily.bodyFont)
                .foregroundStyle(Color.inkMain)
                .tint(Color.accentBlue)
                .scrollContentBackground(.hidden)
                .background(Color.clear)
                .onChange(of: text) { _, _ in onTyping?() }
            #endif
        }
    }
}

#if os(macOS)
import AppKit

struct PlainTextEditor: NSViewRepresentable {
    @Binding var text: String
    let fontFamily: FontFamily
    var onTyping: (() -> Void)?

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeNSView(context: Context) -> NSScrollView {
        let scrollView = NSTextView.scrollableTextView()
        let textView = scrollView.documentView as! NSTextView

        textView.isRichText = false
        textView.allowsUndo = true
        textView.isAutomaticQuoteSubstitutionEnabled = false
        textView.isAutomaticDashSubstitutionEnabled = false
        textView.isAutomaticTextReplacementEnabled = false
        textView.isAutomaticSpellingCorrectionEnabled = false
        textView.isAutomaticLinkDetectionEnabled = false

        textView.insertionPointColor = NSColor(Color.accentBlue)
        textView.textColor = NSColor(Color.inkMain)
        textView.backgroundColor = .clear
        textView.drawsBackground = false
        textView.textContainerInset = NSSize(width: 0, height: 4)

        scrollView.hasVerticalScroller = false
        scrollView.hasHorizontalScroller = false
        scrollView.drawsBackground = false
        scrollView.borderType = .noBorder

        textView.font = fontFamily.nsFont
        textView.delegate = context.coordinator
        textView.string = text

        return scrollView
    }

    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        let textView = scrollView.documentView as! NSTextView
        if textView.string != text {
            let sel = textView.selectedRanges
            textView.string = text
            textView.selectedRanges = sel
        }
        textView.font = fontFamily.nsFont
    }

    class Coordinator: NSObject, NSTextViewDelegate {
        var parent: PlainTextEditor
        init(_ parent: PlainTextEditor) { self.parent = parent }

        func textDidChange(_ notification: Notification) {
            guard let tv = notification.object as? NSTextView else { return }
            parent.text = tv.string
            parent.onTyping?()
        }
    }
}
#endif
