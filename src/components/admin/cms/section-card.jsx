import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/admin/cms/status-badge';

export function SectionCard({
  section,
  lectureCount,
  onManage,
  onEdit,
  onDelete,
}) {
  return (
    <div className='rounded-2xl border bg-card p-6 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <h3 className='text-lg font-semibold'>{section.title}</h3>
            <StatusBadge label={`Order ${section.sortOrder}`} />
          </div>
          <p className='text-sm text-muted-foreground'>{section.description}</p>
          <div className='flex flex-wrap gap-4 text-xs text-muted-foreground'>
            <span>{section.hours} hours</span>
            <span>{section.points} points</span>
            <span>{lectureCount} lectures</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <Button size='sm' onClick={onManage}>
            Manage Lectures
          </Button>
          <Button size='sm' variant='outline' onClick={onEdit}>
            Edit Section
          </Button>
          <Button size='sm' variant='destructive' onClick={onDelete}>
            Delete Section
          </Button>
        </div>
      </div>
    </div>
  );
}
