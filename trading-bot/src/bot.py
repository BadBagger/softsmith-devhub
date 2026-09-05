"""Main Trading Bot Orchestrator"""
import asyncio
import logging
import sys
from datetime import datetime
from pathlib import Path

# Add parent dir to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config import *
from src.scanner import MarketScanner
from src.researcher import Researcher, TradeOpportunity
from src.executor import Executor
from src.tracker import PerformanceTracker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("logs/bot.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger(__name__)


class TradingBot:
    """Main AI trading bot orchestrator"""

    def __init__(self, robinhood_client=None):
        self.client = robinhood_client
        self.scanner = MarketScanner(robinhood_client, config=self)
        self.researcher = Researcher(robinhood_client)
        self.executor = Executor(robinhood_client, config=self, paper_trading=PAPER_TRADING)
        self.tracker = PerformanceTracker()

        # Load config
        self._load_config()

        logger.info("=" * 60)
        logger.info("TRADING BOT INITIALIZED")
        logger.info(f"Paper Trading: {PAPER_TRADING}")
        logger.info(f"Max Risk Per Trade: ${MAX_RISK_PER_TRADE}")
        logger.info(f"Daily Loss Limit: ${DAILY_LOSS_LIMIT}")
        logger.info(f"Scan Interval: {SCAN_INTERVAL_SECONDS}s")
        logger.info("=" * 60)

    def _load_config(self):
        """Load configuration into self"""
        self.MIN_PRICE = MIN_PRICE
        self.MAX_PRICE = MAX_PRICE
        self.MIN_VOLUME = MIN_VOLUME
        self.MIN_VOLATILITY = MIN_VOLATILITY
        self.RSI_OVERSOLD = RSI_OVERSOLD
        self.RSI_OVERBOUGHT = RSI_OVERBOUGHT
        self.VOLUME_MULTIPLIER = VOLUME_MULTIPLIER
        self.MOMENTUM_THRESHOLD = MOMENTUM_THRESHOLD
        self.STOP_LOSS_PERCENT = STOP_LOSS_PERCENT
        self.TAKE_PROFIT_PERCENT = TAKE_PROFIT_PERCENT
        self.TRAILING_STOP_PERCENT = TRAILING_STOP_PERCENT
        self.MAX_RISK_PER_TRADE = MAX_RISK_PER_TRADE
        self.DAILY_LOSS_LIMIT = DAILY_LOSS_LIMIT
        self.MAX_POSITIONS = MAX_POSITIONS
        self.HOLD_TIME_MINUTES = HOLD_TIME_MINUTES
        self.AUTO_EXECUTE = AUTO_EXECUTE
        self.ALERT_THRESHOLD = ALERT_THRESHOLD

    async def run(self):
        """Main bot loop"""
        logger.info("Starting bot loop...")

        try:
            while True:
                # Check market hours
                if not await self.scanner.check_market_hours():
                    logger.info("Market closed, sleeping...")
                    await asyncio.sleep(60)
                    continue

                # Scan market
                opportunities = await self.scanner.scan_market()
                logger.info(f"Found {len(opportunities)} opportunities")

                # Research and score
                await self._analyze_opportunities(opportunities)

                # Check open positions
                await self._monitor_positions()

                # Wait for next scan
                logger.info(f"Next scan in {SCAN_INTERVAL_SECONDS}s...")
                await asyncio.sleep(SCAN_INTERVAL_SECONDS)

        except KeyboardInterrupt:
            logger.info("Bot stopped by user")
            self.tracker.print_performance()
        except Exception as e:
            logger.error(f"Fatal error: {e}")
            raise

    async def _analyze_opportunities(self, candidates: list):
        """Research and score opportunities"""
        for candidate in candidates[:5]:  # Analyze top 5
            symbol = candidate.get("symbol")
            logger.info(f"Analyzing {symbol}...")

            # Research
            research_data = await self.researcher.research_stock(symbol)
            if not research_data:
                continue

            # Score
            score = self.researcher.score_opportunity(research_data)
            logger.info(f"{symbol} Score: {score:.2f}")

            # Alert if high score
            if score >= self.ALERT_THRESHOLD:
                await self._create_alert(symbol, score, research_data)

                # Auto-execute if enabled
                if self.AUTO_EXECUTE:
                    await self._execute_trade(symbol, research_data, score)

    async def _create_alert(self, symbol: str, score: float, research_data: dict):
        """Create trading alert"""
        quote = research_data.get("quote", {})
        price = quote.get("price", 0)
        change_pct = quote.get("change_percent", 0)

        reasoning = f"Score: {score:.2f}, Price: ${price:.2f}, Change: {change_pct:.2f}%"

        logger.warning(f"\n{'*' * 60}")
        logger.warning(f"TRADING ALERT: {symbol}")
        logger.warning(f"Score: {score:.2f}")
        logger.warning(f"Current Price: ${price:.2f}")
        logger.warning(f"Daily Change: {change_pct:.2f}%")
        logger.warning(f"{'*' * 60}\n")

        self.tracker.log_alert(symbol, score, reasoning)

    async def _execute_trade(self, symbol: str, research_data: dict, score: float):
        """Execute trade based on research"""
        quote = research_data.get("quote", {})
        price = quote.get("price", 0)

        if price <= 0:
            logger.warning(f"Invalid price for {symbol}")
            return

        # Calculate targets
        entry_price = price
        target_price = price * (1 + self.TAKE_PROFIT_PERCENT / 100)
        stop_loss = price * (1 - self.STOP_LOSS_PERCENT / 100)

        # Place trade
        order = await self.executor.place_trade(
            symbol=symbol,
            entry_price=entry_price,
            target_price=target_price,
            stop_loss=stop_loss,
        )

        if order:
            self.tracker.log_trade(
                symbol,
                "BUY",
                order.quantity,
                entry_price,
                target_price,
                stop_loss,
            )

    async def _monitor_positions(self):
        """Monitor open positions for exits"""
        positions = self.executor.get_open_positions()

        if not positions:
            return

        logger.info(f"Monitoring {len(positions)} open positions...")

        # In real implementation, get current prices from API
        current_prices = {}
        for symbol in positions:
            # Would use: current_prices[symbol] = await self.get_current_price(symbol)
            pass

        await self.executor.check_positions(current_prices)

    def print_status(self):
        """Print current bot status"""
        positions = self.executor.get_open_positions()
        pnl = self.executor.get_today_pnl()

        print("\n" + "=" * 50)
        print("BOT STATUS")
        print("=" * 50)
        print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Open Positions: {len(positions)}")
        print(f"Today's P&L: ${pnl:.2f}")
        print(f"Paper Trading: {PAPER_TRADING}")
        print("=" * 50 + "\n")

        if positions:
            print("OPEN POSITIONS:")
            for symbol, pos in positions.items():
                print(f"  {symbol}: {pos['quantity']} @ ${pos['entry_price']:.2f}")
            print()


async def main():
    """Entry point"""
    bot = TradingBot()

    # Start bot loop
    try:
        await bot.run()
    finally:
        bot.tracker.print_performance()


if __name__ == "__main__":
    asyncio.run(main())
