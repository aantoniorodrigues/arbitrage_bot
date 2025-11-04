import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Pair, Route, Trade } from "@uniswap/v2-sdk";
import { ethers } from "ethers";
import uniswapV2poolABI from "@uniswap/v2-core/build/UniswapV2Pair.json";

export async function createPair(
  token0: Token,
  token1: Token,
  provider: ethers.JsonRpcProvider
): Promise<Pair> {
  const pairAddress = Pair.getAddress(token0, token1);
  const pairContract = new ethers.Contract(
    pairAddress,
    uniswapV2poolABI.abi,
    provider
  );

  const reserves = await pairContract["getReserves"]();
  const [reserve0, reserve1] = reserves;

  const tokens = [token0, token1];
  const tokensSorted = tokens[0].sortsBefore(tokens[1])
    ? tokens
    : [tokens[1], tokens[0]];

  const reservesSorted = token0.sortsBefore(token1)
    ? reserves
    : [reserve1, reserve0];

  const pair = new Pair(
    CurrencyAmount.fromRawAmount(tokensSorted[0], reservesSorted[0].toString()),
    CurrencyAmount.fromRawAmount(tokensSorted[1], reservesSorted[1].toString())
  );

  return pair;
}

export async function getMidPrice(
  inputToken: Token,
  outputToken: Token,
  provider: ethers.JsonRpcProvider
): Promise<number> {
  const pair = await createPair(inputToken, outputToken, provider);
  const route = new Route([pair], inputToken, outputToken);

  return Number(route.midPrice.toSignificant(6));
}

export async function getExecutionPrice(
  inputToken: Token,
  outputToken: Token,
  provider: ethers.JsonRpcProvider,
  inputTokenAmount: number
): Promise<number> {
const pair = await createPair(inputToken, outputToken, provider)
const route = new Route([pair], inputToken, outputToken);
const amountWithDecimals = inputTokenAmount * 10 ** inputToken.decimals;

const trade = new Trade(
  route,
  CurrencyAmount.fromRawAmount(inputToken, amountWithDecimals),
  TradeType.EXACT_INPUT
);

return Number(trade.executionPrice.toSignificant(6));
}
