import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSectionsById,
  createSection,
} from '@/features/sections/services/section-service';

vi.mock('@/lib/api/api-client', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@/lib/api/routes', () => ({
  sectionRoutes: {
    list: vi.fn((courseId) => `/api/courses/${courseId}/sections`),
    create: vi.fn((courseId) => `/api/courses/${courseId}/sections`),
    detail: vi.fn(
      (courseId, sectionId) => `/api/courses/${courseId}/sections/${sectionId}`
    ),
    update: vi.fn(
      (courseId, sectionId) => `/api/courses/${courseId}/sections/${sectionId}`
    ),
    remove: vi.fn(
      (courseId, sectionId) => `/api/sections/${courseId}/sections/${sectionId}`
    ),
  },
}));

import { apiFetch } from '@/lib/api/api-client';
import { sectionRoutes } from '@/lib/api/routes';

describe('section-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSectionsById', () => {
    it('should fetch sections for a given course id', async () => {
      const mockSections = [
        { id: 1, title: 'Section 1' },
        { id: 2, title: 'Section 2' },
      ];
      apiFetch.mockResolvedValue(mockSections);

      const result = await getSectionsById(5);

      expect(sectionRoutes.list).toHaveBeenCalledWith(5);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/5/sections');
      expect(result).toEqual(mockSections);
    });

    it('should return empty array when no sections exist', async () => {
      apiFetch.mockResolvedValue([]);

      const result = await getSectionsById(99);

      expect(sectionRoutes.list).toHaveBeenCalledWith(99);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/99/sections');
      expect(result).toEqual([]);
    });
  });

  describe('createSection', () => {
    it('should send POST request with bookId and payload', async () => {
      const payload = { title: 'New Section', order: 1 };
      const mockResponse = { id: 10, ...payload };
      apiFetch.mockResolvedValue(mockResponse);

      const result = await createSection({ bookId: 3, payload });

      expect(sectionRoutes.create).toHaveBeenCalledWith(3);
      expect(apiFetch).toHaveBeenCalledWith('/api/courses/3/sections', {
        method: 'POST',
        body: payload,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
