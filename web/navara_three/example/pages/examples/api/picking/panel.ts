/**
 * Floating info card for the picking example. The OverlayPlugin projects the
 * picked point every frame and calls `moveTo`, so the card stays anchored to
 * that geographic location as the camera moves — presentation only, no Navara
 * API lives here.
 */

const PANEL_CSS = `
.picking-panel {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  min-width: 180px;
  max-width: 260px;
  padding: 12px 14px;
  font-family: system-ui, sans-serif;
  color: #1b1f24;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid #e2e5e9;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
  pointer-events: none;
  will-change: transform;
}
.picking-panel__name {
  margin-bottom: 2px;
  font-size: 15px;
  font-weight: 700;
}
.picking-panel__kind {
  margin-bottom: 10px;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ff6b2c;
}
.picking-panel__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 3px 0;
  font-size: 12px;
  border-top: 1px solid #f0f2f4;
}
.picking-panel__row span:first-child {
  color: #8a929b;
}
.picking-panel__row span:last-child {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
`;

export type LngLat = { lng: number; lat: number };

export type InfoPanel = {
  /** Select a feature: fill the card with its info (kept until {@link hide}). */
  show(properties: Record<string, unknown>, lngLat: LngLat): void;
  /** Reveal the card at screen position (x, y) — the anchored point is visible. */
  moveTo(x: number, y: number): void;
  /** Hide the card while keeping the selection — the point is off-screen. */
  conceal(): void;
  /** Deselect: hide the card and drop the selection. */
  hide(): void;
};

const row = (label: string, value: string): string =>
  `<div class="picking-panel__row"><span>${label}</span><span>${value}</span></div>`;

export const createInfoPanel = (): InfoPanel => {
  const style = document.createElement("style");
  style.textContent = PANEL_CSS;
  document.head.appendChild(style);

  const el = document.createElement("div");
  el.className = "picking-panel";
  el.style.display = "none";
  document.body.appendChild(el);

  // A feature is selected. The card is only shown while its anchor point also
  // projects to the screen (see moveTo / conceal), so it never sticks to an
  // edge once the point leaves the view.
  let selected = false;

  return {
    show(properties, lngLat) {
      const name = (properties["name"] as string) ?? "Unnamed place";
      const kind =
        (properties["pmap:kind"] as string) ??
        (properties["kind"] as string) ??
        "place";

      const population = Number(properties["population"]);
      const rows =
        row("Longitude", `${lngLat.lng.toFixed(5)}°`) +
        row("Latitude", `${lngLat.lat.toFixed(5)}°`) +
        (population > 0 ? row("Population", population.toLocaleString()) : "");

      el.innerHTML =
        `<div class="picking-panel__name">${name}</div>` +
        `<div class="picking-panel__kind">${kind}</div>` +
        rows;
      selected = true;
    },
    // Offset the card up and to the right of the anchored point.
    moveTo(x, y) {
      if (!selected) return;
      el.style.transform = `translate(${x + 14}px, ${y - 12}px)`;
      el.style.display = "";
    },
    conceal() {
      el.style.display = "none";
    },
    hide() {
      selected = false;
      el.style.display = "none";
    },
  };
};
