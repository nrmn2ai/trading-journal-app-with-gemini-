import sqlite3
from datetime import datetime
from typing import List, Optional
from dataclasses import dataclass
import json

DB_PATH = "trading_journal.db"

@dataclass
class Trade:
    id: Optional[int] = None
    symbol: str = ""
    trade_type: str = "BUY"  # BUY or SELL
    entry_price: float = 0.0
    exit_price: float = 0.0
    quantity: float = 0.0
    entry_date: str = ""
    exit_date: str = ""
    strategy: str = ""
    notes: str = ""
    pnl: float = 0.0
    pnl_percent: float = 0.0

    def __post_init__(self):
        if self.entry_date == "":
            self.entry_date = datetime.now().strftime("%Y-%m-%d")
        if self.exit_date == "":
            self.exit_date = datetime.now().strftime("%Y-%m-%d")
        self.calculate_pnl()

    def calculate_pnl(self):
        if self.trade_type == "BUY":
            self.pnl = (self.exit_price - self.entry_price) * self.quantity
        else:  # SELL (short)
            self.pnl = (self.entry_price - self.exit_price) * self.quantity
        if self.entry_price > 0:
            self.pnl_percent = (self.pnl / (self.entry_price * self.quantity)) * 100

    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "trade_type": self.trade_type,
            "entry_price": self.entry_price,
            "exit_price": self.exit_price,
            "quantity": self.quantity,
            "entry_date": self.entry_date,
            "exit_date": self.exit_date,
            "strategy": self.strategy,
            "notes": self.notes,
            "pnl": self.pnl,
            "pnl_percent": self.pnl_percent
        }

class Database:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.init_db()

    def init_db(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                trade_type TEXT NOT NULL,
                entry_price REAL NOT NULL,
                exit_price REAL NOT NULL,
                quantity REAL NOT NULL,
                entry_date TEXT NOT NULL,
                exit_date TEXT NOT NULL,
                strategy TEXT,
                notes TEXT,
                pnl REAL,
                pnl_percent REAL
            )
        """)
        self.conn.commit()

    def add_trade(self, trade: Trade) -> int:
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO trades (symbol, trade_type, entry_price, exit_price, quantity,
                              entry_date, exit_date, strategy, notes, pnl, pnl_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (trade.symbol, trade.trade_type, trade.entry_price, trade.exit_price,
              trade.quantity, trade.entry_date, trade.exit_date, trade.strategy,
              trade.notes, trade.pnl, trade.pnl_percent))
        self.conn.commit()
        return cursor.lastrowid

    def get_all_trades(self) -> List[Trade]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM trades ORDER BY entry_date DESC")
        rows = cursor.fetchall()
        return [Trade(
            id=row[0], symbol=row[1], trade_type=row[2], entry_price=row[3],
            exit_price=row[4], quantity=row[5], entry_date=row[6], exit_date=row[7],
            strategy=row[8] or "", notes=row[9] or "", pnl=row[10] or 0,
            pnl_percent=row[11] or 0
        ) for row in rows]

    def get_trade(self, trade_id: int) -> Optional[Trade]:
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM trades WHERE id = ?", (trade_id,))
        row = cursor.fetchone()
        if row:
            return Trade(
                id=row[0], symbol=row[1], trade_type=row[2], entry_price=row[3],
                exit_price=row[4], quantity=row[5], entry_date=row[6], exit_date=row[7],
                strategy=row[8] or "", notes=row[9] or "", pnl=row[10] or 0,
                pnl_percent=row[11] or 0
            )
        return None

    def update_trade(self, trade: Trade) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE trades SET symbol=?, trade_type=?, entry_price=?, exit_price=?,
                              quantity=?, entry_date=?, exit_date=?, strategy=?,
                              notes=?, pnl=?, pnl_percent=?
            WHERE id=?
        """, (trade.symbol, trade.trade_type, trade.entry_price, trade.exit_price,
              trade.quantity, trade.entry_date, trade.exit_date, trade.strategy,
              trade.notes, trade.pnl, trade.pnl_percent, trade.id))
        self.conn.commit()
        return cursor.rowcount > 0

    def delete_trade(self, trade_id: int) -> bool:
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM trades WHERE id = ?", (trade_id,))
        self.conn.commit()
        return cursor.rowcount > 0

    def get_stats(self) -> dict:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT
                COUNT(*) as total_trades,
                SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
                SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
                SUM(pnl) as total_pnl,
                AVG(pnl_percent) as avg_pnl_percent,
                MAX(pnl) as best_trade,
                MIN(pnl) as worst_trade
            FROM trades
        """)
        row = cursor.fetchone()
        total = row[0] or 0
        winning = row[1] or 0
        losing = row[2] or 0
        win_rate = (winning / total * 100) if total > 0 else 0

        return {
            "total_trades": total,
            "winning_trades": winning,
            "losing_trades": losing,
            "win_rate": win_rate,
            "total_pnl": row[3] or 0,
            "avg_pnl_percent": row[4] or 0,
            "best_trade": row[5] or 0,
            "worst_trade": row[6] or 0
        }

    def get_pnl_by_symbol(self) -> dict:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT symbol, SUM(pnl) as total_pnl, COUNT(*) as trade_count
            FROM trades
            GROUP BY symbol
            ORDER BY total_pnl DESC
        """)
        return {row[0]: {"pnl": row[1], "count": row[2]} for row in cursor.fetchall()}

    def get_pnl_by_date(self) -> list:
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT entry_date, SUM(pnl) as daily_pnl
            FROM trades
            GROUP BY entry_date
            ORDER BY entry_date
        """)
        return [{"date": row[0], "pnl": row[1]} for row in cursor.fetchall()]

db = Database()