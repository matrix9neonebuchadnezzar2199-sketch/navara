# @navaramap/core

The shared foundation for Navara's web packages. Navara is a 3D globe map engine whose reusable GIS logic lives in a Rust/WASM core with drawing delegated to a swappable rendering backend. This package holds the rendering-engine-agnostic TypeScript building blocks that every other `@navaramap/*` package builds on: common geospatial and engine types (geodetic coordinates, camera, transform, ray/plane, tile, feature, layer), the event and transaction system, plugin abstractions, color and colormap utilities, globe constants, and assorted helpers (IDs, batching, assertions).

Most applications don't depend on this package directly. Rendering bindings such as [`@navaramap/three`](https://github.com/reearth/navara/tree/main/web/navara_three) depend on it and re-export the types and utilities (e.g. `Color`, `LatLngHeight`) that applications need.

## Documentation

See https://navara.world/docs/ for the full Navara documentation.

## License

MIT OR Apache-2.0
