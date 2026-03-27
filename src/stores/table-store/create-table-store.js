import { create } from 'zustand';

const DEFAULT_PAGE_SIZE = 20;

export function createTableStore() {
  return create((set) => ({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
    globalFilter: '',
    sorting: [],
    columnVisibility: {},
    setPageIndex: (pageIndex) => set({ pageIndex }),
    setPageSize: (pageSize) => set({ pageSize }),
    setGlobalFilter: (globalFilter) => set({ globalFilter, pageIndex: 0 }),
    setSorting: (sorting) => set({ sorting }),
    setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
    reset: () =>
      set({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        globalFilter: '',
        sorting: [],
        columnVisibility: {},
      }),
  }));
}