import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import {
  useCourseCategoriesQuery,
  useCreateCourseCategoryMutation,
} from '@/hooks/queries/use-course-categories';
import { getCourseCategories } from '@/services/get-service';
import { createCourseCategory } from '@/services/create-service';

vi.mock('@/services/get-service', () => ({
  getCourseCategories: vi.fn(),
}));

vi.mock('@/services/create-service', () => ({
  createCourseCategory: vi.fn(),
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

describe('useCourseCategoriesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches course categories', async () => {
    const mockCategories = [
      { id: 1, name: 'Algorithms' },
      { id: 2, name: 'Data Structures' },
    ];
    getCourseCategories.mockResolvedValue(mockCategories);

    const { result } = renderHook(() => useCourseCategoriesQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCategories);
    expect(getCourseCategories).toHaveBeenCalled();
  });
});

describe('useCreateCourseCategoryMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createCourseCategory and invalidates category list on success', async () => {
    const mockResponse = { id: 3, name: 'Web Development' };
    createCourseCategory.mockResolvedValue(mockResponse);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateCourseCategoryMutation({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ name: 'Web Development' });

    expect(createCourseCategory).toHaveBeenCalledWith({ name: 'Web Development' });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('works without options.onSuccess', async () => {
    createCourseCategory.mockResolvedValue({ id: 3, name: 'DevOps' });

    const { result } = renderHook(() => useCreateCourseCategoryMutation(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ name: 'DevOps' });

    expect(createCourseCategory).toHaveBeenCalledWith({ name: 'DevOps' });
  });
});
