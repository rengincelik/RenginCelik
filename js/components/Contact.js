import { h, link, isPlaceholder } from '../lib/dom.js';

/** Shown link text for a URL: strip protocol and trailing slash. */
const shortUrl = (url) => url.replace(/^https?:\/\//i, '').replace(/\/$/, '');

/**
 * Rows are defined here (labels are structural); values come from site.js.
 * A placeholder value is shown as-is, as text, until you replace it.
 */
const ROWS = [
  { label: 'Email', key: 'email', href: (v) => `mailto:${v}`, show: (v) => v },
  { label: 'GitHub – this site', key: 'githubRepo', href: (v) => v, show: shortUrl },
  { label: 'GitHub – profile', key: 'githubProfile', href: (v) => v, show: shortUrl },
  { label: 'LinkedIn', key: 'linkedin', href: (v) => v, show: shortUrl },
  { label: 'CV', key: 'cv', href: (v) => v, show: () => 'Download PDF', newTab: false },
	{ label: 'Portfolio', key: 'portfolio', href: (v) => v, show: () => 'Download Portfolio', newTab: false },
];

export function ContactList(contact) {
	return h(
		'ul',
		{ class: 'contact__list' },
		ROWS.map(({ label, key, href, show, newTab }) => {
			const value = contact[key];
			const filled = value && !isPlaceholder(value);
			return h(
				'li',
				{ class: 'contact__row' },
				h('span', { class: 'contact__label' }, label),
				filled
					? link(show(value), href(value), { className: 'contact__link', newTab: newTab ?? true })
					: h('span', { class: 'contact__link' }, value || '[ADD: value]')
			);
		})
	);
}

export function Contact(contact) {
	return h(
		'div',
		{ class: 'section__inner container' },
		h('h2', { class: 'section__title', id: 'contact-title' }, 'Contact'),
		ContactList(contact)
	);
}