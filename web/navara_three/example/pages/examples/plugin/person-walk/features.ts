/**
 * サイドバー各スイッチの実体。公式 example と同じ API を、必要なときだけ足す。
 * CesiumIonPlugin は init 前登録が必須なので、ここでは endpoint を自前 fetch する
 * （プラグイン化すると起動が Cesium API に依存して失敗する）。
 */
import ThreeView, {
  Color,
  geodeticToVector3,
  TERRARIUM_ELEVATION_DECODER,
  type Layer,
  type Source,
} from "@navaramap/three";
import type {
  AerialPerspectiveEffectDesc,
  CloudsEffectDesc,
  DepthOfFieldEffectDesc,
  FogLightEffectDesc,
  GLTFModelDesc,
  RainDropEffectDesc,
  RainMeshDesc,
  SelectiveBloomEffectDesc,
  SplatMeshDesc,
  SSREffectDesc,
} from "@navaramap/three-default-descs";
import type { DefaultDescriptions } from "@navaramap/three-default-plugin";
import {
  moveOverlayElement,
  type OverlayPlugin,
} from "@navaramap/three-plugins";
import { Vector2 } from "three";

import { TURBO_COLOR_MAP } from "../../../../helpers/colors";
import {
  TERRAIN_DATASETS,
  TILE_DATASETS,
} from "../../../../helpers/constants";
import { GOOGLE_MAPS_API_KEY } from "../../../../helpers/keys";

import type { FeatureId } from "./sidebar";

type View = ThreeView<DefaultDescriptions>;

type Effectish = { delete(): void; visible: boolean };
type Meshish = { delete(): void; visible: boolean };

const TOKYO = { lng: 139.7671, lat: 35.6812 };

const SPLAT_URL =
  "https://assets.cms.reearth.io/assets/e2/e8e117-8059-4450-adde-7fa7a3c5908a/Sunny Meadow/Sunny Meadow.sog";

const POINTCLOUD_URL =
  "https://assets.cms.plateau.reearth.io/assets/6b/68c785-f43d-4451-ba7f-d4d130ef6ba5/uc_pv1_22213_kakegawa/pointcloud/22213_kakegawa_castle/tileset.json";

// 公式 quantized-mesh 例と同じ。PLATEAU 配信チュートリアルの公開トークン。
const CESIUM_ION_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiODVhMmQ5OS1hOWZjLTQ3YmYtODlmNi1lNWUwY2MwOGUxYTMiLCJpZCI6MTQ5ODk3LCJpYXQiOjE2ODc5MzQ3NDN9.OG0mc3i7ZxGwHQjlMv3TRjiOvKWpzxglxmJRaUIykTY";
const CESIUM_ION_ASSET_ID = 3258112;

const GOOGLE_CREDIT = {
  attribution: "Google Maps Photorealistic 3D Tiles",
  attributionUrl: "https://www.google.com/permissions/geoguidelines/",
};

const POINTCLOUD_CREDIT = {
  attribution: "kakegawa castle point cloud model - MLIT PLATEAU",
  attributionUrl: "https://www.geospatial.jp/ckan/dataset/kakegawacastle",
};

const SPLAT_CREDIT = {
  attribution: "Sunny Meadow by Jeremias Kieferle - CC BY 4.0",
  attributionUrl:
    "https://assets.cms.reearth.io/assets/e2/e8e117-8059-4450-adde-7fa7a3c5908a/Sunny Meadow/LICENSE",
};

const plateauModel = (show: boolean) => ({
  show,
  color: new Color().setStyle("#ffffff"),
  metalness: 0,
  roughness: 1,
  castShadow: true,
  receiveShadow: true,
});

export type FeatureKit = {
  setEnabled(id: FeatureId, on: boolean): Promise<boolean>;
  setSolarHourJst(hours: number): void;
  collisionSource(): Source;
};

