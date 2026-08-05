import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 2,
  title: { en: "Person view control", ja: "一人称操作" },
  description: {
    en: "Walk a character up the mountain in first- or third-person view, following the terrain surface.",
    ja: "キャラクターを操作し、一人称/三人称で地形に沿って山を登る。",
  },
  docs: "three_plugins/person-view-plugin",
} satisfies ExampleMeta;
