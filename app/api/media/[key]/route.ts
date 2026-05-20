export const runtime = 'nodejs';

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000';

type RouteParams = {
  params: Promise<{
    key: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { key } = await params;
  const response = await fetch(`${BACKEND_BASE_URL}/api/media/${encodeURIComponent(key)}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    return new Response(message || 'Media not found', {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  const cacheControl = response.headers.get('cache-control') || 'public, max-age=31536000, immutable';
  headers.set('Cache-Control', cacheControl);

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}