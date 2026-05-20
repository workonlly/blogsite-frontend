export const runtime = 'nodejs';

const BACKEND_BASE_URL = process.env.BACKEND_URL || 'http://localhost:4000';

const isValidPostId = (value: string | undefined) => value !== undefined && value !== '' && value !== 'undefined';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

async function forward(request: Request, url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || request.headers);
  headers.delete('host');

  return fetch(url, {
    ...init,
    headers,
  });
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isValidPostId(id)) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid post id.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await forward(request, `${BACKEND_BASE_URL}/api/posts/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Backend server is unavailable.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isValidPostId(id)) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid post id.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.arrayBuffer();
    const contentType = request.headers.get('content-type') || 'multipart/form-data';

    const response = await forward(request, `${BACKEND_BASE_URL}/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body,
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Backend server is unavailable.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!isValidPostId(id)) {
    return new Response(JSON.stringify({ success: false, message: 'Invalid post id.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await forward(request, `${BACKEND_BASE_URL}/api/delete/${id}`, {
      method: 'DELETE',
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Backend server is unavailable.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}