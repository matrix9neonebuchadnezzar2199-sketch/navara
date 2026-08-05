/**
 * Top-right controls help for the person-view example: a "?" button that
 * toggles a key-binding card. Presentation only — no Navara API here.
 */

const CONTROLS_CSS = `
.pv-help {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 20;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
}
.pv-help__toggle {
  width: 22px;
  height: 22px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  color: #eaeef4;
  background: rgba(20, 24, 31, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  cursor: pointer;
}
.pv-help__toggle:hover {
  background: rgba(40, 46, 57, 0.9);
}
.pv-help__card {
  min-width: 132px;
  padding: 7px 9px;
  font-size: 10px;
  line-height: 1.35;
  color: #d7dce4;
  background: rgba(20, 24, 31, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  backdrop-filter: blur(4px);
}
.pv-help__title {
  margin-bottom: 5px;
  font-size: 9px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #9aa3b0;
}
.pv-help__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 1px 0;
}
.pv-help__row kbd {
  font-family: ui-monospace, Menlo, monospace;
  font-size: 9px;
  color: #ffffff;
}
`;

// The character walks on the terrain here (collision mode "ground"), so the
// ascend / descend keys are left out — they do nothing in that mode.
const WALKING_BINDINGS: [string, string][] = [
  ["Move", "W / S"],
  ["Turn", "A / D"],
  ["Dash", "Shift"],
  ["First ⇄ third person", "V"],
  ["Free orbit", "Alt + drag"],
  ["Release the camera", "Esc"],
];

// While the plugin is stopped none of the above does anything, so the card
// shows what is actually being driven instead: the map camera.
const RELEASED_BINDINGS: [string, string][] = [
  ["Orbit", "Drag"],
  ["Zoom", "Scroll"],
  ["Back to the character", "Esc"],
];

export type ControlsHelp = {
  /** Collapse the card back to just the "?" button. */
  hide(): void;
  /**
   * Switch the card between walking the character and driving the map camera,
   * revealing it again on the way out so the key back is never hidden.
   */
  setReleased(released: boolean): void;
};

export const createControlsHelp = (): ControlsHelp => {
  const style = document.createElement("style");
  style.textContent = CONTROLS_CSS;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.className = "pv-help";

  const card = document.createElement("div");
  card.className = "pv-help__card";
  const render = (released: boolean) => {
    const bindings = released ? RELEASED_BINDINGS : WALKING_BINDINGS;
    card.innerHTML =
      `<div class="pv-help__title">${released ? "Camera" : "Controls"}</div>` +
      bindings
        .map(
          ([label, keys]) =>
            `<div class="pv-help__row"><span>${label}</span><kbd>${keys}</kbd></div>`,
        )
        .join("");
  };
  render(false);

  const toggle = document.createElement("button");
  toggle.className = "pv-help__toggle";
  toggle.textContent = "?";
  toggle.title = "Toggle controls";
  toggle.onclick = () => {
    card.style.display = card.style.display === "none" ? "" : "none";
  };

  root.append(toggle, card);
  document.body.appendChild(root);

  return {
    hide() {
      card.style.display = "none";
    },
    setReleased(released: boolean) {
      render(released);
      if (released) card.style.display = "";
    },
  };
};
