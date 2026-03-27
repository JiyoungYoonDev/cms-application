describe('lectureRoutes', () => {
  const API_SECTIONS = '/api/sections';
  const API_LECTURES = '/lectures';
  let lectureRoutes;

  beforeAll(async () => {
    vi.stubEnv('NEXT_PUBLIC_API_SECTIONS', API_SECTIONS);
    vi.stubEnv('NEXT_PUBLIC_API_LECTURES', API_LECTURES);
    const mod = await import('@/lib/api/routes/lecture-route');
    lectureRoutes = mod.lectureRoutes;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('list(sectionId) returns lectures URL under section', () => {
    expect(lectureRoutes.list(1)).toBe(`${API_SECTIONS}/1${API_LECTURES}`);
  });

  it('paged(sectionId, page, size) returns URL with query params', () => {
    expect(lectureRoutes.paged(1, 0, 10)).toBe(`${API_SECTIONS}/1${API_LECTURES}?page=0&size=10`);
    expect(lectureRoutes.paged(5, 3, 20)).toBe(`${API_SECTIONS}/5${API_LECTURES}?page=3&size=20`);
  });

  it('create(sectionId) returns lectures URL under section', () => {
    expect(lectureRoutes.create(2)).toBe(`${API_SECTIONS}/2${API_LECTURES}`);
  });

  it('update(sectionId, lectureId) returns specific lecture URL', () => {
    expect(lectureRoutes.update(1, 99)).toBe(`${API_SECTIONS}/1${API_LECTURES}/99`);
  });

  it('delete(sectionId, lectureId) returns specific lecture URL', () => {
    expect(lectureRoutes.delete(3, 7)).toBe(`${API_SECTIONS}/3${API_LECTURES}/7`);
  });
});
