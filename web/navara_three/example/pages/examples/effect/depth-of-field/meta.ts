import type { ExampleMeta } from "../../sections";

export default {
  section: "lighting-effect",
  order: 33,
  title: { en: "Depth of Field", ja: "Depth of Field" },
  description: {
    en: "Blur the scene around a movable focus plane.",
    ja: "フォーカス面の前後を被写界深度でぼかす。",
  },
  docs: "three_default_descs/effect-desc/depth-of-field-effect-desc",
} satisfies ExampleMeta;
