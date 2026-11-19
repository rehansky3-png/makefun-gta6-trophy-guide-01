// Filters and the spoiler rule.
//
// applyFilters takes the trophy list and the current settings and returns
// the trophies the checklist should show. matchesKind is the kind test
// (missable is its own filter, not a kind). isSpoilerHidden is the spoiler
// rule: with spoiler mode on, a story trophy that is not earned yet shows
// neither its name nor its description.

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  return trophy.kind === kind;
}

export function applyFilters(trophies, { kind, grade, query, earnedOnly, earned }) {
  const q = query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, kind)) return false;
    if (grade !== 'all' && trophy.grade !== grade) return false;
    if (earnedOnly && !earned.has(trophy.id)) return false;
    if (q && !trophy.name.toLowerCase().includes(q) && !trophy.description.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function isSpoilerHidden(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

export function displayName(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, spoilerOn, earned) {
  return isSpoilerHidden(trophy, spoilerOn, earned)
    ? 'Hidden until earned — tick it off to reveal its name and description.'
    : trophy.description;
}
