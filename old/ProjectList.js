import { h, pad2 } from '../lib/dom.js';
import { ProjectFeature } from './ProjectFeature.js';
import { ProjectRow } from './ProjectRow.js';

const LAYOUTS = ['open', 'collapsed'];
const STATUSES = ['live', 'in-progress', 'archive'];

/** Warn (don't crash) about data mistakes so a typo can't blank the page. */
function check(projects) {
  const seen = new Set();
  projects.forEach((p, i) => {
    if (!p.id || !p.title) console.warn(`projects[${i}]: needs an id and a title`, p);
    if (seen.has(p.id)) console.warn(`projects[${i}]: duplicate id "${p.id}"`);
    seen.add(p.id);
    if (!LAYOUTS.includes(p.layout)) console.warn(`${p.id}: unknown layout "${p.layout}", using "collapsed"`);
    if (!STATUSES.includes(p.status)) console.warn(`${p.id}: unknown status "${p.status}"`);
  });
}

/** The whole Work section, rendered from the projects array. */
export function ProjectList(projects) {
  check(projects);
  return h(
    'div',
    { class: 'section__inner container' },
    h(
      'h2',
      { class: 'section__title', id: 'work-title' },
      'Work',
      h('span', { class: 'section__count', 'aria-hidden': 'true' }, pad2(projects.length))
    ),
    h(
      'ol',
      { class: 'work-list' },
      projects.map((p, i) =>
        h(
          'li',
          { class: 'work-list__item' },
          p.layout === 'open' ? ProjectFeature(p, i) : ProjectRow(p, i)
        )
      )
    )
  );
}
