import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 1,
  title: { en: "Feature selection", ja: "地物選択" },
  description: {
    en: "Click a feature to highlight it and read its coordinates and properties.",
    ja: "地物をクリックしてハイライトし、座標と属性を読み取る。",
  },
  docs: "three/api/picking",
} satisfies ExampleMeta;
