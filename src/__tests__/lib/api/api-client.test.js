import { apiFetch } from '@/lib/api/api-client';

// Helper to create a realistic Response-like object for fetch mocks
function createMockResponse({
  ok = true,
  status = 200,
  contentType = 'application/json',
  body = null,
} = {}) {
  const headers = new Headers();
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  return {
    ok,
    status,
    headers,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  };
}

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  // 1. Successful GET request returning JSON
  it('returns parsed JSON for a successful JSON response', async () => {
    const payload = { id: 1, name: 'Test Course' };
    global.fetch.mockResolvedValue(
      createMockResponse({ body: payload }),
    );

    const result = await apiFetch('/api/courses');

    expect(result).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // 2. Successful GET request returning text
  it('returns text for a successful text response', async () => {
    global.fetch.mockResolvedValue(
      createMockResponse({ contentType: 'text/plain', body: 'hello world' }),
    );

    const result = await apiFetch('/api/health');

    expect(result).toBe('hello world');
  });

  // 3. 204 No Content returns null
  it('returns null for a 204 No Content response', async () => {
    global.fetch.mockResolvedValue(
      createMockResponse({ status: 204, contentType: null, body: null }),
    );

    const result = await apiFetch('/api/courses/1', { method: 'DELETE' });

    expect(result).toBeNull();
  });

  // 4. POST with object body auto-sets Content-Type and stringifies
  it('auto-sets Content-Type to application/json and stringifies object body', async () => {
    const requestBody = { title: 'New Course' };
    global.fetch.mockResolvedValue(
      createMockResponse({ body: { id: 1, title: 'New Course' } }),
    );

    await apiFetch('/api/courses', { method: 'POST', body: requestBody });

    const [, fetchOptions] = global.fetch.mock.calls[0];
    expect(fetchOptions.body).toBe(JSON.stringify(requestBody));
    expect(fetchOptions.headers.get('Content-Type')).toBe('application/json');
  });

  // 5. POST with FormData does NOT set Content-Type and does NOT stringify
  it('does not set Content-Type or stringify FormData body', async () => {
    const formData = new FormData();
    formData.append('file', 'blob-content');

    global.fetch.mockResolvedValue(
      createMockResponse({ body: { success: true } }),
    );

    await apiFetch('/api/upload', { method: 'POST', body: formData });

    const [, fetchOptions] = global.fetch.mock.calls[0];
    expect(fetchOptions.body).toBe(formData);
    expect(fetchOptions.headers.has('Content-Type')).toBe(false);
  });

  // 6. POST with custom Content-Type header preserves it
  it('preserves a custom Content-Type header when provided', async () => {
    const requestBody = { data: 'value' };
    global.fetch.mockResolvedValue(
      createMockResponse({ body: { ok: true } }),
    );

    await apiFetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: requestBody,
    });

    const [, fetchOptions] = global.fetch.mock.calls[0];
    expect(fetchOptions.headers.get('Content-Type')).toBe('application/xml');
    // Body should still be stringified since it's a plain object
    expect(fetchOptions.body).toBe(JSON.stringify(requestBody));
  });

  // 7. Error response with JSON `message` field
  it('throws with JSON message field on error response', async () => {
    global.fetch.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 400,
        body: { message: 'Validation failed' },
      }),
    );

    await expect(apiFetch('/api/courses')).rejects.toThrow('Validation failed');
  });

  // 8. Error response with JSON `error` field
  it('throws with JSON error field when message is absent', async () => {
    global.fetch.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 403,
        body: { error: 'Forbidden' },
      }),
    );

    await expect(apiFetch('/api/courses')).rejects.toThrow('Forbidden');
  });

  // 9. Error response with text message
  it('throws with text body on error response with non-JSON content', async () => {
    global.fetch.mockResolvedValue(
      createMockResponse({
        ok: false,
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      }),
    );

    await expect(apiFetch('/api/courses')).rejects.toThrow('Internal Server Error');
  });

  // 10. Error response with no readable body falls back to status message
  it('falls back to status-based message when error body is unreadable', async () => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    global.fetch.mockResolvedValue({
      ok: false,
      status: 502,
      headers,
      json: vi.fn().mockRejectedValue(new Error('parse error')),
      text: vi.fn().mockRejectedValue(new Error('read error')),
    });

    await expect(apiFetch('/api/courses')).rejects.toThrow(
      'Request failed with status 502',
    );
  });

  // 11. API_BASE_URL behavior
  describe('API_BASE_URL handling', () => {
    it('uses path as-is when API_BASE_URL is empty (default)', async () => {
      global.fetch.mockResolvedValue(
        createMockResponse({ body: { ok: true } }),
      );

      await apiFetch('/api/courses');

      const [url] = global.fetch.mock.calls[0];
      expect(url).toBe('/api/courses');
    });

    it('constructs full URL when API_BASE_URL is set', async () => {
      // Since API_BASE_URL is captured at module load time, we need to
      // reset modules and re-import with a different env value.
      vi.resetModules();

      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.com';

      const { apiFetch: apiFetchWithBase } = await import('@/lib/api/api-client');

      global.fetch = vi.fn().mockResolvedValue(
        createMockResponse({ body: { ok: true } }),
      );

      await apiFetchWithBase('/api/courses');

      const [url] = global.fetch.mock.calls[0];
      expect(url).toBe('https://api.example.com/api/courses');

      // Clean up env
      delete process.env.NEXT_PUBLIC_API_BASE_URL;
    });
  });

  // 12. Passes through other fetch options
  it('passes through additional fetch options like method and signal', async () => {
    const controller = new AbortController();

    global.fetch.mockResolvedValue(
      createMockResponse({ body: { id: 1 } }),
    );

    await apiFetch('/api/courses', {
      method: 'PUT',
      signal: controller.signal,
      credentials: 'include',
    });

    const [, fetchOptions] = global.fetch.mock.calls[0];
    expect(fetchOptions.method).toBe('PUT');
    expect(fetchOptions.signal).toBe(controller.signal);
    expect(fetchOptions.credentials).toBe('include');
  });
});
