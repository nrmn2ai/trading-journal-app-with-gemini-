import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        ZStack {
            // Background Color
            Color(red: 18/255, green: 18/255, blue: 18/255) // #121212
                .edgesIgnoringSafeArea(.all)

            ScrollView {
                VStack(spacing: 30) {
                    Text("Trading Journal")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(Color(red: 255/255, green: 215/255, blue: 0/255)) // #ffd700
                        .padding(.top, 20)

                    ImageContainer(title: "Bull Market") {
                        Image("Golden Bull Market Emblem")
                            .resizable()
                            .scaledToFit()
                            .cornerRadius(8)
                    }

                    ImageContainer(title: "Market Movement") {
                        GIFView(gifName: "Trading_candles_moving_together_20261006131456")
                            .frame(height: 250)
                            .cornerRadius(8)
                            .clipped()
                    }

                    Text("Powered by Gemini AI")
                        .font(.footnote)
                        .foregroundColor(.gray)
                        .padding(.top, 40)
                        .padding(.bottom, 20)
                }
                .padding(.horizontal, 20)
                .frame(maxWidth: .infinity)
            }
        }
    }
}

struct ImageContainer<Content: View>: View {
    let title: String
    let content: () -> Content

    var body: some View {
        VStack(alignment: .center, spacing: 15) {
            Text(title)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.white)

            content()
        }
        .padding(15)
        .background(Color(red: 30/255, green: 30/255, blue: 30/255)) // #1e1e1e
        .cornerRadius(12)
        .shadow(color: Color.black.opacity(0.3), radius: 6, x: 0, y: 4)
        .frame(maxWidth: 400)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
