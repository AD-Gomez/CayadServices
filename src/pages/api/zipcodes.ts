import type { APIRoute } from 'astro';

// Use the main API base (PUBLIC_API_URL). If undefined, the API will serve
// mock/local results so development isn't blocked.
const BASE = import.meta.env.PUBLIC_API_URL;

const MOCK = [
  { city: 'Miami', state: 'FL', zip_code: '33186' },
  { city: 'Tampa', state: 'FL', zip_code: '33647' },
  { city: 'Orlando', state: 'FL', zip_code: '32801' },
  { city: 'New York', state: 'NY', zip_code: '10001' },
];

export const GET: APIRoute = async ({ url, request }) => {
  const q = (url.searchParams.get('search') || '').trim();

  if (!q || q.length < 2) {
    // Return full mock set for quick dev feedback when query too short
    return new Response(JSON.stringify(MOCK), { status: 200, headers: { 'content-type': 'application/json' } });
  }

  // If a remote base is configured, proxy the request there.
  if (BASE) {
    try {
      const proxyUrl = new URL('/api/zipcodes/', BASE);
      proxyUrl.searchParams.set('search', q);
      const resp = await fetch(proxyUrl.toString(), { method: request.method, headers: request.headers });
      const text = await resp.text();
      return new Response(text, { status: resp.status, headers: { 'content-type': resp.headers.get('content-type') || 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify([]), { status: 200 });
    }
  }

  // Simple local fuzzy match against mock data
  const lower = q.toLowerCase();
  const results = MOCK.filter((it) => {
    return (
      it.city.toLowerCase().includes(lower) ||
      it.state.toLowerCase().includes(lower) ||
      it.zip_code.includes(lower)
    );
  });

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
};

export const POST: APIRoute = GET;
