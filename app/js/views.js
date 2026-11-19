// Views: every screen of the guide, rendered from the trophy list and
// the earned set. All text comes from data/trophies.json; nothing here
// invents a trophy, a count or a location.

import { ROADMAP_STAGES } from './data.js';
import { applyFilters, displayDescription, displayName, isSpoilerHidden } from './filters.js';

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function tagHtml(trophy) {
  const tags = [`<span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span>`, `<span class="tag">${kindLabel(trophy.kind)}</span>`];
  if (trophy.count) tags.push(`<span class="tag">Target: ${trophy.count.toLocaleString('en-US')}</span>`);
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  return tags.join('');
}

export function renderChecklist(listEl, emptyEl, trophies, state, onSelect, onToggle) {
  const shown = applyFilters(trophies, state);
  emptyEl.hidden = shown.length > 0;
  listEl.innerHTML = shown.map((trophy) => {
    const earned = state.earned.has(trophy.id);
    const hidden = isSpoilerHidden(trophy, state.spoilerOn, state.earned);
    return `<li class="trophy-row${earned ? ' earned' : ''}${state.selectedId === trophy.id ? ' selected' : ''}" data-id="${trophy.id}">
      <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${hidden ? 'hidden story trophy' : trophy.name} earned">
      <span class="medal ${trophy.grade}" title="${gradeLabel(trophy.grade)}"></span>
      <span class="trophy-body">
        <span class="trophy-name">${displayName(trophy, state.spoilerOn, state.earned)}</span><br>
        <span class="trophy-desc">${displayDescription(trophy, state.spoilerOn, state.earned)}</span>
        <span class="trophy-tags">${tagHtml(trophy)}</span>
      </span>
    </li>`;
  }).join('');
  listEl.querySelectorAll('.trophy-row').forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener('click', (event) => {
      if (event.target.type === 'checkbox') {
        onToggle(id);
      } else {
        onSelect(id);
      }
    });
  });
}

export function renderDetail(panelEl, trophies, state, onToggle) {
  const trophy = trophies.find((item) => item.id === state.selectedId);
  if (!trophy) {
    panelEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide, its sources and — where it applies — its missable warning.</p>';
    return;
  }
  const earned = state.earned.has(trophy.id);
  const hidden = isSpoilerHidden(trophy, state.spoilerOn, state.earned);
  panelEl.innerHTML = `
    <h2>${displayName(trophy, state.spoilerOn, state.earned)}</h2>
    <p class="official">${displayDescription(trophy, state.spoilerOn, state.earned)}</p>
    <p>${tagHtml(trophy)}</p>
    ${hidden ? '' : `<h3>Guide</h3><p>${trophy.guide}</p>`}
    ${trophy.missable && trophy.missable_note ? `<div class="missable-note"><strong>Missable.</strong> ${trophy.missable_note}</div>` : ''}
    ${hidden ? '' : `<h3>Roadmap</h3><p>Stage ${trophy.stage} of 7 — ${ROADMAP_STAGES[trophy.stage - 1].title}.</p>`}
    <p><button type="button" class="mark-btn">${earned ? 'Mark as not earned' : 'Mark as earned'}</button></p>
    ${hidden ? '' : `<p class="sources">Sources: ${trophy.sources}</p>`}
  `;
  panelEl.querySelector('.mark-btn').addEventListener('click', () => onToggle(trophy.id));
}

export function renderRoadmap(roadmapEl, trophies, earned) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  roadmapEl.innerHTML = ROADMAP_STAGES.map((stage) => {
    const items = stage.ids.map((id) => byId.get(id)).filter(Boolean);
    const done = items.filter((trophy) => earned.has(trophy.id)).length;
    const pct = items.length ? Math.round((done / items.length) * 100) : 0;
    return `<div class="stage">
      <h3>Stage ${stage.n} — ${stage.title} <span class="tag">${done}/${items.length}</span></h3>
      <p>${stage.text}</p>
      <div class="stage-bar"><div class="stage-fill" style="width:${pct}%"></div></div>
      <ul class="stage-trophies">
        ${items.map((trophy) => `<li class="${earned.has(trophy.id) ? 'done' : ''}">${trophy.missable ? '⚠ ' : ''}${trophy.name} — ${gradeLabel(trophy.grade)}${trophy.count ? ` · target ${trophy.count.toLocaleString('en-US')}` : ''}</li>`).join('')}
      </ul>
    </div>`;
  }).join('');
}

export function renderMissables(listEl, trophies) {
  const flagged = trophies.filter((trophy) => trophy.missable);
  listEl.innerHTML = flagged.map((trophy) => `
    <div class="stage">
      <h3>⚠ ${trophy.name} <span class="tag grade-${trophy.grade}">${gradeLabel(trophy.grade)}</span></h3>
      <p class="official">${trophy.description}</p>
      <p>${trophy.guide}</p>
      <div class="missable-note">${trophy.missable_note || ''}</div>
    </div>`).join('');
}

export function renderNextUp(listEl, trophies, earned) {
  const stageOf = new Map();
  ROADMAP_STAGES.forEach((stage) => stage.ids.forEach((id) => stageOf.set(id, stage.n)));
  const next = trophies
    .filter((trophy) => !earned.has(trophy.id))
    .sort((a, b) => (stageOf.get(a.id) - stageOf.get(b.id)) || (a.id - b.id))
    .slice(0, 5);
  if (next.length === 0) {
    listEl.innerHTML = '<li>Everything is earned — the platinum is yours. Leonida Legend.</li>';
    return;
  }
  listEl.innerHTML = next.map((trophy) => `
    <li>
      <span class="next-name">${trophy.name}</span> — ${gradeLabel(trophy.grade)} · Stage ${stageOf.get(trophy.id)} (${ROADMAP_STAGES[stageOf.get(trophy.id) - 1].title})
      <div class="next-why">${trophy.missable ? 'Missable — do it when you see it. ' : ''}${trophy.description}</div>
    </li>`).join('');
}

export function renderProgress(trophies, earned) {
  const countEl = document.getElementById('earned-count');
  const fillEl = document.getElementById('progress-fill');
  const noteEl = document.getElementById('progress-note');
  const pct = Math.round((earned.size / trophies.length) * 100);
  countEl.textContent = String(earned.size);
  fillEl.style.width = `${pct}%`;
  noteEl.textContent = earned.size === trophies.length
    ? 'All 55 earned — the platinum is yours.'
    : earned.size === 0
      ? 'Your progress is saved in this browser only.'
      : `${trophies.length - earned.size} to go — the next one is on the Next up tab.`;
}
