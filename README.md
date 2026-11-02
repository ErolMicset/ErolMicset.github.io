# Digital Rebel Studio — website

The public website for **DRS (Digital Rebel Studio)**, a visual studio for HMI,
SCADA and IoT panels.

## Contents

| file | |
|---|---|
| `index.html` | the home page: all projects |
| `DRS.html` | the DRS page |
| `site.css` | the dark look shared by every page (loaded after the page's own style) |
| `lzflow.js` | the DRS - LZ - device animation, used by DRS.html, PLC.html and drQEmu.html (`data-lzflow`; the device alternates between the PLC and drQEmu) |
| `PLC.html`, `Kantar.html` | the Olympus PLC page and the Kantar page |
| `Tutorial-ESP32.html` | the ten-minute ESP32 panel tutorial |
| `Embedded.html` | the page for embedded developers: boards, LZ protocol, gateway, on-board pins, downloadable example in `examples/` |
| `DRSGallery.html` | the screenshot gallery, with topic filters and a full-size view |
| `images/drs-logo.png`, `images/drs-pcb.png` | the logo and the hero picture, shared by every page |
| `images/drs/*.png` | screenshots of the DRS studio (lower-case, hyphenated names) |
| `images/drqemu/*.png` | screenshots of drQEmu |
| `DRSDownload.html`, `drQEmu.html` | the two download pages; each has its own zip |
| `DownloadPathList.txt` | one line per zip: `version - zip file name - path`; "Tools" in the name = test servers, "drQEmu" in the name = the emulator |

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

1. Copy the PNG into `images/drs/` (or `images/drqemu/`). Use a lower-case, hyphenated name without
   spaces (`modbus-serial.png`); file names are case-sensitive on GitHub Pages.
2. In `DRSGallery.html`, add one entry to the `SHOTS` list: `images/drs/<name>`, topic
   (`cat`), width and height in pixels (the real size of the file), a title and
   one or two sentences about what the picture shows. Keep entries of the same
   topic together; the list order is the page order.

The topic buttons and their counts update by themselves. A new topic only
needs its name added to `CATEGORIES`.

## Editing the home page

Everything on the DRS page lives in `DRS.html`:

- design tokens (colours, shadows) are CSS custom properties on `:root`, with a
  dark-mode override under `@media (prefers-color-scheme: dark)`
- the hero illustration is inline SVG that reads those same tokens, so it
  follows the theme automatically
- the component catalogue mirrors the Designer toolbox; keep the counts in the
  badges in sync when components are added or removed
