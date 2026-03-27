import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Settings2, Trash2 } from 'lucide-react';

export const getSectionsColumns = ({
  onManage = () => {},
  onEdit = () => {},
  onDelete = () => {},
} = {}) => [
  {
    accessorKey: 'problem_title',
    header: 'Title',
    cell: ({ row }) =>
      row.original.problem_title || row.original.title || 'Untitled',
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => row.original.description,
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
          variant='outline'
          className={`uppercase text-[10px] px-2 py-0 font-bold border-slate-700 ${
            status === 'PUBLISHED'
              ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
              : 'text-slate-500 border-slate-700 bg-slate-800/20'
          }`}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const section = row.original;
      return (
        <div className='flex items-center justify-end gap-1'>
          <Button
            size='sm'
            variant='ghost'
            className='h-8 gap-1.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800'
            onClick={(event) => {
              event.stopPropagation();
              onManage(section);
            }}
          >
            <Settings2 size={14} />
            Manage
          </Button>

          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800'
            onClick={(event) => {
              event.stopPropagation();
              onEdit(section);
            }}
          >
            <Pencil size={14} />
          </Button>

          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10'
            onClick={(event) => {
              event.stopPropagation();
              onDelete(section);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      );
    },
  },
];
