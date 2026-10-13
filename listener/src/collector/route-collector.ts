import { TradePair, ArbitrageRoute, Dex } from "../interfaces/types";
import { getExecutionPrice } from "../fetcher/price-fetcher";
import { ethers } from "ethers";

export async function collectArbitrageRoutes(
  pair: TradePair,
  dexes: Dex[],
  provider: ethers.JsonRpcProvider,
): Promise<ArbitrageRoute[]> {
  const quoteAmountsFromTrade1 = await Promise.all(
    dexes.map(async (dex) => {
      const quotePrice = await getExecutionPrice(
        pair.base,
        pair.quote,
        provider,
        pair.amount,
        dex,
      );
      return pair.amount * quotePrice;
    }),
  );

  const dexesAndQuoteAmounts = dexes.flatMap((firstTradeDex, i) => {
    const quoteAmountExpected = quoteAmountsFromTrade1[i];
    return dexes
      .filter((dex) => dex !== firstTradeDex)
      .map((secondTradeDex) => {
        return { firstTradeDex, secondTradeDex, quoteAmountExpected };
      });
  });

  const routes = dexesAndQuoteAmounts.map(async (element) => {
    const { firstTradeDex, secondTradeDex, quoteAmountExpected } = element;
    const secondTradeBasePrice = await getExecutionPrice(
      pair.quote,
      pair.base,
      provider,
      quoteAmountExpected,
      secondTradeDex,
    );

    return {
      firstTradeDex,
      secondTradeDex,
      baseAmountIn: pair.amount,
      quoteAmountExpected,
      baseAmountOut: quoteAmountExpected * secondTradeBasePrice,
    };
  });

  return Promise.all(routes);
}