export const createFeatureKit = (deps: {
  view: View;
  overlay: OverlayPlugin;
  assetsBase: string;
  terrainSource: Source;
  terrainLayer: Layer;
  aerialSource: Source;
  aerialLayer: Layer;
  plateau: { source: Source; layer: Layer }[];
}): FeatureKit => {
  const { view, overlay } = deps;
  let collision = deps.terrainSource;

  let osmSource: Source | undefined;
  let osmLayer: Layer | undefined;
  let heatmapLayer: Layer | undefined;
  let aerialFx: Effectish | undefined;
  let cloudsFx: Effectish | undefined;
  let rainMesh: Meshish | undefined;
  let rainDropFx: Effectish | undefined;
  let fogFx: Effectish | undefined;
  let bloomFx: (Effectish & { id: string }) | undefined;
  let bloomGlow: Layer | undefined;
  let dofFx: Effectish | undefined;
  let ssrFx: Effectish | undefined;
  let pointSource: Source | undefined;
  let pointLayer: Layer | undefined;
  let splatMesh: Meshish | undefined;
  let geoLayer: Layer | undefined;
  let carMesh: Meshish | undefined;
  let googleLayer: Layer | undefined;
  let cesiumLayer: Layer | undefined;

  let overlayEl: HTMLElement | undefined;
  let overlayUnsub: (() => void) | undefined;

  const credit = (
    item: { attribution: string; attributionUrl?: string },
    on: boolean,
  ) => {
    if (on) view.attribution?.add([item]);
    else view.attribution?.remove([item]);
  };

  const groundHeight = async (lng: number, lat: number, extra = 0) => {
    const [sampled] = await view.sampleTerrainMostDetailed(collision, [
      { lat, lng },
    ]);
    return (sampled?.height ?? 40) + extra;
  };

  /**
   * 雲は aerialPerspective の後ろに差し込む。公式天気デモは
   * addDefaultPhotorealScene() で先に足している。歩行デモは太陽を既に
   * 置いているので、空の合成に必要なパスだけ後付けする。
   */
  const ensureAerialPerspective = () => {
    if (aerialFx) return;
    aerialFx = view.addEffect<AerialPerspectiveEffectDesc>({
      aerialPerspective: {
        sun: true,
        sky: true,
        irradiance: true,
      },
    });
  };

  /**
   * 雲の暗さは aerialPerspective と雲オーバーレイの両方。visible=false だけでは
   * オーバーレイが残るので、OFF では両方外して元の明るさに戻す。
   */
  const setCloudSky = (on: boolean) => {
    if (on) {
      ensureAerialPerspective();
      if (aerialFx) aerialFx.visible = true;
      return;
    }
    view.atmosphere.overlay.value = null;
    view.atmosphere.shadow.value = null;
    view.atmosphere.shadowLength.value = null;
    view.atmosphere.onUpdate();
    if (aerialFx) aerialFx.visible = false;
  };

  const setPlateauShow = (show: boolean) => {
    for (const { source, layer } of deps.plateau) {
      layer.update({
        type: "3d-tiles",
        source,
        model: plateauModel(show),
      });
    }
  };

  const setReearthTerrainShow = (show: boolean) => {
    deps.terrainLayer.update({
      type: "terrain",
      source: deps.terrainSource,
      terrain: { show, castShadow: true, receiveShadow: true },
    });
  };

  const tokyoGeojson = () => ({
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Point" as const,
          coordinates: [TOKYO.lng, TOKYO.lat],
        },
      },
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [TOKYO.lng - 0.0012, TOKYO.lat - 0.0004],
            [TOKYO.lng + 0.0012, TOKYO.lat + 0.0005],
          ],
        },
      },
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Polygon" as const,
          coordinates: [
            [
              [TOKYO.lng - 0.0007, TOKYO.lat - 0.0005],
              [TOKYO.lng + 0.0007, TOKYO.lat - 0.0005],
              [TOKYO.lng + 0.0007, TOKYO.lat + 0.0005],
              [TOKYO.lng - 0.0007, TOKYO.lat + 0.0005],
              [TOKYO.lng - 0.0007, TOKYO.lat - 0.0005],
            ],
          ],
        },
      },
    ],
  });

  const resolveGoogleKey = (): string | null => {
    const stored = sessionStorage.getItem("navara-google-maps-key") ?? "";
    const existing = GOOGLE_MAPS_API_KEY || stored;
    if (existing) return existing;
    const typed = window.prompt(
      "Google Maps API キー（Photorealistic 3D Tiles）。空ならキャンセル。",
    );
    if (!typed) return null;
    sessionStorage.setItem("navara-google-maps-key", typed.trim());
    return typed.trim();
  };

  const enableCesium = async () => {
    const url = `https://api.cesium.com/v1/assets/${CESIUM_ION_ASSET_ID}/endpoint?access_token=${encodeURIComponent(CESIUM_ION_TOKEN)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Cesium Ion endpoint ${res.status}`);
    }
    const json = (await res.json()) as { url: string; accessToken: string };
    const source = view.addSource({
      type: "quantized-mesh",
      url: `${json.url}{z}/{x}/{y}.terrain`,
      token: json.accessToken,
      maxZoom: 18,
      requestVertexNormals: true,
      requestWaterMask: true,
    });
    const layer = view.addLayer({
      type: "terrain",
      source,
      terrain: { castShadow: true, receiveShadow: true },
    });
    return { source, layer };
  };

  const setEnabled = async (id: FeatureId, on: boolean): Promise<boolean> => {
    try {
      switch (id) {
        case "aerial": {
          deps.aerialLayer.update({
            type: "raster",
            source: deps.aerialSource,
            raster: { show: on, color: new Color().setStyle("#ffffff") },
          });
          return true;
        }
        case "osm": {
          if (on) {
            if (!osmLayer) {
              osmSource = view.addSource({
                type: "raster-tile",
                url: TILE_DATASETS.openstreetmap.url,
                maxZoom: 19,
              });
              osmLayer = view.addLayer({
                type: "raster",
                source: osmSource,
                raster: { color: new Color().setStyle("#ffffff") },
              });
              credit(TILE_DATASETS.openstreetmap, true);
            } else if (osmSource) {
              osmLayer.update({
                type: "raster",
                source: osmSource,
                raster: { show: true, color: new Color().setStyle("#ffffff") },
              });
            }
          } else if (osmLayer && osmSource) {
            osmLayer.update({
              type: "raster",
              source: osmSource,
              raster: { show: false },
            });
          }
          return true;
        }
        case "heatmap": {
          if (on) {
            if (!heatmapLayer) {
              const dem = view.addSource({
                type: "raster-dem",
                url: "https://terrain.reearth.land/terrarium/elevation/{z}/{x}/{y}.png",
                elevationDecoder: TERRARIUM_ELEVATION_DECODER(),
                tileSize: 512,
                maxZoom: 15,
              });
              view.globe.elevationColormap = TURBO_COLOR_MAP;
              heatmapLayer = view.addLayer({
                type: "raster",
                source: dem,
                elevationHeatmap: {
                  maxHeight: 3200,
                  minHeight: 0,
                  logarithmic: true,
                  logBoundary: 1000,
                },
              });
            }
          } else if (heatmapLayer) {
            heatmapLayer.delete();
            heatmapLayer = undefined;
          }
          return true;
        }
        case "clouds": {
          if (on) {
            setCloudSky(true);
            if (!cloudsFx) {
              // 公式例は数 km 上空の high + shadows。歩行目線だと1フレームで GPU が止まる。
              cloudsFx = view.addEffect<CloudsEffectDesc>({
                clouds: {
                  qualityPreset: "low",
                  localWeatherVelocity: new Vector2(0.001, 0),
                  lightShafts: false,
                  shadows: false,
                  haze: true,
                  coverage: 0.5,
                },
              });
            } else {
              cloudsFx.visible = true;
            }
          } else if (cloudsFx) {
            cloudsFx.visible = false;
            setCloudSky(false);
          }
          return true;
        }
        case "precipitation": {
          if (on) {
            if (!rainMesh) {
              rainMesh = view.addMesh<RainMeshDesc>({
                rain: { followCamera: true, particleCount: 4000 },
              });
            } else {
              rainMesh.visible = true;
            }
            if (!rainDropFx) {
              rainDropFx = view.addEffect<RainDropEffectDesc>({
                rainDrop: { dropLayers: 2 },
              });
            } else {
              rainDropFx.visible = true;
            }
          } else {
            if (rainMesh) rainMesh.visible = false;
            if (rainDropFx) rainDropFx.visible = false;
          }
          return true;
        }
        case "fog": {
          if (on) {
            const alt = await groundHeight(TOKYO.lng, TOKYO.lat, 6);
            const lamps = [
              [0.0004, 0],
              [-0.0004, 0],
              [0, 0.0004],
              [0, -0.0004],
            ].map(([dlng, dlat]) => {
              const { x, y, z } = geodeticToVector3({
                lng: TOKYO.lng + dlng,
                lat: TOKYO.lat + dlat,
                height: alt,
              });
              return {
                position: { x, y, z },
                color: 0xffb45c,
                intensity: 1,
                radius: 220,
              };
            });
            if (!fogFx) {
              // 未指定だと maxFar = camera.far（地球スケール）になり街歩きで凍る。
              fogFx = view.addEffect<FogLightEffectDesc>({
                fogLight: {
                  lights: lamps,
                  fogDensity: 1.2,
                  useSurfaceLighting: true,
                  maxFar: 220,
                  downsample: 4,
                },
              });
            } else {
              fogFx.visible = true;
            }
          } else if (fogFx) {
            fogFx.visible = false;
          }
          return true;
        }
        case "bloom": {
          if (on) {
            if (!bloomFx) {
              bloomFx = view.addEffect<SelectiveBloomEffectDesc>({
                selectiveBloom: { strength: 0.8, radius: 0.35, threshold: 0 },
              });
              const source = view.addSource({
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: [
                    {
                      type: "Feature",
                      properties: {},
                      geometry: {
                        type: "Polygon",
                        coordinates: [
                          [
                            [TOKYO.lng - 0.00015, TOKYO.lat - 0.00012],
                            [TOKYO.lng + 0.00015, TOKYO.lat - 0.00012],
                            [TOKYO.lng + 0.00015, TOKYO.lat + 0.00012],
                            [TOKYO.lng - 0.00015, TOKYO.lat + 0.00012],
                            [TOKYO.lng - 0.00015, TOKYO.lat - 0.00012],
                          ],
                        ],
                      },
                    },
                  ],
                },
              });
              bloomGlow = view.addLayer({
                type: "vector",
                source,
                polygon: {
                  color: new Color().setStyle("#0091ff"),
                  extrudedHeight: 4,
                  clampToGround: false,
                  effectIds: [bloomFx.id],
                  emissiveColor: new Color().setStyle("#0091ff"),
                  emissiveIntensity: 0.5,
                },
              });
            } else {
              bloomFx.visible = true;
            }
          } else {
            bloomGlow?.delete();
            bloomGlow = undefined;
            bloomFx?.delete();
            bloomFx = undefined;
          }
          return true;
        }
        case "dof": {
          if (on) {
            if (!dofFx) {
              const handle = view.addEffect<DepthOfFieldEffectDesc>({
                depthOfField: {
                  focusDistance: 28,
                  focalLength: 180,
                  bokehScale: 4,
                },
              });
              // EffectPass は Composer 経由で mainCamera が入る想定だが、
              // 後付け addEffect では入らない。CoC が null 行列を読む。
              const inner = handle.ref.raw as
                | { raw?: { mainCamera: typeof view.camera.raw } }
                | undefined;
              if (inner?.raw) inner.raw.mainCamera = view.camera.raw;
              dofFx = handle;
            } else {
              dofFx.visible = true;
            }
          } else if (dofFx) {
            dofFx.visible = false;
          }
          return true;
        }
        case "ssr": {
          if (on) {
            if (!ssrFx) {
              ssrFx = view.addEffect<SSREffectDesc>({ ssr: {} });
            } else {
              ssrFx.visible = true;
            }
          } else if (ssrFx) {
            ssrFx.visible = false;
          }
          return true;
        }
        case "pointcloud": {
          if (on) {
            if (!pointLayer) {
              pointSource = view.addSource({
                type: "3d-tiles",
                url: POINTCLOUD_URL,
              });
              pointLayer = view.addLayer({
                type: "3d-tiles",
                source: pointSource,
                model: { pointSize: 0.3, maxSse: 8 },
              });
              credit(POINTCLOUD_CREDIT, true);
            } else if (pointSource) {
              pointLayer.update({
                type: "3d-tiles",
                source: pointSource,
                model: { show: true, pointSize: 0.3, maxSse: 8 },
              });
            }
          } else if (pointLayer && pointSource) {
            pointLayer.update({
              type: "3d-tiles",
              source: pointSource,
              model: { show: false, pointSize: 0.3, maxSse: 8 },
            });
          }
          return true;
        }
        case "splat": {
          if (on) {
            const height = await groundHeight(TOKYO.lng, TOKYO.lat, 2);
            if (!splatMesh) {
              splatMesh = view.addMesh<SplatMeshDesc>({
                geodetic: {
                  lng: TOKYO.lng,
                  lat: TOKYO.lat,
                  height,
                  pitch: 180,
                },
                splat: { url: SPLAT_URL, lod: false },
              });
              credit(SPLAT_CREDIT, true);
            } else {
              splatMesh.visible = true;
            }
          } else if (splatMesh) {
            splatMesh.visible = false;
          }
          return true;
        }
        case "geojson": {
          if (on) {
            if (!geoLayer) {
              const source = view.addSource({
                type: "geojson",
                data: tokyoGeojson(),
              });
              geoLayer = view.addLayer({
                type: "vector",
                source,
                polygon: {
                  color: new Color().setStyle("#0091ff"),
                  transparent: true,
                  opacity: 0.45,
                },
                polyline: {
                  color: new Color().setStyle("#0091ff"),
                  width: 8,
                },
                point: {
                  color: new Color().setStyle("#ff6b2c"),
                  size: 18,
                  sizeInMeters: false,
                  depthTest: false,
                },
              });
            }
          } else if (geoLayer) {
            geoLayer.delete();
            geoLayer = undefined;
          }
          return true;
        }
        case "gltf": {
          if (on) {
            const height = await groundHeight(TOKYO.lng - 0.0004, TOKYO.lat, 1);
            if (!carMesh) {
              carMesh = view.addMesh<GLTFModelDesc>({
                gltfModel: { url: `${deps.assetsBase}glTF/car/scene.gltf` },
                geodetic: {
                  lng: TOKYO.lng - 0.0004,
                  lat: TOKYO.lat,
                  height,
                  heading: 234,
                },
              });
            } else {
              carMesh.visible = true;
            }
          } else if (carMesh) {
            carMesh.visible = false;
          }
          return true;
        }
        case "google3d": {
          if (on) {
            const key = resolveGoogleKey();
            if (!key) return false;
            if (!googleLayer) {
              const source = view.addSource({
                type: "3d-tiles",
                url: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${encodeURIComponent(key)}`,
              });
              googleLayer = view.addLayer({
                type: "3d-tiles",
                source,
                model: { maxSse: 20, normals: true },
              });
              view.attribution?.add([
                {
                  ...GOOGLE_CREDIT,
                  logo: `${deps.assetsBase}credits/GoogleMaps.png`,
                  creditLayerId: googleLayer.id,
                },
              ]);
            }
            setPlateauShow(false);
          } else {
            googleLayer?.delete();
            googleLayer = undefined;
            view.attribution?.remove([GOOGLE_CREDIT]);
            setPlateauShow(true);
          }
          return true;
        }
        case "cesium": {
          if (on) {
            const added = await enableCesium();
            cesiumLayer = added.layer;
            collision = added.source;
            setReearthTerrainShow(false);
            credit(TERRAIN_DATASETS.cesiumIon, true);
          } else {
            cesiumLayer?.delete();
            cesiumLayer = undefined;
            collision = deps.terrainSource;
            setReearthTerrainShow(true);
            credit(TERRAIN_DATASETS.cesiumIon, false);
          }
          return true;
        }
        case "overlay": {
          if (on) {
            const alt = await groundHeight(TOKYO.lng, TOKYO.lat, 12);
            if (!overlayEl) {
              overlayEl = document.createElement("div");
              overlayEl.textContent = "東京駅";
              overlayEl.style.cssText =
                "position:fixed;top:0;left:0;z-index:25;padding:4px 10px;font:12px system-ui;color:#0e1a28;background:#8ec5ff;border-radius:999px;pointer-events:none;white-space:nowrap;";
              document.body.appendChild(overlayEl);
            }
            overlayEl.hidden = false;
            overlay.setPositions([
              { id: "tokyo-station", lng: TOKYO.lng, lat: TOKYO.lat, alt },
            ]);
            overlayUnsub?.();
            overlayUnsub = overlay.onUpdate(({ projected }) => {
              const pos = projected.get("tokyo-station");
              if (!overlayEl) return;
              if (!pos) {
                overlayEl.style.visibility = "hidden";
                return;
              }
              overlayEl.style.visibility = "visible";
              moveOverlayElement(overlayEl, pos.x, pos.y);
            });
          } else {
            overlayUnsub?.();
            overlayUnsub = undefined;
            overlay.setPositions([]);
            if (overlayEl) overlayEl.hidden = true;
          }
          return true;
        }
        default:
          return false;
      }
    } catch (err) {
      console.error(`person-walk feature ${id}`, err);
      window.alert(
        `${id} の有効化に失敗しました。コンソールを確認してください。`,
      );
      return false;
    }
  };

  return {
    setEnabled,
    setSolarHourJst(hours) {
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      // 日付は既存シーンと同じ 2026-08-03。スライダーだけ時刻を動かす。
      const date = new Date(Date.UTC(2026, 7, 3, 0, 0, 0));
      date.setUTCHours(h - 9, m, 0, 0);
      view.atmosphere.date = date;
    },
    collisionSource() {
      return collision;
    },
  };
};
