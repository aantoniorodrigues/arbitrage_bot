import { TOKENS } from "../constants";
import { ChainId, Token } from "@uniswap/sdk-core";
import { createPair, getMidPrice, getExecutionPrice } from "./price-fetcher";
import { ethers } from "ethers";
import { Uniswap } from "./uniswap/uniswap";
import { Sushiswap } from "./sushiswap/sushiswap";

import nock from "nock";
import { defaultOptions } from "../services/vcr";

let USDT: Token;
let WETH: Token;
let BNB: Token;
let provider: ethers.JsonRpcProvider;

beforeEach(() => {
  const chainId = ChainId.MAINNET;
  provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL, "", {
    batchMaxCount: 1,
  });

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

  BNB = new Token(
    chainId,
    TOKENS.BNB.mainnet,
    TOKENS.BNB.decimals,
    "BNB",
    "Binance Coin",
  );
});

describe("createPair", () => {
  it("should return a valid pair from Uniswap", async () => {
    const pair = await createPair(WETH, USDT, provider, new Uniswap());

    expect(pair).toBeDefined();
  });

  it("should return a valid pair from Sushiswap", async () => {
    const pair = await createPair(WETH, USDT, provider, new Sushiswap());

    expect(pair).toBeDefined();
  });

  it("should create WETH/USDT pair with the correct pair info from Uniswap", async () => {
    const pair = await createPair(WETH, USDT, provider, new Uniswap());
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

  it("should create WETH/USDT pair with the correct pair info from Sushiswap", async () => {
    const pair = await createPair(WETH, USDT, provider, new Sushiswap());
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

  it("should create WETH/BNB pair with the correct pair info from Uniswap", async () => {
    const pair = await createPair(WETH, BNB, provider, new Uniswap());
    const [tokenAmount0, tokenAmount1] = pair["tokenAmounts"];

    const token0 = tokenAmount0["currency"];
    const token1 = tokenAmount1["currency"];

    expect(token0["symbol"]).toBe("BNB");
    expect(token0["decimals"]).toBe(18);
    expect(token0["address"]).toBe(TOKENS.BNB.mainnet);
    expect(token1["symbol"]).toBe("WETH");
    expect(token1["decimals"]).toBe(18);
    expect(token1["address"]).toBe(TOKENS.WETH.mainnet);
  });

  it("should create WETH/BNB pair with the correct pair info from Sushiswap", async () => {
    const pair = await createPair(WETH, BNB, provider, new Sushiswap());
    const [tokenAmount0, tokenAmount1] = pair["tokenAmounts"];

    const token0 = tokenAmount0["currency"];
    const token1 = tokenAmount1["currency"];

    expect(token0["symbol"]).toBe("BNB");
    expect(token0["decimals"]).toBe(18);
    expect(token0["address"]).toBe(TOKENS.BNB.mainnet);
    expect(token1["symbol"]).toBe("WETH");
    expect(token1["decimals"]).toBe(18);
    expect(token1["address"]).toBe(TOKENS.WETH.mainnet);
  });
});

describe("getMidPrice", () => {
  it("should return WETH token price in USDT on Uniswap", async () => {
    nock.back.setMode("record");
    const { nockDone } = await nock.back(
      "mid-price-uni-WETH-USDC.json",
      defaultOptions,
    );

    const midPrice = await getMidPrice(WETH, USDT, provider, new Uniswap());
    expect(midPrice).toBe(2117.43);

    nockDone();
    nock.back.setMode("wild");
  });

  it("should return WETH token price in USDT on Sushiswap", async () => {
    nock.back.setMode("record");
    const { nockDone } = await nock.back(
      "mid-price-sushi-WETH-USDC.json",
      defaultOptions,
    );

    const midPrice = await getMidPrice(WETH, USDT, provider, new Sushiswap());
    expect(midPrice).toBe(2118.7);

    nockDone();
    nock.back.setMode("wild");
  });
});

describe("getExecutionPrice", () => {
  it("should return execution price of 1 WETH token in USDT on Uniswap", async () => {
    nock.back.setMode("record");
    const { nockDone } = await nock.back(
      "execution-price-uni-WETH-USDT.json",
      defaultOptions,
    );

    const executionPrice = await getExecutionPrice(
      WETH,
      USDT,
      provider,
      1,
      new Uniswap(),
    );

    expect(executionPrice).toBe(2110.55);

    nockDone();
    nock.back.setMode("wild");
  });

  it("should return execution price of 1 WETH token in USDT on Sushiswap", async () => {
    nock.back.setMode("record");
    const { nockDone } = await nock.back(
      "execution-price-sushi-WETH-USDT.json",
      defaultOptions,
    );

    const executionPrice = await getExecutionPrice(
      WETH,
      USDT,
      provider,
      1,
      new Sushiswap(),
    );

    expect(executionPrice).toBe(2096.93);

    nockDone();
    nock.back.setMode("wild");
  });
});
