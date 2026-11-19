// Sunset Platinum — boot, routing and wiring. The state is small: the
// trophy list, the earned set, personal notes, settings, the toolbar's
// filters and the selected trophy. Every change re-renders the current tab.
import { TOTAL_TROPHIES, GRADE_LABELS } from './config.js';
import { loadTrophyData, gradeCounts } from './data.js';
import { loadProgress, saveProgress, loadNotes, saveNote, loadSettings, saveSettings, resetAll, exportProgress, importProgress } from './store.js';
import { renderTracker, renderRoadmap, renderMissables, renderNextUp, renderSettings } from './views.js';

const view = document.getElementById('view');
const tabs = [...document.querySelectorAll('.tab')];
const ROUTES = ['tracker', 'roadmap', 'missables', 'next', 'settings'];

const state = {
  doc: null,
  earned: loadProgress(),
  notes: loadNotes(),
  settings: loadSettings(),
  route: 'tracker',
  selectedId: null,
  filterState: { kind: 'all', grade: 'all', status: 'all', query: '' },
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return ROUTES.includes(hash) ? hash : 'tracker';
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.settings.theme);
}

// The header's progress ring and grade counts, kept in step with the save.
function renderProgress() {
  const total = state.doc ? state.doc.trophies.length : TOTAL_TROPHIES;
  const ring = document.getElementById('ringFg');
  const circumference = 326.7;
  ring.style.strokeDashoffset = String(circumference * (1 - state.earned.size / total));
  document.getElementById('progressCount').textContent = `${state.earned.size} / ${total}`;
  const counts = state.doc ? gradeCounts(state.doc, state.earned) : {};
  document.getElementById('gradeCounts').textContent = Object.keys(GRADE_LABELS)
    .map((grade) => `${counts[grade] || 0} ${GRADE_LABELS[grade]}`)
    .join(' · ');
}

function render() {
  applyTheme();
  renderProgress();
  for (const tab of tabs) tab.classList.toggle('active', tab.dataset.route === state.route);
  const ctx = buildContext();
  if (state.route === 'roadmap') renderRoadmap(view, ctx);
  else if (state.route === 'missables') renderMissables(view, ctx);
  else if (state.route === 'next') renderNextUp(view, ctx);
  else if (state.route === 'settings') renderSettings(view, ctx);
  else renderTracker(view, ctx);
}

function buildContext() {
  return {
    doc: state.doc,
    earned: state.earned,
    notes: state.notes,
    settings: state.settings,
    filterState: state.filterState,
    selectedId: state.selectedId,
    onToggle: toggleEarned,
    onSelect: (id) => { state.selectedId = id; render(); },
    onOpenTrophy: (id) => {
      state.selectedId = id;
      state.route = 'tracker';
      window.location.hash = '#/tracker';
      render();
      view.scrollIntoView();
    },
    onFilterChange: (patch) => { Object.assign(state.filterState, patch); render(); },
    onSpoilerToggle: (on) => {
      state.settings = { ...state.settings, spoiler: on };
      saveSettings(state.settings);
      render();
    },
    onThemeToggle: (theme) => {
      state.settings = { ...state.settings, theme };
      saveSettings(state.settings);
      render();
    },
    onNote: (id, text) => { state.notes = saveNote(state.notes, id, text); },
    onExport: () => exportProgress(state.earned, state.notes, state.settings),
    onImport: async (file) => {
      try {
        const save = await importProgress(file);
        state.earned = save.earned;
        state.notes = save.notes;
        state.settings = { ...state.settings, ...save.settings };
        saveProgress(state.earned);
        saveSettings(state.settings);
        render();
        window.alert(`Imported ${state.earned.size} earned trophies.`);
      } catch (error) {
        window.alert(error.message);
      }
    },
    onReset: () => {
      resetAll();
      state.earned = new Set();
      state.notes = {};
      state.settings = loadSettings();
      state.selectedId = null;
      render();
    },
  };
}

function toggleEarned(id, earned) {
  if (earned) state.earned.add(id);
  else state.earned.delete(id);
  saveProgress(state.earned);
  render();
}

function go(route) {
  state.route = ROUTES.includes(route) ? route : 'tracker';
  window.location.hash = `#/${state.route}`;
  render();
}

for (const tab of tabs) {
  tab.addEventListener('click', () => go(tab.dataset.route));
}

window.addEventListener('hashchange', () => {
  state.route = currentRoute();
  render();
});

// Press / anywhere to jump to the search box.
document.addEventListener('keydown', (event) => {
  if (event.key !== '/' || event.target.matches('input, textarea, select')) return;
  event.preventDefault();
  if (state.route !== 'tracker') go('tracker');
  const search = view.querySelector('input[type="search"]');
  if (search) search.focus();
});

async function boot() {
  try {
    state.doc = await loadTrophyData();
  } catch (error) {
    view.replaceChildren();
    const message = document.createElement('p');
    message.textContent = 'The trophy list could not be loaded. Serve app/ over HTTP (node serve.ts) and reload.';
    view.append(message);
    return;
  }
  state.route = currentRoute();
  render();
}

boot();
