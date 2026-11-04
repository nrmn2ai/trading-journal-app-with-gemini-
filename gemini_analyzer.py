import google.generativeai as genai
import os
from typing import Optional, List
import json

class GeminiAnalyzer:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.model = None
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini: {e}")

    def is_available(self) -> bool:
        return self.model is not None

    def analyze_trade(self, trade_data: dict) -> str:
        if not self.is_available():
            return "❌ Gemini AI not configured. Set GEMINI_API_KEY environment variable."

        prompt = f"""
        As an expert trading analyst, analyze this trade and provide insights:

        Trade Details:
        - Symbol: {trade_data['symbol']}
        - Type: {trade_data['trade_type']}
        - Entry Price: ${trade_data['entry_price']:.2f}
        - Exit Price: ${trade_data['exit_price']:.2f}
        - Quantity: {trade_data['quantity']}
        - Entry Date: {trade_data['entry_date']}
        - Exit Date: {trade_data['exit_date']}
        - Strategy: {trade_data['strategy'] or 'Not specified'}
        - Notes: {trade_data['notes'] or 'None'}
        - P&L: ${trade_data['pnl']:.2f} ({trade_data['pnl_percent']:.2f}%)

        Provide:
        1. Quick assessment (Good/Bad/Neutral)
        2. Key observations
        3. Risk management feedback
        4. Suggestions for improvement
        Keep it concise and actionable.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"❌ Error analyzing trade: {e}"

    def analyze_portfolio(self, trades: List[dict], stats: dict) -> str:
        if not self.is_available():
            return "❌ Gemini AI not configured. Set GEMINI_API_KEY environment variable."

        trades_summary = "\n".join([
            f"- {t['symbol']} {t['trade_type']}: ${t['pnl']:.2f} ({t['pnl_percent']:.1f}%)"
            for t in trades[-10:]  # Last 10 trades
        ])

        prompt = f"""
        As a trading coach, analyze this trading performance:

        Portfolio Stats:
        - Total Trades: {stats['total_trades']}
        - Win Rate: {stats['win_rate']:.1f}%
        - Total P&L: ${stats['total_pnl']:.2f}
        - Avg P&L %: {stats['avg_pnl_percent']:.2f}%
        - Best Trade: ${stats['best_trade']:.2f}
        - Worst Trade: ${stats['worst_trade']:.2f}

        Recent Trades:
        {trades_summary}

        Provide:
        1. Overall performance assessment
        2. Strengths identified
        3. Weaknesses/risks
        4. 3 specific actionable recommendations
        4. Psychology/mindset notes
        Keep it structured and encouraging but honest.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"❌ Error analyzing portfolio: {e}"

    def suggest_strategy(self, symbol: str, market_condition: str = "") -> str:
        if not self.is_available():
            return "❌ Gemini AI not configured. Set GEMINI_API_KEY environment variable."

        prompt = f"""
        As a trading strategist, suggest a trading approach for {symbol}.
        Market condition context: {market_condition or 'General'}

        Provide:
        1. Typical strategies for this asset class
        2. Key technical levels to watch
        3. Risk management guidelines
        4. Common pitfalls to avoid
        Keep it practical and educational.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"❌ Error getting strategy suggestion: {e}"

# Global analyzer instance
analyzer = GeminiAnalyzer()