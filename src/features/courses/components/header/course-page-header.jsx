import { Header, HeaderAction } from '@/components/common/layout/page-header';
import Link from 'next/link';
import { COURSE_HEADER_DATA } from '../../constants/course-header-data';

export default function CourseHeader({
  type = 'main',
  variant = 'page',
  course,
  actions,
}) {
  const headerSource = COURSE_HEADER_DATA[type];

  const headerData =
    typeof headerSource === 'function' ? headerSource(course) : headerSource;

  const defaultActions =
    type === 'main' ? (
      <HeaderAction asChild variant='outline'>
        <Link href='/admin/courses/create'>Create Course</Link>
      </HeaderAction>
    ) : null;

  const finalActions = actions ?? defaultActions;

  return (
    <Header
      variant={variant}
      title={headerData?.title}
      description={headerData?.description}
      actions={
        finalActions && (
          <div className='flex items-center gap-2'>{finalActions}</div>
        )
      }
    />
  );
}
