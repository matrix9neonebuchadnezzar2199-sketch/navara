/**
 * person-walk 左サイドバー。描画専用 — レイヤー操作は features.ts が担う。
 * 無効はグレー、有効は薄い青（マスター指定）。
 */
export type FeatureId =
  | "aerial"
  | "osm"
  | "heatmap"
  | "clouds"
  | "precipitation"
  | "fog"
  | "bloom"
  | "dof"
  | "ssr"
  | "pointcloud"
  | "splat"
  | "geojson"
  | "gltf"
  | "google3d"
  | "cesium"
  | "overlay";

type ToggleSpec = {
  id: FeatureId;
  label: string;
  hint?: string;
};

type GroupSpec = {
  title: string;
  items: ToggleSpec[];
};

const GROUPS: GroupSpec[] = [
  {
    title: "地図",
    items: [
      { id: "aerial", label: "航空写真" },
      { id: "osm", label: "OSM" },
      { id: "heatmap", label: "標高ヒートマップ" },
    ],
  },
  {
    title: "天候・大気",
    items: [
      { id: "clouds", label: "雲" },
      { id: "precipitation", label: "降水" },
      { id: "fog", label: "霧" },
    ],
  },
  {
    title: "画面効果",
    items: [
      { id: "bloom", label: "ブルーム" },
      { id: "dof", label: "被写界深度" },
      { id: "ssr", label: "水面反射" },
    ],
  },
  {
    title: "配置・3D",
    items: [
      { id: "pointcloud", label: "点群", hint: "掛川城（静岡）" },
      { id: "splat", label: "Gaussian splat" },
      { id: "geojson", label: "GeoJSON 点線面" },
      { id: "gltf", label: "glTF を置く" },
      { id: "google3d", label: "Google フォトリアル", hint: "課金・API キー" },
      { id: "cesium", label: "Cesium Ion 地形" },
      { id: "overlay", label: "DOM オーバーレイ" },
    ],
  },
];

const SIDEBAR_CSS = `
.pwsb {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 30;
  width: 248px;
  max-height: calc(100vh - 24px);
  display: flex;
  flex-direction: column;
  font-family: system-ui, sans-serif;
  color: #d7dce4;
  background: rgba(20, 24, 31, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  backdrop-filter: blur(6px);
  overflow: hidden;
}
.pwsb--collapsed {
  width: 36px;
  height: 36px;
  max-height: 36px;
}
.pwsb--collapsed .pwsb__body,
.pwsb--collapsed .pwsb__title {
  display: none;
}
.pwsb__head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 8px 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}
.pwsb--collapsed .pwsb__head {
  padding: 0;
  border-bottom: none;
  height: 36px;
  justify-content: center;
}
.pwsb__title {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.pwsb__fold {
  width: 28px;
  height: 28px;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  color: #d7dce4;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.pwsb__fold:hover {
  background: rgba(255, 255, 255, 0.08);
}
.pwsb__body {
  padding: 8px 10px 12px;
  overflow-y: auto;
}
.pwsb__group {
  margin-bottom: 10px;
}
.pwsb__group:last-child {
  margin-bottom: 0;
}
.pwsb__group-title {
  margin: 0 0 6px;
  font-size: 10px;
  color: #8b94a3;
  letter-spacing: 0.06em;
}
.pwsb__toggle {
  display: block;
  width: 100%;
  margin: 0 0 5px;
  padding: 6px 8px;
  font-size: 11px;
  text-align: left;
  color: #c5cad3;
  background: #4a5160;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
}
.pwsb__toggle:hover:not(:disabled) {
  background: #5a6273;
}
.pwsb__toggle--on {
  color: #0e1a28;
  background: #8ec5ff;
  border-color: #8ec5ff;
}
.pwsb__toggle--on:hover:not(:disabled) {
  background: #a6d2ff;
}
.pwsb__toggle:disabled {
  opacity: 0.55;
  cursor: wait;
}
.pwsb__hint {
  display: block;
  margin-top: 2px;
  font-size: 9px;
  opacity: 0.75;
}
.pwsb__time {
  margin-top: 4px;
}
.pwsb__time-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #9aa3b0;
  margin-bottom: 4px;
}
.pwsb__time input {
  width: 100%;
  accent-color: #8ec5ff;
}
`;

