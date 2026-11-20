import { h } from '../lib/dom.js';
import { Job } from './Experience.js';

/** One job record in a window (company, role, period, groups, tags, links). */
export function ExperienceWindow(job) {
  return h('div', { class: 'win-experience' }, Job(job));
}
