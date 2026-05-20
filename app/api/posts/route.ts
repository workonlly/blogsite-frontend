export const runtime = 'nodejs';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

async function proxyToBackend(request: Request, init: RequestInit = {}) {
  const backendUrl = `${BACKEND_BASE_URL}/api/posts`;
  const headers = new Headers(init.headers || request.headers);
  headers.delete('host');

  return fetch(backendUrl, {
    ...init,
    headers,
  });
}

export async function GET(request: Request) {
  try {
    const response = await proxyToBackend(request, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Backend server is unavailable.' }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || 'multipart/form-data';

    const response = await fetch(`${BACKEND_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body,
    });

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Backend server is unavailable.' }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}