import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 7,
  title: { en: "Person walk with map warp", ja: "人物ウォーク＋マップワープ" },
  description: {
    en: "Walk a human character over terrain with a collapsible layer sidebar, PLATEAU buildings, a HUD, and map-click warp.",
    ja: "人間キャラクターを地形に沿って歩かせる。折りたたみレイヤー・PLATEAU 建物・HUD・マップワープ付き。",
  },
  docs: "three_plugins/person-view-plugin",
} satisfies ExampleMeta;
