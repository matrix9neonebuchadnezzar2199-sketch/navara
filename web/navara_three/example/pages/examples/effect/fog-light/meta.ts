import type { ExampleMeta } from "../../sections";

export default {
  section: "lighting-effect",
  order: 34,
  title: { en: "Fog Light", ja: "Fog Light" },
  description: {
    en: "Render volumetric light with FogLightEffect.",
    ja: "FogLightEffectでボリューメトリックな光を出す。",
  },
  docs: "three_default_descs/effect-desc/fog-light-effect-desc",
} satisfies ExampleMeta;
