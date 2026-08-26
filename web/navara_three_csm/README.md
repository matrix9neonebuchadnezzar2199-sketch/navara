# @navaramap/three-csm

Cascaded Shadow Maps (CSM) for Three.js. This package extends Three.js with cascaded directional lights, frustum splitting, and shadow-receiving material patches, so a single directional light (such as Navara's sun) can cast sharp shadows across the huge depth range of a 3D globe scene, from street-level detail to distant terrain.

It is used by `@navaramap/three-default-descs`' sun light descriptor, but has no dependency on the rest of Navara and can be used in any Three.js project.

Based on [three-csm](https://github.com/StrandedKitty/three-csm) and the [three.js CSM examples](https://github.com/mrdoob/three.js/tree/r169/examples/jsm/csm). Research & development by [Takram](https://github.com/takram-design-engineering).

## Documentation

See https://navara-docs.reearth.workers.dev/ for the full Navara documentation.

## License

MIT OR Apache-2.0
