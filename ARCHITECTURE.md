# ARCHITECTURE (edit map)

## Load chain

    index.html -> css/tokens.css, css/base.css, css/components.css, css/desktop.css, js/main.js
    js/main.js -> data/{site,projects,experience}.js, components/{BackgroundSlider,Desktop}.js
    Desktop -> DesktopMenu, WindowManager, dom
    DesktopMenu -> dom      WindowManager -> Window, dom      Window -> dom

## Mount points (index.html id -> component <- data)
    | `#desktop` | `Desktop({site, projects, experience})` | `site`, `projects`, `experience` |

Must match: `aria-labelledby` in index.html <-> h1/h2 ids `hero-title`, `work-title`, `about-title`, `contact-title`. Nav `href`s (`#work #about #contact`) <-> section ids. `#top` = `<body id>`.
`main.js` also calls `initBackground()` first (before rendering).

## Component imports
```
Nav            -> BackgroundSlider, dom
ProjectList    -> ProjectFeature, ProjectRow, dom
ProjectFeature -> EmbedFrame, SpecCard, dom        (exports ProjectFeature, ProjectMedia)
ProjectRow     -> SpecCard, ProjectFeature.ProjectMedia, dom
EmbedFrame, SpecCard, Hero, About, Contact, BackgroundSlider -> dom
```
Dispatch: `layout === 'open'` -> ProjectFeature, anything else -> ProjectRow. Index (+1, `pad2`) = list number.

## js/lib/dom.js exports
`isPlaceholder(v)` `pad2(n)` `toArray(v)` `text(str)` `h(tag, attrs, ...children)` `link(label, url, {className, newTab})` `linkList(links, className)` `tagList(tags)` `statusBadge(status)` `picture(src, alt, className)`
- `[ADD...]` strings -> `<span class="ph">`; placeholder URL -> `<a>` without href + `.is-placeholder`.
- `h()` attrs: `class`, `dataset`, `onclick`-style, `aria-*` (false kept), null/false skipped.

## data/site.js keys
```
name
nav[]: {label, href}
hero: {statement, support}
about: {paragraphs[]}
contact: {email, githubRepo, githubProfile, linkedin, cv}
```
Contact.js `ROWS` maps key -> label: email=Email, githubRepo=GitHub – this site, githubProfile=GitHub – profile, linkedin=LinkedIn, cv=CV (shows "Download PDF"). New contact row = new key in site.js + new entry in `ROWS`.

## data/projects.js keys -> where rendered
| key | rendered by / as |
| --- | --- |
| `id` | `#project-<id>`, `#row-<id>`, `#panel-<id>` |
| `title` | `.feature__title` / `.row__title` |
| `status` | `data-status`; only `'in-progress'` -> `.badge` (`statusBadge`) |
| `layout` | `'open'` Feature / else Row |
| `summary` | `.feature__summary` / `.row__summary` |
| `note` | `.note` (Feature only) |
| `tags[]` | `tagList` -> `.tags` |
| `media.type` | `ProjectMedia`: `embed` -> `EmbedFrame`, `image` -> `figure.media` + `picture`, `none` -> nothing |
| `media.src` | embed: iframe URL; image: img path |
| `media.poster` | embed poster (`.embed__poster`) |
| `media.fullUrl` | "Open full screen" link |
| `media.alt` | image alt |
| `media.sandbox` | overrides `DEFAULT_SANDBOX` in EmbedFrame.js |
| `spec.what / stack[] / decisions[] / links[{label,url}]` | `SpecCard` rows: What, Stack, Key decisions, Links. Feature shows links via `linkList` in `.feature__main` and calls `SpecCard(spec, {showLinks:false})`. Empty rows are skipped. |

Row also renders `ProjectMedia` inside its panel if media is not `none`.

## Hard-coded structural labels
- Work -> ProjectList.js; About -> About.js; Contact + row labels -> Contact.js
- Run it, Open full screen, Interactive demo -> EmbedFrame.js
- In progress -> dom.js `statusBadge`; Note -> ProjectFeature.js
- What / Stack / Key decisions / Links -> SpecCard.js
- Bg, Background brightness -> BackgroundSlider.js; Skip to content -> index.html

