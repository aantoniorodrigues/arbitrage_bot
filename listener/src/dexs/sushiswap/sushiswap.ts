import { Dex } from "../../interfaces/types";
import { ABI } from "../abi";

export class Sushiswap implements Dex {
  name: string;
  abi: string[];
  factoryAddress: string;
  initCodeHash: string;

  constructor() {
    this.name = "Sushiswap";
    this.abi = ABI;
    this.factoryAddress = "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac";
    this.initCodeHash = "0xe18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303";
  }
}
