import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourseMutation,
  deleteCourse,
} from '@/features/courses/services/course-service';

vi.mock('@/lib/api/api-client', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/lib/api/routes', () => ({
  courseRoutes: {
    list: vi.fn(() => '/api/courses'),
    paged: vi.fn((page, size) => `/api/courses?page=${page}&size=${size}`),
    detail: vi.fn((id) => `/api/courses/${id}`),
    create: vi.fn(() => '/api/courses'),
    update: vi.fn((id) => `/api/courses/${id}`),
    delete: vi.fn((id) => `/api/courses/${id}`),
  },
}));

import { apiFetch } from '@/lib/api/api-client';
import { courseRoutes } from '@/lib/api/routes';

describe('course-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should fetch courses without paging by default', async () => {
      const mockData = [{ id: 1, title: 'Course 1' }];
      apiFetch.mockResolvedValue(mockData);

      const result = await getCourses();

      expect(courseRoutes.list).toHaveBeenCalled();
      expect(apiFetch).toHaveBeenCalledWith('/api/courses');
      expect(result).toEqual(mockData);
    });

    it('should use default page=0, size=20 when not provided', async () => {
      apiFetch.mockResolvedValue([]);

      await getCourses();

      expect(courseRoutes.list).toHaveBeenCalled();
      expect(courseRoutes.paged).not.toHaveBeenCalled();
    });

    it('should fetch paged courses when usePaging is true', async () => {
      const mockData = { content: [], totalPages: 5 };
      apiFetch.mockResolvedValue(mockData);

      const result = await getCourses(2, 10, true);

      expect(courseRoutes.paged).toHaveBeenCalledWith(2, 10);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses?page=2&size=10');
      expect(result).toEqual(mockData);
    });

    it('should use default page and size with paging enabled', async () => {
      apiFetch.mockResolvedValue({});

      await getCourses(0, 20, true);

      expect(courseRoutes.paged).toHaveBeenCalledWith(0, 20);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses?page=0&size=20');
    });
  });

  describe('getCourseById', () => {
    it('should fetch a single course by id', async () => {
      const mockCourse = { id: 123, title: 'Test Course' };
      apiFetch.mockResolvedValue(mockCourse);

      const result = await getCourseById(123);

      expect(courseRoutes.detail).toHaveBeenCalledWith(123);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/123');
      expect(result).toEqual(mockCourse);
    });
  });

  describe('createCourse', () => {
    it('should send POST request with payload', async () => {
      const payload = { title: 'New Course', description: 'Desc' };
      const mockResponse = { id: 1, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await createCourse(payload);

      expect(courseRoutes.create).toHaveBeenCalled();
      expect(apiFetch).toHaveBeenCalledWith('/api/courses', {
        method: 'POST',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateCourseMutation', () => {
    it('should send PUT request with id and payload', async () => {
      const payload = { title: 'Updated Course' };
      const mockResponse = { id: 42, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await updateCourseMutation(42, payload);

      expect(courseRoutes.update).toHaveBeenCalledWith(42);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/42', {
        method: 'PUT',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCourse', () => {
    it('should send DELETE request with id', async () => {
      apiFetch.mockResolvedValue(undefined);

      await deleteCourse(99);

      expect(courseRoutes.delete).toHaveBeenCalledWith(99);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/99', {
        method: 'DELETE',
      });
    });
  });
});
