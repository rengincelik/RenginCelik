import { AboutWindow } from './AboutWindow.js';
import { ContactWindow } from './ContactWindow.js';
import { ProjectWindow } from './ProjectWindow.js';
import { ExperienceWindow } from './ExperienceWindow.js';

/**
 * Window `type` -> content component. Each component receives `spec.data`
 * (the matching site / project / experience object) and returns a Node.
 * Add a new window type here; Window.js and WindowManager.js stay untouched.
 */
const RENDERERS = {
  about: AboutWindow,
  contact: ContactWindow,
  project: ProjectWindow,
  experience: ExperienceWindow,
};

/** Content node for a window spec, or null (the manager then shows a placeholder). */
export function renderContent(spec) {
  const render = RENDERERS[spec.type];
  return render && spec.data ? render(spec.data) : null;
}
