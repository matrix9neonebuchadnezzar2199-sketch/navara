import ThreeView, { Color } from "@navaramap/three";
import { TileJsonPlugin } from "@navaramap/three-plugins";

import { addCheckbox } from "../../../../helpers/button";
import { initializeExample } from "../../../../helpers/initialize";

import { features } from "./data";

const view = new ThreeView();

const tilejson = new TileJsonPlugin();
view.addPlugin(tilejson);

await view.init();

view.setCamera({
  lng: 137.6497,
  lat: 36.2415,
  height: 380,
  heading: 0,
  pitch: -48,
  roll: 0,
});

const basemap = await tilejson.addSource({
  type: "raster-tile",
  url: "https://papers.reearth.land/styles/grayscale/tilejson.json",
});
view.addLayer({ type: "raster", source: basemap });

const source = view.addSource({ type: "geojson", data: features });

let boundaries = true;
let vertices = true;

const addLayer = () =>
  view.addLayer({
    type: "vector",
    source,
    polygon: {
      color: new Color().setStyle("#0091ff"),
      transparent: true,
      opacity: 0.55,
    },
    polyline: {
      color: new Color().setStyle("#0091ff"),
      width: 12,
      geometryTypes: boundaries ? ["line", "polygon"] : ["line"],
    },
    ...(vertices && {
      point: {
        color: new Color().setStyle("#ff6b2c"),
        size: 22,
        sizeInMeters: false,
        declutter: false,
        depthTest: false,
        geometryTypes: ["point", "line", "polygon"],
      },
    }),
  });

let layer = addLayer();

const rebuild = () => {
  layer.delete();
  layer = addLayer();
};

addCheckbox("Polygon boundaries", boundaries, (checked) => {
  boundaries = checked;
  rebuild();
});
addCheckbox("Vertex points", vertices, (checked) => {
  vertices = checked;
  rebuild();
});

initializeExample(view);
