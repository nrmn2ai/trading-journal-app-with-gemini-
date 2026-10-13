import SwiftUI
import WebKit

struct GIFView: UIViewRepresentable {
    let gifName: String

    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.isOpaque = false
        webView.backgroundColor = .clear
        webView.scrollView.backgroundColor = .clear
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {
        if let url = Bundle.main.url(forResource: gifName, withExtension: "gif") {
            do {
                let data = try Data(contentsOf: url)
                let base64String = data.base64EncodedString()
                let htmlString = """
                <!DOCTYPE html>
                <html>
                <head>
                <style>
                body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: transparent; }
                img { width: 100%; height: 100%; object-fit: contain; }
                </style>
                </head>
                <body>
                <img src="data:image/gif;base64,\(base64String)" />
                </body>
                </html>
                """
                uiView.loadHTMLString(htmlString, baseURL: nil)
            } catch {
                print("Error loading GIF: \\(error)")
            }
        }
    }
}
