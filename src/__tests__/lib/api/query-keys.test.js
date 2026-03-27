import { queryKeys } from '@/lib/api/query-keys';

describe('queryKeys', () => {
  describe('courses', () => {
    it('all returns base key', () => {
      expect(queryKeys.courses.all).toEqual(['courses']);
    });

    it('lists() appends "list"', () => {
      expect(queryKeys.courses.lists()).toEqual(['courses', 'list']);
    });

    it('list() with no params appends empty object', () => {
      expect(queryKeys.courses.list()).toEqual(['courses', 'list', {}]);
    });

    it('list(params) appends the params object', () => {
      const params = { page: 1, size: 10 };
      expect(queryKeys.courses.list(params)).toEqual(['courses', 'list', { page: 1, size: 10 }]);
    });

    it('detail(id) appends "detail" and id', () => {
      expect(queryKeys.courses.detail(5)).toEqual(['courses', 'detail', 5]);
      expect(queryKeys.courses.detail('abc')).toEqual(['courses', 'detail', 'abc']);
    });
  });

  describe('courseCategories', () => {
    it('all returns base key', () => {
      expect(queryKeys.courseCategories.all).toEqual(['course-categories']);
    });

    it('lists() appends "list"', () => {
      expect(queryKeys.courseCategories.lists()).toEqual(['course-categories', 'list']);
    });

    it('list() returns same as lists()', () => {
      expect(queryKeys.courseCategories.list()).toEqual(['course-categories', 'list']);
    });

    it('detail(id) appends "detail" and id', () => {
      expect(queryKeys.courseCategories.detail(3)).toEqual(['course-categories', 'detail', 3]);
    });
  });

  describe('sections', () => {
    it('all returns base key', () => {
      expect(queryKeys.sections.all).toEqual(['sections']);
    });

    it('lists() appends "list"', () => {
      expect(queryKeys.sections.lists()).toEqual(['sections', 'list']);
    });

    it('list(bookId) appends bookId', () => {
      expect(queryKeys.sections.list(42)).toEqual(['sections', 'list', 42]);
    });

    it('detail(bookId, sectionId) appends both ids', () => {
      expect(queryKeys.sections.detail(1, 2)).toEqual(['sections', 'detail', 1, 2]);
    });
  });

  describe('lectures', () => {
    it('all returns base key', () => {
      expect(queryKeys.lectures.all).toEqual(['lectures']);
    });

    it('lists() appends "list"', () => {
      expect(queryKeys.lectures.lists()).toEqual(['lectures', 'list']);
    });

    it('list(sectionId) appends sectionId', () => {
      expect(queryKeys.lectures.list(10)).toEqual(['lectures', 'list', 10]);
    });

    it('detail(sectionId, lectureId) appends both ids', () => {
      expect(queryKeys.lectures.detail(10, 20)).toEqual(['lectures', 'detail', 10, 20]);
    });
  });

  describe('problemBooks', () => {
    it('returns base key array', () => {
      expect(queryKeys.problemBooks).toEqual(['problem-courses']);
    });
  });

  describe('problemBook', () => {
    it('returns key with bookId', () => {
      expect(queryKeys.problemBook(7)).toEqual(['problem-courses', 7]);
    });
  });
});
