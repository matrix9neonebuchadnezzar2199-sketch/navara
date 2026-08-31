import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 7,
  title: { en: "Person walk with map warp", ja: "人物ウォーク＋マップワープ" },
  description: {
    en: "Walk a human character over terrain with a HUD, and warp anywhere by clicking the map.",
    ja: "人間キャラクターを地形に沿って歩かせる。HUD 付き。マップクリックで任意地点へワープ。",
  },
  docs: "three_plugins/person-view-plugin",
} satisfies ExampleMeta;
