#!/usr/bin/env python3
"""Demo script - Run the bot with sample data"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.bot import TradingBot


async def demo():
    """Run bot demo"""
    print("\n" + "=" * 60)
    print("AI TRADING BOT - DEMO MODE")
    print("=" * 60 + "\n")

    bot = TradingBot()

    # Show status
    bot.print_status()

    # Simulate a scan
    print("Running market scan...")
    opportunities = await bot.scanner.scan_market()
    print(f"Found {len(opportunities)} opportunities")

    if opportunities:
        print("\nTop opportunities:")
        for i, opp in enumerate(opportunities[:3], 1):
            print(f"  {i}. {opp.get('symbol')} - Volume: {opp.get('volume'):,}")

    # Analyze one
    if opportunities:
        symbol = opportunities[0]["symbol"]
        print(f"\nAnalyzing {symbol}...")
        research = await bot.researcher.research_stock(symbol)

        if research:
            score = bot.researcher.score_opportunity(research)
            print(f"  Score: {score:.2f}")

            if score >= 0.5:
                print(f"  → Would generate alert!")

    print("\n" + "=" * 60)
    print("Demo complete! See logs/bot.log for details.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(demo())
