import { DataTable } from '@/components/common/data-display/table/data-table';
import { getSectionsColumns } from '@/constants/table/columns/section-columns';
import { SECTIONS_TEXTS } from '@/features/sections/constants/sections-text-data';
import { useCourseSectionTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export default function CourseSectionContainer({
  courseId,
  sections,
  isLoading,
}) {
  const router = useRouter();
  const tableState = useCourseSectionTableStore();

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

  const handleDeleteSection = useCallback((section) => {
    if (!window.confirm(`Delete ${section.title}?`)) return;
    window.alert('Delete flow placeholder');
  }, []);

  const sectionsColumns = useMemo(
    () =>
      getSectionsColumns({
        onManage: handleManageSection,
        onEdit: handleEditSection,
        onDelete: handleDeleteSection,
      }),
    [handleManageSection, handleEditSection, handleDeleteSection],
  );

  return (
    <div className='space-y-4'>
      <DataTable
        data={sections}
        isLoading={isLoading}
        texts={SECTIONS_TEXTS.pages.sectionsTable}
        columns={sectionsColumns}
        handleRowClick={handleManageSection}
        {...tableState}
      />
    </div>
  );
}
