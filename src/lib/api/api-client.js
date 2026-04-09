const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

let isRefreshing = false;
let refreshPromise = null;

async function readErrorMessage(response) {
  try {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return data?.message || data?.error || null;
    }
    return await response.text();
  } catch {
    return null;
  }
}

async function tryRefreshToken() {
  if (isRefreshing) return refreshPromise;

  isRefreshing = true;
  refreshPromise = fetch(
    API_BASE_URL ? new URL('/api/cms/auth/refresh', API_BASE_URL).toString() : '/api/cms/auth/refresh',
    { method: 'POST', credentials: 'include' },
  )
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

export async function apiFetch(path, options = {}) {
  const url = API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path;
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined;
  let body = options.body;

  if (
    hasBody &&
    body &&
    typeof body === 'object' &&
    !(body instanceof FormData)
  ) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    body = JSON.stringify(body);
  }

  let response = await fetch(url, {
    credentials: 'include',
    ...options,
    headers,
    body,
  });

  // Auto-refresh on 401/403, then retry once
  if ((response.status === 401 || response.status === 403) && !path.includes('/auth/')) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers,
        body,
      });
    }
  }

  if (!response.ok) {
    const message = await readErrorMessage(response);
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
