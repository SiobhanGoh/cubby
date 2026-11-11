# cubby

A tiny 3D room on the internet that is all yours. Decorate it, pick a style, link your things, and share it.

**Try it: https://siobhangoh.github.io/cubby/**

## What it does

- **Build mode.** Add furniture, pets, plants and tech from the catalogue. Drag to move, rotate, recolour, duplicate, delete, undo. Nothing is kept until you press Save.
- **6 styles × 6 palettes.** Soft clay, Storybook, Y2K gloss, Midnight neon, Low-poly and Japandi. Every item works in every style and every colour, and each style has its own window.
- **6 room templates** to start from.
- **Live mode.** Pets wander, stretch and groom by day and sleep at night. Curtains and leaves move in the breeze. The clock shows your real time.
- **Real time and weather.** The light follows your clock. Add your city and it follows your real sunrise, sunset and rain.
- **Links.** Any item can open an app or a site: the record player opens your playlist, the laptop opens your work app.
- **Share.** The whole room is packed into the link. No account and no server.

## How it is built

Everything runs in the browser with [three.js](https://threejs.org/). There is no backend.

| File | What it is |
|---|---|
| `src/kit.js` | The building blocks (rounded box, cylinder, blob) and the style knobs |
| `src/items.js` | The catalogue, palettes and templates. Every item is one entry |
| `src/main.js` | The room, lights, build mode, live mode, weather and sharing |
| `docs/index.html` | The built page that GitHub Pages serves |

### Adding an item

Add one entry to `ITEMS` in `src/items.js`. It automatically gets a thumbnail, every style and colour, drag and drop, and a place in share links.

### Run it yourself

```
npm install
npm run build
```

Then open `docs/index.html`.

## Credits

- Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0)
- 3D rendering by [three.js](https://threejs.org/) (MIT)

MIT licence.
