import { Dex } from "../../interfaces/types";
import { ABI } from "../abi";

export class Uniswap implements Dex {
  name: string;
  abi: string[];
  factoryAddress: string;
  initCodeHash: string;

  constructor() {
    this.name = "Uniswap";
    this.abi = ABI;
    this.factoryAddress = "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";
    this.initCodeHash = "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f";
  }
}
