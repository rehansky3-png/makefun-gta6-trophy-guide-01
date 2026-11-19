// Filters and the spoiler rule: which trophies a view shows, and what a
// story trophy looks like before it is earned.
import { KIND_FILTERS } from './config.js';

export function kindLabel(kind) {
  const found = KIND_FILTERS.find((k) => k.id === kind);
  return found ? found.label : kind;
}

// A trophy passes the toolbar's filters: kind chip, grade, earned status,
// and the search box (name, description and guide).
export function filterTrophies(trophies, state) {
  const query = (state.query || '').trim().toLowerCase();
  return trophies.filter((t) => {
    if (state.kind === 'missable') {
      if (!t.missable) return false;
    } else if (state.kind !== 'all' && t.kind !== state.kind) {
      return false;
    }
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.status === 'earned' && !state.earned.has(t.id)) return false;
    if (state.status === 'remaining' && state.earned.has(t.id)) return false;
    if (query) {
      const haystack = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

// The spoiler rule: with spoilers hidden, a story trophy that is not earned
// yet shows no name, no description and no guide — only that it is a hidden
// story trophy. Earned story trophies always show in full.
export function isSpoilerHidden(trophy, earned, settings) {
  return settings.spoiler && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function displayName(trophy, earned, settings) {
  return isSpoilerHidden(trophy, earned, settings) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, earned, settings) {
  return isSpoilerHidden(trophy, earned, settings)
    ? 'A story trophy. Earn it to reveal its name and description.'
    : trophy.description;
}

// A short line for the Next up planner: why this trophy comes next.
export function nextUpReason(trophy) {
  if (trophy.kind === 'story') return 'Story — play the next chapter or mission.';
  if (trophy.missable) return 'Missable — do it when the moment comes.';
  if (trophy.kind === 'side') return 'Strangers & contacts — finish the strand.';
  if (trophy.kind === 'collectibles') return 'Collecting — pick it up while exploring.';
  if (trophy.kind === 'activities') return 'Activities — try it when you are nearby.';
  if (trophy.kind === 'money') return 'Money — it builds across the game.';
  if (trophy.kind === 'completion') return '100% — the last thing to do.';
  if (trophy.kind === 'platinum') return 'The platinum — it pops on its own.';
  return 'World — do it when the chance comes.';
}
