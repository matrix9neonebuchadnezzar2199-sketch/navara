import type { ExampleMeta } from "../../sections";

export default {
  section: "lighting-effect",
  order: 32,
  title: { en: "Color Grading LUT", ja: "Color Grading LUT" },
  description: {
    en: "Regrade the whole scene with LUT film looks.",
    ja: "LUT でシーン全体の色調をフィルム調に変える。",
  },
  docs: "three_default_descs/effect-desc/color-grading-lut-effect-desc",
} satisfies ExampleMeta;
