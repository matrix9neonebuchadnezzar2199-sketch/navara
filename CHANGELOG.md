## v0.0.7 - 2026-08-21

### 🚀 Features

- Add sampleTerrainMostDetailed (#774)

### 🐛 Bug Fixes

- Improve polygon outline jitter (#768)
- SSR and FogLight order (#769)
- Bump Overture tiles URL release (#770)
- Mvt text flicker (#771)
- Text material flicker (#772)
- Lazy font face fetch (#773)
- Improve pickTerrainPosition precision (#775)
- Remove height from sampleTerrainHeight arg (#776)
- Shadow error and horizon culling for polyline (#777)
- Tiled geojson deletion (#778)
- Tiled polygon and polyline on the geodesic path (#779)

## v0.0.6 - 2026-08-17

### 🚀 Features

- Replace legacy data with source completely (#756)
- Increase animation speed and dash speed multiplier for PersonViewPlugin (#759)
- Enhance person view plugin (#761)
- Set reflectivity for watermask automatically (#762)
- Dynamic MRT buffers (#765)

### 🐛 Bug Fixes

- Improve text rendering quality (#754)
- Improve pmtiles overture example (#755)
- Improve CSM precision (#758)
- Interpolate terrain height sampling API (#760)
- Improve fog light quality (#766)
- Improve SSR quality (#767)

## v0.0.5 - 2026-07-31

### 🚀 Features

- Support maplibre style's line, circle, symbol (#741)
- Batch text labels (#748)
- Support raster dem in TileJSON (#753)

### 🐛 Bug Fixes

- Improve atmosphere assets handling (#747)
- Load atmosphere assets on demand (#749)
- Avoid panic when model material is none (#750)
- Remove unused clamp to ground from the model material (#751)
- Incorrect tileSize on page maplibre-style (#752)

### 🔨 Refactoring

- Update decluttering logic to improve label visibility handling (#742)

## v0.0.4 - 2026-07-28

### 🚀 Features

- Rename snake-case to kebab-case to follow NPM convention (#740)

## v0.0.3 - 2026-07-28

### 🚀 Features

- Increase solar API (#731)
- Add load/error events to GLTF and splat meshes (#734)
- Add SSR geometryBuffer (#735)

### 🐛 Bug Fixes

- Improve rte (#727)
- Multiple polygon in geojson-vt (#726)
- Flickering vector tile (#728)
- Camera jump issue (#733)
- Terrain parent flickering (#730)
- Avoid unnecessary feature evaluation (#736)
- Arcline RTE related bugs (#737)
- Improve text rendering performance (#738)
- Terrain parent flickering (#739)

### 🧹 Miscellaneous

- *(example)* Credit the data sources each example displays (#719)
- Move font family util to rust (#732)
 
## v0.0.2 - 2026-07-22

### 🚀 Features

- Update deps (#720)
- Update postprocessing (#722)
- Add declutter manager to avoid collision between text/sprite. (#717)

### 🐛 Bug Fixes

- Tile gaps (#721)
- Update the outdated pmtiles links, and use cdn endpoints (#723)
- Gltf model RTE (#724)

## v0.0.1 - 2026-07-22

First release 🎉
