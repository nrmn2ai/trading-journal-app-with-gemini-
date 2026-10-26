import SwiftUI

struct ContentView: View {
    @State private var trades = JournalTrade.load()
    @State private var isAddingTrade = false
    @AppStorage("journal.dailyNote") private var dailyNote = ""
    @AppStorage("journal.startingBalance") private var startingBalance = 10000.0
    @AppStorage("journal.riskPerTrade") private var riskPerTrade = 100.0

    private var todayTrades: [JournalTrade] {
        trades.filter { Calendar.current.isDateInToday($0.date) }
    }

    private var todayPnL: Double {
        todayTrades.reduce(0) { $0 + $1.pnl }
    }

    private var totalPnL: Double {
        trades.reduce(0) { $0 + $1.pnl }
    }

    var body: some View {
        TabView {
            JournalScreen(
                trades: todayTrades,
                dailyNote: $dailyNote,
                todayPnL: todayPnL,
                balance: startingBalance + totalPnL,
                riskPerTrade: riskPerTrade,
                onAddTrade: { isAddingTrade = true },
                onDeleteTrade: deleteTrade
            )
            .tabItem {
                Label("Journal", systemImage: "book.closed")
            }

            AnalyticsScreen(trades: trades, startingBalance: startingBalance)
                .tabItem {
                    Label("Analytics", systemImage: "chart.bar.xaxis")
                }

            SettingsScreen(
                startingBalance: $startingBalance,
                riskPerTrade: $riskPerTrade
            )
            .tabItem {
                Label("Setup", systemImage: "slider.horizontal.3")
            }
        }
        .accentColor(JournalStyle.gold)
        .preferredColorScheme(.dark)
        .sheet(isPresented: $isAddingTrade) {
            AddTradeSheet(riskPerTrade: riskPerTrade) { trade in
                trades.insert(trade, at: 0)
            }
        }
        .onChange(of: trades) { updatedTrades in
            JournalTrade.save(updatedTrades)
        }
    }

    private func deleteTrade(_ trade: JournalTrade) {
        trades.removeAll { $0.id == trade.id }
    }
}

private struct JournalScreen: View {
    let trades: [JournalTrade]
    @Binding var dailyNote: String
    let todayPnL: Double
    let balance: Double
    let riskPerTrade: Double
    let onAddTrade: () -> Void
    let onDeleteTrade: (JournalTrade) -> Void

    private var winRate: Double {
        guard !trades.isEmpty else { return 0 }
        let wins = trades.filter { $0.resultR > 0 }.count
        return Double(wins) / Double(trades.count) * 100
    }

    var body: some View {
        ZStack {
            JournalStyle.background.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    header

                    HStack(spacing: 12) {
                        MetricCard(
                            title: "Today P&L",
                            value: currency(todayPnL),
                            detail: todayPnL >= 0 ? "Keep following your plan" : "Protect your risk",
                            tint: todayPnL >= 0 ? JournalStyle.green : JournalStyle.red
                        )
                        MetricCard(
                            title: "Account balance",
                            value: currency(balance),
                            detail: "Starting balance plus logged trades",
                            tint: JournalStyle.gold
                        )
                    }

                    HStack(spacing: 10) {
                        SmallMetric(title: "Trades", value: "\(trades.count)")
                        SmallMetric(title: "Win rate", value: "\(Int(winRate))%")
                        SmallMetric(title: "Risk / trade", value: currency(riskPerTrade))
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Label("Daily plan & notes", systemImage: "pencil.and.list.clipboard")
                            .font(.headline)
                            .foregroundColor(.white)
                        TextEditor(text: $dailyNote)
                            .frame(minHeight: 92)
                            .scrollContentBackground(.hidden)
                            .padding(8)
                            .background(JournalStyle.panel)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .overlay(alignment: .topLeading) {
                                if dailyNote.isEmpty {
                                    Text("What is your plan today? Record your focus, emotions, or lessons.")
                                        .font(.subheadline)
                                        .foregroundColor(.gray)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 16)
                                        .allowsHitTesting(false)
                                }
                            }
                    }
                    .padding(16)
                    .background(JournalStyle.card)
                    .clipShape(RoundedRectangle(cornerRadius: 18))

                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text("Today's trades")
                                .font(.title3.bold())
                                .foregroundColor(.white)
                            Text("Log each trade and review your decisions.")
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                        Spacer()
                        Button(action: onAddTrade) {
                            Label("Add", systemImage: "plus")
                                .font(.subheadline.bold())
                                .padding(.horizontal, 14)
                                .padding(.vertical, 10)
                                .background(JournalStyle.gold)
                                .foregroundColor(JournalStyle.background)
                                .clipShape(Capsule())
                        }
                    }

