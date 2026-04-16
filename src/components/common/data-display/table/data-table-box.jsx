import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Inbox } from 'lucide-react';
import { memo } from 'react';
import { flexRender } from '@tanstack/react-table';

const SKELETON_ROWS = 5;

export const DataTableBox = memo(function DataTableBox({
  table,
  isLoading,
  rows,
  handleRowClick,
  columnsData,
  emptyMessage = 'No data found.',
}) {
  const columnCount =
    columnsData?.length ?? table.getAllLeafColumns().length ?? 0;
  return (
    <div className='rounded-xl border bg-card'>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={`skeleton-${i}-${j}`}>
                    <Skeleton className='h-4 w-3/4' />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className='cursor-pointer'
                onClick={() => handleRowClick(row)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <div className='flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground'>
                  <Inbox className='h-10 w-10 opacity-40' />
                  <p className='text-sm'>{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});
