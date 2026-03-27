import { Badge } from '@/components/ui/badge';

export const courseColumns = [
  {
    accessorKey: 'problem_title',
    header: 'Title',
    cell: ({ row }) =>
      row.original.problem_title || row.original.title || 'Untitled',
  },
  {
    accessorKey: 'course_category',
    header: 'Category',
    cell: ({ row }) => {
      const rawCategory =
        row.original.course_category ?? row.original.category ?? null;

      if (!rawCategory) return '—';
      if (typeof rawCategory === 'string') return rawCategory;
      return rawCategory.category_name || rawCategory.categoryName || '—';
    },
  },
  {
    accessorKey: 'book_difficulty',
    header: 'Difficulty',
    cell: ({ row }) => row.original.book_difficulty || row.original.difficulty,
  },
  {
    accessorKey: 'hours',
    header: 'Hours',
    cell: ({ row }) => row.original.hours ?? '—',
  },
  {
    accessorKey: 'book_projects_count',
    header: 'Projects',
    cell: ({ row }) =>
      row.original.book_projects_count ?? row.original.projects_count ?? '—',
  },
  {
    accessorKey: 'learners_count',
    header: 'Learners',
    cell: ({ row }) => row.original.learners_count ?? '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status || 'DRAFT';
      return (
        <Badge
          variant={status === 'PUBLISHED' ? 'default' : 'secondary'}
          className='uppercase'
        >
          {status}
        </Badge>
      );
    },
  },
];
