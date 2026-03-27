const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

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

export async function apiFetch(path, options = {}) {
  const url = API_BASE_URL ? new URL(path, API_BASE_URL).toString() : path;
  const headers = new Headers(options.headers || {});
  const hasBody = options.body !== undefined;
  let body = options.body;

  console.log("url ", url)
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

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });
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
  console.log("RESPONSE ", response.text)

  return response.text();
}
