/**
 * Prefixes a site-internal path or public asset with the deploy base
 * ("/examples/" on navara.world and in the dev server, "/" under vitest).
 */
export function withBase(path: string): string {
  return (
    import.meta.env.BASE_URL.replace(/\/$/, "") + "/" + path.replace(/^\//, "")
  );
}
