describe('sectionRoutes', () => {
  const API_COURSES = '/api/courses';
  const API_SECTIONS = '/api/sections';
  let sectionRoutes;

  beforeAll(async () => {
    vi.stubEnv('NEXT_PUBLIC_API_COURSES', API_COURSES);
    vi.stubEnv('NEXT_PUBLIC_API_SECTIONS', API_SECTIONS);
    const mod = await import('@/lib/api/routes/section-route');
    sectionRoutes = mod.sectionRoutes;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('create(courseId) returns nested sections URL under course', () => {
    expect(sectionRoutes.create(1)).toBe(`${API_COURSES}/1/sections`);
  });

  it('list(courseId) returns nested sections URL under course', () => {
    expect(sectionRoutes.list(42)).toBe(`${API_COURSES}/42/sections`);
  });

  it('detail(courseId, sectionId) returns specific section URL under course', () => {
    expect(sectionRoutes.detail(1, 2)).toBe(`${API_COURSES}/1/sections/2`);
  });

  it('update(courseId, sectionId) returns specific section URL under course', () => {
    expect(sectionRoutes.update(3, 7)).toBe(`${API_COURSES}/3/sections/7`);
  });

  it('remove(courseId, sectionId) uses SECTION_BASE instead of COURSES_BASE', () => {
    expect(sectionRoutes.remove(5, 10)).toBe(`${API_SECTIONS}/5/sections/10`);
  });
});
