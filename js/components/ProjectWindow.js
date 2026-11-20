import { h, tagList, statusBadge, linkList } from '../lib/dom.js';
import { ProjectMedia } from './ProjectFeature.js';
import { SpecCard } from './SpecCard.js';

/**
 * One project in a window: media, summary, note, tags, links, spec rows.
 * Same content as ProjectFeature, but one fixed single-column layout
 * (the legacy open/collapsed `layout` field doesn't apply in a window).
 */
export function ProjectWindow(project) {
  return h(
    'article',
    { class: 'win-project', dataset: { status: project.status ?? '' } },
    statusBadge(project.status),
    ProjectMedia(project),
    project.summary ? h('p', { class: 'feature__summary' }, project.summary) : null,
    project.note
      ? h('p', { class: 'note' }, h('span', { class: 'note__label' }, 'Note'), project.note)
      : null,
    tagList(project.tags),
    linkList(project.spec?.links, 'link-list link-list--row'),
    SpecCard(project.spec, { showLinks: false })
  );
}
