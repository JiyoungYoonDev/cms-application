import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';

export const getLectureColumns = ({
  onEdit = () => {},
  onDelete = () => {},
  onMoveUp = null,
  onMoveDown = null,
} = {}) => [
  {
    accessorKey: 'sortOrder',
    header: '#',
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground font-mono'>
        {row.original.sortOrder ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.title || 'Untitled'}</span>
    ),
  },
  {
    accessorKey: 'lectureType',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.lectureType ?? 'TEXT';
      return (
        <Badge
          variant='outline'
          className='uppercase text-[10px] px-2 py-0 font-bold border-slate-700 text-slate-400'
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'durationMinutes',
    header: 'Duration',
    cell: ({ row }) => {
      const minutes = row.original.durationMinutes;
      return minutes != null ? `${minutes} min` : '—';
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { isPublished, isPreview } = row.original;
      return (
        <div className='flex gap-1'>
          {isPublished ? (
            <Badge
              variant='outline'
              className='uppercase text-[10px] px-2 py-0 font-bold text-emerald-500 border-emerald-500/30 bg-emerald-500/5'
            >
              Published
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='uppercase text-[10px] px-2 py-0 font-bold text-slate-500 border-slate-700 bg-slate-800/20'
            >
              Draft
            </Badge>
          )}
          {isPreview && (
            <Badge
              variant='outline'
              className='uppercase text-[10px] px-2 py-0 font-bold text-sky-400 border-sky-400/30 bg-sky-400/5'
            >
              Preview
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row, table }) => {
      const lecture = row.original;
      const allRows = table.getRowModel().rows;
      const idx = allRows.findIndex((r) => r.id === row.id);
      const isFirst = idx === 0;
      const isLast = idx === allRows.length - 1;
      return (
        <div className='flex items-center justify-end gap-1'>
          {onMoveUp && (
            <Button
              size='icon'
              variant='ghost'
              disabled={isFirst}
              className='h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20'
              onClick={(e) => { e.stopPropagation(); onMoveUp(lecture, idx); }}
            >
              <ChevronUp size={14} />
            </Button>
          )}
          {onMoveDown && (
            <Button
              size='icon'
              variant='ghost'
              disabled={isLast}
              className='h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800 disabled:opacity-20'
              onClick={(e) => { e.stopPropagation(); onMoveDown(lecture, idx); }}
            >
              <ChevronDown size={14} />
            </Button>
          )}
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-800'
            onClick={(e) => {
              e.stopPropagation();
              onEdit(lecture);
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            size='icon'
            variant='ghost'
            className='h-8 w-8 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10'
            onClick={(e) => {
              e.stopPropagation();
              onDelete(lecture);
            }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      );
    },
  },
];