                    if trades.isEmpty {
                        VStack(spacing: 10) {
                            Image(systemName: "chart.xyaxis.line")
                                .font(.system(size: 30))
                                .foregroundColor(JournalStyle.gold)
                            Text("No trades logged today")
                                .font(.headline)
                                .foregroundColor(.white)
                            Text("Tap Add to record your first trade.")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 32)
                        .background(JournalStyle.card)
                        .clipShape(RoundedRectangle(cornerRadius: 18))
                    } else {
                        VStack(spacing: 10) {
                            ForEach(trades) { trade in
                                TradeRow(trade: trade, onDelete: { onDeleteTrade(trade) })
                            }
                        }
                    }

                    Text("Your journal is saved on this device.")
                        .font(.caption)
                        .foregroundColor(.gray)
                        .frame(maxWidth: .infinity)
                        .padding(.top, 4)
                }
                .padding(16)
            }
        }
    }

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 5) {
                Text("TRADING JOURNAL")
                    .font(.caption.bold())
                    .tracking(1.6)
                    .foregroundColor(JournalStyle.gold)
                Text(DateFormatter.localizedString(from: Date(), dateStyle: .full, timeStyle: .none))
                    .font(.title3.bold())
                    .foregroundColor(.white)
            }
            Spacer()
            Button(action: onAddTrade) {
                Image(systemName: "plus")
                    .font(.headline.bold())
                    .foregroundColor(JournalStyle.background)
                    .frame(width: 42, height: 42)
                    .background(JournalStyle.gold)
                    .clipShape(Circle())
            }
            .accessibilityLabel("Add trade")
        }
        .padding(.vertical, 6)
    }
}

private struct AnalyticsScreen: View {
    let trades: [JournalTrade]
    let startingBalance: Double

    private var totalPnL: Double {
        trades.reduce(0) { $0 + $1.pnl }
    }

    private var wins: Int {
        trades.filter { $0.resultR > 0 }.count
    }

    private var winRate: Double {
        guard !trades.isEmpty else { return 0 }
        return Double(wins) / Double(trades.count) * 100
    }

    private var averageR: Double {
        guard !trades.isEmpty else { return 0 }
        return trades.reduce(0) { $0 + $1.resultR } / Double(trades.count)
    }

    private var symbols: [String] {
        Array(Set(trades.map { $0.symbol })).sorted()
    }

    var body: some View {
        ZStack {
            JournalStyle.background.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Performance")
                        .font(.largeTitle.bold())
                        .foregroundColor(.white)
                        .padding(.top, 8)
                    Text("A clear view of your logged trading decisions.")
                        .foregroundColor(.gray)

                    MetricCard(
                        title: "Net P&L",
                        value: currency(totalPnL),
                        detail: "Balance: \(currency(startingBalance + totalPnL))",
                        tint: totalPnL >= 0 ? JournalStyle.green : JournalStyle.red
                    )

                    HStack(spacing: 10) {
                        SmallMetric(title: "Total trades", value: "\(trades.count)")
                        SmallMetric(title: "Win rate", value: "\(Int(winRate))%")
                        SmallMetric(title: "Average R", value: String(format: "%.2fR", averageR))
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("By symbol")
                            .font(.headline)
                            .foregroundColor(.white)
                        if symbols.isEmpty {
                            Text("Your symbol breakdown will appear after you log trades.")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        } else {
                            ForEach(symbols, id: \.self) { symbol in
                                let rows = trades.filter { $0.symbol == symbol }
                                let pnl = rows.reduce(0) { $0 + $1.pnl }
                                HStack {
                                    VStack(alignment: .leading, spacing: 3) {
                                        Text(symbol).font(.subheadline.bold()).foregroundColor(.white)
                                        Text("\(rows.count) trade\(rows.count == 1 ? "" : "s")")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    Spacer()
                                    Text(currency(pnl))
                                        .font(.subheadline.bold())
                                        .foregroundColor(pnl >= 0 ? JournalStyle.green : JournalStyle.red)
                                }
                                .padding(.vertical, 8)
                                if symbol != symbols.last {
                                    Divider().overlay(Color.white.opacity(0.08))
                                }
                            }
                        }
                    }
                    .padding(16)
                    .background(JournalStyle.card)
                    .clipShape(RoundedRectangle(cornerRadius: 18))
                }
                .padding(16)
            }
        }
    }
}