## Colour system (BackgroundSlider.js)
- Runtime CSS vars set on `:root`: `--bg --fg --muted --line --line-strong --accent`; also `root.style.colorScheme`, `root.dataset.tone`, `<meta name="theme-color">`.
- localStorage key: `rc-bg-tone` (0–100).
- Constants: `GRAY_LIGHTEST=245` `GRAY_DARKEST=14` `GRAY_LIGHT_FLOOR=135` `GRAY_DARK_CEIL=88` `DEFAULT_GRAY=34` `INK_DARK` `INK_LIGHT` `MIN_CONTRAST=4.6` `ACCENT_HUE=14` `ACCENT_SAT=0.9`
- Exports: `computeTheme(v)` (pure) `grayForValue` `applyTone` `loadTone` `initBackground` `BackgroundSlider` `DEFAULT_VALUE` `luminance` `contrast`
- tokens.css fallback colours must equal `computeTheme(DEFAULT_VALUE)` (`#222222 #f3f3f1 #9f9f9e #434343 #80807f #f5683d`).
- Changing any constant -> re-run contrast check over v = 0..100.

## tokens.css (static)
Fonts `--font-sans --font-mono`; type `--text-xs/sm/base/lg/xl/2xl/hero`; space `--space-1..8`; layout `--max --gutter --num-col --hairline`.

## CSS class map (components.css)
| component | classes |
| --- | --- |
| Nav | `.site-header` `.nav` `.nav__name` `.nav__links` `.bg-slider` `.bg-slider__label` `.bg-slider__input` |
| Hero | `.section--hero` `.hero` `.hero__statement` `.hero__support` |
| ProjectList | `.section` `.section__inner` `.section__title` `.section__count` `.work-list` `.work-list__item` |
| ProjectFeature | `.feature` `__head` `__title` `__body` `__main` `__summary` `__spec` · `.note` `.note__label` · `.media` `.media__img` `.media__placeholder` · `.link-list--row` |
| ProjectRow | `.row` `.row__heading` `.row__button` `.row__title` `.row__tags` `.row__icon` `.row__panel` `.row__summary` (open state: `[aria-expanded="true"]`) |
| SpecCard | `.spec` `.spec__row` `.spec__list` `.spec__inline` (`dt`, `dd`) |
| EmbedFrame | `.embed` (`.is-running`) `.embed__stage` `__poster` `__frame` `__run` `__bar` `__label` `__full` |
| About | `.about__body` |
| Contact | `.contact__list` `.contact__row` `.contact__label` `.contact__link` |
| shared | `.num` `.tags` `.badge` `.link` `.link-list` `.ph` `.is-placeholder` `.container` `.visually-hidden` `.skip-link` |
Desktop: .desktop .desktop__stage .desktop__title .desktop__windows
Menu: .menu .menu__list .menu__item .menu-item (.is-pulse .is-placeholder) .submenu .submenu__item
Window: .window (.is-active .is-dragging) .window__titlebar .window__title .window__close .window__body .window__placeholder


Breakpoints: 560px (spec rows), 720px (nav, contact rows), 860px (feature columns, row grid).

### Experience
- Mount: `#experience` (aria-labelledby `experience-title`) -> `Experience(experience)` <- `js/data/experience.js`
- Imports: `Experience -> dom` (`h`, `tagList`, `linkList`)
- Keys: `id` (`#job-<id>`), `company` (`.job__company`), `location`, `role`, `period`, `groups[{title, items[]}]`, `tags[]`, `links[{label,url}]`
- Item: string, or `{label, text}` (bold lead-in)
- Classes: `.experience-list` `.job` `.job__meta` `.job__company` `.job__role` `.job__period` `.job__location` `.job__body` `.job__group` `.job__group-title` `.job__items`
- Structural label: "Experience" -> Experience.js