import { h, pad2, tagList, statusBadge } from '../lib/dom.js';
import { SpecCard } from './SpecCard.js';
import { ProjectMedia } from './ProjectFeature.js';

/** layout: 'collapsed'. Numbered row; click expands into a spec card. */
export function ProjectRow(project, index) {
  const panelId = `panel-${project.id}`;
  const buttonId = `row-${project.id}`;

  const button = h(
    'button',
    { type: 'button', class: 'row__button', id: buttonId, 'aria-expanded': false, 'aria-controls': panelId },
    h('span', { class: 'num', 'aria-hidden': 'true' }, pad2(index + 1)),
    h('span', { class: 'row__title' }, project.title),
    statusBadge(project.status),
    h('span', { class: 'row__tags' }, tagList(project.tags)),
    h('span', { class: 'row__icon', 'aria-hidden': 'true' })
  );

  const panel = h(
    'div',
    { class: 'row__panel', id: panelId, role: 'region', 'aria-labelledby': buttonId, hidden: true },
    project.summary ? h('p', { class: 'row__summary' }, project.summary) : null,
    ProjectMedia(project),
    SpecCard(project.spec)
  );

  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });

  return h(
    'article',
    { class: 'row', id: `project-${project.id}`, dataset: { status: project.status } },
    h('h3', { class: 'row__heading' }, button),
    panel
  );
}
