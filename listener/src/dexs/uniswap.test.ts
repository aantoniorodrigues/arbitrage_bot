import { TOKENS } from "../constants";
import { ChainId, Token } from "@uniswap/sdk-core";
import { createPair, getMidPrice } from "./uniswap";
import { ethers } from "ethers";

let USDT: Token;
let WETH: Token;
let BNB: Token;
let provider: ethers.JsonRpcProvider;

beforeEach(() => {
  const chainId = ChainId.MAINNET;
  provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

  USDT = new Token(
    chainId,
    TOKENS.USDT.mainnet,
    TOKENS.USDT.decimals,
    "USDT",
    "Tether USD"
  );

  WETH = new Token(
    chainId,
    TOKENS.WETH.mainnet,
    TOKENS.WETH.decimals,
    "WETH",
    "Wrapped Ether"
  );

  BNB = new Token(
    chainId,
    TOKENS.BNB.mainnet,
    TOKENS.BNB.decimals,
    "BNB",
    "Binance Coin"
  );
});

describe("createPair", () => {
  it("should return a valid pair", async () => {
    const pair = await createPair(WETH, USDT, provider);

    expect(pair).toBeDefined();
  });

  it("should create a pair with the correct token info", async () => {
    const pair = await createPair(WETH, USDT, provider);
    const [tokenAmount0, tokenAmount1] = pair["tokenAmounts"];

    const token0 = tokenAmount0["currency"];
    const token1 = tokenAmount1["currency"];

    expect(token0["symbol"]).toBe("WETH");
    expect(token0["decimals"]).toBe(18);
    expect(token0["address"]).toBe(TOKENS.WETH.mainnet);
    expect(token1["symbol"]).toBe("USDT");
    expect(token1["decimals"]).toBe(6);
    expect(token1["address"]).toBe(TOKENS.USDT.mainnet);
  });
});

describe("getMidPrice", () => {
  it("should return WETH token price in USDT", async () => {
    const midPrice = await getMidPrice(WETH, USDT, provider);
    expect(midPrice).toBeCloseTo(2611.77, -1);
  });
});
