'use client';

import { useState } from 'react';
import { X, ExternalLink, DollarSign, Layers, BookOpen, Zap, Cpu } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function fmtCost(n) {
  if (n == null) return '-';
  return '$' + Number(n).toFixed(4);
}

function fmt(n) {
  if (n == null) return '-';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function CostBar({ value, max }) {
  if (!max || !value) return null;
  const w = (Number(value) / Number(max)) * 100;
  return (
    <div className='flex items-center gap-2 w-full'>
      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
        <div className='bg-amber-500 h-full rounded-full' style={{ width: `${Math.min(w, 100)}%` }} />
      </div>
      <span className='text-[10px] text-muted-foreground tabular-nums w-16 text-right'>{fmtCost(value)}</span>
    </div>
  );
}

const TABS = [
  { key: 'jobs', label: 'By Job', icon: Layers },
  { key: 'lectures', label: 'By Lecture', icon: BookOpen },
  { key: 'prompts', label: 'By Prompt', icon: Zap },
  { key: 'models', label: 'By Model', icon: Cpu },
  { key: 'daily', label: 'Daily Trend', icon: DollarSign },
];

// ── Cost by Job ──

function CostByJob({ items }) {
  if (!items?.length) return <Empty text='No cost data.' />;
  const max = Number(items[0]?.costUsd ?? 0);
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
          <CostBar value={j.costUsd} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span>{fmt(j.totalTokens)} tokens</span>
            {j.totalLectures != null && <span>{j.totalLectures} lectures</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cost by Lecture ──

function CostByLecture({ items }) {
  if (!items?.length) return <Empty text='No lecture cost data.' />;
  const max = Number(items[0]?.costUsd ?? 0);
  return (
    <div className='space-y-2'>
      {items.map((t, i) => (
        <div key={t.taskId} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-1'>
            <div className='flex items-center gap-2 min-w-0'>
              <span className='text-xs text-muted-foreground font-mono w-5'>#{i + 1}</span>
              <span className='text-sm font-medium truncate'>{t.lectureTitle}</span>
            </div>
            <a
              href={`/admin/courses/${t.jobId}`}
              className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
              onClick={(e) => e.stopPropagation()}
            >
              Job #{t.jobId} <ExternalLink size={9} />
            </a>
          </div>
          <p className='text-[10px] text-muted-foreground mb-1.5 ml-7'>{t.sectionTitle} · {t.itemsTotal} items · {t.batchCount} batches</p>
          <CostBar value={t.costUsd} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span>{fmt(t.totalTokens)} tokens</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cost by Prompt Version ──

function CostByPrompt({ items }) {
  if (!items?.length) return <Empty text='No prompt version cost data linked yet.' />;
  const max = Number(items[0]?.totalCostUsd ?? 0);
  return (
    <div className='space-y-2'>
      {items.map((v) => (
        <div key={v.versionId} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-1.5'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>{v.templateName}</span>
              <span className='text-[10px] text-muted-foreground'>v{v.versionNumber}</span>
              {v.isActive && <Badge className='text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-300'>Active</Badge>}
            </div>
            <span className='text-xs text-muted-foreground'>{v.generationCount} gen</span>
          </div>
          <CostBar value={v.totalCostUsd} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span>Total: {fmtCost(v.totalCostUsd)}</span>
            <span>Avg/gen: {fmtCost(v.avgCostUsd)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Cost by Model ──

function CostByModel({ items }) {
  if (!items?.length) return <Empty text='No model cost data.' />;
  const max = Number(items[0]?.totalCostUsd ?? 0);
  return (
    <div className='space-y-2'>
      {items.map((m) => (
        <div key={m.modelName} className='rounded-lg border bg-card p-3'>
          <div className='flex items-center justify-between mb-1.5'>
            <span className='text-sm font-semibold'>{m.modelName}</span>
            <span className='text-xs text-muted-foreground'>{m.jobCount} jobs</span>
          </div>
          <CostBar value={m.totalCostUsd} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span>Total: {fmtCost(m.totalCostUsd)}</span>
            <span>Avg/job: {fmtCost(m.avgCostPerJob)}</span>
            <span>{fmt(m.totalTokens)} tokens</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Daily Cost Trend ──

function DailyCostTrend({ items }) {
  if (!items?.length) return <Empty text='No daily data.' />;
  const maxCost = Math.max(...items.map(d => Number(d.costUsd ?? 0)), 0.0001);
  return (
    <div className='space-y-1'>
      {items.map((d) => {
        const cost = Number(d.costUsd ?? 0);
        const w = (cost / maxCost) * 100;
        const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
        return (
          <div key={d.date} className='flex items-center gap-3 py-1.5'>
            <span className='text-xs text-muted-foreground w-24 shrink-0'>{dateLabel}</span>
            <div className='flex-1 h-4 rounded bg-muted overflow-hidden'>
              <div className='bg-amber-500/80 h-full rounded' style={{ width: `${Math.min(w, 100)}%` }} />
            </div>
            <span className='text-xs tabular-nums w-16 text-right font-medium'>{fmtCost(cost)}</span>
            <span className='text-[10px] text-muted-foreground w-20 text-right'>
              {d.completed}ok {d.failed > 0 ? `${d.failed}F ` : ''}{d.partial > 0 ? `${d.partial}P` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ text }) {
  return <p className='text-sm text-muted-foreground text-center py-6'>{text}</p>;
}

// ── Main ──

export default function CostBreakdownPanel({ data, onClose }) {
  const [tab, setTab] = useState('jobs');

  return (
    <div className='rounded-xl border bg-card shadow-lg'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='flex items-center gap-2'>
          <DollarSign size={16} className='text-amber-500' />
          <h3 className='text-sm font-semibold'>Cost Breakdown</h3>
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
        {tab === 'jobs' && <CostByJob items={data?.costByJob} />}
        {tab === 'lectures' && <CostByLecture items={data?.costByLecture} />}
        {tab === 'prompts' && <CostByPrompt items={data?.costByPromptVersion} />}
        {tab === 'models' && <CostByModel items={data?.costByModel} />}
        {tab === 'daily' && <DailyCostTrend items={data?.dailyTrend} />}
      </div>
    </div>
  );
}
