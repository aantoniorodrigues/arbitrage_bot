import { TOKENS } from "../constants";
import { ChainId, Token } from "@uniswap/sdk-core";
import { createPair } from "./uniswap";
import { ethers } from "ethers";

describe("createPair", () => {
  let WETH: Token;
  let DAI: Token;
  let provider: ethers.JsonRpcProvider;

  beforeEach(() => {
    const chainId = ChainId.MAINNET;
    provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

    DAI = new Token(
      chainId,
      TOKENS.DAI.mainnet,
      TOKENS.DAI.decimals,
      "DAI",
      "Dai Stablecoin"
    );

    WETH = new Token(
      chainId,
      TOKENS.WETH.mainnet,
      TOKENS.WETH.decimals,
      "WETH",
      "Wrapped Ether"
    );
  });

  it("should return a valid pair", async () => {
    const pair = await createPair(WETH, DAI, provider);

    expect(pair).toBeDefined();
  });

  it("should create a pair with the correct token info", async () => {
    const pair = await createPair(WETH, DAI, provider);
    const [tokenAmount0, tokenAmount1] = pair["tokenAmounts"];

    const token0 = tokenAmount0["currency"];
    const token1 = tokenAmount1["currency"];

    expect(token0["symbol"]).toBe("DAI");
    expect(token0["decimals"]).toBe(18);
    expect(token0["address"]).toBe(TOKENS.DAI.mainnet);
    expect(token1["symbol"]).toBe("WETH");
    expect(token1["decimals"]).toBe(18);
    expect(token1["address"]).toBe(TOKENS.WETH.mainnet);
  });
});
