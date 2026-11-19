// Saved progress: earned trophies, personal notes and settings, kept in
// localStorage so the checklist survives closing the browser. Export writes
// the whole save as a file; import reads one back.
import { STORAGE_KEYS } from './config.js';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadProgress() {
  const ids = readJson(STORAGE_KEYS.progress, []);
  return new Set(Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : []);
}

export function saveProgress(earned) {
  writeJson(STORAGE_KEYS.progress, [...earned].sort((a, b) => a - b));
}

export function loadNotes() {
  const notes = readJson(STORAGE_KEYS.notes, {});
  return notes && typeof notes === 'object' ? notes : {};
}

export function saveNote(notes, id, text) {
  const next = { ...notes };
  if (text.trim()) next[id] = text;
  else delete next[id];
  writeJson(STORAGE_KEYS.notes, next);
  return next;
}

export function loadSettings() {
  const settings = readJson(STORAGE_KEYS.settings, {});
  return {
    spoiler: settings.spoiler !== false, // hide story spoilers until earned
    theme: settings.theme === 'paper' ? 'paper' : 'night',
  };
}

export function saveSettings(settings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function resetAll() {
  localStorage.removeItem(STORAGE_KEYS.progress);
  localStorage.removeItem(STORAGE_KEYS.notes);
  localStorage.removeItem(STORAGE_KEYS.settings);
}

// Export the whole save as a downloadable JSON file.
export function exportProgress(earned, notes, settings) {
  const save = {
    app: 'Sunset Platinum — GTA VI Trophy Guide & Tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
    notes,
    settings,
  };
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
  return save;
}

// Import a save file back. Returns { earned, notes, settings } or throws
// a plain-English error when the file is not one of ours.
export async function importProgress(file) {
  const text = await file.text();
  let save;
  try {
    save = JSON.parse(text);
  } catch {
    throw new Error('That file is not JSON.');
  }
  if (!save || typeof save !== 'object') throw new Error('That file is not a progress save.');
  const earned = Array.isArray(save.earned) ? save.earned : [];
  if (!earned.every((n) => Number.isInteger(n) && n >= 1 && n <= 55)) {
    throw new Error('That file has no earned trophies I recognise.');
  }
  return {
    earned: new Set(earned),
    notes: save.notes && typeof save.notes === 'object' ? save.notes : {},
    settings: save.settings && typeof save.settings === 'object' ? save.settings : {},
  };
}
