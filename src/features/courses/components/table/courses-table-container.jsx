import { useCourseTableStore } from '@/stores/table-store';
import { useRouter } from 'next/navigation';
import { useCourses } from '../../hooks/use-course';
import { DataTable } from '@/components/common/data-display/table/data-table';
import { COURSES_TEXTS } from '../../constants/course-text-data';
import { courseColumns } from './course-columns';

export default function CoursesTableContainer() {
  const router = useRouter();
  const tableState = useCourseTableStore();

  const { data: courses, isLoading } = useCourses({
    pageSize: tableState.pageSize,
    enablePagin: false,
  });

  const handleRowClick = (row) => {
    const courseId = row.original?.id;
    if (!courseId) return;
    router.push(`/admin/courses/${courseId}`);
  };

  return (
    <DataTable
      data={courses}
      columns={courseColumns}
      isLoading={isLoading}
      texts={COURSES_TEXTS.pages.coursesTable}
      {...tableState}
      handleRowClick={handleRowClick}
    />
  );
}
