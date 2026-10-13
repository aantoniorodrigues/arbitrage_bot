import { TOKENS } from "../constants";
import { TradePair, Dex } from "../interfaces/types";
import { ChainId, Token } from "@uniswap/sdk-core";
import { collectArbitrageRoutes } from "./route-collector";
import * as priceFetcher from "../fetcher/price-fetcher";
import { ethers } from "ethers";
import { Uniswap } from "../dexs/uniswap/uniswap";
import { Sushiswap } from "../dexs/sushiswap/sushiswap";
import { withFixture } from "../services/vcr";

let USDT: Token;
let WETH: Token;
let tradePair: TradePair;
let provider: ethers.JsonRpcProvider;
let dexes: Dex[];

beforeEach(() => {
  const chainId = ChainId.MAINNET;
  provider = new ethers.JsonRpcProvider(
    process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io:443/v3/REDACTED",
    "",
    {
      batchMaxCount: 1,
    },
  );

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
  dexes = [new Uniswap(), new Sushiswap()];
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("collectArbitrageRoutes", () => {
  it("should collect the 2 possible routes for Uniswap and Sushiswap", async () => {
    await withFixture("collector/2-dexes-WETH-USDT.json", async () => {
      const routes = await collectArbitrageRoutes(tradePair, dexes, provider);
      expect(routes).toHaveLength(2);
    });
  });

  it("should collect the 6 possible routes for 3 DEXes", async () => {
    const thirdDex: Dex = {
      name: "FakeDex",
      abi: [],
      factoryAddress: "0x0000000000000000000000000000000000000001",
      initCodeHash: "0x1111111111111111111111111111111111111111",
    };
    const dexes3 = [...dexes, thirdDex];

    jest.spyOn(priceFetcher, "getExecutionPrice").mockResolvedValue(1);

    const routes = await collectArbitrageRoutes(tradePair, dexes3, provider);
    expect(routes).toHaveLength(6);
  });

  it("should collect the routes for Uniswap and Sushiswap with correct data", async () => {
    await withFixture("collector/2-dexes-WETH-USDT.json", async () => {
      const routes = await collectArbitrageRoutes(tradePair, dexes, provider);
      const [firstRoute, secondRoute] = routes;

      expect(firstRoute.firstTradeDex.name).toBe("Uniswap");
      expect(firstRoute.secondTradeDex.name).toBe("Sushiswap");
      expect(firstRoute.baseAmountIn).toBe(1);
      expect(firstRoute.quoteAmountExpected).toBe(2503.06);
      expect(firstRoute.baseAmountOut).toBe(0.98687646008);

      expect(secondRoute.firstTradeDex.name).toBe("Sushiswap");
      expect(secondRoute.secondTradeDex.name).toBe("Uniswap");
      expect(secondRoute.baseAmountIn).toBe(1);
      expect(secondRoute.quoteAmountExpected).toBe(2481.36);
      expect(secondRoute.baseAmountOut).toBe(0.98472275328);
    });
  });
});
