# Trading Journal Pro - Cross-Platform

A modern, cross-platform trading journal with **Gemini AI integration** built with **Flet** (Flutter for Python).

## Features

✅ **Cross-Platform** - Runs on Windows, macOS, Linux, and Web  
✅ **Trade Management** - Add, edit, delete trades with full details  
✅ **Statistics Dashboard** - Win rate, total P&L, best/worst trades  
✅ **Gemini AI Analysis** - Get AI insights on individual trades & portfolio  
✅ **Local SQLite Database** - No cloud dependency, your data stays private  
✅ **Dark Theme** - Professional trading terminal aesthetic  

## Screenshots

```
┌─────────────────────────────────────────────────────────────┐
│ 📈 Trading Journal Pro          🤖 Powered by Gemini AI   │
├─────────────────────────────────────────────────────────────┤
│ Total Trades  │ Win Rate   │ Total P&L   │ Avg %/Trade   │
│     24        │   62.5%    │  $1,234.56  │    +2.34%     │
├─────────────────────────────────────────────────────────────┤
│ ➕ Add Trade  │ 🤖 Analyze Portfolio                         │
├─────────────────────────────────────────────────────────────┤
│ Symbol  Type   Entry   Exit    Qty   Date       P&L      %  │
│ AAPL    BUY   150.00  155.00   10   2024-01-15  +$50.00 +3.33%  [✏️] [🗑️] [🤖] │
│ TSLA    SELL  250.00  240.00   5    2024-01-10  +$50.00 +4.00%  [✏️] [🗑️] [🤖] │
├─────────────────────────────────────────────────────────────┤
│ 🤖 Gemini AI Analysis                                        │
│ "Your win rate of 62.5% is solid. However, your avg        │
│  holding period is too short. Consider..."                  │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Gemini AI (Optional but Recommended)
Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**
```cmd
set GEMINI_API_KEY=your-api-key-here
```

**macOS/Linux:**
```bash
export GEMINI_API_KEY="your-api-key-here"
```

### 3. Run the App
```bash
python main.py
```

The app will open as a native desktop window.

## Project Structure

```
trading-journal-crossplatform/
├── main.py              # Main Flet application
├── database.py          # SQLite database & Trade model
├── gemini_analyzer.py   # Google Gemini AI integration
├── requirements.txt     # Python dependencies
└── trading_journal.db   # Auto-created SQLite database
```

## Usage

### Adding a Trade
1. Click **"➕ Add Trade"**
2. Fill in: Symbol, Type (BUY/SELL), Entry/Exit Price, Quantity
3. Optional: Dates, Strategy, Notes
4. P&L calculates automatically in real-time
5. Click **"💾 Save Trade"**

### AI Analysis
- **Portfolio Analysis**: Click "🤖 Analyze Portfolio" for overall performance review
- **Trade Analysis**: Click the 🤖 icon on any trade row for specific trade insights

### Data Persistence
All trades stored locally in `trading_journal.db` (SQLite). No internet required for core features.

## Packaging as Executable

### Using PyInstaller
```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name "TradingJournal" main.py
```
Executable will be in `dist/TradingJournal.exe`

### Using Flet Build (for all platforms)
```bash
pip install flet-build
flet build windows
flet build macos
flet build linux
```

## Requirements

- Python 3.8+
- Google Generative AI API key (for AI features)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `pip install -r requirements.txt` |
| AI not working | Check `GEMINI_API_KEY` is set correctly |
| Window too small | Drag to resize, minimum 900x600 |
| Database errors | Delete `trading_journal.db` to reset |

## License

MIT License - Feel free to modify and distribute.