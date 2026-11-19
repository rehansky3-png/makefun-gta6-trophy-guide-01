// Progress store: the earned set lives in localStorage, and can be
// exported to a file and imported back. Nothing leaves the browser.

const STORAGE_KEY = 'sunset-platinum-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function toggleEarned(earned, id) {
  const next = new Set(earned);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  saveProgress(next);
  return next;
}

export function exportProgress(earned) {
  const blob = new Blob(
    [JSON.stringify({ app: 'sunset-platinum', version: 1, earned: [...earned].sort((a, b) => a - b) }, null, 2)],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sunset-platinum-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importProgress(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = parsed && Array.isArray(parsed.earned) ? parsed.earned : parsed;
  if (!Array.isArray(earned)) throw new Error('not a progress file');
  const next = new Set(earned.filter((id) => Number.isInteger(id)));
  saveProgress(next);
  return next;
}
