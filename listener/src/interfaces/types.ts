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
