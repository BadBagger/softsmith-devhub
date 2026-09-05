# AI Trading Bot

An intelligent day trading bot that uses AI research and scoring to identify and execute high-probability trades on Robinhood.

## Features

- **Market Scanner**: Scans for high-volume, high-volatility trading opportunities
- **AI Research Engine**: Analyzes technical indicators, fundamentals, and news catalysts
- **Scoring System**: Ranks opportunities by probability (0-1 confidence score)
- **Risk Management**: Built-in position sizing, stop losses, and daily loss limits
- **Paper Trading**: Test strategies risk-free before going live
- **Performance Tracking**: Detailed logging of all trades and performance metrics

## Architecture

```
bot.py (Orchestrator)
├── scanner.py (Finds opportunities)
├── researcher.py (AI analysis)
├── executor.py (Places trades)
└── tracker.py (Performance logging)
```

## Configuration

Edit `config.py` to customize:

```python
# Trading
PAPER_TRADING = True  # Set to False for live trading
MAX_RISK_PER_TRADE = 100  # Max $ at risk per trade
DAILY_LOSS_LIMIT = 500  # Stop trading after this loss
MAX_POSITIONS = 3  # Max concurrent trades

# Technical thresholds
RSI_OVERSOLD = 35
RSI_OVERBOUGHT = 65
STOP_LOSS_PERCENT = 2.0
TAKE_PROFIT_PERCENT = 5.0

# Execution
AUTO_EXECUTE = False  # Start with alerts, enable for auto-trading
ALERT_THRESHOLD = 0.75  # Score needed to alert
```

## How It Works

### 1. Market Scanning
- Scans universe of liquid stocks
- Filters by volume, price, volatility
- Identifies potential day trade setups

### 2. AI Research
- Pulls real-time quotes via Robinhood
- Calculates technical indicators (RSI, MACD, support/resistance)
- Analyzes fundamentals (PE ratio, 52-week levels)
- Checks news and earnings catalysts
- Scores each opportunity 0-1

### 3. Execution Strategy
- **Initial Alert Mode** (AUTO_EXECUTE=False)
  - Scores opportunities and alerts you
  - You manually review and approve trades
  
- **Auto Execute Mode** (AUTO_EXECUTE=True)
  - Automatically places trades above score threshold
  - Strict risk management prevents overtrading
  - Daily loss limits protect capital

### 4. Position Management
- Monitors open positions in real-time
- Automatically exits at:
  - **Take profit target** (default: +5%)
  - **Stop loss** (default: -2%)
  - **Time limit** (default: 30 minutes)
  - **Trailing stop** for momentum

### 5. Performance Tracking
- Logs every trade and exit
- Tracks daily P&L, win rate, profit factor
- Exports JSON data for analysis
- Generates performance summaries

## Installation

```bash
# Clone and install dependencies
cd trading-bot
pip install -r requirements.txt

# Ensure Robinhood MCP is connected to Claude Code
# (Run /mcp in Claude Code and select robinhood-trading)
```

## Running the Bot

### Paper Trading (Recommended First)
```bash
python src/bot.py
```

This will:
- Connect to Robinhood market data
- Start scanning every 5 minutes
- Log alerts to console and `logs/bot.log`
- Save trades to `data/trades_YYYY-MM-DD.json`
- Never risk real money

### With Alerts Only
```python
# config.py
AUTO_EXECUTE = False
ALERT_THRESHOLD = 0.75
```

The bot will find opportunities and alert you. You manually approve each trade.

### With Auto Execution
```python
# config.py
AUTO_EXECUTE = True
ALERT_THRESHOLD = 0.75
```

The bot automatically places trades scoring above threshold. Ideal for backtesting first.

## Scoring System

Opportunities scored 0-1 based on:

- **Technical (40%)**: RSI, MACD, support/resistance, volume
- **Fundamentals (20%)**: PE ratio, 52-week levels, valuation
- **Catalysts (20%)**: News, earnings, events
- **Momentum (20%)**: Price action, intraday movement

