[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rehansky3-png/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rehansky3-png/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Sunset Platinum — GTA VI Trophy Guide & Tracker

An offline web app that is the definitive guide to all 55 PlayStation 5
trophies of Grand Theft Auto VI: every trophy with its official name,
description and grade, a guide in our own words that cites its sources, a
7-stage roadmap to the platinum, 8 missables flagged from the official
descriptions, and a tracker whose progress is saved in the browser with
export and import.

## How to run

Serve `app/` with any static server and open `index.html`, or run the
entry program to hand the guide in:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The app loads nothing over the network — every file it needs is under
`app/` — so it works with the network off.

## The list, verified live

The 55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on
PlayStation until earned) were verified 19 Nov 2026 against Exophase's
public list and PSNProfiles — the two agree on every name, description
and grade. Counts are PSN's progress targets (for example 42 Shooting
Range challenges, 14 drone-race locations, 18 meditation spots, 52 areas
of Leonida), via PSNProfiles.

## What is in here

- `app/index.html` + `app/css/style.css` + `app/js/` — the guide itself:
  checklist, detail pane with guide and sources, roadmap, missables page
  and a Next-up planner. Progress is saved in `localStorage`.
- `app/data/trophies.json` — the official list with our guides, kinds,
  roadmap stages and missable flags.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — 4 renders of the app taken in Chromium.

## Honesty note

The game is a day old and no complete guide exists yet. Every guide is
our own words written from the official description; where a place is not
pinned down we say so instead of inventing one, and every missable flag
says it is our reading of the description, not yet confirmed in the game.
No Rockstar Games logo, artwork or game screenshot is used anywhere.

## License

MIT — see `LICENSE`.
