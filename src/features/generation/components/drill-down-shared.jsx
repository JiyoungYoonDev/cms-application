'use client';

import { ExternalLink } from 'lucide-react';
import { parseTitles } from '../utils/formatters';

export function JobLink({ item }) {
  return (
    <a
      href={`/admin/courses/${item.jobId}`}
      className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
      onClick={(e) => e.stopPropagation()}
    >
      Job #{item.jobId} <ExternalLink size={9} />
    </a>
  );
}

export function BatchHeader({ item, badges }) {
  const titles = parseTitles(item.itemTitles);
  return (
    <div className='mb-2'>
      <div className='flex items-center gap-2 mb-0.5 flex-wrap'>
        <span className='text-sm font-medium truncate'>{item.lectureTitle}</span>
        <span className='text-[10px] text-muted-foreground'>Batch {item.batchIndex}</span>
        {badges}
        <JobLink item={item} />
      </div>
      <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
        <span>{item.sectionTitle}</span>
        {item.courseTitle && <span>· {item.courseTitle}</span>}
        {item.promptVersion && <span>· {item.promptVersion}</span>}
      </div>
      {titles.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-1'>
          {titles.map((t, i) => (
            <span key={i} className='text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Empty({ text }) {
  return <p className='text-sm text-muted-foreground text-center py-6'>{text}</p>;
}

export function SummaryBar({ items }) {
  if (!items?.length) return null;
  return (
    <div className='flex flex-wrap gap-2 mb-3'>
      {items.map((s, i) => (
        <div key={i} className={`rounded-lg border px-3 py-2 text-center ${s.color ?? ''}`}>
          <p className='text-lg font-bold tabular-nums'>{s.value}</p>
          <p className='text-[10px] text-muted-foreground'>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
