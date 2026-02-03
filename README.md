# Tartarus 🔥

A PixiJS + ECS game engine for top-down action games. Built for the browser, drops into React.

Extracted from [SURVIVOR](https://github.com/PatrionDigital/SURVIVOR) — battle-tested with ~500 tests.

## Packages

| Package | Description |
|---------|-------------|
| `@tartarus/core` | Game loop, ECS (miniplex), scenes, input, camera, leveling, pickups |
| `@tartarus/combat` | Weapons, projectiles, collision systems |
| `@tartarus/ai` | Enemy factory, Yuka steering AI, spawning, death |
| `@tartarus/waves` | Wave manager, timed events, spawn patterns |
| `@tartarus/react` | React adapter — drop GameCanvas into any page |
| `@tartarus/designer` | Visual content tools — enemy, wave, weapon, upgrade editors |

## Tech Stack

- **Rendering:** PixiJS v8
- **ECS:** miniplex v2
- **AI:** Yuka (steering behaviors, flocking)
- **Testing:** Vitest
- **Build:** TypeScript + Turborepo

## Quick Start

```bash
pnpm install
pnpm build
pnpm test:run
```

## Architecture

The engine is framework-agnostic at its core. `@tartarus/react` provides the bridge to mount the game canvas as a React component. Crypto/blockchain features are designed to hook in through game events — the engine doesn't know or care about on-chain logic.

```
Your Game
  └── @tartarus/react (GameCanvas)
        └── @tartarus/core (engine loop, ECS, scenes)
              ├── @tartarus/combat (weapons, projectiles)
              ├── @tartarus/ai (enemies, steering)
              └── @tartarus/waves (wave progression)
```

## Designer Tools

`@tartarus/designer` ships with 4 visual editors:

- **Enemy Designer** — Create enemy types, preview AI steering behavior
- **Wave Designer** — Timeline editor for wave configurations
- **Weapon Designer** — Configure weapons with live projectile preview
- **Upgrade Designer** — Balance upgrade pools and stat curves

## License

MIT
