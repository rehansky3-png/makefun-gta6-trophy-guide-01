// Views: the five tabs of the guide — Tracker, Roadmap, Missables, Next up
// and Settings. Every view is plain DOM built from the trophy data; nothing
// here fetches the network.
import { KIND_FILTERS, ROADMAP_STAGES, GRADE_LABELS } from './config.js';
import { trophyList, missableTrophies, sourceLines, roadmapOrder } from './data.js';
import { filterTrophies, isSpoilerHidden, displayName, displayDescription, nextUpReason, kindLabel } from './filters.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function medalSpan(grade) {
  const span = el('span', `medal ${grade}`);
  span.title = GRADE_LABELS[grade];
  return span;
}

function tagSpan(text, extraClass) {
  return el('span', `tag${extraClass ? ' ' + extraClass : ''}`, text);
}

function targetLine(trophy) {
  if (trophy.target === undefined) return null;
  const unit = trophy.target >= 1000 ? `$${trophy.target.toLocaleString('en-US')}` : String(trophy.target);
  return el('div', 'target-note', `PSN target: ${unit}`);
}

// One row of the checklist: a tick box, a medal, the name and description,
// and the tags that say what kind of trophy it is.
function trophyRow(trophy, ctx) {
  const { earned, settings, selectedId } = ctx;
  const hidden = isSpoilerHidden(trophy, earned, settings);
  const row = el('button', 'trophy' + (earned.has(trophy.id) ? ' earned' : '') + (selectedId === trophy.id ? ' selected' : ''));
  row.type = 'button';
  row.addEventListener('click', () => ctx.onSelect(trophy.id));

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => ctx.onToggle(trophy.id, box.checked));
  row.append(box);
  row.append(medalSpan(trophy.grade));

  const body = el('div');
  const name = el('div', 'trophy-name' + (earned.has(trophy.id) ? ' earned-name' : ''), displayName(trophy, earned, settings));
  body.append(name);
  body.append(el('div', 'trophy-desc', displayDescription(trophy, earned, settings)));
  const tags = el('div', 'tags');
  tags.append(tagSpan(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
  tags.append(tagSpan(kindLabel(trophy.kind)));
  if (trophy.missable) tags.append(tagSpan('Missable', 'missable'));
  if (trophy.hidden) tags.append(tagSpan('Hidden on PSN'));
  body.append(tags);
  const target = targetLine(trophy);
  if (target) body.append(target);
  row.append(body);

  const side = el('div');
  side.append(el('div', 'target-note', hidden ? '' : `#${trophy.id}`));
  row.append(side);
  return row;
}

// The detail pane: the selected trophy's official description, its guide,
// its sources, its missable warning and a place for a personal note.
function detailPane(trophy, ctx) {
  const { earned, notes, settings } = ctx;
  const pane = el('aside', 'detail');
  if (!trophy) {
    pane.append(el('p', null, 'Pick a trophy to see its guide.'));
    return pane;
  }
  const hidden = isSpoilerHidden(trophy, earned, settings);
  pane.append(medalSpan(trophy.grade));
  pane.append(el('h3', null, displayName(trophy, earned, settings)));
  const official = el('p', 'official');
  official.innerHTML = '';
  const gradeStrong = el('strong', null, GRADE_LABELS[trophy.grade]);
  official.append(gradeStrong, document.createTextNode(' · ' + (hidden ? 'Story trophy' : kindLabel(trophy.kind))));
  pane.append(official);
  pane.append(el('p', null, displayDescription(trophy, earned, settings)));
  const target = targetLine(trophy);
  if (target) pane.append(target);

  if (hidden) {
    const box = el('div', 'spoiler-box', 'Spoilers are hidden. Tick this trophy off when you earn it and its name, description and guide will show here.');
    pane.append(box);
  } else {
    pane.append(el('h4', null, 'Guide'));
    pane.append(el('p', null, trophy.guide));
    if (trophy.missable && trophy.note) {
      pane.append(el('div', 'missable-note', 'Missable — ' + trophy.note + ' Flagged from the official description; we have not checked in the game whether it can be repeated.'));
    }
    pane.append(el('h4', null, 'Sources'));
    const list = el('ul', 'sources');
    for (const line of sourceLines(ctx.doc, trophy)) {
      list.append(el('li', null, line));
    }
    pane.append(list);
    pane.append(el('h4', null, 'Your note'));
    const noteBox = document.createElement('textarea');
    noteBox.className = 'note-box';
    noteBox.placeholder = 'Your own note — where you found it, what worked…';
    noteBox.value = notes[trophy.id] || '';
    noteBox.addEventListener('change', () => ctx.onNote(trophy.id, noteBox.value));
    pane.append(noteBox);
  }

  const actions = el('div', 'detail-actions');
  const toggle = el('button', 'btn primary', earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned');
  toggle.type = 'button';
  toggle.addEventListener('click', () => ctx.onToggle(trophy.id, !earned.has(trophy.id)));
  actions.append(toggle);
  pane.append(actions);
  return pane;
}

// The Tracker: toolbar (search, kind chips, grade and status, the spoiler
// switch, export and import) over the checklist and its detail pane.
export function renderTracker(view, ctx) {
  const { doc, filterState } = ctx;
  view.replaceChildren();

  const heading = el('h2', null, 'Trophy checklist');
  view.append(heading);
  view.append(el('p', 'lede', 'Every one of the 55 official trophies. Tick one off when you earn it — your progress is saved in this browser. Use the spoiler switch to hide story trophies until you earn them.'));

  const toolbar = el('div', 'toolbar');
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search trophies…  ( / )';
  search.value = filterState.query;
  search.setAttribute('aria-label', 'Search trophies');
  search.addEventListener('input', () => ctx.onFilterChange({ query: search.value }));
  toolbar.append(search);

  const chips = el('div', 'chips');
  for (const kind of KIND_FILTERS) {
    const chip = el('button', 'chip' + (filterState.kind === kind.id ? ' active' : ''), kind.label);
    chip.type = 'button';
    chip.addEventListener('click', () => ctx.onFilterChange({ kind: kind.id }));
    chips.append(chip);
  }
  toolbar.append(chips);

  const gradeSelect = document.createElement('select');
  gradeSelect.setAttribute('aria-label', 'Filter by grade');
  for (const [value, label] of [['all', 'All grades'], ['platinum', 'Platinum'], ['gold', 'Gold'], ['silver', 'Silver'], ['bronze', 'Bronze']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (filterState.grade === value) option.selected = true;
    gradeSelect.append(option);
  }
  gradeSelect.addEventListener('change', () => ctx.onFilterChange({ grade: gradeSelect.value }));
  toolbar.append(gradeSelect);

  const statusSelect = document.createElement('select');
  statusSelect.setAttribute('aria-label', 'Filter by earned status');
  for (const [value, label] of [['all', 'All'], ['remaining', 'Still to earn'], ['earned', 'Earned']]) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (filterState.status === value) option.selected = true;
    statusSelect.append(option);
  }
  statusSelect.addEventListener('change', () => ctx.onFilterChange({ status: statusSelect.value }));
  toolbar.append(statusSelect);

  const spoilerLabel = el('label', 'toggle');
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = ctx.settings.spoiler;
  spoilerBox.addEventListener('change', () => ctx.onSpoilerToggle(spoilerBox.checked));
  spoilerLabel.append(spoilerBox, document.createTextNode('Hide story spoilers'));
  toolbar.append(spoilerLabel);

  const exportBtn = el('button', 'btn', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => ctx.onExport());
  toolbar.append(exportBtn);

  const importLabel = el('label', 'btn import-label', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', () => {
    if (importInput.files[0]) ctx.onImport(importInput.files[0]);
    importInput.value = '';
  });
  importLabel.append(importInput);
  toolbar.append(importLabel);
  view.append(toolbar);

  const filtered = filterTrophies(trophyList(doc), { ...filterState, earned: ctx.earned });
  view.append(el('p', 'result-line', `Showing ${filtered.length} of 55 trophies · ${ctx.earned.size} earned`));

  const split = el('div', 'split');
  const list = el('div', 'trophy-list');
  if (filtered.length === 0) {
    list.append(el('div', 'empty', 'No trophies match those filters. Clear the search or pick another kind.'));
  }
  for (const trophy of filtered) list.append(trophyRow(trophy, ctx));
  split.append(list);

  const selected = ctx.doc.trophies.find((t) => t.id === ctx.selectedId) || filtered[0] || null;
  split.append(detailPane(selected, ctx));
  view.append(split);
}

// The Roadmap: seven stages in the order to play them, each with its own
// progress bar and its trophies as chips.
export function renderRoadmap(view, ctx) {
  const { doc, earned } = ctx;
  view.replaceChildren();
  view.append(el('h2', null, 'Roadmap to the platinum'));
  view.append(el('p', 'lede', 'The order to earn them in, built from the official descriptions: story first, then the people of Leonida, then the whole state, then the activities, the underworld, the money — and the clean-up last. A stage\u2019s bar fills as you tick its trophies off.'));

  for (const stage of ROADMAP_STAGES) {
    const stageTrophies = trophyList(doc).filter((t) => t.stage === stage.stage);
    const done = stageTrophies.filter((t) => earned.has(t.id)).length;
    const card = el('section', 'stage');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, stage.title));
    head.append(el('span', 'stage-count', `${done} / ${stageTrophies.length} earned`));
    card.append(head);
    card.append(el('p', null, stage.blurb));
    const bar = el('div', 'bar');
    const fill = el('span');
    fill.style.width = `${stageTrophies.length ? Math.round((done / stageTrophies.length) * 100) : 0}%`;
    bar.append(fill);
    card.append(bar);
    const chips = el('div', 'stage-trophies');
    for (const trophy of stageTrophies) {
      const chip = el('button', 'stage-trophy' + (earned.has(trophy.id) ? ' done' : '') + (trophy.missable ? ' miss' : ''), (earned.has(trophy.id) ? '✓ ' : '') + (isSpoilerHidden(trophy, earned, ctx.settings) ? 'Hidden story trophy' : trophy.name) + (trophy.missable ? ' ⚠' : ''));
      chip.type = 'button';
      chip.addEventListener('click', () => ctx.onOpenTrophy(trophy.id));
      chips.append(chip);
    }
    card.append(chips);
    view.append(card);
  }
}