private struct SettingsScreen: View {
    @Binding var startingBalance: Double
    @Binding var riskPerTrade: Double

    var body: some View {
        ZStack {
            JournalStyle.background.ignoresSafeArea()
            Form {
                Section(header: Text("Account").foregroundColor(JournalStyle.gold)) {
                    NumberSettingRow(title: "Starting balance", value: $startingBalance)
                    NumberSettingRow(title: "Risk per trade", value: $riskPerTrade)
                }
                Section {
                    Text("Trade history and daily notes are stored locally on this iPhone.")
                        .font(.footnote)
                        .foregroundColor(.secondary)
                }
            }
            .scrollContentBackground(.hidden)
        }
        .navigationTitle("Journal setup")
    }
}

private struct NumberSettingRow: View {
    let title: String
    @Binding var value: Double

    var body: some View {
        HStack {
            Text(title)
            Spacer()
            TextField(title, text: Binding(
                get: { String(format: "%.2f", value) },
                set: { if let number = Double($0.replacingOccurrences(of: ",", with: ".")) { value = number } }
            ))
            .keyboardType(.decimalPad)
            .multilineTextAlignment(.trailing)
            .frame(width: 120)
        }
    }
}

private struct AddTradeSheet: View {
    let riskPerTrade: Double
    let onSave: (JournalTrade) -> Void

    @Environment(\.presentationMode) private var presentationMode
    @State private var symbol = "EUR/USD"
    @State private var side: TradeSide = .buy
    @State private var resultR = "1.0"
    @State private var notes = ""
    @State private var date = Date()

    private var parsedR: Double? {
        Double(resultR.replacingOccurrences(of: ",", with: "."))
    }

    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Trade")) {
                    TextField("Symbol (e.g. EUR/USD)", text: $symbol)
                        .textInputAutocapitalization(.characters)
                    Picker("Direction", selection: $side) {
                        ForEach(TradeSide.allCases) { option in
                            Text(option.rawValue).tag(option)
                        }
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    TextField("Result in R (e.g. 1.5 or -1)", text: $resultR)
                        .keyboardType(.decimalPad)
                    DatePicker("Date and time", selection: $date, displayedComponents: [.date, .hourAndMinute])
                }

                Section(header: Text("Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 100)
                }

                Section {
                    HStack {
                        Text("Risk per trade")
                        Spacer()
                        Text(currency(riskPerTrade))
                            .foregroundColor(.secondary)
                    }
                    HStack {
                        Text("Estimated P&L")
                        Spacer()
                        Text(currency((parsedR ?? 0) * riskPerTrade))
                            .foregroundColor((parsedR ?? 0) >= 0 ? JournalStyle.green : JournalStyle.red)
                    }
                }
            }
            .navigationTitle("Add trade")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarItems(
                leading: Button("Cancel") { presentationMode.wrappedValue.dismiss() },
                trailing: Button("Save") { saveTrade() }
                    .disabled(symbol.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || parsedR == nil)
            )
        }
        .preferredColorScheme(.dark)
    }

    private func saveTrade() {
        guard let r = parsedR else { return }
        let cleanedSymbol = symbol.trimmingCharacters(in: .whitespacesAndNewlines).uppercased()
        onSave(JournalTrade(
            symbol: cleanedSymbol,
            side: side,
            resultR: r,
            pnl: r * riskPerTrade,
            notes: notes.trimmingCharacters(in: .whitespacesAndNewlines),
            date: date
        ))
        presentationMode.wrappedValue.dismiss()
    }
}

