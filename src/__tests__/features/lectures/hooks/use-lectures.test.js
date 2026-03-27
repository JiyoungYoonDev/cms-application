import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import {
  useLecture,
  useCreateLecture,
  useUpdateLecture,
} from '@/features/lectures/hooks/use-lectures';
import {
  getLectures,
  createLecture,
  updateLecture,
} from '@/features/lectures/services/lecture-service';

vi.mock('@/features/lectures/services/lecture-service', () => ({
  getLectures: vi.fn(),
  createLecture: vi.fn(),
  updateLecture: vi.fn(),
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

describe('useLecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches lectures by section id', async () => {
    const mockLectures = [{ id: 1, title: 'Lecture 1' }];
    getLectures.mockResolvedValue(mockLectures);

    const { result } = renderHook(() => useLecture(3), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockLectures);
    expect(getLectures).toHaveBeenCalledWith(3);
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHook(() => useLecture(null), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getLectures).not.toHaveBeenCalled();
  });

  it('is disabled when id is undefined', () => {
    const { result } = renderHook(() => useLecture(undefined), { wrapper: createWrapper() });

    expect(result.current.fetchStatus).toBe('idle');
    expect(getLectures).not.toHaveBeenCalled();
  });
});

describe('useCreateLecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createLecture with sectionId and payload', async () => {
    const mockResponse = { id: 1, title: 'New Lecture' };
    createLecture.mockResolvedValue(mockResponse);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCreateLecture({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ sectionId: 5, payload: { title: 'New Lecture' } });

    expect(createLecture).toHaveBeenCalledWith(5, { title: 'New Lecture' });
    expect(onSuccess).toHaveBeenCalledWith(
      mockResponse,
      { sectionId: 5, payload: { title: 'New Lecture' } },
      expect.anything()
    );
  });

  it('works without options.onSuccess', async () => {
    createLecture.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useCreateLecture(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ sectionId: 5, payload: { title: 'Lecture' } });

    expect(createLecture).toHaveBeenCalledWith(5, { title: 'Lecture' });
  });
});

describe('useUpdateLecture', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls updateLecture with sectionId, lectureId, and payload', async () => {
    const mockResponse = { id: 1, title: 'Updated Lecture' };
    updateLecture.mockResolvedValue(mockResponse);

    const onSuccess = vi.fn();
    const { result } = renderHook(() => useUpdateLecture({ onSuccess }), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      sectionId: 5,
      lectureId: 10,
      payload: { title: 'Updated Lecture' },
    });

    expect(updateLecture).toHaveBeenCalledWith(5, 10, { title: 'Updated Lecture' });
    expect(onSuccess).toHaveBeenCalledWith(
      mockResponse,
      { sectionId: 5, lectureId: 10, payload: { title: 'Updated Lecture' } },
      expect.anything()
    );
  });

  it('works without options.onSuccess', async () => {
    updateLecture.mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useUpdateLecture(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      sectionId: 5,
      lectureId: 10,
      payload: { title: 'Updated' },
    });

    expect(updateLecture).toHaveBeenCalledWith(5, 10, { title: 'Updated' });
  });
});
