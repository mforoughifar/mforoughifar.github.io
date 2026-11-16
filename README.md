# mforoughifar.github.io
[My personal homepage](http://mforoughifar.github.io/)

## How the site is organized

| File | What it is |
| --- | --- |
| `index.html` | Home |
| `research.html` | All papers, with plain-English summaries |
| `impact.html` | National importance, awards, talks, media |
| `work-with-me.html` | Companies, consulting, students |
| `job-market.html` | Full seven-part job market guide (the LinkedIn posts) and tools |
| `assets/css/site.css` | All styling (colors are at the top) |
| `assets/js/site.js` | Interactions (filters, counters, joke toggle, job-market tools) |
| `assets/photos/photos.js` | Photo gallery list (instructions inside) |
| `old/` | The previous design, kept as a backup |

## Common updates

- **New CV:** add the PDF and replace `CV_MF_Nov2026.pdf` everywhere it appears in the five `.html` files.
- **New paper:** copy an `<article class="paper">` block in `research.html` and edit it.
- **New photo:** follow the instructions at the top of `assets/photos/photos.js`.
- **New talk or award:** edit the lists in `impact.html` (and the totals on `index.html`).

## Going back to the old design

The old site is viewable at `/old/`. To make it the home page again:

    cp old/index.html index.html
    sed -i '' 's|src="../MF_photo.jpg"|src="MF_photo.jpg"|' index.html

`jemdoc.css` is still in the root, so nothing else is needed.
