## Motivation

Web map engines have long forced developers to choose between ease of use and extensibility: engines with polished declarative APIs are easy to adopt but hard to extend beyond their built-in features, while engines with deep low-level control are powerful but demand steep expertise — and fully 3D globe applications usually leave no option but the latter. Navara is an open-source, general-purpose 3D globe map engine (dual-licensed MIT / Apache-2.0) developed to remove that trade-off. It streams real-world data — raster imagery, terrain, vector tiles (MVT), PMTiles, GeoJSON, and 3D Tiles — onto an interactive globe, and can present it as anything from a clean basemap for data visualization to a photorealistic scene with atmosphere, sunlight, and shadows.

Navara's answer to the trade-off is a tiered API. Capabilities are organized into four tiers, so users start with the simplicity of a declarative engine and drop down — as far as the render pipeline itself — only when they need more control:

- **Declarative API** — add sources and layers as plain config objects (basemaps, terrain, vector data, 3D Tiles); meshes, effects, and lights are added the same declarative way.
- **Plugins** — ready-made bundles such as the photorealistic scene, first-person walking, DOM overlays, and the attribution UI; anyone can package and share their own plugin.
- **Low-level API** — per-feature styling by attributes (`FeatureEvaluator`), feature picking, terrain sampling, and standalone geodetic/ECEF math utilities usable without the map engine.
- **Custom Descriptors** — write your own mesh/effect/light descriptors with full access to the Three.js scene graph and render pipeline (depth and normal/G-buffer included) — the same foundation Navara's built-ins are made of, not a limited escape hatch.

Under the hood, a Rust/WebAssembly geospatial core runs in Web Workers, with TypeScript packages rendering through Three.js.

**Why it fits the MapLibre project:**

1. **It is already built on MapLibre's open specifications.** Navara implements MVT decoding in Rust, PMTiles support, and a TileJSON 3.0 source plugin, and we are actively implementing the **MapLibre Style Specification** (`MapLibreStylePlugin`), including a Rust parser/evaluator for MapLibre style expressions that runs in WASM. Our goal is that an existing MapLibre `style.json` can be dropped onto a 3D globe and just work.

2. **MapLibre Tiles (MLT) is on our roadmap.** Our vector-tile source layer was deliberately designed to be format-agnostic so that MLT can be added as a first-class format alongside MVT. We would like to be an early independent implementation of MLT and help validate the spec from a second engine's perspective.

3. **It extends MapLibre's reach rather than competing with it.** MapLibre GL JS is the reference engine for 2D/2.5D vector maps; Navara targets the fully 3D end of the spectrum — globe rendering, streamed terrain, 3D city models, atmosphere and lighting — while keeping MapLibre's familiar declarative styling model. Bringing Navara into the MapLibre organization gives the community a home for 3D-globe use cases that today tend to leave the ecosystem for other stacks.

**Goals:** near-term, complete MapLibre Style Spec coverage for the core layer types and ship MLT support; long-term, grow Navara into a production-quality, community-governed 3D globe engine within the MapLibre family, developed fully in the open.

- Documentation: https://navara-docs.netlify.app/
- Live examples:
  - Old: https://navara-preview.netlify.app/dev
  - New(In-progress): https://navara-preview.netlify.app/

## Acceptance
- [ ] Any two board members must agree to accept a new repository.
  **Approved by:** <@user1> <@user2>

## Licensing
- [x] The repo license is BSD-3 or MIT.
  *Repos may allow dual-licensing under other open source licenses, e.g. MIT OR Apache.*
  *Navara is dual-licensed MIT OR Apache-2.0.*
- [x] The repo contains `Copyright (c) <year> MapLibre contributors` in license file(s) and in the readme.

## Special files
- [x] `/README.md`
  - [x] Description
  - [x] link to the main maplibre.org page
  - [x] name of the OSM-US Slack channel for discussions and an [invite link](https://slack.openstreetmap.us)
- [x] `/LICENSE`
  *Dual-licensed repos may have additional files like `LICENSE-MIT` and `LICENSE-APACHE`*
- [x] `/SECURITY.md`
  Add the text:
  ```
  For an up-to-date policy refer to
  https://github.com/maplibre/maplibre/blob/main/SECURITY.md
  ```
- [x] `/CONTRIBUTING.md`
- [x] The repo has Pull Request and Issue Templates in `/.github` dir.
- [x] The repo has `/.github/FUNDING.yml` file copied from [maplibre-gl-js/funding](https://github.com/maplibre/maplibre-gl-js/blob/main/.github/FUNDING.yml)
- [x] `/CODE_OF_CONDUCT.md`
  *This file should only link to our [primary code of conduct](https://github.com/maplibre/maplibre/blob/main/CODE_OF_CONDUCT.md). Use this markup for consistency:*
  ```md
  # Contributor Covenant
  [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://github.com/maplibre/maplibre/blob/main/CODE_OF_CONDUCT.md)
  ```

## Repo Settings
#### General page
- [ ] **[Features]** Disable unused features like wiki.
- [ ] **[Features]** Enable `Sponsorships` checkbox (see also FUNDING.yaml above).
- [ ] **[Features]** Enable `Preserve this repository`.
- [ ] **[Pull Requests]** Community is encouraged to use `squash merge`. Disable other merge types if possible.
- [ ] **[Pull Requests]** Enable `Automatically delete head branches`.

#### Access
- [ ] The repo has at least one admin who is ideally not part of the Governing Board: <@user>

#### Branches
- [x] The primary branch is named `main`.
- [ ] Set up branch ruleset to require CI pass before merge.  Non-trivial projects should also require an approval before merging.
- [ ] Set up branch ruleset to prevent branch creation - this will prevent accidental pushes directly to the repo, and force all developers to use their own forks.

## Miscellaneous
- [ ] Repo has a proper GitHub description and an optional web site
  *Use the gear icon in the upper right corner of the repo page.*
- [x] CI automatically runs on all pull requests before merging using GitHub actions
- [ ] Grant admin rights to the board members and automation accounts for packages <list-of-packages>
    - [npmjs.com](https://www.npmjs.com/): package settings / invite:  `maplibreorg nyurik birkskyum`
    - [crates.io](https://crates.io/): package settings / add owner: `nyurik birkskyum CommanderStorm`

## Community
- [ ] The new repo has been announced in the `#maplibre` OSMUS slack channel.
- [ ] The new repo has been announced in the next monthly meeting of the Technical Steering Committee.
- [ ] The new repo has been announced in the newsletter (which is shared on social media).
