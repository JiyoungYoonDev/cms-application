import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useSections } from '@/features/sections/hooks/use-section';
import { useCreateSection } from '@/features/sections/hooks/use-section-mutation';
import {
  getSectionsById,
  createSection,
} from '@/features/sections/services/section-service';

vi.mock('@/features/sections/services/section-service', () => ({
  getSectionsById: vi.fn(),
  createSection: vi.fn(),
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

describe('useSections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches sections by course id', async () => {
    const mockSections = [
      { id: 1, title: 'Section 1' },
      { id: 2, title: 'Section 2' },
    ];
    getSectionsById.mockResolvedValue(mockSections);

    const { result } = renderHook(() => useSections(10), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSections);
    expect(getSectionsById).toHaveBeenCalledWith(10);
  });
});

describe('useCreateSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls createSection and invalidates queries on success', async () => {
    const mockResponse = { id: 1, title: 'New Section' };
    createSection.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateSection(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ bookId: 5, payload: { title: 'New Section' } });

    expect(createSection).toHaveBeenCalledWith({ bookId: 5, payload: { title: 'New Section' } });
  });
});
