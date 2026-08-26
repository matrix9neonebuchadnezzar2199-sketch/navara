# @navaramap/worker

The Web Worker infrastructure for Navara's web packages. It provides a worker pool and task manager that run heavy GIS processing (vector tile parsing, polygon/polyline geometry construction, terrain mesh construction and upsampling, image decoding) off the main thread using Navara's WASM worker module, transferring the results back as transferable buffers.

This is an internal building block: applications normally get background processing through [`@navaramap/three`](https://github.com/reearth/navara/tree/main/web/navara_three), which sets up the worker pool as part of `view.init()`, rather than using this package directly.

## Documentation

See https://navara-docs.reearth.workers.dev/ for the full Navara documentation.

## License

MIT OR Apache-2.0