Example: A stock with:
- RSI=32 (oversold) → Technical: 0.7
- PE=18 (reasonable) → Fundamentals: 0.6
- Recent earnings beat → Catalysts: 0.8
- Up 2.5% intraday → Momentum: 0.7
- **Total Score: 0.71** → ALERT (above 0.75 threshold)

## Risk Management

### Per-Trade Rules
- Max $ risk: `MAX_RISK_PER_TRADE` (default: $100)
- Position size auto-calculated based on stop loss distance
- Entry rejected if risk exceeds limit

### Daily Limits
- Max daily loss: `DAILY_LOSS_LIMIT` (default: $500)
- Bot stops trading once limit hit
- Resets at market open next day

### Position Limits
- Max concurrent positions: `MAX_POSITIONS` (default: 3)
- Prevents over-concentration
- Forces discipline on trade selection

## File Structure

```
trading-bot/
├── config.py              # Configuration (edit this!)
├── requirements.txt       # Dependencies
├── README.md              # This file
├── src/
│   ├── bot.py            # Main orchestrator
│   ├── scanner.py        # Market scanner
│   ├── researcher.py     # AI research engine
│   ├── executor.py       # Order execution & risk mgmt
│   └── tracker.py        # Performance tracking
├── data/                 # Trade data (auto-created)
│   ├── trades_2024-01-15.json
│   └── alerts_2024-01-15.json
└── logs/                 # Bot logs (auto-created)
    └── bot.log
```

## Monitoring

### Real-Time
- Console output with every scan, alert, trade
- `logs/bot.log` for detailed debug info

### Daily Summary
- `data/trades_YYYY-MM-DD.json` - All trades
- Performance metrics:
  - Total trades
  - Win rate
  - Profit factor (avg win / avg loss)
  - Daily P&L

### Analysis
```python
from src.tracker import PerformanceTracker
tracker = PerformanceTracker()
stats = tracker.get_daily_stats()
print(f"Win Rate: {stats['win_rate']:.1%}")
print(f"Profit Factor: {stats['profit_factor']:.2f}")
```

## Backtesting Strategy

1. Set `PAPER_TRADING = True`
2. Run with `AUTO_EXECUTE = False` to verify alerts
3. Manually execute suggested trades to see results
4. Once confident, set `AUTO_EXECUTE = True`
5. Paper trade for 2-3 days minimum
6. Review performance in `data/trades_*.json`
7. Only then consider live trading (if confident)

## Robinhood Integration

The bot uses the Robinhood MCP (Model Context Protocol) to:
- Get real-time quotes: `get_equity_quotes()`
- Get technical data: `get_equity_technical_indicators()`
- Get fundamentals: `get_equity_fundamentals()`
- Get news: `get_equity_news()`
- Get earnings: `get_earnings_calendar()`
- Place orders: `place_equity_order()` (when live)

Ensure the MCP is connected:
```
# In Claude Code
/mcp
→ select robinhood-trading
→ authenticate
```

## Disclaimers

- **Paper Trading**: Simulated results may not match live performance
- **Past Performance**: Not indicative of future results
- **Day Trading Risks**: High volatility, fast execution required
- **Not Financial Advice**: This is an educational tool
- **Start Small**: Test thoroughly before risking significant capital
- **Monitor Closely**: Don't leave bot unattended with live trading enabled

## Next Steps

1. Configure `config.py` with your preferences
2. Run in paper trading mode with `AUTO_EXECUTE = False`
3. Review generated alerts and logs
4. Manually execute a few trades to validate signals
5. If results are positive, enable `AUTO_EXECUTE = True`
6. Run for several days in paper trading
7. Only then consider live trading (if desired)

## Support

Check these files for debugging:
- `logs/bot.log` - Detailed execution log
- `data/trades_YYYY-MM-DD.json` - Trade history with entry/exit
- `data/alerts_YYYY-MM-DD.json` - All generated alerts

---

**Good luck! Remember: Paper trading first, always.** 📈
