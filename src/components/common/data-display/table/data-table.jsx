import { Input } from '@/components/ui/input';
import {
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { memo, useMemo } from 'react';
import {
  EMPTY_ROWS,
  getPageItems,
  getPaginationItems,
  getTotalCount,
} from './data-table.utils';
import { DataTableBox } from './data-table-box';
import { DataTablePagination } from './data-table-pagination';
import { Header } from '../../layout/page-header';

export const DataTable = memo(function DataTable({
  data,
  texts,
  columns,
  globalFilter = '',
  sorting = [],
  columnVisibility = {},
  setGlobalFilter = () => {},
  setSorting = () => {},
  setColumnVisibility = () => {},
  isLoading = false,
  pageSize = 20,
  pageIndex = 0,
  setPageIndex = () => {},
  setPageSize = () => {},
  handleRowClick = () => {},
}) {
  const normalizedData = useMemo(() => {
    if (Array.isArray(data)) return data;
    if (data?.pages) {
      return data.pages.flatMap((page) => getPageItems(page));
    }
    if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      if (keys.length && keys.every((key) => /^\d+$/.test(key))) {
        return Object.values(data);
      }
    }
    return data?.data ?? data?.items ?? data?.results ?? data ?? EMPTY_ROWS;
  }, [data]);

  const table = useReactTable({
    data: normalizedData,
    columns,
    state: {
      globalFilter,
      sorting,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const filteredRows = table.getRowModel().rows;
  const totalPages = Math.max(
    Math.ceil(filteredRows.length / pageSize) || 1,
    1,
  );
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const rows = filteredRows.slice(startIndex, endIndex);
  const paginationItems = getPaginationItems(currentPage, totalPages, 5);

  const totalCount = useMemo(() => {
    if (data?.pages?.length) {
      const firstPage = data.pages[0];
      return getTotalCount(firstPage);
    }
    return null;
  }, [data]);

  return (
    <div className='space-y-4'>
      <Header
        variant='section'
        title={texts.title}
        description={texts.description}
        actions={
          <Input
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder='Search by title or category...'
            className='max-w-xs'
          />
        }
      />

      <DataTableBox
        table={table}
        isLoading={isLoading}
        rows={rows}
        handleRowClick={handleRowClick}
        columns={columns}
        emptyMessage={texts.emptyMessage}
      />

      <DataTablePagination
        rowsCount={rows.length}
        totalCount={totalCount}
        currentPage={currentPage}
        totalPages={totalPages}
        paginationItems={paginationItems}
        onFirst={() => setPageIndex(0)}
        onPrev={() => setPageIndex(Math.max(currentPage - 1, 0))}
        onPageClick={setPageIndex}
        onNext={() => setPageIndex(Math.min(currentPage + 1, totalPages - 1))}
        onLast={() => setPageIndex(totalPages - 1)}
      />
    </div>
  );
});
