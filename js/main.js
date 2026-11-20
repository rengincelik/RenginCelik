import { site } from './data/site.js';
import { projects } from './data/projects.js';
import { experience } from './data/experience.js';
import { initBackground } from './components/BackgroundSlider.js';
import { Desktop } from './components/Desktop.js';

// Colours first, so the first paint already uses the saved background.
initBackground();

const root = document.getElementById('desktop');
if (root) root.replaceChildren(Desktop({ site, projects, experience }));
else console.warn('#desktop not found in index.html');