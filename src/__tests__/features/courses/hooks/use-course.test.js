import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import {
  useCourse,
  useCourses,
  useCreateCourse,
  useUpdateCourse,
} from '@/features/courses/hooks/use-course';
import {
  getCourseById,
  getCourses,
  createCourse,
  updateCourseMutation,
} from '@/features/courses/services/course-service';

vi.mock('@/features/courses/services/course-service', () => ({
  getCourseById: vi.fn(),
  getCourses: vi.fn(),
  createCourse: vi.fn(),
  updateCourseMutation: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches course by id', async () => {
    const mockCourse = { id: 1, title: 'Test Course' };
    getCourseById.mockResolvedValue(mockCourse);

    const { result } = renderHook(() => useCourse(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCourse);
    expect(getCourseById).toHaveBeenCalledWith(1);
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useCourse(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCourseById).not.toHaveBeenCalled();
  });

  it('is disabled when id is undefined', () => {
    const { result } = renderHook(() => useCourse(undefined), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getCourseById).not.toHaveBeenCalled();
  });
});

describe('useCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches courses with default params', async () => {
    const mockCourses = [{ id: 1, title: 'Course 1' }];
    getCourses.mockResolvedValue(mockCourses);

    const { result } = renderHook(() => useCourses(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCourses);
    expect(getCourses).toHaveBeenCalledWith({});
  });

  it('fetches courses with custom params', async () => {
    const mockCourses = [{ id: 2, title: 'Course 2' }];
    const params = { page: 1, size: 10 };
    getCourses.mockResolvedValue(mockCourses);

    const { result } = renderHook(() => useCourses(params), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCourses);
    expect(getCourses).toHaveBeenCalledWith(params);
  });
});

describe('useCreateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createCourse and invalidates course lists on success', async () => {
    const mockResponse = { id: 1, title: 'New Course' };
    createCourse.mockResolvedValue(mockResponse);

    const wrapper = createWrapper();
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCreateCourse({ onSuccess }), { wrapper });

    await result.current.mutateAsync({ title: 'New Course' });

    expect(createCourse).toHaveBeenCalledWith({ title: 'New Course' });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls createCourse without options.onSuccess', async () => {
    const mockResponse = { id: 1, title: 'New Course' };
    createCourse.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateCourse(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ title: 'New Course' });

    expect(createCourse).toHaveBeenCalledWith({ title: 'New Course' });
  });
});

describe('useUpdateCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls updateCourseMutation with id and payload', async () => {
    const mockResponse = { id: 1, title: 'Updated Course' };
    updateCourseMutation.mockResolvedValue(mockResponse);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateCourse({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ id: 1, payload: { title: 'Updated Course' } });

    expect(updateCourseMutation).toHaveBeenCalledWith(1, { title: 'Updated Course' });
    expect(onSuccess).toHaveBeenCalledWith(
      mockResponse,
      { id: 1, payload: { title: 'Updated Course' } },
      expect.anything()
    );
  });

  it('works without options.onSuccess', async () => {
    updateCourseMutation.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useUpdateCourse(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: 1, payload: { title: 'Updated' } });

    expect(updateCourseMutation).toHaveBeenCalledWith(1, { title: 'Updated' });
  });
});
