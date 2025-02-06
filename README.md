# arbitrage_bot

Points to consider:

- Pick a blockchain. It won't work using different blockchains.
- When choosing a blockchain: number of tokens, number of supported DEXs, support flash loans, EVM compatible for compatibility.
- Let's start with picking only 2 DEXs to make the trades (further improvement can be using more than 2).
- Choose DEXs with similar, if not identical, interfaces, so they can share most of the code between the 2. Look for forks of previous DEXs.
- When choosing DEXs: number of pairs supported, big liquidity for the pairs we're using.
- When picking a flash loan provider: easy setup, no fees, multi chain. Balancer?
- Handle the actual trade with a smart contract.
- The listener bot will be off chain, and call the smart contract when it finds a profitable trade.
- When building the listener, NodeJS might be the way to go due to the libraries available in JS.
- To find good trade opportunities, rely on blockchain events that are emitted.
