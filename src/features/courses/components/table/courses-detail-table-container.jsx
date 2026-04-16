import { DataTable } from '@/components/common/data-display/table/data-table';
import { getSectionsColumns } from './section-columns';
import { SECTIONS_TEXTS } from '@/features/sections/constants/sections-text-data';
import { useDeleteSection, useReorderSections } from '@/features/sections/hooks/use-section-mutation';
import { useCourseSectionTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useConfirm } from '@/providers/confirm-dialog-provider';
import { useCallback, useMemo, useState } from 'react';

export default function CourseSectionContainer({
  courseId,
  sections,
  isLoading,
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const tableState = useCourseSectionTableStore();
  const [localSections, setLocalSections] = useState(null);
  const { mutate: reorder } = useReorderSections();
  const { mutate: removeSection } = useDeleteSection();

  const displaySections = localSections ?? sections;

  const handleMoveSection = useCallback((fromIdx, toIdx) => {
    const arr = [...displaySections];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    const reordered = arr.map((s, i) => ({ ...s, sortOrder: i + 1 }));
    setLocalSections(reordered);
    reorder({
      courseId,
      items: reordered.map((s) => ({ id: s.id, sortOrder: s.sortOrder })),
    }, {
      onSuccess: () => setLocalSections(null),
    });
  }, [displaySections, courseId, reorder]);

  const handleManageSection = useCallback(
    (row) => {
      const section = row?.original ?? row;
      router.push(`/admin/courses/${courseId}/sections/${section.id}/lectures`);
    },
    [router, courseId],
  );

  const handleEditSection = useCallback(
    (section) => {
      router.push(`/admin/courses/${courseId}/sections/${section.id}/edit`);
    },
    [router, courseId],
  );

  const handleDeleteSection = useCallback(async (section) => {
    const ok = await confirm({
      title: `Delete "${section.title}"?`,
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'destructive',
    });
    if (!ok) return;
    removeSection({ courseId, sectionId: section.id });
  }, [removeSection, courseId, confirm]);

  const sectionsColumns = useMemo(
    () =>
      getSectionsColumns({
        onManage: handleManageSection,
        onEdit: handleEditSection,
        onDelete: handleDeleteSection,
        onMoveUp: (_, idx) => idx > 0 && handleMoveSection(idx, idx - 1),
        onMoveDown: (_, idx) => idx < displaySections.length - 1 && handleMoveSection(idx, idx + 1),
      }),
    [handleManageSection, handleEditSection, handleDeleteSection, handleMoveSection, displaySections.length],
  );

  return (
    <div className='space-y-4'>
      <DataTable
        data={displaySections}
        isLoading={isLoading}
        texts={SECTIONS_TEXTS.pages.sectionsTable}
        columns={sectionsColumns}
        handleRowClick={handleManageSection}
        {...tableState}
      />
    </div>
  );
}
