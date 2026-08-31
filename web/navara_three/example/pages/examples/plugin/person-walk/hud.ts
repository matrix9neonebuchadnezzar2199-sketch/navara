/**
 * person-walk ページの HUD: 座標・高度・速度・方角の読み出し、地点
 * プリセットボタン、マップモード時のワープ案内バナーをまとめた
 * オーバーレイ。描画専用 — Navara API には main.ts 側だけが触れる。
 */
import type { PersonViewState } from "@navaramap/three-plugins";

export type LocationPreset = {
  label: string;
  lng: number;
  lat: number;
  heading: number;
};

const HUD_CSS = `
.pwhud {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 20;
  font-family: system-ui, sans-serif;
}
.pwhud__card {
  min-width: 220px;
  padding: 9px 11px;
  font-size: 11px;
  line-height: 1.4;
  color: #d7dce4;
  background: rgba(20, 24, 31, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  backdrop-filter: blur(4px);
}
.pwhud__locations {
  display: flex;
  gap: 6px;
  margin-bottom: 7px;
}
.pwhud__locations button {
  flex: 1;
  padding: 4px 0;
  font-size: 11px;
  color: #eaeef4;
  background: rgba(60, 70, 88, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 6px;
  cursor: pointer;
}
.pwhud__locations button:hover {
  background: rgba(88, 100, 122, 0.95);
}
.pwhud__locations button:disabled {
  opacity: 0.5;
  cursor: wait;
}
.pwhud__grid {
  display: grid;
  grid-template-columns: auto 1fr auto 1fr;
  gap: 2px 8px;
  margin-bottom: 6px;
}
.pwhud__grid span {
  color: #9aa3b0;
}
.pwhud__grid b {
  font-family: ui-monospace, Menlo, monospace;
  font-weight: 500;
  color: #ffffff;
  text-align: right;
}
.pwhud__help {
  font-size: 9.5px;
  color: #9aa3b0;
}
.pwhud__banner {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  padding: 6px 14px;
  font-family: system-ui, sans-serif;
  font-size: 12px;
  color: #eaeef4;
  background: rgba(20, 24, 31, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  backdrop-filter: blur(4px);
}
.pwhud__banner[hidden] {
  display: none;
}
`;

const DIRECTIONS = ["北", "北東", "東", "南東", "南", "南西", "西", "北西"];

const ANIM_LABELS: Record<string, string> = {
  Idle: "待機",
  Walk: "歩行",
  Run: "ダッシュ",
};

/** 状態変化が途絶えたら速度表示を 0 に戻すまでの猶予 (ms)。 */
const SPEED_ZERO_DELAY_MS = 300;

export type Hud = {
  /** PersonViewPlugin の状態を反映する。速度は位置差分から実測する。 */
  update(state: PersonViewState): void;
  /** マップモード（カメラ解放）中はワープ案内バナーを出す。 */
  setReleased(released: boolean): void;
  /** ワープ解決中は地点ボタンを無効化する。 */
  setWarpPending(pending: boolean): void;
};

export const createHud = (options: {
  locations: Record<string, LocationPreset>;
  onSelectLocation: (key: string) => void;
}): Hud => {
  const style = document.createElement("style");
  style.textContent = HUD_CSS;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = "pwhud";

  const card = document.createElement("div");
  card.className = "pwhud__card";

  const locationsRow = document.createElement("div");
  locationsRow.className = "pwhud__locations";
  const buttons: HTMLButtonElement[] = [];
  for (const [key, preset] of Object.entries(options.locations)) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = preset.label;
    button.onclick = () => options.onSelectLocation(key);
    buttons.push(button);
    locationsRow.appendChild(button);
  }

  const grid = document.createElement("div");
  grid.className = "pwhud__grid";
  const fields: Record<string, HTMLElement> = {};
  for (const [key, label] of [
    ["lat", "緯度"],
    ["lng", "経度"],
    ["alt", "高度"],
    ["spd", "速度"],
    ["hdg", "方角"],
    ["anim", "状態"],
    ["mode", "視点"],
  ] as const) {
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("b");
    value.textContent = "-";
    fields[key] = value;
    grid.append(name, value);
  }

  const help = document.createElement("div");
  help.className = "pwhud__help";
  help.textContent =
    "WASD 移動 / Shift ダッシュ / V 視点 / 左ドラッグで視点 / Esc マップ⇄歩行 / マップをクリックでワープ";

  card.append(locationsRow, grid, help);
  root.appendChild(card);

  const banner = document.createElement("div");
  banner.className = "pwhud__banner";
  banner.textContent =
    "マップモード — クリックした地点にワープします（Esc で歩行に戻る）";
  banner.hidden = true;
  document.body.appendChild(banner);

  document.body.appendChild(root);

  // プラグインの state.speed は「現在の設定速度」で停止中も 0 にならない
  // ため、HUD では位置差分から実測速度を求める。onStateChange は状態変化
  // 時にだけ発火するので、停止後はタイマーで 0 表示に戻す。
  let lastFix: { lat: number; lng: number; time: number } | undefined;
  let speedZeroTimer: number | undefined;

  const showSpeed = (mps: number) => {
    fields.spd.textContent = `${mps.toFixed(1)} m/s`;
  };

  return {
    update(state) {
      fields.lat.textContent = state.lat.toFixed(5);
      fields.lng.textContent = state.lng.toFixed(5);
      fields.alt.textContent = `${state.alt.toFixed(1)} m`;
      const heading = ((state.heading % 360) + 360) % 360;
      fields.hdg.textContent = `${heading.toFixed(0)}° ${DIRECTIONS[Math.round(heading / 45) % 8]}`;
      fields.anim.textContent =
        ANIM_LABELS[state.animationState ?? ""] ?? state.animationState ?? "-";
      fields.mode.textContent = state.mode === "fpv" ? "一人称" : "三人称";

      const now = performance.now();
      if (lastFix) {
        const dt = (now - lastFix.time) / 1000;
        if (dt > 0) {
          const metersPerDegLat = 110540;
          const metersPerDegLng =
            111320 *
            Math.cos(((lastFix.lat + state.lat) / 2) * (Math.PI / 180));
          const dist = Math.hypot(
            (state.lat - lastFix.lat) * metersPerDegLat,
            (state.lng - lastFix.lng) * metersPerDegLng,
          );
          // ワープ直後の巨大な跳躍は速度として表示しない
          const speed = dist / dt;
          showSpeed(speed < 100 ? speed : 0);
        }
      } else {
        showSpeed(0);
      }
      lastFix = { lat: state.lat, lng: state.lng, time: now };

      if (speedZeroTimer !== undefined) window.clearTimeout(speedZeroTimer);
      speedZeroTimer = window.setTimeout(() => {
        lastFix = undefined;
        showSpeed(0);
      }, SPEED_ZERO_DELAY_MS);
    },
    setReleased(released) {
      banner.hidden = !released;
    },
    setWarpPending(pending) {
      for (const button of buttons) button.disabled = pending;
    },
  };
};
