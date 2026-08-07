import type { ExampleMeta } from "../../sections";

export default {
  section: "lighting-effect",
  order: 30,
  title: { en: "Selective Bloom", ja: "Selective Bloom" },
  description: {
    en: "Make selected objects glow with bloom.",
    ja: "指定したオブジェクトをブルームで発光させる。",
  },
  docs: "three_default_descs/effect-desc/selective-bloom-effect-desc",
} satisfies ExampleMeta;
