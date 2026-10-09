import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Pair, Route, Trade } from "@uniswap/v2-sdk";
import { ethers } from "ethers";
import { Dex } from "../interfaces/types";

export async function createPair(
  baseToken: Token,
  quoteToken: Token,
  provider: ethers.JsonRpcProvider,
  dex: Dex,
): Promise<Pair> {
  const pairAddress = getPairAddress(baseToken, quoteToken, dex);
  const pairContract = new ethers.Contract(pairAddress, dex.abi, provider);

  const reserves = await pairContract["getReserves"]();

  const tokens = [baseToken, quoteToken];
  const tokensSorted = tokens[0].sortsBefore(tokens[1])
    ? tokens
    : [tokens[1], tokens[0]];

  const pair = new Pair(
    CurrencyAmount.fromRawAmount(tokensSorted[0], reserves[0].toString()),
    CurrencyAmount.fromRawAmount(tokensSorted[1], reserves[1].toString()),
  );

  return pair;
}

export async function getMidPrice(
  baseToken: Token,
  quoteToken: Token,
  provider: ethers.JsonRpcProvider,
  dex: Dex,
): Promise<number> {
  const pair = await createPair(baseToken, quoteToken, provider, dex);
  const route = new Route([pair], baseToken, quoteToken);

  return Number(route.midPrice.toSignificant(6));
}

export async function getExecutionPrice(
  baseToken: Token,
  quoteToken: Token,
  provider: ethers.JsonRpcProvider,
  baseTokenAmount: number,
  dex: Dex,
): Promise<number> {
  const pair = await createPair(baseToken, quoteToken, provider, dex);
  const route = new Route([pair], baseToken, quoteToken);
  const amountWithDecimals = baseTokenAmount * 10 ** baseToken.decimals;

  const trade = new Trade(
    route,
    CurrencyAmount.fromRawAmount(baseToken, amountWithDecimals),
    TradeType.EXACT_INPUT,
  );

  return Number(trade.executionPrice.toSignificant(6));
}

function getPairAddress(tokenA: Token, tokenB: Token, dex: Dex): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA];

  return ethers.getCreate2Address(
    dex.factoryAddress,
    ethers.solidityPackedKeccak256(
      ["bytes"],
      [
        ethers.solidityPacked(
          ["address", "address"],
          [token0.address, token1.address],
        ),
      ],
    ),
    dex.initCodeHash,
  );
}
