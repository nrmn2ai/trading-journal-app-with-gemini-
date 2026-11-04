import flet as ft
from database import db, Trade
from gemini_analyzer import analyzer
from datetime import datetime
import threading

class TradingJournalApp:
    def __init__(self, page: ft.Page):
        self.page = page
        self.setup_page()
        self.trades = []
        self.selected_trade = None
        self.build_ui()
        self.load_trades()

    def setup_page(self):
        self.page.title = "Trading Journal Pro"
        self.page.theme_mode = ft.ThemeMode.DARK
        self.page.window_width = 1200
        self.page.window_height = 800
        self.page.window_min_width = 900
        self.page.window_min_height = 600
        self.page.padding = 0
        self.page.bgcolor = ft.Colors.GREY_900

    def build_ui(self):
        # Header
        self.header = ft.Container(
            content=ft.Row([
                ft.Icon(ft.Icons.TRENDING_UP, color=ft.Colors.AMBER, size=32),
                ft.Text("Trading Journal Pro", size=28, weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER),
                ft.Container(expand=True),
                ft.Text("🤖 Powered by Gemini AI", size=14, color=ft.Colors.GREY_400),
            ], alignment=ft.MainAxisAlignment.START),
            padding=ft.padding.symmetric(horizontal=20, vertical=15),
            bgcolor=ft.Colors.GREY_800,
            border=ft.border.only(bottom=ft.BorderSide(1, ft.Colors.GREY_700))
        )

        # Stats cards
        self.stats_cards = ft.Row([], scroll=ft.ScrollMode.AUTO)

        # Trade form (initially hidden)
        self.trade_form = self.create_trade_form()
        self.form_container = ft.Container(
            content=self.trade_form,
            visible=False,
            animate_opacity=300,
            animate_offset=300,
        )

        # Trades table
        self.trades_table = self.create_trades_table()

        # AI Analysis panel
        self.ai_panel = self.create_ai_panel()

        # Main layout
        self.main_content = ft.Column([
            self.stats_cards,
            ft.Container(
                content=ft.Row([
                    ft.ElevatedButton(
                        "➕ Add Trade",
                        icon=ft.Icons.ADD,
                        on_click=self.show_form,
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.AMBER,
                            color=ft.Colors.BLACK,
                            padding=ft.padding.symmetric(horizontal=20, vertical=12),
                        )
                    ),
                    ft.ElevatedButton(
                        "🤖 Analyze Portfolio",
                        icon=ft.Icons.PSYCHOLOGY,
                        on_click=self.analyze_portfolio,
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.BLUE_600,
                            color=ft.Colors.WHITE,
                            padding=ft.padding.symmetric(horizontal=20, vertical=12),
                        ),
                        disabled=not analyzer.is_available()
                    ),
                    ft.Text(
                        "Gemini AI: " + ("Connected" if analyzer.is_available() else "Not Configured"),
                        size=12,
                        color=ft.Colors.GREEN if analyzer.is_available() else ft.Colors.RED
                    )
                ], alignment=ft.MainAxisAlignment.START),
                padding=ft.padding.symmetric(horizontal=20, vertical=10)
            ),
            self.form_container,
            ft.Container(
                content=ft.Column([
                    ft.Text("Trade History", size=20, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE),
                    ft.Divider(color=ft.Colors.GREY_700),
                    ft.Container(
                        content=ft.Column([self.trades_table], scroll=ft.ScrollMode.AUTO),
                        expand=True,
                        height=400
                    )
                ]),
                padding=20,
                expand=True
            ),
            ft.Container(
                content=self.ai_panel,
                padding=ft.padding.symmetric(horizontal=20, vertical=10),
                bgcolor=ft.Colors.GREY_800,
                border=ft.border.only(top=ft.BorderSide(1, ft.Colors.GREY_700))
            )
        ], expand=True, scroll=ft.ScrollMode.AUTO)

        self.page.add(
            ft.Column([
                self.header,
                self.main_content
            ], expand=True)
        )

    def create_trade_form(self):
        self.symbol_field = ft.TextField(
            label="Symbol (e.g., AAPL, BTCUSDT)",
            width=200,
            text_transform=ft.TextTransform.UPPERCASE,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.type_dropdown = ft.Dropdown(
            label="Type",
            width=120,
            options=[
                ft.dropdown.Option("BUY"),
                ft.dropdown.Option("SELL"),
            ],
            value="BUY",
            border_color=ft.Colors.AMBER,
        )
        self.entry_price_field = ft.TextField(
            label="Entry Price",
            width=140,
            keyboard_type=ft.KeyboardType.NUMBER,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.exit_price_field = ft.TextField(
            label="Exit Price",
            width=140,
            keyboard_type=ft.KeyboardType.NUMBER,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.quantity_field = ft.TextField(
            label="Quantity",
            width=120,
            keyboard_type=ft.KeyboardType.NUMBER,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.entry_date_field = ft.TextField(
            label="Entry Date (YYYY-MM-DD)",
            width=180,
            value=datetime.now().strftime("%Y-%m-%d"),
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.exit_date_field = ft.TextField(
            label="Exit Date (YYYY-MM-DD)",
            width=180,
            value=datetime.now().strftime("%Y-%m-%d"),
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.strategy_field = ft.TextField(
            label="Strategy",
            width=200,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.notes_field = ft.TextField(
            label="Notes",
            width=300,
            multiline=True,
            min_lines=2,
            max_lines=3,
            border_color=ft.Colors.AMBER,
            focused_border_color=ft.Colors.AMBER
        )
        self.pnl_display = ft.Text(
            "P&L: $0.00 (0.00%)",
            size=16,
            weight=ft.FontWeight.BOLD,
            color=ft.Colors.GREY_400
        )

        # Auto-calculate P&L
        for field in [self.entry_price_field, self.exit_price_field, self.quantity_field]:
            field.on_change = self.update_pnl_preview
        self.type_dropdown.on_change = self.update_pnl_preview

        return ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Text("📝 New Trade Entry", size=22, weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER),
                    ft.Container(expand=True),
                    ft.IconButton(
                        ft.Icons.CLOSE,
                        on_click=self.hide_form,
                        icon_color=ft.Colors.GREY_400
                    )
                ]),
                ft.Divider(color=ft.Colors.GREY_700),
                ft.Row([
                    self.symbol_field,
                    self.type_dropdown,
                    self.entry_price_field,
                    self.exit_price_field,
                    self.quantity_field,
                ], wrap=True, spacing=10),
                ft.Row([
                    self.entry_date_field,
                    self.exit_date_field,
                    self.strategy_field,
                ], wrap=True, spacing=10),
                ft.Row([self.notes_field], wrap=True, spacing=10),
                ft.Row([
                    self.pnl_display,
                    ft.Container(expand=True),
                    ft.ElevatedButton(
                        "💾 Save Trade",
                        icon=ft.Icons.SAVE,
                        on_click=self.save_trade,
                        style=ft.ButtonStyle(
                            bgcolor=ft.Colors.GREEN_600,
                            color=ft.Colors.WHITE,
                            padding=ft.padding.symmetric(horizontal=24, vertical=12),
                        )
                    ),
                    ft.OutlinedButton(
                        "Cancel",
                        on_click=self.hide_form,
                        style=ft.ButtonStyle(
                            color=ft.Colors.GREY_400,
                            padding=ft.padding.symmetric(horizontal=24, vertical=12),
                        )
                    )
                ], alignment=ft.MainAxisAlignment.END),
            ], spacing=15),
            padding=20,
            bgcolor=ft.Colors.GREY_800,
            border_radius=12,
            border=ft.border.all(1, ft.Colors.GREY_700),
            margin=ft.margin.symmetric(horizontal=20, vertical=10)
        )

    def create_trades_table(self):
        self.table = ft.DataTable(
            columns=[
                ft.DataColumn(ft.Text("Symbol", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Type", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Entry", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Exit", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Qty", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Date", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Strategy", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("P&L", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("%", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
                ft.DataColumn(ft.Text("Actions", weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER)),
            ],
            rows=[],
            column_spacing=10,
            horizontal_margin=10,
            heading_row_color=ft.Colors.GREY_800,
            data_row_min_height=50,
            data_row_max_height=60,
        )
        return ft.Container(content=self.table, border_radius=8, border=ft.border.all(1, ft.Colors.GREY_700))

    def create_ai_panel(self):
        self.ai_output = ft.Text(
            "Click 'Analyze Portfolio' or select a trade to get AI insights...",
            size=14,
            color=ft.Colors.GREY_400,
            selectable=True
        )
        self.ai_loading = ft.ProgressRing(visible=False, color=ft.Colors.AMBER, width=20, height=20)

        return ft.Column([
            ft.Row([
                ft.Text("🤖 Gemini AI Analysis", size=18, weight=ft.FontWeight.BOLD, color=ft.Colors.AMBER),
                ft.Container(expand=True),
                self.ai_loading
            ]),
            ft.Divider(color=ft.Colors.GREY_700),
            ft.Container(
                content=ft.Column([self.ai_output], scroll=ft.ScrollMode.AUTO),
                height=200,
                padding=10,
                bgcolor=ft.Colors.GREY_900,
                border_radius=8,
                border=ft.border.all(1, ft.Colors.GREY_700)
            )
        ])

    def update_pnl_preview(self, e=None):
        try:
            entry = float(self.entry_price_field.value or 0)
            exit_p = float(self.exit_price_field.value or 0)
            qty = float(self.quantity_field.value or 0)
            trade_type = self.type_dropdown.value or "BUY"

            if entry > 0 and exit_p > 0 and qty > 0:
                if trade_type == "BUY":
                    pnl = (exit_p - entry) * qty
                else:
                    pnl = (entry - exit_p) * qty
                pnl_pct = (pnl / (entry * qty)) * 100
                color = ft.Colors.GREEN if pnl >= 0 else ft.Colors.RED
                self.pnl_display.value = f"P&L: ${pnl:.2f} ({pnl_pct:.2f}%)"
                self.pnl_display.color = color
            else:
                self.pnl_display.value = "P&L: $0.00 (0.00%)"
                self.pnl_display.color = ft.Colors.GREY_400
        except:
            self.pnl_display.value = "P&L: $0.00 (0.00%)"
            self.pnl_display.color = ft.Colors.GREY_400
        self.page.update()

    def show_form(self, e=None, trade=None):
        if trade:
            # Edit mode
            self.selected_trade = trade
            self.symbol_field.value = trade.symbol
            self.type_dropdown.value = trade.trade_type
            self.entry_price_field.value = str(trade.entry_price)
            self.exit_price_field.value = str(trade.exit_price)
            self.quantity_field.value = str(trade.quantity)
            self.entry_date_field.value = trade.entry_date
            self.exit_date_field.value = trade.exit_date
            self.strategy_field.value = trade.strategy
            self.notes_field.value = trade.notes
        else:
            # New trade
            self.selected_trade = None
            self.symbol_field.value = ""
            self.type_dropdown.value = "BUY"
            self.entry_price_field.value = ""
            self.exit_price_field.value = ""
            self.quantity_field.value = ""
            self.entry_date_field.value = datetime.now().strftime("%Y-%m-%d")
            self.exit_date_field.value = datetime.now().strftime("%Y-%m-%d")
            self.strategy_field.value = ""
            self.notes_field.value = ""

        self.update_pnl_preview()
        self.form_container.visible = True
        self.page.update()

    def hide_form(self, e=None):
        self.form_container.visible = False
        self.selected_trade = None
        self.page.update()

    def save_trade(self, e=None):
        try:
            trade = Trade(
                id=self.selected_trade.id if self.selected_trade else None,
                symbol=self.symbol_field.value.strip().upper(),
                trade_type=self.type_dropdown.value,
                entry_price=float(self.entry_price_field.value or 0),
                exit_price=float(self.exit_price_field.value or 0),
                quantity=float(self.quantity_field.value or 0),
                entry_date=self.entry_date_field.value.strip(),
                exit_date=self.exit_date_field.value.strip(),
                strategy=self.strategy_field.value.strip(),
                notes=self.notes_field.value.strip()
            )

            if not trade.symbol:
                self.show_snackbar("Symbol is required!", ft.Colors.RED)
                return

            if self.selected_trade:
                db.update_trade(trade)
                self.show_snackbar("Trade updated!")
            else:
                db.add_trade(trade)
                self.show_snackbar("Trade saved!")

            self.hide_form()
            self.load_trades()
            self.update_stats()
        except ValueError:
            self.show_snackbar("Please enter valid numbers for prices and quantity", ft.Colors.RED)
        except Exception as ex:
            self.show_snackbar(f"Error: {ex}", ft.Colors.RED)

    def load_trades(self):
        self.trades = db.get_all_trades()
        self.refresh_table()

    def refresh_table(self):
        self.table.rows = []
        for trade in self.trades:
            pnl_color = ft.Colors.GREEN if trade.pnl >= 0 else ft.Colors.RED
            self.table.rows.append(ft.DataRow(
                cells=[
                    ft.DataCell(ft.Text(trade.symbol, weight=ft.FontWeight.BOLD, color=ft.Colors.WHITE)),
                    ft.DataCell(ft.Container(
                        content=ft.Text(trade.trade_type, size=12, weight=ft.FontWeight.BOLD, color=ft.Colors.BLACK),
                        bgcolor=ft.Colors.GREEN if trade.trade_type == "BUY" else ft.Colors.RED,
                        border_radius=4,
                        padding=ft.padding.symmetric(horizontal=8, vertical=2),
                        alignment=ft.alignment.center
                    )),
                    ft.DataCell(ft.Text(f"${trade.entry_price:.2f}", color=ft.Colors.WHITE)),
                    ft.DataCell(ft.Text(f"${trade.exit_price:.2f}", color=ft.Colors.WHITE)),
                    ft.DataCell(ft.Text(f"{trade.quantity}", color=ft.Colors.WHITE)),
                    ft.DataCell(ft.Text(trade.entry_date, color=ft.Colors.GREY_300, size=12)),
                    ft.DataCell(ft.Text(trade.strategy or "-", color=ft.Colors.GREY_400, size=12)),
                    ft.DataCell(ft.Text(f"${trade.pnl:.2f}", color=pnl_color, weight=ft.FontWeight.BOLD)),
                    ft.DataCell(ft.Text(f"{trade.pnl_percent:.2f}%", color=pnl_color, weight=ft.FontWeight.BOLD)),
                    ft.DataCell(ft.Row([
                        ft.IconButton(
                            ft.Icons.EDIT,
                            icon_color=ft.Colors.BLUE_400,
                            on_click=lambda e, t=trade: self.show_form(trade=t),
                            tooltip="Edit"
                        ),
                        ft.IconButton(
                            ft.Icons.DELETE,
                            icon_color=ft.Colors.RED_400,
                            on_click=lambda e, t=trade: self.delete_trade(t),
                            tooltip="Delete"
                        ),
                        ft.IconButton(
                            ft.Icons.PSYCHOLOGY,
                            icon_color=ft.Colors.AMBER,
                            on_click=lambda e, t=trade: self.analyze_trade(t),
                            tooltip="AI Analysis",
                            disabled=not analyzer.is_available()
                        ),
                    ], spacing=0)),
                ]
            ))
        self.page.update()

    def update_stats(self):
        stats = db.get_stats()
        self.stats_cards.controls = [
            self.create_stat_card("Total Trades", str(stats['total_trades']), ft.Colors.BLUE_400, ft.Icons.LIST_ALT),
            self.create_stat_card("Win Rate", f"{stats['win_rate']:.1f}%", ft.Colors.GREEN_400, ft.Icons.PERCENT),
            self.create_stat_card("Total P&L", f"${stats['total_pnl']:.2f}",
                                ft.Colors.GREEN if stats['total_pnl'] >= 0 else ft.Colors.RED, ft.Icons.ATTACH_MONEY),
            self.create_stat_card("Avg %/Trade", f"{stats['avg_pnl_percent']:.2f}%", ft.Colors.AMBER, ft.Icons.TRENDING_UP),
            self.create_stat_card("Best Trade", f"${stats['best_trade']:.2f}", ft.Colors.GREEN_400, ft.Icons.STAR),
            self.create_stat_card("Worst Trade", f"${stats['worst_trade']:.2f}", ft.Colors.RED_400, ft.Icons.WARNING),
        ]
        self.page.update()

    def create_stat_card(self, title, value, color, icon):
        return ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Icon(icon, color=color, size=24),
                    ft.Container(expand=True),
                    ft.Text(value, size=24, weight=ft.FontWeight.BOLD, color=color),
                ]),
                ft.Text(title, size=12, color=ft.Colors.GREY_400),
            ], spacing=5),
            padding=15,
            width=180,
            bgcolor=ft.Colors.GREY_800,
            border_radius=10,
            border=ft.border.all(1, ft.Colors.GREY_700),
        )

    def delete_trade(self, trade):
        def confirm_delete(e):
            db.delete_trade(trade.id)
            self.load_trades()
            self.update_stats()
            self.show_snackbar("Trade deleted")
            dialog.open = False
            self.page.update()

        dialog = ft.AlertDialog(
            title=ft.Text("Delete Trade?"),
            content=ft.Text(f"Delete {trade.symbol} {trade.trade_type} trade?"),
            actions=[
                ft.TextButton("Cancel", on_click=lambda e: setattr(dialog, 'open', False)),
                ft.TextButton("Delete", on_click=confirm_delete, style=ft.ButtonStyle(color=ft.Colors.RED)),
            ],
            modal=True
        )
        self.page.overlay.append(dialog)
        dialog.open = True
        self.page.update()

    def analyze_trade(self, trade):
        if not analyzer.is_available():
            self.show_snackbar("Gemini AI not configured", ft.Colors.RED)
            return

        self.ai_loading.visible = True
        self.ai_output.value = "🤖 Analyzing trade..."
        self.page.update()

        def run_analysis():
            result = analyzer.analyze_trade(trade.to_dict())
            self.ai_output.value = result
            self.ai_loading.visible = False
            self.page.update()

        threading.Thread(target=run_analysis, daemon=True).start()

    def analyze_portfolio(self, e=None):
        if not analyzer.is_available():
            self.show_snackbar("Gemini AI not configured. Set GEMINI_API_KEY env variable.", ft.Colors.RED)
            return

        self.ai_loading.visible = True
        self.ai_output.value = "🤖 Analyzing portfolio performance..."
        self.page.update()

        def run_analysis():
            stats = db.get_stats()
            result = analyzer.analyze_portfolio([t.to_dict() for t in self.trades], stats)
            self.ai_output.value = result
            self.ai_loading.visible = False
            self.page.update()

        threading.Thread(target=run_analysis, daemon=True).start()

    def show_snackbar(self, message, color=ft.Colors.GREEN):
        self.page.snack_bar = ft.SnackBar(
            content=ft.Text(message, color=ft.Colors.WHITE),
            bgcolor=color,
            duration=3000
        )
        self.page.snack_bar.open = True
        self.page.update()

def main(page: ft.Page):
    app = TradingJournalApp(page)

if __name__ == "__main__":
    ft.app(target=main)