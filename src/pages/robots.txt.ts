import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const body =
    import.meta.env.NOINDEX === 'true'
      ? 'User-agent: *\nDisallow: /\n'
      : 'User-agent: *\nAllow: /\n\nSitemap: https://antoniosimon.es/sitemap-index.xml\n';

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
