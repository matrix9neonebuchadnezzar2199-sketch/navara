import type { ExampleMeta } from "../../sections";

export default {
  section: "styling",
  order: 2,
  title: { en: "Color by Attribute", ja: "属性で色分け" },
  description: {
    en: "Color 3D Tiles buildings from a feature attribute with FeatureEvaluator.",
    ja: "FeatureEvaluator で 3D Tiles の建物を属性値に応じて色分けする。",
  },
  docs: "three/api/feature-evaluator",
} satisfies ExampleMeta;
