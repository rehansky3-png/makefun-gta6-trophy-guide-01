// Boot: load the trophies, wire the controls, render every view.
//
// State lives in one object: the earned set (localStorage, via store.js),
// the kind and grade filters, the search text, spoiler mode, and the
// selected trophy. Every change re-renders the views that depend on it.

import { KINDS, loadTrophies } from './data.js';
import { exportProgress, importProgress, loadProgress, toggleEarned } from './store.js';
import { renderChecklist, renderDetail, renderMissables, renderNextUp, renderProgress, renderRoadmap } from './views.js';

const state = {
  earned: loadProgress(),
  kind: 'all',
  grade: 'all',
  query: '',
  earnedOnly: false,
  spoilerOn: true,
  selectedId: null,
};

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('list-empty');
const detailEl = document.getElementById('detail-panel');
const roadmapEl = document.getElementById('roadmap');
const missableEl = document.getElementById('missable-list');
const nextEl = document.getElementById('next-list');

let trophies = [];

function renderAll() {
  renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
  renderDetail(detailEl, trophies, state, toggleTrophy);
  renderRoadmap(roadmapEl, trophies, state.earned);
  renderMissables(missableEl, trophies);
  renderNextUp(nextEl, trophies, state.earned);
  renderProgress(trophies, state.earned);
}

function selectTrophy(id) {
  state.selectedId = id;
  renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
  renderDetail(detailEl, trophies, state, toggleTrophy);
}

function toggleTrophy(id) {
  state.earned = toggleEarned(state.earned, id);
  renderAll();
}

function buildKindChips() {
  const chipsEl = document.getElementById('kind-chips');
  const kinds = [{ value: 'all', label: 'All' }, { value: 'missable', label: 'Missable' }, ...KINDS.map((kind) => ({ value: kind, label: kind.charAt(0).toUpperCase() + kind.slice(1) }))];
  chipsEl.innerHTML = kinds.map(({ value, label }) =>
    `<button type="button" class="chip${state.kind === value ? ' active' : ''}" data-kind="${value}">${label}</button>`).join('');
  chipsEl.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      buildKindChips();
      renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
    });
  });
}

function wireControls() {
  document.getElementById('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
  });
  document.getElementById('earned-only').addEventListener('change', (event) => {
    state.earnedOnly = event.target.checked;
    renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
  });
  document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
    state.spoilerOn = event.target.checked;
    renderChecklist(listEl, emptyEl, trophies, state, selectTrophy, toggleTrophy);
    renderDetail(detailEl, trophies, state, toggleTrophy);
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(state.earned));
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;
    try {
      state.earned = await importProgress(file);
      renderAll();
    } catch {
      alert('That file is not a Sunset Platinum progress export.');
    }
    importFile.value = '';
  });
  document.getElementById('tabs').querySelectorAll('button').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('#tabs button').forEach((other) => other.classList.toggle('active', other === tab));
      document.querySelectorAll('.tab-page').forEach((page) => page.classList.toggle('active', page.id === `tab-${tab.dataset.tab}`));
    });
  });
}

trophies = await loadTrophies();
buildKindChips();
wireControls();
renderAll();
