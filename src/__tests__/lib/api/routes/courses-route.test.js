describe('courseRoutes', () => {
  const API_COURSES = '/api/courses';
  let courseRoutes;

  beforeAll(async () => {
    vi.stubEnv('NEXT_PUBLIC_API_COURSES', API_COURSES);
    const mod = await import('@/lib/api/routes/courses-route');
    courseRoutes = mod.courseRoutes;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('list() returns the base courses URL', () => {
    expect(courseRoutes.list()).toBe(API_COURSES);
  });

  it('detail(id) returns courses URL with id', () => {
    expect(courseRoutes.detail(1)).toBe(`${API_COURSES}/1`);
    expect(courseRoutes.detail('abc')).toBe(`${API_COURSES}/abc`);
  });

  it('paged(page, size) returns URL with query params', () => {
    expect(courseRoutes.paged(0, 10)).toBe(`${API_COURSES}?page=0&size=10`);
    expect(courseRoutes.paged(2, 25)).toBe(`${API_COURSES}?page=2&size=25`);
  });

  it('create() returns the base courses URL', () => {
    expect(courseRoutes.create()).toBe(API_COURSES);
  });

  it('update(id) returns courses URL with id', () => {
    expect(courseRoutes.update(5)).toBe(`${API_COURSES}/5`);
  });

  it('delete(id) returns courses URL with id', () => {
    expect(courseRoutes.delete(3)).toBe(`${API_COURSES}/3`);
  });
});
