import ThreeView, { Color, vector3ToGeodetic } from "@navaramap/three";
import {
  DefaultPlugin,
  type DefaultDescriptions,
} from "@navaramap/three-default-plugin";
import { PersonViewPlugin } from "@navaramap/three-plugins";

import {
  TILE_DATASETS,
  TILES_3D_DATASETS,
} from "../../../../helpers/constants";
import { initializeExample } from "../../../../helpers/initialize";

import { createHud, type LocationPreset } from "./hud";

const ASSETS = import.meta.env.BASE_URL; // "/examples/" on navara.world

// 地点プリセット。HUD のボタンからその場ワープする。
const LOCATIONS: Record<string, LocationPreset> = {
  tokyo: { label: "東京駅", lng: 139.7671, lat: 35.6812, heading: 234 },
  norikura: { label: "乗鞍岳", lng: 137.64724, lat: 36.25439, heading: 64.8 },
};

const START = LOCATIONS.tokyo;

const view = new ThreeView<DefaultDescriptions>({
  shadow: true,
  backgroundColor: new Color().setStyle("#cccccc"),
});

const defaultPlugin = new DefaultPlugin();
view.addPlugin(defaultPlugin);

const personView = new PersonViewPlugin({
  character: {
    modelUrl: `${ASSETS}glTF/Soldier/Soldier.glb`,
    animation: {
      idleClip: "Idle",
      walkClip: "Walk",
      dashClip: "Run",
      dashSpeed: 1.6,
      crossfadeDuration: 0.3,
    },
    // Soldier.glb は Y-up・+Z 向き: X 軸 90° で Z-up に起こすだけで北を向く
    modelRotationOffset: { x: Math.PI / 2, y: 0, z: 0 },
    modelScale: 1,
    castShadow: true,
    receiveShadow: true,
  },
  collision: {
    mode: "ground",
  },
  moveSpeed: 5,
  dashSpeedMultiplier: 3,
  cameraDistance: 8,
  cameraPitch: 14,
  fpvHeightOffset: 1.6,
  fpvPitch: 2.9,
  initialView: "tpv",
  // 左ドラッグで視点を回す（Alt 不要）。エンジン側は MouseButton::Left。
  allowCameraControl: true,
  startLng: START.lng,
  startLat: START.lat,
  startHeading: START.heading,
});
view.addPlugin(personView);

await view.init();

// Preload terrain around the start position
view.setCamera({
  lng: START.lng,
  lat: START.lat,
  height: 300,
  distance: 800,
  heading: START.heading,
  pitch: 14,
  roll: 0,
});

view.atmosphere.date = new Date("2026-08-03T00:30:00Z");
view.addLight({ ambient: { intensity: 1 } });
view.addLight({
  sun: {
    intensity: 2,
    castShadow: true,
    applyColor: true,
    shadowFar: 1000,
    shadowLambda: 1,
  },
});

const terrain = view.addSource({
  type: "quantized-mesh",
  url: "https://terrain.reearth.land/cesium-mesh/ellipsoid/{z}/{x}/{y}.terrain",
  maxZoom: 18,
  minZoom: 2,
  requestVertexNormals: true,
});
view.addLayer({
  type: "terrain",
  source: terrain,
  terrain: { castShadow: true, receiveShadow: true },
});

const basemap = view.addSource({
  type: "raster-tile",
  url: TILE_DATASETS.gsiSeamlessphoto.url,
  minZoom: 2,
  maxZoom: 18,
});
view.addLayer({
  type: "raster",
  source: basemap,
  raster: { color: new Color().setStyle("#ffffff") },
});

// 東京駅は千代田区（丸の内）と中央区（八重洲）の境。LOD2・テクスチャ無し。
// Re:Earth ellipsoid 地形と揃える。GSI DEM 向けの height: -50 は建物を地下に埋める。
const chiyoda = view.addSource({
  type: "3d-tiles",
  url: TILES_3D_DATASETS.plateauChiyoda.url,
});
view.addLayer({
  type: "3d-tiles",
  source: chiyoda,
  model: {
    show: true,
    color: new Color().setStyle("#ffffff"),
    metalness: 0,
    roughness: 1,
    castShadow: true,
    receiveShadow: true,
  },
});

const chuo = view.addSource({
  type: "3d-tiles",
  url: TILES_3D_DATASETS.plateauChuo.url,
});
view.addLayer({
  type: "3d-tiles",
  source: chuo,
  model: {
    show: true,
    color: new Color().setStyle("#ffffff"),
    metalness: 0,
    roughness: 1,
    castShadow: true,
    receiveShadow: true,
  },
});

// 歩行中はキャラクター操作、Esc で解放されたマップモードではクリックが
// ワープ先指定になる、というモード状態。
let walking = true;

const hud = createHud({
  locations: LOCATIONS,
  onSelectLocation: (key) => {
    const preset = LOCATIONS[key];
    void warpTo(preset.lng, preset.lat, preset.heading);
  },
});

/**
 * 指定座標へキャラクターを転送する。高度は最詳細の地形データから解決し、
 * 取れなければ現在高度を維持する（あとは ground コリジョンが追随する）。
 * マップモードからのワープでは歩行モードへ自動復帰する。
 */
const warpTo = async (lng: number, lat: number, heading?: number) => {
  hud.setWarpPending(true);
  try {
    const [ground] = await view.sampleTerrainMostDetailed(terrain, [
      { lat, lng },
    ]);
    const alt = ground?.height ?? personView.getState().alt;
    personView.teleport({ lng, lat, alt, heading });
    if (!walking) {
      walking = true;
      personView.start();
      hud.setReleased(false);
    }
  } finally {
    hud.setWarpPending(false);
  }
};

// マップモード中のクリック = ワープ先。Navara の click イベントはドラッグと
// クリックをピクセル閾値で弾くので、カメラ操作のつもりのドラッグでは発火しない。
view.on("click", (event) => {
  if (walking) return;
  const picked = view.pickTerrainPosition(event.clientX, event.clientY);
  if (!picked) return;
  const { lat, lng } = vector3ToGeodetic(picked);
  void warpTo(lng, lat);
});

personView.onStateChange((state) => hud.update(state));

window.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  walking = !walking;
  if (walking) {
    personView.start();
  } else {
    personView.stop();
  }
  hud.setReleased(!walking);
});

view.attribution?.add([
  TILE_DATASETS.gsiSeamlessphoto,
  TILES_3D_DATASETS.plateauChiyoda,
  TILES_3D_DATASETS.plateauChuo,
  {
    attribution: "Re:Earth Terrain",
    attributionUrl: "https://terrain.reearth.land/",
  },
  {
    attribution: "Soldier — three.js example model (CC0)",
    attributionUrl:
      "https://github.com/mrdoob/three.js/blob/dev/examples/models/gltf/Soldier.glb",
  },
]);

await personView.resolveStartHeight(terrain);

personView.start();

if (personView.model) {
  initializeExample(view, [personView.model]);
}
