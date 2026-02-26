export interface PriceData {
  exchange: string;
  price: number;
  timestamp: number;
}

export interface PriceDifference {
  uniswapPrice: number;
  sushiswapPrice: number;
  difference: number;
  percentageDifference: number;
  timestamp: number;
}

export interface Dex {
  name: string;
  abi: string[];
  factoryAddress: string;
  initCodeHash: string;
}
