// Trophy data: loads app/data/trophies.json (same-origin, so it works offline)
// and turns it into the lists the views need.
import { GRADE_ORDER } from './config.js';

let cache = null;

export async function loadTrophyData() {
  if (cache) return cache;
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('Could not load data/trophies.json');
  const doc = await response.json();
  cache = doc;
  return doc;
}

export function trophyList(doc) {
  return doc.trophies.slice().sort((a, b) => a.id - b.id);
}

export function trophyById(doc, id) {
  return doc.trophies.find((t) => t.id === id) || null;
}

export function gradeCounts(doc, earned) {
  const counts = {};
  for (const grade of GRADE_ORDER) counts[grade] = 0;
  for (const t of doc.trophies) if (earned.has(t.id)) counts[t.grade] += 1;
  return counts;
}

export function missableTrophies(doc) {
  return trophyList(doc).filter((t) => t.missable);
}

export function storyTrophies(doc) {
  return trophyList(doc).filter((t) => t.kind === 'story');
}

// The source lines a trophy's detail pane shows, expanded from its src keys.
export function sourceLines(doc, trophy) {
  const lines = [];
  const src = trophy.src || ['exophase'];
  if (src.includes('exophase')) lines.push('Official name, description & grade: ' + doc.sources.exophase);
  if (src.includes('psnprofiles')) lines.push('PSN progress target: ' + doc.sources.psnprofiles);
  if (src.includes('advice')) lines.push('Guide advice: ' + doc.sources.advice);
  return lines;
}

// The roadmap order: stage by stage, trophy by trophy, unearned first
// inside each stage — the order the Next up planner walks.
export function roadmapOrder(doc, earned) {
  const list = trophyList(doc);
  const byStage = new Map();
  for (const t of list) {
    if (!byStage.has(t.stage)) byStage.set(t.stage, []);
    byStage.get(t.stage).push(t);
  }
  const ordered = [];
  for (const stage of [...byStage.keys()].sort((a, b) => a - b)) {
    const stageTrophies = byStage.get(stage).slice().sort((a, b) => a.id - b.id);
    for (const t of stageTrophies) if (!earned.has(t.id)) ordered.push(t);
    for (const t of stageTrophies) if (earned.has(t.id)) ordered.push(t);
  }
  return ordered;
}
