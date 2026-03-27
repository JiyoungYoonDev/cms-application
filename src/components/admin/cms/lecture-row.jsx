import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/cms/status-badge';

export function LectureRow({ lecture, onEdit, onDelete, onPreview }) {
  return (
    <div className='flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between'>
      <div>
        <div className='flex flex-wrap items-center gap-2'>
          <h4 className='font-semibold'>{lecture.title}</h4>
          <StatusBadge label={lecture.lectureType} />
          {lecture.isPreview && (
            <StatusBadge label='Preview' variant='default' />
          )}
          {lecture.isPublished && (
            <StatusBadge label='Published' variant='default' />
          )}
        </div>
        <p className='text-xs text-muted-foreground'>{lecture.description}</p>
        <div className='mt-1 text-xs text-muted-foreground'>
          {lecture.durationMinutes} min · Order {lecture.sortOrder}
        </div>
      </div>
      <div className='flex gap-2'>
        <Button size='sm' variant='ghost' onClick={onPreview}>
          Preview
        </Button>
        <Button size='sm' variant='outline' onClick={onEdit}>
          Edit
        </Button>
        <Button size='sm' variant='destructive' onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
