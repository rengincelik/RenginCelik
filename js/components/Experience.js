import { h, tagList, linkList } from '../lib/dom.js';

const renderItem = (item) =>
  h('li', {}, typeof item === 'string' ? item : [h('strong', {}, `${item.label}: `), item.text]);

export function Job(job) {
  return h(
    'article',
    { class: 'job', id: `job-${job.id}` },
    h(
      'header',
      { class: 'job__meta' },
      h('h3', { class: 'job__company' }, job.company),
      h('p', { class: 'job__role' }, job.role),
      h('p', { class: 'job__period' }, job.period),
      job.location ? h('p', { class: 'job__location' }, job.location) : null
    ),
    h(
      'div',
      { class: 'job__body' },
      (job.groups ?? []).map((g) =>
        h(
          'section',
          { class: 'job__group' },
          h('h4', { class: 'job__group-title' }, g.title),
          h('ul', { class: 'job__items' }, (g.items ?? []).map(renderItem))
        )
      ),
      tagList(job.tags),
      linkList(job.links, 'link-list link-list--row')
    )
  );
}

/** The whole Experience section, rendered from the experience array. */
export function Experience(jobs) {
  return h(
    'div',
    { class: 'section__inner container' },
    h('h2', { class: 'section__title', id: 'experience-title' }, 'Experience'),
    h('div', { class: 'experience-list' }, jobs.map(Job))
  );
}