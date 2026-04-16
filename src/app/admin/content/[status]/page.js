'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { FileEdit, Clock, Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useContentItems } from '@/features/content/hooks/use-content';

const STATUS_META = {
  drafts:    { label: 'Drafts',     apiStatus: 'DRAFT',     icon: FileEdit, color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  'in-review': { label: 'In Review', apiStatus: 'IN_REVIEW', icon: Clock,   color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20'     },
  published: { label: 'Published',  apiStatus: 'PUBLISHED', icon: Eye,      color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
};

const TYPE_COLORS = {
  RICH_TEXT:  'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  CODING_SET: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  QUIZ_SET:   'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  TEST_BLOCK: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  PROJECT:    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  VIDEO:      'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

export default function ContentStatusPage({ params }) {
  const { status } = use(params);
  const meta = STATUS_META[status];
  const [page, setPage] = useState(0);

  const { data, isLoading } = useContentItems(meta?.apiStatus, page);
  const pageData = data?.data ?? null;
  const items = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  if (!meta) {
    return <div className='p-8 text-muted-foreground'>Unknown status: {status}</div>;
  }

  const StatusIcon = meta.icon;

  return (
    <div className='max-w-5xl mx-auto py-8 px-4 space-y-6'>
      <div className='flex items-center gap-3'>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg}`}>
          <StatusIcon size={18} className={meta.color} />
        </div>
        <div>
          <h1 className='text-xl font-bold'>{meta.label}</h1>
          <p className='text-sm text-muted-foreground'>{totalElements} items</p>
        </div>
      </div>

      <div className='rounded-2xl border bg-card shadow-sm overflow-hidden'>
        {isLoading ? (
          <div className='divide-y'>
            {[...Array(8)].map((_, i) => (
              <div key={i} className='px-5 py-3.5 flex items-center gap-4'>
                <div className='flex-1 space-y-1.5'>
                  <Skeleton className='h-4 w-2/3' />
                  <Skeleton className='h-3 w-1/3' />
                </div>
                <Skeleton className='h-5 w-20 rounded-full' />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className='px-5 py-16 text-center text-sm text-muted-foreground'>
            No {meta.label.toLowerCase()} items.
          </div>
        ) : (
          <div className='divide-y'>
            {items.map((item) => {
              const editHref = item.courseId && item.sectionId && item.lectureId
                ? `/admin/courses/${item.courseId}/sections/${item.sectionId}/lectures/${item.lectureId}/items/${item.id}`
                : null;
              const Row = editHref ? Link : 'div';
              return (
                <Row
                  key={item.id}
                  href={editHref ?? undefined}
                  className='px-5 py-3.5 flex items-center gap-4 hover:bg-muted/40 transition-colors group'
                >
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{item.title}</p>
                    <p className='text-xs text-muted-foreground mt-0.5'>{item.lectureTitle ?? '—'}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[item.itemType] ?? 'bg-muted text-muted-foreground'}`}>
                    {item.itemType}
                  </span>
                  <ArrowRight size={14} className='text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
                </Row>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-3'>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className='p-1.5 rounded-md border hover:bg-muted disabled:opacity-30 transition-colors'
          >
            <ChevronLeft size={16} />
          </button>
          <span className='text-sm text-muted-foreground'>
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className='p-1.5 rounded-md border hover:bg-muted disabled:opacity-30 transition-colors'
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
