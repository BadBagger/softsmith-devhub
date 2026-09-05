"""Order Executor - Handles trade execution with risk management"""
import logging
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, List
from enum import Enum

logger = logging.getLogger(__name__)


class OrderType(Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(Enum):
    PENDING = "pending"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


@dataclass
class Order:
    symbol: str
    order_type: OrderType
    quantity: int
    price: float
    status: OrderStatus
    entry_time: datetime
    exit_time: Optional[datetime] = None
    profit_loss: Optional[float] = None
    profit_loss_pct: Optional[float] = None


class Executor:
    """Executes trades with risk management and paper trading"""

    def __init__(self, robinhood_client=None, config=None, paper_trading=True):
        self.client = robinhood_client
        self.config = config
        self.paper_trading = paper_trading
        self.orders: List[Order] = []
        self.open_positions = {}
        self.daily_loss = 0
        self.trades_today = 0

    async def place_trade(
        self,
        symbol: str,
        entry_price: float,
        target_price: float,
        stop_loss: float,
        quantity: int = None,
    ) -> Optional[Order]:
        """Place a day trade with built-in risk management"""

        # Risk management checks
        if not self._risk_checks_pass(entry_price, stop_loss):
            logger.warning(f"Risk checks failed for {symbol}")
            return None

        if self.daily_loss > self.config.DAILY_LOSS_LIMIT:
            logger.warning("Daily loss limit reached")
            return None

        # Calculate position size
        if quantity is None:
            quantity = self._calculate_position_size(entry_price, stop_loss)

        try:
            if self.paper_trading:
                return await self._place_paper_trade(
                    symbol, entry_price, target_price, stop_loss, quantity
                )
            else:
                return await self._place_live_trade(
                    symbol, entry_price, target_price, stop_loss, quantity
                )

        except Exception as e:
            logger.error(f"Error placing trade: {e}")
            return None

    async def _place_paper_trade(
        self, symbol: str, entry_price: float, target_price: float, stop_loss: float, quantity: int
    ) -> Order:
        """Simulate a paper trade"""
        order = Order(
            symbol=symbol,
            order_type=OrderType.BUY,
            quantity=quantity,
            price=entry_price,
            status=OrderStatus.FILLED,
            entry_time=datetime.now(),
        )

        self.orders.append(order)
        self.open_positions[symbol] = {
            "quantity": quantity,
            "entry_price": entry_price,
            "target": target_price,
            "stop_loss": stop_loss,
            "entry_time": order.entry_time,
        }

        logger.info(
            f"[PAPER] BUY {quantity} {symbol} @ ${entry_price:.2f} "
            f"(Target: ${target_price:.2f}, Stop: ${stop_loss:.2f})"
        )

        return order

    async def _place_live_trade(
        self, symbol: str, entry_price: float, target_price: float, stop_loss: float, quantity: int
    ) -> Order:
        """Place actual trade on Robinhood"""
        # Would use: self.client.place_equity_order()
        # For now, would need real implementation with Robinhood API

        logger.warning("Live trading not implemented yet")
        return None

    async def close_position(self, symbol: str, exit_price: float) -> Optional[Order]:
        """Close an open position"""
        if symbol not in self.open_positions:
            logger.warning(f"No open position for {symbol}")
            return None

        position = self.open_positions[symbol]
        profit_loss = (exit_price - position["entry_price"]) * position["quantity"]
        profit_loss_pct = (profit_loss / (position["entry_price"] * position["quantity"])) * 100

        exit_order = Order(
            symbol=symbol,
            order_type=OrderType.SELL,
            quantity=position["quantity"],
            price=exit_price,
            status=OrderStatus.FILLED,
            entry_time=position["entry_time"],
            exit_time=datetime.now(),
            profit_loss=profit_loss,
            profit_loss_pct=profit_loss_pct,
        )

        self.orders.append(exit_order)
        self.daily_loss += profit_loss
        self.trades_today += 1

        if self.paper_trading:
            logger.info(
                f"[PAPER] SELL {position['quantity']} {symbol} @ ${exit_price:.2f} "
                f"| P&L: ${profit_loss:.2f} ({profit_loss_pct:.2f}%)"
            )

        del self.open_positions[symbol]
        return exit_order

    async def check_positions(self, current_prices: dict):
        """Monitor open positions for exit signals"""
        to_close = []

        for symbol, position in self.open_positions.items():
            current_price = current_prices.get(symbol)
            if not current_price:
                continue

            # Check take profit
            if current_price >= position["target"]:
                logger.info(f"{symbol} hit target: ${current_price:.2f}")
                to_close.append((symbol, current_price))

            # Check stop loss
            elif current_price <= position["stop_loss"]:
                logger.info(f"{symbol} hit stop loss: ${current_price:.2f}")
                to_close.append((symbol, current_price))

            # Check time-based exit (hold time limit)
            hold_time_minutes = (datetime.now() - position["entry_time"]).total_seconds() / 60
            if hold_time_minutes > self.config.HOLD_TIME_MINUTES:
                logger.info(f"{symbol} exceeded hold time, exiting at ${current_price:.2f}")
                to_close.append((symbol, current_price))

        for symbol, price in to_close:
            await self.close_position(symbol, price)

    def _risk_checks_pass(self, entry_price: float, stop_loss: float) -> bool:
        """Check if trade meets risk requirements"""
        risk_amt = (entry_price - stop_loss) * 100  # Assume 100 shares
        if risk_amt > self.config.MAX_RISK_PER_TRADE:
            logger.warning(f"Risk ${risk_amt:.2f} exceeds max ${self.config.MAX_RISK_PER_TRADE}")
            return False

        if len(self.open_positions) >= self.config.MAX_POSITIONS:
            logger.warning(f"Already have max positions: {self.config.MAX_POSITIONS}")
            return False

        return True

    def _calculate_position_size(self, entry_price: float, stop_loss: float) -> int:
        """Calculate position size based on risk"""
        risk_per_share = entry_price - stop_loss
        if risk_per_share <= 0:
            return 0

        # Risk max allowed per trade
        shares = int(self.config.MAX_RISK_PER_TRADE / risk_per_share)
        return max(1, shares)

    def get_open_positions(self) -> dict:
        """Get all open positions"""
        return self.open_positions.copy()

    def get_today_pnl(self) -> float:
        """Get today's P&L"""
        return self.daily_loss

    def reset_daily_stats(self):
        """Reset daily tracking at end of day"""
        self.daily_loss = 0
        self.trades_today = 0
