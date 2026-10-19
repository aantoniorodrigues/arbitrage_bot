import { ArbitrageRoute, TradeInfo, TradePair } from "../interfaces/types";
import { MIN_PROFIT_PCT } from "../constants";

export function processArbitrageRoutes(
  pair: TradePair,
  routes: ArbitrageRoute[],
): TradeInfo[] {
  const trades = routes.map((route) => processRoute(pair, route));
  return trades;
}

function processRoute(pair: TradePair, route: ArbitrageRoute): TradeInfo {
  const {
    firstTradeDex,
    secondTradeDex,
    baseAmountIn,
    quoteAmountExpected,
    baseAmountOut,
  } = route;

  const profitAmount = baseAmountOut - baseAmountIn;
  const profitPct = Number((profitAmount / baseAmountIn).toFixed(3));

  if (profitPct >= MIN_PROFIT_PCT) {
    return {
      type: "ARBITRAGE",
      pair,
      firstTradeDex,
      secondTradeDex,
      baseAmountIn,
      quoteAmountExpected,
      baseAmountOutExpected: baseAmountOut,
      profit: profitAmount,
      profitPct,
      timestamp: Date.now(),
    };
  } else {
    return {
      type: "NO_OPPORTUNITY",
      pair,
      profitPct,
      timestamp: Date.now(),
    };
  }
}
