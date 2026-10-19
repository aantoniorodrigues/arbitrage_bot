import { ChainId, Token } from "@uniswap/sdk-core";
import { TOKENS } from "../constants";
import {
  ArbitrageRoute,
  TradePair,
  Dex,
  ArbitrageOpportunity,
} from "../interfaces/types";
import { Uniswap } from "../dexs/uniswap/uniswap";
import { Sushiswap } from "../dexs/sushiswap/sushiswap";
import { processArbitrageRoutes } from "./route-processor";

let USDT: Token;
let WETH: Token;
let tradePair: TradePair;
let firstTradeDex: Dex;
let secondTradeDex: Dex;

beforeEach(() => {
  const chainId = ChainId.MAINNET;

  USDT = new Token(
    chainId,
    TOKENS.USDT.mainnet,
    TOKENS.USDT.decimals,
    "USDT",
    "Tether USD",
  );

  WETH = new Token(
    chainId,
    TOKENS.WETH.mainnet,
    TOKENS.WETH.decimals,
    "WETH",
    "Wrapped Ether",
  );

  tradePair = { base: WETH, quote: USDT, amount: 1 };
  firstTradeDex = new Uniswap();
  secondTradeDex = new Sushiswap();
});

describe("processArbitrageRoutes", () => {

  it("should return no trades on an empty routes array", () => {
    const processedRoutes = processArbitrageRoutes(tradePair, []);
    expect(processedRoutes.length).toBe(0);
  });

  it("should return NO_OPPORTUNITY trades when profit percentages are below threshold", () => {
    const routes: ArbitrageRoute[] = [
      {
        firstTradeDex,
        secondTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 0.99,
      },
      {
        firstTradeDex: secondTradeDex,
        secondTradeDex: firstTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 1.01,
      },
    ];

    const processedRoutes = processArbitrageRoutes(tradePair, routes);
    expect(processedRoutes.length).toBe(2);
    processedRoutes.forEach((route) =>
      expect(route.type).toBe("NO_OPPORTUNITY"),
    );
  });

  it("should return ARBITRAGE trades when profit percentages are above threshold", () => {
    const routes: ArbitrageRoute[] = [
      {
        firstTradeDex,
        secondTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 0.99,
      },
      {
        firstTradeDex: secondTradeDex,
        secondTradeDex: firstTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 1.05,
      },
    ];

    const processedRoutes = processArbitrageRoutes(tradePair, routes);
    const [firstTradeInfo, secondTradeInfo] = processedRoutes;

    expect(firstTradeInfo.type).toBe("NO_OPPORTUNITY");
    expect(secondTradeInfo.type).toBe("ARBITRAGE");
  });

  it("should return ARBITRAGE trades when profit percentages are on the threshold", () => {
    const routes: ArbitrageRoute[] = [
      {
        firstTradeDex,
        secondTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 1.03,
      },
      {
        firstTradeDex: secondTradeDex,
        secondTradeDex: firstTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 0.989,
      },
    ];

    const processedRoutes = processArbitrageRoutes(tradePair, routes);
    expect(processedRoutes.length).toBe(2);

    const [firstTradeInfo, secondTradeInfo] = processedRoutes;

    expect(firstTradeInfo.type).toBe("ARBITRAGE");
    expect(secondTradeInfo.type).toBe("NO_OPPORTUNITY");
  });

  it("should compute the correct profits", () => {
    const routes: ArbitrageRoute[] = [
      {
        firstTradeDex,
        secondTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 0.989,
      },
      {
        firstTradeDex: secondTradeDex,
        secondTradeDex: firstTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 1.051,
      },
    ];

    const processedRoutes = processArbitrageRoutes(tradePair, routes);
    const noOppTradeInfo = processedRoutes[0];
    const arbitrageTradeInfo = processedRoutes[1] as ArbitrageOpportunity;

    expect(noOppTradeInfo.profitPct).toBeCloseTo(-0.011);
    expect(noOppTradeInfo.type).toBe("NO_OPPORTUNITY");

    expect(arbitrageTradeInfo.profit).toBeCloseTo(0.051);
    expect(arbitrageTradeInfo.profitPct).toBeCloseTo(0.051);
    expect(arbitrageTradeInfo.firstTradeDex.name).toBe("Sushiswap");
    expect(arbitrageTradeInfo.secondTradeDex.name).toBe("Uniswap");
    expect(arbitrageTradeInfo.baseAmountIn).toBe(1);
    expect(arbitrageTradeInfo.quoteAmountExpected).toBe(1000);
    expect(arbitrageTradeInfo.baseAmountOutExpected).toBe(1.051);
    expect(arbitrageTradeInfo.type).toBe("ARBITRAGE");
  });

  it("should compute a negative profit percentage on a losing route", () => {
    const routes: ArbitrageRoute[] = [
      {
        firstTradeDex,
        secondTradeDex,
        baseAmountIn: tradePair.amount,
        quoteAmountExpected: 1000,
        baseAmountOut: 0.95,
      },
    ];

    const [losingTradeInfo] = processArbitrageRoutes(tradePair, routes);

    expect(losingTradeInfo.type).toBe("NO_OPPORTUNITY");
    expect(losingTradeInfo.profitPct).toBeLessThan(0);
    expect(losingTradeInfo.profitPct).toBeCloseTo(-0.05);
  });
});