export type Sidebar = {
  setOn(id: FeatureId, on: boolean): void;
  setBusy(id: FeatureId, busy: boolean): void;
};

export const createSidebar = (options: {
  initialOn: Partial<Record<FeatureId, boolean>>;
  initialHourJst: number;
  onToggle: (id: FeatureId, on: boolean) => Promise<boolean>;
  onHourJst: (hours: number) => void;
}): Sidebar => {
  const style = document.createElement("style");
  style.textContent = SIDEBAR_CSS;
  document.head.appendChild(style);

  const root = document.createElement("aside");
  root.className = "pwsb";
  root.setAttribute("aria-label", "レイヤー");

  const head = document.createElement("div");
  head.className = "pwsb__head";
  const title = document.createElement("div");
  title.className = "pwsb__title";
  title.textContent = "レイヤー";
  const fold = document.createElement("button");
  fold.type = "button";
  fold.className = "pwsb__fold";
  fold.textContent = "▼";
  fold.title = "折りたたむ";
  fold.setAttribute("aria-expanded", "true");
  head.append(title, fold);

  const body = document.createElement("div");
  body.className = "pwsb__body";

  const buttons = new Map<FeatureId, HTMLButtonElement>();
  const onState: Record<FeatureId, boolean> = {
    aerial: false,
    osm: false,
    heatmap: false,
    clouds: false,
    precipitation: false,
    fog: false,
    bloom: false,
    dof: false,
    ssr: false,
    pointcloud: false,
    splat: false,
    geojson: false,
    gltf: false,
    google3d: false,
    cesium: false,
    overlay: false,
    ...options.initialOn,
  };

  const paint = (id: FeatureId) => {
    const button = buttons.get(id);
    if (!button) return;
    button.classList.toggle("pwsb__toggle--on", onState[id]);
  };

  for (const group of GROUPS) {
    const section = document.createElement("section");
    section.className = "pwsb__group";
    const heading = document.createElement("h2");
    heading.className = "pwsb__group-title";
    heading.textContent = group.title;
    section.appendChild(heading);
    for (const item of group.items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pwsb__toggle";
      button.dataset.feature = item.id;
      const label = document.createElement("span");
      label.textContent = item.label;
      button.appendChild(label);
      if (item.hint) {
        const hint = document.createElement("span");
        hint.className = "pwsb__hint";
        hint.textContent = item.hint;
        button.appendChild(hint);
      }
      button.onclick = async () => {
        const next = !onState[item.id];
        button.disabled = true;
        const ok = await options.onToggle(item.id, next);
        button.disabled = false;
        if (ok) {
          onState[item.id] = next;
          paint(item.id);
        }
      };
      buttons.set(item.id, button);
      paint(item.id);
      section.appendChild(button);
    }
    body.appendChild(section);
  }

  const timeBox = document.createElement("div");
  timeBox.className = "pwsb__time";
  const timeRow = document.createElement("div");
  timeRow.className = "pwsb__time-row";
  const timeCaption = document.createElement("span");
  timeCaption.textContent = "太陽（JST）";
  const timeValue = document.createElement("span");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "23.75";
  slider.step = "0.25";
  slider.value = String(options.initialHourJst);

  const formatHour = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  timeValue.textContent = formatHour(options.initialHourJst);
  slider.oninput = () => {
    const hours = Number(slider.value);
    timeValue.textContent = formatHour(hours);
    options.onHourJst(hours);
  };
  timeRow.append(timeCaption, timeValue);
  timeBox.append(timeRow, slider);
  body.appendChild(timeBox);

  let collapsed = false;
  fold.onclick = () => {
    collapsed = !collapsed;
    root.classList.toggle("pwsb--collapsed", collapsed);
    fold.textContent = collapsed ? "▶" : "▼";
    fold.title = collapsed ? "開く" : "折りたたむ";
    fold.setAttribute("aria-expanded", collapsed ? "false" : "true");
  };

  root.append(head, body);
  document.body.appendChild(root);

  return {
    setOn(id, on) {
      onState[id] = on;
      paint(id);
    },
    setBusy(id, busy) {
      const button = buttons.get(id);
      if (button) button.disabled = busy;
    },
  };
};
