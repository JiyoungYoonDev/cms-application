import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createProblemBook,
  updateProblemBook,
  createProblemsBook,
  createCourseCategory,
} from '@/services/create-service';
import {
  getProblemBooks,
  getProblemBook,
  getCourseCategories,
} from '@/services/get-service';

vi.mock('@/lib/api/api-client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '@/lib/api/api-client';

describe('legacy services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── create-service ──

  describe('createProblemBook', () => {
    it('should send POST request to /api/problem-courses', async () => {
      const payload = { problem_title: 'Test' };
      const mockResponse = { id: 1, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await createProblemBook(payload);

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses', {
        method: 'POST',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProblemBook', () => {
    it('should send PUT request to /api/problem-courses/:bookId', async () => {
      const payload = { problem_title: 'Updated' };
      const mockResponse = { id: 10, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await updateProblemBook(10, payload);

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses/10', {
        method: 'PUT',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createProblemsBook', () => {
    it('should transform data and call createProblemBook', async () => {
      const mockResponse = { id: 1 };
      apiFetch.mockResolvedValue(mockResponse);

      const data = {
        title: 'My Problem',
        description: 'A description',
        category: 'algorithms',
        difficulty: '3',
        keywords: 'array, sorting, search',
      };

      const result = await createProblemsBook(data);

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses', {
        method: 'POST',
        body: {
          problem_title: 'My Problem',
          problem_description: 'A description',
          problem_category: 'algorithms',
          problem_difficulty: 3,
          problem_keywords: ['array', 'sorting', 'search'],
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should convert difficulty to a number', async () => {
      apiFetch.mockResolvedValue({});

      await createProblemsBook({
        title: 'T',
        description: 'D',
        category: 'C',
        difficulty: '5',
        keywords: 'k1',
      });

      const callBody = apiFetch.mock.calls[0][1].body;
      expect(callBody.problem_difficulty).toBe(5);
      expect(typeof callBody.problem_difficulty).toBe('number');
    });

    it('should trim keyword whitespace', async () => {
      apiFetch.mockResolvedValue({});

      await createProblemsBook({
        title: 'T',
        description: 'D',
        category: 'C',
        difficulty: '1',
        keywords: ' dp , greedy , math ',
      });

      const callBody = apiFetch.mock.calls[0][1].body;
      expect(callBody.problem_keywords).toEqual(['dp', 'greedy', 'math']);
    });

    it('should handle single keyword without commas', async () => {
      apiFetch.mockResolvedValue({});

      await createProblemsBook({
        title: 'T',
        description: 'D',
        category: 'C',
        difficulty: '1',
        keywords: 'recursion',
      });

      const callBody = apiFetch.mock.calls[0][1].body;
      expect(callBody.problem_keywords).toEqual(['recursion']);
    });
  });

  describe('createCourseCategory', () => {
    it('should send POST request to course categories endpoint', async () => {
      const payload = { name: 'Backend' };
      const mockResponse = { id: 1, name: 'Backend' };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await createCourseCategory(payload);

      expect(apiFetch).toHaveBeenCalledWith('/api/course-categories', {
        method: 'POST',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  // ── get-service ──

  describe('getProblemBooks', () => {
    it('should fetch all problem books without paging by default', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      apiFetch.mockResolvedValue(mockData);

      const result = await getProblemBooks();

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses');
      expect(result).toEqual(mockData);
    });

    it('should not use paging when usePaging is false', async () => {
      apiFetch.mockResolvedValue([]);

      await getProblemBooks(2, 10, false);

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses');
    });

    it('should fetch paged problem books when usePaging is true', async () => {
      const mockData = { content: [], totalPages: 5 };
      apiFetch.mockResolvedValue(mockData);

      const result = await getProblemBooks(2, 10, true);

      expect(apiFetch).toHaveBeenCalledWith(
        '/api/problem-courses?page=2&size=10'
      );
      expect(result).toEqual(mockData);
    });

    it('should use default page=0, size=20 with paging enabled', async () => {
      apiFetch.mockResolvedValue({});

      await getProblemBooks(0, 20, true);

      expect(apiFetch).toHaveBeenCalledWith(
        '/api/problem-courses?page=0&size=20'
      );
    });
  });

  describe('getProblemBook', () => {
    it('should fetch a single problem book by id', async () => {
      const mockData = { id: 42, problem_title: 'Test' };
      apiFetch.mockResolvedValue(mockData);

      const result = await getProblemBook(42);

      expect(apiFetch).toHaveBeenCalledWith('/api/problem-courses/42');
      expect(result).toEqual(mockData);
    });
  });

  describe('getCourseCategories', () => {
    it('should fetch course categories', async () => {
      const mockData = [{ id: 1, name: 'Frontend' }];
      apiFetch.mockResolvedValue(mockData);

      const result = await getCourseCategories();

      expect(apiFetch).toHaveBeenCalledWith('/api/course-categories');
      expect(result).toEqual(mockData);
    });
  });
});
