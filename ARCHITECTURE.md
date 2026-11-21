# Architecture

## 1. Project Overview

A fixed, interactive desktop-style portfolio built with vanilla JavaScript (ES modules) and plain CSS.

- No framework
- No build step
- No external JavaScript dependencies
- Multiple draggable windows on desktop
- Single full-screen window on mobile
- Window content is separated from window management
- Project and experience content is data-driven

## 2. Application Entry

```text
index.html
└── js/main.js
    ├── data/site.js
    ├── data/projects.js
    ├── data/experience.js
    ├── components/BackgroundSlider.js
    └── components/Desktop.js
```

`index.html` provides the `#desktop` mount point and loads `main.js` as an ES module.

`main.js`:
1. Imports site data.
2. Initializes the background theme before rendering.
3. Creates the desktop interface.
4. Mounts it inside `#desktop`.

## 3. Component Architecture

```text
Desktop.js
├── DesktopMenu.js
└── WindowManager.js
    ├── Window.js
    └── windowContent.js
        ├── AboutWindow.js
        ├── ContactWindow.js
        │   └── Contact.js
        ├── ProjectWindow.js
        │   ├── ProjectFeature.js
        │   │   └── EmbedFrame.js
        │   └── SpecCard.js
        └── ExperienceWindow.js
            └── Experience.js

Shared:
├── BackgroundSlider.js
└── lib/dom.js
```

### Desktop.js

Creates the main desktop stage.

Responsibilities:
- Main title
- Desktop menu
- Window layer
- Stage interaction with mobile full-screen windows

Receives `site`, `projects` and `experience` from `main.js`.

### DesktopMenu.js

Creates the interactive menu.

Responsibilities:
- About and Contact window openers
- Projects submenu
- Experience submenu
- Resume and Portfolio download entries
- Menu animations and click feedback
- Submenu open/close behavior

Project and experience menu entries are generated from their respective data arrays.

### WindowManager.js

Owns all window state and interactions.

Responsibilities:
- Open and close windows
- Prevent duplicate windows with the same ID
- Focus and z-index management
- Dragging
- Viewport clamping
- Window positioning and cascading
- Mobile single-window behavior
- Focus return after closing a window

This component should not contain individual window content or visual content markup.

### Window.js

Shared window shell.

Responsibilities:
- Window container
- Title bar
- Close / Back control
- Scrollable content area
- Accessible dialog structure

Receives a content DOM node. It does not manage window state, dragging or focus order.

### windowContent.js

Maps window types to their content components.

```js
const RENDERERS = {
  about: AboutWindow,
  contact: ContactWindow,
  project: ProjectWindow,
  experience: ExperienceWindow,
};
```

To add a new window type, create its content component and register it here.

The shared `Window.js` and `WindowManager.js` should not need changes just to add or edit window content.

## 4. Window Content Components

Each window type has its own content component.

| Component | Responsibility |
|---|---|
| AboutWindow.js | About paragraphs |
| ContactWindow.js | Contact information |
| ProjectWindow.js | Individual project details |
| ExperienceWindow.js | Individual experience entry |

Content components can reuse smaller rendering components:

- `Contact.js` exports `ContactList()`.
- `Experience.js` exports `Job()`.
- `ProjectFeature.js` exports `ProjectMedia()`.
- `SpecCard.js` renders project specifications.
- `EmbedFrame.js` handles interactive iframe demos.

The shared window shell is independent of these content components.

## 5. Data Structure

### `js/data/site.js`

Site-wide information.

Currently used:
- `name`
- `about.paragraphs`
- `contact.email`
- `contact.githubRepo`
- `contact.githubProfile`
- `contact.linkedin`
- `contact.cv`

`nav` and `hero` are legacy data fields and are not currently rendered by the desktop interface.

### `js/data/projects.js`

Projects are stored in an array.

Each project contains:

```js
{
  id,
  title,
  status,
  layout,
  summary,
  note,
  tags,
  media,
  spec
}
```

The desktop menu uses:
- `id`
- `title`
- Project object as window data

The project window uses:
- `summary`
- `note`
- `tags`
- `media`
- `spec`

`layout` belongs to the previous page-based project list and is not currently used by `ProjectWindow`.

Media types:
- `none`
- `image`
- `embed`

`embed` media (rendered by `EmbedFrame.js`) has two sizing modes:

- **Fluid** (default): the iframe fills a 16:9 stage (4:5 on mobile) and the demo lays itself out.
- **Scaled**: set `media.width` and `media.height` (CSS px). The demo is rendered at that logical size and shrunk to the window with `transform: scale()`; the stage takes the same aspect ratio. Below `media.minScale` (default 0.5) "Run it" is replaced by a pointer to "Open full screen". Use this for demos that are a fixed desktop layout.

`media.sandbox` overrides the sandbox tokens (e.g. add `allow-downloads` for a demo that exports files).

