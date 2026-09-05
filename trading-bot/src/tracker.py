"""Performance Tracker - Logs and analyzes trading performance"""
import json
import logging
from datetime import datetime
from typing import List, Dict
from pathlib import Path

logger = logging.getLogger(__name__)


class PerformanceTracker:
    """Tracks and analyzes trading performance"""

    def __init__(self, log_dir: str = "./data"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        self.trades = []
        self.alerts = []

    def log_trade(self, symbol: str, order_type: str, quantity: int, entry_price: float, target: float, stop_loss: float):
        """Log a trade entry"""
        trade = {
            "timestamp": datetime.now().isoformat(),
            "symbol": symbol,
            "type": order_type,
            "quantity": quantity,
            "entry_price": entry_price,
            "target": target,
            "stop_loss": stop_loss,
            "status": "open",
        }
        self.trades.append(trade)
        self._save_trades()
        logger.info(f"Logged trade: {symbol} {order_type}")

    def log_exit(self, symbol: str, exit_price: float, profit_loss: float, profit_loss_pct: float):
        """Log trade exit"""
        # Find the trade and update it
        for trade in reversed(self.trades):
            if trade["symbol"] == symbol and trade["status"] == "open":
                trade["exit_price"] = exit_price
                trade["profit_loss"] = profit_loss
                trade["profit_loss_pct"] = profit_loss_pct
                trade["exit_time"] = datetime.now().isoformat()
                trade["status"] = "closed"
                break

        self._save_trades()

    def log_alert(self, symbol: str, score: float, reasoning: str):
        """Log a trading alert"""
        alert = {
            "timestamp": datetime.now().isoformat(),
            "symbol": symbol,
            "score": score,
            "reasoning": reasoning,
        }
        self.alerts.append(alert)
        self._save_alerts()
        logger.info(f"[ALERT] {symbol}: {score:.2f} - {reasoning}")

    def get_daily_stats(self) -> Dict:
        """Get today's trading statistics"""
        closed_trades = [t for t in self.trades if t["status"] == "closed"]

        if not closed_trades:
            return {
                "trades": 0,
                "winners": 0,
                "losers": 0,
                "win_rate": 0,
                "total_pnl": 0,
                "avg_win": 0,
                "avg_loss": 0,
                "profit_factor": 0,
            }

        winners = [t for t in closed_trades if t.get("profit_loss", 0) > 0]
        losers = [t for t in closed_trades if t.get("profit_loss", 0) < 0]

        total_pnl = sum(t.get("profit_loss", 0) for t in closed_trades)
        total_wins = sum(t.get("profit_loss", 0) for t in winners)
        total_losses = abs(sum(t.get("profit_loss", 0) for t in losers))

        return {
            "trades": len(closed_trades),
            "winners": len(winners),
            "losers": len(losers),
            "win_rate": len(winners) / len(closed_trades) if closed_trades else 0,
            "total_pnl": total_pnl,
            "avg_win": total_wins / len(winners) if winners else 0,
            "avg_loss": total_losses / len(losers) if losers else 0,
            "profit_factor": total_wins / total_losses if total_losses > 0 else 0,
        }

    def print_performance(self):
        """Print performance summary"""
        stats = self.get_daily_stats()
        print("\n" + "=" * 50)
        print("TRADING PERFORMANCE SUMMARY")
        print("=" * 50)
        print(f"Total Trades: {stats['trades']}")
        print(f"Winners: {stats['winners']} | Losers: {stats['losers']}")
        print(f"Win Rate: {stats['win_rate']:.1%}")
        print(f"Total P&L: ${stats['total_pnl']:.2f}")
        print(f"Avg Win: ${stats['avg_win']:.2f}")
        print(f"Avg Loss: ${stats['avg_loss']:.2f}")
        print(f"Profit Factor: {stats['profit_factor']:.2f}")
        print("=" * 50 + "\n")

    def _save_trades(self):
        """Save trades to file"""
        today = datetime.now().strftime("%Y-%m-%d")
        filepath = self.log_dir / f"trades_{today}.json"

        with open(filepath, "w") as f:
            json.dump(self.trades, f, indent=2)

    def _save_alerts(self):
        """Save alerts to file"""
        today = datetime.now().strftime("%Y-%m-%d")
        filepath = self.log_dir / f"alerts_{today}.json"

        with open(filepath, "w") as f:
            json.dump(self.alerts, f, indent=2)

    def load_today_trades(self):
        """Load today's trades from file"""
        today = datetime.now().strftime("%Y-%m-%d")
        filepath = self.log_dir / f"trades_{today}.json"

        if filepath.exists():
            with open(filepath, "r") as f:
                self.trades = json.load(f)

    def get_trade_history(self) -> List[Dict]:
        """Get all trades"""
        return self.trades.copy()
