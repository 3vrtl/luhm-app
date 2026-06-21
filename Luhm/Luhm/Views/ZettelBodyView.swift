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
        textView.isGrammarCheckingEnabled = false
        textView.allowsUndo = true
        textView.isAutomaticQuoteSubstitutionEnabled = false
        textView.isAutomaticDashSubstitutionEnabled = false
        textView.isAutomaticTextReplacementEnabled = false
        textView.isAutomaticSpellingCorrectionEnabled = false
        textView.isAutomaticLinkDetectionEnabled = false
        textView.isAutomaticDataDetectionEnabled = false
        textView.isAutomaticTextCompletionEnabled = false
        textView.smartInsertDeleteEnabled = false

        textView.insertionPointColor = NSColor(Color.accentBlue)
        textView.backgroundColor = .clear
        textView.drawsBackground = false
        textView.usesFontPanel = false
        textView.textContainerInset = NSSize(width: 0, height: 4)

        scrollView.hasVerticalScroller = false
        scrollView.hasHorizontalScroller = false
        scrollView.drawsBackground = false
        scrollView.borderType = .noBorder

        textView.delegate = context.coordinator
        textView.string = text
        context.coordinator.applyStyle(fontFamily: fontFamily, to: textView)
        context.coordinator.lastFontFamily = fontFamily

        return scrollView
    }

    func updateNSView(_ scrollView: NSScrollView, context: Context) {
        let textView = scrollView.documentView as! NSTextView
        if textView.string != text {
            let sel = textView.selectedRanges
            textView.string = text
            textView.selectedRanges = sel
            context.coordinator.applyStyle(fontFamily: fontFamily, to: textView)
        } else if context.coordinator.lastFontFamily != fontFamily {
            context.coordinator.applyStyle(fontFamily: fontFamily, to: textView)
        }
        context.coordinator.lastFontFamily = fontFamily
    }

    class Coordinator: NSObject, NSTextViewDelegate {
        var parent: PlainTextEditor
        var lastFontFamily: FontFamily?
        init(_ parent: PlainTextEditor) { self.parent = parent }

        /// Sets font + colour + a paragraph style with a guaranteed minimum line
        /// height. The minimum line height is what keeps the insertion point from
        /// collapsing to a dot on a freshly created empty line (where the typing
        /// attributes would otherwise carry no usable font metrics).
        func applyStyle(fontFamily: FontFamily, to textView: NSTextView) {
            let font = fontFamily.nsFont
            let lineHeight = font.ascender - font.descender + font.leading

            let para = NSMutableParagraphStyle()
            para.minimumLineHeight = lineHeight
            para.maximumLineHeight = lineHeight

            let attrs: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: NSColor(Color.inkMain),
                .paragraphStyle: para
            ]

            textView.typingAttributes = attrs
            textView.defaultParagraphStyle = para
            textView.font = font
            textView.textColor = NSColor(Color.inkMain)

            if let storage = textView.textStorage, storage.length > 0 {
                storage.addAttributes(attrs, range: NSRange(location: 0, length: storage.length))
            }
        }

        func textDidChange(_ notification: Notification) {
            guard let tv = notification.object as? NSTextView else { return }
            parent.text = tv.string
            parent.onTyping?()
        }
    }
}
#endif
