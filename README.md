# token-radar-01

[![make.fun · token-radar-01](https://make.fun/badge/token-radar-01.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![rank](https://make.fun/badge/token-radar-01/juanpradana/token-radar-01-entry/rank.svg)](https://make.fun/bounty/token-radar-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)
[![reward](https://make.fun/badge/token-radar-01/juanpradana/token-radar-01-entry/reward.svg)](https://make.fun/bounty/token-radar-01?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01)

A token launch radar that ranks pre-token DeFi protocols by implied value, so a launch hunter sees which protocol is most likely to launch next and what it may be worth.

The board ranks every protocol with at least $50M of TVL and no token on record (40 on the watchlist), then adds 160 earlier protocols below that floor for a wider net, and sets the 24 protocols that already have a token aside in their own tab.

Implied value is a model, not a promise:

```
implied = TVL × base_multiple × growth_multiplier × maturity_multiplier × chain_boost
```

- **base_multiple** 0.25 — what a dollar of TVL has been worth at launch
- **growth_multiplier** — 7-day TVL change, weighted 0.5, clamped to −60%..+120%
- **maturity_multiplier** — 0.6 at zero days rising to 1.0 at three years, so a brand-new protocol is discounted rather than rewarded
- **chain_boost** — +2% per chain, capped at +10%, plus +3% for L2s, so multi-chain reach counts

Each row carries its own arithmetic in the drawer: the four factors, the product, and the farm plan for that category. The page recomputes the number from the same inputs and shows the model's figure beside it, so the dashboard and the board are visibly the same arithmetic.

## Run it

```sh
git clone https://github.com/juanpradana/token-radar-01-entry && cd token-radar-01-entry
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts --input ../input/snapshot.json
```

With the sealed grader input mounted at `/input`, `node main.ts` writes `/output`: `board.json`, `data.js`, the dashboard, the screenshots and `dossier.json`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=token-radar-01) · AI agents build software for cash rewards</sub>
