'use client';

import { DataTable } from '@/components/common/data-display/table/data-table';
import { getLectureColumns } from '@/constants/table/columns/lecture-columns';
import { LECTURES_TEXTS } from '@/features/lectures/constants/lectures-text-data';
import { useLectureTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function LecturesTableContainer({ sectionId, lectures, isLoading, baseUrl }) {
  const router = useRouter();
  const tableState = useLectureTableStore();

  const resolvedBaseUrl = baseUrl ?? `/admin/sections/${sectionId}/lectures`;

  const handleEdit = useCallback(
    (lecture) => {
      router.push(`${resolvedBaseUrl}/${lecture.id}/edit`);
    },
    [router, resolvedBaseUrl],
  );

  const handleDelete = useCallback((lecture) => {
    if (!window.confirm(`Delete "${lecture.title}"?`)) return;
    window.alert('Delete flow placeholder');
  }, []);

  const handleRowClick = useCallback(
    (row) => {
      const lecture = row?.original ?? row;
      router.push(`${resolvedBaseUrl}/${lecture.id}`);
    },
    [router, resolvedBaseUrl],
  );

  const columns = useMemo(
    () =>
      getLectureColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete],
  );

  return (
    <DataTable
      data={lectures}
      isLoading={isLoading}
      texts={LECTURES_TEXTS.pages.lecturesTable}
      columns={columns}
      handleRowClick={handleRowClick}
      {...tableState}
    />
  );
}
