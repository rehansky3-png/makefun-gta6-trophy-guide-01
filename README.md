# Sunset Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/rehansky3-png/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/rehansky3-png/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden): a checklist saved in the browser, export and import, filters by kind and grade, a spoiler setting that hides story trophies until earned, a seven-stage roadmap to the platinum, the eight missable trophies flagged, a Next-up planner, and a guide to every trophy in our own words that cites its sources.

The trophy names, descriptions and grades are the official PlayStation list, as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi), checked on 2026-11-19. Where the official list does not pin a place or a step down, the guide says so plainly instead of inventing one.

## Run it

```sh
node serve.ts
# app/ is on http://localhost:8080 — open it in a desktop browser, network off if you like
```

No build step, no network: `app/` is plain static files (HTML, CSS, ES modules, one JSON data file).

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# writes out/app/, out/screenshots/ and out/dossier.json
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

## Screenshots

Four real renders of the app at 1280×800, taken in Chromium with 13 of 55 trophies earned:

1. `1-checklist.jpg` — the tracker with a trophy's guide open beside it
2. `2-roadmap.jpg` — the roadmap to the platinum
3. `3-missables.jpg` — the missable trophies, flagged
4. `4-spoilers.jpg` — the checklist with the spoiler setting on

## License

MIT — see [LICENSE](LICENSE).

---

<sub>Entered on [make.fun](https://make.fun/?ref=d7yn48z6&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
