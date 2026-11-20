import { h } from '../lib/dom.js';

/**
 * Portfolio file path. Not in the repo yet: while this is empty the item
 * renders as an unfinished (disabled) button. Fill it in when the file exists.
 */
const PORTFOLIO_FILE = '';

// Per-item float settings so the objects drift independently.
const FLOAT = [
  { dur: 7.2, delay: -1.0, dx: 5, dy: 7 },
  { dur: 8.4, delay: -3.5, dx: 6, dy: 5 },
  { dur: 6.6, delay: -2.2, dx: 4, dy: 8 },
  { dur: 9.0, delay: -5.1, dx: 7, dy: 6 },
  { dur: 7.8, delay: -0.4, dx: 5, dy: 9 },
  { dur: 8.1, delay: -4.3, dx: 6, dy: 7 },
];

const floatStyle = (i) => {
  const f = FLOAT[i % FLOAT.length];
  return `--dur:${f.dur}s;--delay:${f.delay}s;--dx:${f.dx}px;--dy:${f.dy}px`;
};

/** Brief ring pulse as click feedback (also fires for keyboard activation). */
function pulse(el) {
  el.classList.remove('is-pulse');
  void el.offsetWidth; // restart the animation
  el.classList.add('is-pulse');
}

/**
 * Main menu: window openers, Projects / Experience submenus, downloads.
 * Titles of submenu entries come straight from the data files.
 */
export function DesktopMenu({ site, projects, experience, onOpen }) {
  let openGroup = null; // { button, list }

  const setGroup = (group) => {
    if (openGroup && openGroup !== group) {
      openGroup.button.setAttribute('aria-expanded', 'false');
      openGroup.list.hidden = true;
    }
    if (group) {
      group.button.setAttribute('aria-expanded', 'true');
      group.list.hidden = false;
    }
    openGroup = group;
  };

  const menuButton = (label, index, attrs = {}) => {
    const el = h(
      'button',
      { class: 'menu-item', type: 'button', style: floatStyle(index), ...attrs },
      label
    );
    el.addEventListener('animationend', (e) => {
      if (e.animationName === 'menu-pulse') el.classList.remove('is-pulse');
    });
    return el;
  };

  const windowItem = (label, index, spec) =>
    menuButton(label, index, {
      onclick: (e) => {
        setGroup(null);
        pulse(e.currentTarget);
        onOpen(spec);
      },
    });

  const groupItem = (key, label, index, entries) => {
    const listId = `submenu-${key}`;
    const list = h(
      'ul',
      { class: 'submenu', id: listId, hidden: true, 'aria-label': label },
      entries.map((entry) =>
        h(
          'li',
          {},
          h(
            'button',
            {
              class: 'submenu__item',
              type: 'button',
              onclick: () => onOpen(entry),
            },
            entry.title
          )
        )
      )
    );
    const button = menuButton(label, index, {
      'aria-expanded': 'false',
      'aria-controls': listId,
    });
    const group = { button, list };
    button.addEventListener('click', () => {
      pulse(button);
      setGroup(openGroup === group ? null : group);
    });
    return { button, list };
  };

  const downloadItem = (label, index, href, filename) => {
    if (!href) {
      return menuButton(label, index, {
        class: 'menu-item is-placeholder',
        'aria-disabled': 'true',
        title: 'Coming soon',
      });
    }
    const a = h('a', { class: 'menu-item', href, download: filename ?? true, style: floatStyle(index) }, label);
    a.addEventListener('click', () => pulse(a));
    a.addEventListener('animationend', (e) => {
      if (e.animationName === 'menu-pulse') a.classList.remove('is-pulse');
    });
    return a;
  };

  const projectEntries = projects.map((p) => ({
    id: `project-${p.id}`,
    title: p.title,
    type: 'project',
  }));
  const experienceEntries = experience.map((e) => ({
    id: `job-${e.id}`,
    title: e.company,
    type: 'experience',
  }));

  const projectsGroup = groupItem('projects', 'Projects', 1, projectEntries);
  const experienceGroup = groupItem('experience', 'Experience', 2, experienceEntries);

  const items = [
    [windowItem('About', 0, { id: 'about', title: 'About', type: 'about' })],
    [projectsGroup.button, projectsGroup.list],
    [experienceGroup.button, experienceGroup.list],
    [windowItem('Contact', 3, { id: 'contact', title: 'Contact', type: 'contact' })],
    [downloadItem('Download Portfolio', 4, PORTFOLIO_FILE)],
    [downloadItem('Download Resume', 5, site.contact.cv)],
  ];

  const nav = h(
    'nav',
    { class: 'menu', 'aria-label': 'Main menu' },
    h(
      'ul',
      { class: 'menu__list' },
      // Submenu lists sit in the <li> but are positioned against the menu.
      items.map((children) => h('li', { class: 'menu__item' }, children))
    )
  );

  nav.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !openGroup) return;
    const { button } = openGroup;
    setGroup(null);
    button.focus();
  });
  document.addEventListener('pointerdown', (e) => {
    if (openGroup && !nav.contains(e.target)) setGroup(null);
  });

  return nav;
}
