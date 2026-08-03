import type { ExampleMeta } from "../../sections";

export default {
  section: "styling",
  order: 3,
  title: { en: "Filter by Attribute", ja: "属性でフィルタ" },
  description: {
    en: "Show or hide 3D Tiles buildings by attribute with FeatureEvaluator.",
    ja: "FeatureEvaluator で 3D Tiles の建物を属性値で表示/非表示にする。",
  },
  docs: "three/api/feature-evaluator",
} satisfies ExampleMeta;
