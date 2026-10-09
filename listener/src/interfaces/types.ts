import { Token } from "@uniswap/sdk-core";

export interface Dex {
  name: string;
  abi: string[];
  factoryAddress: string;
  initCodeHash: string;
}

export interface TradePair {
  base: Token;
  quote: Token;
  amount: number;
}

export interface ArbitrageRoute {
  firstTradeDex: Dex;
  secondTradeDex: Dex;
  baseAmountIn: number;
  quoteAmountExpected: number;
  baseAmountOut: number;
}

export interface ArbitrageOpportunity {
  type: "ARBITRAGE";
  pair: TradePair;
  firstTradeDex: Dex;
  secondTradeDex: Dex;
  baseAmountIn: number;
  quoteAmountExpected: number;
  baseAmountOutExpected: number;
  profit: number;
  profitPct: number;
  timestamp: number;
}

export interface NoOpportunity {
  type: "NO_OPPORTUNITY";
  pair: TradePair;
  bestProfitPct: number;
  timestamp: number;
}

export type TradeInfo = ArbitrageOpportunity | NoOpportunity
