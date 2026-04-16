'use client';

import { DataTable } from '@/components/common/data-display/table/data-table';
import { getLectureColumns } from './lecture-columns';
import { LECTURES_TEXTS } from '@/features/lectures/constants/lectures-text-data';
import { useDeleteLecture, useReorderLectures } from '@/features/lectures/hooks';
import { useLectureTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function LecturesTableContainer({ sectionId, lectures, isLoading, baseUrl }) {
  const router = useRouter();
  const tableState = useLectureTableStore();
  const [localLectures, setLocalLectures] = useState(null);
  const { mutate: reorder } = useReorderLectures();
  const { mutate: removeLecture } = useDeleteLecture();
  const autoFixedRef = useRef(false);

  // Auto-fix duplicate sort orders (e.g. all 1,1,1)
  useEffect(() => {
    if (!lectures || lectures.length < 2 || autoFixedRef.current) return;
    const sortOrders = lectures.map((l) => l.sortOrder);
    const hasDuplicates = new Set(sortOrders).size < sortOrders.length;
    if (!hasDuplicates) return;

    autoFixedRef.current = true;
    const sorted = [...lectures].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
    const fixed = sorted.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLocalLectures(fixed);
    reorder({
      sectionId,
      items: fixed.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
    });
  }, [lectures, sectionId, reorder]);

  if (!baseUrl) {
    throw new Error('LecturesTableContainer: `baseUrl` prop is required.');
  }

  const displayLectures = localLectures ?? lectures;

  // Sync: clear local state when parent lectures update with matching sort orders
  useEffect(() => {
    if (!localLectures || !lectures || lectures.length === 0) return;
    const parentOrders = lectures.map((l) => `${l.id}:${l.sortOrder}`).join(',');
    const localOrders = localLectures.map((l) => `${l.id}:${l.sortOrder}`).join(',');
    if (parentOrders === localOrders) {
      setLocalLectures(null);
    }
  }, [lectures, localLectures]);

  const handleMoveLecture = useCallback((fromIdx, toIdx) => {
    const arr = [...displayLectures];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    const reordered = arr.map((l, i) => ({ ...l, sortOrder: i + 1 }));
    setLocalLectures(reordered);
    reorder({
      sectionId,
      items: reordered.map((l) => ({ id: l.id, sortOrder: l.sortOrder })),
    });
  }, [displayLectures, sectionId, reorder]);

  const handleEdit = useCallback(
    (lecture) => {
      router.push(`${baseUrl}/${lecture.id}/edit`);
    },
    [router, baseUrl],
  );

  const handleDelete = useCallback((lecture) => {
    if (!window.confirm(`Delete "${lecture.title}"?`)) return;
    removeLecture({ sectionId, lectureId: lecture.id });
  }, [removeLecture, sectionId]);

  const handleRowClick = useCallback(
    (row) => {
      const lecture = row?.original ?? row;
      router.push(`${baseUrl}/${lecture.id}`);
    },
    [router, baseUrl],
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
