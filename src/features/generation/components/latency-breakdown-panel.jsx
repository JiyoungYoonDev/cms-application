'use client';

import { useState } from 'react';
import { X, ExternalLink, Clock, Layers, BookOpen, FileCode2, Cpu, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmtMs } from '../utils/formatters';

function LatencyBar({ value, max }) {
  if (!max || !value) return null;
  const w = (value / max) * 100;
  return (
    <div className='flex items-center gap-2 w-full'>
      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
        <div className='bg-sky-500 h-full rounded-full' style={{ width: `${Math.min(w, 100)}%` }} />
      </div>
      <span className='text-[10px] text-muted-foreground tabular-nums w-12 text-right'>{fmtMs(value)}</span>
    </div>
  );
}

const TABS = [
  { key: 'overview', label: 'Overview', icon: Clock },
  { key: 'jobs', label: 'Slow Jobs', icon: Layers },
  { key: 'lectures', label: 'Slow Lectures', icon: BookOpen },
  { key: 'batches', label: 'Slow Batches', icon: FileCode2 },
  { key: 'models', label: 'By Model', icon: Cpu },
];

// ── Overview: p50/p95 + condition comparison ──

function LatencyOverview({ data }) {
  const p50 = data?.p50LatencyMs;
  const p95 = data?.p95LatencyMs;
  const conditions = data?.latencyByCondition ?? [];

  return (
    <div className='space-y-4'>
      {/* Percentiles */}
      <div className='grid grid-cols-2 gap-3'>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-1'>p50 (Median)</p>
          <p className='text-2xl font-bold text-sky-600'>{fmtMs(p50)}</p>
          <p className='text-[10px] text-muted-foreground mt-0.5'>per batch</p>
        </div>
        <div className='rounded-lg border bg-card p-4 text-center'>
          <p className='text-[10px] text-muted-foreground uppercase tracking-wider mb-1'>p95</p>
          <p className='text-2xl font-bold text-amber-600'>{fmtMs(p95)}</p>
          <p className='text-[10px] text-muted-foreground mt-0.5'>per batch</p>
        </div>
      </div>

      {/* Condition comparison */}
      <div>
        <h4 className='text-xs font-semibold text-muted-foreground mb-2'>Latency by Condition</h4>
        <div className='space-y-2'>
          {conditions.map((c) => {
            const isRed = c.condition === 'Truncated';
            const isAmber = c.condition === 'Parse Repaired';
            return (
              <div key={c.condition} className={`rounded-lg border p-3 ${isRed ? 'border-red-300 dark:border-red-800 bg-red-500/5' : isAmber ? 'border-amber-300 dark:border-amber-800 bg-amber-500/5' : ''}`}>
                <div className='flex items-center justify-between mb-1'>
                  <div className='flex items-center gap-2'>
                    {isRed && <AlertTriangle size={12} className='text-red-500' />}
                    <span className='text-sm font-medium'>{c.condition}</span>
                    <span className='text-[10px] text-muted-foreground'>{c.count} batches</span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${isRed ? 'text-red-600' : isAmber ? 'text-amber-600' : 'text-sky-600'}`}>
                    {fmtMs(c.avgLatencyMs)}
                  </span>
                </div>
                <p className='text-[10px] text-muted-foreground'>avg latency per batch</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Slow Jobs ──

function SlowJobs({ items }) {
  if (!items?.length) return <Empty text='No latency data.' />;
  const max = items[0]?.latencyMs ?? 1;
  return (
    <div className='space-y-2'>
      {items.map((j, i) => (
        <div key={j.jobId} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-1.5'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-xs text-muted-foreground font-mono w-5'>#{i + 1}</span>
              <span className='text-sm font-medium truncate'>{j.courseTitle ?? `Job #${j.jobId}`}</span>
              <Badge variant='outline' className='text-[10px] shrink-0'>{j.status}</Badge>
            </div>
            <span className='text-xs text-muted-foreground shrink-0'>{j.modelName}</span>
          </div>
          <LatencyBar value={j.latencyMs} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            {j.totalLectures != null && <span>{j.totalLectures} lectures</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Slow Lectures ──

function SlowLectures({ items }) {
  if (!items?.length) return <Empty text='No lecture latency data.' />;
  const max = items[0]?.latencyMs ?? 1;
  return (
    <div className='space-y-2'>
      {items.map((t, i) => (
        <div key={t.taskId} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-xs text-muted-foreground font-mono w-5'>#{i + 1}</span>
              <span className='text-sm font-medium truncate'>{t.lectureTitle}</span>
              <Badge variant='outline' className={`text-[10px] shrink-0 ${t.status === 'FAILED' ? 'text-red-600 border-red-300' : ''}`}>{t.status}</Badge>
            </div>
            <a
              href={`/admin/courses/${t.jobId}`}
              className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
              onClick={(e) => e.stopPropagation()}
            >
              Job #{t.jobId} <ExternalLink size={9} />
            </a>
          </div>
          <p className='text-[10px] text-muted-foreground mb-1.5 ml-7'>{t.sectionTitle} · {t.itemsTotal} items</p>
          <LatencyBar value={t.latencyMs} max={max} />
        </div>
      ))}
    </div>
  );
}

// ── Slow Batches ──

function SlowBatches({ items }) {
  if (!items?.length) return <Empty text='No batch latency data.' />;
  const max = items[0]?.latencyMs ?? 1;
  return (
    <div className='space-y-2'>
      {items.map((b, i) => (
        <div key={b.batchId} className={`rounded-lg border bg-card p-3
          ${b.truncated ? 'border-red-300 dark:border-red-800 bg-red-500/5' : ''}
          ${b.repaired && !b.truncated ? 'border-amber-300 dark:border-amber-800 bg-amber-500/5' : ''}`}
        >
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-xs text-muted-foreground font-mono w-5'>#{i + 1}</span>
              <span className='text-sm font-medium truncate'>{b.lectureTitle}</span>
              <span className='text-[10px] text-muted-foreground'>Batch {b.batchIndex}</span>
              {b.truncated && <Badge className='text-[9px] bg-red-500/10 text-red-600 border-red-300'>TRUNCATED</Badge>}
              {b.repaired && !b.truncated && <Badge className='text-[9px] bg-amber-500/10 text-amber-600 border-amber-300'>REPAIRED</Badge>}
            </div>
            <a
              href={`/admin/courses/${b.jobId}`}
              className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
              onClick={(e) => e.stopPropagation()}
            >
              Job #{b.jobId} <ExternalLink size={9} />
            </a>
          </div>
          <p className='text-[10px] text-muted-foreground mb-1.5 ml-7'>{b.itemTypes}</p>
          <LatencyBar value={b.latencyMs} max={max} />
        </div>
      ))}
    </div>
  );
}

// ── By Model ──

function LatencyByModel({ items }) {
  if (!items?.length) return <Empty text='No model latency data.' />;
  const max = Math.max(...items.map(m => m.p95LatencyMs ?? m.avgLatencyMs ?? 0), 1);
  return (
    <div className='space-y-3'>
      {items.map((m) => (
        <div key={m.modelName} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-semibold'>{m.modelName}</span>
            <span className='text-xs text-muted-foreground'>{m.jobCount} jobs</span>
          </div>
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div>
              <p className='text-[10px] text-muted-foreground'>Avg</p>
              <p className='text-sm font-bold text-sky-600 tabular-nums'>{fmtMs(m.avgLatencyMs)}</p>
            </div>
            <div>
              <p className='text-[10px] text-muted-foreground'>p50</p>
              <p className='text-sm font-bold tabular-nums'>{fmtMs(m.p50LatencyMs)}</p>
            </div>
            <div>
              <p className='text-[10px] text-muted-foreground'>p95</p>
              <p className='text-sm font-bold text-amber-600 tabular-nums'>{fmtMs(m.p95LatencyMs)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return <p className='text-sm text-muted-foreground text-center py-6'>{text}</p>;
}

// ── Main ──

export default function LatencyBreakdownPanel({ data, onClose }) {
  const [tab, setTab] = useState('overview');

  return (
    <div className='rounded-xl border bg-card shadow-lg'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='flex items-center gap-2'>
          <Clock size={16} className='text-sky-500' />
          <h3 className='text-sm font-semibold'>Latency Breakdown</h3>
          <span className='text-[10px] text-muted-foreground ml-1'>
            p50 {fmtMs(data?.p50LatencyMs)} · p95 {fmtMs(data?.p95LatencyMs)}
          </span>
        </div>
        <button onClick={onClose} className='p-1 rounded hover:bg-muted transition-colors'>
          <X size={16} className='text-muted-foreground' />
        </button>
      </div>

      {/* Tabs */}
      <div className='flex border-b px-4'>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors
                ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className='p-4 max-h-[480px] overflow-y-auto'>
        {tab === 'overview' && <LatencyOverview data={data} />}
        {tab === 'jobs' && <SlowJobs items={data?.latencyByJob} />}
        {tab === 'lectures' && <SlowLectures items={data?.latencyByLecture} />}
        {tab === 'batches' && <SlowBatches items={data?.latencyByBatch} />}
        {tab === 'models' && <LatencyByModel items={data?.latencyByModel} />}
      </div>
    </div>
  );
}
