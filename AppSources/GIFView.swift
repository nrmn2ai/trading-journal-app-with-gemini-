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
                let base64 = data.base64EncodedString()
                let html = """
                <html>
                <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
                <style>
                    body, html { margin: 0; padding: 0; height: 100%; width: 100%; background-color: transparent; overflow: hidden; }
                    img { width: 100%; height: 100%; object-fit: contain; }
                </style>
                </head>
                <body>
                <img src="data:image/gif;base64,\(base64)">
                </body>
                </html>
                """
                uiView.loadHTMLString(html, baseURL: nil)
            } catch {
                print("Error loading GIF: \\(error)")
            }
        }
    }
}
