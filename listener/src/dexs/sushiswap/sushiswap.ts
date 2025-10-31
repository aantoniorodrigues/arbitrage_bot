import { Token, CurrencyAmount, TradeType } from "@uniswap/sdk-core";
import { Pair, Route } from "@uniswap/v2-sdk";
import { ethers } from "ethers";
import { ABI } from "./abi";

const SUSHI_FACTORY_ADDRESS = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";

const SUSHI_INIT_CODE_HASH = "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303";

export async function createPair(
  token0: Token,
  token1: Token,
  provider: ethers.JsonRpcProvider
): Promise<Pair> {
  const pairAddress = getPairAddress(token0, token1);
  const pairContract = new ethers.Contract(
    pairAddress,
    ABI,
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

function getPairAddress(tokenA: Token, tokenB: Token): string {
  const [token0, token1] = tokenA.sortsBefore(tokenB)
    ? [tokenA, tokenB]
    : [tokenB, tokenA];
  
  return ethers.getCreate2Address(
    SUSHI_FACTORY_ADDRESS,
    ethers.solidityPackedKeccak256(
      ["bytes"],
      [
        ethers.solidityPacked(
          ["address", "address"],
          [token0.address, token1.address]
        )
      ]
    ),
    SUSHI_INIT_CODE_HASH
  );
}
