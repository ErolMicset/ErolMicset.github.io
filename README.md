# Digital Rebel Studio — website

The public website for **DRS (Digital Rebel Studio)**, a visual studio for HMI,
SCADA and IoT panels.

## Contents

| file | |
|---|---|
| `index.html` | the home page |
| `gallery.html` | the screenshot gallery, with topic filters and a full-size view |
| `*.png` | screenshots used by both pages |

There is no build step, no framework and no external request: styles, scripts
and icons are all inline. Open `index.html` in a browser to preview it.

## Publishing with GitHub Pages

1. Push this folder as the repository root.
2. **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main`, folder: `/ (root)`
3. The site appears at `https://<user>.github.io/<repo>/` within a minute or two.

A repository named `<user>.github.io` is served at `https://<user>.github.io/`
instead, with no sub-path.

## Adding a screenshot

1. Copy the PNG into this folder. File names are case-sensitive on GitHub Pages.
2. In `gallery.html`, add one line to the `SHOTS` list: file name, topic
   (`cat`), width and height in pixels, a title and one or two sentences about
   what the picture shows.

The topic buttons and their counts update by themselves. A new topic only
needs its name added to `CATEGORIES`.

## Editing the home page

Everything on the home page lives in `index.html`:

- design tokens (colours, shadows) are CSS custom properties on `:root`, with a
  dark-mode override under `@media (prefers-color-scheme: dark)`
- the hero illustration is inline SVG that reads those same tokens, so it
  follows the theme automatically
- the component catalogue mirrors the Designer toolbox; keep the counts in the
  badges in sync when components are added or removed
