export const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;

export const TOKENS = {
  WETH: {
    name: "WETH",
    mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    testnet: "",
    decimals: 18,
  },
  USDT: {
    name: "USDT",
    mainnet: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    testnet: "",
    decimals: 6,
  },
  USDC: {
    name: "USDC",
    mainnet: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    testnet: "",
    decimals: 6,
  },
  DAI: {
    name: "DAI",
    mainnet: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    testnet: "",
    decimals: 18,
  },
  BNB: {
    name: "BNB",
    mainnet: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52",
    testnet: "",
    decimals: 18,
  },
  PEPE: {
    name: "PEPE",
    mainnet: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    testnet: "",
    decimals: 18,
  },
};

export const POLLING_INTERVAL = 1000; // 1 second
