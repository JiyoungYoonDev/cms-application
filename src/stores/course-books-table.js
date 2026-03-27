import { create } from 'zustand';

const DEFAULT_PAGE_SIZE = 20;

export const useCourseBooksTableStore = create((set) => ({
  pageIndex: 0,
  pageSize: DEFAULT_PAGE_SIZE,
  globalFilter: '',
  sorting: [],
  columnVisibility: {},
  setPageIndex: (pageIndex) => set({ pageIndex }),
  setPageSize: (pageSize) => set({ pageSize }),
  setGlobalFilter: (value) => set({ globalFilter: value }),
  setSorting: (sorting) => set({ sorting }),
  setColumnVisibility: (columnVisibility) => set({ columnVisibility }),
}));
