# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

An Ethereum DEX arbitrage bot, in early development. The plan (see README.md): an off-chain **listener** finds price differences for a token pair between two Uniswap-V2-style DEXs (currently Uniswap V2 and its fork Sushiswap, chosen because they share an interface), and later calls a smart contract that executes the trade using a flash loan (Balancer is a candidate). Only `listener/` exists so far; there is no contract code yet.

## Commands

All commands run from `listener/` (Node 18.20.7, per `.tool-versions`). CI runs `npm ci`, `npm run format:check`, `npm run build`, `npm test -- --ci` in that order.

```bash
npm run build          # tsc -> dist/
npm start              # node dist/src/index.js
npm test               # jest
npx jest src/fetcher/price-fetcher.test.ts      # single file
npx jest -t "should return no trades"           # single test by name
npm run format         # prettier --write src/**/*.ts (format:check runs in CI)
```

Config comes from env vars `ETHEREUM_RPC_URL` and `MIN_PROFIT_PCT` (default 0.03). `.env.example` uses `export` lines, so source it into the shell; `dotenv` is a dependency but not loaded anywhere in code.

## Architecture

The pipeline for one `TradePair` (`base`, `quote`, `amount`) is:

1. **`fetcher/price-fetcher.ts`** — reads on-chain reserves for a pair on a given `Dex` and wraps them in `@uniswap/v2-sdk` objects. The pair address is computed locally via CREATE2 (`factoryAddress` + `initCodeHash` + sorted token addresses), not looked up from the factory, so `getReserves` is the only RPC call. `getExecutionPrice` simulates an exact-input trade including price impact; `getMidPrice` ignores it.
2. **`collector/route-collector.ts`** — for every ordered pair of distinct DEXs, simulates base→quote on the first and quote→base on the second, producing `ArbitrageRoute`s (`baseAmountIn`, `quoteAmountExpected`, `baseAmountOut`).
3. **`processor/route-processor.ts`** — pure function: computes profit % per route and returns a `TradeInfo` union (`ARBITRAGE` if `profitPct >= MIN_PROFIT_PCT`, else `NO_OPPORTUNITY`).

`index.ts` is a placeholder polling loop (`POLLING_INTERVAL`) that doesn't yet wire these together. A `Dex` (`dexs/<name>/`) is just data — name, shared `getReserves` ABI, factory address, init code hash — so adding a V2 fork means adding a class with its constants. Token addresses/decimals live in `constants.ts` (`TOKENS`, mainnet only).

## Testing

- Tests that hit the chain use `withFixture(name, fn)` from `services/vcr.ts`, a nock.back wrapper in `record` mode: if `fixtures/<name>` exists it replays it, otherwise it records real RPC traffic (needs `ETHEREUM_RPC_URL`) and writes the fixture. To re-record, delete the fixture file. The fixtures path is relative, so run Jest from `listener/`.
- The VCR strips JSON-RPC `id`s and redacts the Infura `/v3/<key>` path segment both when matching and when saving, so fixtures stay key-free and replay regardless of request ordering. Providers in tests use `batchMaxCount: 1` so each call is a separate, matchable request.
- Pure-logic tests (route processor) mock `../constants` to pin `MIN_PROFIT_PCT` so they don't depend on the environment.
- `tests/index.test.ts` is a placeholder.
