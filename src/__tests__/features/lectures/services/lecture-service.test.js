import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getLectures,
  createLecture,
  updateLecture,
} from '@/features/lectures/services/lecture-service';

vi.mock('@/lib/api/api-client', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/lib/api/routes', () => ({
  lectureRoutes: {
    list: vi.fn((sectionId) => `/api/sections/${sectionId}/lectures`),
    paged: vi.fn(
      (sectionId, page, size) =>
        `/api/sections/${sectionId}/lectures?page=${page}&size=${size}`
    ),
    create: vi.fn((sectionId) => `/api/sections/${sectionId}/lectures`),
    update: vi.fn(
      (sectionId, lectureId) =>
        `/api/sections/${sectionId}/lectures/${lectureId}`
    ),
    delete: vi.fn(
      (sectionId, lectureId) =>
        `/api/sections/${sectionId}/lectures/${lectureId}`
    ),
  },
}));

import { apiFetch } from '@/lib/api/api-client';
import { lectureRoutes } from '@/lib/api/routes';

describe('lecture-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLectures', () => {
    it('should fetch lectures without paging by default', async () => {
      const mockData = [{ id: 1, title: 'Lecture 1' }];
      apiFetch.mockResolvedValue(mockData);

      const result = await getLectures(7);

      expect(lectureRoutes.list).toHaveBeenCalledWith(7);
      expect(apiFetch).toHaveBeenCalledWith('/api/sections/7/lectures');
      expect(result).toEqual(mockData);
    });

    it('should use default page=0, size=20 when not provided', async () => {
      apiFetch.mockResolvedValue([]);

      await getLectures(7);

      expect(lectureRoutes.list).toHaveBeenCalledWith(7);
      expect(lectureRoutes.paged).not.toHaveBeenCalled();
    });

    it('should fetch paged lectures when usePaging is true', async () => {
      const mockData = { content: [], totalPages: 3 };
      apiFetch.mockResolvedValue(mockData);

      const result = await getLectures(7, 1, 15, true);

      expect(lectureRoutes.paged).toHaveBeenCalledWith(7, 1, 15);
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/sections/7/lectures?page=1&size=15'
      );
      expect(result).toEqual(mockData);
    });

    it('should use default page and size with paging enabled', async () => {
      apiFetch.mockResolvedValue({});

      await getLectures(7, 0, 20, true);

      expect(lectureRoutes.paged).toHaveBeenCalledWith(7, 0, 20);
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/sections/7/lectures?page=0&size=20'
      );
    });
  });

  describe('createLecture', () => {
    it('should send POST request with sectionId and payload', async () => {
      const payload = { title: 'New Lecture', content: 'Hello' };
      const mockResponse = { id: 1, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await createLecture(7, payload);

      expect(lectureRoutes.create).toHaveBeenCalledWith(7);
      expect(apiFetch).toHaveBeenCalledWith('/api/sections/7/lectures', {
        method: 'POST',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateLecture', () => {
    it('should send PUT request with sectionId, lectureId, and payload', async () => {
      const payload = { title: 'Updated Lecture' };
      const mockResponse = { id: 5, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await updateLecture(7, 5, payload);

      expect(lectureRoutes.update).toHaveBeenCalledWith(7, 5);
      expect(apiFetch).toHaveBeenCalledWith('/api/sections/7/lectures/5', {
        method: 'PUT',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
