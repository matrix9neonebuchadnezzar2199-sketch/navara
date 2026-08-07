import ThreeView, { Color } from "@navaramap/three";
import type { SelectiveOutlineEffectDesc } from "@navaramap/three-default-descs";
import {
  DefaultPlugin,
  type DefaultDescriptions,
} from "@navaramap/three-default-plugin";
import { TileJsonPlugin } from "@navaramap/three-plugins";

import { addButton } from "../../../../helpers/button";
import { initializeExample } from "../../../../helpers/initialize";

import { data } from "./data";

const view = new ThreeView<DefaultDescriptions>({ shadow: true });

const defaultPlugin = new DefaultPlugin();
view.addPlugin(defaultPlugin);
const tilejson = new TileJsonPlugin();
view.addPlugin(tilejson);

await view.init();

view.atmosphere.date = new Date("2026-07-16T03:00:00Z");
view.addLight({ ambient: { intensity: 0.6 } });
view.addLight({ sun: { intensity: 1.8, castShadow: true, shadowFar: 1000 } });

view.setCamera({
  lng: 86.829149,
  lat: 27.98073,
  distance: 50,
  heading: 340,
  pitch: -35,
  roll: 0,
});

const basemap = await tilejson.addSource({
  type: "raster-tile",
  url: "https://papers.reearth.land/styles/papers-light/tilejson.json",
});
view.addLayer({ type: "raster", source: basemap });

view.addLayer({ type: "terrain", ellipsoid: { receiveShadow: true } });

const outline = view.addEffect<SelectiveOutlineEffectDesc>({
  selectiveOutline: {
    color: new Color().setStyle("#0091ff"),
    thickness: 2,
    edgeStrength: 1,
  },
});

const source = view.addSource({ type: "geojson", data });
view.addLayer({
  type: "vector",
  source,
  polygon: {
    color: new Color().setStyle("#f4f2ee"),
    extrudedHeight: 5,
    clampToGround: false,
    castShadow: true,
    effectIds: [outline.id],
  },
});

let visible = true;
const toggle = addButton("Outline: On");
toggle.onclick = () => {
  visible = !visible;
  outline.update({ visible });
  toggle.textContent = `Outline: ${visible ? "On" : "Off"}`;
};

view.attribution?.add([
  {
    attribution: "© OpenStreetMap contributors",
    attributionUrl: "https://www.openstreetmap.org/copyright",
  },
]);

initializeExample(view);
