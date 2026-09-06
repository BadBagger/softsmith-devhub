"""Trading Bot Configuration"""

# Trading Parameters
PAPER_TRADING = False  # Set to False for live trading (use with caution!)
MAX_RISK_PER_TRADE = 10  # Max dollar amount at risk per trade
DAILY_LOSS_LIMIT = 30  # Stop trading after this daily loss
POSITION_SIZE_BASE = 50  # Base capital per trade
MAX_POSITIONS = 2  # Max concurrent positions
HOLD_TIME_MINUTES = 20  # Day trade hold time

# Market Scanning
SCAN_INTERVAL_SECONDS = 300  # Scan every 5 minutes
MIN_PRICE = 2.0  # Avoid penny stocks
MAX_PRICE = 500.0  # Reasonable upper bound
MIN_VOLUME = 500000  # Minimum daily volume
MIN_VOLATILITY = 0.015  # 1.5% intraday movement

# Technical Analysis Thresholds
RSI_OVERSOLD = 35
RSI_OVERBOUGHT = 65
VOLUME_MULTIPLIER = 1.5  # Volume spike threshold
MOMENTUM_THRESHOLD = 0.02  # 2% momentum for entry

# Risk Management
STOP_LOSS_PERCENT = 2.0  # 2% stop loss
TAKE_PROFIT_PERCENT = 5.0  # 5% take profit
TRAILING_STOP_PERCENT = 3.0  # Trailing stop at 3%

# Watchlist - sectors/stocks to focus on
FOCUS_SECTORS = ["technology", "healthcare", "finance", "consumer"]
EXCLUDE_STOCKS = []  # Add stocks to exclude

# Execution
AUTO_EXECUTE = True  # Start with alerts, set to True for auto-execution
ALERT_THRESHOLD = 0.75  # Score threshold for alerts (0-1)

# Logging
LOG_TRADES = True
LOG_LEVEL = "INFO"
