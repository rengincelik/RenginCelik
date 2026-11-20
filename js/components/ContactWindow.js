import { h } from '../lib/dom.js';
import { ContactList } from './Contact.js';

/** Contact window body: the same rows as the legacy section, without its header. */
export function ContactWindow(contact) {
  return h('div', { class: 'win-contact' }, ContactList(contact));
}