A project with a live embed can get a larger window in `desktop.css` through `.window[data-window-id='project-<id>']`; no JavaScript change is needed.

### `js/data/experience.js`

Experience entries are stored in an array.

Each entry contains:

```js
{
  id,
  company,
  location,
  role,
  period,
  groups,
  tags,
  links
}
```

Each entry opens as an individual experience window.

## 6. Shared Utilities

### `js/lib/dom.js`

Shared DOM helpers used by the component system.

Exports:
- `h()` — element creation
- `text()` — safe text node creation and placeholder highlighting
- `link()` — link creation
- `linkList()` — list of links
- `tagList()` — tag rendering
- `statusBadge()` — project status badge
- `picture()` — image or placeholder rendering
- `isPlaceholder()` — placeholder detection
- `toArray()` — normalize optional array values
- `pad2()` — zero-padded numbers

Use these helpers instead of introducing another DOM utility layer.

## 7. Styling Architecture

CSS is split into four files.

| File | Responsibility |
|---|---|
| `tokens.css` | Design tokens, typography, spacing and fallback colors |
| `base.css` | Global reset, base elements and accessibility utilities |
| `components.css` | Shared content styles and reusable project/contact/experience styles |
| `desktop.css` | Desktop stage, menu, windows, animations and mobile window behavior |

`components.css` still contains styles reused by the current window content components. It should not be removed just because some of its original page sections are no longer rendered.

### Background Theme

`BackgroundSlider.js` is initialized by `main.js`.

It:
- Calculates the background palette.
- Applies CSS custom properties to `:root`.
- Saves the selected tone in local storage.
- Provides a contrast-aware light/dark background system.

Current CSS variables:

```css
--bg
--fg
--muted
--line
--line-strong
--accent
```

`tokens.css` provides the initial fallback values.

## 8. Responsive Behavior

### Desktop

- Fixed viewport
- No page scrolling
- Multiple open windows
- Draggable windows
- Independent window focus and z-index
- Window content scrolls internally

### Mobile

Breakpoint: `720px`

- One open window at a time
- Window fills the screen
- Dragging disabled
- Close control becomes a Back control
- Background stage is made inert while a full-screen window is open

Window behavior is managed by `WindowManager.js`; responsive appearance is handled by `desktop.css`.

## 9. Adding or Editing Content

### Add a project

1. Add the project object to `js/data/projects.js`.
2. The Projects submenu is generated automatically.
3. Selecting the entry opens a project window.

No changes to `WindowManager.js` are required.

### Add an experience entry

1. Add the entry to `js/data/experience.js`.
2. The Experience submenu is generated automatically.
3. Selecting the entry opens an experience window.

### Edit a window

Edit the corresponding content component:

- About → `AboutWindow.js`
- Contact → `ContactWindow.js`
- Project → `ProjectWindow.js`
- Experience → `ExperienceWindow.js`

Avoid changing `WindowManager.js` for content-only changes.

### Add a new window type

1. Create a new content component.
2. Add its renderer to `windowContent.js`.
3. Add a menu entry or another appropriate opener.
4. Add type-specific dimensions or styling in `desktop.css` if needed.

## 10. Files and Responsibilities

```text
index.html

css/
├── tokens.css
├── base.css
├── components.css
└── desktop.css

js/
├── main.js
├── theme.js                 # Legacy / unused
├── components/
│   ├── Desktop.js
│   ├── DesktopMenu.js
│   ├── WindowManager.js
│   ├── Window.js
│   ├── windowContent.js
│   ├── BackgroundSlider.js
│   ├── AboutWindow.js
│   ├── ContactWindow.js
│   ├── ProjectWindow.js
│   ├── ExperienceWindow.js
│   ├── Contact.js
│   ├── Experience.js
│   ├── ProjectFeature.js
│   ├── SpecCard.js
│   └── EmbedFrame.js
├── data/
│   ├── site.js
│   ├── projects.js
│   └── experience.js
└── lib/
    └── dom.js
```

## 11. Current Technical Notes

- `DesktopMenu.js` uses a local `PORTFOLIO_FILE` constant. It must be connected to the actual portfolio file when available.
- `site.contact.cv` currently points to the resume PDF.
- `Contact.js` also supports a `portfolio` contact field, but it is not currently populated.
- `EmbedFrame.js` uses sandbox permissions. Review iframe origin and sandbox settings before publishing embedded demos.
- Keep window content, window shell and window management separate.
- Keep menu positioning and visual effects independent from window state.
- Prefer CSS changes for visual adjustments; avoid changing window management logic unless behavior itself needs to change.


## D) ARCHITECTURE.md
Load chain'e ekle:
Desktop -> Background, DesktopMenu, WindowManager, dom
Background -> backgrounds (data), backgroundShader (lib), dom
Yeni data dosyası: js/data/backgrounds.js (intervalMs, images, cycle, windows)
CSS class map: .desktop__bg