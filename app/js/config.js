// Sunset Platinum — the names of this guide's parts, in one place.
export const APP_NAME = 'Sunset Platinum';
export const STORAGE_KEYS = {
  progress: 'sunset-platinum-progress-v1',
  notes: 'sunset-platinum-notes-v1',
  settings: 'sunset-platinum-settings-v1',
};
export const TOTAL_TROPHIES = 55;

// Filter kinds, in the order the toolbar shows them.
export const KIND_FILTERS = [
  { id: 'all', label: 'All trophies' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'side', label: 'Side missions' },
  { id: 'money', label: 'Heists & money' },
  { id: 'world', label: 'World' },
];

// The roadmap's stages, built from the official descriptions: story first,
// then the people of Leonida, then seeing the whole state, then activities,
// then the underworld, then money and choices, then the clean-up.
export const ROADMAP_STAGES = [
  { stage: 1, title: 'Stage 1 — Play the story', blurb: 'Chapters 1 to 4, the final mission and the story missions in between. Nothing here can be missed: just play, and these twelve pop as you go.' },
  { stage: 2, title: 'Stage 2 — Strangers & contacts', blurb: 'The people of Leonida: eight stranger strands and the final mission of each contact — Andy, Kenton, Billy, Randy and Tyrone — plus Bret\u2019s hunt. Do these as they appear; a strand finished is a strand done.' },
  { stage: 3, title: 'Stage 3 — See all of Leonida', blurb: 'Exploration and collecting: all 52 areas, the meditation spots, the card sets, the WAiNK It locations, the vehicles to discover, the garages to buy and the Scooter Bros registrations. Work region by region so nothing is left at the end.' },
  { stage: 4, title: 'Stage 4 — Activities & challenges', blurb: 'The things to do: stunts, every activity type once, the 42 Shooting Range challenges, drone races, races, fishing, the arcade, bowling, the 50 challenges and the melee drive-by.' },
  { stage: 5, title: 'Stage 5 — Heists & the underworld', blurb: 'The robberies: jewelry stores, bank vaults, armored trucks, one illegal operation per gang — and the two one-off moments at the airport and the showroom. Do the flagged ones when they come up.' },
  { stage: 6, title: 'Stage 6 — Money, partners & choices', blurb: 'The partner trophies, the choice counter, the rare event, and the money: $250,000 of Marked Bills laundered and $100,000 spent. These build across the whole game; the flagged ones need their moment.' },
  { stage: 7, title: 'Stage 7 — Clean-up & the platinum', blurb: '100% Completion, then the platinum pops on its own. Check the tracker for what is left and finish it stage by stage.' },
];

export const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
export const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