// The Missables page: the eight trophies tied to a one-off moment, each with
// the reason it is flagged — and the honest note that the flag comes from
// the official description, not from playing the game.
export function renderMissables(view, ctx) {
  const { doc, earned } = ctx;
  view.replaceChildren();
  view.append(el('h2', null, 'Missable trophies'));
  view.append(el('p', 'lede', 'Eight trophies tied to a moment that may not come back. Nothing here is confirmed missable in the game — each flag comes from the official description, and the note under each one says so. Do them when the moment comes.'));
  const banner = el('div', 'warn-banner', 'How to use this page: play the story with these eight in mind. If a moment on this page comes up — a partner beside you, the airport, a showroom, a choice — do it there and then, rather than assuming you can come back to it.');
  view.append(banner);

  for (const trophy of missableTrophies(doc)) {
    const card = el('article', 'miss-card');
    const head = el('div', 'stage-head');
    head.append(el('h3', null, trophy.name));
    head.append(el('span', 'stage-count', earned.has(trophy.id) ? '✓ Earned' : GRADE_LABELS[trophy.grade]));
    card.append(head);
    card.append(el('p', 'why', 'Why it is flagged: ' + (trophy.note || 'tied to a one-off moment.')));
    card.append(el('p', null, trophy.description));
    card.append(el('p', null, trophy.guide));
    const actions = el('div', 'detail-actions');
    const open = el('button', 'btn', 'Open its guide');
    open.type = 'button';
    open.addEventListener('click', () => ctx.onOpenTrophy(trophy.id));
    actions.append(open);
    const toggle = el('button', 'btn primary', earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned');
    toggle.type = 'button';
    toggle.addEventListener('click', () => ctx.onToggle(trophy.id, !earned.has(trophy.id)));
    actions.append(toggle);
    card.append(actions);
    view.append(card);
  }
}

// Next up: the next trophies to earn, in roadmap order — the planner for
// your next session.
export function renderNextUp(view, ctx) {
  const { doc, earned } = ctx;
  view.replaceChildren();
  view.append(el('h2', null, 'Next up'));
  view.append(el('p', 'lede', 'Your next session, planned: the trophies you have not earned yet, in roadmap order. Earn the top one first and work down — the list re-sorts itself as you tick things off.'));
  const ordered = roadmapOrder(doc, earned).filter((t) => !earned.has(t.id));
  if (ordered.length === 0) {
    view.append(el('div', 'empty', 'That is everything — all 55 trophies earned. The platinum is yours, Leonida Legend.'));
    return;
  }
  const list = el('div', 'next-list');
  ordered.slice(0, 12).forEach((trophy, index) => {
    const item = el('button', 'next-item');
    item.type = 'button';
    item.addEventListener('click', () => ctx.onOpenTrophy(trophy.id));
    item.append(el('span', 'next-num', String(index + 1)));
    const body = el('div');
    body.append(el('div', 'trophy-name', isSpoilerHidden(trophy, earned, ctx.settings) ? 'Hidden story trophy' : trophy.name));
    body.append(el('div', 'why', nextUpReason(trophy) + (trophy.missable ? ' Missable — do it when the moment comes.' : '')));
    item.append(body);
    item.append(tagSpan(GRADE_LABELS[trophy.grade], `grade-${trophy.grade}`));
    list.append(item);
  });
  view.append(list);
  view.append(el('p', 'result-line', `${ordered.length} trophies still to earn · showing the next 12`));
}

// Settings: the spoiler switch, the theme, the save file and the sources.
export function renderSettings(view, ctx) {
  const { doc, settings } = ctx;
  view.replaceChildren();
  view.append(el('h2', null, 'Settings & sources'));
  view.append(el('p', 'lede', 'How the guide behaves, your save file, and where every fact in it comes from.'));

  const grid = el('div', 'settings-grid');
  const prefs = el('section', 'settings-card');
  prefs.append(el('h3', null, 'Preferences'));
  const spoilerRow = el('div', 'switch-row');
  spoilerRow.append(el('span', null, 'Hide story spoilers until earned'));
  const spoilerBox = document.createElement('input');
  spoilerBox.type = 'checkbox';
  spoilerBox.checked = settings.spoiler;
  spoilerBox.addEventListener('change', () => ctx.onSpoilerToggle(spoilerBox.checked));
  spoilerRow.append(spoilerBox);
  prefs.append(spoilerRow);
  const themeRow = el('div', 'switch-row');
  themeRow.append(el('span', null, 'Light paper theme'));
  const themeBox = document.createElement('input');
  themeBox.type = 'checkbox';
  themeBox.checked = settings.theme === 'paper';
  themeBox.addEventListener('change', () => ctx.onThemeToggle(themeBox.checked ? 'paper' : 'night'));
  themeRow.append(themeBox);
  prefs.append(themeRow);
  prefs.append(el('p', null, 'Spoilers hide a story trophy\u2019s name, description and guide until you tick it off. The theme is yours: night by default, paper if you prefer it light.'));
  grid.append(prefs);

  const save = el('section', 'settings-card');
  save.append(el('h3', null, 'Your save'));
  save.append(el('p', null, `${ctx.earned.size} of 55 trophies earned, ${Object.keys(ctx.notes).length} personal notes. Your progress lives in this browser\u2019s localStorage; export it to a file to keep a copy or move it to another browser.`));
  const row = el('div', 'row');
  const exportBtn = el('button', 'btn primary', 'Export progress');
  exportBtn.type = 'button';
  exportBtn.addEventListener('click', () => ctx.onExport());
  row.append(exportBtn);
  const importLabel = el('label', 'btn import-label', 'Import progress');
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = 'application/json,.json';
  importInput.addEventListener('change', () => {
    if (importInput.files[0]) ctx.onImport(importInput.files[0]);
    importInput.value = '';
  });
  importLabel.append(importInput);
  row.append(importLabel);
  const resetBtn = el('button', 'btn danger', 'Reset everything');
  resetBtn.type = 'button';
  resetBtn.addEventListener('click', () => {
    if (window.confirm('Reset all progress, notes and settings?')) ctx.onReset();
  });
  row.append(resetBtn);
  save.append(row);
  grid.append(save);

  const sources = el('section', 'settings-card');
  sources.append(el('h3', null, 'Sources'));
  const list = el('ul');
  list.append(el('li', null, doc.sources.exophase));
  list.append(el('li', null, doc.sources.psnprofiles));
  list.append(el('li', null, doc.sources.advice));
  sources.append(list);
  sources.append(el('p', null, 'The official trophy names and descriptions are shown as PlayStation publishes them. Everything else is our own words: a source is cited, never copied.'));
  grid.append(sources);

  const about = el('section', 'settings-card');
  about.append(el('h3', null, 'About this guide'));
  about.append(el('p', null, 'Sunset Platinum is a free, open-source, offline guide for Grand Theft Auto VI on PlayStation 5: 55 trophies — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned. It loads nothing over the network and keeps your progress in your own browser.'));
  about.append(el('p', null, 'Keyboard: press / to search, and use the tabs to move between the checklist, the roadmap, the missables and the planner.'));
  grid.append(about);

  view.append(grid);
}
