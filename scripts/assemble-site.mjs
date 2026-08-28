// Assembles the unified navara.world static-asset tree (site-dist/) from the
// docs (Astro, built with base "/docs") and examples (Vite, base "/examples/")
// build outputs:
//
//   site-dist/
//     index.html, ja/index.html      <- LP, relocated from docs/dist/lp/
//     favicon.png, og.jpg, 404.html  <- copied from docs/dist for the site root
//     docs/...                       <- docs/dist verbatim
//     examples/...                   <- web/navara_three/dist-example verbatim
//
// The relocated LP keeps working at the site root because base "/docs" makes
// every _astro asset URL root-absolute (/docs/_astro/...).
import {
  cpSync,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const docsDist = resolve(root, "docs/dist");
const examplesDist = resolve(root, "web/navara_three/dist-example");
const out = resolve(root, "site-dist");

for (const dir of [docsDist, examplesDist]) {
  if (!existsSync(dir)) {
    throw new Error(
      `Missing build output: ${dir} — run \`pnpm build:docs\` and \`pnpm build:example\` first (or \`pnpm build:site\`).`,
    );
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

cpSync(docsDist, resolve(out, "docs"), { recursive: true });

// Relocate the LP pages from /docs/lp/ to the site root.
for (const [from, to] of [
  ["docs/lp/index.html", "index.html"],
  ["docs/ja/lp/index.html", "ja/index.html"],
]) {
  const src = resolve(out, from);
  if (!existsSync(src)) throw new Error(`LP page not found in docs build: ${from}`);
  mkdirSync(dirname(resolve(out, to)), { recursive: true });
  renameSync(src, resolve(out, to));
  rmSync(dirname(src), { recursive: true });
}

// Root-level shared files: default favicon requests and the site og image
// (referenced as https://navara.world/og.jpg).
for (const file of ["favicon.png", "og.jpg"]) {
  const src = resolve(out, "docs", file);
  if (!existsSync(src)) throw new Error(`Expected file missing in docs build: ${file}`);
  cpSync(src, resolve(out, file));
}

// Site-wide 404 page, covering everything outside /docs (Workers assets
// serves the nearest 404.html; /docs/* keeps Starlight's own 404).
cpSync(resolve(root, "site/404.html"), resolve(out, "404.html"));

cpSync(examplesDist, resolve(out, "examples"), { recursive: true });

// The old LP URLs (parked under /lp pre-release) 301 to the site root, with
// and without the trailing slash (_redirects matches paths exactly).
const redirects = [
  "/lp / 301",
  "/lp/ / 301",
  "/ja/lp /ja/ 301",
  "/ja/lp/ /ja/ 301",
];
writeFileSync(resolve(out, "_redirects"), redirects.join("\n") + "\n");

console.log(`Assembled ${out}`);
