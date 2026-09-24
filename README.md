# Digital Rebel Studio — website

The public website for **DRS (Digital Rebel Studio)**, a visual studio for HMI,
SCADA and IoT panels.

## Contents

| file | |
|---|---|
| `index.html` | the whole site — one self-contained file |

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

## Editing

Everything lives in `index.html`:

- design tokens (colours, shadows) are CSS custom properties on `:root`, with a
  dark-mode override under `@media (prefers-color-scheme: dark)`
- the hero illustration is inline SVG that reads those same tokens, so it
  follows the theme automatically
- the component catalogue mirrors the Designer toolbox; keep the counts in the
  badges in sync when components are added or removed
