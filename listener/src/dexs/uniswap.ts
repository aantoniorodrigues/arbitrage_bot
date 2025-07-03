import { Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pair, Route } from "@uniswap/v2-sdk";
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
  token0: Token,
  token1: Token,
  provider: ethers.JsonRpcProvider
): Promise<number> {
  const pair = await createPair(token0, token1, provider);
  const route = new Route([pair], token0, token1);

  return Number(route.midPrice.toSignificant(6));
}
