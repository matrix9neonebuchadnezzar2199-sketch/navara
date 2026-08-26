# @navaramap/font

Font management for Navara's text rendering. This package loads fonts, shapes text, and generates SDF (signed distance field) glyph atlases in a background Web Worker backed by Navara's WASM font module, with LRU caching of atlases and glyph metrics. The rendering bindings use it to draw symbol/text layers on the globe.

This is an internal building block: applications normally get text rendering through [`@navaramap/three`](https://github.com/reearth/navara/tree/main/web/navara_three) (e.g. symbol layers) rather than using this package directly.

## Documentation

See https://navara-docs.reearth.workers.dev/ for the full Navara documentation.

## License

MIT OR Apache-2.0
