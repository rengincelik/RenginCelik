import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { initBackground } from './components/BackgroundSlider.js';
import { Nav } from './components/Nav.js';
import { Hero } from './components/Hero.js';
import { ProjectList } from './components/ProjectList.js';
import { About } from './components/About.js';
import { Contact } from './components/Contact.js';
import { experience } from './data/experience.js';
import { Experience } from './components/Experience.js';

// Colours first, so the first paint already uses the saved background.
initBackground();

function mount(id, node) {
  const el = document.getElementById(id);
  if (el) el.replaceChildren(node);
  else console.warn(`#${id} not found in index.html`);
}

mount('site-header', Nav({ name: site.name, links: site.nav }));
mount('hero', Hero(site.hero));
mount('work', ProjectList(projects));
mount('experience', Experience(experience));
mount('about', About(site.about));
mount('contact', Contact(site.contact));