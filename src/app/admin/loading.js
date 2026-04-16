import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLoading() {
  return (
    <div className='max-w-7xl mx-auto py-8 px-4 space-y-8'>
      {/* Header */}
      <div className='space-y-2'>
        <Skeleton className='h-7 w-48' />
        <Skeleton className='h-4 w-72' />
      </div>

      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='rounded-2xl border bg-card p-5 flex items-start gap-4'>
            <Skeleton className='w-11 h-11 rounded-xl shrink-0' />
            <div className='space-y-2 flex-1'>
              <Skeleton className='h-3.5 w-20' />
              <Skeleton className='h-6 w-14' />
            </div>
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className='rounded-2xl border bg-card p-5 space-y-4'>
        <Skeleton className='h-5 w-36' />
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-4 w-20 rounded-full' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
