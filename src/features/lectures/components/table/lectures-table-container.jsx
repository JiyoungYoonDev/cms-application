'use client';

import { DataTable } from '@/components/common/data-display/table/data-table';
import { getLectureColumns } from '@/constants/table/columns/lecture-columns';
import { LECTURES_TEXTS } from '@/features/lectures/constants/lectures-text-data';
import { useDeleteLecture, useReorderLectures } from '@/features/lectures/hooks';
import { useLectureTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';

export default function LecturesTableContainer({ sectionId, lectures, isLoading, baseUrl }) {
  const router = useRouter();
  const tableState = useLectureTableStore();
  const [localLectures, setLocalLectures] = useState(null);
  const { mutate: reorder } = useReorderLectures();
  const { mutate: removeLecture } = useDeleteLecture();

  const displayLectures = localLectures ?? lectures;
  const resolvedBaseUrl = baseUrl ?? `/admin/sections/${sectionId}/lectures`;

  const handleMoveLecture = useCallback((fromIdx, toIdx) => {
    const arr = [...displayLectures];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    const reordered = arr.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLocalLectures(reordered);
    reorder({
      sectionId,
      items: reordered.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
    }, {
      onSuccess: () => setLocalLectures(null),
    });
  }, [displayLectures, sectionId, reorder]);

  const handleEdit = useCallback(
    (lecture) => {
      router.push(`${resolvedBaseUrl}/${lecture.id}/edit`);
    },
    [router, resolvedBaseUrl],
  );

  const handleDelete = useCallback((lecture) => {
    if (!window.confirm(`Delete "${lecture.title}"?`)) return;
    removeLecture({ sectionId, lectureId: lecture.id });
  }, [removeLecture, sectionId]);

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
        onMoveUp: (_, idx) => idx > 0 && handleMoveLecture(idx, idx - 1),
        onMoveDown: (_, idx) => idx < displayLectures.length - 1 && handleMoveLecture(idx, idx + 1),
      }),
    [handleEdit, handleDelete, handleMoveLecture, displayLectures.length],
  );

  return (
    <DataTable
      data={displayLectures}
      isLoading={isLoading}
      texts={LECTURES_TEXTS.pages.lecturesTable}
      columns={columns}
      handleRowClick={handleRowClick}
      {...tableState}
    />
  );
}