private struct TradeRow: View {
    let trade: JournalTrade
    let onDelete: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: trade.side == .buy ? "arrow.up.right" : "arrow.down.right")
                .font(.headline.bold())
                .foregroundColor(trade.side == .buy ? JournalStyle.green : JournalStyle.red)
                .frame(width: 38, height: 38)
                .background((trade.side == .buy ? JournalStyle.green : JournalStyle.red).opacity(0.13))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                Text(trade.symbol).font(.headline).foregroundColor(.white)
                Text("\(trade.side.rawValue) • \(DateFormatter.localizedString(from: trade.date, dateStyle: .none, timeStyle: .short))")
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "%+.2fR", trade.resultR))
                    .font(.subheadline.bold())
                    .foregroundColor(trade.resultR >= 0 ? JournalStyle.green : JournalStyle.red)
                Text(currency(trade.pnl))
                    .font(.caption)
                    .foregroundColor(trade.pnl >= 0 ? JournalStyle.green : JournalStyle.red)
            }
            Button(action: onDelete) {
                Image(systemName: "trash")
                    .font(.caption)
                    .foregroundColor(.gray)
                    .padding(.leading, 4)
            }
            .accessibilityLabel("Delete trade")
        }
        .padding(14)
        .background(JournalStyle.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

private struct MetricCard: View {
    let title: String
    let value: String
    let detail: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title.uppercased())
                .font(.caption.bold())
                .tracking(0.7)
                .foregroundColor(.gray)
            Text(value)
                .font(.title2.bold())
                .foregroundColor(tint)
                .lineLimit(1)
                .minimumScaleFactor(0.75)
            Text(detail)
                .font(.caption)
                .foregroundColor(.gray)
                .lineLimit(2)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(JournalStyle.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
    }
}

private struct SmallMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
                .lineLimit(1)
            Text(value)
                .font(.subheadline.bold())
                .foregroundColor(.white)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(JournalStyle.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private enum TradeSide: String, CaseIterable, Identifiable, Codable {
    case buy = "BUY"
    case sell = "SELL"

    var id: String { rawValue }
}

private struct JournalTrade: Identifiable, Codable, Equatable {
    var id: UUID
    var symbol: String
    var side: TradeSide
    var resultR: Double
    var pnl: Double
    var notes: String
    var date: Date

    init(id: UUID = UUID(), symbol: String, side: TradeSide, resultR: Double, pnl: Double, notes: String, date: Date) {
        self.id = id
        self.symbol = symbol
        self.side = side
        self.resultR = resultR
        self.pnl = pnl
        self.notes = notes
        self.date = date
    }

    static func load() -> [JournalTrade] {
        guard let data = UserDefaults.standard.data(forKey: "journal.trades"),
              let saved = try? JSONDecoder().decode([JournalTrade].self, from: data) else {
            return []
        }
        return saved
    }

    static func save(_ trades: [JournalTrade]) {
        guard let data = try? JSONEncoder().encode(trades) else { return }
        UserDefaults.standard.set(data, forKey: "journal.trades")
    }
}

private enum JournalStyle {
    static let background = Color(red: 0.055, green: 0.071, blue: 0.102)
    static let card = Color(red: 0.090, green: 0.110, blue: 0.149)
    static let panel = Color(red: 0.063, green: 0.078, blue: 0.110)
    static let gold = Color(red: 1.0, green: 0.82, blue: 0.25)
    static let green = Color(red: 0.25, green: 0.82, blue: 0.55)
    static let red = Color(red: 1.0, green: 0.38, blue: 0.38)
}

private func currency(_ value: Double) -> String {
    String(format: "$%.2f", value)
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
