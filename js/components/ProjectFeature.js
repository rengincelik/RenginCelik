import { h, pad2, tagList, statusBadge, linkList, picture } from '../lib/dom.js';
import { EmbedFrame } from './EmbedFrame.js';
import { SpecCard } from './SpecCard.js';

/** Media area for a project; null when media.type is 'none' (or missing). */
export function ProjectMedia(project) {
  const media = project.media ?? { type: 'none' };
  if (media.type === 'embed') {
    return EmbedFrame({
      title: project.title,
      src: media.src,
      poster: media.poster,
      fullUrl: media.fullUrl,
      sandbox: media.sandbox,
    });
  }
  if (media.type === 'image') {
    return h('figure', { class: 'media' }, picture(media.src, media.alt));
  }
  return null;
}

/** layout: 'open'. Large block: media, summary, note, tags, links, spec rows. */
export function ProjectFeature(project, index) {
  return h(
    'article',
    { class: 'feature', id: `project-${project.id}`, dataset: { status: project.status } },
    h(
      'header',
      { class: 'feature__head' },
      h('span', { class: 'num', 'aria-hidden': 'true' }, pad2(index + 1)),
      h('h3', { class: 'feature__title' }, project.title),
      statusBadge(project.status)
    ),
    ProjectMedia(project),
    h(
      'div',
      { class: 'feature__body' },
      h(
        'div',
        { class: 'feature__main' },
        project.summary ? h('p', { class: 'feature__summary' }, project.summary) : null,
        project.note
          ? h('p', { class: 'note' }, h('span', { class: 'note__label' }, 'Note'), project.note)
          : null,
        tagList(project.tags),
        linkList(project.spec?.links, 'link-list link-list--row')
      ),
      h('div', { class: 'feature__spec' }, SpecCard(project.spec, { showLinks: false }))
    )
  );
}
