import { TOKENS } from "./constants";
import { ChainId, Token } from "@uniswap/sdk-core";
import { createPair, getMidPrice, getExecutionPrice } from "./price-fetcher";
import { ethers } from "ethers";
import { Uniswap } from "./dexs/uniswap/uniswap";
import { Sushiswap } from "./dexs/sushiswap/sushiswap";

import nock from "nock";
import { withFixture } from "./services/vcr";

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
    await withFixture("mid-price-uni-WETH-USDC.json", async () => {
      const midPrice = await getMidPrice(WETH, USDT, provider, new Uniswap());
      expect(midPrice).toBe(1654.13);
    });
  });

  it("should return WETH token price in USDT on Sushiswap", async () => {
    await withFixture("mid-price-sushi-WETH-USDC.json", async () => {
      const midPrice = await getMidPrice(WETH, USDT, provider, new Sushiswap());
      expect(midPrice).toBe(1653.75);
    });
  });
});

describe("getExecutionPrice", () => {
  it("should return execution price of 1 WETH token in USDT on Uniswap", async () => {
    await withFixture("execution-price-uni-WETH-USDT.json", async () => {
      const executionPrice = await getExecutionPrice(
        WETH,
        USDT,
        provider,
        1,
        new Uniswap(),
      );

      expect(executionPrice).toBe(1648.78);
    });
  });

  it("should return execution price of 1 WETH token in USDT on Sushiswap", async () => {
    await withFixture("execution-price-sushi-WETH-USDT.json", async () => {
      const executionPrice = await getExecutionPrice(
        WETH,
        USDT,
        provider,
        1,
        new Sushiswap(),
      );

      expect(executionPrice).toBe(1638.19);
    });
  });
});
