import { TOKENS } from "../constants";
import { ChainId, Token, CurrencyAmount } from "@uniswap/sdk-core";
import { Pair } from "@uniswap/v2-sdk";
import { ethers } from "ethers";
import uniswapV2poolABI from "@uniswap/v2-core/build/UniswapV2Pair.json";

const chainId = ChainId.MAINNET;
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const WETH = new Token(chainId, TOKENS.WETH.mainnet, TOKENS.WETH.decimals);
const DAI = new Token(chainId, TOKENS.DAI.mainnet, TOKENS.DAI.decimals);

async function createPair(token1: Token, token2: Token) {
  const pairAddress = Pair.getAddress(token1, token2);
  const pairContract = new ethers.Contract(
    pairAddress,
    uniswapV2poolABI.abi,
    provider
  );

  const reserves = await pairContract["getReserves"]();
  const [reserve1, reserve2] = reserves;

  const tokensSorted = token1.sortsBefore(token2)
    ? [token1, token2]
    : [token2, token1];

  const pair = new Pair(
    CurrencyAmount.fromRawAmount(token1, reserve1),
    CurrencyAmount.fromRawAmount(token2, reserve2)
  );

  return pair;
}
