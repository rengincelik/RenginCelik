# Rengin Çelik: portfolio

Vanilla JS (ES modules), plain CSS, no framework, no build step.

## Run locally

ES modules don't load from `file://`, so use any static server from this folder:

```sh
python3 -m http.server 8000     # then open http://localhost:8000
# or
npx serve .
```

Deploys as-is to GitHub Pages, Netlify, etc.

## Add a project

Open `js/data/projects.js` and add one object to the `projects` array. Nothing else changes. The list number comes from the array position.

```js
{
  id: 'my-project',               // unique slug
  title: 'My project',
  status: 'live',                 // 'live' | 'in-progress' | 'archive' (in-progress shows a badge)
  layout: 'open',                 // 'open' = large feature block; 'collapsed' = row that expands to a spec card
  summary: '…',
  note: '…',                      // optional caveat under the summary
  tags: ['JS', 'WebGL'],
  media: { type: 'none' },        // or { type: 'image', src, alt }
                                  // or { type: 'embed', src, poster, fullUrl }
  spec: {
    what: '…',
    stack: ['…'],
    decisions: ['…', '…'],
    links: [{ label: 'Source', url: 'https://…' }],
  },
}
```

Empty fields are simply omitted. Mistakes (duplicate id, unknown layout) log a warning in the console instead of breaking the page.

## Add a job

Add one object to the `experience` array in `js/data/experience.js` (newest first). Fields: `id`, `company`, `location`, `role`, `period`, `groups` (`[{ title, items }]`; an item is a string or `{ label, text }`), `tags`, `links`. Missing fields are simply omitted.
## Where each piece of copy lives

| Copy | File |
| --- | --- |
| Name, nav links | `js/data/site.js` (`name`, `nav`) |
| Hero statement + supporting line | `js/data/site.js` (`hero`) |
| About paragraphs | `js/data/site.js` (`about`) |
| Email, GitHub (repo + profile), LinkedIn, CV | `js/data/site.js` (`contact`) |
| Everything about a project | `js/data/projects.js` |
| Page title and meta description | `index.html` |
| Structural labels (Work, About, Contact, Run it, Open full screen, spec row names) | the component that renders them, in `js/components/` |
| Jobs (company, role, period, bullets) | js/data/experience.js |


Anything still written as `[ADD: …]` is a placeholder. On the page it gets a dashed accent outline, so unfilled copy is easy to spot. Placeholder links render without an `href` until you fill them in. To find them all: `grep -rn "\[ADD" .`

## Notes

- **Background slider** (`js/components/BackgroundSlider.js`): one value (0–100) sets `--bg`, `--fg`, `--muted`, `--line`, `--line-strong` and `--accent` on `:root`. The gray ramp skips a mid-gray band so every position meets WCAG AA (4.5:1) for text, muted text and the accent. This is also why the background makes one visible jump near the middle of the slider. The band is set by `GRAY_LIGHT_FLOOR` and `GRAY_DARK_CEIL`. If you change colors there, re-check contrast: `computeTheme(v)` is a pure function you can run in Node for all 101 values.
- **Embeds** (`js/components/EmbedFrame.js`): the iframe is only created after "Run it". The default `sandbox` is `allow-scripts allow-same-origin`. Host embedded demos on a different origin than this site; for same-origin demos, override with `media.sandbox` and drop `allow-same-origin`.
- **Fonts**: DM Sans and DM Mono load from Google Fonts in `index.html`; system fonts are the fallback.
- `js/lib/dom.js` holds the small shared helpers (`h()` element builder, placeholder highlighting, link/tag/badge builders).