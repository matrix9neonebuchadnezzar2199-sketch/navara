/**
 * Entry worker for the unified navara.world site. Requests that arrive on the
 * *.workers.dev host (the old navara-docs URL) 301 to the canonical custom
 * domain; everything else falls through to the static assets in site-dist/
 * (where _redirects then maps the old /lp/ paths to the site root).
 */
const CANONICAL = "https://navara.world";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.endsWith(".workers.dev")) {
      return Response.redirect(CANONICAL + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
