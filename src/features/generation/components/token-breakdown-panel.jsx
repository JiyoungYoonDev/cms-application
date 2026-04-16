'use client';

import { useState } from 'react';
import { X, ExternalLink, Zap, BookOpen, Layers, FileCode2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fmt, fmtCost, parseTitles } from '../utils/formatters';

function TokenBar({ prompt, completion, max }) {
  const total = prompt + completion;
  if (!max || !total) return null;
  const pW = (prompt / max) * 100;
  const cW = (completion / max) * 100;
  return (
    <div className='flex items-center gap-2 w-full'>
      <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
        <div className='h-full flex'>
          <div className='bg-blue-500 h-full' style={{ width: `${pW}%` }} />
          <div className='bg-violet-500 h-full' style={{ width: `${cW}%` }} />
        </div>
      </div>
      <span className='text-[10px] text-muted-foreground tabular-nums w-12 text-right'>{fmt(total)}</span>
    </div>
  );
}

const TABS = [
  { key: 'jobs', label: 'By Job', icon: Layers },
  { key: 'lectures', label: 'By Lecture', icon: BookOpen },
  { key: 'batches', label: 'By Batch', icon: FileCode2 },
  { key: 'prompts', label: 'By Prompt', icon: Zap },
];

// ── Job ranking ──

function JobTokenList({ items }) {
  if (!items?.length) return <Empty text='No job token data.' />;
  const max = items[0]?.totalTokens ?? 1;
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
            <div className='flex items-center gap-3 text-xs text-muted-foreground shrink-0'>
              {j.totalLectures != null && <span>{j.totalLectures} lectures</span>}
              <span>{fmtCost(j.costUsd)}</span>
            </div>
          </div>
          <TokenBar prompt={j.promptTokens} completion={j.completionTokens} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-blue-500 mr-0.5' />Input: {fmt(j.promptTokens)}</span>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-violet-500 mr-0.5' />Output: {fmt(j.completionTokens)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lecture hot spots ──

function LectureTokenList({ items }) {
  if (!items?.length) return <Empty text='No lecture token data.' />;
  const max = items[0]?.totalTokens ?? 1;
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
          <TokenBar prompt={t.promptTokens} completion={t.completionTokens} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-blue-500 mr-0.5' />Input: {fmt(t.promptTokens)}</span>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-violet-500 mr-0.5' />Output: {fmt(t.completionTokens)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Batch hot spots ──

function BatchTokenList({ items }) {
  if (!items?.length) return <Empty text='No batch token data.' />;
  const max = items[0]?.totalTokens ?? 1;
  return (
    <div className='space-y-2'>
      {items.map((b, i) => {
        const titles = parseTitles(b.itemTitles);
        return (
          <div key={b.batchId} className='rounded-lg border bg-card p-3'>
            <div className='flex items-center justify-between mb-1'>
              <div className='flex items-center gap-2 min-w-0'>
                <span className='text-xs text-muted-foreground font-mono w-5'>#{i + 1}</span>
                <span className='text-sm font-medium truncate'>{b.lectureTitle}</span>
                <span className='text-[10px] text-muted-foreground'>Batch {b.batchIndex}</span>
              </div>
              <a
                href={`/admin/courses/${b.jobId}`}
                className='text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0'
                onClick={(e) => e.stopPropagation()}
              >
                Job #{b.jobId} <ExternalLink size={9} />
              </a>
            </div>
            <p className='text-[10px] text-muted-foreground mb-1 ml-7'>{b.sectionTitle} · {b.itemTypes}</p>
            {titles.length > 0 && (
              <div className='flex flex-wrap gap-1 mb-1.5 ml-7'>
                {titles.map((t, ti) => (
                  <span key={ti} className='text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground'>{t}</span>
                ))}
              </div>
            )}
            <TokenBar prompt={b.promptTokens} completion={b.completionTokens} max={max} />
            <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
              <span><span className='inline-block w-2 h-2 rounded-sm bg-blue-500 mr-0.5' />Input: {fmt(b.promptTokens)}</span>
              <span><span className='inline-block w-2 h-2 rounded-sm bg-violet-500 mr-0.5' />Output: {fmt(b.completionTokens)}</span>
              {b.maxOutputTokens && <span>Limit: {fmt(b.maxOutputTokens)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Prompt version avg tokens ──

function PromptVersionTokenList({ items }) {
  if (!items?.length) return <Empty text='No prompt version data linked yet.' />;
  const max = Math.max(...items.map(v => v.avgTotalTokens), 1);
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
            <span className='text-xs text-muted-foreground'>{v.generationCount} generations</span>
          </div>
          <TokenBar prompt={v.avgPromptTokens} completion={v.avgCompletionTokens} max={max} />
          <div className='flex items-center gap-3 mt-1 text-[10px] text-muted-foreground'>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-blue-500 mr-0.5' />Avg Input: {fmt(v.avgPromptTokens)}</span>
            <span><span className='inline-block w-2 h-2 rounded-sm bg-violet-500 mr-0.5' />Avg Output: {fmt(v.avgCompletionTokens)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Empty({ text }) {
  return <p className='text-sm text-muted-foreground text-center py-6'>{text}</p>;
}

// ── Main Panel ──

export default function TokenBreakdownPanel({ data, onClose }) {
  const [tab, setTab] = useState('jobs');

  return (
    <div className='rounded-xl border bg-card shadow-lg'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 border-b'>
        <div className='flex items-center gap-2'>
          <Zap size={16} className='text-violet-500' />
          <h3 className='text-sm font-semibold'>Token Usage Breakdown</h3>
          <div className='flex items-center gap-1 text-[10px] text-muted-foreground ml-2'>
            <span className='inline-block w-2 h-2 rounded-sm bg-blue-500' /> Input
            <span className='inline-block w-2 h-2 rounded-sm bg-violet-500 ml-1' /> Output
          </div>
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
        {tab === 'jobs' && <JobTokenList items={data?.tokenByJob} />}
        {tab === 'lectures' && <LectureTokenList items={data?.tokenByLecture} />}
        {tab === 'batches' && <BatchTokenList items={data?.tokenByBatch} />}
        {tab === 'prompts' && <PromptVersionTokenList items={data?.tokenByPromptVersion} />}
      </div>
    </div>
  );
}
