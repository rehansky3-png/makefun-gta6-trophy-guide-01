// Data: the official trophy list plus the roadmap that orders it.
//
// loadTrophies fetches app/data/trophies.json (a file of this app, never
// the network) and returns the list. ROADMAP_STAGES is the seven-stage
// order to the platinum, built from the official descriptions: which
// story chapters and missions, which collectibles and counts, in what
// order. Each stage names the trophy ids it covers.

export async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  const data = await response.json();
  return data.trophies;
}

export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Opening moves',
    text: 'The first session: the opening mission and Chapter 1. Two trophies, both unmissable — just play.',
    ids: [2, 3],
  },
  {
    n: 2,
    title: 'The story spine',
    text: 'Chapters 2 to 4 and the final mission. The spine of the game; every trophy here pops when its chapter or mission ends.',
    ids: [4, 5, 6, 7],
  },
  {
    n: 3,
    title: 'Mission strands',
    text: 'The six named story missions, the five contact finals (Andy, Kenton, Billy, Randy, Tyrone) and the 8 stranger strands. Play each strand through as it appears.',
    ids: [8, 9, 10, 11, 12, 13, 22, 23, 24, 25, 26, 27],
  },
  {
    n: 4,
    title: 'Activities & skills',
    text: 'The skill trophies: 250 stunts, all 42 shooting-range golds, 14 drone-race wins, 20 different race wins, fishing, arcade, meditation at all 18 spots, the hunt for Bret, 50 challenges — and trying all 9 activity types once.',
    ids: [15, 16, 17, 18, 19, 20, 21, 28, 29, 32, 46],
  },
  {
    n: 5,
    title: 'Collectibles & the map',
    text: 'Sweep Leonida region by region: all 52 areas, 3 card sets, WAiNK at 100 locations, 100 vehicles discovered, all 8 garages, 10 vehicles registered to Scooter Bros.',
    ids: [30, 31, 35, 42, 54, 55],
  },
  {
    n: 6,
    title: 'Partner crime spree',
    text: 'The crime trophies, best done while a partner is at your side: wanted-level escapes, the shop robberies, Combat Focus, the VCIA departure, the Rhinos, the jewelry store, 5 bank vaults, the armored truck and one illegal operation per gang.',
    ids: [33, 34, 36, 37, 38, 39, 40, 41, 43, 51],
  },
  {
    n: 7,
    title: 'Odd jobs & cleanup',
    text: 'Everything left: the cocktail on Ocean Beach, the showroom smash, the partnership moment, 500 choices, the second-try trophy, the strange event, $250,000 laundered, $100,000 spent — then 100% completion and the platinum.',
    ids: [1, 14, 44, 45, 47, 48, 49, 50, 52, 53],
  },
];

export const KINDS = ['story', 'activities', 'collectibles', 'crime', 'exploration', 'oddities'];
