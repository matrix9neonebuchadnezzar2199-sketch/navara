import type { ExampleMeta } from "../../sections";

export default {
  section: "interaction",
  order: 5,
  title: { en: "Geodesic measurement", ja: "測地線の計測" },
  description: {
    en: "Click two points to draw the great-circle path between them with its distance.",
    ja: "2 点をクリックして最短の測地線を描き、距離を計測する。",
  },
  docs: "three/api/navara_three_api",
} satisfies ExampleMeta;
